# BUILD 11 — R4 runtime confinement qualification

Status: QUALIFICATION IN PROGRESS

## Established

- Canonical BUILD 11 database migration is installed in `ecb-v2-brain`.
- The ordinary runtime capability has been commissioned with `ECB_ORDINARY_DB_KEY`.
- The original Supabase Edge runtime passed live bearer/capability denial and acceptance checks, but managed Supabase Edge Functions inject admin-capable project credentials into the worker environment by provider design. That leaves the process over-capable even when application code does not use those credentials.
- The ordinary MCP replacement is therefore being qualified on the dedicated Vercel `ecb-v2` project, where runtime environment is explicitly controlled.
- Portable `Supabase/gte-small` via Transformers.js was compared against Supabase Edge built-in `gte-small` on three fixtures. Minimum cosine agreement: `0.9999999999999277`; maximum absolute component difference: `1.043081283569336e-7`. This is sufficient to preserve the existing 384-dimensional representation space without re-embedding canonical Thoughts.
- Vercel Preview and Production scopes have been provisioned with only the bounded ECOS secrets required by the replacement runtime: `ECB_ORDINARY_DB_KEY` and `ECB_BRAIN_KEY_SHA256`. No service-role or Supabase secret API key is required by the replacement runtime.

## Still to verify before production cutover

1. Fresh Preview deployment receives the newly provisioned secrets.
2. Replacement MCP initializes only with the existing bearer verifier.
3. Database RPCs succeed only with the commissioned ordinary runtime capability.
4. `capture_thought` preserves idempotent replay/conflict behavior.
5. `search` preserves lexical fallback, semantic search, and truthful coverage reporting.
6. `fetch` returns canonical Thought evidence and representation readiness.
7. No admin-capable Supabase credential is present in the replacement worker configuration.
8. Only after those checks pass may the Vercel runtime become the ordinary production MCP surface and the Supabase ordinary MCP be retired.

This receipt is intentionally not a closure receipt. It exists to trigger and anchor the post-secret Preview qualification deployment.
