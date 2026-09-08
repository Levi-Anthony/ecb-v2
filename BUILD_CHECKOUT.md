STATUS: BUILD 6 MOVE IN PROGRESS — DISPOSABLE PG17 QUALIFICATION PASSED; DEPLOYMENT GATE CLOSED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Explicit human staged Move release at 2026-09-07T19:09:03.887Z; `docs/build-shape/008-build-6-move-release.md`
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap

# BUILD 6 — Governance Bootstrap

## CURRENT MOVE

`CONSTRUCTION PERSISTED → DISPOSABLE PG17 QUALIFICATION PASSED → [CLOSED GATE] QUALIFIED DEPLOYMENT/ENROLLMENT → LIVE BINDING → M2 → FIRST LAWFUL SUCCESSION`

```text
BUILD_0_TO_5B=CLOSED
PREDECESSOR_MAIN=1ff284164160f74c398bcfe4d2c300b694070b7f
BUILD_6=MOVE_IN_PROGRESS
SENSE=CLOSED_AT_72c0b79; HISTORICAL
SHAPE=STAGED_IMPLEMENTATION_BOUNDARY_ACCEPTED; CLOSED_FOR_CURRENT_MOVE
MOVE_PERMISSION=CONSTRUCTION_AND_DISPOSABLE_QUALIFICATION_RELEASED_2026_09_07_19_09_03_887Z
CURRENT_BRANCH=build/build-6-move-recovered
OUTPUT_CONTRACT=docs/build-shape/008-build-6-move-release.md
H=LEVI; NORMATIVELY_ACCEPTED; LIVE_CREDENTIAL_BINDING_PENDING
REMIT=ACCEPTED
P0=ACCEPTED; EXACT_BYTES
P0_SHA256=686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664
AUTHENTICATION=DIRECT_WEBAUTHN_WITH_PROTECTED_SESSION
RP_ID=ecos.effortlessconnection.com
ORIGIN=https://ecos.effortlessconnection.com
CONSTRUCTION=REMOTE_AND_PERSISTED
PG17_DISPOSABLE_QUALIFICATION=PASS_EXACT_COMMITTED_BYTES
PG17_QUALIFICATION_RUN=34186534470
PG17_QUALIFICATION_TESTS=11_PASS_0_FAIL
PG17_QUALIFICATION_RESULT=PASS_WITH_REQUIRED_LIVE_OBSERVATIONS_UNRUN
PG17_EVIDENCE=docs/acceptance/build-6-disposable-pg17.md
HTTP_WEBAUTHN_DEPLOYMENT_QUALIFICATION=NOT_RUN; GATE_CLOSED
CANONICAL_BUILD_6_MUTATION=NONE
HUMAN_SERVICE=NOT_DEPLOYED
DEVICE_QUALIFICATION=NOT_RUN
LIVE_INSTANCE=NOT_FROZEN; NOT_ACTIVATED
BUILD_7_PLUS=UNOPENED
```

## GOVERNING INPUT

Use these implementation authorities. Do not reopen them without a concrete falsifier:

1. `docs/build-shape/008-build-6-move-release.md`
2. `docs/build-shape/008-build-6-runtime-boundary.md`
3. `docs/build-shape/008-build-6-technical-shape.md` — only surviving WebAuthn/session/transaction constraints; earlier Auth/email route is superseded.
4. `docs/build-shape/008-build-6-human-binding.md`
5. `docs/build-shape/008-build-6-p0-candidate.json`

Qualification evidence is observational, not authority:

- `docs/acceptance/build-6-disposable-pg17.md`
- GitHub Actions run `34186534470`, job `101935896034`
- artifact `10040691977`
- artifact ZIP SHA-256 `8630344618466a3cb6d6b99b8091bebcf7cc3fe8902cb84a590d3590ad1134eb`

## EXACT QUALIFIED DATABASE SET

Run 9 reconstructed the accepted BUILD 0→5B predecessor in a fresh PostgreSQL 17.10 container and then consumed only committed BUILD 6 migration bytes. Runtime normalization/rewrite is now forbidden and checked.

Ordered BUILD 6 migration set:

1. `sql/migrations/20260908013000_build_6_governance_bootstrap.sql`
   - SHA-256 `e2010025a6de85842c25b740ec2e0af6e15db801e8cc8da67b0f92780bd91bc6`
2. `sql/migrations/20260908013100_build_6_setup_recovery_surface.sql`
   - SHA-256 `fd2ec228b8367012ae76a2473eaab3d1d74191949d6b0e1a26a135e40e3e0f6b`
3. `sql/migrations/20260908013200_build_6_decision_result_surface.sql`
   - SHA-256 `508947e591eccb2e1c34177eab5579a8e78dc348e04e62a6cfce8b92c0b62c09`
4. `sql/migrations/20260908013300_build_6_native_extension_usage.sql`
   - SHA-256 `32259de1d65201e5655cf6ff3dd316cf8d9314052306c17d780c8890870d094b`
5. `sql/migrations/20260908013400_build_6_referent_registry_integration.sql`
   - SHA-256 `890b89082701213daa575c194147deaf8d187b01584f0b258e27dda53e561924`
6. `sql/migrations/20260908013500_build_6_registration_result_ambiguity.sql`
   - SHA-256 `70f2a658a625beb36f7a86dd216e8369a53876de6ef44b3b908a6c130f7e3f5e`

The first migration now contains the exact normalized bytes previously exercised as the disposable candidate. The qualification runner applies the committed artifact directly and checks its digest before installation.

## OTHER CONSTRUCTED MOVE ARTIFACTS

Human boundary:
- `server/ecb-human/` — isolated same-origin WebAuthn/session service and minimal UI. The adapter checks RP ID, exact origin, user verification, credential identity and cross-origin rejection. Setup capability stays out of URLs; session secret is HttpOnly and DB-hashed; mutations require exact origin plus session-bound CSRF.

Custody/execution:
- `server/governance-installer/` — human-operated pre-genesis installer; verifies exact P0 digest and writes the enrollment capability only to a new mode-0600 local file without printing the secret.
- `server/governance-executor/` — inspect / execute one prior-committed exact decision / recover outcome only; no human-session, enrollment or decision-issuance entry.

Qualification:
- `tests/build-6/` — disposable PG17 harness; exact-P0 and exact-install-byte checks; idempotency/recovery; strict-policy controls; prior-commit test; P0→P1 behavior; withdrawal; logout/grant survival; restart reconstruction; and real scope-lock concurrency commit/rollback branches.

## DISPOSABLE QUALIFICATION RESULT

The exact committed path passed all 11 executable PG17 tests. The receipt additionally reports PASS for:

- exact P0 bytes;
- exact committed bootstrap bytes;
- no runtime migration rewrite;
- required governance surface;
- human-service static custody boundary;
- executor human-exclusion boundary;
- installer secret custody;
- canonical-target refusal;
- PG17 governance suite.

This does **not** prove physical-device WebAuthn behavior, deployed HTTPS behavior, real credential redundancy, actual operating-agent credential exclusion, canonical M2, canonical restart, first human P1, or Metabolize. Those remain explicitly UNRUN.

## PACKAGING DEVIATION — STILL VISIBLE

The runtime proposal originally described one private-schema migration. Construction produced narrow follow-up migrations while defects and recovery omissions were being discriminated. The exact six-file ordered set is now committed and qualified; no runtime-generated migration bytes remain.

Do not silently call this a one-file package. If final canonical installation requires physical collapse into one migration file, resolve that packaging question at the live-installation freeze while preserving the qualified semantics and provenance. This question does not invalidate the completed disposable mechanism qualification.

## EFFECT BOUNDARY NOW

The construction/disposable-qualification permission has been exercised. Do not infer permission for the next stage merely because its code exists.

The next staged effect is **qualified isolated deployment and protected enrollment preparation**. Treat that gate as CLOSED pending explicit human release. In particular, do not:

- deploy `ecb-human`;
- provision live verifier/executor credentials;
- create or deliver a real enrollment capability;
- enroll Levi's passkey;
- apply BUILD 6 DDL to canonical `ecb-v2-brain`;
- bind the live instance;
- activate M2;
- present or execute P1;
- Metabolize/close BUILD 6;
- open BUILD 7.

Read-only inspection and evidence reconciliation remain safe when needed to frame the next human decision.

## NEXT HANDLE

Human disposition is now required before the next effectful stage.

Decision surface:

`RELEASE QUALIFIED DEPLOYMENT / PROTECTED ENROLLMENT PREPARATION` **or** `HOLD`.

A release should remain bounded to the next stage only: isolated qualified HTTPS deployment, verifier/executor credential-exclusion verification, and preparation of the protected enrollment path. It must not imply live H binding, canonical M2, P1, BUILD 6 closure or BUILD 7 authorization.
