# CIVS portability + graceful-degradation matrix — ecos:domain-semantic-admission:0.1.0

**Contract:** `ecos:civs-portability-degradation-matrix:0.1.0`  
**Matrix:** `ecos:civs:domain-semantic-admission:portability-degradation:2026-10-07:v0.1`  
**Source CIR:** `ecos:cir:domain-semantic-admission:2026-10-07:v1.2`  
**Basis:** `BRAIN:c5871f89-0c51-462d-831b-c90897a95e81#WP6`  
**Observed:** `github:Levi-Anthony/ecb-v2:1b37fbbf210e5470f0de8bf71143079155f695e3`

> Portability and graceful degradation are separate inspection questions. Describing substitution requirements does not qualify a substitute implementation/provider.

## Portable-contract assessment

**STRUCTURAL / NOT ESTABLISHED:** The bounded decision contract can be specified independently of the current Vercel, Linear, BRAIN, graphical, and connected-consumer realizations; no alternate evaluator/runtime/host has yet been independently qualified for equivalent behavior.

Limits: Current decision identity uses Node SHA-256.; Substitution requirements are not substitute proof.; Native semantic ownership/currentness remains external.

## Current realization and substitution requirements

| Dependency class | Current realization | Portability standing | Substitution requirements |
|---|---|---|---|
| SEMANTIC_EVALUATOR | TypeScript evaluator with canonical ordering + node:crypto SHA-256. | NOT ESTABLISHED | preserve gate/input/output semantics; reconcile deterministic decision identity; pass positive/negative domain controls |
| NATIVE_PACKAGE_REGISTRY | Static TypeScript descriptors for OMG/ISO/NASA packages. | UNKNOWN | preserve native identity/authority/edition; preserve validation/currentness routes; do not absorb native semantic ownership into ECOS |
| EXECUTION_RUNTIME | Node 24.x in package/CI/Vercel. | NOT ESTABLISHED | equivalent crypto/module semantics; full current mechanical suite; explicit decision-ID reconciliation |
| CANONICAL_RECOVERY | Supabase-backed BRAIN with connected read/search. | UNKNOWN | exact referent/custody identity; standing/currentness separation; fail-visible recovery/provenance |
| RETRIEVAL_CHANNEL | Embedding-assisted retrieval plus lexical/native fallback. | UNKNOWN | candidate-only standing; visible degradation/fallback; no similarity-to-applicability promotion |
| DEPLOYMENT_HOST | dpl_5Yb2gNbzRj1ZkNnAPaPhre3V47pa READY at current main. | UNKNOWN | bind exact qualified source; preserve runtime/env contracts; re-run mechanical/authenticated ingress checks; separate deploy/expose/use |
| SOURCE_CUSTODY | GitHub main at 1b37fbbf210e5470f0de8bf71143079155f695e3. | UNKNOWN | exact edition/history/object identity; addressable tests/docs/CIR; supersession evidence |
| MECHANICAL_VERIFICATION | CIVS 37709566698 + inquiry 37709285796 successful. | UNKNOWN | equivalent commands on exact source; logs/sensitivity evidence; mechanical/semantic separation |
| COORDINATION_SURFACE | ECO-202/218/214/51/219. | UNKNOWN | preserve issue/history/role semantics; do not promote assignment to authority; retain BRAIN-first custody distinction |
| COMMISSION_CUSTODY | Governing records readable; connected capture cannot express runtime-required operation_id. | NOT ESTABLISHED | immutable/idempotent custody; BRAIN-first ordering; visible failure rather than fabricated custody |
| CONSUMER_SURFACE | Observed search snapshot advertises query + limit only. | NOT APPLICABLE | refresh/review/publish exact schema; fresh-consumer invocation without authority widening |
| HUMAN_PROJECTION | Generated checked CIR Markdown + docs/civs-reentry.md; no graphical control substrate. | SUPPORTED | machine CIR remains source; preserve standing/currentness/omissions; retain text/API fallback |
| NATIVE_AUTHORITY | External authority refs in Native Package descriptors. | NOT APPLICABLE | retain authority/edition provenance; do not transfer native standing to ECOS; route unavailability to qualification |

## Degradation cases

### wp6:d:no-graphics — CONTINUE
Trigger: No graphical substrate is available.
Unavailable: `graphical projection/control substrate`
Retained: machine CIR; generated Markdown; cold reentry; text/API navigation
Lost/degraded: graphical traversal/control/reconciliation
Visible signals: unimplemented graphical obligations remain NOT_ESTABLISHED; text/API fallback remains available
Reentry: Continue inspection through CIR/text/API; reenter graphical work only when separately earned/commissioned.
Falsifier: A consequential CIR distinction cannot be recovered without graphics.
Limits: CONTINUE is inspection-only; graphical obligations remain open.

### wp6:d:stale-consumer — HOLD
Trigger: Connected snapshot omits inquiry/domain_admission.
Unavailable: `connected inquiry/domain_admission reflection`
Retained: backend implementation; mechanical qualification; Production deployment; CIR inspection
Lost/degraded: connected invocation via that snapshot; fresh-consumer evidence
Visible signals: search schema shows query+limit only; exposed remains NOT_ESTABLISHED
Reentry: ECO-218 refresh/review/publish + fresh-consumer conformance; never infer exposure from deployment.
Falsifier: A fresh connected snapshot exposes and successfully invokes the optional field.
Limits: Consumer-specific snapshot, not backend absence.

### wp6:d:host-down — HOLD
Trigger: Current host/deployment is unavailable.
Unavailable: `Vercel Production`
Retained: source/CIR/tests; pure evaluator semantics for separately qualified runtime
Lost/degraded: Production service; host ingress; new Production use evidence
Visible signals: deployment not READY/unavailable; deployed currentness cannot remain supported
Reentry: Restore host or qualify substitute host against exact source/runtime/env; then separately re-establish deploy/expose/use.
Falsifier: A separately qualified deployment provides equivalent bounded runtime/ingress behavior.
Limits: Source portability alone does not qualify host substitution.

### wp6:d:brain-down — HOLD
Trigger: Ordinary inquiry cannot search/fetch exact canonical evidence.
Unavailable: `BRAIN canonical recovery`
Retained: pure evaluator on complete explicit input; repo CIR/docs/tests; already-held historical evidence
Lost/degraded: integrated discovery/exact recovery; new current evidence recovery
Visible signals: recovery channel unavailable/degraded; cold reentry SOURCE_UNAVAILABLE where consequential
Reentry: Restore canonical recovery or provide independently attributable exact current input/evidence; requalify current use.
Falsifier: Declared use can be completed with exact attributable current evidence without BRAIN recovery.
Limits: Pure evaluator survival is not integrated-capability survival.

### wp6:d:embedding-down — DEGRADE
Trigger: Embedding generation/query fails.
Unavailable: `semantic embedding/query channel`
Retained: lexical retrieval; native structural discovery where available; exact fetch; coverage reporting
Lost/degraded: semantic-vector candidate channel; complete-aperture claim
Visible signals: semantic coverage degraded/unavailable; no empty-result completeness inference
Reentry: Continue only if missing semantic coverage cannot change the declared decision, otherwise repair/requalify discovery.
Falsifier: Attributable comparison shows no decision-relevant coverage difference for the declared use.
Limits: No retrieval-quality uplift claim.

### wp6:d:ci-down — DEGRADE
Trigger: Current CI cannot execute/recover evidence.
Unavailable: `GitHub Actions`
Retained: source; last historical CI receipts; runtime may continue
Lost/degraded: new current qualification; fresh sensitivity evidence
Visible signals: CI receipt unavailable; changed source cannot inherit old PASS
Reentry: Restore CI or use equivalent evidenced executor on exact source/tests; bind results to source edition.
Falsifier: Alternative executor produces attributable equivalent results on same source/tests.
Limits: Historical PASS remains historical.

### wp6:d:source-down — DEGRADE
Trigger: Exact current source cannot be recovered.
Unavailable: `GitHub source/history`
Retained: deployed runtime may remain; previously materialized CIR/evidence
Lost/degraded: exact source inspection; Git object/current comparison; new source-bound qualification
Visible signals: SOURCE_UNAVAILABLE; source equivalence cannot be demonstrated
Reentry: Restore exact source custody or independently verified mirror; HOLD promotion of source-dependent claims.
Falsifier: Verified mirror supplies exact edition/history/object identity.
Limits: Runtime availability does not repair source-currentness loss.

### wp6:d:linear-down — DEGRADE
Trigger: Current issue/status/assignee cannot be read.
Unavailable: `Linear ECO coordination`
Retained: runtime semantics; GitHub/BRAIN evidence; historical role records
Lost/degraded: current issue status/assignment; new Linear continuity writes
Visible signals: role currentness becomes UNKNOWN; authority does not transfer automatically
Reentry: Restore Linear or separately authorized continuity while preserving BRAIN-first custody and role limits.
Falsifier: Authorized replacement preserves issue/history/role semantics without authority collapse.
Limits: Linear loss is not runtime-semantic failure.

### wp6:d:brain-capture-drift — DEGRADE
Trigger: Connector cannot express runtime-required operation_id.
Unavailable: `connected capture_thought operation_id`
Retained: existing governing BRAIN reads; GitHub durable source; visible downstream Linear continuity
Lost/degraded: new capture via current connector; claim of new BRAIN receipt
Visible signals: INVALID_ARGUMENT missing operation_id; Linear records BRAIN-first failure
Reentry: Repair/refresh exposed capture contract while preserving idempotent operation identity; retry only after operation_id is expressible.
Falsifier: Connected capture exposes operation_id and exact idempotent capture succeeds/re-fetches.
Limits: Never weaken runtime idempotency to fit stale connector.

### wp6:d:native-source-down — HOLD
Trigger: Responsibility needs native requalification but authority source is unavailable.
Unavailable: `authoritative native source`
Retained: structural evaluator; historical evidence; explicit QUALIFY routing
Lost/degraded: current native semantic qualification; legitimate extension/admission promotion
Visible signals: native_coverage=UNAVAILABLE; NATIVE_SOURCE_UNAVAILABLE; blocking responsibility HOLD
Reentry: Recover authoritative source/current edition or accepted authoritative substitute; rerun responsibility qualification.
Falsifier: Relevant native semantics/currentness are independently established from another accepted authority route.
Limits: Unavailability never defaults to EXTEND.

### wp6:d:runtime-down — HOLD
Trigger: Node 24/equivalent crypto/module semantics unavailable.
Unavailable: `Node-compatible runtime`
Retained: spec/source/CIR; native descriptors; test definitions
Lost/degraded: evaluator execution; installed decision IDs; MCP execution
Visible signals: runtime fails before bounded result; source remains distinct from executable availability
Reentry: Restore Node-compatible runtime or qualify substitute against gate/canonicalization/identity/ingress tests.
Falsifier: Substitute passes full bounded suite with reconciled decision-identity semantics.
Limits: TypeScript readability is not runtime portability proof.

## Cross-case invariants

- A dependency outage may lower availability, observability, currentness, or qualification; it never upgrades semantic standing.
- Pure Domain-Semantic Admission and the integrated ordinary inquiry path are distinct portability units.
- Historical evidence remains historical when its currentness surface is unavailable; present use must requalify.
- No substitute inherits standing until bound to exact requirements and independently qualified.
- Assignment, custody, deployment, CI and consumer exposure remain distinct under degradation.
- Native-source unavailability routes to QUALIFY/HOLD, never automatic ECOS extension.
- Graceful degradation must expose the missing channel and retained fallback; silent fallback is a defect.
- No degradation route selects correspondence mathematics or creates a new URG primitive.

## Omissions

- No alternate evaluator/runtime/host/CI/source-custody/coordination/BRAIN replacement is qualified.
- No quantitative provider reliability/latency comparison is claimed.
- No hosted ordinary-use evidence is added by this matrix.
- No consumer-schema refresh or hosted circulation activation is performed.
- No correspondence mathematical formalism is selected.
- The current dependency set is inspected, not asserted eternally complete.

> A dependency outage may lower availability, observability, currentness, or qualification. It never upgrades semantic standing.
