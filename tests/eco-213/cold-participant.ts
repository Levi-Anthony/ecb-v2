import assert from 'node:assert/strict';
import {Client,StreamableHTTPClientTransport} from '@modelcontextprotocol/client';
import {recoverCorpusInputs,corpusRequests} from '../../scripts/eco-213/assimilate.js';

// No work, corpus, mechanism or source identifiers are supplied to this process.
// It receives a cue, the loopback ordinary endpoint and a RECOVER-only credential.
const endpoint=process.env.ECO213_COLD_ENDPOINT,bearer=process.env.ECO213_COLD_BEARER;
if(!endpoint||!/^http:\/\/127\.0\.0\.1:\d+\/mcp$/.test(endpoint)||!bearer)throw new Error('disposable cold endpoint required');
const enabled=process.env.ECO213_COLD_EXPECT_ENABLED==='true';
assert.equal(process.env.ECO213_COLD_CUE,'In ECOS circulation, recover the assimilation capability and continue its permitted work.');
const client=new Client({name:'constructed-fresh-cold-participant',version:'1'},{versionNegotiation:{mode:{pin:'2026-07-28'}}});
async function call(name:string,args:Record<string,unknown>){
 const r=await client.callTool({name,arguments:args});assert.ok(!r.isError);
 const block=(r.content as {type:string;text?:string}[]).find(x=>x.type==='text');assert.ok(block?.text);
 return JSON.parse(block.text);
}
try{
 await client.connect(new StreamableHTTPClientTransport(new URL(endpoint),{requestInit:{headers:{authorization:`Bearer ${bearer}`}}}));
 const tools=(await client.listTools()).tools;
 for(const name of ['discover_capability','recover_work','fetch_referent','inspect_processing'])assert.ok(tools.some(t=>t.name===name));
 const discovery=await call('discover_capability',{});
 assert.equal(discovery.cue,process.env.ECO213_COLD_CUE);
 assert.equal(discovery.contract_version,'eco213-v1');assert.ok(discovery.operation_contracts.assimilate_corpus.input_schema);
 const work=discovery.work.find((w:any)=>w.parts?.some((p:any)=>p.role.startsWith('exact frozen source package')));
 assert.ok(work?.id);assert.ok(work.return_route);
 const recovered=await call('recover_work',{work_id:work.id});assert.equal(recovered.work.length,1);
 assert.equal(recovered.work[0].epoch,work.epoch);
 const remit=recovered.remits.find((r:any)=>r.id===work.remit_revision_id);assert.equal(remit.enabled,enabled);
 const sourcePart=work.parts.find((p:any)=>p.role.startsWith('exact frozen source package'));
 const exported=JSON.parse((await call('fetch_referent',{referent_id:sourcePart.constituent_id})).artifact.content);
 assert.equal(exported.rows.length,8);
 let corpus:any,manifest:any;
 for(const c of recovered.corpus_coverage){
  const m=JSON.parse((await call('fetch_referent',{referent_id:c.manifest_carrier_id})).artifact.content);
  if(m.export_artifact_id===sourcePart.constituent_id){corpus=c;manifest=m;break;}
 }
 assert.ok(corpus);assert.equal(corpus.preserved_items,8);assert.equal(manifest.items.length,8);
 const hydrated=await recoverCorpusInputs(call);
 assert.equal(hydrated.plan.ids.corpus_work,work.id);
 assert.deepEqual(corpusRequests(hydrated.plan,hydrated.exported).map(x=>x.operation_id),manifest.items.map((x:any)=>x.operation_id));
 const processing=await call('inspect_processing',{work_id:work.id});assert.equal(processing.processing.length,8);
 assert.ok(processing.processing.every((p:any)=>p.status==='pending'));
 assert.equal(recovered.use_bindings.length,0);
 for(const row of exported.rows){
  const member=corpus.items.find((m:any)=>m.legacy_id===row.id);assert.ok(member);
  const native=await call('fetch_referent',{referent_id:member.source_id});
  const source=native.native_records.find((n:any)=>n.native_type==='source_occurrences').record;
  assert.equal((await call('fetch_referent',{referent_id:source.carrier_id})).artifact.content,row.content);
  assert.equal((await call('fetch_referent',{referent_id:source.original_carrier_id})).artifact.content,row.original_content);
 }
 // Capability discovery is not transition authority, even with a valid request.
 const member=manifest.items[0],row=exported.rows.find((r:any)=>r.id===member.id);
 await assert.rejects(()=>client.callTool({name:'assimilate_corpus',arguments:{operation_id:member.operation_id,
  work_id:work.id,mechanism_id:processing.processing[0].activity.mechanism_id,corpus_id:corpus.id,
  envelope:row,envelope_bytes:JSON.stringify(row),envelope_digest:member.digest}}),/403|insufficient[_ ]scope/i);
 console.log(JSON.stringify({status:'PASS',scope:'constructed fresh-process ordinary HTTP and native SQL recovery',
  source_count:8,enabled_remit:enabled,semantic_qualification:'NOT_ESTABLISHED'}));
}finally{await client.close();}
