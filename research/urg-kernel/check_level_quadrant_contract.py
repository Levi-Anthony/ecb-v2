#!/usr/bin/env python3
"""Bounded structural checker for Level + two-axis disclosure; explicit v1/v2 replay retained.

Validates declared fixture structure only. It does not infer semantic truth,
referent boundaries, constitutive relations, natural-language quadrant burden,
authority, or currentness.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

POSITIONS = {("C", "G"): "UL", ("C", "D"): "UR", ("P", "G"): "LL", ("P", "D"): "LR"}
CONTINUITY = {"same_r_revised_boundary", "different_existing_r", "newly_individuated_composite"}
COORDINATES = {
    "UL": {"relational_index": "INDIVIDUAL", "disclosure_side": "LEFT"},
    "UR": {"relational_index": "INDIVIDUAL", "disclosure_side": "RIGHT"},
    "LL": {"relational_index": "RELATIONAL", "disclosure_side": "LEFT"},
    "LR": {"relational_index": "RELATIONAL", "disclosure_side": "RIGHT"},
}

def check_level(f):
    required = ["constituency", "organization", "whole_depends", "reverse_constitutive_dep", "boundary_explicit", "rank_leakage"]
    if any(f.get(k) is None for k in required):
        return "LEVEL_UNKNOWN"
    if not f["boundary_explicit"] or f["rank_leakage"]:
        return "LEVEL_NOT_ESTABLISHED"
    if f["constituency"] and f["organization"] and f["whole_depends"] and not f["reverse_constitutive_dep"]:
        return "LEVEL_WITNESSED"
    return "LEVEL_NOT_ESTABLISHED"

def check_legacy_quadrant(f):
    if f.get("compound"):
        return "DECOMPOSE"
    seat, burden = f.get("seat"), f.get("burden")
    if seat is None or burden is None:
        return "QUADRANT_UNKNOWN"
    return POSITIONS.get((seat, burden), "QUADRANT_UNKNOWN")

def check_quadrant(f, historical_v2=False):
    contract = "ecos:quadrant-disclosure:v2" if historical_v2 else "ecos:quadrant-disclosure:v3"
    if f.get("disclosure_contract") != contract:
        return "CONTRACT_MISMATCH"
    if not historical_v2 and any(k in f for k in ("qualifiers", "seat", "burden")):
        return "RETIRED_QUALIFIERS"
    if f.get("compound"):
        return "DECOMPOSE" if len(set(f.get("component_refs", []))) >= 2 else "QUADRANT_UNKNOWN"
    if not all(f.get(k) for k in ("content_ref", "characterization_ref", "conditions_ref")):
        return "QUADRANT_UNKNOWN"
    if not historical_v2 and f.get("disclosure") in COORDINATES and f.get("coordinates") != COORDINATES[f["disclosure"]]:
        return "COORDINATE_MISMATCH"
    return f.get("disclosure") if f.get("disclosure") in {"UL", "UR", "LL", "LR"} else "QUADRANT_UNKNOWN"

def check_transition(f):
    op = f.get("operation")
    if op == "TraverseQ":
        return bool(f.get("same_r") and f.get("same_b") and not f.get("boundary_changed"))
    if op == "Enrich":
        return bool(f.get("same_r") and f.get("same_b") and not f.get("boundary_changed"))
    if op in {"ReviseBoundary", "Reseat"}:
        return bool(
            f.get("boundary_changed")
            and f.get("continuity_mode") in CONTINUITY
            and f.get("redisclose_level")
            and f.get("reclassify_quadrant")
        )
    if op == "ReturnEndpoint":
        if f.get("endpoint_equal") and f.get("history_changed") and f.get("restore_prior_qualification"):
            return False
        return True
    if op in {"Reorient", "ChangeFrame"}:
        return True
    return False

def main(path):
    data = json.loads(Path(path).read_text())
    legacy = data.get("schema") == "eco221-level-quadrant-fixtures-v1"
    historical_v2 = data.get("schema") == "level-quadrant-disclosure-fixtures-v2"
    if not legacy and not historical_v2 and data.get("schema") != "level-quadrant-disclosure-fixtures-v3":
        print("UNKNOWN FIXTURE CONTRACT"); return 1
    print("HISTORICAL v1 REPLAY ONLY" if legacy else "HISTORICAL v2 REPLAY ONLY" if historical_v2 else "CURRENT two-axis disclosure v3")
    failures = []
    for f in data["fixtures"]:
        if f["kind"] == "level":
            actual, expected = check_level(f), f["expected"]
        elif f["kind"] == "quadrant":
            actual, expected = (check_legacy_quadrant(f) if legacy else check_quadrant(f, historical_v2)), f["expected"]
        elif f["kind"] == "transition":
            actual, expected = check_transition(f), f["expected_valid"]
        else:
            actual, expected = "UNKNOWN_KIND", f.get("expected")
        ok = actual == expected
        print(f"{'PASS' if ok else 'FAIL'} {f['id']}: expected={expected!r} actual={actual!r}")
        if not ok:
            failures.append(f["id"])
    print("\nNONCLAIMS: this checker validates declared contract fields only; it does not infer semantic truth, boundaries, constitutive dependence, natural-language quadrant position, authority, or currentness.")
    if failures:
        print(f"RESULT: FAIL ({len(failures)} fixtures): {', '.join(failures)}")
        return 1
    print(f"RESULT: PASS ({len(data['fixtures'])} fixtures)")
    return 0

if __name__ == "__main__":
    p = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).with_name("level-quadrant-fixtures-v3.0.json")
    raise SystemExit(main(p))
