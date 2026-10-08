/** Existing guarded BRAIN/circulation readers. No new table, RPC, provider or standing. */
import {
  canonical, digest, inquiryBasisRef, questionForward, orchestrateInquiry,
  type CandidateHit, type DiscoveryBatch, type DiscoveryPath, type ExactEvidence,
  type InquiryAdapters, type InquiryRequest,
} from './orchestration.js';
import type { SituatedContext } from './urg-core.js';

type ObjectRecord = Record<string, unknown>;
export type BrainInquiryPorts = {
  searchThoughts(query: string, limit: number): Promise<{ results: Array<{ id: string }>; coverage: ObjectRecord }>;
  fetchThought(id: string): Promise<ObjectRecord | null>;
  dispatch(operation: string, payload: ObjectRecord, actor: string): Promise<unknown>;
  embed(query: string): Promise<number[]>;
};
const object = (x: unknown): ObjectRecord => x !== null && typeof x === 'object' && !Array.isArray(x) ? x as ObjectRecord : {};
const rows = (x: unknown): ObjectRecord[] => Array.isArray(x) ? x.map(object) : [];
const text = (x: unknown): string | undefined => typeof x === 'string' && x.trim() ? x : undefined;
const ids = (...x: unknown[]) => [...new Set(x.map(text).filter((s): s is string => s !== undefined))];
const uuid = (x: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);

/** Do not flatten table-specific links into generic graph or whole/part membership. */
export function encounteredPaths(value: unknown): DiscoveryPath[] {
  const v = object(value), root = text(v.referent_id);
  if (!root) return [];
  const definitions: Array<[string, string[], string]> = [
    ['work_parts', ['work_id', 'constituent_id'], 'situated_work_constituent'],
    ['claims', ['subject_referent_id', 'object_referent_id'], 'assertion'],
    ['evidence', ['claim_id', 'evidence_referent_id'], 'evidence_link'],
    ['anchors', ['unit_id', 'source_id', 'carrier_id'], 'source_anchor'],
    ['memberships', ['account_id', 'constituent_id'], 'composition_member'],
    ['lineage', ['predecessor_id', 'successor_id'], 'account_lineage'],
    ['inputs', ['activity_id', 'subject_id'], 'activity_input'],
    ['outputs', ['activity_id', 'id'], 'activity_output'],
    ['situated_observations', ['subject_id', 'id'], 'situated_observation'],
    ['participants', ['unit_id', 'subject_id'], 'unit_participant'],
  ];
  const paths: DiscoveryPath[] = [];
  for (const [field, endpoints, kind] of definitions) for (const edge of rows(v[field])) {
    const relation = text(edge.id);
    if (!relation) continue;
    const targets = ids(...endpoints.map(k => edge[k]), field === 'claims' ? relation : undefined).filter(id => id !== root);
    for (const target of targets) paths.push({ source_id: root, target_id: target, relation_ref: relation,
      relation_kind: field === 'claims' ? `asserted:${text(edge.predicate) ?? 'unknown'}` : `${kind}:${text(edge.role) ?? text(edge.relation) ?? kind}`,
      standing: 'ENCOUNTERED' });
  }
  return paths;
}

export function createBrainInquiryAdapters(ports: BrainInquiryPorts, actor: string): InquiryAdapters {
  if (!actor.trim()) throw new Error('inquiry_actor_missing');
  const workHints = new Map<string, Set<string>>();
  const recoveries = new Map<string, Promise<ObjectRecord>>();
  const originalWork = (workId: string) => {
    let recovered = recoveries.get(workId);
    if (!recovered) { recovered = ports.dispatch('recover_work', { work_id: workId }, actor).then(object); recoveries.set(workId, recovered); }
    return recovered;
  };
  return {
    async searchEvidence(request, limit): Promise<DiscoveryBatch> {
      let vector: number[] | null = null;
      try { vector = await ports.embed(request.query); } catch { /* native lexical discovery survives */ }
      // Deliberately no work_id/source-PGO filter: historical work is provenance, not a namespace.
      const found = await Promise.allSettled([
        ports.searchThoughts(request.query, limit),
        ports.dispatch('search_structure', { query: request.query, query_embedding: vector, limit }, actor),
      ]);
      const hits: CandidateHit[] = [], coverage: DiscoveryBatch['coverage'] = [];
      const thoughts = found[0];
      if (thoughts.status === 'fulfilled') {
        hits.push(...thoughts.value.results.map(r => ({ referent_id: r.id, channels: ['thought_hybrid'] as ['thought_hybrid'], paths: [] })));
        coverage.push({ channel: 'thought_hybrid', status: thoughts.value.coverage.degraded === true || thoughts.value.coverage.semantic_query_available === false ? 'DEGRADED' : 'AVAILABLE',
          detail: canonical(thoughts.value.coverage) });
      } else coverage.push({ channel: 'thought_hybrid', status: 'UNAVAILABLE', detail: 'Canonical Thought retrieval failed; no empty-result inference.' });
      const native = found[1];
      if (native.status === 'fulfilled') {
        const result = object(native.value), c = object(result.coverage);
        for (const row of rows(result.results)) {
          const id = text(row.subject_id);
          if (!id) continue;
          const workId = text(row.work_id);
          if (workId) { const hints = workHints.get(id) ?? new Set<string>(); hints.add(workId); workHints.set(id, hints); }
          hits.push({ referent_id: id, channels: ['native_hybrid'], paths: [], discovery_basis_digest: text(row.basis_digest) });
        }
        coverage.push({ channel: 'native_hybrid', status: c.degraded === true || c.semantic_query_available === false ? 'DEGRADED' : 'AVAILABLE', detail: canonical(c) });
      } else coverage.push({ channel: 'native_hybrid', status: 'UNAVAILABLE', detail: 'Guarded native discovery failed; circulation activation is not a recovery remedy.' });
      return { hits, coverage };
    },
    async discoverStructure(_request, roots, depth, limit): Promise<DiscoveryBatch> {
      const hits = new Map<string, CandidateHit>(), visited = new Set<string>();
      let frontier = roots.filter(uuid), degraded = false, truncated = false;
      for (let level = 0; level < depth && frontier.length; level++) {
        const next = new Set<string>();
        const results = await Promise.allSettled(frontier.slice(0, limit).map(id => ports.dispatch('traverse_structure', { referent_id: id }, actor)));
        frontier.slice(0, limit).forEach(id => visited.add(id));
        if (frontier.length > limit) truncated = true;
        for (const result of results) {
          if (result.status === 'rejected') { degraded = true; continue; }
          for (const path of encounteredPaths(result.value)) {
            const prior = hits.get(path.target_id);
            if (prior) prior.paths.push(path);
            else if (hits.size < limit) hits.set(path.target_id, { referent_id: path.target_id, channels: ['structure'], paths: [path] });
            else truncated = true;
            if (!visited.has(path.target_id) && uuid(path.target_id)) next.add(path.target_id);
          }
        }
        frontier = [...next];
      }
      // The depth is an aperture, not evidence of completeness. Actual unvisited edges remain explicit.
      if (depth > 0 && frontier.some(id => !visited.has(id))) truncated = true;
      return { hits: [...hits.values()], coverage: [{ channel: 'structure', status: degraded ? 'DEGRADED' : 'AVAILABLE',
        detail: `Encountered typed neighborhoods only; depth=${depth}. Composition/work membership is not ontological constitution.` }], truncated };
    },
    async fetchEvidence(id): Promise<ExactEvidence | null> {
      if (!uuid(id)) return null; // a provisional external URG reference is not a native UUID
      let native: ObjectRecord | null = null, ordinary: ObjectRecord | null = null;
      const fetched = await Promise.allSettled([
        ports.dispatch('fetch_referent', { referent_id: id }, actor), ports.fetchThought(id),
      ]);
      if (fetched[0].status === 'fulfilled') native = object(fetched[0].value);
      if (fetched[1].status === 'fulfilled') ordinary = fetched[1].value;
      const thought = ordinary ?? object(native?.thought), artifact = object(native?.artifact), claim = object(native?.claim);
      const nativeRecords = rows(native?.native_records);
      if (!ordinary && !Object.keys(thought).length && !Object.keys(artifact).length && !Object.keys(claim).length && !nativeRecords.length) return null;
      const works = workHints.get(id) ?? new Set<string>();
      for (const entry of nativeRecords) {
        const row = object(entry.record), workId = text(row.work_id);
        if (workId) works.add(workId);
        if (entry.native_type === 'work_accounts') works.add(id);
      }
      const bases: Array<{ context: Partial<SituatedContext>; basis_ref: string; intended_use?: string }> = [];
      for (const workId of works) {
        try {
          const recovery = await originalWork(workId), work = rows(recovery.work).find(w => w.id === workId);
          if (!work) continue;
          bases.push({ context: { referent_id: text(work.focal_id), boundary_ref: text(work.boundary), governing_orientation_ref: text(work.orientation),
            mapper_ref: text(work.point_of_view), frame_ref: text(work.frame), actor_ref: text(work.created_by) },
            basis_ref: text(work.epoch) ?? workId, intended_use: text(work.intended_use) });
        } catch { /* exact custody is retained, missing original situation is explicit */ }
      }
      const content = text(thought.content) ?? text(artifact.content) ?? canonical({ native_records: nativeRecords, claim,
        evidence: native?.evidence ?? null, standing_history: native?.standing_history ?? null });
      const sourceRefs = ids(id, thought.source, ...nativeRecords.flatMap(entry => {
        const row = object(entry.record); return [row.source_id, row.carrier_id, row.original_carrier_id, row.output_id];
      }));
      return { referent_id: id, digest: text(native?.basis_digest) ?? digest({ id, content, source: thought.source, captured_at: thought.captured_at }),
        content, source_refs: sourceRefs,
        original_basis: bases.length === 1 ? bases[0] : null,
        stored_standing: { claim: Object.keys(claim).length ? claim : null, standing_history: native?.standing_history ?? null,
          operational_disposition: ordinary?.disposition ?? null, interpretation: 'Operational disposition and exact custody do not confer proposition truth or current-use standing.',
          original_basis_alternatives: bases.length > 1 ? bases : [], original_basis_status: bases.length === 1 ? 'RECOVERED' : bases.length ? 'MULTIPLE' : 'UNKNOWN' },
        currentness: 'UNKNOWN', custody_ref: id };
    },
    async evaluateCandidate(request, _hit, evidence, basisRef) {
      return { disposition: 'QUESTION_FORWARD', reason: 'Exact prior material recovered; present typed relation and current-use applicability require attributable semantic evaluation.',
        assessment_ref: 'ecos:inquiry:semantic-admission-required', inquiry_basis_ref: basisRef, candidate_digest: evidence.digest,
        question: questionForward(request, basisRef, evidence.referent_id,
          'Is this prior material consequential here, and by which typed relation under the current PGO?',
          'Admit after independent applicability/standing qualification; otherwise defer or reject without changing its historical standing.') };
    },
    async disclose(request) {
      return { records: [], changes: [], sufficiency: { inquiry_basis_ref: inquiryBasisRef(request),
        assessment_ref: 'ecos:inquiry:semantic-disclosure-required', satisfied: false, unresolved_refs: ['level_quadrant_disclosure'] } };
    },
  };
}

/** Ordinary read/recovery response; full candidate snapshots remain in the internal typed result. */
export async function runBrainInquiry(request: InquiryRequest, ports: BrainInquiryPorts, actor: string) {
  const result = await orchestrateInquiry({ ...request, actor_ref: actor, context: { ...request.context, actor_ref: actor } }, createBrainInquiryAdapters(ports, actor));
  const artifactContent = canonical({ contract: result.contract, indexical_binding: result.indexical_binding, projection: result.projection,
    disposition: result.disposition, reentry: result.reentry });
  return { contract: result.contract, inquiry_basis_ref: result.inquiry_basis_ref, indexical_binding: result.indexical_binding,
    situated_basis: result.situated_basis, intended_use: result.intended_use, disposition: result.disposition, projection: result.projection,
    disclosure_contract: result.disclosure_contract, quadrant_coverage: result.quadrant_coverage, discovery_coverage: result.discovery_coverage,
    candidates: result.candidates.map(c => ({ referent_id: c.hit.referent_id, digest: c.evidence?.digest ?? null,
      channels: c.hit.channels, paths: c.hit.paths, original_basis: c.evidence?.original_basis ?? null, decision: c.decision })),
    admitted_relation_count: result.admitted.length, questions_forward: result.questions_forward, signals: result.signals,
    reconciliation: result.reconciliation, reentry: result.reentry,
    preservation: { status: 'NOT_PRESERVED', tool: 'create_artifact', recovery: 'fetch_artifact',
      artifact_content: artifactContent,
      content: 'Preserve preservation.artifact_content exactly under a caller-controlled operation_id; custody grants no standing or current-use truth.' } };
}
