STATUS: BUILD 6 CURRENT MOVE COMPLETE — M1 BOUND, NOT ACTIVATED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Accepted BUILD 6 staged Move plus explicit instruction to complete M1, verify independently, persist receipt/checkout, and stop
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap (not closed)

# Current disposition

The authorized M1 Move is complete. The human performed protected enrollment and
binding. Independent canonical, private-recovery and hosted checks pass. The
helper's final BLOCKED message was a JSON-encoding defect in its invalidation
checker, now fixed and tested; the actual setup capability is unusable.

```text
BUILD_0_TO_5B=CLOSED
BUILD_6=OPEN; CURRENT_M1_MOVE_COMPLETE
SENSE=CLOSED; HISTORICAL
SHAPE=ACCEPTED_FOR_CURRENT_MOVE
CURRENT_BRANCH=reconcile/build-6-tested-move
CHECKER_FIX_SHA=75c8a823cb0c55c71488587276db30ed586c8881
CURRENT_CHECKOUT=/private/tmp/ecb-build6-live-bind
CANONICAL_PROJECT=vezxivrvhakclxuvxzso
SCOPE=20ad3966-8647-4a0f-9eed-2888e67e1e49
H_REFERENT=4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d
BINDING=7446baff-13a8-4f68-a0c3-8445933575b8
GENESIS_DECISION=a5f6d414-85cd-4a67-b904-64fc122db362
SCOPES=1
CREDENTIALS=1
DECISIONS=1; GENESIS_DECISIONS=1
CURRENT_TRANSITION=NULL
TRANSITIONS=0
SETUP_CAPABILITY=REJECTED_SETUP_UNAVAILABLE
PRIVATE_RECOVERY=VALID; FILE_0600; DIRECTORY_0700
HOSTED_HEALTH=200; EXPECTED_ECB_HUMAN_IDENTITY
HOSTED_ENTRANCE=200; EXACT_HTML
STRICT_TLS=ENABLED; BUNDLED_SUPABASE_CA
ECB_HUMAN_PROJECT=prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4
ECB_HUMAN_TEAM=team_wueYGTZ3nxHz1WhMg8UE9gSy
PRODUCTION_DEPLOYMENT=dpl_9hvDKxhBdsMNDUgc2Akt4ipDtdmG
PRODUCTION_SOURCE=cd8dbf5bb4b7c264038a5ded86986b89a2ad6b25
HUMAN_DATABASE_URL=RESTRICTED_VERIFIER; ONLY_CUSTOM_RUNTIME_CREDENTIAL
OWNER_AND_EXECUTOR=NOLOGIN
M1=PASS; INDEPENDENTLY_VERIFIED
M2=NOT_STARTED; DO_NOT_PREPARE_OR_EXECUTE
BUILD_7_PLUS=UNOPENED
```

# Governing evidence

- `docs/build-shape/008-build-6-move-release.md` — accepted staged release.
- `docs/build-shape/008-build-6-runtime-boundary.md` — authority boundary.
- `docs/build-shape/008-build-6-human-binding.md` — accepted H/remit/P0.
- `docs/build-receipts/017-build-6-m1-complete.md` — final M1 receipt and exact invariants.
- Receipts 013–016 preserve preflight, failures, repairs and hosted-readiness history.

Accepted P0 and selected migration hashes remain unchanged. Final helper repair
is local-only and excluded from Vercel uploads; the deployed application bytes
remain those independently verified in the receipt. Source and receipt are retained
on the pushed branch; the temporary checkout is not the only durable record.

# Stop boundary

No further action is pending for this M1 Move. Do not rerun installation or binding.
Do not execute genesis, provision an executor login, exhaust bootstrap, prepare or
present P1, close BUILD 6, or open BUILD 7+. The final verification did not require
another human approval, passkey ceremony, setup commission or canonical mutation.
