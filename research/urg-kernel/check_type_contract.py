#!/usr/bin/env python3
"""Bounded structural checker for ECO-136 URG Type contract.

Validates declared fixture consistency only. It does not infer actual type
membership, typology adequacy, classifier identity in reality, Level/Stage
standing, or empirical validity of any domain taxonomy.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

def validate(f):
    reasons=[]

    if f.get("same_label") and f.get("different_schema") and f.get("classifier_identity_inferred"):
        reasons.append("same label across schemas cannot establish classifier identity")

    if f.get("schema_changed"):
        if f.get("direct_identity_claimed") and not f.get("crosswalk"):
            reasons.append("cross-schema identity/comparison requires crosswalk")
        if f.get("referent_change_inferred_from_schema_only"):
            reasons.append("schema revision alone cannot imply referent change")

    if f.get("no_classifier_fits"):
        if f.get("force_fit"):
            reasons.append("uncovered classification cannot be force-fit")
        if f.get("result") not in {"TYPE_UNCOVERED","TYPE_SCHEMA_INCOMPARABLE",None} and not f.get("force_fit"):
            reasons.append("unexpected uncovered result")

    if f.get("type_witnessed"):
        if f.get("level_auto_asserted"):
            reasons.append("Type cannot auto-create Level")
        if f.get("stage_auto_asserted"):
            reasons.append("Type cannot auto-create Stage")
        if f.get("referent_equals_classifier_by_type_claim"):
            reasons.append("Type claim cannot collapse referent into classifier")

    if f.get("state_changed") and f.get("type_auto_asserted"):
        reasons.append("State change cannot auto-create Type")

    if f.get("directional_event") and f.get("type_auto_asserted"):
        reasons.append("Direction event cannot auto-create Type")

    if f.get("role_changed") and not f.get("schema_declares_role_classifier") and f.get("type_auto_asserted"):
        reasons.append("role cannot become Type without schema semantics")

    mode=f.get("membership_mode")
    claims=f.get("claims",[])
    if mode=="exclusive" and len(claims)>1:
        reasons.append("exclusive typology cannot accept multiple simultaneous claims")
    if mode=="multi" and len(claims)<2:
        reasons.append("multi-label fixture should demonstrate multiple claims")
    if mode=="probabilistic" and f.get("epistemic_confidence_conflated"):
        reasons.append("native probabilistic membership cannot be silently conflated with epistemic confidence")

    if f.get("normalized_relation") and not f.get("native_relation_recoverable"):
        reasons.append("normalized typing view must preserve native relation")

    if f.get("pgo_selects_schema") and f.get("unsupported_membership_created"):
        reasons.append("PGO cannot manufacture Type membership")

    if f.get("schema_typed_by_other_schema") and f.get("infinite_regress_required"):
        reasons.append("meta-typing does not require infinite regress for bounded claim")

    if f.get("classifier_becomes_focal") and not f.get("classifier_referent_addressable"):
        reasons.append("classifier focalization requires addressable classifier referent")

    return len(reasons)==0,reasons

def main(path):
    data=json.loads(Path(path).read_text())
    failures=[]
    for f in data["fixtures"]:
        actual,reasons=validate(f)
        expected=f["expected_valid"]
        ok=actual==expected
        print(f"{'PASS' if ok else 'FAIL'} {f['id']}: expected_valid={expected} actual_valid={actual}" + (f" reasons={reasons}" if reasons else ""))
        if not ok:
            failures.append(f["id"])
    print("\nNONCLAIMS: structural contract consistency only; no inference of actual membership, typology adequacy, real classifier identity, Level/Stage standing, or empirical taxonomy validity.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} fixtures): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['fixtures'])} fixtures)")
    return 0

if __name__=="__main__":
    p=sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name("type-fixtures-v1.0.json")
    raise SystemExit(main(p))
