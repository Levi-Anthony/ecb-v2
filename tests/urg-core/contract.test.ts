import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  URG_CORE_ID,
  URG_RECORD_KINDS,
  validateUrgRecord,
} from "../../server/urg-core.ts";

const ctx = {
  referent_id: "11111111-1111-4111-8111-111111111111",
  boundary_ref: "boundary:r1:v1",
  pgo_ref: "pgo:teaching:v1",
  frame_ref: "frame:observer:v1",
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

test("machine descriptor and executable module agree on core identity and record kinds", () => {
  const path = new URL("../../schemas/urg-core-v1.contract.json", import.meta.url);
  const descriptor = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(descriptor.contract_id, URG_CORE_ID);
  assert.deepEqual(descriptor.record_kinds, [...URG_RECORD_KINDS]);
});

test("Level is a witnessed constitutive relation, not a rank field", () => valid({
  kind:"level", context:ctx, result:"LEVEL_WITNESSED",
  constituent_referent_ids:["22222222-2222-4222-8222-222222222222"],
  organization_ref:"organization:service:v1",
}));

test("witnessed Level without organization is rejected", () => invalid({
  kind:"level", context:ctx, result:"LEVEL_WITNESSED",
  constituent_referent_ids:["22222222-2222-4222-8222-222222222222"],
}, "organization_ref"));

test("Quadrant preserves seat and answer-burden as distinct generators", () => valid({
  kind:"quadrant", context:ctx, result:"QUADRANT_POSITION",
  seat:"Participatory", burden:"Governing",
}));

test("Quadrant unknown must retain a QF route", () => invalid({
  kind:"quadrant", context:ctx, result:"QUADRANT_UNKNOWN",
}, "qf_ref"));

test("A+C coactivation is legal", () => valid({
  kind:"direction", context:ctx,
  directions:{A:"SUPPORTED",C:"SUPPORTED",T:"NOT_ESTABLISHED",D:"NOT_ESTABLISHED"},
  mode:"drive", transformation_ref:"event:autoscale:1",
}));

test("Transcendence cannot self-promote a composite", () => invalid({
  kind:"direction", context:ctx,
  directions:{A:"NOT_ESTABLISHED",C:"NOT_ESTABLISHED",T:"SUPPORTED",D:"NOT_ESTABLISHED"},
}, "composite_candidate_ref"));

test("Dissolution requires a constitutive dissolution basis", () => invalid({
  kind:"direction", context:ctx,
  directions:{A:"NOT_ESTABLISHED",C:"NOT_ESTABLISHED",T:"NOT_ESTABLISHED",D:"SUPPORTED"},
}, "dissolution_basis_ref"));

test("State witnessed value is basis indexed", () => valid({
  kind:"state", context:ctx, state_basis_ref:"state-basis:thermal:v1",
  occasion_ref:"time:2026-10-05T12:00:00Z", result:"STATE_WITNESSED", state_value:{temperature_c:20},
}));

test("epistemic State unknown must preserve candidates or QF", () => invalid({
  kind:"state", context:ctx, state_basis_ref:"state-basis:thermal:v1",
  occasion_ref:"time:1", result:"STATE_UNKNOWN",
}, "candidate_set_ref"));

test("Line instance requires positions plus continuity", () => valid({
  kind:"line", context:ctx, line_contract_ref:"line:learning:v1",
  standing:"LINE_INSTANCE_WITNESSED", position_refs:["p0","p1"], continuity_refs:["edge:p0:p1"],
}));

test("chronology-like one-position Line is not witnessed", () => invalid({
  kind:"line", context:ctx, line_contract_ref:"line:learning:v1",
  standing:"LINE_INSTANCE_WITNESSED", position_refs:["p0"], continuity_refs:[],
}, "at least two"));

test("Stage standing composes Line + PGO + Level + projection", () => valid({
  kind:"stage", context:ctx, stage_basis_ref:"stage-basis:dressing:v1",
  line_ref:"line-instance:dressing:1", result:"STAGE_LEVEL",
  stage_key:"dressing:integrated", level_claim_ref:"level-claim:7", projection_ref:"stage-projection:2",
}));

test("Stage cannot be generated from a label/regime alone", () => invalid({
  kind:"stage",
  context:{referent_id:ctx.referent_id,boundary_ref:ctx.boundary_ref},
  stage_basis_ref:"stage-basis:dressing:v1", line_ref:"line-instance:dressing:1",
  result:"STAGE_LEVEL", stage_key:"3",
}, "pgo_ref"));

test("Type preserves native schema relation semantics", () => valid({
  kind:"type", context:ctx, typology_ref:"sysml:definitions:v2",
  result:"TYPE_WITNESSED", classifier_ref:"definition:VoltageConverter",
  native_relation_kind:"usage-of-definition",
}));

test("witnessed Type without native relation meaning is rejected", () => invalid({
  kind:"type", context:ctx, typology_ref:"schema:x",
  result:"TYPE_WITNESSED", classifier_ref:"type:A",
}, "native_relation_kind"));

test("native relations may be n-ary and role-bearing", () => valid({
  kind:"native_relation", schema_ref:"modelica:electrical:v3.7",
  relation_kind_ref:"connector-equation-set",
  participants:[
    {role:"pin_a",referent_id:"a"},
    {role:"pin_b",referent_id:"b"},
    {role:"ground",referent_id:"g"},
  ],
  standing:"SUPPORTED",
}));

test("projection keeps mapper/frame/purpose separate from mapped referents", () => valid({
  kind:"projection", projection_id:"view:1", mapped_referent_ids:["r1"],
  mapper_ref:"worker:1", pgo_ref:"pgo:1", frame_ref:"frame:1",
  content_ref:"artifact:1", standing:"SUPPORTED", omissions:["full implementation history"],
}));

test("Question Forward must be discriminating and routed", () => valid({
  kind:"question_forward", unresolved_ref:"claim:1",
  discriminator_question:"Which source edition is governing for the current use?",
  paired_signal_scenario:"A branch proposal conflicts with the accepted integration record.",
  evidence_change_criteria:"A later explicit acceptance or supersession receipt is recovered.",
  decision_consequence:"Keep branch material exploratory unless governing standing changes.",
  return_route:"ECO-136 reentry",
  reentry_condition:"Recovered standing changes the current source selection.",
}));

test("generic need-more-info is not a sufficient Question Forward", () => invalid({
  kind:"question_forward", unresolved_ref:"claim:1",
  discriminator_question:"Need more information",
}, "paired_signal_scenario"));

test("unknown record kinds are rejected rather than force-fit", () => invalid({
  kind:"mystery_axis", context:ctx,
}, "kind is unknown"));
