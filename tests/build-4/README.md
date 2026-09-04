STATUS: EXECUTABLE TEST AUTHORITY DISPOSITION: TEST_AUTHORITY BUILD UNIT: BUILD
4 — Typed Relation Claims

# BUILD 4 canonical acceptance harness

This harness executes frozen Worked Trace 06 directly against the canonical
PostgreSQL boundary. It derives exact-UUID observations from `public.claims`,
`public.evidence_links`, `public.referents`, and `public.thoughts`; it does not
create a resolver function, view, RPC, stored observation, or MCP surface.

The harness verifies the bounded BUILD 4 expansion, the kind-exclusive Claim
shape, direction, predicate and claim-kind vocabularies, the predicate-scoped
self-relation prohibition, endpoint Referent addressing, native-binding
disappearance, multiplicity, least privilege, and the absence of co-reference or
model-authority surfaces. Its mutation probes are transactionally rolled back
and leave no canonical fixture beyond Claim C2 and relation Claim R installed by
the BUILD 4 activation migration.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. The
harness never prints the connection string or credentials.
