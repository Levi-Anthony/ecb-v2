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

## AP-09 — BUILD 0 physical substrate activation — CLOSED 2026-09-03

**WHAT**

The exact deployed runtime, canonical vector-capable database integration, embedding route, model identity, and vector dimension for BUILD 0.

**CLOSURE EVIDENCE**

Supabase project `ecb-v2-brain` (`vezxivrvhakclxuvxzso`) is provisioned and connected. A deployed probe verified native `gte-small` output as 384 finite normalized values. ADR-001 selects the Codex/Supabase Edge Function door and bearer boundary; ADR-002 records the combined physical substrate. The probe was deleted, the governed migrations installed pgvector plus the canonical table and similarity function, and Golden Trace 01 passed through the deployed runtime without triggering reopening.

**CURRENT EFFECT**

BUILD 0 runtime implementation is authorized only within ADR-001, ADR-002, and `/BUILD_CHECKOUT.md`. No additional store, model, door, persistent field, or tool is licensed.

**REOPENING TRIGGER**

Golden Trace 01 cannot pass using the selected store, runtime, model, dimension, or bearer boundary.

**ROUTE**

Identify the exact failed physical assumption → reopen ADR-001 or ADR-002 only as narrowly as required → preserve one canonical brain and one current door.

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

## AP-11 — Human-door deployment — CLOSED 2026-09-03

**WHAT**

Whether BUILD 0's single remote MCP human door is deployed as a Supabase Edge Function beside the canonical database or as a Vercel Fluid Function connected to Supabase.

**CLOSURE EVIDENCE**

The human accepted ADR-001: Codex is the first client, one Supabase Edge Function is the current door, a shared bearer key is the BUILD 0 technical boundary, and Vercel billing is out of scope. Codex's installed client supports Streamable HTTP with a bearer token sourced from an environment variable.

**CURRENT EFFECT**

The selected Supabase door is deployed and passed Golden Trace 01. Vercel Fluid Functions remain a compatibility fallback, not a co-equal endpoint. Do not add a second door during post-BUILD-0 metabolization.

**REOPENING TRIGGER**

An ADR-001 reopening condition is observed during the minimum client experiment or Golden Trace 01.

**ROUTE**

Record the concrete failure → test Vercel Fluid Functions as the first fallback → amend or supersede ADR-001 through the human route → keep exactly one current endpoint.

## Aperture rule

If a build discovers a new consequential unknown:

1. determine whether the current Build Unit can proceed without resolving it;
2. if yes, register an aperture with WHAT / WHY OPEN / CURRENT EFFECT / TRIGGER / ROUTE;
3. if no, resolve only enough to restore the current Build Unit;
4. do not broaden into unrelated architecture.
