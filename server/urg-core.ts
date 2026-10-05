/**
 * ECO-136 URG portable core, Register-B v1.
 *
 * This module is a machine-consumable structural contract. It deliberately
 * models URG semantics as a discriminated union rather than one record with
 * seven interchangeable "axis" fields.
 *
 * NONCLAIMS:
 * - validation does not establish semantic truth, authority, currentness,
 *   empirical exhaustiveness, or correct domain classification;
 * - native domain semantics remain authoritative for their own relation kinds;
 * - no runtime persistence shape is prescribed here.
 */

export const URG_CORE_ID = "ecos:urg-core:register-b:v1" as const;

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
  "question_forward",
] as const;

export type UrgRecordKind = typeof URG_RECORD_KINDS[number];

export type SituatedContext = {
  referent_id: string;
  boundary_ref: string;
  pgo_ref?: string;
  frame_ref?: string;
  source_refs?: string[];
};

export type EvidenceStanding =
  | "SUPPORTED"
  | "NOT_ESTABLISHED"
  | "UNKNOWN"
  | "INAPPLICABLE"
  | "UNCOVERED"
  | "CONTRADICTED";

export type LevelClaim = {
  kind: "level";
  context: SituatedContext;
  result: "LEVEL_WITNESSED" | "LEVEL_NOT_ESTABLISHED" | "LEVEL_UNKNOWN";
  constituent_referent_ids?: string[];
  organization_ref?: string;
  qf_ref?: string;
};

export type QuadrantClaim = {
  kind: "quadrant";
  context: SituatedContext;
  result: "QUADRANT_POSITION" | "DECOMPOSE" | "QUADRANT_UNKNOWN";
  seat?: "Constitutive" | "Participatory";
  burden?: "Governing" | "Determinate";
  qf_ref?: string;
};

export type DirectionStatus = "SUPPORTED" | "NOT_ESTABLISHED" | "UNKNOWN";

export type DirectionClaim = {
  kind: "direction";
  context: SituatedContext;
  directions: {
    A: DirectionStatus;
    C: DirectionStatus;
    T: DirectionStatus;
    D: DirectionStatus;
  };
  mode?: "tendency" | "capacity" | "drive";
  transformation_ref?: string;
  realized_event_ref?: string;
  composite_candidate_ref?: string;
  dissolution_basis_ref?: string;
  direction_uncovered?: boolean;
  qf_ref?: string;
};

export type StateClaim = {
  kind: "state";
  context: SituatedContext;
  state_basis_ref: string;
  occasion_ref: string;
  result: "STATE_WITNESSED" | "STATE_UNKNOWN" | "STATE_CONTRADICTED";
  state_value?: unknown;
  candidate_set_ref?: string;
  qf_ref?: string;
};

export type LineClaim = {
  kind: "line";
  context: SituatedContext;
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
  stage_basis_ref: string;
  line_ref: string;
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
  level_claim_ref?: string;
  projection_ref?: string;
  qf_ref?: string;
};

export type TypeClaim = {
  kind: "type";
  context: SituatedContext;
  typology_ref: string;
  result:
    | "TYPE_WITNESSED"
    | "TYPE_NOT_ESTABLISHED"
    | "TYPE_UNKNOWN"
    | "TYPE_INAPPLICABLE"
    | "TYPE_SCHEMA_INCOMPARABLE"
    | "TYPE_UNCOVERED";
  classifier_ref?: string;
  native_relation_kind?: string;
  qf_ref?: string;
};

export type NativeRelationClaim = {
  kind: "native_relation";
  schema_ref: string;
  relation_kind_ref: string;
  participants: Array<{ role: string; referent_id: string }>;
  basis_ref?: string;
  standing: EvidenceStanding;
  evidence_refs?: string[];
  qf_ref?: string;
};

export type ProjectionRecord = {
  kind: "projection";
  projection_id: string;
  mapped_referent_ids: string[];
  mapper_ref: string;
  pgo_ref: string;
  frame_ref: string;
  content_ref: string;
  standing: EvidenceStanding;
  omissions: string[];
  source_refs?: string[];
};

export type QuestionForward = {
  kind: "question_forward";
  unresolved_ref: string;
  discriminator_question: string;
  paired_signal_scenario: string;
  evidence_change_criteria: string;
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

function validateContext(value: unknown, errors: string[]): UnknownRecord | null {
  const context = object(value);
  if (!context) {
    errors.push("context must be an object");
    return null;
  }
  if (!text(context.referent_id)) errors.push("context.referent_id is required");
  if (!text(context.boundary_ref)) errors.push("context.boundary_ref is required");
  if (context.pgo_ref !== undefined && !text(context.pgo_ref)) errors.push("context.pgo_ref must be nonblank");
  if (context.frame_ref !== undefined && !text(context.frame_ref)) errors.push("context.frame_ref must be nonblank");
  if (context.source_refs !== undefined && !texts(context.source_refs)) errors.push("context.source_refs must be nonblank strings");
  return context;
}

function requireText(record: UnknownRecord, key: string, errors: string[]) {
  if (!text(record[key])) errors.push(`${key} is required`);
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
    validateContext(record.context, errors);
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
      }
      if (record.result === "LEVEL_UNKNOWN") requireText(record, "qf_ref", errors);
      break;
    }
    case "quadrant": {
      const allowed = new Set(["QUADRANT_POSITION","DECOMPOSE","QUADRANT_UNKNOWN"]);
      if (!allowed.has(String(record.result))) errors.push("invalid quadrant result");
      if (record.result === "QUADRANT_POSITION") {
        if (!["Constitutive","Participatory"].includes(String(record.seat))) errors.push("quadrant seat is required");
        if (!["Governing","Determinate"].includes(String(record.burden))) errors.push("quadrant burden is required");
      }
      if (record.result === "QUADRANT_UNKNOWN") requireText(record, "qf_ref", errors);
      break;
    }
    case "direction": {
      const dirs = object(record.directions);
      if (!dirs) {
        errors.push("directions object is required");
        break;
      }
      for (const key of ["A","C","T","D"]) {
        if (!directionStatuses.has(dirs[key] as DirectionStatus)) errors.push(`invalid direction status: ${key}`);
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
      const allowed = new Set(["STATE_WITNESSED","STATE_UNKNOWN","STATE_CONTRADICTED"]);
      if (!allowed.has(String(record.result))) errors.push("invalid State result");
      if (record.result === "STATE_WITNESSED" && !Object.prototype.hasOwnProperty.call(record, "state_value")) {
        errors.push("STATE_WITNESSED requires state_value");
      }
      if (record.result === "STATE_UNKNOWN" && !text(record.candidate_set_ref) && !text(record.qf_ref)) {
        errors.push("STATE_UNKNOWN requires candidate_set_ref or qf_ref");
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
      const allowed = new Set([
        "PGO_UNDERENRICHED","LINE_UNRESOLVED","LEVEL_UNKNOWN","LEVEL_NOT_ESTABLISHED",
        "REGIME_ONLY","LEVEL_NOT_STAGE_UNDER_PGO","STAGE_UNKNOWN","STAGE_LEVEL",
        "STAGE_BASIS_INCOMPARABLE",
      ]);
      if (!allowed.has(String(record.result))) errors.push("invalid Stage result");
      if (record.result === "STAGE_LEVEL") {
        const context = object(record.context);
        if (!context || !text(context.pgo_ref)) errors.push("STAGE_LEVEL requires context.pgo_ref");
        requireText(record, "level_claim_ref", errors);
        requireText(record, "projection_ref", errors);
        requireText(record, "stage_key", errors);
      }
      if (["PGO_UNDERENRICHED","LINE_UNRESOLVED","LEVEL_UNKNOWN","STAGE_UNKNOWN","STAGE_BASIS_INCOMPARABLE"].includes(String(record.result))
        && !text(record.qf_ref)) {
        errors.push("unresolved Stage result requires qf_ref");
      }
      break;
    }
    case "type": {
      requireText(record, "typology_ref", errors);
      const allowed = new Set([
        "TYPE_WITNESSED","TYPE_NOT_ESTABLISHED","TYPE_UNKNOWN",
        "TYPE_INAPPLICABLE","TYPE_SCHEMA_INCOMPARABLE","TYPE_UNCOVERED",
      ]);
      if (!allowed.has(String(record.result))) errors.push("invalid Type result");
      if (record.result === "TYPE_WITNESSED") {
        requireText(record, "classifier_ref", errors);
        requireText(record, "native_relation_kind", errors);
      }
      if (["TYPE_UNKNOWN","TYPE_SCHEMA_INCOMPARABLE","TYPE_UNCOVERED"].includes(String(record.result))
        && !text(record.qf_ref)) {
        errors.push("open Type result requires qf_ref");
      }
      break;
    }
    case "native_relation": {
      requireText(record, "schema_ref", errors);
      requireText(record, "relation_kind_ref", errors);
      if (!Array.isArray(record.participants) || record.participants.length < 1) {
        errors.push("native relation requires participants");
      } else {
        for (const participant of record.participants) {
          const p = object(participant);
          if (!p || !text(p.role) || !text(p.referent_id)) errors.push("native relation participants require role + referent_id");
        }
      }
      if (!["SUPPORTED","NOT_ESTABLISHED","UNKNOWN","INAPPLICABLE","UNCOVERED","CONTRADICTED"].includes(String(record.standing))) {
        errors.push("invalid native relation standing");
      }
      break;
    }
    case "projection": {
      requireText(record, "projection_id", errors);
      if (!texts(record.mapped_referent_ids) || record.mapped_referent_ids.length < 1) errors.push("projection requires mapped_referent_ids");
      for (const key of ["mapper_ref","pgo_ref","frame_ref","content_ref"]) requireText(record, key, errors);
      if (!Array.isArray(record.omissions) || !record.omissions.every(v => typeof v === "string")) errors.push("projection.omissions must be strings");
      if (!["SUPPORTED","NOT_ESTABLISHED","UNKNOWN","INAPPLICABLE","UNCOVERED","CONTRADICTED"].includes(String(record.standing))) {
        errors.push("invalid projection standing");
      }
      break;
    }
    case "question_forward": {
      for (const key of [
        "unresolved_ref","discriminator_question","paired_signal_scenario",
        "evidence_change_criteria","decision_consequence","return_route","reentry_condition",
      ]) requireText(record, key, errors);
      break;
    }
  }

  return errors.length === 0
    ? { valid: true, errors: [] }
    : { valid: false, errors };
}
