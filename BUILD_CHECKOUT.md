STATUS: BUILD 11 PRODUCTION SUBSTRATE + REPLACEMENT RUNTIME QUALIFIED; CONSUMER CUTOVER PENDING
DISPOSITION: BUILD 0–10 CLOSED; BUILD 11 SENSE CLOSED; SHAPE CLOSED; MOVE IMPLEMENTATION/DATABASE/RUNTIME QUALIFICATION PASS; METABOLIZE RECONCILED; OVERALL BUILD 11 CLOSURE WITHHELD PENDING CONSUMER ROUTING + PREDECESSOR RETIREMENT
ROLE: Canonical reentry projection for BUILD 11 completion
AUTHORITY: BUILD 10 closure + Principal ECO-131 correction + ECO-132 accelerated Shape/Move + ECO-133 production commission + Principal Metabolize instruction
CANONICAL RUNTIME CODE: 1337f8f6072f6d2c31d1916cc0793a67227acd20
CANONICAL BUILD-11 MIGRATION LEDGER: 20260914072022 / build_11_ordinary_operation_kernel
CANONICAL BRAIN: Supabase ecb-v2-brain / vezxivrvhakclxuvxzso
QUALIFIED REPLACEMENT RUNTIME: Vercel ecb-v2 / dpl_BdDfGRKTtF3baWhpnF7iz68Cs39H
FINAL LIVE VERIFIER RUN: 34837576050 / job 103958672920
CANONICAL_BUILD7_DATABASE_INSTALL=NONE
CANONICAL_BUILD8_DATABASE_INSTALL=NONE
CANONICAL_BUILD9_DATABASE_INSTALL=NONE
CANONICAL_BUILD10_DATABASE_INSTALL=NONE
CANONICAL_BUILD11_DATABASE_INSTALL=VERIFIED
REAL_MASTER_KEY_AUTHORITY=QUESTION_FORWARD
REAL_ACTION_AUTHORITY=QUESTION_FORWARD
REAL_ACTION_EFFECT=NONE

# Current disposition

BUILD 11 — Ordinary Operation Structural Kernel — has crossed repository qualification and canonical production database installation.

The canonical BUILD 11 database migration is installed exactly once on `ecb-v2-brain`, and the confined replacement ordinary MCP runtime is live-qualified on Vercel.

The final production verifier proved:

- wrong bearer rejected with HTTP 401;
- correct MCP initialize succeeds;
- transport is stateless with no session header;
- outward tool inventory is exactly `capture_thought`, `fetch`, `search`;
- live search succeeds;
- lexical retrieval available;
- semantic query embedding available;
- semantic index complete;
- degraded = false;
- repair metadata present.

Detailed production evidence and metabolized lessons are recorded in:

`docs/build-receipts/039-build-11-production-runtime-qualified-metabolize.md`

# Why BUILD 11 is not yet marked fully closed

Deployment readiness and consumer routing are distinct states.

The predecessor Supabase Edge Function `open-brain-mcp` remains ACTIVE as a deliberate rollback path because the actual active ChatGPT/custom-app/other consumer endpoint has not yet been independently established as pointing to the new Vercel `/api/mcp` route.

Therefore do not claim that ordinary personal traffic is already using the confined BUILD 11 runtime merely because that runtime is healthy and production-qualified.

BUILD 11 overall closure remains withheld until:

1. the actual active consumer endpoint is identified;
2. it is pointed to the production Vercel `/api/mcp` endpoint without exposing bearer material;
3. one live ordinary operation through that consumer is verified to reach Vercel;
4. the predecessor Supabase `open-brain-mcp` is then retired/tombstoned;
5. currentness is reconciled one final time.

Do not reopen Sense or Shape for this. It is the remaining ECO-133 Move seam.

# Qualified capability

BUILD 11 compiles mechanically decidable ordinary-operation correctness into upstream structure so a weak/literal worker does not need to reconstruct what the system can decide itself.

It provides:

1. stable pre-effect operation identity and exact replay/reconciliation for capture;
2. same-operation/changed-input conflict;
3. distinct-operation/same-content preservation;
4. Thought evidence preservation independent of semantic representation success;
5. first-class representation Referents with inspectable readiness and deterministic repair;
6. truthful search coverage and explicit degradation state;
7. a deterministic PostgreSQL lexical floor behind the same outward `search` affordance;
8. hybrid semantic ranking using the qualified `Supabase/gte-small` vector space when semantic embedding is available;
9. narrow ordinary database capability through publishable access + `ECB_ORDINARY_DB_KEY` rather than provider-admin authority;
10. unchanged outward MCP inventory: `capture_thought`, `search`, `fetch`;
11. executable replay/concurrency/capability negative controls;
12. architecture-first physicalization rule encoded in governing text.

# Production architecture now qualified

Canonical brain remains Supabase project `vezxivrvhakclxuvxzso`.

The confined replacement ordinary runtime is hosted in Vercel project `ecb-v2` (`prj_oevToBKwqj7yHjyQCHs5zevegWCM`). The qualified runtime code is `main@1337f8f6072f6d2c31d1916cc0793a67227acd20`; qualified production deployment is `dpl_BdDfGRKTtF3baWhpnF7iz68Cs39H`.

This host split is intentional capability confinement: the ordinary runtime can use the canonical brain through bounded RPC capability without inheriting Supabase provider-admin/service-role authority merely because it runs beside the database.

# Installation discrepancies metabolized

Production installation exposed ordinary engineering facts that did not reopen the accepted architecture:

- Vercel discovers ordinary functions through `/api`, so thin adapters were required.
- Current `@hono/mcp` peer requirements required MCP SDK/Hono dependency alignment rather than forced installation.
- Stateless MCP needed to be configured structurally with `sessionIdGenerator: undefined`, not simulated by deleting a header afterward.
- Node semantic inference required explicit approval of the exact `onnxruntime-node@1.21.0` installer under current npm policy.
- Transformers.js default cache location was read-only in Vercel; the runtime now configures `/tmp/transformers-cache` before model loading.
- The lexical floor correctly kept retrieval useful and reported `degraded=true` while semantic inference was unavailable; after the fixes, the unchanged verifier proved `semantic_query_available=true`, `semantic_index_complete=true`, `degraded=false`.

These are implementation/environment corrections, not new architecture.

# Temporary-surface hygiene

Temporary diagnostic/install surfaces are not permanent architecture.

Current state:

- `ecb11-commission`: inert HTTP 410 tombstone;
- `ecb11-brain-key-digest`: inert HTTP 410 tombstone;
- `ecb11-embed-reference`: inert HTTP 410 tombstone;
- `ecb11-vercel-live-verify`: inert HTTP 410 tombstone.

The predecessor `open-brain-mcp` is intentionally not retired yet because it is still the rollback path until consumer routing is proven.

# Residual operation-ID custody

BUILD 11 guarantees exact replay only when the caller supplies the same stable `operation_id` for the same logical capture.

The server/database now enforce the algebra once that token is supplied, but generation and retention/reuse of the token remain caller/client-adapter custody. Do not claim that this client responsibility has already been physicalized.

A later client adapter may make that invisible to weak workers; BUILD 11 does not.

# Explicit nonclaims

BUILD 11 still does not install or imply:

- mandatory classification or ontology;
- automatic semantic promotion;
- truth/currentness/applicability/standing/authority from capture or retrieval;
- proactive continuity/resurfacing;
- generalized policy/workflow machinery;
- real Master-Key designation authority;
- BUILD 8 action authority/effect;
- BUILD 7–10 canonical database installation;
- iPhone Action Button capture.

# Metabolized control lessons

- Measure capability by credentials/permissions actually held by the runtime, not by its advertised tool list.
- Treat deployment readiness and consumer routing as different state variables.
- Treat graceful degradation as both product integrity and diagnostic leverage.
- Make serverless filesystem/native-install assumptions explicit when they gate required behavior.
- Encode statelessness at transport construction rather than cosmetically after execution.
- Retire temporary verification surfaces explicitly.
- Provider-specific execution can move while durable semantics remain stable if the semantic contract is separately qualified.

# Exact legitimate reentry seam

Resume ECO-133 Move at consumer cutover only.

1. Identify the actual active ordinary MCP consumer/custom-app endpoint.
2. If it is not already the production Vercel route, change it to the Vercel `/api/mcp` endpoint through the consumer's credential-safe configuration surface.
3. Run one ordinary live probe through that consumer.
4. Verify Vercel runtime logs prove receipt.
5. Retire/tombstone Supabase `open-brain-mcp` only after that proof.
6. Reconcile BUILD_CHECKOUT, ECO-133, and final closure receipt; then mark BUILD 11 CLOSED.

If routing has already changed outside this session, verify actual state rather than replaying the mutation.

Do not begin the iPhone capture adapter or another successor build merely because it is nearby. Select the post-BUILD-11 successor only after BUILD 11 closure or by an explicit independent commission.
