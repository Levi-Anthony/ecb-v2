STATUS: ACTIVE  
DISPOSITION: APERTURE  
ROLE: Explicitly governed unknowns  
AUTHORITY: None as answers; authoritative as a record that these questions remain open

# Open Architectural Apertures

An aperture is not a TODO list.

It records a distinction that has been encountered but is intentionally unresolved.

Each aperture must state why remaining open is currently safer or cheaper than premature closure.

## AP-01 — Controlled standing vocabulary

**WHAT**  
Exact enum values for claim kind, evidentiary basis, epistemic standing, governance standing, and action standing.

**WHY OPEN**  
The dimensional separation is architecturally required. The exact vocabulary has not yet been exercised enough by real v2 records to justify freezing it.

**CURRENT EFFECT**  
Does not block BUILDS 0–2. BUILD 3 must resolve the minimum vocabulary required by its golden trace.

**TRIGGER**  
BUILD 3 requires persisted standing fields or validation rules.

**ROUTE**  
Build 3 Shape → propose minimum vocabulary → test against worked traces → ADR if consequential.

## AP-02 — Stable evidence interface

**WHAT**  
Exact guarantees Layer A supplies to governance for evidence identity, version/hash, locator, retention, and mutation behavior.

**WHY OPEN**  
The contract is clear that governance requires stable evidence. The clean v2 Open Brain substrate has not yet been built and observed.

**CURRENT EFFECT**  
BUILD 0 may proceed.

**TRIGGER**  
BUILD 3 attempts to create the first evidence link.

**ROUTE**  
Derive the minimum interface from actual BUILD 0/1 behavior rather than importing v1 assumptions.

## AP-03 — Semantic-evaluation schema

**WHAT**  
Exact payload and lifecycle for typed semantic evaluations used by consequential transition policies.

**WHY OPEN**  
The architectural requirement is settled. No early build yet needs a consequential semantic transition.

**CURRENT EFFECT**  
Does not block BUILDS 0–4.

**TRIGGER**  
BUILD 5 or later introduces a transition that cannot be decided structurally.

**ROUTE**  
Specify only the evaluation types required by that transition.

## AP-04 — Enforcement-policy payload

**WHAT**  
Exact schema for transition policies describing structural, semantic, authority, and observational enforcement.

**WHY OPEN**  
The enforcement classification is ratified. The concrete transition set is not yet instantiated.

**CURRENT EFFECT**  
Does not block evidence-layer work.

**TRIGGER**  
First consequential governance transition.

**ROUTE**  
BUILD 5/6 contract extraction.

## AP-05 — Kernel packet physicalization

**WHAT**  
Whether propagation packets remain generic artifacts or earn a dedicated physical representation.

**WHY OPEN**  
No propagation workload exists yet in v2. Premature table creation would violate structure-is-earned.

**CURRENT EFFECT**  
No block through BUILD 9.

**TRIGGER**  
BUILD 10 demonstrates generic artifact representation creates integrity, lifecycle, query, or transaction pressure.

**ROUTE**  
Schema-promotion ADR.

## AP-06 — Bounded Infinity formal status

**WHAT**  
Whether Bounded Infinity is ultimately primitive, generative constraint, explanatory compression, or something else.

**WHY OPEN**  
Its current phenotype is operationally represented through Master Key, Aperture, and Revalidation. Further metaphysical/formal resolution does not alter current build behavior.

**CURRENT EFFECT**  
No block.

**TRIGGER**  
A real vertical slice cannot preserve bounded local closure plus legitimate reopening using the current mechanisms.

**ROUTE**  
Upstream architecture Shape.

## AP-07 — Full relation ontology

**WHAT**  
Complete set/hierarchy of relation predicates.

**WHY OPEN**  
The system has not earned a universal relation taxonomy.

**CURRENT EFFECT**  
BUILD 4 may introduce only predicates required by its worked trace.

**TRIGGER**  
Repeated ambiguity, integrity failures, or cross-domain reuse demonstrates a higher-order relation grammar is needed.

**ROUTE**  
Relation-schema ADR.

## AP-08 — Final human UI

**WHAT**  
Persistent dashboard/interface architecture.

**WHY OPEN**  
Views have not yet stabilized through repeated use.

**CURRENT EFFECT**  
Query-generated views are sufficient.

**TRIGGER**  
Repeated human use demonstrates a stable view deserves persistent interface affordance.

**ROUTE**  
Separate UI Shape.

## AP-09 — BUILD 0 physical substrate activation

**WHAT**

The exact deployed runtime, canonical vector-capable database integration, embedding route, model identity, and vector dimension for BUILD 0.

**WHY OPEN**

OB1 demonstrates the behavior with Supabase Postgres/pgvector, and the human selected Supabase as the canonical BUILD 0 substrate without inheriting OB1's schema or adjacent services. A previously provisioned Neon resource is preserved but disconnected. Supabase provisioning is pending one-time Marketplace terms acceptance. The embedding route and independently verified vector dimension remain unresolved.

**CURRENT EFFECT**

The provider-independent BUILD 0 contract, MCP surface, persistence minimum, enforcement surfaces, and Golden Trace execution are shaped in `/BUILD_CHECKOUT.md`. Do not write a migration or runtime implementation until this aperture is resolved; doing so would silently select new persistent architecture.

**TRIGGER**

The Supabase resource is provisioned and the human authorizes an embedding execution route that can be tested without exposing credentials.

**ROUTE**

Accept Supabase Marketplace terms → provision and connect the free `sfo1` resource → verify pgvector availability without changing schema → enable an authorized embedding route without exposing credentials → verify model identity and dimension through a live call → close the human-door deployment choice → record the physical choices and reopening conditions in ADRs → enable pgvector through the first governed migration → begin BUILD 0 implementation.

## AP-10 — Formal semantics of bounded action abstraction

**WHAT**

Whether action-envelope compilation can be formalized using operational equivalence, abstract interpretation, and eventually a Galois-style abstraction/concretization relation.

**WHY OPEN**

The conceptual correspondence is strong, especially the pairing of an over-approximation of possible concrete states with an under-approximation of legitimately permitted actions. Functioning ECB v2 envelope specimens do not yet exist, and meaningful partial orders and soundness relations have not been derived from observed behavior.

**CURRENT EFFECT**

No block on BUILDS 0–7. Operational equivalence, robust-action soundness, semantic normalization stability, and commuting preservation checks may be used as reasoning machinery and candidate test generators. They do not become governing invariants or frozen acceptance tests merely by appearing in a probe.

**TRIGGER**

Automated envelope compilation, or a build failure, requires a formal answer to whether a lossy abstraction still safely licenses an action.

**ROUTE**

Use the formal-semantics research pipeline → derive semantics from actual envelope specimens → test operational equivalence and robust-action soundness first → introduce a Galois connection, categorical structure, or metric only if it adds discriminating power → route any closure through a frozen acceptance test, ADR, or explicit human authorization as appropriate.

## AP-11 — Human-door deployment

**WHAT**

Whether BUILD 0's single remote MCP human door is deployed as a Supabase Edge Function beside the canonical database or as a Vercel Fluid Function connected to Supabase.

**WHY OPEN**

OB1 demonstrates the Supabase Edge Function path. Vercel provides a full Node.js runtime, GitHub-native deployment, and longer general function duration. The governing behavior does not require one host, and current MCP client authentication/transport behavior has not yet been tested against both candidates.

**CURRENT EFFECT**

Supabase may be provisioned and the provider-independent tool, schema, and test contracts may be refined. Do not deploy two doors or designate either candidate current before the decision is closed. The canonical Supabase database remains the same under either choice.

**TRIGGER**

Before the first remote MCP endpoint is implemented or deployed for Golden Trace 01.

**ROUTE**

Use `/docs/deployment-shapes/human-door.md` → identify the first required AI client → test or resolve its transport and technical access-control requirements → compare operational limits and secret boundaries → record one selected door and reopening condition in an ADR → deploy exactly one current endpoint.

## Aperture rule

If a build discovers a new consequential unknown:

1. determine whether the current Build Unit can proceed without resolving it;
2. if yes, register an aperture with WHAT / WHY OPEN / CURRENT EFFECT / TRIGGER / ROUTE;
3. if no, resolve only enough to restore the current Build Unit;
4. do not broaden into unrelated architecture.
