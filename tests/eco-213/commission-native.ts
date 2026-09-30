import assert from 'node:assert/strict';
import pg from 'pg';
import {createHash} from 'node:crypto';
import {makeCommission,sourceManifest,LEGACY_IDS} from '../../scripts/eco-213/commission.js';
import {corpusRequests} from '../../scripts/eco-213/assimilate.js';
import {verifyColdRecovery} from './cold-native.js';

const url=process.env.ECO213_TEST_DATABASE_URL;
if(url!=='postgresql://postgres@127.0.0.1:55439/build6')throw new Error('Explicit disposable localhost database required');
const db=new pg.Client({connectionString:url});await db.connect();
try{
 const at=new Date().toISOString(),manifest=await sourceManifest();
 const exported={origin:'legacy:lqbrzoicorehwidkdhoi',frozen_at:at,export_basis:{status:'CONSTRUCTED native qualification'},
  rows:LEGACY_IDS.map(id=>({id,content:'CONSTRUCTED: Jennifer wanted the narrator to call.',original_content:'CONSTRUCTED: desired, not performed.',
   metadata:{standing:'CONSTRUCTED'},source_id:null,status:'fixture',created_at:at,updated_at:at}))};
 async function artifact(content:string){return (await db.query('select ecb_circulation.artifact($1) as id',[content])).rows[0].id;}
 const plan=makeCommission({authority_basis:'CONSTRUCTED native commissioning qualification only',qualified_commit:'0'.repeat(40),code_digest:manifest.code_digest,
  launch_artifact_id:await artifact('CONSTRUCTED launch; no live authority'),requirements_artifact_id:await artifact('CONSTRUCTED requirements'),
  frozen_export_artifact_id:await artifact(JSON.stringify(exported)),actors:['commission-native-fixture'],worker:'commission-native-worker',
  qualification:{standing:'CONSTRUCTED deterministic controls'},issued_at:at},exported);
 await db.query(plan.sql);
 const state=(await db.query('select ecb_circulation.recover($1) as r',[plan.ids.corpus_work])).rows[0].r;
 assert.equal(state.remits.find((r:any)=>r.id===plan.ids.revision).enabled,false);
 const stored=(await db.query('select ecb_circulation.carrier_text(manifest_carrier_id)::jsonb as m from ecb_circulation.corpus_editions where id=$1',[plan.ids.corpus])).rows[0].m;
 assert.deepEqual(stored.items,plan.manifest.items);
 assert.equal(new Set(stored.items.map((i:any)=>i.operation_id)).size,8);
 console.log('PASS rendered commission executes natively; exact source/operation/mechanism editions remain dormant');
 // The preceding native storage suite has commissioned this disposable key.
 // A standalone run may commission it; an unexpected existing key is a failure.
 const runtimeKey='constructed-ordinary-test-key-at-least-32-bytes';
 const runtime=(await db.query("select encode(key_digest,'hex') as digest from ecb11.runtime_capability")).rows[0];
 if(runtime)assert.equal(runtime.digest,createHash('sha256').update(runtimeKey).digest('hex'));
 else await db.query('select public.ecb11_commission_runtime_key($1)',[runtimeKey]);
 await db.query("select set_config('request.headers',$1,false)",[JSON.stringify({'x-ecb-runtime-key':runtimeKey})]);
 const requests=corpusRequests(plan,exported);
 async function importRow(payload:any){return (await db.query('select public.eco213_dispatch($1,$2::jsonb,$3) as r',
  ['assimilate_corpus',JSON.stringify(payload),'commission-native-fixture'])).rows[0].r;}
 await assert.rejects(()=>importRow(requests[0]),/remit_(?:denied|inactive)/);
 await db.query('update ecb_circulation.remit_heads set enabled=true where revision_id=$1',[plan.ids.revision]);
 for(const payload of requests){const first=await importRow(payload),replayed=await importRow(payload);assert.equal(replayed.activity_id,first.activity_id);
  const row=(await db.query('select ecb_circulation.carrier_text(carrier_id) as content,ecb_circulation.carrier_text(original_carrier_id) as original,ecb_circulation.carrier_text(envelope_carrier_id) as envelope from ecb_circulation.source_occurrences where id=$1',[first.source_occurrence_id])).rows[0];
  assert.equal(row.content,payload.envelope.content);assert.equal(row.original,payload.envelope.original_content);assert.equal(row.envelope,payload.envelope_bytes);
 }
 const recovered=(await db.query('select ecb_circulation.recover($1) as r',[plan.ids.corpus_work])).rows[0].r;
 assert.equal(recovered.corpus_coverage.find((c:any)=>c.id===plan.ids.corpus).preserved_items,8);
 assert.equal(recovered.processing.length,8);assert.ok(recovered.processing.every((p:any)=>p.status==='pending'));
 console.log('PASS eight constructed envelopes preserve both representations and exact replay; source admission does not claim assimilation');
 await verifyColdRecovery(runtimeKey,true);
 await db.query('update ecb_circulation.remit_heads set enabled=false where revision_id=$1',[plan.ids.revision]);
 await verifyColdRecovery(runtimeKey,false);
}finally{await db.end();}
