STATUS: ACCEPTED AND CLOSED 2026-09-03 AMERICA/PHOENIX (`2026-09-04` UTC)
DISPOSITION: EVIDENCE
ROLE: BUILD 0 execution and metabolization receipt
AUTHORITY: Does not amend the Build Contract, invariants, acceptance fixture, or accepted ADRs

# BUILD 0 Receipt — Clean OB1 Kernel

## Result

**PASS — Golden Trace 01 completed exactly.**

BUILD 0 produced one remotely reachable, bearer-protected, stateless MCP door over one canonical Supabase evidence store. A fresh context captured one atomic thought; another fresh context recovered it by meaning and fetched the same source record by durable identity.

## Deployed surface

- canonical project: Supabase `ecb-v2-brain` (`vezxivrvhakclxuvxzso`);
- function: `open-brain-mcp`, active version 2;
- transport: stateless Streamable HTTP;
- tools: exactly `capture_thought`, `search`, and `fetch`;
- embedding: native `gte-small`, mean pooled, normalized, 384 dimensions;
- client access: bearer key referenced by environment variable, never stored in repository configuration;
- database access: server-side service role with table `SELECT`/`INSERT` and similarity-function `EXECUTE` only.

An unauthenticated remote request returned HTTP 401. An authenticated remote initialization returned HTTP 200 without an MCP session identifier. The remote tool inventory matched the three names above exactly.

## Golden Trace 01

### Context A — capture

A fresh ephemeral Codex process received only the frozen capture instruction and used the deployed `ecb-v2` MCP server. It captured the fixture exactly once with `source = golden_trace_01` and returned:

- durable ID: `19a949ea-a8fc-4250-a386-fa64e5530180`;
- captured at: `2026-09-04T00:12:35.225093+00:00`;
- embedding model: `gte-small`.

### Context B — semantic recovery and fetch

A separate fresh ephemeral Codex process received the semantic question but neither the fixture sentence nor its durable ID. It used only the deployed `ecb-v2` MCP server.

`search` returned the Context A row first with similarity `0.919231799818033`. `fetch` using that returned ID produced the exact same ID, content, source, captured time, and embedding-model identity.

The unrelated preconfigured GitHub and Vercel MCP clients reported missing authentication during process startup and shutdown. They were not invoked for the trace and did not affect the `ecb-v2` calls.

## Direct substrate verification

Independent database inspection after both contexts established:

- canonical row count: exactly 1;
- only row ID: `19a949ea-a8fc-4250-a386-fa64e5530180`;
- exact frozen content: true;
- exact source: true;
- exact embedding model: true;
- embedding dimensions equal 384: true;
- public tables: `thoughts` only, with RLS enabled;
- retrieval created no duplicate row;
- no promoted referent, claim, standing, or governance relation exists.

The installed migration history is:

1. `20260903235721_build_0_atomic_thoughts`;
2. `20260904000010_build_0_least_privilege`.

The Supabase performance advisor returned no notices. The security advisor returned only `rls_enabled_no_policy` at INFO level. That state is intentional: `anon` and `authenticated` have no table access or function execution, the Edge Function is the technical boundary, and `service_role` bypasses RLS with the deliberately restricted grants above.

Recent Edge Function logs contain the expected successful initialize, capture, search, and fetch requests plus deliberate unauthorized probes. No deployed trace request returned a server error. After the trace, version 2 separated safe embedding and persistence failure codes as required by ADR-001; a remote inventory and explicit not-found probe passed without writing another row.

## Failure-path evidence

Before the trace, direct API checks confirmed that empty content, an embedding-model mismatch, and a missing embedding each fail structurally and create no row. The remote endpoint rejected a missing bearer credential. Six local transport tests cover invalid credentials, stateless initialization, exact tool registration, durable capture identity propagation, explicit not-found behavior, and safe operation-specific failure codes.

## Invariants observed

- **one persistent brain** — every operation addressed the same canonical project and table;
- **atomic evidence first** — the embedding completed before the single canonical insert;
- **semantic retrieval remains fundamental** — Context B used vector similarity, not conversational memory or keyword fallback;
- **local interfaces do not become separate brains** — Codex retained no canonical copy;
- **evidence ≠ assertion** and **thought ≠ promoted object** — the only persisted object is the evidence thought;
- **explicit failure behavior** — unauthorized, validation, not-found, embedding, persistence, and retrieval boundaries have named failures.

## Preserved non-closure

BUILD 0 did not add claims, referents, relations, standing, review, supersession, lifecycle, deduplication, list/update/delete operations, a dashboard, a second store, a second human door, or a generalized governance substrate.

## Metabolization and closure

The human accepted this evidence on 2026-09-03 America/Phoenix (`2026-09-04` UTC). BUILD 0 is closed.

The observed behavior matched the bounded target: atomic capture produced one complete canonical evidence row, semantic retrieval crossed a fresh-context boundary, fetch preserved durable identity and provenance, failures were explicit, and no governance object was created. The implementation choices recorded by ADR-001 and ADR-002 remain scoped to BUILD 0; their success does not promote them into inherited architecture for later Build Units. No reopening condition was observed.

BUILD 1 — Harvest Fixture Path is installed as a separate checkout under an orientation / review hold. Its implementation has not begun.
