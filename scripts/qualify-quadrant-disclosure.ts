/** Executes the ordinary coordinator against exact repository sources and authored semantic premises.
 * This is bounded local integration evidence, not a hosted-provider or empirical consumer run.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { orchestrateInquiry, inquiryBasisRef, digest, type InquiryAdapters, type InquiryRequest, type ExactEvidence, type Disclosure } from '../server/orchestration.ts';
import { QUADRANT_DISCLOSURES, QUADRANT_DISCLOSURE_CONTRACT, type SituatedContext } from '../server/urg-core.ts';

const contractPath='research/urg-kernel/Quadrant-Disclosure-Contract-v2.0.md';
const paths=[contractPath,'server/urg-core.ts','server/orchestration.ts'];
const sources: ExactEvidence[]=paths.map(path=>({
  referent_id:`repository:${path}`,digest:digest(readFileSync(path,'utf8')),content:readFileSync(path,'utf8'),
  source_refs:[path],original_basis:null,stored_standing:'exact repository source; semantic characterization is authored',
  currentness:'CURRENT',custody_ref:`repository:${path}`,
}));
const request: InquiryRequest={
  query:'Does the successor preserve the positive disclosure distinctions lost by seat/burden compression?',
  intended_use:'Inspect local successor source and coordinator behavior under explicitly authored semantic premises.',
  actor_ref:'quadrant-replacement:local-qualification',return_route:contractPath,
  context:{referent_id:'quadrant-replacement:inquiry-execution',boundary_ref:'one-local-coordinator-execution',
    governing_orientation_ref:'recover-principal-identified-compression-loss',mapper_ref:'authored-source-inspection',
    frame_ref:'bounded-local-integration',access_ref:'repository-sources-and-execution'},
  limits:{projection_chars:60000},
};
const meanings={
  UL:'This stipulated execution has its own course of determination. The external test account does not become acquaintance by instantiation; another run is another occurrence.',
  UR:'The execution produces differentiated coverage and READY/HOLD responses under the declared adapter inputs.',
  LL:'The successor contract articulates the significance of disclosure, coverage, standing and qualifier distinctions used by this execution.',
  LR:'The actual invocation connects source recovery, authored evaluation, structural validation, coverage, reconciliation and returned projection.',
};
// The writer publishes exact account contents; the consumer recovers only this explicit inventory.
const account = (ref:string, content:string):ExactEvidence => ({referent_id:ref, content, digest:digest(content),
  source_refs:[contractPath], custody_ref:ref, original_basis:null, currentness:'CURRENT', stored_standing:'authored bounded premise'});
const accounts = [
  ...QUADRANT_DISCLOSURES.map(q=>account(`authored-account:${digest(meanings[q])}`,meanings[q])),
  ...QUADRANT_DISCLOSURES.map(q=>account(`authored:model-${q}`,`Returned model, ${q}: ${meanings[q]} This is a fresh authored characterization of the model; the original occurrence is not transferred.`)),
  account(`${contractPath}#positive-characteristic-functions`,sources[0].content),
  account('bounded-local-integration','One local invocation using an explicitly inventoried source set and authored evaluations. No hosted-use, semantic truth or universal completeness assertion.'),
  account(request.context.referent_id!,'The focal local invocation, distinct from its returned model.'),
  account('quadrant-replacement:returned-model','The returned account, explicitly reseated under returned-model-account.'),
];
function disclosed(r:InquiryRequest):Disclosure {
  const basis=inquiryBasisRef(r);
  return {records:QUADRANT_DISCLOSURES.map(disclosure=>({ref:`authored:${disclosure}`,record:{
    kind:'quadrant',context:r.context as SituatedContext,disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT,
    result:'QUADRANT_POSITION',disclosure,content_ref:`authored-account:${digest(meanings[disclosure])}`,
    characterization_ref:`${contractPath}#positive-characteristic-functions`,conditions_ref:'bounded-local-integration',
    qualifiers:{seat:'Constitutive',burden:'Determinate'},
    fidelity:{coverage:'EXAMINED',activation:'ACTIVE',disposition:'RELIED_FOR_DECLARED_USE',
      evidence_refs:paths,warrant_ref:'authored semantic classification under this contract; bounded mechanics only',currentness_ref:basis},
  }})),account_editions:accounts.map(e=>({ref:e.referent_id,digest:e.digest})),changes:[],sufficiency:{inquiry_basis_ref:basis,assessment_ref:'authored:bounded-mechanical-inspection',satisfied:true,unresolved_refs:[]}};
}
const adapters:InquiryAdapters={
  async searchEvidence(){return {hits:sources.map(s=>({referent_id:s.referent_id,channels:['native_hybrid'],paths:[]})),coverage:[{channel:'native_hybrid',status:'AVAILABLE',detail:'Exact local source inventory; not a global database search.'}]};},
  async discoverStructure(){return {hits:[],coverage:[{channel:'structure',status:'AVAILABLE',detail:'Bounded dependency set is supplied from repository inspection.'}]};},
  async fetchEvidence(id){const e=sources.find(s=>s.referent_id===id);if(e){const content=readFileSync(e.source_refs[0],'utf8');return {...e,content,digest:digest(content)};}
    return accounts.find(e=>e.referent_id===id) ?? null;},
  async disclose(r){return disclosed(r);},
  async evaluateCandidate(r,h,e,basis){
    if(!sources.some(s=>s.referent_id===h.referent_id))return {disposition:'REJECT',reason:'The focal execution is already the seat.',assessment_ref:'authored:focal-filter',inquiry_basis_ref:basis,candidate_digest:e.digest};
    return {disposition:'ADMIT',reason:'Exact source is evidence for the bounded implementation inspection.',assessment_ref:'authored:source-relevance',inquiry_basis_ref:basis,candidate_digest:e.digest,membership:'EVIDENCE',
      current_use:{currentness:'CURRENT',standing_ref:'bounded-local-mechanical-inspection',evidence_refs:e.source_refs},
      relation:{kind:'native_relation',schema_ref:'quadrant-replacement:source-inspection',schema_edition_ref:'1',relation_kind_ref:'evidence-for',
        participants:[{role:'evidence',referent_id:e.referent_id},{role:'inspected-execution',referent_id:r.context.referent_id!}],situated_basis_ref:basis,
        fidelity:{coverage:'EXAMINED',activation:'ACTIVE',disposition:'RELIED_FOR_DECLARED_USE',evidence_refs:e.source_refs,currentness_ref:basis}}};
  },
  async reconcile(_r,_a,_c,basis){return {inquiry_basis_ref:basis,affected_old:{assessment_ref:'authored:old-compression-comparison',disposition:'SATISFIED'},destination_new:{assessment_ref:'authored:positive-functions-review',disposition:'SATISFIED'},coverage_complete:true,
    requirements:[{ref:'retain-source-meaning',direction:'old_dependency',blocking:true,disposition:'SATISFIED',basis_refs:[contractPath]},
      {ref:'positive-disclosure-coverage',direction:'destination_discovery',blocking:true,disposition:'SATISFIED',basis_refs:[contractPath]}]};},
};
const positive=await orchestrateInquiry(request,adapters);
assert.equal(positive.disposition,'READY');assert.equal(positive.admitted.length,3);
assert.deepEqual(Object.values(positive.quadrant_coverage).map(x=>x.status),['EXAMINED','EXAMINED','EXAMINED','EXAMINED']);
const legacy=await orchestrateInquiry(request,{...adapters,async disclose(r){const d=disclosed(r);for(const entry of d.records){const old=entry.record as unknown as Record<string,unknown>;
  delete old.disclosure_contract;delete old.disclosure;delete old.qualifiers;old.seat='Constitutive';old.burden='Determinate';}return d;}});
assert.equal(legacy.disposition,'HOLD');
assert(Object.values(legacy.quadrant_coverage).every(x=>x.status==='UNEXAMINED'));
const modelRequest={...request,context:{...request.context,referent_id:'quadrant-replacement:returned-model',boundary_ref:'returned-model-account'}};
const stale=await orchestrateInquiry(modelRequest,{...adapters,async disclose(){return disclosed(request);}});
assert.equal(stale.disposition,'HOLD');
const reseated=await orchestrateInquiry(modelRequest,{...adapters,async disclose(r){const d=disclosed(r);
  for(const entry of d.records)if(entry.record.kind==='quadrant')entry.record.content_ref=`authored:model-${entry.record.disclosure}`;return d;}});
assert.equal(reseated.disposition,'READY');
assert.equal(positive.disclosure_accounts.length,6);
assert.equal(JSON.parse(positive.projection.content).disclosure_accounts.length,6);
const missing=await orchestrateInquiry(request,{...adapters,async fetchEvidence(id){return id.startsWith('authored-account:')?null:adapters.fetchEvidence(id);}});
assert.equal(missing.disposition,'HOLD');
const changed=await orchestrateInquiry(request,{...adapters,async fetchEvidence(id){const e=await adapters.fetchEvidence(id);return e&&id.startsWith('authored-account:')?{...e,digest:'changed-edition'}:e;}});
assert.equal(changed.disposition,'HOLD');
console.log(JSON.stringify({result:'PASS',checks:['source-grounded coordinator READY','all four disclosures under identical old qualifiers','legacy coverage HOLD','stale original-seat records HOLD','explicitly new model inquiry READY','writer account recovery and projection roundtrip','missing account HOLD','changed account HOLD'],
  semantic_standing:'Authored premise/discriminator cases; no automated or independent semantic classification claim.',
  source_editions:sources.map(s=>({path:s.source_refs[0],digest:s.digest})),projection_digest:positive.projection.edition,
  limits:['Local coordinator integration, not hosted provider deployment/use.','Model inquiry is explicitly new; no claim that boundary changes automatically establish Level.','Generative relationships remain attributable domain-native relation claims, not mechanically inferred.']},null,2));
