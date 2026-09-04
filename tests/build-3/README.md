STATUS: EXECUTABLE TEST AUTHORITY DISPOSITION: TEST_AUTHORITY BUILD UNIT: BUILD
3 — Claims + Standing + Evidence Links

# BUILD 3 canonical acceptance harness

This harness executes frozen Worked Trace 03 directly against the canonical
PostgreSQL boundary. It independently encodes and hashes Thought revisions,
derives the four machine-legible evidence observations, and attacks the frozen
caller-forgery, mutation, disappearance, non-cascade, authorization, and
transaction-race falsifiers.

All mutating probes run in transactions that roll back. The only canonical BUILD
3 fixtures are Claim C and Evidence Link L installed by the authorized
migration.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. The
harness never prints the connection string or credentials.
