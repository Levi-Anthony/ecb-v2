import type { AuthInfo } from '@modelcontextprotocol/server';
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

export const OAUTH_RESOURCE = 'https://ecb-v2-eight.vercel.app/api/mcp';
export const OAUTH_ISSUER = 'https://vezxivrvhakclxuvxzso.supabase.co/auth/v1';
export const OAUTH_METADATA_URL = 'https://ecb-v2-eight.vercel.app/.well-known/oauth-protected-resource/api/mcp';
export const SUPABASE_URL = 'https://vezxivrvhakclxuvxzso.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4mAxzOfWinJcn-98szUEYA_Wh88UdPW';
export const OAUTH_CAPABILITIES = ['recover', 'preserve', 'transition'] as const;
export type OAuthCapability = typeof OAUTH_CAPABILITIES[number];

const keys = createRemoteJWKSet(new URL(`${OAUTH_ISSUER}/.well-known/jwks.json`), {
  timeoutDuration: 5000, cooldownDuration: 30000, cacheMaxAge: 600000,
});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function oauthEnabled(): boolean { return process.env.ECB_MCP_OAUTH_ENABLED === 'true'; }

export function protectedResourceMetadata() {
  return {
    resource: OAUTH_RESOURCE,
    authorization_servers: [OAUTH_ISSUER],
    bearer_methods_supported: ['header'],
    // Supabase's native scopes select identity disclosure, not ECB capability.
    // ECB capability is separately consented, signed and checked against a live grant.
    scopes_supported: ['email'],
    resource_name: 'ECB v2 ordinary MCP',
  };
}

export function bearerChallenge(error?: 'invalid_token' | 'insufficient_scope'): string {
  if (!oauthEnabled()) return 'Bearer realm="ecb-v2"';
  return `Bearer realm="ecb-v2", resource_metadata="${OAUTH_METADATA_URL}"${error ? `, error="${error}"` : ', scope="email"'}`;
}

export async function checkLiveGrant(input: {
  subject: string; clientId: string; sessionId: string; grantId: string;
}): Promise<OAuthCapability[] | null> {
  const runtimeKey = process.env.ECB_ORDINARY_DB_KEY?.trim();
  if (!runtimeKey) throw new Error('missing_ecb_ordinary_db_key');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ecb218_oauth_check`, {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'content-type': 'application/json', 'x-ecb-runtime-key': runtimeKey },
    body: JSON.stringify({
      p_subject: input.subject, p_client_id: input.clientId, p_session_id: input.sessionId,
      p_grant_id: input.grantId, p_resource: OAUTH_RESOURCE,
    }),
  });
  if (!response.ok) throw new Error('oauth_grant_check_unavailable');
  const value: unknown = await response.json();
  if (value === null) return null;
  if (!Array.isArray(value) || !value.length
    || value.some(item => !OAUTH_CAPABILITIES.includes(item as OAuthCapability))) {
    throw new Error('invalid_oauth_grant_response');
  }
  return value as OAuthCapability[];
}

export async function verifyOAuthToken(token: string, options: {
  key?: JWTVerifyGetKey;
  checkGrant?: typeof checkLiveGrant;
} = {}): Promise<AuthInfo | null> {
  if (token.length > 16384 || token.split('.').length !== 3) return null;
  let verified;
  try {
    verified = await jwtVerify(token, options.key ?? keys, {
      algorithms: ['ES256', 'RS256'], issuer: OAUTH_ISSUER, audience: OAUTH_RESOURCE,
      requiredClaims: ['sub', 'iat', 'exp', 'client_id', 'session_id', 'ecb_grant_id', 'ecb_capabilities'],
    });
  } catch (error) {
    // Network/JWKS availability errors are not credential-denial evidence.
    const code = (error as { code?: string }).code ?? '';
    if (!/^ERR_(JWT_|JWS_|JOSE_NOT_SUPPORTED|JWKS_NO_MATCHING_KEY)/.test(code)) {
      throw new Error('oauth_verification_unavailable');
    }
    return null;
  }
  const { payload } = verified;
  const ids = [payload.sub, payload.client_id, payload.session_id, payload.ecb_grant_id];
  const signed = payload.ecb_capabilities;
  if (payload.aud !== OAUTH_RESOURCE || ids.some(value => typeof value !== 'string' || !uuid.test(value))
    || payload.role !== 'authenticated' || payload.is_anonymous === true
    || !Array.isArray(signed) || !signed.length || new Set(signed).size !== signed.length
    || signed.some(value => !OAUTH_CAPABILITIES.includes(value as OAuthCapability))
    || typeof payload.iat !== 'number' || payload.iat > Date.now() / 1000 + 5) return null;
  const live = await (options.checkGrant ?? checkLiveGrant)({
    subject: payload.sub!, clientId: payload.client_id as string,
    sessionId: payload.session_id as string, grantId: payload.ecb_grant_id as string,
  });
  if (!live || live.length !== signed.length || live.some(value => !signed.includes(value))) return null;
  return {
    token, clientId: payload.client_id as string,
    scopes: live.map(capability => `ecb:${capability}`), expiresAt: payload.exp,
    resource: new URL(OAUTH_RESOURCE), resourceMetadataUrl: OAUTH_METADATA_URL,
    extra: { authentication_method: 'oauth', subject: payload.sub, grant_id: payload.ecb_grant_id },
  };
}

// Supabase doesn't accept custom ECB scope names at its token endpoint. Deny
// an ungranted tool before dispatch without advertising a fictitious step-up.
export async function oauthToolDenial(request: Request, auth: AuthInfo): Promise<Response | undefined> {
  if (auth.extra?.authentication_method !== 'oauth' || request.method !== 'POST') return;
  const reader = request.clone().body?.getReader();
  if (!reader) return;
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.length;
    if (size > 4 * 1024 * 1024) {
      void reader.cancel();
      return Response.json({ error: 'request_too_large' }, { status: 413 });
    }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body;
  try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return; }
  if (body?.method !== 'tools/call') return;
  const family: Record<string, OAuthCapability> = {
    fetch: 'recover', fetch_artifact: 'recover', search: 'recover',
    capture_thought: 'preserve', create_artifact: 'preserve', set_thought_disposition: 'transition',
  };
  const capability = family[body.params?.name];
  if (!capability || auth.scopes.includes(`ecb:${capability}`)) return;
  console.info(JSON.stringify({ event: 'ordinary_capability_decision', policy: 'eco218-oauth-v1',
    client_id: auth.clientId, required: `ecb:${capability}`, decision: 'deny' }));
  return Response.json({ error: 'insufficient_scope', required_capability: capability,
    consent_url: 'https://ecb-v2-eight.vercel.app/oauth/consent' }, {
    status: 403, headers: { 'WWW-Authenticate': bearerChallenge('insufficient_scope') },
  });
}
