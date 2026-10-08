import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import type { CapabilityInspectionRecord } from '../../server/civs.ts';

const procedure = readFileSync(new URL('../../docs/civs-reentry.md', import.meta.url), 'utf8');
const cir = JSON.parse(readFileSync(new URL('../../research/civs/domain-semantic-admission.cir.json', import.meta.url), 'utf8')) as CapabilityInspectionRecord;

test('cold reentry procedure points to the machine CIR and preserves governing nonpromotion rules', () => {
  assert(procedure.includes('research/civs/domain-semantic-admission.cir.json'));
  assert(procedure.includes('not** as a URG primitive') || procedure.includes('not** as a URG primitive'.replace('**','')));
  assert(procedure.includes('PGO Namecrafting'));
  assert(procedure.includes('ECO-202 owns execution/coordination'));
  assert(procedure.includes('BRAIN is first-class commission custody'));
  assert(procedure.includes('FEDERATE demonstrates structural admission'));
  assert(procedure.includes('A CIVS `working_band` is not a URG Level'));
  assert(procedure.includes('HOLD invocation'));
});

test('cold reentry procedure covers all independent installation assessments', () => {
  for (const assessment of cir.installation_assessments) assert(procedure.includes('`' + assessment.kind + '`'), assessment.kind);
});

test('cold reentry procedure carries all required fail-visible HOLD routes', () => {
  for (const code of [
    'CIR_UNAVAILABLE','CIR_INVALID','PROJECTION_DRIFT','SOURCE_UNAVAILABLE','BASIS_CHANGE_UNRECONCILED',
    'EXPOSURE_NOT_ESTABLISHED','AUTHORITY_NOT_ESTABLISHED','QUESTION_FORWARD_OPEN','CORRESPONDENCE_NOT_ESTABLISHED','FRESH_READER_CONTAMINATED',
  ]) assert(procedure.includes(code), code);
});

test('cold reentry procedure requires the full fourteen-item return without claiming behavioral qualification', () => {
  for (let i = 1; i <= 14; i++) assert(procedure.includes(i + '.'), 'return item ' + i);
  assert(procedure.includes('Fresh-agent behavioral success is NOT ESTABLISHED'));
  assert(procedure.includes('exact open Questions Forward and next reentry route'));
});


test('machine CIR directly projects to the cold reentry procedure', () => {
  const relation = cir.object_connections.find(x => x.ref === 'civs:rel:projects-to-cold-reentry');
  assert(relation);
  assert.equal(relation.record.relation_kind_ref, 'ecos:civs-object-relations:projects_to');
  assert(relation.record.participants.some(p => p.role === 'source' && p.referent_id === cir.cir_id));
  assert(relation.record.participants.some(p => p.role === 'projection' && p.referent_id === 'ecos:civs-cold-reentry:0.1.0'));
  assert(cir.cold_reader_bridges.some(x => x.answer_route_refs.includes('docs/civs-reentry.md')));
  assert(cir.verification_links.some(x => x.ref === 'civs:verify:cold-reentry-structure' && x.standing === 'SUPPORTED'));
});


test('cold reentry is self-locating and preserves canonical-source resolver semantics',()=>{
  assert(procedure.includes('github:Levi-Anthony/ecb-v2'));
  assert(procedure.includes('BRAIN:<UUID>'));
  assert(procedure.includes('does **not** name one mandatory connector implementation'));
  assert(procedure.includes('activation: ACTIVE'));
  assert(procedure.includes('does **not** mean "newest deployment"'));
});

test('cold reentry rejects contaminated behavioral qualification and distinguishes QUALIFY from request HOLD',()=>{
  assert(procedure.includes('return **CONTAMINATED**'));
  assert(procedure.includes('FRESH_READER_CONTAMINATED'));
  assert(procedure.includes('responsibility-level decision'));
  assert(procedure.includes('request-level disposition/result'));
  assert(procedure.includes('Do not translate every `QUALIFY` into request-level HOLD'));
  assert(procedure.includes('expired effect envelope'));
  assert(procedure.includes('PGO Namecrafting'));
});
