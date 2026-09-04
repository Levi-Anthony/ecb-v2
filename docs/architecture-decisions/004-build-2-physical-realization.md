STATUS: ACCEPTED 2026-09-04
DISPOSITION: DECISION_RECORD

# ADR-004 — BUILD 2 physical realization

## CONTEXT

ADR-003 closes BUILD 2 semantics and selects the two-column identity spine. The checkout freezes atomic
activation, post-activation same-UUID coupling, least privilege, and exact-UUID acceptance observations,
but it does not select the physical mechanism that realizes them.

The current runtime inserts directly into `public.thoughts`. A trigger realization can preserve that
path. A transactional RPC would instead add a callable database surface, change runtime persistence,
and require a runtime deployment. A persistent resolver function or view would likewise add a database
surface that BUILD 2 does not need.

Activation also needs a write interlock. Transactional DDL and backfill alone do not prove that a
concurrent Thought insert cannot race through the pre-activation path.

## EVIDENCE CONSIDERED

The BUILD evidence ledger was consulted after its ingestion and before this decision closed. The
following candidate records intersect this physical Shape without governing or promoting themselves:

- E06: the post-activation `T=1, R=0` prohibition, atomic rollback, concurrency ordering, and access
  boundary are safety properties borne by constraints, transaction semantics, locking, and grants;
- E07 and E15: the migration's declarations are not their own receipt, so the acceptance harness must
  independently inspect the resulting schema, privileges, rows, and concurrent/rollback behavior;
- E10: the decision preserves the evidence, UUIDs, and explicit reopening routes needed to revisit the
  physical realization;
- E14: `native_binding.absent_in_scope(scope=thoughts)` remains a scoped harness observation, not a
  persisted assertion inferred from missing data;
- E17: database permission is not treated as warrant, standing, or governance authority; and
- E19: this local physical closure neither changes ADR-003's parent semantics nor authorizes Move.

No record supplies evidence requiring a broader registry, resolver, runtime surface, or BUILD 3+
mechanism. Their promotion statuses remain unchanged.

## LOCAL DECISION

BUILD 2 SHALL use one imperative migration and no runtime or MCP change.

### Registration trigger

Create one row-level `BEFORE INSERT` trigger on `public.thoughts`. Its trigger function SHALL:

- run as `SECURITY INVOKER` with an empty `search_path` and schema-qualified object references;
- insert only `NEW.id` into `public.referents`;
- rely on the database default for `registered_at`;
- contain no `ON CONFLICT`, merge, binding, or entity-resolution behavior; and
- return `NEW` after successful registration.

The trigger function is coupling machinery, not a resolver or callable application API. Revoke direct
`EXECUTE` from `PUBLIC`, `anon`, and `authenticated`.

A fresh Thought UUID therefore registers and commits atomically with its Thought. If the Thought insert
later fails, the trigger insert rolls back with the statement/transaction. If the UUID is already
registered without a Thought, the registry primary key rejects the trigger insert; BUILD 2 does not
attach the Thought or implement the deferred binding lifecycle.

The existing direct Thought runtime and the MCP tool inventory remain unchanged.

### Registry and privileges

`public.referents` retains exactly the ADR-003 columns. `registered_at` has a database default of
`transaction_timestamp()`.

Enable RLS with no policies. Revoke table privileges from `PUBLIC`, `anon`, and `authenticated`.
Revoke the default broad `service_role` privileges, then grant only:

- `SELECT` on `public.referents`; and
- column-level `INSERT (id)` on `public.referents`.

Do not grant registry `UPDATE` or `DELETE`. The service role cannot supply or backdate
`registered_at`; the invoker trigger succeeds using the same bounded column privilege.

### Same-UUID foreign key

Add a foreign key from `public.thoughts(id)` to `public.referents(id)`. Its consequential behavior is:

- same UUID on both sides;
- immediate and `NOT DEFERRABLE`;
- no cascade, set-null, or set-default action on parent update or deletion; and
- a parent-key mutation or deletion with a dependent Thought is rejected before the statement commits.

`RESTRICT` and immediate `NO ACTION` spellings are conforming only when they produce those same
observable ordering and deletion results. Constraint and trigger names are not architectural.

### Activation interlock and order

The migration SHALL execute as one transaction in this order:

1. `BEGIN`;
2. acquire `SHARE ROW EXCLUSIVE` on `public.thoughts` before any activation change;
3. create `public.referents` with its database-assigned transaction-time default;
4. create and install the registration trigger;
5. backfill every then-existing Thought UUID into `public.referents`;
6. insert registered-only fixture `2eede0e4-b27a-4383-850e-a448f0113c9f`;
7. install the immediate, non-deferrable, non-cascading same-UUID foreign key;
8. enable RLS, install the exact grants, and verify the schema/coupling/privilege shape; and
9. `COMMIT`.

The lock is held through commit. `SHARE ROW EXCLUSIVE` permits ordinary reads but conflicts with the
`ROW EXCLUSIVE` lock taken by Thought inserts. A queued Thought writer may resume only after the
transaction has committed the trigger, backfill, fixture, foreign key, and authorization boundary.

The registered-only fixture belongs inside activation. It is not post-activation acceptance setup.

### Exact-UUID observation

Worked Trace 02 SHALL use acceptance-harness exact-UUID existence queries only. Do not create a SQL
resolver function, view, RPC, stored observation, or MCP tool. The harness derives the frozen `R`/`T`
classification from `public.referents` and the current Thought surface.

No JSON payload, SQLSTATE translation, or client-facing serialization contract is created. Duplicate
registration still fails explicitly, but BUILD 2 has no production Referent API whose error envelope
requires freezing.

### Rollback and concurrency proofs

The atomicity probe SHALL use explicit UUID `09eb6cc9-b204-4a6d-a1a4-b62fafcf8141` and a direct database
Thought insert that fires the registration trigger, then fails the existing nonempty-content constraint.
The probe must establish that the trigger attempted registration and that neither row remains.

The activation-concurrency probe SHALL use explicit UUID
`93d06071-b8aa-4b2d-b20d-99d2d6fc1ed7` in a second database session. It must demonstrate that a Thought
insert queues behind the activation lock and, after activation commits, proceeds only through the
installed trigger and foreign key. The probe transaction then rolls back so it creates no canonical
fixture beyond those frozen by Worked Trace 02.

A pre-database embedding failure does not satisfy the rollback proof.

## WHY REQUIRED NOW

Without this decision, trigger and RPC implementations can both claim conformance while producing
different database objects, runtime deployments, direct-insert behavior, and privilege surfaces.
Resolver functions/views and acceptance-only queries can likewise produce different persistent state.
An activation without an explicit write interlock can also pass a quiescent test while remaining unsafe
under a concurrent Thought insert.

These differences bear directly on persistent state, transition semantics, authorization, and
acceptance evidence. They must close before implementation release.

## ALTERNATIVES CONSIDERED

### Transactional RPC

Rejected for BUILD 2. It would replace the existing direct Thought insert path, add a callable database
surface, require runtime changes and deployment, and grant no acceptance behavior unavailable through
the invoker trigger.

### Persistent resolver function, view, or RPC

Rejected. Exact-UUID observation is acceptance behavior only. A persistent resolver would add an
unearned production surface and, for a view, another RLS/privilege seam.

### Activation without an explicit write interlock

Rejected. It does not prove that the historical direct insert path cannot race the backfill/coupling
transition.

### `ACCESS EXCLUSIVE` activation lock

Rejected as broader than required. `SHARE ROW EXCLUSIVE` blocks modifying statements while allowing
ordinary reads during the bounded activation transaction.

## INVARIANTS AFFECTED

- identity ≠ description;
- thought ≠ promoted object;
- capability ≠ warrant or authorization;
- no consequential transition depends solely on remembered instruction;
- type-specific content remains in its native record; and
- after activation, committed `T=1, R=0` is structurally impossible.

## STANDING / AUTHORITY

The human explicitly selected this bounded physical realization on 2026-09-04 and withheld BUILD 2
implementation release pending its ratification. ADR-003 remains the semantic authority; this ADR
selects only the physical mechanism needed to realize its already-frozen behavior.

This acceptance does not authorize implementation, migration application, runtime deployment, or
database mutation.

## REVERSIBILITY

Before implementation this decision is documentation-only. After activation, removing the trigger,
foreign key, privileges, or registry would weaken or erase the installed identity guarantee and
requires a separately governed migration. The existing runtime code remains unchanged and therefore
needs no rollback deployment.

## REOPENING CONDITION

Reopen before implementation if the selected invoker trigger cannot execute using only column-level
`INSERT (id)`, if `SHARE ROW EXCLUSIVE` does not demonstrably queue the current Thought write path until
activation commits, or if the frozen rollback/concurrency probes cannot be executed without persistent
state beyond Worked Trace 02.

Reopen after release if a Thought can commit without its same-UUID Referent, a failed Thought insert can
leave its trigger-created Referent committed, a queued writer can bypass the installed trigger/coupling,
or the exact grants expose registry access outside the server-side service-role boundary.

## SOURCES

- [PostgreSQL 17 explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html)
- [PostgreSQL 17 `CREATE TRIGGER`](https://www.postgresql.org/docs/17/sql-createtrigger.html)
- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
- [Supabase database functions and function security](https://supabase.com/docs/guides/database/functions)
- [Supabase Row Level Security and grants](https://supabase.com/docs/guides/database/postgres/row-level-security)
