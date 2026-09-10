STATUS: BUILD 6 FIRST P1 SHAPE QUALIFIED — HUMAN AUTHORIZATION NOT YET ISSUED
DISPOSITION: QUALIFICATION / RELEASE RECEIPT
DATE: 2026-09-09 America/Phoenix
AUTHORITY: Human-closed P1 Sense plus bounded Shape qualification; no P1 decision authority is claimed by this receipt

# First ordinary succession — Shape ready

M1 and M2 remain closed PASS. M2 is Metabolized. Levi selected the first real P1 candidate direction in Sense: the already-qualified minimal successor that changes only `requires_human_explanation` from JSON boolean `false` to JSON boolean `true`. That selection fixed the candidate direction but did not authorize P1.

Shape prepared the minimum non-human seam required before the protected human decision. No canonical governance effect, P1 decision, credential rotation, installer ceremony, migration, database-role change, hosted executor credential, BUILD 6 closure or BUILD 7+ opening occurred.

## Exact P1 candidate

Candidate file: `docs/build-shape/008-build-6-p1-candidate.json`.

The exact UTF-8 candidate is the accepted P0 byte profile with only the one boolean changed. It retains the same format, operation, authorizer, prior-decision/predecessor/withdrawal requirements, preservation list, pending-decision withdrawal rule, delegation boundary and allowed-operation boundary.

- UTF-8 bytes: `563`
- SHA-256: `2057597b340e7f324176c65847633b776e0d266407988dedbaec001359c39556`
- Intended semantic delta: future human succession decisions require a non-empty explanation once P1 is operative.

The candidate remains non-operative until the installed H issues an exact decision through the protected WebAuthn/session route under operative P0.

## Local private-custody execution seam

New local-only runner: `server/ecb-human/succession-custody.mjs`.

The runner is deliberately first-P1-specific rather than a generic governance CLI. It pins canonical project, scope, current predecessor and P1 digest. It reads the already-retained applied executor credential through owner/mode/no-follow checks, reconstructs the restricted executor connection only in memory, and never prints or persists the reconstructed URI.

The public execution request is limited to exact public identifiers: scope, committed human decision, execution request ID, P1 digest and predecessor. The runner performs authoritative `recover` before any effect. Exact prior success skips execution. Established absence at the exact predecessor permits one execution. A fresh restricted connection then cold-recovers the same exact request. Unknown or mismatched recovery cannot authorize another effect.

`succession-custody.mjs` is included in `server/ecb-human/.vercelignore`; no executor credential or local runner is introduced into the hosted human runtime.

## Qualification

Qualification feature head: `3b25733494c07b7bc69dbc506afd11edaf77b239`.

Draft qualification PR #25 ran the existing disposable PostgreSQL 17 workflow as run `34429879556`, job `102722918558`, under Node `v24.20.0` and PostgreSQL `17.10`. The exact BUILD 6 migration digest remained `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`.

Combined BUILD 6 + focused first-P1 qualification: `31/31 PASS`, `0 FAIL`.

Focused passing checks included:

- exact P1 candidate is the selected one-field successor;
- public request is pinned to first-P1 scope, predecessor and digest;
- retained applied executor custody reconstructs only the restricted target in memory;
- unsafe, wrong-target and non-applied custody reject before connection;
- established absence causes exactly one effect then fresh cold recovery;
- exact prior success skips effect and still cold-recovers;
- mismatched recovery or failed cold recovery cannot authorize another effect.

Supplemental readiness concurrency observations: `7/7 PASS`, `0 FAIL`.

Qualification artifact ID: `10134064853`.

PR #25 remained draft and was closed unmerged because the merge endpoint correctly refused a draft PR. The identical tested feature head was then opened as non-draft PR #26 and merged with an exact-head guard.

Accepted merge commit: `b170ded2fd4122874c088d0634885faf6b1d6651`.

Critical tree identity check: the CI-tested PR merge commit `27f9b9940629960cf05a1b08992f0e8f76a23098` and accepted merge commit `b170ded2fd4122874c088d0634885faf6b1d6651` both point to exact tree `fabf5e9437da2488a460eabd486abe5d6f19fe50`. The accepted implementation tree is therefore the exact tree that passed qualification.

## Released next sequence

All non-human plumbing required before the P1 decision is qualified. The next action is a genuine human governance gate:

1. independently recheck canonical post-M2 state for drift;
2. sync the human checkout to the accepted release head;
3. present the exact P1 bytes through the existing protected human service;
4. H reviews the exact digest and predecessor and chooses accept or decline through WebAuthn/session custody;
5. only after a committed acceptance exists, independently reconstruct it and fix a public execution request;
6. run the qualified local recovery-first executor seam;
7. independently reconstruct the resulting succession before considering BUILD 6 closure.

Do not create a real execution request before a committed P1 decision exists. Do not infer P1 authorization from the earlier chat-level candidate selection or this receipt.