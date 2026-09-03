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
- No Vercel CLI session, AI Gateway key, database URL, local Ollama runtime, running Docker daemon, or local Postgres client was available during Sense.
- Live Vercel integration discovery reached the device-login gate. No integration was selected or provisioned.

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

1. authenticate the Vercel CLI;
2. run live integration discovery for a vector-capable persistent database;
3. verify a current embedding model and its output dimension;
4. record the selected runtime, store, embedding route, and reopening condition in an ADR;
5. provision the real integration and pull its environment variables;
6. implement only the vertical slice above.

Do not substitute a mock store, keyword search, sample-data fallback, or unprovisioned provider abstraction.

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
