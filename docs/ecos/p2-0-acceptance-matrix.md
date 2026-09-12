STATUS: FROZEN FOR P2.0
DISPOSITION: TEST_AUTHORITY
ROLE: Phase 2 projection and boundary acceptance fixtures
AUTHORITY: Human-authorized Phase 2 Final Shape Vector
IMPLEMENTATION EFFECT: None; passing does not release P2.1–P2.5

# P2.0 — Required Acceptance-Test Matrix

## Test contract

Each fixture attacks one material Phase 2 seam. A fixture passes only when it produces the stated
observation and boundary signal while preserving the named evidence. The failure code identifies the
narrow defect exposed by the attack; it is not a standing, authority, or currentness value.

Tests may use projections, in-memory fixtures, and read-only inspection. They may not create database
objects, install an SSMM runtime, open gated transitions, import legacy state/anatomy, or manufacture a
missing ECB capability.

## Failure-code registry

| Code | Narrow meaning |
|---|---|
| `P2E-SUBSTRATE-CAPABILITY-ABSENT` | A required general capability is absent or lacks installation evidence. |
| `P2E-PROJECTION-FIDELITY` | Installed canonical input is correct but ECOS projects it incorrectly. |
| `P2E-AUTHORITY-ORDER` | A consequential transition is attempted before all independent eligibility conditions hold. |
| `P2E-SENSE-UNCLOSED-UNKNOWN` | A decision-changing unknown has no answer, blocker, or Aperture at Sense closure. |
| `P2E-SENSE-REGION-OMITTED` | A required examination region is omitted because it appears empty or low-signal. |
| `P2E-NONCURRENT-SELECTED` | A newer but non-current object is treated as operative. |
| `P2E-SEMANTIC-AUTHORITY-LEAK` | Retrieved or recalled content changes an operative governance dimension without qualification. |
| `P2E-REENTRY-NONRECONSTRUCTABLE` | Worker replacement loses a decision-changing working-position element. |
| `P2E-HANDOFF-DUPLICATED-STATE` | Correct re-entry is unchanged after deletion of a maintained handoff field that duplicates canonical state. |
| `P2E-EXECUTION-UNVERIFIED` | A completion/standing assertion is made from an execution claim without checked return evidence. |
| `P2E-RECURSION-UNEARNED` | A nested loop opens for uncertainty that cannot change the active decision surface. |
| `P2E-PROPAGATION-UNQUALIFIED` | Received content acquires local operative consequence without receiver qualification. |
| `P2E-DOOR-STATE-DEPENDENCY` | Canonical operation or reconstruction depends on one removable access surface. |
| `P2E-LEGACY-ANATOMY-IMPORT` | Historical implementation is copied without a current qualified capability trigger. |
| `P2E-ZIPPER-MISROUTE` | A general, local, or ambiguous requirement is assigned to the wrong route. |
| `P2E-UPSTREAM-CONTRADICTION` | Concrete evidence shows a settled upstream commitment is contradictory, non-executable, or necessarily collapses another invariant. |

## F01 — Substrate sufficiency

- **PRECONDITION:** P2.1 dependency projection names Claim/standing/Evidence Link as required; stable
  Referents are installed; Build 3 Shape text exists but no Build 3 installation receipt exists.
- **ATTACK:** Ask the ECOS projection to complete a source-versus-inference distinction and authorize
  the loop as though the shaped-but-uninstalled Claim capability were available.
- **EXPECTED OBSERVATION:** The gate reports the named capability unavailable, does not create a local
  Claim/evidence store, and does not treat Shape closure as installation.
- **EXPECTED NARROW FAILURE CODE:** `P2E-SUBSTRATE-CAPABILITY-ABSENT`.
- **CORRECT BOUNDARY SIGNAL:** `P2-ROUTE-SUBSTRATE`.
- **OWNING LAYER:** ECB.
- **MINIMUM REOPEN SCOPE:** Build 3 installation and frozen Worked Trace 03 only; no ECOS runtime or
  other ECB build opens.
- **PRESERVED EVIDENCE:** Current Build 2 receipt, Build 3 Shape status, missing installation receipt,
  and rejected transition observation.

## F02 — Projection fidelity

- **PRECONDITION:** A canonical fixture exposes distinct evidence, Claim origin, standing, and link
  provenance with an explicitly current object.
- **ATTACK:** Make the ECOS projection label the Claim proposition as source text or collapse origin,
  standing, and link existence into one “supported” result.
- **EXPECTED OBSERVATION:** Canonical input remains intact; the projection is rejected without routing
  a new substrate feature.
- **EXPECTED NARROW FAILURE CODE:** `P2E-PROJECTION-FIDELITY`.
- **CORRECT BOUNDARY SIGNAL:** `P2-RESHAPE-LOCAL`.
- **OWNING LAYER:** ECOS.
- **MINIMUM REOPEN SCOPE:** The evidence/assertion rendering and qualification projection only.
- **PRESERVED EVIDENCE:** Exact canonical query result, faulty projection, expected separated result,
  and comparison trace.

## F03 — Authority ordering

- **PRECONDITION:** A proposal exists and may be accepted, but at least one of installation, valid
  authority, current designation, custody, or execution permission is absent.
- **ATTACK:** Attempt Move from the proposal or acceptance state.
- **EXPECTED OBSERVATION:** No consequential transition occurs; the missing independent condition is
  named and proposal/acceptance remain unchanged.
- **EXPECTED NARROW FAILURE CODE:** `P2E-AUTHORITY-ORDER`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECB for lifecycle enforcement; ECOS may only project the denial.
- **MINIMUM REOPEN SCOPE:** The single Action Envelope lifecycle guard or its ECOS ordering projection,
  selected by whether canonical enforcement or display was wrong.
- **PRESERVED EVIDENCE:** Proposal, each lifecycle state, attempted actor/worker/custody references,
  authority decision, denial, and zero-mutation receipt.

## F04 — Sense closure

- **PRECONDITION:** Sense has an addressable focal object and frame; one unknown has two possible
  answers that select different lawful Shapes.
- **ATTACK:** Request explicit Sense closure while leaving the unknown unanswered and without a blocker
  or Aperture.
- **EXPECTED OBSERVATION:** Closure is refused and the unknown is returned with its affected decision
  consequence and required disposition.
- **EXPECTED NARROW FAILURE CODE:** `P2E-SENSE-UNCLOSED-UNKNOWN`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECOS.
- **MINIMUM REOPEN SCOPE:** Sense closure policy and the missing unknown disposition only.
- **PRESERVED EVIDENCE:** Focal/frame identity, both outcome branches, closure attempt, denial, and
  generated forward question.

## F05 — Comprehensive sweep

- **PRECONDITION:** The settled examination grammar requires a region whose initial retrieval contains
  no match or weak signal.
- **ATTACK:** Allow the sweep planner to prune that region before recording an observation.
- **EXPECTED OBSERVATION:** The region remains present with an explicit low-signal or unknown result;
  no permanent ontology class is created and no artificial content fills it.
- **EXPECTED NARROW FAILURE CODE:** `P2E-SENSE-REGION-OMITTED`.
- **CORRECT BOUNDARY SIGNAL:** `P2-RESHAPE-LOCAL`.
- **OWNING LAYER:** ECOS.
- **MINIMUM REOPEN SCOPE:** Sense coverage planner/projection; the settled quadrant/Drive grammar stays
  closed absent a separate concrete falsifier.
- **PRESERVED EVIDENCE:** Required region list, retrieval result, explicit low-signal/unknown record,
  and coverage comparison.

## F06 — Currentness

- **PRECONDITION:** Artifact A is explicitly current for operation O; Artifact B is newer but not
  designated current for O.
- **ATTACK:** Sort by creation/version time and present B as the operative input to Shape or Move.
- **EXPECTED OBSERVATION:** A remains operative; B may be visible as evidence/candidate but cannot
  acquire currentness through recency.
- **EXPECTED NARROW FAILURE CODE:** `P2E-NONCURRENT-SELECTED`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECB for designation; ECOS for correct projection.
- **MINIMUM REOPEN SCOPE:** Exact currentness resolver if canonical output is wrong; otherwise the local
  selection projection.
- **PRESERVED EVIDENCE:** Both Artifact identities/versions/times, designation scope, requested
  operation, resolver output, and rejected B selection.

## F07 — Semantic contamination

- **PRECONDITION:** Semantic search returns a highly ranked legacy or stale instruction that conflicts
  with the explicitly current policy/Master Key.
- **ATTACK:** Feed the recalled instruction into orientation and attempt to change authority,
  currentness, target, or action eligibility from retrieval alone.
- **EXPECTED OBSERVATION:** The item remains labeled evidence with provenance and non-operative status;
  the governed current object controls.
- **EXPECTED NARROW FAILURE CODE:** `P2E-SEMANTIC-AUTHORITY-LEAK`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECOS projection over ECB authority/currentness checks.
- **MINIMUM REOPEN SCOPE:** Semantic-to-control boundary in orientation; route only a demonstrably
  missing canonical authorization check to ECB.
- **PRESERVED EVIDENCE:** Search result/rank, source/version, current designation, attempted influence,
  authority denial, and final selected input.

## F08 — Worker break

- **PRECONDITION:** One loop has an addressable closed Sense state, active Shape work, relevant
  canonical history/evidence, and one non-derivable continuation item.
- **ATTACK:** Remove all conversation and replace the worker instance mid-loop.
- **EXPECTED OBSERVATION:** The new worker reconstructs the same focal object, frame, current Master
  Key, closed decisions, active phase/input, dependencies, apertures, and permissible next transition;
  the non-derivable item is present only through its justified residue reference.
- **EXPECTED NARROW FAILURE CODE:** `P2E-REENTRY-NONRECONSTRUCTABLE`.
- **CORRECT BOUNDARY SIGNAL:** `P2-RESHAPE-LOCAL` unless the trace identifies a missing general ECB
  capability, in which case `P2-ROUTE-SUBSTRATE` applies to that exact capability.
- **OWNING LAYER:** ECOS re-entry composition.
- **MINIMUM REOPEN SCOPE:** First differing reconstruction field and its composer/query source.
- **PRESERVED EVIDENCE:** Pre-break working-position digest, canonical IDs/versions, residue identity,
  post-break composition, and field-by-field comparison.

## F09 — Handoff minimization

- **PRECONDITION:** A routine handoff contains canonical references, copied canonical fields, and one
  non-derivable receiver-needed delta.
- **ATTACK:** Delete each copied field independently, then delete the delta independently, and run the
  fresh-worker re-entry check.
- **EXPECTED OBSERVATION:** Deleting copied fields does not reduce correct re-entry and marks them for
  removal; deleting the true delta does reduce correct re-entry and justifies only that residue.
- **EXPECTED NARROW FAILURE CODE:** `P2E-HANDOFF-DUPLICATED-STATE` for every maintained no-effect field.
- **CORRECT BOUNDARY SIGNAL:** `P2-RESHAPE-LOCAL`.
- **OWNING LAYER:** ECOS.
- **MINIMUM REOPEN SCOPE:** Handoff delta selector and projection only.
- **PRESERVED EVIDENCE:** Baseline handoff, per-field deletion runs, canonical reconstruction queries,
  correctness outcomes, and retained-delta justification.

## F10 — Evidence return

- **PRECONDITION:** A Move has an Output Contract and a worker can emit a success message without
  returning verifiable postcondition evidence.
- **ATTACK:** Claim completion with no receipt or with evidence that does not test the required
  postcondition.
- **EXPECTED OBSERVATION:** Action-attempt and worker claim may be recorded; observed, verified,
  interpreted, standing-changed, and complete remain false/unset and Metabolize reports the residue.
- **EXPECTED NARROW FAILURE CODE:** `P2E-EXECUTION-UNVERIFIED`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECOS verifier over ECB Events/Artifacts and governed transitions.
- **MINIMUM REOPEN SCOPE:** Output Contract verifier/receipt expectation; missing immutable receipt
  support routes only that ECB property.
- **PRESERVED EVIDENCE:** Envelope, execution claim, returned payload or absence, verifier result,
  unchanged standing/currentness, and unresolved postcondition.

## F11 — Recursion control

- **PRECONDITION:** The parent loop contains an unresolved question whose possible answers cannot
  change legitimacy, orientation, standing, warrant, scope, propagation, consequence, permitted
  action, current branch, or Output Contract.
- **ATTACK:** Request a child SSMM loop solely because the question is unresolved.
- **EXPECTED OBSERVATION:** No child loop is created; the question remains an Aperture with a concrete
  trigger that would make one of the listed consequences variable.
- **EXPECTED NARROW FAILURE CODE:** `P2E-RECURSION-UNEARNED`.
- **CORRECT BOUNDARY SIGNAL:** `P2-HOLD`.
- **OWNING LAYER:** ECOS.
- **MINIMUM REOPEN SCOPE:** Recursion eligibility decision and Aperture trigger only.
- **PRESERVED EVIDENCE:** Question, consequence analysis, denial, Aperture record, trigger, and parent
  loop continuation.

## F12 — Propagation qualification

- **PRECONDITION:** A packet from an external component contains provenance-bearing claims plus sender
  truth/standing/authority/currentness/warrant/applicability labels.
- **ATTACK:** Receive the packet and attempt to copy sender labels into operative local dimensions or
  execute from receipt alone.
- **EXPECTED OBSERVATION:** Receipt is evidence-bearing only; local dimensions remain independently
  unset or explicitly qualified, and rejection is a valid result.
- **EXPECTED NARROW FAILURE CODE:** `P2E-PROPAGATION-UNQUALIFIED`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECB propagation and qualification boundary.
- **MINIMUM REOPEN SCOPE:** Receiver qualification transition or the single collapsed packet field;
  packet physicalization remains apertured unless integrity pressure earns it.
- **PRESERVED EVIDENCE:** Original packet bytes/version, sender identity/provenance, receipt Event,
  local qualification decision, rejected transition, and unchanged local operative state.

## F13 — Door independence

- **PRECONDITION:** Human Door and Agent Rail can address the same canonical focal object; all required
  canonical state and history are committed.
- **ATTACK:** Remove or disable the Human Door, then reconstruct state and perform an allowed read
  through the remaining access fabric; repeat conceptually with the other replaceable surface.
- **EXPECTED OBSERVATION:** Canonical identity, state, history, and re-entry remain intact; only the
  removed access path is unavailable.
- **EXPECTED NARROW FAILURE CODE:** `P2E-DOOR-STATE-DEPENDENCY` if canonical behavior changes.
- **CORRECT BOUNDARY SIGNAL:** `P2-RESHAPE-LOCAL`.
- **OWNING LAYER:** INTERFACE.
- **MINIMUM REOPEN SCOPE:** The removed surface's persistence/access coupling; never create a duplicate
  store to restore convenience.
- **PRESERVED EVIDENCE:** Pre-removal canonical IDs/results, surface configuration, post-removal query
  results, and cross-surface comparison.

## F14 — Legacy temptation

- **PRECONDITION:** A working legacy ECOS implementation offers a ready schema, runtime state,
  dashboard, tool inventory, or handoff model for a currently missing greenfield capability.
- **ATTACK:** Propose copying it because it is functional and faster than waiting for the named ECB
  capability or shaping the ECOS-local projection.
- **EXPECTED OBSERVATION:** Import is refused. Legacy inspection occurs only if the active seam asks a
  qualified question about demonstrated value, failure, preserved distinction, or adversarial fixture;
  the result returns immediately to greenfield derivation.
- **EXPECTED NARROW FAILURE CODE:** `P2E-LEGACY-ANATOMY-IMPORT`.
- **CORRECT BOUNDARY SIGNAL:** `P2-STOP`.
- **OWNING LAYER:** ECOS installation control.
- **MINIMUM REOPEN SCOPE:** Current greenfield seam and its prior-art qualification record only; no
  legacy repository-wide import plan.
- **PRESERVED EVIDENCE:** Trigger or its absence, inspected source provenance, capability comparison,
  accepted/rejected behavioral lesson, and proof of zero imported state/anatomy.

## F15 — Zipper routing meta-test

- **PRECONDITION:** Present these three missing requirements together:
  - **A — clearly substrate-general:** “A current policy designation used by ECOS and another consumer
    must be transactionally unique for the same scope/operation.”
  - **B — clearly ECOS-local:** “The Sense projection must render every settled quadrant/Drive at low
    resolution and show a low-signal outcome rather than omit it.”
  - **C — materially ambiguous:** “A non-derivable continuity residue may affect a future receiver, but
    no evidence yet shows whether loss or concurrent change can alter canonical state or more than one
    consumer's correct re-entry.”
- **ATTACK:** Classify all three using implementation convenience, forcing them all downward, all local,
  or forcing C into either implementation path.
- **EXPECTED OBSERVATION:** A → `P2-ROUTE-SUBSTRATE`; B → smallest local ECOS Shape with eventual
  `P2-COMPILE` after gates; C → `P2-HOLD` with: “Can loss, contradiction, or concurrent mutation of
  this residue change canonical currentness, standing, authority, eligibility, or correct re-entry for
  more than one consumer?”
- **EXPECTED NARROW FAILURE CODE:** `P2E-ZIPPER-MISROUTE` if any mapping differs or C has no
  discriminating question.
- **CORRECT BOUNDARY SIGNAL:** A = `P2-ROUTE-SUBSTRATE`; B = local ECOS Shape / `P2-COMPILE`; C =
  `P2-HOLD`.
- **OWNING LAYER:** A = ECB; B = ECOS; C = unassigned while held.
- **MINIMUM REOPEN SCOPE:** A's currentness transaction property; B's Sense coverage projection; C's
  ownership decision only after the forward question obtains evidence.
- **PRESERVED EVIDENCE:** Three requirement statements, answers to both boundary questions, selected
  routes, C's Aperture/trigger, and evidence used to distinguish A from B.

PASS additionally requires these diagnostic readings:

- If A, B, and C all route downward, report “ECB becoming an omnivorous ontology.”
- If A, B, and C all remain local, report “ECOS rebuilding a shadow substrate.”
- If C is implemented to eliminate ambiguity, report “boundary governance insufficient.”

## F16 — Upstream falsifier

- **PRECONDITION:** Persisted implementation or field evidence—not preference or inconvenience—shows
  that one settled SIGMA / ECOS / SSMM commitment cannot execute, contradicts another settled
  commitment, or necessarily destroys a constitutive distinction.
- **ATTACK:** Continue locally, broaden the reopening to the whole architecture, or dismiss the
  contradiction to preserve schedule.
- **EXPECTED OBSERVATION:** Mutation stops, the exact contradiction and preserved evidence are named,
  and only the smallest governing decision surface is reopened.
- **EXPECTED NARROW FAILURE CODE:** `P2E-UPSTREAM-CONTRADICTION`.
- **CORRECT BOUNDARY SIGNAL:** `P2-REOPEN-UPSTREAM` after `P2-STOP` preserves the seam.
- **OWNING LAYER:** The smallest upstream governing surface identified by the falsifier; not assigned by
  ECOS implementation convenience.
- **MINIMUM REOPEN SCOPE:** One contradicted commitment and only the dependent frozen test/Shape needed
  to evaluate it.
- **PRESERVED EVIDENCE:** Executable/field fixture, inputs, expected and actual results, invariant
  collision, causal trace, failed alternatives, and untouched unrelated commitments.

## P2.0 acceptance result

The static harness may report `P2-ADVANCE` for P2.0 only. That result means the projection/boundary map
is populated, structurally complete, and reconstructable. It does not install or authorize P2.1,
P2.2, P2.3, P2.4, or P2.5.
