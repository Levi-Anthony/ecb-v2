import { randomBytes } from 'node:crypto';
import { OAUTH_RESOURCE } from './oauth.js';
import { readBrowserSession, isRecoverableSessionCode, BROWSER_SESSION_SCRIPT, type BrowserAuthClient } from './browser-session.js';
import { PERSONAL_HTML } from './personal-app-ui.js';

const ORIGIN = new URL(OAUTH_RESOURCE).origin;
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
  authClient?: BrowserAuthClient;
};

async function authorizePrincipal(request: Request, authClient?: BrowserAuthClient): Promise<Session> {
  const session = await readBrowserSession(request, authClient);
  if (session.ok === false) return { allowed: false, status: session.status, code: session.code };
  try {
    const { data: context, error } = await session.auth.rpc('ecb218_oauth_context');
    if (error) return { allowed: false, status: 503, code: 'enrollment_unavailable' };
    if (context?.enrolled !== true) return { allowed: false, status: 403, code: 'principal_not_enrolled' };
    return { allowed: true, access: session.access, refresh: session.refresh };
  } catch { return { allowed: false, status: 503, code: 'enrollment_unavailable' }; }
}

function wrap(body: BodyInit, status: number, contentType: string, session?: Session, nonce?: string) {
  const headers = new Headers(BASE_HEADERS);
  headers.set('Content-Type', contentType);
  if (nonce) headers.set('Content-Security-Policy', "default-src 'none'; script-src 'nonce-" + nonce +
    "'; style-src 'nonce-" + nonce + "'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
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
  const session = await (options.authorize ?? ((r: Request) => authorizePrincipal(r, options.authClient)))(request);
  if ('status' in session) {
    if (request.method === 'GET' && !url.searchParams.has('action')) {
      const nonce = randomBytes(18).toString('base64url');
      const recovering = isRecoverableSessionCode(session.code);
      const message = recovering ? session.code === 'session_access_missing_recoverable'
        ? 'The access credential is missing; checking whether your existing session can recover…'
        : session.code === 'session_access_malformed_recoverable' || session.code === 'session_access_invalid_recoverable'
          ? 'The access credential is invalid; checking the existing recovery credential…'
          : session.code === 'session_provider_rejected_recoverable'
            ? 'The identity provider rejected the access credential; checking existing session recovery…'
            : 'Restoring your existing browser session…'
        : session.status === 503
          ? 'Session verification is temporarily unavailable. Retry this page; your browser session was preserved.'
          : session.status === 403 ? 'This account is not currently enrolled. No work data is exposed.'
          : session.code === 'session_refresh_missing'
            ? 'The session recovery credential is missing from this browser profile. No work data is exposed.'
            : session.code === 'session_identity_mismatch'
              ? 'The browser session identity did not match. No work data is exposed.'
              : session.code === 'session_missing'
                ? 'No session is available in this browser profile. No work data is exposed.'
                : 'Authentication is required. No work data is exposed.';
      return wrap('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<title>ECOS | Session</title><main><h1>ECOS private work surface</h1><p id="status">' + message + '</p>' +
        (!recovering && session.status === 401 ? '<p><a href="/oauth/consent">Sign in with your ECB account</a></p>' : '<p><a href="/api/personal">Retry workspace</a></p>') +
        '<p id="session-signin" hidden><a href="/oauth/consent">Sign in when ready</a></p></main>' + (recovering ? '<script nonce="' + nonce + '">' + BROWSER_SESSION_SCRIPT +
          "sessionFetch('/oauth/context').then(async r=>{const d=await r.json();if(r.ok&&d.signed_in)location.reload();else document.getElementById('status').textContent=d.message||'Session recovery is unavailable. Retry this page.';}).catch(e=>{if(e.code==='session_reauthentication_required'){document.getElementById('status').textContent='The provider rejected this session. Sign in when ready; no new email was requested.';document.getElementById('session-signin').hidden=false;return;}document.getElementById('status').textContent=navigator.locks?'Session recovery is unavailable. Retry this page; no new email is needed.':'Open ECOS in current Safari for session recovery. No new email is needed.';});</script>" : ''),
        session.status, 'text/html; charset=utf-8', undefined, nonce);
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
  // Bound streamed bodies before allocation; Content-Length is advisory only.
  const reader = request.body?.getReader();
  if (!reader) return json({ error: 'invalid_json' }, 400, session);
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 20000) {
        void reader.cancel();
        return json({ error: 'request_too_large' }, 413, session);
      }
      body += decoder.decode(part.value, { stream: true });
    }
    body += decoder.decode();
  } catch {
    return json({ error: 'request_body_unavailable' }, 400, session);
  }
  let parsed: unknown;
  try { parsed = JSON.parse(body); } catch { return json({ error: 'invalid_json' }, 400, session); }
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
