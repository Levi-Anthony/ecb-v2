import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { decodeJwt } from 'jose';
import { OAUTH_CAPABILITIES, OAUTH_RESOURCE, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './oauth.js';

const ORIGIN = new URL(OAUTH_RESOURCE).origin;
const COOKIES = ['__Host-ecb_access', '__Host-ecb_refresh'] as const;
const headers = {
  'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
};
function client() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
  });
}
function cookie(request: Request, name: string): string {
  return request.headers.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith(name + '='))?.slice(name.length + 1) ?? '';
}
function setCookies(response: Response, access: string, refresh: string) {
  for (const [index, value] of [access, refresh].entries()) {
    response.headers.append('Set-Cookie', `${COOKIES[index]}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${value ? 604800 : 0}`);
  }
  return response;
}
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
  <section id="login"><form id="email-form"><label for="email">Email</label><input id="email" type="email" autocomplete="email" required><button>Send sign-in link</button></form><form id="code-form" hidden><label for="code">Email code, if your message includes one</label><input id="code" type="text" inputmode="numeric" autocomplete="one-time-code"><button>Verify code</button></form></section>
  <section id="consent" hidden><h2 id="client-name">Connection request</h2><p id="identity"></p><small id="scope"></small><div id="permissions">
  <label class="permission"><input name="capability" type="checkbox" value="recover" checked><span><b>Recover</b><small>Search and fetch existing thoughts and artifacts.</small></span></label>
  <label class="permission"><input name="capability" type="checkbox" value="preserve" checked><span><b>Preserve</b><small>Capture thoughts and create immutable artifacts.</small></span></label>
  <label class="permission"><input name="capability" type="checkbox" value="transition" checked><span><b>Transition</b><small>Record disposition changes under the existing operation safeguards.</small></span></label></div>
  <button id="approve">Allow connection</button><button id="deny" class="secondary">Deny</button></section>
  <section id="account" hidden><h2>Your connections</h2><div id="grants"></div><button id="logout" class="secondary">Sign out</button></section>
  </main><script nonce="${nonce}">
  const $=id=>document.getElementById(id);const params=new URLSearchParams(location.search);const authorization_id=params.get('authorization_id');
  async function api(action,body){const response=await fetch('/oauth/'+action,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await response.json();if(!response.ok)throw new Error(data.message||'The request could not be completed. Please try again.');return data;}
  function status(message){$('status').textContent=message;}
  async function run(action){document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await action();}catch(e){status(e.message);}finally{document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
  async function load(){const data=await api('context'+(authorization_id?'?authorization_id='+encodeURIComponent(authorization_id):''));$('login').hidden=data.signed_in;$('account').hidden=!data.signed_in;$('consent').hidden=true;if(!data.signed_in)return;
    $('identity').textContent='Signed in as '+data.email;$('grants').replaceChildren();for(const grant of data.grants||[]){const row=document.createElement('p');row.textContent=grant.client_name+' — '+(grant.disconnect_pending?'Access revoked; removal pending':grant.capabilities.join(', '));const button=document.createElement('button');button.className='secondary';button.textContent=grant.disconnect_pending?'Finish disconnecting':'Revoke';button.onclick=()=>run(async()=>{const result=await api('revoke',{client_id:grant.client_id});await load();status(result.native_revocation_pending?'Access is revoked. Select Finish disconnecting to complete removal.':'Connection revoked.');});row.append(document.createElement('br'),button);$('grants').append(row);}
    if(!data.enrolled){status('Signed in as '+data.email+'. Your account is awaiting ECB enrollment. Return to your setup conversation to continue.');return;}
    if(data.redirect_url){location.assign(data.redirect_url);return;}if(data.authorization){$('consent').hidden=false;$('client-name').textContent=data.authorization.client.client_name||data.consumer;$('scope').textContent='Identity information requested: '+data.authorization.scope;for(const input of document.querySelectorAll('input[name=capability]')){input.disabled=!data.capability_ceiling.includes(input.value);input.checked=!input.disabled;}status('Choose the permissions for this '+data.consumer+' connection.');}else status('Your ECB account is ready. Add the ECB connector in your app to continue.');}
  $('email-form').onsubmit=e=>{e.preventDefault();run(async()=>{await api('start',{email:$('email').value,authorization_id});$('code-form').hidden=false;status('Check your email and open the sign-in link in this browser. If your email includes a code, you can enter it here.');});};
  $('code-form').onsubmit=e=>{e.preventDefault();run(async()=>{await api('verify',{email:$('email').value,code:$('code').value});await load();});};
  $('approve').onclick=()=>run(async()=>{const capabilities=Array.from(document.querySelectorAll('input[name=capability]:checked:not(:disabled)')).map(input=>input.value);const data=await api('decision',{authorization_id,action:'approve',capabilities});location.assign(data.redirect_url);});
  $('deny').onclick=()=>run(async()=>{const data=await api('decision',{authorization_id,action:'deny'});location.assign(data.redirect_url);});
  $('logout').onclick=()=>run(async()=>{await api('logout',{});status('Signed out.');await load();});
  run(async()=>{const hash=new URLSearchParams(location.hash.slice(1));if(hash.get('access_token')){history.replaceState(null,'',location.pathname+location.search);await api('session',{access_token:hash.get('access_token'),refresh_token:hash.get('refresh_token')});}await load();});
  </script></body></html>`;
}

export async function handleConsent(request: Request): Promise<Response> {
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
  const auth = client();
  try {
    if (request.method === 'POST' && action === 'start') {
      if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return response({ message: 'Enter a valid email address.' }, 400);
      }
      const id = body.authorization_id ? authorizationId(body.authorization_id) : undefined;
      const { error } = await auth.auth.signInWithOtp({ email: body.email, options: {
        emailRedirectTo: `${ORIGIN}/oauth/consent${id ? `?authorization_id=${encodeURIComponent(id)}` : ''}`,
      } });
      if (error) return response({ message: 'Email sign-in is unavailable or rate-limited. Please try again shortly.' }, 503);
      return response({ sent: true });
    }
    if (request.method === 'POST' && (action === 'verify' || action === 'session')) {
      const result = action === 'verify'
        ? await auth.auth.verifyOtp({ email: String(body.email ?? ''), token: String(body.code ?? ''), type: 'email' })
        : await auth.auth.setSession({ access_token: String(body.access_token ?? ''), refresh_token: String(body.refresh_token ?? '') });
      const session = result.data.session;
      if (result.error || !session || decodeJwt(session.access_token).client_id) {
        return response({ message: 'This sign-in link or code is invalid or expired.' }, 401);
      }
      return setCookies(response({ signed_in: true }), session.access_token, session.refresh_token);
    }
    const access = cookie(request, COOKIES[0]); const refresh = cookie(request, COOKIES[1]);
    if (!access || !refresh) return response({ signed_in: false }, action === 'context' && request.method === 'GET' ? 200 : 401);
    const { data, error } = await auth.auth.setSession({ access_token: access, refresh_token: refresh });
    if (error || !data.session || !data.user || decodeJwt(data.session.access_token).client_id) {
      return setCookies(response({ signed_in: false }, 401), '', '');
    }
    const done = (value: unknown, status = 200) => setCookies(response(value, status), data.session!.access_token, data.session!.refresh_token);
    if (request.method === 'GET' && action === 'context') {
      const { data: context, error: contextError } = await auth.rpc('ecb218_oauth_context');
      if (contextError) return done({ message: 'ECB enrollment information is unavailable.' }, 503);
      const value = { signed_in: true, email: data.user.email, enrolled: context.enrolled, grants: context.grants };
      const id = url.searchParams.get('authorization_id');
      if (!id || !context.enrolled) return done(value);
      const { data: policy, error: policyError } = await auth.rpc('ecb218_oauth_authorization_context', { p_authorization_id: authorizationId(id) });
      if (policyError || !policy) return done({ message: 'This connection request has expired or its callback policy is not installed. Return to setup.' }, 403);
      const { data: details, error: detailError } = await auth.auth.oauth.getAuthorizationDetails(authorizationId(id));
      if (detailError || !details) return done({ message: 'This connection request has expired. Restart it in your app.' }, 400);
      if ('redirect_url' in details) {
        const { data: valid, error: validError } = await auth.rpc('ecb218_oauth_authorization_valid', { p_authorization_id: id });
        if (validError || !valid) return done({ message: 'Revoke this connection, then reconnect from your app to review its permissions.' }, 403);
        return done({ ...value, redirect_url: safeRedirect(details.redirect_url, policy.redirect_uri) });
      }
      if (details.redirect_uri !== policy.redirect_uri || details.user.id !== data.user.id) return done({ message: 'This connection does not match its registered callback.' }, 403);
      return done({ ...value, authorization: details, consumer: policy.consumer, capability_ceiling: policy.capability_ceiling });
    }
    if (request.method === 'POST' && action === 'decision') {
      const id = authorizationId(body.authorization_id);
      const { data: policy, error: policyError } = await auth.rpc('ecb218_oauth_authorization_context', { p_authorization_id: id });
      if (policyError || !policy) return done({ message: 'This connection request is not eligible under its installed callback policy.' }, 403);
      if (body.action === 'deny') {
        const result = await auth.auth.oauth.denyAuthorization(id, { skipBrowserRedirect: true });
        if (result.error || !result.data) return done({ message: 'The connection request could not be denied. Please restart it.' }, 400);
        return done({ redirect_url: safeRedirect(result.data.redirect_url, policy.redirect_uri) });
      }
      if (body.action !== 'approve' || !Array.isArray(body.capabilities) || !body.capabilities.length
        || body.capabilities.some(value => !OAUTH_CAPABILITIES.includes(value))) return done({ message: 'Choose at least one permission.' }, 400);
      const { error: grantError } = await auth.rpc('ecb218_oauth_approve', { p_authorization_id: id, p_capabilities: body.capabilities });
      if (grantError) return done({ message: 'This account or connection request is not authorized. Restart the connection after enrollment.' }, 403);
      const result = await auth.auth.oauth.approveAuthorization(id, { skipBrowserRedirect: true });
      if (result.error || !result.data) return done({ message: 'Supabase could not complete consent. Restart the connection in your app.' }, 503);
      return done({ redirect_url: safeRedirect(result.data.redirect_url, policy.redirect_uri) });
    }
    if (request.method === 'POST' && action === 'revoke') {
      if (typeof body.client_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.client_id)) return done({ message: 'Invalid connection.' }, 400);
      const { error: revokeError } = await auth.rpc('ecb218_oauth_revoke', { p_client_id: body.client_id });
      if (revokeError) return done({ message: 'The connection could not be revoked.' }, 503);
      const native = await auth.auth.oauth.revokeGrant({ clientId: body.client_id });
      return done({ revoked: true, native_revocation_pending: Boolean(native.error) });
    }
    if (request.method === 'POST' && action === 'logout') {
      await auth.auth.signOut({ scope: 'local' });
      return setCookies(response({ signed_out: true }), '', '');
    }
    return done({ message: 'Not found.' }, 404);
  } catch {
    // Provider exceptions can carry credential-bearing request data. Log no raw exception.
    console.error('oauth_consent_unavailable');
    return response({ message: 'The sign-in service is unavailable. Please retry or return to setup.' }, 503);
  }
}
