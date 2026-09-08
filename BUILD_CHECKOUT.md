STATUS: BUILD 6 MOVE IN PROGRESS — CONSTRUCTION PERSISTED; DISPOSABLE QUALIFICATION NEXT
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Explicit human staged Move release at 2026-09-07T19:09:03.887Z; `docs/build-shape/008-build-6-move-release.md`
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap

# BUILD 6 — Governance Bootstrap

## CURRENT MOVE

`CONSTRUCTION PERSISTED → DISPOSABLE PG17 QUALIFICATION → QUALIFIED DEPLOYMENT/ENROLLMENT → LIVE BINDING → M2 → FIRST LAWFUL SUCCESSION`

```text
BUILD_0_TO_5B=CLOSED
PREDECESSOR_MAIN=1ff284164160f74c398bcfe4d2c300b694070b7f
BUILD_6=MOVE_IN_PROGRESS
SENSE=CLOSED_AT_72c0b79; HISTORICAL
SHAPE=STAGED_IMPLEMENTATION_BOUNDARY_ACCEPTED; CLOSED_FOR_CURRENT_MOVE
MOVE_PERMISSION=RELEASED_2026_09_07_19_09_03_887Z
CURRENT_BRANCH=build/build-6-move-recovered
OUTPUT_CONTRACT=docs/build-shape/008-build-6-move-release.md
H=LEVI; NORMATIVELY_ACCEPTED; LIVE_CREDENTIAL_BINDING_PENDING
REMIT=ACCEPTED
P0=ACCEPTED; REMOTE EXACT BYTES
P0_SHA256=686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664
AUTHENTICATION=DIRECT_WEBAUTHN_WITH_PROTECTED_SESSION
RP_ID=ecos.effortlessconnection.com
ORIGIN=https://ecos.effortlessconnection.com
CONSTRUCTION=REMOTE_AND_PERSISTED
PG17_DISPOSABLE_QUALIFICATION=NOT_RUN
HTTP_WEBAUTHN_DEPLOYMENT_QUALIFICATION=NOT_RUN
CANONICAL_BUILD_6_MUTATION=NONE; READ_ONLY_CHECK_CONFIRMS_ecb_governance_SCHEMA_ABSENT
HUMAN_SERVICE=NOT_DEPLOYED
DEVICE_QUALIFICATION=NOT_RUN
LIVE_INSTANCE=NOT_FROZEN; NOT_ACTIVATED
BUILD_7_PLUS=UNOPENED
```

## GOVERNING INPUT

Use these exact implementation authorities. Do not reopen them without a concrete falsifier:

1. `docs/build-shape/008-build-6-move-release.md`
2. `docs/build-shape/008-build-6-runtime-boundary.md`
3. `docs/build-shape/008-build-6-technical-shape.md` — only surviving WebAuthn/session/transaction constraints; earlier Auth/email route is superseded.
4. `docs/build-shape/008-build-6-human-binding.md`
5. `docs/build-shape/008-build-6-p0-candidate.json`

## CONSTRUCTED MOVE ARTIFACTS

Database:
- `sql/migrations/20260908013000_build_6_governance_bootstrap.sql` — private native governance substrate, restricted roles/functions, exact-policy checks, session/decision/history, scope serialization, prior-top-level-transaction enforcement, genesis/succession and recovery.
- `sql/migrations/20260908013100_build_6_setup_recovery_surface.sql` — construction correction exposing native inert credential Referent IDs so interrupted setup can resume exact binding.
- `sql/migrations/20260908013200_build_6_decision_result_surface.sql` — construction correction returning the already-persisted exact decision classification on immediate/retry results.

Human boundary:
- `server/ecb-human/` — isolated same-origin WebAuthn/session service and minimal UI. Source-reviewed adapter explicitly checks RP ID, exact origin, user verification, credential identity and cross-origin rejection. Setup capability stays out of URLs; session secret is HttpOnly and DB-hashed; mutations require exact origin + session-bound CSRF.

Custody/execution:
- `server/governance-installer/` — human-operated pre-genesis installer; verifies exact P0 digest and writes the enrollment capability only to a new mode-0600 local file without printing the secret.
- `server/governance-executor/` — inspect / execute one prior-committed exact decision / recover outcome only; no human-session, enrollment or decision-issuance entry.

Qualification:
- `tests/build-6/` — PG17/disposable harness, exact-P0/static custody checks, idempotency/recovery, strict-policy controls, prior-commit test, P0→P1 behavior, withdrawal, logout/grant survival, restart reconstruction and real scope-lock concurrency commit/rollback branches.
- Physical device, real HTTPS deployment, ordinary-agent capability inventory, canonical M2, first real P1 and Metabolize remain explicitly UNRUN.

## CONSTRUCTION DEVIATION TO CARRY HONESTLY

The runtime proposal described one private-schema migration. Construction found two recovery/presentation omissions after the base file was already persisted, so two narrow follow-up migration files preserve the correction provenance rather than silently rewriting history. No authority semantic was added. Before final installation freeze, either consolidate the exact installation bytes or explicitly disposition this packaging deviation. Do not claim a one-file package while three files remain.

## ACTIVE ENTRY GATE

The next authorized effect is **disposable qualification only** against an isolated PostgreSQL 17 accepted predecessor. Do not apply BUILD 6 DDL to canonical `ecb-v2-brain` for rehearsal, even transiently.

The qualification runner refuses a database URL containing canonical project ref `vezxivrvhakclxuvxzso` and requires `BUILD6_DISPOSABLE=YES`.

After PG17 qualification, repair any observed implementation defect inside the released boundary and rerun. A genuine contract/Shape falsifier stops that seam; an implementation defect does not reopen Shape automatically.

## LATER GATES — STILL CLOSED

Do not skip ahead to these merely because tooling exists:

1. qualified isolated `ecb-human` deployment and actual verifier/executor credential exclusion;
2. Levi native passkey enrollment at the accepted origin;
3. exact live credential/scope binding through protected setup;
4. serialized canonical M2 activation and bootstrap exhaustion;
5. first exact P1 human decision under operative P0 and its execution/reconstruction;
6. evidence review / Metabolize / BUILD 6 closure.

No BUILD 7+, general Actor ontology, action envelope, global pause, Supabase Auth/email enrollment, second database or exceptional total-loss recovery is licensed.

## NEXT HANDLE

Create a temporary isolated Supabase PostgreSQL 17 development branch from canonical predecessor, apply the three current construction migration files there, and execute `tests/build-6` against it. This is a paid temporary resource and requires explicit cost confirmation before creation.
