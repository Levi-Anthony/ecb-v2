import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { decodeJwt } from 'jose';
import { OAUTH_RESOURCE, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './oauth.js';
import { PERSONAL_HTML } from './personal-app-ui.js';

const ORIGIN = new URL(OAUTH_RESOURCE).origin;
const ACCESS_COOKIE = '__Host-ecb_access';
const REFRESH_COOKIE = '__Host-ecb_refresh';
const CYCLE_ID = '40ca3bbd-c905-4ec5-b202-bfb49fcd6605';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE_HEADERS = {
  'Cache-Control': 'no-store, private',
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Vary': 'Cookie',
};

type Session = { allowed: true; access: string; refresh: string } |
  { allowed: false; status: number; code: string };

export type PersonalPorts = {
  inspect: (cycleId: string) => Promise<unknown>;
  commission: () => Promise<unknown>;
  capture: (input: { operationId: string; content: string; source: string; processingMode: 'raw_only' }) => Promise<unknown>;
  fetch: (id: string) => Promise<unknown>;
  search: (query: string, limit: number) => Promise<unknown>;
};

export type PersonalHandlerOptions = {
  // Dependency injection is for deterministic non-production unit tests.
  authorize?: (request: Request) => Promise<Session>;
};

function cookie(request: Request, name: string): string {
  return request.headers.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith(name + '='))?.slice(name.length + 1) ?? '';
}

async function authorizePrincipal(request: Request): Promise<Session> {
  const access = cookie(request, ACCESS_COOKIE);
  const refresh = cookie(request, REFRESH_COOKIE);
  if (!access || !refresh) return { allowed: false, status: 401, code: 'sign_in_required' };
  const auth = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
  });
  try {
    const { data, error } = await auth.auth.setSession({ access_token: access, refresh_token: refresh });
    if (error || !data.session || !data.user || decodeJwt(data.session.access_token).client_id) {
      return { allowed: false, status: 401, code: 'sign_in_required' };
    }
    // setSession alone is not an authorization proof: revalidate at the Auth server.
    const verified = await auth.auth.getUser(data.session.access_token);
    if (verified.error || !verified.data.user || verified.data.user.id !== data.user.id) {
      return { allowed: false, status: 401, code: 'sign_in_required' };
    }
    // Fail closed on the existing explicitly enrolled Principal register.
    // No implicit account creation or permission widening.
    const { data: context, error: contextError } = await auth.rpc('ecb218_oauth_context');
    if (contextError) return { allowed: false, status: 503, code: 'enrollment_unavailable' };
    if (context?.enrolled !== true) return { allowed: false, status: 403, code: 'principal_not_enrolled' };
    return { allowed: true, access: data.session.access_token, refresh: data.session.refresh_token };
  } catch {
    return { allowed: false, status: 503, code: 'session_verification_unavailable' };
  }
}

function wrap(body: BodyInit, status: number, contentType: string, session?: Session, nonce?: string) {
  const headers = new Headers(BASE_HEADERS);
  headers.set('Content-Type', contentType);
  if (nonce) headers.set('Content-Security-Policy', "default-src 'none'; script-src 'nonce-" + nonce +
    "'; style-src 'nonce-" + nonce + "'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  if (session?.allowed) {
    headers.append('Set-Cookie', ACCESS_COOKIE + '=' + session.access + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800');
    headers.append('Set-Cookie', REFRESH_COOKIE + '=' + session.refresh + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800');
  }
  return new Response(body, { status, headers });
}
function json(value: unknown, status = 200, session?: Session) {
  return wrap(JSON.stringify(value), status, 'application/json; charset=utf-8', session);
}
function unsupported(status: number, code: string) {
  return json({ error: code }, status);
}
function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function summary(commission: unknown) {
  if (!isObject(commission)) return { state: 'unavailable' };
  return {
    source: commission.source, standing: commission.standing,
    qualification: commission.qualification, summary: commission.summary,
    next_action: commission.next_action, limitations: commission.limitations,
    revision_id: commission.revision_id,
  };
}
function workflow(snapshot: unknown) {
  if (!isObject(snapshot)) return { state: 'unavailable' };
  return {
    cycle: snapshot.cycle, phase: snapshot.phase, debt: snapshot.debt,
    proposals: snapshot.proposals, children: snapshot.children,
    next_action: snapshot.next_action, monitor: snapshot.monitor,
  };
}

export async function handlePersonalApp(
  request: Request, ports: PersonalPorts, options: PersonalHandlerOptions = {},
): Promise<Response> {
  const url = new URL(request.url);
  if (url.origin !== ORIGIN) return unsupported(403, 'canonical_private_origin_required');
  if (request.method !== 'GET' && request.method !== 'POST') return unsupported(405, 'method_not_allowed');
  const session = await (options.authorize ?? authorizePrincipal)(request);
  if ('status' in session) {
    if (request.method === 'GET' && !url.searchParams.has('action')) {
      return wrap('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>ECOS | Sign in</title><main style="font:18px/1.6 system-ui;max-width:36rem;margin:12vh auto;padding:1.5rem">' +
        '<h1>ECOS private work surface</h1><p>Authentication and explicit enrollment are required. No work data is exposed.</p>' +
        '<p><a href="/oauth/consent">Sign in with your ECB account</a>, then return to this page.</p></main>',
        session.status, 'text/html; charset=utf-8');
    }
    return unsupported(session.status, session.code);
  }

  if (request.method === 'GET') {
    const action = url.searchParams.get('action');
    try {
      if (action === 'load') {
        const [current, inspected] = await Promise.all([ports.commission(), ports.inspect(CYCLE_ID)]);
        return json({
          source: 'live_authenticated_read', observed_at: new Date().toISOString(),
          commission: summary(current), workflow: workflow(inspected),
          qualification: { 'work_view': 'native controller read', 'real_use': 'not established by this read',
            'semantic_circulation': 'not inferred from raw custody' },
        }, 200, session);
      }
      if (action === 'search') {
        const q = url.searchParams.get('q') ?? '';
        if (!q.trim() || q.length > 400) return json({ error: 'invalid_query' }, 400, session);
        return json({ source: 'live_authenticated_search', result: await ports.search(q, 8) }, 200, session);
      }
      if (action === 'thought') {
        const id = url.searchParams.get('id') ?? '';
        if (!UUID.test(id)) return json({ error: 'invalid_thought_id' }, 400, session);
        const thought = await ports.fetch(id);
        return json({ source: 'live_authenticated_fetch', thought }, thought ? 200 : 404, session);
      }
      if (action) return json({ error: 'unknown_action' }, 404, session);
      const nonce = randomBytes(18).toString('base64url');
      return wrap(PERSONAL_HTML.replaceAll('%%NONCE%%', nonce), 200, 'text/html; charset=utf-8', session, nonce);
    } catch {
      return json({ error: 'live_read_unavailable', retryable: true }, 503, session);
    }
  }

  if (request.headers.get('origin') !== ORIGIN ||
      request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/json' ||
      request.headers.get('x-ecos-action') !== 'capture') {
    return json({ error: 'same_origin_action_required' }, 403, session);
  }
  const action = url.searchParams.get('action');
  if (action !== 'capture') return json({ error: 'unsupported_mutation' }, 403, session);
  const bytes = await request.text();
  if (bytes.length > 20000) return json({ error: 'request_too_large' }, 413, session);
  let parsed: unknown;
  try { parsed = JSON.parse(bytes); } catch { return json({ error: 'invalid_json' }, 400, session); }
  if (!isObject(parsed) || parsed.authorized !== true ||
      typeof parsed.operation_id !== 'string' || !UUID.test(parsed.operation_id) ||
      typeof parsed.content !== 'string' || !parsed.content.trim() ||
      parsed.content.length > 12000) {
    return json({ error: 'explicit_authorization_and_stable_identity_required' }, 400, session);
  }
  const content = parsed.content;
  const operationId = parsed.operation_id;
  const source = 'ecos-personal-app:principal-capture';
  try {
    const captured = await ports.capture({ operationId, content, source, processingMode: 'raw_only' });
    if (!isObject(captured) || !isObject(captured.thought) || typeof captured.thought.id !== 'string') {
      return json({ state: 'UNKNOWN', operation_id: operationId, error: 'capture_receipt_unavailable' }, 502, session);
    }
    const id = captured.thought.id;
    let found: unknown;
    try { found = await ports.fetch(id); }
    catch {
      return json({ state: 'CAPTURE_REPORTED_VERIFY_UNAVAILABLE', operation_id: operationId,
        thought_id: id, next: 'Retry the same operation_id, never mint a new retry identity.' }, 202, session);
    }
    if (!isObject(found) || found.content !== content || found.source !== source) {
      return json({ state: 'CUSTODY_NOT_VERIFIED', operation_id: operationId, thought_id: id,
        next: 'Inspect exact custody. Do not infer semantic admission.' }, 409, session);
    }
    return json({
      state: 'RAW_CUSTODY_VERIFIED', operation_id: operationId, thought_id: id,
      replayed: captured.replayed === true, source, captured_at: found.captured_at,
      semantic: 'not_validated', processing: 'raw_only',
      resume: '/api/personal?thought=' + encodeURIComponent(id),
    }, 200, session);
  } catch {
    return json({ state: 'UNKNOWN', operation_id: operationId,
      next: 'Use the same operation_id when retrying; do not create a second occurrence.' }, 503, session);
  }
}
