# <issue id="e06a68f2-06bc-4d89-acfe-39324f78c606" href="https://linear.app/ecos-ops/issue/ECO-224/sense-formalization-urg-state-actual-configuration-basis-equality">ECO-224</issue> — Shape Return — URG State Contract v1.0

**Date:** 5 October 2026, America/Phoenix
**Phase:** Shape — CLOSED / PASS
**Sense basis:** <issue id="e06a68f2-06bc-4d89-acfe-39324f78c606" href="https://linear.app/ecos-ops/issue/ECO-224/sense-formalization-urg-state-actual-configuration-basis-equality">ECO-224</issue> Sense Closure `1b4fbb71-5057-4bea-aabd-bb9e8bf8953a`
**Human surface:** `21331a4d-3e24-47a7-8a37-ed7f40241547`
**Next phase:** Move — OPEN under the Principal's continue-unless-blocked instruction
**Scope:** semantic/formal contract + bounded structural checker; no runtime/schema/provider installation

## 1. Shape decision

Freeze State as a **basis-indexed actualized configuration claim** over an explicit focal referent/boundary.

Do not define State as:

* the observer's knowledge;
* the representation of configuration;
* a transition/event;
* a duration segment;
* a developmental Stage;
* a Level;
* a Direction;
* an engagement-specific state tuple.

## 2. State basis

For focal referent R and boundary B:

`Ω = (Σ,D,ρ,N,v)`

where:

* **Σ** — declared State scope/domain slice;
* **D** — retained State-bearing dimensions/relations under native domain semantics;
* **ρ** — resolution/granularity;
* **N** — normalization/equality rule;
* **v** — exact State-basis edition.

Ω determines a State value space `X_Ω`.

The State basis is itself an attributable semantic artifact. It does not become R.

## 3. State claim

`State(R,B,Ω,F,o) = x`

with `x ∈ X_Ω`.

* **F** — consequential mapper/reference/access frame;
* **o** — occasion/index; may be time, event position, logical epoch or another declared occurrence index;
* **x** — actualized configuration of R under Ω/F.

State is ontic in target but basis-relative in discrimination.

No universal complete microstate is required.

## 4. Fixed-basis equality

Under identical R/B/Ω and compatible F:

`SameState(x₁,x₂ | Ω,F) ⇔ N(x₁)=N(x₂)`.

Equality means equivalence under the retained State distinctions.

It does not assert equality of omitted detail, microhistory, evidence, provenance or transition path.

### Shape rule

A change outside D/ρ that leaves N(x) unchanged is **State-inert under Ω**.

It may remain meaningful under another basis.

## 5. Basis refinement / crosswalk

A State basis Ω₂ may be declared a refinement of Ω₁ only with an explicit meaning-preserving map:

`r₂₁ : X_{Ω₂} → X_{Ω₁}`.

A fine State x₂ is compatible with coarse State x₁ iff:

`r₂₁(x₂)=x₁`.

The act of changing Ω is:

`RefineStateBasis`

not:

`StateTransition`.

If no lawful crosswalk exists:

`STATE_BASIS_INCOMPARABLE(QF)`.

No cross-basis identity is inferred from similar field names.

## 6. Frame transform

F remains independently attributable.

Cross-frame comparison requires an explicit transform/crosswalk:

`φ₁₂ : X_{Ω,F₁} → X_{Ω,F₂}`.

`ChangeFrame` does not itself imply StateTransition.

If frame conversion is unavailable/invalid:

`STATE_FRAME_INCOMPARABLE(QF)`.

## 7. Evidence / observation contract

Evidence E about State yields:

`Cand(E | R,B,Ω,F,o) ⊆ X_Ω`.

Evidence may:

* constrain candidates;
* alter confidence/warrant;
* expose an earlier wrong State claim;
* establish a State value.

It does not automatically change R's State.

### Result types

* `STATE_WITNESSED(x)`
* `STATE_UNKNOWN(Candidates,QF)`
* `STATE_CONTRADICTED(reason)`

UNKNOWN is epistemic unless native domain semantics explicitly make uncertainty/distribution part of the State object.

## 8. Domain-native probabilistic/mixed State

If the native domain contract defines x itself as a:

* probability distribution;
* stochastic population vector;
* density operator;
* fuzzy/mixed native State object;
* another explicit non-point State representation,

that object may lawfully be x ∈ X\_Ω.

This must remain typed distinctly from an epistemic candidate distribution caused by incomplete knowledge.

## 9. State transition

A StateTransition is:

`Transition_Ω,F(R,B,o_a,x_a → o_b,x_b)`

only when:

1. R remains focal unless a separate Reseat is declared;
2. B remains stable unless a separate ReviseBoundary is declared;
3. Ω/F are identical or connected through an explicitly qualified comparison map;
4. x differs under the comparison basis.

### Endpoint/history law

Equal endpoint State does not erase an actual intervening transition history.

`x₀→x₁→x₀`

is not semantically identical to “nothing happened.”

History/event semantics live in typed transition/evidence records, not in x alone unless Ω explicitly retains them.

## 10. Typed operations

### O1 Observe

Changes evidence/warrant.

Preserves R/B/Ω/F/x unless the new evidence justifies correcting the State claim.

### O2 RefineStateBasis

Changes Ω.

Requires:

* exact source/destination basis;
* crosswalk or explicit incomparability;
* no automatic StateTransition claim.

### O3 ChangeFrame

Changes F.

Requires:

* transform/crosswalk or explicit incomparability.

### O4 StateTransition

Actual State change under compatible basis.

Does not by itself imply Direction/Stage/Level.

### O5 ReviseBoundary / Reseat

Inherited from <issue id="587e1735-2630-4f1b-b018-4c4cc3c0da97" href="https://linear.app/ecos-ops/issue/ECO-221/sense-formalization-urg-kernel-level-quadrant-composition-optional">ECO-221</issue>.

Changes B/R.

Requires redisclosure/requalification of State under the destination seat.

### O6 DirectionalEvent

Inherited from <issue id="c7855652-cf07-468f-a5db-77e5096ade49" href="https://linear.app/ecos-ops/issue/ECO-222/sense-formalization-urg-directional-pressures-four-direction">ECO-222</issue>.

A directional event may:

* induce StateTransition;
* leave x unchanged at retained resolution;
* return to an equal endpoint;
* include path semantics not encoded by State.

Direction remains independently classified.

## 11. Cross-axis contracts

### State × Quadrant

State content can be asked under different Quadrant positions.

A determinate constitutive configuration question is C+D.

A determinate participatory relation question is P+D.

Rules/constraints governing State spaces/transitions can carry a Governing burden.

**State != Quadrant.**

### State × Level

A Level relation can remain stable across many States.

State equality/change does not establish Level.

### State × Direction

Direction classifies relational transformation orientation/mode.

State classifies actualized configuration.

One does not substitute for the other.

### State × Line

State provides comparable positions/configurations.

Line supplies longitudinal identity/comparison continuity.

State does not create Line.

### State × Stage

State detail can change without Stage change.

Stage remains governed by <issue id="10609eff-7723-4c4f-b3c2-81bba37da157" href="https://linear.app/ecos-ops/issue/ECO-185/shape-adversarial-qualification-state-stage-line-level-try-to">ECO-185</issue> repaired standing and later formalization.

## 12. Frozen State invariants

**S1 Referential indexing** — R/B are explicit.
**S2 Basis visibility** — Ω edition is explicit.
**S3 Frame visibility** — consequential F is explicit and independent.
**S4 Ontic/epistemic noncollapse** — State != knowledge/evidence.
**S5 Representation noncollapse** — encoding/map != State.
**S6 Basis-change noncollapse** — changing Ω != StateTransition.
**S7 Frame-change noncollapse** — changing F != StateTransition.
**S8 Boundary-change noncollapse** — changing B/R is explicit before comparison.
**S9 Direction noncollapse** — StateTransition != Direction.
**S10 Stage/Level noncollapse** — State does not grant Stage/Level.
**S11 Duration independence** — no universal dwell time.
**S12 Unknown preservation** — epistemic uncertainty is not an ontic State by default.
**S13 Cross-basis honesty** — compare only via declared crosswalk.
**S14 History preservation** — equal endpoints do not erase transition history.
**S15 Domain-semantic descent** — D/X\_Ω may be domain-native.
**S16 State-space noncollapse** — X\_Ω (possibility space) != actual State x.
**S17** <issue id="3b306b18-df3f-4818-808e-9aa59c6bb47a" href="https://linear.app/ecos-ops/issue/ECO-191/sense-formalization-sigma-recursive-referent-system-derive-minimal">ECO-191</issue> **specialization** — engagement-state tuples are domain-specific instantiations, not the universal primitive.

## 13. Mechanical / semantic boundary

A bounded checker MAY validate:

* required R/B/Ω/F identities;
* allowed operation type;
* same-basis equality declarations;
* presence of crosswalk for RefineStateBasis;
* presence of transform for ChangeFrame;
* rejection of direct comparison after undeclared B/R change;
* preservation of UNKNOWN;
* distinction between epistemic candidate set and native probabilistic State;
* transition history not erased by equal endpoints;
* no Direction/Stage/Level auto-promotion;
* <issue id="3b306b18-df3f-4818-808e-9aa59c6bb47a" href="https://linear.app/ecos-ops/issue/ECO-191/sense-formalization-sigma-recursive-referent-system-derive-minimal">ECO-191</issue> tuple marked specialized rather than universal.

The checker MUST NOT infer:

* the correct domain State variables;
* whether x actually obtains in reality;
* whether two domain-native frames are physically equivalent;
* causal dynamics;
* Direction meaning;
* Level/Stage standing;
* the best resolution/granularity;
* semantic truth from representation syntax.

## 14. Required Move fixtures

 1. new sensor observation, same State;
 2. fine-basis refinement mapping to same coarse State;
 3. hidden State difference behind same visible observation;
 4. epistemic candidate set ≠ ontic State;
 5. native stochastic State allowed when typed as native;
 6. reversible x₀→x₁→x₀ history retained;
 7. State change with no Direction;
 8. Directional event with equal endpoint State;
 9. boundary revision blocks direct State equality;
10. frame change with transform is not StateTransition;
11. frame change without transform is incomparable;
12. <issue id="3b306b18-df3f-4818-808e-9aa59c6bb47a" href="https://linear.app/ecos-ops/issue/ECO-191/sense-formalization-sigma-recursive-referent-system-derive-minimal">ECO-191</issue> engagement tuple is specialized State basis;
13. static State across long duration;
14. short/instant State allowed;
15. coarse State equality despite finer difference;
16. State-space possibility ≠ actual State;
17. basis change without crosswalk rejected;
18. unknown evidence remains STATE_UNKNOWN.

## 15. Move artifacts

Install:

* `research/urg-kernel/State-Formal-Contract-v1.0.md`
* `research/urg-kernel/state-fixtures-v1.0.json`
* `research/urg-kernel/check_state_contract.py`
* update `research/urg-kernel/README.md`

Move PASS requires:

* all fixtures pass;
* negative controls discriminate;
* no ontic/epistemic collapse;
* no basis/frame change masquerades as State transition;
* no automatic Direction/Stage/Level promotion;
* `docs/invariants.md` remains unchanged;
* exact committed checker/fixture bytes are executed;
* human working surface receives qualified standing.

## 16. Shape disposition

**SHAPE PASS — URG STATE CONTRACT v1.0 FROZEN; ENTER MOVE.**