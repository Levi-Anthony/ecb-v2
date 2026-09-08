# BUILD 6 qualification — staged Move

Status: **CONSTRUCTED / NOT YET EXECUTED** until a disposable PostgreSQL 17 accepted predecessor and the required HTTP/WebAuthn runtime are available.

This suite implements the released BUILD 6 acceptance matrix without changing historical BUILD 0–5B suites. Synthetic credentials prove database mechanism behavior only; they never stand for Levi and must never be copied into canonical authority.

## Required order

1. Start from an isolated PostgreSQL 17 predecessor containing the accepted BUILD 0–5B migrations.
2. Apply `sql/migrations/20260908013000_build_6_governance_bootstrap.sql` and the construction correction `20260908013100_build_6_setup_recovery_surface.sql` only to that disposable target.
3. Run `npm test` / `npm run qualify` with `BUILD6_DATABASE_URL` pointing to the disposable administrator connection.
4. Run the protected human-service build/source checks against the same isolated state.
5. Record physical iPhone/Mac and real deployment checks separately; synthetic WebAuthn cannot satisfy those observations.
6. Do not contact canonical BUILD 6 state until the released qualified-deployment gate is satisfied.

## Pressure matrix

The executable suite must distinguish both the valid case and its violating control for all released pressures:

| Pressure | Required evidence |
|---|---|
| duplicate/replay | exact retry recovers; changed input conflicts; one genesis/successor only |
| concurrency | competing genesis/succession and withdrawal/execution serialize; commit and rollback branches observed |
| stale state/basis | current predecessor succeeds; stale predecessor/binding rejects |
| partial failure/rollback | precommit failure leaves no partial active governance; postcommit lost ack reconstructs exact success |
| restart/reconstruction | fresh client reconstructs subjects, binding, current policy, exhaustion, pending/outcome state |
| wrong identity/role | verifier/executor grant surfaces differ; arbitrary/spoofed credential/session/origin/UV controls reject |
| wrong version | exact P0/profile accepted; changed bytes, duplicate keys, unknown fields, wrong types/order and cross-scope controls reject |
| withdrawal/revocation | unwithdrawn decision executes; withdrawal wins or reports already executed; logout does not revoke past grant |
| checker bypass | direct table/internal function access is absent for runtime/API roles; generated prose has no effect |
| retry/idempotency | same request/input recovers; same request/different input conflicts; scope-locked absence is explicit |
| time/order | decision must be committed in a prior top-level transaction; savepoint/same transaction cannot authorize effect |
| unauthorized mutation | ordinary roles cannot alter H/remit/history/bootstrap or issue human decisions |

## Explicitly separate observations

These remain **UNRUN** until actually observed:

- native iPhone passkey registration and authentication;
- native Mac/passkey behavior if used;
- synced/backup credential behavior and which loss mode it actually covers;
- HTTPS/custom-domain deployment on `ecos.effortlessconnection.com`;
- actual production credential/tool exclusion for the ordinary operating model;
- canonical M2 activation and reconstruction;
- the first human P1 decision under operative P0;
- human Metabolize/BUILD 6 closure.

An unrun observation is not a FAIL and never becomes a PASS by documentary completeness.

## Current construction note

The runtime-boundary proposal described one private-schema migration. Construction exposed one recovery omission after the initial migration was persisted: interrupted setup could not recover the native credential Referent IDs needed for exact binding. That was repaired as a second migration rather than silently rewriting already-pushed evidence. Before the final installation artifact is frozen, either consolidate the two construction files into one exact migration or explicitly disposition this packaging deviation. No authority semantics changed.
