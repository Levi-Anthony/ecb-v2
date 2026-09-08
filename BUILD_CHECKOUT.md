STATUS: BUILD 6 MOVE IN PROGRESS — PG17 + SUPPLEMENTAL READINESS QUALIFIED; HOSTED DEPLOYMENT PREPARATION RELEASED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Staged Move release `docs/build-shape/008-build-6-move-release.md`; qualified deployment/pre-enrollment release `docs/build-shape/008-build-6-deployment-release.md`
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap

# Current Move

Continue the exact tested BUILD 6 candidate through the already released qualified deployment-preparation stage. Do not reopen Sense or Shape without a concrete falsifier.

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
INDEPENDENT_PG17_RECEIPT=docs/build-receipts/010-build-6-independent-pg17-requalification.md
SUPPLEMENTAL_RACE_RECEIPT=docs/build-receipts/011-build-6-supplemental-readiness-races.md
H=LEVI; NORMATIVELY_ACCEPTED; LIVE_CREDENTIAL_BINDING_PENDING
REMIT=ACCEPTED
P0_SHA256=686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664
AUTHENTICATION=DIRECT_WEBAUTHN_WITH_PROTECTED_SESSION
RP_ID=ecos.effortlessconnection.com
ORIGIN=https://ecos.effortlessconnection.com
SELECTED_MIGRATION=sql/migrations/20260907234712_build_6_governance_bootstrap.sql
SELECTED_MIGRATION_SHA256=de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461
LOCAL_SELECTED_CANDIDATE_QUALIFICATION=24_PASS_0_FAIL
FREE_GITHUB_PG17_RERUN=PASS_24_OF_24; RUN_34191366522
SUPPLEMENTAL_READINESS_RACES=PASS_7_OF_7; RUN_34191975800
CANONICAL_BUILD_6_MUTATION=NONE
HUMAN_SERVICE=NOT_DEPLOYED
HOSTED_HTTPS_QUALIFICATION=PENDING
ORDINARY_AGENT_EXCLUSION=PENDING_DEPLOYMENT_OBSERVATION
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
- `docs/build-receipts/010-build-6-independent-pg17-requalification.md`
- `docs/build-receipts/011-build-6-supplemental-readiness-races.md`
- `tests/build-6/evidence/receipt.json`
- `tests/build-6/evidence/qualification.txt`
- GitHub Actions artifact `10042526055` from run `34191975800`

## Selected implementation

The current implementation source remains the candidate tested at exact SHA `afdd7dcab90afc3ece5de43a0016c7688db96ea4`, carried forward on this reconciliation branch without merging the materially different alternate implementation line.

The selected migration/service semantics have now survived both the retained local 24/24 qualification and an independent fresh GitHub-hosted PG17 24/24 rerun. Supplemental concurrency observations then passed 7/7 without changing implementation semantics: competing succession grants/effects serialized to one lawful successor under commit and rollback, and logout/admission races serialized correctly in both lock orderings and commit/rollback outcomes. These are evidence, not authority.

## Active bounded objective

The no-cost database/readiness seam is complete. Continue only the remaining released deployment-preparation work:

1. qualify the isolated `ecb-human` hosted packaging and HTTPS surface at the accepted origin using existing/no-cost Vercel infrastructure;
2. verify the deployed human-service environment does not inherit canonical owner/service-role/JWT-signing credentials and that the ordinary operating-agent surface lacks human-session/verifier/browser-control capability;
3. retain actual Supabase-hosted restricted-role behavior as explicitly UNRUN if no free isolated Supabase surface exists, until the separately authorized inactive canonical-installation boundary.

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

Qualify the isolated Vercel Hobby `ecb-human` packaging/HTTPS and credential-exclusion surface. Stop before any real enrollment handoff unless the release boundary is explicitly advanced.
