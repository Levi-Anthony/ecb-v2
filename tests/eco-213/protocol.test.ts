import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import test from 'node:test';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import app from '../../server.ts';
import {contracts} from '../../server/circulation/tools.js';
const credentials={recover:'constructed-cold-recovery',preserve:'constructed-cold-preservation',transition:'constructed-cold-transition'};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
process.env.ECB_BRAIN_KEY_SHA256=sha('constructed-compatibility');process.env.ECB_ORDINARY_DB_KEY='constructed-ordinary-db-key';
process.env.ECB_CIRCULATION_ENABLED='true';
process.env.ECB_MCP_CAPABILITY_GRANTS=JSON.stringify(Object.entries(credentials).map(([client_id,token])=>({key_sha256:sha(token),client_id,capabilities:[client_id]})));
async function use(mode:'modern'|'legacy',token:string,callback:(c:Client)=>Promise<void>){
 const transport=new StreamableHTTPClientTransport(new URL('http://localhost/mcp'),{fetch:async(url,init)=>app.fetch(new Request(url,{
 ...init,headers:{...Object.fromEntries(new Headers(init?.headers)),host:'localhost',authorization:`Bearer ${token}`}}))});
 const c=new Client({name:'constructed-cold-worker',version:'1'},mode==='modern'?{versionNegotiation:{mode:{pin:'2026-07-28'}}}:{});
 try{await c.connect(transport);await callback(c);}finally{await c.close();}
}
for(const mode of ['modern','legacy'] as const)test(`${mode}: new operations gate capabilities before validation/dispatch`,async()=>{
 const saved=globalThis.fetch;let dispatched=0;globalThis.fetch=async()=>{dispatched++;return Response.json({error:'fixture should not dispatch'});};
 try{for(const [capability,token]of Object.entries(credentials))await use(mode,token,async c=>{
  const catalog=(await c.listTools()).tools;assert.ok(Object.keys(contracts).every(name=>catalog.some(t=>t.name===name)));
  for(const [name,contract]of Object.entries(contracts)){if(contract.capability===capability)continue;
   await assert.rejects(()=>c.callTool({name,arguments:{work_id:'wrong',referent_id:'wrong'}}),/403|insufficient[_ ]scope/i);}
 });assert.equal(dispatched,0);}finally{globalThis.fetch=saved;}
});
test('cold discovery returns executable schemas and verified actor without transition authority',async()=>{
 const saved=globalThis.fetch;const calls:any[]=[];
 globalThis.fetch=async(input,init)=>{calls.push(JSON.parse(String(init?.body)));return Response.json({
 work:[{id:randomUUID(),epoch:'constructed',return_route:'constructed test output'}],remits:[{enabled:false}],liveness:{observation_basis:'UNKNOWN'}});};
 try{await use('modern',credentials.recover,async c=>{
  const r=await c.callTool({name:'discover_capability',arguments:{}});const recovered=JSON.parse((r.content as any[])[0].text);
  assert.equal(calls[0].p_actor,'recover');assert.equal(calls[0].p_operation,'discover_capability');
  assert.ok(recovered.operation_contracts.request_processing.input_schema.properties.work.properties.remit_revision_id);
  assert.ok(recovered.operation_contracts.record_derivation.input_schema.properties.bundle.properties.units);
  assert.equal(recovered.liveness.observation_basis,'UNKNOWN');
  await assert.rejects(()=>c.callTool({name:'request_processing',arguments:{}}),/403|insufficient[_ ]scope/i);assert.equal(calls.length,1);
 });}finally{globalThis.fetch=saved;}
});
