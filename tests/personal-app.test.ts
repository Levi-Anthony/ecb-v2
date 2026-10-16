import test from 'node:test';
import assert from 'node:assert/strict';
import { Script } from 'node:vm';
import { handlePersonalApp, type PersonalPorts } from '../server/personal-app.js';

const origin = 'https://ecb-v2-eight.vercel.app';
const validId = 'b149f90b-dfcb-4756-9920-2e92b970734e';
const thoughtId = '89fcb55f-4822-49d3-854d-a4d46eb87d9e';
const source = 'ecos-personal-app:principal-capture';
const authorized = async () => ({ allowed: true as const, access: 'test.access', refresh: 'test.refresh' });
const unauthorized = async () => ({ allowed: false as const, status: 401, code: 'sign_in_required' });
const unenrolled = async () => ({ allowed: false as const, status: 403, code: 'principal_not_enrolled' });

function ports(): PersonalPorts {
  return {
    inspect: async () => ({ cycle: { version: 8, outcome: 'Viable system', edition: 'older/1' },
      phase: 'implement', debt: [{ id: 'debt-1', requirement: 'Unpaid' }] }),
    commission: async () => ({ source: { edition: '2026-10-13' }, standing: 'PRINCIPAL_DIRECTED_DISTRIBUTION',
      next_action: 'Deliver personal workflow', source_content: 'Do not distribute full source by default' }),
    capture: async (input) => ({ operation_id: input.operationId, replayed: false, thought: {
      id: thoughtId, content: input.content, source: input.source,
    } }),
    fetch: async () => ({ id: thoughtId, content: 'A real capture', source, captured_at: '2026-10-14T23:00:00Z' }),
    search: async () => ({ results: [{ id: thoughtId, content: 'A real capture' }] }),
  };
}
function request(action?: string, method = 'GET', body?: unknown, headers: Record<string,string> = {}) {
  return new Request(origin + '/api/personal' + (action ? '?action=' + action : ''), {
    method, headers: method === 'POST' ? {
      origin, 'content-type': 'application/json', 'x-ecos-action': 'capture', ...headers,
    } : headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
test('private page denies unauthenticated access before reading ports', async () => {
  const p = ports();
  p.inspect = async () => { throw new Error('should never be called'); };
  const response = await handlePersonalApp(request(), p, { authorize: unauthorized });
  assert.equal(response.status, 401);
  const html = await response.text();
  assert.match(html, /Sign in with your ECB account/);
  assert.doesNotMatch(html, /Viable system|PRINCIPAL_DIRECTED/);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
});
test('unenrolled owner does not receive native work state', async () => {
  const response = await handlePersonalApp(request('load'), ports(), { authorize: unenrolled });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'principal_not_enrolled' });
});
test('current live commission and native workflow are separate and source qualified', async () => {
  const response = await handlePersonalApp(request('load'), ports(), { authorize: authorized });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.source, 'live_authenticated_read');
  assert.equal(data.workflow.cycle.version, 8);
  assert.equal(data.commission.source.edition, '2026-10-13');
  assert.equal(data.commission.standing, 'PRINCIPAL_DIRECTED_DISTRIBUTION');
  assert.equal(data.commission.source_content, undefined);
  assert.equal(data.qualification.real_use, 'not established by this read');
});
test('authorized UI is private and carries a nonce-bound CSP', async () => {
  const response = await handlePersonalApp(request(), ports(), { authorize: authorized });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy') ?? '', /script-src 'nonce-/);
  assert.equal(response.headers.get('set-cookie'), null, 'ordinary responses never overwrite newer session cookies');
  const html = await response.text();
  assert.match(html, /Unfold the work/);
  assert.match(html, /Authorize and capture/);
  assert.doesNotMatch(html, /%%NONCE%%/);
  assert.doesNotMatch(html, / style="/);
  const script = /<script nonce="[^"]+">([\s\S]*?)<\/script>/.exec(html);
  assert.ok(script, 'inline interface script present');
  assert.doesNotThrow(() => new Script(script[1]), 'interface code parses in JavaScript runtime');
});
test('cross-origin capture and missing authorization fail before execution', async () => {
  let calls = 0;
  const p = ports();p.capture = async () => { calls++; return {}; };
  const wrongOrigin = await handlePersonalApp(request('capture','POST',
    { authorized: true, operation_id: validId, content: 'A real capture' },{ origin: 'https://evil.example' }),
    p, { authorize: authorized });
  assert.equal(wrongOrigin.status, 403);
  const noConsent = await handlePersonalApp(request('capture','POST',
    { authorized: false, operation_id: validId, content: 'A real capture' }),p,{ authorize: authorized });
  assert.equal(noConsent.status, 400);
  assert.equal(calls, 0);
});
test('one explicitly authorized capture receives exact independent readback', async () => {
  const p = ports();let attempted: unknown;
  p.capture = async input => {attempted=input;return {
    replayed: false, thought:{id:thoughtId,content:input.content,source:input.source},
  };};
  const response = await handlePersonalApp(request('capture','POST',
    { authorized: true, operation_id: validId, content: 'A real capture' }),p,{ authorize: authorized });
  assert.equal(response.status,200);
  const data = await response.json();
  assert.equal(data.state,'RAW_CUSTODY_VERIFIED');
  assert.equal(data.semantic,'not_validated');
  assert.deepEqual(attempted, {
    operationId: validId, content:'A real capture', source, processingMode:'raw_only',
  });
  assert.match(data.resume,/thought=/);
});
test('mismatched source bytes cannot become custody verification', async () => {
  const p=ports();
  p.fetch=async()=>({id:thoughtId,content:'A real capture changed',source});
  const response=await handlePersonalApp(request('capture','POST',
    { authorized:true, operation_id: validId, content:'A real capture' }),p,{authorize:authorized});
  assert.equal(response.status,409);
  assert.equal((await response.json()).state,'CUSTODY_NOT_VERIFIED');
});
test('capture with unavailable readback returns same-identity recovery, not a false PASS', async () => {
  const p=ports();
  p.fetch=async()=>{throw Error('temporarily unavailable');};
  const response=await handlePersonalApp(request('capture','POST',
    {authorized:true,operation_id:validId,content:'A real capture'}),p,{authorize:authorized});
  assert.equal(response.status,202);
  const data=await response.json();
  assert.equal(data.state,'CAPTURE_REPORTED_VERIFY_UNAVAILABLE');
  assert.equal(data.operation_id,validId);
});
test('search is read-only and rejects empty query', async () => {
  assert.equal((await handlePersonalApp(request('search'),ports(),{authorize:authorized})).status,400);
  const result=await handlePersonalApp(new Request(origin + '/api/personal?action=search&q=a%20real'),ports(),{authorize:authorized});
  assert.equal(result.status,200);
});

test('oversized streaming POST is rejected before invoking a capture', async () => {
  let captures = 0;
  const p=ports();
  p.capture=async()=>{captures++;return {};};
  const response=await handlePersonalApp(request('capture','POST',
    {authorized:true,operation_id:validId,content:'x'.repeat(22000)}),p,{authorize:authorized});
  assert.equal(response.status,413);
  assert.equal(captures,0);
});
