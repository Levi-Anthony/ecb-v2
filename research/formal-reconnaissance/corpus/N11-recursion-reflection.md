DISPOSITION: EVIDENCE · NEIGHBORHOOD N11 · RECORDS R083–R088

# N11 — Recursion, Reflection, Fixed Points

Primary seam: **S-7 — governors and mappings remaining inspectable referents without infinite regress.**

Neighborhood verdict: strong support for two rules v2 already holds, and one hard limit it
should state explicitly. The reflective-tower literature shows lazy recursive inspection is
not merely economical but the *known* way to make an infinite tower finitely realizable
(R084). The Gödel/Löb results say a governance system cannot certify its own soundness
(R085–R086), which converts the human rail from a convenience into a structural necessity.

---

### R083 — Smith 1984 (reflection and semantics in Lisp)
`CITE` B. C. Smith. *Reflection and semantics in a procedural language.* MIT-LCS-TR-272, 1982; *Reflection and semantics in Lisp*, POPL '84, 23–35. · **HIGH**
`PROBLEM` Let a program inspect and modify its own interpreter, coherently.
`STRUCTURE` 3-Lisp's reflective tower: an infinite series of interpreters, each running the one below; reflective procedures execute at the next level up.
`GUARANTEE` Full self-inspection with a defined semantics at every level.
`LOSS` Conceptual and implementation simplicity; the tower is infinite by construction.
`DETECTOR` A reflective act whose level is ambiguous.
`REOPEN` Ascend a level.
`SEAM` S-7
`INTERNAL` Build Contract: "Self-hosting means governance objects can themselves become focal referents using the same grammar."
`DELTA` Names precisely what v2 is committing to. Self-hosting *is* a reflective tower: a Master Key can be the focal referent of a Move governed by a Master Key. Smith's work establishes that this is coherent and that the level structure must be explicit — an act whose level is ambiguous has no defined meaning. v2 has no notion of reflective level, and will need one at BUILD 9.
`TRANSFER` A recursive inspection records the level at which it operates; a governance act on a governance object is at a different level from the same act on a domain object, and conflating them is undefined rather than merely confusing.
`PREREQ` Level indexing on governance operations.
`PRESERVE` `map ≠ mapper`; `referent ≠ map`. The tower is these invariants iterated.
`FALSIFIER` A v2 self-application whose level is genuinely irrelevant to its meaning.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` NONE — a field on the operation.
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R084 — Wand & Friedman 1988 (the mystery of the tower revealed)
`CITE` M. Wand, D. P. Friedman. *The mystery of the tower revealed: A nonreflective description of the reflective tower.* Lisp and Symbolic Computation 1(1), 11–38, 1988. · **HIGH**
`PROBLEM` An infinite tower cannot be implemented literally. How is 3-Lisp actually realizable?
`STRUCTURE` The tower is materialized **lazily** — only the finitely many levels actually touched are constructed; the rest exist only as a specification.
`GUARANTEE` The infinite tower's semantics is realized by a finite machine, with no loss of meaning.
`LOSS` Nothing semantic; only unrealized levels, which by construction were never observed.
`DETECTOR` A computation demanding unboundedly many levels — genuine divergence, not an implementation limit.
`REOPEN` Materialize another level on demand.
`SEAM` S-7
`INTERNAL` "Recursive inspection is lazy. Open recursive inspection only when an encountered condition creates material uncertainty… Do not instantiate conceivable recursive depths merely because they exist conceptually."
`DELTA` **Near-exact external validation of a v2 rule, with a stronger justification than v2 gives.** The Build Contract presents laziness as economy ("do not instantiate merely because they exist"). This record shows laziness is the *only known way to realize the tower at all* — an infinite reflective structure is finitely implementable precisely because it is lazy. v2's rule is therefore not a pragmatic concession but the correct construction, and it should be restated that way.
`TRANSFER` Recursive governance inspection is materialized on demand; unmaterialized levels are well-defined but unrealized, and their absence is not an omission. Divergence — unboundedly deep inspection — is the real failure mode and needs a detector.
`PREREQ` Demand-driven inspection. Already v2's rule; ECB's Demand-Driven Guard is the same principle at the schema layer.
`PRESERVE` The laziness rule; `unknown ≠ nonexistent` (an unmaterialized level is not a nonexistent one).
`FALSIFIER` A v2 governance question requiring unbounded inspection depth to answer. Finding one is valuable: it identifies a genuinely non-terminating governance query.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` NONE
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` VERIFY_EXISTING + ADD_ACCEPTANCE_TEST
`PRIORITY` 2

### R085 — Tarski 1944 (semantic conception of truth)
`CITE` A. Tarski. *The semantic conception of truth and the foundations of semantics.* Philosophy and Phenomenological Research 4(3), 341–376, 1944. (Original: 1933/1936.) · **HIGH**
`PROBLEM` Can a language define its own truth predicate?
`STRUCTURE` **Undefinability of truth**: no sufficiently strong consistent formal language can define its own truth predicate. Truth for a language must be given in a metalanguage.
`GUARANTEE` A hard impossibility result, not a difficulty.
`LOSS` The ambition of a self-contained semantic closure.
`DETECTOR` A self-referential paradox derived from an internal truth predicate.
`REOPEN` Move to a metalanguage — the only route.
`SEAM` S-7, S-6
`INTERNAL` `referent ≠ map`; `map ≠ mapper`; the human rail; "bootstrap trust root."
`DELTA` **Provides the deep reason a frozen invariant is not merely stylistic.** `map ≠ mapper` is the architectural echo of the object-language/metalanguage separation, and Tarski shows collapsing it is not untidy but *inconsistent*. Applied to governance: a system cannot contain its own complete standard of validity. Something must be given from outside — which is exactly what the human rail and the bootstrap trust root are for.
`TRANSFER` Conceptual but load-bearing: v2's validity standard must be anchored outside the governed system. The human rail is a structural requirement, not a UX affordance, and should be documented as such.
`PREREQ` None to state; a formal derivation would require formalizing v2's governance language.
`PRESERVE` `map ≠ mapper`; `referent ≠ map`.
`FALSIFIER` A v2 governance language weak enough to escape the theorem — possible in principle for very restricted languages, and worth knowing if the governance fragment turns out to be that weak.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` AUTHORITY
`COST` NONE
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R086 — Löb 1955
`CITE` M. H. Löb. *Solution of a problem of Leon Henkin.* Journal of Symbolic Logic 20(2), 115–118, 1955. · **HIGH**
`PROBLEM` What can a formal system prove about its own provability?
`STRUCTURE` **Löb's theorem**: if a system proves "if P is provable then P", it already proves P. A corollary of Gödel's second incompleteness theorem: a consistent system cannot prove its own soundness.
`GUARANTEE` A precise limit on self-certification.
`LOSS` The possibility of a self-validating system.
`DETECTOR` A system asserting its own soundness — which signals inconsistency, not confidence.
`REOPEN` Use a stronger external system.
`SEAM` S-6, S-7
`INTERNAL` The governance activation chain: "bootstrap trust root → initial policy activation → human/warrant authority designation → bootstrap exhaustion."
`DELTA` **The formal reason the bootstrap trust root must be external, and a concrete guardrail for BUILD 6.** A governance system cannot warrant its own warrant-granting procedure. Any bootstrap design in which the initial policy authorizes its own activation is not merely circular in a stylistic sense — it is the exact pattern these results rule out. This is directly H11's fourth question ("is the successor improperly being used retroactively to justify its own activation?") stated as a general limit rather than a case check.
`TRANSFER` The bootstrap trust root must be externally warranted (human). No policy may be its own authorization. BUILD 6 must include an explicit check that the activation derivation does not depend on the policy being activated.
`PREREQ` The activation derivation must be inspectable — which R055's derivation form provides.
`PRESERVE` `capability ≠ warrant`; `standing ≠ warrant`.
`FALSIFIER` A bootstrap that is genuinely self-authorizing and sound. On these results, none exists.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` AUTHORITY, STRUCTURAL
`COST` NONE
`RETURN` None.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING + SUPPLIES_TEST
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R087 — Rogers 1967 (second recursion theorem)
`CITE` H. Rogers Jr. *Theory of Recursive Functions and Effective Computability.* McGraw-Hill, 1967 (Kleene's second recursion theorem, §11). · **HIGH**
`PROBLEM` Can a program refer to its own description without infinite regress?
`STRUCTURE` **Kleene's second recursion theorem**: for any computable transformation there is a program that behaves as if given its own index. Self-reference is obtainable *constructively* and finitely.
`GUARANTEE` Self-reference without regress — a positive result, unlike R085–R086.
`LOSS` None.
`DETECTOR` n/a.
`REOPEN` n/a.
`SEAM` S-7
`INTERNAL` Self-hosting: "governance objects can themselves become focal referents using the same grammar."
`DELTA` **The positive counterweight to R085–R086, and the one that makes self-hosting safe to attempt.** Self-*reference* is constructively achievable and finite; it is self-*certification* that is impossible. v2 may therefore build a governance system that refers to and operates on itself, provided it never tries to validate itself. Naming which of the two is impossible prevents an over-correction in which self-hosting is abandoned on Gödelian grounds that do not actually apply to it.
`TRANSFER` Self-hosting is licensed; self-certification is not. Distinguish the two explicitly in BUILD 9's Shape.
`PREREQ` A stable naming/indexing scheme for governance objects — i.e. the universal referent, BUILD 2.
`PRESERVE` `referent ≠ map`; `identity ≠ description`.
`FALSIFIER` A v2 self-application that turns out to require self-certification rather than self-reference; then R086 blocks it.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R088 — Maes 1987 (computational reflection)
`CITE` P. Maes. *Concepts and experiments in computational reflection.* OOPSLA '87, 147–155. · **HIGH**
`PROBLEM` Give an object system a principled way to reason about and adapt its own behavior.
`STRUCTURE` **Reification** (make an implicit aspect an inspectable object) and **reflection** (act on it, changing behavior); a causally connected self-representation.
`GUARANTEE` Causal connection — changes to the self-representation actually change behavior, and vice versa. A self-model that is not causally connected is documentation, not reflection.
`LOSS` The clean separation between program and metaprogram.
`DETECTOR` The self-representation diverges from actual behavior.
`REOPEN` Re-establish causal connection.
`SEAM` S-7, S-2
`INTERNAL` The repository's own governing documents are a self-representation of the system.
`DELTA` **Supplies the sharpest available test for a live risk in v2's actual practice.** Causal connection is the criterion separating a real reflective system from one that merely documents itself. `BUILD_CHECKOUT.md` and the invariants describe the system, but nothing structurally guarantees they *govern* it — the connection is currently maintained by agents reading the files, which is precisely the "agent remembering an instruction" the enforcement invariant forbids. The reification/reflection distinction gives the repair path: a governing document must be reified into something the runtime consults, not merely something a reader honors.
`TRANSFER` Every governing document that must actually govern requires a causal connection to runtime behavior. Documents without one are EVIDENCE or PROJECTION, never GOVERNING — which the repository's own disposition vocabulary already anticipates but does not enforce.
`PREREQ` A runtime that consults governance state. BUILD 5–6.
`PRESERVE` The enforcement invariant, directly.
`FALSIFIER` A GOVERNING document whose content provably cannot be violated by any implementation — then no causal connection is needed because the constraint is vacuous or structural already.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` GOVERNANCE
`RETURN` Yes — divergence between self-model and behavior is returned evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3
