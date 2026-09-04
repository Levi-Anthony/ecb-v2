STATUS: IMPLEMENTED — METABOLIZE AWAITING HUMAN CLOSURE 2026-09-04 AMERICA/PHOENIX
DISPOSITION: EVIDENCE
ROLE: BUILD 2 execution and acceptance receipt
AUTHORITY: Does not amend the Build Contract, invariants, acceptance fixture, or accepted ADRs

# BUILD 2 Receipt — Universal Referents

## Result

**PASS — frozen Worked Trace 02 completed. Human closure remains pending.**

BUILD 2 installed the identity-only Referent registry, same-UUID Thought coupling, atomic registration
trigger, activation interlock, and frozen least-privilege boundary in the one canonical Supabase brain.
No BUILD 3+ or deferred native-binding/refinement behavior was added.

## Release provenance

The human explicitly released implementation from:

- Shape commit: `866b3fcac248e667af80cee4e0e60e6d8ff07cfe`;
- Shape root tree: `d058b9f29fee15f9741512380cb5d17c5aac6d02`.

The release was reachable on `origin/main`, local `main` matched it, and the working tree was clean before
Move began.

## Installed migration

- canonical project: Supabase `ecb-v2-brain` (`vezxivrvhakclxuvxzso`);
- PostgreSQL: 17.6;
- migration: `20260904093341_build_2_universal_referents`;
- activation transaction time: `2026-09-04 09:49:34.052866+00`;
- migration history: the two closed BUILD 0 migrations followed by the single BUILD 2 migration.

The migration acquired `SHARE ROW EXCLUSIVE` on `public.thoughts` before creating the registry. It then
created and installed the invoker trigger, backfilled every existing Thought, registered the
registered-only fixture, installed the immediate restrictive foreign key, applied RLS and grants,
verified the resulting Shape, and committed.

## Canonical state

Independent post-deployment inspection established:

- public tables are exactly `thoughts` and `referents`;
- `public.referents` has exactly `id UUID PRIMARY KEY` and database-defaulted non-null
  `registered_at TIMESTAMPTZ`;
- the registry contains exactly two rows: GT01 and the registered-only fixture;
- the one existing Thought remains GT01 with its exact UUID, content, source, capture time, embedding
  model, and 384-dimensional embedding;
- GT01 and the registered-only fixture share the one activation transaction time;
- the registered-only fixture has no Thought;
- the absent, rollback, and concurrency probe UUIDs have no canonical rows; and
- no public view, resolver function, RPC, stored observation, or additional MCP tool exists.

## Structural and authorization verification

- `thoughts(id)` has one same-UUID foreign key to `referents(id)`, using immediate `NOT DEFERRABLE`
  `RESTRICT` behavior for update and delete;
- one row-level `BEFORE INSERT` trigger invokes a `SECURITY INVOKER` function with empty `search_path`;
- the trigger inserts only `NEW.id`, relies on the database default for `registered_at`, and has no
  conflict suppression;
- direct trigger-function execution is unavailable to `PUBLIC`, `anon`, and `authenticated`;
- Referent RLS is enabled with no policy;
- `anon` and `authenticated` have no Referent access; and
- `service_role` has Referent `SELECT` and column-level `INSERT(id)` only, with no table-level insert,
  `registered_at` insert, update, or delete capability.

The Supabase performance advisor returned no notices. The security advisor returned only
`rls_enabled_no_policy` at INFO level for `thoughts` and `referents`. This is intentional and required:
client roles have no grants or policies, while the server-side service role has only the frozen
least-privilege access.

## Worked Trace 02

The committed direct-database harness returned:

```json
{"suite":"build-2-universal-referents","result":"PASS","checks":["identity-spine-shape","same-uuid-coupling","invoker-registration-trigger","least-privilege-boundary","exact-uuid-observations","duplicate-registration-failure","registered-at-default-only","post-trigger-constraint-rollback","activation-write-interlock","probe-residue-absent"]}
```

It established:

- absent probe → `R=0,T=0` → `referent_not_registered(scope=thoughts)`;
- registered-only fixture → `R=1,T=0` → registered plus
  `native_binding.absent_in_scope(scope=thoughts)`;
- GT01 → `R=1,T=1` → registered plus `native_binding.present(type=thought)`;
- an attempted broken coupling is rejected by the foreign key;
- duplicate registration fails explicitly;
- a direct Thought writer queues behind `SHARE ROW EXCLUSIVE`, then proceeds through the installed
  trigger and foreign key to produce `R=1,T=1` inside its probe transaction;
- the empty-content rollback probe reaches the database, fires the `BEFORE INSERT` path, fails the
  existing `thoughts_content_nonempty` constraint, and leaves neither row; and
- all mutating acceptance probes roll back without canonical residue.

PostgreSQL logs contain the expected permission, duplicate-key, foreign-key, and nonempty-content
errors produced by these deliberate negative probes. They are acceptance evidence, not operational
failures.

## Closed-build regressions

- BUILD 0 local MCP suite: 6 passed, 0 failed;
- live deployed MCP: protocol initialization passed, exact tool inventory remained
  `capture_thought`, `fetch`, and `search`, and exact-UUID GT01 fetch passed;
- BUILD 1 fixture suite: 5 passed, 0 failed; and
- BUILD 1 deterministic trace generation: `PASS`, with no artifact drift.

No runtime, Edge Function, MCP, BUILD 1 evidence, Build Contract, invariant, glossary, ADR-003 semantic
decision, or BUILD 3+ surface changed.

## Metabolize disposition

Observed behavior matches the ratified semantic and physical Shape. No ADR-003 or ADR-004 reopening
condition was encountered. The registered-only row demonstrates that stable persisted identity and
exact-UUID addressability can precede description, classification, or an encountered native Thought
binding without creating semantic standing.

This receipt records PASS evidence only. It does not declare BUILD 2 closed, authorize BUILD 3, or
install a successor checkout. Those transitions remain on the human rail.
