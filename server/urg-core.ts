/**
 * ECO-136 URG portable core, Register-B v2.
 *
 * Machine-consumable structural contract for the Principal-accepted Shape.
 * It is deliberately a discriminated grammar, not one record with seven
 * interchangeable axis fields and not a replacement for native domain schemas.
 *
 * Validation establishes only structural conformance to this package.
 * It does not establish semantic truth, authority, currentness, empirical
 * exhaustiveness, or correct domain classification.
 */

export const URG_CORE_ID = "ecos:urg-core:register-b:v2" as const;
export const URG_IMPLEMENTATION_REVISION = "2.0.0" as const;
export const QUADRANT_DISCLOSURE_CONTRACT = "ecos:quadrant-disclosure:v2" as const;
export const LEGACY_QUADRANT_CONTRACT = "ecos:quadrant-seat-burden:v1" as const;
export const QUADRANT_DISCLOSURES = ["UL", "UR", "LL", "LR"] as const;
export type QuadrantDisclosure = typeof QUADRANT_DISCLOSURES[number];
/** Working handles; the positive definitions live in Quadrant-Disclosure-Contract-v2.0.md. */
export const QUADRANT_FUNCTIONS = {
  UL: "PROPER_DETERMINATION", UR: "DETERMINATE_MANIFESTATION",
  LL: "FIELD_ARTICULATION", LR: "ENACTED_ORGANIZATION",
} as const;
export type QuadrantFunction = typeof QUADRANT_FUNCTIONS[QuadrantDisclosure];
export const QUADRANT_QUESTIONS: Record<QuadrantDisclosure, string> = {
  UL: "What obtains in/as this instantiation, with acquaintance by instantiation distinct from information about it?",
  UR: "What differentiated configuration, variation or response does this referent manifest under the stated conditions?",
  LL: "What organized distinctions and relations give this referent significance in its field?",
  LR: "What actual organization of participation carries, sustains or transforms this referent and its effects?",
};

export const URG_RECORD_KINDS = [
  "level",
  "quadrant",
  "direction",
  "state",
  "line",
  "stage",
  "type",
  "native_relation",
  "projection",
  "change",
  "question_forward",
] as const;

export type UrgRecordKind = typeof URG_RECORD_KINDS[number];

export const URG_CHANGE_KINDS = [
  "Enrich",
  "ReviseBoundary",
  "Reseat",
  "Refocus",
  "ChangeFrame",
  "Reorient",
  "StateTransition",
  "DirectionalEvent",
  "RefineStateBasis",
  "RebaseLine",
  "RebaseStage",
  "RebaseType",
  "RequalifyStanding",
  "ChangeAuthority",
  "ChangeCurrentBinding",
  "AssessDependencyMateriality",
  "AdvanceCoordination",
  "TriggerQuestionForward",
  "Handoff",
  "Reconstruct",
  "GrammarChange",
] as const;

export type UrgChangeKind = typeof URG_CHANGE_KINDS[number];

export type Coverage = "UNEXAMINED" | "EXAMINED";
export type Activation = "ACTIVE" | "DORMANT";
export type Disposition =
  | "RELIED_FOR_DECLARED_USE"
  | "UNRESOLVED"
  | "NONCONSEQUENTIAL_NOW"
  | "CONDITIONAL_SENSORED"
  | "REJECTED_CONTRADICTED_WITH_WARRANT"
  | "PROHIBITED_IMPOSSIBLE_UNDER_QUALIFIED_RULE";

export type FidelityCoordinates = {
  coverage: Coverage;
  activation: Activation;
  disposition?: Disposition;
  evidence_refs?: string[];
  warrant_ref?: string;
  authority_ref?: string;
  custody_ref?: string;
  currentness_ref?: string;
  challenge_qf_refs?: string[];
};

export type SituatedContext = {
  referent_id: string;
  grain_ref?: string;
  boundary_ref: string;
  governing_orientation_ref?: string;
  mapper_ref?: string;
  frame_ref?: string;
  access_ref?: string;
  actor_ref?: string;
  source_refs?: string[];
};

export type LevelClaim = {
  kind: "level";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  result: "LEVEL_WITNESSED" | "LEVEL_NOT_ESTABLISHED" | "LEVEL_UNKNOWN";
  constituent_referent_ids?: string[];
  organization_ref?: string;
  dependence_witness_ref?: string;
  qf_ref?: string;
};

export type QuadrantClaim = {
  kind: "quadrant";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  disclosure_contract: typeof QUADRANT_DISCLOSURE_CONTRACT;
  result: "QUADRANT_POSITION" | "DECOMPOSE" | "QUADRANT_UNKNOWN";
  disclosure?: QuadrantDisclosure;
  content_ref?: string;
  characterization_ref?: string;
  conditions_ref?: string;
  qualifiers?: {
    seat?: "Constitutive" | "Participatory";
    burden?: "Governing" | "Determinate";
  };
  component_refs?: string[];
  /** References to independently standing native relation claims, not inferred edges. */
  relation_refs?: string[];
  qf_ref?: string;
};

export type DirectionStatus = "SUPPORTED" | "NOT_ESTABLISHED" | "UNKNOWN";

export type DirectionClaim = {
  kind: "direction";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  directions: {
    A: DirectionStatus;
    C: DirectionStatus;
    T: DirectionStatus;
    D: DirectionStatus;
  };
  mode?: "tendency" | "capacity" | "drive";
  transformation_ref: string;
  conditions_ref: string;
  direction_witness_refs?: Partial<Record<"A" | "C" | "T" | "D", string>>;
  realized_event_ref?: string;
  composite_candidate_ref?: string;
  dissolution_basis_ref?: string;
  direction_uncovered?: boolean;
  qf_ref?: string;
};

export type StateClaim = {
  kind: "state";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  state_basis_ref: string;
  occasion_ref: string;
  result:
    | "STATE_WITNESSED"
    | "STATE_UNKNOWN"
    | "STATE_CONTRADICTED"
    | "STATE_BASIS_INCOMPARABLE"
    | "STATE_FRAME_INCOMPARABLE";
  state_value?: unknown;
  candidate_set_ref?: string;
  qf_ref?: string;
};

export type LineClaim = {
  kind: "line";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  line_contract_ref: string;
  standing:
    | "LINE_CONTRACT"
    | "LINE_SEEDED"
    | "LINE_INSTANCE_WITNESSED"
    | "LINE_UNRESOLVED"
    | "LINE_BASIS_INCOMPARABLE";
  position_refs?: string[];
  continuity_refs?: string[];
  qf_ref?: string;
};

export type StageClaim = {
  kind: "stage";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  stage_basis_ref: string;
  line_ref: string;
  line_position_ref: string;
  result:
    | "PGO_UNDERENRICHED"
    | "LINE_UNRESOLVED"
    | "LEVEL_UNKNOWN"
    | "LEVEL_NOT_ESTABLISHED"
    | "REGIME_ONLY"
    | "LEVEL_NOT_STAGE_UNDER_PGO"
    | "STAGE_UNKNOWN"
    | "STAGE_LEVEL"
    | "STAGE_BASIS_INCOMPARABLE";
  stage_key?: string;
  occurrence_ref?: string;
  level_claim_ref?: string;
  projection_ref?: string;
  qf_ref?: string;
};

export type TypeClaim = {
  kind: "type";
  context: SituatedContext;
  fidelity: FidelityCoordinates;
  typology_ref: string;
  conditions_ref: string;
  result:
    | "TYPE_WITNESSED"
    | "TYPE_NOT_ESTABLISHED"
    | "TYPE_UNKNOWN"
    | "TYPE_INAPPLICABLE"
    | "TYPE_SCHEMA_INCOMPARABLE"
    | "TYPE_UNCOVERED";
  classifier_ref?: string;
  native_relation_kind?: string;
  witness_ref?: string;
  qf_ref?: string;
};

export type NativeRelationClaim = {
  kind: "native_relation";
  schema_ref: string;
  schema_edition_ref: string;
  relation_kind_ref: string;
  participants: Array<{ role: string; referent_id: string }>;
  situated_basis_ref: string;
  fidelity: FidelityCoordinates;
  qf_ref?: string;
};

export type ProjectionRecord = {
  kind: "projection";
  projection_id: string;
  mapped_referent_ids: string[];
  mapped_claim_refs?: string[];
  mapper_ref: string;
  mapping_relation_ref: string;
  governing_orientation_ref: string;
  frame_ref: string;
  access_ref: string;
  scope_resolution_ref: string;
  evidence_basis_ref: string;
  content_ref: string;
  fidelity: FidelityCoordinates;
  omissions: string[];
  source_refs?: string[];
};

export type ChangeRecord = {
  kind: "change";
  change_kind: UrgChangeKind;
  subject_referent_id: string;
  source_basis_ref: string;
  destination_basis_ref: string;
  continuity_mode_ref: string;
  affected_claim_refs: string[];
  affected_dependency_refs: string[];
  requalify_refs: string[];
  fidelity: FidelityCoordinates;
  evidence_refs?: string[];
  qf_ref?: string;
};

export type QuestionForward = {
  kind: "question_forward";
  unresolved_ref: string;
  basis_ref: string;
  current_standing_ref: string;
  discriminator_question: string;
  paired_signal_scenario: string;
  evidence_change_criteria: string;
  alternative_signal_routing: string;
  decision_consequence: string;
  return_route: string;
  reentry_condition: string;
};

export type UrgRecord =
  | LevelClaim
  | QuadrantClaim
  | DirectionClaim
  | StateClaim
  | LineClaim
  | StageClaim
  | TypeClaim
  | NativeRelationClaim
  | ProjectionRecord
  | ChangeRecord
  | QuestionForward;

export type ValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

type UnknownRecord = Record<string, unknown>;

const directionStatuses = new Set<DirectionStatus>([
  "SUPPORTED",
  "NOT_ESTABLISHED",
  "UNKNOWN",
]);

const dispositions = new Set<Disposition>([
  "RELIED_FOR_DECLARED_USE",
  "UNRESOLVED",
  "NONCONSEQUENTIAL_NOW",
  "CONDITIONAL_SENSORED",
  "REJECTED_CONTRADICTED_WITH_WARRANT",
  "PROHIBITED_IMPOSSIBLE_UNDER_QUALIFIED_RULE",
]);

function object(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function texts(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(text);
}

function requireText(record: UnknownRecord, key: string, errors: string[]) {
  if (!text(record[key])) errors.push(`${key} is required`);
}

function validateFidelity(value: unknown, errors: string[]): UnknownRecord | null {
  const fidelity = object(value);
  if (!fidelity) {
    errors.push("fidelity must be an object");
    return null;
  }

  if (!["UNEXAMINED","EXAMINED"].includes(String(fidelity.coverage))) {
    errors.push("fidelity.coverage is invalid");
  }
  if (!["ACTIVE","DORMANT"].includes(String(fidelity.activation))) {
    errors.push("fidelity.activation is invalid");
  }

  if (fidelity.coverage === "EXAMINED") {
    if (!dispositions.has(fidelity.disposition as Disposition)) {
      errors.push("EXAMINED fidelity requires an explicit disposition");
    }
  } else if (fidelity.coverage === "UNEXAMINED" && fidelity.disposition !== undefined) {
    errors.push("UNEXAMINED fidelity may not silently carry a disposition");
  }

  for (const key of [
    "warrant_ref","authority_ref","custody_ref","currentness_ref",
  ]) {
    if (fidelity[key] !== undefined && !text(fidelity[key])) {
      errors.push(`fidelity.${key} must be nonblank when present`);
    }
  }
  for (const key of ["evidence_refs","challenge_qf_refs"]) {
    if (fidelity[key] !== undefined && !texts(fidelity[key])) {
      errors.push(`fidelity.${key} must contain nonblank references`);
    }
  }
  return fidelity;
}

function validateContext(value: unknown, errors: string[]): UnknownRecord | null {
  const context = object(value);
  if (!context) {
    errors.push("context must be an object");
    return null;
  }
  if (!text(context.referent_id)) errors.push("context.referent_id is required");
  if (!text(context.boundary_ref)) errors.push("context.boundary_ref is required");

  for (const key of [
    "grain_ref","governing_orientation_ref","mapper_ref","frame_ref",
    "access_ref","actor_ref",
  ]) {
    if (context[key] !== undefined && !text(context[key])) {
      errors.push(`context.${key} must be nonblank when present`);
    }
  }
  if (context.source_refs !== undefined && !texts(context.source_refs)) {
    errors.push("context.source_refs must contain nonblank references");
  }
  return context;
}

function validateCommon(record: UnknownRecord, errors: string[]) {
  validateContext(record.context, errors);
  validateFidelity(record.fidelity, errors);
}

/** Historical interpretation only. Never supplies current disclosure coverage or migration. */
export function validateLegacyQuadrantRecord(value: unknown, sourceContract: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const record = object(value);
  if (sourceContract !== LEGACY_QUADRANT_CONTRACT) errors.push("exact legacy source contract is required");
  if (!record || record.kind !== "quadrant") return { valid: false, errors: [...errors, "legacy quadrant record is required"] };
  validateCommon(record, errors);
  if (record.disclosure_contract !== undefined || record.disclosure !== undefined) errors.push("successor disclosure cannot be interpreted as legacy");
  if (!["QUADRANT_POSITION", "DECOMPOSE", "QUADRANT_UNKNOWN"].includes(String(record.result))) errors.push("invalid legacy quadrant result");
  if (record.result === "QUADRANT_POSITION") {
    if (!["Constitutive", "Participatory"].includes(String(record.seat))) errors.push("legacy seat is required");
    if (!["Governing", "Determinate"].includes(String(record.burden))) errors.push("legacy burden is required");
  }
  if (record.result === "QUADRANT_UNKNOWN") requireText(record, "qf_ref", errors);
  return { valid: errors.length === 0, errors };
}

export function validateUrgRecord(value: unknown): ValidationResult {
  const errors: string[] = [];
  const record = object(value);
  if (!record) return { valid: false, errors: ["record must be an object"] };

  const kind = record.kind;
  if (!text(kind) || !URG_RECORD_KINDS.includes(kind as UrgRecordKind)) {
    return { valid: false, errors: ["kind is unknown"] };
  }

  if (["level","quadrant","direction","state","line","stage","type"].includes(kind)) {
    validateCommon(record, errors);
  }

  switch (kind) {
    case "level": {
      const allowed = new Set(["LEVEL_WITNESSED","LEVEL_NOT_ESTABLISHED","LEVEL_UNKNOWN"]);
      if (!allowed.has(String(record.result))) errors.push("invalid level result");
      if (record.result === "LEVEL_WITNESSED") {
        if (!texts(record.constituent_referent_ids) || record.constituent_referent_ids.length === 0) {
          errors.push("witnessed Level requires constituent_referent_ids");
        }
        requireText(record, "organization_ref", errors);
        requireText(record, "dependence_witness_ref", errors);
      }
      if (record.result === "LEVEL_UNKNOWN") requireText(record, "qf_ref", errors);
      break;
    }
    case "quadrant": {
      const allowed = new Set(["QUADRANT_POSITION","DECOMPOSE","QUADRANT_UNKNOWN"]);
      if (!allowed.has(String(record.result))) errors.push("invalid quadrant result");
      if (record.disclosure_contract !== QUADRANT_DISCLOSURE_CONTRACT) errors.push("current quadrant disclosure_contract is required; legacy records require explicit historical interpretation");
      if (record.seat !== undefined || record.burden !== undefined) errors.push("seat/burden belong in qualifiers and do not generate disclosure identity");
      if (record.disclosure !== undefined && !QUADRANT_DISCLOSURES.includes(record.disclosure as QuadrantDisclosure)) errors.push("invalid quadrant disclosure");
      if (record.result === "QUADRANT_POSITION") {
        if (!QUADRANT_DISCLOSURES.includes(record.disclosure as QuadrantDisclosure)) errors.push("quadrant disclosure is required");
        for (const key of ["content_ref", "characterization_ref", "conditions_ref"]) requireText(record, key, errors);
      }
      if (record.qualifiers !== undefined) {
        const q = object(record.qualifiers);
        if (!q) errors.push("quadrant qualifiers must be an object");
        else {
          if (q.seat !== undefined && !["Constitutive","Participatory"].includes(String(q.seat))) errors.push("invalid quadrant seat qualifier");
          if (q.burden !== undefined && !["Governing","Determinate"].includes(String(q.burden))) errors.push("invalid quadrant burden qualifier");
        }
      }
      if (record.result === "DECOMPOSE" && (!texts(record.component_refs) || new Set(record.component_refs).size < 2)) errors.push("DECOMPOSE requires at least two distinct component_refs");
      if (record.relation_refs !== undefined && !texts(record.relation_refs)) errors.push("relation_refs must contain nonblank references");
      if (record.result === "QUADRANT_UNKNOWN") requireText(record, "qf_ref", errors);
      break;
    }
    case "direction": {
      requireText(record, "transformation_ref", errors);
      requireText(record, "conditions_ref", errors);
      const dirs = object(record.directions);
      if (!dirs) {
        errors.push("directions object is required");
        break;
      }
      for (const key of ["A","C","T","D"]) {
        if (!directionStatuses.has(dirs[key] as DirectionStatus)) errors.push(`invalid direction status: ${key}`);
      }
      const witnesses = object(record.direction_witness_refs);
      for (const key of ["A","C","T","D"]) {
        if (dirs[key] === "SUPPORTED" && (!witnesses || !text(witnesses[key]))) {
          errors.push(`SUPPORTED direction requires witness ref: ${key}`);
        }
      }
      if (dirs.T === "SUPPORTED" && !text(record.composite_candidate_ref)) {
        errors.push("SUPPORTED Transcendence requires composite_candidate_ref");
      }
      if (dirs.D === "SUPPORTED" && !text(record.dissolution_basis_ref)) {
        errors.push("SUPPORTED Dissolution requires dissolution_basis_ref");
      }
      if (record.mode !== undefined && !["tendency","capacity","drive"].includes(String(record.mode))) {
        errors.push("invalid direction mode");
      }
      if (record.direction_uncovered === true && Object.values(dirs).some(v => v === "SUPPORTED")) {
        errors.push("DIRECTION_UNCOVERED cannot simultaneously assert a supported direction");
      }
      break;
    }
    case "state": {
      requireText(record, "state_basis_ref", errors);
      requireText(record, "occasion_ref", errors);
      const context = object(record.context);
      if (!context || (!text(context.mapper_ref) && !text(context.frame_ref) && !text(context.access_ref))) {
        errors.push("State requires an explicit consequential mapper/frame/access coordinate");
      }
      const allowed = new Set([
        "STATE_WITNESSED","STATE_UNKNOWN","STATE_CONTRADICTED",
        "STATE_BASIS_INCOMPARABLE","STATE_FRAME_INCOMPARABLE",
      ]);
      if (!allowed.has(String(record.result))) errors.push("invalid State result");
      if (record.result === "STATE_WITNESSED" && !Object.prototype.hasOwnProperty.call(record, "state_value")) {
        errors.push("STATE_WITNESSED requires state_value");
      }
      if (record.result === "STATE_UNKNOWN" && !text(record.candidate_set_ref) && !text(record.qf_ref)) {
        errors.push("STATE_UNKNOWN requires candidate_set_ref or qf_ref");
      }
      if (["STATE_BASIS_INCOMPARABLE","STATE_FRAME_INCOMPARABLE"].includes(String(record.result))
          && !text(record.qf_ref)) {
        errors.push("incomparable State result requires qf_ref");
      }
      break;
    }
    case "line": {
      requireText(record, "line_contract_ref", errors);
      const allowed = new Set([
        "LINE_CONTRACT","LINE_SEEDED","LINE_INSTANCE_WITNESSED",
        "LINE_UNRESOLVED","LINE_BASIS_INCOMPARABLE",
      ]);
      if (!allowed.has(String(record.standing))) errors.push("invalid Line standing");
      if (record.standing === "LINE_SEEDED" && (!texts(record.position_refs) || record.position_refs.length < 1)) {
        errors.push("LINE_SEEDED requires at least one position_ref");
      }
      if (record.standing === "LINE_INSTANCE_WITNESSED") {
        if (!texts(record.position_refs) || record.position_refs.length < 2) errors.push("witnessed Line requires at least two positions");
        if (!texts(record.continuity_refs) || record.continuity_refs.length < 1) errors.push("witnessed Line requires continuity_refs");
      }
      if (["LINE_UNRESOLVED","LINE_BASIS_INCOMPARABLE"].includes(String(record.standing)) && !text(record.qf_ref)) {
        errors.push("unresolved Line standing requires qf_ref");
      }
      break;
    }
    case "stage": {
      requireText(record, "stage_basis_ref", errors);
      requireText(record, "line_ref", errors);
      requireText(record, "line_position_ref", errors);
      const allowed = new Set([
        "PGO_UNDERENRICHED","LINE_UNRESOLVED","LEVEL_UNKNOWN","LEVEL_NOT_ESTABLISHED",
        "REGIME_ONLY","LEVEL_NOT_STAGE_UNDER_PGO","STAGE_UNKNOWN","STAGE_LEVEL",
        "STAGE_BASIS_INCOMPARABLE",
      ]);
      if (!allowed.has(String(record.result))) errors.push("invalid Stage result");
      if (record.result === "STAGE_LEVEL") {
        const context = object(record.context);
        if (!context || !text(context.governing_orientation_ref)) {
          errors.push("STAGE_LEVEL requires context.governing_orientation_ref");
        }
        requireText(record, "level_claim_ref", errors);
        requireText(record, "projection_ref", errors);
        requireText(record, "stage_key", errors);
        requireText(record, "occurrence_ref", errors);
      }
      if (["PGO_UNDERENRICHED","LINE_UNRESOLVED","LEVEL_UNKNOWN","STAGE_UNKNOWN","STAGE_BASIS_INCOMPARABLE"].includes(String(record.result))
        && !text(record.qf_ref)) {
        errors.push("unresolved Stage result requires qf_ref");
      }
      break;
    }
    case "type": {
      requireText(record, "typology_ref", errors);
      requireText(record, "conditions_ref", errors);
      const allowed = new Set([
        "TYPE_WITNESSED","TYPE_NOT_ESTABLISHED","TYPE_UNKNOWN",
        "TYPE_INAPPLICABLE","TYPE_SCHEMA_INCOMPARABLE","TYPE_UNCOVERED",
      ]);
      if (!allowed.has(String(record.result))) errors.push("invalid Type result");
      if (record.result === "TYPE_WITNESSED") {
        requireText(record, "classifier_ref", errors);
        requireText(record, "native_relation_kind", errors);
        requireText(record, "witness_ref", errors);
      }
      if (["TYPE_UNKNOWN","TYPE_SCHEMA_INCOMPARABLE","TYPE_UNCOVERED"].includes(String(record.result))
        && !text(record.qf_ref)) {
        errors.push("open Type result requires qf_ref");
      }
      break;
    }
    case "native_relation": {
      for (const key of ["schema_ref","schema_edition_ref","relation_kind_ref","situated_basis_ref"]) {
        requireText(record, key, errors);
      }
      validateFidelity(record.fidelity, errors);
      if (!Array.isArray(record.participants) || record.participants.length < 1) {
        errors.push("native relation requires participants");
      } else {
        for (const participant of record.participants) {
          const p = object(participant);
          if (!p || !text(p.role) || !text(p.referent_id)) {
            errors.push("native relation participants require role + referent_id");
          }
        }
      }
      break;
    }
    case "projection": {
      for (const key of [
        "projection_id","mapper_ref","mapping_relation_ref","governing_orientation_ref",
        "frame_ref","access_ref","scope_resolution_ref","evidence_basis_ref","content_ref",
      ]) requireText(record, key, errors);
      validateFidelity(record.fidelity, errors);
      if (!texts(record.mapped_referent_ids) || record.mapped_referent_ids.length < 1) {
        errors.push("projection requires mapped_referent_ids");
      }
      if (record.mapped_claim_refs !== undefined && !texts(record.mapped_claim_refs)) {
        errors.push("projection.mapped_claim_refs must contain nonblank references");
      }
      if (!Array.isArray(record.omissions) || !record.omissions.every(v => typeof v === "string")) {
        errors.push("projection.omissions must be strings");
      }
      break;
    }
    case "change": {
      if (!URG_CHANGE_KINDS.includes(record.change_kind as UrgChangeKind)) {
        errors.push("change_kind is unknown");
      }
      for (const key of [
        "subject_referent_id","source_basis_ref","destination_basis_ref","continuity_mode_ref",
      ]) requireText(record, key, errors);
      if (!texts(record.affected_claim_refs)) errors.push("affected_claim_refs must contain nonblank references");
      if (!texts(record.affected_dependency_refs)) errors.push("affected_dependency_refs must contain nonblank references");
      if (!texts(record.requalify_refs)) errors.push("requalify_refs must contain nonblank references");
      if (record.evidence_refs !== undefined && !texts(record.evidence_refs)) {
        errors.push("change.evidence_refs must contain nonblank references");
      }
      validateFidelity(record.fidelity, errors);
      break;
    }
    case "question_forward": {
      for (const key of [
        "unresolved_ref","basis_ref","current_standing_ref","discriminator_question",
        "paired_signal_scenario","evidence_change_criteria","alternative_signal_routing",
        "decision_consequence","return_route","reentry_condition",
      ]) requireText(record, key, errors);
      break;
    }
  }

  return errors.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors };
}
