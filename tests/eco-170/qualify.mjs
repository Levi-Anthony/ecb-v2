import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  deriveProjection,
  performPermittedSourceRecovery,
  verifyRepositorySources
} from './engagement-projection.mjs';

const root = process.cwd();
const fixturePath = process.env.ECO170_FIXTURE || path.join(root, 'tests/eco-170/fixture.json');
const base = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const receipt = { checks: [], snapshots: {}, source_verification: [], result: 'PASS' };

function check(name, fn) {
  try {
    fn();
    receipt.checks.push({ name, result: 'PASS' });
    console.log(`ECO170_CHECK=${name}:PASS`);
  } catch (error) {
    receipt.checks.push({ name, result: 'FAIL', error: String(error?.stack || error) });
    receipt.result = 'FAIL';
    console.error(`ECO170_CHECK=${name}:FAIL`);
    throw error;
  }
}

check('exact_repository_source_blobs', () => {
  receipt.source_verification = verifyRepositorySources(base.sources, root);
  assert.equal(receipt.source_verification.filter((r) => r.verified).length, 4);
});

const real = deriveProjection(base);
receipt.snapshots.real = real;

check('real_authority_negative_control', () => {
  assert.equal(real.focal.id, 'a6ad4441-722d-4a6b-8a84-afbac417ceed');
  assert.equal(real.phase.status, 'commissioned_unopened');
  assert.equal(real.authority.status, 'absent');
  assert.equal(real.next_action.permitted_now, false);
  assert.equal(real.next_action.action, 'preserve_reentry_and_require_launch_authority');
});

check('fixture_authority_positive_control', () => {
  const launched = structuredClone(base);
  launched.authority = {
    status: 'fixture_permitted',
    source_reference: 'ECO-170 isolated fixture only',
    permitted_phases: ['sense']
  };
  const projection = deriveProjection(launched);
  receipt.snapshots.fixture_authorized = projection;
  assert.equal(projection.next_action.permitted_now, true);
  assert.equal(projection.next_action.action, 'open_fixture_sense_and_recover_required_sources');
  assert.equal(projection.source_basis_digest, real.source_basis_digest);
  const sourceReceipt = performPermittedSourceRecovery(projection, root);
  receipt.snapshots.fixture_source_recovery = sourceReceipt;
  assert.equal(sourceReceipt.source_receipts.length, 4);
});

check('material_source_change_local_invalidation', () => {
  const changed = structuredClone(base);
  changed.sources[0].current_blob_sha = 'material-change-fixture';
  changed.authority = {
    status: 'fixture_permitted',
    source_reference: 'fixture',
    permitted_phases: ['sense']
  };
  const projection = deriveProjection(changed);
  receipt.snapshots.material_source_change = projection;
  assert.equal(projection.orientation.applicability, 'requalification_required');
  assert.equal(projection.next_action.permitted_now, false);
  assert.deepEqual(
    projection.source_basis.filter((s) => s.id !== 'eco179-harvest'),
    real.source_basis.filter((s) => s.id !== 'eco179-harvest')
  );
  assert.equal(projection.authority.status, 'fixture_permitted');
});

check('unrelated_repository_head_does_not_invalidate', () => {
  const changed = structuredClone(base);
  changed.repository_discovery_head = 'ffffffffffffffffffffffffffffffffffffffff';
  const projection = deriveProjection(changed);
  receipt.snapshots.unrelated_head_change = projection;
  assert.equal(projection.orientation.applicability, 'applicable');
  assert.equal(projection.source_basis_digest, real.source_basis_digest);
});

check('new_relation_admitted_without_focal_substitution', () => {
  const changed = structuredClone(base);
  changed.dependencies.push({
    id: 'eco178-mapper-explicit-information',
    kind: 'evidential_optional',
    status: 'newly_relevant'
  });
  const projection = deriveProjection(changed);
  receipt.snapshots.new_relation = projection;
  assert.equal(projection.focal.id, real.focal.id);
  assert.ok(projection.dependencies.some((d) => d.id === 'eco178-mapper-explicit-information'));
});

check('focal_grain_change_requires_refocus', () => {
  const changed = structuredClone(base);
  changed.focal = {
    id: 'different-focal-referent',
    handle: 'fixture-refocus',
    kind: 'different_referent'
  };
  changed.authority = {
    status: 'fixture_permitted',
    source_reference: 'fixture',
    permitted_phases: ['sense']
  };
  const projection = deriveProjection(changed);
  receipt.snapshots.focal_change = projection;
  assert.equal(projection.orientation.applicability, 'refocus_required');
  assert.equal(projection.next_action.action, 'explicit_refocus_and_new_qualification');
  assert.equal(projection.next_action.permitted_now, false);
});

check('pgo_change_requalifies_without_rewriting_sources', () => {
  const changed = structuredClone(base);
  changed.pgo = { ...changed.pgo, digest: 'changed-pgo-fixture' };
  const projection = deriveProjection(changed);
  receipt.snapshots.pgo_change = projection;
  assert.equal(projection.orientation.applicability, 'requalification_required');
  assert.equal(projection.source_basis_digest, real.source_basis_digest);
});

check('warrant_change_remains_separate', () => {
  const changed = structuredClone(base);
  changed.orientation.qualification_result = 'INDETERMINATE';
  changed.authority = {
    status: 'fixture_permitted',
    source_reference: 'fixture',
    permitted_phases: ['sense']
  };
  const projection = deriveProjection(changed);
  receipt.snapshots.warrant_change = projection;
  assert.equal(projection.orientation.applicability, 'qualification_unavailable');
  assert.equal(projection.authority.status, 'fixture_permitted');
  assert.equal(projection.next_action.permitted_now, false);
});

check('authority_revocation_does_not_rewrite_qualification', () => {
  const changed = structuredClone(base);
  changed.authority = {
    status: 'revoked',
    source_reference: 'fixture-revocation',
    permitted_phases: []
  };
  const projection = deriveProjection(changed);
  receipt.snapshots.authority_revoked = projection;
  assert.equal(projection.orientation.qualification_result, 'PASS');
  assert.equal(projection.orientation.applicability, 'applicable');
  assert.equal(projection.next_action.permitted_now, false);
});

check('phase_change_without_authority_does_not_create_authority', () => {
  const changed = structuredClone(base);
  changed.phase.status = 'sense_open';
  const projection = deriveProjection(changed);
  receipt.snapshots.phase_without_authority = projection;
  assert.equal(projection.authority.status, 'absent');
  assert.equal(projection.next_action.permitted_now, false);
});

check('dormant_reentry_signal_reconsiders_only', () => {
  const changed = structuredClone(base);
  changed.question_forward[0].signal_fired = true;
  const projection = deriveProjection(changed);
  receipt.snapshots.reentry_signal = projection;
  assert.deepEqual(projection.attention, [
    { id: 'qf-focal-indexed-disclosure', disposition: 'reconsider' }
  ]);
  assert.equal(projection.next_action.permitted_now, false);
});

check('cold_restart_reconstruction_stable', () => {
  const serialized = JSON.stringify(base);
  const restarted = deriveProjection(JSON.parse(serialized));
  receipt.snapshots.restart = restarted;
  assert.equal(restarted.projection_hash, real.projection_hash);
});

check('constituent_independence_visible', () => {
  const keys = Object.keys(real.orientation).sort();
  assert.ok(keys.includes('qualification_result'));
  assert.ok(keys.includes('currentness'));
  assert.ok(keys.includes('installation_state'));
  assert.notEqual(real.authority, undefined);
  assert.notEqual(real.phase, undefined);
  assert.notEqual(real.source_basis, undefined);
});

check('fca_positive_utility', () => {
  assert.ok(real.dependencies.length >= 4, 'awareness: dependencies visible');
  const exploratory = structuredClone(base);
  exploratory.dependencies.push({
    id: 'eco178-mapper-explicit-information',
    kind: 'evidential_optional',
    status: 'newly_relevant'
  });
  assert.ok(
    deriveProjection(exploratory).dependencies.length > real.dependencies.length,
    'freedom: relation admission'
  );
  assert.equal(real.next_action.permitted_now, false, 'control: authority bounds action');
});

fs.mkdirSync(path.join(root, 'artifacts/eco-170'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'artifacts/eco-170/receipt.json'),
  JSON.stringify(receipt, null, 2)
);

console.log(`ECO170_QUALIFICATION=${receipt.result}`);
console.log(`ECO170_CHECK_COUNT=${receipt.checks.length}`);
