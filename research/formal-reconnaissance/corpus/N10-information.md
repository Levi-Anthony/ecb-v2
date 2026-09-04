DISPOSITION: EVIDENCE · NEIGHBORHOOD N10 · RECORDS R076–R082

# N10 — Information Theory and Controlled Loss

Primary seam: **formalizing allowable loss without inventing unsupported utility functions.**

Neighborhood verdict: **H7 gets a clear, two-part answer.** The probabilistic apparatus —
information bottleneck, rate-distortion — is unusable, because it requires a joint
distribution and a distortion measure that v2 does not have and §12 forbids inventing
(R077, R080). But relevance-sensitive loss *can* be formalized without probability, by two
independent routes: decision-theoretic sufficiency reduced to partition refinement (R081)
and Nair's non-stochastic information (R079). This is the neighborhood where refusing the
obvious analogy produced the better answer.

---

### R076 — Shannon 1948
`CITE` C. E. Shannon. *A mathematical theory of communication.* Bell System Technical Journal 27, 379–423 and 623–656, 1948. · **HIGH**
`PROBLEM` Quantify information transmission over a noisy channel.
`STRUCTURE` Entropy, mutual information, channel capacity, source and channel coding theorems.
`GUARANTEE` Asymptotic, average-case: reliable transmission below capacity, impossible above.
`LOSS` Explicitly semantic content — Shannon states that meaning is irrelevant to the engineering problem.
`DETECTOR` Rate exceeds capacity.
`REOPEN` Reduce rate or improve the channel.
`SEAM` S-5
`INTERNAL` Master Key relevance selection; controlled loss.
`DELTA` **Mostly a guardrail, and an important one.** Shannon's theory is explicitly indifferent to meaning, whereas every loss v2 cares about is a loss of *relevance* or *standing*, which is semantic by definition. Additionally the guarantees are asymptotic and average-case, while governance decisions are single-shot and worst-case. Both mismatches are structural, not incidental.
`TRANSFER` None. Retained to make the mismatch explicit, since "information loss" is exactly the phrase that invites unwarranted import.
`PREREQ` A probability distribution over messages — absent, and §12 forbids inventing one.
`PRESERVE` `truth ≠ relevance`; §12.
`FALSIFIER` A v2 loss question that is genuinely about average-case transmission over a noisy channel. Embedding-space retrieval is the only near-candidate, and see NR-09.
`BRANCH` BRANCH_CONFLICTING (as a semantics of relevance)
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER
`EFFECT` ALREADY_PRESENT
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 1

### R077 — Tishby, Pereira, Bialek 1999 (information bottleneck)
`CITE` N. Tishby, F. C. Pereira, W. Bialek. *The information bottleneck method.* Proc. 37th Allerton Conference on Communication, Control and Computing, 368–377, 1999. arXiv:physics/0004057. · **VERIFIED**
`PROBLEM` Compress X while retaining information about a *relevance variable* Y.
`STRUCTURE` Minimize `I(X;T) − β I(T;Y)` over stochastic maps `p(t|x)`; a self-consistent variational solution.
`GUARANTEE` An optimal relevance-preserving compression at each trade-off level β.
`LOSS` Information about X irrelevant to Y — precisely and quantifiably.
`DETECTOR` `I(T;Y)` falls below requirement.
`REOPEN` Increase β; retain more.
`SEAM` S-5
`INTERNAL` Master Key: "a locally governing discriminator used to bound present relevance for a focal Move."
`DELTA` **The most seductive analogy in the whole corpus, and it fails the §12 chain at the prerequisite step.** The Master Key looks exactly like a relevance variable Y, and IB looks exactly like "keep what matters for the current Move." But IB requires a **joint distribution p(X,Y)** over states and relevance. v2 has no such distribution, no sample from which to estimate one, and no principled way to construct one. Manufacturing it would be precisely the invented probability §12 prohibits. The correct disposition is DEFERRED_PENDING_PREREQUISITES, and this record's value is that it names the missing object exactly rather than gesturing at "we lack data."
`TRANSFER` **None.** The *shape* of the idea — compress subject to preserving a designated relevance — survives, and R081/R079 supply it without probability.
`PREREQ` A joint distribution `p(X,Y)`. Absent and not constructible in good faith.
`PRESERVE` §12's prohibition on inventing probabilities and utilities; `truth ≠ relevance`.
`FALSIFIER` v2 acquires a genuine empirical joint distribution over states and relevance judgments — conceivable at large scale from logged Master-Key decisions, and worth revisiting only then.
`BRANCH` BRANCH_DEPENDENT (on a prerequisite that does not exist)
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` METAPHOR_ONLY / DEFERRED_PENDING_PREREQUISITES
`EFFECT` CHALLENGES_EXISTING (challenges the analogy)
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 2

### R078 — Fisher 1922 (sufficient statistics)
`CITE` R. A. Fisher. *On the mathematical foundations of theoretical statistics.* Philosophical Transactions of the Royal Society A 222, 309–368, 1922. · **HIGH**
`PROBLEM` When does a summary of the data lose nothing relevant to the question asked?
`STRUCTURE` A statistic `T(X)` is **sufficient** for a parameter when the conditional distribution of X given T does not depend on the parameter — the summary carries everything relevant.
`GUARANTEE` No inference about the parameter is degraded by replacing the data with T.
`LOSS` Everything about X not relevant to that parameter.
`DETECTOR` Two datasets with equal T supporting different inferences about the parameter.
`REOPEN` Use a finer statistic.
`SEAM` S-5
`INTERNAL` ∼(M,O); Master Key collapse.
`DELTA` **The concept H7 actually wants, though not in its probabilistic form.** "Lose only what is irrelevant to the current question" is exactly sufficiency. The classical definition is probabilistic and therefore blocked like R077 — but the *decision-theoretic* reading is not: a summary is sufficient for a decision problem iff every optimal decision factors through it. That reading needs a decision function, not a distribution, and v2 has decision functions (`Permitted_O`). Sufficiency in that sense collapses to R031's kernel condition.
`TRANSFER` Define "the Master Key's summary loses nothing relevant to O" as: `Permitted_O` factors through the summary — i.e. the summary refines `ker(Permitted_O)`. No probability required.
`PREREQ` `Permitted_O` as a function (the FP-003 check).
`PRESERVE` `truth ≠ relevance`; sufficiency is always relative to the question.
`FALSIFIER` As FP-003: if `Permitted_O` is not a function, factorization is undefined.
`BRANCH` BRANCH_NEUTRAL (in the factorization reading)
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R079 — Nair 2013 (non-stochastic information theory)
`CITE` G. N. Nair. *A nonstochastic information theory for communication and state estimation.* IEEE Transactions on Automatic Control 58(6), 1497–1510, 2013. arXiv:1112.3471. · **VERIFIED**
`PROBLEM` Construct analogues of independence, Markovness, entropy and information **without a probability space**.
`STRUCTURE` **Uncertain variables** — set-valued, not distributed — with a `maximin information` functional built from overlap-connectedness of conditional ranges. Its rate through a channel coincides with the **zero-error** capacity.
`GUARANTEE` Tight, worst-case (not average-case) conditions for uniformly estimating state over error-prone channels.
`LOSS` Distinctions that no admissible realization can separate — a set-theoretic, not statistical, notion of loss.
`DETECTOR` Two states whose uncertainty sets overlap-connect: they are not distinguishable with certainty.
`REOPEN` Refine the uncertainty sets, i.e. get better observations.
`SEAM` S-5, S-3
`INTERNAL` `unknown ≠ nonexistent`; robust-action soundness (worst-case, not expected-case).
`DELTA` **This is the mature framework H7 asks for and the strongest positive result in the neighborhood.** It supplies genuine information-theoretic concepts — entropy analogue, information analogue, independence — that require **no probability, no utility, and no distortion measure**, and it is worst-case rather than average-case, which matches governance exactly: v2 needs "no admissible state licenses this violation", not "violation is improbable". The zero-error connection is the conceptual point: guaranteed correctness, not high-probability correctness, is the right target for authority decisions.
`TRANSFER` Where v2 needs to quantify how much a collapse costs, use set-valued uncertain variables and maximin information rather than entropy or mutual information. Distinguishability is overlap-separation of uncertainty sets, matching FS-0001's γ(a) framing directly.
`PREREQ` Set-valued uncertainty (ranges of possible states) — which is exactly what γ(a) already is in FS-0001. **The prerequisite is already met**, unusually for this neighborhood.
`PRESERVE` §12; `unknown ≠ nonexistent`; worst-case posture.
`FALSIFIER` v2's governance uncertainty is not naturally set-valued but genuinely graded, so a set-valued treatment discards real structure. Confidence scores would be the test case — and `confidence ≠ standing` says confidence must not drive standing anyway, which cuts the other way.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` NONE
`RETURN` Yes — return-path distinguishability is a maximin-information question, linking to R063's observability partition.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R080 — Shannon 1959 (rate-distortion)
`CITE` C. E. Shannon. *Coding theorems for a discrete source with a fidelity criterion.* IRE National Convention Record 7(4), 142–163, 1959. · **HIGH**
`PROBLEM` How much can a source be compressed subject to a bounded distortion?
`STRUCTURE` The rate-distortion function `R(D)` — minimum rate achieving expected distortion ≤ D.
`GUARANTEE` Optimal rate/fidelity trade-off, asymptotically.
`LOSS` Bounded by D under the chosen **distortion measure**.
`DETECTOR` Distortion exceeds D.
`REOPEN` Increase rate.
`SEAM` S-5
`INTERNAL` Controlled loss; aperture.
`DELTA` Fails the §12 chain at two independent points: it needs a source distribution *and* a distortion measure `d(x, x̂)` saying how bad each substitution is. v2 has neither, and constructing a distortion measure over governance states would be inventing a utility function — explicitly forbidden. Recorded because "acceptable loss" language makes rate-distortion sound applicable, and it is not.
`TRANSFER` None.
`PREREQ` Source distribution and distortion measure. Both absent; both forbidden to invent.
`PRESERVE` §12.
`FALSIFIER` A v2 seam with a genuinely earned distortion measure — none identified.
`BRANCH` BRANCH_DEPENDENT (prerequisites absent)
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` METAPHOR_ONLY
`EFFECT` ALREADY_PRESENT
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 0

### R081 — Blackwell 1953 (comparison of experiments)
`CITE` D. Blackwell. *Equivalent comparisons of experiments.* Annals of Mathematical Statistics 24(2), 265–272, 1953. · **HIGH**
`PROBLEM` When is one information structure better than another, for *every* decision problem?
`STRUCTURE` Experiment A is **sufficient for** (more informative than) B iff B is a garbling of A iff A is at least as good as B in every decision problem. Three equivalent characterizations.
`GUARANTEE` A partial order on information structures that is decision-theoretically canonical — it does not depend on which decision problem you happen to care about.
`LOSS` Whatever the garbling destroys.
`DETECTOR` A decision problem where B outperforms A — proof that A is not sufficient for B.
`REOPEN` Use the finer experiment.
`SEAM` S-5, S-1
`INTERNAL` AP-10: "meaningful partial orders and soundness relations have not been derived from observed behavior."
`DELTA` **This is the most consequential finding in the neighborhood and possibly the operation, and it is routed to governance rather than adopted.** Blackwell's theorem in its classical form needs probability, so it is blocked — but its *deterministic specialization* is not. For deterministic decision rules, "A is more informative than B" reduces to **partition refinement**: A's induced partition refines B's. And v2 already has such partitions for free — R031 shows `ker(Permitted_O)` is an equivalence relation, hence a partition, at zero cost. Partitions of a set form a complete lattice under refinement. **Therefore a meaningful, behavior-derived partial order on abstractions already exists and requires nothing to be invented.** AP-10 states this prerequisite is missing; on this evidence it may already be satisfied. That has direct consequences for the Galois freeze line, which is why it goes to governance as ACP-02 and is not acted on here.
`TRANSFER` Order abstractions by refinement of their induced `ker(Permitted_O)` partitions; "a1 is at least as good as a2 for O" is partition refinement, requiring no probability, metric, or utility.
`PREREQ` `Permitted_O` a function (FP-003). Nothing else.
`PRESERVE` The Build Contract freeze line on Galois formulations — **this reconnaissance may not lift it.** §12's prohibition on inventing orders is respected: this order is *derived*, not invented, which is exactly the distinction AP-10 draws.
`FALSIFIER` FP-003 fails, or the refinement order turns out too sparse to compare the abstractions v2 actually uses (most pairs incomparable), making it true but useless.
`BRANCH` **BRANCH_FORCING** — adopting it would force engagement with the frozen Galois question.
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` None directly.
`STATUS` ARCHITECTURE_CHALLENGE (routed to ACP-02)
`EFFECT` CHANGE_PROPOSAL_REQUIRED
`BUILD` ARCHITECTURE_CHALLENGE
`PRIORITY` 3

### R082 — Körner & Orlitsky 1998 (zero-error information theory)
`CITE` J. Körner, A. Orlitsky. *Zero-error information theory.* IEEE Transactions on Information Theory 44(6), 2207–2229, 1998. · **HIGH**
`PROBLEM` Communication with **zero** probability of error, rather than vanishing error.
`STRUCTURE` Combinatorial rather than probabilistic: confusability graphs, graph capacity; famously harder than the average-case theory.
`GUARANTEE` Guaranteed correctness, never merely likely correctness.
`LOSS` Rate — zero-error capacity is typically much lower than Shannon capacity.
`DETECTOR` Two inputs confusable at the output — an edge in the confusability graph.
`REOPEN` Use a larger alphabet or fewer messages.
`SEAM` S-5, S-3
`INTERNAL` Robust-action soundness (worst case); `unknown ≠ nonexistent`.
`DELTA` Supplies the conceptual frame and the honest price. v2's posture is inherently zero-error — an envelope must be legitimate for *every* state it represents, not for most — and this literature says that posture is principled but **expensive**: the guaranteed-correct rate is far below the average-case rate, and zero-error problems are often computationally harder. So the conservatism R066 warns about is not an implementation defect; it is the intrinsic cost of the guarantee v2 has chosen. Worth knowing before someone tries to "optimize" it away.
`TRANSFER` Conceptual: v2's guarantees are zero-error guarantees, and their conservatism is inherent rather than a defect to be tuned out. The confusability graph is the natural structure for "which governance states the return path cannot tell apart" — linking to R063 and R079.
`PREREQ` A confusability relation over observations — derivable from receipts once they exist.
`PRESERVE` Robust-action soundness; `unknown ≠ nonexistent`.
`FALSIFIER` v2 accepts probabilistic guarantees somewhere consequential; that would be a real architectural choice needing its own warrant, not a tuning decision.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC
`COST` NONE
`RETURN` Yes.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2
