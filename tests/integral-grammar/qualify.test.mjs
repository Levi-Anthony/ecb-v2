import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assessExistenceAsymmetry,
  classifyDirectionalSignals,
  demonstrateLineIndependence,
  evaluateCardDeparture,
  evaluateUL,
  validateGrammarContract,
  validateQuadrantReferentCorrespondence,
  validateQuestionForward,
} from '../../server/integral-grammar/evaluate.mjs';

const grammar = JSON.parse(await readFile(new URL('../../research/integral-holonic-grammar/grammar-v0.1.json', import.meta.url), 'utf8'));
const fixtures = JSON.parse(await readFile(new URL('./fixtures.json', import.meta.url), 'utf8'));

test('definition contract is complete without faking closure of open definitions', () => {
  const result = validateGrammarContract(grammar);
  assert.deepEqual(result, { pass: true, failures: [] });
  assert.equal(grammar.definitions.ur.standing, 'REQUIRED_DEFINITION_OPEN');
  assert.equal(grammar.definitions.ur.positive_definition, null);
  assert.equal(grammar.definitions.ll.standing, 'REQUIRED_DEFINITION_OPEN');
  assert.equal(grammar.definitions.lr.standing, 'REQUIRED_DEFINITION_OPEN');
});

test('map, mapper, access, reference frame, quadrant and Referent remain separately defined', () => {
  const names = ['referent', 'map_projection', 'mapper', 'access', 'reference_frame', 'quadrant'];
  for (const name of names) assert.ok(grammar.definitions[name], `missing ${name}`);
  assert.match(grammar.definitions.map_projection.positive_definition, /not the Referent itself/);
  assert.notEqual(grammar.definitions.mapper.positive_definition, grammar.definitions.reference_frame.positive_definition);
  assert.ok(grammar.definitions.quadrant.must_not_collapse_with.includes('reference_frame'));
});

test('physical handful exhibits existence asymmetry under the fixed dependency fixture', () => {
  const fixture = fixtures.holoarchy.physical_handful;
  const result = assessExistenceAsymmetry(fixture);
  assert.equal(result.status, fixture.expected_status);
  assert.deepEqual(result.surviving_constituents.sort(), ['cards', 'hand']);
});

test('same territory event changes consequence under different Master Keys', () => {
  for (const fixture of fixtures.master_key_contrast) {
    const result = evaluateCardDeparture(fixture);
    assert.equal(result.status, fixture.expected, JSON.stringify(fixture));
  }
});

test('same-level retention improvement does not automatically become transcendence', () => {
  const fixture = fixtures.directional.same_level_retention_improvement;
  const result = classifyDirectionalSignals(fixture.input);
  assert.equal(result.preservation, fixture.expected.preservation);
  assert.equal(result.transcendence, fixture.expected.transcendence);
});

test('responsive same-level reconfiguration can raise adaptation without transcendence', () => {
  const fixture = fixtures.directional.adaptive_grip;
  const result = classifyDirectionalSignals(fixture.input);
  assert.equal(result.adaptation, fixture.expected.adaptation);
  assert.equal(result.transcendence, fixture.expected.transcendence);
});

test('one event can carry dissolution at one focal level and transcendence at another', () => {
  const fixture = fixtures.directional.played_card_cross_level;
  const focal = classifyDirectionalSignals(fixture.focal_hand_input);
  const higher = classifyDirectionalSignals(fixture.higher_order_strategy_input);
  assert.equal(focal.dissolution, fixture.expected_focal_dissolution);
  assert.equal(higher.transcendence, fixture.expected_higher_order_transcendence);
});

test('quadrant traversal requires same focal Referent', () => {
  const good = validateQuadrantReferentCorrespondence(fixtures.quadrant_referent_correspondence.same_referent);
  const bad = validateQuadrantReferentCorrespondence(fixtures.quadrant_referent_correspondence.silent_substitution);
  assert.equal(good.pass, true);
  assert.equal(bad.pass, false);
  assert.deepEqual(bad.failures, [{ quadrant: 'LR', referent_id: 'purelit' }]);
});

test('UL is self-indexed without granting mapper direct access to another Referent', () => {
  const native = evaluateUL(fixtures.ul.thermostat_native);
  const falseClairvoyance = evaluateUL(fixtures.ul.false_clairvoyance);
  assert.equal(native.pass, fixtures.ul.thermostat_native.expected_pass);
  assert.equal(native.self_indexed, true);
  assert.equal(falseClairvoyance.pass, fixtures.ul.false_clairvoyance.expected_pass);
  assert.equal(falseClairvoyance.self_indexed, true);
  assert.equal(falseClairvoyance.access_claim_valid, false);
});

test('low/no signal requires a complete Question Forward package', () => {
  const valid = validateQuestionForward(fixtures.question_forward.strap_boundary);
  const invalid = validateQuestionForward(fixtures.question_forward.invalid_bare_low_signal);
  assert.equal(valid.pass, true);
  assert.equal(invalid.pass, false);
  assert.ok(invalid.failures.includes('missing_question'));
  assert.ok(invalid.failures.includes('missing_answer_detection_criteria'));
  assert.ok(invalid.failures.includes('missing_activation_scenario'));
  assert.ok(invalid.failures.includes('missing_reentry_trigger'));
  assert.ok(invalid.failures.includes('missing_decision_consequence'));
});

test('invented activation scenarios are explicitly marked calibration rather than evidence', () => {
  const scenario = fixtures.question_forward.strap_boundary.activation_scenario;
  assert.equal(scenario.evidence_status, 'HYPOTHETICAL_CALIBRATION');
});

test('Line candidate requires an independence witness and does not inherit Drive/Capacity identity', () => {
  const witness = demonstrateLineIndependence(fixtures.line_independence.witness);
  const nonWitness = demonstrateLineIndependence(fixtures.line_independence.non_witness);
  assert.equal(witness.status, fixtures.line_independence.witness.expected);
  assert.equal(nonWitness.status, fixtures.line_independence.non_witness.expected);
  assert.ok(grammar.definitions.line.must_not_collapse_with.includes('directional_tendency'));
  assert.ok(grammar.definitions.directional_tendency.must_not_collapse_with.includes('line'));
});
