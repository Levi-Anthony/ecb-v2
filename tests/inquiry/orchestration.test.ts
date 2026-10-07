import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  orchestrateInquiry, inquiryBasisRef, digest, preserveInquiryProjection, projectionDelta,
  type InquiryRequest, type InquiryAdapters, type ExactEvidence, type Disclosure, type CandidateDecision,
} from '../../server/orchestration.ts';
import type { SituatedContext, LevelClaim, ChangeRecord } from '../../server/urg-core.ts';

// Constructed semantic evaluations test coordination and denial, not empirical semantic adequacy.
const focal = '00000000-0000-4000-8000-000000000001', prior = '00000000-0000-4000-8000-000000000002';
const request: InquiryRequest = { query: 'How should a software service retain responsibility across changing suppliers?',
  intended_use: 'Select a responsibility-accounting design', return_route: 'fixture:responsibility-work', actor_ref: 'fixture:evaluator',
  context: { referent_id: focal, boundary_ref: 'fixture:service-boundary', governing_orientation_ref: 'fixture:software-service',
    mapper_ref: 'fixture:mapper', frame_ref: 'fixture:design-frame', access_ref: 'fixture:source-access' } };
const evidence = (id: string): ExactEvidence => ({ referent_id: id, digest: digest(id), content: `Exact source for ${id}`,
  source_refs: [`fixture:source:${id}`], custody_ref: id, currentness: 'CURRENT', stored_standing: 'fixture:source-claim',
  original_basis: { context: { referent_id: prior, boundary_ref: 'fixture:refrigerator', governing_orientation_ref: 'fixture:warranty-responsibility' }, basis_ref: 'fixture:original-work' } });
function disclosure(r: InquiryRequest): Disclosure {
  return { records: (['Constitutive', 'Participatory'] as const).flatMap(seat => (['Governing', 'Determinate'] as const).map(burden => ({
    ref: `fixture:${seat}:${burden}`, record: { kind: 'quadrant' as const, result: 'QUADRANT_POSITION' as const,
      context: r.context as SituatedContext, seat, burden,
      fidelity: { coverage: 'EXAMINED' as const, activation: 'DORMANT' as const, disposition: 'NONCONSEQUENTIAL_NOW' as const } },
  }))), changes: [], sufficiency: { inquiry_basis_ref: inquiryBasisRef(r), assessment_ref: 'fixture:use-review', satisfied: true, unresolved_refs: [] } };
}
function decision(r: InquiryRequest, id: string): CandidateDecision {
  const basis = inquiryBasisRef(r);
  if (id === focal) return { disposition: 'REJECT', reason: 'The focal source is already the inquiry seat, not a prior material member.',
    assessment_ref: 'fixture:seat-discriminator', inquiry_basis_ref: basis, candidate_digest: digest(id) };
  return { disposition: 'ADMIT', reason: 'A qualified structural correspondence is useful for responsibility-accounting design; it is an analogy, not co-reference.',
    assessment_ref: 'fixture:analogy-assessment', inquiry_basis_ref: basis, candidate_digest: digest(id), membership: 'ANALOGY',
    current_use: { currentness: 'CURRENT', standing_ref: 'fixture:bounded-design-use', evidence_refs: ['fixture:source-review'] },
    relation: { kind: 'native_relation', schema_ref: 'fixture:analogy-schema', schema_edition_ref: 'fixture:analogy-schema-v1', relation_kind_ref: 'fixture:structural-correspondence',
      participants: [{ role: 'present', referent_id: focal }, { role: 'prior', referent_id: id }], situated_basis_ref: basis,
      fidelity: { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'RELIED_FOR_DECLARED_USE', evidence_refs: ['fixture:source-review'] } } };
}
function adapters(): InquiryAdapters {
  return { async searchEvidence() { return { hits: [{ referent_id: prior, channels: ['native_hybrid'], paths: [] }],
    coverage: [{ channel: 'native_hybrid', status: 'AVAILABLE', detail: 'Constructed independent-PGO candidate.' }] }; },
    async discoverStructure() { return { hits: [], coverage: [{ channel: 'structure', status: 'AVAILABLE', detail: 'Constructed complete aperture.' }] }; },
    async fetchEvidence(id) { return evidence(id); }, async disclose(r) { return disclosure(r); },
    async evaluateCandidate(r, h) { return decision(r, h.referent_id); },
    async reconcile(_r, _a, _c, basis) { return { inquiry_basis_ref: basis, affected_old: { assessment_ref: 'fixture:old-review', disposition: 'SATISFIED' },
      destination_new: { assessment_ref: 'fixture:new-review', disposition: 'SATISFIED' }, coverage_complete: true,
      requirements: [{ ref: 'fixture:old', direction: 'old_dependency', blocking: true, disposition: 'SATISFIED', basis_refs: ['fixture:old-support'] },
        { ref: 'fixture:new', direction: 'destination_discovery', blocking: true, disposition: 'SATISFIED', basis_refs: ['fixture:new-obligations'] }] }; } };
}

test('cross-context candidate is recovered exactly and admitted as an analogy with bounded READY', async () => {
  const r = await orchestrateInquiry(request, adapters());
  assert.equal(r.disposition, 'READY'); assert.equal(r.admitted.length, 1);
  assert.equal(r.admitted[0].evidence?.original_basis?.context.governing_orientation_ref, 'fixture:warranty-responsibility');
  assert.equal(r.admitted[0].decision.membership, 'ANALOGY');
  assert.deepEqual(Object.values(r.quadrant_coverage).map(q => q.status), ['EXAMINED', 'EXAMINED', 'EXAMINED', 'EXAMINED']);
  assert.equal(r.projection.persistence, 'NOT_PRESERVED');
});
test('similarity cannot admit constitution without the independent Level witness', async () => {
  const a = adapters(), evaluate = a.evaluateCandidate!;
  a.evaluateCandidate = async (...args) => { const d = await evaluate(...args); return args[1].referent_id === prior ? { ...d, membership: 'CONSTITUTIVE' } : d; };
  const r = await orchestrateInquiry(request, a);
  assert.equal(r.admitted.length, 0); assert.equal(r.disposition, 'HOLD'); assert.equal(r.signals[0].code, 'G2');
});
test('independently witnessed constitution passes the same preflight', async () => {
  const a = adapters(), evaluate = a.evaluateCandidate!;
  a.evaluateCandidate = async (...args) => { const d = await evaluate(...args); return args[1].referent_id === prior ? { ...d, membership: 'CONSTITUTIVE', level_claim_ref: 'fixture:level' } : d; };
  a.disclose = async r => { const d = disclosure(r); const level: LevelClaim = { kind: 'level', context: r.context as SituatedContext,
    fidelity: { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'RELIED_FOR_DECLARED_USE', evidence_refs: ['fixture:organization-review'], currentness_ref: inquiryBasisRef(r) },
    result: 'LEVEL_WITNESSED', constituent_referent_ids: [prior], organization_ref: 'fixture:organization', dependence_witness_ref: 'fixture:asymmetric-existence-witness' };
    d.records.unshift({ ref: 'fixture:level', record: level }); return d; };
  assert.equal((await orchestrateInquiry(request, a)).disposition, 'READY');
});
test('PGO reorientation preserves R/B and invalidates the old-use assessment', async () => {
  const a = adapters();
  a.evaluateCandidate = async (_r, h) => decision(request, h.referent_id); // deliberately stale G binding
  const changed = { ...request, context: { ...request.context, governing_orientation_ref: 'fixture:accessibility' } };
  const r = await orchestrateInquiry(changed, a);
  assert.equal(r.situated_basis.referent_id, focal); assert.equal(r.situated_basis.boundary_ref, request.context.boundary_ref);
  assert.equal(r.disposition, 'HOLD'); assert.equal(r.admitted.length, 0);
});
test('typed reorientation records source/destination and rediscloses before new-use reconciliation', async () => {
  const a = adapters();
  a.disclose = async r => {
    const before = r.context as SituatedContext, after = { ...before, governing_orientation_ref: 'fixture:changed-purpose' };
    const changed = { ...r, context: after }, d = disclosure(changed);
    const record: ChangeRecord = { kind: 'change', change_kind: 'Reorient', subject_referent_id: focal,
      source_basis_ref: inquiryBasisRef(r), destination_basis_ref: inquiryBasisRef(changed), continuity_mode_ref: 'fixture:same-whole',
      affected_claim_refs: ['fixture:old-use'], affected_dependency_refs: [], requalify_refs: ['fixture:new-use'],
      fidelity: { coverage: 'EXAMINED', activation: 'ACTIVE', disposition: 'UNRESOLVED' } };
    d.changes = [{ before, after, record }]; return d;
  };
  const r = await orchestrateInquiry(request, a);
  assert.equal(r.disposition, 'READY'); assert.equal(r.changes[0].record.change_kind, 'Reorient');
  assert.equal(r.situated_basis.referent_id, focal); assert.equal(r.situated_basis.boundary_ref, request.context.boundary_ref);
});
test('ordinary quadrant traversal cannot replace the focal whole', async () => {
  const a = adapters(); a.disclose = async r => disclosure({ ...r, context: { ...r.context, referent_id: prior } });
  const r = await orchestrateInquiry(request, a);
  assert.equal(r.disposition, 'HOLD'); assert.equal(r.situated_basis.referent_id, focal);
  assert.equal(r.quadrant_coverage.UL.status, 'UNEXAMINED');
});
test('a one-sided reconciliation or blocking unknown cannot produce READY', async () => {
  for (const mode of ['missing_new', 'unknown'] as const) {
    const a = adapters(), reconcile = a.reconcile!;
    a.reconcile = async (...args) => { const r = await reconcile(...args); if (mode === 'missing_new') r.requirements = r.requirements.filter(x => x.direction === 'old_dependency');
      else r.requirements[1].disposition = 'UNKNOWN'; return r; };
    const r = await orchestrateInquiry(request, a); assert.equal(r.disposition, 'HOLD'); assert(r.questions_forward.some(q => q.unresolved_ref === 'reconciliation'));
  }
});
test('input becoming stale at exit is removed from active composition', async () => {
  const a = adapters(); let oldFetches = 0;
  a.fetchEvidence = async id => { const e = evidence(id); if (id === prior && ++oldFetches > 1) e.digest = digest('changed'); return e; };
  const r = await orchestrateInquiry(request, a);
  assert.equal(r.disposition, 'HOLD'); assert.equal(r.admitted.length, 0); assert.equal(r.reconciliation.coverage_complete, false);
});
test('candidate rejection must also be attributable and bound to this inquiry', async () => {
  const a = adapters(); a.evaluateCandidate = async () => ({ disposition: 'REJECT', reason: 'not useful', assessment_ref: '', inquiry_basis_ref: 'wrong', candidate_digest: '' });
  const r = await orchestrateInquiry(request, a); assert.equal(r.disposition, 'HOLD'); assert(r.candidates.every(c => c.decision.disposition === 'QUESTION_FORWARD'));
});
test('semantic adapter cannot mutate the seat invisibly', async () => {
  const a = adapters(); a.disclose = async r => { r.context.boundary_ref = 'fixture:unannounced-boundary'; return disclosure(r); };
  const r = await orchestrateInquiry(request, a); assert.equal(r.situated_basis.boundary_ref, request.context.boundary_ref); assert.equal(r.disposition, 'HOLD');
});
test('failed/degraded aperture and resource truncation fail visibly without inventing G1', async () => {
  const a = adapters(); a.discoverStructure = async () => { throw new Error('offline'); };
  const r = await orchestrateInquiry(request, a); assert.equal(r.disposition, 'HOLD'); assert.equal(r.signals.length, 0);
  const b = adapters(); b.discoverStructure = async () => ({ hits: [], coverage: [{ channel: 'structure', status: 'AVAILABLE', detail: 'limited' }], truncated: true });
  const t = await orchestrateInquiry(request, b); assert.equal(t.disposition, 'HOLD'); assert(t.questions_forward.some(q => q.unresolved_ref === 'discovery_limit')); assert.equal(t.signals.length, 0);
});
test('G1/G3 require exact semantic mismatch attribution; ordinary real cycles are not diagnostics', async () => {
  for (const code of ['G1', 'G3'] as const) {
    const a = adapters(); a.disclose = async r => ({ ...disclosure(r), signals: [{ code, target_ref: 'fixture:failed-realization', basis_refs: ['fixture:governing-condition'],
      demonstrated_mismatch: code === 'G1' ? 'The sole supporting premise is the asserted boundary itself.' : 'The implementation removes the occupant control required by its own purpose.',
      decision_consequence: 'Stop this derivation.', repair: 'Repair the named layer.', evaluator_ref: 'fixture:semantic-evaluator' }] });
    const r = await orchestrateInquiry(request, a); assert.equal(r.disposition, 'HOLD'); assert.equal(r.signals[0].code, code);
  }
});
test('compact projection keeps exact identities/editions and discloses content omissions', async () => {
  const a = adapters(); a.fetchEvidence = async id => ({ ...evidence(id), content: 'Long exact content. '.repeat(10000) });
  const r = await orchestrateInquiry({ ...request, limits: { projection_chars: 7000 } }, a);
  assert(r.projection.content.length <= 7000); assert(r.projection.omissions.length > 0);
  assert(r.projection.content.includes(prior)); assert(r.projection.content.includes(digest(prior)));
});
test('projection preservation uses existing immutable artifact custody and exact fetch', async () => {
  const r = await orchestrateInquiry(request, adapters()); let content = '';
  const p = await preserveInquiryProjection(r, 'fixture:operation', {
    async createArtifact(input) { content = input.content; return { artifact: { id: '00000000-0000-4000-8000-000000000003', content } }; },
    async fetchArtifact(id) { return { id, content }; },
  });
  assert.equal(p.record.fidelity.disposition, 'UNRESOLVED'); assert.equal(p.record.fidelity.custody_ref, p.artifact_id);
  await assert.rejects(preserveInquiryProjection(r, 'fixture:operation', {
    async createArtifact() { return { artifact: { id: prior, content: '' } }; }, async fetchArtifact() { return { id: prior, content: 'corrupted' }; },
  }), /custody_mismatch/);
});


test('indexical binding receipt makes the semantic basis recoverable while keeping execution envelope distinct', async () => {
  const enriched: InquiryRequest = { ...request, known_referent_ids: [prior], work_id: '00000000-0000-4000-8000-000000000003',
    limits: { candidates: 7, structural_depth: 2, projection_chars: 9000 } };
  const r = await orchestrateInquiry(enriched, adapters());
  assert.equal(r.indexical_binding.basis_ref, r.inquiry_basis_ref);
  assert.equal(r.indexical_binding.query, enriched.query);
  assert.equal(r.indexical_binding.actor_ref, enriched.actor_ref);
  assert.deepEqual([...r.indexical_binding.discovery_seed_refs].sort(), [focal, prior].sort());
  assert.equal(r.indexical_binding.declared_work_ref, enriched.work_id);
  assert.equal(r.indexical_binding.execution.return_route, enriched.return_route);
  const projected = JSON.parse(r.projection.content);
  assert.deepEqual(projected.indexical_binding, r.indexical_binding);
  assert.equal(inquiryBasisRef({
    query: r.indexical_binding.query, intended_use: r.indexical_binding.intended_use,
    actor_ref: r.indexical_binding.actor_ref, return_route: r.indexical_binding.execution.return_route,
    context: r.indexical_binding.context,
  }), r.indexical_binding.basis_ref);
});

test('projection delta distinguishes R/B change, G/F change and evidence/standing change without creating standing', async () => {
  const before = await orchestrateInquiry(request, adapters());
  const reoriented = await orchestrateInquiry({ ...request, context: { ...request.context, governing_orientation_ref: 'fixture:new-purpose' } }, adapters());
  const g = projectionDelta(before, reoriented);
  assert(g.coordinate_classes.includes('G_OR_F')); assert(!g.coordinate_classes.includes('R_OR_B'));
  assert.equal(g.semantic_basis_changed, true); assert.equal(g.requires_requalification, true);
  const rebound = await orchestrateInquiry({ ...request, context: { ...request.context, boundary_ref: 'fixture:new-boundary' } }, adapters());
  assert(projectionDelta(before, rebound).coordinate_classes.includes('R_OR_B'));
  const evidenceShift = structuredClone(before);
  evidenceShift.candidates[0].evidence!.digest = digest('changed-edition');
  const e = projectionDelta(before, evidenceShift);
  assert.equal(e.evidence_or_standing_changed, true); assert.equal(e.requires_requalification, true);
});

test('URG projection preservation refuses to fabricate missing situated coordinates', async () => {
  const r = await orchestrateInquiry(request, adapters());
  const partial = structuredClone(r); delete partial.situated_basis.frame_ref;
  let writes = 0;
  await assert.rejects(preserveInquiryProjection(partial, 'fixture:operation', {
    async createArtifact(input) { writes += 1; return { artifact: { id: prior, content: input.content } }; },
    async fetchArtifact(id) { return { id, content: partial.projection.content }; },
  }), /projection_binding_basis_incomplete/);
  assert.equal(writes, 0);
});
