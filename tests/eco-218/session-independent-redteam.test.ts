// Independently authored 14-case PR #115 attack suite, preserved as ongoing regressions.
// @ts-nocheck — synthetic provider substitutes deliberately do not implement the full Supabase SDK.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readBrowserSession } from '../../server/browser-session.ts';
import { handleConsent } from '../../server/oauth-consent.ts';
import { handlePersonalApp } from '../../server/personal-app.ts';

const base='https://ecb-v2-eight.vercel.app';
const token=(sub='subject-A',more={})=>'e30.'+Buffer.from(JSON.stringify({sub,exp:Math.floor(Date.now()/1000)+600,...more})).toString('base64url')+'.demo';
const c=(access,refresh)=>[access?'__Host-ecb_access='+access:'',refresh?'__Host-ecb_refresh='+refresh:''].filter(Boolean).join('; ');
const req=(access,refresh)=>new Request(base+'/oauth/refresh',{method:'POST',headers:{origin:base,'content-type':'application/json',cookie:c(access,refresh)},body:'{}'});
const fakeRefresh=(session,error=null,user={id:'subject-A'})=>({auth:{refreshSession:async()=>({error,data:{session,user}})}});

test('RED-01: a missing rotated refresh token must never set browser cookies or claim recovery success', async()=>{
  const r=await handleConsent(req('','good-refresh'),{authClient:fakeRefresh({access_token:token(),refresh_token:undefined})});
  assert.notEqual(r.status,200,'successful refresh without replacement refresh credential must be rejected');
  assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-02: blank rotated refresh token must not clear the prior valid recovery cookie', async()=>{
  const r=await handleConsent(req('','good-refresh'),{authClient:fakeRefresh({access_token:token(),refresh_token:''})});
  assert.notEqual(r.status,200);
  assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-03: provider status 400 bad_jwt with extant refresh is an authentication rejection not a provider outage',async()=>{
  const fake={auth:{getUser:async()=>({data:{user:null},error:{status:400,code:'bad_jwt'}})}};
  const result=await readBrowserSession(new Request(base+'/oauth/context',{headers:{cookie:c(token(),'good-refresh')}}),fake);
  assert.equal(result.ok,false);
  if(!result.ok){assert.equal(result.status,401);assert.equal(result.code,'session_provider_rejected_recoverable');}
});
test('RED-04: documented terminal session_expired rejects one-time recovery without spinning 503 retry',async()=>{
  const r=await handleConsent(req('','revoked-refresh'),{authClient:fakeRefresh(null,{status:403,code:'session_expired'},null)});
  assert.equal(r.status,401);
  assert.equal((await r.json()).code,'session_reauthentication_required');
  assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-05: valid provider-verified refresh rotates both cookies',async()=>{
  const r=await handleConsent(req('','good-refresh'),{authClient:fakeRefresh({access_token:token(),refresh_token:'rotated-refresh'})});
  assert.equal(r.status,200);
  const set=r.headers.get('set-cookie')||'';assert.match(set,/__Host-ecb_access=/);assert.match(set,/__Host-ecb_refresh=rotated-refresh/);
});
test('RED-06: mismatched provider identity cannot yield a first-party cookie pair',async()=>{
  const r=await handleConsent(req(token('subject-B'),'good-refresh'),{authClient:fakeRefresh({access_token:token('subject-A'),refresh_token:'rotated-refresh'})});
  assert.equal(r.status,401); assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-07: denial before principal enrollment avoids all work ports',async()=>{
  let ops=0;
  const ports={inspect:async()=>{ops++;},commission:async()=>{ops++;},search:async()=>{ops++;},fetch:async()=>{ops++;},capture:async()=>{ops++;}};
  const getUser={auth:{getUser:async()=>({data:{user:{id:'subject-A'}},error:null})},rpc:async()=>({data:{enrolled:false},error:null})};
  const r=await handlePersonalApp(new Request(base+'/api/personal?action=load',{headers:{cookie:c(token(),'good-refresh')}}),ports,{authClient:getUser});
  assert.equal(r.status,403);assert.equal(ops,0);
});

test('RED-08: OAuth client access token blocks refresh without provider dispatch',async()=>{
 let calls=0;const provider={auth:{refreshSession:async()=>{calls++;throw Error('should not call');}}};
 const r=await handleConsent(req(token('subject-A',{client_id:'oauth-client'}),'r'),{authClient:provider});
 assert.equal(r.status,401);assert.equal((await r.json()).code,'first_party_session_required');assert.equal(calls,0);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-09: renewed client token never gets human cookies even if provider user matches',async()=>{
 const r=await handleConsent(req('','r'),{authClient:fakeRefresh({access_token:token('subject-A',{client_id:'oauth-client'}),refresh_token:'new-r'})});
 assert.equal(r.status,401);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-10: error details never disclose access, refresh or provider user id',async()=>{
 const fake={auth:{getUser:async()=>({data:{user:null},error:{status:401,message:'provider-sensitive-text:SECRET'}})}};
 const r=await handleConsent(new Request(base+'/oauth/context',{headers:{cookie:c(token('subject-A'),'SENSITIVE-REFRESH')}}),{authClient:fake});
 const s=await r.text();assert.doesNotMatch(s,/SECRET|SENSITIVE-REFRESH|subject-A|\.demo/);
});
test('RED-11: missing all credentials never invokes verification, enrollment or work',async()=>{
 let calls=0;const auth={auth:{getUser:async()=>{calls++;throw Error('unreachable');}},rpc:async()=>{calls++;}};
 const ports={inspect:async()=>{calls++;},commission:async()=>{calls++;},search:async()=>{calls++;},fetch:async()=>{calls++;},capture:async()=>{calls++;}};
 const r=await handlePersonalApp(new Request(base+'/api/personal?action=load'),ports,{authClient:auth});
 assert.equal(r.status,401);assert.equal(calls,0);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-12: provider error 503 does not rotate or revoke tokens',async()=>{
 const r=await handleConsent(req('','r'),{authClient:fakeRefresh(null,{status:503,code:'request_timeout'},null)});
 assert.equal(r.status,503);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-13: wrong Origin cannot invoke refresh provider',async()=>{
 let calls=0;const provider={auth:{refreshSession:async()=>{calls++;throw Error('unreachable');}}};
 const rr=new Request(base+'/oauth/refresh',{method:'POST',headers:{origin:'https://other.example','content-type':'application/json',cookie:c('','r')},body:'{}'});
 const r=await handleConsent(rr,{authClient:provider});
 assert.equal(r.status,403);assert.equal(calls,0);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-14: simultaneous script readers in same profile perform one refresh and can both read after it',async()=>{
 const {BROWSER_SESSION_SCRIPT}=await import('../../server/browser-session.ts');
 const vm=await import('node:vm');let restored=false,rotations=0,reads=0;let sequence=Promise.resolve();
 const locks={request(_name,fn){const out=sequence.then(fn);sequence=out.then(()=>undefined,()=>undefined);return out;}};
 const fetch=async(url)=>{if(url==='/oauth/context')return Response.json(restored?{signed_in:true}:{code:'session_access_missing_recoverable'},{status:restored?200:401});
 if(url==='/oauth/refresh'){rotations++;restored=true;return Response.json({signed_in:true});}
 if(url==='/api/personal?action=load'){reads++;return Response.json(restored?{ok:true}:{code:'session_access_missing_recoverable'},{status:restored?200:401});}throw Error('bad url');};
 const get=vm.runInNewContext(BROWSER_SESSION_SCRIPT+';sessionFetch',{fetch,navigator:{locks},Promise,Error});
 const pair=await Promise.all([get('/api/personal?action=load'),get('/api/personal?action=load')]);
 assert.deepEqual(pair.map(x=>x.status),[200,200]);assert.equal(rotations,1);assert.equal(reads,4);
});


test('RED-15: unknown provider 400 is neither inferred to be a credential rejection nor granted work',async()=>{
 const fake={auth:{getUser:async()=>({data:{user:null},error:{status:400,code:'unrecognized_vendor_code',message:'SECRET'}})}};
 const r=await readBrowserSession(new Request(base+'/oauth/context',{headers:{cookie:c(token(),'r')}}),fake);
 assert.deepEqual(r,{ok:false,status:503,code:'session_check_unavailable'});
});
test('RED-16: expired access verification does not become a retry loop',async()=>{
 const fake={auth:{getUser:async()=>({data:{user:null},error:{status:400,code:'session_expired'}})}};
 const r=await readBrowserSession(new Request(base+'/oauth/context',{headers:{cookie:c(token(),'r')}}),fake);
 assert.deepEqual(r,{ok:false,status:401,code:'session_reauthentication_required'});
});
test('RED-17: unsafe provider-issued refresh value does not inject cookie fields',async()=>{
 const r=await handleConsent(req('','r'),{authClient:fakeRefresh({access_token:token(),refresh_token:'x; Max-Age=0'})});
 assert.equal(r.status,503);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-18: unknown refresh-provider failure fails closed without issuing or erasing cookies',async()=>{
 const r=await handleConsent(req('','r'),{authClient:fakeRefresh(null,{status:400,code:'unrecognized_vendor_code'},null)});
 assert.equal(r.status,503);assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-19: revoked refresh reuse is a terminal rather than looping status',async()=>{
 const r=await handleConsent(req('','r'),{authClient:fakeRefresh(null,{status:400,code:'refresh_token_already_used'},null)});
 assert.equal(r.status,401);assert.equal((await r.json()).code,'session_reauthentication_required');assert.equal(r.headers.get('set-cookie'),null);
});
test('RED-20: sign-in session callback cannot set cookies with absent provider refresh',async()=>{
 const rr=new Request(base+'/oauth/session',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({access_token:'original-access',refresh_token:'original-refresh'})});
 const provider={auth:{setSession:async()=>({data:{session:{access_token:token(),refresh_token:''}},error:null})}};
 const r=await handleConsent(rr,{authClient:provider});
 assert.equal(r.status,401);assert.equal(r.headers.get('set-cookie'),null);
});
