import test from 'node:test';
import assert from 'node:assert/strict';
import { handleConsent } from '../../server/oauth-consent.ts';
import { handlePersonalApp, type PersonalPorts } from '../../server/personal-app.ts';

const origin = 'https://ecb-v2-eight.vercel.app';
const user = { id: 'b149f90b-dfcb-4756-9920-2e92b970734e', email: 'constructed@example.invalid' };
const id = 'b149f90b-dfcb-4756-9920-2e92b970734e';
const token = (exp = Date.now()/1000+3600, extra = {}) => 'eyJhbGciOiJIUzI1NiJ9.' +
  Buffer.from(JSON.stringify({sub:user.id,exp,...extra})).toString('base64url')+'.constructed';
const cookie = (access = token()) => `__Host-ecb_access=${access}; __Host-ecb_refresh=constructed-refresh`;
function req(path: string, method = 'GET', body?: unknown, access = token(), requestOrigin = origin) {
  return new Request(origin+path, { method, headers: { cookie: cookie(access), ...(method === 'POST' ? {
    origin: requestOrigin, 'content-type':'application/json', 'x-ecos-action':'capture',
  } : {}) }, ...(body === undefined ? {} : {body: JSON.stringify(body)}) });
}
const noPorts = new Proxy({}, {get() {return () => {throw new Error('no work port may run');};}}) as PersonalPorts;

test('expiry reaches safe mobile bootstrap and authenticated actions return refresh-required before ports', async () => {
  const expired = token(0);
  const page = await handlePersonalApp(req('/api/personal','GET',undefined,expired), noPorts);
  assert.equal(page.status,401);
  assert.match(await page.text(),/Restoring your existing browser session|sessionFetch/);
  assert.equal(page.headers.get('set-cookie'),null);
  const capture = await handlePersonalApp(req('/api/personal?action=capture','POST',{
    authorized:true, operation_id:id, content:'Must not execute before refresh',
  },expired),noPorts);
  assert.equal(capture.status,401);
  assert.equal((await capture.json()).error,'session_refresh_required');
});

test('pinned SDK refresh is explicit; ordinary routes bind authenticated bearer and never echo cookies', async () => {
  const original=globalThis.fetch;
  let refreshes=0; const calls:string[]=[]; const fresh=token();
  globalThis.fetch=async (input,init) => {
    const url=String(input); calls.push(url.replace(/\?.*/,''));
    if(url.includes('/auth/v1/token')) {
      refreshes++; assert.match(url,/grant_type=refresh_token/);
      assert.equal(JSON.parse(String(init?.body)).refresh_token,'constructed-refresh');
      return Response.json({access_token:fresh,refresh_token:'rotated-refresh',token_type:'bearer',expires_in:3600,user});
    }
    assert.equal(new Headers(init?.headers).get('authorization'),`Bearer ${fresh}`);
    if(url.endsWith('/auth/v1/user'))return Response.json(user);
    if(url.endsWith('/rpc/ecb218_oauth_context'))return Response.json({enrolled:true,grants:[]});
    throw new Error('unexpected provider path');
  };
  try {
    const refreshed=await handleConsent(req('/oauth/refresh','POST',{},token(0)));
    assert.equal(refreshed.status,200);
    assert.match(refreshed.headers.get('set-cookie')??'',/rotated-refresh/);
    const context=await handleConsent(req('/oauth/context','GET',undefined,fresh));
    assert.equal(context.status,200);assert.equal((await context.json()).enrolled,true);
    assert.equal(context.headers.get('set-cookie'),null);
    const page=await handlePersonalApp(req('/api/personal','GET',undefined,fresh),noPorts);
    assert.equal(page.status,200);assert.equal(page.headers.get('set-cookie'),null);
    assert.equal(refreshes,1); assert.equal(calls.filter(x=>x.endsWith('/auth/v1/user')).length,2);
  } finally {globalThis.fetch=original;}
});

test('delayed refresh rejection never clears a newer pair and never exposes provider internals', async () => {
  const fake={auth:{refreshSession:async()=>({data:{session:null,user:null},error:{status:400,code:'refresh_token_already_used',message:'sensitive-provider-detail'}})}} as never;
  const response=await handleConsent(req('/oauth/refresh','POST',{},token(0)),{authClient:fake});
  assert.equal(response.status,401);assert.equal(response.headers.get('set-cookie'),null);
  assert.doesNotMatch(await response.text(),/sensitive-provider-detail|refresh_token_already_used/);
});

test('existing Principal enrollment is enforced with the real authorization path before work ports', async () => {
  for(const [context,error,status] of [[{enrolled:false},null,403],[null,{message:'unavailable'},503]] as const) {
    const fake={auth:{getUser:async()=>({data:{user},error:null})},rpc:async()=>({data:context,error})} as never;
    const response=await handlePersonalApp(req('/api/personal?action=load'),noPorts,{authClient:fake});
    assert.equal(response.status,status);assert.equal(response.headers.get('set-cookie'),null);
  }
});

test('consent, approve, deny and revoke use existing provider bearer without implicit SDK refresh', async () => {
  const original=globalThis.fetch; const access=token(); const callback='https://claude.ai/api/mcp/auth_callback';
  const seen:string[]=[];
  globalThis.fetch=async(input,init)=>{
    const url=String(input);seen.push((init?.method??'GET')+' '+url.split('/auth/v1/').pop());
    assert.equal(new Headers(init?.headers).get('authorization'),`Bearer ${access}`);
    if(url.endsWith('/auth/v1/user'))return Response.json(user);
    if(url.endsWith('/rpc/ecb218_oauth_context'))return Response.json({enrolled:true,grants:[]});
    if(url.endsWith('/rpc/ecb218_oauth_authorization_context'))return Response.json({redirect_uri:callback,consumer:'claude',capability_ceiling:['recover']});
    if(url.endsWith('/rpc/ecb218_oauth_approve')||url.endsWith('/rpc/ecb218_oauth_revoke'))return Response.json(null);
    if(url.endsWith('/oauth/authorizations/review-id'))return Response.json({redirect_uri:callback,user,client:{client_name:'Constructed'},scope:'openid'});
    if(url.endsWith('/oauth/authorizations/review-id/consent')) {
      assert.ok(['approve','deny'].includes(JSON.parse(String(init?.body)).action));
      return Response.json({redirect_url:callback+'?code=constructed'});
    }
    if(url.includes('/user/oauth/grants?client_id=')){assert.equal(init?.method,'DELETE');return new Response(null,{status:204});}
    throw new Error('implicit refresh or unrecognized path');
  };
  try {
    const context=await handleConsent(req('/oauth/context?authorization_id=review-id','GET',undefined,access));
    assert.equal(context.status,200);assert.equal((await context.json()).consumer,'claude');
    for(const action of ['approve','deny']) {
      const response=await handleConsent(req('/oauth/decision','POST',{authorization_id:'review-id',action,capabilities:['recover']},access));
      assert.equal(response.status,200);assert.match((await response.json()).redirect_url,/claude.ai/);
      assert.equal(response.headers.get('set-cookie'),null);
    }
    const revoke=await handleConsent(req('/oauth/revoke','POST',{client_id:id},access));
    assert.deepEqual(await revoke.json(),{revoked:true,native_revocation_pending:false});
    assert.equal(seen.some(x=>x.includes('token?')),false);
  } finally {globalThis.fetch=original;}
});

test('explicit logout clears expired pair without refresh and reports failed native revocation',async()=>{
  const fake={auth:{admin:{signOut:async()=>({error:{status:503}})},refreshSession:()=>{throw Error('must not refresh for logout');}}} as never;
  const response=await handleConsent(req('/oauth/logout','POST',{},token(0)),{authClient:fake});
  assert.equal(response.status,200);assert.match(response.headers.get('set-cookie')??'',/Max-Age=0/);
  assert.deepEqual(await response.json(),{signed_out:true,native_revocation_pending:true});
});

test('cross-origin refresh cannot rotate and OAuth or mismatched subjects cannot become a first-party session',async()=>{
  let calls=0;
  const fake={auth:{refreshSession:async()=>{calls++;return {data:{session:{access_token:token(undefined,{client_id:'third-party'}),refresh_token:'other'},user},error:null};}}} as never;
  const csrf=await handleConsent(req('/oauth/refresh','POST',{},token(0),'https://attacker.invalid'),{authClient:fake});
  assert.equal(csrf.status,403);assert.equal(calls,0);
  const inputOAuth=await handleConsent(req('/oauth/refresh','POST',{},token(0,{client_id:'third-party'})),{authClient:fake});
  assert.equal(inputOAuth.status,401);assert.equal(calls,0);
  const outputOAuth=await handleConsent(req('/oauth/refresh','POST',{},token(0)),{authClient:fake});
  assert.equal(outputOAuth.status,401);assert.equal(outputOAuth.headers.get('set-cookie'),null);
  const mismatch={auth:{refreshSession:async()=>({data:{session:{access_token:token(),refresh_token:'other'},user:{id:'different-user'}},error:null})}} as never;
  assert.equal((await handleConsent(req('/oauth/refresh','POST',{},token(0)),{authClient:mismatch})).status,401);
});
