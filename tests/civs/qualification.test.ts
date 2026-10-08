import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { evaluateDIBoundary, type AtomicResponsibility, type BoundaryDisposition, type DomainAdmissionRequest } from '../../server/domain-admission.ts';
import { systemsEngineeringNativePackages } from '../../server/native-packages/systems-engineering.ts';
import { renderCivsQualificationRecord, validateCivsQualificationRecord, type CivsQualificationRecord } from '../../server/civs-qualification.ts';

const q=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission-qualification-v0.3.json',import.meta.url),'utf8')) as CivsQualificationRecord;
const attempt01=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission-fresh-reader-attempt-01.json',import.meta.url),'utf8'));
const cir=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission.cir.json',import.meta.url),'utf8'));
const matrix=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission-portability-v0.1.json',import.meta.url),'utf8'));
const handoff=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission-correspondence-handoff-v0.1.json',import.meta.url),'utf8'));
const human=readFileSync(new URL('../../docs/civs-domain-semantic-admission-qualification.md',import.meta.url),'utf8');

test('WP8 qualification record validates and human projection is exact',()=>{
  assert.deepEqual(validateCivsQualificationRecord(q),{valid:true,errors:[]});
  assert.equal(renderCivsQualificationRecord(q),human);
  assert.equal(q.overall_disposition,'PARTIAL_HOLD');
});

const localPath=(ref:string):string|null=>{
  let s=ref.split('#')[0];
  if(s.startsWith('github:')||s.startsWith('GitHub')||s.startsWith('BRAIN:')||s.startsWith('Linear:')||s.startsWith('Vercel:')||s.startsWith('Supabase:')||s.startsWith('connected:')||s.startsWith('ecos:')||s.startsWith('civs:')||s.startsWith('URG:')||s.startsWith('physical:')) return null;
  if(s.startsWith('.github/')||s.startsWith('docs/')||s.startsWith('research/')||s.startsWith('server/')||s.startsWith('tests/')||s.startsWith('scripts/')||s.startsWith('api/')||s==='server.ts'||s==='package.json') return s;
  return null;
};
test('pointer-integrity: consequential local CIR/WP6/WP7 pointers resolve',()=>{
  const refs:string[]=[
    ...cir.source_refs,
    ...cir.verification_links.map((x:any)=>x.method_ref),
    ...cir.object_connections.flatMap((x:any)=>x.record.participants.map((p:any)=>p.referent_id)),
    ...matrix.source_refs,
    ...handoff.source_refs,
    'docs/civs-reentry.md','docs/civs-domain-semantic-admission.md'
  ];
  const paths=[...new Set(refs.map(localPath).filter((x):x is string=>Boolean(x)))];
  assert(paths.length>=20,`expected broad pointer aperture, got ${paths.length}`);
  const missing=paths.filter(p=>!existsSync(new URL('../../'+p,import.meta.url)));
  assert.deepEqual(missing,[]);
});

function independentExpected(r:AtomicResponsibility):{disposition:BoundaryDisposition;gate?:string}{
  if(!r.prior_art.checked) return {disposition:'QUALIFY',gate:'NATIVE_PRIOR_ART_REQUIRED'};
  if(r.native_coverage==='UNAVAILABLE') return {disposition:'QUALIFY',gate:'NATIVE_SOURCE_UNAVAILABLE'};
  if(r.native_coverage==='UNKNOWN') return {disposition:'QUALIFY',gate:'NATIVE_COVERAGE_UNKNOWN'};
  if(r.prior_art.evidence_refs.length===0) return {disposition:'QUALIFY',gate:'NATIVE_EVIDENCE_REQUIRED'};
  if(r.native_coverage==='ADEQUATE'&&r.unmet_obligation?.trim()) return {disposition:'QUALIFY',gate:'ATOMIZATION_CONFLICT'};
  let disposition:BoundaryDisposition;
  if(r.native_coverage==='ADEQUATE') disposition=r.requires_cross_domain_correspondence?'FEDERATE':'INHERIT';
  else {
    const extension=Boolean(r.unmet_obligation?.trim()&&r.ecos_mechanism_refs?.length&&r.falsifier?.trim());
    if(extension) disposition='EXTEND';
    else if(r.requires_cross_domain_correspondence&&r.native_coverage==='PARTIAL') disposition='FEDERATE';
    else return {disposition:'QUALIFY',gate:'EXTENSION_BURDEN_UNMET'};
  }
  if(disposition==='FEDERATE'&&!r.correspondence_targets?.length) return {disposition:'QUALIFY',gate:'CORRESPONDENCE_TARGET_REQUIRED'};
  return {disposition};
}
test('independent-trace: test-local contract derivation agrees with evaluator for positive and negative case',()=>{
  const corpus=JSON.parse(readFileSync(new URL('../../research/systems-engineering/DI-Native-Package-Boundary-v0.1.json',import.meta.url),'utf8'));
  const r=structuredClone(corpus.responsibilities.find((x:{id:string})=>x.id==='native-to-ecos-correspondence')) as AtomicResponsibility;
  assert(r);
  assert.deepEqual(independentExpected(r),{disposition:'FEDERATE'});
  const req:DomainAdmissionRequest={domain:corpus.domain,inquiry_basis_ref:corpus.inquiry_basis_ref,package_ids:corpus.package_ids,responsibilities:[r]};
  const actual=evaluateDIBoundary(req,systemsEngineeringNativePackages).decisions[0];
  assert.equal(actual.disposition,'FEDERATE');
  const negative=structuredClone(r); negative.correspondence_targets=[];
  assert.deepEqual(independentExpected(negative),{disposition:'QUALIFY',gate:'CORRESPONDENCE_TARGET_REQUIRED'});
  const neg=evaluateDIBoundary({...req,responsibilities:[negative]},systemsEngineeringNativePackages).decisions[0];
  assert.equal(neg.disposition,'QUALIFY');
  assert(neg.gate_codes.includes('CORRESPONDENCE_TARGET_REQUIRED'));
});

test('installation-ladder audit preserves supported and unresolved rungs separately',()=>{
  const by=new Map(cir.installation_assessments.map((x:any)=>[x.kind,x.standing]));
  for(const k of ['specified','implemented','mechanically_qualified','integrated','deployed']) assert.equal(by.get(k),'SUPPORTED',k);
  for(const k of ['exposed','situated_use_qualified','operationally_sustained']) assert.equal(by.get(k),'NOT_ESTABLISHED',k);
  const deployment=q.currentness_observations.find(x=>x.id==='wp8:obs:deployment')!;
  assert.match(deployment.observation,/READY.*1835eeba/);
  assert(q.currentness_observations.some(x=>x.id==='wp8:obs:consumer-search'&&x.standing==='DEGRADED'));
});

test('degradation-route audit preserves fail-visible dispositions and no standing promotion',()=>{
  const by=new Map(matrix.degradation_cases.map((x:any)=>[x.ref,x]));
  assert.equal(by.get('wp6:d:no-graphics')?.disposition,'CONTINUE');
  assert.equal(by.get('wp6:d:stale-consumer')?.disposition,'HOLD');
  assert.equal(by.get('wp6:d:brain-capture-drift')?.disposition,'DEGRADE');
  assert.equal(by.get('wp6:d:native-source-down')?.disposition,'HOLD');
  assert(matrix.cross_case_invariants.some((x:string)=>x.includes('never upgrades semantic standing')));
});

test('correspondence gate keeps all requirements open and formalism unselected',()=>{
  for(let i=1;i<=14;i++) assert(handoff.requirements.some((r:any)=>r.id===`CR-${String(i).padStart(2,'0')}`));
  assert.equal(handoff.formalism_gate.status,'NOT_EARNED');
  assert.equal(handoff.formalism_gate.selected_formalism,null);
  assert.equal(cir.correspondence_inspections.find((x:any)=>x.ref==='civs:correspondence:native-to-ecos')?.standing,'NOT_ESTABLISHED');
});

test('fresh-reader evidence is not simulated by the orchestrator',()=>{
  const check=q.checks.find(x=>x.id==='wp8:check:fresh-reader')!;
  assert.equal(check.standing,'NOT_ESTABLISHED');
  assert(q.residual_gates.some(x=>x.id==='wp8:gate:fresh-reader'&&x.standing==='HOLD'));
});


test('WP8 promotion supports every executed check but preserves fresh-reader HOLD',()=>{
  for(const id of [
    'wp8:check:pointer-integrity',
    'wp8:check:currentness-readback',
    'wp8:check:independent-trace',
    'wp8:check:installation-ladder',
    'wp8:check:degradation-routes',
    'wp8:check:correspondence-gate',
  ]) assert.equal(q.checks.find(x=>x.id===id)?.standing,'SUPPORTED',id);
  assert.equal(q.checks.find(x=>x.id==='wp8:check:fresh-reader')?.standing,'NOT_ESTABLISHED');
  assert.equal(q.overall_disposition,'PARTIAL_HOLD');
  assert(q.residual_gates.some(x=>x.id==='wp8:gate:fresh-reader'&&x.standing==='HOLD'));
});


test('CIR v1.4 binds WP8 partial qualification and exposes fresh-reader Question Forward',()=>{
  const cir=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission.cir.json',import.meta.url),'utf8'));
  assert.equal(cir.cir_id,'ecos:cir:domain-semantic-admission:2026-10-08:v1.5');
  assert(cir.object_connections.some((x:any)=>x.ref==='civs:rel:projects-to-wp8-qualification'));
  assert(cir.verification_links.some((x:any)=>x.ref==='civs:verify:wp8-mechanical-qualification'&&x.standing==='SUPPORTED'));
  assert(cir.questions_forward.some((x:any)=>x.ref==='civs:qf:wp8:fresh-reader'));
  assert.equal(cir.installation_assessments.find((x:any)=>x.kind==='situated_use_qualified')?.standing,'NOT_ESTABLISHED');
  assert.equal(cir.installation_assessments.find((x:any)=>x.kind==='operationally_sustained')?.standing,'NOT_ESTABLISHED');
  const reentry=readFileSync(new URL('../../docs/civs-reentry.md',import.meta.url),'utf8');
  assert.match(reentry,/PARTIAL_HOLD/);
  assert.match(reentry,/civs:qf:wp8:fresh-reader/);
});


test('contaminated attempt 01 is diagnostic evidence, not behavioral qualification',()=>{
  assert.equal(attempt01.test_status,'CONTAMINATED');
  assert.equal(attempt01.source_entry_success,true);
  assert.equal(attempt01.required_items_returned,14);
  assert.equal(attempt01.evidence_admissibility.fresh_reader_behavior,false);
  assert.equal(attempt01.evidence_admissibility.defect_discovery,true);
  assert.equal(q.cir_ref,'ecos:cir:domain-semantic-admission:2026-10-07:v1.4');
  assert.equal(q.qualification_id,'ecos:civs:domain-semantic-admission:qualification:2026-10-07:v0.3');
  assert.equal(q.checks.find(x=>x.id==='wp8:check:fresh-reader')?.standing,'NOT_ESTABLISHED');
  assert.equal(q.checks.find(x=>x.id==='wp8:check:fresh-reader-attempt-01-diagnostic')?.standing,'SUPPORTED');
  assert(q.residual_gates.some(x=>x.id==='wp8:gate:fresh-reader'&&x.standing==='HOLD'));
});

test('worked trace distinguishes responsibility QUALIFY from request-level HOLD',()=>{
  const corpus=JSON.parse(readFileSync(new URL('../../research/systems-engineering/DI-Native-Package-Boundary-v0.1.json',import.meta.url),'utf8'));
  const base=JSON.parse(JSON.stringify(corpus.responsibilities.find((x:{id:string})=>x.id==='native-to-ecos-correspondence'))) as AtomicResponsibility;
  const noTargets=JSON.parse(JSON.stringify(base)) as AtomicResponsibility; noTargets.correspondence_targets=[]; noTargets.required_for_current_use=false;
  const nonblocking=evaluateDIBoundary({domain:corpus.domain,inquiry_basis_ref:corpus.inquiry_basis_ref,package_ids:corpus.package_ids,responsibilities:[noTargets]},systemsEngineeringNativePackages);
  assert.equal(nonblocking.decisions[0].disposition,'QUALIFY');
  assert.equal(nonblocking.disposition,'READY');
  const required=JSON.parse(JSON.stringify(noTargets)) as AtomicResponsibility; required.required_for_current_use=true;
  const blocking=evaluateDIBoundary({domain:corpus.domain,inquiry_basis_ref:corpus.inquiry_basis_ref,package_ids:corpus.package_ids,responsibilities:[required]},systemsEngineeringNativePackages);
  assert.equal(blocking.decisions[0].disposition,'QUALIFY');
  assert.equal(blocking.disposition,'HOLD');
});
