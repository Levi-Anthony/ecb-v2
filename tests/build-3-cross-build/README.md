STATUS: EXECUTABLE CROSS-BUILD REGRESSION AUTHORITY DISPOSITION: TEST_AUTHORITY
BUILD UNIT: BUILD 4 — enduring BUILD 3 projection

# BUILD 3 cross-build regression harness

This harness implements only the enduring BUILD 3 projection frozen in
`docs/acceptance-tests.md` under Worked Trace 06. It verifies that accepted
BUILD 3 behavior and invariants still hold in the lawfully expanded BUILD 4
substrate.

It is deliberately not a whole-schema snapshot. The BUILD 3 closure-state
assertions — the exact public table and function lists, and the one-Claim,
one-Link, four-Referent cardinalities — proved that BUILD 3 installed no
later-build machinery. They are not permanent prohibitions on an authorized
later Build Unit.

`tests/build-3/harness.ts` remains byte-frozen as BUILD 3 closure provenance and
is not re-run as a post-BUILD 4 gate.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. The
harness never prints the connection string or credentials.
