STATUS: CANDIDATE — PENDING PRINCIPAL REVIEW (no contract, kernel, runtime or authority change)
DATE: 8 October 2026, America/Phoenix
COMPANION SIMULATION: https://claude.ai/artifact/8mePefjLn5JZB4oW4SsJdj (private Artifact; 25 log-computed checks; ports inquiry 0.3.0)
PROVENANCE: earlier surface prototype preserved unchanged at https://claude.ai/artifact/W7BruNi4rG4QMnoLxWctoh (negative control only)

> **CURRENTNESS NOTE — main `872c4bc`, 8 October 2026 (after this synthesis ran at `c4fad77`).** Commits `054d6b2` and `872c4bc` advanced inquiry orchestration to **0.3.0**. Read the body below with these corrections; the stop line is unchanged.
>
> - Claim 3.12: the inquiry basis hash now also includes `contract` and `disclosure_contract`, so a grammar change alone changes the assessment basis.
> - Rung 3: a `QUADRANT_POSITION` counts as coverage only when its content, characterization and conditions refs resolve to writer-selected account editions (`Disclosure.account_editions`) recovered with content, custody and CURRENT standing, and rechecked at exit. Unknown, decomposed, unresolved and individually unexamined records each keep their own question regardless of aggregate coverage. Duplicate record refs are denied.
> - Stop line, "what would earn rung 6", item 2: the preserved projection content now carries `disposition` and `disclosure_accounts`. It still carries no `reentry`, the structured ProjectionRecord is still not stored, and nothing persisted is addressable from the referent id. The integral token carrier therefore remains unearned.
> - Line citations into `server/orchestration.ts` predate this change and may be offset.
> - The companion simulation now ports 0.3.0 and adds check C25 (an unversioned account supplies no coverage).


# Substrate-First Ladder: Intake, Enrichment, Composition, and the Surface That Projects Them

## 1. Standing and scope

- **Document standing.** CANDIDATE work product. Writing it confers no standing. Each claim carries its own class and source.
- **Job.** Read-only synthesis at main `c4fad77` ("Replace compressed Quadrant generator with positive disclosure contract"), 2026-10-08, America/Phoenix. Nothing was written to the repository, BRAIN, Linear or any database.
- **Inputs.** Three independently derived altitude ladders (substrate-up, atlas-in, fidelity/defect-first), each with an adversarial altitude audit, plus six recovered-ground readers: installed substrate, URG semantics, ECB prior art, doctrine frontier, cartography, and atomic-data prior art.
- **Synthesis rules applied.**
  - A ladder claim is kept only if its audit found it earned, or if it was repaired as the audit specified.
  - Misclassified claims are re-classed.
  - Unsupported claims are listed in the `dropped` output.
  - Missing certain ground identified by the audits is added.
  - Where the angles disagree on a point that changes a decision, both positions are kept as an UNRESOLVED discriminator.
- **Classes.**
  - INHERITED: installed or accepted, and citable.
  - DERIVED: follows strictly from named INHERITED premises.
  - CANDIDATE: useful but not earned. Folded, with a reason and an unfold condition.
  - UNRESOLVED: a decision-changing question.
- **Quadrant semantics** come only from `research/urg-kernel/Quadrant-Disclosure-Contract-v2.0.md` (`ecos:quadrant-disclosure:v2`):
  - UL: proper determination.
  - UR: determinate manifestation.
  - LL: field articulation.
  - LR: enacted organization.
  - Seat and burden are optional qualifiers only.
  - The PGO profile's O3 body (lines 159-164) and its §7 still print the superseded seat × burden generator under a line-1 supersession banner. This document therefore cites O3 through the v2 contract (v2:24-29, 44, 50-58) and never through the profile body.
- **Re-checked during synthesis.** I re-read these at `c4fad77`:
  - BUILD_CHECKOUT.md:50-57, 97
  - PGO profile:105-125
  - server/orchestration.ts:246-262, 380-437
  - tests/inquiry/orchestration.test.ts:15-60
  - ADR-007:20-26
  - docs/glossary.md:27
  - ECO-162 Shape §6:364-372
  - server/orchestration-brain.ts:166-176
  - server.ts:680-691
  - the ECO-213 work_accounts DDL
  - ingestion-probe/COMMISSION.md:33-34
  - Frontier:112-118
  - Quadrant v2:46, 54
  - CIVS plan §2A:144-161
  - ECO-191 Formal Sense:207-213

  Every other citation comes from readers and audits that checked it at line level.
- **Not done.**
  - No live production rows were queried.
  - No tests were run: `node_modules` is absent, and installing would write to the repository. Pass counts come from `research/urg-kernel/Quadrant-Disclosure-Replacement-Receipt-2026-10-08.md:40-45`.
  - Three ECB thought ids came back from search as prefixes only (8bf88173, 777aca9e, add341bf). They are not used as identifiers here.
- **Vocabulary.** "Canon/canonical" is not used as live normative language. The sorted-key JSON serializer in `server/orchestration.ts` is named by its function name, `canonical()`, only where the code is cited.

## 2. The directive (verbatim)

The principal's directive:

> "One major upstream defect we'll have to simulate first (and then derive the rest from first principles, not this cobbled together mess you've come up with) is the fact that the visual display/control surface should reflect the underlying universal referent composability system substrate. This means we need to start with the idea of an atomic, integrally tokenized substrate. Don't delete anything, but do start over at a different altitude. Do not attempt to model anything at an unearned altitude. Start with what's certain and go from there. Think of the overall project, in part, like an atlas; particularly the 'different projections for different reasons' thing but I'm sure there are many generalized patterns to identify and adopt in that domain."

Principal correction 1 (2026-10-08):

> "'Public referents' represents the pre-tokenized intake stage."

Principal correction 2 (2026-10-08):

> "The intended ideal referent enrichment includes QF first and filling out the PGO-URG disclosure discovery steps."

Principal directive 3 (2026-10-08):

> "Once properly enriched a referent shall be able to participate in the composition substrate."

## 3. Diagnosis of the upstream defect

### 3.1 What the earlier prototype did

The earlier prototype had three views: a holarchy lens, an orientation field and a fold ledger. All three sat over one JavaScript literal containing:

- hard-coded nodes;
- a relevance table keyed by orientation, with no source, assessor or basis;
- quadrant-coverage cells stored as view state;
- composites created inside the view.

It started at the altitude of finished UI paradigms.

### 3.2 The defect in installed terms

| Prototype element | Installed rule it breaks | Installed form that replaces it |
| --- | --- | --- |
| Relevance numbers with no assessor or basis | G2 "smuggled standing": a claim gains standing beyond its attributable basis (PGO profile:246-252). It also breaks no silent promotion (docs/invariants.md:157-166) and F2/F5 (ECO-162 Shape:261-275). | Candidate disposition (ADMIT/DEFER/REJECT/QUESTION_FORWARD) only from an attributable adapter with `assessment_ref` and `inquiry_basis_ref`. Unbound decisions are coerced to QUESTION_FORWARD (server/orchestration.ts:60-74, 311-357; docs/inquiry-orchestration.md:24-32). |
| Quadrant coverage cells held in the view | Coverage is recomputed on every pass from explicit same-seat v2 records (orchestration.ts:289-310, 384). | Coverage shown only as a function of `quadrant` records and the seat. |
| Composites created in the view | Composites are per-instance operational composition, not one persistent entity (BUILD_CHECKOUT.md:56-57). The ADMIT preflight requires a Level witness for constitution (orchestration.ts:326-357). A new organized whole invokes the constitutive Level witness (Quadrant v2:73). | Composition membership read from `admitted` and its relation records, or from installed ECO-213 composition accounts, each labeled with its gate. |
| Hard-coded nodes | referent ≠ map; map ≠ mapper (docs/invariants.md:11-12). Views are projections, not sources of truth (CIVS plan §2A:156). | Every element resolves to a registry id or record ref. |
| One literal through which every view is routed | The CIVS plan rejects "a bespoke dashboard-first realization whose semantics, data joins or maintenance burden are not earned" (§2A:152). | Each plate derives directly from substrate records under its own declared rule. |

The repository has already repaired one instance of this defect class: an optional projection helper "silently manufactured placeholder G/frame/access refs" (docs/inquiry-orchestration.md:88).

### 3.3 Diagnosis by altitude

- The prototype drew an atlas of plates over tokens: compositions, fields and lenses. The integral token those plates presuppose is not installed (Section 7).
- It also merged three layers that the installed substrate keeps apart: intake, enrichment and composition.
- The repair is not a better view. The repair is to locate each layer in installed records, state the gate between them, and derive each plate from the records of its layer.

### 3.4 The governing installed rule for the surface

The accepted CIVS plan §2A (docs/capability-inspection-verification-spine-plan.md:144-161, accepted 2026-10-07) is the installed contract for this defect. It requires:

- a first-class graphical human door over the same addressable objects as the agent door;
- graphical views as projections and control surfaces, not new sources of truth;
- direct manipulation that resolves to typed, attributable actions or requests with explicit authority and effect boundaries;
- human edits that stay attributable and machine-visible ("authority does not arise from whichever door wrote last", :146);
- graceful text/API degradation;
- renderer portability;
- use-earned persistence for any particular view.

The plan also says that "WP0–WP2 do **not** build that substrate". In the first CIR, the graphical obligations `typed_controls`, `change_history_visibility` and `human_agent_reconciliation` are NOT_ESTABLISHED (research/civs/domain-semantic-admission.cir.json:1767-1855; server/civs.ts:68-77).

**Correction carried from the audits.** One earlier ladder said the surface "may never author an assessment". That is wrong under §2A. A human acting through the graphical door is a lawful attributable assessor through the same typed adapter inputs (`evaluateCandidate`, `disclose`, `reconcile`, each with its `assessment_ref` or `evaluator_ref`). The prohibition covers only values the view fabricates or stores. Every control is therefore either an attributable typed write through an installed path, or disabled with a stated reason.

## 4. The three layers and the eligibility gate between them

```
public.referents  (role: pre-tokenized registration; also the shared address space of every record)
      |
[INTAKE]  thoughts + thought_admissions + ordinary_operations + ECO-138 operational disposition
      |   confers nothing (ADR-007:22). Admission creates no review debt.
      |   transition starts only from a declared request (Section 6, claim 0.14)
      v
[ENRICHMENT]  QF first (intended order), then O1..O7 -> READY or HOLD
      |   installed: one bounded orchestrateInquiry pass, per inquiry basis, NOT_PRESERVED
      |   persisted partial carriers: preserved projection JSON, ECO-213 work seat, ECO-138 heads
      v
ELIGIBILITY GATE (installed only inside one pass: the ADMIT preflight + Level tooth; reliance needs READY)
      |
      v
[COMPOSITION SUBSTRATE]  per-inquiry admitted membership; ECO-213 composition accounts (dormant);
                         relation Claims part_of/member_of (assertions, not participation)
```

### 4.1 Intake layer (certain ground)

- `public.referents(id, registered_at)` is the role-level pre-tokenized registration.
- Intake material is `public.thoughts`, with custody in `thought_admissions` and `ordinary_operations`.
- An installed operational disposition chain (ECO-138) holds a reentry condition.
- Admission confers no relevance, standing, authority, persistence, review debt, future optionality, retention entitlement, qualification, routing or promotion (ADR-007:22).

Details are at rung 0.

### 4.2 Enrichment layer

- **Intended order.** QF first, then the PGO-URG steps O1 to O7 (Principal correction 2; PGO profile:103-226).
- **Installed performer.** One bounded `orchestrateInquiry` pass, keyed to an inquiry basis (sha256 over query, intended use, context and actor). Its result is NOT_PRESERVED unless it is explicitly preserved as an immutable text artifact.
- **QF-first is not enforced** by installed code.
- **Persisted partial carriers exist:**
  - preserved projection JSON, recoverable given the artifact id;
  - ECO-213 `work_accounts`, a dormant seat-like basis with question and return route keyed to `focal_id`;
  - ECO-138 disposition heads, operational only.

  None of them carries v2 disclosure state, typed QF records and a READY/HOLD exit addressable from the referent. Details are at rung 3.

### 4.3 Composition substrate

Three installed carriers exist, each with a different gate:

1. Per-inquiry `admitted` membership, which is transient.
2. ECO-213 `composition_accounts` and `composition_members`, persisted and dormant, with a separate persisted reliance gate (`use_assessments` and `use_heads`).
3. Relation Claims `part_of`, `member_of` and `depends_on`, persisted, with no gate and born unassessed.

A persistent composite referent is explicitly not installed (BUILD_CHECKOUT.md:56-57). Details are at rung 4.

### 4.4 The eligibility gate as installed

| Composition entry | Persisted | Gate | Requires PGO-URG enrichment |
| --- | --- | --- | --- |
| Per-inquiry ADMIT (orchestration.ts:326-357, 371-382) | No (NOT_PRESERVED) | Attributable decision; same digest and basis; current use CURRENT with standing and evidence; RELIED native_relation whose `situated_basis_ref` equals the basis; for CONSTITUTIVE membership, a same-seat LEVEL_WITNESSED claim; exit re-fetch | The member: no. The gate is per-member qualification under the focal basis. Reliance on the composition: yes, the focal pass must be READY. |
| ECO-213 interactive `compose_account` (eco213_work_context.sql:230-371, mechanism check :357; execution.sql:225-242) | Yes, dormant | Remit; mechanism kind `compose`; member in work scope; non-empty members, `old_dependency_review` and `destination_disclosure` | No |
| ECO-213 scheduled compose continuation (execution.sql:213-224, 261) | Yes, dormant | Prior `assess` verdict SATISFIED over six differentiation keys (participants, modality, polarity, conditions, attribution, dependencies). This is scheduling; the interactive path bypasses it. | No (not v2 disclosures) |
| ECO-213 reliance on an account (work_context.sql:46-89; native.sql:210-239; execution.sql:303-307) | Yes, dormant | Two-sided reconcile (old_dependency and destination_discovery), dependency digests, work epoch, `use_heads` | No |
| Relation Claim `part_of` / `member_of` (build_4:7-62) | Yes | None. Born `unassessed`. | No. It is an assertion about composition, not participation. |

DERIVED (premises: the table rows above; enrichment results are NOT_PRESERVED, orchestration.ts:435). Directive 3 is enforced today only inside one orchestration pass. No installed row answers the question "is referent X PGO-URG enriched?". Per-(work, use) reliance on a composition account is persisted in ECO-213, but it is neither QF-first nor v2-disclosure gated.

**HOLD and partial participation.**

- DERIVED: the coordinator returns `admitted` whatever the exit, and READY holds iff no QF remains (orchestration.ts:382, 431-434).
- UNRESOLVED: is it lawful to rely on members admitted under a HOLD? The bound is ECO-191 `ExteriorizeQF`: a "decisive unknown cannot be deferred into positive use", with an interim reliance limit (ECO-191-Formal-Sense-Return-2026-09-24.md:207).
- Surface rule: such members are displayed as "admitted, not relied".

### 4.5 What each layer shows and which controls are lawful

| Layer | Visible as | Lawful controls (installed paths) | Forbidden on the surface |
| --- | --- | --- | --- |
| Intake | Ledger of thoughts by registered id: content, source, `captured_at` (caller-claimed), `registered_at` (database custody time), admission context, operational disposition head with its reentry condition. Registered-only ids listed separately as "no native record in inspected scope". | Capture through the ordinary capture operation (`capture_thought`; trigger-registered referent). Set operational disposition through `set_thought_disposition` with predecessor compare-and-set and an optional reentry condition, labeled "operational, not standing". Request enrichment, which needs a declared use and return route. | Relevance, rank, color by importance, grouping that implies co-reference, seat, disclosure, membership, edit or delete. |
| Enrichment in progress | Per inquiry basis and projection edition: QFs (discriminator, consequence, return route, reentry), six seat coordinates with blanks visible, four v2 disclosures recomputed from records, candidate dispositions with assessor and basis, reconciliation sides, channel coverage, HOLD with reentry, contract editions, NOT_PRESERVED. | Run or re-run an inquiry. Supply attributable adapter records (disclosures, decisions, reconciliation). Submit a typed ChangeRecord validated by `validChange`. Preserve an edition (`preserveInquiryProjection`, six seat keys required). | "Mark covered", "set relevance", "promote", an "integral" badge on a referent id. |
| Enriched (READY) | The same plate with READY, bound to its basis and edition. Shows that READY does not mean Level witnessed unless a witness is present. | As above. | Showing READY as a stored property of the referent. |
| Composed | Admitted members per inquiry edition with relation record, membership type, Level witness (constitutive only), current-use standing and evidence, READY or HOLD. ECO-213 accounts in a separate dormant layer with members' `basis_digest` and `use_heads` verdict. Relation Claims in a claims layer as asserted edges with standing. | ECO-213 `compose_account` under remit, labeled "not PGO-URG gated". Prepare a relation Claim (unassessed). A typed Reseat ChangeRecord. | A working "Compose", "merge" or "create composite" control (no Compose change kind exists). Containment drawn from proximity, zoom or grouping. |

## 5. Readings of "integrally tokenized"

| Reading | Support | Status |
| --- | --- | --- |
| (a) Identity token: one UUID minted once, registered before description | `public.referents(id, registered_at)`, insert(id) only (build_2:8-11, 52-56, 70-72); registration is not promotion (ADR-003:38-44). Against: Principal correction 1; "A durable Referent is not itself a sufficient Integral Token" (research/ingestion-probe/RESULT.md:59). | Rejected as the token. Retained as the rung-0 precondition. |
| (b) Integral obligations are native: every seated referent carries all four disclosure obligations | "Missing content does not remove an obligation" (Quadrant v2:20). Every pass starts the four disclosures UNEXAMINED and emits a QF per unexamined disclosure (orchestration.ts:289, 384). | Supported in this form: the obligations attach at seating and their discharge is enrichment. Conformal Zoom shape invariance gives no basis (Section 9). |
| (c) Token as opposed to type (Charter two-type law; Peirce) | ECB thought c568d781-89c9-4d93-bbf2-73262964e3af; the Charter marks its own law CANDIDATE. | Weak. Kept only as a discipline: a content digest pins a type-level edition and must never merge encounter tokens (build_3:127-145). |
| (d) Tokenization is the post-intake enrichment transition: QF first, O1 to O7, READY or HOLD | Principal corrections 1 and 2. "After raw ingest to the thoughts table, stable enrichment/seating is the present referent-contact bootstrap problem" (Frontier:92). "integral token" is a design-lineage name for enrichment/assimilation, not ratified (Frontier:315). "Tokenization is a new mechanism hypothesis serving older dynamic referent discovery, activation, and composition" (COMMISSION.md:33-34). End state "sufficiently situated dynamically composite referent structure" (Frontier:114). | Best supported. No installed performer persists it. The term is unratified. |
| (e) Composite reading: "atomic" names the intake Thought; "integrally tokenized" names its enrichment | Thought is "An atomic Open Brain evidence record optimized for future semantic retrieval" (docs/glossary.md:27); migration `build_0_atomic_thoughts`; "raw atomic Thought" (RESULT.md:5); the probe was narrowed to "preparation of raw atomic Thought for database encounter" (RESULT.md:3-5). | CANDIDATE interpretation with strong lexical support. It places "atomic" at rung 0 and "integral" at rung 3. It does not decide U1 or U2. |
| (f) Integral as the full Integral/URG grammar: all seven distinctions plus focal/frame/mapper/access | COMMISSION.md:25-27 maps one to one onto schemas/urg-core-v2.contract.json:24-38. Against, or narrower: the coordinator checks Level and Quadrant only (orchestration.ts:289-310, 343-345). Quadrant v2:46 says State, Level and Type records do not count as disclosures. COMMISSION:25 ("quadrantic quality") predates v2. | UNRESOLVED (U1). It sets the completion criterion. |
| (g) Fold-token: synthesis output is "a single re-expandable token with a wired re-activation trigger", "collapse-with-a-handle, never delete" | ECB d91787d4-12eb-4c79-9055-e2416cc689a3, status current, stamped "AUTHORITY: approved — ratified by Levi 2026-05-31" (legacy ECB). Frontier:233 keeps "folded material, reason and unfolding trigger" as a design obligation. Installed analogue: HOLD reentry `{return_route, unresolved_refs, condition}` (orchestration.ts:436). TriggerQuestionForward is never emitted (urg-core.ts:66 only). | INHERITED as a dated legacy-ECB Principal ratification of what an integration output is. Its mapping onto installed HOLD is CANDIDATE. Direct evidence for U2: a HOLD or depreciated output may still be a token. |
| (h) Integral as integrity: every fidelity coordinate stays recoverable under projection and compression | F1 to F8 (ECO-162 Shape:261-275); metadata never silently cut and a reduced projection cannot supply READY (orchestration.ts:404-417). | CANDIDATE reading of the word. The constraints are installed; no source names them "integral". |
| (i) ECO-213 `differentiate` as the token grain: anchored semantic units | Installed, dormant, model-driven (eco213 native:146-186; execution:178-211). Requires a work account with question and return route. Organized by modality, polarity and attribution, not by QF or v2. RESULT.md §7:140-147 (Universal Referent Walk earned minimum) supports reading it as a pre-step before reconciliation. | UNRESOLVED (U6). |
| (j) Atomic in the transactional sense | "One atomic activation" (build_2:2); idempotent operation identity (build_11:14-39, 356-387). | Installed and certain, but it concerns write discipline. Every enrichment write reuses it. |

## 6. The earned ladder

Each rung below gives what it is, its claims with class and source, what earns it, and its surface consequence. Claim numbers are local to this document.

### Rung 0. Pre-tokenized intake

**What it is.** A registered UUID, plus (for intake material) a Thought row, neutral custody records and an operational disposition chain. It confers nothing.

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 0.1 | `public.referents` holds exactly `id uuid` and `registered_at timestamptz default transaction_timestamp()`. The runtime grant is SELECT plus INSERT(id). Activation aborts unless the column count is 2. | INHERITED | sql/migrations/20260904093341_build_2_universal_referents.sql:8-11, 52-56, 70-72 |
| 0.2 | Registration supplies stable referential addressability only. It is not description, type, assertion, standing, authority, currentness or co-reference. UUID uniqueness is not subject uniqueness. | INHERITED | docs/architecture-decisions/003-build-2-persistent-first-class-identity.md:35-44; docs/invariants.md:32-53; docs/glossary.md:8-21 |
| 0.3 | Two installed states exist. A registered-only referent (no native record) is lawful. An absent native record creates no question or epistemic standing. | INHERITED | build_2:39-40; ADR-003:43-44, 57-58 |
| 0.4 | A BEFORE INSERT trigger on `thoughts` registers the same UUID in `referents`. Capture registers the referent as a side effect. | INHERITED | build_2:13-33; ADR-003:56-57 |
| 0.5 | The registry is the shared address space of every first-class record: claims, evidence links, standing transitions, artifacts, operations, representations, disposition revisions, governance records and ECO-213 non-head tables. Build-series tables use FK RESTRICT NOT DEFERRABLE. ECO-213 uses plain REFERENCES plus an immutability trigger. | INHERITED | build_2:13-48; build_3:27-33; build_12 correction:121-130; eco213 native:283-299 |
| 0.6 | "Pre-tokenized intake" names the role of registration, not the whole row set. An intake plate defined as f(referents) would show downstream records as intake. The intake plate therefore filters by native type (thoughts with admission and disposition) and lists registered-only ids separately. | DERIVED | Premises 0.4, 0.5; Principal correction 1 |
| 0.7 | Admission records encounter/material plus provenance. It confers no relevance, standing, authority, persistence, review debt, future optionality, retention entitlement, qualification, routing or promotion. The thoughts table may reorganize under an explicit intake module. Intake architecture routes through ECO-177. | INHERITED | docs/architecture-decisions/007-retire-canon-and-non-prejudicial-intake.md:22, 24, 51 |
| 0.8 | ECO-177 ("Crucible identity", covering intake consolidation, evidence processing, qualification and routing) is commissioned and unexecuted. It owns the intake-to-qualification transition. | INHERITED | BUILD_CHECKOUT.md:97; research/semantic-circulation/2026-09-30-Trusted-Participation-Requirements-and-Session-Integration.md:219 |
| 0.9 | Intake carriers: `thoughts(id, content, source, captured_at)`, where `captured_at` may be supplied by the caller; `thought_admissions` (neutral custody context, "not a Claim, standing, authority, route, priority, or interpretation"); `ordinary_operations` (kind `capture_thought`, request digest, result referent, replay and conflict handling). | INHERITED | build_0_atomic_thoughts.sql:6-20; build_11:14-39, 356-398; eco138_admission_disposition.sql:21-56 |
| 0.10 | `registered_at` (database custody time) and `captured_at` (claimed encounter time) are distinct times. | DERIVED | build_2:10; build_11:389-398 |
| 0.11 | ECO-138 `thought_disposition_revisions` are trigger-immutable, chained by predecessor within one Thought, and carry an open-text disposition and an optional `reentry_condition`. `thought_disposition_heads` give explicit currentness, "never inferred from newest revision". New captures start `unresolved`. Disposition is not epistemic or governance standing. Transitions run through `set_thought_disposition` with predecessor compare-and-set. ECO-140 binds each revision to an ACTION or HOLD text artifact. | INHERITED | eco138_admission_disposition.sql:58-150, 174-197; eco138 transition fix migration:8, 97-152; server/oauth.ts:125; eco140_shaped_next_action.sql:1-47 |
| 0.12 | Enrichment cannot rewrite intake material in place. Thoughts are select/insert-only by grant, and attaching a native record to a registered-only referent is deferred. Enrichment adds new records that reference the intake id. | DERIVED | build_0_least_privilege.sql:5-6; ADR-003:57-59; docs/glossary.md:37-46 |
| 0.13 | Nothing at rung 0 carries relevance, seat, disclosure, standing or a READY/HOLD exit. | DERIVED | 0.2, 0.7; RESULT.md:59 |
| 0.14 | Admission alone cannot open an enrichment obligation. An enrichment pass, and so its first installed QF, starts from a declared request (query, intended use, return route, actor), not from admission. | DERIVED | ADR-007:22 (no review debt); orchestration.ts:248 |
| 0.15 | "Atomic" names the intake Thought in installed vocabulary. | INHERITED | docs/glossary.md:27; build_0_atomic_thoughts; RESULT.md:3-5 |
| 0.16 | The connected `capture_thought` action rejects calls because its exposed schema lacks the runtime-required `operation_id`. This is a known live defect on the intake control. | INHERITED (reported) | docs/working-preferences-constructive-di.md:54 |
| 0.17 | Immutability of `thoughts` and `referents` rests on grants, not triggers. Owner migrations have dropped Thought columns (BUILD 11) and deleted referent rows (BUILD 12 correction). | INHERITED | build_0_least_privilege.sql:5-6; build_11:106-108; build_12 correction:87-111 |

**Earned by.** Installed migrations and grants, accepted ADR-003 and ADR-007, and Principal correction 1.

**Surface consequence.**

- The INTAKE plate is a ledger of thoughts by registered id, showing:
  - content and source;
  - `captured_at`, labeled caller-claimed;
  - `registered_at`, labeled database custody time;
  - admission context ("none" when null);
  - the operational disposition head and its reentry condition, labeled "operational, not standing".
- Registered-only ids appear in a separate section as "no native record in inspected scope".
- The plate states which guarantee applies: immutability by grant (rung-0 core) or by trigger (ECO-138).
- Lawful controls: capture; set operational disposition; request enrichment (which requires a declared use and return route).
- The plate shows no relevance, rank, grouping or standing.
- Absence from the plate renders as "not encountered or not shown", never as irrelevance (invariants.md:15-18).

### Rung 1. Persisted claim, evidence and standing spine

**What it is.** Typed records that share the registry address: relation and assertion Claims, born unassessed; digest-pinned Evidence Links; and an append-only standing-transition log that is the only path for changing standing.

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 1.1 | A Claim has exactly one of two shapes: an assertion, or a relation (`subject_referent_id`, `predicate`, `object_referent_id`) with FKs to `referents` only. `prepare_claim` forces origin `ecb_inference`, `epistemic_standing = 'unassessed'` and `asserted_at` = transaction time. | INHERITED | sql/migrations/20260904215929_build_4_typed_relation_claims.sql:7-80, 104-111; build_3:69-94 |
| 1.2 | The installed predicate CHECK is: depends_on, located_in, member_of, part_of, reported_inventory, recurring_use, reported_by, supports, contradicts. BUILD 4 originally allowed only depends_on. The ECO-149 `quad_*` predicates exist in a file that is not installed. | INHERITED | eco213_circulation_execution.sql:3-5; build_4:42-43; BUILD_CHECKOUT.md:297-304; sql/migrations/README.md:9 |
| 1.3 | Evidence Links are separate records pinning the basis to an exact revision by scheme plus a 32-byte digest, per carrier type (Thought, text artifact, semantic unit). | INHERITED | build_3:35-67, 96-162; eco213 execution:38-54 |
| 1.4 | `claim_standing_transitions` is the only legal path for changing standing (unassessed, basis_qualified, revalidation_required), with compare-and-set on the declared prior standing. Its trigger UPDATEs `claims.epistemic_standing`. Applied standing is therefore a mutable column on the claim row, and history lives in the log. | INHERITED | build_5a_standing_transition_history.sql:1-3, 99-153 |
| 1.5 | Trigger-immutable: text_artifacts, BUILD 5B artifacts, ECO-138 revisions, ECO-140 projections, BUILD 6 governance history, ECO-213 non-head tables. Grant-protected only: claims (apart from the standing column), evidence_links, transitions, ordinary_operations. | INHERITED | build_12 correction:151-176; 5B:591-611; eco138:152-177; eco140:29-47; eco213 native:285-299; build_0_least_privilege.sql:5-6 |
| 1.6 | Currentness is read only from per-domain head pointers over immutable predecessor chains. No general as-of or bitemporal selection, universal current-state projection, Artifact DAG or universal relation/transition kernel is installed. | INHERITED | docs/architecture-decisions/005-cross-cutting-integrity-and-promotion-discipline.md:78-86; docs/invariants.md:27 |
| 1.7 | `part_of` and `member_of` are assertions with their own standing, not structural containment. | DERIVED | 1.1; invariants.md:13, 21 |
| 1.8 | Only transaction time is recorded. "Timestamps cannot manufacture validity or currentness." Valid time was ingested as evidence (E13) and not promoted. | INHERITED | docs/build-sense/007-build-5b.md:237; docs/build-evidence.md:295-313 |

**Earned by.** Installed migrations BUILD 3, 4, 5A, 11 and 12, ECO-213 vocabulary replacement, and ADR-005 non-selections.

**Surface consequence.**

- The CLAIMS layer draws each edge from a Claim with its id, predicate, applied standing (initially `unassessed`) and digest-pinned evidence ("basis as of revision `<digest>`").
- "Current" comes only from a head. "As of T" means "as recorded at T", replayed per domain. No validity interval is drawn.
- Lawful controls: `prepare_claim`, evidence link, and standing transition with the declared prior standing.
- A `part_of` edge never renders as containment or membership.

### Rung 2. Enrichment increment grammar (installed code, no database carrier)

**What it is.** The closed, discriminated record vocabulary in which every enrichment increment is expressed. It is held in memory and validated structurally.

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 2.1 | `ecos:urg-core:register-b:v2`, revision 2.0.0, defines exactly eleven record kinds: level, quadrant, direction, state, line, stage, type, native_relation, projection, change, question_forward. Validation is structural only, not truth, authority or currentness. | INHERITED | server/urg-core.ts:4-16, 32-44; schemas/urg-core-v2.contract.json:5-23 |
| 2.2 | URG records have no database or MCP carrier. ADR-009 reopens physicalization only if a real consumer cannot preserve required distinctions with the portable contract plus the existing Referent/Claim/Artifact substrate. BUILD 12's generic version-family model is the negative precedent. | INHERITED | docs/architecture-decisions/009-urg-core-portable-package.md:36-45, 58-62; research/urg-kernel/README.md:122 (non-physicalization only; its revision line is stale) |
| 2.3 | `SituatedContext` requires only `referent_id` and `boundary_ref`. | INHERITED | urg-core.ts:96-106, 391-392 |
| 2.4 | `FidelityCoordinates` keeps coverage (UNEXAMINED, EXAMINED), activation (ACTIVE, DORMANT) and disposition orthogonal. Disposition is required iff EXAMINED. Evidence, warrant, authority, custody, currentness and challenge-QF refs are independent. | INHERITED | urg-core.ts:74-94, 348-383 |
| 2.5 | A QuestionForward has ten required nonblank fields: unresolved_ref, basis_ref, current_standing_ref, discriminator_question, paired_signal_scenario, evidence_change_criteria, alternative_signal_routing, decision_consequence, return_route, reentry_condition. | INHERITED | urg-core.ts:282-294, 650-656 |
| 2.6 | A v2 quadrant record declares `ecos:quadrant-disclosure:v2`. Its results: QUADRANT_POSITION needs disclosure plus content, characterization and conditions refs; QUADRANT_UNKNOWN needs `qf_ref`; DECOMPOSE needs at least two distinct `component_refs` "preserving recoverable sub-inquiries". Top-level seat or burden is rejected; both are allowed only as qualifiers. | INHERITED | Quadrant v2:42, 50-56; urg-core.ts:119-137, 458-479 |
| 2.7 | `qf_ref` is required on LEVEL_UNKNOWN, QUADRANT_UNKNOWN, unresolved Line and Stage, open Type results and incomparable State results. STATE_UNKNOWN accepts `candidate_set_ref` instead. A `qf_ref` is a pointer string. The coordinator collects QFs only from records of kind `question_forward`. | INHERITED | urg-core.ts:445-597; orchestration.ts:303 |
| 2.8 | There are twenty-one change kinds. A ChangeRecord needs source and destination basis, continuity mode, affected claims, affected dependencies, requalify refs and fidelity. Compose, Relate and TraverseQ are not change kinds. | INHERITED | urg-core.ts:48-70, 267-280 |
| 2.9 | A ProjectionRecord needs `mapped_referent_ids` (at least one), mapper, mapping relation, governing orientation, frame, access, scope/resolution, evidence basis, content, fidelity and omissions. | INHERITED | urg-core.ts:249-265, 617-633 |
| 2.10 | Level witness W_L=(C,O,d). LEVEL_WITNESSED needs constituent ids, `organization_ref` and `dependence_witness_ref`. Level is local, with no global integer altitude. K9 recursive closure, K11 witnessed-chain rule and K12 representation non-collapse ("the kernel/map does not become R") remain inherited under v2. | INHERITED | Level-Quadrant-Formal-Contract-v1.0.md:43-110, 267-281; Quadrant v2:44; urg-core.ts:108-117, 445-456 |
| 2.11 | The full URG core composes v2 with independently standing Level, Direction, State, Line, Stage and Type contracts. A State, Level or Type record does not automatically count as a disclosure. | INHERITED | Quadrant v2:46 |
| 2.12 | The atomic unit of enrichment is one attributable record (a Claim or a URG record). No installed record unites a referent's increments. "The URG core is not a schema containing one field per axis." | DERIVED | schemas/urg-core-v2.contract.json:10; URG-Core-Register-B-Candidate-v1.0.md:442; 2.1 |
| 2.13 | URG increments have no SQL-queryable carrier. | DERIVED | 2.2 |

**Earned by.** Installed code with tests (receipt, not re-run) and accepted ADR-009.

**Surface consequence.**

- Every enrichment mark is a typed record with its kind named.
- Coverage, activation and disposition render as three independent channels, never one status color.
- A QF renders as a structured reentry aperture. A dangling `qf_ref` renders as "unresolved pointer", not as an open QF.
- Every plate names `ecos:urg-core:register-b:v2` and `ecos:quadrant-disclosure:v2`.
- A legacy seat-burden record appears only through `validateLegacyQuadrantRecord` and never counts as coverage (urg-core.ts:413-428; v2:75-79).

### Rung 3. The enrichment pass: QF-first contract order and the installed bounded pass

**What it is.** The intake-to-token transition the Principal names. In contract it is QF first, then O1 to O7, ending READY or HOLD. As installed it is one bounded `orchestrateInquiry` pass over a declared inquiry basis.

**3A. Contract order and the meaning of QF-first**

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 3.1 | O1 invokes Bootstrap B "over encounter/recovery inputs, source provenance, access and remit". It has five alternative permitted results: provisionally recovered R/B/G/F; a retained candidate set; a discriminating Question Forward; READY for the declared bounded use; HOLD. "No complete R or G is presumed before bootstrap." | INHERITED | PGO-Directed-Situated-Referent-Orchestration-Profile-v0.1.md:105-117 |
| 3.2 | O1A opens the discovery aperture only "once enough present inquiry basis exists to avoid generic search". Its step 4 is admit, defer, reject or exteriorize a QF. O2 then seats under the Level witness. O3 traverses the four v2 disclosures at fixed R/B. O4 routes discoveries through typed transformations. O5 reconciles in two parts. O6 continues only for consequential differences. O7 exits READY or HOLD with QF and reentry. | INHERITED | profile:119-226 (O3 read through Quadrant v2:24-29, 44, 50-58) |
| 3.3 | Bootstrap B (ECO-191) takes encounter/recovery inputs, declared policy/remit and access constraints, with "no completed R/G required". It returns provisional candidates, recovered orientation, a discriminating question, READY or HOLD. It is a guarded relation that may not invent semantic facts, binding authority, or a unique selection from symmetric insufficient input. Its Shape is closed at the Move border, and no code implements it. | INHERITED | ECO-191-Formal-Sense-Return-2026-09-24.md:211, 291-302; ECO-191-Indexed-Change-Reconciliation-Shape-2026-09-24.md:228-243 |
| 3.4 | ECO-191 F8: the encounter itself can be provisionally designated. Orientation primacy is "a launch strategy, not an unconditional total order placing completed G before any reference at all". | INHERITED | ECO-191 Formal Sense:295, 301 |
| 3.5 | `SENSE_SEATING_FORWARD_2026_09_29 = POINT_OF_VIEW_PLUS_INITIAL_CONTRAST_PLUS_FOCAL_OBJECT_THEN_WHOLE_PARTS_AND_GENERAL_PGO_WHEN_CONSEQUENTIAL`. | INHERITED | BUILD_CHECKOUT.md:55 |
| 3.6 | QF comes first in the intended ideal enrichment order. | INHERITED | Principal correction 2 (2026-10-08) |
| 3.7 | The first QF comes before O1A discovery and before O2 seating. Premises: O1A is gated on sufficient O1 basis (3.2); a discriminating QF is a lawful O1 result (3.1); O2 seats a provisional R/B (profile:85, 145); PGO does not manufacture identity, constitution, Level or evidence (profile:87-101); QF first is intended (3.6). | DERIVED | Premises as listed |
| 3.8 | QF-first does not mean an unconditional total order or that QF is the only lawful first act. Provisional designation of the encounter and preservation of candidates are also lawful bootstrap acts. | DERIVED | 3.1, 3.3, 3.4 |
| 3.9 | Frontier QF formulation: QF job 1 is "Repair an inadequate situational basis: Recover the governing intention or consequential border before expanding downstream inquiry". "A sufficient situational basis is upstream of consequential derivation. At minimum it includes a PGO." The document self-labels "PRINCIPAL-ACCEPTED INVESTIGATION DIRECTION; FORMULATIONS ARE CANDIDATES". QF obligations are "not a newly installed record type". The Frontier lists five roles (Frontier:122) and four jobs (table, 126-131). No enumerated list of five jobs exists. | CANDIDATE formulation under an accepted direction | Situated-Referent-Discovery-Frontier.md:4, 94, 122-131 |
| 3.10 | What the first QF is about is open. It could concern G/PGO and the consequential border (3.9), or point of view, initial contrast and focal object, with general PGO "when consequential" (3.5). This is held as U3. | UNRESOLVED | 3.5 vs 3.9 |

**3B. The installed bounded pass**

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 3.11 | `orchestrateInquiry` throws `inquiry_context_required` unless query, intended_use, return_route and actor_ref are all nonblank. It then runs discovery immediately. | INHERITED | orchestration.ts:246-262 |
| 3.12 | `basis_ref = 'sha256:' + sha256(canonical({query, intended_use, context, actor_ref}))`. The whole context enters the hash, including `grain_ref`. The same R under another question is another basis. | INHERITED | orchestration.ts:163-174 |
| 3.13 | Seat identity is exactly six keys: referent_id, boundary_ref, governing_orientation_ref, mapper_ref, frame_ref, access_ref. If any is blank, the `situated_basis` QF is raised. | INHERITED | orchestration.ts:193-194, 383 |
| 3.14 | Installed code does not enforce QF-first. The first installed QF is keyed to an inquiry basis, not to a bare intake id. In `questions_forward` the `situated_basis` QF follows any candidate, reconciliation and re-fetch QFs. | DERIVED | orchestration.ts:196-207, 248, 311-383 |
| 3.15 | Seat-before-disclose holds mechanically for R and B: a disclosure record counts only if valid, which requires `referent_id` and `boundary_ref`, and only if it shares the seat. Under a partial seat, records whose context also omits G pass `sameSeat`. Coverage can then read EXAMINED while the pass HOLDs on `situated_basis`. | DERIVED | urg-core.ts:391-392; orchestration.ts:194, 292-293 |
| 3.16 | Coverage is recomputed on each pass. All four disclosures start UNEXAMINED. A disclosure becomes EXAMINED only from a structurally valid same-seat QUADRANT_POSITION with coverage EXAMINED. Positions with disposition UNRESOLVED or CONDITIONAL_SENSORED stay EXAMINED and raise a QF. EXAMINED with NONCONSEQUENTIAL_NOW counts as covered, and the installed READY fixture uses it. QUADRANT_UNKNOWN never covers. Each UNEXAMINED disclosure raises its v2 QF. | INHERITED | orchestration.ts:289-310, 384; tests/inquiry/orchestration.test.ts:24 |
| 3.17 | The focal referent is seeded as its own candidate and needs a disposition. The installed fixture REJECTs it as "already the inquiry seat". Without a decision, the default is a consequential DEFER, which raises a QF. | INHERITED | orchestration.ts:185, 254, 314, 354; tests/inquiry/orchestration.test.ts:29-30 |
| 3.18 | `validChange` has explicit rules for Enrich (no seat change), ReviseBoundary (B only), Reseat (must change R), Reorient (G only) and ChangeFrame (some of mapper, frame, access). Every other kind, including Refocus, RequalifyStanding and GrammarChange, must change no seat coordinate. Source and destination basis must equal the recomputed basis. An invalid change raises a QF and stops further change application. | INHERITED | orchestration.ts:226-240, 277-286 |
| 3.19 | A `grain_ref`-only change leaves the seat unchanged, passes `validChange` as Enrich, and changes the basis hash. ECO-162 §6 assigns "Referential grain changes" to "Reseat or derive a related referent". The coordinator therefore has a gap against an accepted Shape. | DERIVED | orchestration.ts:173, 193-194, 231-233; ECO-162 Shape:369 |
| 3.20 | Exit: READY iff no QF remains, otherwise HOLD with reentry `{return_route, unresolved_refs, condition}`. The projection is `{edition: sha256, content, source_refs, omissions, persistence: 'NOT_PRESERVED'}`. Excerpt shortening only records an omission. Metadata overflow adds a `projection_limit` QF ("A reduced projection cannot supply READY") and falls back to identities and editions. If the irreducible binding plus 128 characters does not fit, or the minimal form does not fit, the call throws `inquiry_projection_budget_below_binding_receipt`. | INHERITED | orchestration.ts:394-437 |
| 3.21 | The default BRAIN adapter sets every candidate to QUESTION_FORWARD, discloses no records, and supplies no reconcile. Every ordinary installed inquiry therefore exits HOLD. | DERIVED | orchestration-brain.ts:154-165; orchestration.ts:359-370, 384-386, 434 |
| 3.22 | Ordinary ingress is the search tool with an optional inquiry block (`ecb-v2-search/0.7.1`). With `domain_admission`, the combined disposition is HOLD if either the inquiry or `evaluateDIBoundary` HOLDs. | INHERITED | server.ts:680-691; docs/inquiry-orchestration.md:40-46 |
| 3.23 | A READY pass carries all of the following: six nonblank seat keys; structurally valid same-seat records, with RELIED records carrying evidence and currentness refs; four EXAMINED disclosures, none UNRESOLVED or CONDITIONAL_SENSORED; an attributable sufficiency assessment bound to the basis with no unresolved refs; two-sided reconciliation SATISFIED with coverage complete; all channels AVAILABLE and untruncated; no G-signals; every candidate (including the focal referent) dispositioned with no consequential DEFER; admitted members that survive exit re-fetch; a Level witness wherever constitutive membership is claimed. READY is lawful with all four disclosures EXAMINED/DORMANT/NONCONSEQUENTIAL_NOW. READY does not mean Level witnessed. | DERIVED | orchestration.ts:292-389, 434; tests/inquiry/orchestration.test.ts:24, 44-50 |
| 3.24 | A HOLD carries the QF set (each with basis_ref, return_route, reentry_condition), reentry, the indexical binding, the projection edition, and candidate editions (id and digest). | INHERITED | orchestration.ts:418-437 |
| 3.25 | Coordinator QFs fill `paired_signal_scenario`, `evidence_change_criteria` and `alternative_signal_routing` with fixed template text. | INHERITED | orchestration.ts:196-207 |
| 3.26 | `TriggerQuestionForward` is declared but never emitted. The QF wired-sensor job has no installed notice mechanism. | DERIVED | urg-core.ts:66; grep of server/ and scripts/; Frontier:130 |
| 3.27 | The Principal's "depreciated state with explicit pointers to finish" is not equated with installed HOLD. Candidate exit records carry the attained basis, unresolved consequential distinctions, standing, sources, next discriminating contact and exact return destination. | INHERITED | profile:224-226; Frontier:112-118 |
| 3.28 | Step status on the installed CIR assessment vocabulary (specified, implemented, mechanically_qualified, integrated, deployed, exposed, situated_use_qualified, operationally_sustained):<br>- O1: specified only.<br>- O1A: implemented, mechanically qualified, integrated into ordinary ingress.<br>- O2: mechanical checks implemented (same seat, Level first, witness before CONSTITUTIVE admission); semantic seating supplied by the adapter.<br>- O3: implemented and mechanically qualified.<br>- O4: partial (five kinds with explicit coordinate rules, all others held to no seat change; no Compose, Relate or TraverseQ).<br>- O5: two-sided shape check implemented.<br>- O6: specified only (one bounded pass).<br>- O7: implemented.<br>Deployed and exposed status was not verified here. | DERIVED | orchestration.ts:226-437; docs/civs-domain-semantic-admission.md; profile:103-226 |

**3C. Persisted partial carriers of enrichment state**

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 3.29 | `preserveInquiryProjection` throws without all six seat keys. It writes `projection.content` through the existing `create_artifact` to an immutable text artifact, verifies exact bytes, and returns a ProjectionRecord (EXAMINED, DORMANT, UNRESOLVED; custody_ref = artifact id) that is not persisted as structure. | INHERITED | orchestration.ts:480-500; docs/inquiry-orchestration.md:46 |
| 3.30 | Preserved content is sorted-key JSON. It carries contract, disclosure_contract, basis_ref, indexical_binding, context, members with decisions, quadrant_coverage, records, changes, reconciliation, discovery_coverage, questions_forward and signals. It lacks `disposition` and `reentry`. `runBrainInquiry` builds a separate artifact_content that adds both. Reduced forms keep only identities and editions. | INHERITED | orchestration.ts:397-403, 415-428; orchestration-brain.ts:169-172 |
| 3.31 | A preserved enrichment account can be recovered given its artifact id. It cannot be addressed from the referent: no row links R to the artifact, and the ProjectionRecord with `mapped_referent_ids` is not persisted. "Historical situation is provenance, not a retrieval namespace." | DERIVED | 3.29, 3.30; docs/inquiry-orchestration.md:94 |
| 3.32 | ECO-213 `work_accounts` persist focal_id, whole_id, predecessor_id, remit_revision_id, point_of_view, noticed_contrast, boundary, orientation, frame, question, intended_use, process_coordinate and return_route, plus `work_parts`, a work epoch and `reseating` lineage. The BRAIN adapter maps a work account into `original_basis` context. | INHERITED | eco213_circulation_native.sql:53-69; eco213_work_context.sql:6-9, 290-301; orchestration-brain.ts:131-138 |
| 3.33 | ECO-213 work accounts form a persisted seat-like basis (R, B, G, and F through point of view and frame) with question and return route, keyed to `focal_id`. They have no access field, no v2 disclosures, no typed QF records and no READY/HOLD. They are dormant (remit expired 2026-10-02). | DERIVED | 3.32; docs/eco-213-implementation.md:3, 15, 37, 41 |
| 3.34 | ECO-213 `differentiate` and `reinspect` turn one source occurrence into a decomposition (resolution, context, omissions, losses, questions) and semantic units. Each unit has participants, byte-exact anchors, modality, polarity and attribution, and is paired with an assertion Claim and an Evidence Link. The step requires a work account. It is model-driven and not organized by QF or v2. | INHERITED | eco213 native:146-186; execution:178-211 |
| 3.35 | ECO-138/140 heads are the only installed row-queryable HOLD-with-reentry keyed to an intake record. They are operational only. | DERIVED | 0.11 |
| 3.36 | Universal Referent Walk, current earned minimum: preserve exact capture and provenance; differentiate proposed subjects; check source correspondence; assess omissions, modality and question relevance before treating the result as prepared for database reconciliation; keep focal identity, telos, epistemic basis and annotation identity distinct. "A question plus a relevance sentence is not a complete wired QF sensor." | INHERITED (historical earned result) | RESULT.md:120-127, 140-147 |
| 3.37 | Nothing installed performs the intake-to-token transition with a referent-addressable persisted result carrying v2 disclosure state, a typed QF set and a READY/HOLD exit. | DERIVED | 2.2, 3.29-3.35; RESULT.md:3-4, 133-138; Frontier:315 |

**Earned by.**

- Installed TypeScript: urg-core revision 2.0.0 and inquiry orchestration 0.2.0, with tests per the 2026-10-08 receipt.
- The active-spec profile and accepted ECO-191.
- Installed dormant ECO-213 migrations and installed ECO-138/140.
- Principal correction 2.
- QF-first is earned as intended order (INHERITED) and as precedence over O1A and O2 (DERIVED). Its content is unresolved.

**Surface consequence.**

- The ENRICHMENT plate is a projection of one InquiryResult edition, keyed by `inquiry_basis_ref` and projection edition. It is never keyed by referent alone.
- It leads with open QFs. Basis QFs come first, as a declared plate ordering (CANDIDATE rule) that keeps each QF's installed array index visible. Each QF shows discriminator, decision consequence, return route and reentry condition. Template-text fields are flagged.
- Then come:
  - the six seat keys, with blanks visible;
  - the four v2 disclosures recomputed by the plate from records, with EXAMINED shown beside its disposition;
  - candidate dispositions with assessor and basis, or "coerced to QUESTION_FORWARD";
  - reconciliation sides;
  - channel coverage;
  - READY or HOLD.
- HOLD renders as an ordinary usable result.
- The legend states NOT_PRESERVED, or the artifact id if preserved.
- No pass is marked "QF-first compliant" when discovery ran before a basis QF.
- Lawful controls: run or re-run an inquiry; supply attributable adapter records; submit a typed ChangeRecord; preserve an edition.

### Rung 4. Composition participation as installed

**What it is.** The installed places where a referent becomes a member or constituent of a whole, and the gate each one applies.

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 4.1 | ADMIT requires all of the following: the same candidate digest and inquiry basis; an attributable assessment and reason; current use CURRENT with standing_ref and evidence; a valid native_relation whose `situated_basis_ref` equals the basis, RELIED_FOR_DECLARED_USE with evidence, naming candidate and focal referent; and for CONSTITUTIVE membership, a same-seat LEVEL_WITNESSED claim listing the candidate, with organization and dependence refs distinct from the assessment. Otherwise a G2 signal is raised and the decision is downgraded to QUESTION_FORWARD. Exit re-fetch removes stale members. | INHERITED | orchestration.ts:326-357, 371-382 |
| 4.2 | Within an inquiry, an unenriched intake registration cannot become a member. It needs exact recovery (digest, sources, custody) and an attributable typed relation with current-use standing. | DERIVED | orchestration.ts:314-317, 333-345 |
| 4.3 | The installed member gate is per-member qualification under the focal basis. It does not require that the member has itself completed O1 to O7. Completed enrichment is required of the focal pass, and only for READY. | DERIVED | orchestration.ts:326-351, 434 |
| 4.4 | `admitted` is retained under HOLD. Reliance for the declared use exists only at READY. | DERIVED | orchestration.ts:382, 431-434 |
| 4.5 | An ECO-213 composition account records focal_id, organizing_criterion, a carrier text artifact, old_dependency_review, destination_disclosure, unresolved and reinspection_questions. Members record constituent_id, reason and basis_digest at composition time. Each member must have a semantic representation in the same work, or be an output of that work. `account_lineage` types succession as alternative, repair, reinspection or reseating. | INHERITED | eco213 native:187-209; execution:225-242 |
| 4.6 | Interactive `compose_account` requires remit, mechanism kind `compose`, work scope, and non-empty members and two-sided review fields. It bypasses `assess`. The scheduled continuation runs only after `assess` SATISFIED over six differentiation keys. | INHERITED | eco213_work_context.sql:230-371 (357); execution:213-227, 261 |
| 4.7 | Reliance on an account: `reconcile` writes `use_assessments` (SATISFIED, UNSATISFIED or UNKNOWN), `requirement_dispositions` (old_dependency and destination_discovery, both mandatory), `dependency_bases` and `use_heads` (predecessor compare-and-set), bound to the work epoch. `recover()` computes `basis_current`. | INHERITED | eco213_work_context.sql:46-89; native:210-239; execution:303-307 |
| 4.8 | No ECO-213 composition or reliance path requires PGO-URG enrichment (QF-first, v2 disclosures, Level witness). | DERIVED | 4.5-4.7 |
| 4.9 | Relation Claims impose no enrichment gate. An intake-only referent can be the subject or object of `part_of` or `member_of`. | DERIVED | build_4:51-62; ADR-003:38-40 |
| 4.10 | Composite referents are PER_INSTANCE_OPERATIONAL_COMPOSITION and NOT_ONE_PERSISTENT_DATABASE_ENTITY. Physicalization is open reconciliation with no schema, runtime or MCP authorization. | INHERITED | BUILD_CHECKOUT.md:56-57, 83 |
| 4.11 | Profile O4 "Compose ... before any Reseat" has no change kind. The installed partial carriers are: `DirectionClaim.composite_candidate_ref` (required when Transcendence is SUPPORTED); Quadrant DECOMPOSE (the inverse direction); ECO-213 composition accounts. | INHERITED | profile:181; urg-core.ts:48-70, 156, 476, 498-500; eco213 native:187-209 |
| 4.12 | Generating a new organized whole invokes the constitutive Level witness, and refocusing alone does not create Level. Lawfully individuated composites may become R under the same grammar (K9). There is no global transitivity (K11). The map does not become R (K12). | INHERITED | Quadrant v2:73; Level-Quadrant-Formal-Contract-v1.0.md §7 |
| 4.13 | Compound operations such as "enrich then compose then reseat" must keep their separate effects and dependencies. | INHERITED | ECO-191 Formal Sense:213 |
| 4.14 | The sources tie completed enrichment to composite structure: the bootstrap ends in a "sufficiently situated dynamically composite referent structure" (Frontier:114), and tokenization serves "discovery, activation, and composition" (COMMISSION.md:33-34). Directive 3 agrees with both. | DERIVED | Frontier:114; COMMISSION.md:33-34; Directive 3 |
| 4.15 | No installed row answers "is referent X PGO-URG enriched?". Per-(work, use) reliance is persisted in ECO-213 but is not QF or v2 gated. | DERIVED | 3.37, 4.8 |

**Earned by.** Installed coordinator code, installed dormant ECO-213 migrations, the BUILD_CHECKOUT disposition, and the accepted Level contract and Quadrant v2.

**Surface consequence.**

- The COMPOSITION plate has three layers.
- **Current-use membership** per inquiry edition: admitted members with relation record, membership type, Level witness (constitutive only), standing and evidence, and the edition's READY or HOLD. Members admitted under HOLD are drawn as "admitted, not relied".
- **ECO-213 accounts** in a layer labeled "dormant; remit, work scope and two-sided review fields; reliance via use_heads; not PGO-URG gated".
- **Relation Claims** as asserted edges with standing.
- Intake-only referents never appear in the first layer.
- A "Compose" control is disabled with the reason "no installed carrier (no Compose change kind)". As an alternative, it routes to ECO-213 `compose_account` under remit with the statement that this route bypasses PGO-URG enrichment.
- "Reseat to composite" routes only through a typed Reseat ChangeRecord.
- Zoom depth, proximity and grouping never imply Level or membership.

### Rung 5. Projection discipline (the plates)

**What it is.** The installed and accepted rules every plate must meet. A plate is a declared, editioned, omission-bearing projection over rungs 0 to 4, rebuilt from records. The discipline is earned. The atlas, as a navigable family of plates over tokens, is not.

| # | Claim | Class | Source |
| --- | --- | --- | --- |
| 5.1 | referent ≠ map; map ≠ mapper; unknown ≠ nonexistent; omission ≠ irrelevance; current ≠ newest. No silent promotion across dimensions. Shared seam ≠ shared semantics. | INHERITED | docs/invariants.md:9-30, 157-168 |
| 5.2 | A map, view or model preserves mapped referent, mapper, map, mapping relation, purpose/use, frame/access, scope/resolution, evidence basis and omissions/currentness/standing. Projection ≠ referent, currentness, authority or completeness. "The same underlying referents may lawfully support multiple views." | INHERITED (accepted) | URG-Core-Register-B-Candidate-v1.0.md §9:204-228 |
| 5.3 | ECO-191 `Project`: a read-only view with a provenance/loss declaration. "Pretty view cannot self-certify." Projections are generally lossy and noninvertible. | INHERITED (accepted) | ECO-191 Formal Sense:208 |
| 5.4 | ECO-162 composition rules: reference, do not absorb; version independently; permit partial resolution; no giant declaration requirement; compose lazily from stable references. A single universal serialized engagement packet is rejected as source of truth. | INHERITED (accepted) | ECO-162 Shape:277-305, 492-494 |
| 5.5 | Fidelity invariants F1 to F8. | INHERITED (accepted) | ECO-162 Shape:259-275 |
| 5.6 | G1 to G3 are diagnostic aliases. SemanticSignal carries code, target_ref, basis_refs, demonstrated_mismatch, decision_consequence, repair and evaluator_ref. A signal forces HOLD. | INHERITED | profile:228-258; orchestration.ts:51-59, 241-243, 389 |
| 5.7 | CIVS §2A rules (Section 3.4). | INHERITED (accepted) | capability-inspection-verification-spine-plan.md:144-161 |
| 5.8 | The first CIR's graphical obligations: shared_object_identity, standing_currentness_visibility, projection_omissions_visibility and text_api_graceful_fallback are SUPPORTED. typed_controls, change_history_visibility and human_agent_reconciliation are NOT_ESTABLISHED. A "ready" boolean is prohibited. Scoped to that specimen CIR. | INHERITED | research/civs/domain-semantic-admission.cir.json:1767-1855; server/civs.ts:68-77, 631-643 |
| 5.9 | The machine CIR is the shared record, and the human document is a projection of it. PROJECTION_DRIFT is a fail-visible HOLD. | INHERITED | docs/civs-reentry.md:22, 169, 199 |
| 5.10 | Exact recall, situated recomposition, semantic discovery and cross-context resurfacing are distinct jobs. FR-3 rejects these equations: similarity = relevance, path existence = constitutive membership, rich reconstruction = exhaustive context, rediscovery = exact recall. | INHERITED | profile:37-48, 319-332 |
| 5.11 | Current projections disclose their contract edition. Legacy records never supply current coverage. There is no automatic old-UL to new-UL mapping. | INHERITED | Quadrant v2:77-79 |
| 5.12 | `projectionDelta` separates R/B, G/F, State, evidence/standing and execution-envelope changes, and creates no Change, State or standing. | INHERITED | orchestration.ts:451-478 |
| 5.13 | An embedding metric is installed (`vector(384)` representations) and has no semantic standing. "Embedding distance is not presumed semantic distance." Conformal language fails closed where no justified geometry exists. Conformal geometry requires an operationally meaningful metric. | INHERITED | build_11:41-66; BUILD_CHECKOUT.md:383-389; research/formal-semantics/probes/FS-0001/analysis.md:67 |
| 5.14 | The default plate is schematic. Position, distance, area and size encode nothing unless declared and sourced. Embedding proximity never sets position or grouping. | DERIVED | 5.13 |
| 5.15 | Display requirements:<br>1. Every element resolves to a registry id or record ref.<br>2. Every plate declares mapper, mapping relation, G, frame, access, scope/resolution, evidence basis, omissions and contract editions.<br>3. Every orientation-relative value carries assessor, basis_ref and standing; otherwise it renders as a G2 signal.<br>4. Coverage, activation and disposition are recomputed from records and rendered separately.<br>5. Folds and truncations record an omission with identity/edition recovery and cannot raise reliance to READY.<br>6. Each control is an attributable typed request or is disabled with a reason.<br>7. A plate holds no state that cannot be rebuilt from records and InquiryResult editions. Regeneration is drift-checked, following the PROJECTION_DRIFT precedent.<br>8. Text/API equivalents exist.<br>9. The renderer is replaceable. | DERIVED | 2.9, 3.16, 3.20, 5.2, 5.6, 5.7, 5.9, 5.11 |
| 5.16 | Domain-semantic admission (INHERIT, FEDERATE, EXTEND, QUALIFY, with anti-reinvention gates) governs importing another domain's semantics. Only systems-engineering is registered. | INHERITED | docs/domain-semantic-admission.md:7, 13-19; server/domain-admission.ts:148, 253 |
| 5.17 | Cartographic correspondences are CANDIDATE until federated under 5.16. Only their ECOS-side counterparts are INHERITED. | DERIVED | 5.16 |

**Earned by.** Installed urg-core, orchestration and civs code; the accepted URG core §9, ECO-162 Shape, ECO-191 and CIVS §2A; the governing invariants.

**Surface consequence.**

- Every plate carries a legend generated from ProjectionRecord-shaped metadata plus omissions and contract editions (`ecos:urg-core:register-b:v2`, `ecos:quadrant-disclosure:v2`, `ecos:inquiry-orchestration:0.2.0` where an inquiry is projected).
- Every plate is schematic by default.
- Every plate is rebuilt from records and checked for drift.
- Nominal distinctions such as the four disclosures are never encoded with ordered channels such as size or value.

## 7. Stop line

**The first unearned altitude is rung 6, the integral token carrier.** It would be a referent-addressable, persisted, queryable carrier of PGO-URG enrichment state, holding:

- the QF set (basis QF first);
- the seat edition, including access;
- Level witnesses;
- the four v2 disclosure records;
- reconciliation;
- the READY or HOLD exit.

It would also bring a composition gate that reads this carrier before a referent participates.

Two further altitudes sit above it and are also unearned:

- **Rung 7:** a composition substrate whose eligibility is "properly enriched", made durable.
- **Rung 8:** the atlas as a navigable family of plates over tokens, with an index.

**Why the line sits here.**

1. No installed carrier holds v2 disclosure state, typed QF records, access_ref or inquiry READY/HOLD keyed to the referent (3.37).
2. Preserved projections are recoverable JSON, but they cannot be addressed from R (3.31).
3. ECO-213 work accounts persist a seat-like basis, but without access, disclosures, QFs or an exit (3.33).
4. ECO-138 heads are operational only.
5. QF-first is contract order, not code order (3.14).
6. There is no Compose change kind (4.11).
7. "Integral token" is unratified vocabulary (Frontier:315; RESULT.md:3-4).

**What would earn rung 6, all of these:**

1. The Principal answers U1 (integral scope), U2 (whether HOLD or depreciated exits count) and U4 (token keyed to referent or to situated basis).
2. Ordinary use meets the ADR-009:58-62 reopening condition against all installed carriers, not only against text artifact plus ProjectionRecord. A real consumer must be unable to recover QF set, v2 coverage and READY/HOLD from the combination of: preserved projection JSON plus ProjectionRecord; ECO-213 work seat, epoch and use_heads; ECO-138 heads; Claims and Evidence. The concrete gaps to test are:
   - addressability from R across bases;
   - missing disposition and reentry in `preserveInquiryProjection` content;
   - dropped records in reduced projections;
   - no access field in work accounts.
3. A QF-first enrichment performer is specified under ECO-177 (intake, qualification and routing), with ECO-51 for seating and Level mechanization, and is qualified on fixtures.
4. A Compose carrier is routed, or native_relation plus Reseat is shown sufficient.
5. U3, the content of the first QF, is decided.

The first simulation (Section 10) is built to produce the evidence for item 2 without inventing a carrier.

## 8. Folded candidates

| Candidate | Why folded | Unfold condition |
| --- | --- | --- |
| Token carrier built only from installed shapes: registered UUID + immutable native record + digest-pinned basis members (ECO-213 `basis_digest` pattern) + typed QF/unknown field + predecessor-chained revision with a scoped head (ECO-138 pattern) | No source assigns these parts to an integral token. ADR-009 forbids widening before insufficiency is shown. U4 is open. | The Principal confirms a persisted, queryable token, and the Section 10 addressability probe plus ordinary use show insufficiency of all installed carriers (Section 7, item 2). |
| Integral token as a reference-only, lazily composed edition over installed parts (identity + seat edition + Level witnesses + v2 disclosures + native relations + per-record fidelity + QF set + reentry + source digests), pinned by an edition digest that owns none of the constituents' standing or currentness | No carrier exists. U1 is open. Frontier:238 ("must not become the owner of identity, PGO, state, evidence and authority as one inseparable truth") and ECO-162 "reference, do not absorb" constrain it. | U1 and U4 are decided, and a consumer needs one addressable edition across sessions. |
| Merkle-style digest over constituent editions | ADR-005:82-86 selects no Artifact DAG and no hash algorithm. | Verification is needed across sessions or custody boundaries beyond the per-projection edition digest. |
| QF-first enforced in code: an O1 bootstrap step that issues and dispositions a basis QF before O1A discovery | ECO-191 Bootstrap B is closed at the Move border. The coordinator enforces only nonblank strings. ADR-007 forbids intake-created review debt, so the trigger must be a declared request. | A Move commission for Bootstrap B under ECO-177, with fixtures showing that a discovery-first pass derives identity or PGO from a noun match (inquiry-orchestration.md:26). |
| Compose change kind or composite-candidate carrier | Profile O4 names it, URG_CHANGE_KINDS lacks it, and ECO-213 compose is work-scoped and dormant. | A real composition cannot be expressed by native_relation plus Reseat, or by an ECO-213 account, without loss. |
| Plate ordering rule "basis QF first" | The installed array order differs (3.14). The rule is a presentation choice. | The Principal accepts it as the enrichment plate's declared projection rule, which keeps installed indices visible. |
| Conformal Zoom laws 1, 3, 4, 5 and §6 (addressability first, link graph survives zoom-out, weakest authority under compression, interface not storage) | ECB artifact `the-conformal-zoom-transform-ecos-specification`: stamp CURRENT, trust:unset, active v1, updated 2026-06-02; its body says "Status: proposal / unverified". Law 2 uses superseded Left/Right AQAL terms. "Conformal" misuses the cartographic meaning. Law 5 is already carried by no silent promotion. | Each law is requalified against the Level contract, Quadrant v2 and URG §9, and renamed unless a justified geometry exists. |
| Per-element distortion overlay (Tissot analogue) | Only projection-level omissions are installed. | The first plate applying a budget or grouping needs per-element omission display, sourced only from its own omissions and QFs. |
| Support declaration for any value on a composite (constant per constituent, aggregate of the whole, identity of the whole) | External spatial-data prior art (sdsr 05-Attributes.qmd:77-151). No composite display exists. | The first composite plate shows any value. Check against profile:155 and Fixed-R law 7 (:272). |
| Atlas index (gazetteer) from identifiers to plates | No display partitioning. ECO-213 `fetch_referent` and `native_records` do not resolve the native type of disposition revisions, operations, evidence-link ids or governance records. | Two plates must share navigation, and a cold worker cannot move between them by identity alone. |
| Declared deterministic projection contract (Frontier §7) | Frontier formulations are candidates (Frontier:4, 221-238). | A consumer needs a versioned projection rule beyond the edition digest, or §7 is accepted. |
| Folding contract built from DORMANT activation plus QF triggers | "No separately closed folding primitive was recovered" (Constructive-Fidelity-Tracking.md:263). No trigger emitter exists. | A receiving worker cannot recover a folded subject, reason and trigger (QF-F1-4), or a TriggerQuestionForward emitter is installed. |
| Crucible funnel correspondence (Landing ↔ intake, Qualification packet ↔ O7 exit record, Selection ↔ plate, Promotion ↔ standing transition) | ECO-177 (Crucible identity: intake, qualification, routing) is unexecuted. Former Crucible is not automatically equated with Metabolize (ECO-215:238). | ECO-177 returns its allocation, and a field-by-field comparison with the O7 exit fields survives a nonfit check. |
| ECO-170 Derived Engagement Projection as the read-model precedent | Isolated probe PASS/Review. PR #83 unmerged. Not installed (BUILD_CHECKOUT.md:95). | ECO-170 is merged, or its read model is reused by the first plate. |
| Valid time on disclosures and claims | E13 is not promoted. ADR-005 non-selection. | E13's falsifier ("which policy governed when event E occurred?") becomes decision-changing for a plate. |
| Model-generalization tier (coarser substrate accounts derived from finer ones, distinct from display generalization) | Nothing installed corresponds beyond per-work ECO-213 accounts. | A reuse requires a coarser account that is itself a substrate record. |
| SSMM Action Button "first-class" criteria ("Seated claims"; "Coverage with disposition") | Draft stamp conflicts with block metadata. Master Key vocabulary. | The stamp conflict is resolved and the criteria are translated to PGO. |

## 9. Atlas patterns: adopted, folded and rejected

**Grounding.** The atlas premise ("different projections for different reasons") is inherited in ECOS terms, without cartography:

- referent ≠ map and map ≠ mapper (invariants.md:11-12);
- "The same underlying referents may lawfully support multiple views" (URG §9:228);
- circles and ladders are projections of one holonic object (ECB c01ea004-fd56-43c0-b1c1-3acb259f3601, strong evidence, not ratified).

**Classing rule.** Each cartographic correspondence below is CANDIDATE pending FEDERATE under domain-semantic admission (5.16). The ECOS counterpart named in each row is INHERITED where cited.

**Source verification.** Cartographic sources were read through authoritative repository mirrors: PROJ, OGC GeoAPI, OGC 17-083r4, sdsr, geocompr, QGIS, GRASS, GDAL, Hootenanny and Who's On First. Items marked "search extract" in the cartography reader were not opened.

### 9.1 Adopted (as discipline; ECOS counterpart installed)

| Pattern | Native semantics | ECOS counterpart | Transfer boundary |
| --- | --- | --- | --- |
| Landscape model versus cartographic depiction (DLM/DCM) | The object model is the store of record. Depictions are scale-specific derivations. Edits flow model to depiction. | Rungs 0 to 4 records versus WorkingProjection NOT_PRESERVED; `projectionDelta` creates no standing (orchestration.ts:435, 451-478); CIVS §2A:156. | The exact separation the prototype broke. ECOS records are referents and claims, not geometry. |
| Datum or CRS by authority code | No coordinate is interpretable without its declared datum. A missing CRS yields NA ("unwilling to guess"). | `basis_ref`, the six-key seat, contract editions on every projection (orchestration.ts:172-174, 193-194; Quadrant v2:79). | F and the contract are not fitted metric models. Two plates under different bases are not overlayable without a typed change and reconciliation. |
| Map legend and marginalia | Mapper, purpose, scale, survey basis and declared distortion. | ProjectionRecord fields (urg-core.ts:249-265). | Omissions are discrete and categorical, not metric. Structural validity is not truth. |
| Projection chosen by purpose; no all-purpose projection | Purpose determines which properties are preserved. | G selects relevance and resolution but does not manufacture identity, membership, Level or evidence (profile:87-101). Reorientation needs Reorient plus two-sided reconcile (orchestration.ts:235; O5). | Property names (conformal, equal-area) do not transfer, because no semantic metric exists. |
| Cartographic generalization; products valid only at source scale | Deliberate, measured loss for legibility. | Budget ladder: content cut first, metadata never silently cut, reduced projection forces HOLD (orchestration.ts:404-429). | Content operators (eliminate, reorder) transfer. Aggregate, merge and collapse must never create an ECOS composite. |
| Lineage metadata (ISO 19115 LI_Source, LI_ProcessStep, processor, "lineage not known") | Every derived product records sources, process steps and processor, or states that lineage is unknown. | Evidence links with digests, `source_refs`, `candidate_editions`, `assessment_ref` and `evaluator_ref`, `ordinary_operations` (build_3:35-67; orchestration.ts:51-74, 418-435; build_11:14-39). | Lineage is not warrant or standing. The prototype's relevance table lacked all of these. |
| Related (link and keep) conflation; match, miss, review | Sources are kept and linked. Review is a first-class outcome. | ADMIT, REJECT, DEFER, QUESTION_FORWARD with exact recovery. "A hit is a candidate" (profile:131-139). No entity resolution at registration (ADR-003:42-44). | Hootenanny scores similarity. ECOS refuses similarity as evidence (FR-3). Fused conflation is rejected. |
| Distinct lifecycle relations: superseded, deprecated, ceased, deleted | Valid but bettered; erroneous; ended in the world; record removed. | ADR-007:20 requires naming the exact relation. Legacy records keep their meaning (Quadrant v2:77). "Depreciated" is not deprecated (Frontier:114). | Record lifecycle only. Claim standing stays a separate dimension. |
| Topology without metric (schematic maps) | Connectivity kept, distance and area abandoned. | Typed relations; no semantic metric (5.13-5.14). | Default plate geometry. |
| Late binding over a universal pivot | Each pair uses its own documented operation. A pivot adds an unspecified realization. | Each plate derives directly from records. "No new generic edge or universal transformation algebra" (Quadrant v2:56). | The motive is semantic loss and smuggled standing, not numeric error. |
| Data quality: commission versus omission | Excess data versus absent data, judged against a specification. | Shown without basis (a G2 signal) versus obligation not shown (UNEXAMINED or QF). | Checklist only. The metric measures do not transfer. |

### 9.2 Folded (useful, not earned)

| Pattern | Native semantics | Proposed ECOS correspondence | Why folded / unfold |
| --- | --- | --- | --- |
| Georeferencing of an unreferenced dataset | GDAL treats "neither geotransform nor GCPs" as a valid addressable state. Control points relate data to a frame. | Intake registration, then a basis QF ("which frame, for what use?"), then seating. | Analogy for order only. G (purpose) has no georeferencing analogue. Unfold when the first enrichment step is specified. |
| Gazetteer and atlas index (ISO 19112) | An identifier-based reference system; locations need identifier, extent, administrator and type. | An index from referent ids to plates. | A referents row holds only an identifier, which confirms its pre-token status. Concordances assert co-reference, which in ECOS is a sourced Claim. Unfold as in Section 8. |
| Insets and locator maps | Sub-maps with their own frame. Items outside a composite's domain get misplaced (albersUsa maps them to (0,0)). | Declared sub-projections. Items outside a plate's basis render as "outside domain" or as a QF. | No plate partitioning yet. |
| Sheet series and edge matching | A common CRS and scale set make sheets joinable. Features are reconciled at borders. | Plates sharing one basis edition. Cross-plate reconciliation by identity and edition, never by position. | U11 (shared basis edition across plates) is open. |
| Small multiples over a constant base | The same frame is repeated per theme. | Four v2 disclosures as panels over one fixed R/B (Quadrant v2:20). | Panels must not be sized or ordered to imply rank. Unfold at the first disclosure plate. |
| Overview plus detail with a locator | Context and detail separated spatially. | Safest first interaction pattern, with both views tied to one basis. | No interaction contract yet. |
| Survey control: datum versus realization | A definition versus its measured realization, named by epoch. | Contract versus code revision plus fixture set. | Fixtures are authored discriminator cases, not ground truth. |
| Support and change of support | An attribute is constant, aggregate or identity for its geometry. | Support declaration on composite values. | See Section 8. |
| Model-generalization tier | A coarser DLM derived from a finer one. | Coarser substrate accounts. | See Section 8. |

### 9.3 Rejected

| Pattern or usage | Reason |
| --- | --- |
| "Conformal" zoom as structure preservation under change of scale | In cartography, conformality is a local angle-preserving property of a projection, and scale varies across the map. Change of scale is generalization, which is not conformal. BUILD_CHECKOUT.md:389 requires conformal language to fail closed without justified geometry. |
| Zoom depth or level of detail as holonic Level | "Refocusing alone does not create Level" (Quadrant v2:73). Level is local with no global altitude (Level contract K10). |
| Aggregate, merge or collapse that creates a composite | Compose has no carrier, and constitution needs a Level witness (profile:155, 181; 4.11-4.12). |
| Any field model (continuous total function) for orientation relevance | The prototype's "field" had no declared domain, function or per-value basis. Geographic fields presuppose continuous space-time. |
| Fused conflation and similarity-based matching | Similarity is not evidence (FR-3). Fusion merges identities without a continuity basis. |
| Mutable head meaning "latest" (Git branch head, DOI record values) | current ≠ newest (invariants.md:27). Registration carries no description (ADR-003:35-36). |
| Content-hash identity for referents (Git, IPFS) | Identity is the registered UUID. A digest pins an edition and must not merge encounters. |
| Metric encodings (distance, area, size) of semantic relations | No semantic metric is installed. Embedding distance is not semantic distance (5.13). |
| Size or value encoding of the four disclosures | They are nominal, unranked and not exclusive bins (Quadrant v2:20). |

## 10. First simulation specification

**Purpose.** Simulate the upstream defect and its repair. The defect: a surface that owns state the substrate does not hold. The repair: plates that are pure functions of an append-only token log of installed record shapes, with controls that append only through installed operations, or are disabled. The simulation also has to expose the stop-line gap rather than hide it.

**Scope.**

- An interactive HTML artifact holding an in-memory token log.
- No database, ECB, Linear or artifact writes. No new tables or record kinds.
- In-memory InquiryResult tokens follow the rules of `server/orchestration.ts` and are labeled `persisted: false`.
- The intended fixture case is the Principal's invented appearance-switch example. Every content claim in it is a fixture claim.

**Token set.**

- Intake: three captured thoughts (R1, R2, R3) with registry rows, capture operations, admissions and disposition heads, plus one registered-only referent (R0).
- Claim spine: one `part_of` claim with an intake-only endpoint, and one `depends_on` claim with evidence and a standing transition.
- Enrichment: five InquiryResults, keyed to the same R1 under different seats and orientations:
  - A: partial seat, HOLD.
  - B: full seat, partial disclosure, HOLD with R2 admitted.
  - B2: constitutive membership with no witness, so G2 and a downgrade.
  - C: READY.
  - D: reoriented, HOLD.

  Plus budget variants of C, one preserved artifact, and a non-persisted ProjectionRecord.
- A dormant ECO-213 layer: work account, semantic representation, composition account and member, use assessment and head.
- A domain-admission result that turns ingress for C into HOLD.
- Negative control: the prototype literal.

**Operations.** Each maps to an installed operation or table write. Two gestures map to nothing and must append no substrate token.

**Projections.** P-INTAKE, P-CLAIMS, P-ENRICH, P-COMPOSE, P-INDEX, P-DELTA and P-LEGEND. Each declares what it preserves, what it omits or distorts, its generalization rule and its legend.

**Checks.** Pass/fail predicates over the token log: provenance; intake scoping; coverage recomputation; READY iff no QF; composition equals admitted; the Level tooth; claims are not containment; standing only through transitions; currentness from heads; reorientation editions; budget; preserved content; the addressability probe as stop-line evidence; gate divergence across layers; domain-admission combination; controls; determinism; negative control; vocabulary; legends; zero writes.

**Expected results the audits corrected.**

- READY needs an explicit focal decision.
- `qf_ref` is not dereferenced.
- Budget-throw behavior must be reproduced.
- Reorientation runs through `disclosure.changes`.
- Preserved content is recoverable JSON but cannot be addressed from R.

The full structured specification is carried in the companion `simulation` output.

## 11. Unresolved discriminators

- **U1. Integral scope.** Does "integral" name completion of O1 to O7 (six-key seat, Level witness where constitution is claimed, four v2 disclosures, two-sided reconciliation, READY)? Or disclosure across all seven URG distinctions plus F coordinates? Sources: COMMISSION.md:25-27; Quadrant v2:46; profile:103-226.
- **U2. HOLD and depreciated exits.** Is a HOLD exit, or a "depreciated state with explicit pointers to finish", an integral token with reduced reliance, or is only READY integral? The profile declines to equate depreciated with HOLD (profile:226). The ratified fold-token law (ECB d91787d4, 2026-05-31) treats a re-expandable handle with a trigger as a token.
- **U3. Content of the first QF.** Is it about G/PGO and the consequential border (Frontier:94, 128; candidate formulation)? Or about point of view, initial contrast and focal object, with general PGO "when consequential" (BUILD_CHECKOUT.md:55)? ECO-191 F8 also allows provisional designation of the encounter itself (Formal Sense:295, 301).
- **U4. Token key.** Is the token keyed to the referent across inquiries, or to one situated basis? The installed basis hashes query, intended use, context and actor (orchestration.ts:172-174), and "historical situation is provenance, not a retrieval namespace" (inquiry-orchestration.md:94).
- **U5. Where a durable token is anchored.** Given 0.14 (no QF from admission alone), does the first QF attach to the intake id once a request names it, and what fields beyond intake does that need? Or does it attach only to an inquiry basis, which is the installed form?
- **U6. Role of ECO-213 `differentiate`.** Is it the grain-producing pre-step that QF-first enrichment then situates (supported by RESULT.md §7:140-147), a parallel route, or the token step itself (eco213 execution:178-211)?
- **U7. Eligibility gate subject.** Does "properly enriched" apply to each member (each member's own READY), which is not installed, or to the composing account (per-member qualification under the focal basis plus focal READY), which is installed (orchestration.ts:326-351, 434)?
- **U8. Reliance under HOLD.** May members admitted under a HOLD edition be relied on anywhere, within ECO-191 ExteriorizeQF's interim reliance limit? Or are they quarantined until READY?
- **U9. ECO-213 gate.** Should ECO-213 composition (interactive `compose_account`; scheduled assess continuation; `use_heads` reliance) be brought under PGO-URG enrichment, or kept as a distinct non-PGO composition route? This decides whether Directive 3 binds ECO-213 compositions.
- **U10. Compose carrier.** Which carrier records a new organized composite before Reseat: a new Compose change kind, native_relation plus Reseat, `DirectionClaim.composite_candidate_ref`, or ECO-213 composition accounts (profile:181; urg-core.ts:48-70, 156)?
- **U11. Shared basis edition.** Must all plates in the atlas share one basis edition and contract edition, or may plates carry different editions with declared typed transformations between them?
- **U12. Grain and seat.** Should the coordinator treat a `grain_ref` change as Reseat-class, as ECO-162 §6:369 assigns, or is the current Enrich treatment intended? This decides whether a plate's scale change is a seat event. Refocus is not open at coordinator level: it is a same-seat change (orchestration.ts:232-239). The only semantic question left is whether Refocus should ever carry a focal shift.
- **U13. Atomic grain order.** Identity-first (registered referent plus accreted enrichment, as with a TOID or SysML DataIdentity), or increment-first (an attributable disclosure record as the atom from which referent accounts are aggregated, Goodchild's geo-atom order)?
- **U14. Live state (verification gap).** Do any production rows populate rungs 3 and 4 after 2026-09-30 (ECO-213 decompositions or compositions, preserved ECO-202 projections)? Do installed constraint definitions match the repository files?

## 12. Source index

**Repository at `c4fad77`**

- Identity and intake:
  - `sql/migrations/20260904093341_build_2_universal_referents.sql`
  - `sql/migrations/20260903235721_build_0_atomic_thoughts.sql`
  - `sql/migrations/20260904000010_build_0_least_privilege.sql`
  - `sql/migrations/20260914063000_build_11_ordinary_operation_kernel.sql`
  - `sql/migrations/20260916023000_eco138_admission_disposition.sql` and its transition-fix migration
  - `sql/migrations/20260916030000_eco140_shaped_next_action.sql`
  - `docs/architecture-decisions/003-build-2-persistent-first-class-identity.md`
  - `docs/architecture-decisions/007-retire-canon-and-non-prejudicial-intake.md`
  - `docs/glossary.md`
  - `docs/invariants.md`
  - `server/oauth.ts:125`
- Claims and standing:
  - `sql/migrations/20260904163938_build_3_claims_evidence_links.sql`
  - `sql/migrations/20260904215929_build_4_typed_relation_claims.sql`
  - `sql/migrations/20260905022247_build_5a_standing_transition_history.sql`
  - `sql/migrations/20260915114500_build_12_greenfield_artifact_correction.sql`
  - `sql/migrations/20260906014257_build_5b_versioned_artifacts.sql`
  - `docs/architecture-decisions/005-cross-cutting-integrity-and-promotion-discipline.md:78-86`
  - `docs/build-sense/007-build-5b.md:237`
  - `docs/build-evidence.md:295-313`
- ECO-213 (installed, dormant):
  - `sql/migrations/20260930155729_eco213_circulation_native.sql`
  - `sql/migrations/20260930155734_eco213_circulation_execution.sql`
  - `sql/migrations/20260930191330_eco213_work_context.sql`
  - `docs/eco-213-implementation.md`
- URG and Quadrant:
  - `server/urg-core.ts`
  - `schemas/urg-core-v2.contract.json`
  - `research/urg-kernel/Quadrant-Disclosure-Contract-v2.0.md`
  - `research/urg-kernel/Level-Quadrant-Formal-Contract-v1.0.md`
  - `research/urg-kernel/URG-Core-Register-B-Candidate-v1.0.md`
  - `research/urg-kernel/README.md`
  - `research/urg-kernel/Quadrant-Disclosure-Replacement-Receipt-2026-10-08.md`
  - `docs/architecture-decisions/009-urg-core-portable-package.md`
- Orchestration:
  - `server/orchestration.ts`
  - `server/orchestration-brain.ts`
  - `server.ts:680-691`
  - `server/domain-admission.ts`
  - `docs/inquiry-orchestration.md`
  - `docs/domain-semantic-admission.md`
  - `tests/inquiry/orchestration.test.ts`
- Contracts and doctrine:
  - `research/formal-semantics/PGO-Directed-Situated-Referent-Orchestration-Profile-v0.1.md` (O3 body superseded by v2)
  - `research/formal-semantics/Situated-Referent-Discovery-Frontier.md` (formulations candidate)
  - `research/formal-semantics/ECO-191-Formal-Sense-Return-2026-09-24.md`
  - `research/core-architecture/ECO-191-Indexed-Change-Reconciliation-Shape-2026-09-24.md`
  - `research/core-architecture/ECO-162-Integral-Coherence-Architecture-Shape-Return-2026-09-19.md`
  - `research/formal-semantics/Constructive-Fidelity-Tracking.md` (candidate)
  - `research/formal-semantics/probes/FS-0001/analysis.md:67`
  - `research/ingestion-probe/COMMISSION.md`
  - `research/ingestion-probe/RESULT.md` (historical)
- Surface:
  - `docs/capability-inspection-verification-spine-plan.md` §2A
  - `server/civs.ts`
  - `research/civs/domain-semantic-admission.cir.json`
  - `docs/civs-reentry.md`
  - `docs/civs-domain-semantic-admission.md`
- Ownership and disposition:
  - `BUILD_CHECKOUT.md:50-57, 83, 95, 97, 297-304, 383-389`
  - `research/semantic-circulation/2026-09-30-Trusted-Participation-Requirements-and-Session-Integration.md:219`
  - `docs/working-preferences-constructive-di.md`

**ECB (legacy; evidence, not authority unless stamped)**

- d91787d4-12eb-4c79-9055-e2416cc689a3: fold-token, Principal-ratified 2026-05-31.
- c01ea004-fd56-43c0-b1c1-3acb259f3601: circles and ladders as projections.
- c2ed2132-853b-4a74-aca8-95587504f460: referent, reference frame and projection registers kept distinct.
- 390d338c-5f3b-4298-8c75-68757e02cb6f: QF among the Binding Infinity invariants.
- bd695ef7-ddc1-4df3-8acb-d8a02f5bae34: 2026-10-06 profile audit.
- c568d781-89c9-4d93-bbf2-73262964e3af: type/token Charter candidate.
- Artifact `the-conformal-zoom-transform-ecos-specification`: CURRENT, trust:unset; body says proposal/unverified.
- ECB lags the repository on Quadrant semantics: the register, thought bbc7d220 and proposal 9d6dfda8 still describe the generator as open. Do not use ECB for Quadrant semantics.

**External prior art (read through repository mirrors unless noted)**

- PROJ (OSGeo/PROJ@beef4145b1)
- OGC GeoAPI (opengeospatial/geoapi@27859fa0bc; paraphrases ISO 19111, 19112, 19115, 19157)
- OGC 17-083r4
- Pebesma and Bivand, Spatial Data Science (edzer/sdsr@3108521664)
- geocompr
- QGIS documentation
- GRASS v.generalize
- GDAL raster data model
- Hootenanny
- Who's On First properties
- W3C PROV-DM (w3c/prov)
- RDF 1.2 Concepts (Editor's Draft)
- Microsoft architecture patterns: event sourcing, CQRS, materialized view
- SysML v2 API pilot implementation
- Pro Git chapter 10
- multiformats CID
- Search extracts only (not opened): Datomic, Handle/DOI/ARK, Roth et al. 2011, McMaster and Shea 1992, Goodchild et al. 2007, ATKIS DLM/DCM, OS MasterMap TOID.
