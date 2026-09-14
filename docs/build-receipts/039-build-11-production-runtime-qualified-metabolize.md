# BUILD 11 — Production runtime qualified / Metabolize checkpoint

Date: 2026-09-14  
Controlling issues: ECO-132, ECO-133  
Register: B — implementation readiness / live qualification

## Disposition

BUILD 11's canonical database installation and confined replacement ordinary runtime are live-qualified.

This receipt does **not** claim final consumer cutover or full BUILD 11 closure. The predecessor Supabase `open-brain-mcp` remains intentionally available as a fallback because the active consumer/custom-app endpoint has not yet been independently established as pointing to the new Vercel runtime.

Therefore:

- BUILD 11 Sense: CLOSED.
- BUILD 11 Shape: CLOSED.
- BUILD 11 Move implementation/database/runtime qualification: PASS.
- BUILD 11 Metabolize: RECONCILED at this checkpoint.
- BUILD 11 overall closure: WITHHELD pending consumer routing verification and predecessor-runtime retirement.

## Canonical production state verified

Canonical brain:

- Supabase project: `ecb-v2-brain`
- project ref: `vezxivrvhakclxuvxzso`
- BUILD 11 production migration ledger entry: `20260914072022 / build_11_ordinary_operation_kernel`
- BUILD 7–10 canonical database installs remain absent.

Canonical replacement ordinary runtime:

- host: Vercel project `ecb-v2`
- project id: `prj_oevToBKwqj7yHjyQCHs5zevegWCM`
- qualified runtime code: `main@1337f8f6072f6d2c31d1916cc0793a67227acd20`
- production deployment: `dpl_BdDfGRKTtF3baWhpnF7iz68Cs39H`
- public MCP route: `/api/mcp`
- ordinary tool inventory: `capture_thought`, `fetch`, `search`
- provider-admin credentials required by ordinary runtime: false
- MCP transport: explicitly stateless (`sessionIdGenerator: undefined`)

Predecessor fallback still present:

- Supabase Edge Function `open-brain-mcp`
- ACTIVE version 4 at metabolize time
- retained only because consumer routing has not yet been independently switched/verified.

## Secret / capability boundary

One production `ECB_ORDINARY_DB_KEY` is commissioned in the canonical database and installed into the confined Vercel runtime without exposing the value to chat, receipts, repository content, or returned tool output.

The replacement runtime authenticates outward MCP bearer access by stored SHA-256 digest and reaches the canonical brain through publishable/anon database access plus the bounded `ECB_ORDINARY_DB_KEY` RPC capability. It does not require Supabase provider-admin/service-role authority for ordinary operation.

No secret values are recorded here.

## Final live verifier

GitHub Actions run: `34837576050`  
Final verification job: `103958672920`

Against the production Vercel endpoint, the verifier established:

- wrong bearer -> HTTP 401;
- correct bearer MCP initialize -> HTTP 200;
- negotiated protocol -> `2025-11-25`;
- no MCP session header emitted;
- `tools/list` -> exactly `capture_thought`, `fetch`, `search`;
- live `search` -> HTTP 200, non-error result;
- lexical retrieval available -> true;
- semantic query embedding available -> true;
- semantic index complete -> true;
- degraded -> false;
- repair metadata present -> true.

This final result supersedes earlier live verifier attempts that truthfully reported semantic degradation while the Vercel embedding runtime was incomplete.

## Installation discrepancies found and repaired

### 1. Provider capability did not converge with ordinary affordance

The accepted BUILD 11 design required the ordinary runtime's actual capability to be narrow rather than merely advertising three tools while holding provider-admin authority. The production convergence path moved the ordinary MCP runtime to Vercel while preserving Supabase as the canonical brain. This allowed the runtime to hold only its bounded ordinary secrets and public database access.

### 2. Vercel function discovery

The first Vercel deployment built no routable function because the qualified runtime was not exposed through Vercel's `/api` function convention. Thin `/api` and `/api/mcp` adapters were added without changing MCP semantics.

### 3. Runtime dependency graph

Current `@hono/mcp` peer requirements required aligning the root MCP SDK and Hono versions. The dependency graph was corrected rather than bypassed with `--force` / legacy peer resolution.

### 4. Serverless MCP session semantics

Deleting an emitted `mcp-session-id` header after transport handling was weaker than structurally disabling sessions. The transport now uses `sessionIdGenerator: undefined`.

### 5. Portable semantic embedding runtime

The Vercel runtime preserved the existing `gte-small` vector space through `Supabase/gte-small`, but live search initially degraded because serverless inference was not actually usable.

Two deterministic environment defects were found:

- npm's install-script policy blocked the exact native `onnxruntime-node@1.21.0` installer;
- Transformers.js attempted to use a read-only cache path under `/var/task/node_modules/...`.

Repairs:

- approve only the exact ONNX runtime install script required by this dependency graph;
- leave unrelated `sharp` and `protobufjs` installers unapproved;
- configure Transformers.js cache under writable `/tmp/transformers-cache` before loading the runtime.

The unchanged final verifier then proved semantic query availability and non-degraded hybrid search.

## Temporary surface cleanup

Installation-only and diagnostic functions are not allowed to become accidental permanent architecture.

At metabolize time:

- `ecb11-commission` was already an inert HTTP 410 tombstone;
- `ecb11-brain-key-digest` was replaced with an inert HTTP 410 tombstone;
- `ecb11-embed-reference` was replaced with an inert HTTP 410 tombstone;
- `ecb11-vercel-live-verify` was replaced with an inert HTTP 410 tombstone.

The digest helper cleanup was security-relevant because its diagnostic purpose no longer justified exposing a bearer digest surface.

## What BUILD 11 now buys us

Once a consumer is routed to the replacement runtime:

- capture identity exists before the effect;
- an uncertain retry can reuse one operation UUID and deterministically recover the same outcome;
- changing the request under the same operation identity conflicts rather than duplicating an effect;
- two intentional encounters with identical content may still remain distinct;
- Thought evidence persists independently of semantic representation success;
- missing representations are inspectable and repairable;
- search has a PostgreSQL lexical floor and semantic ranking when available;
- coverage reports degradation instead of pretending semantic completeness;
- ordinary runtime technical authority is narrower than governance/admin authority;
- the outward ordinary MCP surface remains three tools.

## Residuals deliberately not erased

### Consumer routing

The live replacement runtime is production-qualified, but the active ChatGPT/custom-app/other consumer endpoint has not been independently established as pointing at it. Until that is done, the predecessor Supabase MCP remains the rollback path and BUILD 11 overall closure is withheld.

### Operation-ID custody

The server/database can guarantee exact replay only when the caller supplies the same stable `operation_id` for the same logical capture. The current MCP contract still leaves generation and retention/reuse of that token to the caller/client adapter. A later client adapter may physicalize that custody; BUILD 11 does not claim it already has.

### No adjacent authority installed

This work does not create or install:

- BUILD 7–10 database semantics;
- real Master-Key designation authority;
- BUILD 8 action authority/effects;
- automatic semantic promotion;
- generalized workflow/policy machinery;
- iPhone Action Button capture.

## Metabolized lessons

1. **Capability must be measured by credentials actually available to the runtime, not by the tool registry it advertises.**
2. **Deployment readiness and consumer routing are separate states.** A healthy replacement service is not yet the active service merely because it exists.
3. **Graceful degradation is both product behavior and diagnostic leverage.** The lexical floor kept search useful while exposing, rather than hiding, the broken semantic path.
4. **Serverless environments turn filesystem/install assumptions into architecture-relevant facts.** Native dependency policy and writable cache location must be explicit when they affect a required capability.
5. **Statelessness should be structural, not cosmetic.** Disable sessions at transport construction rather than deleting evidence after the fact.
6. **Temporary verification surfaces require explicit retirement.** Diagnostic convenience is not continuing warrant for capability exposure.
7. **Provider-specific implementation can be replaced without changing durable semantics when the semantic contract is separately qualified.** The canonical brain and vector space remained stable while the runtime host changed.

## Exact legitimate reentry seam

Do not reopen BUILD 11 Sense or Shape.

Resume ECO-133 Move only at consumer cutover:

1. identify the actual active ordinary MCP consumer/custom-app endpoint;
2. point it to the production Vercel `/api/mcp` endpoint without exposing bearer material;
3. perform one ordinary live probe through that consumer;
4. independently verify traffic reaches the Vercel runtime;
5. retire/tombstone the predecessor Supabase `open-brain-mcp` only after that proof;
6. reconcile currentness one final time and close ECO-133 / BUILD 11.

If routing is already externally changed by the time of reentry, verify rather than replaying the change.
