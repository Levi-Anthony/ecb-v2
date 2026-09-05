STATUS: EXECUTABLE TEST AUTHORITY DISPOSITION: TEST_AUTHORITY BUILD UNIT: BUILD
5A — Immutable Events + Standing Transition History

# BUILD 5A canonical acceptance harness

This harness executes frozen Worked Trace 04 directly against the canonical
PostgreSQL boundary. It derives exact-UUID observations from
`public.claim_standing_transitions`, `public.claims`, `public.evidence_links`,
and `public.thoughts`; it does not create a resolver function, view, RPC, stored
observation, or MCP surface.

It independently reimplements `ecb_thought_revision_v1_sha256` and asserts that
the database-derived observed revision agrees with it. Its mutation probes are
transactionally rolled back and leave no canonical fixture beyond transition TR1
installed by the BUILD 5A activation migration.

A BUILD 5A Event is not a Transformation Receipt. This harness asserts
transition integrity, not independent verification, acceptance, or receipt
standing; those belong to BUILD 5B.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. The
harness never prints the connection string or credentials.
