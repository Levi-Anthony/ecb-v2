STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: Output F — Negative Results Registry
AUTHORITY: None as answers; authoritative as a record that these analogies were inspected and did not survive

# Negative Results Registry

**Negative findings count as successful research.** Each entry records the original
intuition, the native definition, the prerequisites that definition actually requires, the
prerequisite v2 lacks, the falsifying evidence, and a disposition.

Twelve attractive analogies were inspected and rejected or deferred. Several were rejected
*despite* being the most intuitively compelling framings available — which is the point.

| ID | Analogy | Disposition |
|---|---|---|
| NR-01 | Galois connection as the projection algebra | DEFER |
| NR-02 | SIGMA↔ECOS as a well-behaved lens | DISCARD / BRANCH_CONFLICT |
| NR-03 | Classical AGM revision for the return path | BRANCH_CONFLICT |
| NR-04 | Information bottleneck as Master Key relevance | DEFER |
| NR-05 | Rate-distortion as controlled loss | DISCARD |
| NR-06 | ECOS as a category; projection as a functor | DEFER |
| NR-07 | Conformal geometry / angle preservation | METAPHOR_ONLY |
| NR-08 | Embedding cosine similarity as a meaning metric | BRANCH_CONFLICT |
| NR-09 | Shannon information as a semantics of relevance | DISCARD |
| NR-10 | Conant–Ashby as justification for the self-model | NO_BUILD_VALUE |
| NR-11 | Beer's Viable System Model as architecture | METAPHOR_ONLY |
| NR-12 | CRDT convergence for standing | BRANCH_CONFLICT |

---

### NR-01 — Galois connection as the projection algebra
**Original intuition** SIGMA→ECOS is abstraction, ECOS→SIGMA is concretization; therefore (α, γ) form a Galois connection and the whole apparatus of abstract interpretation applies.
**Native definition** Monotone maps α : C → A and γ : A → C between partially ordered sets with `α(c) ⊑ a ⟺ c ⊑ γ(a)`.
**Native prerequisites** Two partial orders and two monotone maps.
**Missing prerequisite** v2 has declared no order on either governance states or permitted-action sets. AP-10 records exactly this. **Note the complication:** CF-03 argues a derived partial order may already be available at zero cost via partition refinement — so the prerequisite may be *closer to met* than AP-10 assumes.
**Falsifying / blocking evidence** The Build Contract freeze line explicitly freezes "Galois formulations" and "full projection mathematics". **This reconnaissance has no authority to lift a freeze**, regardless of how available the prerequisite turns out to be.
**Disposition** **DEFER.** Routed to governance as ACP-02. The CEGAR *loop* (TC-017) and widening/narrowing (CF-11) are adoptable without it, which is why the neighborhood still produced usable results.

### NR-02 — SIGMA↔ECOS as a well-behaved lens
**Original intuition** Projection is `get`, evidence return is `put`; the lens laws give round-trip correctness for free.
**Native definition** `get : S → V`, `put : V × S → S` with **GetPut** `put(get(s), s) = s` and **PutGet** `get(put(v, s)) = v`.
**Native prerequisites** `put` is total and its effect is fully readable back through `get` — i.e. **the update is unconditionally accepted**.
**Missing prerequisite** v2 forbids unconditional acceptance. Returned evidence must be qualified, may be rejected, may be accepted in part, and may leave standing unchanged.
**Falsifying evidence** PutGet is precisely the law `current ≠ newest` and mandatory qualification forbid. R029 documents an industrial community that adopted bidirectionality as a framing, then found its obligations unmet and its tools divergent — the exact failure mode this operation exists to prevent.
**Disposition** **DISCARD as a law set; BRANCH_CONFLICT.** Replaced by TC-006 (consistency relation + restoration maintainer), which accommodates partial, non-unique, policy-selected restoration and requires only stability. **Also a vocabulary prohibition: do not describe the cycle as "bidirectional" in v2 documents**, because the word imports a totality commitment the architecture rejects.

### NR-03 — Classical AGM revision for the return path
**Original intuition** Returned evidence revises SIGMA's beliefs; AGM is the mature theory of belief revision; adopt it.
**Native definition** Expansion, contraction, revision satisfying the AGM postulates, including **Success**: `A ∈ K * A`.
**Native prerequisites** (i) Success — the input is always accepted; (ii) a deductively closed belief set with a consequence operator; (iii) for the entrenchment representation, a **total** preorder over beliefs.
**Missing prerequisites** All three. (i) contradicts `current ≠ newest` and the qualification requirement; (ii) v2's claims are typed records, not a closed theory; (iii) v2's standing is explicitly multi-dimensional and non-collapsible under AP-01, so a total entrenchment order would collapse exactly the separation AP-01 protects.
**Falsifying evidence** Three independent barriers, any one sufficient.
**Disposition** **BRANCH_CONFLICT.** Replaced by TC-007: semi-revision and credibility-limited revision drop Success by design and work over belief *bases*, which is what v2 has. The rejection is precise and useful: it names the single axiom that must not be adopted.

### NR-04 — Information bottleneck as Master Key relevance
**Original intuition** The Master Key is a relevance variable Y; bounded local closure is compression of X preserving information about Y; IB gives the optimal trade-off.
**Native definition** Minimize `I(X;T) − β I(T;Y)` over stochastic maps `p(t|x)`.
**Native prerequisites** A **joint probability distribution** `p(X,Y)` over states and relevance.
**Missing prerequisite** v2 has no such distribution, no sample from which to estimate one, and no principled route to constructing one.
**Falsifying evidence** §12 explicitly forbids rescuing an analogy by inventing probabilities. Constructing `p(X,Y)` would be exactly that.
**Disposition** **DEFER (DEFERRED_PENDING_PREREQUISITES).** The most seductive analogy in the corpus. Its *shape* — compress subject to preserving designated relevance — survives and is supplied without probability by CF-01 (kernel sufficiency) and CF-08 (non-stochastic information). Revisit only if v2 ever acquires a genuine empirical distribution over logged Master-Key decisions.

### NR-05 — Rate-distortion as controlled loss
**Original intuition** Apertures permit bounded loss; `R(D)` is the theory of bounded loss; use it.
**Native definition** Minimum rate achieving expected distortion ≤ D under a distortion measure `d(x, x̂)`.
**Native prerequisites** A source distribution **and** a distortion measure.
**Missing prerequisites** Both. A distortion measure over governance states says how bad each substitution is — that is a **utility function**.
**Falsifying evidence** §12 forbids inventing utilities. Two independent missing prerequisites, neither constructible in good faith.
**Disposition** **DISCARD.** Recorded because "acceptable loss" language makes rate-distortion sound applicable when it is not.

### NR-06 — ECOS as a category; projection as a functor
**Original intuition** Governance objects are objects, transformations are morphisms, projection is a functor, and commuting diagrams give preservation.
**Native definition** A category needs objects, morphisms, identities and associative composition; a functor must preserve composition: `F(g∘f) = F(g)∘F(f)`.
**Native prerequisites** Identified **morphisms** — structure-preserving maps between governance objects — and a composition operation with identities.
**Missing prerequisite** v2 has objects in abundance and has defined **no morphisms**. There is no notion of a structure-preserving map between governance objects, and no established composition.
**Falsifying evidence** Goguen's own criterion (R074) is that morphisms must be identified before the categorical framing means anything. Under the manifesto's own test, ECOS is not yet a category.
**Disposition** **DEFER; BRANCH_FORCING.** Adopting it would force closure on the compositional structure of governance objects, which is open. Replaced by TC-009: institution theory needs only a signature morphism with a reduct, not a category of governance objects — a strictly weaker and satisfiable requirement.

### NR-07 — Conformal geometry / angle preservation
**Original intuition** A good projection preserves local structure the way a conformal map preserves angles; "shape is preserved even as scale changes."
**Native definition** A map preserving angles and orientation locally; conformal invariants (extremal length, modulus, capacity) are unchanged by such maps.
**Native prerequisites** A metric, or at minimum an inner product on tangent spaces — a Riemannian or complex-analytic structure.
**Missing prerequisites** No metric on constitutive meaning, no tangent structure, no differentiable manifold of governance states, no principled route to any.
**Falsifying evidence** The §12 chain breaks at NATIVE PREREQUISITES and cannot be repaired without inventing the forbidden metric. FS-0001 had already classified this as requiring "an operationally meaningful metric"; this operation confirms none exists.
**Disposition** **METAPHOR_ONLY.** "Angle-preserving" applied to SIGMA→ECOS is a figure of speech about proportion, not a mathematical claim. H5 answered: **METAPHOR_ONLY / DEFER**, as the hypothesis itself anticipated.

### NR-08 — Embedding cosine similarity as a meaning metric
**Original intuition** v2 *does* have a metric — the 384-dimensional `gte-small` space with cosine similarity, which measured 0.919 in Golden Trace 01. Use it to ground the geometric analogies.
**Native definition** Cosine similarity on embedding vectors, earned from a *retrieval* objective.
**Native prerequisites** For the intended use — grounding meaning geometry — the metric must be on **meaning**, not on a learned representation of text.
**Missing prerequisite** The embedding is a **map** of the thought, not the referent. Similarity is a retrieval affordance, not a semantic distance and not a standing.
**Falsifying evidence** Using it as a meaning metric would violate `map ≠ referent`, `confidence ≠ standing`, `relevance ≠ authority`, and `truth ≠ relevance` — four frozen invariants.
**Disposition** **BRANCH_CONFLICT, with an added prohibition.** This is the one place a real metric exists, hence the one place the geometric analogies could be smuggled back in. Embedding geometry may rank retrieval candidates; it may **never** determine standing, relevance-as-authority, or any governance conclusion. R093 proposes an acceptance test asserting exactly this.

### NR-09 — Shannon information as a semantics of relevance
**Original intuition** Master Key relevance selection is information selection; Shannon's theory is the theory of information; apply it.
**Native definition** Entropy and mutual information over a probability distribution on messages; capacity theorems are asymptotic and average-case.
**Native prerequisites** A probability distribution over messages; many uses of the channel.
**Missing prerequisites** Both, plus a deeper mismatch: Shannon's theory is explicitly **indifferent to meaning**, whereas every loss v2 cares about is a loss of relevance or standing, which is semantic by definition. Governance decisions are also single-shot and worst-case, not asymptotic and average-case.
**Falsifying evidence** Two structural mismatches (semantic indifference; average vs. worst case), not merely a missing input.
**Disposition** **DISCARD.** Recorded because "information loss" is exactly the phrase that invites the unwarranted import. CF-08 supplies the worst-case, non-probabilistic replacement.

### NR-10 — Conant–Ashby as justification for the self-model
**Original intuition** "Every good regulator of a system must be a model of that system" proves v2's self-representation is necessary.
**Native definition** A theorem that an **optimal, error-free** regulator is a homomorphic image of the regulated system, under a specific error measure.
**Native prerequisites** Optimality, determinism, and the specific error criterion.
**Missing prerequisites** v2 governance is neither optimal nor deterministic in the required sense.
**Falsifying evidence** The theorem is far narrower than the slogan it is usually quoted as. Citing it would be promoting analogy into formal equivalence, which §21 prohibits.
**Disposition** **NO_BUILD_VALUE as a justification.** The genuine argument for a causally-connected self-model is Maes's reification/reflection criterion (R088), which needs no optimality assumption. Use that instead. Ashby's **requisite variety** (R089) is a separate, genuinely usable result and is *not* rejected — see TC-listing note in `11-synthesis-matrix.md`.

### NR-11 — Beer's Viable System Model as architecture
**Original intuition** VSM's five recursively nested systems match ECOS's recursive self-hosting; adopt the structure.
**Native definition** A diagnostic organizational framework: operations, coordination, control, intelligence, policy, recursively nested.
**Native prerequisites** None formal — VSM generates no proof obligations.
**Missing prerequisite** A falsifier. VSM produces no failure detector and no testable consequence.
**Falsifying evidence** Under §12, a framework with no testable consequence is `METAPHOR_ONLY` by construction.
**Disposition** **METAPHOR_ONLY.** Recorded explicitly because the ECB Charter already uses holarchic vocabulary, so the temptation to promote it to architecture is live rather than hypothetical. VSM may serve as descriptive vocabulary; it may not generate an invariant, a test, or a structure.

### NR-12 — CRDT convergence for standing
**Original intuition** ECB spans surfaces and must propagate; CRDTs give convergence without coordination; use them throughout.
**Native definition** Join-semilattice state with monotone updates and LUB merge, or commutative concurrent operations; yields Strong Eventual Consistency.
**Native prerequisites** Conflict resolution must be **automatic and semantic-free** — a deterministic merge rule applied without adjudication.
**Missing prerequisite** v2 requires qualification before any standing change. Automatic merge is "return is overwrite" by another name, and last-writer-wins is a direct violation of `current ≠ newest`.
**Falsifying evidence** The convergence guarantee is purchased precisely by removing adjudication — the thing v2 must keep.
**Disposition** **BRANCH_CONFLICT for standing; retained below it.** TC-018 draws the boundary: CRDT convergence is correct and valuable for replicating append-only **evidence** records, where set-union semantics cannot lose data. It must never be applied to standing, warrant, or designation.

---

## Vocabulary hazards

Two terms that would corrupt frozen invariants by lexical drift if imported unexamined:

**"Capability."** In the object-capability literature (R060, R061) a capability **is** the
authorization. In `docs/invariants.md`, `capability ≠ warrant or authorization`. Both usages
are internally coherent; importing the first would silently invert a frozen invariant. The
substantive transfer survives the collision (action envelopes should carry designation and
permission together) — but the word must not.

**"Bidirectional."** Per NR-02, the word imports a totality commitment v2 rejects, and
R030 shows it names at least four inequivalent law sets, so it would be uninformative even
if one fitted. Use "projection with evidence-bearing return and separate qualification",
which is H8's own alternative and is what the architecture actually is.
