STATUS: BUILD 6 MOVE IN PROGRESS — TESTED CANDIDATE PROMOTED FOR CONTINUATION
DISPOSITION: EVIDENCE / RECONCILIATION RECORD
DATE: 2026-09-07 America/Phoenix

# BUILD 6 tested-candidate reconciliation

## Purpose

Reconcile two independently persisted BUILD 6 implementation lines without reopening accepted Shape or conflating evidence with authority.

## Authority/control preserved

The governing staged Move remains `docs/build-shape/008-build-6-move-release.md`. H=Levi, the accepted remit, exact P0 SHA-256 `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`, direct WebAuthn with protected session continuity, RP ID `ecos.effortlessconnection.com`, and origin `https://ecos.effortlessconnection.com` remain unchanged.

The later human release `docs/build-shape/008-build-6-deployment-release.md` authorizes only qualified isolated deployment / protected enrollment preparation. Live passkey enrollment, live H credential/scope binding, canonical BUILD 6 migration, M2, P1, Metabolize/closure and BUILD 7 remain closed.

## Tested implementation selected for continuation

Levi supplied and verified the exact pushed candidate:

- source branch: `build/build-6-sense` (historical branch name only; active phase remains Move)
- exact tested SHA: `afdd7dcab90afc3ece5de43a0016c7688db96ea4`
- local and remote SHA matched at handoff
- unrelated research directories remained untracked and excluded

This reconciliation branch was created directly from that exact SHA. No merge of the divergent alternate implementation line was performed.

The selected candidate's retained machine evidence reports:

- migration `sql/migrations/20260907234712_build_6_governance_bootstrap.sql`
- migration SHA-256 `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`
- disposable PostgreSQL 17 qualification
- 24 tests passing, zero failures
- signed synthetic ES256 WebAuthn registration/login behavior
- migration rollback and atomic ledger checks passed
- predecessor public rows preserved
- canonical migration, live credential binding, device tests and deployment not performed

See `tests/build-6/evidence/receipt.json`, `tests/build-6/evidence/qualification.txt`, and `docs/build-receipts/008-build-6-progress.md`.

## Alternate implementation line

`build/build-6-move-recovered` and its later GitHub-Actions PG17 evidence remain retained as historical comparison / development evidence. They are not deleted and their test results are not denied. However, their materially different six-migration / eight-table implementation is not the current implementation source after this reconciliation. Do not combine its SQL/service bytes with the selected tested candidate unless a concrete falsifier requires a new explicit reconciliation.

## Current bounded objective

Continue the already released no-cost readiness/deployment-preparation stage from the selected tested candidate:

1. independently re-run the selected candidate on a free disposable PostgreSQL 17 surface where possible;
2. close the remaining released synthetic race/role checks without changing accepted mechanism semantics;
3. qualify actual hosted packaging/HTTPS on isolated `ecb-human` using no-cost infrastructure;
4. verify ordinary-agent credential/tool exclusion before any protected enrollment handoff.

A paid Supabase development branch is not required for this continuation. Actual Supabase-hosted restricted-role behavior may remain explicitly UNRUN until the separately authorized inactive canonical-installation boundary if no free isolated Supabase surface exists.

No canonical mutation or live human ceremony is authorized by this reconciliation.
