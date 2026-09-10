STATUS: BUILD 6 MOVE IN PROGRESS — SUPPLEMENTAL CONCURRENCY READINESS QUALIFIED
DISPOSITION: EVIDENCE / MOVE RECEIPT
DATE: 2026-09-07 America/Phoenix

# BUILD 6 supplemental readiness concurrency qualification

## Observation

The independently requalified selected BUILD 6 candidate was exercised on a fresh GitHub-hosted PostgreSQL 17 environment with a supplemental test layer for the two released concurrency observations that were absent from the retained 24-test suite.

The retained candidate qualification ran first and remained green. The supplemental test was separate from the retained 24-test source and changed no BUILD 6 implementation or migration bytes.

## Exact implementation boundary

- current continuation branch: `reconcile/build-6-tested-move`
- selected tested source SHA: `afdd7dcab90afc3ece5de43a0016c7688db96ea4`
- selected migration: `sql/migrations/20260907234712_build_6_governance_bootstrap.sql`
- selected migration SHA-256: `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`
- supplemental test: `tests/build-6/readiness-races.test.mjs`
- implementation/migration semantics changed for this qualification: NO

## Runner evidence

- GitHub Actions workflow: `BUILD 6 tested candidate disposable PG17`
- run ID: `34191975800`
- run number: `11`
- trigger PR: `#23` (disposable; not for merge)
- workflow merge ref: `4ccbd1a4dc8f9a1d627e2c2c7b3509f78f40353e`
- PostgreSQL image: `pgvector/pgvector:0.8.2-pg17`
- Node: `v24.20.0`
- baseline receipt observed at: `2026-09-08T05:47:48.368Z`
- baseline retained qualification: 24 PASS / 0 FAIL
- supplemental suite: 7 PASS / 0 FAIL
- uploaded artifact ID: `10042526055`
- uploaded artifact ZIP SHA-256: `e4df20acacbb5dc1194f6332e292335caab71a1ea83d1bbbb3d1dfe062e789b4`

## Supplemental observations

All contested paths explicitly observed PostgreSQL blocking rather than relying on sleeps or assumed ordering.

1. Two distinct succession grants against one current predecessor serialized through the scope lock. When the first effect committed, the blocked competing effect rejected as `stale_predecessor`; exactly one successor transition existed.
2. With the same two-grant setup, when the first effect rolled back, the blocked competing effect committed and became the sole successor; the rolled-back transition did not survive.
3. Logout acquired the serialization boundary before a competing admission. When logout committed, the blocked admission rejected with `session_required` and created no decision.
4. When that first logout rolled back, the blocked admission proceeded and the session remained valid.
5. When admission acquired the serialization boundary first and committed, the blocked logout proceeded afterward; the decision survived and the session was then invalidated.
6. When admission acquired the boundary first but rolled back, the blocked logout proceeded, no admission decision survived, and the session was invalidated.

The Node test runner reports 7 tests because it counts the enclosing supplemental suite plus six subtests.

## FCA / SSMM disposition

No concrete falsifier of accepted Shape or selected implementation semantics was observed. Sense remains closed. No architecture primitive or mechanism change is justified by this evidence.

The concurrency/readiness question is therefore metabolized as qualified evidence for the current Move, not as authority or BUILD 6 closure.

## Limits / still unrun

This receipt does not establish:

- physical iPhone/Mac WebAuthn behavior;
- hosted `ecb-human` packaging/HTTPS behavior;
- actual Supabase-hosted restricted-role connections;
- ordinary-agent exclusion in the final deployed runtime;
- live enrollment or H credential binding;
- canonical BUILD 6 installation;
- M2, P1, Metabolize/closure, or BUILD 7+.

## Next bounded move

Proceed under the already released deployment-preparation authority to the isolated `ecb-human` hosted packaging/HTTPS and custody-exclusion seam. Do not expose a real enrollment capability, bind Levi, mutate canonical governance state, activate M2/P1, or open BUILD 7.
