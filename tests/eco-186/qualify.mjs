import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { assembleConnectedUse, evaluateSourceReceipt, OperationLedger } from './connected-receiving-path.mjs';

const root = process.cwd();
const eco186 = path.join(root, 'tests/eco-186');
const fixture = JSON.parse(fs.readFileSync(path.join(eco186, 'fixture.json'), 'utf8'));
const liveReceipt = JSON.parse(fs.readFileSync(path.join(eco186, 'live-source-receipt.json'), 'utf8'));
const engagementState = JSON.parse(fs.readFileSync(path.join(root, 'tests/eco-170/fixture.json'), 'utf8'));
const receipt = { result: 'PASS', checks: [], snapshots: {} };

function check(name, fn) {
  try {
    fn();
    receipt.checks.push({ name, result: 'PASS' });
    console.log(`ECO186_CHECK=${name}:PASS`);
  } catch (error) {
    receipt.result = 'FAIL';
    receipt.checks.push({ name, result: 'FAIL', error: String(error?.stack || error) });
    console.error(`ECO186_CHECK=${name}:FAIL`);
    throw error;
  }
}

check('connected_live_source_receipt_exact_and_complete', () => {
  const state = evaluateSourceReceipt(liveReceipt);
  assert.equal(liveReceipt.assembly_mode, 'connected_linear_github_session');
  assert.equal(state.status, 'applicable');
  assert.equal(new Set(liveReceipt.sources.map((source) => source.id)).size, liveReceipt.sources.length);
});

const assembled = assembleConnectedUse({ ...fixture, liveReceipt, engagementState });
receipt.snapshots.assembled = assembled;

check('positive_connected_recovery_to_bound_consumer', () => {
  assert.equal(assembled.installation.installed_for_declared_use, true);
  assert.equal(assembled.next_action.action, 'recover_compose_and_return');
  assert.equal(assembled.next_action.permitted_now, true);
});

check('evidence_applicability_distinct_from_operational_disposition', () => {
  const changedReceipt = structuredClone(liveReceipt);
  changedReceipt.sources.find((source) => source.id === 'eco177-interface').observed_version = 'changed-interface-edition';
  const encounter = structuredClone(fixture.encounter);
  encounter.operational_disposition = 'ACTION';
  const path = assembleConnectedUse({
    encounter, liveReceipt: changedReceipt, engagementState,
    consumer: fixture.consumer, authority: fixture.authority
  });
  assert.equal(path.operational_disposition, 'ACTION');
  assert.equal(path.evidence_applicability, 'requalification_required');
  assert.equal(path.next_action.permitted_now, false);
});

check('material_source_change_localizes_requalification', () => {
  const changed = structuredClone(liveReceipt);
  changed.sources.find((source) => source.id === 'eco182-shape').observed_version = 'new-eco182-edition';
  const state = evaluateSourceReceipt(changed);
  assert.equal(state.status, 'requalification_required');
  assert.deepEqual(state.changed_source_ids, ['eco182-shape']);
});

check('unrelated_repository_head_change_does_not_invalidate_exact_sources', () => {
  const changed = structuredClone(liveReceipt);
  changed.sources.find((source) => source.id === 'repo-main').observed_version = 'ffffffffffffffffffffffffffffffffffffffff';
  assert.equal(evaluateSourceReceipt(changed).status, 'applicable');
});

check('wrong_source_version_detected', () => {
  const changed = structuredClone(liveReceipt);
  changed.sources.find((source) => source.id === 'eco170-pr').observed_version = 'wrong-pr-head';
  assert.equal(evaluateSourceReceipt(changed).status, 'requalification_required');
});

check('exact_hydration_required_before_reliance', () => {
  const changed = structuredClone(liveReceipt);
  changed.sources.find((source) => source.id === 'eco181-use').exact_hydrated = false;
  assert.equal(evaluateSourceReceipt(changed).status, 'exact_hydration_required');
});

check('revoked_authority_blocks_effect_without_erasing_recovery', () => {
  const authority = { ...fixture.authority, status: 'revoked', permitted_effects: [] };
  const path = assembleConnectedUse({
    encounter: fixture.encounter, liveReceipt, engagementState,
    consumer: fixture.consumer, authority
  });
  assert.equal(path.installation.installed_for_declared_use, true);
  assert.equal(path.next_action.permitted_now, false);
  assert.equal(path.next_action.action, 'preserve_recovery_without_effect');
  assert.equal(path.source_assembly.source_state.status, 'applicable');
});

check('disconnected_consumer_is_not_installed_for_use', () => {
  const consumer = { ...fixture.consumer, status: 'disconnected', binding_receipt: null, can_recover: false };
  const path = assembleConnectedUse({
    encounter: fixture.encounter, liveReceipt, engagementState,
    consumer, authority: fixture.authority
  });
  assert.equal(path.installation.installed_for_declared_use, false);
  assert.equal(path.next_action.action, 'establish_consumer_binding');
});

check('represented_state_is_not_underlying_execution', () => {
  assert.equal(assembled.represented_realization.kind, 'eco170_derived_projection');
  assert.equal(assembled.represented_realization.underlying_execution_observed, false);
  assert.equal(assembled.authority.forbidden_effects.includes('execute_eco179'), true);
});

check('same_operation_same_request_recovers_one_outcome', () => {
  const ledger = new OperationLedger();
  let effects = 0;
  const request = { action: 'recover_compose_return', focal: 'ECO-179' };
  const first = ledger.execute('11111111-1111-4111-8111-111111111111', request, () => ({ receipt: ++effects }));
  const retry = ledger.execute('11111111-1111-4111-8111-111111111111', request, () => ({ receipt: ++effects }));
  assert.equal(first.replayed, false);
  assert.equal(retry.replayed, true);
  assert.equal(effects, 1);
  assert.deepEqual(first.outcome, retry.outcome);
});

check('changed_request_same_operation_conflicts', () => {
  const ledger = new OperationLedger();
  ledger.execute('22222222-2222-4222-8222-222222222222',
    { action: 'recover', source: 'eco182' }, () => ({ ok: true }));
  assert.throws(
    () => ledger.execute('22222222-2222-4222-8222-222222222222',
      { action: 'recover', source: 'eco177' }, () => ({ ok: true })),
    (error) => error?.code === 'OPERATION_CONFLICT'
  );
});

check('restart_recovers_operation_custody', () => {
  const ledger = new OperationLedger();
  const request = { action: 'recover_compose_return', focal: 'ECO-179' };
  ledger.execute('33333333-3333-4333-8333-333333333333',
    request, () => ({ path_hash: assembled.path_hash }));
  const restarted = OperationLedger.restart(ledger.serialize());
  const replay = restarted.execute('33333333-3333-4333-8333-333333333333',
    request, () => ({ path_hash: 'wrong' }));
  assert.equal(replay.replayed, true);
  assert.equal(replay.outcome.path_hash, assembled.path_hash);
});

check('mapper_or_pgo_change_requalifies_without_rewriting_sources', () => {
  const encounter = structuredClone(fixture.encounter);
  encounter.mapper_frame = 'different-frame';
  const path = assembleConnectedUse({
    encounter, liveReceipt, engagementState,
    consumer: fixture.consumer, authority: fixture.authority
  });
  assert.equal(path.evidence_applicability, 'requalification_required');
  assert.equal(path.source_assembly.source_state.status, 'applicable');
});

check('new_relation_composes_without_focal_substitution', () => {
  const relation = { id: 'eco177-evidence-applicability-guard', kind: 'evidential_guard' };
  const path = assembleConnectedUse({ ...fixture, liveReceipt, engagementState, extraRelations: [relation] });
  assert.equal(path.focal.id, fixture.encounter.focal.id);
  assert.ok(path.relations.some((item) => item.id === relation.id));
});

check('source_specific_standing_preserved_across_synthesis', () => {
  assert.equal(assembled.source_specific_standing['eco170-pr'], 'open_draft_unmerged_mergeable');
  assert.equal(
    assembled.source_specific_standing['build11-receipt'],
    'production_runtime_qualified_consumer_cutover_unproven'
  );
  assert.notEqual(
    assembled.source_specific_standing['eco170-pr'],
    assembled.source_specific_standing['build11-receipt']
  );
});

fs.mkdirSync(path.join(root, 'artifacts/eco-186'), { recursive: true });
fs.writeFileSync(path.join(root, 'artifacts/eco-186/receipt.json'), JSON.stringify(receipt, null, 2));
console.log(`ECO186_QUALIFICATION=${receipt.result}`);
console.log(`ECO186_CHECK_COUNT=${receipt.checks.length}`);
