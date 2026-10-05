#!/usr/bin/env python3
"""Bounded structural checker for ECO-224 URG State contract.

This validates declared fixture consistency only. It does not discover the
correct State basis, infer what actually obtains in reality, infer frame
equivalence, causal dynamics, Direction, Level, Stage, or semantic truth.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

def validate(f):
    reasons=[]
    op=f.get("operation")

    if op=="Observe":
        if f.get("evidence_changed") and f.get("state_changed") and f.get("observation_alone", True):
            reasons.append("observation alone cannot require ontic State change")

    if op=="RefineStateBasis":
        if f.get("basis_changed") and not f.get("crosswalk") and f.get("direct_comparison_claimed"):
            reasons.append("basis change without crosswalk is incomparable")
        if f.get("basis_changed") and f.get("state_transition_claimed"):
            reasons.append("basis change is not automatically StateTransition")

    if op=="ChangeFrame":
        if f.get("frame_changed") and not f.get("frame_transform") and f.get("direct_comparison_claimed"):
            reasons.append("frame change without transform is incomparable")
        if f.get("state_transition_claimed"):
            reasons.append("ChangeFrame is not automatically StateTransition")

    if op=="ReviseBoundary":
        if f.get("boundary_changed") and f.get("direct_state_equality_claimed"):
            reasons.append("boundary revision blocks direct State equality")
        if f.get("boundary_changed") and not f.get("redisclose_state", False):
            reasons.append("boundary revision requires State redisclosure")

    if op=="AssessEvidence":
        if f.get("coerced_to_ontic_unknown_state"):
            reasons.append("epistemic uncertainty cannot be coerced into ontic unknown State")
        if f.get("epistemic_candidates") and f.get("result") not in {"STATE_UNKNOWN","STATE_WITNESSED","STATE_CONTRADICTED"}:
            reasons.append("invalid evidence result")

    if op=="StateClaim":
        if f.get("native_probability_state") and f.get("epistemic_candidate_set"):
            reasons.append("native probabilistic State and epistemic candidate set are conflated")
        if f.get("min_dwell_required"):
            reasons.append("no universal minimum dwell time defines State")

    if op=="StateTransition":
        if f.get("endpoint_equal") and f.get("history_erased"):
            reasons.append("equal endpoints cannot erase transition history")
        if f.get("direction_auto_asserted") or f.get("stage_auto_asserted") or f.get("level_auto_asserted"):
            reasons.append("StateTransition cannot auto-promote Direction/Stage/Level")
        if f.get("boundary_changed") and not f.get("redisclose_state"):
            reasons.append("changed boundary requires State redisclosure")

    if op=="CompareObservation":
        if f.get("visible_equal") and f.get("hidden_state_diff") and f.get("state_equal_inferred_from_observation"):
            reasons.append("observation equality cannot prove State equality")

    if op=="Specialization":
        if f.get("eco191_tuple") and f.get("universal_state_definition"):
            reasons.append("ECO-191 tuple is a specialization, not universal State definition")

    if op=="StateSpace":
        if f.get("actual_state_claimed_as_space"):
            reasons.append("State space is possibility structure, not actual State")

    if op=="CompareState":
        if f.get("same_basis") and f.get("coarse_equal") and f.get("fine_diff_outside_basis"):
            if not f.get("state_equal_under_basis"):
                reasons.append("differences outside basis do not defeat same-State-under-basis")

    if op=="DirectionalEvent":
        if f.get("endpoint_equal") and not f.get("directional_semantics_preserved"):
            reasons.append("equal endpoint cannot erase independent directional/event semantics")

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
    print("\nNONCLAIMS: structural contract consistency only; no discovery of actual State, basis adequacy, physical frame equivalence, causation, Direction, Level, Stage, or semantic truth.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} fixtures): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['fixtures'])} fixtures)")
    return 0

if __name__=="__main__":
    p=sys.argv[1] if len(sys.argv)>1 else Path(__file__).with_name("state-fixtures-v1.0.json")
    raise SystemExit(main(p))
