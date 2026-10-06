import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import app from '../../server.ts';
import {makeCommission,LEGACY_IDS,sourceManifest} from '../../scripts/eco-213/commission.js';
test('commission binds exact eight envelopes and real mechanism digests while remaining dormant',async()=>{
 const manifest=await sourceManifest();assert.match(manifest.code_digest,/^[0-9a-f]{64}$/);
 const c={authority_basis:'CONSTRUCTED renderer fixture only',qualified_commit:'0'.repeat(40),code_digest:manifest.code_digest,
  launch_artifact_id:randomUUID(),requirements_artifact_id:randomUUID(),frozen_export_artifact_id:randomUUID(),actors:['constructed-cold'],
  worker:'constructed-worker',qualification:{status:'CONSTRUCTED'},issued_at:'2026-09-30T16:00:00.000Z',
  effect_policy:{expires_at:null,max_requests:null,max_input:null,max_output:null,max_usd:null}};
 const exported={origin:'legacy:lqbrzoicorehwidkdhoi',frozen_at:c.issued_at,export_basis:{status:'CONSTRUCTED'},
  rows:LEGACY_IDS.map(id=>({id,content:'CONSTRUCTED carrier',original_content:null,metadata:{},source_id:null,status:'fixture',created_at:c.issued_at,updated_at:c.issued_at}))};
 const p=makeCommission(c,exported);assert.equal(p.manifest.items.length,8);assert.equal(p.host_bindings.ECB_CIRCULATION_ENABLED,'false');
 assert.ok(p.sql.includes(",NULL,\n NULL,NULL,NULL,NULL);"));assert.ok(p.sql.includes('false'));assert.ok(!p.sql.includes('vault.decrypted_secrets'));
 assert.ok(!p.sql.includes('100,16000,4000,2'));
 assert.ok(p.missing_custody.includes('worker credential hash'));
 assert.throws(()=>makeCommission(c,{...exported,rows:exported.rows.slice(1)}),/cohort/);
 assert.throws(()=>makeCommission(c,{...exported,rows:exported.rows.map((r,i)=>i===0?{...r,id:randomUUID()}:r)}),/envelope/);
 // Consume the renderer's bindings through the real ordinary capture adapter.
 // A naming mismatch must fail here before any host or native commissioning.
 const token='constructed-commission-compatibility';
 const bindings={...p.host_bindings,ECB_CIRCULATION_ENABLED:'true',
  ECB_BRAIN_KEY_SHA256:createHash('sha256').update(token).digest('hex'),ECB_ORDINARY_DB_KEY:'constructed-database-key'};
 const names=[...Object.keys(bindings),'ECB_MCP_CAPABILITY_GRANTS'];
 const prior=names.map(name=>process.env[name]);const savedFetch=globalThis.fetch;let dispatched=0;
 const client=new Client({name:'constructed-commission-consumer',version:'1'});
 try {
  Object.assign(process.env,bindings);delete process.env.ECB_MCP_CAPABILITY_GRANTS;
  globalThis.fetch=async(_url,init)=>{
   const body=JSON.parse(String(init?.body));
   assert.equal(body.p_operation,'trusted_capture');assert.equal(body.p_payload.work_id,p.ids.capture_work);
   assert.equal(body.p_payload.mechanism_id,p.ids.differentiate);dispatched++;
   return new Response('eco213_constructed_stop',{status:503});
  };
  const transport=new StreamableHTTPClientTransport(new URL('http://localhost/mcp'),{fetch:async(url,init)=>app.fetch(new Request(url,{
   ...init,headers:{...Object.fromEntries(new Headers(init?.headers)),host:'localhost',authorization:`Bearer ${token}`}}))});
  await client.connect(transport);
  const stopped=await client.callTool({name:'capture_thought',arguments:{operation_id:randomUUID(),content:'CONSTRUCTED binding probe',source:'constructed'}});
  assert.equal(stopped.isError,true);assert.equal(dispatched,1);
 } finally {
  await client.close();globalThis.fetch=savedFetch;
  names.forEach((name,i)=>{if(prior[i]===undefined)delete process.env[name];else process.env[name]=prior[i];});
 }
});

test('commission carries explicitly owned effect controls without universal phantom ceilings', async () => {
  const manifest=await sourceManifest();
  const issued='2026-10-05T18:00:00.000Z';
  const c={authority_basis:'CONSTRUCTED explicit effect policy',qualified_commit:'0'.repeat(40),code_digest:manifest.code_digest,
    launch_artifact_id:randomUUID(),requirements_artifact_id:randomUUID(),frozen_export_artifact_id:randomUUID(),actors:['constructed-cold'],
    worker:'constructed-worker',qualification:{status:'CONSTRUCTED'},issued_at:issued,
    effect_policy:{expires_at:'2026-10-08T18:00:00.000Z',max_requests:321,max_input:64000,max_output:8192,max_usd:25}};
  const exported={origin:'legacy:lqbrzoicorehwidkdhoi',frozen_at:issued,export_basis:{status:'CONSTRUCTED'},
    rows:LEGACY_IDS.map(id=>({id,content:'CONSTRUCTED carrier',original_content:null,metadata:{},source_id:null,status:'fixture',created_at:issued,updated_at:issued}))};
  const p=makeCommission(c,exported);
  assert.ok(p.sql.includes('321,64000,8192,25'));
  assert.ok(p.sql.includes('2026-10-08T18:00:00.000Z'));
});
