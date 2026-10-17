/** Source-custodied responsibility-set production for ECO-202.
 * Exact source encounters yield an evidence-backed *candidate* set; a separate
 * semantic writer is needed to judge intended-use validation. The reader may
 * verify source bytes but may not infer governing currentness from recency. */
import { createHash } from 'node:crypto';
import { assessResponsibilitySet, type SemanticSetAssessment, type ResponsibilitySetInput, type ResponsibilitySetResult } from './responsibility-set.js';
import type { NativePackageDescriptor } from './domain-admission.js';

export const RESPONSIBILITY_PRODUCER_CONTRACT = 'ecos:source-bound-responsibility-producer:0.3.0' as const;
export type ResponsibilityProposalInput = Omit<ResponsibilitySetInput, 'source_editions' | 'candidate_digest'> & {
  /** Exact derivative being evaluated, including semantics, standing and declared scope. */
  candidate_content: string;
  /** Trusted selected registry descriptions, never user-supplied authority. */
  native_packages?: NativePackageDescriptor[];
};
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
  candidate_digest: string;
  source_edition: { ref: string; digest: string } | null;
  candidate_clauses: SourceClause[];
  limitations: string[];
  producer: 'EXACT_NORMATIVE_CLAUSE_EXTRACTION';
  status: 'SOURCE_RECOVERED' | 'SOURCE_UNAVAILABLE';
};
export type ResponsibilityProducerPorts = {
  recoverSource: (ref: string) => Promise<RecoveredSource | null>;
  /** Independently re-read an edition; CURRENT requires qualified registry authority. */
  recoverNativePackage?: (id: string) => Promise<{
    descriptor: NativePackageDescriptor;
    currentness: RecoveredSource['currentness'];
  } | null>;
  /** A distinct, attributable semantic evaluator—not caller-supplied proof. */
  semanticReview?: (
    input: ResponsibilitySetInput,
    evidence: { source: RecoveredSource; proposal: ProposedResponsibilitySource;
      candidate: { content: string; digest: string } },
  ) => Promise<SemanticSetAssessment | null>;
};
export type ProducedSet = { proposal: ProposedResponsibilitySource; assessment: ResponsibilitySetResult };

const hex = (content: string) => createHash('sha256').update(content).digest('hex');
const nonblank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const refsValid = (refs: unknown): refs is string[] => Array.isArray(refs) &&
  refs.length > 0 && refs.every(nonblank) && new Set(refs).size === refs.length;
const sourceValid = (s: RecoveredSource | null): s is RecoveredSource => !!s &&
  nonblank(s.ref) && nonblank(s.content) && nonblank(s.custody_ref) &&
  nonblank(s.basis_digest) && refsValid(s.source_refs);
const nativeValid = (p: NativePackageDescriptor): boolean => !!p &&
  [p.id, p.domain, p.name, p.authority_ref, p.edition_ref].every(nonblank) &&
  refsValid(p.semantic_scope) && refsValid(p.source_refs) &&
  ['ACTIVE', 'HISTORICAL', 'UNKNOWN'].includes(p.status);
// Preserve all meaning/standing-bearing descriptor fields, including optional routes.
// Key ordering is not authority; a changed value is a changed source edition.
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return '{' + Object.entries(value).filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}';
  return JSON.stringify(value) ?? 'null';
};
const sourceEdition = (s: RecoveredSource) => ({ ref: s.ref,
  digest: hex(canonical([s.ref, s.content, s.basis_digest, s.custody_ref, [...s.source_refs].sort()])) });
const nativeEdition = (p: NativePackageDescriptor) => ({
  ref: 'native-package:' + p.id, digest: hex(canonical(p)),
});

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
    const end = start + line.length;
    const suffix = source.content.slice(end);
    start = end + (suffix.startsWith('\r\n') ? 2 : suffix.startsWith('\n') ? 1 : 0);
  }
  return out;
}

export async function produceResponsibilitySet(
  input: ResponsibilityProposalInput,
  ports: ResponsibilityProducerPorts,
): Promise<ProducedSet> {
  input = structuredClone(input);
  const nativePackages = input.native_packages ?? [];
  const nativeBasisValid = input.native_packages === undefined ||
    (Array.isArray(nativePackages) && nativePackages.length > 0 &&
      nativePackages.every(nativeValid) &&
      new Set(nativePackages.map(p => p.id)).size === nativePackages.length);
  const nativeEditions = nativeBasisValid ? nativePackages.map(nativeEdition) : [];
  const candidateUsable = typeof input.candidate_content === 'string' &&
    input.candidate_content.trim().length > 0 && nativeBasisValid;
  // Content identity prevents a prior judgment from being reused for changed prose,
  // standing or coverage. It supplies no semantic judgment or current authority.
  const candidateDigest = candidateUsable ? hex(JSON.stringify([
    RESPONSIBILITY_PRODUCER_CONTRACT, input.inquiry_basis_ref, input.intended_use,
    input.obligation_ref, input.responsibility_ids, input.candidate_content,
    // A package ID is not its current specification, provenance or authority.
    nativePackages,
  ])) : '';
  let source: RecoveredSource | null = null;
  try { source = structuredClone(await ports.recoverSource(input.obligation_ref)); } catch { /* no source == no inferred validation */ }
  const usable = sourceValid(source) && source.ref === input.obligation_ref;
  const edition = usable ? sourceEdition(source!) : null;
  const proposal: ProposedResponsibilitySource = {
    contract: RESPONSIBILITY_PRODUCER_CONTRACT,
    obligation_ref: input.obligation_ref,
    candidate_digest: candidateDigest,
    source_edition: edition,
    candidate_clauses: usable ? extractNormativeClauses(source!) : [],
    limitations: usable
      ? ['Lexical clauses are not a semantic responsibility decomposition.',
        'Candidate digest binds submitted bytes, not meaning, actual use, installation or action authority.',
        ...(!candidateUsable ? ['Exact candidate content or valid package qualification basis is missing; no derivative can be validated.'] : []),
        ...(nativePackages.length ? ['Native package editions require an independent CURRENT registry qualification before reliance.'] : []),
        'Absence of lexical clauses does not establish absence of obligations.',
        ...(source!.currentness !== 'CURRENT' ? ['Governing source currentness remains unqualified.'] : [])]
      : ['Governing source unavailable or not exactly seated; no decomposition can be validated.'],
    producer: 'EXACT_NORMATIVE_CLAUSE_EXTRACTION',
    status: usable ? 'SOURCE_RECOVERED' : 'SOURCE_UNAVAILABLE',
  };
  const assessmentInput: ResponsibilitySetInput = {
    inquiry_basis_ref: input.inquiry_basis_ref, intended_use: input.intended_use,
    obligation_ref: input.obligation_ref, responsibility_ids: [...input.responsibility_ids],
    candidate_digest: candidateDigest,
    source_editions: edition ? [edition, ...nativeEditions] : [...nativeEditions] };
  let semantic: SemanticSetAssessment | undefined;
  if (usable && candidateUsable && ports.semanticReview) {
    try { semantic = structuredClone((await ports.semanticReview(structuredClone(assessmentInput),
      structuredClone({ source: source!, proposal, candidate: { content: input.candidate_content, digest: candidateDigest } }))) ?? undefined); }
    catch { /* retain unknown rather than treat a failed writer as negative evidence */ }
  }
  const recoverEdition = async (ref: string) => {
    if (ref.startsWith('native-package:')) {
      const id = ref.slice('native-package:'.length);
      if (!nativePackages.some(p => p.id === id) || !ports.recoverNativePackage) return null;
      let current: Awaited<ReturnType<NonNullable<ResponsibilityProducerPorts['recoverNativePackage']>>> = null;
      try { current = await ports.recoverNativePackage(id); } catch { return null; }
      if (!current || !nativeValid(current.descriptor) || current.descriptor.id !== id) return null;
      return { ...nativeEdition(current.descriptor), currentness: current.currentness };
    }
    if (ref !== input.obligation_ref) return null;
    let check: RecoveredSource | null = null;
    try { check = await ports.recoverSource(ref); } catch { return null; }
    return sourceValid(check) && check.ref === ref ? {
      ...sourceEdition(check), currentness: check.currentness,
    } : null;
  };
  return { proposal, assessment: await assessResponsibilitySet(assessmentInput, semantic, recoverEdition) };
}

