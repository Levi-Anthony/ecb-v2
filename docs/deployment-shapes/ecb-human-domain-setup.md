STATUS: DNS CONFIGURED AND VERCEL VERIFIED — TLS / SERVICE PENDING
DISPOSITION: DECISION_RECORD / EXECUTION EVIDENCE
DATE: 2026-09-07 America/Phoenix

# ECB human entrance — setup receipt

Levi answered **“Good. I agree. Go”** to the recommendation of `ecos.effortlessconnection.com` as the stable human entrance under his existing domain. This accepts that hostname/RP direction and authorizes the bounded setup. It does not designate an authenticator or activate governance. The [runtime proposal](../build-shape/008-build-6-runtime-boundary.md) supplies the intended isolated human-service boundary.

## Completed and verified

- Vercel CLI is 59.11.7, existing account `levi-anthony`, team `levi-anthonys-projects` (`team_wueYGTZ3nxHz1WhMg8UE9gSy`).
- Created project `ecb-human`, ID `prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`, Node 24, no deployment.
- Added `ecos.effortlessconnection.com` to this project without force/reassignment. Exact project-domain API confirms the project ID, `verified=true`, no redirect and no branch binding.
- Environment metadata API returned zero environment variables, with no pagination. No canonical database/owner/service-role/signing credential was added. This is a point-in-time project check, not proof against future administrator changes.
- Existing repository `.vercel/project.json` still identifies `ecb-v2`; it was not relinked. Existing MCP, parent website, email and nameservers were not modified by this agent.
- Public RDAP identifies NameCheap, Inc. as registrar. Public DNS and Vercel report external nameservers `dns1.registrar-servers.com` and `dns2.registrar-servers.com`.

## DNS completed — 2026-09-07

Vercel initially returned `invalid_configuration`, no current CNAME/A record and the following preferred record. After Levi confirmed sign-in, the agent inspected Namecheap Advanced DNS, found no conflicting `ecos` record, and saved this exact CNAME:

| Type | Host | Target | TTL |
|---|---|---|---|
| CNAME | `ecos` | `6a8818416e2c0b55.vercel-dns-017.com` | Provider automatic/default |

Reopening Advanced DNS confirmed the saved record persists, with Automatic TTL and the fully qualified target ending in a dot. Existing apex A `162.159.140.166`, `www` CNAME `sites.ludicrous.cloud.`, email-forwarding/SPF settings and nameservers remain unchanged.

Both authoritative nameservers and public resolvers `1.1.1.1` / `8.8.8.8` subsequently returned the exact CNAME. Vercel verification returned `status=ok`, `reason=configured_correctly`, `configuredBy=CNAME`, no issues, and project `ecb-human` verified. Checks completed by 18:47 UTC (11:47 America/Phoenix). Initial post-save NXDOMAIN responses were propagation delay; no duplicate record was added.

Normal certificate-verifying HTTPS requests failed during TLS negotiation (`SSL_ERROR_SYSCALL`), including the recheck at 18:47 UTC. An independent Python TLS client likewise received EOF before completing its handshake. No TLS success or specific cause is claimed. There is still no deployment or human service, and no passkey enrollment. DNS verification is not application readiness.

## Historical access handoff — resolved

Before this write, Namecheap's login page reported three failed attempts and warned of a 24-hour lockout after another failure. The agent opened the account-recovery link without submitting another login, recovery request, password change or email. Levi subsequently reported “it's logged in now”; the authenticated account and domain settings were then observed. Registrar access is no longer an outstanding user-input blocker.

## Resume

Address routing is complete. Continue the human-service technical qualification and protected enrollment prerequisites from the runtime proposal; repeat HTTPS verification when the certificate is ready. A provider error page is not a functioning human door. No repeated hostname approval or DNS write is needed. Further service implementation and exact credential/scope binding retain their applicable BUILD 6 boundaries.
