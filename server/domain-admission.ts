export const DOMAIN_ADMISSION_CONTRACT = 'ecos:domain-semantic-admission:0.1.0' as const;

export type SourceLane = 'COURSE' | 'CURRENT_PRACTICE' | 'EXPLANATORY_RECONSTRUCTION' | 'PROJECT_APPLICATION';
export type NativeCoverage = 'ADEQUATE' | 'PARTIAL' | 'NONE' | 'UNKNOWN' | 'UNAVAILABLE';
export type RelationType = 'SAME' | 'OVERLAP' | 'GENERALIZATION' | 'ORTHOGONAL' | 'TENSION' | 'MISSING' | 'UNKNOWN';
export type BoundaryDisposition = 'INHERIT' | 'FEDERATE' | 'EXTEND' | 'QUALIFY';
export type PackageStatus = 'ACTIVE' | 'HISTORICAL' | 'UNKNOWN';

export type NativePackageDescriptor = {
  id: string;
  domain: string;
  name: string;
  authority_ref: string;
  edition_ref: string;
  semantic_scope: string[];
  identity_scheme?: string;
  access_routes: string[];
  validation_routes: string[];
  currentness_routes: string[];
  source_refs: string[];
  status: PackageStatus;
};

export type NativePriorArt = {
  checked: boolean;
  evidence_refs: string[];
  unavailable_reason?: string;
};

export type AtomicResponsibility = {
  id: string;
  construct_ref: string;
  problem_solved: string;
  source_lane: SourceLane;
  source_refs: string[];
  native_package_ids: string[];
  native_coverage: NativeCoverage;
  relation_type: RelationType;
  required_for_current_use?: boolean;
  requires_cross_domain_correspondence?: boolean;
  correspondence_targets?: string[];
  unmet_obligation?: string;
  ecos_mechanism_refs?: string[];
  prior_art: NativePriorArt;
  falsifier?: string;
  receiving_owner?: string;
  question_forward?: {
    question: string;
    decision_consequence: string;
    reentry_condition: string;
  };
};

export type DIBoundaryDecision = {
  id: string;
  responsibility_id: string;
  construct_ref: string;
  problem_solved: string;
  source_lane: SourceLane;
  relation_type: RelationType;
  disposition: BoundaryDisposition;
  native_package_ids: string[];
  native_owner_refs: string[];
  source_refs: string[];
  evidence_refs: string[];
  correspondence_targets: string[];
  ecos_extension_obligation?: string;
  ecos_mechanism_refs: string[];
  falsifier?: string;
  receiving_owner?: string;
  standing: 'CURRENT_DECISION' | 'QUALIFICATION_REQUIRED';
  blocking: boolean;
  gate_codes: string[];
  question_forward?: AtomicResponsibility['question_forward'];
};

export type DomainAdmissionRequest = {
  domain: string;
  inquiry_basis_ref: string;
  package_ids: string[];
  responsibilities: AtomicResponsibility[];
};

export type DomainAdmissionResult = {
  contract: typeof DOMAIN_ADMISSION_CONTRACT;
  domain: string;
  inquiry_basis_ref: string;
  package_refs: string[];
  decisions: DIBoundaryDecision[];
  disposition: 'READY' | 'HOLD';
  unresolved_refs: string[];
  ledger_projection: string;
};

const nonblank = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const refs = (value: unknown): value is string[] => Array.isArray(value) && value.length > 0 && value.every(nonblank);
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
};
const decisionId = (value: unknown) => {
  const text = canonical(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 'fnv1a32:' + (hash >>> 0).toString(16).padStart(8, '0');
};

function packageMap(packages: NativePackageDescriptor[]) {
  const map = new Map<string, NativePackageDescriptor>();
  for (const pkg of packages) {
    if (!nonblank(pkg.id) || !nonblank(pkg.domain) || !nonblank(pkg.name) || !nonblank(pkg.authority_ref)
      || !nonblank(pkg.edition_ref) || !refs(pkg.semantic_scope) || !refs(pkg.source_refs)) throw new Error('invalid_native_package');
    if (map.has(pkg.id)) throw new Error('duplicate_native_package');
    map.set(pkg.id, pkg);
  }
  return map;
}

function qualify(reason: string, gateCodes: string[], responsibility: AtomicResponsibility, packages: NativePackageDescriptor[]): DIBoundaryDecision {
  const evidenceRefs = [...new Set(responsibility.prior_art.evidence_refs)];
  const base = {
    responsibility_id: responsibility.id,
    construct_ref: responsibility.construct_ref,
    problem_solved: responsibility.problem_solved,
    source_lane: responsibility.source_lane,
    relation_type: responsibility.relation_type,
    disposition: 'QUALIFY' as const,
    native_package_ids: responsibility.native_package_ids,
    native_owner_refs: packages.map(p => p.authority_ref),
    source_refs: responsibility.source_refs,
    evidence_refs: evidenceRefs,
    correspondence_targets: responsibility.correspondence_targets ?? [],
    ecos_mechanism_refs: responsibility.ecos_mechanism_refs ?? [],
    receiving_owner: responsibility.receiving_owner,
    standing: 'QUALIFICATION_REQUIRED' as const,
    blocking: responsibility.required_for_current_use === true,
    gate_codes: gateCodes,
    question_forward: responsibility.question_forward ?? {
      question: reason,
      decision_consequence: 'Do not promote this responsibility to an ECOS extension or relied native mapping until the missing distinction is resolved.',
      reentry_condition: 'Requalify responsibility ' + responsibility.id + ' against current native sources.',
    },
  };
  return { id: decisionId(base), ...base };
}

export function evaluateDIBoundary(
  request: DomainAdmissionRequest,
  registry: NativePackageDescriptor[],
): DomainAdmissionResult {
  if (![request.domain, request.inquiry_basis_ref].every(nonblank) || !Array.isArray(request.responsibilities)) throw new Error('domain_admission_context_required');
  const packagesById = packageMap(registry);
  const selectedPackages = request.package_ids.map(id => packagesById.get(id)).filter((p): p is NativePackageDescriptor => p !== undefined);
  if (selectedPackages.length !== request.package_ids.length) throw new Error('native_package_unknown');
  if (selectedPackages.some(p => p.domain !== request.domain)) throw new Error('native_package_domain_mismatch');

  const decisions: DIBoundaryDecision[] = [];
  const seen = new Set<string>();
  for (const responsibility of request.responsibilities) {
    if (!nonblank(responsibility.id) || seen.has(responsibility.id)) throw new Error('invalid_responsibility_id');
    seen.add(responsibility.id);
    if (![responsibility.construct_ref, responsibility.problem_solved].every(nonblank) || !refs(responsibility.source_refs)) throw new Error('invalid_responsibility');
    const packages = responsibility.native_package_ids.map(id => packagesById.get(id)).filter((p): p is NativePackageDescriptor => p !== undefined);
    if (packages.length !== responsibility.native_package_ids.length || packages.some(p => p.domain !== request.domain)) throw new Error('responsibility_native_package_unknown');

    if (!responsibility.prior_art.checked) {
      decisions.push(qualify('Current native prior art has not been checked.', ['NATIVE_PRIOR_ART_REQUIRED'], responsibility, packages));
      continue;
    }
    if (responsibility.native_coverage === 'UNAVAILABLE') {
      decisions.push(qualify(
        responsibility.prior_art.unavailable_reason || 'The authoritative native source is unavailable for qualification.',
        ['NATIVE_SOURCE_UNAVAILABLE'], responsibility, packages,
      ));
      continue;
    }
    if (responsibility.native_coverage === 'UNKNOWN') {
      decisions.push(qualify('Native coverage remains unknown.', ['NATIVE_COVERAGE_UNKNOWN'], responsibility, packages));
      continue;
    }
    if (responsibility.prior_art.evidence_refs.length === 0) {
      decisions.push(qualify('Prior-art inspection lacks attributable evidence.', ['NATIVE_EVIDENCE_REQUIRED'], responsibility, packages));
      continue;
    }

    let disposition: BoundaryDisposition;
    const gateCodes: string[] = [];
    if (responsibility.native_coverage === 'ADEQUATE') {
      if (nonblank(responsibility.unmet_obligation)) {
        decisions.push(qualify(
          'The atomic responsibility is marked natively adequate but also asserts an unmet obligation; split or refine the responsibility before extension.',
          ['ATOMIZATION_CONFLICT'], responsibility, packages,
        ));
        continue;
      }
      disposition = responsibility.requires_cross_domain_correspondence ? 'FEDERATE' : 'INHERIT';
    } else {
      const hasExtension = nonblank(responsibility.unmet_obligation)
        && refs(responsibility.ecos_mechanism_refs)
        && nonblank(responsibility.falsifier);
      if (hasExtension) disposition = 'EXTEND';
      else if (responsibility.requires_cross_domain_correspondence && responsibility.native_coverage === 'PARTIAL') disposition = 'FEDERATE';
      else {
        decisions.push(qualify(
          'An extension claim requires a named unmet obligation, existing ECOS mechanism, and falsifier after native-practice inspection.',
          ['EXTENSION_BURDEN_UNMET'], responsibility, packages,
        ));
        continue;
      }
    }

    if (disposition === 'FEDERATE' && !refs(responsibility.correspondence_targets)) {
      decisions.push(qualify('Federation requires explicit correspondence targets.', ['CORRESPONDENCE_TARGET_REQUIRED'], responsibility, packages));
      continue;
    }

    const base = {
      responsibility_id: responsibility.id,
      construct_ref: responsibility.construct_ref,
      problem_solved: responsibility.problem_solved,
      source_lane: responsibility.source_lane,
      relation_type: responsibility.relation_type,
      disposition,
      native_package_ids: responsibility.native_package_ids,
      native_owner_refs: packages.map(p => p.authority_ref),
      source_refs: responsibility.source_refs,
      evidence_refs: [...new Set(responsibility.prior_art.evidence_refs)],
      correspondence_targets: responsibility.correspondence_targets ?? [],
      ecos_extension_obligation: disposition === 'EXTEND' ? responsibility.unmet_obligation : undefined,
      ecos_mechanism_refs: responsibility.ecos_mechanism_refs ?? [],
      falsifier: disposition === 'EXTEND' ? responsibility.falsifier : undefined,
      receiving_owner: responsibility.receiving_owner,
      standing: 'CURRENT_DECISION' as const,
      blocking: false,
      gate_codes: gateCodes,
      question_forward: responsibility.question_forward,
    };
    decisions.push({ id: decisionId(base), ...base });
  }

  const unresolved = decisions.filter(d => d.disposition === 'QUALIFY' && d.blocking).map(d => d.responsibility_id);
  const ledger = decisions.map(d => [d.construct_ref, d.problem_solved, d.relation_type, d.disposition,
    d.ecos_extension_obligation ?? '', d.standing, d.evidence_refs.join(' ')].map(v => String(v).replaceAll('|', '\\|')).join(' | '));
  const header = 'Construct | Atomic responsibility | Relation | Disposition | ECOS extension | Standing | Evidence';
  const divider = '--- | --- | --- | --- | --- | --- | ---';
  return {
    contract: DOMAIN_ADMISSION_CONTRACT,
    domain: request.domain,
    inquiry_basis_ref: request.inquiry_basis_ref,
    package_refs: selectedPackages.map(p => p.id),
    decisions,
    disposition: unresolved.length ? 'HOLD' : 'READY',
    unresolved_refs: unresolved,
    ledger_projection: [header, divider, ...ledger].join('\n'),
  };
}
