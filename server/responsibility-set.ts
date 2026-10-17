/**
 * ECO-202 responsibility-set verification and validation, separate from D&I
 * classifications of the responsibilities that happened to be supplied.
 * Only a server-injected semantic assessor may provide the second argument.
 * Caller-authored "complete" flags are intentionally not an input.
 */
export const RESPONSIBILITY_SET_CONTRACT = 'ecos:responsibility-set-assessment:0.3.0' as const;

export type SourceEdition = { ref: string; digest: string };
export type ResponsibilitySetInput = {
  inquiry_basis_ref: string;
  intended_use: string;
  obligation_ref: string;
  /** Exact submitted meaning/standing account, computed by the receiving producer. */
  candidate_digest: string;
  responsibility_ids: string[];
  source_editions: SourceEdition[];
};
export type SemanticSetAssessment = {
  inquiry_basis_ref: string;
  intended_use: string;
  obligation_ref: string;
  candidate_digest: string;
  source_editions: SourceEdition[];
  required_responsibility_ids: string[];
  excluded_responsibility_ids: string[];
  unresolved_refs: string[];
  criterion: string;
  method: string;
  assessor_ref: string;
  evidence_refs: string[];
  judgment: 'VALIDATED' | 'NOT_VALIDATED' | 'UNKNOWN';
};
export type ResponsibilitySetResult = {
  contract: typeof RESPONSIBILITY_SET_CONTRACT;
  inquiry_basis_ref: string;
  obligation_ref: string;
  candidate_digest: string;
  responsibility_ids: string[];
  verification: { status: 'VERIFIED' | 'UNVERIFIED'; reasons: string[]; source_editions: SourceEdition[];
    /** Attribution handle for an accepted coherent source-system current selection.
     * Null is never evidence of a multi-edition verified selection. */
    snapshot_ref: string | null };
  validation: { status: 'VALIDATED' | 'NOT_VALIDATED' | 'UNKNOWN'; criterion: string | null;
    assessor_ref: string | null; method: string | null; evidence_refs: string[];
    excluded_responsibility_ids: string[]; unresolved_refs: string[] };
  disposition: 'READY' | 'HOLD';
  unresolved_refs: string[];
};

export type RecoverEdition = (ref: string) => Promise<(SourceEdition & { currentness: 'CURRENT' | 'STALE' | 'UNKNOWN' }) | null>;
/** Trusted port must attest ONE coherent source-system selection; sequential
 * individually-CURRENT observations cannot create this receipt. Port authority
 * and the meaning of its transaction token require separate qualification. */
export type CoherentEditionSnapshot = {
  snapshot_ref: string;
  consistency: 'ATOMIC_CURRENT_SELECTION';
  source_editions: Array<SourceEdition & { currentness: 'CURRENT' | 'STALE' | 'UNKNOWN' }>;
};
export type RecoverEditionSnapshot = (requested: SourceEdition[]) => Promise<CoherentEditionSnapshot | null>;
const nonblank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const distinct = (xs: string[]) => xs.length === new Set(xs).size;
const equalSet = (a: string[], b: string[]) => a.length === b.length && a.every(v => b.includes(v));
const sameEd = (a: SourceEdition[], b: SourceEdition[]) => a.length === b.length &&
  a.every(v => b.some(w => v.ref === w.ref && v.digest === w.digest));

/** Verification checks declared structural/source constraints. Validation still requires
 * an independently produced, attributed judgment of fitness for the intended use. */
export async function assessResponsibilitySet(
  input: ResponsibilitySetInput,
  assessment?: SemanticSetAssessment,
  recoverEdition?: RecoverEdition,
  recoverEditionSnapshot?: RecoverEditionSnapshot,
): Promise<ResponsibilitySetResult> {
  // An asynchronous reader/assessor must not mutate the basis being checked.
  input = structuredClone(input);
  assessment = assessment === undefined ? undefined : structuredClone(assessment);
  const reasons: string[] = [];
  const unresolved: string[] = [];
  const sourceEditions = input.source_editions;
  if (!/^[a-f0-9]{64}$/.test(input.candidate_digest ?? ''))
    reasons.push('CANDIDATE_EDITION_MISSING');
  if (!nonblank(input.inquiry_basis_ref) || !nonblank(input.intended_use) || !nonblank(input.obligation_ref))
    reasons.push('SITUATED_BASIS_MISSING');
  if (!input.responsibility_ids.length || !input.responsibility_ids.every(nonblank) || !distinct(input.responsibility_ids))
    reasons.push('RESPONSIBILITY_IDENTITIES_INVALID');
  if (!sourceEditions.length || !sourceEditions.every(s => nonblank(s.ref) && /^[a-f0-9]{64}$/i.test(s.digest)) ||
      !distinct(sourceEditions.map(s => s.ref)) || !sourceEditions.some(s => s.ref === input.obligation_ref))
    reasons.push('SOURCE_EDITION_BASIS_INCOMPLETE');

  if (!assessment) unresolved.push('semantic_responsibility_set_assessment');
  else {
    if (assessment.candidate_digest !== input.candidate_digest)
      reasons.push('ASSESSMENT_CANDIDATE_MISMATCH');
    if (assessment.inquiry_basis_ref !== input.inquiry_basis_ref || assessment.intended_use !== input.intended_use ||
        assessment.obligation_ref !== input.obligation_ref) reasons.push('ASSESSMENT_BASIS_MISMATCH');
    if (!sameEd(sourceEditions, assessment.source_editions)) reasons.push('ASSESSMENT_SOURCE_EDITIONS_MISMATCH');
    if (!assessment.required_responsibility_ids.length || !assessment.required_responsibility_ids.every(nonblank) ||
        !distinct(assessment.required_responsibility_ids) || !distinct(assessment.excluded_responsibility_ids))
      reasons.push('ASSESSMENT_RESPONSIBILITIES_INVALID');
    if (!equalSet(input.responsibility_ids, assessment.required_responsibility_ids))
      reasons.push('RESPONSIBILITY_SET_MISMATCH');
    if (assessment.excluded_responsibility_ids.some(id => input.responsibility_ids.includes(id)))
      reasons.push('EXCLUDED_RESPONSIBILITY_SUBMITTED');
    if (![assessment.criterion, assessment.method, assessment.assessor_ref].every(nonblank) ||
        !assessment.evidence_refs.length || !assessment.evidence_refs.every(nonblank))
      reasons.push('SEMANTIC_ASSESSMENT_UNATTRIBUTED');
    if (assessment.unresolved_refs.length || assessment.judgment === 'UNKNOWN')
      unresolved.push(...assessment.unresolved_refs, 'responsibility_set_validation');
  }

  // Exact readback, not caller assertion, establishes source-edition verification.
  if (!recoverEdition) reasons.push('SOURCE_EDITION_RECOVERY_UNAVAILABLE');
  else if (sourceEditions.length && !reasons.includes('SOURCE_EDITION_BASIS_INCOMPLETE')) {
    for (const edition of sourceEditions) {
      let current: Awaited<ReturnType<RecoverEdition>> = null;
      try { current = await recoverEdition(edition.ref); } catch { /* failure remains visible */ }
      if (!current || current.ref !== edition.ref || current.digest !== edition.digest || current.currentness !== 'CURRENT')
        reasons.push('SOURCE_EDITION_NOT_CURRENT_OR_UNRECOVERABLE:' + edition.ref);
    }
  }
  let acceptedSnapshotRef: string | null = null;
  // F4: sequentially reading an obligation followed by native dependencies
  // does not prove they were CURRENT at one consistent point. Requalify all
  // editions using a trusted atomic/current-selection reader at exit.
  // The ordinary ingress supplies no such reader and remains HOLD.
  if (sourceEditions.length > 1 && !reasons.includes('SOURCE_EDITION_BASIS_INCOMPLETE')) {
    if (!recoverEditionSnapshot) reasons.push('SOURCE_EDITION_COHERENT_SNAPSHOT_UNAVAILABLE');
    else {
      let snapshot: CoherentEditionSnapshot | null = null;
      try { snapshot = structuredClone(await recoverEditionSnapshot(structuredClone(sourceEditions))); }
      catch { /* no inferred currentness on read failure */ }
      if (!snapshot || !nonblank(snapshot.snapshot_ref) ||
          snapshot.consistency !== 'ATOMIC_CURRENT_SELECTION' ||
          !Array.isArray(snapshot.source_editions) ||
          !sameEd(sourceEditions, snapshot.source_editions) ||
          snapshot.source_editions.some(e => e.currentness !== 'CURRENT'))
        reasons.push('SOURCE_EDITION_COHERENT_SNAPSHOT_UNVERIFIED');
      else acceptedSnapshotRef = snapshot.snapshot_ref;
    }
  }
  const verified = reasons.length === 0 && assessment !== undefined;
  const validationStatus: ResponsibilitySetResult['validation']['status'] =
    !assessment || !verified || unresolved.length > 0 ? 'UNKNOWN' : assessment.judgment;
  if (!verified) unresolved.push(...reasons);
  if (validationStatus !== 'VALIDATED') unresolved.push('responsibility_set_validation');
  const unresolvedRefs = [...new Set(unresolved)];
  return {
    contract: RESPONSIBILITY_SET_CONTRACT,
    inquiry_basis_ref: input.inquiry_basis_ref, obligation_ref: input.obligation_ref,
    candidate_digest: input.candidate_digest,
    responsibility_ids: [...input.responsibility_ids],
    verification: { status: verified ? 'VERIFIED' : 'UNVERIFIED', reasons,
      source_editions: [...sourceEditions], snapshot_ref: verified ? acceptedSnapshotRef : null },
    validation: { status: validationStatus, criterion: assessment?.criterion ?? null,
      assessor_ref: assessment?.assessor_ref ?? null, method: assessment?.method ?? null,
      evidence_refs: [...(assessment?.evidence_refs ?? [])],
      excluded_responsibility_ids: [...(assessment?.excluded_responsibility_ids ?? [])],
      unresolved_refs: [...(assessment?.unresolved_refs ?? [])] },
    disposition: verified && validationStatus === 'VALIDATED' && unresolvedRefs.length === 0 ? 'READY' : 'HOLD',
    unresolved_refs: unresolvedRefs,
  };
}

