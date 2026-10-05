#!/usr/bin/env python3
"""Bounded structural checker for the ECO-136 URG full-core candidate.

This checker tests declared non-collapse and composition obligations in the
qualification matrix. It does not infer semantic truth, referent identity,
PGO adequacy, Level/Stage standing, domain validity, authority, or empirical
completeness of URG.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

FORBIDDEN_TRUE = {
    "referent_equals_representation",
    "mapper_purpose_substituted_for_referent",
    "pgo_relevance_implies_existence",
    "verification_implies_truth_authority",
    "persistence_implies_standing",
    "newest_implies_current_binding",
    "phase_implies_authority",
    "boundary_revision_treated_as_view_change",
    "type_hierarchy_implies_level",
    "state_change_implies_direction",
    "timestamp_order_implies_line",
    "gamma_regime_implies_stage",
    "role_implies_type",
    "transcendence_implies_level",
    "record_deletion_implies_dissolution",
    "same_label_implies_classifier_identity",
    "equal_endpoint_erases_history",
    "same_state_implies_same_line_position",
    "referent_replaced_due_to_pgo",
    "stage_auto_asserted",
    "level_auto_asserted",
    "auto_level",
    "view_equals_model_element",
    "forced_master_type",
    "state_changed_from_observation_alone",
    "referent_change_inferred",
    "self_pass_confers_authority",
    "filtered_by_pgo_only",
    "latest_writer_implies_authority",
    "unknown_treated_as_absent",
}

def validate(c):
    reasons=[]
    for key in FORBIDDEN_TRUE:
        if c.get(key) is True:
            reasons.append(f"forbidden promotion/collapse: {key}")

    if c.get("domain_schema_native") and c.get("native_semantics_recoverable") is False:
        reasons.append("native domain semantics must remain recoverable")

    if c.get("material_challenge") and not c.get("challenge_route_preserved"):
        reasons.append("material challenge requires bounded F8 route")

    if c.get("human_door") and c.get("agent_door") and not c.get("reconcilable"):
        reasons.append("human and agent doors cannot become truth silos")

    if c.get("unknown_treated_as_absent"):
        reasons.append("unknown cannot be treated as absent")

    if c.get("unknown_preserved") and not (c.get("qf_has_discriminator") and c.get("qf_has_reentry")):
        reasons.append("decision-bearing unknown requires discriminating QF/reentry")

    if c.get("stage_witnessed"):
        for key in ("line_witnessed","pgo_adequate","lawful_seat","level_witnessed","projection_selected"):
            if not c.get(key):
                reasons.append(f"Stage fixture missing prerequisite: {key}")

    if c.get("same_line_allowed") and not c.get("continuity_link"):
        reasons.append("Line resume requires continuity link")

    if c.get("schema_changed") and c.get("crosswalk") is False and c.get("direct_comparison", False):
        reasons.append("schema change without crosswalk blocks direct comparison")

    if c.get("multiple_type_schemas") and c.get("forced_master_type"):
        reasons.append("multiple typologies cannot be forced into one master Type")

    return len(reasons)==0,reasons

def main(path):
    data=json.loads(Path(path).read_text())
    failures=[]
    for c in data["cases"]:
        actual,reasons=validate(c)
        expected=c["expected_valid"]
        ok=actual==expected
        print(f"{'PASS' if ok else 'FAIL'} {c['id']}: expected_valid={expected} actual_valid={actual}" + (f" reasons={reasons}" if reasons else ""))
        if not ok:
            failures.append(c["id"])
    print("\nNONCLAIMS: structural non-collapse/composition checks only; no semantic truth, authority, empirical exhaustiveness, or automatic axis classification is established.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} cases): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['cases'])} cases)")
    return 0

if __name__=="__main__":
    p=sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name("URG-Core-Qualification-Matrix-v1.0.json")
    raise SystemExit(main(p))
