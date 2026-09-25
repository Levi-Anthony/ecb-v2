import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortValue(value[k])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export function digest(value) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}

export function verifyRepositorySources(sources, repoRoot = process.cwd()) {
  return sources.map((source) => {
    if (!source.path || !source.expected_blob_sha) return { id: source.id, verified: null };
    const full = `${repoRoot}/${source.path}`;
    if (!fs.existsSync(full)) throw new Error(`missing source path: ${source.path}`);
    const observed = execFileSync('git', ['hash-object', source.path], { cwd: repoRoot, encoding: 'utf8' }).trim();
    if (observed !== source.expected_blob_sha) {
      throw new Error(`source blob mismatch for ${source.path}: expected ${source.expected_blob_sha}, observed ${observed}`);
    }
    return { id: source.id, verified: true, path: source.path, blob_sha: observed };
  });
}

function sourceApplicability(sources) {
  const materialChanged = sources.filter((s) => s.materiality === 'material' && s.current_blob_sha !== s.expected_blob_sha);
  return {
    status: materialChanged.length ? 'requalification_required' : 'applicable',
    changed_source_ids: materialChanged.map((s) => s.id),
  };
}

function orientationApplicability(state, sourceState) {
  if (state.focal.id !== state.orientation.qualified_focal_id) return 'refocus_required';
  if (state.pgo.digest !== state.orientation.qualified_pgo_digest) return 'requalification_required';
  if (state.orientation.qualification_result !== 'PASS') return 'qualification_unavailable';
  if (sourceState.status !== 'applicable') return sourceState.status;
  return 'applicable';
}

function authorityAllows(state) {
  if (state.authority.status !== 'fixture_permitted') return false;
  const allowed = new Set(state.authority.permitted_phases ?? []);
  return allowed.has('sense');
}

function nextAction(state, applicability) {
  if (applicability === 'refocus_required') {
    return { action: 'explicit_refocus_and_new_qualification', permitted_now: false, reason: 'focal_identity_changed' };
  }
  if (applicability !== 'applicable') {
    return { action: 'requalify_orientation', permitted_now: false, reason: applicability };
  }
  if (!authorityAllows(state)) {
    return { action: 'preserve_reentry_and_require_launch_authority', permitted_now: false, reason: state.authority.status };
  }
  if (state.phase.status === 'commissioned_unopened') {
    return { action: 'open_fixture_sense_and_recover_required_sources', permitted_now: true, reason: 'fixture_authority' };
  }
  if (state.phase.status === 'sense_open') {
    return { action: 'recover_required_source_manifest', permitted_now: true, reason: 'authorized_sense' };
  }
  return { action: 'respect_phase_stop', permitted_now: false, reason: state.phase.status };
}

export function deriveProjection(input) {
  const state = structuredClone(input);
  const sourceState = sourceApplicability(state.sources);
  const applicability = orientationApplicability(state, sourceState);
  const attention = (state.question_forward ?? [])
    .filter((q) => q.signal_fired)
    .map((q) => ({ id: q.id, disposition: 'reconsider' }));

  const sourceBasis = state.sources.map((s) => ({
    id: s.id,
    path: s.path ?? null,
    expected_blob_sha: s.expected_blob_sha ?? null,
    current_blob_sha: s.current_blob_sha ?? null,
    standing: s.standing,
    materiality: s.materiality,
  }));

  const projection = {
    focal: state.focal,
    seat_boundary: state.seat_boundary,
    pgo: state.pgo,
    phase: state.phase,
    source_basis: sourceBasis,
    source_basis_digest: digest(sourceBasis),
    orientation: {
      resolution_id: state.orientation.resolution_id,
      qualification_id: state.orientation.qualification_id,
      qualification_result: state.orientation.qualification_result,
      applicability,
      currentness: state.orientation.currentness,
      realization_standing: state.orientation.realization_standing,
      installation_state: state.orientation.installation_state,
    },
    authority: state.authority,
    dependencies: state.dependencies ?? [],
    question_forward: state.question_forward ?? [],
    attention,
    next_action: nextAction(state, applicability),
    reentry: state.reentry,
    limits: state.limits,
    interaction_lineage: state.interaction_lineage,
    repository_discovery_head: state.repository_discovery_head,
  };

  projection.projection_hash = digest(projection);
  return projection;
}

export function performPermittedSourceRecovery(projection, repoRoot = process.cwd()) {
  if (!projection.next_action.permitted_now) throw new Error('next action is not permitted');
  const sources = projection.source_basis.filter((s) => s.path && s.expected_blob_sha);
  const receipts = verifyRepositorySources(sources, repoRoot);
  return {
    operation: 'recover_required_source_manifest',
    projection_hash: projection.projection_hash,
    focal_id: projection.focal.id,
    source_receipts: receipts,
    authority_status: projection.authority.status,
  };
}
