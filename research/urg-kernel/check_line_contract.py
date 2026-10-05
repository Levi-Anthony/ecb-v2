#!/usr/bin/env python3
"""Bounded structural checker for ECO-225 URG Line contract.

Validates declared fixture consistency only. It does not infer real subject
continuity, developmental domain, progress/maturity, causal lineage, Stage,
Level, or semantic adequacy of comparison relation J.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

def validate(f):
    reasons=[]

    if f.get("same_line_claimed"):
        if f.get("k_continuity") is False:
            reasons.append("same-Line claim lacks K continuity")
        if f.get("i_link") is False:
            reasons.append("same-Line claim lacks admissible I link")
        if f.get("dj_changed") and not f.get("line_basis_crosswalk"):
            reasons.append("D/J changed without Line-basis crosswalk")
        if f.get("state_basis_changed") and not f.get("state_crosswalk"):
            reasons.append("State basis changed without crosswalk")
        if f.get("r_or_b_changed"):
            if not f.get("reseat_receipt"):
                reasons.append("R/B change lacks reseat/boundary receipt")
            if not f.get("k_continuity_bridge"):
                reasons.append("R/B change lacks K continuity bridge")
            if not f.get("state_redisclosed"):
                reasons.append("R/B change lacks destination State redisclosure")

    if f.get("line_witnessed"):
        if f.get("j_defined") is False:
            reasons.append("witnessed Line requires a comparison relation J")
        if f.get("stage_auto_asserted"):
            reasons.append("Line cannot auto-create Stage")

    if f.get("line_contract") and f.get("positions", 0)==0 and f.get("witnessed_instance_claimed"):
        reasons.append("prospective Line contract is not a witnessed instance")

    if f.get("same_state_value") and f.get("same_position_claimed"):
        reasons.append("equal State value cannot collapse distinct longitudinal positions")

    if f.get("same_r") and f.get("different_dj") and f.get("merged_as_one"):
        reasons.append("parallel Lines with different D/J cannot silently merge")

    if f.get("branched"):
        if f.get("one_instance_claimed") and not (f.get("k_continuity") and f.get("lambda_allows_branch")):
            reasons.append("one branching instance requires K continuity and branching contract")
        if f.get("k_split"):
            if not f.get("shared_ancestry"):
                reasons.append("split descendants must preserve ancestry")
            if f.get("merged_postfork"):
                reasons.append("distinct post-fork K subjects cannot be silently merged")
            if not f.get("descendant_instances") and not f.get("merged_postfork"):
                reasons.append("K split requires explicit descendant-instance treatment")

    if f.get("monotonicity_required") and not f.get("domain_declares_monotonicity"):
        reasons.append("monotonicity is not a URG default")

    if f.get("timestamp_order") and not f.get("j_defined", True) and f.get("line_witnessed"):
        reasons.append("chronology without J cannot witness Line")

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
    print("\nNONCLAIMS: structural contract consistency only; no inference of real continuity, developmental progress, causal lineage, Stage, Level, or J adequacy.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} fixtures): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['fixtures'])} fixtures)")
    return 0

if __name__=="__main__":
    p=sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name("line-fixtures-v1.0.json")
    raise SystemExit(main(p))
