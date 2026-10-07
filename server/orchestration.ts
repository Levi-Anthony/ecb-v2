/** ECO-202: coordinates installed URG primitives; owns no domain truth or standing. */
import { createHash } from 'node:crypto';
import {
  validateUrgRecord, type UrgRecord, type SituatedContext, type NativeRelationClaim,
  type LevelClaim, type ChangeRecord, type QuestionForward, type ProjectionRecord,
} from './urg-core.js';

export const INQUIRY_CONTRACT = 'ecos:inquiry-orchestration:0.1.1';
export type InquiryRequest = {
  query: string;
  intended_use: string;
  return_route: string;
  actor_ref: string;
  context: Partial<SituatedContext>;
  known_referent_ids?: string[];
  work_id?: string;
  limits?: { candidates?: number; structural_depth?: number; projection_chars?: number };
};
export type DiscoveryChannel = 'identity' | 'thought_hybrid' | 'native_hybrid' | 'structure';
export type DiscoveryPath = {
  source_id: string;
  target_id: string;
  relation_ref: string;
  relation_kind: string;
  /** A stored edge is encountered structure, never current-use qualification. */
  standing: 'ENCOUNTERED' | 'PROPOSED';
};
export type CandidateHit = {
  referent_id: string;
  channels: DiscoveryChannel[];
  paths: DiscoveryPath[];
  discovery_basis_digest?: string;
};
export type ChannelCoverage = {
  channel: DiscoveryChannel;
  status: 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE';
  detail: string;
};
export type DiscoveryBatch = { hits: CandidateHit[]; coverage: ChannelCoverage[]; truncated?: boolean };
export type ExactEvidence = {
  referent_id: string;
  digest: string;
  content: string;
  source_refs: string[];
  original_basis: { context: Partial<SituatedContext>; basis_ref: string; intended_use?: string } | null;
  stored_standing: unknown;
  currentness: 'CURRENT' | 'STALE' | 'UNKNOWN';
  custody_ref: string;
};
export type SemanticSignal = {
  code: 'G1' | 'G2' | 'G3';
  target_ref: string;
  basis_refs: string[];
  demonstrated_mismatch: string;
  decision_consequence: string;
  repair: string;
  evaluator_ref: string;
};
export type CandidateDecision = {
  disposition: 'ADMIT' | 'DEFER' | 'REJECT' | 'QUESTION_FORWARD';
  reason: string;
  assessment_ref: string;
  inquiry_basis_ref: string;
  candidate_digest: string;
  relation?: NativeRelationClaim;
  membership?: 'CONSTITUTIVE' | 'PARTICIPATORY' | 'EVIDENCE' | 'ANALOGY';
  level_claim_ref?: string;
  consequentiality?: 'CONSEQUENTIAL' | 'NONCONSEQUENTIAL_NOW' | 'UNKNOWN';
  /** Same digest / basis and an explicit current-use standing are all required. */
  current_use?: { currentness: 'CURRENT' | 'STALE' | 'UNKNOWN'; standing_ref: string; evidence_refs: string[] };
  question?: QuestionForward;
  signals?: SemanticSignal[];
};
export type LocatedUrgRecord = { ref: string; record: UrgRecord };
export type CoordinateChange = { before: SituatedContext; after: SituatedContext; record: ChangeRecord };
export type Disclosure = {
  records: LocatedUrgRecord[];
  changes: CoordinateChange[];
  sufficiency: { inquiry_basis_ref: string; assessment_ref: string; satisfied: boolean; unresolved_refs: string[] };
  signals?: SemanticSignal[];
};
export type Reconciliation = {
  inquiry_basis_ref: string;
  affected_old: { assessment_ref: string; disposition: 'SATISFIED' | 'UNSATISFIED' | 'UNKNOWN' };
  destination_new: { assessment_ref: string; disposition: 'SATISFIED' | 'UNSATISFIED' | 'UNKNOWN' };
  requirements: Array<{
    ref: string; direction: 'old_dependency' | 'destination_discovery'; blocking: boolean;
    disposition: 'SATISFIED' | 'UNSATISFIED' | 'UNKNOWN'; basis_refs: string[];
  }>;
  coverage_complete: boolean;
};
export type InquiryAdapters = {
  searchEvidence(request: InquiryRequest, limit: number): Promise<DiscoveryBatch>;
  discoverStructure(request: InquiryRequest, roots: string[], depth: number, limit: number): Promise<DiscoveryBatch>;
  fetchEvidence(id: string): Promise<ExactEvidence | null>;
  /** Attribution and domain validity are responsibilities of the injected evaluator. */
  disclose?(request: InquiryRequest, evidence: ExactEvidence[]): Promise<Disclosure>;
  evaluateCandidate?(request: InquiryRequest, hit: CandidateHit, evidence: ExactEvidence, basisRef: string): Promise<CandidateDecision>;
  reconcile?(request: InquiryRequest, admitted: CandidateAccount[], changes: CoordinateChange[], basisRef: string): Promise<Reconciliation>;
};
export type CandidateAccount = {
  hit: CandidateHit;
  evidence: ExactEvidence | null;
  decision: CandidateDecision;
};
export type QuadrantCoverage = Record<'UL' | 'UR' | 'LL' | 'LR', { status: 'UNEXAMINED' | 'EXAMINED'; refs: string[] }>;
export type WorkingProjection = {
  edition: string;
  content: string;
  source_refs: string[];
  omissions: string[];
  persistence: 'NOT_PRESERVED';
};
/** Derived receipt over the existing inquiry contract; not a new URG primitive or relevance object. */
export type IndexicalBindingReceipt = {
  basis_ref: string;
  query: string;
  intended_use: string;
  actor_ref: string;
  context: Partial<SituatedContext>;
  discovery_seed_refs: string[];
  declared_work_ref: string | null;
  execution: {
    candidate_limit: number;
    structural_depth: number;
    projection_chars: number;
    return_route: string;
  };
};
export type InquiryProjectionDelta = {
  source_basis_ref: string;
  destination_basis_ref: string;
  changed_coordinates: string[];
  coordinate_classes: Array<'R_OR_B' | 'G_OR_F'>;
  semantic_basis_changed: boolean;
  state_record_changed: boolean;
  evidence_or_standing_changed: boolean;
  execution_envelope_changed: boolean;
  requires_requalification: boolean;
};
export type InquiryResult = {
  contract: typeof INQUIRY_CONTRACT;
  inquiry_basis_ref: string;
  indexical_binding: IndexicalBindingReceipt;
  situated_basis: Partial<SituatedContext>;
  intended_use: string;
  candidates: CandidateAccount[];
  admitted: CandidateAccount[];
  quadrant_coverage: QuadrantCoverage;
  records: LocatedUrgRecord[];
  changes: CoordinateChange[];
  reconciliation: Reconciliation;
  discovery_coverage: ChannelCoverage[];
  questions_forward: QuestionForward[];
  signals: SemanticSignal[];
  disposition: 'READY' | 'HOLD';
  projection: WorkingProjection;
  reentry: { return_route: string; unresolved_refs: string[]; condition: string };
};

/** Canonical edition, not a claim of custody. Object key insertion order is irrelevant. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value)
    .filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
export function digest(value: unknown): string { return createHash('sha256').update(canonical(value)).digest('hex'); }
export function inquiryBasisRef(request: InquiryRequest): string {
  return `sha256:${digest({ query: request.query, intended_use: request.intended_use, context: request.context, actor_ref: request.actor_ref })}`;
}
export function indexicalBindingReceipt(
  request: InquiryRequest,
  execution: { candidate_limit: number; structural_depth: number; projection_chars: number },
): IndexicalBindingReceipt {
  return {
    basis_ref: inquiryBasisRef(request),
    query: request.query,
    intended_use: request.intended_use,
    actor_ref: request.actor_ref,
    context: structuredClone(request.context),
    discovery_seed_refs: [...new Set([...(request.known_referent_ids ?? []), request.context.referent_id].filter(nonblank))],
    declared_work_ref: request.work_id ?? null,
    execution: { ...execution, return_route: request.return_route },
  };
}
const nonblank = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;
const refs = (v: unknown): v is string[] => Array.isArray(v) && v.length > 0 && v.every(nonblank);
const same = (a: unknown, b: unknown) => canonical(a) === canonical(b);
const coordinateKeys = ['referent_id', 'boundary_ref', 'governing_orientation_ref', 'mapper_ref', 'frame_ref', 'access_ref'] as const;
const sameSeat = (a: Partial<SituatedContext>, b: Partial<SituatedContext>) => coordinateKeys.every(k => a[k] === b[k]);

export function questionForward(request: InquiryRequest, basisRef: string, target: string, question: string, consequence: string): QuestionForward {
  return {
    kind: 'question_forward', unresolved_ref: target, basis_ref: basisRef,
    current_standing_ref: 'ecos:inquiry:unresolved', discriminator_question: question,
    paired_signal_scenario: 'An attributable basis qualifies the relation/use; otherwise preserve it as unresolved candidate structure.',
    evidence_change_criteria: 'Recover exact supporting records or supply an attributable evaluation bound to this inquiry and these editions.',
    alternative_signal_routing: 'Enrich, explicitly transform the situated basis, or defer the candidate; reconcile before reliance.',
    decision_consequence: consequence, return_route: request.return_route,
    reentry_condition: `Resolve ${target} against ${basisRef} and reenter ${request.return_route}.`,
  };
}

function mergeHits(batches: DiscoveryBatch[], known: string[], limit: number) {
  const hits = new Map<string, CandidateHit>();
  const ordered: CandidateHit[] = [...known.map(referent_id => ({ referent_id, channels: ['identity'] as DiscoveryChannel[], paths: [] })), ...batches.flatMap(b => b.hits)];
  for (const hit of ordered) {
    const prior = hits.get(hit.referent_id);
    if (!prior) hits.set(hit.referent_id, { ...hit, channels: [...hit.channels], paths: [...hit.paths] });
    else {
      prior.channels = [...new Set([...prior.channels, ...hit.channels])];
      prior.paths = [...new Map([...prior.paths, ...hit.paths].map(p => [canonical(p), p])).values()];
      // Conflicting search editions must not erase the stale-discovery check.
      if (hit.discovery_basis_digest && prior.discovery_basis_digest && hit.discovery_basis_digest !== prior.discovery_basis_digest)
        prior.discovery_basis_digest = 'MIXED_DISCOVERY_EDITIONS';
      else prior.discovery_basis_digest ??= hit.discovery_basis_digest;
    }
  }
  return { hits: [...hits.values()].slice(0, limit), truncated: hits.size > limit || batches.some(b => b.truncated) };
}

function validChange(change: CoordinateChange, request: InquiryRequest): boolean {
  const { before, after, record } = change;
  if (!validateUrgRecord(record).valid || record.source_basis_ref !== inquiryBasisRef({ ...request, context: before })
    || record.destination_basis_ref !== inquiryBasisRef({ ...request, context: after })
    || record.subject_referent_id !== before.referent_id) return false;
  const changed = coordinateKeys.filter(k => before[k] !== after[k]);
  switch (record.change_kind) {
    case 'Enrich': return changed.length === 0;
    case 'ReviseBoundary': return changed.length === 1 && changed[0] === 'boundary_ref';
    case 'Reseat': return before.referent_id !== after.referent_id;
    case 'Reorient': return changed.length === 1 && changed[0] === 'governing_orientation_ref';
    case 'ChangeFrame': return changed.length > 0 && changed.every(k => ['mapper_ref', 'frame_ref', 'access_ref'].includes(k));
    default: return changed.length === 0;
  }
}
function validatedSignal(s: SemanticSignal): boolean {
  return ['G1', 'G2', 'G3'].includes(s.code) && nonblank(s.target_ref) && refs(s.basis_refs)
    && [s.demonstrated_mismatch, s.decision_consequence, s.repair, s.evaluator_ref].every(nonblank);
}

/** One bounded pass. New consequential contact reenters with exact records; no invented closure. */
export async function orchestrateInquiry(input: InquiryRequest, adapters: InquiryAdapters): Promise<InquiryResult> {
  if (![input.query, input.intended_use, input.return_route, input.actor_ref].every(nonblank)) throw new Error('inquiry_context_required');
  const request: InquiryRequest = structuredClone(input);
  const limit = request.limits?.candidates ?? 10, depth = request.limits?.structural_depth ?? 1;
  const projectionBudget = request.limits?.projection_chars ?? 24000;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(depth) || depth < 0 || depth > 3
    || !Number.isInteger(projectionBudget) || projectionBudget < 1024 || projectionBudget > 100000) throw new Error('inquiry_resource_limit');
  const known = [...new Set([...(request.known_referent_ids ?? []), request.context.referent_id].filter(nonblank))];
  const questions: QuestionForward[] = [], signals: SemanticSignal[] = [];
  let basisRef = inquiryBasisRef(request);
  const ask = (target: string, question: string, consequence: string) => questions.push(questionForward(request, basisRef, target, question, consequence));
  async function discover(run: () => Promise<DiscoveryBatch>, channel: DiscoveryChannel): Promise<DiscoveryBatch> {
    try { return await run(); } catch { return { hits: [], coverage: [{ channel, status: 'UNAVAILABLE', detail: 'Adapter failure; recover the channel before claiming discovery sufficiency.' }] }; }
  }
  const search = await discover(() => adapters.searchEvidence(structuredClone(request), limit), 'thought_hybrid');
  const first = mergeHits([search], known, limit);
  const structure = await discover(() => adapters.discoverStructure(structuredClone(request), first.hits.map(h => h.referent_id), depth, limit), 'structure');
  const merged = mergeHits([structure, search], known, limit);
  const coverage = [...search.coverage, ...structure.coverage];
  const snapshots = await Promise.all(merged.hits.map(async hit => {
    try {
      const recovered = await adapters.fetchEvidence(hit.referent_id);
      return recovered && recovered.referent_id === hit.referent_id ? structuredClone(recovered) : null;
    } catch { return null; }
  }));
  const exact = snapshots.filter((e): e is ExactEvidence => e !== null);
  let disclosure: Disclosure;
  try { disclosure = adapters.disclose ? await adapters.disclose(structuredClone(request), structuredClone(exact)) : {
    records: [], changes: [], sufficiency: { inquiry_basis_ref: basisRef, assessment_ref: 'ecos:inquiry:semantic-adapter-unavailable', satisfied: false, unresolved_refs: ['semantic_disclosure'] },
  }; } catch { disclosure = { records: [], changes: [], sufficiency: { inquiry_basis_ref: basisRef, assessment_ref: 'ecos:inquiry:semantic-adapter-failed', satisfied: false, unresolved_refs: ['semantic_disclosure'] } }; }
  const acceptedChanges: CoordinateChange[] = [];
  for (const change of disclosure.changes) {
    if (!sameSeat(change.before, request.context) || !validChange(change, request)) {
      ask('coordinate_change', 'Which typed operation truthfully connects the exact source and destination bases?', 'Reject the unaccounted coordinate change and redisclose at the last supported seat.');
      break;
    }
    request.context = change.after;
    basisRef = inquiryBasisRef(request);
    acceptedChanges.push(change);
  }
  for (const s of disclosure.signals ?? []) if (validatedSignal(s)) signals.push(s);
  const records: LocatedUrgRecord[] = [];
  const quadrants: QuadrantCoverage = { UL: { status: 'UNEXAMINED', refs: [] }, UR: { status: 'UNEXAMINED', refs: [] }, LL: { status: 'UNEXAMINED', refs: [] }, LR: { status: 'UNEXAMINED', refs: [] } };
  // Mechanical seating tooth runs before any record is admitted as quadrant coverage.
  for (const entry of [...disclosure.records].sort((a, b) => Number(b.record.kind === 'level') - Number(a.record.kind === 'level'))) {
    if (!nonblank(entry.ref) || !validateUrgRecord(entry.record).valid
      || ('context' in entry.record && !sameSeat(entry.record.context, request.context))) {
      ask(entry.ref || 'urg_record', 'Recover a conforming record over the same seated referent, boundary and inquiry coordinates.', 'This record cannot count as present-use disclosure.');
      continue;
    }
    if ('fidelity' in entry.record && entry.record.fidelity.disposition === 'RELIED_FOR_DECLARED_USE'
      && (!refs(entry.record.fidelity.evidence_refs) || !nonblank(entry.record.fidelity.currentness_ref))) {
      ask(entry.ref, 'What exact evidence and current-use basis warrant reliance on this disclosed record?', 'Structural validation alone does not qualify standing.');
      continue;
    }
    records.push(entry);
    if (entry.record.kind === 'question_forward') questions.push(entry.record);
    if (entry.record.kind === 'quadrant' && entry.record.result === 'QUADRANT_POSITION' && entry.record.fidelity.coverage === 'EXAMINED') {
      const key = `${entry.record.seat === 'Constitutive' ? 'U' : 'L'}${entry.record.burden === 'Governing' ? 'L' : 'R'}` as keyof QuadrantCoverage;
      quadrants[key].status = 'EXAMINED'; quadrants[key].refs.push(entry.ref);
      if (['UNRESOLVED', 'CONDITIONAL_SENSORED'].includes(entry.record.fidelity.disposition ?? ''))
        ask(entry.ref, 'What consequential uncertainty remains at this quadrant position?', 'Resolve the declared disclosure before READY.');
    }
  }
  const candidates: CandidateAccount[] = [];
  for (let i = 0; i < merged.hits.length; i++) {
    const hit = merged.hits[i], evidence = snapshots[i];
    let decision: CandidateDecision = { disposition: 'DEFER', reason: 'No attributable present-relation/current-use evaluation is available.',
      assessment_ref: 'ecos:inquiry:candidate-only', inquiry_basis_ref: basisRef, candidate_digest: evidence?.digest ?? 'UNKNOWN' };
    if (!evidence || evidence.referent_id !== hit.referent_id || !nonblank(evidence.digest) || !refs(evidence.source_refs) || !nonblank(evidence.custody_ref)) {
      ask(hit.referent_id, 'Recover this candidate exactly, including native edition and source custody.', 'Similarity or a missing snapshot cannot enter the composition.');
    } else if (hit.discovery_basis_digest && hit.discovery_basis_digest !== evidence.digest) {
      decision.reason = 'Discovery basis is stale or mixed; exact recovery is retained without reliance.';
      ask(hit.referent_id, 'Rediscover/requalify this candidate against its recovered edition.', 'The representation basis changed before exact fetch.');
    } else if (adapters.evaluateCandidate) {
      try { decision = await adapters.evaluateCandidate(structuredClone(request), structuredClone(hit), structuredClone(evidence), basisRef); }
      catch { decision.reason = 'Present-use evaluation failed; candidate remains deferred.'; }
    }
    for (const s of decision.signals ?? []) if (validatedSignal(s)) signals.push(s);
    if (!['ADMIT', 'DEFER', 'REJECT', 'QUESTION_FORWARD'].includes(decision.disposition)
      || !nonblank(decision.reason) || !nonblank(decision.assessment_ref)
      || decision.inquiry_basis_ref !== basisRef || decision.candidate_digest !== (evidence?.digest ?? 'UNKNOWN')) {
      decision = { disposition: 'QUESTION_FORWARD', reason: 'Candidate disposition is unbound or unattributed.', assessment_ref: INQUIRY_CONTRACT,
        inquiry_basis_ref: basisRef, candidate_digest: evidence?.digest ?? 'UNKNOWN' };
    }
    if (decision.disposition === 'ADMIT') {
      const relation = decision.relation;
      const level = records.find(r => r.ref === decision.level_claim_ref)?.record as LevelClaim | undefined;
      const qualified = evidence && decision.candidate_digest === evidence.digest && decision.inquiry_basis_ref === basisRef
        && nonblank(decision.assessment_ref) && nonblank(decision.reason)
        && decision.current_use?.currentness === 'CURRENT' && evidence.currentness !== 'STALE'
        && nonblank(decision.current_use.standing_ref) && refs(decision.current_use.evidence_refs)
        && relation && validateUrgRecord(relation).valid && relation.situated_basis_ref === basisRef
        && relation.fidelity.disposition === 'RELIED_FOR_DECLARED_USE' && refs(relation.fidelity.evidence_refs)
        && relation.participants.some(p => p.referent_id === hit.referent_id)
        && relation.participants.some(p => p.referent_id === request.context.referent_id)
        && (decision.membership !== 'CONSTITUTIVE' || (level?.kind === 'level' && level.result === 'LEVEL_WITNESSED'
          && level.constituent_referent_ids?.includes(hit.referent_id) && sameSeat(level.context, request.context)
          && level.organization_ref !== decision.assessment_ref && level.dependence_witness_ref !== decision.assessment_ref));
      if (!qualified) {
        signals.push({ code: 'G2', target_ref: hit.referent_id, basis_refs: [basisRef, decision.assessment_ref || 'missing-assessment'],
          demonstrated_mismatch: 'Proposed admission lacks the exact current inquiry/edition, typed relation or independent constitutive witness it asserts.',
          decision_consequence: 'Admission is denied; preserve the candidate and requalify.', repair: 'Restore source/current-use standing and, for constitution, recover the independent Level witness.', evaluator_ref: INQUIRY_CONTRACT });
        decision = { ...decision, disposition: 'QUESTION_FORWARD', reason: 'Admission rejected by structural/current-use preflight.' };
      }
    }
    if (decision.question && validateUrgRecord(decision.question).valid) questions.push(decision.question);
    else if (decision.disposition === 'QUESTION_FORWARD' || (decision.disposition === 'DEFER' && decision.consequentiality !== 'NONCONSEQUENTIAL_NOW'))
      ask(hit.referent_id, 'What attributable typed relation makes this exact material consequential for the present declared use?', 'Admit only after applicability, currentness and standing are qualified; otherwise keep it dormant.');
    candidates.push({ hit, evidence, decision });
  }
  let admitted = candidates.filter(c => c.decision.disposition === 'ADMIT');
  let reconciliation: Reconciliation;
  try { reconciliation = adapters.reconcile ? await adapters.reconcile(structuredClone(request), structuredClone(admitted), structuredClone(acceptedChanges), basisRef) : {
    inquiry_basis_ref: basisRef, affected_old: { assessment_ref: 'ecos:inquiry:old-review-unknown', disposition: 'UNKNOWN' },
    destination_new: { assessment_ref: 'ecos:inquiry:new-coverage-unknown', disposition: 'UNKNOWN' }, requirements: [], coverage_complete: false,
  }; } catch { reconciliation = { inquiry_basis_ref: basisRef, affected_old: { assessment_ref: 'ecos:inquiry:old-review-failed', disposition: 'UNKNOWN' },
    destination_new: { assessment_ref: 'ecos:inquiry:new-coverage-failed', disposition: 'UNKNOWN' }, requirements: [], coverage_complete: false }; }
  if (reconciliation.inquiry_basis_ref !== basisRef || reconciliation.affected_old.disposition !== 'SATISFIED'
    || reconciliation.destination_new.disposition !== 'SATISFIED' || !reconciliation.coverage_complete
    || ![reconciliation.affected_old.assessment_ref, reconciliation.destination_new.assessment_ref].every(nonblank)
    || !['old_dependency', 'destination_discovery'].every(d => reconciliation.requirements.some(r => r.direction === d))
    || reconciliation.requirements.some(r => r.blocking && (r.disposition !== 'SATISFIED' || !refs(r.basis_refs))))
    ask('reconciliation', 'Check affected old support AND newly exposed destination obligations against this inquiry basis.', 'Neither unchanged dependencies nor one-sided review qualifies the current use.');
  // Recovered editions can change during a pass; deny carryover on failed/mismatched re-fetch.
  for (const member of admitted) {
    let latest: ExactEvidence | null = null;
    try { latest = await adapters.fetchEvidence(member.hit.referent_id); } catch { /* unknown is visible below */ }
    if (!latest || latest.referent_id !== member.hit.referent_id || latest.digest !== member.evidence!.digest || latest.currentness === 'STALE') {
      member.decision = { ...member.decision, disposition: 'QUESTION_FORWARD', reason: 'Exit revalidation failed; remove this member from current-use composition.' };
      reconciliation.coverage_complete = false;
      reconciliation.affected_old.disposition = 'UNKNOWN';
      ask(member.hit.referent_id, 'Requalify the relied input after its edition/currentness changed or became unavailable.', 'Current-use carryover cannot survive a stale or unknown exit check.');
    }
  }
  admitted = candidates.filter(c => c.decision.disposition === 'ADMIT');
  if (!coordinateKeys.every(k => nonblank(request.context[k]))) ask('situated_basis', 'Establish focal identity, boundary, PGO, mapper, frame and access at the declared-use resolution.', 'Partial seating cannot manufacture sufficiency.');
  for (const [key, q] of Object.entries(quadrants)) if (q.status === 'UNEXAMINED') ask(`quadrant:${key}`, 'Examine this installed quadrant obligation over the same referent and boundary.', 'Omission does not erase the disclosure obligation.');
  if (!disclosure.sufficiency.satisfied || disclosure.sufficiency.inquiry_basis_ref !== basisRef || !nonblank(disclosure.sufficiency.assessment_ref)
    || disclosure.sufficiency.unresolved_refs.length > 0) ask('sufficiency', 'Supply the attributable declared-use sufficiency assessment and decision-changing unknowns.', 'READY requires earned stopping, not a resource limit or coherent generated text.');
  if (coverage.some(c => c.status !== 'AVAILABLE')) ask('discovery_coverage', 'Repair degraded channels or qualify why their missing coverage cannot change this declared use.', 'Discovery failures must remain visible.');
  if (merged.truncated) ask('discovery_limit', 'Qualify omitted candidates or reenter with a discriminating bounded expansion.', 'Resource truncation does not establish ontological or discovery completeness.');
  if (signals.length) ask('diagnostic_escalation', 'Repair the exact signaled layer, then resume from the last supported basis.', 'An unresolved governing diagnostic interrupts downstream reliance.');
  const uniqueQuestions = [...new Map(questions.map(q => [canonical(q), q])).values()];
  const indexicalBinding = indexicalBindingReceipt(request, {
    candidate_limit: limit, structural_depth: depth, projection_chars: projectionBudget,
  });
  const irreducibleBinding = canonical({ contract: INQUIRY_CONTRACT, indexical_binding: indexicalBinding });
  if (irreducibleBinding.length + 128 > projectionBudget) throw new Error('inquiry_projection_budget_below_binding_receipt');
  const omitted: string[] = [];
  const body: Record<string, unknown> = { contract: INQUIRY_CONTRACT, basis_ref: basisRef, indexical_binding: indexicalBinding,
    context: request.context, intended_use: request.intended_use,
    members: candidates.map(c => ({ referent_id: c.hit.referent_id, digest: c.evidence?.digest ?? null, source_refs: c.evidence?.source_refs ?? [],
      original_basis: c.evidence?.original_basis ?? null, stored_standing: c.evidence?.stored_standing ?? null,
      decision: c.decision, channels: c.hit.channels, paths: c.hit.paths, exact_excerpt: '' })),
    quadrant_coverage: quadrants, records, changes: acceptedChanges, reconciliation, discovery_coverage: coverage,
    questions_forward: uniqueQuestions, signals };
  // Exact excerpts are expendable projection content; metadata is never silently cut.
  const members = body.members as Array<Record<string, unknown>>;
  let available = Math.max(0, projectionBudget - canonical(body).length - 100);
  for (let i = 0; i < members.length; i++) {
    const content = candidates[i].evidence?.content ?? '';
    const share = Math.floor(available / (members.length - i));
    const excerpt = content.slice(0, Math.floor(share / 6)); // worst-case JSON escaping
    members[i].exact_excerpt = excerpt; available -= canonical(excerpt).length;
    if (excerpt.length < content.length) omitted.push(`Exact content shortened for ${candidates[i].hit.referent_id}; recover by its retained identity/edition.`);
  }
  let projected = canonical(body);
  if (projected.length > projectionBudget) {
    omitted.push('Projection metadata exceeds the caller budget; retain full typed result and widen the projection budget at reentry.');
    uniqueQuestions.push(questionForward(request, basisRef, 'projection_limit', 'Recover the full typed account or increase the projection budget.', 'A reduced projection cannot supply READY.'));
    projected = canonical({ contract: INQUIRY_CONTRACT, basis_ref: basisRef, indexical_binding: indexicalBinding, disposition: 'HOLD',
      candidate_refs: candidates.map(c => c.hit.referent_id), unresolved_refs: [...new Set(uniqueQuestions.map(q => q.unresolved_ref))], omissions: omitted.slice(-1) });
    if (projected.length > projectionBudget) projected = canonical({ contract: INQUIRY_CONTRACT, basis_ref: basisRef,
      indexical_binding: indexicalBinding, disposition: 'HOLD', reason: 'projection_budget_exceeded' });
    if (projected.length > projectionBudget) throw new Error('inquiry_projection_budget_below_binding_receipt');
  }
  const unresolved = [...new Set(uniqueQuestions.map(q => q.unresolved_ref))];
  return { contract: INQUIRY_CONTRACT, inquiry_basis_ref: basisRef, indexical_binding: indexicalBinding,
    situated_basis: request.context, intended_use: request.intended_use,
    candidates, admitted, quadrant_coverage: quadrants, records, changes: acceptedChanges, reconciliation, discovery_coverage: coverage,
    questions_forward: uniqueQuestions, signals, disposition: uniqueQuestions.length ? 'HOLD' : 'READY',
    projection: { edition: digest(projected), content: projected, source_refs: [...new Set(exact.flatMap(e => e.source_refs))], omissions: omitted, persistence: 'NOT_PRESERVED' },
    reentry: { return_route: request.return_route, unresolved_refs: unresolved, condition: unresolved.length ? 'Resolve the listed discriminators against the exact current basis and editions, then reenter.' : 'Reenter on new evidence, changed PGO/frame/boundary or a current-use challenge.' } };
}

function relianceSnapshot(result: InquiryResult) {
  return result.candidates.map(c => ({
    referent_id: c.hit.referent_id,
    digest: c.evidence?.digest ?? null,
    stored_standing: c.evidence?.stored_standing ?? null,
    evidence_currentness: c.evidence?.currentness ?? 'UNKNOWN',
    disposition: c.decision.disposition,
    assessment_ref: c.decision.assessment_ref,
    current_use: c.decision.current_use ?? null,
    relation_fidelity: c.decision.relation?.fidelity ?? null,
  })).sort((a, b) => a.referent_id.localeCompare(b.referent_id));
}
/** Derived comparison over two inquiry results; it creates no Change/State/standing by itself. */
export function projectionDelta(before: InquiryResult, after: InquiryResult): InquiryProjectionDelta {
  const changedCoordinates = coordinateKeys.filter(k => before.situated_basis[k] !== after.situated_basis[k]);
  const coordinateClasses: InquiryProjectionDelta['coordinate_classes'] = [];
  if (changedCoordinates.some(k => ['referent_id', 'boundary_ref'].includes(k))) coordinateClasses.push('R_OR_B');
  if (changedCoordinates.some(k => ['governing_orientation_ref', 'mapper_ref', 'frame_ref', 'access_ref'].includes(k))) coordinateClasses.push('G_OR_F');
  const stateRecordChanged = !same(
    before.records.filter(r => r.record.kind === 'state'),
    after.records.filter(r => r.record.kind === 'state'),
  );
  const evidenceOrStandingChanged = !same(relianceSnapshot(before), relianceSnapshot(after));
  const executionEnvelopeChanged = !same(
    { discovery_seed_refs: before.indexical_binding.discovery_seed_refs, declared_work_ref: before.indexical_binding.declared_work_ref, execution: before.indexical_binding.execution },
    { discovery_seed_refs: after.indexical_binding.discovery_seed_refs, declared_work_ref: after.indexical_binding.declared_work_ref, execution: after.indexical_binding.execution },
  );
  const semanticBasisChanged = before.inquiry_basis_ref !== after.inquiry_basis_ref;
  return {
    source_basis_ref: before.inquiry_basis_ref,
    destination_basis_ref: after.inquiry_basis_ref,
    changed_coordinates: changedCoordinates,
    coordinate_classes: coordinateClasses,
    semantic_basis_changed: semanticBasisChanged,
    state_record_changed: stateRecordChanged,
    evidence_or_standing_changed: evidenceOrStandingChanged,
    execution_envelope_changed: executionEnvelopeChanged,
    requires_requalification: semanticBasisChanged || stateRecordChanged || evidenceOrStandingChanged || executionEnvelopeChanged,
  };
}

/** Explicit preservation capability remains with the existing artifact adapter/caller. */
export async function preserveInquiryProjection(result: InquiryResult, operationId: string, adapter: {
  createArtifact(input: { operationId: string; content: string }): Promise<{ artifact: { id: string; content: string } }>;
  fetchArtifact(id: string): Promise<{ id: string; content: string } | null>;
}): Promise<{ artifact_id: string; edition: string; record: ProjectionRecord }> {
  const context = result.situated_basis;
  if (!coordinateKeys.every(k => nonblank(context[k]))) throw new Error('projection_binding_basis_incomplete');
  const saved = await adapter.createArtifact({ operationId, content: result.projection.content });
  const exact = await adapter.fetchArtifact(saved.artifact.id);
  if (!exact || exact.content !== result.projection.content) throw new Error('projection_custody_mismatch');
  const record: ProjectionRecord = { kind: 'projection', projection_id: exact.id,
    mapped_referent_ids: [...new Set([...result.candidates.map(c => c.hit.referent_id), result.situated_basis.referent_id].filter(nonblank))], mapped_claim_refs: result.records.map(r => r.ref),
    mapper_ref: context.mapper_ref!, mapping_relation_ref: INQUIRY_CONTRACT,
    governing_orientation_ref: context.governing_orientation_ref!, frame_ref: context.frame_ref!,
    access_ref: context.access_ref!, scope_resolution_ref: result.inquiry_basis_ref,
    evidence_basis_ref: result.projection.edition, content_ref: exact.id,
    fidelity: { coverage: 'EXAMINED', activation: 'DORMANT', disposition: 'UNRESOLVED', custody_ref: exact.id },
    omissions: result.projection.omissions, source_refs: result.projection.source_refs };
  if (!validateUrgRecord(record).valid) throw new Error('projection_record_invalid');
  return { artifact_id: exact.id, edition: result.projection.edition, record };
}
