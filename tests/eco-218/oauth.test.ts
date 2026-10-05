import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { bearerChallenge, OAUTH_ISSUER, OAUTH_METADATA_URL, OAUTH_RESOURCE, oauthToolDenial,
  protectedResourceMetadata, verifyOAuthToken } from '../../server/oauth.ts';
import { handleConsent, safeRedirect } from '../../server/oauth-consent.ts';
import metadata from '../../api/metadata.ts';

const { privateKey, publicKey } = await generateKeyPair('ES256');
const key = createLocalJWKSet({ keys: [{ ...await exportJWK(publicKey), kid: 'qualification' }] });
const ids = {
  sub: '00000000-0000-4000-8000-000000000101',
  client_id: '00000000-0000-4000-8000-000000000102',
  session_id: '00000000-0000-4000-8000-000000000103',
  ecb_grant_id: '00000000-0000-4000-8000-000000000104',
};
async function token(overrides: Record<string, unknown> = {}) {
  return new SignJWT({ ...ids, role: 'authenticated', is_anonymous: false,
    ecb_capabilities: ['recover'], iss: OAUTH_ISSUER, aud: OAUTH_RESOURCE,
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 300, ...overrides,
  }).setProtectedHeader({ alg: 'ES256', kid: 'qualification' }).sign(privateKey);
}

test('verified identity, resource, capability and live grant remain distinct', async () => {
  let queries = 0;
  const auth = await verifyOAuthToken(await token(), { key, checkGrant: async input => {
    assert.deepEqual(input, { subject: ids.sub, clientId: ids.client_id, sessionId: ids.session_id, grantId: ids.ecb_grant_id });
    queries += 1; return ['recover'];
  } });
  assert.ok(auth); assert.equal(queries, 1);
  assert.equal(auth.clientId, ids.client_id);
  assert.deepEqual(auth.scopes, ['ecb:recover']);
  assert.equal(auth.resource?.href, OAUTH_RESOURCE);
  assert.equal(auth.extra?.subject, ids.sub);
  assert.equal(auth.resourceMetadataUrl, OAUTH_METADATA_URL);
});

test('wrong audience/issuer, expiry, missing identity, privileged roles and forged metadata deny before live grant dispatch', async () => {
  const invalid = [
    { aud: 'https://other.example/mcp' }, { aud: 'authenticated' },
    { aud: [OAUTH_RESOURCE, 'https://other.example/mcp'] }, { iss: 'https://other.example' },
    { exp: Math.floor(Date.now() / 1000) - 1 }, { role: 'service_role' }, { role: 'anon' },
    { is_anonymous: true }, { client_id: null }, { session_id: null }, { ecb_grant_id: null },
    { ecb_capabilities: [] }, { ecb_capabilities: ['recover', 'recover'] }, { ecb_capabilities: ['admin'] },
    { ecb_capabilities: null, user_metadata: { ecb_capabilities: ['recover', 'preserve', 'transition'] } },
  ];
  for (const overrides of invalid) {
    const result = await verifyOAuthToken(await token(overrides), { key, checkGrant: async () => { assert.fail('unverified token dispatched'); } });
    assert.equal(result, null, JSON.stringify(overrides));
  }
  const signed = await token();
  const forged = signed.split('.'); forged[1] = Buffer.from('{}').toString('base64url');
  assert.equal(await verifyOAuthToken(forged.join('.'), { key, checkGrant: async () => { assert.fail('bad signature dispatched'); } }), null);
});

test('revocation, disabled user/session and changed capability grant are checked on every request', async () => {
  const signed = await token();
  let active = true; let queries = 0;
  const options = { key, checkGrant: async () => { queries += 1; return active ? ['recover' as const] : null; } };
  assert.ok(await verifyOAuthToken(signed, options)); active = false;
  assert.equal(await verifyOAuthToken(signed, options), null); assert.equal(queries, 2);
  assert.equal(await verifyOAuthToken(signed, { key, checkGrant: async () => ['recover', 'preserve'] }), null);
  await assert.rejects(verifyOAuthToken(signed, { key, checkGrant: async () => { throw new Error('grant check unavailable'); } }), /unavailable/);
});

test('OAuth capability denial precedes validation/dispatch and advertises no unsupported provider scope', async () => {
  process.env.ECB_MCP_OAUTH_ENABLED = 'true';
  const auth = await verifyOAuthToken(await token(), { key, checkGrant: async () => ['recover'] });
  assert.ok(auth);
  const call = (name: string) => new Request(OAUTH_RESOURCE, { method: 'POST', body: JSON.stringify({
    jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: { operation_id: 'invalid' } },
  }) });
  for (const name of ['capture_thought', 'create_artifact', 'set_thought_disposition']) {
    const denied = await oauthToolDenial(call(name), auth); assert.equal(denied?.status, 403);
    const challenge = denied?.headers.get('www-authenticate') ?? '';
    assert.match(challenge, /resource_metadata=/); assert.doesNotMatch(challenge, /scope="ecb:/);
    assert.equal((await denied!.json()).error, 'insufficient_scope');
  }
  assert.equal(await oauthToolDenial(call('fetch'), auth), undefined);
  const oversized = new Request(OAUTH_RESOURCE, { method: 'POST', body: 'x'.repeat(4 * 1024 * 1024 + 1) });
  assert.equal((await oauthToolDenial(oversized, auth))?.status, 413);
});

test('protected resource discovery is exact, public, uncached and enabled explicitly', async () => {
  process.env.ECB_MCP_OAUTH_ENABLED = 'true';
  const response = metadata.fetch(new Request(OAUTH_METADATA_URL));
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
  const value = await response.json();
  assert.deepEqual(value, protectedResourceMetadata());
  assert.deepEqual(value.authorization_servers, [OAUTH_ISSUER]);
  assert.deepEqual(value.scopes_supported, ['email']);
  assert.match(bearerChallenge(), /scope="email"/);
  delete process.env.ECB_MCP_OAUTH_ENABLED;
  assert.equal(metadata.fetch(new Request(OAUTH_METADATA_URL)).status, 503);
});

test('registered callbacks work across consumers without coupling their identity or redirect', () => {
  for (const callback of ['https://claude.ai/api/mcp/auth_callback',
    'https://chatgpt.com/connector/oauth/qualification-client',
    'https://chatgpt.com/connector_platform_oauth_redirect',
    'https://additional-consumer.example/callback']) {
    const redirect = callback + '?code=qualification-only&state=qualification';
    assert.equal(safeRedirect(redirect, callback), redirect);
    assert.throws(() => safeRedirect('https://evil.example/callback?code=qualification', callback), /invalid_callback/);
  }
  assert.throws(() => safeRedirect('https://claude.ai@evil.example/api/mcp/auth_callback', 'https://claude.ai/api/mcp/auth_callback'), /invalid_callback/);
});

test('consent serves without database/model loading; credentials stay out of page and CSRF/body checks precede auth', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { assert.fail('rejected UI request dispatched'); };
  try {
    const page = await handleConsent(new Request('https://ecb-v2-eight.vercel.app/oauth/consent'));
    assert.equal(page.status, 200); assert.match(page.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
    const html = await page.text(); assert.match(html, /Recover/); assert.match(html, /Preserve/); assert.match(html, /Transition/);
    assert.doesNotMatch(html, /sb_secret_|service_role|ECB_ORDINARY_DB_KEY/);
    assert.match(html, /textContent/); assert.doesNotMatch(html, /innerHTML/);
    assert.equal((await handleConsent(new Request('https://evil.example/oauth/consent'))).status, 403);
    assert.equal((await handleConsent(new Request('https://ecb-v2-eight.vercel.app/oauth/decision', { method: 'POST', headers: {
      origin: 'https://evil.example', 'content-type': 'application/json',
    }, body: '{}' }))).status, 403);
    assert.equal((await handleConsent(new Request('https://ecb-v2-eight.vercel.app/oauth/start', { method: 'POST', headers: {
      origin: 'https://ecb-v2-eight.vercel.app', 'content-type': 'application/json',
    }, body: 'x'.repeat(32769) }))).status, 413);
  } finally { globalThis.fetch = original; }
});
