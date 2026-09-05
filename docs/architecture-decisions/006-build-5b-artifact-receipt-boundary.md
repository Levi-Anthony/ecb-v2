STATUS: ACCEPTED AT REQUALIFIED SHAPE CLOSURE — 2026-09-05 AMERICA/PHOENIX; MOVE UNRELEASED
DISPOSITION: DECISION_RECORD
AUTHORITY: Local Shape provenance under explicit human reconciliation authorization; subordinate to hardened governing sources

# ADR-006 — Immutable Artifact specimens and committed check attempts

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
Shape's second examination and new acceptance trace. Those recovered statements alone conferred no canonical authority. The subsequent explicit human
reconciliation authorization permits delta examination and bounded correction followed by closure.
This decision now records that requalified local choice; it does not amend invariants or promote
E07/E15 wholesale. ADR-005 separately records the narrow governing syntheses.
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


## Constitutional delta and ADR identity reconciliation

The recovered Artifact/Receipt ADR was numbered 005 in WIP
`ea549649ad9993b0f89674227a2846423ce97076`. It is renamed ADR-006 here; ADR-005 belongs to
[cross-cutting governing hardening](005-cross-cutting-integrity-and-promotion-discipline.md) at
`0e969b9f72dc198976d7538748a341148edf09b2`. WT07 retains its identifier and original nine canonical
fixture IDs. Copying the WIP did not ratify its SHAPE CLOSED declaration.

The [constitutional delta](../build-shape/007-build-5b.md#constitutional-delta-requalification--2026-09-05-americaphoenix)
retains K7 and maps all twelve standing pressures. It discovered D-H1, an acceptance proof-coverage
gap: malformed output and faithfully preserved wrong source did not directly exercise preservation
failure on otherwise well-formed output. WT07 P23 and the existing harness deliverable now explicitly
require same-checker positive/negative discrimination for that component. No selected storage,
checker custody, authority boundary, transaction mechanism, runtime result, or canonical fixture changes.

D-H1 is SHAPE_OR_CONTRACT_DEFECT — ACCEPTANCE_SPECIFICATION / PROOF_COVERAGE_SUBTYPE, resolved at
specification level. No implementation has been executed or falsified. Requalification found no
Sense-level falsifier. Shape closes under the human's bounded-correction authorization; Move remains
unreleased. Subsequent runtime failure must be classified on its own evidence.
