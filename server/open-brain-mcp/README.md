STATUS: ACTIVE
DISPOSITION: PROJECTION  
ROLE: Layer A MCP implementation surface

# Open Brain MCP

This directory contains the Clean OB1 Kernel MCP surface required by BUILD 0.

The deployed Supabase Edge Function exposes exactly:

- `capture_thought`;
- `search`;
- `fetch`.

It uses stateless Streamable HTTP, bearer-only technical access, native normalized `gte-small` embeddings, and the one canonical Supabase `thoughts` table.

The deployed function implements its own bearer check because the BUILD 0 technical key is not a Supabase user JWT. `ECB_BRAIN_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must remain server-side or in ignored local environment files; neither belongs in source, client configuration values, logs, or tool results.

Local verification:

```sh
deno fmt --check index.ts index.test.ts deno.json
deno check --config deno.json index.ts index.test.ts
deno test --allow-env --allow-net --config deno.json index.test.ts
```

The six-test contract suite verifies explicit rejection of an invalid bearer key, stateless initialization, the exact three-tool inventory, durable capture identity propagation, explicit not-found behavior, and safe operation-specific failure codes. The BUILD 0 deployment and Golden Trace receipt is in [`../../docs/build-receipts/001-build-0.md`](../../docs/build-receipts/001-build-0.md).

Deploy only to the project designated by ADR-002, with the repository `deno.json` included as the import map. Body-level authentication must be verified before disabling the platform JWT check; never expose the endpoint without one of those enforcement surfaces.
