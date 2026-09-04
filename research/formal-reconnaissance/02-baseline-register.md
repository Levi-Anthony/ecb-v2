STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: Output B — Phase 0 internal architecture and prior-art baseline
AUTHORITY: None. Prior art is evidence, never authority.

# Research Baseline Register

Constructed **before** external search, per §6. Governing sequence per seam:

    CURRENT REQUIREMENT → CURRENT SIGMA/ECOS MECHANISM → RELEVANT OB1/ECB PRIOR ART
      → RESIDUAL DELTA → EXTERNAL RESEARCH NEED

OB1 was inspected only in regions the authorized seams implicate. `docs/ob1-prior-art.md`
already pins canonical OB1 at commit `9543c29`; that receipt was reused rather than
re-derived. ECB v1 / Crucible was inspected through the live ECB surface only.

---

## REQ-S1 — Projection correctness (SIGMA → ECOS)

| Field | Content |
|---|---|
| **Requirement** | A constitutive invariant that matters operationally must acquire an implementation-facing projection sufficient to constrain runtime behavior. |
| **Owner** | SIGMA → ECOS projection |
| **Standing** | OPEN — no projection has been built; BUILD 5–8. |
| **Existing mechanism** | Enforcement mode + surface declaration (`docs/invariants.md`). Master Key as local discriminator. FS-0001's TG-03 (semantic normalization stability) and TG-04 (commuting preservation). |
| **Existing test** | None frozen. TG-03/TG-04 are research patterns only. |
| **Falsifier** | A projected invariant that admits a runtime behavior the source invariant forbids; or two legitimate compilation paths that disagree on a promised-preserved obligation. |
| **Known aperture** | AP-10 (formal semantics of bounded action abstraction). Build Contract freeze line: full projection mathematics, Galois formulations. |
| **OB1 / ECB prior art** | ECB Crucible `transform_receipts` — a nine-field ledger (source claim, source register, preserved relation, **stripped commitment**, output claim, output epistemic type, validation route, falsifier, operational consequence) plus Charter verdict grade. This is a working *transformation* receipt schema and the closest live precedent for "what a projection must record." Linear ECO-72 (D2E — Doctrine-to-Execution Compiler) is the open build seam. |
| **Residual delta** | The receipt records *what was stripped* but supplies no check that what was **kept** still constrains runtime. There is no notion of a projection being *correct* as opposed to *documented*. |
| **External research need** | A preservation condition with a proof obligation shape, and a per-run (not per-compiler) way to discharge it. |

---

## REQ-S2 — Enforcement boundary

| Field | Content |
|---|---|
| **Requirement** | Every consequential transition requirement that is implemented or activated SHALL declare its enforcement mode and surface. **No consequential transition may depend solely on an agent remembering an instruction.** |
| **Owner** | ECOS runtime + governance |
| **Standing** | SETTLED as classification; OPEN as to which class a given obligation *can* occupy. |
| **Existing mechanism** | Four modes (STRUCTURAL / SEMANTIC / AUTHORITY / OBSERVATIONAL), seven surfaces. BUILD 0 demonstrated the pattern concretely: five STRUCTURAL rows, two OBSERVATIONAL rows. |
| **Existing test** | Golden Trace 01 (OBSERVATIONAL, cross-context). BUILD 0 failure-path tests at embedding/persistence/search/fetch. |
| **Falsifier** | A declared-STRUCTURAL requirement that a legal database state can violate; or an obligation assigned to a surface that provably cannot decide it. |
| **Known aperture** | AP-04 (enforcement-policy payload). The invariant explicitly says the four modes may compose, and does **not** claim they are exhaustive. |
| **OB1 / ECB prior art** | OB1: RLS + service-role isolation, shared-secret MCP boundary, `NOT NULL`/unique constraints, and the fingerprint trigger that "closes bypass paths" — a genuine STRUCTURAL-over-SEMANTIC promotion. OB1 `recall_traces` / `recall_items` is direct prior art for an OBSERVATIONAL surface. ECB: `review_policy = human_gate` + `propose_artifact_patch` is a live AUTHORITY surface. |
| **Residual delta** | Nothing in v2 says which obligations are **impossible** to place in a given class. The classification is a vocabulary, not a boundary theorem. This is the largest unpriced risk in the enforcement contract. |
| **External research need** | A decidability/enforceability result: what class of properties can a monitor enforce, and what can a finite trace decide at all. |

---

## REQ-S3 — Evidence return and requalification (ECOS → SIGMA)

| Field | Content |
|---|---|
| **Requirement** | Return is not overwrite. Returned evidence must undergo qualification before it may alter constitutive standing. `current ≠ newest`; `confidence ≠ standing`; `evidence ≠ assertion`. |
| **Owner** | ECOS → SIGMA return + qualification |
| **Standing** | SETTLED as commitment; OPEN as mechanism. |
| **Existing mechanism** | Human rail; ADR route; build receipts. Standing is dimensionally separated (claim kind / evidentiary basis / epistemic / governance / action standing / warrant) with enums deferred. |
| **Existing test** | None frozen. |
| **Falsifier** | A path where a runtime observation changes governing standing without passing a qualification step; or a retraction that leaves a dependent claim standing unchanged. |
| **Known aperture** | AP-01 (standing vocabulary), AP-02 (stable evidence interface). |
| **OB1 / ECB prior art** | **ECB ECO-46 supersession runtime enforcement** is live and load-bearing: retrieval returns a `⟦STAMP⟧` per result, superseded artifacts are surfaced *with a successor pointer* and rank-deprioritized rather than hidden, and drafts are stamped `⚠ draft — not authority`. This is a working implementation of "newest does not govern" on the retrieval path. ECB Charter **Admission Law**: "portables transfer, **records re-qualify**" — qualification already exists as doctrine. OB1 Agent Memory distinguishes agent-generated *evidence* from confirmed *instruction-grade* memory (coded PARTIAL / QUARRY). |
| **Residual delta** | ECO-46 stamps and deprioritizes; it does not *adjudicate*. There is no rule for what happens to claims that depended on evidence later withdrawn, and no postulate set distinguishing acceptable from unacceptable requalification. |
| **External research need** | A revision theory that does **not** axiomatize acceptance of new input, plus dependency-tracking machinery for retraction. |

---

## REQ-S4 — Referential identity and provenance

| Field | Content |
|---|---|
| **Requirement** | Every persisted first-class governance object SHALL possess a stable referent identity. Registration implies no authority, standing, promotion, or ontological significance. `referent ≠ map`, `identity ≠ description`, `artifact identity ≠ referent identity`. |
| **Owner** | Universal referent / persistence substrate |
| **Standing** | SETTLED as requirement; BUILD 2 implements. |
| **Existing mechanism** | BUILD 0: database-generated UUID primary key, durable across capture/search/fetch, proven by Golden Trace 01. |
| **Existing test** | Golden Trace 01 steps 6–8 (identity equality across two fresh contexts). |
| **Falsifier** | Any path where holding a referent grants an operation that holding no referent would not. |
| **Known aperture** | AP-05 (packet physicalization); AP-07 (relation ontology). |
| **OB1 / ECB prior art** | OB1 UUID identity — ADAPT, FULL coverage. OB1 content-fingerprint dedup (normalized SHA-256 + unique index + bypass-closing trigger) — coded **DEFER**, because "same normalized text means same identity" is a *policy*, not an identity mechanism. That distinction is already correctly drawn. OB1 `memory_source_refs` — an Evidence Link precursor, DEFER. |
| **Residual delta** | v2 has no way to *name a thing without asserting it*, and no separation between version identity (content hash) and referent identity (what the versions are versions of). Both become load-bearing at BUILD 5 (versioned artifacts). |
| **External research need** | A mature naming discipline where reference is decoupled from assertion, plus a provenance algebra for how evidence composes. |

---

## REQ-S5 — Bounded local closure and lawful reopening

| Field | Content |
|---|---|
| **Requirement** | Close locally under a Master Key without metaphysical closure; preserve an Aperture; reopen on a declared trigger. `operational closure ≠ metaphysical closure`; `omission ≠ irrelevance`; `unknown ≠ nonexistent`. |
| **Owner** | SIGMA → ECOS projection + ECOS runtime |
| **Standing** | WORKING — semantics governing, physicalization deferred. |
| **Existing mechanism** | Master Key / Aperture / Revalidation triad. Aperture records require WHAT / WHY OPEN / CURRENT EFFECT / TRIGGER / ROUTE. Eleven apertures exist; two are closed with reopening conditions preserved. FS-0001 supplied ∼(M,O), robust-action soundness, TG-01, TG-02. |
| **Existing test** | None frozen. TG-01/TG-02 are research patterns. |
| **Falsifier** | A local closure that destroys the evidence required to satisfy its own reopening trigger. |
| **Known aperture** | AP-06 (Bounded Infinity formal status); AP-10. Freeze line: Galois formulations. |
| **OB1 / ECB prior art** | ECB Charter **Demand-Driven Guard**: "no table exists until a specimen is waiting to pass through it" — a working instance of refusing premature closure at the schema layer. ECB Crucible verdict grades (trash / parked-with-wired-sensor / …) — "parked with a wired sensor" *is* an aperture with a trigger, already implemented as data. |
| **Residual delta** | The triad has no soundness condition. Nothing currently distinguishes a closure that is merely *bounded* from one that is *safe to act on*, and nothing guarantees reopening remains feasible. |
| **External research need** | A soundness relation for acting under a coarse representation, and a feasibility condition for later reopening — ideally without requiring the frozen lattice. |

---

## REQ-S6 — Rule succession and warrant

| Field | Content |
|---|---|
| **Requirement** | bootstrap trust root → initial policy activation → human/warrant authority designation → bootstrap exhaustion → ordinary governed succession. Governance state must be reconstructible after restart. `capability ≠ warrant`; `standing ≠ warrant`; `relevance ≠ authority`. |
| **Owner** | Governance |
| **Standing** | OPEN — BUILD 6. |
| **Existing mechanism** | Human rail. ADR standing/authority field. `Current` requires explicit designation. Warrant defined as "valid basis authorizing a specified operation by a specified actor in a specified scope." |
| **Existing test** | None. Harness Trace 00 tests orientation, not authority. |
| **Falsifier** | An act justified by a rule that was not active when the act occurred; or a succession authorized only by its own successor. |
| **Known aperture** | AP-04. Governance bootstrap is explicitly DO-NOT-BUILD in BUILD 0. |
| **OB1 / ECB prior art** | ECB `review_policy` (`live_audit` \| `human_gate`) with proposal/resolution lifecycle — a live AUTHORITY surface with a human designation step. ECB Interpretation Contract v1.1 records an explicit ruling that an amendment "is NOT derivation-class" and requires human ratification — i.e. succession classification already happens, by hand. OB1 supplies a shared-secret boundary only; **no OB1 authority model exists to inherit.** |
| **Residual delta** | Nothing can currently *test* which rule was active at time t, whether activation was atomic, or whether a successor is being applied retroactively to justify its own activation. All three are human-memory dependent — which the enforcement invariant forbids. |
| **External research need** | An authorization logic with explicit principals and delegation, plus a tamper-evident way to pin policy state to a point in time. |

---

## REQ-S7 — Recursion and propagation

| Field | Content |
|---|---|
| **Requirement** | Governance objects can become focal referents using the same grammar. Recursive inspection is **lazy** — opened only on material uncertainty. Propagation carries kernel packets across surfaces. |
| **Owner** | SIGMA + ECOS runtime |
| **Standing** | WORKING (rule stated); OPEN (mechanism) — BUILDS 9–10. |
| **Existing mechanism** | The laziness rule in `docs/build-contract.md`. Nothing implemented. |
| **Existing test** | None. |
| **Falsifier** | A recursive inspection that does not terminate, or a self-certifying governance bootstrap. |
| **Known aperture** | AP-05; freeze line item "generalized constitutional recursion." |
| **OB1 / ECB prior art** | ECB is itself multi-surface (desktop/mobile/cron; Claude/GPT/Codex) with `save_handoff_snapshot` / `append_handoff_event` / watermark sequence numbers as the live continuity mechanism, and XLINK as a cross-surface transport with an explicit contract. That is real propagation prior art — including a recorded **failure** (Interpretation Contract v1.1 A4 preserves an observed failure and its scope demotion rather than overwriting it). |
| **Residual delta** | No convergence guarantee across surfaces, and no formal reason the laziness rule is safe rather than merely economical. |
| **External research need** | Finite realization of reflective towers; convergence conditions for concurrent replicated state; a guardrail on self-certification. |

---

## Baseline summary

| Seam | Standing | Has a mechanism | Has a frozen test | Largest gap |
|---|---|---|---|---|
| S-1 Projection correctness | OPEN | partial (receipt schema) | no | correctness vs. documentation |
| S-2 Enforcement boundary | SETTLED / OPEN | yes | partial | no boundary theorem |
| S-3 Evidence return | SETTLED / OPEN | partial (ECO-46 stamps) | no | no retraction semantics |
| S-4 Referential identity | SETTLED | yes (UUID) | yes (GT-01) | name vs. assertion; version vs. referent |
| S-5 Bounded closure | WORKING | yes (triad) | no | no soundness condition |
| S-6 Rule succession | OPEN | manual only | no | cannot test what was active when |
| S-7 Recursion / propagation | WORKING / OPEN | partial (handoff) | no | no convergence, no self-trust guardrail |

Four of seven seams have **no frozen test at all**. That, and not conceptual incompleteness,
is the shape of the external research need this operation carried into Move.
