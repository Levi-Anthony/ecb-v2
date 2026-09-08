# ECB human service — BUILD 6 candidate

Status: locally tested candidate; not deployed or ready for live enrollment.
See the [verified progress record](../../docs/build-receipts/008-build-6-progress.md)
for the exact evidence, limits and next handle.

Use Node 24 and `npm ci --ignore-scripts`. The production verifier accepts only
`HUMAN_DATABASE_URL` for the restricted `ecb_human_verifier` role. It rejects known
owner, service-role, signing, installer, executor and agent-key configuration.
Certificate and hostname validation are required; provisioning the project CA is
still an open deployment seam. Do not source the repository's `.env.local` into
this service. Its Vercel project is `ecb-human`, distinct from `ecb-v2`.

`app.mjs` owns HTTP/WebAuthn verification; private SQL owns session rechecks and
authority transitions. A verifier is trusted to attribute session decisions. The
executor cannot call its API, mint sessions, register keys or mutate native tables.
Installation custody can defeat these controls and is named as a trust dependency.

`installer.mjs` is for a human-operated terminal outside model capture. It requires
an exact installation-package JSON containing `project_ref`, `origin`, `rp_id`,
`credential_count`, `remit_file`, `remit_sha256`, `root_basis_file`,
`root_basis_sha256` and `source_reference`. It checks accepted P0, retains a private
recovery record before contact, and commissions an expiring setup capability.
It never activates governance. **A live installation package has not been bound.**
Do not run it until the readiness conditions in the progress record pass.

`executor.mjs inspect|execute|recover exact-request.json` uses only
`EXECUTOR_DATABASE_URL`. Its descriptions identify permissions, effects and recovery.
Use exactly the same scope/decision/request/predecessor/digest for recovery. A transport
failure is unknown, never proof of absence. No executor credential is provisioned.

The browser has registration, login, exact review/accept/decline, own pending-decision
withdrawal, logout and state recovery. `/intervene` reaches the same service directly;
it is independent of another dashboard, not independent of this service/database.
Session secrets never enter URLs, localStorage or model responses. Scope and decision
IDs identify subjects and are not bearer authority.

The seven native tables implement distinct record responsibilities from the released
runtime shape. The new owner receives only Referent ID insertion through a role-scoped
RLS policy; no existing kernel row semantics are changed. Public/anon/authenticated/
service_role receive no new private-schema access. Existing MCP inventory is unchanged.

The initial session limits are 24-hour inactivity and seven-day absolute lifetime.
They are presently fixed in this candidate SQL; configuration tuning and real-device
interruption measurements remain part of qualification rather than an implemented
settings surface. Polling does not extend sessions. Existing committed grants survive
logout; logout prevents new admission.

Tests: from the repository root, see [the harness](../../tests/build-6/README.md).
No real authentication test may use an agent-generated key as Levi's authority.
