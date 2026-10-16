DISPOSITION: EVIDENCE · NEIGHBORHOOD N04 · RECORDS R031–R037

# N04 — Projection, Quotient, Contextual Equivalence

> Machine-facing records. Plain-English result: [`../EXECUTIVE-EXTRACTION.md`](../EXECUTIVE-EXTRACTION.md) · Decoder: [`../GLOSSARY.md`](../GLOSSARY.md)


Primary seam: **S-5 — temporary collapsing of distinctions irrelevant to a current Move.**

Neighborhood verdict: supplies the **cheapest strong result of the operation**. FS-0001's
operation-indexed equivalence ∼(M,O) can be made fully rigorous at *zero primitive cost*
as the kernel of a permission function, with no metric, lattice, order, or probability
invented. R031 and R035 carry that result; R033 supplies the discipline that equivalence
choice is a design decision, not a discovery.

---

### R031 — Plotkin 1977 (contextual / observational equivalence)
`CITE` G. Plotkin. *LCF considered as a programming language.* Theoretical Computer Science 5(3), 223–255, 1977. · **HIGH**
`PROBLEM` When are two programs interchangeable?
`STRUCTURE` Contextual equivalence: `M ≈ N` iff for every program context `C[·]`, `C[M]` and `C[N]` are indistinguishable by the chosen observation.
`GUARANTEE` The coarsest equivalence that is sound for substitution under the chosen observations.
`LOSS` Every internal difference that no context can detect.
`DETECTOR` A distinguishing context.
`REOPEN` Enrich the observation or the context set; the equivalence refines accordingly.
`SEAM` S-5, S-1
`INTERNAL` FS-0001: `x ∼(M,O) y` iff x and y license the same relevant action distinctions under Master Key M for operation O.
`DELTA` **This is the exact classical form of ∼(M,O), and it costs nothing to adopt.** Contextual equivalence is defined as the kernel of an observation function quantified over contexts. Since the kernel of *any* function is automatically an equivalence relation — reflexive, symmetric, transitive by construction — defining `x ∼(M,O) y ⟺ Permitted_O(x) = Permitted_O(y)` yields a rigorous equivalence relation **with no metric, no order, no lattice, and no invented structure whatsoever**. FS-0001 could only assert ∼(M,O) informally; this makes it a definition with proofs attached. It also immediately yields the failure detector: an abstraction is too coarse for O exactly when γ(a) is not contained in a single ∼(M,O) class — TG-02, restated as a set-containment check.
`TRANSFER` Define ∼(M,O) as `ker(Permitted_O)`; define "abstraction a is adequate for O" as `γ(a)` contained in one ∼(M,O) class; TG-02 fires precisely on the negation.
`PREREQ` Only that `Permitted_O` is a function — i.e. that permission is determined by state given (M, O). This is already assumed everywhere in v2.
`PRESERVE` `operational equivalence ≠ identity`; `operational classification ≠ ontological exhaustion`. Equivalence is always indexed by (M, O) and never asserted absolutely.
`FALSIFIER` `Permitted_O` is not a function — the same state under the same Master Key and operation yields different permissions (e.g. permission depends on unrecorded history). Then the kernel is undefined and the whole construction fails. **This is a cheap, decisive experiment and is FP-003.**
`BRANCH` BRANCH_NEUTRAL — depends on no open architectural branch.
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` **NONE.**
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING + SUPPLIES_TEST
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R032 — Hennessy & Milner 1985 (observational equivalence and modal logic)
`CITE` M. Hennessy, R. Milner. *Algebraic laws for nondeterminism and concurrency.* JACM 32(1), 137–161, 1985. · **HIGH**
`PROBLEM` Characterize behavioral equivalence logically rather than only operationally.
`STRUCTURE` Hennessy–Milner logic; two states are bisimilar iff they satisfy exactly the same modal formulas (for image-finite systems).
`GUARANTEE` A logical characterization: equivalence classes are exactly the formula-indistinguishable classes.
`LOSS` Distinctions no formula in the logic expresses.
`DETECTOR` A distinguishing formula — a constructive, inspectable witness.
`REOPEN` Extend the logic.
`SEAM` S-5
`INTERNAL` ∼(M,O); Master Key as discriminator.
`DELTA` Supplies the **witness format** R031 lacks. When TG-02 fires, the useful artifact is not "these states differ" but *the specific formula that distinguishes them* — which is exactly what the refinement must preserve. Combined with R007 (predicate abstraction), the distinguishing formula becomes the predicate to add.
`TRANSFER` When an abstraction is found too coarse, record the distinguishing predicate as the refinement's content; the aperture's reopening record carries it.
`PREREQ` A modal/predicate language over governance states — R007's predicate set suffices.
`PRESERVE` `omission ≠ irrelevance`.
`FALSIFIER` States distinguishable in their permissions but by no expressible predicate; the collapse would then be unrepairable within the language.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` None.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 2

### R033 — van Glabbeek 2001 (linear time – branching time spectrum)
`CITE` R. J. van Glabbeek. *The linear time – branching time spectrum I.* In *Handbook of Process Algebra*, Elsevier, 3–99, 2001. · **HIGH**
`PROBLEM` There is no single "correct" behavioral equivalence.
`STRUCTURE` A lattice of equivalences — trace, failures, ready, simulation, bisimulation — ordered by discriminating power, each induced by a different observational capability.
`GUARANTEE` For each equivalence, exactly what an observer with that power can distinguish.
`LOSS` Varies by choice; the point is that the choice is a design decision.
`DETECTOR` An observer of the assumed power that distinguishes two states the equivalence identifies.
`REOPEN` Move up the spectrum.
`SEAM` S-5
`INTERNAL` ∼(M,O).
`DELTA` **Guards against a real error.** The spectrum shows equivalence is determined by *what the observer can do* — and different v2 observers (a runtime checker, a human reviewer, a downstream surface) have different powers, so a single ∼(M,O) may be adequate for one and inadequate for another. v2 currently writes as if one equivalence serves all consumers.
`TRANSFER` ∼(M,O) must be indexed by the *observer* as well as by (M, O), or its adequacy claim must name which observer it holds for.
`PREREQ` Observer capabilities distinguished — v2 has not done this.
`PRESERVE` `operational equivalence ≠ identity`.
`FALSIFIER` All v2 consumers of an equivalence turn out to have identical discriminating power. Unlikely across human and machine surfaces.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` Yes — a returning observer may be more discriminating than the projecting one.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R034 — Milner & Sangiorgi 1992 (barbed bisimulation)
`CITE` R. Milner, D. Sangiorgi. *Barbed bisimulation.* ICALP '92, LNCS 623, 685–695. · **HIGH**
`PROBLEM` Define behavioral equivalence in a calculus with minimal built-in observation.
`STRUCTURE` Pick a minimal observable ("barb"), take bisimulation w.r.t. it, then close under all contexts.
`GUARANTEE` A canonical equivalence generated from a small, explicitly chosen observation.
`LOSS` Whatever the barb cannot see, before context closure restores discrimination.
`DETECTOR` A context that distinguishes.
`REOPEN` Change the barb.
`SEAM` S-5
`INTERNAL` FS-0001's four promised-preserved observables.
`DELTA` Methodologically exact: choose the smallest observable set, then let context closure do the work. This is the disciplined way to pick v2's observation set for R016's semantic preservation — start minimal and justify each addition, rather than enumerating everything that might matter.
`TRANSFER` Derive the SIGMA→ECOS observation set as a minimal barb plus context closure, rather than as an enumeration.
`PREREQ` A notion of governance context (what can be composed around an envelope). Not yet defined.
`PRESERVE` Structure-is-earned.
`FALSIFIER` No minimal barb generates the needed discrimination; the observation set is irreducibly a list.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R035 — Groote & Vaandrager 1992 (congruence formats)
`CITE` J. F. Groote, F. Vaandrager. *Structured operational semantics and bisimulation as a congruence.* Information and Computation 100(2), 202–260, 1992. · **HIGH**
`PROBLEM` An equivalence is only usable for compositional reasoning if it is a **congruence** — preserved by every operator.
`STRUCTURE` Syntactic rule formats guaranteeing that bisimulation is a congruence.
`GUARANTEE` Substituting equivalents inside a larger system preserves equivalence.
`LOSS` Operators outside the format lose the guarantee.
`DETECTOR` A context in which two equivalent components behave differently — a congruence failure.
`REOPEN` Restrict the operators, or coarsen/refine the equivalence until it is a congruence.
`SEAM` S-5, S-7
`INTERNAL` ∼(M,O) used to justify substituting one state for another in reasoning.
`DELTA` **A necessary and currently missing obligation.** An equivalence that is not a congruence is unsafe for compositional use: two states may license the same actions in isolation yet license different actions once embedded in a larger governance context. `ker(Permitted_O)` from R031 is an equivalence *by construction* but is **not automatically a congruence**. v2 intends to compose governance objects (recursion, propagation, packets), so this obligation binds at BUILD 9–10.
`TRANSFER` Before ∼(M,O) is used to justify any substitution inside a composite, discharge a congruence obligation for the composition operators actually in use.
`PREREQ` Named composition operators over governance objects. BUILD 9–10.
`PRESERVE` `local phenotype ≠ inherited architecture` — local equivalence does not license global substitution.
`FALSIFIER` Exhibit a governance context where states with equal `Permitted_O` compose to unequal permissions. Finding one is *success*: it proves the obligation is live.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, STRUCTURAL
`COST` NONE
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R036 — Jacobs & Rutten 1997 (coalgebra and coinduction)
`CITE` B. Jacobs, J. Rutten. *A tutorial on (co)algebras and coinduction.* EATCS Bulletin 62, 222–259, 1997. · **HIGH**
`PROBLEM` Give a uniform account of state-based systems whose identity is determined by observation.
`STRUCTURE` Coalgebras for a functor; final coalgebra; bisimilarity as the canonical equivalence; coinduction as the proof principle.
`GUARANTEE` Observationally indistinguishable states are identified in the final coalgebra.
`LOSS` All non-observable internal structure.
`DETECTOR` A bisimulation cannot be constructed.
`REOPEN` Enrich the observation functor.
`SEAM` S-5, S-4
`INTERNAL` `identity ≠ description`; `referent ≠ map`.
`DELTA` Supplies the precise vocabulary for a distinction v2 asserts but does not define: **observational identity is not referential identity.** In the final coalgebra, indistinguishable states *are* identified — which is exactly what v2 must refuse for referents, since two distinct referents may be observationally identical and must stay distinct. Naming this keeps `identity ≠ description` from being eroded by an appealing "identify what you cannot distinguish" principle.
`TRANSFER` Behavioral equivalence may be used to reason about actions; it may **never** be used to merge referents.
`PREREQ` An observation functor; not yet defined and not cheap.
`PRESERVE` `identity ≠ description`; `referent ≠ map`.
`FALSIFIER` A v2 case where merging observationally identical referents is correct — e.g. deduplication. Note OB1's content-fingerprint dedup is exactly this, and `docs/ob1-prior-art.md` already correctly codes it **DEFER** on the grounds that it is a policy, not an identity mechanism.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R037 — Sangiorgi 2009 (origins of bisimulation and coinduction)
`CITE` D. Sangiorgi. *On the origins of bisimulation and coinduction.* TOPLAS 31(4), 15, 2009. · **HIGH**
`PROBLEM` Historical and conceptual reconstruction of how these notions arose independently in three fields.
`STRUCTURE` Survey.
`GUARANTEE` None.
`LOSS` n/a.
`DETECTOR` n/a.
`REOPEN` n/a.
`SEAM` S-5
`INTERNAL` —
`DELTA` Retained as a **guardrail and saturation marker**. It documents that bisimulation-like notions were reinvented independently in modal logic, set theory, and concurrency — direct evidence for the reconnaissance's own premise that SIGMA/ECOS may have independently reinvented mature machinery, and equally that structural resemblance across fields does not by itself establish transferable identity. After this record, N04 returned only restatements.
`TRANSFER` None.
`PREREQ` n/a.
`PRESERVE` §12 analogy admission rule.
`FALSIFIER` n/a.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER
`EFFECT` ALREADY_PRESENT
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 1
