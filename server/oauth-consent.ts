import { randomBytes } from 'node:crypto';
import { decodeJwt } from 'jose';
import { OAUTH_CAPABILITIES, OAUTH_RESOURCE, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './oauth.js';

const ORIGIN = new URL(OAUTH_RESOURCE).origin;
import { browserAuthClient as client, readBrowserSession, sessionCookies, writeSessionCookies as setCookies, BROWSER_SESSION_SCRIPT } from './browser-session.js';
const headers = {
  'Cache-Control': 'no-store', 'Vary': 'Cookie', 'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
};
// Do not interpret every provider failure as an email quota or expired session.
type AuthFailure = { status?: number; code?: string };
export function classifyEmailStartFailure(error: AuthFailure) {
  const throttled = error.status === 429 || error.code === 'over_email_send_rate_limit' ||
    error.code === 'over_request_rate_limit';
  return throttled
    ? { status: 429, code: 'email_throttled', message: 'Email delivery is temporarily limited. Do not request another link yet.' }
    : { status: 503, code: 'email_delivery_unavailable', message: 'ECB could not send a sign-in email. No new link was confirmed sent.' };
}
type ConsentHandlerOptions = { authClient?: ReturnType<typeof client> };

// Provider REST adapter follows the pinned SDK endpoints, but carries no refresh state.
// SDK OAuth methods implicitly refresh from storage via _useSession, so ordinary
// consent/revoke requests must use the existing bearer directly.
async function providerOAuth<T>(access: string, path: string, method = 'GET', body?: unknown): Promise<{ data: T | null; error: boolean }> {
  const result = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method, headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(8000),
  });
  if (!result.ok) return { data: null, error: true };
  return { data: result.status === 204 || method === 'DELETE' ? null : await result.json() as T, error: false };
}
type AuthorizationDetails = { redirect_url: string } | {
  redirect_uri: string; user: { id: string }; client: { client_name?: string }; scope: string;
};
export function safeRedirect(value: unknown, registeredUri: string): string {
  if (typeof value !== 'string') throw new Error('invalid_callback');
  const url = new URL(value);
  const expected = new URL(registeredUri);
  if (url.origin !== expected.origin || url.pathname !== expected.pathname
    || url.username || url.password || url.hash || expected.hash) {
    throw new Error('invalid_callback');
  }
  for (const [name, value] of expected.searchParams) {
    if (!url.searchParams.getAll(name).includes(value)) throw new Error('invalid_callback');
  }
  return value;
}
function authorizationId(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(value)) throw new Error('invalid_authorization');
  return value;
}

export function consentPage(nonce: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect ECB</title>
  <style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;background:#f5f4ef;color:#202820;font:17px/1.55 system-ui,sans-serif}main{max-width:540px;margin:7vh auto;padding:32px;background:white;border:1px solid #dedfd6;border-radius:18px}h1{font-size:30px;margin:0 0 12px}h2{font-size:21px}p{color:#4c574c}label{display:block;margin:16px 0 8px}input[type=email],input[type=text]{width:100%;padding:12px;font:inherit;border:1px solid #aab3a5;border-radius:8px}button{font:inherit;padding:11px 18px;background:#254c39;color:white;border:0;border-radius:8px;cursor:pointer;margin:12px 8px 0 0}button.secondary{background:#e9ede8;color:#202820}button:disabled{opacity:.6;cursor:wait}small{display:block;color:#647064}#status{white-space:pre-wrap}section[hidden]{display:none}.permission{display:flex;gap:12px;align-items:start}.permission input{margin-top:6px}@media(max-width:600px){main{margin:20px 12px;padding:24px}}</style></head><body><main>
  <small>ECB v2</small><h1>Connect your brain</h1><p>Sign in to your ECB account and choose what this connection can do.</p><p id="status" role="status"></p>
  <section id="login" hidden><form id="email-form"><label for="email">Email</label><input id="email" type="email" autocomplete="email" required><button>Send sign-in link</button></form><form id="code-form" hidden><label for="code">Email code, if your message includes one</label><input id="code" type="text" inputmode="numeric" autocomplete="one-time-code"><button>Verify code</button></form></section>
  <section id="consent" hidden><h2 id="client-name">Connection request</h2><p id="identity"></p><small id="scope"></small><div id="permissions">
  <label class="permission"><input name="capability" type="checkbox" value="recover" checked><span><b>Recover</b><small>Search and fetch existing thoughts and artifacts.</small></span></label>
  <label class="permission"><input name="capability" type="checkbox" value="preserve" checked><span><b>Preserve</b><small>Capture thoughts and create immutable artifacts.</small></span></label>
  <label class="permission"><input name="capability" type="checkbox" value="transition" checked><span><b>Transition</b><small>Record disposition changes under the existing operation safeguards.</small></span></label></div>
  <button id="approve">Allow connection</button><button id="deny" class="secondary">Deny</button></section>
  <section id="account" hidden><h2>Your connections</h2><p id="private-workspace" hidden><a href="/api/personal">Open your private ECOS workspace</a></p><div id="grants"></div><button id="logout" class="secondary">Sign out</button></section>
  <button id="retry-session" class="secondary" hidden>Retry session recovery</button></main><script nonce="${nonce}">
${BROWSER_SESSION_SCRIPT}
  const $=id=>document.getElementById(id);const params=new URLSearchParams(location.search);const authorization_id=params.get('authorization_id');
  async function api(action,body,locked=false){const response=await (locked?fetch:sessionFetch)('/oauth/'+action,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await response.json();if(!response.ok){const error=new Error(data.message||'The request could not be completed. Please try again.');error.status=response.status;throw error;}return data;}
  function status(message){$('status').textContent=message;}
  async function run(action){document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await action();}catch(e){status(e.message);}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
  async function load(){const data=await api('context'+(authorization_id?'?authorization_id='+encodeURIComponent(authorization_id):''));$('login').hidden=data.signed_in;$('account').hidden=!data.signed_in;$('consent').hidden=true;if(!data.signed_in){$('private-workspace').hidden=true;return;}
    $('private-workspace').hidden=!data.enrolled;$('identity').textContent='Signed in as '+data.email;$('grants').replaceChildren();for(const grant of data.grants||[]){const row=document.createElement('p');row.textContent=grant.client_name+' — '+(grant.disconnect_pending?'Access revoked; removal pending':grant.capabilities.join(', '));const button=document.createElement('button');button.className='secondary';button.textContent=grant.disconnect_pending?'Finish disconnecting':'Revoke';button.onclick=()=>run(async()=>{const result=await api('revoke',{client_id:grant.client_id});await load();status(result.native_revocation_pending?'Access is revoked. Select Finish disconnecting to complete removal.':'Connection revoked.');});row.append(document.createElement('br'),button);$('grants').append(row);}
    if(!data.enrolled){status('Signed in as '+data.email+'. Your account is awaiting ECB enrollment. Return to your setup conversation to continue.');return;}
    if(data.redirect_url){location.assign(data.redirect_url);return;}if(data.authorization){$('consent').hidden=false;$('client-name').textContent=data.authorization.client.client_name||data.consumer;$('scope').textContent='Identity information requested: '+data.authorization.scope;for(const input of document.querySelectorAll('input[name=capability]')){input.disabled=!data.capability_ceiling.includes(input.value);input.checked=!input.disabled;}status('Choose the permissions for this '+data.consumer+' connection.');}else status('Your ECB account is ready. Open your private ECOS workspace above or connect another supported app.');}
  $('email-form').onsubmit=e=>{e.preventDefault();run(async()=>{await api('start',{email:$('email').value,authorization_id});$('email-form').hidden=true;$('code-form').hidden=false;status('Check your email and open the sign-in link in this browser. If your email includes a code, you can enter it here.');});};
  $('code-form').onsubmit=e=>{e.preventDefault();run(async()=>{await sessionLock(()=>api('verify',{email:$('email').value,code:$('code').value},true));await load();});};
  $('approve').onclick=()=>run(async()=>{const capabilities=Array.from(document.querySelectorAll('input[name=capability]:checked:not(:disabled)')).map(input=>input.value);const data=await api('decision',{authorization_id,action:'approve',capabilities});location.assign(data.redirect_url);});
  $('deny').onclick=()=>run(async()=>{const data=await api('decision',{authorization_id,action:'deny'});location.assign(data.redirect_url);});
  $('logout').onclick=()=>run(async()=>{const result=await sessionLock(()=>api('logout',{},true));await load();status(result.native_revocation_pending?'Browser signed out. Server revocation could not be confirmed.':'Signed out.');});
  let pendingSession;
  async function recover(){
    $('login').hidden=true;
    $('retry-session').hidden=true;
    try{
      if(pendingSession){await sessionLock(()=>api('session',pendingSession,true));pendingSession=undefined;}
      await load();
    }catch(e){
      if(e.code==='session_reauthentication_required'){$('login').hidden=false;$('account').hidden=true;$('private-workspace').hidden=true;}
      else if(e.status===401){pendingSession=undefined;await load();}
      $('retry-session').hidden=false;
      throw e;
    }
  }
  $('retry-session').onclick=()=>run(recover);
  run(async()=>{const hash=new URLSearchParams(location.hash.slice(1));
    if(hash.get('access_token')){pendingSession={access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')};history.replaceState(null,'',location.pathname+location.search);}
    await recover();
  });
  </script></body></html>`;
}

export async function handleConsent(request: Request, options: ConsentHandlerOptions = {}): Promise<Response> {
  const url = new URL(request.url);
  const action = url.pathname.split('/').pop();
  const response = (value: unknown, status = 200) => Response.json(value, { status, headers });
  if (url.origin !== ORIGIN) return response({ message: 'Use the installed ECB address to sign in.' }, 403);
  if (request.method === 'GET' && action === 'consent') {
    const nonce = randomBytes(18).toString('base64');
    return new Response(consentPage(nonce), { headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'` } });
  }
  if (request.method !== 'GET' && request.method !== 'POST') return response({ message: 'Method not allowed.' }, 405);
  if (request.method === 'POST' && (request.headers.get('origin') !== ORIGIN
    || !request.headers.get('content-type')?.startsWith('application/json'))) {
    return response({ message: 'Please submit this request from ECB.' }, 403);
  }
  let body: Record<string, unknown> = {};
  if (request.method === 'POST') {
    // Bound the body before JSON decoding, including chunked requests.
    const reader = request.body?.getReader();
    let text = ''; let size = 0; const decoder = new TextDecoder();
    if (reader) while (true) {
      const next = await reader.read(); if (next.done) break;
      size += next.value.length;
      if (size > 32768) { void reader.cancel(); return response({ message: 'Request is too large.' }, 413); }
      text += decoder.decode(next.value, { stream: true });
    }
    try {
      const value: unknown = JSON.parse(text + decoder.decode());
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
      body = value as Record<string, unknown>;
    } catch { return response({ message: 'Invalid request.' }, 400); }
  }
  const auth = options.authClient ?? client();
  try {
    if (request.method === 'POST' && action === 'start') {
      if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return response({ message: 'Enter a valid email address.' }, 400);
      }
      const id = body.authorization_id ? authorizationId(body.authorization_id) : undefined;
      const { error } = await auth.auth.signInWithOtp({ email: body.email, options: {
        emailRedirectTo: `${ORIGIN}/oauth/consent${id ? `?authorization_id=${encodeURIComponent(id)}` : ''}`,
      } });
      if (error) {
        const failure = classifyEmailStartFailure(error);
        return response({ code: failure.code, message: failure.message }, failure.status);
      }
      return response({ sent: true });
    }
    if (request.method === 'POST' && (action === 'verify' || action === 'session')) {
      const result = action === 'verify'
        ? await auth.auth.verifyOtp({ email: String(body.email ?? ''), token: String(body.code ?? ''), type: 'email' })
        : await auth.auth.setSession({ access_token: String(body.access_token ?? ''), refresh_token: String(body.refresh_token ?? '') });
      const session = result.data.session;
      if (result.error && ![400,401,403].includes(result.error.status)) return response({ message: 'Sign-in verification is temporarily unavailable. Retry session recovery; no new email is needed.' }, 503);
      if (result.error || !session || decodeJwt(session.access_token).client_id) {
        return response({ message: 'This sign-in link or code is invalid or expired.' }, 401);
      }
      return setCookies(response({ signed_in: true }), session.access_token, session.refresh_token);
    }
    if (request.method === 'POST' && action === 'logout') {
      const [access] = sessionCookies(request);
      let pending = false;
      try { if (access) pending = Boolean((await auth.auth.admin.signOut(access, 'local')).error); }
      catch { pending = true; }
      // Explicit, serialized browser sign-out may clear even an expired pair.
      return setCookies(response({ signed_out: true, native_revocation_pending: pending }), '', '');
    }
    if (request.method === 'POST' && action === 'refresh') {
      const [access, refresh] = sessionCookies(request);
      if (!refresh) return response({ code: access ? 'session_refresh_missing' : 'session_missing',
        message: 'No session recovery credential exists in this browser profile.' }, 401);
      // Refresh tokens are provider credentials in their own right. A missing or
      // malformed access cookie does not invalidate a surviving, valid refresh token.
      // Do not accept an OAuth client token or switch subjects when an old sub exists.
      let previousSubject: string | undefined;
      if (access) {
        try {
          const claims = decodeJwt(access);
          if (claims.client_id) return response({ code: 'first_party_session_required' }, 401);
          if (typeof claims.sub === 'string') previousSubject = claims.sub;
        } catch { /* Provider must independently authenticate the refresh credential. */ }
      }
      const result = await auth.auth.refreshSession({ refresh_token: refresh });
      if (result.error || !result.data.session || !result.data.user) {
        // Never erase a sibling writer's newer pair on a delayed rejected request.
        if (['refresh_token_not_found','refresh_token_already_used','session_not_found','user_not_found','user_banned'].includes(result.error?.code ?? '')) {
          return response({ code: 'session_reauthentication_required', message: 'The provider rejected this session. Sign in when ready; no new email was requested.' }, 401);
        }
        return response({ code: 'session_recovery_unavailable', message: 'Session recovery could not be completed. Retry this page; no new email was requested.' }, 503);
      }
      let renewed;
      try { renewed = decodeJwt(result.data.session.access_token); }
      catch { return response({ code: 'session_recovery_unavailable' }, 503); }
      if (renewed.client_id || typeof renewed.sub !== 'string' || typeof renewed.exp !== 'number'
          || renewed.exp <= Date.now() / 1000 || renewed.sub !== result.data.user.id
          || (previousSubject && renewed.sub !== previousSubject)) {
        return response({ code: 'session_identity_mismatch',
          message: 'The renewed session did not match its verified first-party identity.' }, 401);
      }
      return setCookies(response({ signed_in: true }), result.data.session.access_token, result.data.session.refresh_token);
    }
    const session = await readBrowserSession(request, options.authClient);
    if (session.ok === false) {
      if (action === 'context' && request.method === 'GET' && session.status === 401 &&
          !['session_refresh_required', 'session_access_missing_recoverable',
            'session_access_malformed_recoverable', 'session_access_invalid_recoverable',
            'session_provider_rejected_recoverable'].includes(session.code)) {
        // Existing context contract stays 200/signed_in:false for terminal failures;
        // the sanitized reason makes missing versus malformed/rejected distinguishable.
        return response({ signed_in: false, code: session.code });
      }
      return response({ code: session.code, message: session.status === 503
        ? 'Session verification is temporarily unavailable. Retry session recovery; no new email is needed.'
        : 'Session recovery is required in this browser.' }, session.status);
    }
    const { auth: sessionAuth, user } = session;
    const data = { user };
    const done = response;
    if (request.method === 'GET' && action === 'context') {
      const { data: context, error: contextError } = await sessionAuth.rpc('ecb218_oauth_context');
      if (contextError) return done({ message: 'ECB enrollment information is unavailable.' }, 503);
      const value = { signed_in: true, email: data.user.email, enrolled: context.enrolled, grants: context.grants };
      const id = url.searchParams.get('authorization_id');
      if (!id || !context.enrolled) return done(value);
      const { data: policy, error: policyError } = await sessionAuth.rpc('ecb218_oauth_authorization_context', { p_authorization_id: authorizationId(id) });
      if (policyError || !policy) return done({ message: 'This connection request has expired or its callback policy is not installed. Return to setup.' }, 403);
      const { data: details, error: detailError } = await providerOAuth<AuthorizationDetails>(session.access, `oauth/authorizations/${authorizationId(id)}`);
      if (detailError || !details) return done({ message: 'This connection request has expired. Restart it in your app.' }, 400);
      if ('redirect_url' in details) {
        const { data: valid, error: validError } = await sessionAuth.rpc('ecb218_oauth_authorization_valid', { p_authorization_id: id });
        if (validError || !valid) return done({ message: 'Revoke this connection, then reconnect from your app to review its permissions.' }, 403);
        return done({ ...value, redirect_url: safeRedirect(details.redirect_url, policy.redirect_uri) });
      }
      if (details.redirect_uri !== policy.redirect_uri || details.user.id !== data.user.id) return done({ message: 'This connection does not match its registered callback.' }, 403);
      return done({ ...value, authorization: details, consumer: policy.consumer, capability_ceiling: policy.capability_ceiling });
    }
    if (request.method === 'POST' && action === 'decision') {
      const id = authorizationId(body.authorization_id);
      const { data: policy, error: policyError } = await sessionAuth.rpc('ecb218_oauth_authorization_context', { p_authorization_id: id });
      if (policyError || !policy) return done({ message: 'This connection request is not eligible under its installed callback policy.' }, 403);
      if (body.action === 'deny') {
        const result = await providerOAuth<{ redirect_url: string }>(session.access, `oauth/authorizations/${id}/consent`, 'POST', { action: 'deny' });
        if (result.error || !result.data) return done({ message: 'The connection request could not be denied. Please restart it.' }, 400);
        return done({ redirect_url: safeRedirect(result.data.redirect_url, policy.redirect_uri) });
      }
      if (body.action !== 'approve' || !Array.isArray(body.capabilities) || !body.capabilities.length
        || body.capabilities.some(value => !OAUTH_CAPABILITIES.includes(value))) return done({ message: 'Choose at least one permission.' }, 400);
      const { error: grantError } = await sessionAuth.rpc('ecb218_oauth_approve', { p_authorization_id: id, p_capabilities: body.capabilities });
      if (grantError) return done({ message: 'This account or connection request is not authorized. Restart the connection after enrollment.' }, 403);
      const result = await providerOAuth<{ redirect_url: string }>(session.access, `oauth/authorizations/${id}/consent`, 'POST', { action: 'approve' });
      if (result.error || !result.data) return done({ message: 'Supabase could not complete consent. Restart the connection in your app.' }, 503);
      return done({ redirect_url: safeRedirect(result.data.redirect_url, policy.redirect_uri) });
    }
    if (request.method === 'POST' && action === 'revoke') {
      if (typeof body.client_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.client_id)) return done({ message: 'Invalid connection.' }, 400);
      const { error: revokeError } = await sessionAuth.rpc('ecb218_oauth_revoke', { p_client_id: body.client_id });
      if (revokeError) return done({ message: 'The connection could not be revoked.' }, 503);
      const native = await providerOAuth(session.access, `user/oauth/grants?client_id=${encodeURIComponent(body.client_id)}`, 'DELETE');
      return done({ revoked: true, native_revocation_pending: Boolean(native.error) });
    }
    return done({ message: 'Not found.' }, 404);
  } catch {
    // Provider exceptions can carry credential-bearing request data. Log no raw exception.
    console.error('oauth_consent_unavailable');
    return response({ message: 'The sign-in service is unavailable. Please retry or return to setup.' }, 503);
  }
}
