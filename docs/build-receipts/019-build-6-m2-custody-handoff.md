STATUS: TESTED M2 PRIVATE HANDOFF READY — HUMAN INSTALLER INPUT REQUIRED
DISPOSITION: EXECUTION_CHECKPOINT; NOT AN M2 ACTIVATION RECEIPT
DATE: 2026-09-09 America/Phoenix
AUTHORITY: User continuation after M2 preflight c96915b

# Result

The abstract private-custody boundary now has a human-operated launcher. It accepts
one canonical installer connection in a hidden Terminal prompt, provisions only
the existing restricted executor login, closes that connection, and starts a
separate restricted executor process to recover/execute the exact retained M2
request. It does not enroll, bind, deploy, modify P0/migration bytes, accept P1,
change the human service, or close BUILD 6.

Canonical read-only observation at 2026-09-10T01:00:01Z: one genesis decision,
zero transitions, current transition NULL, binding unchanged, executor NOLOGIN.
The previous M1 PASS remains closed. Live provisioning and activation are pending
human input; tests and launching a prompt do not establish their success.

# Small implementation and rationale

- `server/ecb-human/m2-custody.mjs`: human-terminal-only Node 24 installer. Checks
  canonical target, bound scope/genesis/P0, installed executor function hash and
  restricted role grants. Provisions only ecb_governance_executor. Emits fixed
  stage/error categories without raw database errors or credentials.
- The existing tested credential-retention utility is reused unchanged in a
  separate executor-only private directory. Its historical `verifier-runtime.json`
  filename does not make this an M1 verifier record. This avoids duplicating
  private file/lock/unknown-acknowledgement logic. Existing login without a matching
  recovery record stops rather than silently rotating its credential.
- Private credential retention is 0600 inside a 0700 directory under this task's
  `work/m2-executor-custody`. The installer URI/PAT is never saved. Do not remove
  the private directory while custody or outcome is unresolved.
- `server/ecb-human/m2-activate.mjs`: separate process receives only PATH and the
  restricted executor URI. Installer JIT flags, installer credentials, verifier
  credentials and other ambient configuration are not passed to it. It requires
  the exact executor login and the previously pinned request bytes.
- Recovery precedes every effect. Exact retained P0/remit/external-basis bytes,
  scope/H/binding and genesis are compared. Unknown outcome, state drift or a
  changed basis stops. Lost execution acknowledgement stops the run; the next run
  again starts with recovery. No automatically regenerated request or decision.
- Exact completion requires one transition, its matching current pointer,
  decision/request/P0/H/remit/binding, executor identity and all three ordered M2
  obligations. A fresh executor connection must recover the same result.
- Both new helpers are excluded from Vercel uploads. No M1 runtime or custody
  helper was edited. No package, database schema or universal mechanism added.

# Qualification

Node 24.20.0: 42 distinct tests passed across the verification runs, zero failures. This includes eight new handoff tests
for pinned request, recovery before effect, completed retry, altered/unknown
preconditions, lost acknowledgement, corrupt completion and isolated child
configuration and native-terminal suppression of a typed synthetic secret, plus existing custody, executor TLS/login and disposable PG17
WebAuthn/governance tests. All credentials/effects in tests are synthetic.

Syntax and diff checks pass. A real installer login, actual restricted pooler
connection and canonical activation remain live
observations to collect. This is not evidence of a completed M2 transaction.

# Human next action

Open the delivered `Continue-BUILD-6-M2.command`. At its hidden Terminal prompt,
paste the canonical Supabase Session-pooler installer URI for
`postgres.vezxivrvhakclxuvxzso` on port 5432. Use the privately held valid installer
connection; if using temporary access, its PAT/rule must still be valid and the
URI may retain `jit=true`. Never paste that URI into chat or a shell command.

The launcher is outside model terminal capture. After private authentication it
continues automatically through the already authorized exact M2 request; it asks
for no repeat P0/H/remit acceptance and performs no passkey ceremony. Keep the
Terminal output. If it stops, report only the printed stage/category, never the
connection string. After it reports M2 PASS, independently reconstruct canonical
history and persist a completion receipt before proceeding to the P1 human gate.

Request remains `e4e78a38-4f42-4f0f-b281-bd0dbdb26fda`, file SHA-256
`e67b2364c7e9da64f8379c13f4c37ec7c0bd8ca70b6b99c8817842e74012a9da`.
Prior detailed contract and evidence: receipt 018. M1 closure: receipt 017.
