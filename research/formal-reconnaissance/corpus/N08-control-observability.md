DISPOSITION: EVIDENCE · NEIGHBORHOOD N08 · RECORDS R063–R070

# N08 — Control, Observability, Receding Horizon

Primary seam: **S-5 — bounded action under incomplete models and reopening under changed evidence.**

Neighborhood verdict: two results of real force. Observability (R063) partitions v2's
invariants into those runtime evidence *can* revalidate and those it cannot — a partition
the architecture needs and does not have. Recursive feasibility and control-invariant sets
(R065, R068) supply the missing soundness condition for local closure: closing now must not
make lawful reopening infeasible later.

---

### R063 — Kalman 1960 (controllability and observability)
`CITE` R. E. Kalman. *On the general theory of control systems.* Proc. 1st IFAC Congress, Moscow, 481–492, 1960. · **HIGH**
`PROBLEM` Determine whether a system's internal state can be driven, and inferred from its outputs.
`STRUCTURE` **Controllability**: can inputs drive the state anywhere? **Observability**: do distinct states produce distinguishable output trajectories? Unobservable states form a subspace.
`GUARANTEE` A structural, checkable property of the system — not of the estimator's cleverness. If a state is unobservable, **no** estimator can recover it.
`LOSS` The unobservable subspace, permanently, from the output alone.
`DETECTOR` Two distinct states with identical output trajectories.
`REOPEN` Add a sensor. Nothing else works.
`SEAM` S-3, S-2
`INTERNAL` ECOS→SIGMA evidence return; Revalidation; the 18 non-collapse invariants.
`DELTA` **Supplies a partition of the invariant set that v2 needs and does not have.** Two SIGMA states indistinguishable through the return path cannot be told apart by any amount of returned evidence. Therefore an invariant whose violation produces no distinguishable receipt trajectory **cannot be revalidated by runtime evidence at all** — it can only be re-authorized by an authority with access the runtime lacks. Applying this to v2's own invariants is immediately clarifying: `no row without a durable embedding` is observable and was in fact observed at BUILD 0; `relevance ≠ authority` produces no distinguishable receipt trace and is structurally unobservable from the return path.
`TRANSFER` Classify each invariant as return-observable or not. Return-observable invariants may have revalidation triggers wired to evidence. Unobservable ones must be assigned to AUTHORITY or STRUCTURAL surfaces, and must never be given an evidence-driven revalidation trigger, because that trigger can never fire.
`PREREQ` A defined return-path output alphabet — i.e. what receipts actually carry. Not yet defined; that is the work.
`PRESERVE` `unknown ≠ nonexistent` — unobservable is not nonexistent, and this is precisely why unobservable invariants need a different enforcement route rather than none.
`FALSIFIER` An invariant currently classified unobservable that a richer receipt makes observable. That is a *good* outcome: it says add the sensor, exactly as the theory prescribes.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` OBSERVATIONAL, AUTHORITY
`COST` NONE — a classification pass.
`RETURN` Yes — bounds what the return path can ever accomplish.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP + SUPPLIES_TEST
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R064 — Luenberger 1971 (observers)
`CITE` D. Luenberger. *An introduction to observers.* IEEE Transactions on Automatic Control 16(6), 596–602, 1971. · **HIGH**
`PROBLEM` Reconstruct internal state from outputs when it cannot be measured directly.
`STRUCTURE` An observer: a model run alongside the system, corrected by the output error; converges when the system is observable.
`GUARANTEE` Asymptotic state estimate — **conditional on observability and on model fidelity**.
`LOSS` Transient error; permanent error if the model is wrong.
`DETECTOR` Persistent non-converging output error — a model mismatch signal.
`REOPEN` Correct the model.
`SEAM` S-3
`INTERNAL` ECB's derived orientation / handoff snapshot — an estimate of current state compiled from an event stream.
`DELTA` Names what those derived surfaces actually are — observers — and supplies their missing health signal: **persistent estimation error indicates model mismatch, not noise.** ECB's handoff snapshot has a watermark but no residual: nothing measures whether the compiled orientation still matches observed behavior. That residual is the cheap, high-value sensor.
`TRANSFER` Derived orientation surfaces carry a residual signal comparing predicted to observed state; a persistent residual is a first-class revalidation trigger.
`PREREQ` A prediction to compare against — currently absent; the snapshot summarizes rather than predicts.
`PRESERVE` `map ≠ referent` — the observer's estimate is a map.
`FALSIFIER` The derived surfaces make no predictions even in principle, leaving no residual to compute. Then they are summaries, not observers, and the analogy should be dropped.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` OBSERVATIONAL
`COST` NONE
`RETURN` Yes — the residual is returned evidence.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 2

### R065 — Mayne, Rawlings, Rao, Scokaert 2000 (constrained MPC)
`CITE` D. Q. Mayne, J. B. Rawlings, C. V. Rao, P. O. M. Scokaert. *Constrained model predictive control: Stability and optimality.* Automatica 36(6), 789–814, 2000. · **HIGH**
`PROBLEM` Act now on a finite planning horizon without losing long-run guarantees.
`STRUCTURE` At each step, optimize over a finite horizon, apply the **first action only**, then re-plan with new measurements. Stability requires a terminal constraint set and terminal cost giving **recursive feasibility**.
`GUARANTEE` If a feasible plan exists now, one exists at the next step too — the controller never plans itself into a corner.
`LOSS` Optimality beyond the horizon; the plan past the first action is discarded.
`DETECTOR` **Loss of recursive feasibility** — no feasible plan exists at the next step.
`REOPEN` Re-plan every step; that is the method, not an exception.
`SEAM` S-5
`INTERNAL` Master Key bounds the horizon; Aperture preserves what was excluded; Revalidation reopens. Action envelopes authorize bounded action.
`DELTA` **Supplies the soundness condition the Master Key/Aperture/Revalidation triad lacks.** Recursive feasibility says: local closure is safe only if it preserves the ability to continue lawfully. Translated: **a Move that closes locally must not destroy the evidence, authority, or state required to satisfy its own reopening trigger.** v2 has no such condition, and its absence is exactly how an aperture becomes decorative — recorded, triggerable in principle, and unreopenable in fact. The terminal-set requirement adds the second half: bounded action is safe only if it ends in a region from which lawful continuation is guaranteed.
`TRANSFER` Require every locally-closing Move to demonstrate that its reopening trigger remains satisfiable afterwards. An Aperture whose reopening the Move itself made infeasible is unsound and must be refused or re-Shaped.
`PREREQ` Reopening conditions stated concretely enough to check feasibility. v2's aperture TRIGGER fields already aim at this; several are too vague to check, which is itself the finding.
`PRESERVE` `operational closure ≠ metaphysical closure`; `unknown ≠ nonexistent`.
`FALSIFIER` A v2 closure that destroys its own reopening condition and is nonetheless correct — which would mean the trigger was never real.
`BRANCH` BRANCH_NEUTRAL — needs no order, metric, or optimization; only feasibility.
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` NONE
`RETURN` Yes — infeasibility is returned evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_TEST
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R066 — Mayne 2014 (MPC: recent developments)
`CITE` D. Q. Mayne. *Model predictive control: Recent developments and future promise.* Automatica 50(12), 2967–2986, 2014. · **HIGH**
`PROBLEM` Survey of MPC theory including robust and stochastic variants.
`STRUCTURE` Tube MPC, min-max formulations, robust invariant sets.
`GUARANTEE` Feasibility and stability under bounded disturbance sets.
`LOSS` Conservatism proportional to the assumed disturbance set.
`DETECTOR` Constraint violation despite the robust design — the disturbance model was wrong.
`REOPEN` Enlarge the disturbance set, at the price of conservatism.
`SEAM` S-5
`INTERNAL` As R065.
`DELTA` Adds the trade-off v2 will meet immediately: robustness is bought with conservatism, and an over-conservative envelope permits nothing useful. This gives a name to a failure mode that would otherwise look like caution — an action envelope so tightly under-approximated that it authorizes no action at all is a *design failure*, not a safe default.
`TRANSFER` Track envelope conservatism as an explicit quantity; an empty permitted set is a failure to report, not a safe outcome.
`PREREQ` Some measure of envelope size; ordinal comparison suffices.
`PRESERVE` FS-0001's under-approximation requirement — this does not weaken it, it prevents it from being trivially satisfied.
`FALSIFIER` v2 envelopes never over-constrain in practice.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` OBSERVATIONAL
`COST` NONE
`RETURN` Yes.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R067 — Bertsekas 2005 (rollout and receding horizon)
`CITE` D. P. Bertsekas. *Dynamic programming and suboptimal control: A survey from ADP to MPC.* European Journal of Control 11(4–5), 310–334, 2005. · **HIGH**
`PROBLEM` Relate receding-horizon control to approximate dynamic programming.
`STRUCTURE` Rollout policies; cost-to-go approximation; the **policy improvement** property — a rollout of a reasonable base policy is no worse than the base policy.
`GUARANTEE` Improvement over the base policy under stated conditions.
`LOSS` Global optimality.
`DETECTOR` Rollout performs worse than the base — an approximation-quality failure.
`REOPEN` Improve the cost-to-go approximation.
`SEAM` S-5
`INTERNAL` Build sequence 0–10 as a sequence of bounded Moves, each re-planned after metabolization.
`DELTA` Provides the argument for why v2's build discipline is not merely cautious but *sound*: acting one bounded Move at a time and re-planning after observation is guaranteed no worse than the base plan, provided each Move is evaluated against a consistent cost-to-go. v2's cost-to-go is "preserve the invariants", which is qualitative, so the guarantee transfers as posture rather than theorem.
`TRANSFER` Weak but real: the metabolization hold between builds is the re-planning step and should not be skipped even when the next build seems obvious.
`PREREQ` A cost-to-go. v2's is qualitative.
`PRESERVE` "Do not automatically begin BUILD 1 merely because BUILD 0 compiles."
`FALSIFIER` n/a — no strong claim made.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` METAPHOR_ONLY
`EFFECT` VERIFY_EXISTING
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 1

### R068 — Blanchini 1999 (set invariance in control)
`CITE` F. Blanchini. *Set invariance in control.* Automatica 35(11), 1747–1767, 1999. · **HIGH**
`PROBLEM` Characterize regions of state space from which constraints can be satisfied forever.
`STRUCTURE` **Controlled-invariant sets**: from any state inside, an input exists keeping the next state inside. The maximal such set is computable by iteration.
`GUARANTEE` Inside the set, lawful continuation is *always* possible. Outside it, no strategy exists.
`LOSS` States outside the invariant set are simply given up.
`DETECTOR` The state leaves the set — meaning the invariant set was miscomputed or the disturbance model was wrong.
`REOPEN` Recompute with corrected dynamics.
`SEAM` S-5, S-6
`INTERNAL` Nothing. The nearest concept is "governance state must be reconstructible", which is weaker.
`DELTA` **Supplies a genuinely new architectural object: the set of governance states from which lawful continuation is guaranteed.** This is the formal content of what an Aperture is supposed to protect, and v2 currently has no name for it. It also sharpens R065: recursive feasibility is exactly the requirement that Moves keep the system inside this set. Practically it converts "don't paint yourself into a corner" from advice into a computable (if approximable) condition.
`TRANSFER` Name and maintain the *lawful-continuation set*: the governance states from which every open aperture remains reopenable and every active obligation remains dischargeable. Moves that would exit it require explicit human warrant.
`PREREQ` A state representation and a transition relation over governance states. BUILD 5–6. Exact computation is infeasible; a conservative under-approximation is the realistic target and is exactly what the theory recommends.
`PRESERVE` `operational closure ≠ metaphysical closure`.
`FALSIFIER` The lawful-continuation set is either everything (the condition is vacuous) or empty (v2 is already stuck). Both are informative.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, SEMANTIC
`COST` OBJECT — the set, even as a predicate.
`RETURN` Yes — leaving the set is a high-priority return.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` BLOCK_PENDING_PROBE
`PRIORITY` 3

### R069 — Willems 1991 (behavioral approach)
`CITE` J. C. Willems. *Paradigms and puzzles in the theory of dynamical systems.* IEEE Transactions on Automatic Control 36(3), 259–294, 1991. · **HIGH**
`PROBLEM` State-space models presuppose a state; but a system is more primitively the **set of trajectories it can exhibit**.
`STRUCTURE` A system is its behavior — a set of admissible signal trajectories. State is derived, not assumed. Inputs and outputs are not intrinsic.
`GUARANTEE` A model that commits to no state variable it has not earned.
`LOSS` The convenience of a state-space representation.
`DETECTOR` Two models with the same behavior but different states — showing the state was over-committed.
`REOPEN` Derive a minimal state realization from the behavior.
`SEAM` S-5, S-1
`INTERNAL` Structure-is-earned; AP-06's refusal to fix Bounded Infinity's formal status; AP-10's refusal to assume partial orders.
`DELTA` **Methodologically the most aligned record in the neighborhood.** Willems argues exactly what v2's structure-is-earned rule argues, in control theory: do not posit a state space to make the mathematics convenient; define the system by what it can be observed to do, and let the state be derived if and when it is needed. This is a mature, respected precedent for v2's refusal to manufacture a state space — the very manufacture §12 forbids.
`TRANSFER` Define ECOS by its admissible receipt trajectories before positing governance state variables; derive state only where a behavior demonstrably requires memory.
`PREREQ` Receipt trajectories recorded. BUILD 5.
`PRESERVE` §12's prohibition on inventing state spaces; structure-is-earned.
`FALSIFIER` A v2 obligation inexpressible over trajectories and requiring an a priori state — which would justify positing one, with the justification recorded.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` OBSERVATIONAL
`COST` NONE
`RETURN` Yes — the return path *is* the behavior.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R070 — Bemporad & Morari 1999 (robust MPC survey)
`CITE` A. Bemporad, M. Morari. *Robust model predictive control: A survey.* In *Robustness in Identification and Control*, LNCIS 245, Springer, 207–226, 1999. · **HIGH**
`PROBLEM` Guarantee constraint satisfaction for **all** admissible uncertainties, not just the nominal model.
`STRUCTURE` Min-max and constraint-tightening formulations over an uncertainty set.
`GUARANTEE` Constraints hold for every realization in the assumed set.
`LOSS` Performance, traded for worst-case coverage.
`DETECTOR` A violation despite robust design — the uncertainty set was too small.
`REOPEN` Enlarge the uncertainty set.
`SEAM` S-5
`INTERNAL` FS-0001's TG-01: an action emitted from an abstraction must be legitimate for **every** unresolved concrete state it represents.
`DELTA` **TG-01 is the min-max robust formulation, restated in governance terms** — and this record supplies the practical consequence FS-0001 does not draw: robustness is only as good as the assumed uncertainty set. `Permitted_O(a) ⊆ ⋂ Permitted_O(c)` over `c ∈ γ(a)` is only sound if γ(a) actually contains every state still possible. **If γ under-approximates the uncertainty, the intersection is over too few witnesses and the envelope is unsound while appearing rigorous.** That failure mode is invisible to TG-01 as written.
`TRANSFER` TG-01 must be paired with a check that γ(a) covers the genuinely-possible states, not merely the enumerated ones. Add "coverage of γ" as an explicit obligation on the abstraction.
`PREREQ` A defensible account of what states remain possible — hard, and the honest difficulty here.
`PRESERVE` `unknown ≠ nonexistent`; an unenumerated state is not an impossible one.
`FALSIFIER` A v2 abstraction whose concretization provably covers all possible states — achievable only for finite, fully-enumerated domains.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` NONE
`RETURN` Yes.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3
