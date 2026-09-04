STATUS: COMPLETE
DISPOSITION: APERTURE
ROLE: Output J — Question Forward register
AUTHORITY: None as answers; authoritative as a record that these remain open

# Question Forward Register

Bounded per §4: a question is recorded only where resolving it could materially change
relevance, standing, warrant, branch selection, Shape, output contract, architecture,
implementation, enforcement, or build safety. **Questions that could not change BUILD were
apertured rather than pursued.**

Twenty-five questions — five blocking, five discriminating, five falsification, four
validation, six deferred. Not one is converted into a prose conclusion.

---

## BLOCKING — materially block a build decision

### QF-B-01 — Is `Permitted_O` a function?
Everything in TC-005, CF-01, CF-03 and half of CF-08 rests on permission being determined by
(state, Master Key, operation). If it is not, FS-0001's ∼(M,O) has **no rigorous reading**.
**Blocks** TC-005 and CF-03. **Route** FP-003, executable today against existing ADRs.

### QF-B-02 — Are v2's non-collapse invariants trace properties at all?
The safety/liveness decomposition (R013) applies to properties of single execution traces.
Several v2 invariants — `relevance ≠ authority`, `confidence ≠ standing` — read as properties
of **sets** of executions, which sit outside the decomposition entirely and outside
monitoring (R094). If most invariants are of this kind, TC-001's classification covers less
than it appears to.
**Blocks** the scope of TC-001, TC-002, TC-016. **Route** full text of R013 + FP-004.

### QF-B-03 — Does BUILD 3 need justification structure on claims from the start?
TC-014's prerequisite is that justifications are recorded **at claim creation**. Retraction
semantics cannot be retrofitted onto claims stored without them.
**Blocks** nothing today; **expires** when BUILD 3 ships. This is the only finding in the
operation with a deadline. **Route** BUILD 3 Shape.

### QF-B-04 — Is an Agent primitive required before BUILD 6, and does that violate structure-is-earned?
Two independent neighborhoods (N05, N07) converge on the same missing primitive, and v2's
own definition of warrant presupposes an actor. But introducing a sixth Layer B primitive on
the strength of a literature finding is exactly what the architecture-change firewall exists
to prevent.
**Blocks** BUILD 6 Shape. **Route** governance, not this reconnaissance. TC-019.

### QF-B-05 — What is the SIGMA→ECOS observation set?
TC-003's witness format, TC-009's reduct, and TC-010's behavior inclusion all require a
closed observation set. FS-0001 proposes four observables; nothing establishes they suffice.
**Blocks** TC-003. **Route** FP-001.

## DISCRIMINATING — would decide between live alternatives

### QF-X-01 — Consistency relation, or satisfaction condition, or both?
TC-006 (relation + maintainer) and TC-009 (satisfaction condition) are both candidate homes
for projection correctness. They are not obviously the same thing and may impose different
obligations. **Route** FP-002 tests TC-006's instantiability first, since it is cheaper.

### QF-X-02 — Is the return path a revision or an update?
R048's distinction changes the qualification treatment. If most returns are world-change
(update) rather than correction (revision), the belief-revision machinery in TC-007 applies
to a smaller fraction of the return path than the corpus suggests.
**Route** classify a sample of actual ECB handoff/pulse returns.

### QF-X-03 — Does human adjudication preserve distributivity?
TC-011's semiring depends on it. If human qualification is order-dependent, the algebra is
weaker than a semiring and the N[X] genericity argument does not hold.
**Route** BUILD 3, with worked adjudication traces.

### QF-X-04 — Is git already most of TC-013?
Content-addressed commits with an external remote may discharge the tamper-evidence
requirement without new machinery, in which case TC-013's PERSISTENCE cost is near zero.
**Route** full text of R097 against the actual repository properties.

### QF-X-05 — Does a refusal-merge CRDT exist?
TC-018 draws the boundary at "no automatic resolution for standing". If a CRDT whose merge
is *refusal* rather than resolution exists, convergence could reach further up.
**Route** full text of R099.

## FALSIFICATION — would show a finding here is wrong

### QF-F-01 — Can a projection pass validation while violating a covered obligation?
Falsifies TC-003's witness format (not the method). **Route** FP-001.

### QF-F-02 — Is there a governance context where equal `Permitted_O` composes to unequal permissions?
Falsifies the compositional use of ∼(M,O) and proves CF-13's congruence obligation is live
rather than theoretical. **Finding one is success.** **Route** BUILD 9.

### QF-F-03 — Was the screening adversarial enough?
Five of fourteen neighborhoods produced **no** rejected analogy (N02, N05, N07, N11, N14).
N02 and N14 were shaped around findings the operation had already made, so their uniformly
positive yield is partly a selection effect. **This discounts the confidence of findings
sourced only from those neighborhoods.** **Route** a second screening pass targeting
disconfirmation in those five specifically.

### QF-F-04 — Is a closure that destroys its own reopening actually reachable in v2?
If no aperture can be shown to have been made unreopenable by its own Move, TC-015's
soundness condition is true but vacuous. **Route** audit the eleven existing apertures.

### QF-F-05 — Does the observability partition survive a richer receipt schema?
If most invariants classified unobservable become observable under a modest schema
extension, TC-016's partition is an artifact of a poor schema rather than a structural
limit. **Route** FP-004, recorded against a **named** schema.

## VALIDATION — would confirm something already believed

### QF-V-01 — Does the ECB Charter intake lane actually satisfy the semi-revision postulates?
TC-007 claims v2 independently reinvented semi-revision. Checking the postulates against
real Crucible transform receipts would confirm or qualify that. **Route** ECB Crucible
specimens (10 specimens, 27 transform receipts as of the last inspection).

### QF-V-02 — Does ECO-46's stamp-and-surface behavior satisfy the constraint-maintainer stability law?
TC-006 claims it is a legitimate maintainer. **Route** ECO-46's retrieval-path behavior.

### QF-V-03 — Is BUILD 0's enforcement table correct under CF-05?
BUILD 0 declares five STRUCTURAL and two OBSERVATIONAL rows. Are all five genuinely safety
properties enforceable at those surfaces? A passing check would be the first evidence
TC-001's classification is applicable in practice. **Route** cheap; do it first.

### QF-V-04 — Does Golden Trace 01's ∼(M,O) reading hold?
BUILD 0 is the only end-to-end seam. **Route** FP-002 and FP-003 both use it.

## DEFERRED APERTURES — nonblocking, recorded so they are not lost

### QF-D-01 — Unsearched regions of the synthesis matrix
Empty cells in `11-synthesis-matrix.md` are **unsearched**, not established absences.
Nothing was found on relevance selection from provenance, authorization or control
perspectives, or on warrant from abstract interpretation or refinement.
**Why open** No current build seam needs them. **Trigger** a seam requiring one of those cells.

### QF-D-02 — Bounded Infinity's formal status
AP-06 governs. Nothing in the corpus changed it. **Why open** No build behavior depends on it.

### QF-D-03 — Whether the freeze line should be revisited
CF-03 suggests the Galois prerequisite may already be met. **This reconnaissance has no
authority to lift a freeze.** **Route** ACP-02, human governance, blocked on FP-003.

### QF-D-04 — Reflective level indexing
R083 says self-hosting requires explicit levels. **Why open** BUILD 9 is far off.
**Trigger** BUILD 9 Shape.

### QF-D-05 — Unverified citation metadata
21 of 100 records are `VERIFIED`; 73 are `HIGH` and 6 are `MEDIUM`. One verification
produced a correction (R012 is TCS, not TOPLAS), which is direct evidence that unverified
metadata does contain errors. **No claim in this operation depends on a `MEDIUM` citation
alone**, but the residual error rate is unmeasured. **Trigger** any finding promoted to a
governing surface must have its sources verified first.

### QF-D-06 — Whether ECOS Moves compose at all
NR-06 defers the categorical framing because no morphisms are defined. Whether governance
transformations compose is a genuine open architectural question, not merely an unformalized
one. **Trigger** BUILD 9–10, where composition becomes load-bearing. **Note** CF-13's
congruence obligation and TC-018's layer boundary both depend on the answer.

---

## Questions deliberately not asked

Per §4's anti-pattern clause, decomposition stopped where further questions could not change
BUILD:

- the metaphysics of agency and interiority;
- a universal altitude taxonomy;
- automatic Master-Key discovery;
- the complete relation ontology (AP-07 governs; BUILD 4 supplies its own predicates);
- the final ECOS UI (AP-08 governs);
- whether any of the rejected analogies could be rescued by inventing their prerequisites —
  §12 forbids the rescue, so the question has no admissible answer.
