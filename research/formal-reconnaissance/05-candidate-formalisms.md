STATUS: COMPLETE — NONE PROMOTED
DISPOSITION: EVIDENCE
ROLE: Output E — Candidate Formalism Registry
AUTHORITY: None

# Candidate Formalism Registry

> **Plain-English note.** Fourteen precise statements worth keeping, written in mathematical
> notation because that is what makes them precise enough to be checked or disproved.
>
> **You do not need to read this.** It is the formal backing for claims already made in plain
> English elsewhere. Every symbol used is decoded in [`GLOSSARY.md`](GLOSSARY.md).

Formal properties worth retaining, expressed precisely enough to be argued with. Each
carries its source, proposed interpretation, prerequisites, falsifier, standing and build
effect. **A formalism appearing here is a candidate, not a commitment.**

---

### CF-01 — Adequacy of an abstraction for an operation
**Source** R031, R008, R078 · **Transfer** TC-005

    x ∼(M,O) y  ⟺  Permitted_O(x) = Permitted_O(y)
    a is ADEQUATE for O  ⟺  γ(a) ⊆ [c]∼(M,O)  for some c

**Interpretation** The Master Key's collapse is safe for a Move exactly when every state the
abstraction still admits licenses the same actions. FS-0001's TG-02 fires on the negation.
**Prerequisites** `Permitted_O` is a function. Nothing else — no metric, order, or probability.
**Falsifier** FP-003: `Permitted_O` is not a function.
**Standing** Strong candidate. Zero primitive cost.
**Build effect** SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST

### CF-02 — Robust-action soundness with a coverage obligation
**Source** R070, R001, FS-0001 · **Transfer** TC-005, TC-015

    Permitted_O(a) ⊆ ⋂_{c ∈ γ(a)} Permitted_O(c)
    AND  γ(a) ⊇ { c : c is still possible }        ← the added obligation

**Interpretation** FS-0001's existing condition, plus the min-max robustness caveat it omits:
the intersection is only meaningful if γ(a) actually covers the possible states. **If γ
under-approximates the uncertainty, the envelope is unsound while appearing rigorous.**
**Prerequisites** A defensible account of what remains possible — the honest difficulty.
**Falsifier** An abstraction whose concretization provably covers all possible states; achievable only for finite fully-enumerated domains.
**Standing** Strong candidate; the coverage half is the new content.
**Build effect** ADD_ACCEPTANCE_TEST

### CF-03 — Refinement order on abstractions, derived not invented
**Source** R081, R031 · **Routed to ACP-02**

    a₁ ⊑ a₂  ⟺  ker(Permitted_O)|γ(a₁)  refines  ker(Permitted_O)|γ(a₂)

**Interpretation** Blackwell's decision-theoretic ordering, specialized to deterministic
decision rules, reduces to **partition refinement**. Partitions of a set form a complete
lattice. So a behavior-derived partial order on abstractions is available **at zero cost**,
which bears directly on AP-10's statement that "meaningful partial orders … have not been
derived from observed behavior."
**Prerequisites** `Permitted_O` a function (FP-003). Nothing else.
**Falsifier** FP-003 fails; or the order is so sparse that the abstractions v2 actually uses are pairwise incomparable — true but useless.
**Standing** **BRANCH_FORCING. Not promotable here.** The Build Contract freezes Galois
formulations, and a preorder plus monotone maps is most of what a Galois connection needs
(R075). Routed to governance as ACP-02. **This reconnaissance has no authority to lift a freeze**, and the fact that a prerequisite may already be met is a finding for the human rail, not a licence to proceed.
**Build effect** ARCHITECTURE_CHALLENGE

### CF-04 — Idempotence belongs to the closure operator, not the compiler
**Source** R002 · **Answers H3**

    α : X → A        is NOT idempotent — α∘α is ill-typed
    ρ = γ∘α : X → X  IS idempotent, monotone, extensive — by construction
    ρ∘ρ = ρ

**Interpretation** H3 asks whether `P(P(x)) = P(x)` has meaningful operational standing. It
does — as a **theorem about the closure operator** ρ = γ∘α, never as an assumption about α.
FS-0001 was right to reject imposing P²=P on the compiler and could only state the negation;
this supplies the positive home. Semantic normalization stability (TG-03) is then the
special case, requiring no separate axiom.
**Prerequisites** The frozen orders, plus an earned γ making ρ type-correct — precisely the embedding FS-0001 says is unavailable.
**Falsifier** A legitimate projection where γ∘α is not extensive — the abstraction claiming *more* than the source state.
**Standing** Correct but **BRANCH_DEPENDENT** on frozen prerequisites. Retained as the answer to H3, not as machinery.
**Build effect** SHARPEN_CONTRACT

### CF-05 — Enforceability boundary
**Source** R094, R013, R096 · **Transfer** TC-001, TC-002

    EM-enforceable          = safety properties exactly
    monitorable             ⊋ safety ∪ co-safety
    liveness                ⇒ no finite violating prefix ⇒ not EM-enforceable
    every property          = safety ∧ liveness

**Interpretation** The missing axis on v2's enforcement classification. It states not where
enforcement happens but what each surface *can* bear. Note the two distinct limits: safety
bounds what can be **enforced**; monitorability bounds what can be **detected**. v2 currently
conflates both under OBSERVATIONAL.
**Prerequisites** Obligations as trace properties.
**Falsifier** A non-safety v2 obligation genuinely enforced by a runtime monitor.
**Standing** Strong candidate. The operation's highest-leverage formal content.
**Build effect** SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST

### CF-06 — Satisfaction condition as projection correctness
**Source** R071 · **Transfer** TC-009 · **Answers H4**

    M' ⊨ σ(φ)  ⟺  M'|σ ⊨ φ

**Interpretation** An ECOS state satisfies the projected invariant iff its SIGMA reduct
satisfies the source invariant. Failure of the "iff" is the semantic-corruption detector H4
hypothesizes. Requires only a signature morphism with a reduct — **much less than functoriality**.
**Prerequisites** SIGMA sentence form; ECOS model notion; a reduct.
**Falsifier** A SIGMA invariant with no ECOS reduct — its truth not determined by runtime state.
**Standing** Strong candidate; the best answer to H4 found.
**Build effect** SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST

### CF-07 — Non-prioritized revision postulates for qualification
**Source** R049, R050, R046 · **Transfer** TC-007 · **Answers H14**

    AGM Success:  A ∈ K * A                    ← REJECTED; contradicts `current ≠ newest`
    Semi-revision: consolidation may discard the input itself
    Credibility-limited: A ∉ credible ⇒ K * A = K   (reject without change)

**Interpretation** H14 asks whether belief revision can sharpen qualification "without
assuming newest evidence = governing truth." The answer is yes — and the assumption has a
name, the Success postulate, which non-prioritized revision drops by design.
**Prerequisites** A belief **base** rather than a closed theory. v2 has exactly this.
**Falsifier** A qualification outcome violating a semi-revision postulate for a good reason.
**Standing** Strong candidate. v2 independently reinvented this (ECB Charter intake lane).
**Build effect** SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST

### CF-08 — Non-stochastic uncertainty and distinguishability
**Source** R079, R082 · **Answers H7**

    Uncertain variables are SET-VALUED, not distributed.
    Distinguishable ⟺ conditional ranges are not overlap-connected.
    Maximin information rate = zero-error capacity.

**Interpretation** H7 asks whether relevance-sensitive loss can be formalized without
inventing probability, utility or distortion functions. **Yes** — via set-valued uncertainty,
which is exactly what γ(a) already is, and which gives worst-case rather than average-case
guarantees, matching governance. The probabilistic route (information bottleneck,
rate-distortion) fails at prerequisites and is recorded in NR-04 and NR-05.
**Prerequisites** Set-valued uncertainty. **Already present** in FS-0001's γ(a).
**Falsifier** v2 governance uncertainty is genuinely graded rather than set-valued. But `confidence ≠ standing` cuts against that reading.
**Standing** Strong candidate; the only positive result in N10.
**Build effect** SHARPEN_CONTRACT

### CF-09 — Recursive feasibility of local closure
**Source** R065, R068 · **Transfer** TC-015

    Close(M) is SOUND  ⟺  after Close(M), Trigger(Aperture) remains satisfiable
    LawfulContinuationSet = { s : every open aperture reopenable
                                  ∧ every active obligation dischargeable from s }

**Interpretation** The soundness condition the Master Key / Aperture / Revalidation triad
lacks. Without it an aperture can be recorded, triggerable in principle, and unreopenable in
fact.
**Prerequisites** Reopening conditions concrete enough to check. Several current aperture TRIGGER fields are not — itself the finding. Exact computation of the continuation set is infeasible; conservative under-approximation is the recommended target.
**Falsifier** A closure that destroys its own reopening condition and is nonetheless correct — meaning the trigger was never real.
**Standing** Strong candidate for the feasibility check; the continuation set is BLOCK_PENDING_PROBE.
**Build effect** ADD_ACCEPTANCE_TEST

### CF-10 — Observability partition of the invariant set
**Source** R063, R071 · **Transfer** TC-016

    I is RETURN-OBSERVABLE  ⟺  ∃ receipt trajectories distinguishing
                                a violating from a non-violating history
    I not observable ⇒ no evidence-driven revalidation trigger can ever fire

**Interpretation** A structural limit, not a limitation of the observer. Partitions v2's
eighteen invariants into those runtime evidence can revalidate and those that can only be
re-authorized. Convergent with CF-06's falsifier from an independent neighborhood.
**Prerequisites** A defined receipt alphabet.
**Falsifier** An invariant classified unobservable that a richer receipt makes observable — a good outcome: add the sensor.
**Standing** Strong candidate; the classification pass is cheap and immediately clarifying.
**Build effect** SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST

### CF-11 — Widening and narrowing as forced closure and recovery
**Source** R003 · **Transfer** TC-017

    ∇ : forced convergence with recorded precision loss
    ∆ : recovery of precision after convergence

**Interpretation** A Master Key's forced local closure under time pressure is a widening
step; an Aperture without a narrowing route is an **unsound** widening. Importantly this
technique works *without* a Galois connection, so it is not blocked by the freeze line as
CF-03 and CF-04 are.
**Prerequisites** An order only on the abstraction being widened — weaker than a full Galois connection.
**Falsifier** A closure whose information is destroyed rather than deferred; that is truncation, not widening, and the analogy fails.
**Standing** Candidate. Weaker prerequisites than the rest of the abstract-interpretation family.
**Build effect** SHARPEN_CONTRACT

### CF-12 — Rely/guarantee form for projected obligations
**Source** R019, R014 · **Transfer** TC-010

    ECOS guarantees G  PROVIDED the environment maintains R
    Unnamed R ⇒ G is formally unconditional ⇒ G is false

**Interpretation** Every ECOS guarantee is implicitly conditional on environment behavior —
the human rail responding, no surface mutating state behind the runtime, the store not
losing rows. v2 names no rely conditions anywhere, so its guarantees are formally
unconditional and therefore false. Naming them is cheap and converts silent assumptions into
inspectable ones. Same gap that R014 finds from the fairness side.
**Prerequisites** An explicit environment model, even informal.
**Falsifier** A guarantee genuinely independent of every environment assumption. BUILD 0's structural constraints come close; nothing above Layer A will.
**Standing** Strong candidate; very low cost.
**Build effect** SHARPEN_CONTRACT

### CF-13 — Congruence obligation before compositional substitution
**Source** R035 · **Transfer** TC-005

    ∼(M,O) is an equivalence BY CONSTRUCTION (kernel of a function).
    ∼(M,O) is NOT automatically a CONGRUENCE.
    Substitution inside a composite is licensed only if it is.

**Interpretation** Two states may license identical actions in isolation and different
actions once embedded in a larger governance context. v2 intends to compose governance
objects at BUILD 9–10, so this obligation binds there. Finding a counterexample is *success*:
it proves the obligation is live rather than theoretical.
**Prerequisites** Named composition operators over governance objects.
**Falsifier** No governance context distinguishes states with equal `Permitted_O`.
**Standing** Candidate; binds at BUILD 9.
**Build effect** ADD_ACCEPTANCE_TEST

### CF-14 — Self-reference is licensed; self-certification is not
**Source** R087, R086, R085, R084 · **Transfer** TC-013

    Kleene 2nd recursion theorem : self-REFERENCE is constructive and finite     ✓
    Gödel 2 / Löb               : self-CERTIFICATION is impossible               ✗
    Wand & Friedman             : the tower is finitely realizable BECAUSE lazy  ✓

**Interpretation** Three results that jointly license BUILD 9 and bound it. Self-hosting is
safe to attempt; a bootstrap that authorizes its own activation is not, and that is H11's
fourth question stated as a general limit. The laziness rule in the Build Contract is not a
pragmatic concession — it is the known way to realize a reflective tower at all, and should
be restated that way.
**Prerequisites** Stable naming of governance objects (BUILD 2); inspectable activation derivations (TC-019).
**Falsifier** A self-application requiring self-certification rather than self-reference; then Löb blocks it.
**Standing** Strong candidate as a guardrail; prevents both an unsound bootstrap and an over-correction that abandons self-hosting on Gödelian grounds that do not apply to it.
**Build effect** ADD_ACCEPTANCE_TEST
