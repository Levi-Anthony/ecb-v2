import assert from 'node:assert/strict';
import test from 'node:test';
import {randomUUID} from 'node:crypto';
import {makeCommission,LEGACY_IDS} from '../../scripts/eco-213/commission.js';
import {corpusRequests,assimilate} from '../../scripts/eco-213/assimilate.js';
function fixture(){
 const at=new Date().toISOString();
 const exported={origin:'legacy:lqbrzoicorehwidkdhoi',frozen_at:at,export_basis:{status:'CONSTRUCTED'},
  rows:LEGACY_IDS.map(id=>({id,content:'CONSTRUCTED source',original_content:'different representation',metadata:{},source_id:null,status:'fixture',created_at:at,updated_at:at}))};
 const plan=makeCommission({authority_basis:'CONSTRUCTED fixture',qualified_commit:'0'.repeat(40),code_digest:'0'.repeat(64),
  launch_artifact_id:randomUUID(),requirements_artifact_id:randomUUID(),frozen_export_artifact_id:randomUUID(),actors:['fixture'],worker:'fixture-worker',qualification:{status:'CONSTRUCTED'},issued_at:at},exported);
 const recovery={contract_version:'eco213-v1',work:[{id:plan.ids.corpus_work,remit_revision_id:plan.ids.revision}],
  remits:[{id:plan.ids.revision,enabled:true,expired:false,expires_at:new Date(Date.now()+3600000).toISOString(),allowed_effects:['assimilate'],allowed_sources:[exported.origin],allowed_legacy_ids:LEGACY_IDS}],
  mechanisms:[{id:plan.ids.differentiate,kind:'differentiate',code_digest:'0'.repeat(64)}]};
 return {plan,exported,recovery};
}
test('complete cohort is checked before dispatch and operation identities survive replay',()=>{
 const {plan,exported}=fixture();const first=corpusRequests(plan,exported);
 assert.deepEqual(corpusRequests(plan,structuredClone(exported)),first);
 const changed=structuredClone(exported);changed.rows.at(-1)!.content='changed';
 assert.throws(()=>corpusRequests(plan,changed),/manifest/);
 const collided=structuredClone(plan);collided.corpus_operations[LEGACY_IDS[1]]=collided.corpus_operations[LEGACY_IDS[0]];
 collided.manifest.items[1].operation_id=collided.corpus_operations[LEGACY_IDS[0]];
 assert.throws(()=>corpusRequests(collided,exported),/identity/);
});
test('inactive recovered remit denies import even when a local plan exists',async()=>{
 const {plan,exported,recovery}=fixture();recovery.remits[0].enabled=false;const calls:string[]=[];
 await assert.rejects(()=>assimilate(plan,exported,async name=>{calls.push(name);return recovery;}),/remit/);
 assert.deepEqual(calls,['recover_work']);
});
test('ambiguous second admission stops batch and preserves exact retry identity',async()=>{
 const {plan,exported,recovery}=fixture();let admitted=0;const sent:any[]=[];
 const report=await assimilate(plan,exported,async(name,payload)=>{
  if(name==='recover_work')return recovery;sent.push(payload);if(++admitted===2)throw new Error('transport lost after unknown commit');
  return {processing:'admitted',source_occurrence_id:randomUUID(),activity_id:randomUUID()};
 });
 assert.equal(report.status,'PARTIAL');assert.equal(report.results[1].status,'OUTCOME_UNKNOWN');
 assert.equal(report.results[1].operation_id,plan.corpus_operations[LEGACY_IDS[1]]);
 assert.equal(sent.length,2);assert.equal(report.remaining.length,6);assert.equal(report.semantic_qualification,'NOT_ESTABLISHED');
 assert.deepEqual(corpusRequests(plan,exported)[1],sent[1]);
});
