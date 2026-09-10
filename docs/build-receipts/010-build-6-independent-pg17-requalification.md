STATUS: BUILD 6 MOVE IN PROGRESS — SELECTED CANDIDATE INDEPENDENTLY REQUALIFIED
DISPOSITION: EVIDENCE / MOVE RECEIPT
DATE: 2026-09-07 America/Phoenix

# BUILD 6 independent PostgreSQL 17 requalification

## Observation

The selected BUILD 6 candidate was independently rerun on a fresh GitHub-hosted PostgreSQL 17 service after reconstructing the accepted BUILD 0→5B predecessor entirely from committed repository migrations plus the frozen synthetic predecessor fixture.

This was a disposable qualification run. It did not contact or mutate canonical `ecb-v2-brain`, perform a live passkey ceremony, bind H, activate M2/P1, or deploy the human service.

## Exact candidate

- selected tested source SHA: `afdd7dcab90afc3ece5de43a0016c7688db96ea4`
- continuation branch at qualification: `reconcile/build-6-tested-move`
- selected migration: `sql/migrations/20260907234712_build_6_governance_bootstrap.sql`
- selected migration SHA-256: `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`
- implementation/test bytes of the selected candidate were not changed to obtain this pass

## Independent runner

- GitHub Actions workflow: `BUILD 6 tested candidate disposable PG17`
- run: `34191366522`
- run number: `10`
- trigger PR: `#22` (disposable; not for merge)
- trigger head: `5b0dd5a1a90e4422f8baaf5f3f65d06f9b4eef21`
- workflow merge ref observed: `63be9b9993531ed2f3e4ec6d8e83d5496ea76929`
- GitHub-hosted runner OS: Ubuntu 24.04
- PostgreSQL image: `pgvector/pgvector:0.8.2-pg17`
- Node: `v24.20.0`
- SimpleWebAuthn server package: `14.0.1`
- SimpleWebAuthn browser package: `14.0.0`

## Predecessor reconstruction gate

The independent runner reconstructed BUILD 0→5B and verified the compatibility conditions required by the tested candidate, including:

- accepted migration sequence through `20260906014257_build_5b_versioned_artifacts`;
- seven predecessor migration-ledger entries;
- accepted GT01 digest;
- `postgres` ownership of the retained predecessor installation surface;
- canonical-compatible `extensions` schema usage for the retained BUILD 5B checker;
- exact BUILD 5B Artifact episode using the frozen fixture constants and the accepted top-level transaction split: seven representations/requests/attempts commit first, then RC1/RC2 derive in a later transaction;
- final BUILD 5B Artifact count = 9 and corresponding Artifact Referents = 9;
- RC1 = `PASS`; RC2 = `FAIL`;
- retained A1 payload digest `8b80af401b26d8aa98ad9c4a27bb5385b8b6ac8aa40138f7736950a144ca355c`;
- retained A2 payload digest `1d04efad1b7663fdee99c50a05cc8a8a6a682bf9fb6783da4d0b0fa445211c6c`.

Earlier failed CI attempts during this reconciliation occurred before fair BUILD 6 qualification and exposed incomplete predecessor reconstruction assumptions. They were corrected at the predecessor/CI layer rather than by changing selected BUILD 6 implementation semantics.

## BUILD 6 result

Fresh machine receipt observed at `2026-09-08T05:38:39.855Z`:

- installation rollback: PASS
- atomic migration ledger: PASS
- prior public rows preserved: PASS
- BUILD 6 qualification: 24 tests PASS, 0 FAIL, 0 skipped
- signed synthetic ES256 registration/login tests: PASS
- authority/session/replay/withdrawal/rollback/genesis-concurrency/history protections exercised by the retained suite: PASS

The independent run therefore corroborates the previously retained local 24/24 evidence. No BUILD 6 Shape or selected-implementation falsifier was observed.

## Remaining released readiness work

This receipt does not close BUILD 6. The currently released no-cost readiness/deployment-preparation stage still contains:

1. two supplemental race observations previously identified as absent from the retained 24-test suite: competing succession grants for one predecessor, and logout racing admission in both commit/rollback directions;
2. isolated `ecb-human` hosted packaging/HTTPS qualification at the accepted origin using no-cost infrastructure;
3. ordinary-agent tool/credential exclusion verification before any protected enrollment handoff.

Live enrollment, canonical BUILD 6 migration, H live binding, M2, P1, BUILD 6 closure, and BUILD 7+ remain closed.
