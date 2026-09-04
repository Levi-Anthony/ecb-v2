STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: §17 — cross-corpus synthesis organized by build function
AUTHORITY: None

# Cross-Corpus Synthesis

Organized by **build function**, not by academic discipline. Cell standing:

`STRONG` a specific mechanism, test, or theorem transfers with prerequisites met ·
`PLAUS` a transfer is available but a prerequisite is unmet or unverified ·
`WEAK` resemblance only; no falsifier survives ·
`CONTRA` the framework contradicts a v2 commitment ·
`—` no evidence found

## Framework columns

| Code | Framework family | Anchor records |
|---|---|---|
| **AI** | Abstract interpretation, CEGAR, predicate abstraction | R001–R011 |
| **RF** | Refinement, simulation, contracts, compilation correctness | R012, R016–R022 |
| **RV** | Enforceability and monitorability | R013, R094–R096 |
| **BX** | Bidirectional transformation, consistency maintainers | R023–R030 |
| **PV** | Provenance, temporal databases, tamper-evident logs | R038–R045, R097–R098 |
| **BR** | Belief revision, truth maintenance, argumentation | R046–R054, R100 |
| **AZ** | Authorization logic, trust management, capabilities | R055–R062 |
| **CT** | Control, observability, receding horizon, invariant sets | R063–R070 |
| **IN** | Institutions and compositional semantics | R071–R073 |
| **NI** | Non-stochastic information, zero-error, sufficiency | R078–R079, R082 |
| **RX** | Reflection, fixed points, self-reference limits | R083–R088 |
| **CV** | Convergence under concurrency | R099 |

## Matrix

| Build function | AI | RF | RV | BX | PV | BR | AZ | CT | IN | NI | RX | CV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Constitutive invariant projection | PLAUS | **STRONG** | PLAUS | CONTRA | — | — | — | — | **STRONG** | — | — | — |
| Compilation correctness | PLAUS | **STRONG** | — | — | — | — | — | — | **STRONG** | — | — | — |
| Enforcement boundaries | — | PLAUS | **STRONG** | — | — | — | PLAUS | PLAUS | — | — | — | — |
| Runtime enforcement | — | PLAUS | **STRONG** | — | **STRONG** | — | **STRONG** | — | — | — | — | — |
| Local closure | **STRONG** | PLAUS | — | PLAUS | — | — | — | **STRONG** | — | PLAUS | — | — |
| Aperture preservation | **STRONG** | — | — | **STRONG** | — | PLAUS | — | **STRONG** | — | — | — | — |
| Revalidation | **STRONG** | — | PLAUS | — | — | **STRONG** | — | **STRONG** | — | — | — | — |
| Relevance selection | **STRONG** | — | — | — | — | — | — | — | — | **STRONG** | — | — |
| Controlled loss | **STRONG** | — | — | PLAUS | — | — | — | — | — | **STRONG** | — | — |
| Shape sufficiency | **STRONG** | PLAUS | — | — | — | — | — | PLAUS | — | **STRONG** | — | — |
| Incomplete-model action | PLAUS | — | — | — | — | PLAUS | — | **STRONG** | — | **STRONG** | — | — |
| Stable referential identity | — | — | — | PLAUS | **STRONG** | — | PLAUS | — | — | — | PLAUS | — |
| Provenance | — | — | — | — | **STRONG** | **STRONG** | PLAUS | — | — | — | — | — |
| Evidence return | PLAUS | — | PLAUS | **STRONG** | **STRONG** | **STRONG** | — | **STRONG** | — | PLAUS | — | CONTRA |
| Qualification | — | — | — | **STRONG** | — | **STRONG** | PLAUS | — | — | — | — | CONTRA |
| Standing | — | — | — | — | PLAUS | **STRONG** | PLAUS | — | — | — | — | CONTRA |
| Warrant | — | — | — | — | PLAUS | — | **STRONG** | — | — | — | PLAUS | — |
| Policy succession | — | — | — | — | **STRONG** | **STRONG** | **STRONG** | — | — | — | **STRONG** | — |
| Local/global validity | PLAUS | **STRONG** | — | — | — | — | — | PLAUS | **STRONG** | — | — | — |
| Recursive inspection | **STRONG** | — | — | — | — | — | — | — | PLAUS | — | **STRONG** | — |
| Propagation | — | PLAUS | — | PLAUS | **STRONG** | PLAUS | — | — | PLAUS | — | — | **STRONG** |

## Reading the matrix

**Three columns carry disproportionate weight.**

- **RV** (enforceability/monitorability) is STRONG on the two functions v2's enforcement
  invariant most depends on, and **it was not in the initial neighborhood list.** The
  reconnaissance's largest single return came from a neighborhood discovered during Shape.
- **BR** (belief revision / TMS) is STRONG on five functions clustered at the return path —
  the seam with the fewest existing v2 mechanisms.
- **CT** (control/observability) is STRONG on the closure-and-reopening cluster, where v2 has
  a triad of concepts and no soundness condition.

**Three rows are still thin.** `Stable referential identity`, `Warrant` and `Recursive
inspection` each have exactly one STRONG cell. For identity that is unsurprising and fine —
BUILD 0 solved it with a UUID and Golden Trace 01 proved it. For **warrant** it is a real
finding: the only mature machinery is authorization logic, and applying it requires a
primitive v2 does not have (Agent), which two independent columns (PV, AZ) both point at.

**Three CONTRA cells cluster in one column.** BX contradicts constitutive projection, and CV
contradicts qualification, standing and evidence return. Both contradictions come from the
same source: a framework that guarantees *automatic, total* incorporation of an update. That
is precisely what `current ≠ newest` forbids. **The two most natural engineering framings for
"keep two things in sync" are both incompatible with v2's central epistemic commitment**, and
noticing that early is worth more than any positive transfer here.

**Where no evidence was found.** Empty cells are honest. Nothing in the corpus speaks to
relevance selection from a provenance, authorization or control perspective; nothing speaks
to warrant from abstract interpretation or refinement. Those are unsearched regions, not
established absences — see QF-D-01.
