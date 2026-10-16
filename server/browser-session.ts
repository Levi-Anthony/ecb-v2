import { createClient } from '@supabase/supabase-js';
import { decodeJwt } from 'jose';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './oauth.js';

export const SESSION_COOKIES = ['__Host-ecb_access', '__Host-ecb_refresh'] as const;
export function browserAuthClient(access?: string) {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { ...(access ? { headers: { Authorization: `Bearer ${access}` } } : {}),
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
  });
}
export type BrowserAuthClient = ReturnType<typeof browserAuthClient>;
export function sessionCookies(request: Request) {
  return SESSION_COOKIES.map(name => request.headers.get('cookie')?.split(';').map(p => p.trim())
    .find(p => p.startsWith(name + '='))?.slice(name.length + 1) ?? '');
}
export function writeSessionCookies(response: Response, access: string, refresh: string) {
  for (const [index, value] of [access, refresh].entries()) {
    response.headers.append('Set-Cookie', `${SESSION_COOKIES[index]}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${value ? 604800 : 0}`);
  }
  return response;
}
export type BrowserSession = { ok: true; auth: BrowserAuthClient; user: { id: string; email?: string }; access: string; refresh: string } |
  { ok: false; status: number; code: string };
// Ordinary requests never rotate or write cookies: delayed responses cannot roll a newer pair back.
// Decoding is used only to reject client tokens or request refresh; getUser authenticates identity.
export async function readBrowserSession(request: Request, injected?: BrowserAuthClient): Promise<BrowserSession> {
  const [access, refresh] = sessionCookies(request);
  if (!access || !refresh) return { ok: false, status: 401, code: 'sign_in_required' };
  let claims;
  try { claims = decodeJwt(access); }
  catch { return { ok: false, status: 401, code: 'sign_in_required' }; }
  try {
    if (claims.client_id) return { ok: false, status: 401, code: 'first_party_session_required' };
    if (typeof claims.exp !== 'number' || typeof claims.sub !== 'string') return { ok: false, status: 401, code: 'sign_in_required' };
    if (claims.exp <= Date.now() / 1000 + 30) return { ok: false, status: 401, code: 'session_refresh_required' };
    const auth = injected ?? browserAuthClient(access);
    const result = await auth.auth.getUser(access);
    if (result.error) return { ok: false, status: result.error.status === 401 || result.error.status === 403 ? 401 : 503,
      code: result.error.status === 401 || result.error.status === 403 ? 'sign_in_required' : 'session_check_unavailable' };
    if (!result.data.user || result.data.user.id !== claims.sub) return { ok: false, status: 401, code: 'sign_in_required' };
    return { ok: true, auth, user: result.data.user, access, refresh };
  } catch { return { ok: false, status: 503, code: 'session_check_unavailable' }; }
}

// Same-origin Web Locks coordinate cookie writers across tabs in the SAME browser profile.
// No unsafe in-memory fallback across tabs; unsupported browsers get an explicit disposition.
export const BROWSER_SESSION_SCRIPT = String.raw`
const sessionLock=fn=>{
  if(!navigator.locks)return Promise.reject(new Error('Session recovery needs a browser with Web Locks. Open ECOS in current Safari. No new email is needed.'));
  return navigator.locks.request('ecb-browser-session',fn);
};
async function sessionFetch(url,init){
  let response=await fetch(url,init);
  if(response.status!==401)return response;
  const data=await response.clone().json().catch(()=>({}));
  if((data.code||data.error)!=='session_refresh_required')return response;
  await sessionLock(async()=>{
    const check=await fetch('/oauth/context');
    const current=await check.json();
    if(check.ok&&current.signed_in)return;
    if(current.code!=='session_refresh_required')throw new Error(current.message||'Session verification is unavailable. Retry this page; no new email is needed.');
    const refreshed=await fetch('/oauth/refresh',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
    const result=await refreshed.json();
    if(!refreshed.ok){
      if(result.code==='session_reauthentication_required'){
        const latest=await fetch('/oauth/context');const state=await latest.json();
        if(latest.ok&&state.signed_in)return;
        if(latest.status===503)throw new Error('Session verification is temporarily unavailable. Retry this page; no new email is needed.');
      }
      const error=new Error(result.message||'Session recovery is unavailable. Retry this page; no new email is needed.');error.code=result.code;throw error;}
  });
  return fetch(url,init);
}
`;
