STATUS: COMPLETE — 100 RECORDS CODED
DISPOSITION: EVIDENCE
ROLE: Output C — coded source corpus
AUTHORITY: None

# 100-Source Evidence Table

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

| Transfer status | Count |
|---|---|
| TESTABLE_TRANSFER | 24 |
| CONDITIONAL_TRANSFER | 27 |
| IMPLEMENTATION_CANDIDATE | 11 |
| METAPHOR_ONLY | 14 |
| NO_TRANSFER | 16 |
| ARCHITECTURE_CHALLENGE | 8 |

| Build classification | Count |
|---|---|
| NO_BUILD_EFFECT | 21 |
| VERIFY_EXISTING | 18 |
| SHARPEN_CONTRACT | 22 |
| ADD_ACCEPTANCE_TEST | 19 |
| ADD_IMPLEMENTATION_CANDIDATE | 11 |
| BLOCK_PENDING_PROBE | 4 |
| ARCHITECTURE_CHALLENGE | 5 |

**Every neighborhood produced at least one NO_TRANSFER or METAPHOR_ONLY result.** A
neighborhood returning only positive findings would have indicated screening failure.
