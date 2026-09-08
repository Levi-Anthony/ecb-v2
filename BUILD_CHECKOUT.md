STATUS: BUILD 6 SHAPE OPEN — REMOTE RECONCILIATION CHECKPOINT; MECHANISM NOT SELECTED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Governing repository sources; human BUILD 5B closure and “Open 6” / “Continue”; later human-provided BUILD 6 binding/technical-Shape state as explicitly qualified below
CURRENT BUILD UNIT: BUILD 6 — Governance Bootstrap

# BUILD 6 — Governance Bootstrap

## CURRENT MOVE

`RECONCILE THE ACCEPTED HUMAN/BOOTSTRAP BASIS WITH THE OPEN H-BINDING DECISION SURFACE → FREEZE ONLY THE MINIMUM BUILD 6 SHAPE`

```text
BUILD_0_TO_5B=CLOSED
BUILD_5B_MAIN_MERGE=1ff284164160f74c398bcfe4d2c300b694070b7f
BUILD_6=SHAPE_OPEN; NOT_FROZEN
SENSE=ORIGINAL_PUSHED_RECORD_RETAINED; ACTIVE_PHASE_SUPERSEDED_BY_LATER_SHAPE_WORK
FOCAL_EPISODE=EXTERNAL_ROOT_TO_P0_GENESIS_TO_BOOTSTRAP_EXHAUSTION_TO_ONE_ORDINARY_SUCCESSION
H=LEVI; HUMAN-ACCEPTED_UPSTREAM; EXACT_LOCAL_BINDING_RECORD_NOT_YET_REMOTE
REMIT=HUMAN-ACCEPTED_UPSTREAM; EXACT_LOCAL_RECORD_NOT_YET_REMOTE
P0=HUMAN-ACCEPTED_UPSTREAM; EXACT_BYTES/LOCAL_RECORD_NOT_YET_REMOTE
TECHNICAL_SHAPE=CANDIDATE; NOT_FROZEN
H_BINDING_MECHANISM=UNSELECTED
CANDIDATE_A=SUPABASE_AUTH_SESSION_BINDING
CANDIDATE_B=DIRECT_WEBAUTHN_DECISION-BOUND_CREDENTIAL_SET
CANDIDATE_C=SUPABASE_PASSKEYS_FOR_AUTHENTICATION; NOT_EQUIVALENT_TO_DECISION-BOUND_B
CANDIDATE_D=APPLE_APP_ATTEST; ANALYTICALLY_REJECTED_AS_DEVICE-BOUND_ROOT_IN_OPEN_DECISION_SURFACE; NOT_HUMAN_FROZEN
OUTPUT_CONTRACT=UNBOUND
MOVE_PERMISSION=UNRELEASED
IMPLEMENTATION=UNOPENED
CANONICAL_BUILD_6_MUTATION=NONE_ESTABLISHED_BY_THIS_CHECKPOINT
BUILD_7_PLUS=UNOPENED
```

## RECONCILIATION BASIS

This checkout repairs a remote-state split without selecting architecture.

Current `main` contains the accepted BUILD 5B merge but retained a stale pre-closure
BUILD 5B checkout. The pushed `build/build-6-sense` branch contains the BUILD 6
Sense record. The later `claude/webauthn-governance-auth-6yqpf9` branch adds the
open governance-authenticator decision surface and is exactly one commit ahead of
the pushed Sense branch, but both diverge from current `main` at the BUILD 5B human
closure commit.

This reconciliation therefore copies the decision-relevant BUILD 6 files onto the
current `main` ancestry rather than merging the divergent branch history.

The human has also supplied a later BUILD 6 technical-boundary record stating that
H=Levi, the stated remit and exact P0 were already accepted and that the technical
mechanism remained a candidate, not frozen or implemented. The pushed
governance-authenticator surface independently records that the technical Shape,
mechanism candidate, P0 candidate and human-binding records existed only in a local
working copy and had not been read there. Those exact local files are still not
present on any remotely inspectable branch at this checkpoint.

Therefore this checkout preserves the accepted subjects as reported human state
without inventing their absent bytes, filenames, identifiers, or detailed terms.
If the local records are later pushed, compare them against this projection and
replace the qualified summaries with exact pointers. Do not reopen their acceptance
merely because remote persistence lagged.

## PURPOSE / INVARIANT SERVED

BUILD 6 must make the origin and retirement of bootstrap authority explicit and
reconstructible so ordinary governance can succeed it without self-authorization.
Preserve capability versus warrant/authorization, evidence versus authority,
identity versus role, verification versus authorization, current versus newest,
and candidate policy versus operative policy.

The governing sequence remains:

`bootstrap trust root → initial policy activation → human/warrant authority designation → bootstrap exhaustion → ordinary governed succession`

The currently proposed minimum worked episode is one governance scope, exact P0
genesis under the bounded external root, explicit exhaustion, and one P0-authorized
P1 succession with forged/stale/replay controls and restart reconstruction.

## ACCEPTED / CARRIED FORWARD

- BUILD 0–5B are closed; BUILD 5B closure and canonical evidence remain historical
  predecessor authority/evidence and are not reopened here.
- BUILD 6 is authorized and has progressed beyond the original pushed Sense phase.
- H is Levi; the stated remit and exact P0 are reported human-accepted upstream.
- P0 may not authorize its own birth; the bootstrap root is external, bounded and
  must be exhausted.
- Ordinary succession is authorized under the previously operative basis; newest
  does not mean governing.
- Caller prose, metadata, service-role/owner capability, a stored record, or a PASS
  result cannot manufacture human authority.
- One human authority need not collapse to one technical credential.

These bullets preserve already-established state. They do not freeze a new
technical mechanism or recreate the absent local human-binding/P0 records.

## OPEN SHAPE CELLS

The active mechanism decision is documented in
`docs/deployment-shapes/governance-authenticator.md`.

The genuinely open cells are:

1. Select the H-binding mechanism for governance writes: Candidate A (Supabase Auth
   session binding), Candidate B (direct WebAuthn decision-bound assertions), or B
   for governance writes with separate Auth/passkey treatment for Door access.
2. If B is selected, choose the stable WebAuthn relying-party ID before first
   credential registration.
3. If B is selected, choose bootstrap credential redundancy: one credential or two
   independently recoverable credentials bound to the same H.
4. Disposition the previously supplied account email: governance input, Door/access
   input, notification-only input, or unnecessary. Under B it is not the authority
   credential.
5. Freeze the minimum credential enrollment/revocation/recovery boundary so
   credential lifecycle cannot become a standing bootstrap override.
6. Freeze the minimum qualification experiment and exact recovery outcomes needed
   to discriminate legitimate approval from caller forgery, modified decision,
   replay, stale predecessor and unknown outcome.
7. Reconcile the pushed decision surface against the exact local human-binding,
   mechanism-candidate, P0 and technical-Shape records when those bytes become
   remotely available. Any contradiction that can change the mechanism or Output
   Contract must be resolved before Shape closes.

No other BUILD 6 question should be reopened unless it can change the implementation
boundary, acceptance test, recovery semantics or authority meaning of this bounded
episode.

## CURRENT CANDIDATE PRESSURE

The open decision surface gives direct WebAuthn a material property that session
binding does not: a retained assertion can be independently re-verified against the
registered public key and can commit to exact decision bytes. It also introduces a
new verifier, relying-party dependency, challenge lifecycle and credential-set
recovery surface. Those costs must be dispositioned rather than hidden.

Selecting direct WebAuthn would require, at minimum:

- decision-bound server-held single-use challenges;
- required and checked user verification;
- origin and RP-ID-hash checking;
- retained canonical decision/assertion material for later re-verification;
- no parallel weaker governance-write path that silently bypasses the assertion;
- governed enrollment/revocation/recovery of additional credentials;
- explicit bounded bootstrap enrollment that is consumed on completion.

These are candidate constraints, not yet frozen requirements.

## ENFORCEMENT / FAILURE BEHAVIOR

No BUILD 6 enforcement surface is installed by this checkpoint. Do not infer
non-bypassability from documentation, a valid signature, an authenticated session,
or privileged custody alone.

A missing mechanism decision blocks dependent Shape closure and implementation; it
does not authorize invention. A missing remote copy of an already accepted local
record triggers reconciliation, not blank-slate re-elicitation or silent demotion.

Do not contact or mutate canonical state merely to make this projection look
complete. Any future canonical contact must belong to an explicitly released Shape
or Move obligation and must retain its evidence/authority limits.

## REENTRY / USAGE RULE

Fresh sessions MUST start here and follow only the explicit pointers needed by the
open cells.

Do not re-run broad repository archaeology, re-read closed BUILD 0–5B material, or
re-litigate Supabase/WebAuthn platform background unless a named open cell exposes a
fact that can change the current decision.

At a constrained usage boundary, persist current findings, update this checkout,
commit/push and state the exact next handle before opening another investigation.
Do not leave a more advanced authoritative or decision-relevant state only in chat.

## NON-GOALS

No mechanism selection, ADR closure, schema/role/enum design, migration, Edge
Function, WebAuthn ceremony, credential enrollment, Supabase Auth enrollment,
canonical policy activation, Master-Key designation, action envelope, BUILD 7 work,
or generalized recovery/identity platform is authorized by this reconciliation.

## NEXT HANDLE

Open only:

1. `docs/deployment-shapes/governance-authenticator.md` for the H-binding choice;
2. the exact local BUILD 6 human-binding / P0 / mechanism / technical-Shape records
   if and when they are made remotely available.

Then resolve only the seven open Shape cells above and present the minimum frozen
Shape / Output Contract for explicit human disposition. Do not begin Move or
implementation in the same step merely because usage remains.
