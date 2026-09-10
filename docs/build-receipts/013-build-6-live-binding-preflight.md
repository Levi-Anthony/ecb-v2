STATUS: PASS — LIVE M1 BINDING PREFLIGHT COMPLETE; HUMAN CUSTODY PENDING
DISPOSITION: EXECUTION RECEIPT
DATE: 2026-09-08 America/Phoenix

# BUILD 6 — Live M1 binding preflight

## Authority and boundary

Levi instructed the current Move to be carried through verified completion under the accepted BUILD 6 Shape, with autonomous inspection/repair/deploy/retry and with pauses only for genuine human custody, unresolved consequential choice, or unavailable evidence. For this Move, human custody is limited to the private installer connection, the local OPEN gate, native WebAuthn/passkey authorization, and unavoidable secret-bearing actions.

The completion boundary is exact M1 binding only:

- `binding != NULL`
- one committed genesis decision
- `current_transition = NULL`
- `transitions = 0`
- required private recovery material retained
- `ecb-human` `/health` healthy through the restricted verifier
- exact Vercel project/environment targeting and secret hygiene verified

M2 is explicitly outside this Move. Do not execute, prepare, or opportunistically advance M2.

## Recovered live state

Canonical Supabase project: `vezxivrvhakclxuvxzso`.

The canonical migration ledger now contains `20260908083501 build_6_governance_bootstrap`. The private `ecb_governance` schema contains exactly seven native tables: `subjects`, `scopes`, `credentials`, `ceremonies`, `sessions`, `decisions`, and `transitions`; all seven report RLS enabled and zero rows at preflight. A separate canonical count query likewise observed `scopes=0`, `credentials=0`, `sessions=0`, `decisions=0`, and `transitions=0`.

The canonical governance mechanism is therefore installed but inactive. No live scope, credential, decision, or transition existed at this preflight.

Vercel target remains exact project `ecb-human` (`prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`) under team `team_wueYGTZ3nxHz1WhMg8UE9gSy`. Before verifier provisioning, `https://ecos.effortlessconnection.com/health` still returns the expected fail-closed HTTP 503 `service_unavailable` / `outcome: unknown`, confirming that the current hosted surface has not silently acquired a verifier database credential.

## Minimum implementation completed

The accepted remit text needed by the existing installer was frozen as `docs/build-shape/008-build-6-accepted-remit.txt`; this is an implementation representation of the already accepted remit, not a new authority grant.

The hosted entry handler was repaired so `/`, `/intervene`, assets, `/health`, and API traffic all pass through the same verifier connection gate. With no valid `HUMAN_DATABASE_URL` the service still fails closed; after a qualified verifier connection exists, the already implemented application can serve the protected human entrance.

The browser client now accepts a non-secret `?scope=<uuid>` handoff, copies it into the scope field, and immediately removes the query from browser history. The setup capability remains out of URLs.

`server/ecb-human/live-bind.mjs` is the single local custody path. Its committed blob is `0862b36f1fb8e9fba66389a66b37384c04697979`; those exact bytes passed `node --check` before commit. The helper:

- verifies branch, clean critical files, exact migration/P0 digests, Vercel target, and forbidden environment-key absence;
- privately accepts only the canonical Supabase Session-pooler installer URI with terminal echo disabled;
- verifies canonical M2 absence and role privilege shape;
- generates the verifier password only in process memory, enables only `ecb_human_verifier LOGIN`, and locally qualifies that restricted role under strict TLS;
- supplies only `HUMAN_DATABASE_URL` to exact `ecb-human` production via Vercel stdin and redeploys;
- requires `/health` 200 and verifier-gated root HTML before commissioning setup;
- invokes the existing human-operated installer rather than replacing its commission semantics;
- stores/reuses the existing private `~/.ecb-human-setup/` recovery record and refuses a blind second commission if a partial canonical scope exists;
- uses the macOS clipboard only for the short-lived setup capability and clears it after completion when still present;
- polls canonical state through the M1 ceremony and hard-stops if any transition appears;
- verifies exact M1, setup-capability invalidation, final `/health`, and final restricted Vercel environment inventory;
- never enables the executor role and contains no M2 execution path.

## Remaining human custody

One local terminal run remains. The helper itself explains each custody action immediately before it occurs. Levi must supply the private canonical installer URI into the hidden prompt, type `OPEN` after inspecting the exact retained package, and complete the native passkey plus protected binding in the browser. No secret value belongs in chat, command history, committed files, or model-visible logs.

After the helper reports `LIVE_BINDING=PASS`, canonical/Vercel state must still be independently reconstructed before the Move is declared complete and persisted as M1. Stop there; M2 remains unopened for this Move.
