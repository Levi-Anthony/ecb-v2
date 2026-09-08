STATUS: MOVE IN PROGRESS — LOCAL CANDIDATE VERIFIED; LIVE READINESS INCOMPLETE
DISPOSITION: EVIDENCE / PROGRESS CHECK
DATE: 2026-09-07 America/Phoenix

# BUILD 6 verified progress

## Level and intent

This is an implementation-level progress check under the already released BUILD 6
Move. It verifies what exists, records the remaining operational seams, and identifies
the next bounded move. It does not reopen Sense, expand architecture, activate
governance, or close BUILD 6.

## Observed state

The original release was recovered from Levi's “Yes authorized” at
2026-09-07T19:09:03.887Z and persisted in the
[release record](../build-shape/008-build-6-move-release.md). The previous task hit its
usage limit before saving that release or writing implementation.

Local implementation now contains:

- A private seven-table governance migration with Referent coupling, restricted
  verifier/executor roles, immutable subjects/decisions/transitions, protected
  enrollment, sessions, atomic M2, succession, withdrawal and exact recovery.
- A same-origin human service using pinned SimpleWebAuthn server 14.0.1/browser
  14.0.0, one-use browser-bound challenges, required UV, explicit cross-origin/key/
  handle checks, hashed cookies, CSRF, no-store views and exact-decision review.
- Human-operated installation and bounded executor CLI candidates, plus Node 24
  Vercel packaging for the existing isolated `ecb-human` project.
- A disposable PG17 harness reconstructed from the retained BUILD 5B rehearsal.

## Verification performed for this check

Fresh-run evidence: [machine receipt](../../tests/build-6/evidence/receipt.json),
[raw test output](../../tests/build-6/evidence/qualification.txt).
The current migration digest is recorded in that receipt; it matches the exact
file installed and retained in the disposable migration ledger.

- Node reports **24 passing tests**, zero failures: 23 subtests plus the enclosing
  test. Coverage includes signed synthetic ES256 registration/login, forged inputs,
  stale policy, duplicate JSON keys, role bypass, withdrawal/execution races,
  genesis commit/rollback races with actual PostgreSQL blocking, lost HTTP login
  acknowledgement, expiry, same-top-level-transaction rejection and recovery.
- Forced migration rollback leaves neither private schema nor new roles. The
  subsequent migration and its exact ledger bytes commit together.
- Every predecessor public row is compared before and after qualification.
  Prior Referents remain intact; new native records receive their own Referents.
- Exact accepted P0 remains SHA-256
  `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`.
- Vercel CLI 59.11.7 on Node 24.19.0 completes the local production build.
- npm audit reports zero known vulnerabilities. The config dependency is build-only;
  a pinned `path-to-regexp` 6.3.0 override addresses the dependency audit finding.
- The local, unauthenticated page was inspected in a browser. No real passkey,
  human session, enrollment capability or canonical authority was used.
- Formatting and whitespace checks pass.

Read-only canonical recheck after the fresh run: PostgreSQL 17.6,
`ecb_governance` absent, nine BUILD 5B Artifacts, and the seven expected migration
versions ending at `20260906014257`. No canonical BUILD 6 migration, credential
provisioning, enrollment, P0 installation or P1 succession occurred.

The deployed Open Brain MCP returned HTTP 200 with exactly `capture_thought`,
`search`, `fetch`. This verifies that service's inventory; it does not prove that
an arbitrary client containing other tools is a restricted operating agent.

## Remaining seams and explicit limits

1. **Deployment connection trust:** the certificate-validating Postgres client
   rejects the current pooler chain with `SELF_SIGNED_CERT_IN_CHAIN`. Obtain the
   project CA through the official Supabase route and verify the host/chain. The
   client now requires certificate validation; do not fall back to `ssl=require`,
   which this installed driver implements without certificate verification.
2. **Hosted packaging and HTTPS:** a successful local build is not a hosted test.
   Confirm the packaged handler's static-file mapping and routes in the actual
   deployment. The last hostname HTTPS check still failed negotiation. The project
   environment check returned no variables; no human service has been deployed.
3. **Remaining released qualification:** explicitly exercise competing distinct
   succession grants and session logout/admission races in both commit/rollback
   directions, plus actual restricted-role connection behavior on Supabase. The
   existing passing suite must not be presented as every released observation.
4. **Human operation:** real iPhone/Mac ceremonies, redundant credential behavior,
   intervention usability and interruption frequency remain unobserved. Exact live
   credential/scope binding, M2 activation and the separate first P1 decision remain
   ahead. Synthetic identities never establish Levi's identity.
5. **Custody:** the existing three-tool MCP is the current ordinary-service boundary.
   This Codex task has installation/admin/browser powers and is not itself a
   qualified ordinary operating-agent profile. Enforce the actual client/tool and
   credential boundary before presenting protected enrollment.

Initial compilation/verification failures were repaired before the passing run:
PG17 owner membership, a PL/pgSQL CASE parsing issue, a test JSON parameter-encoding
error and a SimpleWebAuthn string-challenge encoding mismatch. The receipt proves
only the final identified candidate and observed controls.

## Next bounded move

Complete one readiness pass over those remaining qualification and deployment
seams, then install the inactive mechanism and deploy the restricted human service.
Only after HTTPS, actual role privileges and ordinary-agent exclusion pass should
Levi receive the human-operated enrollment handoff. H/remit/P0 and the staged release
remain accepted; no repeat normative approval is needed.

BUILD 6 stays in Move. This progress record is not Metabolize or closure.
