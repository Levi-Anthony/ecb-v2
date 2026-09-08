STATUS: BUILD 6 MOVE IN PROGRESS — TESTED CANDIDATE RECONCILED; QUALIFIED DEPLOYMENT PREPARATION RELEASED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Staged Move release `docs/build-shape/008-build-6-move-release.md`; qualified deployment/pre-enrollment release `docs/build-shape/008-build-6-deployment-release.md`
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap

# Current Move

Continue the exact tested BUILD 6 candidate through the already released readiness / qualified deployment-preparation stage. Do not reopen Sense or Shape without a concrete falsifier.

```text
BUILD_0_TO_5B=CLOSED
PREDECESSOR_MAIN=1ff284164160f74c398bcfe4d2c300b694070b7f
BUILD_6=MOVE_IN_PROGRESS
SENSE=CLOSED; HISTORICAL
SHAPE=STAGED_IMPLEMENTATION_BOUNDARY_ACCEPTED; CLOSED_FOR_CURRENT_MOVE
MOVE_RELEASE=CONSTRUCTION_AND_DISPOSABLE_QUALIFICATION_RELEASED
DEPLOYMENT_PREP_RELEASE=RELEASED_AND_AUTHORIZED
CURRENT_BRANCH=reconcile/build-6-tested-move
SELECTED_TESTED_SOURCE_SHA=afdd7dcab90afc3ece5de43a0016c7688db96ea4
RECONCILIATION=docs/build-receipts/009-build-6-tested-candidate-reconciliation.md
H=LEVI; NORMATIVELY_ACCEPTED; LIVE_CREDENTIAL_BINDING_PENDING
REMIT=ACCEPTED
P0_SHA256=686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664
AUTHENTICATION=DIRECT_WEBAUTHN_WITH_PROTECTED_SESSION
RP_ID=ecos.effortlessconnection.com
ORIGIN=https://ecos.effortlessconnection.com
SELECTED_MIGRATION=sql/migrations/20260907234712_build_6_governance_bootstrap.sql
SELECTED_MIGRATION_SHA256=de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461
LOCAL_SELECTED_CANDIDATE_QUALIFICATION=24_PASS_0_FAIL
FREE_GITHUB_PG17_RERUN=IN_PROGRESS_OR_PENDING_EVIDENCE
CANONICAL_BUILD_6_MUTATION=NONE
HUMAN_SERVICE=NOT_DEPLOYED
LIVE_ENROLLMENT=NOT_AUTHORIZED
LIVE_BINDING=NOT_AUTHORIZED
M2=NOT_AUTHORIZED
FIRST_P1=NOT_AUTHORIZED
BUILD_6_CLOSURE=NOT_AUTHORIZED
BUILD_7_PLUS=UNOPENED
```

## Governing inputs

1. `docs/build-shape/008-build-6-move-release.md`
2. `docs/build-shape/008-build-6-runtime-boundary.md`
3. `docs/build-shape/008-build-6-technical-shape.md` only where retained by the later WebAuthn/session route
4. `docs/build-shape/008-build-6-human-binding.md`
5. `docs/build-shape/008-build-6-p0-candidate.json`
6. `docs/build-shape/008-build-6-deployment-release.md`

Implementation/evidence continuity:
- `docs/build-receipts/008-build-6-progress.md`
- `docs/build-receipts/009-build-6-tested-candidate-reconciliation.md`
- `tests/build-6/evidence/receipt.json`
- `tests/build-6/evidence/qualification.txt`

## Selected implementation

The current implementation source is the candidate tested at exact SHA `afdd7dcab90afc3ece5de43a0016c7688db96ea4`, carried forward on this reconciliation branch without merging the materially different alternate six-migration implementation line.

Its retained evidence reports one private seven-table governance migration, pinned SimpleWebAuthn 14.0.1/14.0.0, 24 passing tests, signed synthetic ES256 registration/login, forced installation rollback, atomic migration-ledger installation and predecessor-row preservation. Those observations are evidence, not authority.

## Active bounded objective

Use no-cost surfaces to complete readiness as far as they can truthfully discriminate:

1. independently rerun the selected candidate against a fresh GitHub-hosted PostgreSQL 17 predecessor reconstructed from committed BUILD 0→5B migrations and the accepted synthetic GT01 fixture;
2. close the remaining released synthetic race cases if they are genuinely absent from the selected harness;
3. qualify isolated `ecb-human` hosted packaging/HTTPS at the accepted origin using Vercel Hobby / existing no-cost infrastructure;
4. verify actual ordinary-agent tool/credential exclusion before presenting any protected enrollment handoff.

Do not create a paid Supabase development branch merely to duplicate already-discriminated PG17 behavior. If no free isolated Supabase surface exists, actual Supabase-hosted restricted-role behavior remains explicitly UNRUN until the separately authorized inactive canonical-installation boundary.

## Still closed

Do not:
- perform Levi's real passkey ceremony;
- expose a live setup/enrollment capability in agent/chat context;
- bind the live credential/scope instance;
- apply BUILD 6 DDL to canonical `ecb-v2-brain`;
- activate M2 or exhaust bootstrap;
- present/accept/execute P1;
- Metabolize/close BUILD 6;
- open BUILD 7+.

## Next handle

Finish the free PG17 rerun and remaining synthetic readiness checks. If they pass, qualify the isolated Vercel Hobby deployment surface. Stop before any real enrollment handoff unless the release boundary is explicitly advanced.
