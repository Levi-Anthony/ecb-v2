# CIVS WP0 current inventory reconstruction

**Contract:** `ecos:civs-wp0-current-inventory:0.1.0`  
**Baseline:** `751e644dda692dfd3622fc9052392b70307204bb`  
**Tree:** `17dac39f34e7290741a652a52f48c1e475ab9fb3`  
**Standing:** new current reconstruction; **not** the lost Astra 39-object manifest.  
**Repository objects:** 33. Count is descriptive, not a target.

## Reconstruction rule

The predecessor says 39 repository objects were inventoried, but its exact enumerated manifest is not durably recoverable. This edition is a new current reconstruction and does not claim identity with that list.

Repository objects use exact **commit + Git blob + path** identity. This edition does not claim independently recomputed SHA-256 values.

## Repository objects

| # | Path | Git blob | Role | Standing/currentness note |
|---:|---|---|---|---|
| 1 | `START_HERE.md` | `17d697a5dcd330a7b2feb828067426ebab05cb82` | reentry | current reentry projection; not independent semantic authority |
| 2 | `docs/invariants.md` | `72b89a2bf7ccb9b2de484be01e45cf5a62e612b6` | governance | governing constitutive non-collapse constraints |
| 3 | `docs/capability-inspection-verification-spine-plan.md` | `473ae1ee54f7c404a2b3cb563a5b45d6bbf9543e` | civs-governance | accepted CIVS plan with amendment integrated |
| 4 | `docs/capability-inspection-verification-spine-audit-2026-10-07.md` | `7e2ae6763105b02fd49fb93b6e39b3d6087e80a6` | civs-governance | current implementation constraints from reification/drift audit |
| 5 | `docs/indexical-relevance-integrity-reconciliation-2026-10-07.md` | `8cdb5c91b5512e7d9926ed78e8f05d3969f7f76d` | civs-governance | current indexical-integrity reconciliation and bounded repair record |
| 6 | `docs/inquiry-orchestration.md` | `4d4f1263e8dcf6974d2ce89591046b11829f5e27` | runtime-contract | current human-readable inquiry runtime contract |
| 7 | `docs/inquiry-orchestration-2026-10-06-receipt.md` | `39776d28f8f657b655a1f7d015ab8803f4f07e8b` | historical-receipt | historical observation-time installation receipt; not current contract state |
| 8 | `docs/domain-semantic-admission.md` | `669a543f466d1a3400b760fd94dd272c1ddf16b5` | runtime-contract | current Domain-Semantic Admission contract/explanation |
| 9 | `research/formal-semantics/PGO-Directed-Situated-Referent-Orchestration-Profile-v0.1.md` | `348dde7972d6da81d4a5970675bb022df80f97f0` | semantic-profile | installed orchestration profile; PGO long-form Namecrafting remains open |
| 10 | `research/urg-kernel/URG-Core-Register-B-Candidate-v1.0.md` | `304e10ef3102d2c062eb2f68fcdedd1cc3ee40cf` | semantic-source | accepted URG full-core source despite historical Candidate filename |
| 11 | `research/urg-kernel/Level-Quadrant-Formal-Contract-v1.0.md` | `b0b3330d3ed2344282b3f4429671d1b0d8f38f6c` | semantic-source | Level and Quadrant formal contract |
| 12 | `server/urg-core.ts` | `cb1139a0b63d383d8a9883b80418811e8d23717b` | runtime-semantic-contract | machine-consumable URG core revision 1.0.2 |
| 13 | `schemas/urg-core-v1.contract.json` | `5d739296b5e02833859681bc97baf0bc25285975` | schema | portable URG contract schema |
| 14 | `server/orchestration.ts` | `1a591a4a3c860106b503bd4265fe075007cd86f1` | runtime-implementation | inquiry orchestration 0.1.1 including indexical binding receipt and delta |
| 15 | `server/orchestration-brain.ts` | `8534dcfbaf8d3ecc13b0e30971fedd522471a1cf` | runtime-adapter | BRAIN/circulation recovery adapter; source work/PGO is provenance not retrieval namespace |
| 16 | `server/domain-admission.ts` | `5cce49ca54ab95c2ca07eed8145cef1710eb97d3` | runtime-implementation | Domain-Semantic Admission evaluator 0.1.0 |
| 17 | `server/native-packages/systems-engineering.ts` | `e9aec3249174c39a72e409e081303061771eba1a` | native-adapter | systems-engineering Native Package descriptors |
| 18 | `server.ts` | `1c8e3ce3609138da9d3be911ee945ce54c726cf9` | runtime-ingress | ordinary MCP ingress; search 0.7.1, server identity 0.6.0, capture 0.5.1 |
| 19 | `research/systems-engineering/DI-Native-Package-Boundary-v0.1.json` | `277aad8605153781fedae9a5a38f7fc2f7601913` | specimen-corpus | first systems-engineering D&I boundary corpus and expected structural dispositions |
| 20 | `tests/inquiry/orchestration.test.ts` | `eb15e6cd2c47fd3e7498f3b3e8c9fd762800c2f1` | mechanical-test | inquiry orchestration and indexical-integrity controls |
| 21 | `tests/inquiry/brain.test.ts` | `f8b771cf2342ee912416f68ade2e0738a6d1c32a` | mechanical-test | BRAIN adapter recovery and non-promotion controls |
| 22 | `tests/inquiry/ingress.test.ts` | `a4f6fca4b5c3d50a736426d3e78d2f882d464ee5` | mechanical-test | ordinary MCP inquiry/domain-admission ingress controls |
| 23 | `tests/inquiry/domain-admission.test.ts` | `8b164caa0f5a5fbbf78214021272a7147af3159f` | mechanical-test | Domain-Semantic Admission structural gate tests |
| 24 | `tests/urg-core/contract.test.ts` | `926912334b4db73cae8ecd143e211bbf04223bf2` | mechanical-test | URG portable-core contract tests |
| 25 | `.github/workflows/inquiry-orchestration.yml` | `5a75178718cafa486e2b6f59bd7518a510778154` | ci-definition | inquiry typecheck/test workflow |
| 26 | `.github/workflows/eco-213-circulation.yml` | `752e42b96da548a2c60e840d75c6d82644bfcb2e` | ci-definition | circulation qualification workflow |
| 27 | `.github/workflows/eco-218-oauth.yml` | `c1471e9dfb69b4d2b39ac50eb3c708018549907e` | ci-definition | ordinary OAuth qualification workflow |
| 28 | `.github/workflows/eco-136-urg-core.yml` | `87381fb110f605c4aa89f8b7a8a01e9f449d5508` | ci-definition | URG core qualification workflow |
| 29 | `scripts/eco-213/commission.ts` | `0182d1f900d69a54ee1355efdf86467ce2fb1b18` | circulation-binding | circulation commission/source binding; known source-manifest omission remains |
| 30 | `server/circulation/worker.ts` | `a91610946422f23ca7eaf6cb7443a92acbe27ea7` | circulation-runtime | dormant/hosted circulation worker implementation |
| 31 | `server/circulation/tools.ts` | `c354fa6db2b94b4b2781fd1846060cc00f8fcbff` | circulation-runtime | circulation MCP/tool contract surface |
| 32 | `package.json` | `0ad3d8bc192540372932e637544b3de3476f6078` | build-definition | runtime scripts/dependencies and exact test/typecheck commands |
| 33 | `vercel.json` | `c5a81d6983166e7480633d49ca013d7166de890b` | deployment-definition | Vercel runtime/deployment routing configuration |

## External evidence/currentness

| System | Ref | Role | Standing / limit |
|---|---|---|---|
| BRAIN | `c5871f89-0c51-462d-831b-c90897a95e81` | CIVS governing plan | plan source; read with accepted amendment |
| BRAIN | `73994c17-d5b5-48d1-9698-fa656c393e91` | accepted two-door / vertical-horizontal / consumer-simulation amendment | accepted Shape amendment |
| BRAIN | `06b3ca69-0805-45aa-8ab9-cc75d618894b` | active CIVS Questions Forward | open questions; not resolved conclusions |
| BRAIN | `0f654aaa-f3e8-4733-afed-cec7fcd66284` | WP0 reentry commission | implementation reentry evidence |
| BRAIN | `9d473ecf-4239-46cd-83c4-383292ed6442` | prior WP0 findings summary | historical summary; exact 39-object manifest unavailable |
| BRAIN | `b7e633f7-a063-4ead-a521-c22e0d060c3e` | indexical relevance reconciliation commission | active commission custody; PGO Namecrafting open |
| BRAIN | `2a315af0-0ed6-44c8-bed1-b34d7b4c3d02` | tool-safety / BRAIN-first Linear downstream continuity authorization | standing bounded continuity authorization; governance/destructive actions separately gated |
| Linear | `ECO-202` | execution coordination | assignee/status are coordination facts, not semantic authority or action authorization |
| Linear | `ECO-218` | ordinary authenticated consumer delivery/qualification | connected-consumer refresh/qualification remains open |
| Linear | `ECO-219` | instruction-surface projection | unassigned coordination surface |
| Linear | `ECO-214` | hosted circulation / twelve ordinary-use obligations | no active worker/provider release inferred |
| Linear | `ECO-51` | mechanized Level/referent seating checker | written procedure exists; mechanization pending |
| GitHub Actions | `37704663545` | ordinary inquiry mechanical qualification | bounded typecheck/tests; not semantic truth, consumer exposure, or ordinary-use efficacy |
| GitHub Actions | `37704663562` | circulation mechanical qualification | does not cure known source-manifest incompleteness for future source-complete worker binding |
| GitHub Actions | `37704508741` | ordinary OAuth qualification | nearby predecessor commit; exact-current OAuth source equivalence is not promoted here without a separate comparison |
| Vercel | `dpl_2sUsXSjPDtaHFJrt2fEhKH8FpTMJ` | current Production deployment | deployment metadata is not authenticated execution, connected-consumer exposure, or situated-use qualification |
| connected ECB-v2-BRAIN action schema | `search` | consumer exposure observation | does not advertise search.inquiry or inquiry.domain_admission; observation is consumer/action-snapshot specific |
| connected ECB-v2-BRAIN action schema | `capture_thought` | consumer exposure observation | runtime has rejected calls without required operation_id; do not infer backend capture absence or fabricate receipt |

## Known defects and open limits

1. **inventory-predecessor-loss** — The earlier 39-object inventory is not durably enumerated. **Route:** This reconstruction supersedes only the need for a current explicit inventory; it does not rewrite the historical BRAIN summary.
2. **circulation-source-manifest-incomplete** — scripts/eco-213/commission.ts SOURCE_FILES omits server/domain-admission.ts and server/native-packages/systems-engineering.ts. **Route:** ECO-202/ECO-214; do not claim source-complete worker binding or release from the existing digest.
3. **brain-capture-contract-drift** — Connected capture_thought schema omits runtime-required operation_id. **Route:** tool-safety / ECO-218 consumer-boundary repair; BRAIN-first failures remain visible.
4. **consumer-search-contract-drift** — Connected BRAIN search schema does not advertise optional inquiry/domain_admission fields. **Route:** ECO-218 connected action refresh/review/publish and fresh-consumer qualification.
5. **connected-consumer-use-unqualified** — Backend implementation/mechanical qualification/deployment are not connected-consumer exposure or situated-use qualification. **Route:** ECO-218 and ECO-214.
6. **pgo-namecrafting-open** — PGO long-form naming is intentionally unresolved. **Route:** preserve functional G-coordinate role; do not canonicalize an expansion in CIVS.
7. **correspondence-formalism-open** — FEDERATE structural admission does not establish cross-domain correspondence truth or a mathematical formalism. **Route:** retain CIVS Question Forward; no formalism selection in WP0-WP2.
8. **production-deployment-ci-separation** — Production deployment currentness and mechanical qualification are separate claims. **Route:** CIR installation assessments must keep deployment, CI, exposure, use, and sustainment independent.

## Reentry

Use this reconstruction as WP0 current inventory input to WP1 CIR contract and WP2 typed object connections. Do not infer original Astra manifest identity from count similarity.

The JSON file of the same basename is the machine-readable source for this human projection.
