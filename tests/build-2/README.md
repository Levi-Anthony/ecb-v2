STATUS: EXECUTABLE TEST AUTHORITY DISPOSITION: TEST_AUTHORITY BUILD UNIT: BUILD
2 — Universal Referents

# BUILD 2 canonical acceptance harness

This harness executes frozen Worked Trace 02 directly against the canonical
PostgreSQL boundary. It derives exact-UUID observations from `public.referents`
and `public.thoughts`; it does not create a resolver function, view, RPC, stored
observation, or MCP surface.

The harness verifies the deployed schema, trigger, foreign key, RLS/policy
state, and exact role grants. Its mutation probes are transactionally rolled
back and leave no canonical fixture beyond the registered-only UUID installed by
the BUILD 2 activation migration.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. The
harness never prints the connection string or credentials.
