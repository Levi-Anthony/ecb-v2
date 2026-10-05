#!/usr/bin/env python3
"""Bounded structural checker for ECO-136 URG Stage contract.

Validates declared fixture consistency only. It does not infer PGO adequacy,
real Level standing, correct Stage projection, developmental truth, natural-
language Stage meaning, or domain maturity theory.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

def validate(f):
    reasons=[]

    if f.get("stage_claimed"):
        if f.get("line_witnessed") is False:
            reasons.append("Stage requires witnessed Line")
        if f.get("pgo_adequate") is False:
            reasons.append("Stage requires adequate PGO")
        if f.get("lawful_seat") is False:
            reasons.append("Stage requires lawful Level-bearing seat")
        if f.get("level_witnessed") is False:
            reasons.append("Stage requires Level witness")
        if f.get("projection_selected") is False:
            reasons.append("Stage requires positive projection selection")
        if f.get("theta_explicit") is False:
            reasons.append("Stage requires explicit Stage basis")

    if f.get("stage_transition_claimed"):
        if f.get("theta_changed") and not f.get("rebase_declared"):
            reasons.append("Stage-basis change cannot masquerade as Stage transition")
        if f.get("same_stage_key"):
            reasons.append("same Stage class cannot be a Stage transition under fixed basis")
        if f.get("state_changed") and not f.get("projected_level_changed"):
            reasons.append("State change alone cannot establish Stage transition")
        if f.get("gamma_changed") and not f.get("projected_level_changed"):
            reasons.append("Q/Gamma change alone cannot establish Stage transition")
        if f.get("projected_level_changed") is False:
            reasons.append("Stage transition requires projected Stage-relevant Level change")

    if f.get("result")=="REGIME_ONLY" and f.get("stage_claimed"):
        reasons.append("REGIME_ONLY cannot be promoted to Stage")

    if f.get("result")=="PGO_UNDERENRICHED" and f.get("stage_claimed"):
        reasons.append("under-enriched PGO cannot grant Stage")

    if f.get("theta_changed"):
        if f.get("direct_stage_identity_claimed") and not f.get("crosswalk"):
            reasons.append("cross-basis Stage identity requires crosswalk")
        if f.get("stage_identity_inferred_from_label"):
            reasons.append("same label across Stage bases does not prove identity")

    if f.get("same_stage_key") and f.get("same_occurrence_claimed"):
        reasons.append("same Stage class cannot collapse distinct occurrences")

    if f.get("monotonicity_required") and not f.get("domain_declares_monotonicity"):
        reasons.append("monotonicity is not a URG Stage default")

    if f.get("total_order_required") and not f.get("domain_declares_total_order"):
        reasons.append("total Stage order is not a URG default")

    if f.get("min_dwell_required"):
        reasons.append("Stage has no universal minimum dwell time")

    if f.get("dedicated_persistence_required"):
        reasons.append("operational first-class Stage does not imply dedicated persistence")

    if f.get("global_numeric_stage_rank_required"):
        reasons.append("global numeric Stage rank is forbidden")

    if f.get("label_changed") and f.get("stage_transition_claimed") and f.get("same_stage_key"):
        reasons.append("label rename cannot create Stage transition")

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
    print("\nNONCLAIMS: structural contract consistency only; no inference of PGO adequacy, real Level standing, developmental truth, projection correctness, or domain maturity.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} fixtures): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['fixtures'])} fixtures)")
    return 0

if __name__=="__main__":
    p=sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name("stage-fixtures-v1.0.json")
    raise SystemExit(main(p))
