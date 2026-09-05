STATUS: BUILD 5B SENSE CLOSED; SHAPE REQUALIFIED AND CLOSED; AWAIT MOVE RELEASE
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Hardened governing repo sources and explicit human BUILD 5B reconciliation/conditional closure authorization
CURRENT BUILD UNIT: BUILD 5B — Versioned Artifacts + First Transformation Receipt

# BUILD 5B — Versioned Artifacts + First Transformation Receipt

## CURRENT MOVE

`SHAPE REQUALIFIED AND CLOSED → AWAIT EXPLICIT HUMAN MOVE RELEASE`

```text
BUILD_0_TO_5A=CLOSED
BUILD_5B=SHAPE_CLOSED_ON_HARDENED_LINEAGE
SENSE=CLOSED_BY_HUMAN_DISPOSITION
SHAPE=CLOSED_AFTER_BOUNDED_ACCEPTANCE_TIGHTENING
PRIOR_ART_QUALIFICATION=COMPLETE_FOR_SELECTED_CANDIDATE_AND_DECLARED_SCOPE
WORKED_TRACE_07=REFROZEN_WITH_P23_PROOF_SENSITIVITY_CONTROL; NOT_EXECUTED
HARDENING_ANCESTOR=0e969b9f72dc198976d7538748a341148edf09b2
DELTA_REQUALIFICATION=COMPLETE
D_H1=ACCEPTANCE_PROOF_COVERAGE_GAP; RESOLVED_AT_SPECIFICATION_LEVEL
STANDING_PRESSURES=12_APPLICABLE; ALL_MAPPED
DEFERRED_BROADER_MECHANISMS=4_SCOPED_LEASES_WITH_EXPIRY
SENSE_REOPEN_REQUIRED=NO
OUTPUT_CONTRACT=BOUND_AND_REFROZEN; ARCHITECTURE_UNCHANGED
MOVE_PERMISSION=UNRELEASED
IMPLEMENTATION=UNOPENED
CANONICAL_CONTACT=NONE_IN_THIS_SENSE_OR_SHAPE
E07=CONSIDERED; NOT_PROMOTED_AS_GENERAL_DOCTRINE
E15=METHODOLOGICAL_EVIDENCE_ONLY; NO_SIGMA_TO_ECOS_PROOF_REQUIREMENT
AP02=NARROWED_FOR_ARTIFACT_PAYLOAD_AND_EXACT_VERSION_RECONSTRUCTION
AP01_AP03_AP04_AP07=NO_BROADER_ACTIVATION
NEW_APERTURES=NONE
BUILD_6_PLUS=UNOPENED
```

## AUTHORIZATION AND PREDECESSOR

The human accepted the TR1→A1→transformation→A2→bounded-check→receipt focal episode, closed Sense with
five corrections, and explicitly authorized Shape's second examination and a new acceptance trace.
The corrections are recorded in the [Sense closure](docs/build-sense/007-build-5b.md) and
[Shape entry](docs/build-shape/007-build-5b.md). No schema was selected in Sense.

Original repository predecessor: `d2ee85b7fcf38192c94720977e1d51325769ddc0`, tree
`9404280ad44d8d1f7d9532517dbc12dfe974dfba`. The recovered eight-file Sense/Shape state was preserved
exactly on `wip/build-5b-shape-pre-hardening` at `ea549649ad9993b0f89674227a2846423ce97076`, tree
`889be0d1062a05f16a4d2c06d4953c45f3e1cd32`, as NON-AUTHORITATIVE; DO NOT MERGE DIRECTLY.
Its closure labels were treated as candidate claims during recovery, not automatically authoritative.

The human's RECONCILIATION AUTHORIZATION permits delta requalification, bounded acceptance tightening,
and then Shape closure if the architecture survives. The hardening commit is
`0e969b9f72dc198976d7538748a341148edf09b2`, tree
`d736786826dcc45d9cf277d0e5e100c7dcb383e1`, separately anchored on main. This reconciliation starts
from that ancestor, retains K7, and refreezes WT07 with the P23 preservation sensitivity control.
[ADR-005](docs/architecture-decisions/005-cross-cutting-integrity-and-promotion-discipline.md) records
the governing hardening; [ADR-006](docs/architecture-decisions/006-build-5b-artifact-receipt-boundary.md)
records the local Shape. WT07 is not renumbered.

The full BUILD 5A checkout/FH-01–FH-07 remain at the original predecessor. [BUILD 5A closure](docs/build-receipts/006-build-5a.md) remains unchanged. Canonical counts and previous PASS results
are accepted historical evidence, not newly observed state. No database contact occurred.

## PURPOSE / INVARIANT SERVED

Retain reconstructible historical representation payload and evidence of a bounded check on exact
identified inputs/outputs against predeclared obligations. Preserve referent/map/mapper separation,
identity/description, evidence/assertion, standing/warrant, current/newest, and Event/receipt.
Artifact representation and Transformation Receipt role remain distinct; a receipt is an Artifact
specimen in the selected physical realization. No check confers acceptance, authority, authorization,
standing, warrant, or currentness.

The discriminator remains `proven capability ≠ inherited implementation`. BUILD 5B must close before
BUILD 6 opens. General SIGMA→ECOS correctness is not a requirement of this local transformation.

## INPUTS / OUTPUT / STANDING

Inputs: accepted TR1/C/L/GT01 episode, closed BUILD 0–5A boundaries, Q1–Q6, pinned v1 implementation/test
follow-up, E07 and methodological evidence, and narrowly reactivated AP-02.

Closed Shape selects one immutable Artifact table with five record roles: source representation,
transformation request, transformed representation, durable check attempt, and Transformation Receipt.
A receipt separately checks source grounding and representation preservation. The checker obtains the
source witness from persisted Event/Link rows and cannot accept a producer-supplied result.

The durable attempt must commit in a different top-level transaction before checking can run.
Database-derived xid8 metadata enforces this, including across savepoints. Crash/rollback therefore
leaves an incomplete attempt; absence of a marker justifies no-check only through the bounded checker
path as of the observer's snapshot. No private/external computation or eventual completion is inferred.

Exact selected fields, privileges, two trigger functions, two triggers, one partial unique index,
request/receipt semantics, alternatives, and the bounded work scope are in the
[Shape Output Contract](docs/build-shape/007-build-5b.md#output-contract--bound-executable-only-after-a-separate-move-release).
[ADR-006](docs/architecture-decisions/006-build-5b-artifact-receipt-boundary.md) records the local closure.
This is selected design, not installed capability.

## ENFORCEMENT / FAILURE BEHAVIOR

STRUCTURAL: exact identity/participation, immutable writes, predeclared spec, caller-forgery rejection,
committed attempt gate, and one terminal result per attempt. OBSERVATIONAL: bounded source witness and
component check results. No semantic-truth or AUTHORITY transition is activated.

PASS requires both grounding and preservation plus all other declared components. Observed violations
produce FAIL. Missing/incomplete evidence produces INCOMPLETE, not PASS. A committed attempt with no
terminal receipt remains incomplete. Check results never mutate Claims or propagate through R.

Trust boundary: untrusted service_role producer; trusted database and DDL/release custody. The checker
can detect the frozen producer defects but does not prove independence from every correlated
specification/checker error or defend against an owner rewriting its own database evidence.

## APERTURE / REVALIDATION TRIGGER

AP-02 is narrowed only for retained Artifact payload, exact versions, and required operation/attempt/
receipt reconstruction. Frozen Thought revision and general historical evidence retention remain
unchanged. Active Shape questions did not earn a new aperture. Q1–Q6 are dispositioned in Shape.

Reopen Shape if its checker/commit/retention boundary fails a named attack; if a new checker, format,
retention policy, or external trust root is needed; or if importing execution metadata into another
cluster invalidates the XID assumption. Route ordinary implementation/probe/tooling defects to their
responsible layer. Return to the human boundary for a governing invariant or accepted-episode conflict.

## TEST / SHAPE PASS CONDITION

[Worked Trace 07](docs/acceptance/build-5b-wt07.md) is frozen with exact payloads, fixture IDs, both
coverage directions, twenty-three adversarial challenges including the P23 same-checker negative control, fresh-context reconstruction, and Layer B
regression. K1–K6 have explicit falsifiers or unearned costs; refined K7 survives the documentary second
examination. Remaining trust/observation limits are explicit. The explicit hardening delta found only D-H1, an acceptance proof-coverage gap now corrected in WT07.
All twelve pressures and four scoped deferral leases are recorded in the Shape; no unresolved design
blocker remains under the declared scope. Execution has not been demonstrated.

Implementation must prove the trace later. Commit-dependent fault/concurrency probes use a disposable
noncanonical database; schema activation and the two fixture stages have distinct atomic boundaries.
Historical Layer A artifacts remain unchanged. No canonical mutation or executable implementation
claim is made by this Shape closure.

## NON-GOALS

No Move, migration file, code implementation, canonical mutation, runtime/MCP/deployment change,
credentials, external checker service, new Claim kind/standing/predicate, currentness, supersession,
propagation, Actor primitive, bitemporality, editor, generalized governance, further wholesale E07/E15 promotion, or BUILD 6.
Documentation commits/anchoring are separately authorized for preservation, hardening, and this
reconciliation. The hardening remains a distinct ancestor; the WIP candidate is not merged directly.

## NEXT HANDLE

Review the requalified Shape, corrected WT07, and bound Output Contract on the reconciliation branch. A separate human Move release must identify
the reviewed repository anchor and entry gate before any implementation/canonical mutation. Stop here.
