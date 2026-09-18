# ECO-147 — Quadrant Architecture Shape and Qualification Return

**Date:** 18 September 2026 America/Phoenix  
**Commission:** ECO-147  
**Parent:** ECO-136  
**Phase boundary:** substrate-independent Architecture Shape only; physical design is not entered.

## 1. Currentness and source receipts

ECO-147 was live-read before architecture work. At recovery time it was **Working** and had no comments, attachments, documents, branch, PR, or persisted Shape artifact. Repository search found no ECO-147 branch or PR. Cross-conversation recovery likewise exposed no durable ECO-147 architectural decisions. The recoverable prior-worker progress was therefore limited to opening the issue and moving it to Working. No invisible scratch reasoning was treated as completed work.

The current ECO-136 issue remains **Working**. Its description still contains an older “next seam = ECO-146” paragraph, but the later Principal-authored ECO-136 comment `de1f7255-22ba-4717-a688-99b6211aed32` explicitly records that ECO-146 is accepted and complete and that ECO-147 is open as the separately governed Architecture Shape. This resolves the apparent coordination staleness without changing semantic requirements.

ECO-146 acceptance is explicit in Principal comment `e9f94bd7-3b21-42e9-b945-9b2c1e6fb426`: Gates A–J accepted for Sense; A–G, CP1–CP6, recoverability/composition obligations and Q1–Q7 are the current Architecture Sense decision surface; no architecture/physical/runtime claim is implied. ECO-146 is Done.

Canonical architecture-documentation continuity on `ecb-v2/main` is current at repository head `b3d2f6d404ab165b0bb277a3423ae3955800ad99` (“docs: advance quadrant frontier to Architecture Shape”). The README records the exact progression:

`functional contract → ECO-143 bounded semantic qualification → ECO-144 qualified design requirements → ECO-145 portable architecture intake → ECO-146 accepted Architecture Sense → separately governed Architecture Shape`.

Pinned file receipts used for this Shape:

| Source | Canonical blob SHA |
|---|---|
| `research/quadrant-grammar/README.md` | `2b7b588fe956a5faea26b71296b46c7134ff0195` |
| `research/quadrant-grammar/ECO-146-Quadrant-Architecture-Sense-Return-2026-09-18.md` | `7a7ddff9a7aaf029a9f03afece737e7d01fcd190` |
| `research/quadrant-grammar/Quadrant-Architecture-Intake-Packet-ECO-144-Baseline.md` | `85f09bc8b9371969fcff784aa5e3d182b560ac3f` |
| `research/quadrant-grammar/ECO-144-Quadrant-Design-Requirements-and-Qualification-2026-09-18.md` | `d19fccbd0f7f200ab0340d26a3fd937370e6f78a` |
| `docs/invariants.md` | `e7b36a56a3a1eff58d7e2debce4aaeb6e1a359d4` |
| `docs/build-contract.md` | `af59fd648cf737e51185c9bf97f958d1c969f783` |

The required source chain is mutually consistent at the outcome-determinative level. No U1–U4 reentry trigger is present.

### Frozen inputs

The following are treated as fixed for this Shape:

- ECO-144 R01–R10;
- ECO-146 responsibility families A–G;
- ECO-146 control points CP1–CP6;
- the accepted ECO-146 operating context;
- the exact non-substitution and fourfold inquiry grammar carried by the qualified semantic basis;
- repository invariants: stable identity does not establish co-reference/authority/currentness; no silent promotion; shared seam does not collapse semantics; verification does not create truth/authority; role non-collapse; proof sensitivity; no consequential transition may depend solely on remembered instruction;
- Build Contract pressure to physicalize settled deterministic liability later while preserving semantic freedom where interpretation remains decision-relevant.

No new semantic requirement was introduced during Shape.

## 2. Candidate alternatives considered

Three materially different logical arrangements were considered. Generation stopped when additional variants reduced to physical allocation rather than a different logical trade-off.

### Candidate A — Unified Qualified Account

One logical account owns subject/boundary/G, questions, fourfold coverage, evidence/warrant, Question Forward, historical/currentness state and the final reliance disposition.

**Strength:** one cold-readable unit and simple conceptual access.

**Failure/trade-off:** it pressures the architecture toward a giant mandatory record and global “current/complete” status. It makes duplication attractive, risks allowing account presence/currentness to masquerade as authority, and encourages unrelated changes to invalidate or rewrite the whole account. It also makes historical basis recovery and per-use sufficiency harder to express without internal substructures that recreate the selected architecture inside the blob.

**Disposition:** rejected. It can be a physical packaging option later only if the logical distinctions remain separable; it is not the logical architecture.

### Candidate B — Pure federation with consumer-local re-evaluation

Identity, orientation, questions, evidence and history remain independently referenced. Every downstream consumer reconstructs the relevant basis and independently decides sufficiency at use time.

**Strength:** maximum composability, minimal central structure, no mandatory account container.

**Failure/trade-off:** it leaves reliance accountability distributed enough that consequential transitions can fall back to remembered prose. It duplicates semantic judgments, makes currentness/requalification inconsistent across consumers, and fails to create a durable accountable home for scoped change/applicability. Successful pointer resolution can too easily substitute for jointly applicable meaning.

**Disposition:** rejected. Distributed storage/retrieval remains allowed, but reliance and requalification semantics cannot be consumer-memory-only.

### Candidate C — Composed basis with use-scoped qualification — SELECTED

Four logical roles:

1. **Situated Basis** — A/B;
2. **Inquiry State** — C/D/E;
3. **Applicability Reconciler** — F;
4. **Reliance Qualifier** — G composed with A–F.

The roles may resolve information by reference. At consequential use, the Reliance Qualifier composes an exact/equivalent **Applicable Basis** and produces a use-scoped disposition. Changed basis routes through the Applicability Reconciler. Historical meaning remains recoverable. A changed downstream use requires fresh qualification.

**Why selected:** it preserves every distinct failure boundary identified by A–G while avoiding a monolithic account, global currentness and consumer-local memory-only gating. It is substrate-independent and maps cleanly to later physical enforcement without selecting the enforcement surface.

## 3. Q1–Q7 dispositions

### Q1 — identity, boundary and open context

**Chosen answer:** preserve a stable focal reference together with a recoverable Situated Basis. Boundary change is a basis revision; refocus is a linked new focal inquiry; ordinary enrichment does not automatically change referent or boundary. Open context enters under a relevance criterion and recoverable references rather than exhaustive pre-enumeration.

**Rejected:** unchanged ID proves unchanged subject/boundary; universal context graph.

**Reverser:** requirements-level evidence that the present distinction among enrichment, boundary revision and refocus is insufficient.

**Maps:** A, CP1/CP5, R01/R03/R07/R09.

**Physical design remains free:** ID format, version storage, graph/document/log representation, context indexing.

### Q2 — jointly applicable composed basis

**Chosen answer:** at consequential reliance, resolve exact/equivalent basis versions and assess G, boundary, time/state, standing and evidence **together**. Successful reads are necessary but not sufficient. Unavailable decisive support or incompatible scopes narrows/stops the affected use.

**Rejected:** all links resolving equals current/conformant; permanent self-authorizing snapshot.

**Reverser:** an explicit governing requirement for a fully self-contained authoritative snapshot.

**Maps:** B/G, CP5/CP6, R02/R09/R10.

**Physical design remains free:** eager versus lazy materialization, caching, snapshots, query strategy.

### Q3 — question refinement and coverage

**Chosen answer:** hybrid derivation/assessment. Explicit seat/burden relations may mechanically derive candidate coverage; natural-language ambiguity, adequate clarification and consequential deferral remain qualified judgment. Original question lineage is mandatory.

**Rejected:** one utterance equals one coordinate; purely manually declared coverage; purely re-derived coverage with lost lineage.

**Reverser:** a bounded formal input language that makes a specific proposition fully decidable.

**Maps:** C, CP2/CP4, R03/R04/R05/R08.

### Q4 — mechanical checks and judgments

**Chosen answer:** partition by proposition, not actor. Closed explicit predicates may be deterministic. Boundary adequacy, relevance, evidence support and sufficiency remain semantic/hybrid unless later qualified as formal. Every judgment preserves inputs, method/basis, standing, result, limits and correction/reentry. Later activated deterministic transition preconditions require non-memory-only enforcement.

**Rejected:** human review automatically means adequate; filled fields equal correctness; force all semantics into deterministic structure.

**Reverser:** qualification showing a narrower proposition is mechanically decidable without semantic loss.

**Maps:** D plus judgmental A/B/C/E/G, CP2/CP3/CP6, R04/R06/R10.

### Q5 — notice and reentry for material questions

**Chosen answer:** Question Forward carries an actual notice/evidence route when one exists. Use-triggered reentry and existing evidence-return routes are sufficient where they match the needed liveness. No universal monitor is assumed. No-route cases remain explicitly unanswerable.

**Rejected:** background monitor by default; reminder means eventual detection.

**Reverser:** a changed operating context requiring idle-time liveness/notification, triggering U3.

**Maps:** E, CP4/CP5, R05/R07/R08/R10.

### Q6 — localized changed applicability with history

**Chosen answer:** preserve exact historical meaning and lineage, then perform scoped impact/requalification. Use explicit dependencies where available; if impact precision is unsupported, suspend the smallest conservative affected scope. Preserve justified unaffected use.

**Rejected:** newest wins; global invalidation; relabeling equals requalification; digest-only history.

**Reverser:** requirements change to require a stronger automatic impact-detection guarantee.

**Maps:** F, CP5/CP6, R09 plus affected origin requirements.

### Q7 — reliance across consumers and handoffs

**Chosen answer:** every consequential use boundary discharges a use-scoped Reliance Qualifier. Prior assessments may be reused only under compatible use/basis/standing. Changed consumer intent requires fresh qualification. Future activated consequential transitions must have a non-memory-only enforcement surface requiring a current qualified disposition plus any independently required authority.

**Rejected:** producer qualification covers arbitrary future consumers; each consumer is trusted to remember prose.

**Reverser:** operating context materially changes the definition of consequential reliance.

**Maps:** G, CP6, R02/R05/R06/R08/R09/R10.

## 4. Selected architecture and rationale

The selected architecture is defined normatively in:

`research/quadrant-grammar/Quadrant-Logical-Architecture-Contract-v0.1.md`

Branch blob SHA: `7dd210e385f1dedd934cd432ee2bab9d0197b469`.

The four roles are minimal for the following reason:

- A/B need a Situated Basis because identity alone cannot carry boundary/G/standing.
- C/D/E need Inquiry State because a valid basis can still contain ambiguity, unsupported claims and unresolved material branches.
- F needs a distinct Applicability Reconciler because a historical result can remain valid in history while losing current applicability.
- G needs a Reliance Qualifier because individually adequate parts can still be jointly inadequate for a particular use.

No fifth “universal account/currentness service” was earned. C/D/E remain internally distinct meanings but do not require three separately named components at logical resolution.

## 5. Rejected alternatives and reversers

Candidate A can become a later packaging choice only if it remains a projection of the four logical responsibilities and does not create global currentness, self-authority or mandatory duplication.

Candidate B can become a later distribution choice only if the shared logical reliance/requalification contracts remain enforceable and consumers do not individually reconstruct policy from prose.

The selected Candidate C should be reopened only if:

- R01–R10 change;
- the semantic generator fails under identical clarified burden;
- operating context changes consequential-reliance or liveness boundaries;
- governing authority conflicts;
- physical design reveals a logical obligation that cannot be implemented on any plausible substrate without changing meaning.

A physical mechanism failure by itself is not a reverser.

## 6. A–G / R01–R10 traceability

| Requirement | Responsibility families | Logical role / contract | Qualification hook |
|---|---|---|---|
| R01 Referential continuity | A/F | Situated Basis; C1/C4 | enrichment vs boundary change vs refocus; stable-ID wrong-boundary negative |
| R02 G/scope/standing | B/G | Situated Basis + Reliance Qualifier; C1/C5 | compatible basis positive; broken/inapplicable governing source negative |
| R03 Boundary/seat | A/C | Situated Basis + Inquiry State; C1/C2 | explicit constituent/co-relatum rationale; excluded relation revision negative |
| R04 Question generation | C | Inquiry State; C2/C3 | clarification/decomposition lineage; wording/access-token assignment negative |
| R05 Coverage | C/E/G | Inquiry State + Reliance Qualifier; C2/C5 | four obligations with distinct meanings; four generic cells inadequate |
| R06 Evidence/warrant | D | Inquiry State; C3 | one datum/multiple roles with shared origin; false corroboration negative |
| R07 Open discovery | A/E/F | Situated Basis + Reconciler; C1/C4 | relevant discovery admitted; closed-world or unlimited-expansion negative |
| R08 Question Forward | E/G | Inquiry State + Reliance Qualifier; C2/C5 | signal changes disposition; generic question/reminder negative |
| R09 Change/history | F | Applicability Reconciler; C4 | scoped before/after requalification; digest-only history negative |
| R10 Bounded reliance | G | Reliance Qualifier; C5/C6 | exact-use proceed/narrow/stop; well-formed package/self-authority negative |

Reverse navigation is likewise explicit: any observed failure localizes to one of C1–C6, then to its owning role, A–G family and requirement/reentry route.

## 7. Logical contract/interface audit

The architecture defines six contracts:

- **C1 Situated Basis resolution**
- **C2 Inquiry formation and coverage**
- **C3 Warrant and assessment**
- **C4 Change and requalification**
- **C5 Reliance request and disposition**
- **C6 Handoff and reuse**

### Deterministic obligations

Mechanically decidable propositions include, where the inputs are explicit:

- reference/version equality or mismatch;
- successful/failed resolution;
- declared scope or revision mismatch;
- availability of all four obligations;
- presence and linkage of required QF parts;
- preservation of exact source identity across reuse;
- exact-basis binding of a prior disposition;
- prohibition on an activated consequential transition proceeding without the required current qualified disposition.

These checks establish only their scoped propositions.

### Judgmental/hybrid obligations

Qualified judgment remains necessary for:

- real co-reference and adequate individuation;
- applicable G;
- semantic compatibility of scopes;
- correct seat/burden for unrestricted language;
- evidence authenticity/completeness/support;
- consequentiality of unresolved branches;
- adequacy of notice route;
- semantic impact and affected scope;
- final use-level sufficiency.

The architecture does not require those judgments to be human. It requires inspectable basis and limits.

### Interface audit result

**PASS analytically.** Every consequential transition between roles has explicit preconditions, postconditions, failure/unknown behavior, currentness/applicability rule and enforcement mode. No interface requires a schema/API/payload choice.

One repair was made during audit: the initial “history by exact version/digest” idea was too weak. The final contract requires **recoverable historical semantic meaning**, because a changed digest can reveal difference without supporting interpretation or requalification.

## 8. Adversarial qualification results and repairs

These are analytical architecture tests against inherited synthetic specimens and the ECO-147 required pressures. They are not runtime tests.

### Inherited T1–T10

| Test | Selected architecture result |
|---|---|
| T1 compound permission / necessary conditions | Inquiry State preserves separate burdens and warrant limits; C5 blocks dispatch while signature/consumer compatibility is unresolved. PASS. |
| T2 enrichment / boundary revision / refocus | Situated Basis + C4 distinguish all three without forcing new IDs. PASS. |
| T3 one datum / several roles | C3 preserves one source origin and distinct claim roles; C4 localizes warrant impact without universal invalidation. PASS. |
| T4 unknown occurrence | QF remains explicit; C5 blocks positive completion/recognition while preservation and evidence collection remain allowed. PASS. |
| T5 access / experience / projection | Access change alters warrant only where relevant; it does not move structural seat; mapper purpose does not become R purpose. PASS. |
| T6 open discovery | Relevant new context enters under criterion; unrelated discovery may be scoped out; history is not rewritten. PASS. |
| T7 changed purpose | Changed G creates changed Situated Basis applicability; old qualification cannot authorize the new use. PASS. |
| T8 formal sufficiency | Closed formal premise can be deterministically checked while semantic applicability remains bounded. PASS. |
| T9 well-formed but inadequate | Formal completeness cannot satisfy C3/C5 semantic adequacy; generic QF and unsupported deferral fail. PASS. |
| T10 compositional recovery | Applicable, unavailable, and individually-resolved-but-incompatible branches remain distinct; repository/current source presence does not self-promote. PASS. |

### ECO-147 required adversarial pressures

1. **Stable ID + superficially complete fourfold account + wrong/changed boundary**  
   C1/C4 bind the prior disposition to the previous Situated Basis. Stable ID does not suppress the boundary revision. Affected reliance requalifies. PASS.

2. **Calibrated question exists but decisive evidence remains unknown**  
   Inquiry State can be well-formed while C5 still returns a restricted/suspended result. QF is not permission. PASS.

3. **All references resolve individually but belong to incompatible scopes/G**  
   Applicable Basis composition requires joint compatibility. Successful retrieval does not pass C1/C5. PASS.

4. **Historical digest detects change but historical meaning is not recoverable**  
   Initial candidate failed this pressure. **REPAIR:** historical semantic payload or equivalent meaning-bearing source is now required wherever the historical meaning is needed. If unavailable, loss is explicit and affected claims narrow/stop. Rerun: PASS.

5. **Current ACTION/HOLD-like projection exists but authority/warrant is absent**  
   C5 distinguishes operational currentness from authority/warrant. Current projection cannot self-authorize. PASS.

6. **Downstream consumer changes intended use**  
   C6 forces a new use-scoped C5 qualification. Prior producer sufficiency remains historical evidence only for its original envelope. PASS.

7. **Judgment is recorded but adequacy is unsupported**  
   C3 requires inputs/basis/method/standing/limits. A bare “reviewed/PASS” record is insufficient. PASS.

8. **Relevant new context arrives after prior sufficiency**  
   C4 evaluates affected applicability, retaining warranted unaffected use and suspending unresolved affected scope. PASS.

9. **No observation route exists for a material unknown**  
   Explicit unanswerability is preserved; affected use is bounded. No fake monitor is invented. PASS.

### Repository cross-cutting pressures

All twelve Build Contract pressures were dispositioned APPLICABLE at logical resolution:

- duplicate/replay;
- concurrency;
- stale basis;
- partial failure;
- restart/reconstruction;
- wrong identity/role;
- wrong version;
- basis drift/revocation;
- checker bypass/false PASS;
- retry/idempotency;
- time/order ambiguity;
- unauthorized mutation.

The contract defines the minimum logical obligation for each while deferring serialization, transaction, cache and access-control mechanisms to physical design.

## 9. Cold-transfer result

**NOT EXECUTED — qualification blocker, not architecture defect.**

ECO-147 requires one genuinely fresh worker to receive **only** the final Logical Architecture Contract and recover eight specified items. The current execution environment exposes no independent fresh-worker/subagent invocation that can be synchronously isolated from this worker’s source history. Re-reading the document in the same worker would not satisfy the commissioned test and would create a false independence claim.

The exact cold-transfer packet is the single file:

`research/quadrant-grammar/Quadrant-Logical-Architecture-Contract-v0.1.md`

The required fresh-worker prompts are:

1. recover the chosen logical architecture and component responsibilities;
2. explain how A–G and R01–R10 are satisfied;
3. recover the end-to-end reliance path and stop conditions;
4. recover the change/requalification path;
5. distinguish deterministic from judgmental/hybrid decisions;
6. state three consequential architecture anti-inferences;
7. state what remains for physical design;
8. state what requires upstream reentry.

**No substitute self-test is claimed.** This is the only uncompleted commissioned qualification step.

## 10. Gates A–J disposition

No aggregate score is used.

| Gate | Disposition | Basis |
|---|---|---|
| A — Requirements and Sense fidelity | PASS | All roles/contracts trace to R01–R10, A–G or explicit repo invariants. |
| B — Responsibility completeness | PASS | A–G and CP1–CP6 all have accountable logical homes. |
| C — Minimality / non-duplication | PASS | Four roles preserve distinct failure/lifecycle boundaries; no fifth monolith/currentness service earned. |
| D — Composition / reference integrity | PASS | C1/C5 distinguish retrievability from joint applicability; no mandatory giant record. |
| E — State/currentness/change integrity | PASS | C4 preserves historical basis, scoped impact, explicit unresolved affected use and warranted unaffected use. |
| F — Reliance/enforcement integrity | PASS analytically | C5 provides accountable use-level gate; future activated deterministic transition requirements are explicitly non-memory-only. |
| G — QF/uncertainty integrity | PASS | C2/C5 preserve calibrated question, route/no-route, consequence, interim use and reentry. |
| H — Substrate independence | PASS | No DB/schema/API/vendor/model/UI/topology/event-bus choice appears in the contract. |
| I — Qualification/falsifiability | PASS analytically | Every role/contract has positive/negative hooks; T1–T10 and required pressures discriminate failures. |
| J — Physical-design readiness | **BLOCKED PENDING COLD TRANSFER** | Analytically the decision surface is physical-only, but the commissioned fresh-worker portability check has not been executed. |

Because Gate J’s required transfer evidence is absent, this return does **not** claim completed Shape qualification or acceptance readiness.

## 11. Residual physical-design questions

The following are deliberately free because their choice does not alter the qualified logical meaning:

- relational/document/graph/log/mixed persistence;
- direct content versus reference/snapshot trade-offs;
- cache strategy;
- event sourcing versus another history mechanism;
- allocation of roles to processes/services;
- API and payload syntax;
- synchronization/serialization strategy;
- concrete ID/version/index choices consistent with universal identity;
- model/human/software allocation for semantic evaluation;
- concrete checker implementations;
- concrete notification/observer mechanism when a later qualified liveness claim requires one;
- exact physical enforcement surface for activated consequential transitions;
- UI/workflow presentation;
- performance, throughput and availability engineering.

Physical design must not reopen R01–R10/A–G/Q1–Q7 merely because a substrate makes a different logical arrangement convenient.

## 12. Exact claim envelope

This return establishes, at analytical Shape resolution only:

> Under the accepted ECO-146 operating context and qualified R01–R10 / A–G surface, a four-role substrate-independent logical architecture — Situated Basis, Inquiry State, Applicability Reconciler and Reliance Qualifier — has been selected and adversarially exercised. Its contracts preserve situated context, question/coverage/warrant/uncertainty, historical/current applicability and use-scoped reliance without requiring a monolithic account or selecting physical mechanisms.

It additionally establishes:

- Q1–Q7 have logical-architecture dispositions;
- every A–G/CP1–CP6 responsibility has an accountable home;
- historical meaning, not only revision detection, is required where requalification relies on history;
- activated mechanically decidable consequential-transition requirements must later receive non-memory-only enforcement;
- physical design can choose realization details without changing the contract **provided** the cold-transfer test confirms the contract is actually recoverable by a fresh worker.

It does **not** establish:

- completed ECO-147 qualification;
- Gate J PASS;
- continuity acceptance;
- README frontier advancement;
- schema/API/storage/vendor/runtime design;
- implementation/runtime conformance;
- performance/usability/reliability;
- authority or permission to execute effects;
- full URG architecture;
- final naming;
- ECO-136 closure.

## 13. Persistence / publication receipts

A dedicated review branch was created from canonical `main`:

`docs/eco-147-quadrant-architecture-shape`

Logical Architecture Contract commit:

`2af2909a5b6c1611613c1e7fde17d62cecc1957d`

Contract blob:

`7dd210e385f1dedd934cd432ee2bab9d0197b469`

This return is persisted on the same branch. The directory README is intentionally **not** updated because ECO-147 requires frontier advancement only after Shape is accepted for continuity.

No schema, runtime, deployment, Supabase, Vercel, ECB production, or semantic-authority mutation was performed.

## 14. Exact next seam / precise blocker

**Precise blocker:** execute the commissioned bounded cold-transfer check with one genuinely fresh worker that receives only `Quadrant-Logical-Architecture-Contract-v0.1.md`.

If the worker successfully recovers all eight required items without hidden context, update this return with the evidence, rerun only Gate J/navigation-sensitive portions, and then present the Shape packet for continuity acceptance.

If the cold worker fails because navigation or wording is unclear, repair the contract only and retest the failed area.

If the cold worker exposes a logical ambiguity, repair the responsible Shape contract and rerun affected adversarial hooks.

If the cold worker exposes a requirement/semantic contradiction, stop and route through U1/U2.

**Phase disposition:** ARCHITECTURE SHAPE SELECTED + ANALYTICALLY QUALIFIED; HOLD BEFORE PHYSICAL DESIGN AND BEFORE CLAIMING ECO-147 COMPLETE, pending the required independent cold-transfer evidence.
