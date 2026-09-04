STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: Output A — build-facing executive extraction
AUTHORITY: None. Nothing here has been installed.

# Executive Extraction

100 abstracts coded, 21 full texts warranted, 4 formalization probes specified and **none
executed**, 19 transfer contracts, 12 rejected analogies, 2 proposals awaiting governance.

**The headline is not a new mechanism.** The corpus returns 44 SHARPEN_CONTRACT against 12
ADD_IMPLEMENTATION_CANDIDATE. ECB v2's architecture is unusually strong on distinctions and
unusually weak on **discharge**: four of seven build seams have no frozen test at all. The
literature's contribution is overwhelmingly failure detectors and proof obligations for
commitments v2 already holds — not new architecture, which is the correct outcome for a
greenfield build that has already done its conceptual work.

---

## 1. Highest immediate build leverage — five frameworks

**1. Enforceability and monitorability** (Schneider; Alpern & Schneider; Bauer, Leucker &
Schallhart). *The single highest-leverage finding.* v2's four enforcement modes say **where**
enforcement happens and never **what a surface can bear**. Execution monitors enforce
*exactly* the safety properties; every property decomposes into a safety and a liveness part;
monitorable properties are strictly larger than safety but still bounded. Consequence: every
Aperture REVALIDATION TRIGGER is an unbounded **liveness** commitment with no finite
violating prefix — so no finite-trace mechanism can ever catch its violation, which makes it
exactly the "instruction someone must remember" the enforcement invariant forbids. This
neighborhood was **not in the initial plan**; it was discovered during Shape.

**2. Translation validation and proof-carrying code** (Pnueli, Siegel & Singerman; Necula;
Leroy). v2 will not have a stable projection compiler for many builds, so verifying one is
unreachable. Validating each *run* is reachable now: emit a witness that the projection
preserved its declared obligations, and gate acceptance on an independent validator. This
converts "receipt" from documentation into a **checked artifact** — the exact gap the
baseline register names at REQ-S1, and the exact shape of proof-carrying trust that v2 needs
for agent-produced work.

**3. Non-prioritized belief revision** (Hansson; Hansson, Fermé, Cantwell & Falappa;
Makinson). The classical theory is *incompatible*: AGM's **Success** postulate (`A ∈ K*A`)
axiomatizes acceptance, which is precisely what `current ≠ newest` forbids. Semi-revision and
credibility-limited revision drop Success by design, work over belief **bases** rather than
closed theories — which is what v2 has — and supply postulates against which a qualification
rule can be tested rather than judged case by case.

**4. Contextual equivalence and observability** (Plotkin; Kalman; van Glabbeek). Two
independent kernel constructions at zero cost. Forward: `x ∼(M,O) y ⟺ Permitted_O(x) =
Permitted_O(y)` makes FS-0001's equivalence rigorous with **no metric, order, or probability
invented**. Backward: two SIGMA states indistinguishable through the return path cannot be
told apart by any amount of returned evidence, so an invariant that is not return-observable
**cannot be revalidated by runtime evidence at all** — it can only be re-authorized.

**5. Provenance semirings and bitemporal state** (Green, Karvounarakis & Tannen; Jensen &
Snodgrass; Crosby & Wallach). The composition algebra Evidence Link lacks (join multiplies,
union adds), plus the machinery that makes rule succession testable: valid time answers
"which rule was active when", transaction time catches backdating as a **schema constraint
violation**, and a tamper-evident log makes immutability falsifiable from outside.

---

## 2. Existing mechanisms with mature formal precedents

Five cases where v2 independently reinvented established machinery. In each the value is not
novelty but **named postulates and known failure modes**.

| v2 mechanism | Mature precedent | What it adds |
|---|---|---|
| ECB Charter intake lane — "records re-qualify", the specimen may itself be rejected | **Semi-revision** (Hansson 1997) | An axiomatic characterization to test qualification against |
| Build Contract's "recursive inspection is lazy" | **Lazy reflective towers** (Wand & Friedman 1988) | Laziness is not economy — it is the known way to realize an infinite tower *at all* |
| The human rail and bootstrap trust root | **Tarski undefinability; Löb** | An external trust root is a structural necessity, not a UX affordance |
| Frozen invariants + the hard-stop rule | **Screened revision** (Makinson 1997) | The protected core provably survives *any* input sequence, not just noticed ones |
| ECO-46 stamp-and-surface supersession | **Constraint maintainers** (Meertens 1998) | Surfacing a superseded artifact with a successor pointer is a legitimate maintainer restoring legibility without asserting the new content governs |

---

## 3. Contracts to sharpen before implementation

1. **Enforcement declarations gain a property class** — safety / liveness / conjunction /
   outside-single-trace — assigned *before* a mode. Liveness must be bounded or given a named
   fairness assumption. (TC-001; proposed as ACP-01.)
2. **Name the rely conditions.** Every ECOS guarantee is implicitly conditional on the
   environment; v2 names none, which makes its guarantees formally unconditional and
   therefore false. (CF-12.)
3. **Split where- from why-provenance.** BUILD 0's `source` field is where-provenance (which
   door the text arrived through). BUILD 3 needs why-provenance (which evidence witnesses this
   claim). A `source` string cannot answer the second. (TC-011.)
4. **Type the return payload.** Contradiction and detected-insufficiency are *revision*
   inputs; changed-conditions is an *update* input. They need different treatments and v2
   currently lumps them together. (TC-008.)
5. **Stop calling the cycle bidirectional.** It is projection + evidence-bearing return +
   separate qualification. (NR-02.)
6. **Record the door's confused-deputy exposure** as an explicit temporary aperture. Correct
   at BUILD 0; must not survive into BUILD 6. (TC-019.)

## 4. Acceptance tests addable immediately

- **Reconstruction test** — drop derived governance state, recompute from the event log,
  require equality. Divergence localizes hidden mutable state. (TC-012/R043.)
- **No-similarity-governs test** — assert no governance conclusion depends on an embedding
  similarity score. v2's one real metric is on embeddings, not meaning; using it otherwise
  violates four frozen invariants. (NR-08.)
- **Feasible-reopening test** — a locally-closing Move must leave its own reopening trigger
  satisfiable. An aperture whose reopening its Move destroyed is unsound. (TC-015.)
- **Three-valued observational verdicts** — `inconclusive` persisted with scope and prefix,
  never rendered as a pass. (TC-002.)
- **Non-retroactivity constraint** — a policy governs an act only if its valid-time interval
  contains the act and its transaction-time precedes the act's record. (TC-012.)
- **No-self-authorizing-bootstrap check** — the activation derivation must not depend on the
  policy being activated. (CF-14.)

## 5. Implementation candidates deserving bounded prototypes

| Candidate | Build | Why now |
|---|---|---|
| **Validation witness + independent validator** (TC-003) | 5–6 | Best cost/benefit found; links to Linear ECO-72 (D2E compiler) |
| **Justification structure on claims** (TC-014) | **3** | **The only finding with a deadline** — retraction semantics cannot be retrofitted |
| **Bitemporal governance activation** (TC-012) | 6 | Cheapest structural win: moves an obligation from vigilance to a constraint |
| **Tamper-evident event log** (TC-013) | 6 | Git may already discharge most of it — check before building |
| **Semiring provenance on Evidence Links** (TC-011) | 3 | Only with the negative-evidence half; without it, absence of provenance reads as provenance of absence |

## 6. Analogies to reject

Twelve failed the §12 admission chain. Five matter most:

- **Lens laws.** PutGet requires unconditional acceptance of the update — exactly what
  qualification forbids. BRANCH_CONFLICTING. Replaced by consistency relation + maintainer.
- **Classical AGM.** Three independent barriers: the Success postulate, the closed-theory
  requirement, and total entrenchment (which would collapse AP-01's dimensional separation).
- **Information bottleneck / rate-distortion.** Both need a probability distribution, and
  rate-distortion additionally needs a distortion measure — i.e. a utility function.
  Constructing either is the invention §12 prohibits. The *shape* survives via non-stochastic
  information (Nair) and kernel sufficiency, neither of which needs probability.
- **Conformal geometry.** Requires a metric on constitutive meaning. None exists. The one
  place a real metric does exist — 384-d `gte-small` cosine — is the one place using it as a
  meaning metric would violate `map ≠ referent` and `confidence ≠ standing`.
- **CRDT convergence for standing.** Convergence is purchased precisely by removing
  adjudication. Correct *below* the standing layer for append-only evidence; never above it.

Two vocabulary hazards: **"capability"** means the opposite in the object-capability
literature to what `capability ≠ warrant` means in v2; **"bidirectional"** names four
inequivalent law sets and imports a totality commitment v2 rejects.

## 7. What remains intentionally informal

The freeze line holds. Bounded Infinity's formal status (AP-06), full projection mathematics,
Galois formulations, literal conformal geometry and complete FCA formalization were **not**
resolved, and several strong findings were deliberately parked on that rule — CF-03 and CF-04
among them. Research does not lift a freeze.

## 8. Unresolved questions that materially block BUILD

1. **Is `Permitted_O` a function?** If not, ∼(M,O) has no rigorous reading. Testable today
   against existing ADRs (FP-003) and gates the largest set of downstream findings.
2. **Are v2's invariants trace properties at all?** Several read as properties of *sets* of
   executions, which sit outside both the safety/liveness decomposition and monitoring.
3. **Does BUILD 3 need justification structure from the start?** The only finding with an
   expiry date.
4. **Is an Agent primitive required before BUILD 6?** Two neighborhoods converge on it and
   v2's warrant definition presupposes an actor — but structure-is-earned governs, and this
   is a governance question, not a research one.
5. **What is the SIGMA→ECOS observation set?** TC-003, TC-009 and TC-010 all need it closed.

## 9. What may safely remain apertured

The metaphysics of agency, a universal altitude taxonomy, automatic Master-Key discovery, the
complete relation ontology (AP-07), the final UI (AP-08), reflective level indexing until
BUILD 9, and every empty cell in the synthesis matrix — which records **unsearched regions,
not established absences**.

## 10. Honest limits

- **No probe was executed.** Every probe-dependent standing is provisional on exactly that.
- **21 of 100 citations were verified this session**; 73 are canonical-but-unrechecked and 6
  are medium-confidence. One verification produced a correction, which is direct evidence the
  unverified remainder contains errors. No claim rests on a medium-confidence citation alone.
- **Five of fourteen neighborhoods produced no rejected analogy.** Two of those were shaped
  around findings already made, so their uniformly positive yield is partly a selection
  effect and should be discounted (QF-F-03).
- **No systematic-review completeness is claimed.** Unsearched literature remains an explicit
  aperture.
