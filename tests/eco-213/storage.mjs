import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import pg from 'pg';
const supplemental = Boolean(globalThis.eco213TestClient);
const url = process.env.ECO213_TEST_DATABASE_URL;
if (!supplemental && !/^postgresql:\/\/postgres@127\.0\.0\.1:55439\/build6$/.test(url ?? '')) throw new Error('Explicit disposable localhost database required');
const client = globalThis.eco213TestClient ?? new pg.Client({ connectionString: url });
await client.connect();
const query = (sql, args) => client.query(sql, args);
const rows = async (sql, args) => (await query(sql, args)).rows;
const one = async (sql, args) => (await rows(sql, args))[0];
const sha = text => createHash('sha256').update(text).digest('hex');
const key = 'constructed-ordinary-test-key-at-least-32-bytes';
const workerKey = 'constructed-worker-test-key-at-least-32-bytes';
const headers = { 'x-ecb-runtime-key': key, 'x-eco213-worker-key': workerKey };
const actor = 'constructed-producer', executor = 'constructed-worker';
let passed = 0;
async function check(name, run) { await run(); passed++; console.log(`PASS ${name}`); }
async function rejects(fn, code) { await assert.rejects(fn, error => error.message.includes(code)); }
async function dispatch(op, payload, who = actor) { return (await one('select public.eco213_dispatch($1,$2::jsonb,$3) as result', [op, JSON.stringify(payload), who])).result; }
async function artifact(content) { return (await one('select ecb_circulation.artifact($1) as id', [content])).id; }
async function lease() { return (await one('select public.eco213_lease() as result')).result; }
async function finish(l, bundle) { return (await one('select public.eco213_finish($1,$2,$3::jsonb,$4::jsonb) as result', [l.attempt_id,l.fence,JSON.stringify(bundle),JSON.stringify({ provider: 'CONSTRUCTED', raw_output: JSON.stringify(bundle) })])).result; }
async function reserve(l, usd = 0.01) { return (await one('select public.eco213_reserve($1,$2,$3,1000,4000,$4::jsonb) as result',[l.attempt_id,l.fence,usd,JSON.stringify({model:'constructed-model',source:'fixture'})])).result; }
const ids = Object.fromEntries(['remit','revision','work','differentiate','assess','compose','embed','corpus','legacy'].map(x => [x,randomUUID()]));
try {
  await query('select public.ecb11_commission_runtime_key($1)',[key]);
  await query("select set_config('request.headers',$1,false)",[JSON.stringify(headers)]);
  const focal = await artifact('CONSTRUCTED: qualification of circulation, not a live source.');
  await query('insert into ecb_circulation.service_remits(id,label,authority_basis) values($1,$2,$3)',[ids.remit,'constructed test remit','disposable test only']);
  await query(`insert into ecb_circulation.remit_revisions(id,remit_id,authority_basis,allowed_actors,allowed_sources,allowed_legacy_ids,allowed_effects,expires_at,max_requests,max_input,max_output,max_usd)
    values($1,$2,'constructed test authority',$3,$4,$5,$6,clock_timestamp()+interval '1 hour',100,16000,4000,2)`,[ids.revision,ids.remit,[actor,executor],['native:capture','legacy:lqbrzoicorehwidkdhoi'],[ids.legacy],['capture','process','execute','assimilate','preserve_output','reconcile','observe']]);
  await query('insert into ecb_circulation.remit_heads(remit_id,revision_id,enabled) values($1,$2,true)',[ids.remit,ids.revision]);
  for (const kind of ['differentiate','assess','compose','embed']) {
    const config = kind==='differentiate'?{assessment_mechanism_id:ids.assess}:kind==='assess'?{composition_mechanism_id:ids.compose}:{};
    await query('insert into ecb_circulation.mechanism_editions(id,kind,code_digest,prompt_digest,schema_digest,model,config,qualification) values($1,$2,$3,$3,$3,$4,$5::jsonb,$6::jsonb)',[ids[kind],kind,'0'.repeat(64),'constructed-model',JSON.stringify(config),JSON.stringify({status:'CONSTRUCTED',limit:'no semantic adequacy'})]);
  }
  await query(`insert into ecb_circulation.work_accounts(id,focal_id,remit_revision_id,point_of_view,noticed_contrast,boundary,orientation,frame,question,intended_use,process_coordinate,return_route,created_by)
    values($1,$2,$3,'test executor','cold recovery versus lost work','one disposable source','retain desired/performed distinctions','constructed fixture','What was desired?','qualify storage controls','{"phase":"Move","fixture":true}','test output',$4)`,[ids.work,focal,ids.revision,actor]);
  await query('insert into ecb_circulation.execution_credentials(worker,key_digest,remit_revision_id,enabled) values($1,extensions.digest(convert_to($2,\'UTF8\'),\'sha256\'),$3,true)',[executor,workerKey,ids.revision]);
  const input={operation_id:randomUUID(),work_id:ids.work,mechanism_id:ids.differentiate,content:'Jennifer wanted me to call her back.',source:'constructed-control',captured_at:'2026-09-30T12:00:00Z'};
  let captured;
  await check('atomic exact custody and logged dispatch admission',async()=>{
    captured=await dispatch('trusted_capture',input);
    assert.equal(captured.capture.content,input.content);assert.equal(captured.processing.admission,'committed');
    assert.equal((await one('select count(*)::int as n from pgmq.q_eco213')).n,1);
    assert.equal((await one("select relpersistence from pg_class where oid='pgmq.q_eco213'::regclass")).relpersistence,'p');
  });
  await check('identical capture replays without duplicate queue admission',async()=>{
    const replay=await dispatch('trusted_capture',input);assert.equal(replay.capture.thought_id,captured.capture.thought_id);
    assert.equal(replay.processing.activity_id,captured.processing.activity_id);assert.equal((await one('select count(*)::int as n from pgmq.q_eco213')).n,1);
  });
  await check('changed payload reuse conflicts',()=>rejects(()=>dispatch('trusted_capture',{...input,content:'changed'}),'operation_conflict'));
  await check('wrong actor rejected before custody',()=>rejects(()=>dispatch('trusted_capture',{...input,operation_id:randomUUID()},'not-authorized'),'remit_denied'));
  await check('failed processing admission rolls back source capture',async()=>{
    const bad={...input,operation_id:randomUUID(),mechanism_id:ids.compose};
    await rejects(()=>dispatch('trusted_capture',bad),'capture_mechanism_mismatch');
    assert.equal((await one('select count(*)::int as n from public.ordinary_operations where id=$1',[bad.operation_id])).n,0);
  });
  await check('immutable source/native identity and no ordinary table access',async()=>{
    await rejects(()=>query('update ecb_circulation.source_occurrences set edition=\'changed\' where id=$1',[captured.source_occurrence_id]),'immutable');
    await query('set role anon');try{await rejects(()=>query('select * from ecb_circulation.source_occurrences'),'permission denied');}finally{await query('reset role');}
    assert.ok((await one('select count(*)::int as n from public.referents where id=$1',[captured.source_occurrence_id])).n===1);
  });
  await check('cold contract recovery exposes current seat, work and unknown observer basis',async()=>{
    const r=await dispatch('recover_work',{work_id:ids.work});assert.equal(r.work[0].focal_id,focal);assert.equal(r.processing[0].status,'pending');assert.equal(r.liveness.observation_basis,'UNKNOWN');
    assert.ok(r.access.TRANSITION.includes('request_processing'));assert.ok(r.work[0].epoch);
  });
  let l;
  await check('worker key is distinct and missing key denies lease',async()=>{
    await query("select set_config('request.headers',$1,false)",[JSON.stringify({'x-ecb-runtime-key':key})]);
    await rejects(()=>lease(),'worker_unauthorized');await query("select set_config('request.headers',$1,false)",[JSON.stringify(headers)]);
  });
  await check('lease persists attempt, scope, source and advancing fence',async()=>{l=await lease();assert.equal(l.status,'leased');assert.equal(l.fence,1);assert.equal(l.source.text,input.content);assert.equal(l.work.id,ids.work);});
  await check('budget reservation is single-use; changed retry conflicts',async()=>{
    assert.equal((await reserve(l)).dispatch_permitted,true);assert.equal((await reserve(l)).dispatch_permitted,false);
    await rejects(()=>reserve(l,3),'reservation_conflict');
  });
  const unitBundle={resolution:'one reported desire with participant coupling',context:{question:'What was desired?',scope:'quoted report',limitations:[]},
    units:[{handle:'desire',text:'Jennifer wanted the narrator to call her back.',subject_id:null,subject_status:'UNKNOWN',modality:'desired',polarity:'positive',attribution:'narrator',conditions:[],
      participants:[{role:'desiring person',mention:'Jennifer',subject_id:null,identity_status:'UNKNOWN'},{role:'requested caller',mention:'me',subject_id:null,identity_status:'UNKNOWN'}],
      anchors:[{carrier_id:l.source.carrier_id,byte_start:0,byte_end:Buffer.byteLength(input.content),excerpt:input.content}]}],
    relations:[],omissions:[],losses:[],questions:[],repairs_output_id:null,repair_reason:null};
  await check('invalid byte anchor rolls back all semantic outputs',async()=>{
    const bad=structuredClone(unitBundle);bad.units[0].anchors[0].byte_start=1;
    await rejects(()=>finish(l,bad),'anchor_mismatch');assert.equal((await one('select count(*)::int as n from ecb_circulation.activity_outputs')).n,0);
  });
  let output;
  await check('participants, modality, unassessed Claim, lexical activation and separate assessment',async()=>{
    output=await finish(l,unitBundle);assert.ok(output.decomposition_id);
    assert.equal((await one('select count(*)::int as n from ecb_circulation.unit_participants')).n,2);
    assert.equal((await one('select modality from ecb_circulation.semantic_units')).modality,'desired');
    assert.equal((await one('select c.epistemic_standing from public.claims c join ecb_circulation.claim_contexts cc on cc.claim_id=c.id')).epistemic_standing,'unassessed');
    assert.equal((await one('select count(*)::int as n from ecb_circulation.activities where kind=\'assess\'')).n,1);
  });
  await check('output replay preserves one outcome; changed output conflicts',async()=>{
    assert.equal((await finish(l,unitBundle)).output_id,output.output_id);
    await rejects(()=>finish(l,{...unitBundle,losses:['changed']}),'output_conflict');
  });
  await check('lexical discovery remains usable with declared missing vector coverage',async()=>{
    const r=await dispatch('search_structure',{query:'Jennifer',limit:10});assert.ok(r.results.length>=2);assert.equal(r.coverage.degraded,true);assert.ok(r.coverage.missing_vectors>=2);
  });
  const unit=await one('select * from ecb_circulation.semantic_units');
  const claim=await one('select c.* from public.claims c join ecb_circulation.claim_contexts cc on cc.claim_id=c.id limit 1');
  await check('old Thought digest is unchanged; typed unit evidence includes exact context',async()=>{
    assert.equal((await one("select encode(public.thought_revision_digest('19a949ea-a8fc-4250-a386-fa64e5530180'),'hex') as d")).d,'5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55');
    assert.equal((await one('select evidence_revision_scheme from public.evidence_links where claim_id=$1',[claim.id])).evidence_revision_scheme,'eco213_unit_anchor_v1_sha256');
  });
  await check('expired attempt cannot commit; retry lease advances fence',async()=>{
    const a=await lease();await query("update ecb_circulation.processing_heads set lease_until=clock_timestamp()-interval '1 second' where activity_id=$1",[a.activity.id]);
    await query('select pgmq.set_vt(\'eco213\',(select message_id from ecb_circulation.processing_heads where activity_id=$1),0)',[a.activity.id]);
    await rejects(()=>finish(a,{verdict:'UNKNOWN'}),'stale_fence');
    const resumed=await lease();assert.ok(resumed.fence>a.fence);await rejects(()=>finish(a,{verdict:'UNKNOWN'}),'stale_fence');
    await check('aggregate remit budget denies a new attempt',()=>rejects(()=>reserve(resumed,3),'budget_denied'));
    await reserve(resumed);
    await check('partial semantic coverage cannot certify satisfaction',()=>rejects(()=>finish(resumed,
      {verdict:'SATISFIED',coverage:{participants:'SATISFIED'},findings:[],unresolved:[],limitations:[]}), 'assessment_coverage_missing'));
    await finish(resumed,{verdict:'UNSATISFIED',coverage:{participants:'UNSATISFIED',modality:'UNKNOWN',polarity:'UNKNOWN',conditions:'UNKNOWN',
      attribution:'UNKNOWN',dependencies:'UNKNOWN'},findings:['constructed semantic rejection'],unresolved:['needs repair'],limitations:['constructed']});
    assert.equal((await one('select count(*)::int as n from ecb_circulation.composition_accounts')).n,0);
  });
  let composed;
  const composeArgs={operation_id:randomUUID(),work_id:ids.work,source_id:captured.source_occurrence_id,mechanism_id:ids.compose,
    bundle:{criterion:'reported desire relevant to work question',account:'CONSTRUCTED account of a reported desire, not a performed call.',members:[{referent_id:unit.id,reason:'participant-coupled desire'}],
      old_dependency_review:['review exact source and participant/modality distinctions'],destination_disclosure:['performance evidence remains absent; search beyond old graph required'],unresolved:['no performed call evidence'],reinspection_questions:['What would establish performance?'],
      predecessor_id:null,lineage_relation:null,lineage_reason:null,repairs_output_id:null,repair_reason:null}};
  await check('ordinary composition is native, inspectable and separate from current use',async()=>{
    const result=await dispatch('compose_account',composeArgs);composed=await one('select * from ecb_circulation.composition_accounts where output_id=$1',[result.output_id]);
    const fetched=await dispatch('fetch_referent',{referent_id:composed.id});assert.equal(fetched.native_records[0].record.focal_id,focal);
    assert.equal((await one('select count(*)::int as n from ecb_circulation.use_heads')).n,0);
  });
  const work=(await dispatch('recover_work',{work_id:ids.work})).work[0];
  const requirements=[{requirement:'source and participants',direction:'old_dependency',blocking:true,disposition:'SATISFIED',basis:{kind:'constructed check'}},
    {requirement:'destination disclosure',direction:'destination_discovery',blocking:true,disposition:'SATISFIED',basis:{limit:'declared bounded test only'}}];
  async function dependencies(){return Promise.all([composed.id,unit.id,claim.id].map(async subject_id=>({subject_id,digest:(await one('select ecb_circulation.referent_digest($1) as d',[subject_id])).d,work_epoch:work.epoch,role:'consumed basis'})));}
  const binding={operation_id:randomUUID(),work_id:ids.work,use_key:'constructed-reliance',account_id:composed.id,expected_predecessor_id:null,work_epoch:work.epoch,
    dependencies:await dependencies(),requirements,coverage:{declared_complete:true,limit:'constructed qualification only'},authority_basis:'disposable fixture',checker_basis:{kind:'structural + declared semantic fixture'},verdict:'SATISFIED'};
  await check('blocking UNKNOWN and old-only review cannot pass',async()=>{
    const unknown=structuredClone(binding);unknown.requirements[1].disposition='UNKNOWN';await rejects(()=>dispatch('reconcile_use',unknown),'blocking_requirement');
    await rejects(()=>dispatch('reconcile_use',{...binding,requirements:[requirements[0]]}),'two_sided_review_required');
  });
  await check('mixed epoch and stale digest are rejected',async()=>{
    await rejects(()=>dispatch('reconcile_use',{...binding,work_epoch:'wrong'}),'mixed_epoch');
    const stale=structuredClone(binding);stale.dependencies[0].digest='0'.repeat(64);await rejects(()=>dispatch('reconcile_use',stale),'dependency_basis_stale');
  });
  let assessment;
  await check('exact use binding is current; replay and predecessor conflict discriminate',async()=>{
    assessment=await dispatch('reconcile_use',binding);assert.equal((await dispatch('reconcile_use',binding)).assessment_id,assessment.assessment_id);
    assert.equal((await dispatch('recover_work',{work_id:ids.work})).use_bindings[0].basis_current,true);
    await rejects(()=>dispatch('reconcile_use',{...binding,operation_id:randomUUID()}),'use_predecessor_conflict');
  });
  await check('same standing with changed evidence history invalidates reliance and vector coverage',async()=>{
    const lexical=await one('select * from ecb_circulation.semantic_representations where subject_id=$1 limit 1',[claim.id]);
    const vector=Array.from({length:384},(_,i)=>i===0?1:0);
    await query(`insert into ecb_circulation.semantic_representations(subject_id,work_id,basis_digest,edition,content,vector,model)
      values($1,$2,$3,$4,$5,$6::extensions.vector,'gte-small')`,[claim.id,ids.work,lexical.basis_digest,'constructed-vector',lexical.content,JSON.stringify(vector)]);
    const before=(await dispatch('search_structure',{query:'Jennifer',work_id:ids.work,query_embedding:vector})).coverage.represented_subjects;
    assert.ok(before>=1);
    const evidence=await artifact('CONSTRUCTED additional evidence history; no standing transition.');await query('insert into public.evidence_links(claim_id,evidence_referent_id) values($1,$2)',[claim.id,evidence]);
    assert.equal((await one('select epistemic_standing from public.claims where id=$1',[claim.id])).epistemic_standing,'unassessed');
    assert.equal((await dispatch('recover_work',{work_id:ids.work})).use_bindings[0].basis_current,false);
    const after=await dispatch('search_structure',{query:'Jennifer',work_id:ids.work,query_embedding:vector});
    assert.equal(after.coverage.represented_subjects,before-1);
    const stale=after.results.find(x=>x.subject_id===claim.id);assert.equal(stale.basis_current,false);assert.equal(stale.semantic_similarity,null);
  });
  await check('alternative composition keeps focal identity and explicit lineage',async()=>{
    const alt=structuredClone(composeArgs);alt.operation_id=randomUUID();alt.bundle.predecessor_id=composed.id;alt.bundle.lineage_relation='alternative';alt.bundle.lineage_reason='changed organizing account at same focal identity';alt.bundle.account='CONSTRUCTED alternative account';
    const result=await dispatch('compose_account',alt);const next=await one('select * from ecb_circulation.composition_accounts where output_id=$1',[result.output_id]);assert.equal(next.focal_id,focal);
    assert.equal((await one('select relation from ecb_circulation.account_lineage where successor_id=$1',[next.id])).relation,'alternative');
  });
  await check('salt/tare/instrument situations remain distinct; missing measurement basis denied',async()=>{
    const stock=await artifact('CONSTRUCTED salt stock'),shaker=await artifact('CONSTRUCTED shaker'),shelf=await artifact('CONSTRUCTED shelf');
    const obs={operation_id:randomUUID(),work_id:ids.work,subject_id:stock,kind:'measurement',method_edition:'constructed-scale-v1',result:{reading:12},time_basis:{observed_at:'constructed-time',status:'not_performed'},frame:'stock measurement',resolution:'grams',purpose:'test situating',conditions:{container:shaker,location:shelf},unknowns:['calibration not performed'],participants:[{subject_id:shaker,role:'container'}],quantity:12,unit:'g',instrument_id:shaker,tare:{status:'UNKNOWN'},calibration:{status:'UNKNOWN'},uncertainty:{status:'UNKNOWN'}};
    const first=await dispatch('record_observation',obs);const second=await dispatch('record_observation',{...obs,operation_id:randomUUID(),tare:{value:2,unit:'g',status:'CONSTRUCTED'}});assert.notEqual(first.observation_id,second.observation_id);
    const invalid={...obs,operation_id:randomUUID()};delete invalid.instrument_id;await assert.rejects(()=>dispatch('record_observation',invalid));
    assert.equal((await one('select count(*)::int as n from ecb_circulation.observations where subject_id=$1',[stock])).n,2);
  });
  await check('recurrence/repeated capture confer no standing or currentness',async()=>{
    const obs={operation_id:randomUUID(),work_id:ids.work,subject_id:claim.id,kind:'independent_reuse',method_edition:'constructed-reuse-observer',result:{outcome:'UNKNOWN'},time_basis:{status:'CONSTRUCTED'},frame:'fixture reuse',resolution:'one use',purpose:'inspect recurrence',conditions:{context:'independent constructed use'},unknowns:['actual outcome'],participants:[]};
    await dispatch('record_observation',obs);await dispatch('record_observation',{...obs,operation_id:randomUUID(),kind:'repeated_capture'});
    assert.equal((await one('select epistemic_standing from public.claims where id=$1',[claim.id])).epistemic_standing,'unassessed');
  });
  await check('legacy manifest import preserves full envelope and both representations with replay',async()=>{
    const envelope={id:ids.legacy,content:'CONSTRUCTED expanded legacy description',original_content:'CONSTRUCTED original',metadata:{superseded:true},source_id:null,status:'legacy-status',created_at:'2026-09-29T00:00:00Z',updated_at:'2026-09-30T00:00:00Z'};
    const bytes=JSON.stringify(envelope),digest=sha(bytes);const manifest=await artifact(JSON.stringify({items:[{id:ids.legacy,digest}]}));
    await query('insert into ecb_circulation.corpus_editions(id,manifest_carrier_id,digest,origin,expected_count,frozen_at,export_basis) values($1,$2,$3,$4,1,clock_timestamp(),$5::jsonb)',[ids.corpus,manifest,sha(JSON.stringify({items:[{id:ids.legacy,digest}]})),'legacy:lqbrzoicorehwidkdhoi',JSON.stringify({encoding:'UTF8',serialization:'JSON.stringify',status:'CONSTRUCTED'})]);
    const args={operation_id:randomUUID(),work_id:ids.work,mechanism_id:ids.differentiate,corpus_id:ids.corpus,envelope,envelope_bytes:bytes,envelope_digest:digest};
    const result=await dispatch('assimilate_corpus',args);assert.equal((await dispatch('assimilate_corpus',args)).source_occurrence_id,result.source_occurrence_id);
    const s=await one('select * from ecb_circulation.source_occurrences where id=$1',[result.source_occurrence_id]);
    assert.equal((await one('select content from public.text_artifacts where id=$1',[s.carrier_id])).content,envelope.content);
    assert.equal((await one('select content from public.text_artifacts where id=$1',[s.original_carrier_id])).content,envelope.original_content);
    assert.equal((await one('select content from public.text_artifacts where id=$1',[s.envelope_carrier_id])).content,bytes);
    const bad={...args,operation_id:randomUUID(),envelope:{...envelope,id:randomUUID()}};await rejects(()=>dispatch('assimilate_corpus',bad),'cohort_denied');
    const incomplete={...args,operation_id:randomUUID(),envelope:{id:ids.legacy}};await rejects(()=>dispatch('assimilate_corpus',incomplete),'envelope_incomplete');
  });
  if (!supplemental) {
    await check('native concurrent use transitions: one predecessor winner and one conflict',async()=>{
      const a=new pg.Client({connectionString:url}),b=new pg.Client({connectionString:url});await Promise.all([a.connect(),b.connect()]);
      try {await Promise.all([a.query("select set_config('request.headers',$1,false)",[JSON.stringify(headers)]),b.query("select set_config('request.headers',$1,false)",[JSON.stringify(headers)])]);
        const next={...binding,use_key:'race',dependencies:await dependencies(),expected_predecessor_id:null};
        const outcomes=await Promise.allSettled([a,b].map(c=>c.query('select public.eco213_dispatch($1,$2::jsonb,$3)', ['reconcile_use',JSON.stringify({...next,operation_id:randomUUID()}),actor])));
        assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal(outcomes.filter(x=>x.status==='rejected'&&x.reason.message.includes('predecessor_conflict')).length,1);
      }finally{await Promise.all([a.end(),b.end()]);}
    });
  } else console.log('NOT RUN native concurrent sessions — supplementary WASM cannot qualify concurrency');
  let ambiguousAttempt;
  await check('crash after reservation blocks ambiguous regeneration on redelivery',async()=>{
    const first=await lease();ambiguousAttempt=first;assert.equal(first.status,'leased');await reserve(first);
    await query("update ecb_circulation.processing_heads set lease_until=clock_timestamp()-interval '1 second' where activity_id=$1",[first.activity.id]);
    await one("select pgmq.set_vt('eco213',(select message_id from ecb_circulation.processing_heads where activity_id=$1),0)",[first.activity.id]);
    const retry=await lease();assert.equal(retry.status,'blocked');assert.equal(retry.failure_code,'provider_outcome_ambiguous');
    assert.equal((await one('select count(*)::int as n from ecb_circulation.attempts where activity_id=$1',[first.activity.id])).n,1);
    assert.equal((await one('select provider_basis from ecb_circulation.attempt_outcomes where attempt_id=$1',[first.attempt_id])).provider_basis.automatic_regeneration,false);
  });
  await check('revocation disables worker effect while custody/recovery/history survive',async()=>{
    await query('update ecb_circulation.remit_heads set enabled=false where remit_id=$1',[ids.remit]);await rejects(()=>lease(),'remit_inactive');
    const r=await dispatch('recover_work',{work_id:ids.work});assert.equal(r.remits[0].enabled,false);assert.ok(r.processing.length>0);
    assert.equal((await dispatch('fetch_referent',{referent_id:captured.capture.thought_id})).thought.content,input.content);
    assert.equal(r.use_bindings[0].basis_current,false);
  });
  await check('late evidence survives remit revocation without committing an effect',async()=>{
    const evidence={raw_output:'CONSTRUCTED late provider response',generation_id:'constructed-late'};
    const args=[ambiguousAttempt.attempt_id,ambiguousAttempt.fence,'provider_outcome_ambiguous',JSON.stringify(evidence)];
    const saved=(await one('select public.eco213_preserve_attempt($1,$2,$3,$4::jsonb) as r',args)).r;
    assert.equal(saved.status,'evidence_preserved');assert.equal(saved.effect_committed,false);
    assert.equal((await one('select public.eco213_preserve_attempt($1,$2,$3,$4::jsonb) as r',args)).r.observation_id,saved.observation_id);
    const foreign=[ambiguousAttempt.attempt_id,ambiguousAttempt.fence+1,'provider_outcome_ambiguous',JSON.stringify(evidence)];
    await rejects(()=>one('select public.eco213_preserve_attempt($1,$2,$3,$4::jsonb)',foreign),'attempt_evidence_scope_denied');
    const r=await dispatch('inspect_processing',{work_id:ids.work});
    assert.ok(r.processing.flatMap(x=>x.attempts??[]).some(x=>(x.evidence_observations??[]).length===1));
    await query('update ecb_circulation.execution_credentials set enabled=false where worker=$1',[executor]);
    await rejects(()=>one('select public.eco213_preserve_attempt($1,$2,$3,$4::jsonb)',args),'worker_unauthorized');
  });
  await check('independent observer persists expiry and wake defaults dormant',async()=>{
    const observed=(await one('select ecb_circulation.observe() as r')).r;
    assert.ok(['DUE_WORK','NO_DUE_WORK','OVERDUE_WORK','STALE_WORKER'].includes(observed.state));
    assert.equal((await dispatch('inspect_processing',{work_id:ids.work})).liveness.observation_basis,'CURRENT');
    await one('select ecb_circulation.wake()');
    assert.equal((await one("select count(*)::int as n from ecb_circulation.liveness_observations where event='dispatch'")).n,0);
    await rejects(()=>one('select ecb_circulation.set_scheduler(true)'),'scheduler_extension_requires_requalification');
  });
  console.log(JSON.stringify({passed,failed:0,evidence:supplemental?'SUPPLEMENTARY WASM with SHA256 shim; no native/concurrency qualification':'NATIVE disposable PG; deterministic controls only, no provider/live recipe qualification'}));
} finally { await client.end(); }
