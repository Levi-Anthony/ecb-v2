STATUS: BUILD 11 CANDIDATE  
DISPOSITION: PROJECTION / IMPLEMENTATION SURFACE  
ROLE: Layer A ordinary-operation MCP

# Open Brain MCP

This directory contains the ordinary ECB MCP surface. BUILD 11 keeps the outward tool inventory small while moving mechanically decidable correctness into the database/controller boundary.

The MCP still exposes exactly:

- `capture_thought`;
- `search`;
- `fetch`.

## BUILD 11 structural behavior

### Capture

`capture_thought` now requires a caller-supplied `operation_id` UUID before the effect crosses the persistence boundary.

The same operation identity is replay-safe:

- same operation + same request -> same committed Thought/outcome;
- same operation + changed request -> conflict;
- different operation + identical content -> permitted as a distinct encounter.

The operation record and resulting Thought are distinct persistent first-class Referents.

Thought evidence is committed before semantic representation is attempted. A semantic-embedding failure therefore degrades representation readiness; it does not falsely report that the submitted evidence was never preserved.

### Representation

Semantic embeddings are stored in `thought_representations`, separately from canonical Thought evidence. Representation rows have their own Referent identity.

Missing embeddings are mechanically discoverable. Search performs a bounded repair pass when the embedding provider is available. Representation repair is idempotent by `(thought_id, model_id)`.

No background queue or liveness daemon is required by BUILD 11.

### Search

The single `search` tool fronts two backend retrieval modes:

- deterministic PostgreSQL lexical search;
- semantic vector search when the query embedding is available.

Results are combined deterministically. The response includes coverage metadata so semantic provider failure or incomplete representation coverage cannot masquerade as a normal full-coverage search.

Retrieval produces candidate evidence identities. It does not create truth, currentness, applicability, standing, warrant, or authority.

### Runtime capability

The deployed ordinary MCP runtime must **not** hold `SUPABASE_SERVICE_ROLE_KEY`.

Instead it uses:

- `SUPABASE_ANON_KEY` / publishable database access;
- a separate server-side `ECB_ORDINARY_DB_KEY` capability secret;
- the narrow `ecb11_*` security-definer RPC surface.

The anon role has no direct mutation privilege on Thoughts, operations, representations, Claims, or Evidence Links. The capability secret authorizes only the ordinary RPCs; it does not grant unrelated Layer-B writes.

The external MCP bearer remains `ECB_BRAIN_KEY`. Do not reuse it as the database capability key.

## Runtime-key commissioning

After the BUILD 11 migration is installed, commission the database capability once:

```sh
deno run --allow-env --allow-read --allow-write --allow-net \
  --config deno.json commission-runtime-key.ts
```

Required commissioning environment:

- `SUPABASE_URL`;
- `SUPABASE_SERVICE_ROLE_KEY` — **commissioning helper only, never deployed ordinary runtime**;
- optional `ECB_ORDINARY_DB_KEY`.

If `ECB_ORDINARY_DB_KEY` is omitted, the helper generates one locally and stores it at:

`~/.ecb-v2-runtime/ordinary-db-key`

with restrictive permissions. The key value is not printed.

Install that same value as the Edge Function secret `ECB_ORDINARY_DB_KEY`, then deploy the MCP runtime with:

- `ECB_BRAIN_KEY`;
- `ECB_ORDINARY_DB_KEY`;
- `SUPABASE_URL`;
- `SUPABASE_ANON_KEY`.

Do not leave `SUPABASE_SERVICE_ROLE_KEY` in the ordinary runtime environment after the cutover.

## Local verification

```sh
deno fmt --check index.ts index.test.ts commission-runtime-key.ts deno.json
deno check --config deno.json index.ts index.test.ts commission-runtime-key.ts
deno test --allow-env --allow-net --config deno.json index.test.ts
```

BUILD 11 database qualification is exercised separately against disposable PostgreSQL 17 + pgvector before any canonical installation.

Body-level MCP authentication remains mandatory. `ECB_BRAIN_KEY`, `ECB_ORDINARY_DB_KEY`, service-role credentials used during commissioning, and database secrets must remain server-side or in ignored local files; none belongs in source, client configuration, logs, or tool results.
