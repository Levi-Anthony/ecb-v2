# <issue id="99e859ce-9911-456e-b2d4-542115f017e7" href="https://linear.app/ecos-ops/issue/ECO-136/shape-universal-referent-grammar-specify-and-qualify-a-portable">ECO-136</issue> — Shape Return — URG Stage Contract v1.0

**Date:** 5 October 2026, America/Phoenix
**Phase:** Shape — CLOSED / PASS
**Sense basis:** <issue id="99e859ce-9911-456e-b2d4-542115f017e7" href="https://linear.app/ecos-ops/issue/ECO-136/shape-universal-referent-grammar-specify-and-qualify-a-portable">ECO-136</issue> Stage Sense Closure
**Human surface:** `6b6a5a1e-2afe-4880-8b31-b32e3f3d9cb4`
**Next phase:** Move — OPEN under the Principal's continue-unless-blocked instruction
**Scope:** semantic/formal contract + bounded structural checker; no runtime/schema/provider installation

## 1. Shape decision

Freeze Stage as a derived projection:

> **witnessed Line + adequate PGO + lawful Level-bearing seat + valid Level witness + explicit Stage projection rule → Stage standing.**

Do not restore Stage as an independent primitive detached from Level.

## 2. Stage basis

`Θ=(ℓ,G,Π,Q,v)`

where:

* ℓ = witnessed Line instance;
* G = adequate PGO;
* Π = Stage projection/activation rule;
* Q = optional operational regime interface;
* v = edition.

## 3. Evaluation contract

`StageEval_Θ(p,W_L)` returns one of:

* `PGO_UNDERENRICHED(QF)`
* `LINE_UNRESOLVED(QF)`
* `LEVEL_UNKNOWN(QF)`
* `LEVEL_NOT_ESTABLISHED(reason)`
* `REGIME_ONLY(Γ)`
* `LEVEL_NOT_STAGE_UNDER_PGO(W_L)`
* `STAGE_UNKNOWN(Candidates,QF)`
* `STAGE_LEVEL(σ,W_L)`
* `STAGE_BASIS_INCOMPARABLE(QF)`

## 4. Stage standing

`STAGE_LEVEL(σ,W_L)` is valid only when:

**ST1 Line** — p belongs to a witnessed ℓ.
**ST2 PGO** — G is adequate for the proposed distinction.
**ST3 Seat** — relevant R/B is explicit and lawfully generated/reseated if needed.
**ST4 Level** — valid <issue id="587e1735-2630-4f1b-b018-4c4cc3c0da97" href="https://linear.app/ecos-ops/issue/ECO-221/sense-formalization-urg-kernel-level-quadrant-composition-optional">ECO-221</issue> Level witness exists.
**ST5 Projection** — Π positively selects that Level distinction as a Stage landmark under G/ℓ.
**ST6 Basis** — Θ/v is explicit.
**ST7 Non-substitution** — chronology, State change, Direction, Γ or label cannot substitute for ST1–ST5.

## 5. Stage class and occurrence

σ identifies a Stage class under Θ.

`Occurs(p,σ|Θ)` records a Stage occurrence at a distinct Line position.

Same class may occur multiple times.

Occurrence identity does not collapse into class identity.

## 6. Same Stage

`SameStage(p_a,p_b|Θ)`

iff:

* both positions have STAGE_LEVEL;
* their projected Stage key σ is equal under the same Θ.

Stage class equality is basis-relative.

## 7. Stage transition

For longitudinally related positions p_a,p_b under fixed Θ:

`StageTransition(p_a,p_b|Θ)`

requires:

* STAGE_LEVEL at both positions;
* `σ_a != σ_b`;
* corresponding change in the Stage-relevant projected Level-bearing organization.

No Stage transition follows solely from:

* x_a != x_b State change;
* Direction event;
* Γ change;
* elapsed time;
* label rename.

## 8. Level relation

Stage ⇒ Level.

Level ⇏ Stage under arbitrary G.

A Level change not selected by Π/G yields:

`LEVEL_NOT_STAGE_UNDER_PGO`.

A candidate Level not yet witnessed cannot be promoted by a Stage label.

## 9. Q/Γ contract

Q/Γ may operationalize already-qualified Stage distinctions and define REGIME_ONLY partitions.

It may not:

* create Level;
* create Stage;
* override PGO adequacy;
* override lawful seating.

A Q/Γ change with unchanged σ is not Stage transition.

## 10. PGO adequacy

PGO adequacy is required before Stage adjudication.

Adequacy requires the proposed distinction to alter a declared consequential developmental/teaching/capability/continuation/decision obligation.

Otherwise return PGO_UNDERENRICHED.

## 11. Rebase / crosswalk

Change to ℓ/G/Π/Q/v creates:

`RebaseStage(Θ₁→Θ₂)`.

This is not a Stage transition in R.

Cross-basis comparison requires explicit mapping:

`χ₁₂ : StageClass_{Θ₁} → StageClass_{Θ₂}`

or explicit incompatibility.

Without χ:

`STAGE_BASIS_INCOMPARABLE`.

## 12. Regression / recurrence

No universal monotonicity.

`σ₁→σ₂→σ₁` is legal where Level/Line/domain semantics support it.

The later σ₁ occurrence remains distinct.

## 13. Ordering

Stage ordering may be:

* total;
* partial;
* cyclic;
* domain-specific;
* unresolved.

No universal numeric Stage rank is adopted.

## 14. Labels

Labels are representations.

Same σ + new label = label change.

Same text label under different Θ does not establish Stage identity.

## 15. Cross-axis constraints

* many States may occur within one Stage;
* Direction may participate in reorganization without Stage;
* Line is prerequisite context but not generator;
* Level is prerequisite structure but not automatically Stage;
* Quadrant may classify questions about Stage but is not Stage;
* SSMM phase names are not Stage semantics.

## 16. Frozen Stage invariants

T1 Level prerequisite.
T2 Line prerequisite.
T3 PGO adequacy.
T4 projection visibility.
T5 Q/Γ non-generation.
T6 State noncollapse.
T7 Direction noncollapse.
T8 label noncollapse.
T9 basis-change noncollapse.
T10 occurrence/class distinction.
T11 nonmonotonicity allowed.
T12 no global numbering.
T13 Level locality inherited.
T14 PGO noncreation.
T15 unknown preservation.
T16 physicalization quarantine.
T17 Stage-transition requires projected-Level distinction.
T18 REGIME_ONLY is a lawful result.
T19 operational first-classness does not imply primitive independence.
T20 cross-basis identity requires χ.

## 17. Mechanical boundary

A bounded checker MAY verify declared:

* Line/PGO/Level/Π presence before STAGE_LEVEL;
* REGIME_ONLY with no Level;
* LEVEL_NOT_STAGE_UNDER_PGO;
* no Q/Γ auto-promotion;
* no State/Direction/label auto-promotion;
* class/occurrence distinction;
* Stage transition only when σ differs under fixed Θ;
* rebase/crosswalk requirements;
* no default monotonicity/global numbering.

The checker MUST NOT infer:

* whether G is substantively adequate;
* real Level standing;
* correct Π;
* true developmental ordering;
* natural-language Stage meaning;
* domain maturity theory.

## 18. Required Move fixtures

 1. Γ change/no Level → REGIME_ONLY.
 2. Level exists/not selected → LEVEL_NOT_STAGE_UNDER_PGO.
 3. weak G → PGO_UNDERENRICHED.
 4. Line+adequate G+Level+Π → STAGE_LEVEL.
 5. State changes/same σ → same Stage.
 6. Direction event/no Level → no Stage.
 7. T composite/Level unqualified → no Stage.
 8. selected Level change → Stage transition.
 9. unselected Level change → no Stage transition.
10. Γ change/same σ → no Stage transition.
11. no Line → reject STAGE_LEVEL.
12. no Level → reject STAGE_LEVEL.
13. inadequate PGO → reject STAGE_LEVEL.
14. regression σ1→σ2→σ1 allowed.
15. same σ later → same class/distinct occurrence.
16. Θ edition change → Rebase, not StageTransition.
17. same numeric label/different Θ → no identity.
18. partial order allowed.
19. no minimum dwell.
20. operational first-class/no dedicated persistence.
21. label rename/no transition.
22. StageTransition from State change only → reject.
23. Q/Γ auto-stage → reject.
24. Stage without lawful seat → reject.

## 19. Move artifacts

Install:

* `research/urg-kernel/Stage-Formal-Contract-v1.0.md`
* `research/urg-kernel/stage-fixtures-v1.0.json`
* `research/urg-kernel/check_stage_contract.py`
* update `research/urg-kernel/README.md`

Execute exact committed checker/fixture bytes.

Keep `docs/invariants.md` unchanged.

## 20. Shape disposition

**SHAPE PASS — URG STAGE CONTRACT v1.0 FROZEN; ENTER MOVE.**