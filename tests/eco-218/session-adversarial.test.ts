import test from 'node:test';
import assert from 'node:assert/strict';
import { readBrowserSession, BROWSER_SESSION_SCRIPT } from '../../server/browser-session.ts';
import vm from 'node:vm';
import { consentPage, handleConsent } from '../../server/oauth-consent.ts';
import { handlePersonalApp } from '../../server/personal-app.ts';

const origin='https://ecb-v2-eight.vercel.app';
function jwt(extra:Record<string,unknown>={}){return [Buffer.from('{"alg":"ES256"}').toString('base64url'),Buffer.from(JSON.stringify({sub:'review-user',exp:Date.now()/1000+600,...extra})).toString('base64url'),'constructed'].join('.');}
function req(token=jwt()){return new Request(origin+'/oauth/context',{headers:{cookie:'__Host-ecb_access='+token+'; __Host-ecb_refresh=review-refresh'}});}
function fake(getUser:()=>Promise<unknown>){return {auth:{getUser,setSession:()=>{throw Error('read must not setSession');},refreshSession:()=>{throw Error('read must not refresh');}}} as never;}
test('independent: valid ordinary read authenticates remotely and never rotates credentials',async()=>{let calls=0;const r=await readBrowserSession(req(),fake(async()=>{calls++;return {data:{user:{id:'review-user'}},error:null};}));assert.equal(r.ok,true);assert.equal(calls,1);});
test('independent: expired access requests explicit recovery before any provider or work dispatch',async()=>{let calls=0;const r=await readBrowserSession(req(jwt({exp:Date.now()/1000-1})),fake(async()=>{calls++;throw Error();}));assert.deepEqual(r,{ok:false,status:401,code:'session_refresh_required'});assert.equal(calls,0);});
test('independent: OAuth client session cannot enter human door even when expired',async()=>{let calls=0;const r=await readBrowserSession(req(jwt({client_id:'review-client',exp:0})),fake(async()=>{calls++;throw Error();}));assert.deepEqual(r,{ok:false,status:401,code:'first_party_session_required'});assert.equal(calls,0);});
test('independent: forged subject is denied after provider identity comparison',async()=>{const r=await readBrowserSession(req(),fake(async()=>({data:{user:{id:'other-user'}},error:null})));assert.equal(r.ok,false);if(r.ok===false)assert.equal(r.status,401);});
test('independent: provider outage is unavailable, never claimed sign-out',async()=>{const r=await readBrowserSession(req(),fake(async()=>({data:{user:null},error:{status:503}})));assert.deepEqual(r,{ok:false,status:503,code:'session_check_unavailable'});});
test('independent: syntactically malformed token is invalid rather than provider outage',async()=>{let calls=0;const r=await readBrowserSession(req('malformed'),fake(async()=>{calls++;throw Error();}));assert.deepEqual(r,{ok:false,status:401,code:'sign_in_required'});assert.equal(calls,0);});
function runner(fetch:typeof globalThis.fetch,locks?:unknown){const ctx:any={fetch,navigator:{locks},Promise,Error};vm.createContext(ctx);vm.runInContext(BROWSER_SESSION_SCRIPT+';globalThis.reviewFetch=sessionFetch;',ctx);return ctx.reviewFetch;}
test('independent: two same-profile tabs use one refresh after rechecking shared cookies under lock',async()=>{
 let fresh=false,refreshes=0,work=0;let queue=Promise.resolve();const locks={request(_name:string,fn:()=>Promise<unknown>){const result=queue.then(fn);queue=result.then(()=>undefined,()=>undefined);return result;}};
 const fetch:any=async(url:string)=>{if(url==='/oauth/context')return Response.json(fresh?{signed_in:true}:{code:'session_refresh_required'},{status:fresh?200:401});if(url==='/oauth/refresh'){refreshes++;await new Promise(r=>setImmediate(r));fresh=true;return Response.json({signed_in:true});}if(!fresh)return Response.json({error:'session_refresh_required'},{status:401});work++;return Response.json({ok:true});};
 const a=runner(fetch,locks),b=runner(fetch,locks);const results=await Promise.all([a('/api/personal?action=load'),b('/api/personal?action=load')]);assert.equal(refreshes,1);assert.equal(work,2);assert.equal(results.every((r:Response)=>r.status===200),true);
});
test('independent: missing cross-tab locking fails visibly without attempting uncoordinated rotation',async()=>{let refreshes=0;const fetch:any=async(url:string)=>{if(url==='/oauth/refresh')refreshes++;return Response.json({code:'session_refresh_required'},{status:401});};await assert.rejects(runner(fetch)('/oauth/context'),/Web Locks/);assert.equal(refreshes,0);});
test('independent: transient under-lock context outage does not launch another refresh',async()=>{let refreshes=0;const fetch:any=async(url:string)=>{if(url==='/api/personal')return Response.json({error:'session_refresh_required'},{status:401});if(url==='/oauth/refresh')refreshes++;return Response.json({code:'session_check_unavailable'},{status:503});};await assert.rejects(runner(fetch,{request:(_n:string,fn:()=>unknown)=>fn()})('/api/personal'),/Session verification/);assert.equal(refreshes,0);});
test('independent: email-code credential writer takes the same browser session lock',async()=>{
 const elements=new Map<string,any>();let holding=false,verifiedUnderLock=false;const ctx:any={URLSearchParams,location:{search:'',hash:'',pathname:'/oauth/consent'},history:{replaceState(){}},document:{querySelectorAll:()=>[],getElementById(id:string){if(!elements.has(id))elements.set(id,{value:'constructed',hidden:true});return elements.get(id);}},navigator:{locks:{request:async(_name:string,fn:()=>Promise<unknown>)=>{holding=true;try{return await fn();}finally{holding=false;}}}},fetch:async(url:string)=>{if(url==='/oauth/verify'){verifiedUnderLock=holding;return Response.json({signed_in:true});}return Response.json({signed_in:false});}};
 vm.createContext(ctx);vm.runInContext(consentPage('review-nonce').match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)![1],ctx);await new Promise(r=>setImmediate(r));elements.get('code-form').onsubmit({preventDefault(){}});await new Promise(r=>setImmediate(r));assert.equal(verifiedUnderLock,true);
});
test('independent: locked logout never recursively requests the same Web Lock on expired session',async()=>{
 const elements=new Map<string,any>();let holding=false,nested=false;const ctx:any={URLSearchParams,location:{search:'',hash:'',pathname:'/oauth/consent'},history:{replaceState(){}},document:{querySelectorAll:()=>[],getElementById(id:string){if(!elements.has(id))elements.set(id,{hidden:true,replaceChildren(){}});return elements.get(id);}},navigator:{locks:{request:async(_name:string,fn:()=>Promise<unknown>)=>{if(holding){nested=true;throw Error('nested lock would wait forever');}holding=true;try{return await fn();}finally{holding=false;}}}},fetch:async(url:string)=>url==='/oauth/logout'?Response.json({code:'session_refresh_required'},{status:401}):Response.json({signed_in:true,enrolled:true,grants:[]})};
 vm.createContext(ctx);vm.runInContext(consentPage('review-nonce').match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)![1],ctx);await new Promise(r=>setImmediate(r));elements.get('logout').onclick();await new Promise(r=>setImmediate(r));assert.equal(nested,false);
});
test('independent: transient callback handoff retries retained in-memory pair without another email',async()=>{
 const elements=new Map<string,any>();let sessions=0,starts=0;const location={search:'',hash:'#access_token=constructed&refresh_token=constructed',pathname:'/oauth/consent'};
 const ctx:any={URLSearchParams,location,history:{replaceState(){location.hash='';}},document:{querySelectorAll:()=>[],getElementById(id:string){if(!elements.has(id))elements.set(id,{hidden:true,replaceChildren(){}});return elements.get(id);}},navigator:{locks:{request:async(_name:string,fn:()=>Promise<unknown>)=>fn()}},fetch:async(url:string)=>{if(url==='/oauth/session'){sessions++;return Response.json(sessions===1?{message:'temporary session outage'}:{signed_in:true},{status:sessions===1?503:200});}if(url==='/oauth/start')starts++;return Response.json({signed_in:true,enrolled:true,grants:[]});}};
 vm.createContext(ctx);vm.runInContext(consentPage('review-nonce').match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)![1],ctx);await new Promise(r=>setImmediate(r));assert.equal(location.hash,'');assert.equal(elements.get('retry-session').hidden,false);assert.equal(sessions,1);elements.get('retry-session').onclick();await new Promise(r=>setImmediate(r));assert.equal(sessions,2);assert.equal(starts,0);assert.equal(elements.get('login').hidden,true);
});
test('independent: exact terminal refresh rejection offers typed recovery without erasing newer cookies',async()=>{
 for(const code of ['refresh_token_not_found','refresh_token_already_used','session_not_found']){
  const request=new Request(origin+'/oauth/refresh',{method:'POST',headers:{origin,'content-type':'application/json',cookie:'__Host-ecb_access='+jwt({exp:0})+'; __Host-ecb_refresh=constructed'},body:'{}'});
  const authClient={auth:{refreshSession:async()=>({data:{session:null,user:null},error:{status:400,code,message:'sensitive provider detail'}})}} as never;
  const response=await handleConsent(request,{authClient});assert.equal(response.status,401);assert.equal(response.headers.get('set-cookie'),null);assert.equal((await response.json()).code,'session_reauthentication_required');
 }
});
test('independent: terminal refresh rechecks cookies before offering reauthentication and preserves outage disposition',async()=>{
 for(const outcome of ['fresh','expired','outage']){
  let checks=0,work=0;const fetch:any=async(url:string)=>{if(url==='/oauth/context'){checks++;if(checks===2&&outcome==='fresh')return Response.json({signed_in:true});if(checks===2&&outcome==='outage')return Response.json({code:'session_check_unavailable'},{status:503});return Response.json({code:'session_refresh_required'},{status:401});}if(url==='/oauth/refresh')return Response.json({code:'session_reauthentication_required'},{status:401});if(checks===2&&outcome==='fresh'){work++;return Response.json({ok:true});}return Response.json({error:'session_refresh_required'},{status:401});};
  const call=runner(fetch,{request:(_n:string,fn:()=>unknown)=>fn()})('/api/personal');
  if(outcome==='fresh'){assert.equal((await call).status,200);assert.equal(work,1);}else await assert.rejects(call,(error:any)=>outcome==='expired'?error.code==='session_reauthentication_required':error.code===undefined&&/temporarily unavailable/.test(error.message));
  assert.equal(checks,2);
 }
});
test('independent: terminal recovery exposes existing sign-in control without sending email in either human surface',async()=>{
 const expired=req(jwt({exp:0}));const privatePage=await handlePersonalApp(new Request(origin+'/api/personal',{headers:expired.headers}),{} as never);const pages=[consentPage('review-nonce'),await privatePage.text()];
 for(let index=0;index<pages.length;index++){
  const elements=new Map<string,any>();let starts=0;const ctx:any={URLSearchParams,location:{search:'',hash:'',pathname:index?'/api/personal':'/oauth/consent',reload(){throw Error('must not reload terminal session');}},history:{replaceState(){}},document:{querySelectorAll:()=>[],getElementById(id:string){if(!elements.has(id))elements.set(id,{hidden:true});return elements.get(id);}},navigator:{locks:{request:async(_name:string,fn:()=>Promise<unknown>)=>fn()}},fetch:async(url:string)=>{if(url==='/oauth/start')starts++;return url==='/oauth/refresh'?Response.json({code:'session_reauthentication_required'},{status:401}):Response.json({code:'session_refresh_required'},{status:401});}};
  vm.createContext(ctx);vm.runInContext(pages[index].match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)![1],ctx);await new Promise(r=>setImmediate(r));assert.equal(elements.get(index?'session-signin':'login').hidden,false);assert.equal(starts,0);
 }
});
