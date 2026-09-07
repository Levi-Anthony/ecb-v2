STATUS: VERCEL PROJECT AND DOMAIN ASSOCIATION CREATED — DNS / TLS / SERVICE PENDING
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

## Exact pending DNS operation

Vercel's domain verification returned `invalid_configuration`, no current CNAME/A record and the following preferred record:

| Type | Host | Target | TTL |
|---|---|---|---|
| CNAME | `ecos` | `6a8818416e2c0b55.vercel-dns-017.com` | Provider automatic/default |

Only add this host after inspecting the current Namecheap record set for conflicts. Do not change nameservers, apex records, mail records or purchase another domain. The trailing dot in Vercel's fully qualified target is equivalent DNS notation; use the registrar's accepted format.

Namecheap is not authenticated in the available browser. Its login page reports three failed attempts and warns one further failure will lock access for 24 hours. This agent did not submit another login. Opened the site's account-recovery link for Levi and left it as a handoff; no recovery request, password change or email dispatch was submitted by the agent. The user must regain account access before this DNS write can proceed.

`verified=true` on the project-domain association is **not** DNS/TLS or application readiness. No DNS record has been written, no TLS certificate has been verified, and no human web service is deployed. Do not report the address as working or invite passkey enrollment.

## Resume

After Levi completes account recovery/sign-in, resume the existing Namecheap tab, inspect the domain's Advanced DNS records, add the exact CNAME, and verify persistence in the registrar plus authoritative DNS/Vercel status. Check HTTPS only when a deployment/certificate exists; a provider error page is not a functioning human door. No repeated hostname approval is needed. Further service implementation and exact credential/scope binding retain their applicable BUILD 6 boundaries.
