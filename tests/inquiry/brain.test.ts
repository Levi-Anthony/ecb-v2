import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBrainInquiryAdapters, encounteredPaths, runBrainInquiry, type BrainInquiryPorts } from '../../server/orchestration-brain.ts';
import type { InquiryRequest } from '../../server/orchestration.ts';

const focal = '00000000-0000-4000-8000-000000000001', prior = '00000000-0000-4000-8000-000000000002';
const work = '00000000-0000-4000-8000-000000000003', edge = '00000000-0000-4000-8000-000000000004';
const request: InquiryRequest = { query: 'A future apparently unrelated inquiry', intended_use: 'Discover applicable prior structure',
  actor_ref: 'untrusted-input', return_route: 'fixture:current-inquiry', context: { referent_id: focal } };
function ports(log: Array<{ operation: string; payload: Record<string, unknown>; actor: string }> = []): BrainInquiryPorts {
  return {
    async embed() { return Array(384).fill(0.01); },
    async searchThoughts() { return { results: [{ id: prior }], coverage: { semantic_query_available: true, degraded: false } }; },
    async fetchThought() { return null; },
    async dispatch(operation, payload, actor) {
      log.push({ operation, payload, actor });
      if (operation === 'search_structure') return { results: [{ subject_id: prior, work_id: work, basis_digest: 'native-edition' }], coverage: { semantic_query_available: true, degraded: false } };
      if (operation === 'traverse_structure') return { referent_id: payload.referent_id, memberships: [{ id: edge, account_id: focal, constituent_id: prior, reason: 'Prior responsibility structure' }] };
      if (operation === 'fetch_referent') return { referent_id: payload.referent_id, basis_digest: 'native-edition', native_records: [
        { native_type: 'semantic_units', record: { id: payload.referent_id, work_id: work, description: 'Exact source-derived prior unit', source_id: edge } },
      ], claim: null, standing_history: null };
      if (operation === 'recover_work') return { work: [{ id: work, epoch: 'original-work-edition', focal_id: prior, boundary: 'Refrigerator warranty',
        orientation: 'Warranty responsibility', point_of_view: 'Original evaluator', frame: 'Warranty determination', intended_use: 'Decide warranty responsibility', created_by: 'Original actor' }] };
      throw new Error('unexpected_effect');
    },
  };
}

test('native discovery is global; exact original situation is recovered without source-PGO filtering', async () => {
  const log: Array<{ operation: string; payload: Record<string, unknown>; actor: string }> = [], a = createBrainInquiryAdapters(ports(log), 'actual-client');
  const batch = await a.searchEvidence({ ...request, work_id: 'current-work' }, 10);
  assert(batch.hits.some(h => h.referent_id === prior && h.channels.includes('native_hybrid')));
  const call = log.find(c => c.operation === 'search_structure')!;
  assert.equal(call.payload.work_id, undefined); assert.equal(call.actor, 'actual-client');
  const exact = await a.fetchEvidence(prior);
  assert.equal(exact?.digest, 'native-edition'); assert.equal(exact?.original_basis?.context.governing_orientation_ref, 'Warranty responsibility');
  assert.equal(exact?.currentness, 'UNKNOWN'); // source recency is not qualified current use
});
test('encountered composition membership stays typed and never becomes ontological part_of', () => {
  const paths = encounteredPaths({ referent_id: focal, memberships: [{ id: edge, account_id: focal, constituent_id: prior }],
    claims: [{ id: work, subject_referent_id: focal, object_referent_id: prior, predicate: 'supports' }] });
  assert(paths.some(p => p.relation_kind.startsWith('composition_member:')));
  assert(paths.some(p => p.relation_kind === 'asserted:supports'));
  assert(paths.every(p => p.standing === 'ENCOUNTERED')); assert(!paths.some(p => p.relation_kind === 'part_of'));
});
test('no semantic adapter result is fabricated from native edges or embedding hits', async () => {
  const log: Array<{ operation: string; payload: Record<string, unknown>; actor: string }> = [];
  const r = await runBrainInquiry(request, ports(log), 'actual-client');
  assert.equal(r.disposition, 'HOLD'); assert.equal(r.admitted_relation_count, 0);
  assert.equal(r.situated_basis.actor_ref, 'actual-client');
  assert.equal(r.indexical_binding.actor_ref, 'actual-client');
  assert.equal(r.indexical_binding.query, request.query);
  const preserved = JSON.parse(r.preservation.artifact_content);
  assert.equal(preserved.indexical_binding.basis_ref, r.inquiry_basis_ref);
  assert.equal(preserved.indexical_binding.query, request.query);
  assert(r.candidates.some(c => c.referent_id === prior && c.original_basis?.context.governing_orientation_ref === 'Warranty responsibility'));
  assert(r.questions_forward.some(q => q.unresolved_ref === prior));
  assert(log.every(c => ['search_structure', 'traverse_structure', 'fetch_referent', 'recover_work'].includes(c.operation)));
});
test('native lexical and canonical custody survive embedding/native recovery failures visibly', async () => {
  const p = ports(); p.embed = async () => { throw new Error('embedding_offline'); };
  p.dispatch = async (op) => { if (op === 'search_structure') return { results: [], coverage: { lexical_available: true, semantic_query_available: false } }; throw new Error('native_offline'); };
  p.fetchThought = async id => ({ id, content: 'Exact canonical Thought', source: 'fixture:source', captured_at: '2026-10-06T00:00:00Z', disposition: { state: 'ACTIVE' } });
  const a = createBrainInquiryAdapters(p, 'actual-client'), batch = await a.searchEvidence(request, 10);
  assert.equal(batch.coverage.find(c => c.channel === 'native_hybrid')?.status, 'DEGRADED');
  const exact = await a.fetchEvidence(prior); assert.equal(exact?.content, 'Exact canonical Thought'); assert.equal(exact?.original_basis, null);
  assert.equal(exact?.currentness, 'UNKNOWN'); assert((exact?.stored_standing as { interpretation: string }).interpretation.includes('do not confer'));
});
test('bounded cyclic encountered neighborhoods terminate without inventing a circularity finding', async () => {
  const log: Array<{ operation: string; payload: Record<string, unknown>; actor: string }> = [];
  const a = createBrainInquiryAdapters(ports(log), 'actual-client');
  const batch = await a.discoverStructure(request, [focal], 3, 10);
  assert(batch.hits.some(h => h.referent_id === prior));
  assert(log.filter(c => c.operation === 'traverse_structure').length <= 2);
  assert.equal(batch.truncated, false);
});
