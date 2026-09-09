STATUS: RUNTIME REPAIR TESTED AND DEPLOYED — PRIVATE INSTALLER AUTHENTICATION REQUIRED
DISPOSITION: EXECUTION_CHECKPOINT; NOT AN M1 COMPLETION RECEIPT
DATE: 2026-09-09

# BUILD 6 runtime repair and live custody checkpoint

## Subsequent installer diagnosis and retry repair

The human has now run the read-only installer check and reported
INSTALLER_AUTH=PASS and READ_ONLY_CHECK=PASS. That run changed no verifier password,
deployment, setup or governance state. This establishes valid installer access at
the time of the check; do not instruct the human to replace the PAT merely because
the separate verifier login fails.

Inspection found that the original helper generated a new verifier password on
each full run and discarded it after a downstream failure. The repaired helper
retains a generated verifier password (never the installer URI/PAT) in a private
0600 record within the 0700 setup directory. A successful application is reused
without rotation; an unknown application outcome can reapply only the same bytes.
Malformed, wrong-target or insecure recovery records fail closed. A verifier
authentication failure closes its connection and allows one retry after a two-minute
quiet interval, with no password regeneration. Persistent rejection reports
VERIFIER_AUTH=FAILED separately from installer authentication. Cache/lockout is a
possible contributor, not a confirmed diagnosis of the original failure.

All 13 affected preflight/custody tests pass under Node 24.20.0. The helper and its
custody module are explicitly excluded from Vercel uploads. A full live run with
the human's valid private URI remains required to restore fresh hosted connections
and reach OPEN. No live success or M1 completion is claimed by these tests.

Scope remains exact live M1 human binding. No canonical M2 preparation or execution
was performed. No setup capability or live human credential was created by this
repair. The helper remains the only live-binding path.

## Source and exact target

- Starting source: `cc1d890ab4b1c68c98ada4c6f40fa22e0bbaf898`.
- Branch: `reconcile/build-6-tested-move`.
- TLS repair: `036ed2e35116de89f7eefb8695fd58ed922b1f8e`.
- Entrance packaging repair: `0ef4ca2e988d8e2e3f0606efe838665deb3fc9ca`.
- Secret-free initialization categories: `3a0b86828c193c24c99fcd70acb302d600e9ed52`.
- Latest runtime deployment: `dpl_GRSb8F3JKYMJx5aBjs1uQbnW9Kda`, production READY.
- Vercel project: `ecb-human`, `prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4`.
- Vercel team: `team_wueYGTZ3nxHz1WhMg8UE9gSy`.
- Canonical project: `vezxivrvhakclxuvxzso`.
- Origin/RP: `https://ecos.effortlessconnection.com` / `ecos.effortlessconnection.com`.

## Findings and changes

Under Node 24.20.0 without NODE_EXTRA_CA_CERTS, the canonical transaction pooler
TLS handshake failed with SELF_SIGNED_CERT_IN_CHAIN. Supplying the user's public
Supabase Root 2021 CA made the handshake authorized. A deliberately wrong hostname
still failed with ERR_TLS_CERT_ALTNAME_INVALID. These probes sent no database
password or PostgreSQL startup/authentication packet.

The production runtime now explicitly loads the retained CA into its PostgreSQL
TLS options, with rejectUnauthorized=true and default hostname verification.
Vercel explicitly includes the certificate. No global TLS verification or trust
setting was weakened. Certificate SHA-256 fingerprint:
`80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`.

Deployment `dpl_3fj4ma8Azw56fhSFbzg7tzM8R2Yu` returned production /health HTTP 200
at 2026-09-09T10:26:29Z with exact identity:
`{"service":"ecb-human","governance_activation":"not_implied_by_service_health"}`.
The next entrance check exposed a separate packaging defect: .vercelignore
excluded public/index.html entirely. The unchanged HTML now lives in views/index.html
and is included only in the function, preserving verifier-gated serving. A local
standalone Vercel build retained byte-identical HTML in the function and no static
index.html. Hosted HTML success is still unverified because of the current
authentication failure below.

## Validation

- Full BUILD 6 Node 24.20.0 suite after TLS and entrance fixes: 41/41 passing,
  including existing isolated PG17 synthetic tests and new TLS/entrance controls.
- After adding fixed diagnostic categories: all six affected TLS/entrance tests passed.
- Runtime inventory: HUMAN_DATABASE_URL only as a configured production variable;
  no extra CA environment variable or forbidden installer/executor/owner keys.
- Accepted migration and P0 hashes remain unchanged:
  `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461` and
  `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`.

## Current custody boundary and remaining work

The helper was launched in a separate Terminal window and subsequently stopped
with a password-authentication error. Whether the human entered an installer URI
during that run has not yet been confirmed. Do not infer a successful installer
login or verifier rotation from that observation.

The newest deployment's /health currently returns HTTP 503. Its fixed diagnostic
category at 2026-09-09T10:34:00Z is database_authentication_failed (PostgreSQL 28P01),
not database_tls_failed. Existing warm connections in the earlier TLS deployment
still answered health, which is insufficient proof that fresh verifier logins work.
The exact cause of the credential mismatch is not yet established. Do not claim
that readiness or M1 is currently complete.

Independent canonical read after these events found scopes=0, credentials=0,
sessions=0, decisions=0, transitions=0. Owner and executor remain NOLOGIN;
verifier has no superuser, bypass-RLS, role-creation or database-creation privilege
and has no password-expiration timestamp. No governance activation occurred.

Resume the helper from `/private/tmp/ecb-build6-live-bind` under Node 24 with
`NODE_EXTRA_CA_CERTS=/Users/prodadmin/Downloads/prod-ca-2021.crt`. The human must
privately supply a valid canonical installer Session-pooler URI/PAT; never put
it in chat, command arguments, history or agent logs. Validate temporary-access
authorization if authentication rejects. Do not repeatedly rotate credentials
or commission another scope without reconstructing the observed failure.

Only after verifier qualification and hosted health/HTML pass may the helper
present OPEN, native passkey/Touch ID, and protected binding. After apparent M1
success, independently reconstruct all canonical invariants, verify private
recovery permissions and consumed setup capability using secret-safe checks,
check the exact hosted target and runtime inventory, persist the final M1
receipt/checkout, and stop. M2 remains explicitly excluded.
