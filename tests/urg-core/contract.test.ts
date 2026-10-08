import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  URG_CORE_ID,
  URG_IMPLEMENTATION_REVISION,
  URG_RECORD_KINDS,
  QUADRANT_DISCLOSURE_CONTRACT, QUADRANT_DISCLOSURES,
  LEGACY_QUADRANT_CONTRACT, validateLegacyQuadrantRecord,
  validateUrgRecord,
} from "../../server/urg-core.ts";

const fidelity = {
  coverage: "EXAMINED",
  activation: "ACTIVE",
  disposition: "RELIED_FOR_DECLARED_USE",
  evidence_refs: ["evidence:1"],
  warrant_ref: "warrant:1",
};

const ctx = {
  referent_id: "11111111-1111-4111-8111-111111111111",
  grain_ref: "grain:service",
  boundary_ref: "boundary:r1:v1",
  governing_orientation_ref: "pgo:teaching:v1",
  mapper_ref: "mapper:worker:1",
  frame_ref: "frame:observer:v1",
  access_ref: "access:testimony:v1",
};

function valid(record: unknown) {
  const result = validateUrgRecord(record);
  assert.equal(result.valid, true, result.errors.join("; "));
}

function invalid(record: unknown, contains?: string) {
  const result = validateUrgRecord(record);
  assert.equal(result.valid, false);
  if (contains) assert.ok(result.errors.some(e => e.includes(contains)), result.errors.join("; "));
}

test("machine descriptor and executable module agree", () => {
  const path = new URL("../../schemas/urg-core-v2.contract.json", import.meta.url);
  const descriptor = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(descriptor.contract_id, URG_CORE_ID);
  assert.equal(descriptor.implementation_revision, URG_IMPLEMENTATION_REVISION);
  assert.deepEqual(descriptor.record_kinds, [...URG_RECORD_KINDS]);
});

test("coverage, activation and disposition remain orthogonal", () => valid({
  kind:"level", context:ctx,
  fidelity:{coverage:"EXAMINED",activation:"DORMANT",disposition:"NONCONSEQUENTIAL_NOW"},
  result:"LEVEL_NOT_ESTABLISHED",
}));

test("UNEXAMINED cannot silently carry a semantic disposition", () => invalid({
  kind:"level", context:ctx,
  fidelity:{coverage:"UNEXAMINED",activation:"DORMANT",disposition:"RELIED_FOR_DECLARED_USE"},
  result:"LEVEL_NOT_ESTABLISHED",
}, "UNEXAMINED"));

test("authority and currentness are independent references, not inferred from qualification", () => valid({
  kind:"level", context:ctx,
  fidelity:{...fidelity,authority_ref:"authority:principal:1",currentness_ref:"binding:7"},
  result:"LEVEL_NOT_ESTABLISHED",
}));

test("Level is a witnessed constitutive relation, not a rank field", () => valid({
  kind:"level", context:ctx, fidelity, result:"LEVEL_WITNESSED",
  constituent_referent_ids:["22222222-2222-4222-8222-222222222222"],
  organization_ref:"organization:service:v1", dependence_witness_ref:"dependence:service:v1",
}));

test("witnessed Level without organization is rejected", () => invalid({
  kind:"level", context:ctx, fidelity, result:"LEVEL_WITNESSED",
  constituent_referent_ids:["22222222-2222-4222-8222-222222222222"],
}, "organization_ref"));

test("actual proper determination is UL regardless of determinate burden", () => valid({
  kind:"quadrant", context:ctx, fidelity, result:"QUADRANT_POSITION",
  disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT, disclosure:"UL",
  content_ref:"proper-state:1", characterization_ref:"instantiation-only:1", conditions_ref:"occasion:1",
  qualifiers:{seat:"Constitutive", burden:"Determinate"},
}));

test("Quadrant unknown must retain a QF route", () => invalid({
  kind:"quadrant", context:ctx, fidelity, disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT, result:"QUADRANT_UNKNOWN",
}, "qf_ref"));

test("A+C coactivation is legal", () => valid({
  kind:"direction", context:ctx, fidelity,
  directions:{A:"SUPPORTED",C:"SUPPORTED",T:"NOT_ESTABLISHED",D:"NOT_ESTABLISHED"},
  mode:"drive", transformation_ref:"transformation:autoscale:1", conditions_ref:"conditions:autoscale:1",
  direction_witness_refs:{A:"witness:A:1",C:"witness:C:1"},
}));

test("Transcendence cannot self-promote a composite", () => invalid({
  kind:"direction", context:ctx, fidelity,
  directions:{A:"NOT_ESTABLISHED",C:"NOT_ESTABLISHED",T:"SUPPORTED",D:"NOT_ESTABLISHED"},
  transformation_ref:"transformation:compose:1", conditions_ref:"conditions:compose:1",
  direction_witness_refs:{T:"witness:T:1"},
}, "composite_candidate_ref"));

test("Dissolution requires a constitutive dissolution basis", () => invalid({
  kind:"direction", context:ctx, fidelity,
  directions:{A:"NOT_ESTABLISHED",C:"NOT_ESTABLISHED",T:"NOT_ESTABLISHED",D:"SUPPORTED"},
  transformation_ref:"transformation:dissolve:1", conditions_ref:"conditions:dissolve:1",
  direction_witness_refs:{D:"witness:D:1"},
}, "dissolution_basis_ref"));

test("State makes consequential F independently attributable", () => valid({
  kind:"state", context:ctx, fidelity, state_basis_ref:"state-basis:thermal:v1",
  occasion_ref:"time:2026-10-05T12:00:00Z", result:"STATE_WITNESSED", state_value:{temperature_c:20},
}));

test("State without consequential mapper/frame/access is rejected", () => invalid({
  kind:"state",
  context:{referent_id:ctx.referent_id,boundary_ref:ctx.boundary_ref},
  fidelity, state_basis_ref:"state-basis:thermal:v1", occasion_ref:"time:1",
  result:"STATE_WITNESSED", state_value:{temperature_c:20},
}, "mapper/frame/access"));

test("epistemic State unknown must preserve candidates or QF", () => invalid({
  kind:"state", context:ctx, fidelity, state_basis_ref:"state-basis:thermal:v1",
  occasion_ref:"time:1", result:"STATE_UNKNOWN",
}, "candidate_set_ref"));

test("frame incomparability is not silently converted to State transition", () => valid({
  kind:"state", context:ctx, fidelity, state_basis_ref:"state-basis:thermal:v1",
  occasion_ref:"time:1", result:"STATE_FRAME_INCOMPARABLE", qf_ref:"qf:frame:1",
}));

test("Line instance requires positions plus continuity", () => valid({
  kind:"line", context:ctx, fidelity, line_contract_ref:"line:learning:v1",
  standing:"LINE_INSTANCE_WITNESSED", position_refs:["p0","p1"], continuity_refs:["edge:p0:p1"],
}));

test("chronology-like one-position Line is not witnessed", () => invalid({
  kind:"line", context:ctx, fidelity, line_contract_ref:"line:learning:v1",
  standing:"LINE_INSTANCE_WITNESSED", position_refs:["p0"], continuity_refs:[],
}, "at least two"));

test("Stage standing composes Line + G + Level + projection", () => valid({
  kind:"stage", context:ctx, fidelity, stage_basis_ref:"stage-basis:dressing:v1",
  line_ref:"line-instance:dressing:1", line_position_ref:"position:dressing:2", result:"STAGE_LEVEL",
  stage_key:"dressing:integrated", occurrence_ref:"stage-occurrence:2", level_claim_ref:"level-claim:7", projection_ref:"stage-projection:2",
}));

test("Stage cannot be generated from a regime without G", () => invalid({
  kind:"stage",
  context:{referent_id:ctx.referent_id,boundary_ref:ctx.boundary_ref},
  fidelity, stage_basis_ref:"stage-basis:dressing:v1", line_ref:"line-instance:dressing:1",
  line_position_ref:"position:3", result:"STAGE_LEVEL", stage_key:"3", occurrence_ref:"occurrence:3", level_claim_ref:"level:1", projection_ref:"projection:1",
}, "governing_orientation_ref"));

test("Type preserves native schema membership semantics", () => valid({
  kind:"type", context:ctx, fidelity, typology_ref:"sysml:definitions:v2", conditions_ref:"classification-context:1",
  result:"TYPE_WITNESSED", classifier_ref:"definition:VoltageConverter",
  native_relation_kind:"usage-of-definition", witness_ref:"witness:type:1",
}));

test("witnessed Type without native relation meaning is rejected", () => invalid({
  kind:"type", context:ctx, fidelity, typology_ref:"schema:x", conditions_ref:"classification-context:1",
  result:"TYPE_WITNESSED", classifier_ref:"type:A", witness_ref:"witness:type:1",
}, "native_relation_kind"));

test("native relations may be n-ary and keep source schema edition", () => valid({
  kind:"native_relation", schema_ref:"modelica:electrical", schema_edition_ref:"3.7",
  relation_kind_ref:"connector-equation-set", situated_basis_ref:"basis:circuit:1",
  participants:[
    {role:"pin_a",referent_id:"a"},
    {role:"pin_b",referent_id:"b"},
    {role:"ground",referent_id:"g"},
  ],
  fidelity,
}));

test("projection exposes mapper, mapping relation, G, frame, access, scope and omissions", () => valid({
  kind:"projection", projection_id:"view:1", mapped_referent_ids:["r1"],
  mapped_claim_refs:["claim:1"], mapper_ref:"worker:1", mapping_relation_ref:"maps:v1",
  governing_orientation_ref:"pgo:1", frame_ref:"frame:1", access_ref:"access:1",
  scope_resolution_ref:"resolution:summary", evidence_basis_ref:"evidence-basis:projection:1", content_ref:"artifact:1",
  fidelity:{...fidelity,currentness_ref:"binding:projection:1"}, omissions:["full implementation history"],
}));

test("projection cannot erase its access path", () => invalid({
  kind:"projection", projection_id:"view:1", mapped_referent_ids:["r1"],
  mapper_ref:"worker:1", mapping_relation_ref:"maps:v1",
  governing_orientation_ref:"pgo:1", frame_ref:"frame:1",
  scope_resolution_ref:"resolution:summary", evidence_basis_ref:"evidence-basis:projection:1", content_ref:"artifact:1",
  fidelity, omissions:[],
}, "access_ref"));

test("material change names source, destination, continuity and requalification", () => valid({
  kind:"change", change_kind:"ChangeFrame", subject_referent_id:"r1",
  source_basis_ref:"frame:old", destination_basis_ref:"frame:new",
  continuity_mode_ref:"crosswalk:old-new", affected_claim_refs:["state:1"], affected_dependency_refs:["dependency:frame-transform"],
  requalify_refs:["state:1","projection:1"], fidelity,
  evidence_refs:["transform:1"],
}));

test("generic untyped refresh is rejected", () => invalid({
  kind:"change", change_kind:"RefreshContext", subject_referent_id:"r1",
  source_basis_ref:"basis:a", destination_basis_ref:"basis:b",
  continuity_mode_ref:"unknown", affected_claim_refs:[], affected_dependency_refs:[], requalify_refs:[], fidelity,
}, "change_kind"));

test("handoff/reconstruction is an explicit typed change, not currentness by copying", () => valid({
  kind:"change", change_kind:"Handoff", subject_referent_id:"engagement:1",
  source_basis_ref:"worker:a", destination_basis_ref:"worker:b",
  continuity_mode_ref:"handoff-packet:7", affected_claim_refs:["claim:1"], affected_dependency_refs:["dependency:handoff"],
  requalify_refs:["currentness:engagement:1"], fidelity,
}));

test("Question Forward carries basis, standing, discriminating signal and return routing", () => valid({
  kind:"question_forward", unresolved_ref:"claim:1", basis_ref:"basis:1",
  current_standing_ref:"standing:unresolved:1",
  discriminator_question:"Which source edition is governing for the current use?",
  paired_signal_scenario:"A branch proposal conflicts with the accepted integration record.",
  evidence_change_criteria:"A later explicit acceptance or supersession receipt is recovered.",
  alternative_signal_routing:"If no accepted supersession exists, retain the branch as exploratory.",
  decision_consequence:"Do not promote exploratory material to governing standing.",
  return_route:"ECO-136 reentry",
  reentry_condition:"Recovered standing changes the current source selection.",
}));

test("generic need-more-info is not a sufficient Question Forward", () => invalid({
  kind:"question_forward", unresolved_ref:"claim:1", basis_ref:"basis:1",
  current_standing_ref:"standing:unknown",
  discriminator_question:"Need more information",
}, "paired_signal_scenario"));

test("unknown record kinds are rejected rather than force-fit", () => invalid({
  kind:"mystery_axis", context:ctx,
}, "kind is unknown"));

test("Level witness preserves the constitutive dependence/asymmetry witness", () => invalid({
  kind:"level", context:ctx, fidelity, result:"LEVEL_WITNESSED",
  constituent_referent_ids:["c1"], organization_ref:"organization:1",
}, "dependence_witness_ref"));

test("every directional account declares transformation and conditions", () => invalid({
  kind:"direction", context:ctx, fidelity,
  directions:{A:"UNKNOWN",C:"UNKNOWN",T:"UNKNOWN",D:"UNKNOWN"},
}, "transformation_ref"));

test("supported Direction requires its own witness rather than status alone", () => invalid({
  kind:"direction", context:ctx, fidelity,
  transformation_ref:"transformation:1", conditions_ref:"conditions:1",
  directions:{A:"SUPPORTED",C:"NOT_ESTABLISHED",T:"NOT_ESTABLISHED",D:"NOT_ESTABLISHED"},
}, "witness ref: A"));

test("STAGE_LEVEL preserves occurrence identity separately from class", () => invalid({
  kind:"stage", context:ctx, fidelity, stage_basis_ref:"stage-basis:1",
  line_ref:"line:1", line_position_ref:"position:1", result:"STAGE_LEVEL",
  stage_key:"class:a", level_claim_ref:"level:1", projection_ref:"projection:1",
}, "occurrence_ref"));

test("Type claim remains conditions-indexed", () => invalid({
  kind:"type", context:ctx, fidelity, typology_ref:"schema:1",
  result:"TYPE_NOT_ESTABLISHED",
}, "conditions_ref"));

test("TYPE_WITNESSED requires an explicit witness", () => invalid({
  kind:"type", context:ctx, fidelity, typology_ref:"schema:1", conditions_ref:"conditions:1",
  result:"TYPE_WITNESSED", classifier_ref:"classifier:1", native_relation_kind:"instance-of",
}, "witness_ref"));

test("projection preserves evidence basis independently from content", () => invalid({
  kind:"projection", projection_id:"view:2", mapped_referent_ids:["r1"],
  mapper_ref:"mapper:1", mapping_relation_ref:"maps:1", governing_orientation_ref:"pgo:1",
  frame_ref:"frame:1", access_ref:"access:1", scope_resolution_ref:"scope:1",
  content_ref:"artifact:2", fidelity, omissions:[],
}, "evidence_basis_ref"));

test("material change declares affected dependencies as well as claims", () => invalid({
  kind:"change", change_kind:"Reorient", subject_referent_id:"engagement:1",
  source_basis_ref:"g:1", destination_basis_ref:"g:2", continuity_mode_ref:"rekey:1",
  affected_claim_refs:["claim:1"], requalify_refs:["claim:1"], fidelity,
}, "affected_dependency_refs"));


test("retained qualifiers cannot select, erase or change any disclosure", () => {
  for (const disclosure of QUADRANT_DISCLOSURES) for (const seat of ["Constitutive", "Participatory"]) for (const burden of ["Governing", "Determinate"]) {
    valid({kind:"quadrant", context:ctx, fidelity, result:"QUADRANT_POSITION",
      disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT, disclosure,
      content_ref:"content:1", characterization_ref:"semantic-assessment:1", conditions_ref:"conditions:1",
      qualifiers:{seat, burden}});
  }
});
test("historical records remain interpretable but cannot enter current disclosure coverage", () => {
  const old = {kind:"quadrant", context:ctx, fidelity, result:"QUADRANT_POSITION", seat:"Constitutive", burden:"Determinate"};
  assert.equal(validateLegacyQuadrantRecord(old, LEGACY_QUADRANT_CONTRACT).valid, true);
  assert.equal(validateLegacyQuadrantRecord(old, QUADRANT_DISCLOSURE_CONTRACT).valid, false);
  invalid(old, "disclosure_contract");
  invalid({...old, disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT, disclosure:"UL"}, "qualifiers");
});
test("a disclosure label without its positive account and characterization cannot pass", () => {
  invalid({kind:"quadrant",context:ctx,fidelity,result:"QUADRANT_POSITION",
    disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT,disclosure:"LL"}, "characterization_ref");
});
test("compound inquiries require distinct recoverable components", () => {
  const base = {kind:"quadrant",context:ctx,fidelity,result:"DECOMPOSE",disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT};
  invalid({...base,component_refs:["same","same"]}, "component_refs");
  valid({...base,component_refs:["proper-account","manifest-account"]});
});
test("unknown content preserves an identified disclosure without manufacturing a result", () => valid({
  kind:"quadrant",context:ctx,fidelity:{coverage:"EXAMINED",activation:"ACTIVE",disposition:"UNRESOLVED"},
  result:"QUADRANT_UNKNOWN",disclosure_contract:QUADRANT_DISCLOSURE_CONTRACT,disclosure:"UL",qf_ref:"question:proper-account",
}));
