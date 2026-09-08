STATUS: CONCRETE SHAPE PROPOSAL — NOT FROZEN, IMPLEMENTED OR DEPLOYED
DISPOSITION: PROJECTION / EVIDENCE
DATE: 2026-09-07 America/Phoenix

# BUILD 6 — Human session, records and installation boundary

**Later human release:** The [staged Move release](008-build-6-move-release.md#human-release--recovered-2026-09-07)
was explicitly authorized at 2026-09-07T19:09:03.887Z. Its construction and disposable
qualification ordering supersede the pending-release statements below. Live binding
and activation conditions remain. See `BUILD_CHECKOUT.md` for current execution.

**Release preparation:** The [staged Move package](008-build-6-move-release.md) now gathers the proposed output, qualification and actual enrollment/activation route. Its proposed qualification-order disposition is not yet accepted. The domain question at the end of this earlier proposal is resolved by the accepted setup receipt below.

This is the current technical continuation of the [accepted interaction direction](008-build-6-webauthn.md#human-acceptance--2026-09-07). It replaces the earlier open-ended runtime/record options with a concrete proposal. Accepted H/remit/P0 and M2 remain unchanged. It neither selects a new canonical store nor introduces general work envelopes.

**Later accepted setup:** [Domain execution receipt](../deployment-shapes/ecb-human-domain-setup.md) records acceptance, Vercel project/domain creation and completed Namecheap CNAME setup. Authoritative/public DNS and Vercel verification now pass. TLS, service and credential enrollment remain pending. The recommendation and earlier DNS/tooling observations below are historical; consult the receipt for current setup state.

## Domain recommendation and tooling update — 2026-09-07

Levi supplied `effortlessconnection.com` as a domain he owns and requested a recommendation with downstream consequences. Recommend `https://ecos.effortlessconnection.com` as the stable human entrance, with exact RP ID `ecos.effortlessconnection.com` and exact allowed HTTPS origin. This is a recommendation, not an accepted/enrolled binding. It supports the existing domain, a recognizable shortcut/dashboard address and host migration without changing the passkey identity, provided credential records and verification configuration are preserved. Different future dashboards can use this common authentication entrance rather than widening the passkey scope to every website under the parent domain.

Public DNS inspection returned NXDOMAIN for the proposed hostname; parent nameservers were `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. No registrar-account ownership or control was independently verified. Recommend adding only the provider-specified subdomain record when the isolated deployment is ready; preserve existing apex, email and nameservers. No DNS, domain association or deployment was changed. Continued ownership/renewal of the parent domain is a dependency. Changing the passkey RP identity later can require new enrollment; moving hosting while preserving it is a different operation. If Levi intends to sell/retire this domain or keep ECOS's identity separate from it, reconsider before enrollment.

Under explicit user authorization, `npm install --global vercel@latest` completed and `vercel --version` reported **59.11.7**, upgraded from 59.11.2. `vercel whoami` verified the existing signed-in account still works. The npm command reported upstream dependency deprecation warnings; no dependency-security assessment or runtime deployment qualification is claimed.

## Recommendation and newly observed constraints

Use a small human web service, with its page and session endpoints on one HTTPS origin, and a restricted connection to canonical Supabase Postgres. Keep the existing three-tool MCP runtime intact. Its agent credential can later reach only specifically granted candidate/read/executor entries, never human-session or decision-issuance entries.

Read-only inspection confirmed the linked Vercel project `ecb-v2` (`prj_oevToBKwqj7yHjyQCHs5zevegWCM`) uses Node 24 and has the existing `ecb-v2-brain` integration. It has provider hostnames, including `ecb-v2-eight.vercel.app`; no custom domains were listed in that Vercel team. This does not establish whether Levi owns domains elsewhere. Project API reports `live=false` and a READY preview; neither is a live human door.

Environment-name inspection showed owner-connection, service-role and JWT-signing configuration attached to Production, Preview and Development. Secret plaintext was not requested. Therefore **recommend a separate minimal human-service project with only a restricted database credential**, not deploying the human verifier into the existing integration environment. No second database, managed identity provider, AI service or billing upgrade is needed by this design. Actual platform entitlement/cost and connection compatibility still require verification before deployment. A separate project limits accidental credential inheritance; a shared platform administrator remains a trust dependency.

The default Supabase Edge endpoint is documented to rewrite HTML responses to plain text. It cannot be assumed to host the browser ceremony unchanged. A custom-domain route remains an alternative, but its additional configuration/entitlement is not selected. Existing MCP/BUILD 0 deployment is not migrated. [Supabase routing](https://supabase.com/docs/guides/functions/http-methods)

Vercel Marketplace category/discovery and existing-integration reads completed. No integration was installed: Supabase is already the designated real store, and Levi explicitly prefers direct WebAuthn rather than another account-enrollment dependency. CLI 59.11.2 reported 59.11.7 available; update before deployment tooling is qualified. No global tool upgrade occurred in this pass.

## Human ingress and credential custody

The service is the trusted verifier/session controller. Propose maintained SimpleWebAuthn server/browser packages, pinned at implementation to a compatible released version and dependency lock. Reviewed server source identifies version 14.0.1; this is evidence, not an installed dependency. Node 24 fits the documented Node 22+ requirement. [Library runtime support](https://simplewebauthn.dev/docs/packages/server)

Proposed HTTP responsibilities:

| Entry | Caller and action | Database responsibility |
|---|---|---|
| Authentication options / verification | Unauthenticated human browser; bound credential proves possession | Retain one-use random challenge; consume it and establish session atomically after verification |
| Scope / decision view | Valid human session | Return exact scope, current policy, pending decisions and outcomes |
| Decision accept / decline | Valid human session, explicit human input over one retained subject | Check H/remit, exact subject and current predecessor; append decision |
| Withdraw decision | Valid human session, own unconsumed decision | Serialize with execution; append withdrawal or return already-completed result |
| Logout | Valid human session | Invalidate that session; do not erase or implicitly withdraw grants |
| Registration options / verification | Separately commissioned pre-genesis enrollment | Retain candidate keys only; no self-designation or ordinary governance |

Use a server-generated opaque session secret in a Secure, HttpOnly, host-only cookie with Path=/ and SameSite=Lax; store only its hash in the database. Authentication rotates the secret. Do not put it in URLs, localStorage, MCP responses or model context. Protect mutations with an exact origin check and a session-bound CSRF token; GET cannot mutate governance. Return sensitive views with no-store caching. Use a top-level human page, no framing, and escaped candidate text. These are proposed applications of session controls, not evidence that HttpOnly defeats malicious same-origin scripts. [OWASP session controls](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

Propose an initial configurable session policy of 24 hours inactivity and seven days absolute lifetime, with a visible expiry and refresh only when human interaction actually requires it. These are tuning defaults, not an assurance standard or accepted governance law. Background polling does not count as human activity. An expired session never halts execution already covered by a valid committed grant. Measure interruptions and adjust through explicit configuration review; do not introduce prompts per artifact or effect.

Bind authentication options to a short-lived, HttpOnly pre-authentication cookie and stored ceremony so another browser cannot substitute a login response. Consuming a login challenge and establishing its session is atomic. If the response carrying the new cookie is lost, never return its secret to someone replaying the assertion: recover only through an already valid issued session, otherwise start a fresh login ceremony. The database stores a hash and cannot reconstruct the original secret. This exceptional recovery can require another passkey interaction; it does not require re-approving a committed governance decision. A retained public assertion must never become a reusable bearer credential.

All mutation transactions recheck session expiry/invalidation, credential eligibility and scope binding. Do not validate once in middleware and then trust a stale actor header. With the scope lock held, lock/check session state before appending a decision. Logout/invalidation must serialize on that session row: whichever operation commits first determines whether the concurrent request was admitted. Session checks and decision admission commit together.

**Operating-agent exclusion is a deployment property.** The operating agent must lack the human-service DB credential, owner/service-role/signing credentials, human cookies, and browser/OS automation capable of operating the authenticated human surface. Hiding a cookie from JavaScript does not stop an automation tool clicking Accept inside that session. Enforce this through the actual runtime's tool/credential permissions, not a prompt. A deployment with those capabilities available to the operating model fails this boundary. This build conversation currently has privileged installation tools; it is not a qualified example of the proposed restricted operating profile. Trusted human deployment/custody can still compromise the service and is an explicit limit.

## WebAuthn source-specific integration obligations

Read authentication and registration verification source at `MasterKale/SimpleWebAuthn` commit `8f6e7380c6bb6861a4c11758c39ad78574559823`. The authentication function verifies challenge/origin/RP data and signature but the application selects the credential record. Its cross-origin branch tolerates missing topOrigin. Counter rollback is rejected when either counter is nonzero. Registration can return `verified:false`. These behaviors require explicit application handling, not an assumption that calling a library completes ECB authorization. [Authentication source](https://github.com/MasterKale/SimpleWebAuthn/blob/8f6e7380c6bb6861a4c11758c39ad78574559823/packages/server/src/authentication/verifyAuthenticationResponse.ts), [registration source](https://github.com/MasterKale/SimpleWebAuthn/blob/8f6e7380c6bb6861a4c11758c39ad78574559823/packages/server/src/registration/verifyRegistrationResponse.ts)

ECB's adapter must reject crossOrigin ceremonies explicitly, require user verification without permissive advanced overrides, match returned credential ID and any userHandle to the selected bound record, and require verified=true before session issuance. It must preserve concurrent counter updates and distinguish a failed ceremony from an already committed retry. Qualify actual synced/backup devices; never reset a counter just to make a test pass. Public error codes must not echo raw verifier internals. No source-level finding here establishes the browser/platform experience or full library correctness.

Exact source SHA-256: authentication `0c04ea06f7d24d5216f283227785ed92db0ed862da2e5f7a708589f43793c95f`; registration `7dffa2751cc014809eae590b14eb8ed4c63809d5faed752958065a61d3c7ba4f`; server deno.json `2775892f3cad1889c13ea6e9624d3e24d983a363ede9df4c0961b73efdf4df4d`. Source was fetched at the pinned commit; helper implementations, transitive dependencies and published-package equivalence remain unqualified.

## Concrete native-record proposal

Use private `ecb_governance` tables, with Referent identity for each persistent first-class inspected record. No new universal Actor or standing vocabulary is required.

| Native record | Required contents | Integrity/lifetime |
|---|---|---|
| subjects | Exact policy/remit/root-basis/binding bytes, digest, kind, source lineage | Immutable; existing Referent seam; no authority from retention |
| scopes | Accepted binding subject and current transition | Pointer changes only through lawful transition |
| credentials | H referent, RP ID, opaque user handle/credential ID, algorithm/key, enrollment basis | Identity/key/basis immutable; counter/backup observations separated from authority; eligibility cannot be changed through generic update |
| ceremonies | Purpose, random challenge, expected identity/scope, expiry, verified proof and outcome reference | One-use consumption with result; no authority from registration alone |
| sessions | Secret hash, principal and credential references, authentication ceremony, created/last-active/absolute-expiry/invalidation fields | No plaintext secret; non-exported runtime access; invalidation cannot delete historical authentication evidence |
| decisions | Exact operation/subjects/predecessor, H and authority basis, human-input record, session/authentication evidence, request identity | Append-only; withdrawal targets original; prior committed decision needed before effect |
| transitions | Predecessor, consumed decision, exact result, ordered M2 obligations, executor/request identity | Append-only; one genesis/successor per scope/predecessor; pointer/history atomic |

Authentication-ceremony proof and the immutable session-establishment fields remain available after session expiry when a decision references them. Updating last-active does not rewrite that proof. No cascade deletion of evidence. An exact-decision WebAuthn proof is optional only where the selected route allows session attribution; evidence labels must distinguish them. Neither becomes a new database standing value.

Use four restricted role responsibilities: verifier login (authentication/session and human-decision functions only), executor login (candidate/read/exact execution functions only), NOLOGIN native owner (required native mutations), and external installation custodian. Grant no owner membership or raw table mutation to either login. Revoke PUBLIC/anon/authenticated/service_role privileges on the new private surface and constrain default privileges. Prefer direct scoped database connections over a caller-signed JWT or public human RPC. Function owners use fixed search paths and qualified references. Verify grants and role inheritance, not just RLS: a role's BYPASSRLS attribute does not itself grant table access. [Supabase roles](https://supabase.com/docs/guides/database/postgres/roles)

The verifier can technically mint session-attributed decisions; it is trusted, not cryptographically prevented from lying. Ordinary agents cannot reach that power. Independently checking retained evidence can expose some tampering but is not a substitute for privilege separation. Do not claim protection against arbitrary database-owner or deployment-administrator mutation.

## Enrollment, interruption and recovery

Propose one human-operated installation route that opens an expiring enrollment window tied to the exact external basis, scope and expected initial credential count. The enrollment capability is generated/delivered outside the operating agent's custody. Enrollment produces inert keys; the human binds the exact returned key set through that protected route. Installer tooling must not treat an unauthenticated first visitor or agent-submitted key as Levi. A digest receipt makes the chosen set inspectable; it does not independently prove ownership.

After exact credential/scope binding, the already accepted P0/H/remit are incorporated without asking again for their normative acceptance. The prior external grant licenses one M2 transaction; key registration does not consume it early. On interrupted setup, inspect the enrolled candidates and actual genesis outcome before continuing. A created passkey without accepted binding remains inert. Initial backup credentials may be included in that same exact binding, so one lost authenticator need not require a new authority grant.

Two clients of the human service provide a dashboard-independent withdrawal path, but share service/database availability. An outage prevents new approvals and transitions that require canonical access; read-only inquiry can continue using labelled cached evidence. Loss of every enrolled credential does not create recovery authority. Credential maintenance and exceptional total-loss recovery need a separately specified basis before being offered as working features.

For withdrawal versus execution, retain the existing scope serialization and prior-success recovery rules. No external side effect is part of BUILD 6, so canonical commit can discriminate the race without inventing a universal cancellation service. General slowdown/pause is an accepted whole-system requirement; it is not falsely represented by this narrower withdrawal.

## Concrete implementation package to commission after Shape closure

The bounded package would contain: one private-schema migration with roles/functions; one human service with registration/authentication/session/decision/withdrawal/recovery routes and a minimal same-origin page; an executor adapter with exact operation descriptions; and PG17 plus HTTP/WebAuthn qualification against the accepted predecessor. No changes to accepted kernel tool semantics, historical Build 5 proofs or P0 bytes. No managed Auth user, email setup or extra database.

Qualification must pair valid requests with forged identities, swapped keys/subjects, missing UV, cross-origin assertions, expired/revoked sessions, CSRF attempts, stale predecessors and bypass calls. Exercise actual concurrency, rollback, dropped acknowledgements and restart; verify ordinary execution needs no new human prompt. Test alternate-client withdrawal and the actual restricted operating-agent capability inventory. Device tests establish the iPhone/Mac interaction separately from synthetic verifier checks. Node/package compatibility and DB pool/role behavior remain runtime checks, not claimed from documentation.

The package is concrete enough to review, but deployment identity, protected enrollment custody, exact credential/scope binding and qualification are not supplied by this document. No runnable fixture or migration was created. Next human discriminator: use an already owned durable hostname, or accept a provider hostname and its migration/re-enrollment limitation. Recommend a dedicated hostname under a domain Levi already owns if available; otherwise a stable provider hostname avoids an unnecessary purchase. No need to choose DNS details or buy infrastructure before that answer.
