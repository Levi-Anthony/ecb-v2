import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  CIVS_CONTRACT_ID, CIVS_INSTALLATION_KINDS, CIVS_RELATION_KINDS, CIVS_WORKING_BANDS,
  makeCivsRelation, makeCivHumanProjectionRecord, renderCapabilityInspectionRecord,
  validateCapabilityInspectionRecord, type CapabilityInspectionRecord,
} from '../../server/civs.ts';
import type { QuestionForward } from '../../server/urg-core.ts';

const basis = 'fixture:civs-basis';
const relation = (kind: Parameters<typeof makeCivsRelation>[0], participants: Parameters<typeof makeCivsRelation>[1]) =>
  makeCivsRelation(kind, participants, basis, {
    coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'RELIED_FOR_DECLARED_USE',
    evidence_refs: ['fixture:evidence'], currentness_ref: 'fixture:current',
  });
const assessment = (kind: CapabilityInspectionRecord['installation_assessments'][number]['kind'], standing: CapabilityInspectionRecord['installation_assessments'][number]['standing'] = 'SUPPORTED') => ({
  kind, proposition: `Bounded ${kind} proposition`, standing, enforcement_mode: 'STRUCTURAL' as const,
  evidence_refs: standing === 'SUPPORTED' ? ['fixture:evidence'] : [],
  currentness_ref: standing === 'SUPPORTED' ? 'fixture:current' : undefined,
  sensitivity_refs: standing === 'SUPPORTED' ? ['fixture:negative-control'] : [],
  limits: ['Bounded fixture only'],
});
const graphical = (kind: CapabilityInspectionRecord['graphical_door']['obligations'][number]['kind']) => ({
  kind, proposition: `Graphical obligation ${kind}`, standing: 'NOT_ESTABLISHED' as const, enforcement_mode: 'STRUCTURAL' as const,
  evidence_refs: [], limits: ['No graphical substrate implementation is claimed.'],
});
const qf: QuestionForward = {
  kind: 'question_forward', unresolved_ref: 'fixture:correspondence', basis_ref: basis,
  current_standing_ref: 'fixture:unresolved', discriminator_question: 'What correspondence semantics are actually warranted?',
  paired_signal_scenario: 'A qualified mapping law supports a bounded correspondence; otherwise retain the unresolved relation.',
  evidence_change_criteria: 'Recover attributable mapping evidence.',
  alternative_signal_routing: 'Retain FEDERATE without correspondence-truth promotion.',
  decision_consequence: 'Do not select a mathematical formalism.',
  return_route: 'fixture:return', reentry_condition: 'Reenter on attributable correspondence evidence.',
};
function specimen(): CapabilityInspectionRecord {
  return {
    contract: CIVS_CONTRACT_ID, cir_id: 'fixture:cir', subject_ref: 'fixture:capability', subject_label: 'Fixture capability',
    purpose: { bounded_claim: 'Inspect only bounded structural realization.', boundary_ref: 'fixture:boundary',
      governing_orientation_ref: 'fixture:g', frame_ref: 'fixture:frame', access_ref: 'fixture:access' },
    installation_assessments: CIVS_INSTALLATION_KINDS.map(k => assessment(k, ['exposed','situated_use_qualified','operationally_sustained'].includes(k) ? 'NOT_ESTABLISHED' : 'SUPPORTED')),
    object_connections: [
      { ref: 'fixture:implements', record: relation('implements', [{ role: 'implementation', referent_id: 'fixture:code' }, { role: 'implemented_contract', referent_id: 'fixture:contract' }]) },
      { ref: 'fixture:tests', record: relation('tests', [{ role: 'test', referent_id: 'fixture:test' }, { role: 'tested_subject', referent_id: 'fixture:code' }]) },
    ],
    physical_realization: [
      ['repository','fixture:repo'],['module_runtime','fixture:module'],['deployment','fixture:deployment'],['ingress','fixture:ingress'],
      ['persistence','fixture:persistence'],['consumer_surface','fixture:consumer'],
    ].map(([kind,object_ref]) => ({ kind: kind as CapabilityInspectionRecord['physical_realization'][number]['kind'], object_ref,
      observation: kind === 'consumer_surface' ? 'UNOBSERVED' as const : 'OBSERVED' as const,
      evidence_refs: kind === 'consumer_surface' ? [] : ['fixture:evidence'], currentness_ref: kind === 'consumer_surface' ? undefined : 'fixture:current',
      limits: ['Coordinate is independently assessed; no linear-pipeline inference.'] })),
    enforcement_inspection: [{ requirement_ref: 'fixture:req', modes: ['STRUCTURAL'], surface_refs: ['fixture:test'], evidence_refs: ['fixture:evidence'], limits: ['Does not establish semantic truth.'] }],
    worked_trace: { claim: 'Given declared premises, the structural gate returns the expected disposition.', input_refs: ['fixture:input'],
      step_refs: ['fixture:evaluator'], output_ref: 'fixture:output', proof_boundary: 'Does not prove supplied semantic premises.' },
    verification_links: [{ ref: 'fixture:verification', proposition: 'Fixture deterministic gate is sensitive to its declared negative control.',
      method_ref: 'fixture:test', enforcement_mode: 'STRUCTURAL', evidence_refs: ['fixture:evidence'], standing: 'SUPPORTED', currentness_ref: 'fixture:current', sensitivity_refs: ['fixture:negative-control'], limits: ['No semantic truth or authority.'] }],
    field_reconstitution: { proposition: 'Typed changes route dependency/requalification review.', typed_change_refs: ['URG:Reorient'],
      affected_dependency_refs: ['fixture:dependency'], requalification_refs: ['fixture:review'], standing: 'SUPPORTED', enforcement_mode: 'STRUCTURAL',
      evidence_refs: ['fixture:evidence'], limits: ['No generic FieldReconstitution Change kind.'] },
    correspondence_inspections: [{ ref: 'fixture:correspondence', relation_kind_ref: 'fixture:cross-domain', source_ref: 'fixture:native',
      target_ref: 'fixture:ecos', basis_ref: basis, semantic_owner_ref: 'fixture:native-owner', direction: 'native-to-ecos',
      standing: 'NOT_ESTABLISHED', enforcement_mode: 'SEMANTIC', evidence_refs: [], unresolved_mathematical_requirements: ['mapping law', 'composition behavior'],
      question_forward_refs: ['fixture:qf'] }],
    portability: { proposition: 'Another implementation may realize the same bounded contract.', standing: 'UNKNOWN', enforcement_mode: 'STRUCTURAL', evidence_refs: [], limits: ['Not tested.'] },
    graceful_degradation: { proposition: 'Text/API remains usable without graphics.', standing: 'NOT_ESTABLISHED', enforcement_mode: 'OBSERVATIONAL', evidence_refs: [], limits: ['Not qualified by this fixture.'] },
    role_assignments: [
      { ref: 'fixture:principal', role_kind: 'principal_accountability', subject_ref: 'fixture:principal-subject', evidence_refs: ['fixture:evidence'], currentness_ref: 'fixture:current', scope: 'Principal decisions only.' },
      { ref: 'fixture:coordination', role_kind: 'coordination_assignment', subject_ref: 'fixture:worker', evidence_refs: ['fixture:evidence'], currentness_ref: 'fixture:current', scope: 'Coordination only; no semantic authority.' },
    ],
    alternatives: [{ ref: 'fixture:alt', description: 'Generic graph edge bag.', standing: 'REJECTED', evidence_refs: ['fixture:governing-rule'] }],
    cold_reader_bridges: [{ ref: 'fixture:bridge', question: 'Where is the runtime?', answer_route_refs: ['fixture:deployment'], no_invention_rule: 'Use exact located coordinates; do not infer hidden bridges.' }],
    questions_forward: [{ ref: 'fixture:qf', record: qf }],
    verification: { observed_at_ref: 'fixture:observation-time', as_of_ref: basis, currentness_refs: ['fixture:current'] },
    vertical_placement: { working_band: 'projection', containing_whole_refs: ['fixture:civs'] },
    participatory_neighborhood: { relation_refs: ['fixture:implements'], role_assignment_refs: ['fixture:principal','fixture:coordination'] },
    consumer_simulations: [{
      ref: 'fixture:consumer-sim', consumer_basis: { consumer_referent_ref: 'fixture:consumer', boundary_ref: 'fixture:consumer-boundary',
        governing_orientation_ref: 'fixture:consumer-g', mapper_ref: 'fixture:consumer-mapper', frame_ref: 'fixture:consumer-frame',
        access_ref: 'fixture:consumer-access', declared_use: 'Cold-read the fixture.' },
      items: [{
        ref: 'fixture:ul', quadrant: 'UL', entry_kind: 'DEPENDENCY_HYPOTHESIS', binding_status: 'LATENT', statement: 'Hypothesis: consumer must distinguish premise from proof.',
        observation_refs: [], observation_route: 'future cold-reader trial', falsifier: 'Consumer succeeds without this distinction or another dependency explains the result.',
        support: {
          affordance: { claim: 'Inspection can surface proof boundaries.', standing: 'NOT_ESTABLISHED', enforcement_mode: 'STRUCTURAL', evidence_refs: [], accountability_ref: 'fixture:coordination', limits: ['Hypothesis only.'] },
          accommodation: { claim: 'Human projection can explain the boundary.', standing: 'NOT_ESTABLISHED', enforcement_mode: 'STRUCTURAL', evidence_refs: [], accountability_ref: 'fixture:coordination', limits: ['Hypothesis only.'] },
          continuity: { claim: 'Reentry can preserve the hypothesis.', standing: 'NOT_ESTABLISHED', enforcement_mode: 'STRUCTURAL', evidence_refs: [], accountability_ref: 'fixture:coordination', limits: ['Hypothesis only.'] },
          accountability: { claim: 'Verification responsibility is named.', standing: 'NOT_ESTABLISHED', enforcement_mode: 'AUTHORITY', evidence_refs: [], accountability_ref: 'fixture:coordination', limits: ['Hypothesis only.'] },
        },
      }], limits: ['Consumer simulation is separate from capability Quadrant traversal.'],
    }],
    graphical_door: { obligations: [
      'shared_object_identity','typed_controls','standing_currentness_visibility','change_history_visibility',
      'projection_omissions_visibility','human_agent_reconciliation','text_api_graceful_fallback',
    ].map(k => graphical(k as CapabilityInspectionRecord['graphical_door']['obligations'][number]['kind'])) },
    source_refs: ['fixture:source'], omissions: ['No empirical consumer use.'],
  };
}

test('portable CIVS vocabulary mirrors executable constants', () => {
  const vocabulary = JSON.parse(readFileSync(new URL('../../schemas/civs-v0.1.contract.json', import.meta.url), 'utf8'));
  assert.equal(vocabulary.cir_contract, CIVS_CONTRACT_ID);
  assert.deepEqual(vocabulary.installation_assessments, CIVS_INSTALLATION_KINDS);
  assert.deepEqual(vocabulary.working_bands, CIVS_WORKING_BANDS);
  assert.deepEqual(vocabulary.relation_schema.kinds, CIVS_RELATION_KINDS);
});

test('complete CIR validates and human view is generated from the same record', () => {
  const cir = specimen(), result = validateCapabilityInspectionRecord(cir);
  assert.deepEqual(result, { valid: true, errors: [] });
  const human = renderCapabilityInspectionRecord(cir);
  assert.match(human, /generated human projection/);
  assert.match(human, /operationally_sustained/);
  assert.match(human, /NOT ESTABLISHED/);
});

test('installation assessment is not a scalar ladder', () => {
  const cir = specimen() as CapabilityInspectionRecord & { installation_status?: string };
  cir.installation_status = 'deployed';
  const result = validateCapabilityInspectionRecord(cir);
  assert.equal(result.valid, false);
  if (!result.valid) assert(result.errors.some(e => e.includes('scalar installation_status')));
});

test('generic owner and inferred Level are rejected', () => {
  const cir = specimen() as CapabilityInspectionRecord & { owner?: string };
  cir.owner = 'fixture:worker';
  (cir.vertical_placement as unknown as Record<string,unknown>).level = 3;
  const result = validateCapabilityInspectionRecord(cir);
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert(result.errors.some(e => e.includes('generic owner')));
    assert(result.errors.some(e => e.includes('may not infer a Level')));
  }
});

test('CIVS object connection refuses generic participant roles', () => {
  assert.throws(() => makeCivsRelation('implements', [
    { role: 'source', referent_id: 'fixture:a' }, { role: 'target', referent_id: 'fixture:b' },
  ], basis, { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'UNRESOLVED' }), /roles_invalid/);
});

test('graphical readiness remains decomposed and projection is a URG Projection record', () => {
  const cir = specimen() as CapabilityInspectionRecord & { graphical_door: CapabilityInspectionRecord['graphical_door'] & { ready?: boolean } };
  cir.graphical_door.ready = true;
  const invalid = validateCapabilityInspectionRecord(cir);
  assert.equal(invalid.valid, false);
  delete cir.graphical_door.ready;
  const projection = makeCivHumanProjectionRecord(cir, {
    projection_id: 'fixture:projection', content_ref: 'fixture:human-view', mapper_ref: 'fixture:mapper',
    frame_ref: 'fixture:frame', access_ref: 'fixture:access', evidence_basis_ref: 'fixture:cir-edition',
    fidelity: { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'RELIED_FOR_DECLARED_USE',
      evidence_refs: ['fixture:cir-edition'], currentness_ref: basis },
  });
  assert.equal(projection.kind, 'projection');
  assert.equal(projection.mapping_relation_ref, 'ecos:civs-human-projection:0.1.0');
});


test('consumer quadrant job is explicit and cannot bleed across UL/UR/LL/LR', () => {
  const cir = specimen();
  cir.consumer_simulations[0].items[0].entry_kind = 'OBSERVABLE_CORRELATE';
  const result = validateCapabilityInspectionRecord(cir);
  assert.equal(result.valid, false);
  if (!result.valid) assert(result.errors.some(e => e.includes('entry_kind does not match quadrant job')));
});

test('LOCATED consumer binding requires an attributable observation route', () => {
  const cir = specimen();
  cir.consumer_simulations[0].items[0].binding_status = 'LOCATED';
  cir.consumer_simulations[0].items[0].observation_refs = [];
  const result = validateCapabilityInspectionRecord(cir);
  assert.equal(result.valid, false);
  if (!result.valid) assert(result.errors.some(e => e.includes('LOCATED requires observation_refs')));
});

test('executable inspection claims require explicit enforcement mode', () => {
  const cir = specimen();
  (cir.installation_assessments[0] as unknown as Record<string,unknown>).enforcement_mode = undefined;
  (cir.verification_links[0] as unknown as Record<string,unknown>).enforcement_mode = undefined;
  const result = validateCapabilityInspectionRecord(cir);
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert(result.errors.some(e => e.includes('installation_assessments[0].enforcement_mode')));
    assert(result.errors.some(e => e.includes('verification_links[0]')));
  }
});
