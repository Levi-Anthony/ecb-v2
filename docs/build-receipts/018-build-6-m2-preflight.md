STATUS: M2 PREPARATION COMPLETE — ACTIVATION WAITING AT PRIVATE EXECUTOR CUSTODY
DISPOSITION: EXECUTION_CHECKPOINT / EVIDENCE; NOT AN ACTIVATION RECEIPT
DATE: 2026-09-09 America/Phoenix (canonical observation 2026-09-10T00:52:40Z)
AUTHORITY: Current user instruction to continue from verified M1, recover exact live M2, execute the next bounded step and stop at a true human or private-custody boundary

# Bounded outcome

Recovered the live contract and canonical prerequisites; retained one exact M2
execution/recovery request; qualified the existing executor client's connection
boundary and JSON transport. Canonical M2 has not executed. M1 remains closed PASS.
No private recovery records or credentials were read. No enrollment, binding,
canonical role change, deployment, P1 preparation or BUILD closure occurred.

## Authority and source reconstruction

Live source is `/private/tmp/ecb-build6-live-bind`, branch
`reconcile/build-6-tested-move`, starting commit
`ee4d32298cfc03bd9e820ba10cd6ff37fa435ddd`. It was clean and exactly matched the
remote before this step. The saved project path `/Users/prodadmin/ECB v2 — Greenfield`
does not exist. `/Users/prodadmin/ECB-v2-Greenfield` is the older
`build/build-6-sense` checkout at `afdd7dc`, with unrelated uncommitted work;
it was inspected but not edited or used as current authority.

The contract is step 5 of `docs/build-shape/008-build-6-move-release.md`, under
`008-build-6-runtime-boundary.md` and accepted `008-build-6-human-binding.md`:
consume the prior committed exact genesis decision in one scope-serialized
transaction with ordered obligations:

1. `activate_exact_p0`
2. `designate_initial_h_and_remit`
3. `exhaust_bootstrap`

Current state and immutable transition history commit together. Recover a lost
acknowledgement with the same request, never a new genesis or a new approval.
Registration alone is not authority. The exact P1 decision remains a later human
gate, and BUILD 6 remains open.

The previous M1 checkout's prohibition on M2 described that completed move's
scope. The current explicit continuation authorizes this bounded M2 preparation;
it does not reopen M1 or grant installation credential custody. The accepted
genesis decision supplies the normative grant; no renewed P0/H/remit acceptance
is requested.

## Canonical read-only observations

Project `vezxivrvhakclxuvxzso`:

| Field | Observed value |
|---|---|
| Scope | `20ad3966-8647-4a0f-9eed-2888e67e1e49` |
| H | `4cfbaf81-a7e9-4786-b2ad-4f791ab7ce1d` |
| Binding | `7446baff-13a8-4f68-a0c3-8445933575b8` |
| Genesis decision | `a5f6d414-85cd-4a67-b904-64fc122db362` |
| P0 subject | `354550d5-c8db-43f3-9255-3bacfafaa873` |
| Remit subject | `be4285ef-05ee-4296-b41e-69a37118ca27` |
| External basis subject | `f3240e03-bea6-4470-9201-079e05f6d08f` |
| Total scopes / decisions / transitions | `1 / 1 / 0` |
| Current transition / decision predecessor | `NULL / NULL` |
| Genesis exact P0 / H / external basis | All match scope |
| Prior committed / unwithdrawn | Both true |

Accepted digests match canonical retained subjects and existing M1 evidence:

- P0: `686148f540860aca57a43d8cdf02ee15a0f6314d14b54736e6baf6f1846a7664`.
- Remit: `a54707a0bb4e5373ec8c46adee58d71b67aa6de018d652d7d18b0445f24b9932`.
- External basis: `f43f95b4fdb84a62c16a0c56acd4a9b3a1ba3d0fd3bf25cd34cddaf4190da78b`.
- Unchanged migration file: `de6e6fb7856b08eee2876b8ce65e4a9513c455703934a7627c2f016825f0d461`.

Canonical and disposable PG17 `pg_get_functiondef` for
`ecb_governance.executor(text,jsonb)` both hash to
`1429d27ef17c332c98630860784ac21808b0597a11f147f4a89a282450e26b53`.
This is a function-definition comparison, not a fresh qualification of every
deployed function. Hosted health and private recovery PASS are carried from the
closed M1 receipt; this step did not requalify them.

## Small executor correction and verification

The existing executor used strict TLS without the retained Supabase CA. Prior
runtime evidence established that the target's certificate chain needs this CA.
The executor now supplies the same public certificate, retaining certificate and
hostname validation. The human service is unchanged; the executor is excluded
from its Vercel upload.

Connection qualification now requires an explicit executor URI, the exact
executor login (including session_user), no elevated attributes or owner/verifier/
service membership, permission to execute, and no human-decision entry permission.
Missing/mixed-custody configuration rejects before contact. Authentication or
qualification failure closes the connection; the CLI emits only the existing
secret-free unknown-outcome message. This avoids an owner connection disguised by
SET ROLE and avoids ambient connection defaults. No new package or migration.

Node 24.20.0: 28/28 tests passed. Four connection tests cover the real pinned
driver's TLS option parser, URI attempts to weaken TLS, absent/mixed credentials,
wrong login/elevation/membership/permissions and failure cleanup. The existing
isolated PG17 suite now exercises the exported production executor adapter for
its ordinary requests. It passes genesis, exact recovery, replay/conflict,
exhaustion, prior-commit rejection, rollback, concurrency and authority controls.
All test identities/effects remain synthetic and local; they do not activate M2
or re-run canonical M1. Live restricted-executor connectivity remains untested.

## Exact next handle and private-custody boundary

Retained request: `docs/build-shape/008-build-6-m2-request.json`.
Request ID: `e4e78a38-4f42-4f0f-b281-bd0dbdb26fda`.
Request file SHA-256: `e67b2364c7e9da64f8379c13f4c37ec7c0bd8ca70b6b99c8817842e74012a9da`.
It contains public subject identities and the exact P0 digest, not a credential.
It neither creates a decision nor licenses another genesis. Preserve every field
for inspect/recover/execute and all retries; do not regenerate its request ID.

Canonical `ecb_governance_executor` is NOLOGIN, NOINHERIT, without superuser,
BYPASSRLS, CREATEDB, CREATEROLE or owner/verifier/service membership. It can call
the executor entry, cannot call human/commission entries, and cannot directly
insert/update/delete/truncate private governance tables. This is the actual stop
boundary: a restricted login must be provisioned under private installation
custody before the executor can authenticate.

The custodian must privately enable/authenticate only that existing restricted
executor role for this canonical project and deliver `EXECUTOR_DATABASE_URL` to
a separate executor process. Do not put installer credentials in that process,
use the human-verifier secret, install executor access in the human service, or
send any URI/password/PAT in chat. No management-tool activation or owner-session
role impersonation substitutes for this boundary. Private provisioning and its
actual connection qualification are still pending; this receipt supplies no
claim that they succeeded.

After custody is complete, from the live checkout under Node 24, with only the
restricted executor credential supplied privately:

```sh
node server/ecb-human/executor.mjs recover docs/build-shape/008-build-6-m2-request.json
```

If it reports committed, reconstruct that exact transition and do not execute
again. If it reports unknown, stop effects and reconcile. Only established
`not_committed`, `scope_locked=true`, `current_transition=null`, with the retained
genesis basis still matching, permits the already authorized effect:

```sh
node server/ecb-human/executor.mjs execute docs/build-shape/008-build-6-m2-request.json
node server/ecb-human/executor.mjs recover docs/build-shape/008-build-6-m2-request.json
node server/ecb-human/executor.mjs inspect docs/build-shape/008-build-6-m2-request.json
```

Execution still rechecks eligibility in its scope-locked transaction. On any
unknown acknowledgement, recover the unchanged request before another effect.
Independently verify one genesis transition consuming the retained decision,
exact P0/H/remit/binding, ordered obligations, matching current pointer and
bootstrap exhaustion. Persist the activation receipt before considering P1.
Do not reopen M1, manufacture a new genesis grant, accept P1 for Levi, close
BUILD 6, or enter BUILD 7+.
