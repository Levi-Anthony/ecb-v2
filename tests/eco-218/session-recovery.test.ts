import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { readBrowserSession, isRecoverableSessionCode, BROWSER_SESSION_SCRIPT } from '../../server/browser-session.js';
import { handleConsent } from '../../server/oauth-consent.js';
import { handlePersonalApp } from '../../server/personal-app.js';

const origin = 'https://ecb-v2-eight.vercel.app';
const jwt = (subject = 'constructed-user', extra: Record<string, unknown> = {}) =>
  'e30.' + Buffer.from(JSON.stringify({ sub: subject, exp: Math.floor(Date.now()/1000) + 600, ...extra })).toString('base64url') + '.constructed';
const cookies = (access: string, refresh: string) =>
  [access ? '__Host-ecb_access=' + access : '', refresh ? '__Host-ecb_refresh=' + refresh : ''].filter(Boolean).join('; ');
const ctx = (access: string, refresh: string) => new Request(origin + '/oauth/context',
  { headers: { cookie: cookies(access, refresh) } });
const refreshRequest = (access: string, refresh: string) => new Request(origin + '/oauth/refresh', {
  method: 'POST', headers: { origin, 'content-type': 'application/json', cookie: cookies(access,refresh) },
  body: '{}',
});

test('noncredential session dispositions distinguish absence, malformed, incomplete, expiration, provider rejection, mismatch and outage', async () => {
  let calls = 0;
  const auth = { auth: { getUser: async (_token: string) => {
    calls++; return { data: { user: { id: 'constructed-user' } }, error: null };
  } } } as never;
  for (const [access,refresh,expected] of [
    ['', '', 'session_missing'], [jwt(), '', 'session_refresh_missing'],
    ['', 'r', 'session_access_missing_recoverable'], ['not.a.jwt', 'r', 'session_access_malformed_recoverable'],
    [jwt('constructed-user',{ sub: null }), 'r', 'session_access_invalid_recoverable'],
    [jwt('constructed-user',{ exp: 1 }), 'r', 'session_refresh_required'],
    [jwt('constructed-user',{ client_id: 'oauth-client' }), 'r', 'first_party_session_required'],
  ] as const) {
    const result = await readBrowserSession(ctx(access,refresh), auth);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, expected);
  }
  assert.equal(calls, 0, 'early session classification must not invoke provider');
  const good = await readBrowserSession(ctx(jwt(), 'r'), auth);
  assert.equal(good.ok, true);
  assert.equal(calls, 1);

  for (const [error,userId,expected,status] of [
    [{ status: 401 }, 'constructed-user', 'session_provider_rejected_recoverable', 401],
    [{ status: 403 }, 'constructed-user', 'session_provider_rejected_recoverable', 401],
    [null, 'different-user', 'session_identity_mismatch', 401],
    [{ status: 503 }, 'constructed-user', 'session_check_unavailable', 503],
  ] as const) {
    const fake = { auth: { getUser: async () => ({ data: { user: { id: userId } }, error }) } } as never;
    const result = await readBrowserSession(ctx(jwt(), 'r'), fake);
    assert.equal(result.ok, false);
    if (!result.ok) { assert.equal(result.code, expected); assert.equal(result.status, status); }
  }
  assert.equal(isRecoverableSessionCode('session_identity_mismatch'), false);
  assert.equal(isRecoverableSessionCode('session_provider_rejected_recoverable'), true);
  assert.doesNotThrow(() => new Script(BROWSER_SESSION_SCRIPT));
});

test('refresh-only and malformed-access recovery require actual provider token exchange and matching renewed identity', async () => {
  for (const access of ['', 'broken.jwt', jwt()]) {
    let calls = 0;
    const fake = { auth: { refreshSession: async ({ refresh_token }: {refresh_token:string}) => {
      calls++; assert.equal(refresh_token, 'existing-refresh');
      return { error: null, data: { user: { id: 'constructed-user' },
        session: { access_token: jwt(), refresh_token: 'new-refresh' } } };
    } } } as never;
    const response = await handleConsent(refreshRequest(access, 'existing-refresh'), { authClient: fake });
    assert.equal(response.status, 200);
    assert.equal(calls, 1);
    assert.deepEqual(await response.json(), { signed_in: true });
    const setCookie = response.headers.get('set-cookie') ?? '';
    assert.match(setCookie, /__Host-ecb_access=/);
    assert.match(setCookie, /__Host-ecb_refresh=/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
  }
});

test('refresh cannot switch known subject, accept client token, mint cookies from provider mismatch or bypass denied credential', async () => {
  const cases = [
    { before: jwt('different-user'), renewed: jwt(), id: 'constructed-user', code: 'session_identity_mismatch' },
    { before: 'broken', renewed: jwt('different-user'), id: 'constructed-user', code: 'session_identity_mismatch' },
    { before: '', renewed: jwt('constructed-user', { client_id: 'oauth-client' }), id: 'constructed-user', code: 'session_identity_mismatch' },
  ];
  for (const item of cases) {
    const fake = { auth: { refreshSession: async () => ({ error: null, data: {
      user: { id: item.id }, session: { access_token: item.renewed, refresh_token: 'rotated' },
    } }) } } as never;
    const result = await handleConsent(refreshRequest(item.before, 'r'), { authClient: fake });
    assert.equal(result.status, 401);
    assert.equal((await result.json()).code, item.code);
    assert.equal(result.headers.get('set-cookie'), null);
  }
  let calls = 0;
  const deny = { auth: { refreshSession: async () => { calls++; return { error: null }; } } } as never;
  const missing = await handleConsent(refreshRequest(jwt(), ''), { authClient: deny });
  assert.equal(missing.status, 401);
  assert.equal((await missing.json()).code, 'session_refresh_missing');
  const client = await handleConsent(refreshRequest(jwt('constructed-user',{client_id:'client'}), 'r'), {authClient:deny});
  assert.equal(client.status, 401);
  assert.equal((await client.json()).code, 'first_party_session_required');
  assert.equal(calls, 0);
});

test('terminal provider refresh rejection is distinct from transient failure; neither clears session', async () => {
  for (const [error,expected,status] of [
    [{ status: 401, code: 'refresh_token_not_found' }, 'session_reauthentication_required', 401],
    [{ status: 503, code: 'provider_unavailable' }, 'session_recovery_unavailable', 503],
  ] as const) {
    const fake = {auth:{ refreshSession: async()=>({error,data:{session:null,user:null}})}} as never;
    const response = await handleConsent(refreshRequest('', 'r'), {authClient:fake});
    assert.equal(response.status,status);
    assert.equal((await response.json()).code,expected);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('context returns credential-free cause; personal door denies all work and renders recovery only when eligible', async () => {
  const fake = {auth:{getUser:async()=>({error:{status:401},data:{user:null}})}} as never;
  for (const [access,refresh,expectedCode,signedIn] of [
    ['', '', 'session_missing', false],
    [jwt(), '', 'session_refresh_missing', false],
    [jwt(), 'r', 'session_provider_rejected_recoverable', undefined],
  ] as const) {
    const response = await handleConsent(ctx(access,refresh), {authClient:fake});
    const result = await response.json();
    assert.equal(result.code,expectedCode);
    if (signedIn === false) { assert.equal(response.status,200);assert.equal(result.signed_in,false); }
    else assert.equal(response.status,401);
    assert.doesNotMatch(JSON.stringify(result), /constructed-user|existing-refresh|\.constructed/);
    assert.equal(response.headers.get('set-cookie'), null);
  }

  let workCalls = 0;
  const ports = {inspect:async()=>{workCalls++;return {};},commission:async()=>{workCalls++;return {};},
    search:async()=>{workCalls++;return {};},fetch:async()=>{workCalls++;return {};},
    capture:async()=>{workCalls++;return {};}} as never;
  for (const [access,refresh,recovery] of [
    ['', '', false], [jwt(), '', false], ['broken','r',true], [jwt(),'r',true],
  ] as const) {
    const r = await handlePersonalApp(new Request(origin+'/api/personal',
      {headers:{cookie:cookies(access,refresh)}}), ports, {authClient:fake});
    assert.equal(r.status,401);
    const html = await r.text();
    assert.doesNotMatch(html,/source_content|workflow\.cycle|constructed-user|existing-refresh/);
    if(recovery) assert.match(html,/sessionFetch\('\/oauth\/context'\)/);
    else assert.match(html,/Sign in with your ECB account/);
    assert.equal(r.headers.get('set-cookie'),null);
    assert.equal(r.headers.get('cache-control'),'no-store, private');
  }
  assert.equal(workCalls,0);
});
