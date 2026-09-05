STATUS: ACCEPTED AT AUTHORIZED SHAPE CLOSURE; MOVE UNRELEASED
DISPOSITION: DECISION_RECORD

# ADR-005 — Immutable Artifact specimens and committed check attempts

## CONTEXT

BUILD 5B must preserve exact historical representation payloads and evidence of a bounded check.
Producer self-report does not prove preservation. A receipt written in the same transaction as its
start marker cannot distinguish a rolled-back check from one that never ran.

## LOCAL DECISION

Select K7 in the [BUILD 5B Shape](../build-shape/007-build-5b.md): one immutable Artifact store with
five native roles, exact retained text, database-derived specs/receipts, source-grounding and
preservation as separate checks, and a previously committed attempt marker enforced by a derived
top-level xid8 comparison. Receipt is an Artifact specimen with distinct check obligations. There
is no separate family/head/Actor primitive, new semantic relation, or currentness designation.

## WHY REQUIRED NOW

Q1–Q6 cannot be left for Move. Retained payload is required for fresh reconstruction; a distinct
source path catches a producer preserving a wrong source fact; committed start evidence makes
crash/rollback distinguishable from absence of a check through this bounded path.

## ALTERNATIVES CONSIDERED

Shape records K1–K6 with exact falsifiers or costs. Mutable locators lose payload; producer receipts
and preservation-only double runs admit false success; an atomic start/result pair loses failed
attempt evidence; separate physical primitives and external validator credentials add unearned
surfaces. They remain possible later representations if this bounded design proves insufficient.

## INVARIANTS AFFECTED

Preserve referent/map/mapper separation, identity/description, evidence/assertion, standing/warrant,
current/newest, and Event/Transformation Receipt. Registration confers no authority. Native operation
participation creates no competing semantic relation truth store. Checks do not change Claim standing.

## STANDING / AUTHORITY

The human accepted the focal episode, closed Sense with five corrections, and explicitly authorized
Shape's second examination and new acceptance trace. This closes a local realization choice within
that scope. It does not amend invariants or promote E07/E15 into general doctrine.
[Worked Trace 07](../acceptance/build-5b-wt07.md) is frozen test authority, not observed execution proof.

## REVERSIBILITY

No implementation is installed yet. Before Move, changing this decision requires revising Shape and
its frozen trace explicitly. After installation, retained versions/attempts/receipts are historical
evidence; do not rewrite them to fit a new checker or erase failed observations. A later format or
checker requires a new scoped decision and explicit treatment of old records.

## REOPENING CONDITION

Reopen for a named falsifier defeating identity, retention, checking power, non-bypassability, commit
separation, or exact tuple binding; a need for external trust; new transformation/retention semantics;
or database import that invalidates local XID provenance. Trusted owner/DDL compromise and correlated
specification/checker errors remain declared limits, not properties this database proves absent.

Stop for human disposition if satisfying the accepted episode requires changing a governing invariant,
redesigning BUILD 5A, or importing BUILD 6 authority. Move requires its own explicit release.
