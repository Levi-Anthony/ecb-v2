DISPOSITION: EVIDENCE · NEIGHBORHOOD N05 · RECORDS R038–R045

# N05 — Provenance, Database Theory, Temporal State, Lineage

Primary seam: **S-4 — stable identity, history, receipts, exact active-state reconstruction.**

Neighborhood verdict: the most *implementable* neighborhood. Provenance semirings supply a
composition algebra for evidence with a genuine, load-bearing limitation at negation
(R041) that lands exactly on v2's `unknown ≠ nonexistent` invariant. Bitemporality (R042)
answers "which rule was active when" as a schema property rather than a discipline.

---

### R038 — Green, Karvounarakis, Tannen 2007 (provenance semirings)
`CITE` T. J. Green, G. Karvounarakis, V. Tannen. *Provenance semirings.* PODS '07, 31–40. doi:10.1145/1265530.1265535 · **VERIFIED**
`PROBLEM` Track *how* a query result was derived, not merely whether it holds.
`STRUCTURE` Annotate tuples with elements of a commutative semiring; join multiplies (joint use), union adds (alternative derivations). The polynomial semiring **N[X]** is the most general — every other provenance model is a homomorphic image of it.
`GUARANTEE` Provenance is computed compositionally with the query, and specializing later (to trust levels, confidence, why-provenance, lineage) is a homomorphism from N[X].
`LOSS` Whatever the chosen semiring's homomorphism collapses. Computing in N[X] and specializing later loses nothing.
`DETECTOR` Two derivations with different provenance polynomials that the chosen semiring identifies.
`REOPEN` Recompute in a finer semiring — or, if N[X] was retained, just re-specialize.
`SEAM` S-4, S-3
`INTERNAL` Evidence Link ("typed connection between a claim/evaluation and stable evidence"). OB1 `memory_source_refs` (coded DEFER).
`DELTA` **Supplies the composition algebra Evidence Link does not have.** v2 can say a claim is supported by evidence; it cannot say a claim is supported by *(E1 and E2) or E3*, nor compute that structure automatically. The + / × distinction is exactly the alternative/joint distinction governance adjudication needs. The N[X] genericity result carries a direct build instruction: **record the most general provenance and specialize at read time**, which matches "structure is earned" — do not freeze a trust semiring before the standing vocabulary (AP-01) exists.
`TRANSFER` Evidence Links carry provenance annotations composing as a commutative semiring; persist the polynomial form; derive standing-facing views as homomorphisms.
`PREREQ` Evidence combination must actually be associative, commutative, and distributive. Human-adjudicated qualification may violate distributivity — testable at BUILD 3.
`PRESERVE` `evidence ≠ assertion`; provenance records support structure, never truth. `confidence ≠ standing` — a semiring value is not a standing.
`FALSIFIER` A v2 adjudication where combining evidence is order-dependent or non-distributive; then the semiring laws fail and only a weaker structure applies.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` PERSISTENCE — an annotation column on Evidence Link.
`RETURN` Yes — returned evidence composes into existing provenance rather than replacing it.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R039 — Buneman, Khanna, Tan 2001 (why and where provenance)
`CITE` P. Buneman, S. Khanna, W.-C. Tan. *Why and where: A characterization of data provenance.* ICDT 2001, LNCS 1973, 316–330. · **VERIFIED**
`PROBLEM` Distinguish kinds of provenance question.
`STRUCTURE` **Why**-provenance (which source tuples witness this result) vs. **where**-provenance (which source location the value was copied from).
`GUARANTEE` Each question gets a formally distinct answer; they are not interchangeable.
`LOSS` Each notion is blind to the other's question.
`DETECTOR` Answering a why-question with where-data (or vice versa) produces a wrong answer.
`REOPEN` Compute the other notion.
`SEAM` S-4
`INTERNAL` "source/provenance metadata" on BUILD 0's `thoughts` row; `docs/ob1-prior-art.md` treats provenance as one concern.
`DELTA` **Exposes a live conflation.** BUILD 0's `source` field is a *where*-provenance (which door/client the text arrived through). Governance at BUILD 3 will need *why*-provenance (which evidence witnesses this claim). These are different questions, and a `source` string cannot answer the second. Naming this now prevents BUILD 3 from overloading a field that already exists and looks adequate.
`TRANSFER` Keep where-provenance (capture source) and why-provenance (evidential witness) as separate typed structures; do not derive one from the other.
`PREREQ` None.
`PRESERVE` `evidence ≠ assertion`; `omission ≠ irrelevance`.
`FALSIFIER` A v2 case where the capture source fully determines the evidential witness set — true only for single-source claims.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` NONE now; shapes BUILD 3 schema.
`RETURN` Yes.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R040 — Cheney, Chiticariu, Tan 2009 (provenance in databases)
`CITE` J. Cheney, L. Chiticariu, W.-C. Tan. *Provenance in databases: Why, how, and where.* Foundations and Trends in Databases 1(4), 379–474, 2009. · **HIGH**
`PROBLEM` Unify the why/how/where provenance notions and their relationships.
`STRUCTURE` Survey with formal comparisons; how-provenance (semirings) is shown to be the most informative of the three.
`GUARANTEE` A containment hierarchy among provenance notions.
`LOSS` As per notion.
`DETECTOR` Using a weaker notion where a stronger is required.
`REOPEN` Move up the hierarchy.
`SEAM` S-4
`INTERNAL` As R038/R039.
`DELTA` Confirms the build instruction from R038 with an ordering argument: how-provenance dominates why- and where-provenance, so recording how-provenance and deriving the others is strictly better than the reverse. Efficient screening instrument; also marks neighborhood saturation for provenance notions specifically.
`TRANSFER` Persist how-provenance; derive why and where as views.
`PREREQ` As R038.
`PRESERVE` As R038.
`FALSIFIER` Storage or comprehensibility cost of how-provenance proves prohibitive at v2's scale — a real risk for a personal-scale system and the reason this is priority 2, not 3.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` PERSISTENCE
`RETURN` Yes.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R041 — Geerts & Poggi 2010 (K-relations and difference)
`CITE` F. Geerts, A. Poggi. *On database query languages for K-relations.* Journal of Applied Logic 8(2), 173–185, 2010. · **MEDIUM**
`PROBLEM` Semiring provenance is defined for **positive** relational algebra. Difference/negation does not fit.
`STRUCTURE` Semirings with monus (m-semirings) to give difference a provenance semantics; known to be delicate and not fully canonical.
`GUARANTEE` A provenance semantics for a restricted treatment of difference.
`LOSS` The clean genericity of N[X] does not survive negation unmodified.
`DETECTOR` A query using difference whose provenance is not determined by the positive fragment.
`REOPEN` Restrict to positive queries, or accept a non-canonical monus.
`SEAM` S-4, S-3
`INTERNAL` `unknown ≠ nonexistent`; `omission ≠ irrelevance`; BUILD 0's rule that "missing identity is an explicit not-found result, never evidence of nonexistence beyond this store."
`DELTA` **The most important limitation found in this neighborhood.** v2's invariants sit precisely in the gap where provenance theory is weakest. Provenance semirings will handle "this claim is supported by E1 and E2" beautifully and will **not** handle "this claim is unsupported because no evidence was found" — which is exactly the negative-evidence case `unknown ≠ nonexistent` protects. Adopting R038 without this caveat would produce a system that silently treats absence of provenance as provenance of absence.
`TRANSFER` Apply semiring provenance only to the **positive** fragment of evidence composition. Absence of supporting evidence must be represented by an explicit typed observation ("searched, not found, at time t, over scope S"), never by an empty annotation.
`PREREQ` A representation for negative/absence evidence — which v2 does not have and which BUILD 3 will need.
`PRESERVE` `unknown ≠ nonexistent`; `omission ≠ irrelevance`.
`FALSIFIER` A v2 adjudication that legitimately treats an empty provenance annotation as evidence of absence; that would contradict a frozen invariant, so finding one is an architecture problem, not a transfer problem.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` OBJECT — an explicit absence-observation type.
`RETURN` Yes — "not found" is returnable evidence with its own scope and time.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R042 — Jensen & Snodgrass (bitemporal data)
`CITE` C. S. Jensen, R. T. Snodgrass. *Semantics of time-varying information.* Information Systems 21(4), 311–352, 1996; and *Temporal data management*, IEEE TKDE 11(1), 36–44, 1999. · **MEDIUM** (two related works; TKDE is the compact citable one)
`PROBLEM` Distinguish when a fact was true in the world from when the database knew it.
`STRUCTURE` **Valid time** (when the fact holds) and **transaction time** (when it was recorded), independently. Bitemporal relations carry both.
`GUARANTEE` Exact reconstruction of what the database believed at any past instant — and of what it now believes was true at any past instant. These are different queries and both are answerable.
`LOSS` Nothing, at the cost of schema and query complexity.
`DETECTOR` A retroactive correction that cannot be distinguished from an original record.
`REOPEN` n/a — the schema prevents the failure structurally.
`SEAM` S-6, S-4
`INTERNAL` `current ≠ newest`; "Governance state must be reconstructible after restart"; ECO-46's supersession stamps; ADR reopening conditions.
`DELTA` **Directly answers a large part of H11.** "Which rule was active at time t?" is a valid-time query. "When did we come to believe that?" is a transaction-time query. "Is a successor being applied retroactively to justify its own activation?" is exactly a **valid-time-precedes-transaction-time** anomaly — mechanically detectable as a schema-level check rather than a matter of vigilance. v2 currently has one timestamp (`captured_at`), which cannot express this and will silently permit backdating.
`TRANSFER` Governance activation records are bitemporal. A policy's authority over an act at time t requires the policy's valid-time interval to contain t **and** its transaction-time to precede the act's record. Backdating becomes a constraint violation, not an oversight.
`PREREQ` Two timestamps and a constraint. Cheap and structural.
`PRESERVE` `current ≠ newest`; `evidence ≠ assertion`.
`FALSIFIER` A legitimate v2 case requiring a policy to govern an act recorded before the policy — i.e. genuine retroactive authorization. If governance ever wants that, it must be an explicit, separately warranted operation, not an accident.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` **STRUCTURAL** — this is the finding's main value: it moves a governance obligation from vigilance to a schema constraint.
`COST` PERSISTENCE — a second time dimension on governance records.
`RETURN` Yes — returned evidence carries its own valid/transaction times.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R043 — Helland 2015 (immutability changes everything)
`CITE` P. Helland. *Immutability changes everything.* CIDR 2015; ACM Queue 13(9), 2015. · **HIGH**
`PROBLEM` Reconcile append-only storage with the need for a current view.
`STRUCTURE` Immutable facts plus derived, recomputable current-state views; "the truth is the log, the database is a cache of the log."
`GUARANTEE` History is never lost; current state is always reconstructible and always derived.
`LOSS` Storage; and the convenience of in-place update.
`DETECTOR` Current state that cannot be recomputed from the log — a sign of hidden mutable state.
`REOPEN` Recompute the view.
`SEAM` S-4, S-6
`INTERNAL` Event as immutable record; "Correction creates a successor event"; "Governance state must be reconstructible after restart."
`DELTA` **Supplies the acceptance test for a rule v2 already holds.** The reconstructibility requirement is currently a stated intention with no way to check it. The log-as-truth framing gives a direct test: drop all derived governance state, recompute from the event log, and require the result to equal what was there. Any divergence localizes hidden mutable state.
`TRANSFER` Freeze a reconstruction test: derived governance state must be recomputable from the event log alone, and equality is checked, not assumed.
`PREREQ` An event log with complete coverage of consequential transitions. BUILD 5.
`PRESERVE` `current ≠ newest` — reconstruction must reproduce *designation*, not merely replay in order.
`FALSIFIER` A v2 governance state that legitimately depends on something outside the log (e.g. a human's undocumented decision). Finding one is valuable: it names an unlogged authority input.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` OBSERVATIONAL, STRUCTURAL
`COST` NONE beyond planned Events.
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_TEST
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 2

### R044 — Gupta & Mumick 1995 (materialized view maintenance)
`CITE` A. Gupta, I. S. Mumick. *Maintenance of materialized views: Problems, techniques, and applications.* IEEE Data Engineering Bulletin 18(2), 3–18, 1995. · **HIGH**
`PROBLEM` Keep a derived view current as base data changes, without full recomputation.
`STRUCTURE` Incremental maintenance; **self-maintainability** — whether a view can be updated from the change alone, without consulting the base.
`GUARANTEE` The view equals what full recomputation would produce.
`LOSS` None, when applicable; some views are not incrementally maintainable.
`DETECTOR` Incremental result differs from recomputation.
`REOPEN` Fall back to full recomputation.
`SEAM` S-4, S-7
`INTERNAL` ECB handoff snapshots and derived orientation — derived views over an event stream, maintained by recompilation.
`DELTA` Names a property v2's derived surfaces need and do not declare: **self-maintainability**. ECB's handoff snapshot is a materialized view with a watermark sequence number; whether it can be correctly advanced from new events alone, or must be recompiled from scratch, is currently unstated. Getting this wrong produces a snapshot that is stale in a way no one can see.
`TRANSFER` Every derived governance view declares whether it is self-maintainable; those that are not must be recompiled rather than incrementally advanced, and the choice is recorded.
`PREREQ` Views identified as views. ECB already has watermarks, so the machinery is half present.
`PRESERVE` `current ≠ newest`.
`FALSIFIER` All v2 derived views prove self-maintainable — checkable and would be good news.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` NONE
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R045 — Moreau et al. 2013 (W3C PROV-DM)
`CITE` L. Moreau, P. Missier et al. *PROV-DM: The PROV Data Model.* W3C Recommendation, 30 April 2013. · **HIGH**
`PROBLEM` Interchange provenance across systems that do not share a schema.
`STRUCTURE` Three core types — **Entity, Activity, Agent** — with relations (used, wasGeneratedBy, wasAttributedTo, wasDerivedFrom, actedOnBehalfOf).
`GUARANTEE` Interoperable provenance interchange; explicit attribution and delegation relations.
`LOSS` Domain-specific detail not expressible in the core types.
`DETECTOR` A provenance question the core relations cannot express.
`REOPEN` Extend with domain-specific subtypes.
`SEAM` S-4, S-6
`INTERNAL` The five Layer B primitives (Referent, Claim, Evidence Link, Event, Artifact).
`DELTA` A mature, deployed cross-system vocabulary whose **Agent** type and `actedOnBehalfOf` relation cover a distinction v2's five primitives do not: v2 has no first-class actor. Warrant is defined as "authorizing a specified operation **by a specified actor**", so the actor is load-bearing in the definition and absent from the primitive set. `actedOnBehalfOf` is also exactly delegation, which BUILD 6–7 requires.
`TRANSFER` Do **not** adopt PROV-DM as a schema — it is an interchange model, and importing it would violate structure-is-earned. Adopt the finding that Agent must be first-class before BUILD 6, and mine PROV's relation set when BUILD 5 defines Event fields.
`PREREQ` None to mine; adoption as schema would be a large unearned import.
`PRESERVE` Structure-is-earned; `capability ≠ warrant` (PROV attributes, it does not authorize).
`FALSIFIER` v2's Claim provenance fields turn out to carry the actor adequately without a distinct Agent referent — possible at small scale, but it collapses `identity ≠ description`.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` OBJECT — an Agent referent, at BUILD 6.
`RETURN` Yes — returned evidence needs an attributable agent.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2
