STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: Output G — warranted full-text shortlist
AUTHORITY: None

# Full-Text Shortlist

> **Plain-English note.** Of the 100 papers, these 21 are worth reading in full. Each entry says
> **the specific question its abstract could not answer** — that is the reason to read it. A paper
> that is merely interesting is not here.
>
> **Useful if you or someone else is going to do the reading.** The last section names the three to
> read if only three get read. Terms are decoded in [`GLOSSARY.md`](GLOSSARY.md).

21 papers, from 100 coded abstracts. Each entry states **the specific question the abstract
could not answer** — the warrant for reading further. A paper interesting but not
build-decisive is not here.

---

## FOUNDATIONAL — read to get the transfer right (6)

| # | Source | What the abstract cannot settle |
|---|---|---|
| 1 | **R013** Alpern & Schneider, *Defining liveness* (IPL 1985) | Whether v2's non-collapse invariants are trace properties at all. Several read as properties of *sets* of executions (hyperproperties), which sit outside the safety/liveness decomposition entirely. The decomposition theorem's exact scope decides how much of TC-001 applies. |
| 2 | **R094** Schneider, *Enforceable security policies* (TISSEC 2000) | The precise definition of the EM class and its assumptions — specifically what "the monitor cannot know the future and can only halt" excludes, and whether v2's transaction-scoped guards satisfy it. TC-001 and CF-05 rest on this. |
| 3 | **R031** Plotkin, *LCF considered as a programming language* (TCS 1977) | Whether the kernel construction survives when the observation itself is partial — i.e. when `Permitted_O` is undefined rather than merely different. FP-003's design depends on this. |
| 4 | **R071** Goguen & Burstall, *Institutions* (JACM 1992) | What minimum structure a "signature morphism with a reduct" actually demands, and whether a governance projection supplies it without a full categorical apparatus. TC-009's cost estimate rests on this. |
| 5 | **R049** Hansson, *Semi-revision* (JANCL 1997) | The exact postulate list, and which postulates a human-adjudicated consolidation function can be expected to satisfy. TC-007's acceptance tests come from here. |
| 6 | **R012** Abadi & Lamport, *The existence of refinement mappings* (TCS 1991) | The three side conditions (machine closure, finite invisible nondeterminism, internal continuity) and whether a governance projection can meet them. Determines whether TC-010 audits can yield false negatives. |

## BUILD-PROMISING — read before implementing (7)

| # | Source | What the abstract cannot settle |
|---|---|---|
| 7 | **R017** Pnueli, Siegel & Singerman, *Translation validation* (TACAS 1998) | The witness format and what makes a validator genuinely independent of the compiler. This is the operation's top implementation candidate (TC-003) and the format is the whole design. |
| 8 | **R038** Green, Karvounarakis & Tannen, *Provenance semirings* (PODS 2007) | Whether v2's evidence composition satisfies the semiring laws — particularly **distributivity**, which human adjudication may break. If it fails, TC-011 needs a weaker algebra. |
| 9 | **R052** Doyle, *A truth maintenance system* (AIJ 1979) | The exact justification structure and the cost of dependency-directed backtracking at v2's scale. **Time-critical**: TC-014's prerequisite expires if BUILD 3 ships without justification structure. |
| 10 | **R042** Jensen & Snodgrass, bitemporal semantics | The constraint formulation that makes backdating a violation rather than a query, and how it interacts with corrections. TC-012 is the cheapest structural win found and this is its detail. |
| 11 | **R096** Bauer, Leucker & Schallhart, *Runtime verification for LTL and TLTL* (TOSEM 2011) | The precise monitorability characterization, and how `inconclusive` should be persisted so it is not later read as a pass. TC-002 depends on it. |
| 12 | **R097** Crosby & Wallach, *Efficient data structures for tamper-evident logging* (USENIX Sec. 2009) | Whether git's existing commit structure already discharges most of TC-013, and what an external commitment point must actually guarantee. |
| 13 | **R065** Mayne, Rawlings, Rao & Scokaert, *Constrained MPC* (Automatica 2000) | How recursive feasibility is established in practice — terminal sets are usually *designed*, not computed. The design method is what TC-015 needs. |

## DISCONFIRMING / GUARDRAIL — read to avoid a mistake (5)

| # | Source | What the abstract cannot settle |
|---|---|---|
| 14 | **R023** Foster et al., *Combinators for bidirectional tree transformations* (TOPLAS 2007) | Exactly which weakenings of the lens laws exist and whether any is compatible with qualification. NR-02 is a strong negative; it should be checked against the weakest published variant before being frozen. |
| 15 | **R046** Alchourrón, Gärdenfors & Makinson (JSL 1985) | Which AGM postulates survive dropping Success, and which of those v2 should *want*. NR-03 rejects the theory; the salvage is what matters. |
| 16 | **R041** Geerts & Poggi, *On database query languages for K-relations* (JAL 2010) | How badly negation actually breaks semiring provenance, and whether m-semirings offer anything usable. This bounds TC-011's negative-evidence half — the load-bearing part. |
| 17 | **R061** Miller, Yee & Shapiro, *Capability myths demolished* (2003) | The precise confused-deputy conditions, to determine whether BUILD 0's door already exhibits it in a way that matters, or only in a way that is currently harmless. |
| 18 | **R099** Shapiro et al., *Conflict-free replicated data types* (SSS 2011) | Whether a CRDT exists whose merge is *refusal* rather than resolution — which would let convergence reach further up than TC-018 currently allows. |

## SYNTHESIS / REVIEW — read for efficient coverage (3)

| # | Source | What the abstract cannot settle |
|---|---|---|
| 19 | **R040** Cheney, Chiticariu & Tan, *Provenance in databases* (FnTDB 2009) | The containment hierarchy's practical cost, which decides whether "record how-provenance, derive the rest" is affordable at personal scale. |
| 20 | **R033** van Glabbeek, *The linear time – branching time spectrum I* (2001) | Where v2's several observers actually sit on the spectrum — the input to indexing ∼(M,O) by observer as R033 requires. |
| 21 | **R030** Czarnecki et al., *Bidirectional transformations: a cross-discipline perspective* (ICMT 2009) | Whether any of the four BX law sets is compatible with qualification. Confirms or overturns NR-02 at low cost. |

---

## Reading order if only three can be read

1. **R094** (Schneider) — decides whether v2's enforcement classification is sound as written.
2. **R017** (translation validation) — the implementation candidate with the best cost/benefit.
3. **R052** (Doyle) — the only shortlist item with an **expiring** prerequisite: BUILD 3.
