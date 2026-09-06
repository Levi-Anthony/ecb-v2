DISPOSITION: EVIDENCE · NEIGHBORHOOD N01 · RECORDS R001–R011

# N01 — Abstract Interpretation, Abstraction and Refinement

> Machine-facing records. Plain-English result: [`../EXECUTIVE-EXTRACTION.md`](../EXECUTIVE-EXTRACTION.md) · Decoder: [`../GLOSSARY.md`](../GLOSSARY.md)


Primary seam: **S-5 bounded local closure and lawful refinement.**

Neighborhood verdict: the *machinery* transfers; the *lattice-theoretic presentation* is on
the Build Contract freeze line and cannot be adopted here. The operation therefore
separates the CEGAR-shaped **loop** (adoptable now, no order required) from the
Galois-shaped **algebra** (frozen). This separation is the neighborhood's main product.

---

### R001 — Cousot & Cousot 1977
`CITE` P. Cousot, R. Cousot. *Abstract interpretation: a unified lattice model for static analysis of programs by construction or approximation of fixpoints.* POPL '77, 238–252. doi:10.1145/512950.512973 · **VERIFIED**
`PROBLEM` Compute sound facts about all executions of a program without running them all.
`STRUCTURE` Concrete domain, abstract domain, abstraction α and concretization γ forming a Galois insertion; fixpoint approximation.
`GUARANTEE` Soundness: every concrete behavior is represented by the abstract result. Never a false "safe".
`LOSS` Distinctions irrelevant to the chosen property; precision, deliberately and traceably.
`DETECTOR` A concrete witness in γ(a) that contradicts the abstract conclusion (a spurious result).
`REOPEN` Choose a finer domain; the framework is parameterized by domain choice.
`SEAM` S-5, S-1
`INTERNAL` FS-0001 robust-action soundness; AP-10.
`DELTA` v2 states its soundness intuition (over-approximate states, under-approximate permitted actions) but has no framework in which "sound" is a checkable property rather than a slogan.
`TRANSFER` The over/under asymmetry FS-0001 already wrote is the standard soundness pattern applied to a *permission* lattice rather than a state lattice; treat Permitted_O as an under-approximating abstract transformer.
`PREREQ` Partial orders on both concrete states and permitted-action sets; a monotone α; γ.
`PRESERVE` `operational closure ≠ metaphysical closure` — soundness must not be read as completeness.
`FALSIFIER` Exhibit two ECOS states in one abstraction class where the emitted envelope is legitimate for one and illegitimate for the other, with the compiler emitting it anyway.
`BRANCH` BRANCH_DEPENDENT — requires the frozen order.
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` NONE to reason with; PERSISTENCE to implement domains.
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R002 — Cousot & Cousot 1979
`CITE` P. Cousot, R. Cousot. *Systematic design of program analysis frameworks.* POPL '79, 269–282. · **VERIFIED** (existence and venue confirmed)
`PROBLEM` Give equivalent presentations of an abstraction so the designer can pick the cheapest correct one.
`STRUCTURE` Equivalence of Galois connections, **upper closure operators**, Moore families, and ideals as presentations of the same abstraction.
`GUARANTEE` The presentations are interchangeable; a result proved in one holds in the others.
`LOSS` As R001.
`DETECTOR` Same as R001.
`REOPEN` Refine the closure operator / Moore family.
`SEAM` S-1, S-5
`INTERNAL` FS-0001's **technical correction** that P²=P must not be imposed on α: X→A because the second application is ill-typed.
`DELTA` **This record answers H3.** Idempotence is not a property of α at all; it is a property of the closure operator ρ = γ∘α, which is an endomap X→X and is idempotent, monotone and extensive *by construction* for a Galois insertion. So `P(P(x)) = P(x)` has exact operational standing — as a **theorem about ρ**, never as an assumption about the compiler.
`TRANSFER` If v2 ever earns the orders, present the projection as a closure operator on the concrete domain; then normalization stability (TG-03) is the special case ρ∘ρ = ρ and needs no separate axiom.
`PREREQ` The same frozen orders as R001, plus an earned embedding γ making ρ type-correct — precisely the embedding FS-0001 says is not yet available.
`PRESERVE` FS-0001's correction. Do not reinstate P²=P on α.
`FALSIFIER` Show a legitimate v2 projection where γ∘α is not extensive (the abstraction claims *more* than the source state), which would break the closure presentation.
`BRANCH` BRANCH_DEPENDENT
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING — supplies the correct home for a claim FS-0001 could only negate.
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R003 — Cousot & Cousot 1992 (widening/narrowing vs. Galois)
`CITE` P. Cousot, R. Cousot. *Comparing the Galois connection and widening/narrowing approaches to abstract interpretation.* PLILP '92, LNCS 631, 269–295. · **MEDIUM**
`PROBLEM` Analyze programs when no best abstraction exists or the domain has infinite ascending chains.
`STRUCTURE` Widening ∇ (forces convergence, loses precision) and narrowing ∆ (recovers some precision); shown usable **without** a Galois connection.
`GUARANTEE` Termination of the analysis with a sound (if imprecise) result.
`LOSS` Unbounded precision, in exchange for termination.
`DETECTOR` The widened result is too coarse to decide the question asked.
`REOPEN` Narrow, or delay widening for k iterations.
`SEAM` S-5
`INTERNAL` Master Key (bounds present relevance) + Aperture (preserves what was excluded) + Revalidation.
`DELTA` **Widening is the mature name for what a Master Key does under time pressure**: force closure now, record that precision was traded, allow recovery later. Crucially this record shows the technique does **not** require the Galois apparatus — which matters because the Galois apparatus is frozen and widening is not.
`TRANSFER` Model a Master Key's forced local closure as a widening step that must record (a) what was collapsed and (b) the narrowing route. An Aperture without a narrowing route is an unsound widening.
`PREREQ` An ordering only on the abstraction being widened — weaker than a full Galois connection.
`PRESERVE` `omission ≠ irrelevance`. A widened-away distinction is not thereby irrelevant.
`FALSIFIER` A v2 closure that cannot be narrowed at all (information destroyed, not deferred) — that would be truncation, not widening, and the analogy fails.
`BRANCH` BRANCH_COMPATIBLE — notably weaker prerequisites than R001/R002.
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` NONE
`RETURN` Narrowing is triggered by returned evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R004 — Clarke, Grumberg, Jha, Lu, Veith 2000 (CEGAR)
`CITE` E. Clarke, O. Grumberg, S. Jha, Y. Lu, H. Veith. *Counterexample-guided abstraction refinement.* CAV 2000, LNCS 1855, 154–169. · **VERIFIED**
`PROBLEM` Abstractions coarse enough to check are often too coarse to be conclusive.
`STRUCTURE` Loop: abstract → model check → if a counterexample is *spurious*, use it to refine the abstraction → repeat.
`GUARANTEE` Refinement is guided by an actual failure, not by guesswork; each round strictly refines.
`LOSS` Precision, until a counterexample demands it back.
`DETECTOR` **Spuriousness check** — does the abstract counterexample have a concrete witness?
`REOPEN` The refinement step is the reopening, and it is driven by evidence.
`SEAM` S-5, S-3
`INTERNAL` Aperture + Revalidation trigger. TG-02 (refinement before license).
`DELTA` v2's revalidation triggers are *declared in advance by a human*. CEGAR derives the refinement **from the failure itself**. That is a materially different and stronger discipline: the evidence that closure was too coarse also tells you how to reopen.
`TRANSFER` Adopt the loop shape, not the algebra: a returned ECOS observation that an envelope licensed an illegitimate act is a spurious counterexample; the refinement it induces is the lawful reopening of the Master Key's collapse.
`PREREQ` Only (i) an abstraction, (ii) a counterexample, (iii) a refinement operation. **No lattice, no Galois connection, no metric.**
`PRESERVE` `runtime reorientation ≠ constitutional redesign` — refinement adjusts the abstraction, never the source invariant.
`FALSIFIER` A v2 failure that carries no information about which collapsed distinction caused it; then the loop cannot close and only human re-Shaping works.
`BRANCH` BRANCH_NEUTRAL — this is the neighborhood's key result. The loop is adoptable under every admissible branch because it needs none of the frozen structure.
`ENFORCE` OBSERVATIONAL, SEMANTIC
`COST` EVENT — a refinement event with its triggering witness.
`RETURN` Directly: the return path becomes the refinement driver.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R005 — Clarke, Grumberg, Jha, Lu, Veith 2003 (CEGAR, journal)
`CITE` E. Clarke, O. Grumberg, S. Jha, Y. Lu, H. Veith. *Counterexample-guided abstraction refinement for symbolic model checking.* JACM 50(5), 752–794, 2003. · **VERIFIED**
`PROBLEM` As R004, with completeness and complexity treated properly.
`STRUCTURE` Formalized spuriousness, refinement minimality, termination conditions.
`GUARANTEE` Under stated conditions the loop terminates; refinement can be made minimal.
`LOSS` As R004.
`DETECTOR` Formal spuriousness criterion.
`REOPEN` Minimal separating refinement.
`SEAM` S-5
`INTERNAL` As R004.
`DELTA` Supplies the **minimality** obligation: refine only enough to eliminate the observed failure. That is the formal analogue of the repository's own aperture rule step 3 ("resolve only enough to restore the current Build Unit").
`TRANSFER` Minimal refinement = the aperture rule, stated as a checkable property rather than a discipline.
`PREREQ` As R004 plus a notion of refinement ordering.
`PRESERVE` Aperture rule step 4: "do not broaden into unrelated architecture."
`FALSIFIER` A v2 refinement that cannot be bounded — every reopening cascades.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` OBSERVATIONAL
`COST` NONE
`RETURN` As R004.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING — external support for the aperture rule.
`BUILD` VERIFY_EXISTING
`PRIORITY` 2

### R006 — Henzinger, Jhala, Majumdar, Sutre 2002 (lazy abstraction)
`CITE` T. Henzinger, R. Jhala, R. Majumdar, G. Sutre. *Lazy abstraction.* POPL '02, 58–70. · **HIGH**
`PROBLEM` Uniform refinement is wasteful; most of the state space does not need precision.
`STRUCTURE` Refine the abstraction **only along the path** where the counterexample arose; different regions carry different precision.
`GUARANTEE` Same soundness, far less work.
`LOSS` Uniformity of the abstraction.
`DETECTOR` Path-local spuriousness.
`REOPEN` Local, path-indexed refinement.
`SEAM` S-5, S-7
`INTERNAL` Build Contract: "**Recursive inspection is lazy.** Open recursive inspection only when an encountered condition creates material uncertainty."
`DELTA` Near-exact match. Lazy abstraction is the mature, named, published version of v2's laziness rule, with the additional insight that **precision may legitimately be non-uniform across the system** — v2 has not said this explicitly.
`TRANSFER` Different governance objects may sit at different inspection depths simultaneously, and that is a correctness-preserving optimization rather than an inconsistency.
`PREREQ` Path/region indexing of the abstraction.
`PRESERVE` The laziness rule; `operational classification ≠ ontological exhaustion`.
`FALSIFIER` A v2 condition where non-uniform depth produces contradictory governance conclusions in two regions.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` None.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` VERIFY_EXISTING
`PRIORITY` 1

### R007 — Graf & Saïdi 1997 (predicate abstraction)
`CITE` S. Graf, H. Saïdi. *Construction of abstract state graphs with PVS.* CAV '97, LNCS 1254, 72–83. · **HIGH**
`PROBLEM` Choosing an abstract domain by hand is hard.
`STRUCTURE` Abstract states are truth-valuations of a finite set of **predicates**; the domain is generated from the predicates.
`GUARANTEE` Sound abstraction generated automatically from a chosen predicate set.
`LOSS` Everything not expressible by the predicates.
`DETECTOR` Two concrete states agreeing on all predicates but differing in the property of interest.
`REOPEN` Add predicates (this is what CEGAR refinement usually does).
`SEAM` S-5, S-1
`INTERNAL` Master Key as "governing discriminator."
`DELTA` **A Master Key expression is a predicate set.** This gives Master Keys a concrete, finite, inspectable representation that manufactures nothing: the abstraction is the valuation, the collapse is the predicate set's blindness, and refinement is adding a predicate.
`TRANSFER` Physicalize a Master Key as an explicit finite predicate set over governance objects, and derive ∼(M,O) as agreement on those predicates.
`PREREQ` Predicates must be decidable on v2 objects — many governance predicates are not.
`PRESERVE` Master Key "cannot manufacture truth, standing, warrant, admissibility, authority."
`FALSIFIER` The predicates required to express a real Master Key turn out to be semantic judgments, not decidable checks — in which case the abstraction is not mechanically constructible.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL where predicates are decidable; SEMANTIC otherwise.
`COST` OBJECT — a Master Key predicate set.
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 2

### R008 — Giacobazzi, Ranzato, Scozzari 2000 (completeness)
`CITE` R. Giacobazzi, F. Ranzato, F. Scozzari. *Making abstract interpretations complete.* JACM 47(2), 361–416, 2000. · **HIGH**
`PROBLEM` When does an abstraction lose *nothing* for a given operation, and can it be repaired to lose nothing?
`STRUCTURE` Backward/forward completeness of an abstract domain w.r.t. an operation; complete shells and cores — the *minimal* refinement making the domain complete.
`GUARANTEE` A complete abstraction gives exactly the abstraction of the concrete result for that operation.
`LOSS` None, for the operation the domain is complete for. Everything else is unconstrained.
`DETECTOR` Incompleteness is exactly a precision gap on that operation.
`REOPEN` Compute the complete shell — the canonical minimal repair.
`SEAM` S-5, S-1
`INTERNAL` FS-0001's ∼(M,O) and TG-02.
`DELTA` This is the **exact formal statement of "adequate for this Move."** An abstraction is adequate for operation O precisely when it is complete for O; TG-02's refinement trigger is the incompleteness witness; and the theory says the minimal repair is canonical rather than a matter of judgment.
`TRANSFER` Define "the Master Key's collapse is safe for this Move" as completeness w.r.t. the Move's permission function, and treat the complete shell as the principled refinement target.
`PREREQ` Domain orders again (frozen), plus the operation as a monotone function.
`PRESERVE` `operational classification ≠ ontological exhaustion` — completeness is always relative to an operation, never absolute.
`FALSIFIER` A v2 Move whose permission function is non-monotone, which would put it outside the theory.
`BRANCH` BRANCH_DEPENDENT
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R009 — Rival & Mauborgne 2007 (trace partitioning)
`CITE` X. Rival, L. Mauborgne. *The trace partitioning abstract domain.* TOPLAS 29(5), 26, 2007. · **HIGH**
`PROBLEM` A single abstraction over all executions is too coarse; merging distinct histories destroys precision.
`STRUCTURE` Partition traces by chosen criteria (control history, values), analyze each class separately, merge only when justified.
`GUARANTEE` Soundness preserved while precision is recovered where partitioning is applied.
`LOSS` Distinctions between traces inside a class.
`DETECTOR` A conclusion that holds per-class but is destroyed by the merge.
`REOPEN` Repartition on a finer criterion; delay merging.
`SEAM` S-5, S-4
`INTERNAL` No v2 mechanism. Handoff snapshots merge histories implicitly.
`DELTA` **Exposes a gap.** v2 has no rule for when two histories may be merged into one governance conclusion. ECB's handoff/pulse compaction already merges histories with no stated soundness condition — an unexamined merge is exactly the failure this domain exists to prevent.
`TRANSFER` A merge of two provenance histories into one standing conclusion requires an explicit justification that the merged classes agree on every promised-preserved obligation.
`PREREQ` A partition criterion and a merge operation, both explicit.
`PRESERVE` `evidence ≠ assertion`; merging evidence must not fabricate an assertion neither history supported.
`FALSIFIER` Show that every v2 history merge is already justified by construction, making the obligation vacuous.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` EVENT — a merge event carrying its justification.
`RETURN` Yes — returned evidence from multiple runs must not be silently merged.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 2

### R010 — Miné 2006 (octagon domain)
`CITE` A. Miné. *The octagon abstract domain.* Higher-Order and Symbolic Computation 19(1), 31–100, 2006. · **HIGH**
`PROBLEM` Intervals are too weak, polyhedra too expensive.
`STRUCTURE` A restricted relational domain (±x ±y ≤ c) with cubic-time operations.
`GUARANTEE` Captures a specific, named class of relations at predictable cost.
`LOSS` All relations outside the octagonal form.
`DETECTOR` A needed invariant is not octagonally expressible.
`REOPEN` Move to a richer domain, at cost.
`SEAM` S-5
`INTERNAL` "Structure is earned" in the Build Contract.
`DELTA` A worked precedent for the *structure-is-earned* rule in a mathematical setting: the discipline is to name the expressiveness class you bought and its cost, not to take the most general structure available.
`TRANSFER` Weak, and honestly so: analogy of engineering posture, not of mechanism. Retained as background because it disciplines domain selection if v2 ever builds one.
`PREREQ` A numeric domain. v2 has none.
`PRESERVE` Structure-is-earned.
`FALSIFIER` n/a — no substantive claim is made.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` METAPHOR_ONLY
`EFFECT` ALREADY_PRESENT
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 0

### R011 — Cousot et al. 2005 (ASTRÉE)
`CITE` P. Cousot, R. Cousot, J. Feret, L. Mauborgne, A. Miné, D. Monniaux, X. Rival. *The ASTRÉE analyzer.* ESOP 2005, LNCS 3444, 21–30. · **HIGH**
`PROBLEM` Make abstract interpretation work on real safety-critical avionics code with zero false alarms.
`STRUCTURE` A domain-*specialized* analyzer: many cooperating domains chosen for one program family.
`GUARANTEE` Sound and, for the target family, precise enough to be alarm-free.
`LOSS` Generality. ASTRÉE is not a general-purpose analyzer.
`DETECTOR` False alarms on the target family.
`REOPEN` Add a domain specialized to the alarm's cause.
`SEAM` S-5, S-1
`INTERNAL` Master Key as a *local* discriminator, not a universal one.
`DELTA` Strong empirical support for a v2 commitment that is currently justified only on principle: **specialization beats generality**. ASTRÉE's usefulness comes from refusing to be a universal abstraction. This is external evidence against building a general ECOS abstraction layer before specific Moves demand one.
`TRANSFER` No mechanism transfers. The evidential claim transfers: a universal projection calculus is the wrong target; per-Move specialized projections are the demonstrated-viable one.
`PREREQ` None — this is evidence, not machinery.
`PRESERVE` Build Contract freeze line on "full projection mathematics."
`FALSIFIER` A v2 build seam where a general projection provably outperforms specialized ones.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER (as machinery); evidential support only.
`EFFECT` VERIFY_EXISTING
`BUILD` VERIFY_EXISTING
`PRIORITY` 1
