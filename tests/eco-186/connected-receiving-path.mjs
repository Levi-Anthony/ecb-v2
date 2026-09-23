import crypto from 'node:crypto';
import { deriveProjection } from '../eco-170/engagement-projection.mjs';

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

export function digest(value) {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}

const REQUIRED_SOURCE_IDS = new Set([
  'eco182-shape',
  'eco177-interface',
  'eco181-use',
  'eco170-return',
  'eco156-interaction',
  'eco170-pr',
  'eco170-projection-code',
  'build11-receipt'
]);

export function evaluateSourceReceipt(receipt) {
  if (receipt.assembly_mode !== 'connected_linear_github_session') {
    return { status: 'invalid_assembly_mode', changed_source_ids: [], missing_source_ids: [] };
  }
  const ids = new Set(receipt.sources.map((source) => source.id));
  const missing = [...REQUIRED_SOURCE_IDS].filter((id) => !ids.has(id));
  if (missing.length) {
    return { status: 'missing_required_sources', changed_source_ids: [], missing_source_ids: missing };
  }
  const material = receipt.sources.filter((source) => source.materiality === 'material');
  const notHydrated = material.filter((source) => source.exact_hydrated !== true);
  if (notHydrated.length) {
    return {
      status: 'exact_hydration_required',
      changed_source_ids: [],
      missing_source_ids: [],
      not_hydrated_source_ids: notHydrated.map((source) => source.id)
    };
  }
  const changed = material.filter((source) => source.bound_version !== source.observed_version);
  if (changed.length) {
    return {
      status: 'requalification_required',
      changed_source_ids: changed.map((source) => source.id),
      missing_source_ids: []
    };
  }
  return { status: 'applicable', changed_source_ids: [], missing_source_ids: [] };
}

function qualificationApplicability(encounter, sourceState) {
  if (encounter.mapper_frame !== encounter.qualification_basis.mapper_frame) return 'requalification_required';
  if (encounter.pgo_digest !== encounter.qualification_basis.pgo_digest) return 'requalification_required';
  return sourceState.status;
}

function isConsumerBound(consumer) {
  return consumer.status === 'bound' && Boolean(consumer.binding_receipt) && consumer.can_recover === true;
}

function authorityAllowsRecovery(authority) {
  return authority.status === 'isolated_move_permitted' &&
    (authority.permitted_effects ?? []).includes('recover_compose_return');
}

export function assembleConnectedUse({ encounter, liveReceipt, engagementState, consumer, authority, extraRelations = [] }) {
  const sourceState = evaluateSourceReceipt(liveReceipt);
  const applicability = qualificationApplicability(encounter, sourceState);
  const projection = deriveProjection(engagementState);
  const bound = isConsumerBound(consumer);
  const installedForUse = applicability === 'applicable' && bound;

  const nextAction = applicability !== 'applicable'
    ? { action: 'requalify_source_or_frame', permitted_now: false, reason: applicability }
    : !bound
      ? { action: 'establish_consumer_binding', permitted_now: false, reason: 'consumer_disconnected' }
      : !authorityAllowsRecovery(authority)
        ? { action: 'preserve_recovery_without_effect', permitted_now: false, reason: authority.status }
        : { action: 'recover_compose_and_return', permitted_now: true, reason: 'isolated_move_authority' };

  const path = {
    focal: encounter.focal,
    use: encounter.use,
    mapper_frame: encounter.mapper_frame,
    pgo_digest: encounter.pgo_digest,
    source_assembly: {
      assembly_mode: liveReceipt.assembly_mode,
      discovery_seed: liveReceipt.discovery_seed,
      source_ids: liveReceipt.sources.map((source) => source.id),
      source_state: sourceState,
      receipt_digest: digest(liveReceipt)
    },
    evidence_applicability: applicability,
    operational_disposition: encounter.operational_disposition,
    consumer_binding: {
      consumer_id: consumer.id,
      status: consumer.status,
      binding_receipt: consumer.binding_receipt ?? null,
      can_recover: consumer.can_recover === true
    },
    installation: {
      installed_for_declared_use: installedForUse,
      qualification_current: applicability === 'applicable',
      activation: consumer.activation,
      authority_status: authority.status
    },
    represented_realization: {
      kind: 'eco170_derived_projection',
      projection_hash: projection.projection_hash,
      underlying_execution_observed: false
    },
    authority,
    next_action: nextAction,
    relations: [...(encounter.relations ?? []), ...extraRelations],
    source_specific_standing: Object.fromEntries(liveReceipt.sources.map((source) => [source.id, source.standing]))
  };

  path.path_hash = digest(path);
  return path;
}

export class OperationLedger {
  constructor(entries = []) {
    this.entries = new Map(entries.map((entry) => [entry.operation_id, entry]));
  }

  execute(operationId, request, effect) {
    const requestDigest = digest(request);
    const existing = this.entries.get(operationId);
    if (existing) {
      if (existing.request_digest !== requestDigest) {
        const error = new Error(`operation conflict: ${operationId}`);
        error.code = 'OPERATION_CONFLICT';
        throw error;
      }
      return { replayed: true, outcome: structuredClone(existing.outcome) };
    }

    const outcome = effect();
    const entry = {
      operation_id: operationId,
      request_digest: requestDigest,
      outcome: structuredClone(outcome)
    };
    this.entries.set(operationId, entry);
    return { replayed: false, outcome: structuredClone(outcome) };
  }

  serialize() {
    return JSON.stringify([...this.entries.values()]);
  }

  static restart(serialized) {
    return new OperationLedger(JSON.parse(serialized));
  }
}
