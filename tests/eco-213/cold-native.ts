import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import pg from 'pg';

// The ordinary server and client communicate over real loopback HTTP. Only the
// PostgREST adapter is replaced; it executes the actual guarded SQL as role anon.
export async function verifyColdRecovery(runtimeKey:string,enabled:boolean){
 const url=process.env.ECO213_TEST_DATABASE_URL;
 if(url!=='postgresql://postgres@127.0.0.1:55439/build6')throw new Error('Explicit disposable localhost database required');
 const db=new pg.Client({connectionString:url});await db.connect();
 const savedFetch=globalThis.fetch,variables=['ECB_BRAIN_KEY_SHA256','ECB_ORDINARY_DB_KEY','ECB_CIRCULATION_ENABLED','ECB_MCP_CAPABILITY_GRANTS'];
 const savedEnv=Object.fromEntries(variables.map(k=>[k,process.env[k]]));
 const bearer='constructed-fresh-cold-recovery-only';const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
 process.env.ECB_BRAIN_KEY_SHA256=sha('constructed-unused-compatibility');process.env.ECB_ORDINARY_DB_KEY=runtimeKey;
 process.env.ECB_CIRCULATION_ENABLED='true';
 process.env.ECB_MCP_CAPABILITY_GRANTS=JSON.stringify([{key_sha256:sha(bearer),client_id:'commission-native-fixture',capabilities:['recover']}]);
 const dispatched:string[]=[];
 globalThis.fetch=async(input,init)=>{
  assert.equal(String(input),'https://vezxivrvhakclxuvxzso.supabase.co/rest/v1/rpc/eco213_dispatch');
  const headers=new Headers(init?.headers);assert.equal(headers.get('x-ecb-runtime-key'),runtimeKey);
  const p=JSON.parse(String(init?.body));assert.equal(p.p_actor,'commission-native-fixture');dispatched.push(p.p_operation);
  assert.ok(['discover_capability','recover_work','fetch_referent','inspect_processing'].includes(p.p_operation));
  await db.query('begin');
  try{
   await db.query('set local role anon');
   await db.query("select set_config('request.headers',$1,true)",[JSON.stringify({'x-ecb-runtime-key':runtimeKey})]);
   const result=(await db.query('select public.eco213_dispatch($1,$2::jsonb,$3) as r',[p.p_operation,JSON.stringify(p.p_payload),p.p_actor])).rows[0].r;
   await db.query('commit');return Response.json(result);
  }catch(error){await db.query('rollback');throw error;}
 };
 const app=(await import('../../server.ts')).default;
 const server=createServer(async(req,res)=>{
  try{
   const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
   const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v!==undefined)headers.set(k,Array.isArray(v)?v.join(','):v);
   const body=chunks.length?Buffer.concat(chunks):undefined;
   const response=await app.fetch(new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers,body}));
   res.writeHead(response.status,Object.fromEntries(response.headers));
   if(response.body)Readable.fromWeb(response.body as any).pipe(res);else res.end();
  }catch{res.writeHead(500);res.end('constructed server failure');}
 });
 try{
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();assert.ok(address&&typeof address==='object');
  const child=await promisify(execFile)(process.execPath,['--import','tsx','tests/eco-213/cold-participant.ts'],{
   cwd:process.cwd(),timeout:30000,maxBuffer:128*1024,
   env:{PATH:process.env.PATH,ECO213_COLD_ENDPOINT:`http://127.0.0.1:${address.port}/mcp`,ECO213_COLD_BEARER:bearer,
    ECO213_COLD_EXPECT_ENABLED:String(enabled),ECO213_COLD_CUE:'In ECOS circulation, recover the assimilation capability and continue its permitted work.'},
  });
  const receipt=JSON.parse(child.stdout.trim().split('\n').at(-1)!);assert.equal(receipt.status,'PASS');
  assert.ok(dispatched.includes('recover_work'));assert.ok(!dispatched.includes('assimilate_corpus'));
  console.log(`PASS fresh cold process recovers eight constructed sources through ordinary HTTP and native guarded SQL; remit ${enabled?'active':'disabled'}; transition denied`);
 }finally{
  server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));
  globalThis.fetch=savedFetch;for(const k of variables){if(savedEnv[k]===undefined)delete process.env[k];else process.env[k]=savedEnv[k];}
  await db.end();
 }
}
