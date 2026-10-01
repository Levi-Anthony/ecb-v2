import assert from 'node:assert/strict';
import test from 'node:test';
import {randomUUID} from 'node:crypto';
import {makeCommission,LEGACY_IDS} from '../../scripts/eco-213/commission.js';
import {corpusRequests,assimilate,recoverCorpusInputs} from '../../scripts/eco-213/assimilate.js';
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
function nativeRecoveryFixture(){
 const f=fixture(),receiptId=randomUUID(),manifestId=randomUUID();
 const receipt={type:'eco213-native-dormant-commission-v3',corpus_work_id:f.plan.ids.corpus_work,revision_id:f.plan.ids.revision,
  corpus_id:f.plan.ids.corpus,mechanisms:{differentiate:f.plan.ids.differentiate},host_bindings:f.plan.host_bindings,
  compiled_source_manifest:{code_digest:f.plan.host_bindings.ECB_CIRCULATION_CODE_DIGEST}};
 const work={...f.recovery.work[0],parts:[{constituent_id:receiptId,role:'prepared circulation commission; selection must be explicitly revalidated'},
  {constituent_id:f.plan.manifest.export_artifact_id,role:'exact frozen source package; preservation is not semantic qualification'}]};
 const discovery={...f.recovery,work:[work],corpus_coverage:[{id:f.plan.ids.corpus,manifest_carrier_id:manifestId}]};
 const artifacts=new Map([[receiptId,receipt],[manifestId,f.plan.manifest],[f.plan.manifest.export_artifact_id,f.exported]] as [string,unknown][]);
 const calls:string[]=[];
 const call=async(name:string,args:Record<string,unknown>)=>{calls.push(name);
  if(name==='discover_capability')return discovery;
  if(name==='fetch_referent')return {artifact:{content:JSON.stringify(artifacts.get(String(args.referent_id)))}};
  throw new Error('read-only recovery must not dispatch an effect');};
 return {...f,receiptId,receipt,work,discovery,artifacts,calls,call};
}
test('cold native recovery hydrates the prepared edition and stable operations without source identifiers handed in',async()=>{
 const f=nativeRecoveryFixture();const recovered=await recoverCorpusInputs(f.call);
 assert.deepEqual(corpusRequests(recovered.plan,recovered.exported),corpusRequests(f.plan,f.exported));
 assert.ok(f.calls.every(name=>['discover_capability','fetch_referent'].includes(name)));
 f.receipt.compiled_source_manifest.code_digest='1'.repeat(64);
 await assert.rejects(()=>recoverCorpusInputs(f.call),/edition_mismatch/);
});
test('two prepared selections are visible ambiguity rather than a newest-edition choice',async()=>{
 const f=nativeRecoveryFixture(),other=randomUUID();f.artifacts.set(other,{...f.receipt});
 f.work.parts.push({constituent_id:other,role:'prepared circulation commission; selection must be explicitly revalidated'});
 await assert.rejects(()=>recoverCorpusInputs(f.call),/ambiguous/);
 assert.ok(!f.calls.includes('assimilate_corpus'));
});

test('explicit prepared-receipt succession selects a terminal edition while forks and cycles block',async()=>{
 const f=nativeRecoveryFixture(),next=randomUUID();
 f.artifacts.set(next,{...f.receipt,supersedes_receipt_artifact:f.receiptId});
 f.work.parts.push({constituent_id:next,role:'prepared circulation commission; selection must be explicitly revalidated'});
 assert.equal((await recoverCorpusInputs(f.call)).plan.ids.corpus_work,f.work.id);
 const fork=randomUUID();f.artifacts.set(fork,{...f.receipt,supersedes_receipt_artifact:f.receiptId});
 f.work.parts.push({constituent_id:fork,role:'prepared circulation commission; selection must be explicitly revalidated'});
 await assert.rejects(()=>recoverCorpusInputs(f.call),/ambiguous/);
 f.work.parts.pop();f.receipt.supersedes_receipt_artifact=next;
 await assert.rejects(()=>recoverCorpusInputs(f.call),/ambiguous/);
});
