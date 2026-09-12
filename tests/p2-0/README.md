STATUS: EXECUTABLE P2.0 TEST AUTHORITY
DISPOSITION: TEST_AUTHORITY
BUILD UNIT: ECOS P2.0 — Projection and Boundary Harness

# P2.0 structural harness

This local harness validates the P2.0 projection and frozen acceptance matrix. It checks that:

- all 58 settled obligation rows carry the nine required mapping fields;
- owner, availability, enforcement/observation, failure route, and minimum reopen scope are populated;
- the current Build 2–10 capability projections do not claim uninstalled capabilities;
- all 16 required attack families carry every required fixture field;
- the zipper meta-test routes A downward, B locally, and C to a calibrated hold; and
- the P2.0 artifacts contain the runtime, database, legacy-import, recursion, and propagation
  prohibitions.

It does not connect to the database, exercise an SSMM runtime, inspect legacy source, or mutate any
canonical state.

Run from this directory:

```sh
deno task check
deno task test
```

A pass authorizes only `P2-ADVANCE` from the P2.0 documentation unit. P2.1–P2.5 remain gated by the
named substrate capabilities and their future acceptance evidence.
