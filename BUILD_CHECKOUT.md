STATUS: BUILD 6 MOVE IN PROGRESS — TLS REPAIRED; PRIVATE INSTALLER AUTHENTICATION REQUIRED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Accepted BUILD 6 staged Move release plus Levi's current instruction to carry this Move through verified M1 completion; M2 explicitly excluded from this Move
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap

# Current Move

Carry the accepted BUILD 6 Shape through exact live M1 binding. Maintain execution custody autonomously except for genuine human secret/WebAuthn custody. Resume from durable partial state rather than replaying completed effects. Do not reopen Sense or Shape absent a concrete mechanism falsifier.

```text
BUILD_0_TO_5B=CLOSED
BUILD_6=MOVE_IN_PROGRESS
SENSE=CLOSED; HISTORICAL
SHAPE=STAGED_IMPLEMENTATION_BOUNDARY_ACCEPTED; CLOSED_FOR_CURRENT_MOVE
CURRENT_BRANCH=reconcile/build-6-tested-move
SELECTED_TESTED_SOURCE_SHA=afdd7dcab90afc3ece5de43a0016c7688db96ea4
SELECTED_MIGRATION=sql/migrations/20260907234712_build_6_governance_bootstrap.sql
SELECTED_MIGRATION_SHA256=de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461
P0_SHA256=686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664
H=LEVI; NORMATIVELY_ACCEPTED; LIVE_CREDENTIAL_BINDING_PENDING
REMIT=ACCEPTED
AUTHENTICATION=DIRECT_WEBAUTHN_WITH_PROTECTED_SESSION
RP_ID=ecos.effortlessconnection.com
ORIGIN=https://ecos.effortlessconnection.com
CANONICAL_PROJECT=vezxivrvhakclxuvxzso
CANONICAL_BUILD_6_MIGRATION=20260908083501_build_6_governance_bootstrap
CANONICAL_GOVERNANCE_SCHEMA=INSTALLED_INACTIVE
CANONICAL_PREFLIGHT_SCOPES=0
CANONICAL_PREFLIGHT_CREDENTIALS=0
CANONICAL_PREFLIGHT_SESSIONS=0
CANONICAL_PREFLIGHT_DECISIONS=0
CANONICAL_PREFLIGHT_TRANSITIONS=0
ECB_HUMAN_PROJECT=prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4
ECB_HUMAN_TEAM=team_wueYGTZ3nxHz1WhMg8UE9gSy
HOSTED_READINESS=PASS
HUMAN_DATABASE_URL=PROVISIONED; FRESH_RUNTIME_AUTHENTICATION_CURRENTLY_REJECTED
LIVE_BIND_HELPER=server/ecb-human/live-bind.mjs
LIVE_BIND_HELPER_BLOB=bdcfe58c68cf811f786a3f55f87d1eb9fb2e92fb
LIVE_BINDING=PENDING_HUMAN_CUSTODY; M1_NOT_COMMISSIONED
M1_COMPLETION=BINDING_NON_NULL + ONE_GENESIS_DECISION + CURRENT_TRANSITION_NULL + TRANSITIONS_0
M2=EXPLICITLY_OUTSIDE_CURRENT_MOVE; DO_NOT_PREPARE_OR_EXECUTE
BUILD_7_PLUS=UNOPENED
```

## Governing inputs

1. `docs/build-shape/008-build-6-move-release.md`
2. `docs/build-shape/008-build-6-runtime-boundary.md`
3. `docs/build-shape/008-build-6-human-binding.md`
4. `docs/build-shape/008-build-6-p0-candidate.json`
5. `docs/build-shape/008-build-6-accepted-remit.txt`
6. `docs/build-receipts/013-build-6-live-binding-preflight.md`
7. `docs/build-receipts/014-build-6-local-resume-preflight.md` (execution evidence)
8. `docs/build-receipts/015-build-6-runtime-tls-and-custody-checkpoint.md` (current runtime/custody state)

Earlier qualification and deployment receipts remain evidentiary continuity, including independent PG17 24/24, supplemental races 7/7, and hosted readiness. No concrete Shape falsifier is open.

## Live M1 objective

The canonical governance mechanism is installed but inactive. Preflight independently observed all seven private governance tables empty and the hosted service still fail-closed because no verifier database credential exists.

Use only `server/ecb-human/live-bind.mjs` for the remaining live-binding custody path. It targets the exact canonical Supabase project and exact isolated Vercel project, provisions only the restricted verifier credential, invokes the existing installer, resumes an existing partial commissioned scope from private recovery rather than creating another, guides the real WebAuthn ceremony, and reconstructs the exact M1 state.

Human custody is limited to:

- privately supplying the canonical Supabase installer Session-pooler URI to the helper's hidden terminal prompt;
- typing `OPEN` at the existing local installer gate after inspecting the retained package;
- native passkey / Touch ID authorization and the protected browser binding action.

Do not expose installer URLs, verifier passwords, setup capabilities, passkey material, or private recovery-file contents in chat, shell history, committed state, or model-visible logs.

## M1 completion conditions

Do not declare this Move complete until all are verified:

```text
binding != NULL
exactly one committed genesis decision
current_transition = NULL
transitions = 0
expected credential set retained
private recovery material present with restrictive permissions
consumed setup capability no longer usable
https://ecos.effortlessconnection.com/health = healthy ecb-human verifier surface
exact ecb-human project/team targeting retained
HUMAN_DATABASE_URL is the only required human runtime DB credential
no forbidden owner/service-role/JWT/installer/executor/setup credential in ecb-human runtime
no unresolved installation/security discrepancy
```

After apparent success, reconstruct canonical and hosted state independently and persist the M1 receipt before stopping.

## Hard boundary

For this Move, do not begin, prepare, or opportunistically advance M2. Specifically do not execute the genesis decision, enable/provision the executor for activation, exhaust bootstrap, present or exercise P1, close BUILD 6, or open BUILD 7+.

## Next handle

The current branch checkout is `/private/tmp/ecb-build6-live-bind`. The runtime
repairs are pushed through `3a0b86828c193c24c99fcd70acb302d600e9ed52`. Node 24
tests pass. TLS repair produced the expected hosted health 200, but the newest
deployment now reports database_authentication_failed. The separately discovered
entrance packaging fix is deployed; its hosted success remains unverified until
fresh verifier authentication is restored. The latest independent canonical read
found scopes/credentials/sessions/decisions/transitions all zero. See receipt 015
for exact deployments, evidence and limits. The next required input is the human's
valid private installer URI/PAT, followed by OPEN and native protected binding.

Run the one-command live-bind helper in a real human-operated Mac terminal from a clean, current `reconcile/build-6-tested-move` checkout. The helper owns all routine plumbing and verification. After its human-custody actions complete, independently reconstruct M1, persist the final receipt/checkout, and stop before M2.
