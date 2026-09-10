STATUS: BUILD 6 CURRENT MOVE COMPLETE — M1 BOUND, NOT ACTIVATED
DISPOSITION: INDEPENDENTLY VERIFIED M1 RECEIPT
VERIFIED_AT: 2026-09-10T00:38:38Z–00:41Z (2026-09-09 America/Phoenix)
AUTHORITY: Accepted BUILD 6 staged Move and explicit current instruction to complete M1 only

# M1 human binding — verified completion

The human completed the protected setup flow. Canonical M1 committed successfully.
The helper's last BLOCKED message was a checker encoding defect, not a surviving
setup capability. Independent canonical and secret-safe private checks establish
M1 completion. BUILD 6 as a whole is not closed. M2 is not started or prepared.

## Exact canonical reconstruction

Canonical Supabase project: `vezxivrvhakclxuvxzso`.

| Observation | Verified result |
|---|---|
| Scope | `20ad3966-8647-4a0f-9eed-2888e67e1e49` |
| H referent | `4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d` |
| Binding subject | `7446baff-13a8-4f68-a0c3-8445933575b8` |
| Genesis decision | `a5f6d414-85cd-4a67-b904-64fc122db362` |
| Total scopes | 1 |
| Expected / actual credential count | 1 / 1 |
| Total decisions / genesis decisions | 1 / 1 |
| Binding | Non-null |
| Current transition | NULL |
| Total transitions | 0 |
| RP ID | `ecos.effortlessconnection.com` |
| Origin | `https://ecos.effortlessconnection.com` |

The binding subject's complete JSON was independently compared inside canonical SQL
against the actual scope, H, remit, P0, external basis, credential IDs/public keys,
RP ID and origin. The comparison passed; credential material was not printed.
The genesis decision matches the exact scope's P0, external basis and H, with a
null predecessor. The credential points to a consumed registration ceremony with
retained proof. These facts establish the committed protected registration and
binding, without claiming which physical authenticator modality the human chose.
No redundant second authenticator is claimed.

Exact retained subject digests match the accepted repository bytes:

- P0: `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`.
- Remit: `a54707a0bb4e5373ec8c46adee58d71b67aa6de018d652d7d18b0445f24b9932`.
- External basis: `f43f95b4fdb84a62c16a0c56acd4a9b3a1ba3d0fd3bf25cd34cddaf4190da78b`.
- Selected migration bytes remain unchanged:
  `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`.

## Setup capability and private recovery

A secret-safe local check found the matching commissioned recovery record,
validated its project/scope and capability digest internally, and verified file
mode 0600, directory mode 0700, current-user ownership, and regular-file/no-symlink
access. No capability, private record contents, password or installer URI was emitted.

Using the actual retained capability and a fresh strictly verified restricted
verifier connection, `setup_view` rejected with SQLSTATE P0001 and exact message
`setup_unavailable`. The canonical check rejects any bound scope; the retained
setup hash does not confer reusable setup authority after binding.

The original helper's query cast a pre-serialized JSON string directly to jsonb.
The pinned postgres driver encoded it again as a JSON string, losing the object
scope field. Running that original expression with the same private inputs
reproduced P0001 `unknown_scope`. The helper mistakenly interpreted that different
error as failure to invalidate setup. The corrected query uses text::jsonb and
requires the exact expected SQLSTATE/message.

## Code and tests

Checker repair: `75c8a823cb0c55c71488587276db30ed586c8881` on
`reconcile/build-6-tested-move`, committed and pushed.

Node 24.20.0: all 32 governance/preflight tests passed. A regression exercises the
helper's exact query with the real driver: the same synthetic capability succeeds
before binding and rejects as setup_unavailable after binding. Existing synthetic
qualification remains isolated in the local disposable database; it is not a
canonical M2 action. Earlier runtime/custody evidence is retained in receipts 015–016.

## Hosted service and authority boundary

- Exact Vercel project: `ecb-human`, `prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`.
- Exact team: `team_wueYGTZ3nxHz1WhMg8UE9gSy`.
- Production deployment: `dpl_9hvDKxhBdsMNDUgc2Akt4ipDtdmG`, READY, Node 24.x.
- Deployment source: `cd8dbf5bb4b7c264038a5ded86986b89a2ad6b25`.
- Final checker change affects only the excluded local helper and its test;
  deployed application bytes are unchanged, so no post-binding redeploy was needed.
- Canonical `/health`: HTTP 200 with service=ecb-human and
  governance_activation=not_implied_by_service_health.
- `/` and `/intervene`: HTTP 200, exact retained entrance HTML.
- Strict certificate and hostname verification remain enabled with the bundled CA.
- Production custom environment inventory contains only HUMAN_DATABASE_URL as a
  sensitive credential. No installer, executor, owner, service-role or signing key
  is configured in the human runtime.

The verifier has no superuser, bypass-RLS, role-creation, database-creation, owner
membership or service-role membership. It can call the human entry point, cannot
call commission or executor, and cannot update scopes directly. Owner and executor
remain NOLOGIN. Executor, anon, authenticated and service_role cannot call the human
entry point. No human session or private credential was exposed in this receipt.

## Disposition

M1 completion conditions are satisfied and the last installation-check discrepancy
is explained, corrected and independently retested. Do not rerun commission or bind.
Do not activate the genesis decision, provision executor login, exhaust bootstrap,
present/accept P1, close BUILD 6, or open BUILD 7+. Stop at M1. Any further Move
requires its own applicable instruction; this receipt provides no M2 authorization.
