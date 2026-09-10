STATUS: BUILD 6 M2 COMPLETE — CANONICAL ACTIVATION AND COLD RECOVERY VERIFIED
DISPOSITION: INDEPENDENTLY VERIFIED M2 RECEIPT
VERIFIED_AT: 2026-09-10T02:11Z (2026-09-09 America/Phoenix)
AUTHORITY: Accepted BUILD 6 staged Move step 5 plus current instruction to continue M2 through verified completion

# M2 governance bootstrap — verified completion

The human crossed the private installer boundary under Node 24 and the bounded M2
helper reported canonical preflight PASS, restricted executor provisioning PASS,
restricted executor authentication PASS, exact retained grant execution, and cold
recovery PASS. The returned transition is
`63bcd3fd-55f4-49bd-976f-c2bba50e6ab1`.

That terminal receipt was not treated as sufficient by itself. Canonical state was
independently reconstructed through the connected Supabase project after the effect,
and the hosted human service was rechecked. M2 is complete. M1 remains closed and was
not replayed. BUILD 6 remains open. P1 is not started or accepted.

## Exact canonical reconstruction

Canonical Supabase project: `vezxivrvhakclxuvxzso`.

| Observation | Verified result |
|---|---|
| Scope | `20ad3966-8647-4a0f-9eed-2888e67e1e49` |
| H referent | `4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d` |
| Binding subject | `7446baff-13a8-4f68-a0c3-8445933575b8` |
| Genesis decision | `a5f6d414-85cd-4a67-b904-64fc122db362` |
| M2 request | `e4e78a38-4f42-4f0f-b281-bd0dbdb26fda` |
| Transition | `63bcd3fd-55f4-49bd-976f-c2bba50e6ab1` |
| Total scopes / decisions / transitions | `1 / 1 / 1` |
| Genesis decisions | `1` |
| Withdrawals | `0` |
| Current transition | Exact sole transition above |
| Transition predecessor | `NULL` |
| Transition executor | `ecb_governance_executor` |
| Bootstrap exhausted | TRUE by exact committed M2 result and retained obligations |
| RP ID | `ecos.effortlessconnection.com` |
| Origin | `https://ecos.effortlessconnection.com` |

The sole transition references the exact scope, retained genesis decision, retained
M2 request, exact P0, H, remit and binding. Its ordered obligations are exactly:

1. `activate_exact_p0`
2. `designate_initial_h_and_remit`
3. `exhaust_bootstrap`

The scope's `current_transition` equals that transition. There is no additional
decision, transition or withdrawal. The genesis decision remains unwithdrawn and
keeps its null predecessor. This is the required one-time bootstrap history, not a
new approval or replay.

The retained subjects were independently re-hashed from their canonical payloads and
match their stored and accepted digests:

- P0: `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`.
- Remit: `a54707a0bb4e5373ec8c46adee58d71b67aa6de018d652d7d18b0445f24b9932`.
- External basis: `f43f95b4fdb84a62c16a0c56acd4a9b3a1ba3d0fd3bf25cd34cddaf4190da78b`.

The exact retained request in the repository still identifies the same scope,
decision, request ID, P0 digest and null predecessor. No request regeneration occurred.

## Executor boundary after activation

Canonical `ecb_governance_executor` is now LOGIN and remains NOINHERIT, non-superuser,
without BYPASSRLS, CREATEDB or CREATEROLE. It is not a member of the governance owner,
human verifier or service role. It can execute only the bounded executor entry among
the checked governance entries, cannot call the human entry, and has no direct
insert/update/delete/truncate privilege on private governance tables.

LOGIN retention is recorded as an observation, not a new authority decision. The
released BUILD 6 sequence proceeds from M2 into ordinary governance through the
bounded executor and contains no M2 requirement to disable that login after
initialization. No post-M2 role mutation was therefore performed. Its credential
remains private recovery/execution custody; possession of that credential does not
convey H decision authority.

## Recovery and local secret hygiene

The M2 process itself opened a fresh restricted executor connection and recovered the
same exact committed result, reporting `cold_recovery=PASS` before success.

The private executor credential is retained locally under
`work/m2-executor-custody/verifier-runtime.json`; despite that historical utility
filename, it is the separate M2 executor custody record, not the M1 verifier record.
Its contents were never read or emitted into chat. After direct-helper execution
revealed the file as Git-untracked, the human added `/work/m2-executor-custody/` to
the checkout's resolved local Git `info/exclude`. A subsequent
`git status --short --untracked-files=all` produced no output. The private record was
not deleted, opened, staged or committed.

Earlier local input-diagnostic edits were preserved separately in a Git stash before
the checkout was fast-forwarded. They were not reapplied into the qualified M2 run
and are not promoted by this receipt.

## Qualified code and hosted service

The activation used the repaired accepted branch whose focused M2 handoff code was
qualified at `2e2615ce3fd459c962c6ab892175c10f9e53597f`. Receipt 020 retains the full
qualification evidence: focused M2 handoff 8/8 PASS, disposable PostgreSQL 17 BUILD 6
24/24 PASS and supplemental readiness races 7/7 PASS under Node 24.20.0. No new code
change was required by the successful live activation.

The exact Vercel project remains `ecb-human`
(`prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`) in team
`team_wueYGTZ3nxHz1WhMg8UE9gSy`. Production deployment
`dpl_9hvDKxhBdsMNDUgc2Akt4ipDtdmG` remains READY and sourced from
`cd8dbf5bb4b7c264038a5ded86986b89a2ad6b25`. The local M2 custody and activation
helpers remain explicitly excluded by `server/ecb-human/.vercelignore`, so M2 did
not require or cause a hosted redeploy.

A fresh request to `https://ecos.effortlessconnection.com/health` returned HTTP 200
with exact body fields `service=ecb-human` and
`governance_activation=not_implied_by_service_health`. Production deployment and
custom-domain targeting therefore remain healthy after canonical activation without
falsely using service health as evidence of governance state.

The production sensitive-environment inventory from the closed M1 receipt remains the
last direct environment inventory: only `HUMAN_DATABASE_URL` was present there and no
installer/executor/owner/service-role/signing credential was configured in the human
runtime. This pass did not re-list plaintext or secret environment values. The M2
helpers are local-only and excluded from Vercel uploads, so the activation introduced
no hosted executor or installer credential by mechanism.

## Disposition

M2 completion conditions are satisfied: the exact prior grant was consumed once,
bootstrap history is reconstructible and current, cold recovery passes, the executor
remains bounded, the private recovery material is retained outside Git, and hosted
human-service health/targeting remains intact.

Do not rerun M1 commission/binding or issue another M2 effect. Exact retry is a
recovery path only. Do not delete the private M2 recovery record while later recovery
or ordinary executor use may depend on it.

The current Move stops here. `BUILD_6=OPEN`; `M2=PASS`; `P1=NOT_STARTED`. Step 6 of
the released BUILD 6 sequence — present and exercise the exact first P1 through the
protected human session, execute its committed authorization, reconstruct it, and
then review BUILD 6 closure evidence — remains a separate human-governance boundary.
No P1 acceptance, BUILD 6 closure or BUILD 7+ opening is created by this receipt.
