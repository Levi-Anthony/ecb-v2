# ECO-218 — shared ordinary-client OAuth installation

5 October 2026 UTC / 4 October America/Phoenix. ECO-208's completed client→ECB Shape is accepted by the Principal's “If so, yes. Fully authorized.” ECO-218 carries the ordinary-client implementation Move. Its explicit consumer-extensibility steering governs this installation. Code is carried directly on designated `main` and the enduring Production host, under the current Greenfield disposition.

## Consumer extension contract

All consumers use `https://ecb-v2-eight.vercel.app/api/mcp`. The protected resource discovers one authorization server, Supabase Auth at `https://vezxivrvhakclxuvxzso.supabase.co/auth/v1`. Supabase owns registration, authorization codes, S256 Proof Key for Code Exchange (PKCE), signing, refresh tokens and native consent. ECB implements its login/consent interface and the provider's documented access-token hook. It does not issue or proxy OAuth tokens.

The extension point is `ecb_oauth.consumer_policies`: a reviewed consumer name, anchored callback URI pattern, capability ceiling, enabled flag and source. The provider supplies the actual registered client identity and exact authorization callback. Exactly one enabled policy must match that callback. No match or multiple matches denies consent. Client-supplied names and editable user metadata confer no authority.

| Consumer | Initial callback policy | Qualification standing |
| --- | --- | --- |
| Claude | `https://claude.ai/api/mcp/auth_callback` | Policy and deterministic controls tested; real app/mobile flow pending |
| ChatGPT | `https://chatgpt.com/connector_platform_oauth_redirect` or `https://chatgpt.com/connector/oauth/{callback_id}` | Both documented callback forms supported; real flow pending |
| Additional consumer | Provider registration plus a reviewed callback pattern and ceiling | A deliberately invented third-consumer fixture passed after adding only its policy |

To add a standards-conformant consumer, verify its current official authentication contract, install its callback/capability policy, register through the provider's supported Dynamic Client Registration (DCR) or manual registration, then qualify its real connection against this resource. Copy the exact production callback presented by the consumer; do not guess a ChatGPT callback ID. Existing Claude and ChatGPT policy families cover new native registrations for those callbacks. There is no per-consumer endpoint, shared external secret or tool rewrite.

This proves a configuration extension boundary, not universal compatibility with every present or future client. Provider changes and new registration mechanisms require qualification at the provider adapter. Supabase is the accepted first candidate; its real resource-indicator, token exchange and lifecycle interoperability remain unqualified while its OAuth server is disabled.

## Authority and custody

An account must authenticate through Supabase and have a confirmed email, then be explicitly enrolled by its verified `auth.users.id` in private `ecb_oauth.principals`. Signup, an email address alone, client names and `user_metadata` never enroll a principal. The installed database has no real Auth users, enrolled principals, clients or grants at the setup checkpoint. The Principal must sign in before their actual subject can be enrolled; never infer that subject from a repository author email.

Each application grant records subject, native client ID, exact resource, consumer policy, grant version and independently selected Recover / Preserve / Transition capabilities. Reconsent creates a new grant version. Tokens must carry the exact single resource audience, trusted issuer, signature, expiry, stable subject/client/session/grant IDs and signed capabilities. Every MCP request also checks the live grant, current consumer ceiling, enabled principal, confirmed and unbanned account, native client, session and native consent. Revocation therefore applies to previously issued access tokens on the next request. Revoking one client does not revoke another client's grants. If provider revocation fails, the account page retains a “Finish disconnecting” action across reloads while ECB access stays revoked; it removes the row once native consent is revoked.

Supabase's native `email` scope selects identity disclosure. ECB capabilities are separately displayed in consent, signed through the documented hook and checked before tool validation/dispatch. Do not advertise unsupported `ecb:*` provider scopes or claim native step-up support. To expand a connection's application permissions, revoke it at the account page and reconnect to review a new consent.

Login credentials remain in secure HttpOnly cookies; the interface clears email-link token fragments before calling its server session endpoint. Callback destinations come from the verified native request and reviewed policy. POST Origin, bounded JSON bodies, a nonce Content Security Policy, no-store responses and safe text rendering guard the consent surface. Logs contain decisions and identifiers, never token values or raw provider exceptions.

Client OAuth is independent of the existing server→BRAIN narrow runtime key. Public invoker RPCs route to checked private functions; ordinary callers cannot read or write grant tables or invoke the access-token hook. Existing header bearer compatibility is retained until every remaining compatibility consumer is accounted for and real OAuth capture/recovery plus lifecycle qualification earns retirement. Runtime-principal migration remains ECO-208's separate Move B. Circulation remains dormant; this work does not renew ECO-214's expired first-use envelope.

## Installed database and code

Supabase project: `ecb-v2-brain` / `vezxivrvhakclxuvxzso`. The application schema migration is recorded remotely as `20261005044228_eco218_ordinary_oauth`; the CLI-generated source is `sql/migrations/20261005041608_eco218_ordinary_oauth.sql`. The disconnect-recovery repair is remotely `20261005045144_eco218_disconnect_recovery`, sourced from `sql/migrations/20261005045055_eco218_disconnect_recovery.sql`. The provider tool assigns the remote migration timestamps; the source/remote pairs identify the same SQL, not duplicate migrations to apply.

The source includes protected-resource metadata, a fixed-issuer JSON Web Key Set verifier, native live-grant checks, generic consent/login/revocation, registered consumer policies and a native token hook. `api/_runtime.ts` incorporates PR #105's valid helper-discovery correction, excluding the shared helper from Vercel function discovery. No URL credential route is installed. The nonsecret Production flag `ECB_MCP_OAUTH_ENABLED=true` is configured for this deployment.

## Qualification evidence

All three TypeScript checks passed. OAuth tests: **7/7**. Existing MCP tests: **11/11**. Existing circulation tests: **29/29**. Native database fixtures passed against the installed schema in one rollback transaction: enrollment, resource/PKCE, capability limits, per-client revocation independence, hook audience/refresh claim construction, bans, disabled principals, native consent revocation, expired sessions and application revocation. No fixture user, client, grant or runtime verifier persisted. Claude and ChatGPT are the only committed policies.

The connected database role cannot impersonate `supabase_auth_admin`; that role's required schema/function/table privileges were checked directly. Actual provider invocation and its token lifecycle still require the enabled real flow. Security-advisor comparison introduced no new findings; existing private-table/no-policy informational findings and existing narrow-key-gated definer RPC warnings are unchanged. Neither fixture JWTs nor successful compilation certify Supabase's RFC 8707 resource handling or a real app connection.

The direct-main workflow `.github/workflows/eco-218-oauth.yml` repeats the code checks on relevant pushes. Deployment and actual public-route observations are recorded on [ECO-218](https://linear.app/ecos-ops/issue/ECO-218/connect-ecb-v2-to-claude-through-enduring-ordinary-mcp-authorization), which stays open until the real consumer and lifecycle obligations are satisfied.

## Exact human setup and reentry

The connected Supabase tools expose database operations, not Auth server configuration. Complete the following in the [designated project's dashboard](https://supabase.com/dashboard/project/vezxivrvhakclxuvxzso), without copying secrets into chat:

| Location | Setting |
| --- | --- |
| Authentication → URL Configuration | Site URL `https://ecb-v2-eight.vercel.app`; allow email redirects to `https://ecb-v2-eight.vercel.app/oauth/consent**` |
| Authentication → OAuth Server | Enable OAuth server; Authorization Path `/oauth/consent`; enable Dynamic Client Registration |
| Authentication → Hooks | Custom Access Token hook: SQL function `ecb_oauth.access_token_hook` (`pg-functions://postgres/ecb_oauth/access_token_hook`) |

ES256 public signing keys are already present; do not rotate a key merely to clear an unknown. After configuration, the worker verifies issuer discovery, PKCE and registration metadata. The Principal opens `https://ecb-v2-eight.vercel.app/oauth/consent`, signs in through their own email verification, and returns when the page says enrollment is pending. The worker then recovers and enrolls the actual verified subject under the existing authorization.

Next add the shared MCP URL in each desired app. Claude is the first lived qualification: real authorization-code exchange, one neutral capture using a preserved operation ID, recovery/search from the phone, then expiry/refresh, grant revocation and reconnect evidence. ChatGPT and every additional consumer receive their own recorded real qualification. Observe only token metadata needed for these checks, never token values. A demonstrated provider mismatch routes back to provider selection under ECO-208 rather than producing a bespoke auth wrapper. No further generic implementation authorization is needed for this bounded work.
