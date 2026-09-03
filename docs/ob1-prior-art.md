STATUS: COMPLETE — REVALIDATE WHEN CANONICAL OB1 HEAD CHANGES  
DISPOSITION: EVIDENCE  
GOVERNING: NO  
ROLE: Canonical OB1 prior-art matrix and pre-build recon receipt  
AUTHORITY: Does not override the ECB v2 Build Contract, frozen invariants, or active Build Unit

# OB1 Prior-Art Recon

This document closes the mandatory mine-first recon for BUILD 0.

Prior art is evidence, not architectural authority. A finding below may simplify an implementation plan. It may not amend an ECB invariant, replace the current Build Master Key, import ontology by precedent, expand BUILD 0, or turn upstream recency into standing.

## Canonical upstream state

| Field | Inspected value |
|---|---|
| Repository | [NateBJones-Projects/OB1](https://github.com/NateBJones-Projects/OB1) |
| Repository URL | `https://github.com/NateBJones-Projects/OB1.git` |
| Branch | `main` |
| Commit | [`9543c29a3e44a210ce278392b9fac11248997461`](https://github.com/NateBJones-Projects/OB1/commit/9543c29a3e44a210ce278392b9fac11248997461) |
| Commit subject | `[docs] Refresh README recent contributions after backlog merge day` |
| Inspection date | 2026-09-03 |

All file references and behavioral claims in this receipt refer to that commit. Remembered OB1 behavior and earlier ECOS summaries were not used as substitutes for repository inspection.

## Outcome first

Canonical OB1 already proves the Layer A mechanics ECB needs: one Supabase/Postgres thought store, durable UUID identity, pgvector embeddings, cosine retrieval, MCP access across clients, service-role isolation, and content-fingerprint deduplication.

It does not provide the BUILD 0 transaction boundary unchanged. Core capture performs a deduplicating thought upsert and then attaches the embedding in a second write. The first write can survive a failed second write, and the successful MCP response does not expose the UUID produced by the upsert. ECB must preserve the behavior and reimplement that boundary so a successful capture means one complete canonical row and returns its durable identity.

OB1's richer provenance, review, lifecycle, audit, graph, entity, and typed-edge capabilities are predominantly sidecar schemas, integrations, or community contributions. They contain useful patterns for later Builds. They are not the OB1 core and must not leak into BUILD 0.

**CURRENT BUILD DISPOSITION: RESUME BUILD 0 WITH SIMPLIFIED PLAN**

## Repository-wide inventory

“Read in full” means the relevant textual files named in the coverage receipt were read end to end. “Inspected / inventoried” means the whole surface was enumerated and searched, with plausible prior art deep-read. It does not claim that every unrelated implementation file was opened.

| Major surface | Classification | Top-level purpose and recon decision |
|---|---|---|
| Root `README.md` | READ IN FULL | Declares the Open Brain core, contribution taxonomy, setup path, and repository map. |
| `AGENTS.md` | READ IN FULL | Declares contributor workflow and repo operating expectations; no ECB architectural standing. |
| `CONTRIBUTING.md` | READ IN FULL | Distinguishes core changes from extensions, primitives, recipes, schemas, integrations, skills, and dashboards. |
| `server/` | READ IN FULL | Canonical MCP server and stateless smoke harness; load-bearing lineage for BUILD 0. |
| `schemas/` | INSPECTED / INVENTORIED | All schema packages inventoried and searched; all named ECB-overlap schemas deep-read. Optional sidecars, not a single OB1 architecture. |
| `primitives/` | READ IN FULL | Curated reusable patterns for remote/shared MCP, RLS, Edge deployment, and troubleshooting. |
| `integrations/` | INSPECTED / INVENTORIED | All integrations inventoried and searched; Agent Memory, enhanced MCP, update, delete, and consolidation overlap deep-read. |
| `extensions/` | INSPECTED / INVENTORIED | Curated domain applications. No extension was load-bearing for the active evidence-substrate seam. |
| `recipes/` | INSPECTED / INVENTORIED | All recipes inventoried and searched; provenance, graph, routing, source, dedup, authorship, typed-edge, and enrichment overlaps deep-read. |
| `skills/` | INSPECTED / INVENTORIED | Agent behavior packs. Agent Memory and write/update/delete behavior was traced where relevant; skills are not persistence substrate. |
| `dashboards/` | INSPECTED / INVENTORIED | Front-end and review surfaces. Implementations were not deep-read because BUILD 0 explicitly excludes dashboards. |
| `docs/` | INSPECTED / INVENTORIED | Setup schema/deployment, safe Agent Memory provenance, and storage portability were deep-read; unrelated walkthroughs and drafts were inventoried/searchable quarry. |

## Load-bearing OB1 kernel

| Concern | Behavior OB1 actually provides | Implementation inspected | Design pressure | ECB v2 relevance |
|---|---|---|---|---|
| Thought persistence | Stores one text thought with metadata, timestamps, optional embedding, and UUID identity. | `docs/01-getting-started.md`; `public.thoughts` | Durable shared memory rather than per-client memory. | Direct Layer A lineage. Adapt the table boundary. |
| Base thought schema | UUID primary key, non-null content, `vector(1536)`, JSONB metadata, created/updated timestamps, indexes, updated trigger. | `docs/01-getting-started.md` | Small searchable canonical record. | Keep UUID/content/vector/timestamp behavior; use explicit source/model fields and a non-null complete-row contract. |
| Embeddings | Uses OpenRouter `openai/text-embedding-3-small`; capture and search use the same helper. | `server/index.ts` | Comparable vectors for semantic recall. | Reuse the model-space principle; independently verify provider, model, and dimension at activation. |
| Semantic retrieval | PostgreSQL RPC computes cosine similarity, thresholding, ranking, count, and optional JSONB containment filter. | `match_thoughts` in `docs/01-getting-started.md` | Server-side meaning-ranked recall over the canonical store. | Adapt the RPC and return BUILD 0's explicit fields. |
| Capture | Embeds and extracts metadata in parallel, calls `upsert_thought`, then patches the embedding. | `capture_thought` in `server/index.ts` | Preserve content quickly while enriching and deduplicating. | Preserve capture behavior, but reimplement the transaction boundary; omit LLM metadata extraction. |
| Fetch / get | `fetch` reads one row by UUID and returns full text, metadata, and timestamps. | `fetch` tool in `server/index.ts` | Recover exact durable evidence after search. | Adapt directly; make not-found explicit. |
| List / recent | `list_thoughts` reads newest rows with optional metadata filters; it does not return IDs. | `list_thoughts` in `server/index.ts` | Browsing and review convenience. | Real behavior, but excluded from BUILD 0. |
| MCP transport and registration | Hono hosts the MCP SDK's stateless Streamable HTTP transport; tools register per request; exact `search` and `fetch` provide ChatGPT compatibility. | `server/index.ts`; `server/test-stateless.mjs`; `primitives/remote-mcp/README.md` | Cross-client interoperability without server session state. | Adapt server/transport/tool patterns. Keep only capture, search, and fetch. |
| Authentication / access | A shared brain key is accepted in `x-brain-key` or the query string; database access uses service role behind RLS. Unauthorized MCP requests return a JSON-RPC error with HTTP 200 for client compatibility. | `server/index.ts`; `primitives/rls/README.md`; `primitives/shared-mcp/README.md` | Protect privileged store access while accommodating strict MCP clients. | Adapt header authentication and service-role isolation; do not put secrets in URLs. Re-test status semantics against actual clients. |
| Source / provenance metadata | Core capture writes fixed metadata `source = mcp`; other recipes put source and provenance in metadata or sidecars. | `server/index.ts`; source-filtering and provenance recipes | Explain where a memory originated. | BUILD 0 requires caller-supplied non-empty source and captured time on the canonical row. |
| Error behavior | Tool errors generally return MCP `isError`; capture can leave a persisted unembedded row after returning an embedding-update failure. The stateless smoke test's 401 expectation no longer matches the core handler's JSON-RPC 200 behavior. | `server/index.ts`; `server/test-stateless.mjs` | Make failures visible without breaking MCP negotiation. | Reimplement atomic capture and keep tests synchronized with transport behavior. |
| Deployment | Core server is deployed as a Supabase Edge Function with `--no-verify-jwt`; shared secret protects MCP and service role protects database access. | `docs/01-getting-started.md`; `primitives/deploy-edge-function/README.md` | One remotely reachable MCP endpoint adjacent to the store. | Supabase is selected for storage. The human-door runtime remains a separate ADR choice. |
| Deduplication / identity safeguards | Normalized content SHA-256 plus unique index and `upsert_thought` merges metadata. A recipe adds a trigger so raw writes cannot bypass fingerprinting. | Setup SQL; `recipes/content-fingerprint-dedup/` | Prevent duplicate records across retrying clients and write paths. | Proven mechanism, but “same normalized text means same identity” is a policy. Defer unless BUILD 0's retry behavior requires it. |
| Update / deletion | Core has no tool. Optional integrations update by UUID with re-embedding and optional timestamp precondition, or hard-delete by UUID. | `integrations/update-thought-mcp/`; `integrations/delete-thought-mcp/` | Correct or remove durable memory deliberately. | Excluded from BUILD 0. Optimistic check/update is not atomic; hard delete conflicts with later history needs if adopted blindly. |

## OB1 prior-art matrix

Coverage is restricted to `FULL`, `PARTIAL`, `PATTERN`, `NONE FOUND`, or `CONFLICT`. Disposition is restricted to `REUSE`, `ADAPT`, `REIMPLEMENT BEHAVIOR`, `QUARRY`, `DEFER`, or `REJECT`.

| ECB need / pressure | OB1 location | Precedent class | OB1 behavior | Coverage | Disposition | Why |
|---|---|---|---|---|---|---|
| One shared durable thought store | `thoughts` setup schema | CORE / LINEAGE | One Postgres relation is shared through remote MCP. | FULL | ADAPT | Preserve the single-brain behavior; tighten fields and completeness constraints. |
| Durable thought identity | `thoughts.id`; `search`; `fetch` | CORE / LINEAGE | Database-generated UUID persists across retrieval. | FULL | ADAPT | Correct identity mechanism; core capture must expose the produced UUID. |
| Semantic embedding | `server/index.ts` | CORE / LINEAGE | Same embedding helper supports capture and search. | FULL | ADAPT | Verify current provider/model/dimension and persist model identity. |
| Meaning-ranked retrieval | `match_thoughts` RPC | CORE / LINEAGE | Cosine search with threshold and limit executes in Postgres. | FULL | ADAPT | Proven direct pattern; narrow return shape to BUILD 0. |
| Cross-context interface | core MCP server; remote-MCP primitive | CORE / LINEAGE | Streamable HTTP MCP exposes canonical memory across clients. | FULL | ADAPT | Matches Golden Trace 01's boundary. |
| Atomic complete capture | `capture_thought` in `server/index.ts` | CORE / LINEAGE | Thought upsert and embedding patch are two writes. | CONFLICT | REIMPLEMENT BEHAVIOR | A failed patch may leave a row while capture reports failure. ECB requires embed-before-insert complete-row semantics. |
| Explicit source at capture | core metadata; source-filtering recipe | CORE / LINEAGE plus COMMUNITY PRIOR ART | Core fixes source to `mcp`; recipes classify or backfill metadata source. | PARTIAL | ADAPT | Make source a validated capture input and canonical field rather than inferred enrichment. |
| Stable capture timestamp | thought timestamps | CORE / LINEAGE | Database creates timestamps; tools expose them inconsistently. | PARTIAL | ADAPT | Preserve timezone-aware DB time and return it consistently. |
| Authentication boundary | core auth; RLS primitive | CORE / LINEAGE plus OFFICIAL REUSABLE PRIMITIVE | Shared MCP secret fronts service-role database access. | FULL | ADAPT | Keep server-side privilege and RLS; use header-only secret transport and constant-time comparison where available. |
| Stateless transport compatibility | core server; stateless smoke | CORE / LINEAGE | Per-request server/transport, no MCP session persistence, Accept-header compatibility. | FULL | ADAPT | Proven compatibility surface; reconcile stale unauthorized-response assertions. |
| Retry/dedup safeguard | setup fingerprint SQL; content-fingerprint recipe | CORE / LINEAGE plus COMMUNITY PRIOR ART | Canonicalized SHA-256 makes content upsert idempotent; trigger closes bypass paths. | PATTERN | DEFER | Identity-by-normalized-content is stronger than BUILD 0 currently licenses. Reopen only for retry semantics. |
| Thought evidence substrate | base `thoughts` table | CORE / LINEAGE | Stores content, embedding, timestamps, and metadata as retrievable memory. | FULL | ADAPT | This is the Layer A ancestor; do not add promotion semantics. |
| Runtime-neutral recall/writeback | Agent Memory API and portability doc | SCHEMA / INTEGRATION | Stable JSON contracts separate runtimes from Postgres storage and add recall/writeback/review. | PATTERN | DEFER | Contract/adapter split is valuable later; BUILD 0 needs only MCP capture/search/fetch. |
| Evidence versus instruction | Agent Memory schema, API, safe-provenance doc | SCHEMA / INTEGRATION | Agent-generated memory defaults to evidence; confirmed/imported memory may become instruction-grade. | PARTIAL | QUARRY | Strong pressure match, but its enums and booleans do not constitute ECB's full standing/warrant model. |
| Review and standing | Agent Memory tables and API | SCHEMA / INTEGRATION | Review status/actions, provenance status, lifecycle, scope, and use-policy flags constrain recall. | PARTIAL | DEFER | Reuse pressure and review patterns in later Builds; do not collapse ECB standing into one status bundle. |
| Recall traces | Agent Memory `recall_traces` / `recall_items` | SCHEMA / INTEGRATION | Records request, candidates, selected/ignored memories, and use. | FULL | DEFER | Direct prior art for later observability, outside BUILD 0. |
| Source references | Agent Memory `memory_source_refs` | SCHEMA / INTEGRATION | Links memories to external sources with locators and metadata. | PARTIAL | DEFER | Useful Evidence Link precursor, but tied to memory rather than a general claim/evidence model. |
| Artifact references | Agent Memory `memory_artifacts` | SCHEMA / INTEGRATION | Stores artifact type, URI, label, hash, and metadata beside memory. | PARTIAL | DEFER | Covers artifact pointers, not ECB's full Artifact standing or lifecycle. |
| Memory relations | Agent Memory `memory_relations` | SCHEMA / INTEGRATION | Typed links between memory rows. | PARTIAL | DEFER | Useful relation pattern; not a universal referent relation or governing claim. |
| Append-only audit history | thought-audit schema | SCHEMA / INTEGRATION | Stores capture/update/delete audit rows without an FK so deletion does not erase history. | PATTERN | QUARRY | Append-only/no-FK pattern matters; caller-wired fire-and-forget writes cannot be ECB Event authority. |
| Event as reconstructible consequential transition | thought-audit; Agent Memory audit | SCHEMA / INTEGRATION | Audit writes are separate from underlying changes and may be best-effort or incompletely checked. | CONFLICT | REJECT | Direct reuse could acknowledge state without a durable matching event. |
| Derivation provenance | provenance-chains schema/recipe | COMMUNITY PRIOR ART | `derived_from`, method/layer, supersession, recursive trace, and derivative lookup. | PARTIAL | QUARRY | Preserves important derivation pressure; JSONB references and mirrored writes lack one enforced source of truth. |
| Evidence Link | provenance chains; source refs; thought-entity mentions | COMMUNITY PRIOR ART plus SCHEMA / INTEGRATION | Several local link types connect memory to sources, ancestors, or entity mentions. | PARTIAL | DEFER | Composition is possible later, but no one link preserves ECB evidence-to-claim semantics. |
| Stable entity identity | entity-extraction schema | COMMUNITY PRIOR ART | Canonical entity rows deduplicate by type and normalized name; mentions link thoughts to entities. | PARTIAL | QUARRY | Demonstrates local entity resolution; not a universal Referent and extracted identity remains fallible. |
| Actor identity distinct from credential | per-agent-identity schema | COMMUNITY PRIOR ART | Stable canonical agent ID survives key rotation/revocation; payload identity is only a hint. | FULL | DEFER | Excellent later identity pattern, but solves actor authentication rather than general referent identity. |
| Referent | entity extraction; OB-Graph nodes; per-agent identity | COMMUNITY PRIOR ART | Multiple domain-specific IDs represent entities, graph nodes, or agents. | PARTIAL | REIMPLEMENT BEHAVIOR | ECB needs one identity abstraction without making any one domain table universal by precedent. |
| Claim / assertion | typed reasoning edges; Agent Memory content; thought work claims | COMMUNITY PRIOR ART plus SCHEMA / INTEGRATION | Relations and memories may contain or imply assertions. Thought work claims are exclusive processing leases, not propositions. No dedicated claim object separates proposition from evidence. | NONE FOUND | DEFER | Deliberate search distinguished the operational namesake and found no sufficient semantic Claim structure; do not invent it in BUILD 0. |
| Typed thought relations | typed-reasoning-edges schema/classifier | COMMUNITY PRIOR ART | LLM classifies supports/contradicts/evolved/supersedes/depends/related with confidence and version. | PARTIAL | QUARRY | Good classification/evaluation pattern; model output is not governing truth. |
| One relation truth store | typed edges plus provenance `supersedes` | COMMUNITY PRIOR ART | Same supersession can live in an edge and a thought column; optional best-effort mirroring can drift. | CONFLICT | REJECT | Confirms ECB's invariant against competing relation truth stores. |
| General entity graph | `recipes/ob-graph/` | COMMUNITY PRIOR ART | UUID nodes, typed weighted edges, traversal, and shortest paths; nodes may link to thoughts. | PATTERN | DEFER | Proven graph mechanics; labels and edges are user-scoped mutable data, not governing referents/claims. |
| Parallel pipeline work coordination | `schemas/thought-work-claims/` | COMMUNITY PRIOR ART | Composite-key claims atomically assign a thought/work type to one worker; TTL reaping and terminal release handle failure and completion. | FULL | DEFER | Strong reusable pattern for later enrichment/evaluation pipelines; it coordinates work and does not represent an ECB proposition Claim. |
| Authorship attribution | `recipes/authorship-edges/` | COMMUNITY PRIOR ART | Deterministic self/other/mixed/machine/unknown attribution, atomic insert stamping, deferred named-other resolution. | PATTERN | QUARRY | Useful provenance and ambiguity discipline for later Builds. |
| Schema-aware routing | `recipes/schema-aware-routing/` | COMMUNITY PRIOR ART | Persists a raw thought, then conditionally writes structured domain records; fuzzy identity asks for confirmation. | PATTERN | DEFER | “Raw evidence first” is conformal; multi-write routing and placeholder functions are not BUILD 0 substrate. |
| Generated/derived thought enrichment | `recipes/thought-enrichment/`; enhanced schema | COMMUNITY PRIOR ART | LLM/regex backfills classification, summaries, source type, sensitivity, confidence, and enrichment provenance. | PATTERN | DEFER | Useful pipeline precedent; generated labels need review and must not become capture-time truth. |
| Import without promotion | Agent Memory writeback/import rules; import recipes | SCHEMA / INTEGRATION plus EXPERIMENT / WORKFLOW | Trusted import can be instruction-grade; generated/imported content otherwise remains labeled memory. | PARTIAL | QUARRY | Evidence-first rule is useful, but trusted import must not automatically manufacture ECB standing. |
| Supersession / stale lifecycle | Agent Memory lifecycle; provenance/typed edges | SCHEMA / INTEGRATION plus COMMUNITY PRIOR ART | Active/stale/superseded/disputed/rejected states and directed supersession links exist. | PARTIAL | DEFER | Multiple mechanisms expose useful pressure and source-of-truth hazards; later design must keep dimensions separate. |
| General warrant | repository-wide problem search | None found | No general object links a claim, authority basis, scope, and permission to act. | NONE FOUND | DEFER | Apparently novel ECB requirement; explicitly excluded from BUILD 0. |
| Architectural authority | repository-wide problem search | None found | “Authority” appears as ordinary prose or database authority, not ECB governance standing. | NONE FOUND | DEFER | Apparently novel ECB distinction; OB1 prior art cannot supply it by analogy. |

## Correspondence analysis

This section tests pressure correspondence. Similar names do not establish equivalent semantics, and different names do not establish novelty.

### Planned v2 primitives

| Planned concept | Existing OB1 pressure-solver | Actual purpose and guarantee | Duplication risk | Required ECB distinction still absent | Extension/composition path |
|---|---|---|---|---|---|
| Thought evidence substrate | Core `thoughts` plus capture/search/fetch | Persist and semantically recover shared text memory with UUID identity. | Rebuilding UUID/vector/RPC/MCP mechanics from scratch. | Atomic complete-row capture; explicit source/model; evidence-only standing. | Adapt core mechanics and reimplement capture boundary. |
| Referent | Canonical entities, graph nodes, canonical agent IDs | Give stable identity inside a particular entity, graph, or actor domain. | Creating another domain-specific identity table without learning from normalization and key rotation. | One referent identity that does not collapse actor, entity, artifact, or proposition semantics. | Compose later through explicit typed mappings; do not promote an OB1 sidecar now. |
| Claim | Typed edges, memory content, and `thought-work-claims` | Store relation classifications or memory statements; “work claims” exclusively lease processing work to a worker. | Recreating classification provenance/confidence or work-coordination machinery. | Proposition identity distinct from evidence, relation, review standing, and operational work leases. | Reuse classifier and work-claim patterns later; no sufficient proposition object exists to extend directly. |
| Evidence Link | Source refs, provenance chains, thought-entity mentions | Connect a memory to a source artifact, ancestor thought, or entity mention. | Parallel source/derivation/mention links with overlapping metadata. | Explicit claim-to-evidence semantics, direction, role, and admissibility. | Compose pressures into one later link contract; no BUILD 0 table. |
| Event | Thought audit and Agent Memory audit | Record operational capture/update/delete/review actions. | Rebuilding append-only history and deletion-surviving records. | Transactional coupling, consequential-transition coverage, actor/authority semantics, reconstructibility. | Quarry append-only/no-FK pattern; reimplement guarantees later. |
| Artifact | Agent Memory artifacts and source refs | Point from a memory to external output or source via URI/hash/metadata. | Rebuilding locator/hash conventions. | Artifact identity and standing independent of one memory row. | Extend/compose later behind a dedicated artifact contract. |

### Anticipated pressures

| Pressure | OB1 correspondence | What OB1 guarantees | What remains absent for ECB | Current disposition |
|---|---|---|---|---|
| Provenance | Core source metadata; provenance chains; Agent Memory source refs/status | Source labels, derivation paths, and provenance categories. | One non-collapsing model across evidence, claim, actor, and authority. | QUARRY now; design later. |
| Review / standing | Agent Memory review, provenance, lifecycle, and use flags | Human review can change future recall/use behavior. | Standing as a distinct dimension with explicit warrant and scope. | DEFER. |
| Semantic evaluation | Typed-edge classifier and enrichment pipelines | Model, confidence, version, rationale, dry run, and cost bound can accompany derived labels. | Separation of evaluation from truth, promotion, and authority. | QUARRY. |
| Identity resolution | Entity normalization; per-agent canonical IDs; fuzzy-routing confirmation | Deterministic normalization, credential separation, or human confirmation depending on domain. | Universal referent boundary and explicit identity claims. | QUARRY / DEFER. |
| Supersession | Lifecycle statuses, provenance pointer, typed edge | Can mark or link replacement and stale state. | One authoritative relation representation and transition semantics. | REJECT direct reuse; DEFER design. |
| Lifecycle | Agent Memory lifecycle and enhanced-thought status | Status controls recall and review behavior. | Separation among existence, currency, review, standing, and admissibility. | DEFER. |
| Recall traces | Agent Memory trace and trace-item tables | Records query, candidates, decisions, use, and writeback context. | Coupling to ECB event/standing semantics. | DEFER but likely reusable pattern. |

## Core, reusable, optional, and community precedent

The following lineage distinctions govern how much architectural weight a finding carries:

| Class | Findings in this recon | Lineage significance |
|---|---|---|
| CORE / LINEAGE | Base thought schema, OpenRouter embeddings, `match_thoughts`, core MCP server, capture/search/fetch/list/stats, shared key, core deployment | Load-bearing behavior ECB should preserve deliberately, without inheriting defects. |
| OFFICIAL REUSABLE PRIMITIVE | Remote MCP, shared MCP, RLS, Edge deployment, troubleshooting | Curated operational patterns used across OB1. Reusable mechanics, not ontology. |
| SCHEMA / INTEGRATION | Agent Memory, provenance-safe API, per-workflow writeback/review, update/delete MCP, thought audit | Optional additions to the core. They demonstrate solutions but do not redefine Open Brain's substrate. |
| COMMUNITY PRIOR ART | Provenance chains, entity extraction, per-agent identity, typed edges/classifier, OB-Graph, dedup trigger, routing, source filtering, authorship | Merged implementations that prove pressures and failure modes. Evidence strength varies; none governs ECB. |
| EXPERIMENT / WORKFLOW | Enrichment, imports, compilers, dashboards, domain recipes and skills | Quarry for operating patterns and later user surfaces, not substrate precedent. |

## BUILD 0 check

### Already solved upstream

BUILD 0 can reproduce these mechanics from canonical OB1 rather than derive them again:

- UUID primary keys generated by PostgreSQL;
- a single Supabase/Postgres canonical thought relation;
- pgvector storage and HNSW/cosine retrieval;
- one embedding model space for capture and query;
- server-side semantic search RPC;
- Streamable HTTP MCP tool registration and per-request stateless transport;
- exact `search` and `fetch` compatibility names;
- service-role database access behind RLS;
- explicit MCP error payloads and cross-client compatibility accommodations.

### Must deliberately differ

Even at Layer A, ECB v2 must not instantiate canonical OB1 unchanged:

- embed before inserting the canonical row so failure leaves no partial thought;
- return the durable UUID from `capture_thought`;
- require and persist caller-supplied `source` and a timezone-aware `captured_at`;
- persist `embedding_model` and enforce the verified vector dimension;
- omit capture-time LLM metadata extraction and the generic metadata bag;
- return durable ID and provenance fields consistently from search and fetch;
- distinguish an explicit not-found result from database/transport failure;
- keep secrets out of query strings and validate current MCP client behavior;
- keep the transport smoke harness synchronized with the real handler;
- retain only capture, search, and fetch in BUILD 0.

### Not relevant yet

These findings belong to later Builds and must not broaden BUILD 0:

- fingerprint identity policy and generalized retry deduplication;
- update, deletion, merge, stale, and supersession transitions;
- Agent Memory review, standing-like use policy, writeback, and recall traces;
- referents, entities, actors, claims, evidence links, relation claims, and graphs;
- audit/Event physicalization;
- artifact registry and external source-reference modeling;
- enrichment, classification, schema-aware routing, importers, compilers, dashboards, and domain extensions;
- generalized warrant, authority, governance, or promotion mechanisms.

### Build-plan delta

The Build Contract and Golden Trace do not change. The implementation plan becomes **simpler**:

1. Adapt OB1's proven Supabase schema, vector RPC, MCP transport, and fetch/search mechanics.
2. Reimplement only the capture boundary and narrowed row/tool shapes required by the current BUILD 0 contract.
3. Preserve later OB1 prior art in this evidence matrix rather than physicalizing it early.

No genuine architectural conflict blocks BUILD 0. The one core conflict—two-step capture—is an implementation boundary already constrained by the active checkout.

## Coverage receipt

### READ IN FULL

- `README.md`
- `AGENTS.md`
- `CONTRIBUTING.md`
- `server/index.ts`
- `server/test-stateless.mjs`
- `server/deno.json`
- `server/package.json`
- `schemas/agent-memory/README.md`
- `schemas/agent-memory/schema.sql`
- `schemas/provenance-chains/README.md`
- `schemas/provenance-chains/schema.sql`
- `schemas/entity-extraction/README.md`
- `schemas/entity-extraction/schema.sql`
- `schemas/per-agent-identity/README.md`
- `schemas/per-agent-identity/schema.sql`
- `schemas/typed-reasoning-edges/README.md`
- `schemas/typed-reasoning-edges/schema.sql`
- `schemas/enhanced-thoughts/README.md`
- `schemas/enhanced-thoughts/schema.sql`
- `schemas/thought-audit/README.md`
- `schemas/thought-audit/schema.sql`
- `schemas/thought-audit/author-session-id.sql`
- `schemas/thought-work-claims/README.md`
- `schemas/thought-work-claims/schema.sql`
- `integrations/agent-memory-api/README.md`
- `integrations/agent-memory-api/index.ts`
- `integrations/update-thought-mcp/README.md`
- `integrations/update-thought-mcp/index.ts`
- `integrations/delete-thought-mcp/README.md`
- `integrations/delete-thought-mcp/index.ts`
- `integrations/consolidation-workers/README.md`
- `primitives/remote-mcp/README.md`
- `primitives/shared-mcp/README.md`
- `primitives/rls/README.md`
- `primitives/deploy-edge-function/README.md`
- `primitives/troubleshooting/README.md`
- `recipes/provenance-chains/README.md`
- `recipes/schema-aware-routing/README.md`
- `recipes/source-filtering/README.md`
- `recipes/content-fingerprint-dedup/README.md`
- `recipes/authorship-edges/README.md`
- `recipes/authorship-edges/backfill-authorship.mjs`
- `recipes/authorship-edges/queries.sql`
- `recipes/ob-graph/README.md`
- `recipes/ob-graph/schema.sql`
- `recipes/typed-edge-classifier/README.md`
- `recipes/thought-enrichment/README.md`
- `docs/safe-agent-memory-provenance.md`
- `docs/agent-memory-portability.md`
- the category `README.md` files in `schemas/`, `integrations/`, `primitives/`, `extensions/`, `recipes/`, `skills/`, and `dashboards/`

### INSPECTED / INVENTORIED

- The entire top-level tree and all files under `server/`, `schemas/`, `primitives/`, `integrations/`, `extensions/`, `recipes/`, `skills/`, `dashboards/`, and `docs/` were enumerated.
- `docs/01-getting-started.md` was inspected deeply for the complete canonical thought schema, fingerprint/upsert SQL, vector RPC, RLS/grants, deployment, and MCP connection path.
- `integrations/enhanced-mcp/index.ts` and `_shared/config.ts` / `_shared/helpers.ts` were inspected at auth, capture, embedding, RPC payload, error, and tool-registration seams.
- `recipes/provenance-chains/backfill.mjs`, `mcp-tools.ts`, and `eval.mjs` were inspected at write, trace, atomic metadata-merge, cycle, restriction, and repair seams.
- `recipes/schema-aware-routing/` implementations were inspected at raw capture, identity routing, confirmation, and downstream-write seams.
- `recipes/source-filtering/` implementations were inspected at source inference and metadata update seams.
- `recipes/typed-edge-classifier/classify-edges.mjs` was inspected at candidate selection, model/version/confidence, insert, deduplication, and supersession mirroring seams.
- `recipes/thought-enrichment/` implementations were inspected at classification, validation, provenance, sanitization, mutation, retry, and repair seams.
- `recipes/ob-graph/index.ts` was inspected at CRUD, thought linking, edge uniqueness, traversal, deletion, and authentication seams.
- Metadata files and repository-wide search hits were used to classify other packages without treating their descriptions as implementation guarantees.

### NOT READ

- `dashboards/**` except `dashboards/README.md`: BUILD 0 excludes dashboards; directory names and problem-search hits were inventoried.
- `extensions/**` except `extensions/README.md`: the household, maintenance, calendar, meal, CRM, and job-hunt implementations solve domain workflows rather than the active evidence-substrate seam.
- Files under `recipes/**` not named in READ IN FULL or INSPECTED / INVENTORIED above: importer, notification, digest, publishing, coaching, and UI packages exposed no missing BUILD 0 mechanic in the directory inventory or problem searches.
- Files under `skills/**` except `skills/README.md`: skills govern agent behavior, not the canonical persistence boundary; Agent Memory behavior was traced through its schema, API, and official provenance document.
- Files under `schemas/**` and `integrations/**` not named in READ IN FULL or INSPECTED / INVENTORIED above: their directories and problem hits were inventoried, but no plausible additional match to the active seam survived triage.
- Files under `docs/**` except `docs/01-getting-started.md`, `docs/safe-agent-memory-provenance.md`, and `docs/agent-memory-portability.md`: unrelated walkthroughs and drafts were inventoried and searched, not deep-read.
- `.github/**`, `resources/**`, and `scripts/**` beyond inventory/search hits: repository operations and support assets, not Layer A behavior.
- Screenshots, media, spreadsheets, generated lockfiles, and vendored assets anywhere in the repository: not executable or architectural prior art for the active seam.

These are declared gaps. If a later Build activates one of their pressures, this receipt does not substitute for a new targeted read.

### SEARCHES RUN

Repository-wide, case-insensitive problem searches were run for:

`provenance`, `source`, `derived`, `evidence`, `claim`, `assertion`, `relation`, `edge`, `entity`, `identity`, `resolve`, `merge`, `supersede`, `review`, `standing`, `status`, `policy`, `warrant`, `authority`, `trace`, `audit`, `fingerprint`, `dedup`, `version`, `current`, `stale`, `scope`, `memory`, `recall`, `writeback`, `metadata`, and `artifact`.

Search was repository-wide rather than restricted to similarly named directories. Low-frequency `warrant`, `authority`, `standing`, and `assertion` hits were reviewed individually to distinguish ordinary prose, tests, and credential/database authority from ECB semantics.

### HIGH-LEVERAGE PRIOR ART FOUND

- Core UUID thought identity, pgvector schema, HNSW/cosine RPC, and MCP search/fetch mechanics can materially simplify BUILD 0.
- Core two-step capture is a concrete failure mode ECB must replace, not copy.
- Trigger-enforced fingerprints demonstrate how to close alternate-write bypasses if retry deduplication is later activated.
- Agent Memory proves runtime-neutral recall/writeback contracts, evidence-before-instruction defaults, conservative scope, review queues, and recall traces.
- Per-agent identity cleanly separates stable actor identity from rotatable credentials.
- Provenance chains prove bounded recursive tracing and atomic JSONB subtree merge patterns, while exposing multi-write drift.
- Thought audit proves deletion-surviving append-only history, while exposing the weakness of best-effort event recording.
- Typed-edge/provenance overlap demonstrates the exact drift created by two relation truth stores.
- Thought work claims provide a constraint-arbitrated, TTL-recoverable blackboard for later parallel pipelines without pretending an operational lease is a semantic Claim.
- Authorship and schema-aware routing demonstrate deferring ambiguous identity rather than silently resolving it.

### APPARENTLY NOVEL ECB REQUIREMENTS

Deliberate upstream search found no sufficient canonical solution for:

- a universal Referent that does not collapse entities, agents, artifacts, thoughts, or propositions;
- a dedicated Claim object distinct from evidence and relations;
- an Evidence Link with explicit claim-to-evidence semantics and admissibility role;
- an Event guaranteed with each consequential transition and sufficient for reconstruction;
- a general warrant object connecting authority basis, scope, claim/decision, and permission to act;
- architectural standing and authority distinct from recency, review status, provenance, memory use policy, or database privilege;
- one non-collapsing standing model spanning evidence, assertion, promotion, review, and governance.

“Apparently novel” means no sufficient solution was found at the pinned commit after deliberate search. It does not license implementation in BUILD 0.

### CONFLICTS

- Core capture can persist a thought before its embedding and then report failure.
- Core capture does not return its durable UUID.
- Query-string MCP secrets risk credential exposure in logs and history.
- Core handler and stateless smoke test disagree on unauthorized HTTP semantics.
- Agent Memory writeback also performs non-transactional thought, embedding, and sidecar writes.
- Audit/event records can be caller-wired, unchecked, or best-effort rather than guaranteed with the transition.
- Provenance and typed-edge packages can represent supersession twice; best-effort mirroring can drift and historically wrote direction incorrectly.
- Enhanced MCP can report capture success with a missing embedding and types thought IDs incompatibly with the canonical UUID schema.
- Enhanced thoughts and enrichment mix inferred classification/status/source fields into the base thought and contain competing scale/metadata conventions.
- Entity/edge extraction and LLM classifiers can produce useful hypotheses but would violate ECB distinctions if treated as claims with standing.

### CURRENT BUILD DISPOSITION

**RESUME BUILD 0 WITH SIMPLIFIED PLAN**

The pre-build interlock is satisfied for upstream commit `9543c29a3e44a210ce278392b9fac11248997461`. Reopen this recon if canonical OB1 changes in a way that plausibly alters the active Build seam, or if a later Build activates one of the declared unread areas.
