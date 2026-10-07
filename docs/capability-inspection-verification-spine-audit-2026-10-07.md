# CIVS implementation audit — reification, drift, and slop sweep

**Date:** 7 October 2026, America/Phoenix  
**Scope:** Capability Inspection / Verification Spine (CIVS) WP0 reentry and the pending WP1 Capability Inspection Record (CIR) / WP2 object-connection implementation.  
**Governing plan:** BRAIN `c5871f89-0c51-462d-831b-c90897a95e81`; accepted amendment `73994c17-d5b5-48d1-9698-fa656c393e91`; GitHub accepted-plan commit `c29d1a9d7db09d4e8de637995666cd754571e430`.  
**Audit standing:** implementation-constraint audit under the accepted plan. It does not reopen URG semantics, select correspondence mathematics, authorize hosted circulation, refresh connected-consumer schemas, or construct the graphical substrate.

## Audit rule

For each issue, identify the exact target, the demonstrated mismatch under the governing sources, and the implementation consequence. Preserve accepted working vocabulary without promoting it into a stronger semantic role.

## Findings

### A1 — The reported 39-object WP0 inventory is not durably reenterable

**Target:** BRAIN WP0 completion record `9d473ecf-4239-46cd-83c4-383292ed6442`, which states that 39 repository objects were inventoried with commit/blob/SHA256, coverage and standing.

**Mismatch:** the durable record preserves the count and summary but not the enumerated 39-object manifest. A BRAIN search for that inventory returns the commission and summary, not the exact inventory. Therefore another worker cannot independently recover which 39 objects were included or verify their individual digests from durable CIVS surfaces.

**Consequence:** treat the missing manifest as a CIVS reentry defect. Do not reconstruct and call it “the original 39.” Build a new versioned durable inventory from exact currently recoverable objects, with edition/currentness fields and an explicit note that it is a reconstruction.

### A2 — CIVS object connections must not turn URG `native_relation` into a generic edge bag

**Target:** pending WP2 implementation framing that every typed object connection could simply be represented as an existing URG `native_relation`.

**Mismatch:** the accepted URG relation contract requires attributable relation-kind identity, role-bearing participants, native schema/semantic source and edition, situated basis and standing; it explicitly says relation representation is not relation truth and URG does not require all relations to be binary graph edges.

**Consequence:** CIVS may use the installed `native_relation` carrier only where a CIVS relation schema/kind/edition and situated standing are actually declared. Arbitrary “source -> target” links are prohibited. No untyped graph and no relation truth inferred from persistence.

### A3 — CIR is an inspection projection, not a replacement truth store

**Target:** WP1 phrase “reusable CIR record/schema” and the plan’s “Compose the first CIR as a projection over those objects.”

**Mismatch:** the two-door invariant and URG fidelity rules require projections to preserve source identity, standing/currentness and omissions; map != referent and persistence != standing.

**Consequence:** a CIR edition points to independently standing source objects and records bounded inspection claims about them. Copied values are observation-time snapshots with edition/currentness references, never a new authoritative copy. The human-readable view is generated from the same CIR edition and is not a second mutable truth model.

### A4 — The installation ladder must not become one ordinal status

**Target:** specified -> implemented -> mechanically qualified -> integrated -> deployed -> exposed -> situated-use qualified -> operationally sustained.

**Mismatch:** these are distinct evidence jobs. A deployment can be READY without consumer exposure; a mechanically qualified code edition may differ from the currently deployed documentation-only head; operational sustainment requires longitudinal evidence. Collapsing them into one “highest stage” silently promotes standing across dimensions.

**Consequence:** represent each installation rung as an independent assessment with proposition, standing, evidence, currentness and limits. No automatic implication from a later-named rung to an earlier or neighboring rung.

### A5 — “Proof chain” must not imply transitive proof

**Target:** premise -> semantic judgment -> structural gate -> decision -> test -> CI -> deployment -> actual-use evidence.

**Mismatch:** governing invariants state verification != truth/authority and PASS requires contract-relevant discriminating sensitivity. Tests/CI prove bounded behavior of specified inputs; they do not prove semantic premises such as `native_coverage`, current native-source adequacy, authority, consumer exposure or situated-use efficacy.

**Consequence:** implement a verification path whose links each name the proposition supported, evidence scope, negative-control/sensitivity evidence where a PASS is relied upon, and what the link does not establish. No support inheritance by adjacency.

### A6 — Physical realization is a set of located coordinates, not a guaranteed linear pipeline

**Target:** repository -> path/module -> runtime/process -> deployed service/revision -> ingress -> persistence -> consumer surface.

**Mismatch:** a repository path is not a server; deployment is not exposure; ingress may exist while a connected consumer snapshot omits the field; persistence may be independent of a specific consumer route.

**Consequence:** record repository, module/runtime, deployment, ingress, persistence and consumer-surface coordinates independently, each with availability/currentness/evidence. Render a path only where explicit relations connect them.

### A7 — Accepted “altitude” labels are working decomposition bands, not URG Level

**Target:** containing meta-architecture / capability / projection / sub-capability / located-object “altitudes.”

**Mismatch:** the accepted amendment explicitly states these are working bands and do not establish URG Level. Constitution still requires the installed Level witness.

**Consequence:** use a field named `working_band` or equivalent and never derive Level, whole/part constitution, Stage or ontology from it. Any actual Level claim must be separately referenced.

### A8 — LATENT / LOCATED are consumer-simulation binding statuses, not global States or truth standings

**Target:** latent-versus-located correlates in the Consumer Quadrant Simulation.

**Mismatch:** LOCATED means bound to an actual object/observation/test/source; it does not mean true, supported, sufficient or relied upon. LATENT means a hypothesized dependency/correlate before such binding; it does not mean nonexistent or invalid.

**Consequence:** scope these labels to consumer-correlation binding only. Keep hypothesis standing, observation result, evidence and reliance separate. Do not reuse them as URG State, global disposition or object existence enums.

### A9 — Consumer Quadrant simulation must not bleed into the inspected capability’s fixed-R/B traversal

**Target:** separate four-position simulation for consumer referent C.

**Mismatch:** the consumer simulation has a different focal referent/basis from the CIVS/inspected-capability Quadrant pass. Reusing UL/UR/LL/LR labels without carrying consumer R/B/G/F would silently change referent and frame.

**Consequence:** every simulation carries its own `consumer_referent_ref`, boundary/basis and frame/use. Its UL entries remain dependency hypotheses; UR entries remain proposed observable correlates. Observable behavior does not automatically prove the UL hypothesis or a consumer psychological state such as trust.

### A10 — Affordance / accommodation / continuity / accountability are local support dimensions, not new universal axes

**Target:** the four support dimensions added by the accepted amendment.

**Mismatch:** they are required inspection questions for consumer correlates, but no source establishes them as URG primitives, universal axes, States or ontology.

**Consequence:** keep them as scoped support claims with their own evidence/owner references. Do not create new core axis records or imply exhaustive coverage of consumer experience.

### A11 — “Field reconstitution” must remain a generalized capability pattern, not a new Change primitive

**Target:** accepted correction that Reseat is only one downstream transformation and the larger capability recalculates/recomposes the active situated field after consequential changes.

**Mismatch:** installed URG already distinguishes Enrich, ReviseBoundary, Reseat, ChangeFrame, Reorient, RequalifyStanding, ChangeCurrentBinding, QF-triggered reentry and other typed changes. Adding a generic `FieldReconstitution` change kind would erase which coordinate actually changed.

**Consequence:** field reconstitution is the resulting behavior of typed changes + dependency/requalification reconciliation. No new generic change kind.

### A12 — Ownership, assignment, semantic authority, accountability and custody must remain distinct

**Target:** CIR dependencies/owners and current Linear “owner” readbacks.

**Mismatch:** a Linear assignee is a coordination assignment, not automatically native-semantic authority, Principal authority, custody, maintenance ownership or action authorization. Governing role-noncollapse forbids promotion across these roles.

**Consequence:** record role-specific relations such as Linear assignee, accountable Principal, semantic owner, maintenance responsibility, custody and action authority separately. Do not persist a generic `owner` field when the role matters.

### A13 — Currentness must not be inferred from recency, successful deployment, or a read timestamp

**Target:** WP0/current first-specimen currentness claims.

**Mismatch:** `current != newest` is governing. As of this audit, production deployment `dpl_6h9zEsNS5REbjHGgnZrAegEpXBaA` is READY and owns the enduring aliases at GitHub commit `752e9c48db1be6be80125a8981331653993dc2f5`, but that commit only changes documentation. No inquiry workflow ran on it. Git compare from mechanically qualified runtime commit `19de89229c1977048c29b4904843dd29d581b901` to `752e9c48...` shows only documentation changes.

**Consequence:** distinguish current deployed binding, source-equivalent runtime edition, mechanical-qualification evidence and observation time. A deployment being current does not manufacture a fresh CI PASS; a historical CI PASS may support the unchanged runtime scope only through an explicit source-equivalence comparison.

### A14 — `FEDERATE` is a structural admission disposition, not proof of correspondence truth

**Target:** Domain-Semantic Admission responsibility `native-to-ecos-correspondence` and the first worked trace.

**Mismatch:** `evaluateDIBoundary` returns FEDERATE when declared native coverage is ADEQUATE, cross-domain correspondence is required and explicit targets are supplied. The evaluator does not establish semantic equivalence, mapping truth, invertibility, composition law or a chosen correspondence formalism.

**Consequence:** the first CIR may reproduce FEDERATE as evidence of structural admissibility under declared premises only. Correspondence semantics remain an unresolved first-class frontier and Question Forward.

### A15 — “Mechanized versus semantic/human” is useful prose but too coarse for the executable contract

**Target:** first-CIR requirement to distinguish mechanized from semantic/human judgments.

**Mismatch:** governing enforcement discipline already separates STRUCTURAL, SEMANTIC, AUTHORITY and OBSERVATIONAL modes, while roles distinguish producer/mapper/checker/observer/executor/custodian/authorizer. “Human” is not equivalent to semantic, and mechanical execution does not confer authority.

**Consequence:** executable CIR inspection claims use the existing four enforcement modes plus explicit actor/role attribution. Human-readable summaries may group them for explanation without collapsing the underlying distinctions.

### A16 — Graphical-door readiness must not be a convenience boolean

**Target:** CIR “graphical-door readiness.”

**Mismatch:** the two-door invariant requires shared addressable objects, attributable typed controls, visible standing/currentness/history, projection omissions, and graceful text/API fallback. A single true/false field would hide which obligation is missing.

**Consequence:** assess graphical-door obligations separately and expose unmet requirements. Any aggregate readiness is derived and scoped, never an independent truth source.

### A17 — Consumer exposure observations are consumer/snapshot-specific

**Target:** “current connected-consumer exposure state.”

**Mismatch:** the observed connected search action returned legacy `results/coverage/repair` without optional inquiry/domain-admission fields. This demonstrates that observed consumer/action snapshot, not backend absence or universal consumer unavailability.

**Consequence:** bind exposure observations to consumer, action/schema snapshot, observation time and route. Do not generalize one missing field to all consumers or to backend capability.

### A18 — BRAIN advertised capture contract still drifts from runtime validation

**Target:** connected ECB-v2-BRAIN `capture_thought` action used for first-class continuity.

**Mismatch:** the currently advertised tool schema accepts `content`, `source` and optional `captured_at`, but a fresh audit-custody attempt was rejected with `INVALID_ARGUMENT` because runtime validation requires a string `operation_id`. The advertised caller surface therefore cannot construct a schema-valid request that satisfies the runtime contract.

**Consequence:** this audit is durably published in GitHub, and the failed BRAIN capture attempt remains visible evidence. Do not claim BRAIN custody for this audit until the exposed schema and runtime are reconciled. Downstream continuity may record the failure/pointer under the standing BRAIN-first visible-failure envelope; it must not fabricate a BRAIN receipt.

## Reconciliation disposition

The accepted CIVS plan remains intact. These findings constrain implementation rather than introducing new URG primitives or changing the accepted purpose/boundary.

Before WP1/WP2 publication:

1. rebuild the missing WP0 inventory as a new durable reconstruction;
2. implement independent installation assessments rather than a scalar stage;
3. implement typed CIVS relation claims with explicit semantics/basis/standing and URG relation compatibility only where warranted;
4. implement verification links with proposition scope, limits and sensitivity evidence;
5. keep physical realization coordinates independent;
6. mechanically scope working bands and LATENT/LOCATED/support dimensions to their local jobs;
7. separate role/currentness/exposure claims;
8. reproduce the FEDERATE trace with its proof boundary explicit;
9. update CI path/typecheck coverage for the new CIVS implementation files;
10. generate any human view from the same CIR edition while preserving source-linked omissions and standing.

**Stop rule:** if implementation requires a new semantic primitive, a mathematical correspondence formalism, a generic relation bag, a scalar installation truth, or hidden inference from deployment/CI/assignment/consumer observation, stop and return the exact mismatch rather than compensating in prose.
