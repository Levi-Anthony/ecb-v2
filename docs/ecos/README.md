STATUS: ACTIVE
DISPOSITION: PROJECTION
ROLE: ECOS-over-ECB installation routing index
AUTHORITY: None independently; routes to the human-authorized Phase 2 Shape and ECB governing sources

# ECOS over ECB v2

This directory holds greenfield ECOS installation projections. It does not import or recreate legacy
ECOS, and it does not add a canonical state surface.

## Current installation state

```text
PHASE_2_SHAPE=SUFFICIENT_FOR_P2_0
P2_0_PROJECTION_BOUNDARY_HARNESS=CONSTRUCTED
P2_1_SSMM_RUNTIME=GATED
P2_2_CONTINUITY_REENTRY=GATED
P2_3_ACCESS_ENACTMENT=GATED
P2_4_RECURSION=GATED
P2_5_PROPAGATION=GATED
```

The build number attached to a dependency is a current projection. The named capability gate, not the
number, controls release.

## Read order

1. [`p2-0-projection-boundary-harness.md`](p2-0-projection-boundary-harness.md) — complete obligation,
   ownership, availability, projection, falsifier, and routing map.
2. [`p2-0-acceptance-matrix.md`](p2-0-acceptance-matrix.md) — frozen attacks for every required Phase 2
   test family.
3. [`p2-0-receipt.md`](p2-0-receipt.md) — documentation-only construction and verification evidence.
4. [`../../tests/p2-0/README.md`](../../tests/p2-0/README.md) — local structural verification of both
   artifacts.

P2.0 is a projection and boundary harness only. It creates no database object, SSMM runtime, alternate
memory, authority path, MCP inventory, dashboard, recursive mechanism, or propagation mechanism.
