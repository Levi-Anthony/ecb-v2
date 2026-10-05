#!/usr/bin/env python3
"""Bounded structural checker for ECO-222 directional-pressure contract.

Validates declared fixture consistency only. It does not infer semantic truth,
identity criteria, causation, natural-language meaning, Level standing,
Quadrant position, moral value, or domain dynamics.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

STATUS = {"SUPPORTED", "NOT_ESTABLISHED", "UNKNOWN"}
DIRECTIONS = {"A", "C", "T", "D"}
MODES = {"tendency", "capacity", "drive"}

def validate(f):
    reasons = []
    dirs = f.get("directions")
    if dirs is not None:
        if set(dirs) != DIRECTIONS:
            reasons.append("direction keys must be exactly A,C,T,D")
        if any(v not in STATUS for v in dirs.values()):
            reasons.append("invalid direction status")
        if f.get("exclusive_pair_rule"):
            reasons.append("scalar/mutual-exclusion pair rule is forbidden")
        if dirs.get("T") == "SUPPORTED":
            if not f.get("composite_candidate"):
                reasons.append("T requires explicit composite candidate")
            if f.get("level_inferred_from_transcendence"):
                reasons.append("T cannot auto-promote Level standing")
        if dirs.get("D") == "SUPPORTED":
            if not f.get("dissolution_witness"):
                reasons.append("D requires dissolution witness/pressure")
            if f.get("record_deleted_only"):
                reasons.append("record deletion alone cannot establish D")
        if f.get("no_transformation_evidence") and any(v == "SUPPORTED" for v in dirs.values()):
            reasons.append("no-evidence snapshot cannot force direction")
        if f.get("direction_uncovered"):
            if f.get("force_fitted"):
                reasons.append("uncovered transformation cannot be force-fit")
            if any(v == "SUPPORTED" for v in dirs.values()):
                reasons.append("uncovered fixture cannot simultaneously claim supported direction")
    if "contexts" in f:
        seen = {x.get("direction") for x in f["contexts"]}
        if not DIRECTIONS.issubset(seen):
            reasons.append("same-capability fixture must span A,C,T,D")
    if "capacity" in f or "drive" in f:
        cap = f.get("capacity", {})
        drv = f.get("drive", {})
        if cap.get("mode") not in MODES or drv.get("mode") not in MODES:
            reasons.append("invalid mode")
        if cap.get("mode") == drv.get("mode"):
            reasons.append("capacity and drive must remain distinct modes")
        if drv.get("mode") == "drive" and drv.get("supported") and not drv.get("mobilized"):
            reasons.append("supported drive must be mobilized")
    if f.get("requires_agent_intent"):
        reasons.append("agent intention cannot be a universal direction requirement")
    return len(reasons) == 0, reasons

def main(path):
    data = json.loads(Path(path).read_text())
    failures = []
    for f in data["fixtures"]:
        actual, reasons = validate(f)
        expected = f["expected_valid"]
        ok = actual == expected
        print(f"{'PASS' if ok else 'FAIL'} {f['id']}: expected_valid={expected} actual_valid={actual}" + (f" reasons={reasons}" if reasons else ""))
        if not ok:
            failures.append(f["id"])
    print("\nNONCLAIMS: structural consistency only; no semantic truth, causation, Level, Quadrant, value, or domain-dynamics inference.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} fixtures): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['fixtures'])} fixtures)")
    return 0

if __name__ == "__main__":
    p = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).with_name("directional-pressure-fixtures-v1.0.json")
    raise SystemExit(main(p))
