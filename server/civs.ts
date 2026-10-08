/**
 * Capability Inspection / Verification Spine (CIVS) reusable inspection contract.
 *
 * This is a domain-specific inspection record over installed URG carriers.
 * It introduces no URG primitive, universal axis, scalar installation state,
 * generic graph edge, or semantic standing by persistence.
 */
import {
  validateUrgRecord,
  type FidelityCoordinates,
  type NativeRelationClaim,
  type ProjectionRecord,
  type QuestionForward,
} from './urg-core.js';

export const CIVS_CONTRACT_ID = 'ecos:capability-inspection-record:0.1.0' as const;
export const CIVS_RELATION_SCHEMA_ID = 'ecos:civs-object-relations' as const;
export const CIVS_RELATION_SCHEMA_EDITION = '0.1.0' as const;
export const CIVS_HUMAN_PROJECTION_ID = 'ecos:civs-human-projection:0.1.0' as const;

export const CIVS_INSTALLATION_KINDS = [
  'specified',
  'implemented',
  'mechanically_qualified',
  'integrated',
  'deployed',
  'exposed',
  'situated_use_qualified',
  'operationally_sustained',
] as const;
export type InstallationKind = typeof CIVS_INSTALLATION_KINDS[number];

export const CIVS_WORKING_BANDS = [
  'containing_meta_architecture',
  'capability',
  'projection',
  'sub_capability',
  'located_object',
] as const;
export type WorkingBand = typeof CIVS_WORKING_BANDS[number];

export const CIVS_RELATION_KINDS = [
  'specifies',
  'implements',
  'tests',
  'qualifies',
  'deploys',
  'exposes',
  'coordinates',
  'depends_on',
  'evidence_for',
  'question_forward_for',
  'projects_to',
  'supersedes',
] as const;
export type CivsRelationKind = typeof CIVS_RELATION_KINDS[number];

export const CIVS_ENFORCEMENT_MODES = [
  'STRUCTURAL',
  'SEMANTIC',
  'AUTHORITY',
  'OBSERVATIONAL',
] as const;
export type CivsEnforcementMode = typeof CIVS_ENFORCEMENT_MODES[number];

export const CIVS_GRAPHICAL_OBLIGATIONS = [
  'shared_object_identity',
  'typed_controls',
  'standing_currentness_visibility',
  'change_history_visibility',
  'projection_omissions_visibility',
  'human_agent_reconciliation',
  'text_api_graceful_fallback',
] as const;
export type GraphicalObligation = typeof CIVS_GRAPHICAL_OBLIGATIONS[number];

export type CivsAssessmentStanding =
  | 'SUPPORTED'
  | 'NOT_ESTABLISHED'
  | 'UNKNOWN'
  | 'NOT_APPLICABLE'
  | 'CONTRADICTED';

export type InstallationAssessment = {
  kind: InstallationKind;
  proposition: string;
  standing: CivsAssessmentStanding;
  evidence_refs: string[];
  currentness_ref?: string;
  sensitivity_refs: string[];
  limits: string[];
};

export type LocatedRelation = {
  ref: string;
  record: NativeRelationClaim;
};

export type PhysicalCoordinate = {
  kind: 'repository' | 'module_runtime' | 'deployment' | 'ingress' | 'persistence' | 'consumer_surface';
  object_ref: string;
  observation: 'OBSERVED' | 'UNOBSERVED' | 'UNKNOWN';
  evidence_refs: string[];
  currentness_ref?: string;
  limits: string[];
};

export type EnforcementInspection = {
  requirement_ref: string;
  modes: CivsEnforcementMode[];
  surface_refs: string[];
  evidence_refs: string[];
  limits: string[];
};

export type VerificationLink = {
  ref: string;
  proposition: string;
  method_ref: string;
  evidence_refs: string[];
  standing: CivsAssessmentStanding;
  sensitivity_refs: string[];
  limits: string[];
};

export type RoleAssignment = {
  ref: string;
  role_kind:
    | 'principal_accountability'
    | 'coordination_assignment'
    | 'semantic_authority'
    | 'maintenance_responsibility'
    | 'custody'
    | 'action_authority'
    | 'verification_responsibility';
  subject_ref: string;
  evidence_refs: string[];
  scope: string;
};

export type BoundedAssessment = {
  proposition: string;
  standing: CivsAssessmentStanding;
  evidence_refs: string[];
  limits: string[];
};

export type CorrespondenceInspection = {
  ref: string;
  relation_kind_ref: string;
  source_ref: string;
  target_ref: string;
  basis_ref: string;
  semantic_owner_ref: string;
  direction: string;
  cardinality?: string;
  standing: CivsAssessmentStanding;
  evidence_refs: string[];
  currentness_ref?: string;
  composition_expectation?: string;
  inversion_expectation?: string;
  partiality_expectation?: string;
  unresolved_mathematical_requirements: string[];
  question_forward_refs: string[];
};

export type SupportClaim = {
  claim: string;
  evidence_refs: string[];
  accountability_ref: string;
  limits: string[];
};

export type ConsumerSimulationItem = {
  ref: string;
  quadrant: 'UL' | 'UR' | 'LL' | 'LR';
  binding_status: 'LATENT' | 'LOCATED';
  statement: string;
  observation_refs: string[];
  correlation_ref?: string;
  falsifier: string;
  support: {
    affordance: SupportClaim;
    accommodation: SupportClaim;
    continuity: SupportClaim;
    accountability: SupportClaim;
  };
};

export type ConsumerSimulation = {
  ref: string;
  consumer_basis: {
    consumer_referent_ref: string;
    boundary_ref: string;
    governing_orientation_ref: string;
    mapper_ref: string;
    frame_ref: string;
    access_ref: string;
    declared_use: string;
  };
  items: ConsumerSimulationItem[];
  limits: string[];
};

export type GraphicalDoorAssessment = {
  obligations: Array<{
    kind: GraphicalObligation;
    proposition: string;
    standing: CivsAssessmentStanding;
    evidence_refs: string[];
    limits: string[];
  }>;
};

export type CapabilityInspectionRecord = {
  contract: typeof CIVS_CONTRACT_ID;
  cir_id: string;
  subject_ref: string;
  subject_label: string;
  purpose: {
    bounded_claim: string;
    boundary_ref: string;
    governing_orientation_ref: string;
    frame_ref: string;
    access_ref: string;
  };
  installation_assessments: InstallationAssessment[];
  object_connections: LocatedRelation[];
  physical_realization: PhysicalCoordinate[];
  enforcement_inspection: EnforcementInspection[];
  worked_trace: {
    claim: string;
    input_refs: string[];
    step_refs: string[];
    output_ref: string;
    proof_boundary: string;
  };
  verification_links: VerificationLink[];
  field_reconstitution: {
    proposition: string;
    typed_change_refs: string[];
    affected_dependency_refs: string[];
    requalification_refs: string[];
    standing: CivsAssessmentStanding;
    evidence_refs: string[];
    limits: string[];
  };
  correspondence_inspections: CorrespondenceInspection[];
  portability: BoundedAssessment;
  graceful_degradation: BoundedAssessment;
  role_assignments: RoleAssignment[];
  alternatives: Array<{
    ref: string;
    description: string;
    standing: 'RETAINED' | 'REJECTED' | 'SUPERSEDED' | 'UNRESOLVED';
    evidence_refs: string[];
    reentry_condition?: string;
  }>;
  cold_reader_bridges: Array<{
    ref: string;
    question: string;
    answer_route_refs: string[];
    no_invention_rule: string;
  }>;
  questions_forward: Array<{ ref: string; record: QuestionForward }>;
  verification: {
    observed_at_ref: string;
    as_of_ref: string;
    supersedes_ref?: string;
    currentness_refs: string[];
  };
  vertical_placement: {
    working_band: WorkingBand;
    containing_whole_refs: string[];
    level_claim_ref?: string;
  };
  participatory_neighborhood: {
    relation_refs: string[];
    role_assignment_refs: string[];
  };
  consumer_simulations: ConsumerSimulation[];
  graphical_door: GraphicalDoorAssessment;
  source_refs: string[];
  omissions: string[];
};

export type CivsValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

type UnknownRecord = Record<string, unknown>;
const object = (x: unknown): UnknownRecord | null => x !== null && typeof x === 'object' && !Array.isArray(x) ? x as UnknownRecord : null;
const text = (x: unknown): x is string => typeof x === 'string' && x.trim().length > 0;
const texts = (x: unknown): x is string[] => Array.isArray(x) && x.every(text);
const standings = new Set<CivsAssessmentStanding>(['SUPPORTED','NOT_ESTABLISHED','UNKNOWN','NOT_APPLICABLE','CONTRADICTED']);

export const CIVS_RELATION_DEFINITIONS: Record<CivsRelationKind, { roles: readonly string[]; meaning: string }> = {
  specifies: { roles: ['specification','specified_subject'], meaning: 'A bounded specification states obligations for the specified subject.' },
  implements: { roles: ['implementation','implemented_contract'], meaning: 'An implementation is claimed to realize a bounded contract.' },
  tests: { roles: ['test','tested_subject'], meaning: 'A test exercises a bounded proposition about a subject.' },
  qualifies: { roles: ['qualification','qualified_subject'], meaning: 'A qualification result supports only its declared checked proposition.' },
  deploys: { roles: ['deployment','deployed_edition'], meaning: 'A deployment binds a particular source/build edition to a host realization.' },
  exposes: { roles: ['exposure_surface','exposed_capability'], meaning: 'A consumer or ingress surface exposes some bounded capability.' },
  coordinates: { roles: ['coordination_surface','coordinated_work'], meaning: 'A coordination surface carries assignment/status without conferring semantic authority.' },
  depends_on: { roles: ['dependent','dependency'], meaning: 'The dependent inspection claim requires the named dependency on the declared basis.' },
  evidence_for: { roles: ['evidence','claim_or_assessment'], meaning: 'Evidence is attributable support for a bounded claim or assessment, not truth by persistence.' },
  question_forward_for: { roles: ['question_forward','unresolved_subject'], meaning: 'A Question Forward carries a discriminator and reentry route for unresolved material.' },
  projects_to: { roles: ['source','projection'], meaning: 'A source record is represented through a bounded projection without identity collapse.' },
  supersedes: { roles: ['successor','predecessor'], meaning: 'A successor edition supersedes a predecessor only for its declared scope.' },
};

export function makeCivsRelation(
  kind: CivsRelationKind,
  participants: Array<{ role: string; referent_id: string }>,
  situatedBasisRef: string,
  fidelity: FidelityCoordinates,
): NativeRelationClaim {
  const definition = CIVS_RELATION_DEFINITIONS[kind];
  const expected = [...definition.roles].sort();
  const actual = participants.map(p => p.role).sort();
  if (expected.length !== actual.length || expected.some((role, i) => role !== actual[i])) {
    throw new Error('civs_relation_roles_invalid');
  }
  const record: NativeRelationClaim = {
    kind: 'native_relation',
    schema_ref: CIVS_RELATION_SCHEMA_ID,
    schema_edition_ref: CIVS_RELATION_SCHEMA_EDITION,
    relation_kind_ref: `${CIVS_RELATION_SCHEMA_ID}:${kind}`,
    participants,
    situated_basis_ref: situatedBasisRef,
    fidelity,
  };
  if (!validateUrgRecord(record).valid) throw new Error('civs_relation_invalid');
  return record;
}

function validateAssessment(value: unknown, path: string, errors: string[]): void {
  const a = object(value);
  if (!a) { errors.push(`${path} must be an object`); return; }
  if (!standings.has(a.standing as CivsAssessmentStanding)) errors.push(`${path}.standing is invalid`);
  if (!text(a.proposition)) errors.push(`${path}.proposition is required`);
  if (!Array.isArray(a.evidence_refs) || !a.evidence_refs.every(text)) errors.push(`${path}.evidence_refs must be references`);
  if (!Array.isArray(a.limits) || !a.limits.every(text)) errors.push(`${path}.limits must be text`);
  if (a.standing === 'SUPPORTED' && (!texts(a.evidence_refs) || !text(a.currentness_ref))) {
    errors.push(`${path} SUPPORTED requires evidence_refs and currentness_ref`);
  }
}

export function validateCapabilityInspectionRecord(value: unknown): CivsValidationResult {
  const errors: string[] = [];
  const record = object(value);
  if (!record) return { valid: false, errors: ['record must be an object'] };
  if (record.contract !== CIVS_CONTRACT_ID) errors.push('contract is invalid');
  for (const key of ['cir_id','subject_ref','subject_label']) if (!text(record[key])) errors.push(`${key} is required`);
  if ('owner' in record) errors.push('generic owner field is prohibited; use role_assignments');
  if ('installation_status' in record) errors.push('scalar installation_status is prohibited');

  const purpose = object(record.purpose);
  if (!purpose) errors.push('purpose is required');
  else for (const key of ['bounded_claim','boundary_ref','governing_orientation_ref','frame_ref','access_ref']) {
    if (!text(purpose[key])) errors.push(`purpose.${key} is required`);
  }

  const installation = Array.isArray(record.installation_assessments) ? record.installation_assessments : [];
  const seenInstallation = new Set<string>();
  for (const [i, raw] of installation.entries()) {
    const a = object(raw);
    validateAssessment(raw, `installation_assessments[${i}]`, errors);
    if (!a || !CIVS_INSTALLATION_KINDS.includes(a.kind as InstallationKind)) errors.push(`installation_assessments[${i}].kind is invalid`);
    else if (seenInstallation.has(String(a.kind))) errors.push(`duplicate installation assessment: ${String(a.kind)}`);
    else seenInstallation.add(String(a.kind));
    if (a && (!Array.isArray(a.sensitivity_refs) || !a.sensitivity_refs.every(text))) errors.push(`installation_assessments[${i}].sensitivity_refs must be references`);
  }
  for (const kind of CIVS_INSTALLATION_KINDS) if (!seenInstallation.has(kind)) errors.push(`missing installation assessment: ${kind}`);

  const connections = Array.isArray(record.object_connections) ? record.object_connections : [];
  for (const [i, raw] of connections.entries()) {
    const located = object(raw), relation = object(located?.record);
    if (!located || !text(located.ref)) { errors.push(`object_connections[${i}].ref is required`); continue; }
    if (!relation || !validateUrgRecord(relation).valid) { errors.push(`object_connections[${i}].record is not a conforming URG relation`); continue; }
    if (relation.kind !== 'native_relation' || relation.schema_ref !== CIVS_RELATION_SCHEMA_ID || relation.schema_edition_ref !== CIVS_RELATION_SCHEMA_EDITION) {
      errors.push(`object_connections[${i}] must use the scoped CIVS relation schema`);
      continue;
    }
    const prefix = `${CIVS_RELATION_SCHEMA_ID}:`;
    const kind = String(relation.relation_kind_ref).startsWith(prefix) ? String(relation.relation_kind_ref).slice(prefix.length) as CivsRelationKind : null;
    if (!kind || !CIVS_RELATION_KINDS.includes(kind)) errors.push(`object_connections[${i}] relation kind is not declared`);
    else {
      const roles = Array.isArray(relation.participants) ? relation.participants.map(p => object(p)?.role).filter(text).sort() : [];
      const expected = [...CIVS_RELATION_DEFINITIONS[kind].roles].sort();
      if (roles.length !== expected.length || expected.some((role,j) => roles[j] !== role)) errors.push(`object_connections[${i}] participant roles do not match ${kind}`);
    }
  }

  const physical = Array.isArray(record.physical_realization) ? record.physical_realization : [];
  const physicalKinds = new Set<string>();
  for (const [i, raw] of physical.entries()) {
    const c = object(raw);
    if (!c || !['repository','module_runtime','deployment','ingress','persistence','consumer_surface'].includes(String(c.kind))) {
      errors.push(`physical_realization[${i}].kind is invalid`); continue;
    }
    physicalKinds.add(String(c.kind));
    if (!text(c.object_ref)) errors.push(`physical_realization[${i}].object_ref is required`);
    if (!['OBSERVED','UNOBSERVED','UNKNOWN'].includes(String(c.observation))) errors.push(`physical_realization[${i}].observation is invalid`);
    if (!Array.isArray(c.evidence_refs) || !c.evidence_refs.every(text)) errors.push(`physical_realization[${i}].evidence_refs are invalid`);
    if (!Array.isArray(c.limits) || !c.limits.every(text)) errors.push(`physical_realization[${i}].limits are invalid`);
    if (c.observation === 'OBSERVED' && (!texts(c.evidence_refs) || !text(c.currentness_ref))) errors.push(`physical_realization[${i}] OBSERVED requires evidence and currentness`);
  }
  for (const kind of ['repository','module_runtime','deployment','ingress','persistence','consumer_surface']) {
    if (!physicalKinds.has(kind)) errors.push(`missing physical realization coordinate: ${kind}`);
  }

  const roles = Array.isArray(record.role_assignments) ? record.role_assignments : [];
  for (const [i, raw] of roles.entries()) {
    const r = object(raw);
    if (!r || !text(r.ref) || !text(r.subject_ref) || !text(r.scope)) errors.push(`role_assignments[${i}] is incomplete`);
    if (r?.role_kind === 'owner' || !['principal_accountability','coordination_assignment','semantic_authority','maintenance_responsibility','custody','action_authority','verification_responsibility'].includes(String(r?.role_kind))) {
      errors.push(`role_assignments[${i}].role_kind is invalid`);
    }
  }

  const vertical = object(record.vertical_placement);
  if (!vertical || !CIVS_WORKING_BANDS.includes(vertical.working_band as WorkingBand)) errors.push('vertical_placement.working_band is invalid');
  if (vertical && 'level' in vertical) errors.push('vertical placement may not infer a Level; use level_claim_ref');

  const qfs = Array.isArray(record.questions_forward) ? record.questions_forward : [];
  for (const [i, raw] of qfs.entries()) {
    const q = object(raw);
    if (!q || !text(q.ref) || !validateUrgRecord(q.record).valid || object(q.record)?.kind !== 'question_forward') errors.push(`questions_forward[${i}] is invalid`);
  }

  const simulations = Array.isArray(record.consumer_simulations) ? record.consumer_simulations : [];
  for (const [i, raw] of simulations.entries()) {
    const simulation = object(raw), basis = object(simulation?.consumer_basis);
    if (!simulation || !text(simulation.ref) || !basis) { errors.push(`consumer_simulations[${i}] is incomplete`); continue; }
    for (const key of ['consumer_referent_ref','boundary_ref','governing_orientation_ref','mapper_ref','frame_ref','access_ref','declared_use']) {
      if (!text(basis[key])) errors.push(`consumer_simulations[${i}].consumer_basis.${key} is required`);
    }
    for (const [j, itemRaw] of (Array.isArray(simulation.items) ? simulation.items : []).entries()) {
      const item = object(itemRaw);
      if (!item || !['UL','UR','LL','LR'].includes(String(item.quadrant))) errors.push(`consumer_simulations[${i}].items[${j}].quadrant is invalid`);
      if (!item || !['LATENT','LOCATED'].includes(String(item.binding_status))) errors.push(`consumer_simulations[${i}].items[${j}].binding_status is invalid`);
      if (!item || !text(item.statement) || !text(item.falsifier)) errors.push(`consumer_simulations[${i}].items[${j}] requires statement and falsifier`);
      const support = object(item?.support);
      for (const key of ['affordance','accommodation','continuity','accountability']) if (!object(support?.[key])) {
        errors.push(`consumer_simulations[${i}].items[${j}].support.${key} is required`);
      }
    }
  }

  const graphical = object(record.graphical_door);
  if (!graphical) errors.push('graphical_door is required');
  else {
    if ('ready' in graphical) errors.push('graphical_door.ready boolean is prohibited');
    const obligations = Array.isArray(graphical.obligations) ? graphical.obligations : [];
    const seen = new Set<string>();
    for (const [i, raw] of obligations.entries()) {
      const a = object(raw); validateAssessment(raw, `graphical_door.obligations[${i}]`, errors);
      if (!a || !CIVS_GRAPHICAL_OBLIGATIONS.includes(a.kind as GraphicalObligation)) errors.push(`graphical_door.obligations[${i}].kind is invalid`);
      else seen.add(String(a.kind));
    }
    for (const kind of CIVS_GRAPHICAL_OBLIGATIONS) if (!seen.has(kind)) errors.push(`missing graphical-door obligation: ${kind}`);
  }

  for (const key of ['source_refs','omissions']) if (!Array.isArray(record[key]) || !(record[key] as unknown[]).every(text)) errors.push(`${key} must be text/reference array`);
  return errors.length ? { valid: false, errors } : { valid: true, errors: [] };
}

const standingMark: Record<CivsAssessmentStanding,string> = {
  SUPPORTED: 'SUPPORTED',
  NOT_ESTABLISHED: 'NOT ESTABLISHED',
  UNKNOWN: 'UNKNOWN',
  NOT_APPLICABLE: 'NOT APPLICABLE',
  CONTRADICTED: 'CONTRADICTED',
};

export function renderCapabilityInspectionRecord(cir: CapabilityInspectionRecord): string {
  const validation = validateCapabilityInspectionRecord(cir);
  if (!validation.valid) throw new Error(`civs_record_invalid: ${validation.errors.join('; ')}`);
  const lines: string[] = [
    `# Capability Inspection Record — ${cir.subject_label}`,
    '',
    `**CIR:** \`${cir.cir_id}\`  `,
    `**Subject:** \`${cir.subject_ref}\`  `,
    `**Contract:** \`${cir.contract}\`  `,
    `**As-of:** \`${cir.verification.as_of_ref}\``,
    '',
    '> This document is a generated human projection of the machine-readable CIR. It is not a second source of truth.',
    '',
    '## Bounded claim',
    '',
    cir.purpose.bounded_claim,
    '',
    '## Installation assessments',
    '',
    '| Assessment | Standing | Proposition | Limits |',
    '|---|---|---|---|',
    ...cir.installation_assessments.map(a => `| ${a.kind} | ${standingMark[a.standing]} | ${a.proposition.replaceAll('|','\\|')} | ${a.limits.join('; ').replaceAll('|','\\|')} |`),
    '',
    '## Physical realization',
    '',
    '| Coordinate | Observation | Object | Limits |',
    '|---|---|---|---|',
    ...cir.physical_realization.map(c => `| ${c.kind} | ${c.observation} | \`${c.object_ref}\` | ${c.limits.join('; ').replaceAll('|','\\|')} |`),
    '',
    '## Verification links',
    '',
    ...cir.verification_links.map(v => `- **${v.ref} — ${standingMark[v.standing]}:** ${v.proposition} Limits: ${v.limits.join('; ')}`),
    '',
    '## Worked trace',
    '',
    `${cir.worked_trace.claim} **Proof boundary:** ${cir.worked_trace.proof_boundary}`,
    '',
    '## Correspondence',
    '',
    ...cir.correspondence_inspections.map(c => `- **${c.ref} — ${standingMark[c.standing]}:** ${c.source_ref} → ${c.target_ref}. Open mathematical requirements: ${c.unresolved_mathematical_requirements.join('; ') || 'none declared'}`),
    '',
    '## Consumer simulations',
    '',
    ...cir.consumer_simulations.flatMap(s => [
      `### ${s.ref}`,
      `Consumer: \`${s.consumer_basis.consumer_referent_ref}\`; use: ${s.consumer_basis.declared_use}.`,
      ...s.items.map(i => `- **${i.quadrant} / ${i.binding_status}:** ${i.statement}`),
      '',
    ]),
    '## Graphical-door obligations',
    '',
    ...cir.graphical_door.obligations.map(a => `- **${a.kind} — ${standingMark[a.standing]}:** ${a.proposition}`),
    '',
    '## Questions Forward',
    '',
    ...cir.questions_forward.map(q => `- **${q.ref}:** ${q.record.discriminator_question} — Reentry: ${q.record.reentry_condition}`),
    '',
    '## Omissions',
    '',
    ...cir.omissions.map(o => `- ${o}`),
    '',
  ];
  return lines.join('\n');
}

export function makeCivHumanProjectionRecord(
  cir: CapabilityInspectionRecord,
  args: {
    projection_id: string;
    content_ref: string;
    mapper_ref: string;
    frame_ref: string;
    access_ref: string;
    evidence_basis_ref: string;
    fidelity: FidelityCoordinates;
  },
): ProjectionRecord {
  const record: ProjectionRecord = {
    kind: 'projection',
    projection_id: args.projection_id,
    mapped_referent_ids: [cir.cir_id, cir.subject_ref],
    mapped_claim_refs: cir.verification_links.map(v => v.ref),
    mapper_ref: args.mapper_ref,
    mapping_relation_ref: CIVS_HUMAN_PROJECTION_ID,
    governing_orientation_ref: cir.purpose.governing_orientation_ref,
    frame_ref: args.frame_ref,
    access_ref: args.access_ref,
    scope_resolution_ref: cir.verification.as_of_ref,
    evidence_basis_ref: args.evidence_basis_ref,
    content_ref: args.content_ref,
    fidelity: args.fidelity,
    omissions: [...cir.omissions],
    source_refs: [...cir.source_refs],
  };
  if (!validateUrgRecord(record).valid) throw new Error('civs_human_projection_invalid');
  return record;
}
