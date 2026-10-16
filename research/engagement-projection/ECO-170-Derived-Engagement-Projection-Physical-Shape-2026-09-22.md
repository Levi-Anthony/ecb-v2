# ECO-170 — Derived Engagement Projection Physical Shape

**Date:** 22 September 2026 America/Phoenix  
**Register:** B  
**Standing:** frozen bounded physical design for ECO-170 implementation/probe; not production architecture acceptance.

## Decision

Implement the engagement projection as a **deterministic read model over explicit constituent records**.

No new canonical table, queue, workflow engine, session store, or production API is created by this Move. The projection is regenerable and disposable. A durable snapshot remains unearned unless the probe shows a reconstruction/audit requirement that cannot be met from constituent history.

## Evidence-bearing boundary

The real specimen is ECO-179. The probe binds:

- focal identity and seat/boundary;
- PGO;
- phase/stop;
- exact repository source blobs;
- orientation Resolution/qualification/currentness as separate fixture constituents shaped by ECO-150/151 and qualified as a mechanism family by ECO-152;
- authority as an independently variable constituent;
- dependency/applicability and QF/reentry state;
- compact interaction lineage.

The harness verifies the real ECO-179 repository source files by Git blob SHA from the candidate checkout. Linear issue/current-authority facts remain explicit constituents; they are not inferred from Git.

## Physical allocation

`tests/eco-170/engagement-projection.mjs`
: pure projection/recovery functions; no network or database writes.

`tests/eco-170/fixture.json`
: exact bounded specimen manifest and installation/standing distinctions.

`tests/eco-170/qualify.mjs`
: positive/negative/adversarial controls and machine-readable receipt.

`.github/workflows/eco-170-engagement-projection.yml`
: isolated GitHub Actions runner that checks out the exact candidate, runs qualification, uploads receipts/logs, and performs containment checks.

## Required controls

1. real authority absent;
2. fixture-only authority positive control;
3. material source change → local requalification/fence;
4. unrelated repository-head change does not invalidate exact unchanged sources;
5. newly relevant relation enters without focal substitution;
6. focal-grain change requires explicit refocus/new qualification;
7. PGO/frame change requalifies without rewriting source history;
8. qualification/warrant change remains distinct from authority;
9. authority revocation does not rewrite qualification;
10. phase change alone does not create authority;
11. dormant reentry signal means reconsider, not execute;
12. cold restart reconstructs the same projection;
13. representation/qualification/currentness/installation/authority/phase/source remain separately inspectable;
14. FCA positive utility: relation admission, directed constraint, visible state/uncertainty.

## Source-of-truth boundaries

- Linear controls commission/currentness/authority statements where explicitly established.
- Exact Git blobs control the repository artifacts bound into this specimen.
- ECO-152 is qualified isolated realization evidence, not production installation.
- ECO-156 is the interaction-surface Shape contract, not an installed production capability.
- The ECO-170 projection is a derived view only.

## Stop

Return to Shape only if the probe demonstrates that independent constituent identity/local invalidation cannot be preserved, or that a durable new source-of-truth mechanism is required.

Otherwise integrate the result, publish exact receipts, and stop before production promotion, merge/deploy, canonical runtime mutation, or real authority activation.
