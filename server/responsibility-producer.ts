/** Source-custodied responsibility-set production for ECO-202.
 * Exact source encounters yield an evidence-backed *candidate* set; a separate
 * semantic writer is needed to judge intended-use validation. The reader may
 * verify source bytes but may not infer governing currentness from recency. */
import { createHash } from 'node:crypto';
import { assessResponsibilitySet, type SemanticSetAssessment, type ResponsibilitySetInput, type ResponsibilitySetResult } from './responsibility-set.js';

export const RESPONSIBILITY_PRODUCER_CONTRACT = 'ecos:source-bound-responsibility-producer:0.1.0' as const;
export type RecoveredSource = {
  ref: string;
  content: string;
  custody_ref: string;
  basis_digest: string;
  source_refs: string[];
  currentness: 'CURRENT' | 'STALE' | 'UNKNOWN';
};
export type SourceClause = { source_ref: string; line: number; excerpt: string; start: number; end: number };
export type ProposedResponsibilitySource = {
  contract: typeof RESPONSIBILITY_PRODUCER_CONTRACT;
  obligation_ref: string;
  source_edition: { ref: string; digest: string } | null;
  candidate_clauses: SourceClause[];
  limitations: string[];
  producer: 'EXACT_NORMATIVE_CLAUSE_EXTRACTION';
  status: 'SOURCE_RECOVERED' | 'SOURCE_UNAVAILABLE';
};
export type ResponsibilityProducerPorts = {
  recoverSource: (ref: string) => Promise<RecoveredSource | null>;
  /** A distinct, attributable semantic evaluator—not caller-supplied proof. */
  semanticReview?: (
    input: ResponsibilitySetInput,
    evidence: { source: RecoveredSource; proposal: ProposedResponsibilitySource },
  ) => Promise<SemanticSetAssessment | null>;
};
export type ProducedSet = { proposal: ProposedResponsibilitySource; assessment: ResponsibilitySetResult };

const hex = (content: string) => createHash('sha256').update(content).digest('hex');
const sourceEdition = (s: RecoveredSource) => ({ ref: s.ref,
  digest: hex(JSON.stringify([s.ref, s.content, s.basis_digest, s.custody_ref])) });

export function extractNormativeClauses(source: RecoveredSource): SourceClause[] {
  const lines = source.content.split(/\r?\n/);
  const out: SourceClause[] = [];
  let start = 0;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    // Explicitly lexical: this is source contact, not a complete decomposition.
    if (/\b(shall|must|required to|is required|are required)\b/i.test(line) && line.trim()) {
      out.push({ source_ref: source.ref, line: index + 1, excerpt: line,
        start, end: start + line.length });
    }
    start += line.length + 1;
  }
  return out;
}

export async function produceResponsibilitySet(
  input: Omit<ResponsibilitySetInput, 'source_editions'>,
  ports: ResponsibilityProducerPorts,
): Promise<ProducedSet> {
  let source: RecoveredSource | null = null;
  try { source = await ports.recoverSource(input.obligation_ref); } catch { /* no source == no inferred validation */ }
  const usable = source && source.ref === input.obligation_ref && source.content.length > 0 &&
    source.custody_ref.length > 0 && source.basis_digest.length > 0;
  const edition = usable ? sourceEdition(source!) : null;
  const proposal: ProposedResponsibilitySource = {
    contract: RESPONSIBILITY_PRODUCER_CONTRACT,
    obligation_ref: input.obligation_ref,
    source_edition: edition,
    candidate_clauses: usable ? extractNormativeClauses(source!) : [],
    limitations: usable
      ? ['Lexical clauses are not a semantic responsibility decomposition.',
        'Absence of lexical clauses does not establish absence of obligations.',
        ...(source!.currentness !== 'CURRENT' ? ['Governing source currentness remains unqualified.'] : [])]
      : ['Governing source unavailable or not exactly seated; no decomposition can be validated.'],
    producer: 'EXACT_NORMATIVE_CLAUSE_EXTRACTION',
    status: usable ? 'SOURCE_RECOVERED' : 'SOURCE_UNAVAILABLE',
  };
  const assessmentInput: ResponsibilitySetInput = { ...input,
    source_editions: edition ? [edition] : [] };
  let semantic: SemanticSetAssessment | undefined;
  if (usable && ports.semanticReview) {
    try { semantic = (await ports.semanticReview(assessmentInput, { source: source!, proposal })) ?? undefined; }
    catch { /* retain unknown rather than treat a failed writer as negative evidence */ }
  }
  const recoverEdition = async (ref: string) => {
    if (ref !== input.obligation_ref) return null;
    let check: RecoveredSource | null = null;
    try { check = await ports.recoverSource(ref); } catch { return null; }
    return check && check.ref === ref && check.custody_ref && check.basis_digest ? {
      ...sourceEdition(check), currentness: check.currentness,
    } : null;
  };
  return { proposal, assessment: await assessResponsibilitySet(assessmentInput, semantic, recoverEdition) };
}
