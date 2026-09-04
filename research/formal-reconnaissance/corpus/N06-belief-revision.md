DISPOSITION: EVIDENCE · NEIGHBORHOOD N06 · RECORDS R046–R054

# N06 — Knowledge Representation, Belief Revision, Truth Maintenance

Primary seam: **S-3 — ECOS→SIGMA qualification without automatic overwrite.**

Neighborhood verdict: produced the operation's sharpest *paired* result. Classical AGM is
**BRANCH_CONFLICTING** with a frozen v2 invariant, by a single named axiom (R046); and the
non-prioritized revision literature that drops exactly that axiom (R049–R051) is the mature
formal treatment of what v2 calls qualification. v2 independently reinvented
credibility-limited revision. Saturation was reached quickly here: records after R051
restated the same postulate manipulations.

---

### R046 — Alchourrón, Gärdenfors, Makinson 1985 (AGM)
`CITE` C. E. Alchourrón, P. Gärdenfors, D. Makinson. *On the logic of theory change: Partial meet contraction and revision functions.* Journal of Symbolic Logic 50(2), 510–530, 1985. · **VERIFIED**
`PROBLEM` How should a belief set change on receiving new information that may conflict with it?
`STRUCTURE` Expansion, contraction, revision; the AGM postulates; partial meet contraction; the Levi and Harper identities.
`GUARANTEE` Rational change: consistency is maintained and change is minimal (informational economy).
`LOSS` Beliefs given up in contraction — chosen by a selection function over maximal non-implying subsets.
`DETECTOR` A postulate violation.
`REOPEN` Change the selection function / entrenchment ordering.
`SEAM` S-3
`INTERNAL` `current ≠ newest`; `confidence ≠ standing`; "return is not overwrite"; "Returned evidence must undergo qualification before it may alter constitutive standing."
`DELTA` **The decisive negative result of the neighborhood, and it is precise.** AGM's **Success** postulate states `A ∈ K * A` — the new input is *always* in the revised belief set. Acceptance is an axiom, not an outcome. That is exactly what `current ≠ newest` and mandatory qualification forbid. So classical AGM cannot be adopted: not because it is too weak, but because one of its defining postulates is the thing v2 exists to refuse. Everything else in AGM (minimal change, entrenchment, the Levi identity) remains usable *once Success is dropped* — see R049–R051.
`TRANSFER` **Reject Success.** Retain the AGM apparatus of minimality and entrenchment as candidate qualification machinery only in its non-prioritized variants.
`PREREQ` A logically closed belief set and a consequence operator. v2 has neither; its claims are typed records, not a deductively closed theory. This is a second, independent barrier.
`PRESERVE` `current ≠ newest`; `evidence ≠ assertion`; `confidence ≠ standing`.
`FALSIFIER` A v2 return path that must accept new evidence unconditionally. That would be an invariant violation, not evidence for AGM.
`BRANCH` **BRANCH_CONFLICTING**
`ENFORCE` —
`COST` NONE
`RETURN` Decisive: names the axiom the return path must not have.
`STATUS` NO_TRANSFER (as a whole) / ARCHITECTURE_CHALLENGE (to any future "latest evidence wins" shortcut)
`EFFECT` CHALLENGES_EXISTING (challenges a tempting shortcut, not the architecture)
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R047 — Gärdenfors 1988 (Knowledge in Flux)
`CITE` P. Gärdenfors. *Knowledge in Flux: Modeling the Dynamics of Epistemic States.* MIT Press, 1988. · **HIGH**
`PROBLEM` A full development of the AGM programme.
`STRUCTURE` Epistemic entrenchment orderings; representation theorems connecting entrenchment to revision.
`GUARANTEE` Revision behavior is fully determined by an entrenchment ordering, and conversely.
`LOSS` As R046.
`DETECTOR` Entrenchment axiom violation.
`REOPEN` Revise the ordering.
`SEAM` S-3
`INTERNAL` Standing's dimensional separation (claim kind / evidentiary basis / epistemic / governance / action standing / warrant), enums deferred under AP-01.
`DELTA` **Epistemic entrenchment is a single total preorder.** v2's standing is explicitly *multi-dimensional and non-collapsible*. So entrenchment cannot be adopted directly without collapsing exactly the separation AP-01 protects. The useful residue is the representation theorem's *shape*: whatever v2's qualification rule turns out to be, it will be characterizable by an ordering over what may be given up — but that ordering must be partial and multi-dimensional, not a total preorder.
`TRANSFER` If a qualification ordering is ever defined, it must be a partial order over the standing dimensions jointly, never a single entrenchment ranking.
`PREREQ` A total preorder — v2 must not supply one.
`PRESERVE` The standing dimensional separation; `confidence ≠ standing`.
`FALSIFIER` A v2 case where the standing dimensions are in fact totally ordered; that would simplify AP-01 considerably and is worth checking at BUILD 3.
`BRANCH` BRANCH_CONFLICTING as stated; BRANCH_DEPENDENT in partial-order form.
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` Yes.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R048 — Katsuno & Mendelzon 1991 (update vs. revision)
`CITE` H. Katsuno, A. O. Mendelzon. *On the difference between updating a knowledge base and revising it.* KR '91, 387–394. · **HIGH**
`PROBLEM` Two different operations are routinely conflated.
`STRUCTURE` **Revision**: the world is static, our beliefs about it were wrong. **Update**: our beliefs were right, the world changed. They satisfy *different* postulate sets (KM postulates for update) and give different results on the same input.
`GUARANTEE` Each operation is correct for its own situation; using the wrong one gives demonstrably wrong answers.
`LOSS` Differs by operation.
`DETECTOR` A disjunctive belief state where update and revision provably diverge.
`REOPEN` Reclassify the input.
`SEAM` S-3
`INTERNAL` ECOS→SIGMA return carries "consequences, observations, receipts, evidence, contradiction, detected insufficiency, **changed conditions**."
`DELTA` **Names a conflation sitting in plain sight in the architecture's own return list.** "Contradiction" and "detected insufficiency" are *revision* inputs — SIGMA was wrong. "Changed conditions" is an *update* input — SIGMA was right and the world moved. These require different qualification treatments, and v2 currently lumps them into one return payload. Applying revision semantics to a changed-world observation retracts a belief that was never false; applying update semantics to a contradiction preserves an error.
`TRANSFER` The return payload must carry an explicit **input-type discriminator** — correction vs. world-change — and qualification must branch on it.
`PREREQ` The distinction must be determinable at return time. Often it is not, which is itself a finding: an undeterminable case must be routed to human judgment rather than defaulted.
`PRESERVE` `evidence ≠ assertion`; `truth ≠ relevance`.
`FALSIFIER` A v2 return where the two treatments coincide — true only when the belief set is complete w.r.t. the changed proposition.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, AUTHORITY
`COST` NONE — a discriminator field on the return payload.
`RETURN` Yes — restructures it.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R049 — Hansson 1997 (semi-revision)
`CITE` S. O. Hansson. *Semi-revision.* Journal of Applied Non-Classical Logics 7(1–2), 151–175, 1997. · **VERIFIED**
`PROBLEM` Revision in which new information has **no special priority** merely because it is new.
`STRUCTURE` The input is added to the belief base and then a consolidation step removes an inconsistency — and the removed part **may be the input itself**.
`GUARANTEE` Consistency, without guaranteeing acceptance. Success is explicitly dropped.
`LOSS` Either prior beliefs or the input, decided by the consolidation function.
`DETECTOR` The consolidated base retains an inconsistency, or discards more than necessary.
`REOPEN` Change the consolidation function.
`SEAM` S-3
`INTERNAL` Qualification. ECB Charter Admission Law: "portables transfer, **records re-qualify** … a specimen that passes through the intake lane and **earns its level**."
`DELTA` **v2 independently reinvented semi-revision.** The Charter's intake lane *is* a consolidation step in which the incoming specimen has no priority from novelty and may itself be what gets rejected. This is the single clearest instance in the reconnaissance of a mature formal treatment existing for something SIGMA/ECOS invented on its own. Its value is not novelty but **postulates**: semi-revision comes with an axiomatic characterization, so v2's qualification rule can be tested against named properties instead of judged case by case.
`TRANSFER` Model qualification as semi-revision: incorporate the returned evidence provisionally, run consolidation, and allow consolidation to reject the input. Test the qualification function against the semi-revision postulates.
`PREREQ` A belief *base* (a set of explicitly held items, not a deductively closed theory) — which is exactly what v2 has. This is a substantially better fit than R046, whose closure requirement v2 fails.
`PRESERVE` `current ≠ newest`; "return is not overwrite."
`FALSIFIER` A v2 qualification outcome that violates a semi-revision postulate for a *good* reason; that would show the postulate set is wrong for v2 and is a genuinely informative failure.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, AUTHORITY
`COST` NONE
`RETURN` Yes — this is the return path's formal home.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING + SUPPLIES_TEST
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R050 — Hansson, Fermé, Cantwell, Falappa 2001 (credibility-limited revision)
`CITE` S. O. Hansson, E. Fermé, J. Cantwell, M. Falappa. *Credibility-limited revision.* Journal of Symbolic Logic 66(4), 1581–1596, 2001. · **VERIFIED**
`PROBLEM` Formalize revision where only *credible* inputs are accepted.
`STRUCTURE` A set of credible propositions; inputs outside it are rejected and the state is unchanged. Five constructions with axiomatic characterizations and known interrelations.
`GUARANTEE` Non-credible input provably changes nothing — refusal is a defined outcome, not an error.
`LOSS` Information in rejected inputs, unless separately retained as evidence.
`DETECTOR` Credibility-set axiom violations.
`REOPEN` Change the credibility set — itself a governed act.
`SEAM` S-3, S-6
`INTERNAL` Qualification; standing; `capability ≠ warrant`; ECB's `human_gate` and proposal lifecycle.
`DELTA` **The closest formal match to v2's qualification found anywhere in the operation.** Credibility-limited revision separates two things v2 also separates and most systems do not: *what is asserted* and *what is eligible to be considered at all*. The credibility set is v2's admissibility gate; the revision operator is what happens after. It also supplies a warning v2 needs: **the credibility set is itself revisable, and revising it is a governance act of a different order** — precisely v2's rule-succession problem, which is why this record links S-3 to S-6.
`TRANSFER` Qualification = credibility screening followed by non-prioritized revision. Screening and revision are distinct, separately warranted operations. Changing the credibility set requires the governance route, never the return path.
`PREREQ` An explicit admissibility criterion. v2's is currently the human rail.
`PRESERVE` `relevance ≠ authority`; `standing ≠ warrant`; "returned evidence must undergo qualification."
`FALSIFIER` A v2 return that alters the admissibility criterion through the ordinary evidence path — a self-amending credibility set, which would be a governance failure.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` AUTHORITY, SEMANTIC
`COST` OBJECT — an explicit credibility/admissibility criterion.
`RETURN` Yes — defines the reject-without-change outcome.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R051 — Makinson 1997 (screened revision)
`CITE` D. Makinson. *Screened revision.* Theoria 63(1–2), 14–23, 1997. · **HIGH**
`PROBLEM` Protect a core of beliefs from revision entirely.
`STRUCTURE` A protected set A ⊆ K; revision proceeds only if the input is consistent with A, otherwise it is refused.
`GUARANTEE` The protected core is never disturbed by any input.
`LOSS` Inputs contradicting the core are refused wholesale.
`DETECTOR` The core becomes inconsistent — impossible if screening is correctly implemented.
`REOPEN` Change the core through a different, higher-authority route.
`SEAM` S-3, S-6
`INTERNAL` `docs/invariants.md` — "STATUS: FROZEN FOR CURRENT BUILD BOUNDARY … CHANGE ROUTE: Explicit architecture decision / human authorization." The **Hard stop** rule.
`DELTA` **v2's frozen invariants are a screening set, exactly.** The hard-stop rule ("if an implementation would make one of these distinctions unrecoverable: STOP THE BUILD UNIT") is screened revision's refusal behavior, stated operationally. The formal contribution is the guarantee that screening composes correctly with the revision operator: the core stays intact under *any* input sequence, which is a stronger statement than "we will stop if we notice."
`TRANSFER` Formalize the hard stop as a screening predicate evaluated on every proposed change, so protection is a checked precondition rather than an alertness requirement — which is directly what the enforcement invariant demands.
`PREREQ` Invariant violation must be mechanically detectable. For several v2 invariants it is a semantic judgment — the boundary R094/R013 draws.
`PRESERVE` The invariants' change route; `runtime reorientation ≠ constitutional redesign`.
`FALSIFIER` An invariant whose violation cannot be detected by any predicate, mechanical or semantic — then screening is unimplementable for it and only the human rail applies.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL where decidable, AUTHORITY otherwise.
`COST` NONE
`RETURN` Yes — screening is the first gate on the return path.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R052 — Doyle 1979 (truth maintenance system)
`CITE` J. Doyle. *A truth maintenance system.* Artificial Intelligence 12(3), 231–272, 1979. · **VERIFIED**
`PROBLEM` Maintain beliefs and their reasons so that retraction propagates correctly.
`STRUCTURE` Nodes with **justifications**; in/out labelling; dependency-directed backtracking; non-monotonic justifications.
`GUARANTEE` A belief is *in* only while a valid justification is; retracting a support automatically un-supports its dependents.
`LOSS` Nothing — the dependency structure is retained precisely so retraction is correct.
`DETECTOR` A belief that remains *in* with no valid justification.
`REOPEN` Re-derive from another justification, or the belief goes *out*.
`SEAM` S-3, S-4
`INTERNAL` Evidence Link. AP-02 (stable evidence interface).
`DELTA` **Answers U-03, which the baseline register identified as an unanswered live question.** v2 has no defined behavior for what happens to a claim when the evidence supporting it is withdrawn. A JTMS justification is structurally an Evidence Link, and dependency-directed backtracking is the correct answer: not cascade-delete (which destroys evidence), and not leaving the claim standing (which is unsound), but **recomputing support status** and marking dependents unsupported while retaining their records.
`TRANSFER` Claims record justifications over Evidence Links; withdrawing evidence triggers recomputation of support status for dependents; unsupported ≠ deleted and ≠ false.
`PREREQ` Justifications recorded at claim creation. If a claim is stored without its justification structure, retraction cannot be computed later — this must be designed into BUILD 3, not retrofitted.
`PRESERVE` `unknown ≠ nonexistent`; `evidence ≠ assertion`. An unsupported claim is not a false claim.
`FALSIFIER` A v2 claim whose support cannot be represented as a justification over evidence — e.g. one resting on a human judgment that is not itself an evidence record.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` PERSISTENCE — justification structure on claims.
`RETURN` Yes — withdrawal is a return event.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` EXPOSES_GAP + SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R053 — de Kleer 1986 (ATMS)
`CITE` J. de Kleer. *An assumption-based TMS.* Artificial Intelligence 28(2), 127–162, 1986. · **HIGH**
`PROBLEM` A JTMS holds one consistent context at a time; comparing alternatives means switching contexts repeatedly.
`STRUCTURE` Each node carries a **label**: the set of minimal assumption sets (environments) under which it holds. All contexts coexist.
`GUARANTEE` Every derivation's assumption dependence is explicit and simultaneously available.
`LOSS` Label size can grow combinatorially.
`DETECTOR` A nogood — an environment proved inconsistent.
`REOPEN` Add assumptions; labels update incrementally.
`SEAM` S-3, S-4
`INTERNAL` As R052, plus provenance (R038).
`DELTA` Two contributions. First, ATMS labels and provenance semirings are the *same idea in two literatures* — a set of minimal supporting assumption sets is a why-provenance expression — which is strong convergent evidence for R038's transfer. Second, ATMS lets v2 hold **multiple candidate standings simultaneously with their supporting evidence**, rather than forcing a single current answer. That is a direct fit for governance under unresolved branches, and for the repository's own habit of keeping alternatives open under apertures.
`TRANSFER` Represent a claim's standing as a label of minimal supporting evidence sets, enabling "this would hold under E1, that under E2" without adjudicating prematurely.
`PREREQ` As R052, plus explicit assumptions. Combinatorial cost is a real risk and the reason this is a candidate rather than a recommendation.
`PRESERVE` `unclassified ≠ invalid`; `operational closure ≠ metaphysical closure`.
`FALSIFIER` Label growth becomes unmanageable at v2's actual scale — plausible; a bounded-assumption variant would then be required.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` PERSISTENCE
`RETURN` Yes.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 2

### R054 — Reiter 1978 (closed world assumption)
`CITE` R. Reiter. *On closed world data bases.* In *Logic and Data Bases*, Plenum, 55–76, 1978. · **HIGH**
`PROBLEM` When may absence from a database be read as falsity?
`STRUCTURE` The Closed World Assumption: infer ¬P when P is not derivable. Sound only under completeness of the database w.r.t. its domain.
`GUARANTEE` Compact representation and decisive negative answers — **only** where the completeness precondition genuinely holds.
`LOSS` The distinction between "false" and "not known", which is destroyed wherever CWA is applied.
`DETECTOR` A fact true in the world but absent from the database, whose negation the system then asserts.
`REOPEN` Move to an open-world reading with explicit negative facts.
`SEAM` S-4, S-3
`INTERNAL` `unknown ≠ nonexistent`. BUILD 0: "missing identity is an explicit not-found result, never evidence of nonexistence beyond this store." BUILD 0 already gets this right.
`DELTA` **The formal name for what a frozen v2 invariant forbids, with its precondition made explicit.** CWA is not simply wrong — it is *sound under completeness*. So the invariant is really a claim that v2's stores are never complete w.r.t. their domains, which is true for a brain-like substrate and false for some bounded sub-scopes (e.g. "the set of ADRs in this repository" *is* complete). The useful refinement: v2 may apply closed-world reasoning **only within an explicitly declared complete scope**, and the declaration is itself a claim requiring standing.
`TRANSFER` Any negative conclusion must cite the scope over which completeness is asserted, and that assertion is a claim with its own provenance — never an implicit default.
`PREREQ` Scope declarations. Cheap and largely already implicit in v2's language.
`PRESERVE` `unknown ≠ nonexistent`; `omission ≠ irrelevance`.
`FALSIFIER` A v2 negative conclusion drawn with no completeness scope that is nevertheless correct — correct by luck, not by warrant.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, SEMANTIC
`COST` NONE
`RETURN` Yes — pairs with R041's explicit absence-observation.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 2
