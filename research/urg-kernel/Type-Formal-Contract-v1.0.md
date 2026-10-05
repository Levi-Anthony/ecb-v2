# <issue id="99e859ce-9911-456e-b2d4-542115f017e7" href="https://linear.app/ecos-ops/issue/ECO-136/shape-universal-referent-grammar-specify-and-qualify-a-portable">ECO-136</issue> — Shape Return — URG Type Contract v1.0

**Date:** 5 October 2026, America/Phoenix
**Phase:** Shape — CLOSED / PASS
**Sense basis:** <issue id="99e859ce-9911-456e-b2d4-542115f017e7" href="https://linear.app/ecos-ops/issue/ECO-136/shape-universal-referent-grammar-specify-and-qualify-a-portable">ECO-136</issue> Type Sense Closure
**Human surface:** `a052ccbc-df02-44ad-ab84-16756f8b42fc`
**Next phase:** Move — OPEN under the Principal's continue-unless-blocked instruction
**Scope:** semantic/formal contract + bounded structural checker

## 1. Shape decision

Freeze Type as a **schema-indexed classification relation**.

Do not hard-code domain-native type systems into URG.

Do not reduce the locked Type distinction to a scalar axis.

## 2. Typology basis

`Ψ=(S,C,M,V)`

* S: typology/schema identity;
* C: classifier/category referents;
* M: native membership/adjudication semantics;
* V: exact edition.

## 3. Classification contract

For classifier κ ∈ C:

`TypeClaim(R,B,Ψ,κ,c)`

returns:

* `TYPE_WITNESSED(κ,w)`
* `TYPE_NOT_ESTABLISHED(κ,reason)`
* `TYPE_UNKNOWN(κ,QF)`
* `TYPE_INAPPLICABLE(κ,basis)`
* `TYPE_SCHEMA_INCOMPARABLE(QF)`
* `TYPE_UNCOVERED(Ψ,R,QF)`

Witnessed claims compose into:

`Profile_Ψ(R,c)`.

## 4. Positive Type criterion

TYPE_WITNESSED requires:

**TY1 Schema visibility** — exact S/V is known.
**TY2 Classifier identity** — κ is addressable/recoverable.
**TY3 Native relation semantics** — M states what classification means.
**TY4 Focal referent** — R/B are explicit.
**TY5 Warrant** — declared evidence/authority supports the claim at its standing.
**TY6 Nonidentity** — R is not collapsed into κ/schema/representation.
**TY7 No axis leakage** — no Level/Stage/State/Line/Quadrant/Direction standing is inferred merely from Type.

## 5. Type profile cardinality

URG imposes no universal:

* exactly-one classifier;
* mutual exclusion;
* hierarchy;
* exhaustive partition;
* numeric score;
* stable-for-life rule.

Those belong to M.

## 6. Relation-kind preservation

Where native schema distinguishes:

* instance-of;
* conforms-to;
* specialization;
* implementation;
* role;
* pattern membership;
* another classification relation,

retain that relation kind.

A normalized discovery view may group them as “typing/classification” only if the native relation remains recoverable.

## 7. Horizontal / non-developmental law

Type is non-developmental by default.

It does not generate:

* Level;
* Stage;
* Line progress;
* Direction;
* maturity rank.

A domain may combine Type with developmental semantics through explicit composition.

## 8. State relation

Type membership may be included in a State basis.

Type membership change does not universally imply StateTransition.

StateTransition does not universally imply Type change.

## 9. Role relation

Role is not automatically Type.

A schema may define a role classifier, but the conversion must be explicit in M.

## 10. PGO

PGO may select Ψ/relevance.

PGO cannot make an unsupported Type claim true.

## 11. Rebase

`RebaseType(Ψ₁→Ψ₂)`

requires an explicit crosswalk χ for cross-schema classifier identity/comparison.

Without χ:

* TYPE_SCHEMA_INCOMPARABLE.

Schema revision alone does not imply R change.

## 12. Open-world classification

If no classifier can represent the material pattern under Ψ:

* return TYPE_UNCOVERED;
* preserve the QF;
* do not force-fit.

A new/ad hoc Ψ may then be discovered/composed under FR-1 with source/standing retained.

## 13. Type invariants

Y1 schema indexing.
Y2 classifier/referent nonidentity.
Y3 native relation preservation.
Y4 non-developmental default.
Y5 Level noncollapse.
Y6 State noncollapse.
Y7 Stage/Line noncollapse.
Y8 Quadrant/Direction noncollapse.
Y9 role noncollapse.
Y10 cardinality/exclusivity humility.
Y11 schema-version honesty.
Y12 unknown preservation.
Y13 uncovered route.
Y14 recursive focalization.
Y15 PGO noncreation.
Y16 standing/provenance retention.
Y17 same-label nonidentity across schemas.
Y18 representation noncollapse.
Y19 specialization hierarchy != holarchic altitude.
Y20 domain-semantic descent.

## 14. Mechanical boundary

Checker MAY validate declared:

* S/V/κ/R/B presence;
* allowed claim standing;
* same-label cross-schema nonidentity;
* schema-crosswalk requirement;
* multi-label legality when M permits;
* exclusive-profile legality only when M permits;
* Type/Level/Stage/State/Line/Direction auto-promotion negatives;
* role auto-Type negative;
* TYPE_UNCOVERED preservation;
* recursive focalization markers.

Checker MUST NOT infer:

* actual membership;
* semantic adequacy of M;
* correct typology;
* identity of real classifiers;
* Level/Stage standing;
* empirical validity of a personality/scientific taxonomy.

## 15. Required Move fixtures

 1. Myers-Briggs + blood type coexist.
 2. same label/different schemas no merge.
 3. specialization hierarchy no Level.
 4. State changes / Type stable.
 5. Type changes / R stable.
 6. role no auto-Type.
 7. multi-label allowed when M permits.
 8. exclusivity allowed when M requires.
 9. uncovered returns TYPE_UNCOVERED.
10. schema revision with crosswalk.
11. schema revision without crosswalk incomparable.
12. SysML/OPM native relation preserved.
13. same Type across Stage changes.
14. conflicting Type claims preserve both standing/evidence.
15. native probabilistic membership allowed.
16. classifier becomes focal.
17. schema itself typed by another schema.
18. PGO selects typology but cannot create membership.
19. Type auto-Level negative.
20. Type auto-Stage negative.
21. State auto-Type negative.
22. Direction auto-Type negative.
23. same label cross-schema auto-identity negative.
24. forced nearest category negative.

## 16. Move artifacts

Install:

* `research/urg-kernel/Type-Formal-Contract-v1.0.md`
* `research/urg-kernel/type-fixtures-v1.0.json`
* `research/urg-kernel/check_type_contract.py`
* update README/START_HERE.

Execute exact committed checker/fixture bytes.

Keep `docs/invariants.md` unchanged.

## 17. Shape disposition

**SHAPE PASS — URG TYPE CONTRACT v1.0 FROZEN; ENTER MOVE.**