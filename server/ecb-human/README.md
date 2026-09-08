# ecb-human — BUILD 6 protected human service

Status: construction artifact under the released BUILD 6 Move. It is not deployed, enrolled, or qualified by existing in the repository.

This service is the isolated same-origin verifier/session controller for the accepted WebAuthn boundary:

- RP ID: `ecos.effortlessconnection.com`
- origin: `https://ecos.effortlessconnection.com`
- database login: **only** `ecb_governance_verifier`
- browser session: opaque `Secure; HttpOnly; SameSite=Lax; Path=/` host-only cookie; only a SHA-256 digest reaches the database
- CSRF: separate session-bound token plus exact `Origin` check
- registration credentials are inert until the protected setup capability binds the exact credential set
- no service-role, database-owner, JWT-signing, installer, or executor credential belongs in this deployment
- no operating-agent browser access is part of the qualified runtime profile

## Environment

Required:

- `ECB_DATABASE_URL` — restricted PostgreSQL connection whose effective login is `ecb_governance_verifier`

Optional assertions (if present they must equal the accepted constants):

- `ECB_RP_ID=ecos.effortlessconnection.com`
- `ECB_ORIGIN=https://ecos.effortlessconnection.com`

`CBOR_NATIVE_ACCELERATION_DISABLED=true` is set before SimpleWebAuthn is dynamically imported, matching its Vercel/ncc guidance.

## Routes

Setup capability is entered in a POST body and moved into a short-lived HttpOnly cookie. It is never accepted in a URL.

- `POST /api/setup/open`
- `GET /api/setup/status`
- `POST /api/setup/register/options`
- `POST /api/setup/register/verify`
- `POST /api/setup/bind`
- `POST /api/auth/options`
- `POST /api/auth/verify`
- `GET /api/state`
- `POST /api/policies`
- `POST /api/decision`
- `POST /api/withdraw`
- `POST /api/logout`
- `GET /api/recover`
- `GET /api/health`

The UI is intentionally minimal. BUILD 6 qualifies the authority/session behavior, not a final dashboard.

## Boundaries

Synthetic WebAuthn tests do not establish real iPhone/Mac behavior. A successful build does not establish deployment custody. A registered passkey does not establish H until the exact protected setup binding is completed. A session establishes human attribution for a new decision; it does not itself install a policy or authorize an effect. Ordinary execution consumes a prior committed decision through the separate executor role.
