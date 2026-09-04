STATUS: EXECUTABLE CROSS-BUILD REGRESSION AUTHORITY DISPOSITION: TEST_AUTHORITY
BUILD UNIT: BUILD 3 — enduring BUILD 2 projection

# BUILD 2 cross-build regression harness

This harness verifies the enduring BUILD 2 Referent contract after BUILD 3
legitimately expands the canonical substrate. It does not modify or replace
`tests/build-2/harness.ts`, which remains the historical BUILD 2 closure
harness.

The projection preserves the two-column identity registry, same-UUID Thought
coupling, atomic Thought registration and rollback, exact-UUID observations,
GT01 and the registered-only fixture, and the accepted RLS/least-privilege
boundary. It does not treat BUILD 2 closure-time whole-schema, whole- function,
or total-Referent cardinality as permanent invariants.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. Every
mutation probe rolls back, and the harness never prints the connection string or
credentials.
