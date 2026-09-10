STATUS: BUILD 6 M2 PRIVATE HANDOFF REPAIRED AND QUALIFIED — HUMAN INSTALLER INPUT REQUIRED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Accepted BUILD 6 staged Move plus current instruction to harness M2 through verified completion
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap (not closed)

# Current disposition

M1 is closed PASS and must not be replayed. The live M2 contract, canonical prior
committed genesis and exact P0/H/remit are recovered. One exact activation/recovery
request is retained.

The first live M2 custody attempt stopped at `private_installer_input`. Independent
canonical reconstruction established that it had made no effect: the binding and
single genesis decision remain committed, current transition is NULL, transitions
remain zero, and the executor remains NOLOGIN. The failure was a local parser defect:
the launcher rejected Supabase's documented temporary-access Session-pooler
`options=-c jit=true` form before database contact.

That seam is now repaired narrowly on the accepted branch and qualified. The focused
M2 handoff suite passes 8/8; full disposable PostgreSQL 17 BUILD 6 qualification
passes 24/24; supplemental races pass 7/7. Receipt 020 records the diagnosis, repair,
security boundary and qualification. Live M2 activation is still pending human
installer input.

```text
BUILD_0_TO_5B=CLOSED
BUILD_6=OPEN
M1=PASS; CLOSED; DO_NOT_REOPEN
CURRENT_MOVE=M2_REPAIRED_CUSTODY_HANDOFF_READY
M2=PREPARED_NOT_ACTIVATED
CURRENT_BRANCH=reconcile/build-6-tested-move
CURRENT_CHECKOUT=/private/tmp/ecb-build6-live-bind
CANONICAL_PROJECT=vezxivrvhakclxuvxzso
SCOPE=20ad3966-8647-4a0f-9eed-2888e67e1e49
H_REFERENT=4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d
BINDING=7446baff-13a8-4f68-a0c3-8445933575b8
GENESIS_DECISION=a5f6d414-85cd-4a67-b904-64fc122db362
GENESIS_PRIOR_COMMITTED=TRUE; UNWITHDRAWN=TRUE
SCOPES=1; DECISIONS=1; GENESIS_DECISIONS=1
CURRENT_TRANSITION=NULL
TRANSITIONS=0
M2_REQUEST=e4e78a38-4f42-4f0f-b281-bd0dbdb26fda
EXECUTOR=NOLOGIN; RESTRICTED_GRANTS_VERIFIED
EXECUTOR_LIVE_CONNECTIVITY=UNTESTED; PRIVATE_CUSTODY_REQUIRED
QUALIFIED_CODE_HEAD=2e2615ce3fd459c962c6ab892175c10f9e53597f
M2_HANDOFF_TESTS=8/8 PASS
BUILD6_PG17_TESTS=24/24 PASS
READINESS_RACES=7/7 PASS
HOSTED_HEALTH=PASS; RECHECKED 2026-09-09 AMERICA/PHOENIX
PRIVATE_RECOVERY=PASS_AT_M1; M1 RECORD NOT ACCESSED BY M2
P1=NOT_PREPARED_OR_ACCEPTED
BUILD_7_PLUS=UNOPENED
```

# Governing evidence and next handle

Start with `docs/build-receipts/020-build-6-m2-installer-input-repair.md`, then
`docs/build-receipts/019-build-6-m2-custody-handoff.md`. The delivered
`Continue-BUILD-6-M2.command` accepts the installer URI privately and runs
recovery/activation in a separate restricted executor process. No credential is to
be provided in chat.

- `docs/build-shape/008-build-6-move-release.md`, step 5 — exact M2 obligations.
- `docs/build-shape/008-build-6-runtime-boundary.md` — authority/custody separation.
- `docs/build-shape/008-build-6-human-binding.md` — unchanged accepted H/remit/P0.
- `docs/build-receipts/017-build-6-m1-complete.md` — closed M1 evidence.
- `docs/build-receipts/018-build-6-m2-preflight.md` — exact request and canonical basis.
- `docs/build-receipts/019-build-6-m2-custody-handoff.md` — custody/activation mechanism.
- `docs/build-receipts/020-build-6-m2-installer-input-repair.md` — repaired input seam and requalification.
- `docs/build-shape/008-build-6-m2-request.json` — reuse unchanged for recovery and execution.

The local checkout predates the parser repair and must fast-forward from the accepted
branch before the private launcher is run again. Then the next effect is private
provisioning of the existing restricted executor login followed by recovery-first
execution of the exact retained M2 request.

Unknown outcome does not permit a new request/effect. After activation, independently
reconstruct exactly one matching transition and its current pointer before recording
M2 completion. P1 remains its own human decision. BUILD 6 is not closed.

Do not rerun installation/binding or access M1 private recovery to obtain an executor
credential. Do not use owner/management-tool activation to bypass the restricted
executor boundary. Do not place installer credentials in chat, shell arguments,
command history, logs or committed state. The older `/Users/prodadmin/ECB-v2-Greenfield`
checkout is not the current Move; resume `/private/tmp/ecb-build6-live-bind` on the
branch named above.
