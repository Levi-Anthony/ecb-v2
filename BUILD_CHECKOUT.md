STATUS: BUILD 6 M2 COMPLETE — P1 HUMAN GOVERNANCE GATE NEXT
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Accepted BUILD 6 staged Move; M2 independently verified complete
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap (not closed)

# Current disposition

M1 is closed PASS and must not be replayed. M2 is closed PASS. The exact prior
genesis grant was consumed once through the restricted executor, canonical history
was independently reconstructed, and a fresh restricted connection recovered the
same committed result.

Controlling M2 evidence: `docs/build-receipts/021-build-6-m2-complete.md`.

```text
BUILD_0_TO_5B=CLOSED
BUILD_6=OPEN
M1=PASS; CLOSED; DO_NOT_REOPEN
CURRENT_MOVE=M2_COMPLETE_STOP
M2=PASS; CLOSED; RECOVERY_ONLY_ON_EXACT_RETRY
CURRENT_BRANCH=reconcile/build-6-tested-move
CURRENT_CHECKOUT=/private/tmp/ecb-build6-live-bind
CANONICAL_PROJECT=vezxivrvhakclxuvxzso
SCOPE=20ad3966-8647-4a0f-9eed-2888e67e1e49
H_REFERENT=4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d
BINDING=7446baff-13a8-4f68-a0c3-8445933575b8
GENESIS_DECISION=a5f6d414-85cd-4a67-b904-64fc122db362
M2_REQUEST=e4e78a38-4f42-4f0f-b281-bd0dbdb26fda
CURRENT_TRANSITION=63bcd3fd-55f4-49bd-976f-c2bba50e6ab1
SCOPES=1; DECISIONS=1; TRANSITIONS=1; WITHDRAWALS=0
CURRENT_POINTER_MATCH=TRUE
BOOTSTRAP_EXHAUSTED=TRUE
EXECUTOR_COLD_RECOVERY=PASS
QUALIFIED_CODE_HEAD=2e2615ce3fd459c962c6ab892175c10f9e53597f
M2_HANDOFF_TESTS=8/8 PASS
BUILD6_PG17_TESTS=24/24 PASS
READINESS_RACES=7/7 PASS
HOSTED_HEALTH=PASS
P1=NOT_STARTED_OR_ACCEPTED
BUILD_7_PLUS=UNOPENED
```

# Governing evidence

Start with `docs/build-receipts/021-build-6-m2-complete.md`. Supporting evidence is
in receipts 017 through 020 and the released BUILD 6 package under
`docs/build-shape/008-build-6-*`.

The sole transition is the scope current transition, has a null predecessor, and
matches the retained decision, request, P0, H, remit and binding. Its ordered M2
obligations are `activate_exact_p0`, `designate_initial_h_and_remit`, and
`exhaust_bootstrap`. No second transition or withdrawal exists.

The local checkout may lag this documentation-only branch head. On reentry,
fast-forward normally while preserving local retained recovery state and any saved
local work.

# Boundary

Do not repeat M1 or create another M2 effect. The next released behavior is P1, which
is a new human governance decision and is not answered by earlier H/remit/P0 or M2
authorization. Do not make that decision on the human's behalf. BUILD 6 remains open;
BUILD 7+ remains unopened.
