STATUS: REVISED TECHNICAL SHAPE CANDIDATE — NOT FROZEN OR INSTALLED
DISPOSITION: PROJECTION / SOURCE RECONCILIATION
DATE: 2026-09-07 America/Phoenix

# BUILD 6 — Exact human decisions through WebAuthn

**Current technical continuation:** [Runtime, session and record boundary](008-build-6-runtime-boundary.md) supplies the concrete proposal and observed hosting/credential constraints. Earlier alternatives below retain their historical scope.

## Human acceptance — 2026-09-07

Levi answered **“Accepted”** to the preceding recommendation: carry existing authorization forward; authenticate infrequently through a protected human session; request each actual decision once; make restriction easy; provide an alternative intervention route; tighten a particular boundary only when its failure evidence warrants it. The reviewed local state was commit `69361b9` in Codex task `01a07901-1834-7fc2-9575-07013b67ebba`.

That interaction direction is accepted and is no longer a pending preference question. Technical allocations and untested implementation details below remain candidates. This decision preserves accepted H/remit/P0 and M2. It does not supply an exact credential, domain, broader maintenance grant, frozen fixture or implementation release.

## Concrete BUILD 6 allocation — candidate under the accepted direction

| Operation | Proposed human proof and interaction | Effect boundary |
|---|---|---|
| Establish human session | Passkey authentication against an already bound credential | Authentication creates no policy acceptance or execution grant |
| Inspect scope, policy, decisions and recovery outcome | Existing qualified human session; no new ceremony | Scope-qualified read; recovery does not replay an effect |
| Accept or decline exact P1 | One explicit decision through that session, bound to displayed exact subjects and predecessor | Record the human input and session basis; check current P0/H/remit and commit before execution |
| Withdraw own unconsumed P1 decision | Same session, direct withdrawal action; no additional confirmation or biometric prompt | Serialize against execution under the scope lock |
| Execute or recover an already committed grant | Qualified executor, exact grant and request identity | No additional human interaction; enforce current eligibility and return exact prior success |
| Initial enrollment/genesis | Protected external-root binding plus one exact initialization acceptance | Registration cannot authorize itself; M2 still completes atomically |
| Expired/revoked session or changed credential eligibility | Establish an eligible session before a new human decision | Do not silently refresh an invalid session or extend a grant |
| Broad pause, slowdown, resume, credential maintenance | Accepted interaction requirement; dedicated applicable authority/implementation remains to be resolved | Do not misrepresent P0's own-decision withdrawal as a global stop service |

**Selection rationale:** accepted P0 requires an exact prior human decision, not a fresh public-key signature over every P1. Recommend qualifying the protected-session route for ordinary P1 acceptance first. Preserve per-decision WebAuthn proof as an available stronger mechanism when the identified failure requires it; do not make it an automatic second confirmation after an already qualified human decision. The cost is explicit: session-attributed decisions rely on the session/controller boundary and do not carry a fresh authenticator assertion over their contents. A demonstration that this boundary permits agent impersonation would reject the allocation or require stronger proof at the affected entry.

The human boundary must capture the actual decision directly. The operating model may prepare the candidate but cannot possess the human session, submit a trusted human-input record on its own, or change the displayed subject behind an existing acceptance. Session identity and authorization are rechecked server-side for every human request. Duration, inactivity expiry and credential-change handling must be explicit configuration before freeze; no arbitrary timeouts are adopted as doctrine here.

**Withdrawal race:** if withdrawal commits first, execution rejects the grant. If execution commits first, withdrawal reports the already completed transition; it cannot undo it. If the competing execution rolls back, withdrawal can commit after acquiring the scope lock. If acknowledgement is lost, show outcome unknown until the same authoritative recovery path resolves it. A successful withdrawal response must mean the restriction committed, not merely that a UI event was queued. Closing a browser, losing a session or disabling a worker does not itself withdraw a durable grant.

This gives BUILD 6 a concrete restriction using its already accepted remit. The whole-system slow/pause behavior remains an accepted requirement to descend through the capabilities it actually controls. A separate minimal control client should be able to call the same withdrawal/recovery service without the main dashboard; it shares that service's outage limits and is not claimed as full infrastructure redundancy.

Qualification delta: test an exact P1 decision through an eligible session and reject the same call from an operating-agent credential; reject substituted subject/predecessor and expired/revoked session; verify that execution/recovery needs no renewed login; exercise all withdrawal race outcomes; verify alternate-client withdrawal without the main dashboard. These are proposed acceptance observations, not executed tests. Next technical work is the protected-session ingress/custody and durable record mapping for this allocation, followed by enrollment prerequisites and the existing fixture/Move route.

## Latest correction — fluid operation with effective intervention

Levi prioritizes the lowest practical friction, continuity across device loss, and an ability to slow or stop work. He reports that the earlier human-artifact approval button became security theater and a serious friction vector. Preserve that as operator experience, not a newly executed audit of the old implementation.

**This corrects the ceremony-first recommendation below.** Direct WebAuthn remains a candidate authentication/proof mechanism. A fresh passkey assertion for every consequential operation is not the default collaboration contract. Separate authentication, human decision, authorization lifetime, and execution: their frequency need not match. The earlier exact-assertion proposal remains useful for specifically selected decisions; it must not become a global artifact-approval requirement.

Recommend the following interaction contract:

| Situation | Human interaction | Enforced behavior |
|---|---|---|
| Work already covered by a current authorization | None required merely to keep working or produce an artifact | Continue within its operation, resource, consequence and validity limits; preserve inspectable results |
| A decision reserved to Levi | Present the actual choice once, in the active human interaction | Bind its exact subjects and authority basis; do not ask again through a second ceremonial button |
| Human identity needs establishing or refreshing | Passkey when the declared authentication conditions require it | Establish a protected human session; keep its credentials out of the operating agent |
| A boundary specifically requires fresh exact-decision proof | One readable decision and one passkey ceremony | Record a fresh assertion; do not describe ordinary session evidence as this stronger proof |
| Levi narrows scope, slows or pauses | Immediate control through an already authenticated human surface | Persist the restriction and check it at effect admission; no fresh biometric ceremony solely to request less activity |
| Resume or expand activity | Show the resulting scope and outstanding conditions | Revalidate authority and state; resume does not resurrect expired or withdrawn grants |

A protected human session can reduce repeated authentication without importing Supabase Auth or allowing the agent to impersonate Levi. It does introduce a session-verifier trust boundary; it cannot claim that every decision has a fresh authenticator signature. NIST likewise favors session continuity over continual credential presentation because repeated prompts can provoke insecure workarounds. Its guidance is evidence, not an automatically adopted ECB assurance level or timeout policy. [NIST session management](https://pages.nist.gov/800-63-4/sp800-63b/session/)

For BUILD 6, recommend evaluating fresh proof for the rare genesis/policy-succession decisions while using session continuity for inspection and the already accepted own-pending-decision withdrawal. This is a candidate allocation, not a new requirement that Levi continuously authenticate. Exact prior human acceptance remains required by accepted P0; neither that requirement nor its non-delegation meaning is removed. Ordinary work does not become policy succession because it has consequences. Broader bounded work authorizations and execution controls belong to their applicable capabilities; this inquiry does not install BUILD 8 early.

A conversational decision can replace an extra approval button only where the human input is obtained through a qualified, attributable path and bound to the exact displayed subject. Agent-generated summaries, `approved=true`, or silence cannot manufacture consent. If the active interaction already supplies that evidence, adding another button must demonstrate a missing protection rather than repeat the decision.

**Intervention must actually constrain effects.** Proposed slow mode reduces concurrency/rate or requires a checkpoint before the next defined effect class. Pause stops admission of new covered effects and requests cancellation of cancellable work. An in-flight operation can have passed its commit/dispatch boundary: report it as pending or completed, never claim it was recalled. Show pause requested versus enforced, the covered workers/resources and unresolved effects. Restart must preserve restrictions. A disconnected worker cannot truthfully acknowledge a remote stop; either its existing authority requires a live check or its predeclared offline limits bound further effects. Immediate global stop and unlimited disconnected execution cannot both be promised.

Provide a restriction-only control path that does not depend on the main dashboard or the operating agent. It still needs a protected, scoped capability so arbitrary callers cannot halt the system. The identity/authority required to resume or widen scope is separate. Concrete transport, cancellation coverage and maximum unobserved continuation remain to be Shaped; no stop service is installed here.

**Resilience has several dependencies.** Multiple enrolled credentials address authenticator loss. An alternate human control surface addresses dashboard failure. Durable grants, decisions and restrictions address conversational or worker restart. Verifier, database and domain outages require their own availability/recovery disposition. Two devices alone do not establish an absence of single points of failure. Avoid adding redundant infrastructure without an identified outage that would prevent required operation or intervention.

Qualification must include a normal episode completing within existing authorization without redundant prompts, one real boundary causing one intelligible decision, prompt cancellation leaving no new grant, a pause racing an effect with an honest outcome, restriction persistence after restart, and an alternative control route when the main door fails. Count repeated approvals and authentication interruptions alongside prevented unauthorized effects. A safeguard earns its place by distinguishing the intended valid and invalid cases; a button count is not evidence of protection.

The recommendation would change if a demonstrated session-compromise path requires fresh proof for a particular effect, or if measured stop latency exceeds the tolerated consequence before intervention. Tighten that boundary and test it rather than imposing the ceremony everywhere. No new user question is necessary now. The earlier domain question is banked until the human interaction and verification boundary justify enrollment.

## Earlier exact-assertion candidate — read under the latest correction

Levi prefers an extensible set of public-key credentials representing the already accepted H, with a fresh assertion for an exact decision, instead of making a Supabase Auth account the governance identity. This changes the preferred authentication mechanism. It does not change H=Levi, the accepted remit, exact P0, M2, or the requirement for a prior committed decision before its effect.

Recommend direct WebAuthn for the bounded BUILD 6 human decision boundary. Supabase remains the designated database; its Auth service is not required by this candidate. The previous Auth/session design is retained as a superseded alternative. No invitation was submitted by this agent. A fresh exact-email Auth lookup on this date again returned zero rows. No credential has been enrolled, and no governance state has been installed.

The alignment criterion is useful, recoverable human control with an ordinary interaction of reviewing the decision and confirming with a passkey. The present output is the revised mechanism and its discriminators, not a new implementation plan or Move release. Actual domain, credential binding and executable qualification remain unresolved.

## What the protocol establishes, and what ECB must add

WebAuthn signs authenticator data together with a hash of client data, which includes the challenge and origin. Verification checks the expected challenge, origin, RP ID, credential and signature; user verification must be requested and checked. It can use a PIN or biometrics; it does not identify the biological person to ECB or promise Face ID specifically. The standard also identifies code-injection and registration-substitution risks. [W3C WebAuthn](https://www.w3.org/TR/webauthn-3/#sctn-verifying-assertion)

Consequently, the bounded claim is: an enrolled credential produced a valid assertion for this exact decision commitment, with the required verification flags. Attribution to Levi additionally depends on the accepted enrollment basis and credential custody. That is stronger evidence than an arbitrary request inside a reusable session, but it is not proof of informed human understanding.

The approval view is part of the trusted explanation path. A hostile script at the legitimate origin can show decision A while requesting a ceremony for B. Ordinary passkey UI does not independently display and validate ECB's policy diff. Our candidate therefore uses a small, controlled approval origin, no agent-authored executable content, escaped candidate text, and the same immutable decision source for display and verification. These controls reduce substitution risk; they do not establish immunity to a compromised browser, approval deployment or verifier.

Apple's passkeys synchronize through end-to-end encrypted iCloud Keychain. Apple cannot read those keys. Recovery has prerequisites and is not an unconditional availability guarantee. A synchronized credential across two devices remains one credential and one ecosystem dependency. A separately enrolled security key can provide independent redundancy. [Apple passkeys](https://developer.apple.com/passkeys/), [Apple recovery/security](https://support.apple.com/en-us/102195)

Supabase currently documents experimental passkeys requiring a confirmed, non-anonymous Auth user. Its built-in route therefore retains account enrollment. This supports considering direct WebAuthn; the claimed May launch date is unnecessary to this decision and was not verified. [Supabase passkeys](https://supabase.com/docs/guides/auth/passkeys)

## Proposed bounded ceremony

1. Retain the exact decision input: versioned format, governance scope, operation, target bytes/digests, expected predecessor, authority/remit binding, executor limits, explanation when required, and validity conditions. Genesis also identifies the accepted external basis, exact H/remit/P0 and exact initial credential set. This is a proposal until verified acceptance is committed.
2. Create a durable, expiring ceremony record for that exact input. Proposed challenge encoding: a fresh 32-byte random nonce followed by the SHA-256 commitment to a domain-separated, unambiguously encoded decision input. The precise format must be frozen before implementation. Never use only a predictable policy digest. Record both nonce and decision bytes so a later reviewer can recompute the commitment.
3. Display the operation, scope, consequence, predecessor and exact subject handle from that record. Confirmation starts the passkey ceremony. A link, push notification, open browser session or UI Boolean cannot count as approval.
4. The isolated verifier validates the assertion and retrieves its credential binding. A server-owned transaction locks the scope and ceremony, rechecks current predecessor, credential eligibility, expiry and applicable policy, consumes the ceremony and commits the immutable decision and proof together. A request cannot supply a trusted `verified=true` value.
5. Execution is a separate, later transaction using the committed decision. It retains the existing scope lock, exact-subject checks, withdrawal handling, atomic transition/current-pointer update and M2 exhaustion. A signature does not make a stale or otherwise unauthorized effect legitimate.

This challenge construction is our candidate, not a standard ECB format or a claim of formal proof. A maintained verification library is preferable to handwritten protocol/crypto code. SimpleWebAuthn documents server verification and custom challenges; runtime support, exact version and implementation must be inspected and qualified before adoption. [Server API](https://simplewebauthn.dev/docs/packages/server), [custom challenges](https://simplewebauthn.dev/docs/13.3.x/advanced/server/custom-challenges)

At assertion acceptance, do not trust the credential's name or caller-supplied H. Resolve its already accepted binding. Use separate registration and approval purposes; a registration result cannot serve as a succession decision. Preserve original assertion bytes, credential public key/algorithm, binding revision, decision commitment, challenge, verifier version and findings for later checking. Do not retain private keys or biometrics.

Ceremony expiry controls admission of a new decision; it does not silently expire an already committed grant. Any grant expiry must be explicit in the accepted decision. An exact retry returns the committed decision before testing new-admission expiry, without consuming another ceremony or creating another decision. Changed input under the same request identity conflicts. An unknown outcome requires reconciliation. Credential counters are supplementary signals, not the sole replay control; qualify synchronized credentials without assuming every assertion advances a reliable global counter.

## Bootstrap and credentials without authority collapse

Maintain a stable H subject and separate credential records. Each enrolled credential carries its public key, RP ID, opaque credential ID, algorithm, binding basis, lifecycle evidence and inspection identity. User handles are local opaque identifiers, not email or authority. Multiple credentials can map to the same H without creating multiple human authorities.

Preparing a registration ceremony and proving possession of a candidate key do not authorize that key to represent Levi. The external root must commission and bind the exact enrollment through a protected human setup route before genesis. A fresh proof by that same candidate key cannot supply the missing external basis. Choosing the first browser to arrive, accepting an agent-uploaded key, or exposing a bootstrap bearer secret to the agent would fail this boundary. The concrete protected setup/custody mechanism remains a required Shape discriminator.

Recommend preparing an Apple passkey and one independently controlled backup credential when available, then binding that exact set for the one initialization. Candidate enrollment remains non-operative until M2 atomically activates exact P0, designates H/remit with that set and exhausts bootstrap. Do not exhaust governance bootstrap merely because the first key was registered. Failed enrollment can leave an inert authenticator credential; it cannot create partial ordinary governance.

Credential addition, replacement and revocation alter which proofs may speak for H. They require an explicit maintenance authority and effect on pending grants. The accepted remit/P0 does not presently provide those operations. This design does not insert them into policy succession or silently reopen bootstrap. A multiple-credential representation is compatible with the bounded initial set; automatic future enrollment is not implied.

For a later maintenance proposal, recommend that revocation block fresh approvals and place unconsumed approvals from that credential under explicit revalidation, while preserving historical proof and completed effects. Whether a particular compromise invalidates earlier decisions needs its own evidence and authority. Total credential loss pauses new approvals; an exceptional recovery route must be separately authorized and preserve history, not reset exhausted M2. Designing that route is an aperture, not an installed power.

## Enforcement and persistence delta

| Obligation | Mode / proposed surface | Declared limit |
|---|---|---|
| Exact assertion and decision correspondence | STRUCTURAL / cryptographic verifier + stored commitment | Does not prove honest display or wise decision |
| Credential represents H | AUTHORITY / accepted exact enrollment binding | Possession and registration do not create the basis |
| Fresh eligible approval | STRUCTURAL + AUTHORITY / scope-and-ceremony transaction | Verifier service itself is trusted |
| Prior committed decision before effect | STRUCTURAL / existing proposed transaction boundary | Signature arrival alone is not commitment |
| Atomic M2 and succession | STRUCTURAL + AUTHORITY / transition function | Owner/platform custody remains an explicit limit |
| Human-readable consequence | SEMANTIC / controlled approval view and review | Native biometric sheet is not a trusted ECB diff viewer |

The prior four-family record proposal needs reconciliation: credential bindings and durable ceremonies/proofs now have independent responsibilities. Give persistent first-class inspected subjects Referent identities; do not decide a table count from vocabulary. The exact physical mapping remains open. Session issuer/subject fields and gateway-JWT tests are superseded for human approval, not blindly renamed to credential fields.

Recommend a narrow verifier service credential, unavailable to ordinary agents, with only the required decision-recording entry. Agents can submit candidates or execute independently authorized committed decisions, but cannot enroll H credentials, assert verification, obtain verifier credentials or write decision/credential tables. The database must not grant its human-decision entry to the shared MCP/service-role path. If the database relies on the verifier rather than re-verifying WebAuthn itself, a compromised verifier can bypass that trust boundary: retained signatures enable checking but do not prevent arbitrary privileged writes. Database owners, deployment custody and user-device compromise are likewise explicit limits. This is not an absolute guarantee against anything with technical power.

BUILD 6 needs only the human page required to enroll through the accepted root route, inspect its exact decisions and perform bounded approvals. It does not commission the general dashboard, shortcut, universal envelope or BUILD 7/8 capabilities. If this minimum surface cannot be qualified within the boundary, return that concrete conflict instead of labelling a broad UI build a dependency.

## Acceptance obligations proposed, not executed

All standing cross-cutting pressures remain APPLICABLE; the earlier transaction tests survive with a replaced human-authentication input.

| Pressure | Paired observation required |
|---|---|
| Duplicate/replay; retry/idempotency | One verified ceremony commits one decision; exact recovery returns it; reuse for another input fails |
| Concurrency | Competing acceptance/withdrawal/effect and ceremony-consumption races serialize; rollback allows only lawful continuation |
| Stale state/basis | Valid signature over a stale predecessor or changed binding does not admit the decision |
| Partial failure/rollback | No consumed ceremony without its committed decision; no partial operative genesis |
| Restart/reconstruction | Retained commitment, proof, binding and current chain recover the actual outcome after lost acknowledgement |
| Wrong identity/role | Enrolled credential succeeds; unbound key, caller H string, agent or forged verifier result fails |
| Wrong version | Changed format, operation, target digest, scope or nonce fails exact binding |
| Basis drift/revocation | Non-eligible credential cannot issue fresh approval; prior proof is retained; unsupported maintenance cannot execute |
| Checker bypass/false PASS | The same verifier rejects altered signature/challenge/origin/RP ID or missing required verification; direct DB/privilege routes are tested |
| Time/order ambiguity | Server expiry rejects late admission; exact committed recovery survives expiry; same-transaction decision/effect remains forbidden |
| Unauthorized mutation | Direct credential/decision writes and unauthorized enrollment fail for operating roles |

Add a display-substitution specimen: show A while requesting B. The system must not claim the signature alone detected that deception. Qualify the controlled presentation path separately. Probe legitimate synchronized and backup authenticators so strict checks do not falsely reject supported human use. Physical-device testing remains necessary; synthetic verifier tests cannot establish the iPhone experience.

## Evidence coverage and questions bank

The existing OB1 recon/pin remains the lineage basis. A targeted case-insensitive search for `webauthn|passkey|fido2|relying.party` in this repo's `docs/` and `server/`, `/Users/prodadmin/ecos`, and the pinned OB1 checkout at `/private/tmp/ecb-ob1-recon.k2jmoI/OB1` found no matches in the searched non-JSON, non-lockfile text. This is bounded discovery, not evidence that no other repository or dependency has a solution. No new OB1 full inventory was necessary for this mechanism comparison. Protocol/library documentation was inspected; no library source audit, installed-version selection or live passkey test was performed.

| Open discriminator | Recommendation / why | What would change it |
|---|---|---|
| Stable domain controlled by Levi | Dedicated approval hostname as RP ID, exact HTTPS-origin allowlist; isolates the trusted approval surface | Demonstrated requirement for shared credentials across independent ECOS origins |
| Initial credential availability | Apple passkey plus separately controlled backup, with each included in exact root binding | No backup available now: explicitly accept temporary recovery limits or enroll later through a separately authorized maintenance route |
| Protected root enrollment | Human-controlled setup path, exact key-set binding before genesis; no agent-held enrollment secret | Evidence that the proposed custody/transport cannot distinguish human enrollment from an agent key substitution |
| Proof verifier placement | Maintained library in a narrowly privileged isolated service | Runtime incompatibility or demonstrated bypass requiring another verification boundary |
| Maintenance and total-loss recovery | Separate bounded authority proposal; no hidden extension of accepted P0 | Explicit human authorization resolving its actors, operations, recovery basis and treatment of pending grants |

The earlier domain question is now banked; the latest friction/intervention correction above controls the next inquiry. No DNS, credential, account or deployment change follows from this document. The immediate recommendation would change if direct verification cannot be isolated from operating agents or if a supported managed service supplies the same exact-decision proof with less trusted code and no unwanted enrollment dependency.
