# ECO-189 — Architecture Shape Return: Tri-Axial Coordination Realization, Canonical BRAIN + Reconstitution Contract

**Date:** 23 September 2026, America/Phoenix
**Controlling issue:** ECO-189
**Phase:** Architecture Shape
**Register:** B
**Disposition:** **PASS — COMPLETE SHAPE RETURN / STOP AT MOVE BORDER**
**Implementation / schema / runtime / provider mutation / production installation:** **NOT PERFORMED**

## 0. Executive decision

This Shape selects a substrate-independent realization architecture for the first bounded tri-axial coordination capability.

The selected form is:

> **one canonical ECOS state/reconstitution plane + replaceable realization/interaction surfaces + typed reliance edges to external reality**

The canonical BRAIN is **not** the sole executor, sole observer, sole artifact editor, sole deployment host or sole source of external truth.

It is the **single authoritative ECOS lineage** from which ECOS-owned governing commitments, current coordination state, accepted realization state, installation state and decision-bearing provenance can be reconstructed.

External systems may remain authoritative about their own live reality. ECOS must not silently convert a stored observation about that reality into timeless truth.

The Sense candidate:

> “No external-only decision-bearing state”

is therefore **refined**, not adopted literally.

### Selected invariant

> **No ECOS-governing commitment may exist only on a replaceable external surface. Any external fact on which ECOS relies must be represented canonically as a typed reliance relation with source identity, observation/currentness basis, decision consequence and revalidation/failure semantics.**

Short form for internal use:

> **No external-only governing commitment. External reliance must be canonical and revalidatable.**

This preserves both independence and reality contact.

The tri-axial coordination capability is realized as a **derived coordination projection over independently standing canonical constituents**, not as a monolithic object that owns referent, PGO, SSMM phase, authority, evidence or currentness.

The logical realization chain is frozen as:

> architectural obligation → realization responsibility → realization allocation → implementation artifact → qualification evidence → installation binding → observed use

Every material transformation along that chain must preserve exact source/edition and declare what was:

* preserved;
* derived/reformulated;
* added;
* stripped/rejected;
* deferred.

Material changes propagate through explicit dependency edges so requalification can be localized.

---

## 1. Governing source standing

This Shape is downstream of and compatible with:

* ECO-162 — tri-axial + fidelity architecture; no reopening.
* ECO-183 — Principal-accepted URG × PGO × SSMM generative orchestration basis at its proper seat.
* ECO-176 — Principal-accepted graded/compositional installation Sense.
* ECO-182 — consumer-bound, loss-aware obligation-to-use realization contract.
* ECO-186 — connected receiving-path qualification; real installed-consumer use remained unproven.
* ECO-188 — Principal-accepted Sense establishing ECOS realization + one-BRAIN focus.
* existing greenfield repository invariants, including `current ≠ newest`, role non-collapse, verification ≠ truth/authority, and “physicalize deterministic liability; preserve semantic freedom where interpretation remains valuable.”

No source required upstream reentry.

---

## 2. Operational definition — one canonical BRAIN

### 2.1 Selected definition

> **The canonical BRAIN is the single authoritative durable lineage for ECOS-owned semantic, governing, coordination, realization and installation state. It must contain or canonically custody enough exact information to reconstruct decision-relevant ECOS state and accepted installed capability without relying on any replaceable external work surface as the sole keeper of that state.**

“Single” means **one authority/currentness lineage**, not one physical machine or one database copy.

Allowed:

* backups;
* replicas;
* export snapshots;
* disaster-recovery copies;
* read replicas;
* migration to another PostgreSQL host;
* content-addressed export bundles;

provided they do not become independently writable co-equal semantic authorities.

### 2.2 Postgres / Supabase distinction

The current architectural carrier is PostgreSQL.

Supabase is a present hosting/control-plane realization. It is not the identity of the BRAIN.

A later migration from Supabase-hosted Postgres to another compatible PostgreSQL environment may preserve the BRAIN if:

* stable identity and lineage survive;
* currentness/standing semantics survive;
* exact canonical state survives;
* authority and operation replay semantics survive;
* no external surface becomes the hidden missing source.

### 2.3 What the BRAIN is not

The BRAIN is not:

* all physical reality;
* a model-provider transcript store;
* a universal runtime;
* a universal secret vault;
* Git repository replacement by default;
* issue tracker replacement by default;
* raw telemetry warehouse by default;
* an excuse to copy every external byte into PostgreSQL.

---

## 3. External reality and canonical reliance

The architecture requires a strict distinction between:

**External fact:** something that obtains in an external system/environment.

**Canonical observation:** an ECOS record that a mapper/method observed the external fact at a stated time/version under a stated access path.

**Reliance relation:** an explicit record that some ECOS commitment/currentness/install claim depends on that observation or on the external fact continuing to obtain.

**Revalidation rule:** what must be checked, when, and what degrades if it cannot be re-established.

Example:

* Vercel says deployment X is READY.
* The BRAIN may canonically record “deployment X was observed READY at T through method M.”
* An installation claim may depend on “deployment X remains READY and bound to consumer C.”
* The BRAIN does **not** make Vercel READY forever by storing the observation.
* When currentness matters, the external fact is revalidated; failure/unavailability changes the dependent claim according to its contract.

This is the application of the mapper/reality-contact invariant to one-BRAIN architecture.

---

## 4. Canonicalization frontier

### 4.1 Before the frontier

Information may remain external/noncanonical while it is merely:

* raw observation;
* proposal;
* brainstorm;
* draft issue/comment;
* unaccepted PR;
* model output;
* CI/log trace;
* temporary runtime state;
* candidate design;
* unexplored external source.

Its existence may be useful without governing later work.

### 4.2 Crossing condition

Information crosses the canonicalization frontier when ECOS treats it as one or more of:

* accepted governing obligation;
* current orientation/coordination state;
* current standing/warrant/authority fact;
* accepted capability or realization contract;
* required implementation content;
* accepted qualification evidence;
* current installation/binding claim;
* dependency whose loss/change can alter the above;
* Question Forward/reentry condition whose future trigger affects work;
* explicit rejection/supersession whose history must constrain future interpretation.

### 4.3 Required canonicalization output

Crossing does **not** mean “copy the whole external application.”

The canonical side must retain enough to reconstruct:

* exact subject/referent identity;
* exact source/edition/content where ECOS owns or accepts the content;
* mapper/method/provenance;
* standing/currentness;
* use/scope;
* dependencies;
* transformation/loss record where applicable;
* revalidation/falsification condition;
* decision consequence;
* external locator as provenance when useful.

If exact external content remains necessary for future reconstruction, that content must be under canonical custody rather than represented only by a URL.

---

## 5. Information classes

These are logical responsibility classes, not database enums.

### Class A — Canonical ECOS-owned state

Must be recoverable from the BRAIN.

Examples:

* accepted architectural contracts/invariants;
* accepted semantic decisions;
* stable Referent identities and semantic relations;
* current standing/currentness distinctions;
* PGO bindings;
* SSMM transition/episode lineage;
* Question Forward and reentry triggers;
* capability contracts;
* accepted realization maps;
* installation bindings;
* authority grants/limits when ECOS-owned;
* accepted transformation/loss records.

### Class B — Canonical external-reliance records

External fact remains external; BRAIN stores the reliance contract.

Minimum logical content:

* external subject/source identity;
* observed proposition/state;
* observation method and time/version;
* mapper/access path;
* reliability/standing limits;
* dependent ECOS claims;
* revalidation trigger/expiry;
* failure consequence.

### Class C — Canonically custodied realization artifacts

Where exact content is required to reconstitute an accepted capability, the BRAIN must directly hold or control a portable immutable/content-addressed representation sufficient to restore it.

Examples may include:

* accepted source/code bundle;
* SQL/migration text;
* Skill/prompt contract;
* workflow definition;
* configuration contract excluding secret values;
* deterministic tests/fixtures essential to qualification;
* realization manifest.

GitHub may remain the preferred editing/review surface, but it cannot be the sole surviving copy of accepted required realization content.

This is a logical custody requirement. Shape does not select the physical artifact packaging mechanism.

### Class D — Reproducible derivatives

May be discarded and regenerated from canonical sources plus declared transformation identity.

Examples:

* embeddings;
* vector/search indexes;
* cached projections;
* generated handoffs;
* Result/Handoff/Teach/Audit renderings;
* materialized views;
* provider-specific bundles generated from canonical realization content.

### Class E — Ephemeral observations/telemetry

May expire unless later relied upon.

Examples:

* raw tool-call streams;
* complete model traces;
* runtime logs;
* CI console output;
* temporary local debugging artifacts.

If a governing/qualification claim depends on them, a sufficient evidence receipt or necessary subset crosses the canonicalization frontier before expiry.

### Class F — Secret/capability values

Secret values remain outside ordinary semantic BRAIN content unless a dedicated security design explicitly proves otherwise.

The BRAIN retains non-secret semantics:

* secret/capability identity or role;
* required consumer/environment;
* permitted scope;
* issuance/currentness/rotation/revocation contract;
* evidence that binding exists, without value disclosure.

### Class G — Bootstrap root

A tiny amount of environment-specific information necessarily exists outside the BRAIN to locate/access/restore it.

This may include:

* endpoint/host locator;
* credential acquisition path;
* backup/restore locator;
* client bootstrap configuration.

This is **not a second BRAIN** because it carries no independent semantic/governing state.

Bootstrap loss is an access/recovery failure, not a license to duplicate governing truth into every client.

---

## 6. Tri-axial coordination logical contract

### 6.1 Architecture choice

Do **not** create one canonical “coordination object” that owns all state.

The current coordination account is a **derived projection over independently standing constituents**.

The projection can be persisted as an Artifact/cache if useful, but its currentness is derivative of its constituent dependency set.

### 6.2 Required constituent families

A live coordination projection must be able to recover or explicitly mark unknown at least the following.

#### Referential / URG seat

* focal Referent identity;
* declared boundary/grain/holarchic seat;
* mapper/frame where consequential;
* material relations/dependencies;
* newly admitted consequential referents;
* unresolved seating/boundary questions.

#### Governing / PGO seat

* governing-orientation identity and edition;
* intended observable outcome / current governing target;
* relevance/decision discriminator;
* sufficiency/stopping condition;
* failure/reorientation/reentry conditions;
* explicit unresolved orientation questions.

#### Temporal / SSMM seat

* work episode/lineage identity;
* current phase/state under the current episode;
* exact transition basis/receipt;
* prior consequential transitions sufficient for reentry;
* suspension/reentry condition;
* permitted next phase/transition under present authority;
* phase unknown/stale where it cannot be established.

#### Fidelity / non-collapse constituents

Keep separately inspectable where they can vary independently:

* evidence;
* warrant;
* standing;
* authority;
* authorization;
* currentness;
* actor/custody;
* Question Forward / sensors;
* source/version;
* consumer/use/environment;
* capability realization/install state.

### 6.3 Projection return

Default progressive projection should answer, in plain language:

> Where am I?
> What exactly am I working on/from what seat?
> What governs this work now?
> Where are we in the process?
> What changed?
> What is stale/unknown?
> What is the next warranted transition?
> What is not authorized?
> Where do I inspect deeper evidence?

Result/Handoff/Teach/Audit are allowed projections over the same constituent/evidence substrate, not separate governing truth stores.

---

## 7. Realization traceability contract

Every installed capability must be traceable through the following logical chain:

1. **Architectural obligation**
2. **Realization responsibility**
3. **Realization allocation**
4. **Implementation artifact**
5. **Qualification evidence**
6. **Installation binding**
7. **Observed consumer use**

Each material edge must recover:

* exact upstream identity/edition;
* downstream identity/edition;
* declared use/scope;
* preservation/loss classification;
* guarantee supplied;
* decision-relevant dependencies;
* qualification evidence;
* falsifier/revalidation trigger.

### Preservation/loss classification

For each transformation:

* **PRESERVED** — obligation carried materially unchanged;
* **DERIVED / REFORMULATED** — same governing job in a new representation;
* **ADDED** — implementation/environment introduces additional commitment;
* **STRIPPED / REJECTED** — input commitment deliberately not carried;
* **DEFERRED** — responsibility remains outstanding.

No implementation may silently convert a deferred/stripped obligation into “satisfied.”

---

## 8. Semantic judgment versus structural enforcement

### Must remain semantic/judgmental unless later evidence earns stronger physicalization

* discovering/re-seating a consequential referent;
* determining whether a frame is adequate;
* PGO formation/enrichment when purpose is not mechanically settled;
* relevance when meaning-sensitive;
* evidence applicability across changed context;
* interpreting novel substrate affordances;
* deciding whether runtime evidence challenges implementation versus upstream architecture;
* deriving new Questions Forward.

### Structurally enforce where already ratified and mechanically decidable

* stable Referent identity;
* immutable canonical artifacts/evidence where required;
* exact operation identity + replay/conflict behavior;
* predecessor/currentness preconditions;
* version/content digest comparison;
* no silent newest→current promotion;
* declared dependency stale detection;
* explicit installation binding existence;
* exact source/edition custody;
* role/capability boundary where technically enforceable;
* loss-record completeness for a declared realization transition;
* secret non-disclosure boundary.

### Observational

* traces;
* runtime metrics;
* provider status;
* tool inputs/results;
* performance/failure evidence.

Observation does not self-promote into governing standing.

---

## 9. Change / requalification contract

Requalification is **dependency-local by default**.

### Architectural contract changes

Requalify realization responsibilities and descendants whose guarantees rely on the changed obligation.

Do not invalidate unrelated realization edges.

### Focal referent / seat / frame changes

Requalify seat-dependent composition, PGO applicability and lower-relational scope as warranted.

Do not rewrite source evidence.

### PGO changes

Requalify:

* active relevance;
* sufficiency;
* selected capabilities;
* current coordination projection;
* decision consequence.

Do not reinterpret unrelated existence/identity as changed merely because relevance changed.

### SSMM phase/episode transition

Advance temporal lineage and invalidate phase-derived projections.

Do not infer authority from phase.

### Evidence/warrant changes

Requalify claims whose standing depends on changed evidence.

Operational ACTION/HOLD disposition may remain separately represented.

### Authority/currentness changes

Fence or permit effects as appropriate without deleting useful evidence/coordination state.

### Implementation artifact changes

Qualification and installed binding are stale until the changed realization is requalified/reinstalled under the relevant contract.

### Consumer/environment changes

Installation is boundary-relative; requalify installation for the new consumer/use/environment.

The capability contract may remain unchanged.

### External fact change/unavailability

Dependent canonical reliance record becomes stale/revalidation-required.

If the external fact cannot be revalidated:

* claim remains historical as observed-at-T;
* current reliance degrades according to its contract;
* no silent assumption of continuity.

### Provider/runtime disappearance

Treat as realization/environment failure first.

Rebind the unchanged capability contract where possible.

Reenter architecture only if the disappearance exposes a hidden constitutional dependency or semantic contradiction.

---

## 10. Minimum reconstitution package

An accepted installed capability is reconstitutable only if canonical custody can recover the following without hidden Linear/GitHub/chat/provider memory.

### R1 — Governing package

* capability/architectural contracts;
* exact accepted editions;
* standing/currentness;
* reentry/falsification conditions.

### R2 — Coordination package

* focal Referent/seat constituents;
* PGO binding;
* SSMM episode/phase lineage;
* fidelity/currentness/authority constituents;
* open QF/sensor state.

### R3 — Realization manifest

* realization responsibilities;
* allocation to carriers;
* transformation/loss records;
* dependency graph;
* guarantee per responsibility.

### R4 — Exact realization artifacts

Portable exact content or canonical artifact custody sufficient to recreate the accepted implementation.

This may be one bundle or multiple immutable artifacts; Shape does not select packaging.

### R5 — Environment/configuration contract

* required runtime capabilities;
* dependency versions/compatibility constraints where decision-relevant;
* external services;
* non-secret configuration;
* secret/capability roles, not values;
* bootstrap/rebinding instructions.

### R6 — Qualification package

* tests/checkers/fixtures necessary to interpret the qualification;
* exact implementation identity tested;
* positive + negative control results;
* evidence receipts retained at sufficient resolution;
* known limits.

### R7 — Installation package

* consumer/use/environment identity;
* binding state;
* current installed realization identity;
* external reliance records;
* rollback/recovery route;
* initial observed-use evidence.

### R8 — Restore/rebind procedure

Enough procedure for a fresh qualified worker/system to:

1. recover canonical BRAIN;
2. reconstruct artifacts;
3. provision/choose a compatible execution surface;
4. restore non-secret config;
5. reacquire secrets through the declared human/security route;
6. revalidate external dependencies;
7. install/bind;
8. run qualification;
9. regenerate coordination projections.

This is a logical contract, not a frozen automation implementation.

---

## 11. Installation acceptance contract for the first tri-axial capability

An implementation does not count as installed merely because code exists, tests pass or a service is deployed.

The first tri-axial capability is installed for a declared consumer only when:

 1. its exact accepted realization is bound to that consumer/use/environment;
 2. the consumer actually retrieves the canonical coordination constituents;
 3. the consumer can generate/use the progressive coordination projection;
 4. one real work episode is resumed or advanced correctly without hidden chat memory;
 5. a material constituent change causes localized recoordination;
 6. external currentness is revalidated where required;
 7. an unauthorized transition is not permitted merely because it is the apparent “next” step;
 8. the accepted realization can be reconstructed without relying on Linear/GitHub as sole content stores;
 9. evidence sufficient to support the installation claim is canonically retained;
10. rollback/reentry remains possible.

---

## 12. Qualification / falsification matrix

### Positive — cold coordination

Fresh worker/consumer receives only the canonical access/bootstrap route.

It correctly recovers focal seat, PGO, SSMM state, dependencies, QF, authority boundary and next warranted transition.

### Positive — change localization

Change one PGO constituent.

PGO-dependent relevance/projection changes; unrelated referent identity, raw evidence and installation identity remain intact unless explicitly dependent.

### Positive — external-source outage

Remove Linear access during qualification.

The consumer still recovers governing/current ECOS state required for the episode.

Linear-only uncanonicalized material does not acquire standing.

### Positive — repository outage

Remove GitHub access.

The exact accepted realization artifact set remains reconstructible from canonical custody and can be qualified.

### Positive — external currentness revalidation

A provider deployment observation becomes stale.

The installation claim moves to revalidation-required rather than remaining current by historical receipt.

### Positive — provider substitution

Replace one runtime carrier in an isolated qualification environment.

The capability contract remains stable; only realization/environment bindings change.

### Positive — trace expiry

Delete raw execution telemetry after a sufficient canonical evidence receipt is produced.

The qualified proposition remains interpretable within its retained limits.

### Negative — latest external wins

A newer Linear/GitHub object that has not crossed the canonicalization frontier must not silently become governing/current.

### Negative — phase implies authority

SSMM next-phase projection must not grant authority absent a separate authority basis.

### Negative — PGO implies existence

A non-relevant Referent/relation must not become nonexistent merely because it is inactive under current PGO.

### Negative — missing secret

A missing secret/capability blocks the effect while preserving coordination/recovery. The system must not copy the secret into semantic BRAIN content to “complete” the package.

### Negative — lost evidence

If a governing claim relied on raw external evidence and no sufficient canonical receipt was retained, the claim must degrade/requalify after that evidence disappears.

### Falsifiers

Shape must be reopened if implementation demonstrates:

* one-BRAIN custody cannot support reconstitution without destroying required distributed behavior;
* a legitimate governing commitment must remain solely external and cannot be canonically represented as commitment/dependency without semantic distortion;
* tri-axial coordination cannot be represented as independently variable constituents without losing essential behavior;
* provider replacement necessarily changes the architectural capability rather than only its realization;
* required evidence retention is inherently inseparable from indefinite raw telemetry retention;
* the proposed local dependency model cannot correctly localize requalification.

---

## 13. External surface roles after Shape

### Linear

Role: high-value human coordination/review/work-management projection.

May originate proposals and record work.

Not canonical merely by issue status.

Decision-bearing Linear changes must cross the canonicalization frontier before ECOS relies on them independently of Linear.

### GitHub

Role: editing, review, version-control and CI surface.

Commit/blob identity remains excellent exact-source evidence.

Accepted implementation required for reconstitution must be canonically custodied, not GitHub-only.

### Vercel / other runtime

Role: replaceable execution/deployment/observability substrate.

Live runtime truth remains external and revalidated.

### OpenAI/OpenRouter/model providers

Role: replaceable semantic compute/model-routing surfaces.

Model sessions/traces are not BRAIN truth.

### OpenTelemetry / trace system

Role: portable observational substrate.

Raw trace storage is not semantic ontology.

### Supabase

Role: current Postgres hosting/control plane plus optional runtime/eventing affordances.

Supabase itself is not the BRAIN identity.

---

## 14. Bootstrap and disaster recovery

One canonical BRAIN does not remove the need for bootstrap.

A consumer cannot discover a database with literally zero external information.

Therefore Shape explicitly permits a small external **bootstrap root** carrying only access/recovery information.

The bootstrap root must not carry independently mutable governing state.

Examples:

* current database locator;
* safe credential-acquisition route;
* backup/restore locator;
* minimum client config.

Backups/replicas do not violate one-BRAIN if they retain one canonical lineage and have explicit promotion/restore semantics.

A disaster-recovery restore may create a new physical primary without creating a new semantic BRAIN identity.

---

## 15. Disposition of ECO-187

ECO-187 was prepared under the narrower pre-ECO-188 model:

> connected ECB v2 client adapter — actual consumer install, operation custody + exact hydration.

That remains valuable evidence and partial responsibility coverage, but its commission is now under-scoped for the first installed tri-axial capability.

**Shape decision:** ECO-187 **SHALL NOT execute as currently written.**

Preserve it as a superseded prepared commission/evidence carrier.

The successor must include:

* canonicalization/reconstitution responsibilities;
* tri-axial coordination constituent recovery;
* exact realization-artifact custody;
* external-reliance semantics;
* progressive projection;
* local requalification;
* real consumer use;
* restore/rebind proof.

Do not discard ECO-187's exact operation-ID, source hydration, consumer-binding and authority-separation requirements; inherit them into the new Move where applicable.

---

## 16. Selected next Move architecture

The first physical probe should exercise a **vertical realization slice**, not build the entire ECOS future.

The slice should be large enough to test the critical architecture:

> canonical BRAIN constituents → tri-axial coordination projection → real consumer use → material change → localized recoordination → retained evidence → reconstitution from canonical custody

It should also exercise one external-reliance edge and one replaceable external surface.

### Why this slice

It tests simultaneously:

* one-BRAIN canonicalization;
* tri-axial composition;
* semantic/structural allocation;
* consumer binding;
* currentness;
* progressive legibility;
* evidence retention;
* requalification;
* portability/reconstitution.

A smaller “read a row and summarize it” probe would not discriminate the architecture.

---

## 17. Exact prepared Move commission

**Recommended successor title:**

**\[Move / Physical Realization + Qualification\] Tri-axial coordination core — canonical BRAIN vertical slice + reconstitution proof**

### Move outcome

Implement and qualify one bounded, non-destructive or recoverably bounded vertical slice of the ECO-189 architecture against the actual canonical ECB v2 BRAIN and one real consumer.

The Move must discover the current physical substrate before mutation and derive the minimum physical design from this Shape rather than assuming schema from the document.

### Mandatory pre-mutation gate

1. live-read ECO-189 and accepted ECO-188;
2. identify and independently verify the actual canonical BRAIN / current primary and current access path;
3. reconcile the current canonical database/runtime state with repository receipts;
4. recover current Artifact/Referent/Claim/Event/ordinary-operation capabilities and reuse them where sufficient;
5. inspect the actual intended consumer and its runtime/adapter affordances;
6. identify exact rollback/recovery boundary;
7. classify every proposed new mechanism by the ECO-189 responsibility it serves;
8. stop if the current canonical BRAIN cannot be safely reached or if a hidden second source of governing truth is required.

### Required physical behavior

At minimum:

* canonical custody of the tri-axial governing constituents for one live episode/use;
* a derived progressive coordination projection;
* exact source/currentness recovery;
* stable operation identity for consequential canonical writes;
* a typed external-reliance record for one real external dependency;
* localized stale/requalification behavior after one material change;
* canonical custody of the exact realization artifact(s) needed for reconstruction;
* real consumer recovery/use;
* one reconstitution exercise in which GitHub/Linear are unavailable as sources of governing content.

### Required controls

* correct cold recovery;
* wrong/newest external projection does not override canonical current;
* PGO change localizes impact;
* SSMM transition does not confer authority;
* newly consequential Referent can enter without focal substitution;
* stale external dependency fences the dependent current claim;
* raw trace deletion does not erase a sufficiently receipted proposition;
* missing secret blocks effect without semantic loss;
* restart/retry preserves operation identity;
* reconstruction from canonical custody reproduces the accepted realization;
* disconnected consumer does not count as installed.

### Containment

Do not broaden to:

* generalized planner/executor;
* universal workflow engine;
* full Linear/GitHub mirroring;
* raw telemetry warehouse;
* provider migration;
* universal secret manager;
* wholesale schema for all future URG/PGO/SSMM semantics.

### Move stop

Stop after physical implementation + qualification of the bounded vertical slice and return:

* physical allocation;
* exact canonical delta;
* consumer binding;
* qualification evidence;
* reconstitution evidence;
* failures/repairs;
* residuals;
* recommendation for actual production installation/cutover if not already within separately authorized scope.

No production cutover is authorized merely by this Shape.

---

## 18. FACT / Shape decision / unresolved

### FACT carried into Shape

* tri-axial orchestration basis is accepted at its seat;
* installation is consumer/use/environment relative;
* current architecture distinguishes semantic obligation from realization carrier;
* current greenfield design already says the deployment door is not the BRAIN;
* current connected operator surface cannot see the historically identified canonical v2 project;
* external vendor affordances now include durable execution, trace, eventing, routing, isolation and scoped credentials.

### Shape decisions

* one canonical BRAIN = one authoritative ECOS state/reconstitution lineage;
* physical replicas/backups are permitted under one authority lineage;
* external reality remains external;
* “no external-only decision-bearing state” is refined to **no external-only governing commitment + canonical revalidatable external reliance**;
* accepted required realization content must be under canonical custody, not GitHub-only;
* tri-axial coordination is a derived projection over independently standing constituents;
* change propagation is dependency-local by default;
* raw telemetry is not semantic ontology;
* secrets remain outside ordinary semantic BRAIN content;
* bootstrap root is permitted but non-semantic;
* ECO-187 is superseded as a commission, with useful obligations inherited.

### Unresolved for Move/physical design

* exact schema/storage representation;
* exact artifact-bundle mechanism;
* exact current canonical BRAIN access repair;
* exact consumer host;
* exact eventing/push/pull mechanism;
* exact trace-retention technology;
* exact runtime/model provider;
* exact secret broker;
* whether production installation can safely follow in the same execution episode or requires a separate Move.

---

## 19. Shape stopping rule

Shape is complete when an implementation worker can derive a physical vertical slice without inventing:

* the source-of-truth boundary;
* canonicalization frontier;
* external-reality semantics;
* tri-axial constituent contract;
* realization traceability;
* semantic/structural division;
* requalification behavior;
* reconstitution package;
* acceptance/falsification surface.

That condition is met.

ECO-189 **Shape: PASS / COMPLETE FOR PRINCIPAL REVIEW.**

Stop before Move execution.
