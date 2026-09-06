STATUS: BUILD 5B MOVE RELEASED BY HUMAN; ENTRY GATE OPEN AND UNSATISFIED; IMPLEMENTATION NOT STARTED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Hardened governing repo sources, the explicit human BUILD 5B reconciliation/conditional closure authorization, and the explicit human Move release recorded below
CURRENT BUILD UNIT: BUILD 5B — Versioned Artifacts + First Transformation Receipt

# BUILD 5B — Versioned Artifacts + First Transformation Receipt

## CURRENT MOVE

`MOVE RELEASED → ENTRY GATE UNSATISFIED ON ONE NAMED PRECONDITION → IMPLEMENTATION HELD`

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
MOVE_PERMISSION=RELEASED_BY_HUMAN_2026-09-06
MOVE_ANCHOR=07fcb9f29c75365c07d36226043d3b17cbc769fd; TREE=616857ac26bbf34695bad13468cda37c67bd7e35
ENTRY_GATE=DEFINED_BY_BUILD_5A_PRECEDENT; NOT_YET_SATISFIED
REHEARSAL_ENGINE=UNAVAILABLE_AT_PREDECESSOR_MAJOR_VERSION
IMPLEMENTATION=NOT_STARTED; BLOCKED_AT_ENTRY_GATE
CANONICAL_CONTACT=READ_ONLY_PREDECESSOR_CONFIRMATION_ONLY; NO_MUTATION
E07=CONSIDERED; NOT_PROMOTED_AS_GENERAL_DOCTRINE
E15=METHODOLOGICAL_EVIDENCE_ONLY; NO_SIGMA_TO_ECOS_PROOF_REQUIREMENT
AP02=NARROWED_FOR_ARTIFACT_PAYLOAD_AND_EXACT_VERSION_RECONSTRUCTION
AP01_AP03_AP04_AP07=NO_BROADER_ACTIVATION
NEW_APERTURES=NONE
BUILD_6_PLUS=UNOPENED
```

## MOVE RELEASE — 2026-09-06

The human released the Move in this session. Release is permission to open implementation under the
bound Output Contract. It is not acceptance of BUILD 5B, not a canonical mutation authorization on its
own, and it does not weaken any Output Contract precondition.

**Reviewed anchor.** Commit `07fcb9f29c75365c07d36226043d3b17cbc769fd`, root tree
`616857ac26bbf34695bad13468cda37c67bd7e35`. At release this anchor was simultaneously `HEAD`,
`origin/main`, and `origin/reconcile/build-5b-shape-hardened`, with a clean worktree. The three pinned
provenance anchors in the Shape and ADR-005/006 were re-verified byte-exact against the object store:
`d2ee85b…`→tree `9404280…`, `ea54964…`→tree `889be0d…`, `0e969b9…`→tree `d736786…`.

**Entry gate.** The [BUILD 5A gate](docs/build-receipts/006-build-5a.md#entry-gate) is adopted as the
governing precedent, unchanged in kind: anchor equality, clean worktrees, read-only predecessor
re-verification with no drift, no BUILD 0–5A reopening condition, byte-identical frozen historical
artifacts, a passing Layer A/Layer B baseline, probe validation before canonical contact, and a full
rollback probe of the migration mechanism before canonical application. All nine steps must pass
before any mutation. The gate is open; it is not yet satisfied.

### Observed Move-entry evidence

Established this session, read-only:

- canonical project `ecb-v2-brain` (`vezxivrvhakclxuvxzso`) is ACTIVE_HEALTHY and reachable; it resides
  in a separate organization from the ECB v1 `open-brain` project and must not be confused with it;
- the canonical migration ledger carries exactly the six BUILD 0–5A migrations and no BUILD 5B residue,
  so the predecessor is undrifted at the BUILD 5A anchor;
- harness tooling was resolved: Deno 2.9.6 and Supabase CLI 2.116.0 are installed;
- no canonical mutation, schema activation, fixture write, or credential change occurred.

### Unsatisfied precondition — rehearsal engine major version

The canonical predecessor runs **PostgreSQL 17** (`17.6.1.166`). The only PostgreSQL server obtainable
in this execution environment is **PostgreSQL 16**; the PostgreSQL global development repository is
refused by the environment's network policy, and Ubuntu 24.04 supplies no PostgreSQL 17 package.

The Output Contract requires the disposable rehearsal to use the installed predecessor's PostgreSQL
major version and, where it is unavailable, to resolve tooling before touching canonical state. This is
not a formality here: the selected K7 boundary rests on database-derived `xid8` top-level transaction
identity, and the frozen challenges include savepoint and subtransaction bypass. Rehearsing that
mechanism on a different major engine and then applying to PostgreSQL 17 is the inheritance of
unproven mechanics the contract forbids.

Implementation is therefore held at the gate rather than started and left unverifiable. This is a
tooling/environment blocker classified at its own layer. It is not a Shape defect, not a K7 falsifier,
and not a reopening condition; no aperture is earned by it.

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

The Move release lifts the prohibition on the migration file and implementation only, and only inside
the bound Output Contract. Everything else remains excluded: runtime/MCP/deployment change, credentials,
external checker service, new Claim kind/standing/predicate, currentness, supersession, propagation,
Actor primitive, bitemporality, editor, generalized governance, further wholesale E07/E15 promotion,
or BUILD 6. The Output Contract's five permitted products are the whole of the permitted work; a
release is not a licence to widen it.

Canonical mutation remains separately gated behind the nine entry-gate steps and the completed
rehearsal, and is not authorized by the release alone. Documentation commits/anchoring remain
separately authorized for preservation, hardening, and this reconciliation. The hardening remains a
distinct ancestor; the WIP candidate is not merged directly.

## NEXT HANDLE

The Move is released and the anchor and entry gate are named above. Implementation opens as soon as a
disposable PostgreSQL 17 rehearsal database is reachable, and not before.

Resolve the rehearsal engine first, by either route: supply a PostgreSQL 17 instance to this
environment, or provision a disposable Supabase branch of `ecb-v2-brain`, which is a PostgreSQL 17
database seeded from the canonical migration ledger and is noncanonical by construction. A branch has
a monetary cost and needs explicit human authorization before it is created.

Then execute the Output Contract in its own order: author the migration and the WT07 harness, run
format/lint/type checks, rollback-probe the migration mechanism, complete the rehearsal, satisfy all
nine gate steps, and only then make canonical contact. Stop at the gate until the engine is resolved.
