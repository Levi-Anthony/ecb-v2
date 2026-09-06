STATUS: SPECIFIED — NONE EXECUTED
DISPOSITION: EVIDENCE
ROLE: Four experiments worth running. I ran none of them.
AUTHORITY: None. A specified experiment is not a result.

# Four experiments worth running

**I ran none of these.** They are specified, not executed. Anywhere this research says something
"depends on a probe," it means one of these four — and it means that thing is unproven.

Plain-English version first; the full specification follows.

---

## In plain English

### Experiment 1 — Is the list of "what must survive translation" complete?

When a SIGMA commitment gets turned into something ECOS runs, four things are promised to survive:
what is permitted, what the limits are, what must be recorded about where things came from, and what
would trigger a review.

**Question:** is there a way ECOS could behave that keeps all four of those intact and *still*
breaks the original commitment?

**How:** on paper. Take one real commitment, one plausible mechanism, write the translation between
them by hand, then try hard to break it. No code, no compiler needed.

**Best commitment to use:** *"nothing important may depend on someone remembering."* It is frozen,
it matters, and how you would translate it is genuinely unclear.

**Either outcome is useful.** If you find a way to break it, the missing fifth thing is the result.
If you cannot after real effort, that is weak encouragement — and should be reported as weak.

**There is a third possible outcome:** the commitment might not be checkable from the running system
at all. That is also a finding, and two separate lines of reasoning predict it for the
authority-flavoured rules.

### Experiment 2 — Can the two layers even describe the same thing?

One of my proposals replaces the "keep two things in sync" framing with something gentler: state
what it means for SIGMA and ECOS to *agree*, and have each side propose fixes when they do not.

**Question:** can you actually write down what "agree" means for one real seam? Or do the two sides
share no vocabulary at all, so no such statement is possible?

**How:** Build 0 is the only part that exists end to end. On the SIGMA side: *evidence comes first;
capturing something does not promote it.* On the ECOS side: the thoughts table and the three
operations. Write the agreement condition and check that the passing Golden Trace satisfies it.

**Honest limitation:** Build 0's SIGMA side is nearly trivial, so success here might not generalise.
Say so rather than over-claiming.

### Experiment 3 — Is what's permitted actually determined? ← **do this one first**

Almost everything cheap in this research rests on one assumption: given the situation, the guiding
discriminator, and the operation, **what is permitted is fixed**.

**Question:** is it? Or does permission sometimes depend on something nobody wrote down?

**How:** take two or three decisions you have already made and documented — the two architecture
decision records and the substrate closure. For each, write down the situation, the discriminator,
and the operation. Then ask: *given exactly this and nothing else, was the answer determined?*

**Why this one first.** It is doable on paper today, and more of my findings depend on it than on
anything else. If permission is determined, several things become rigorous at zero cost. If it
depends on unwritten context, a chunk of what I built collapses — and that is a significant thing to
learn **about your architecture**, not about the mathematics.

**Honest limitation:** three past decisions is a small sample, and reconstructing your own reasoning
after the fact invites tidying it up. Use decisions with written records made at the time.

### Experiment 4 — Which of your core principles can evidence ever check?

**Question:** for each of the eighteen things ECB v2 says must not collapse, could a violating run
and a clean run ever produce *different* receipts? If not, no amount of evidence will ever detect a
violation.

**How:** sketch what a receipt would contain — it does not have to exist yet. Then go through the
eighteen and sort each into: evidence can see this / evidence can never see this / evidence could
see it if the receipt also recorded *this specific extra thing*.

**Prediction:** the structural ones (like "no half-finished record") are visible. The ones about
authority and relevance are not, because a violation and a non-violation look identical from
outside.

**If that prediction holds**, most of ECB v2's core commitments cannot be enforced by observation,
and the enforcement table should say so plainly.

**Important caveat:** this answer depends on what the receipt records. A richer receipt can move a
principle across the line — which is the theory's own advice, "add the sensor." So record the answer
against a *named* receipt design, never as if it were permanent.

---

## Full specification

## FP-001 — Is FS-0001's observation set sufficient?

**Exact question** FS-0001 promises four observables survive projection: consequential
permissions, limits, provenance obligations, and revalidation triggers. Is there an ECOS
behavior that preserves all four and still violates a SIGMA invariant?

**Source formalism** Semantic preservation modulo a declared observation (R016); satisfaction
condition (R071); translation validation (R017).

**Prerequisites** One worked SIGMA invariant, one candidate ECOS mechanism, and a written
projection between them. **No compiler is needed** — this is a paper probe over a single
worked specimen.

**SIGMA/ECOS instantiation** Take a live invariant with a plausible operational projection.
`No consequential transition may depend solely on an agent remembering an instruction` is
the recommended specimen: it is frozen, consequential, and its projection is genuinely
unclear.

**Expected discriminator** Either (a) a concrete ECOS behavior preserving all four
observables while violating the invariant — the observation set is **incomplete**, and the
missing observable is the probe's product; or (b) a failure to construct one after
determined effort, which is weak positive evidence and should be reported as weak.

**Falsifier of the probe itself** The chosen invariant has no ECOS reduct at all — its truth
is not determined by runtime state. That is **also a result**, and the one TC-009 and TC-016
independently predict for authority-shaped invariants.

**Possible build consequence** ADD_ACCEPTANCE_TEST (a fifth observable) or
BLOCK_PENDING_PROBE for TC-003, whose witness format cannot be designed until the observation
set is closed.

**Priority** Highest. TC-003, TC-009 and TC-010 all depend on the observation set.

---

## FP-002 — Can SIGMA and ECOS state a shared consistency relation?

**Exact question** TC-006 replaces the lens framing with a consistency relation
R ⊆ SIGMA × ECOS. Can R be written for one real seam, or do the two sides lack enough shared
vocabulary for any relation to be stated?

**Source formalism** Constraint maintainers (R026); complement and untranslatability
(R024, R025).

**Prerequisites** One SIGMA commitment and one ECOS runtime state schema for the same seam.

**SIGMA/ECOS instantiation** The BUILD 0 seam is the only one that exists end to end. SIGMA
side: *atomic evidence first; capture creates no promoted referent.* ECOS side: the
`thoughts` relation and the three MCP operations. Write R and check that Golden Trace 01's
end state satisfies it.

**Expected discriminator** Either R is writable — in which case TC-006 is instantiable and
the same method extends to later seams — or the two sides share no predicate, in which case
the cycle is **not** a consistency-restoration relation and TC-006 fails, leaving projection
correctness resting on TC-009 alone.

**Falsifier of the probe itself** BUILD 0 is too thin to be representative: its SIGMA side is
nearly trivial, so success here may not generalize. Report the limit explicitly rather than
over-claiming.

**Possible build consequence** SHARPEN_CONTRACT if R is writable; withdrawal of TC-006 if not.

**Priority** High. Cheapest of the four, and uses a seam that already passed its trace.

---

## FP-003 — Is `Permitted_O` a function?

**Exact question** TC-005, CF-01, CF-03 and R078's factorization all rest on one assumption:
given state, Master Key, and operation, the permitted-action set is **determined**. Is it?

**Source formalism** Contextual equivalence as the kernel of an observation function (R031);
sufficiency as factorization (R078); Blackwell ordering via partition refinement (R081).

**Prerequisites** Two or three worked governance decisions with their state, Master Key and
operation recorded.

**SIGMA/ECOS instantiation** Take decisions v2 has already made — ADR-001's human-door
selection, ADR-002's substrate selection, and the AP-09 closure. For each, record the state,
the governing discriminator, and the operation. Ask: **given exactly this state, key and
operation, was the permitted set determined — or did it depend on something unrecorded?**

**Expected discriminator** Either permission is determined — the kernel is well-defined,
∼(M,O) becomes rigorous at zero cost, and CF-03's derived partial order follows — or
permission depends on unrecorded context, in which case the kernel is undefined and
**FS-0001's ∼(M,O) has no rigorous reading**, which is a significant negative result about
the current architecture rather than about the formalism.

**Falsifier of the probe itself** Three historical decisions may be too few, and
reconstructing them risks hindsight rationalization. Mitigate by using decisions with written
ADRs, where the reasoning was recorded at the time.

**Possible build consequence** This probe gates TC-005, CF-01, CF-03 and part of CF-08 —
**the largest downstream dependency of any probe here, at the lowest cost.**

**Priority** Highest cost-effectiveness. Executable on paper today, against existing ADRs.

---

## FP-004 — Which invariants are return-observable?

**Exact question** TC-016 claims v2's eighteen non-collapse invariants partition into those
runtime evidence can revalidate and those it cannot. What is the actual partition?

**Source formalism** Observability (R063); monitorability (R096); maximin distinguishability
(R079).

**Prerequisites** A candidate receipt schema — what a receipt would carry. Does not require
receipts to exist.

**SIGMA/ECOS instantiation** For each of the eighteen invariants, ask whether a violating and
a non-violating history could produce **identical** receipt trajectories under the candidate
schema. Classify: OBSERVABLE / UNOBSERVABLE / OBSERVABLE-IF the schema is extended (naming
the extension).

**Expected discriminator** The partition itself. Predicted from R063 and R096: invariants
about *structure* (`no partial capture`) are observable; invariants about *authority and
relevance* (`relevance ≠ authority`, `confidence ≠ standing`) are not, because both sides of
the distinction produce the same trace. If that prediction holds, then **the majority of v2's
constitutive commitments cannot be enforced observationally**, and the enforcement table must
say so.

**Falsifier of the probe itself** The classification may be schema-dependent rather than
intrinsic — a richer receipt may move an invariant across the line. That is the theory's own
prescription (add the sensor), so record the classification **relative to a named schema**,
never absolutely.

**Possible build consequence** SHARPEN_CONTRACT — the enforcement table gains a column — and
ADD_ACCEPTANCE_TEST asserting no invariant classified unobservable carries an evidence-driven
revalidation trigger.

**Priority** High. Directly serves BUILD 5's receipt design and is doable now.

---

## Probes considered and not specified

| Candidate | Why not |
|---|---|
| Formalize widening/narrowing for Master Key closure | CF-11 is usable as a discipline without formalization; the formal version needs the frozen order. |
| Derive a congruence format for ∼(M,O) | CF-13 binds at BUILD 9. Cannot change BUILD 1–5, so specifying it now opens a recursive loop §21 forbids. |
| Select an argumentation semantics for conflicting evidence | R100's grounded semantics is the obvious default; choosing among semantics needs real conflicting specimens, which do not yet exist. |
