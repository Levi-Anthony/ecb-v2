STATUS: TESTED M2 INPUT SEAM REPAIRED — LIVE ACTIVATION PENDING
DISPOSITION: EXECUTION_CHECKPOINT; NOT AN M2 ACTIVATION RECEIPT
DATE: 2026-09-09 America/Phoenix
AUTHORITY: Accepted BUILD 6 Move step 5 and current instruction to harness M2 through verified completion

# Result

The first live M2 custody attempt stopped at `private_installer_input` with
`check_failed_or_outcome_unknown`. Independent canonical reconstruction after that
stop proved that no M2 effect occurred: one bound scope, one committed genesis
decision, current transition NULL, zero transitions, and the restricted executor
still NOLOGIN. M1 remains closed PASS and was not replayed.

The stop was traced to a local input-parser defect rather than canonical state or
credential failure. The launcher accepted `jit=true` but rejected Supabase's
current temporary-access Session-pooler URI form, which carries JIT authorization
as `options=-c jit=true`. Rejection occurred before the first database query, exactly
matching the observed stage.

# Narrow repair

`server/ecb-human/m2-custody.mjs` now accepts only these installer query forms:

- `jit=true`;
- `options=-c jit=true`;
- `sslmode=require` or `sslmode=verify-full`.

All original target restrictions remain: PostgreSQL scheme, exact project-qualified
installer username, Supabase pooler hostname, port 5432, `/postgres`, and a nonempty
password. Arbitrary `options`, wrong project, wrong port, foreign host and non-Postgres
schemes still reject. The derived executor URI still switches to the restricted
executor identity, port 6543, and removes all installer query parameters before the
separate child process is started.

Repair commits on `reconcile/build-6-tested-move`:

- `8d5de0e60fbb2b327221c096e0613f6b63e5a8d3` — parser repair;
- `2e2615ce3fd459c962c6ab892175c10f9e53597f` — focused regression update.

The accepted branch delta from the prior handoff commit
`76c9ff8a921576e8789d7b22de19c88d3ce44ae4` is limited to the M2 custody helper and
its handoff test.

# Qualification

A disposable CI branch and draft PR #24 were used only to invoke the repository's
existing PostgreSQL 17 qualification machinery. The qualification-only marker and
workflow tweak were not merged; PR #24 was closed unmerged.

GitHub Actions run 34425129570 passed completely under Node 24.20.0 and PostgreSQL
17.10. The focused M2 handoff suite passed 8/8, including the documented JIT
Session-pooler form, request pinning, recovery-before-effect, completed-retry,
unknown/altered preconditions, lost acknowledgement, completion corruption,
restricted child environment, and native-terminal secret non-echo. The full BUILD 6
isolated qualification then passed 24/24 and supplemental readiness races passed 7/7.
The selected migration SHA-256 remained
`de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`.

# Live surfaces rechecked

The exact Vercel project remains `ecb-human`
(`prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`) in team
`team_wueYGTZ3nxHz1WhMg8UE9gSy`. Production deployment
`dpl_9hvDKxhBdsMNDUgc2Akt4ipDtdmG` remains READY and sourced from
`cd8dbf5bb4b7c264038a5ded86986b89a2ad6b25`; the repaired M2 helper is excluded from
Vercel uploads, so no redeploy is required. `https://ecos.effortlessconnection.com/health`
returned HTTP 200 with service `ecb-human` and
`governance_activation=not_implied_by_service_health`.

The M1 receipt's secret-safe recovery and production-environment inventory remain
controlling; neither was invalidated by this local-only repair. No installer URI,
PAT, database error, generated executor credential, verifier credential or private
recovery content was read or committed in this repair.

# Next effect

Live M2 remains unactivated. Resume the exact retained request
`e4e78a38-4f42-4f0f-b281-bd0dbdb26fda` from the repaired accepted branch. The local
checkout must first fast-forward to the repaired branch head. Then run the existing
`Continue-BUILD-6-M2.command` and supply the canonical Session-pooler installer URI
only through its hidden native Terminal prompt. Do not put the URI in chat, a shell
argument, command history, logs or committed state.

After the launcher reports M2 PASS, independently reconstruct canonical state from a
fresh connection before recording completion. Required post-M2 state is exactly one
transition with the scope current pointer equal to that transition and matching the
retained genesis decision, request, P0, H, remit, binding, executor identity, and the
three ordered M2 obligations. P1 remains a separate human gate. BUILD 6 remains open
until that reconstruction is persisted and reviewed.
