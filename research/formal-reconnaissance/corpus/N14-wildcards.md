DISPOSITION: EVIDENCE · NEIGHBORHOOD N14 · RECORDS R094–R100

# N14 — Wildcards: Enforceability, Tamper-Evident Logs, Convergence, Argumentation

> Machine-facing records. Plain-English result: [`../EXECUTIVE-EXTRACTION.md`](../EXECUTIVE-EXTRACTION.md) · Decoder: [`../GLOSSARY.md`](../GLOSSARY.md)


Quota expanded 4 → 7 by reallocation from N09, N12, N13 (see `01-SHAPE.md`). Two
neighborhoods were **discovered during Shape** and were absent from the initial list:

- **runtime enforcement and monitorability** (R094–R096) — serves S-2 and produced, with
  R013, the operation's single highest-leverage finding;
- **tamper-evident append-only logs** (R097–R098) — serves S-6 and completes H11.

Plus convergence for multi-surface propagation (R099) and adjudication of conflicting
returned evidence (R100).

---

### R094 — Schneider 2000 (enforceable security policies)
`CITE` F. B. Schneider. *Enforceable security policies.* ACM Transactions on Information and System Security 3(1), 30–50, 2000. · **VERIFIED**
`PROBLEM` Which security policies can a runtime monitor actually enforce?
`STRUCTURE` **Execution Monitors (EM)**: a monitor observes execution steps, knows nothing of the future, and can only halt the target. Theorem: **the policies enforceable by EM are exactly the safety properties.**
`GUARANTEE` A precise characterization of a mechanism class's power — and of its limits.
`LOSS` Everything outside safety: liveness, information-flow properties, and anything requiring knowledge of alternative executions.
`DETECTOR` A policy with no finite bad prefix cannot be EM-enforced; attempting it silently fails.
`REOPEN` Use a more powerful mechanism (R095), a static check, or an authority decision.
`SEAM` S-2
`INTERNAL` The four enforcement modes and seven surfaces; "No consequential transition may depend solely on an agent remembering an instruction."
`DELTA` **With R013, the operation's central finding.** v2's enforcement classification is a taxonomy of *where* enforcement happens with no statement of what each surface *can* enforce. Schneider supplies the missing theorem for the class v2 calls STRUCTURAL/runtime-observer: such a mechanism enforces **exactly the safety properties**, no more. Three immediate consequences: (i) any v2 obligation with no finite violating prefix cannot be given to a runtime guard, however carefully written; (ii) "information-flow" style obligations — several v2 non-collapse invariants are of this shape, since they are properties of *sets* of executions rather than single ones — are outside EM entirely; (iii) the enforcement mode table in `docs/invariants.md` is currently unfalsifiable, because nothing checks whether a declared mode can bear the obligation assigned to it.
`TRANSFER` Before assigning an enforcement mode, classify the obligation: safety → STRUCTURAL/runtime-observer is available; liveness → must be bounded into safety or assigned to AUTHORITY; a property of execution *sets* rather than single executions → outside monitoring altogether, requiring structural design or authority.
`PREREQ` Obligations expressed as trace properties. Cheap, and the same prerequisite as R013.
`PRESERVE` The enforcement invariant — this transfer makes it checkable rather than aspirational.
`FALSIFIER` A v2 non-safety obligation demonstrably enforced by a runtime monitor. That would contradict the theorem and indicate the obligation was misclassified — informative either way.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, OBSERVATIONAL, AUTHORITY (it determines the assignment)
`COST` NONE — a classification obligation.
`RETURN` Yes — an unenforceable-as-assigned obligation is a returnable design defect.
`STATUS` TESTABLE_TRANSFER
`EFFECT` CHALLENGES_EXISTING + SUPPLIES_TEST
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R095 — Ligatti, Bauer, Walker 2005 (edit automata)
`CITE` J. Ligatti, L. Bauer, D. Walker. *Edit automata: Enforcement mechanisms for run-time security policies.* International Journal of Information Security 4(1–2), 2–16, 2005. · **HIGH**
`PROBLEM` Schneider's EM can only halt. What if a monitor may also suppress, insert, or transform actions?
`STRUCTURE` Truncation, suppression, insertion and edit automata; edit automata enforce **more than safety** — the class of *renewal* properties — by transforming rather than only halting.
`GUARANTEE` A strictly larger enforceable class, at the price of a monitor that changes behavior rather than merely observing it.
`LOSS` Transparency: the observed execution is no longer the one the target attempted.
`DETECTOR` As R094, relative to the larger class.
`REOPEN` Move to a still more powerful mechanism, or accept the limit.
`SEAM` S-2
`INTERNAL` Action envelope compilation — which *transforms* a requested action into a bounded permitted one rather than merely permitting or refusing it.
`DELTA` **Shows v2's envelope mechanism is already more powerful than a pure monitor, and names the cost.** An action envelope that narrows a request is an edit automaton, not a truncation automaton — so v2 can enforce beyond safety. The price is exactly the loss of transparency: what executes is not what was requested, so the receipt must record **both** the requested and the permitted action or the return path silently loses the discrepancy. That is a concrete, cheap receipt-content requirement derived from a real theorem.
`TRANSFER` Receipts record the requested action, the emitted action, and the transformation applied. Envelope narrowing is a first-class recorded event, never a silent adjustment.
`PREREQ` Requested and emitted actions both representable. Cheap.
`PRESERVE` `evidence ≠ assertion`; the discrepancy is evidence and must survive.
`FALSIFIER` A v2 envelope that only permits or refuses, never transforms — then EM suffices and the extra recording is unnecessary.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` NONE beyond receipt fields.
`RETURN` Yes — the discrepancy is returnable evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R096 — Bauer, Leucker, Schallhart 2011 (runtime verification for LTL/TLTL)
`CITE` A. Bauer, M. Leucker, C. Schallhart. *Runtime verification for LTL and TLTL.* ACM Transactions on Software Engineering and Methodology 20(4), 14, 2011. · **VERIFIED**
`PROBLEM` What can a monitor conclude from a **finite prefix** of an ongoing execution?
`STRUCTURE` Three-valued semantics (true / false / **inconclusive**) for LTL over finite traces; RV-LTL refines "inconclusive" into presumably-true and presumably-false. **Monitorability** characterizes which properties a finite prefix can ever settle — and the monitorable class is strictly larger than safety ∪ co-safety.
`GUARANTEE` A monitor never claims a verdict a finite trace cannot support; "inconclusive" is a first-class, honest answer.
`LOSS` Certainty, for properties not yet settled — represented rather than hidden.
`DETECTOR` A property that is non-monitorable: no finite extension can ever settle it.
`REOPEN` Weaken the property, or accept permanent inconclusiveness.
`SEAM` S-2, S-3
`INTERNAL` `unknown ≠ nonexistent`; `unclassified ≠ invalid`; BUILD 0's rule that missing identity is an explicit not-found, never evidence of nonexistence.
`DELTA` **Supplies the exact verdict vocabulary v2's invariants demand and its observational surface lacks.** v2 forbids collapsing unknown into false — and a two-valued monitor does precisely that collapse every time it reports "not violated". The three-valued semantics makes `inconclusive` a recorded verdict rather than an absence, which is `unknown ≠ nonexistent` implemented rather than merely asserted. It also refines R094: monitorability is strictly larger than safety, so the safety limit bounds what can be *enforced*, while monitorability bounds what can be *detected* — two different limits that v2 currently conflates under "OBSERVATIONAL".
`TRANSFER` Every observational check returns a three-valued verdict; `inconclusive` is persisted with its scope and prefix, never rendered as a pass. Non-monitorable obligations are identified and excluded from the observational surface by construction.
`PREREQ` Obligations as temporal formulas (R015) and an event alphabet. BUILD 5.
`PRESERVE` `unknown ≠ nonexistent`; `unclassified ≠ invalid`; `omission ≠ irrelevance`.
`FALSIFIER` All v2 observational obligations turn out two-valued-decidable on finite prefixes. Golden Trace 01 is (it settles definitively); most governance obligations will not be.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` OBSERVATIONAL
`COST` NONE — a verdict field.
`RETURN` Yes — `inconclusive` is returnable evidence with standing.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R097 — Crosby & Wallach 2009 (tamper-evident logging)
`CITE` S. A. Crosby, D. S. Wallach. *Efficient data structures for tamper-evident logging.* USENIX Security 2009, 317–334. · **HIGH**
`PROBLEM` Prove a log has not been retroactively altered, without trusting the logger.
`STRUCTURE` History trees — Merkle-tree structures supporting logarithmic membership and **incremental consistency** proofs: proof that version *n* is a prefix-consistent extension of version *m*.
`GUARANTEE` Retroactive modification is detectable by any auditor holding an earlier commitment, even if the logger is malicious.
`LOSS` Nothing; costs are storage and proof computation.
`DETECTOR` A consistency proof fails — the log was altered.
`REOPEN` Reject the log; the compromise is proven, not suspected.
`SEAM` S-6, S-4
`INTERNAL` Event as immutable record; "governance state must be reconstructible after restart"; ADR reopening conditions.
`DELTA` **Completes H11 in combination with R042.** Bitemporality (R042) lets you *ask* which rule was active when; history trees let you *prove* the answer was not written after the fact. Immutability by convention — "we do not update Events" — is unfalsifiable from inside the system, because the party who could alter the log is the party who attests it has not been altered. Together with R086 (a system cannot certify its own soundness) this is a structural argument: log integrity must rest on an externally-held commitment, not on internal policy.
`TRANSFER` The governance event log is a history tree; periodic root commitments are held outside the system (a signed commit, an external witness); rule-succession claims cite a consistency proof against a commitment predating the act.
`PREREQ` Append-only event storage and an external commitment point. **A git repository already provides both** — commits are content-addressed and the remote is an external witness, so v2's existing practice is a partial instance already.
`PRESERVE` `evidence ≠ assertion` — the proof is evidence of ordering, not of correctness.
`FALSIFIER` A v2 threat model in which the logger is fully trusted, making tamper-evidence unnecessary. For a single-operator personal system this is *arguable* — but it fails as soon as agents write to the log, which is already the case.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL
`COST` PERSISTENCE
`RETURN` Yes — a failed consistency proof is a critical return.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R098 — Laurie, Langley, Kasper 2013 (Certificate Transparency)
`CITE` B. Laurie, A. Langley, E. Kasper. *Certificate Transparency.* RFC 6962, IETF, 2013. · **HIGH**
`PROBLEM` Detect misissued certificates when authorities are trusted but fallible.
`STRUCTURE` Public append-only Merkle logs of all issued certificates; signed tree heads; auditors and monitors; **gossip** to detect a log presenting different views to different parties.
`GUARANTEE` Misissuance becomes publicly detectable after the fact. Notably it does **not** prevent misissuance.
`LOSS` Prevention. CT is a detection architecture, deliberately.
`DETECTOR` A certificate in the log that the domain owner did not request; or split views detected by gossip.
`REOPEN` Revoke and investigate.
`SEAM` S-6
`INTERNAL` The human rail as issuer of warrants; ECB's proposal/resolution lifecycle.
`DELTA` A deployed, adversarially-tested design for a problem v2 will have: **authority is granted by a trusted party who may still err, and errors must be discoverable.** Its most transferable insight is architectural humility — CT chose detection over prevention because prevention was unachievable, and made detection *public and cheap* instead. That is directly applicable to v2's human rail: rather than trying to make human designation error-proof, make every designation enumerable and auditable after the fact. The split-view problem is also directly relevant to a multi-surface system: a log that shows different histories to different surfaces is precisely ECB's cross-surface consistency risk.
`TRANSFER` All warrant designations are appended to an enumerable log; an audit function can list every designation ever made; a cross-surface consistency check detects split views.
`PREREQ` R097's log. Gossip requires ≥ 2 independent readers — ECB's multiple surfaces supply this naturally.
`PRESERVE` `capability ≠ warrant`; logging a designation does not validate it.
`FALSIFIER` v2's designation volume is small enough for exhaustive human review, making systematic auditing unnecessary. True today; it is the assumption that expires quietly.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` OBSERVATIONAL, STRUCTURAL
`COST` PERSISTENCE
`RETURN` Yes.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R099 — Shapiro, Preguiça, Baquero, Zawirski 2011 (CRDTs)
`CITE` M. Shapiro, N. Preguiça, C. Baquero, M. Zawirski. *Conflict-free replicated data types.* SSS 2011, LNCS 6976, 386–400. · **HIGH**
`PROBLEM` Let replicas update independently and still converge, without coordination.
`STRUCTURE` State-based CRDTs (join-semilattice, monotone updates, least-upper-bound merge) and operation-based CRDTs (commutative concurrent operations). **Strong Eventual Consistency**: replicas that have received the same updates have equal state.
`GUARANTEE` Convergence without consensus — a strong, proven property.
`LOSS` Conflicting intents are *merged* by a fixed rule, not adjudicated. The merge is arbitrary from the users' point of view even though it is deterministic.
`DETECTOR` Divergence after identical update sets — a CRDT law violation.
`REOPEN` Fix the merge to satisfy the lattice laws.
`SEAM` S-7, S-3
`INTERNAL` ECB's multi-surface propagation; XLINK cross-surface transport; the user's own standing requirement to "propagate important developments across surfaces."
`DELTA` **Delivers a genuinely important negative-with-a-boundary.** CRDT convergence is bought by making conflict resolution *automatic and semantic-free*: last-writer-wins, or a lattice join. That is exactly what v2's qualification requirement forbids — `current ≠ newest` is a direct prohibition on last-writer-wins, and automatic merge is "return is overwrite" by another name. **So CRDTs must not be used for anything carrying standing.** They remain correct and valuable for the layer beneath: replicating *evidence records*, which are append-only and where a set-union CRDT is exactly right and cannot lose data. The finding is therefore a layer boundary — convergence below, adjudication above — which v2 has not drawn.
`TRANSFER` Evidence propagation across surfaces may use CRDT convergence (append-only set semantics). Standing, warrant, and designation may **never** converge automatically; they require qualification. Draw the boundary explicitly before BUILD 10.
`PREREQ` Evidence records genuinely append-only and commutative. BUILD 0's `thoughts` already is.
`PRESERVE` `current ≠ newest`; `evidence ≠ assertion`; "return is not overwrite."
`FALSIFIER` A v2 standing decision that can be safely resolved by a deterministic merge rule. If one is found, the boundary sits elsewhere and should be redrawn.
`BRANCH` BRANCH_NEUTRAL (as a layer boundary); BRANCH_CONFLICTING (if applied to standing).
`ENFORCE` STRUCTURAL
`COST` NONE now; PERSISTENCE at BUILD 10.
`RETURN` Yes — bounds what the return path may automate.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R100 — Dung 1995 (abstract argumentation)
`CITE` P. M. Dung. *On the acceptability of arguments and its fundamental role in nonmonotonic reasoning, logic programming and n-person games.* Artificial Intelligence 77(2), 321–357, 1995. · **HIGH**
`PROBLEM` Decide which of a set of mutually attacking arguments may be accepted together.
`STRUCTURE` An argumentation framework — arguments plus an attack relation — with semantics (grounded, preferred, stable) yielding **sets** of collectively acceptable arguments.
`GUARANTEE` Well-defined acceptability under each semantics; the grounded extension is unique and maximally sceptical.
`LOSS` Internal structure of arguments — deliberately abstracted away.
`DETECTOR` No stable extension exists — the conflict is irresolvable under that semantics.
`REOPEN` Use a different semantics, or add an argument.
`SEAM` S-3
`INTERNAL` Qualification of conflicting returned evidence; `unclassified ≠ invalid`.
`DELTA` Supplies a structure for a case v2 will certainly meet and has no answer for: **two returned observations that attack each other.** R049/R050 govern accepting a single input against existing belief; they say nothing about mutually inconsistent simultaneous inputs. Dung's semantics gives principled options, and the grounded extension in particular matches v2's posture — maximally sceptical, accepting only what is defended, leaving the rest undecided rather than forcing a winner. It also composes well with R053's ATMS labels: attack relations over environments.
`TRANSFER` Represent conflicting returned evidence as an argumentation framework; use grounded semantics as the default so unresolved conflicts stay unresolved rather than being arbitrated by recency or confidence.
`PREREQ` An attack relation between evidence items — a semantic judgment v2 would have to supply, and the real cost.
`PRESERVE` `unclassified ≠ invalid`; `current ≠ newest`; `confidence ≠ standing`.
`FALSIFIER` v2's returned evidence never conflicts, or conflicts are always resolvable by provenance alone. Multi-surface operation makes conflict likely rather than hypothetical.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC
`COST` OBJECT — the attack relation.
`RETURN` Yes — directly structures multi-input qualification.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2
