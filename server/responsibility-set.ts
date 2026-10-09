/**
 * ECO-202 responsibility-set verification and validation, separate from D&I
 * classifications of the responsibilities that happened to be supplied.
 * Only a server-injected semantic assessor may provide the second argument.
 * Caller-authored "complete" flags are intentionally not an input.
 */
export const RESPONSIBILITY_SET_CONTRACT = 'ecos:responsibility-set-assessment:0.1.0' as const;

export type SourceEdition = { ref: string; digest: string };
export type ResponsibilitySetInput = {
  inquiry_basis_ref: string;
  intended_use: string;
  obligation_ref: string;
  responsibility_ids: string[];
  source_editions: SourceEdition[];
};
export type SemanticSetAssessment = {
  inquiry_basis_ref: string;
  intended_use: string;
  obligation_ref: string;
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
  responsibility_ids: string[];
  verification: { status: 'VERIFIED' | 'UNVERIFIED'; reasons: string[]; source_editions: SourceEdition[] };
  validation: { status: 'VALIDATED' | 'NOT_VALIDATED' | 'UNKNOWN'; criterion: string | null;
    assessor_ref: string | null; method: string | null; evidence_refs: string[];
    excluded_responsibility_ids: string[]; unresolved_refs: string[] };
  disposition: 'READY' | 'HOLD';
  unresolved_refs: string[];
};

export type RecoverEdition = (ref: string) => Promise<(SourceEdition & { currentness: 'CURRENT' | 'STALE' | 'UNKNOWN' }) | null>;
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
): Promise<ResponsibilitySetResult> {
  const reasons: string[] = [];
  const unresolved: string[] = [];
  const sourceEditions = input.source_editions;
  if (!nonblank(input.inquiry_basis_ref) || !nonblank(input.intended_use) || !nonblank(input.obligation_ref))
    reasons.push('SITUATED_BASIS_MISSING');
  if (!input.responsibility_ids.length || !input.responsibility_ids.every(nonblank) || !distinct(input.responsibility_ids))
    reasons.push('RESPONSIBILITY_IDENTITIES_INVALID');
  if (!sourceEditions.length || !sourceEditions.every(s => nonblank(s.ref) && /^[a-f0-9]{64}$/i.test(s.digest)) ||
      !distinct(sourceEditions.map(s => s.ref)) || !sourceEditions.some(s => s.ref === input.obligation_ref))
    reasons.push('SOURCE_EDITION_BASIS_INCOMPLETE');

  if (!assessment) unresolved.push('semantic_responsibility_set_assessment');
  else {
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
  const verified = reasons.length === 0 && assessment !== undefined;
  const validationStatus: ResponsibilitySetResult['validation']['status'] =
    !assessment || !verified ? 'UNKNOWN' : assessment.judgment;
  if (!verified) unresolved.push(...reasons);
  if (validationStatus !== 'VALIDATED') unresolved.push('responsibility_set_validation');
  const unresolvedRefs = [...new Set(unresolved)];
  return {
    contract: RESPONSIBILITY_SET_CONTRACT,
    inquiry_basis_ref: input.inquiry_basis_ref, obligation_ref: input.obligation_ref,
    responsibility_ids: [...input.responsibility_ids],
    verification: { status: verified ? 'VERIFIED' : 'UNVERIFIED', reasons, source_editions: [...sourceEditions] },
    validation: { status: validationStatus, criterion: assessment?.criterion ?? null,
      assessor_ref: assessment?.assessor_ref ?? null, method: assessment?.method ?? null,
      evidence_refs: [...(assessment?.evidence_refs ?? [])],
      excluded_responsibility_ids: [...(assessment?.excluded_responsibility_ids ?? [])],
      unresolved_refs: [...(assessment?.unresolved_refs ?? [])] },
    disposition: verified && validationStatus === 'VALIDATED' ? 'READY' : 'HOLD',
    unresolved_refs: unresolvedRefs,
  };
}
