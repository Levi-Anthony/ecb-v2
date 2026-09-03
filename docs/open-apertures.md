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

OB1 demonstrates the behavior with Postgres/pgvector and multiple provider combinations, but those implementations are lineage evidence rather than inherited architecture. During the 2026-09-03 Sense pass, the Vercel CLI had no authenticated session and live integration discovery stopped at the device-login gate. No database or embedding credentials were locally available, and no viable local embedding runtime was installed.

**CURRENT EFFECT**

The provider-independent BUILD 0 contract, MCP surface, persistence minimum, enforcement surfaces, and Golden Trace execution are shaped in `/BUILD_CHECKOUT.md`. Do not write a migration or runtime implementation until this aperture is resolved; doing so would silently select new persistent architecture.

**TRIGGER**

A Vercel CLI session is authenticated, or the human explicitly selects a non-Vercel execution substrate.

**ROUTE**

Revalidate the environment → run live integration discovery → select one canonical vector-capable store and one embedding model → verify vector dimension → record the physical choice and reopening condition in an ADR → provision the real services → pull environment variables → begin BUILD 0 implementation.

## Aperture rule

If a build discovers a new consequential unknown:

1. determine whether the current Build Unit can proceed without resolving it;
2. if yes, register an aperture with WHAT / WHY OPEN / CURRENT EFFECT / TRIGGER / ROUTE;
3. if no, resolve only enough to restore the current Build Unit;
4. do not broaden into unrelated architecture.
