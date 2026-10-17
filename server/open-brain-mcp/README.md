STATUS: BUILD 11 CANDIDATE  
DISPOSITION: PROJECTION / IMPLEMENTATION SURFACE  
ROLE: Layer A ordinary-operation MCP

# Open Brain MCP

This directory contains the ordinary ECB MCP surface. BUILD 11 keeps the outward tool inventory small while moving mechanically decidable correctness into the database/controller boundary.

The managed Edge MCP exposes:

- `capture_thought`;
- `search`;
- `fetch`;
- `get_current_commission` (source-bound read-only recovery);
- candidate `workflow_inspect` (guarded native snapshot, release/client qualification pending).

## BUILD 11 structural behavior

### Capture

`capture_thought` requires stable operation identity before persistence: optional preferred `operation_id`, or explicit retained `captured_at` for the existing compatibility fallback. Replay uses identical source/content/occurrence identity; do not generate a new timestamp for retries.

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

## ECO-219 connected commission exposure

The Edge server advertises the same startup recovery instruction as released Node
commission delivery `a320b47`. Its no-argument `get_current_commission` reads the
existing admitted anchor `58ec9e33-1b29-4312-90b5-38df68f2064d` (optionally overridden
by nonsecret `ECB_CURRENT_COMMISSION_THOUGHT_ID`), using existing capability-guarded
`eco140_fetch_thought` and `ecb12_fetch_artifact` RPCs. It checks the current disposition,
projection contract, exact source digest and edition, then revalidates the head.
Missing, changed or unqualified bindings fail explicitly. Recovery performs no
search, embedding repair, installation or transition. Existing bearer authentication
and capture/fetch/search contracts are preserved. No new database grant is needed.

`current-commission.ts` is the read-only Edge adaptation of the released Node
module, using Web Crypto for SHA-256. Keep validation semantics aligned when changing
either implementation. The admitted anchor is navigation configuration, not a new
governing source. Server deployment, reflected client inventory and actual fresh-client
use require separate observations.

Verify with `deno test --config deno.json --allow-env --allow-net index.test.ts current-commission.test.ts`.


## Read-only workflow candidate — 16 October 2026

`workflow_inspect {}` calls the existing `ecb_workflow_inspect(p_cycle_id: null)`
facade and returns its native roots; `workflow_inspect {cycle_id: UUID}` reads the
same root or child records. No default cycle version or cached snapshot is supplied.
`workflow-inspection.ts` owns the shared Node/Edge inspection description,
annotations and sanitized failure contract. Node retains its existing per-client
`recover` challenge; Edge retains the existing single-Principal bearer recovery
boundary and runtime-key-guarded ordinary database client. This does not make Edge
an OAuth or multi-principal adapter. A future consumer policy must preserve those
identity distinctions. The Edge adapter has no workflow command port or tool.

Source audit: `sql/migrations/20261010221105_workflow_governance.sql` defines the
facade, asserts `ecb11.assert_runtime_key()`, and grants facade execution only to
`anon`/`authenticated` after revoking PUBLIC and service-role access. The internal
inspector is STABLE and reads cycles, debt, proposals, results, events and observer
ticks; its paid/evidence helpers and runtime guard read existing state. Observer
writes belong to the separate observer function and are not invoked by inspection.
This is a source-level read-only argument. Current deployed function definitions,
grants, Edge files/version and secrets configuration remain UNVERIFIED: management
`get_project`, `list_edge_functions`, `get_edge_function` and SQL definition recovery
were denied by the connected management action layer (`MCP -32600`). Do not treat
that as a database execution receipt, change grants or replay migration files.

Verification command from repository root:
`deno test --node-modules-dir=auto --allow-env --allow-net --config server/open-brain-mcp/deno.json server/open-brain-mcp/`.
The OAuth CI now selects Edge-only PR changes and runs every Edge test, alongside
Node workflow ingress tests. Test doubles prove dispatch/error behavior, not live
native state or deployed SQL identity.

### Exact activation and rollback package

1. Under supported existing management access, retrieve the current deployed
   `open-brain-mcp` files/version and verify its database facade/guard/grants against
   the inspected source. Compare the whole payload with this PR #108 candidate,
   including the existing commission recovery; preserve any newer live fixes.
   This retrieval is a release prerequisite, not a request to widen permissions.
2. Obtain explicit authorization for this exact Edge effect and app action refresh.
   Deploy only the reconciled Edge payload using the existing normal route and
   unchanged secrets. Do not deploy Vercel or remove production Git suppression.
   Preserve the retrieved prior payload/version for an authorized rollback.
3. Verify deployed file digests and `tools/list`: five tools, optional UUID
   `cycle_id`, read-only/non-destructive/idempotent annotations, no commands.
   Existing capture/fetch/search/commission contracts remain unchanged.
4. Through the approved managed-app refresh/publication surface, publish the bounded
   action diff; a new chat must actually expose and invoke `workflow_inspect {}`,
   then root `40ca3bbd-c905-4ec5-b202-bfb49fcd6605` and governor child
   `e6840c97-41ba-4978-880d-86573c2fbc9c`. Record actual edition/version, debt,
   scope decisions, proof, child returns and observer health. No root v8/22-debt
   historical receipt may be substituted for these reads.
5. Preserve BRAIN-first results and existing ECO-219/218/202 readbacks. Reconcile
   acceptance proposal source `70bcd368-368b-45d0-9fe2-cacf8fe57b5c` against actual
   current state only; do not submit or decide through an invented actor. Failure
   preserves the prior working BRAIN/mobile route and leaves only the affected
   exposure/native-reconciliation status pending.
