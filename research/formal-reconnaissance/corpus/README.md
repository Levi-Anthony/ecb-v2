STATUS: COMPLETE — 100 RECORDS CODED
DISPOSITION: EVIDENCE
ROLE: Output C — coded source corpus
AUTHORITY: None

# 100-Source Evidence Table

> **Plain-English note.** This directory holds the 100 papers, one structured record each, grouped
> into fourteen topic areas. Each record captures what problem the paper solves, what it guarantees,
> how it detects its own failure, what it would give ECB v2, and what would prove that wrong.
>
> **This is machine-facing. You do not need to read it.** The whole result in plain English is in
> [`../EXECUTIVE-EXTRACTION.md`](../EXECUTIVE-EXTRACTION.md). Every code and term is decoded in
> [`../GLOSSARY.md`](../GLOSSARY.md).

Screening funnel actually executed:

    internal baseline (02-baseline-register.md)
      → ~380 candidate records identified across 14 neighborhoods
      → title + abstract screening
      → 100 retained and coded
      → 21 warranted full texts (07-fulltext-shortlist.md)
      → 4 warranted formalization probes (08-formalization-probes.md)

31 otherwise-interesting records were dropped at screening for failing the Shape rule:
no residual delta against a live mechanism, or no falsifier.

## Neighborhood index

| File | Neighborhood | Records |
|---|---|---|
| `N01-abstract-interpretation.md` | Abstraction and refinement | R001–R011 |
| `N02-refinement-verification.md` | Formal semantics, refinement, contracts, verification | R012–R022 |
| `N03-bidirectional.md` | Bidirectional transformation, lenses, view-update | R023–R030 |
| `N04-projection-equivalence.md` | Projection, quotient, contextual equivalence | R031–R037 |
| `N05-provenance-temporal.md` | Provenance, database theory, temporal state, lineage | R038–R045 |
| `N06-belief-revision.md` | KR, belief revision, truth maintenance | R046–R054 |
| `N07-authorization.md` | Authorization, policy succession, capability, trust | R055–R062 |
| `N08-control-observability.md` | Control, observability, receding horizon | R063–R070 |
| `N09-category-theory.md` | Compositional structure | R071–R075 |
| `N10-information.md` | Information theory, controlled loss | R076–R082 |
| `N11-recursion-reflection.md` | Recursion, reflection, fixed points | R083–R088 |
| `N12-cybernetics.md` | Cybernetics, second-order systems | R089–R091 |
| `N13-geometry.md` | Geometry | R092–R093 |
| `N14-wildcards.md` | Enforceability, tamper-evident logs, convergence, argumentation | R094–R100 |

## Coding key

Each record carries the §13 fields, abbreviated:

| Tag | §13 field |
|---|---|
| `CITE` | Citation, ending in a confidence token (`VERIFIED` / `HIGH` / `MEDIUM`) |
| `PROBLEM` | Native problem |
| `STRUCTURE` | Native formal structure |
| `GUARANTEE` | Guarantee / preservation |
| `LOSS` | Permitted loss |
| `DETECTOR` | Failure detector |
| `REOPEN` | Refinement / reopening after failure |
| `SEAM` | Relevant v2 build seam (S-1…S-7 from `01-SHAPE.md`) |
| `INTERNAL` | Existing SIGMA/ECOS or OB1/ECB mechanism occupying this territory |
| `DELTA` | Residual delta |
| `TRANSFER` | Exact transfer proposition |
| `PREREQ` | Native prerequisites |
| `PRESERVE` | v2 preservation obligation |
| `FALSIFIER` | What would show the transfer invalid |
| `BRANCH` | BRANCH_NEUTRAL / _COMPATIBLE / _DEPENDENT / _FORCING / _CONFLICTING |
| `ENFORCE` | STRUCTURAL / SEMANTIC / AUTHORITY / OBSERVATIONAL |
| `COST` | NONE / OBJECT / EVENT / PERSISTENCE / GOVERNANCE |
| `RETURN` | Return-path consequence |
| `STATUS` | NO_TRANSFER / METAPHOR_ONLY / CONDITIONAL_TRANSFER / TESTABLE_TRANSFER / IMPLEMENTATION_CANDIDATE / ARCHITECTURE_CHALLENGE |
| `EFFECT` | ALREADY_PRESENT / SHARPENS_EXISTING / SUPPLIES_TEST / SUPPLIES_MECHANISM / EXPOSES_GAP / CHALLENGES_EXISTING / CHANGE_PROPOSAL_REQUIRED |
| `BUILD` | NO_BUILD_EFFECT / VERIFY_EXISTING / SHARPEN_CONTRACT / ADD_ACCEPTANCE_TEST / ADD_IMPLEMENTATION_CANDIDATE / BLOCK_PENDING_PROBE / ARCHITECTURE_CHALLENGE |
| `PRIORITY` | 0 none · 1 background · 2 full text · 3 formalization candidate |

## Distribution of outcomes

Computed from `ledger.jsonl`, not estimated. Where a record lists more than one build
consequence, the **first** token is counted.

| Transfer status | Count |
|---|---|
| TESTABLE_TRANSFER | 43 |
| CONDITIONAL_TRANSFER | 31 |
| METAPHOR_ONLY | 9 |
| NO_TRANSFER | 8 |
| IMPLEMENTATION_CANDIDATE | 7 |
| ARCHITECTURE_CHALLENGE | 2 |
| **Total** | **100** |

| Build classification (primary) | Count |
|---|---|
| SHARPEN_CONTRACT | 44 |
| ADD_ACCEPTANCE_TEST | 24 |
| NO_BUILD_EFFECT | 13 |
| ADD_IMPLEMENTATION_CANDIDATE | 12 |
| VERIFY_EXISTING | 4 |
| ARCHITECTURE_CHALLENGE | 2 |
| BLOCK_PENDING_PROBE | 1 |
| **Total** | **100** |

| Branch standing | Count |
|---|---|
| BRANCH_NEUTRAL | 55 |
| BRANCH_COMPATIBLE | 28 |
| BRANCH_DEPENDENT | 7 |
| BRANCH_CONFLICTING | 7 |
| BRANCH_FORCING | 3 |

| Follow-up priority | Count |
|---|---|
| 3 — formalization candidate | 35 |
| 2 — full text | 51 |
| 1 — background | 10 |
| 0 — none | 4 |

| Citation confidence | Count |
|---|---|
| VERIFIED | 21 |
| HIGH | 73 |
| MEDIUM | 6 |

**Nine of fourteen neighborhoods produced at least one NO_TRANSFER or METAPHOR_ONLY
result** (N01, N03, N04, N06, N08, N09, N10, N12, N13). Five did not: **N02**
(refinement/verification), **N05** (provenance/temporal), **N07** (authorization), **N11**
(recursion/reflection), **N14** (wildcards).

This is recorded as a **limitation, not a strength**. A neighborhood in which nothing was
rejected is a neighborhood whose screening was not adversarial enough, or one selected
after the transfer was already believed. N02 and N14 were both shaped around findings the
operation had already made, so their uniformly positive yield is at least partly a
selection effect and should be read with that discount. Registered as QF-F-03.

Note the shape of the result: 43 TESTABLE_TRANSFER against only 7
IMPLEMENTATION_CANDIDATE, and 44 SHARPEN_CONTRACT against 12
ADD_IMPLEMENTATION_CANDIDATE. **The literature's contribution to this build is
overwhelmingly sharper contracts and tests, not new machinery** — which matches the
baseline register's finding that four of seven seams have no frozen test at all.
