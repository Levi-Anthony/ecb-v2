STATUS: EXECUTABLE CROSS-BUILD REGRESSION AUTHORITY DISPOSITION: TEST_AUTHORITY
BUILD UNIT: BUILD 5A — enduring BUILD 3 and BUILD 4 projection

# BUILD 3 + BUILD 4 cross-build regression harness

This harness implements only the enduring BUILD 3 and BUILD 4 projection frozen
in `docs/acceptance-tests.md` under Worked Trace 04. It verifies that accepted
BUILD 3 and BUILD 4 behavior still holds in the lawfully expanded BUILD 5A
substrate.

It is deliberately not a whole-schema snapshot. Closure-state assertions from
earlier Build Units — exact table and function lists, fixture counts, the Claim
column count, and the single-value standing constraint — proved that those Build
Units installed no later-build machinery. They are not permanent prohibitions on
an authorized later Build Unit.

One assertion is re-projected rather than preserved. BUILD 5A lawfully changes
Claim C's applied epistemic standing, so the enduring obligation is that C
retains its proposition, scope, kind, origin, and assertion time while its
applied standing equals whatever its recorded transition chain applies.

`tests/build-2/harness.ts`, `tests/build-3/harness.ts`,
`tests/build-4/harness.ts`, `tests/build-2-cross-build/harness.ts`, and
`tests/build-3-cross-build/harness.ts` remain byte-frozen Layer A provenance and
are not re-run as post-BUILD 5A gates.

Run from this directory:

```sh
deno task check
deno task test
```

`POSTGRES_URL` is loaded from the ignored repository-root `.env.local`. The
harness never prints the connection string or credentials.
