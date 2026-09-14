STATUS: BUILD 11 MOVE QUALIFIED — PRODUCTION INSTALLATION UNPERFORMED
DISPOSITION: BOUNDED REGISTER-B ORDINARY-OPERATION STRUCTURAL KERNEL PASSED DISPOSABLE QUALIFICATION
STATE EFFECT: PROOF / REENTRY RECORD ONLY
CANONICAL BUILD 11 DATABASE INSTALL: NONE
METABOLIZE / CLOSURE: UNOPENED

# BUILD 11 Move qualification receipt

## 1. Authority and scope

BUILD 11 — Ordinary Operation Structural Kernel — was opened under Linear ECO-132 after the Principal's explicit accelerated disposition:

> **Structural and architectural enforcement does not need to pass some evidence boundary. Lean forward. Build it.**

This receipt records the qualified repository candidate only. It does not install the migration, deploy the runtime, commission the production capability secret, close BUILD 11, or install BUILD 7–10.

The candidate branch is:

`build/eco-132-build-11-ordinary-operation-kernel`

The qualified candidate commit is:

`c2054218f51c717f1d226baa0004ac737f4b2311`

Pull request:

`#33 — BUILD 11: compile ordinary operation structural kernel`

## 2. Bounded capability exercised

The qualified candidate compiles the following mechanically decidable obligations into structural enforcement:

1. stable pre-effect operation identity for ordinary capture;
2. deterministic same-operation replay and changed-input conflict;
3. intentional same-content captures under distinct operation identities remain distinct encounters;
4. canonical Thought evidence admission is independent of semantic-embedding success;
5. derived semantic representations are separate persistent Referents;
6. missing representations are independently detectable and have a deterministic repair route;
7. ordinary search has a PostgreSQL lexical floor and semantic ranking when available behind one outward `search` affordance;
8. search exposes semantic coverage/degradation instead of silently treating incomplete representation coverage as normal;
9. ordinary runtime database capability is narrowed to anon/publishable access plus secret-gated `ecb11_*` security-definer RPCs and no longer requires `SUPABASE_SERVICE_ROLE_KEY` in the deployed MCP runtime;
10. the outward MCP inventory remains exactly `capture_thought`, `search`, and `fetch`;
11. governing text now distinguishes architecture-first structural warrant from empirical recurrence requirements.

## 3. Disposable proof environment

GitHub Actions workflow:

`BUILD 11 ordinary operation kernel`

Accepted successful run:

`34815251896`

Job:

`qualify / 103884476515`

The workflow reconstructed the accepted BUILD 0–5B predecessor, installed accepted BUILD 6 into disposable PostgreSQL 17 + pgvector, applied the BUILD 11 candidate migration, ran database structural qualification and concurrency tests, verified the runtime source no longer depends on `SUPABASE_SERVICE_ROLE_KEY`, and ran Deno formatting, type checking, and MCP tests.

Every workflow step completed successfully.

## 4. Structural and negative-control results

### Database composition

PASS — BUILD 11 migration applied to reconstructed BUILD 0–6 predecessor without requiring BUILD 7–10 installation.

### Existing evidence preservation

PASS — existing BUILD 0 semantic representation was migrated from the Thought row into first-class representation storage before the old embedding columns were removed.

### Universal Referent coupling

PASS — persistent first-class ordinary-operation and representation subjects were registered as Referents; qualification rejected uncoupled subjects.

### Exact capture replay

PASS — one operation identity + one exact request produced one durable Thought and one operation record; exact replay returned the same Thought rather than creating a second effect.

### Changed-input replay conflict

PASS — reusing the same operation identity with materially changed input was structurally rejected.

### Intentional repeated content

PASS — a different operation identity with identical content produced a distinct Thought/encounter.

### Concurrency

PASS — two concurrent invocations carrying the same operation identity serialized to one effect. One invocation committed and one reconciled as replay; both returned the same Thought identity.

### Preservation / representation separation

PASS — database capture created canonical Thought evidence without requiring a semantic representation row.

### Representation readiness / repair

PASS — missing representations were independently discoverable, could be stored through the bounded repair RPC, and fetch reported readiness truthfully.

### Deterministic retrieval floor

PASS — lexical search returned evidence while semantic query embedding was absent and the response reported degraded coverage plus the missing-representation count.

### Capability topology

PASS — the anon role had no direct INSERT privilege on Thoughts, ordinary operations, Thought representations, Claims, or Evidence Links; it could invoke only the bounded ordinary RPC surface and could not commission its own runtime capability.

PASS — source qualification verified the ordinary MCP runtime has no `SUPABASE_SERVICE_ROLE_KEY` dependency and instead requires `SUPABASE_ANON_KEY` plus `ECB_ORDINARY_DB_KEY`.

### MCP surface and degraded-provider behavior

PASS — Deno format/typecheck/tests verified exactly three outward tools; capture is explicitly idempotent by operation identity; an embedding-provider failure after durable admission returns the preserved Thought with representation-not-ready rather than falsely reporting capture loss; search falls back to lexical retrieval and reports degraded semantic coverage.

## 5. Proof sensitivity

The qualification includes contract-relevant negative controls rather than happy-path checks alone:

- wrong runtime capability secret is rejected;
- second commissioning attempt is rejected;
- changed-input operation replay is rejected;
- anon direct Layer-B mutation privileges are absent;
- operation / Thought / representation identities must remain distinct;
- provider failure is injected after preservation;
- semantic query unavailability is injected while lexical retrieval remains operative;
- concurrent duplicate operation execution is exercised.

The first workflow run also exposed a qualification mistake: the test attempted a direct anon read from `ordinary_operations`, which was correctly denied by the intended capability topology. The test was corrected to obtain the qualification-only identity outside the anon role rather than weakening the runtime privilege boundary.

## 6. Governing correction carried by the candidate

The candidate amends the Structural Leverage invariant and Build Contract narrowly:

- philosophical importance alone still does not justify machinery;
- empirical recurrence remains one valid source of architectural warrant, not a mandatory prerequisite;
- a ratified architectural obligation that is mechanically decidable and consequential at the active resolution may directly justify the smallest bounded deterministic enforcement;
- QLLST / Question Forward remain orientation and unresolved-structure grammar, not waiting gates that manufacture uncertainty around an already-settled structural requirement;
- semantic freedom remains where interpretation is itself decision-relevant.

## 7. Explicit nonclaims

This qualification does not establish:

- canonical production database installation;
- production Edge Function deployment;
- production capability-secret commissioning or cutover;
- hostile database-owner defense;
- BUILD 7–10 canonical installation;
- real Master-Key authority;
- real action authority/effect;
- semantic truth/currentness/applicability from retrieval;
- automatic classification, mapping, routing, promotion, or continuity/resurfacing;
- universal operation semantics for all consequential domains;
- autonomous background representation repair;
- unrestricted scalability or performance beyond the bounded personal-operation target.

## 8. Installation boundary

The first remaining significant boundary is canonical production installation/cutover:

1. apply the BUILD 11 migration to the canonical ECB v2 database from its current BUILD 0–6 installed state;
2. commission one production `ECB_ORDINARY_DB_KEY` through the admin-only seam;
3. install that key plus `SUPABASE_ANON_KEY`, `SUPABASE_URL`, and existing `ECB_BRAIN_KEY` into the ordinary MCP runtime;
4. deploy the BUILD 11 MCP runtime;
5. verify live capture/replay/search/fetch behavior;
6. remove `SUPABASE_SERVICE_ROLE_KEY` from the ordinary runtime environment if still present;
7. verify direct unrelated Layer-B mutation remains unavailable to the ordinary runtime.

The secret value must not be printed or committed. If the available tooling cannot identify and mutate the exact canonical project/runtime without ambiguity, stop rather than guessing.

## 9. Current disposition

BUILD 11 Move has a coherent, fully green disposable Register-B candidate at:

`c2054218f51c717f1d226baa0004ac737f4b2311`

Repository merge/canonicalization may proceed under the existing accelerated Move authorization.

Production installation remains `NONE` until the explicit installation/cutover steps above are successfully completed.

Metabolize / closure remain unopened by this receipt.
