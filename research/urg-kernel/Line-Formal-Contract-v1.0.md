# <issue id="387c88ec-ed98-4b82-af94-2d16234b1839" href="https://linear.app/ecos-ops/issue/ECO-225/sense-formalization-urg-line-longitudinal-continuity-comparison">ECO-225</issue> — Shape Return — URG Line Contract v1.0

**Date:** 5 October 2026, America/Phoenix
**Phase:** Shape — CLOSED / PASS
**Sense basis:** <issue id="387c88ec-ed98-4b82-af94-2d16234b1839" href="https://linear.app/ecos-ops/issue/ECO-225/sense-formalization-urg-line-longitudinal-continuity-comparison">ECO-225</issue> Sense Closure
**Human surface:** `6bdd4b06-34a1-4c77-8573-e46c16c0272a`
**Next phase:** Move — OPEN under the Principal's continue-unless-blocked instruction
**Scope:** semantic/formal contract + bounded structural checker

## 1. Shape decision

Freeze Line as a **versioned longitudinal continuity/comparison contract plus witnessed instance graph**.

Do not universalize Line into:

* scalar maturity;
* total ordering;
* monotonic ascent;
* timestamp succession;
* one capability;
* one Stage sequence.

## 2. Contract

`Λ=(K,D,J,I,v)`

### K — continuity criterion

Names the subject/episode/lineage that is allowed to persist through change.

### D — comparison domain

Names which transformations/configurations are part of the Line's comparison problem.

### J — comparison relation

Defines how relevant positions may be compared.

J may be partial/non-total.

### I — continuity links

Defines which longitudinal links qualify positions as belonging to one instance.

### v — edition

Exact Line-contract version.

## 3. Instance

`ℓ=(Λ,P,E)`

P = longitudinal positions.

E = attributable continuity/transition links.

A position can carry an <issue id="e06a68f2-06bc-4d89-acfe-39324f78c606" href="https://linear.app/ecos-ops/issue/ECO-224/sense-formalization-urg-state-actual-configuration-basis-equality">ECO-224</issue> State reference:

`p=(id,R,B,Ω,F,o,x)`.

Different positions may have equal x.

## 4. Standing states

* `LINE_CONTRACT(Λ)`
* `LINE_SEEDED(Λ,p₀)`
* `LINE_INSTANCE_WITNESSED(ℓ)`
* `LINE_UNRESOLVED(QF)`
* `LINE_BASIS_INCOMPARABLE(QF)`

A witnessed instance requires at least two positions/transformations plus warranted continuity under I.

## 5. Same-Line predicate

`SameLine(p_a,p_b|Λ)`

requires:

* common/crosswalked Λ;
* K continuity;
* D/J applicability;
* warranted I-path.

A timestamp path is insufficient without I standing.

## 6. Topology

URG imposes no universal sequence/total-order axiom.

Λ may declare:

* sequence;
* partial order;
* directed graph;
* another longitudinal form.

If the domain requires a total order or monotonic metric, that requirement belongs in J/I.

## 7. Basis/reseat continuity

### State-basis/frame change

Requires <issue id="e06a68f2-06bc-4d89-acfe-39324f78c606" href="https://linear.app/ecos-ops/issue/ECO-224/sense-formalization-urg-state-actual-configuration-basis-equality">ECO-224</issue> crosswalk + D/J applicability.

### R/B change

Requires <issue id="587e1735-2630-4f1b-b018-4c4cc3c0da97" href="https://linear.app/ecos-ops/issue/ECO-221/sense-formalization-urg-kernel-level-quadrant-composition-optional">ECO-221</issue> continuity/reseat receipt + K/I requalification + State redisclosure.

Neither kind of change automatically means new Line or same Line.

## 8. Branch/fork contract

### Branch inside one continuity subject

One branching instance is legal when K remains one subject and Λ allows it.

### Subject/episode split

Spawn descendant Line instances with:

* shared ancestry;
* explicit fork edge;
* distinct post-fork K identities.

Never erase common history.

## 9. Nonmonotonicity

J may return domain-defined outcomes such as:

* advance;
* reversal;
* lateral;
* equivalent;
* incomparable;
* unknown.

These results do not alter Line identity unless K/D/J/I say they do.

## 10. Parallelism

One R may participate in multiple Line instances/templates simultaneously.

Different D/J prevent silent merging.

## 11. Developmental specialization

A Developmental Line is a Line whose D/J specifically concern longitudinal reorganization/maturity of capacities/capabilities.

No universal maturity scalar is required.

## 12. Line invariants

L1 chronology noncollapse.
L2 State noncollapse.
L3 contract/instance distinction.
L4 K visibility.
L5 D/J visibility.
L6 I visibility.
L7 nonmonotonicity allowed.
L8 recurrence allowed.
L9 parallelism allowed.
L10 basis honesty.
L11 reseat honesty.
L12 fork lineage.
L13 capability noncollapse.
L14 Direction noncollapse.
L15 Stage noncollapse.
L16 Level noncollapse.
L17 domain-semantic descent.
L18 unknown preservation.
L19 topology humility — no universal total order.
L20 comparison humility — J does not imply one scalar maturity.

## 13. Mechanical boundary

Checker MAY validate declared:

* contract fields;
* continuity link presence;
* template vs instance standing;
* minimum witnessed-instance structure;
* timestamp-only negative control;
* basis/reseat crosswalk requirements;
* repeated State position distinction;
* reversal/nonmonotonicity legality;
* fork ancestry;
* parallel-Line nonmerge;
* no Stage/Level/Direction/capability auto-promotion.

Checker MUST NOT infer:

* real continuity of a subject;
* correct developmental domain;
* true maturity/progress;
* causal lineage;
* whether J is semantically adequate;
* Stage/Level standing.

## 14. Required fixtures

 1. timestamp-only no Line;
 2. interruption/resume same Line;
 3. same template tomorrow, different instance;
 4. reversal same Line;
 5. repeated State distinct positions;
 6. parallel Lines same R;
 7. capability change same Line;
 8. Line no Stage;
 9. Line does not auto-create Stage;
10. valid State-basis crosswalk continuation;
11. D/J change no crosswalk rejected;
12. R/B reseat with bridge allowed;
13. R/B reseat without bridge rejected;
14. branch same K one instance allowed;
15. split K descendant instances;
16. prospective contract not witnessed instance;
17. partial J incomparability allowed;
18. timestamp+no J rejected;
19. monotonicity requirement absent by default;
20. equal State endpoints do not collapse positions.

## 15. Move artifacts

Install:

* `research/urg-kernel/Line-Formal-Contract-v1.0.md`
* `research/urg-kernel/line-fixtures-v1.0.json`
* `research/urg-kernel/check_line_contract.py`
* update README.

Require exact committed checker/fixture execution.

## 16. Shape disposition

**SHAPE PASS — URG LINE CONTRACT v1.0 FROZEN; ENTER MOVE.**