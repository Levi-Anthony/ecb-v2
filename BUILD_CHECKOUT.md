STATUS: BUILD 6 M2 PRIVATE HANDOFF READY — HUMAN INSTALLER INPUT REQUIRED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Current explicit instruction to continue from verified M1 through the next bounded M2 step, stopping at human/private-custody boundaries
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap (not closed)

# Current disposition

M1 is closed PASS. Its historical receipt is unchanged. The live M2 contract,
canonical prior committed genesis and exact P0/H/remit are recovered. One exact
activation/recovery request is retained. The executor client now supplies the
retained CA with strict TLS and checks its restricted login before contact with
the governance entry. The human-operated custody/activation handoff is now implemented. Node 24.20.0
qualification passed 42/42 distinct tests. Live installer input is pending.

```text
BUILD_0_TO_5B=CLOSED
BUILD_6=OPEN
M1=PASS; CLOSED; DO_NOT_REOPEN
CURRENT_MOVE=M2_CUSTODY_HANDOFF_READY
M2=PREPARED_NOT_ACTIVATED
CURRENT_BRANCH=reconcile/build-6-tested-move
CURRENT_CHECKOUT=/private/tmp/ecb-build6-live-bind
STARTING_SOURCE=ee4d32298cfc03bd9e820ba10cd6ff37fa435ddd
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
HOSTED_HEALTH=PASS_AT_M1; NOT_RECHECKED_IN_THIS_STEP
PRIVATE_RECOVERY=PASS_AT_M1; NOT_ACCESSED_IN_THIS_STEP
P1=NOT_PREPARED_OR_ACCEPTED
BUILD_7_PLUS=UNOPENED
```

# Governing evidence and next handle

Start with `docs/build-receipts/019-build-6-m2-custody-handoff.md`. The delivered
`Continue-BUILD-6-M2.command` accepts the installer URI privately and then runs
recovery/activation in a separate restricted executor process. No credential
is to be provided in chat. Canonical activation remains unverified until that run
and independent reconstruction complete.


- `docs/build-shape/008-build-6-move-release.md`, step 5 — exact M2 obligations.
- `docs/build-shape/008-build-6-runtime-boundary.md` — authority/custody separation.
- `docs/build-shape/008-build-6-human-binding.md` — unchanged accepted H/remit/P0.
- `docs/build-receipts/017-build-6-m1-complete.md` — closed M1 evidence.
- `docs/build-receipts/018-build-6-m2-preflight.md` — current observation, tests,
  request identity, rationale and exact private-custody resumption procedure.
- `docs/build-shape/008-build-6-m2-request.json` — reuse unchanged for recovery
  and any execution; no new genesis decision or renewed P0 approval.

Next effect is private provisioning/qualification of the existing restricted
executor login by the installation custodian. Then recover this exact request
before any M2 execution. Unknown outcome does not permit a new request/effect.
After activation, independently reconstruct the exact transition and persist its
receipt. P1 remains its own human decision. BUILD 6 is not closed.

Do not rerun installation/binding or access M1 private recovery to obtain an
executor credential. Do not use owner/management-tool activation to bypass the
restricted executor boundary. The original saved project path is stale; the older
`/Users/prodadmin/ECB-v2-Greenfield` checkout contains unrelated changes and is not
the current Move. Resume the branch named above.
