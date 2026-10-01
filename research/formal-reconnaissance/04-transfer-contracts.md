STATUS: COMPLETE — NONE PROMOTED
DISPOSITION: EVIDENCE
ROLE: Output D — Transfer Contract Registry
AUTHORITY: None. A transfer contract is a proposal with a falsifier, not a decision.

# Transfer Contract Registry

> **Plain-English note.** These are the nineteen proposals in full. Each one says: what problem it
> addresses, what the paper actually established, exactly what I propose moving across, what would
> have to be true first, what must not break, and **what would prove it wrong**.
>
> **You do not need to read this.** The six that matter are in plain English in
> [`EXECUTIVE-EXTRACTION.md`](EXECUTIVE-EXTRACTION.md). This file exists so a claim can be traced
> and argued with. The first five are ordered by how much they would change what you build next.
> Terms are decoded in [`GLOSSARY.md`](GLOSSARY.md).

Nineteen transfers survived the §12 admission chain
(NATIVE DEFINITION → NATIVE PREREQUISITES → ACTUAL SIGMA/ECOS INSTANTIATION →
PRECISE TRANSFER PROPOSITION → TESTABLE CONSEQUENCE).

Transfers that broke the chain are in `06-negative-results.md`, not here.

**Ordering is by build leverage, not by neighborhood.** TC-001 through TC-005 are the ones
that change what should be built next.

---

## TC-001 — Classify obligations as safety or liveness before assigning an enforcement mode

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S2. Every consequential transition declares an enforcement mode and surface; none may depend solely on an agent remembering an instruction. |
| **Aperture** | RQ-02 — nothing states which obligations a given surface *can* bear. |
| **Sources** | R013, R014, R094 |
| **Established source claim** | Every trace property is the intersection of a safety and a liveness property (Alpern & Schneider). Execution monitors enforce **exactly** the safety properties (Schneider). |
| **Transfer proposition** | Each consequential obligation is classified safety / liveness / conjunction before a mode is assigned. Liveness components must be bounded into safety (a deadline, a required-by-event, a bounded horizon) or explicitly assigned to the AUTHORITY surface with a named fairness assumption. |
| **Prerequisites** | Obligations expressed as properties of event traces. v2 has events from BUILD 5; the classification can be done on paper now. |
| **Preservation obligation** | The enforcement invariant. This transfer strengthens it: an unbounded liveness obligation with no deadline **is** an instruction someone must remember. |
| **Falsifier** | Exhibit a v2 liveness obligation that a finite-trace mechanism genuinely enforces. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | Determines the assignment across all four classes |
| **Primitive cost** | NONE |
| **Return-path consequence** | "Evidence will be returned" is liveness and needs bounding. |
| **Build consequence** | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. Routed to governance as **ACP-01**. |

## TC-002 — Three-valued verdicts on every observational check

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S2 (observational surface) and the frozen invariants `unknown ≠ nonexistent`, `unclassified ≠ invalid`. |
| **Aperture** | RQ-02 |
| **Sources** | R096, R054 |
| **Established source claim** | A monitor over a finite prefix has three honest verdicts: true, false, inconclusive. Monitorable properties are strictly larger than safety ∪ co-safety. |
| **Transfer proposition** | Observational checks return one of {satisfied, violated, inconclusive}. `inconclusive` is persisted with its scope and observed prefix. Non-monitorable obligations are excluded from the observational surface by construction rather than checked and silently passed. |
| **Prerequisites** | An event alphabet and obligations stated over it. |
| **Preservation obligation** | `unknown ≠ nonexistent`; `omission ≠ irrelevance`. A two-valued monitor collapses exactly these. |
| **Falsifier** | All v2 observational obligations are two-valued-decidable on finite prefixes. Golden Trace 01 is; governance obligations will not be. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | OBSERVATIONAL |
| **Primitive cost** | NONE — a verdict field |
| **Return-path consequence** | `inconclusive` is returnable evidence with its own standing. |
| **Build consequence** | ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal, ready for BUILD 5 Shape. |

## TC-003 — Projections emit a validation witness; an independent validator gates acceptance

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S1. A constitutive invariant must acquire a projection sufficient to constrain runtime behavior. |
| **Aperture** | RQ-01 — v2 has no notion of a projection being *correct* rather than *documented*. |
| **Sources** | R017, R016, R018 |
| **Established source claim** | Translation validation checks each compilation run rather than verifying the compiler (Pnueli, Siegel, Singerman). Semantic preservation is stated modulo a declared observation and only for well-formed sources (Leroy). |
| **Transfer proposition** | Every SIGMA→ECOS projection emits a witness that the declared observation set was preserved. Acceptance of the resulting envelope is conditional on an independent validator — not sharing the compiler's code path — accepting the witness. |
| **Prerequisites** | (i) a declared observation set (adopt FS-0001's four: consequential permissions, limits, provenance obligations, revalidation triggers); (ii) a witness format; (iii) a separate validator. |
| **Preservation obligation** | `map ≠ mapper` — a validator sharing the compiler's derivation is circular. `capability ≠ warrant` — passing validation licenses the projection, not the action. |
| **Falsifier** | Construct a projection that passes validation while violating a covered obligation. That falsifies the witness format, not the method — and is the point of FP-001. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | STRUCTURAL (gate) + OBSERVATIONAL (witness as receipt) |
| **Primitive cost** | OBJECT (witness) + EVENT (validation outcome) |
| **Return-path consequence** | Validation failure returns as evidence of projection insufficiency. |
| **Build consequence** | ADD_IMPLEMENTATION_CANDIDATE |
| **Standing** | Proposal. Prototype-worthy; see FP-001. Links to Linear ECO-72 (D2E compiler). |

## TC-004 — Consequential agent actions carry a checkable warrant witness

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S2 and REQ-S6. No consequential transition depends on an agent remembering; `capability ≠ warrant`; `confidence ≠ standing`. |
| **Aperture** | RQ-06 |
| **Sources** | R018, R059, R055 |
| **Established source claim** | Proof-carrying code and proof-carrying authentication move trust from the producer to a small fixed checker; the checker stays constant as policies change. |
| **Transfer proposition** | A consequential agent-produced transition presents a warrant derivation that a small fixed checker validates. Acceptance depends on the check, never on the producer's standing, confidence, or reputation. The human rail adjudicates only what the checker cannot decide. |
| **Prerequisites** | Policy fragments expressible as checkable predicates; a checker markedly simpler than the producer. Where the policy is a semantic judgment this fails — which is exactly TC-001's boundary. |
| **Preservation obligation** | `capability ≠ warrant`; `standing ≠ warrant`; `confidence ≠ standing`. |
| **Falsifier** | Every consequential v2 transition requires irreducible semantic judgment, leaving the checkable fragment empty. Partial coverage still reduces the human queue and is the realistic expectation. |
| **Branch** | BRANCH_COMPATIBLE |
| **Enforcement class** | STRUCTURAL + AUTHORITY |
| **Primitive cost** | OBJECT (witness) + GOVERNANCE (checker as a designated surface) |
| **Return-path consequence** | Check failures return as evidence. |
| **Build consequence** | ADD_IMPLEMENTATION_CANDIDATE |
| **Standing** | Proposal, not before BUILD 6. |

## TC-005 — Define ∼(M,O) as the kernel of the permission function

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S5. Bounded local closure that collapses only what the current Move does not need. |
| **Aperture** | AP-10; RQ-05. FS-0001 asserts ∼(M,O) informally. |
| **Sources** | R031, R078, R032, R035 |
| **Established source claim** | Contextual equivalence is the kernel of an observation function quantified over contexts. The kernel of any function is an equivalence relation by construction. A statistic is sufficient for a decision problem iff the decision factors through it. |
| **Transfer proposition** | `x ∼(M,O) y ⟺ Permitted_O(x) = Permitted_O(y)`. An abstraction *a* is **adequate for O** iff γ(a) lies within a single ∼(M,O) class. FS-0001's TG-02 fires exactly on the negation. |
| **Prerequisites** | Only that `Permitted_O` is a function — that permission is determined by state given (M, O). Already assumed throughout v2. **No metric, order, lattice, or probability is required or introduced.** |
| **Preservation obligation** | `operational equivalence ≠ identity`; `operational classification ≠ ontological exhaustion`. Equivalence stays indexed by (M, O) and by observer (R033); it is never asserted absolutely, and it must never merge referents (R036). |
| **Falsifier** | `Permitted_O` is not a function — the same state under the same key and operation yields different permissions. **FP-003 tests this directly and cheaply.** |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | SEMANTIC + OBSERVATIONAL |
| **Primitive cost** | **NONE** |
| **Return-path consequence** | None directly; but see TC-016, which uses the same kernel construction on the return path. |
| **Build consequence** | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. Highest ratio of rigour gained to cost incurred in the operation. Open congruence obligation (R035) before compositional use at BUILD 9. |

## TC-006 — Model SIGMA↔ECOS as a consistency relation with a restoration maintainer

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S1 and REQ-S3. Return is not overwrite; qualification precedes any standing change. |
| **Aperture** | RQ-04 — H8: is this a bidirectional transformation? |
| **Sources** | R026 positive; R023, R027, R029 negative |
| **Established source claim** | Constraint maintainers restore a consistency relation with **stability** rather than round-trip identity, and admit non-unique, policy-selected restorations. Well-behaved lenses instead require **PutGet**, which forces unconditional acceptance of the update. |
| **Transfer proposition** | Represent the cycle as a consistency relation R ⊆ SIGMA × ECOS with (a) a projection maintainer SIGMA→ECOS, (b) a return maintainer ECOS→SIGMA whose output is a **qualification proposal**, not a state change, and (c) stability — a consistent pair is left alone. Do not describe the cycle as bidirectional in v2 documents. |
| **Prerequisites** | R stated explicitly. Currently implicit everywhere. |
| **Preservation obligation** | `current ≠ newest`; `evidence ≠ assertion`; "return is not overwrite." |
| **Falsifier** | A seam where consistency cannot be stated as a relation because the two sides share no common vocabulary. Plausible for constitutive meaning vs. runtime state — this is FP-002. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | SEMANTIC + AUTHORITY |
| **Primitive cost** | OBJECT — the consistency relation is an artifact |
| **Return-path consequence** | Return produces proposals, matching ECB's existing `propose_artifact_patch` lifecycle exactly. |
| **Build consequence** | SHARPEN_CONTRACT + ADD_IMPLEMENTATION_CANDIDATE |
| **Standing** | Proposal. Answers H8 in the negative for lenses and supplies the replacement. |

## TC-007 — Qualification is credibility screening followed by non-prioritized revision

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S3. `current ≠ newest`; returned evidence must be qualified before altering standing. |
| **Aperture** | RQ-03 |
| **Sources** | R049, R050, R051 positive; R046, R047 negative |
| **Established source claim** | AGM's **Success** postulate (`A ∈ K*A`) makes acceptance axiomatic. Semi-revision drops it: the input may itself be what consolidation discards. Credibility-limited revision adds an explicit admissibility set and a defined reject-without-change outcome. |
| **Transfer proposition** | Qualification = (i) credibility screening against an explicit admissibility criterion, then (ii) non-prioritized revision in which the input may be rejected. Screening and revision are separately warranted operations. **Changing the admissibility criterion requires the governance route and may never travel the evidence path.** |
| **Prerequisites** | A belief **base** (explicitly held items), not a deductively closed theory — which is what v2 has, making this a better fit than AGM. An explicit admissibility criterion; currently the human rail. |
| **Preservation obligation** | `current ≠ newest`; `relevance ≠ authority`; `standing ≠ warrant`. |
| **Falsifier** | A v2 qualification outcome that violates a semi-revision postulate for a good reason — which would show the postulate set is wrong for v2 and is genuinely informative. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | SEMANTIC + AUTHORITY |
| **Primitive cost** | OBJECT — the admissibility criterion |
| **Return-path consequence** | Defines the outcome vocabulary: accepted / rejected-without-change / accepted-in-part / untranslatable (R025) / inconclusive (R096). |
| **Build consequence** | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. Input to AP-01's standing vocabulary. **v2 independently reinvented semi-revision** (ECB Charter's intake lane). |

## TC-008 — The return payload carries an update-vs-revision discriminator

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S3. The return carries "contradiction, detected insufficiency, **and changed conditions**." |
| **Aperture** | RQ-03 |
| **Sources** | R048 |
| **Established source claim** | Revision (our beliefs were wrong) and update (the world changed) satisfy different postulate sets and give different results on the same input. |
| **Transfer proposition** | The return payload carries an explicit input-type discriminator; qualification branches on it. Where the type is undeterminable, the item routes to human judgment rather than defaulting. |
| **Prerequisites** | The distinction must be determinable at return time — often it is not, and that is itself the finding. |
| **Preservation obligation** | `evidence ≠ assertion`; `truth ≠ relevance`. |
| **Falsifier** | A return where both treatments coincide — true only when the belief set is complete w.r.t. the changed proposition. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | SEMANTIC + AUTHORITY |
| **Primitive cost** | NONE — a discriminator field |
| **Return-path consequence** | Restructures the payload. |
| **Build consequence** | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. The conflation is currently visible in the architecture's own return list. |

## TC-009 — Projection correctness as a satisfaction condition

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S1. |
| **Aperture** | RQ-01; H4. |
| **Sources** | R071, R072 |
| **Established source claim** | In an institution, `M' ⊨ σ(φ) ⟺ M'|σ ⊨ φ` — truth is invariant under change of notation. Failure of the condition is exhibitable as a concrete counterexample. |
| **Transfer proposition** | An ECOS runtime state satisfies the projected invariant **iff** its SIGMA reduct satisfies the source invariant. A counterexample to the "iff" is semantic corruption and blocks the projection. |
| **Prerequisites** | (i) a sentence form for SIGMA invariants; (ii) an ECOS model notion; (iii) a **reduct** from ECOS state to its SIGMA-relevant part. The reduct is the only genuinely new artifact. |
| **Preservation obligation** | `map ≠ referent`; `runtime reorientation ≠ constitutional redesign`. |
| **Falsifier** | A SIGMA invariant with no ECOS reduct — one whose truth is not determined by runtime state. Invariants about *authority* are the likely cases. Note this is the same boundary TC-016 finds from observability: two independent neighborhoods converge on it. |
| **Branch** | BRANCH_COMPATIBLE |
| **Enforcement class** | STRUCTURAL + SEMANTIC |
| **Primitive cost** | OBJECT — the reduct |
| **Return-path consequence** | Satisfaction failure is high-value returned evidence. |
| **Build consequence** | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. Requires **far less** than "ECOS is a functor" — see NR-06. |

## TC-010 — "Lawful operational implementation" as behavior inclusion under a state mapping

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S1; H9's DECLARED → PROJECTED → IMPLEMENTED → ENFORCED → OBSERVED → REQUALIFIED ladder. |
| **Aperture** | RQ-01 |
| **Sources** | R012, R022, R020 |
| **Established source claim** | A refinement mapping witnesses that every concrete behavior maps to a legal abstract behavior; history and prophecy variables may be required, so a correct implementation can lack a mapping without extra state. Forward and backward simulations are duals and neither alone is complete. |
| **Transfer proposition** | "ECOS mechanism M lawfully implements SIGMA invariant I" means: there is a mapping from ECOS states to SIGMA states under which every ECOS behavior is a legal SIGMA behavior, modulo stuttering. Refinement may **only reduce** nondeterminism (R020): ECOS may resolve a SIGMA-open choice, never widen a SIGMA-closed one. An audit must try forward **and** backward relations before declaring failure. |
| **Prerequisites** | Both levels as state machines with defined behaviors. ECOS has this in principle; SIGMA does not yet. |
| **Preservation obligation** | `map ≠ mapper` — the mapping is itself an artifact needing a referent. |
| **Falsifier** | A SIGMA invariant not expressible as a property of behaviors — e.g. one about *why* a state was reached. Several v2 invariants may be of this kind (QF-B-02). |
| **Branch** | BRANCH_COMPATIBLE |
| **Enforcement class** | STRUCTURAL + OBSERVATIONAL |
| **Primitive cost** | OBJECT |
| **Return-path consequence** | A mapping failure is returnable evidence. |
| **Build consequence** | SHARPEN_CONTRACT |
| **Standing** | Proposal. Guards against false-positive audits as much as it enables true ones. |

## TC-011 — Semiring provenance for positive composition; explicit typed absence for the rest

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S4. Evidence Link; `unknown ≠ nonexistent`; `omission ≠ irrelevance`. |
| **Aperture** | AP-02; RQ-08 |
| **Sources** | R038, R040, R041, R054, R039 |
| **Established source claim** | Provenance forms a commutative semiring: join multiplies, union adds; N[X] is most general and everything else is a homomorphic image. The framework is defined for **positive** relational algebra; difference/negation is delicate and non-canonical. Closed-world negation is sound only under a genuine completeness assumption. |
| **Transfer proposition** | (a) Evidence Links carry provenance annotations composing as a commutative semiring; persist the most general form and derive standing-facing views as homomorphisms. (b) Apply this **only** to the positive fragment. (c) Absence of supporting evidence is represented by an explicit typed observation — "searched, not found, at time t, over scope S" — never by an empty annotation. (d) Any negative conclusion cites the scope over which completeness is asserted, and that assertion is itself a claim with provenance. |
| **Prerequisites** | Evidence combination genuinely associative, commutative and distributive. Human-adjudicated qualification may break distributivity — testable at BUILD 3. |
| **Preservation obligation** | `unknown ≠ nonexistent`; `evidence ≠ assertion`; `confidence ≠ standing` (a semiring value is not a standing). |
| **Falsifier** | v2 adjudication where combining evidence is order-dependent or non-distributive; then a weaker structure applies. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | STRUCTURAL |
| **Primitive cost** | PERSISTENCE (annotation) + OBJECT (absence-observation type) |
| **Return-path consequence** | Returned evidence composes into existing provenance rather than replacing it. |
| **Build consequence** | ADD_IMPLEMENTATION_CANDIDATE + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal for BUILD 3. Part (c) is the load-bearing half: adopting (a) without it produces a system that treats absence of provenance as provenance of absence. |

## TC-012 — Bitemporal governance activation makes retroactivity a constraint violation

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S6. `current ≠ newest`; governance state reconstructible after restart. |
| **Aperture** | RQ-06; H11. |
| **Sources** | R042, R043 |
| **Established source claim** | Valid time (when a fact holds) and transaction time (when it was recorded) are independent dimensions; both are queryable, and their relationship is checkable. |
| **Transfer proposition** | Governance activation records are bitemporal. A policy's authority over an act at time t requires its valid-time interval to contain t **and** its transaction-time to precede the act's record. Backdating becomes a constraint violation rather than an oversight. Additionally: derived governance state must be recomputable from the event log alone, and equality is checked. |
| **Prerequisites** | Two timestamps and a constraint. Cheap and structural. |
| **Preservation obligation** | `current ≠ newest`; reconstruction must reproduce **designation**, not merely replay in order. |
| **Falsifier** | A legitimate case requiring a policy to govern an act recorded before it — genuine retroactive authorization. If governance wants that, it must be an explicit separately-warranted operation, never an accident. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | **STRUCTURAL** |
| **Primitive cost** | PERSISTENCE |
| **Return-path consequence** | Returned evidence carries its own valid and transaction times. |
| **Build consequence** | ADD_IMPLEMENTATION_CANDIDATE |
| **Standing** | Proposal for BUILD 6. Moves a governance obligation from vigilance to a schema constraint — the single cheapest such move found. |

## TC-013 — The governance event log is tamper-evident and externally committed

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S6 and REQ-S4. Immutable events; reconstructible governance state. |
| **Aperture** | RQ-06; H11's atomicity question. |
| **Sources** | R097, R098, R086 |
| **Established source claim** | History trees give logarithmic membership and incremental consistency proofs, detecting retroactive alteration even by a malicious logger. Certificate Transparency adds public enumerability and split-view detection by gossip. A system cannot certify its own soundness. |
| **Transfer proposition** | The governance event log is a history tree; root commitments are held **outside** the system; rule-succession claims cite a consistency proof against a commitment predating the act. All warrant designations are enumerable, and cross-surface consistency checks detect split views. |
| **Prerequisites** | Append-only storage and an external commitment point. **A git repository already supplies both** — content-addressed commits with an external remote — so v2 is a partial instance already. |
| **Preservation obligation** | `evidence ≠ assertion` — a consistency proof is evidence of ordering, not of correctness. `capability ≠ warrant` — logging a designation does not validate it. |
| **Falsifier** | A threat model where the logger is fully trusted. Arguable for a single-operator system; fails as soon as agents write to the log, which is already the case. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | STRUCTURAL + OBSERVATIONAL |
| **Primitive cost** | PERSISTENCE |
| **Return-path consequence** | A failed consistency proof is a critical return. |
| **Build consequence** | ADD_IMPLEMENTATION_CANDIDATE |
| **Standing** | Proposal for BUILD 6. Completes H11 jointly with TC-012. |

## TC-014 — Claims record justifications; withdrawing evidence recomputes support

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S3. Evidence Link; AP-02. |
| **Aperture** | RQ-03; U-03 — **the baseline register's unanswered live question.** |
| **Sources** | R052, R053 |
| **Established source claim** | A JTMS holds a belief *in* only while a valid justification is; dependency-directed backtracking propagates retraction correctly. An ATMS label is the set of minimal environments under which a node holds. |
| **Transfer proposition** | Claims record justifications over Evidence Links. Withdrawing evidence triggers recomputation of support status for dependents. **Unsupported ≠ deleted and ≠ false.** Optionally (R053), a claim's standing is a label of minimal supporting evidence sets, so alternatives can be held simultaneously without premature adjudication. |
| **Prerequisites** | Justifications recorded **at claim creation**. If a claim is stored without its justification structure, retraction cannot be computed later — this must be designed into BUILD 3, not retrofitted. |
| **Preservation obligation** | `unknown ≠ nonexistent`; `unclassified ≠ invalid`; `evidence ≠ assertion`. |
| **Falsifier** | A claim whose support cannot be represented as a justification over evidence — e.g. one resting on a human judgment that is not itself an evidence record. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | STRUCTURAL |
| **Primitive cost** | PERSISTENCE |
| **Return-path consequence** | Withdrawal is a return event. |
| **Build consequence** | ADD_IMPLEMENTATION_CANDIDATE |
| **Standing** | Proposal for BUILD 3. **Time-critical**: the prerequisite expires once BUILD 3 ships without it. |

## TC-015 — Local closure must preserve the feasibility of its own reopening

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S5. Master Key / Aperture / Revalidation. |
| **Aperture** | AP-06; RQ-05. |
| **Sources** | R065, R068, R003 |
| **Established source claim** | Recursive feasibility: if a feasible plan exists now, one must exist at the next step. Controlled-invariant sets characterize the states from which constraint satisfaction can be maintained indefinitely. |
| **Transfer proposition** | Every locally-closing Move demonstrates that its reopening trigger remains satisfiable afterwards. An Aperture whose reopening the Move itself made infeasible is **unsound** and must be refused or re-Shaped. More generally, name and maintain the *lawful-continuation set*: the governance states from which every open aperture remains reopenable and every active obligation dischargeable. |
| **Prerequisites** | Reopening conditions stated concretely enough to check feasibility. Several current aperture TRIGGER fields are too vague to check — itself a finding. Exact computation of the continuation set is infeasible; a conservative under-approximation is the realistic target and is what the theory recommends. |
| **Preservation obligation** | `operational closure ≠ metaphysical closure`; `omission ≠ irrelevance`; `unknown ≠ nonexistent`. |
| **Falsifier** | A closure that destroys its own reopening condition and is nonetheless correct — which would mean the trigger was never real. |
| **Branch** | BRANCH_NEUTRAL — requires no order, metric, or optimization; only feasibility. |
| **Enforcement class** | SEMANTIC + OBSERVATIONAL |
| **Primitive cost** | NONE for the check; OBJECT for the continuation set |
| **Return-path consequence** | Infeasibility is returned evidence. |
| **Build consequence** | ADD_ACCEPTANCE_TEST; the continuation set is BLOCK_PENDING_PROBE |
| **Standing** | Proposal. **Supplies the soundness condition the Master Key triad currently lacks.** Without it, an aperture can be recorded, triggerable in principle, and unreopenable in fact. |

## TC-016 — Partition the invariants by return-path observability

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S3 and REQ-S2. Revalidation triggers; enforcement surfaces. |
| **Aperture** | RQ-02, RQ-03 |
| **Sources** | R063, R079, R082 |
| **Established source claim** | Two states producing identical output trajectories are indistinguishable by **any** estimator. Unobservability is a structural property of the system, not a limitation of the observer's cleverness. |
| **Transfer proposition** | Classify each invariant as return-observable or not. Return-observable invariants may have revalidation triggers wired to evidence. **Unobservable invariants must never be given an evidence-driven revalidation trigger, because that trigger can never fire**; they are assigned to AUTHORITY or STRUCTURAL surfaces instead. |
| **Prerequisites** | A defined return-path output alphabet — what receipts actually carry. Not yet defined; that is the work. |
| **Preservation obligation** | `unknown ≠ nonexistent`. Unobservable is not nonexistent — which is precisely why such invariants need a *different* route, not none. |
| **Falsifier** | An invariant classified unobservable that a richer receipt makes observable. That is a **good** outcome: the theory's prescribed response is to add the sensor. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | OBSERVATIONAL + AUTHORITY |
| **Primitive cost** | NONE — a classification pass |
| **Return-path consequence** | Bounds what the return path can ever accomplish. |
| **Build consequence** | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. Convergent with TC-009's falsifier from a different neighborhood. |

## TC-017 — Returned counterexamples drive minimal refinement

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S5. Aperture reopening; revalidation triggers. |
| **Aperture** | AP-10; RQ-05 |
| **Sources** | R004, R005, R006, R032 |
| **Established source claim** | CEGAR refines an abstraction using the spurious counterexample itself; refinement can be made minimal; lazy abstraction refines only along the path where the failure arose, permitting non-uniform precision. |
| **Transfer proposition** | A returned observation that an envelope licensed an illegitimate act is a spurious counterexample; the refinement it induces is the lawful reopening. Refine **minimally** — the aperture rule's "resolve only enough" as a checkable property. Record the distinguishing predicate (R032) as the refinement's content. Different governance objects may sit at different inspection depths, and that is correctness-preserving rather than inconsistent. |
| **Prerequisites** | Only (i) an abstraction, (ii) a counterexample, (iii) a refinement operation. **No lattice, no Galois connection, no metric** — this is what makes the loop adoptable while the algebra stays frozen. |
| **Preservation obligation** | `runtime reorientation ≠ constitutional redesign` — refinement adjusts the abstraction, never the source invariant. |
| **Falsifier** | A v2 failure carrying no information about which collapsed distinction caused it; then the loop cannot close and only human re-Shaping works. |
| **Branch** | BRANCH_NEUTRAL |
| **Enforcement class** | OBSERVATIONAL + SEMANTIC |
| **Primitive cost** | EVENT — a refinement event with its triggering witness |
| **Return-path consequence** | The return path becomes the refinement driver. |
| **Build consequence** | ADD_ACCEPTANCE_TEST |
| **Standing** | Proposal. Deliberately separates the CEGAR **loop** (adoptable now) from the Galois **algebra** (frozen). |

## TC-018 — Convergence below, adjudication above

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S7. Multi-surface propagation. `current ≠ newest`. |
| **Aperture** | AP-05; RQ-09 |
| **Sources** | R099 |
| **Established source claim** | CRDTs achieve convergence without coordination by making conflict resolution automatic and semantic-free — a lattice join or last-writer-wins. |
| **Transfer proposition** | Evidence propagation across surfaces may use CRDT convergence with append-only set semantics. **Standing, warrant, and designation may never converge automatically**; they require qualification. Draw this layer boundary explicitly before BUILD 10. |
| **Prerequisites** | Evidence records genuinely append-only and commutative. BUILD 0's `thoughts` already is. |
| **Preservation obligation** | `current ≠ newest` — a direct prohibition on last-writer-wins for standing. "Return is not overwrite." |
| **Falsifier** | A standing decision safely resolvable by a deterministic merge rule. If found, the boundary sits elsewhere and should be redrawn. |
| **Branch** | BRANCH_NEUTRAL as a boundary; BRANCH_CONFLICTING if applied to standing. |
| **Enforcement class** | STRUCTURAL |
| **Primitive cost** | NONE now; PERSISTENCE at BUILD 10 |
| **Return-path consequence** | Bounds what the return path may automate. |
| **Build consequence** | SHARPEN_CONTRACT |
| **Standing** | Proposal. Directly relevant to the operator's standing cross-surface propagation requirement. |

## TC-019 — Warrant as a derivation; Agent as a first-class primitive

| Field | Content |
|---|---|
| **Baseline requirement** | REQ-S6. Warrant is "the valid basis authorizing a specified operation by a specified **actor** in a specified scope." |
| **Aperture** | RQ-06 |
| **Sources** | R055, R056, R058, R045, R061 |
| **Established source claim** | An access decision is a derivation in a principal calculus with `says` and `speaks for`. Delegating an authority differs from delegating the power to re-delegate it. PROV-DM makes Agent and `actedOnBehalfOf` first-class. Passing designation and authority separately produces the confused-deputy failure. |
| **Transfer proposition** | (a) Represent warrant as a derivation from statements by identified principals; the derivation is what a receipt carries. (b) Introduce **Agent** as a primitive before BUILD 6 — v2's five Layer B primitives have no actor, yet the warrant definition requires one. (c) Designation records state whether the designee receives the authority, the power to re-delegate, or both; bootstrap exhaustion is then the checkable removal of a re-delegation power. (d) Record the current door's confused-deputy exposure as an explicit, temporary aperture. |
| **Prerequisites** | Distinguishable principals. **Two independent neighborhoods (N05 provenance, N07 authorization) converge on this same missing primitive**, which is strong evidence it is genuinely missing rather than an artifact of one framing. |
| **Preservation obligation** | `capability ≠ warrant or authorization`; `standing ≠ warrant`; `relevance ≠ authority`. Note the terminology collision in R060: never import the word "capability" from that literature into v2 prose. |
| **Falsifier** | A v2 authorization whose basis cannot be expressed as a derivation from identified principals' statements — e.g. one resting on unstated context. |
| **Branch** | BRANCH_COMPATIBLE |
| **Enforcement class** | AUTHORITY + STRUCTURAL |
| **Primitive cost** | **OBJECT — a new Layer B primitive.** The largest primitive cost proposed by this operation, and the one most in tension with structure-is-earned. |
| **Return-path consequence** | Returned evidence needs an attributable agent; a failed derivation is returnable. |
| **Build consequence** | SHARPEN_CONTRACT; ADD_IMPLEMENTATION_CANDIDATE at BUILD 6 |
| **Standing** | Proposal. **Do not act before BUILD 6** — structure-is-earned governs, and BUILD 0–5 do not need it. Recorded now so BUILD 6's Shape starts from it. |
