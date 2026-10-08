import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { renderCivCorrespondenceHandoff, validateCivCorrespondenceHandoff, type CivsCorrespondenceHandoff } from '../../server/civs.ts';
const h=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission-correspondence-handoff-v0.1.json',import.meta.url),'utf8')) as CivsCorrespondenceHandoff;
const human=readFileSync(new URL('../../docs/civs-domain-semantic-admission-correspondence-handoff.md',import.meta.url),'utf8');
test('WP7 handoff validates and its human projection is exact',()=>{assert.deepEqual(validateCivCorrespondenceHandoff(h),{valid:true,errors:[]});assert.equal(renderCivCorrespondenceHandoff(h),human);});
test('formalism selection is explicitly not earned',()=>{assert.equal(h.formalism_gate.status,'NOT_EARNED');assert.equal(h.formalism_gate.selected_formalism,null);assert(h.non_claims.some(x=>x.includes('FEDERATE is not proof')));});
test('handoff covers core mapping semantics without selecting algebra',()=>{for(const id of ['CR-01','CR-02','CR-03','CR-04','CR-05','CR-06','CR-07','CR-08','CR-09','CR-10','CR-11','CR-12','CR-13','CR-14']) assert(h.requirements.some(r=>r.id===id),id);assert(h.formalism_gate.must_preserve.some(x=>x.includes('indexical relevance')));});
test('next route is WP8 qualification, not automatic formalism installation',()=>{assert.equal(h.next_reentry.work_package_ref,'CIVS:WP8:qualification');assert(h.next_reentry.evidence_required.some(x=>x.includes('fresh cold-reader')));});


test('first CIR v1.3 reconciles qualified WP6 and WP7 without portability/correspondence promotion',()=>{
  const cir=JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission.cir.json',import.meta.url),'utf8'));
  assert.equal(cir.cir_id,'ecos:cir:domain-semantic-admission:2026-10-07:v1.3');
  assert.equal(cir.portability.standing,'NOT_ESTABLISHED');
  assert.equal(cir.graceful_degradation.standing,'SUPPORTED');
  assert.equal(cir.correspondence_inspections.find((x:any)=>x.ref==='civs:correspondence:native-to-ecos')?.standing,'NOT_ESTABLISHED');
  assert(cir.object_connections.some((x:any)=>x.ref==='civs:rel:projects-to-portability'));
  assert(cir.object_connections.some((x:any)=>x.ref==='civs:rel:projects-to-correspondence-handoff'));
  assert(cir.verification_links.some((x:any)=>x.ref==='civs:verify:wp6-portability-degradation' && x.standing==='SUPPORTED'));
  assert(cir.verification_links.some((x:any)=>x.ref==='civs:verify:wp7-correspondence-handoff' && x.standing==='SUPPORTED'));
});
