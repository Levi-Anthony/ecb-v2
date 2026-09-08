STATUS: OPEN DECISION SURFACE

DISPOSITION: PROJECTION

ROLE: Candidate technical bindings for the BUILD 6 human authority H

AUTHORITY: None independently; selection belongs to BUILD 6 Shape under explicit human disposition

# Governance Authenticator — Decision Surface

## Decision to make

Choose the technical mechanism that binds the designated human authority H to a
consequential governance decision, such that a party holding ordinary technical
power over the substrate cannot manufacture the proposition *"H approved this."*

This chooses the binding, not the authority.

H is designated by the external root, not by the mechanism. No mechanism on this
page establishes who H is, what H's remit is, or that any particular decision was
warranted. The mechanism decides only how a later reader can tell an authorized
decision from a fabricated one.

This surface serves [BUILD 6 Sense Q1](../build-sense/008-build-6.md#question-forward)
— *"how is that identity established independently of caller prose?"* — and the
Sense follow-up's explicitly reserved alternative: *"Whether the technical binding
is a restricted installer custody boundary or authenticated application flow is
still a Shape alternative; the selected boundary must withstand its named
caller-forgery and replay tests."*

## Why this surface was opened

The prior working assumption routed H through a project-local Supabase Auth user:

`email → Auth user → confirmed email → authenticated session → immutable Auth sub → H`

That route is currently blocked at its first step. A bounded read-only lookup found
no project-local `auth.users` row for the supplied account email, so enrollment
would require sending a verified email invitation before any binding could occur.

The block prompted a human re-examination of whether the Auth-account route is the
right boundary at all, rather than merely how to unblock it. This document records
the alternatives so the choice is made deliberately and before enrollment, because
one of the candidates is expensive to change afterwards.

## Candidate A — Supabase Auth account binding

Bind H to an immutable Supabase Auth subject. A governance write is accepted when
it arrives inside an authenticated session for that subject.

### Advantages

- The database derives the principal itself from the verified JWT, with no
  additional trusted code between the caller and the enforcement surface.
- It matches the traced legacy boundary at `a5d4fb4f`, where
  `artifact_authenticated_human_principal()` requires an authenticated session plus
  an active registry row, and direct patch execution is revoked from ordinary API
  roles including `service_role`.
- The enrollment, recovery, and revocation lifecycle is operated by Supabase rather
  than by this build.
- No new external naming dependency is introduced.

### Pressures

- The proposition proved is *"a request arrived inside H's authenticated session."*
  It is not a proposition about any particular decision.
- The approval leaves no artifact that a later reader can independently re-check. A
  reader must trust the writer's state at write time, permanently.
- The JWT signing secret and the Auth-admin path are a standing forgery route: a
  holder can mint a session for any subject. Custody separation bounds who holds
  that path; it does not make its use detectable after the fact.
- Email confirmation sits on the critical path of establishing governance authority,
  which attaches the trust root to mailbox control.

## Candidate B — Direct WebAuthn credential binding

Bind H to an extensible set of registered public-key credentials. A governance
decision is accepted when it carries a WebAuthn assertion over a server-issued
challenge that commits to that exact decision.

```text
H = Levi
AUTHORIZED CREDENTIALS
├── platform passkey (Apple, iCloud-synced)
├── optional hardware FIDO2 security key
└── optional independently held second passkey
```

The governance store holds `credential_id`, public key, COSE algorithm, credential
type, registration basis, status, `created_at`, `revoked_at`. It holds no private
key, no password, and no email as identity.

### Advantages

- The proposition proved is *"a credential already bound to H signed these exact
  decision bytes."* Scope, operation, candidate policy digest, expected predecessor
  and expiry can all be inside the signed challenge; changing any material part
  produces a different challenge, so the signature cannot be carried to another
  policy or predecessor.
- The assertion is a retained, exactly-reconstructible artifact that any later
  reader can re-verify against the registered public key. This is the same shape
  BUILD 5B already earned — exact retained representation plus a checkable
  predicate — applied to authorization rather than transformation.
- One human authority is not one credential. Losing or revoking a credential does
  not change who H is, which answers the single-point-of-failure objection that
  device-bound schemes cannot.
- Credentials are scoped to a relying party, which makes the approval ceremony
  phishing-resistant and removes bearer-secret handling from the human path.
- Email confirmation leaves the critical path entirely.

### Pressures

- **The verifier is new trusted code.** Assertion verification requires COSE key
  parsing and ECDSA P-256 signature checking. Apple platform passkeys use COSE
  algorithm `-7` (ES256). Stock Supabase Postgres extensions do not provide ECDSA
  verification, so verification must run in an Edge Function or server route, and
  the database must then either trust that component or retain the assertion for
  later re-checking. Candidate A needs no such component.
- The credential-set lifecycle — enrollment of credential N+1, revocation, and the
  last-credential lockout case — is new governance surface that Candidate A did not
  have. Each of those operations is itself a consequential decision and must not
  become an unbounded override. This intersects [Sense Q7](../build-sense/008-build-6.md#question-forward)
  directly.
- The relying-party ID becomes a governance dependency. See *RP ID* below.
- The mechanism is only as strong as the weakest accepted write path. See
  *Replacement, not addition* below.

## Candidate C — Supabase passkeys

Supabase Auth added passkey support. Selecting it does **not** convert Candidate A
into Candidate B, for two independent reasons.

First, it does not remove the enrollment problem. Per current Supabase
documentation, *"Registering a passkey requires an existing, confirmed,
non-anonymous user"*, and *"Anonymous users cannot register passkeys — link an
email or phone first."* The sequence is still `create Auth user → confirm it →
register passkey`.

Second, and more decisively, the ceremony is an **authentication** ceremony. The
challenge is issued by GoTrue to establish a session; it does not commit to a
governance decision. What the assertion proves is that a passkey ceremony happened
during sign-in — a stronger login than a password, and still a statement about a
session rather than about a decision. The same holds for the WebAuthn MFA factor,
whose challenge is a step-up challenge.

Supabase also currently labels passkey support *experimental*, requiring explicit
client opt-in, with the API subject to change without notice.

Candidate C is therefore a reasonable way to harden *access to the Door*. It is not
a substitute for a decision-bound assertion, and it should not be recorded as one.

## Candidate D — Apple App Attest

Rejected as a governance root, and the reason is not effort. App Attest keys are
generated in the Secure Enclave of one installation and cannot leave it. That makes
the authority device-bound and non-recoverable, which is the opposite of the
resilience property being sought. It also requires a native iOS app, device
enrollment, replacement and recovery handling, and an Apple Developer setup.

The required proposition is not *"this exact iPhone approved this."* It is *"one of
H's explicitly enrolled credentials approved this exact decision."* Recorded here so
it is not re-proposed as a strengthening move later.

## Verified external facts

Checked against live Supabase documentation on 2026-09-07. Recorded because two of
them constrain a choice that is expensive to reverse.

| Fact | Consequence here |
|---|---|
| Registering a Supabase passkey requires an existing, confirmed, non-anonymous user; anonymous and SSO users cannot register one. | Candidate C does not bypass Auth-user enrollment. |
| Supabase passkey support is experimental and requires explicit client opt-in; the API may change without notice. | Weighs against depending on it for a constitutional boundary. |
| *"Passkeys are cryptographically bound to the Relying Party (RP) ID they were registered against. Changing the RP ID makes every existing passkey unusable."* | RP ID must be chosen before the first enrollment. |
| Supabase exposes both a full-ceremony API and a two-step start/verify API returning standard `PublicKeyCredentialCreationOptions` / `RequestOptions`. | A direct-WebAuthn implementation is not forced to hand-roll the browser ceremony, but it does issue its own challenges. |

These facts are evidence about the platform. They do not select a candidate.

## Corrections required before Candidate B is selectable

The WebAuthn proposal as raised is sound in its core claim. Six things must be
explicit before it can be frozen, because each is a place where the mechanism
silently weakens into Candidate A with extra steps.

### 1. Replacement, not addition

If a session-authenticated approval path remains available in parallel with the
assertion path, the assertion requirement is decorative: the weakest accepted path
defines the boundary. Sense already states this — *"No statement here proves a
non-bypassable boundary while the same actor retains an independent privileged
path."*

Selecting B means removing session-derived approval from the **governance write
path**. It does not mean removing session login from Door access. Those are
different surfaces and should be decided separately.

### 2. Verification is a check, not an authorization

A valid signature is a verification result. Under the governing invariants, a
verification result *"does not by itself establish truth beyond that checked
proposition, correctness outside that scope, warrant, authority, authorization,
governing acceptance, or currentness"*, and *"registration, persistence, successful
execution, checking, and recency do not supply that basis by themselves."*

So the record must keep three things distinguishable, per role non-collapse: the
human's decision, the assertion retained as its evidence, and the verifier's check
result. A verified assertion must not be the single step that installs a policy;
it is the evidence that the authorization occurred and that it covered these exact
bytes.

### 3. The challenge must commit to the decision, and the server must hold the commitment

A WebAuthn assertion signs `authenticatorData ‖ SHA-256(clientDataJSON)`. The only
decision-bearing field available is the `challenge` inside `clientDataJSON`.
Therefore:

- The server issues the challenge and stores, at issue time, a row binding it to
  the exact decision: scope, operation, candidate digest, expected predecessor,
  nonce, expiry.
- Verification resolves the decision from that stored row, never from a decision
  the client submits alongside the assertion. Otherwise a caller pairs a valid
  assertion with different content, which is precisely the caller-forgery case
  Sense requires the boundary to withstand.
- The challenge is single-use and consumed on the first terminal outcome.
- The canonical decision serialization is retained next to the assertion so the
  whole check is reproducible later without the issuing server.

### 4. User verification must be required and checked

The claim being made is *"H performed a deliberate approval,"* not *"H's device was
present."* Those differ by one bit: the UV flag in `authenticatorData`. If UV is
not required at challenge issue and not checked at verification, Face ID or a
passcode may not have occurred at all, and the record overstates what happened.

Also check `type == "webauthn.get"`, check `origin` against an allowlist, and check
the RP ID hash.

### 5. Signature counters will not help here

iCloud-synced passkeys generally report a signature counter of zero and do not
increment it, so counter-based clone detection is unavailable for exactly the
credential class this proposal prefers. Replay protection must come entirely from
single-use, server-held, expiring challenges. Recording the credential's backup
eligibility and backup state is worthwhile for a different reason: it is the honest
record of whether a given credential is device-bound or ecosystem-bound.

### 6. Credential-set lifecycle is the new governance surface

`H → {credential A, B, C}` is the right model, and it creates three operations that
must be governed rather than administered:

- **Enrollment of a further credential** must itself be a decision signed by an
  already-registered credential. Otherwise credential registration is a silent
  authority-widening path, which reintroduces the exact failure the proposal exists
  to prevent.
- **Revocation of credential X** should require an assertion from a credential
  other than X, so a stolen credential cannot evict the legitimate ones.
- **Revoking the last credential** must be refused, or routed through the
  exceptional recovery path with its own bounded basis.

Bootstrap registration is the one enrollment that cannot be signed, because no
credential exists yet. That is the external root, and it is the same obligation
BUILD 6 already carries: bound, consumed on completion, non-replayable. WebAuthn
changes what the root commissions — public keys instead of an email-to-account
mapping — but it does not remove the root, and it must not become a standing
re-registration capability. Registering two credentials at bootstrap rather than
one is the cheapest way to make later recovery ordinary instead of exceptional.

## What the choice actually turns on

Not user experience, and not cryptographic strength in the abstract. Both
candidates authenticate a human adequately for a login.

The discriminating difference is what survives the moment:

- Candidate A produces an approval whose legitimacy is asserted by the system that
  recorded it. It cannot be re-checked later. A compromise of the signing path is
  undetectable in the record.
- Candidate B produces an approval that carries its own evidence. A later reader
  with only the public key and the retained bytes can tell whether the assertion
  covers this decision. A compromise of the verifier can still write a decision,
  but it cannot produce a valid assertion for one, so the forgery is detectable
  rather than invisible.

Candidate B does not remove the trusted component. It removes the unfalsifiable
part of the trust. That is the argument for it, and it is an argument this
repository has already accepted in another dimension: BUILD 5B chose retained exact
representation over trusting a producer's report.

## Decision criteria

Evaluate in this order:

1. **Caller forgery** — a caller asserting H's identity is rejected, and the
   rejection does not depend on the caller's own honesty.
2. **Decision binding** — an approval cannot be transplanted to a different policy,
   scope, or predecessor.
3. **Replay** — an exhausted approval and an exhausted bootstrap grant cannot be
   reused, and a valid succession still passes.
4. **Independent reconstruction** — the authority basis for a past decision can be
   re-checked from durable records without trusting the recording session.
5. **Bounded bootstrap** — the initial grant is consumed and cannot silently become
   a standing override.
6. **Recoverability** — loss of one credential or one device does not lose H, and
   the recovery route is explicitly exceptional.
7. **Trust-boundary size** — how much new privileged code sits between the human
   act and the enforcement surface, and whether its failure is detectable.
8. **Reopening clarity** — the ADR names the concrete condition that would justify
   changing the binding.

Convenience, UX polish, and platform novelty do not outrank the first six.

## Minimum decision experiment

Do not build both. For each still-credible candidate, prove only:

- one successful approval of an exact decision by the designated human;
- rejection of the same approval replayed;
- rejection of the same signature or session presented against a modified decision
  (changed candidate digest or changed expected predecessor);
- rejection of a caller-asserted human identity with no valid basis;
- a valid positive control, so universal denial cannot pass the suite;
- for Candidate B only: independent re-verification of a retained assertion by a
  process that did not issue the challenge.

The negative controls matter more than the positive one here, per proof
sensitivity: a boundary that has not been shown to discriminate has not been shown
to hold.

## Human inputs required before closure

1. **Which candidate binds H for governance writes** — A, B, or B for governance
   writes with A or C for Door access.
2. **If B: the relying-party ID.** This must be settled before the first
   enrollment, because changing it invalidates every credential registered against
   it. A platform-owned preview hostname is a poor choice: it is not portable, and
   its DNS is not under this project's custody. A stable owned apex domain is the
   defensible option. Choosing the RP ID attaches domain custody — registrar and
   DNS — to the governance root, and that dependency should be accepted knowingly.
3. **If B: how many credentials are enrolled at bootstrap** — one, or two so that
   loss of one is ordinary rather than exceptional.
4. **Whether the previously supplied account email remains needed at all.** Under B
   it is not an authority credential and may not be needed for governance. It may
   still be wanted for Door access or operational notification. This should be
   answered rather than left implicitly pending.

The account email question was raised as a blocking input. Under Candidate B it
stops being a governance question. It does not automatically stop being a question.

## Limits of this document

This is a decision surface. It selects nothing, closes nothing, and opens nothing.

It binds no Output Contract, freezes no acceptance trace, and creates no aperture.
No schema, enum, role, table, policy, migration or credential is proposed here. No
database contact occurred in producing it, canonical or otherwise. No WebAuthn
ceremony, verification path, or signature check was executed; every claim about
mechanism behavior is documentary.

Two facts about the surrounding state are recorded so they are not mistaken for
completeness. First, the BUILD 6 technical Shape, mechanism candidate, P0 candidate
and human-binding records referenced from the tracking issue exist only in a local
working copy and are not present on any pushed branch, so they were not read and
this document may duplicate or contradict analysis already done there;
reconciliation against them is required before selection. Second, the pushed
checkout on this branch records `SHAPE=UNOPENED` while the tracking issue reports
BUILD 6 Shape open under recorded human authorization. That divergence is a
projection-state discrepancy for the human to settle, not something this document
resolves.

Selection requires an ADR under [the ADR route](../architecture-decisions/README.md),
naming the chosen binding and its reopening condition.

## Adjacent surface to reconcile

The ECB artifact `human-door-dashboard-technical-spec` block `/auth-model` resolves
its Open Question 5 toward Candidate A — one Supabase Auth principal, session login
enforced in middleware, adjudication RPCs running under that JWT. That artifact is
draft standing and governs a different surface (the Door dashboard), so it does not
bind this decision. If Candidate B is selected for governance writes, that block
needs re-review rather than silent divergence.

## Sources

- [BUILD 6 Sense](../build-sense/008-build-6.md) — focal episode, Question Forward, authenticated approval boundary
- [Build Contract: governance activation](../build-contract.md#governance-activation)
- [Invariants: cross-cutting integrity and promotion discipline](../invariants.md#cross-cutting-integrity-and-promotion-discipline)
- [Glossary: Warrant](../glossary.md#warrant)
- [Supabase: Passkey authentication](https://supabase.com/docs/guides/auth/passkeys)
- [Supabase: Configure passkey authentication (self-hosted)](https://supabase.com/docs/guides/self-hosting/self-hosted-passkeys)
- [W3C Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/)
