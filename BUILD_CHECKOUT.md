STATUS: ACTIVE  
DISPOSITION: PROJECTION  
ROLE: Current human/agent checkout  
AUTHORITY: Derived from build contract, invariants, and acceptance tests  
CURRENT BUILD UNIT: BUILD 0 — Clean OB1 Kernel

# BUILD 0 — Clean OB1 Kernel

## TARGET

A fresh ECB v2 substrate can persist an atomic thought captured through one AI context and semantically recover the same evidence from another fresh context.

## WHY THIS BUILD EXISTS

Before governance, referents, standing, or ECOS automation exist, ECB v2 must prove that the Open Brain substrate itself is useful and durable.

Layer A must stand on its own.

## SENSE — COMPLETE 2026-09-03

### Mandatory OB1 mine-first interlock — SATISFIED 2026-09-03

Canonical OB1 was inventoried and deep-mined at pinned `main` commit [`9543c29a3e44a210ce278392b9fac11248997461`](https://github.com/NateBJones-Projects/OB1/commit/9543c29a3e44a210ce278392b9fac11248997461).

The complete evidence matrix, conflicts, declared coverage gaps, and receipt are in `/docs/ob1-prior-art.md`.

Current disposition: **RESUME BUILD 0 WITH SIMPLIFIED PLAN**.

The Build Contract and Golden Trace remain unchanged. Implementation may adapt OB1's proven Supabase/pgvector/MCP mechanics, but must reimplement its partial two-write capture boundary and must not import optional lineage into BUILD 0.

### Evidence inspected

- OB1 substrate lineage at commit [`9543c29a3e44a210ce278392b9fac11248997461`](https://github.com/NateBJones-Projects/OB1/commit/9543c29a3e44a210ce278392b9fac11248997461).
- OB1's canonical MCP surface in `server/index.ts`.
- OB1's compact Vercel/Neon path in `recipes/vercel-neon-telegram/`.
- The current local execution environment and Vercel integration gate.

### Behavior that has earned survival

- one canonical thought record shared across AI clients;
- vector embedding at capture time;
- meaning-ranked retrieval;
- stable record identity returned across search and fetch;
- MCP as the cross-context interface;
- explicit source and capture time.

### Implementation that has not earned inheritance

- Supabase or Neon merely because an OB1 implementation uses one;
- OpenRouter or a provider-specific AI SDK merely because an OB1 implementation uses one;
- LLM metadata extraction during capture;
- list, stats, dashboard, Telegram, Slack, deduplication, update, or delete surfaces;
- a capture path that persists a row before its embedding is durably attached;
- ECB v1 schema or runtime.

### Current environment evidence

- Vercel CLI `59.11.2` is installed.
- Vercel CLI is authenticated as `levi-anthony`.
- The Vercel project `levi-anthonys-projects/ecb-v2` exists and is connected to the GitHub repository.
- Live marketplace discovery completed for storage and AI categories.
- The free Neon resource `ecb-v2-brain` is preserved, empty, and disconnected from the Vercel project. It is evidence/fallback, not the selected substrate.
- The human selected Supabase as BUILD 0's canonical substrate because it carries demonstrated OB1 behavior while allowing a clean v2 schema.
- The Supabase Marketplace integration is installed on the Vercel team under its free plan.
- A browser-authenticated, read-only inspection established that Crucible (`fjamkrfhopumigfscgnm`) is an isolated evidence store: two public tables (`specimens`, 10 records; `transform_receipts`, 27 records), three migrations, and no Auth users, Storage buckets, Edge Functions, database branches, repository connection, or backups. The earlier 24-hour service-log check was empty before dashboard inspection, and the project showed no active database connections.
- The ECOS Spike 1 remote-build runbook's never-target rule governs deployment targeting for that spike. No Spike 1 deployment or Crucible data/schema mutation occurred. With the user's authorization, Crucible was paused on 2026-09-03 to release the free-plan slot; its data remains preserved and the project is restorable.
- Vercel provisioned `ecb-v2-brain` on the Supabase free plan in `sfo1` (Supabase `us-west-1`) and connected it to `levi-anthonys-projects/ecb-v2`. Supabase project ref: `vezxivrvhakclxuvxzso`; status at verification: `ACTIVE_HEALTHY`.
- Vercel injected the following Supabase resource variables into Production, Preview, and Development: `POSTGRES_URL`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_DATABASE`, `POSTGRES_PASSWORD`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Values were not recorded.
- The Development variables were pulled to gitignored `.env.local`. Vercel initially preserved pre-existing local-only Neon aliases that are absent from the Vercel project; those aliases were moved without exposing their values to gitignored `.env.neon-preserved.local`. Active `.env.local` now contains only the project-linked Supabase variables plus Vercel's local OIDC token.
- Read-only database inspection succeeded. The new public schema is empty, and pgvector `0.8.2` is available but not installed. No schema, extension, table, migration, or row was created.
- AI Gateway discovery confirms `openai/text-embedding-3-small` remains available and OB1 reports a 1536-dimensional vector for it, but v2 has not independently verified the dimension.
- A live Gateway embedding request using local Vercel OIDC returned `403` because the Vercel team has no payment card on file. No billing change was attempted.
- The remote human-door host remains open between Supabase Edge Functions and Vercel Fluid Functions; see `/docs/deployment-shapes/human-door.md` and AP-11.
- No AI Gateway API key, local Ollama runtime, running Docker daemon, or local Postgres client was available during Sense.

These environment observations are dated evidence, not durable architecture. Revalidate them when AP-09 triggers.

## INVARIANTS SERVED

- one persistent brain;
- atomic evidence first;
- semantic retrieval remains fundamental;
- local interfaces do not become separate brains;
- evidence ≠ assertion;
- thought ≠ promoted object.

## INPUTS

Fresh v2 substrate only.

No ECB v1 runtime dependency.

## OUTPUTS

Minimum persistent evidence capability:

- thought capture;
- durable thought identity;
- embedding;
- semantic retrieval;
- get/fetch by stable record identity;
- source/provenance metadata sufficient for Golden Trace 01.

## SHAPE — READY; PHYSICAL ACTIVATION GATED BY AP-09

### Smallest vertical slice

One canonical persisted `thoughts` record supports exactly three MCP operations:

1. `capture_thought`
   - input: non-empty `content`, non-empty `source`, and optional `captured_at`;
   - behavior: validate → embed → persist the complete canonical row → return its durable ID;
   - no row is created if embedding fails;
   - no successful response is returned if persistence fails.
2. `search`
   - input: non-empty semantic `query`;
   - behavior: embed the query with the same model family and rank canonical thought rows by vector similarity;
   - output: durable ID, content, source, captured time, and similarity for each result;
   - no keyword, conversational-memory, fabricated, or alternate-store fallback.
3. `fetch`
   - input: durable thought ID returned by `search`;
   - behavior: read the canonical row by primary key;
   - missing identity is an explicit not-found result, never evidence of nonexistence beyond this store.

`search` and `fetch` names are retained because they are the smallest read-only MCP compatibility surface demonstrated by OB1 and required by Golden Trace 01.

### Minimum persistent state

One `thoughts` relation only:

- `id` — server-generated durable UUID, primary key;
- `content` — non-empty atomic thought text;
- `source` — non-empty provenance label;
- `captured_at` — timezone-aware capture timestamp;
- `embedding` — non-null vector stored on the canonical row;
- `embedding_model` — non-empty model identity used to create the vector.

No generic metadata bag, promoted referent, claim, standing, governance field, second vector store, or authoritative cache is introduced.

### Enforcement surfaces

| Requirement | Mode | Surface |
|---|---|---|
| One complete canonical record | STRUCTURAL | table constraints and single insert path |
| Durable stable identity | STRUCTURAL | database-generated primary key |
| Same model space for capture and search | STRUCTURAL | configured model identity plus vector dimension constraint |
| No partial capture | STRUCTURAL | embedding completes before the canonical insert |
| Cross-context recovery | OBSERVATIONAL | Golden Trace 01 through two fresh MCP client processes |
| Explicit failures | OBSERVATIONAL | executable failure-path tests at embedding, persistence, search, and fetch boundaries |

### Golden Trace execution

1. Start Context A as a fresh MCP client process.
2. Call `capture_thought` with the frozen GT01 content and `source = golden_trace_01`.
3. Record the returned ID and end Context A.
4. Start Context B as a new MCP client process with no GT01 sentence in its prompt or process state.
5. Call `search` with the frozen semantic question.
6. Require the returned result ID to equal Context A's ID.
7. Call `fetch` with that ID.
8. Require exact content, source, captured time, and identity equality.
9. Verify the canonical store contains one GT01 row and that no promoted/governance record exists.

The test must exercise the deployed or locally running MCP boundary. Direct database calls do not satisfy the cross-context condition.

### Physical activation gate

Before writing the first migration or runtime file:

1. provision the selected Supabase project and pull its environment variables;
2. verify pgvector availability without changing schema;
3. verify a current embedding model and its output dimension;
4. Shape and close the human-door deployment choice in an ADR;
5. record the selected runtime, store, embedding route, and reopening condition in a physical-substrate ADR;
6. implement only the vertical slice above.

Do not substitute a mock store, keyword search, sample-data fallback, or unprovisioned provider abstraction.

### Activation progress

- [x] Authenticate the Vercel CLI.
- [x] Create and link the `ecb-v2` Vercel project.
- [x] Run live storage and AI marketplace discovery.
- [x] Preserve and disconnect the unused Neon resource.
- [x] Human selects Supabase as the canonical BUILD 0 substrate.
- [x] Human accepts the Supabase marketplace terms.
- [x] Install the Supabase Marketplace integration on the Vercel team.
- [x] Resolve Supabase free-plan capacity without mutating Crucible data or schema.
- [x] Provision the free Supabase resource in `sfo1`.
- [x] Pull and verify Supabase environment variable names without exposing values.
- [x] Verify Supabase connectivity and pgvector availability without changing schema.
- [x] Isolate the preserved local-only Neon aliases before runtime code selects a database URL.
- [ ] Verify and freeze the embedding model and vector dimension.
- [ ] Close the human-door deployment choice through ADR.
- [ ] Record the physical substrate ADR.
- [ ] Begin BUILD 0 implementation.

## STANDING

Captured thoughts are evidence records.

Capture does not:

- create a promoted referent;
- create a governing claim;
- grant standing beyond evidence;
- create architectural authority.

## ENFORCEMENT

**STRUCTURAL:**

- one canonical persisted thought record;
- durable ID;
- no silent alternate storage path.

**OBSERVATIONAL:**

- capture can be verified through fresh-context retrieval and fetch.

No semantic or governance transition is introduced by BUILD 0.

## PASS

Golden Trace 01 passes exactly.

## DO NOT BUILD

- universal governance referents;
- claims;
- relation claims;
- standing promotion;
- Master Keys;
- warrants;
- semantic evaluations;
- action envelopes;
- governance bootstrap;
- packets;
- dashboards;
- v1 migration;
- generalized ECOS abstractions.

## FAILURE BEHAVIOR

Capture, embedding, search, and fetch failures must be explicit.

Do not silently:

- fall back to another store;
- fabricate retrieval;
- reinterpret missing evidence as nonexistence.

## APERTURE

Everything above the Open Brain evidence substrate remains intentionally unopened.

This is not missing implementation.

It is outside BUILD 0.

## REVALIDATION TRIGGER

Reopen the Build 0 boundary only if Golden Trace 01 cannot pass without adding a distinction excluded above.

If triggered, identify the exact missing distinction before proposing structure.

## NEXT AFTER PASS

Metabolize BUILD 0 evidence.

Then install BUILD 1 — Harvest Fixture Path.

Do not automatically begin BUILD 1 merely because BUILD 0 compiles.

## HUMAN STOP CONDITIONS

Return to the human rail if implementation appears to require:

- violation of a frozen invariant;
- new persistent architecture not licensed by BUILD 0;
- an architectural assumption absent from governing sources;
- migration of ECB v1 implementation;
- changing Golden Trace 01 to match the implementation.
