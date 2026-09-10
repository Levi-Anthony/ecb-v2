STATUS: BUILD 6 FIRST P1 AUTHORIZED — RESTRICTED EXECUTION GATE READY
DISPOSITION: RELEASE / LOCAL EXECUTION GATE
ROLE: Current human/agent checkout
AUTHORITY: Protected H acceptance reconstructed from canonical state; qualified Shape receipt 023
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap (not closed)

# Current disposition

M1 and M2 are closed PASS; M2 is Metabolized. Sense and Shape for the first ordinary succession are closed/qualified. Levi accepted the exact selected P1 through the protected WebAuthn/session route. That decision has been independently reconstructed and is unwithdrawn. No P1 transition has executed yet.

Controlling M2 evidence: `docs/build-receipts/021-build-6-m2-complete.md`.
M2 learning: `docs/build-receipts/022-build-6-m2-metabolize.md`.
Closed P1 Sense: `docs/build-sense/008-build-6-p1.md`.
P1 Shape: `docs/build-shape/008-build-6-p1.md`.
Qualified Shape release: `docs/build-receipts/023-build-6-p1-shape-ready.md`.
Exact candidate: `docs/build-shape/008-build-6-p1-candidate.json`.
Exact public execution request: `docs/build-shape/008-build-6-p1-execution-request.json`.

```text
BUILD_0_TO_5B=CLOSED
BUILD_6=OPEN
M1=PASS; CLOSED; DO_NOT_REOPEN
M2=PASS; CLOSED; METABOLIZED; RECOVERY_ONLY_ON_EXACT_RETRY
CURRENT_PHASE=MOVE
CURRENT_MOVE=P1_RESTRICTED_EXECUTION
CURRENT_BRANCH=reconcile/build-6-tested-move
CURRENT_CHECKOUT=/private/tmp/ecb-build6-live-bind
CANONICAL_PROJECT=vezxivrvhakclxuvxzso
SCOPE=20ad3966-8647-4a0f-9eed-2888e67e1e49
H_REFERENT=4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d
BINDING=7446baff-13a8-4f68-a0c3-8445933575b8
CURRENT_TRANSITION=63bcd3fd-55f4-49bd-976f-c2bba50e6ab1
SCOPES=1; DECISIONS=2; TRANSITIONS=1; WITHDRAWALS=0; SUCCESSION_DECISIONS=1
CURRENT_POINTER_MATCH=TRUE
BOOTSTRAP_EXHAUSTED=TRUE
P1_DIRECTION=SELECTED_EXPLANATION_REQUIRED_TRUE
P1_CANDIDATE_SHA256=2057597b340e7f324176c65847633b776e0d266407988dedbaec001359c39556
P1_DECISION=57d40c7e-4abb-49bb-ba75-c7f6f8d1e4e0
P1_DECISION_PREDECESSOR=63bcd3fd-55f4-49bd-976f-c2bba50e6ab1
P1_DECISION_H=4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d
P1_DECISION_WITHDRAWN=FALSE
P1_EXECUTION_REQUEST=d0508be7-0e19-4abb-aec4-12de2d95f4b0
P1_CANONICAL_EFFECT=NONE_YET
P1_EXECUTION_SEAM=QUALIFIED
P1_COLD_RECOVERY_SEAM=QUALIFIED
P1_QUALIFICATION=31/31 PASS; READINESS_RACES=7/7 PASS
P1_QUALIFICATION_RUN=34429879556
P1_ACCEPTED_CODE_MERGE=b170ded2fd4122874c088d0634885faf6b1d6651
EXECUTOR=LOGIN; RESTRICTED_GRANTS_VERIFIED; PRIVATE_CUSTODY_RETAINED
BUILD_7_PLUS=UNOPENED
```

# Reconstructed protected decision

Canonical project `vezxivrvhakclxuvxzso` now contains exactly one succession decision, `57d40c7e-4abb-49bb-ba75-c7f6f8d1e4e0`. It is unwithdrawn, uses exact H `4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d`, exact predecessor/basis `63bcd3fd-55f4-49bd-976f-c2bba50e6ab1`, and exact P1 digest `2057597b340e7f324176c65847633b776e0d266407988dedbaec001359c39556`. The policy payload is the selected one-field successor with `requires_human_explanation=true`. Current transition remains the M2 transition; therefore the grant is pending execution rather than already operative.

# Next exact gate

Fast-forward the local checkout, then run the qualified repo-native local succession helper against the retained private executor custody and exact public request. The helper must recover before effect and cold-recover afterward. It requests no installer URI and no human credential.

# Boundary

Do not repeat M1/M2. Do not recreate or alter the P1 decision/request. Do not expose or relocate executor credentials. Do not infer execution success from the human acceptance alone. Do not close BUILD 6 or open BUILD 7+ until canonical P1 execution is independently reconstructed after the local runner returns.