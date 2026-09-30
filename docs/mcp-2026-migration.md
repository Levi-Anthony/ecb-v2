STATUS: PREVIEW READY — LIVE MCP/CONSUMER QUALIFICATION UNKNOWN; PRODUCTION UNCHANGED
DISPOSITION: IMPLEMENTATION / PROTOCOL MIGRATION EVIDENCE

# Ordinary MCP dual-era migration

This change upgrades the active Vercel `/api/mcp` door to the 2026-07-28 Model Context Protocol (MCP) serving entry. One server factory exposes the same six installed operations to modern per-request clients and legacy handshake clients. The earlier three-operation Supabase Edge Function remains a separate rollback predecessor; it is not the current six-operation contract.

## Preserved boundary

- The external `Authorization: Bearer` check still runs before MCP dispatch. `ECB_BRAIN_KEY_SHA256` remains the verifier and `ECB_ORDINARY_DB_KEY` remains server-side for the narrow database RPCs.
- `capture_thought`, `set_thought_disposition`, and `create_artifact` retain caller-supplied operation identity and database replay/conflict enforcement. The migration does not generate operation IDs or create action authority.
- `search` retains bounded representation repair and its degraded-coverage report. Its MCP annotation now discloses that it can write missing representations.
- Successful results retain JSON text content. Operation failures retain tool results with `isError: true`. No OAuth issuer, scope model, structured-output schema, task, app, or new operation is installed.

## HTTP boundary

The SDK's `createMcpHandler` serves modern 2026-07-28 requests and stateless legacy requests. It bounds bodies at 4 MiB and JSON-RPC batches at 100 messages. Host and present Origin headers are validated before parsing and before bearer verification. The allowed server hostnames come from `VERCEL_URL`, `VERCEL_BRANCH_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and optional comma-separated `ECB_MCP_ALLOWED_HOSTS`, plus local development hosts. If any caller uses a custom production alias, add its hostname to `ECB_MCP_ALLOWED_HOSTS` before directing traffic there. Browser clients with a distinct Origin require its hostname in `ECB_MCP_ALLOWED_ORIGIN_HOSTS`; non-browser clients commonly omit Origin. These are hostnames, without scheme or port.

## Qualification and rollout

Local checks:

```sh
npm ci
npm run typecheck:mcp
npm run test:mcp
```

The local protocol tests prove both eras negotiate and list the same six tools, invalid input remains a tool error, invalid Host/Origin is rejected before parsing, unauthorized access is rejected, and oversized bodies and batches do not dispatch. They do **not** prove Vercel routing, real database behavior, installed secrets, a protected connected consumer, or production conformance.

### Preview checkpoint — 26 September 2026 America/Phoenix

Draft PR #98 carries the published tree. Four repository workflows passed. Vercel Preview deployment `dpl_2EGYKXTPfk2YGatbNfYyKeTs58PE` reached READY from commit `de5272b04d91ce5856a3a6755e696a4894a88f2e`; GET `/api` returned the six expected operation names. The Preview `/api/mcp` path redirected to Vercel sign-in through the available read path. This is an access limit, not a failed MCP handshake: no authenticated modern or legacy call reached the Preview MCP handler, no connected-consumer mutation was made, and the database was not touched by this check. Vercel's grouped Preview log read showed one 200 (the `/api` observation) and no runtime-error cluster in the checked one-hour window. That does not establish error-free behavior after authenticated use.

Before production cutover, inspect the actual Preview and Production hostnames, configured browser Origins, and active consumer's endpoint and operation-ID custody. On Preview, verify modern discovery, legacy initialize, six-tool inventory, read fetches, and one authorized bounded mutation with the same logical operation ID on retry; inspect its durable receipt and failure path. Confirm no new runtime errors. Preserve the current production deployment as rollback, then promote the exact qualified Preview artifact and repeat the connected-consumer check. Do not retire the predecessor Supabase endpoint under this migration.

Full standard OAuth authorization interoperability is a separate decision. The existing single-operator shared bearer gate is preserved for continuity; enabling the SDK's OAuth scope challenge requires a verified OAuth authorization context and a justified principal/scope contract.
