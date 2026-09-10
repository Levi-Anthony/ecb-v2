STATUS: LOCAL RESUME PREFLIGHT PASS; LIVE M1 HUMAN CUSTODY PENDING
DISPOSITION: EXECUTION RECEIPT
DATE: 2026-09-08 America/Phoenix

# BUILD 6 — Repaired checkout and empty-installation preflight

The human authorized the recommended worktree repair, followed by scope recovery
and continuation. The active scope remains exact M1 binding, with M2 excluded.

## Checkout reconciliation

The final-pass worktree contained 158 tracked files matching commit
`415ca5182b13e2af19548271229c205e959ac550` byte for byte, with no tracked changes
or ordinary untracked files. Ignored dependencies and generated Vercel config
were retained. Its `.git` pointer referenced the former repository location.

`git worktree repair` repaired that pointer and the broken pointers of five
other registered worktrees affected by the same repository rename. No worktree
was deleted or pruned. The clean final-pass branch was fast-forwarded through
seven commits to the verified remote tip
`163c91d3a9706ae00d402ff09bf85a41ddc98390` before the correction below.

Main-checkout routing changes, 17 untracked research files, environment files,
and generated artifacts were preserved. Credential/token-bearing local files
remain present in the main checkout, including generated diagnostic manifests;
this receipt does not certify their cleanup or credential validity. No secret
contents were displayed or copied into this checkout.

## Fresh read-only live observations

- Canonical project: `vezxivrvhakclxuvxzso`.
- Scopes, credentials, sessions, decisions, transitions: all zero.
- Governance owner, verifier, executor: all NOLOGIN, without superuser,
  bypass-RLS, create-role, or create-database privileges.
- Exact production project `ecb-human`, selected with its retained team/project
  IDs: no environment variables present.
- Hosted `/health`: HTTP 503, `service_unavailable`, `outcome: unknown`.
- Local private recovery directory: absent.

No database changes, role provisioning, deployments, commission, or human
ceremony were performed during this continuation.

## Focused correction and validation

The old expression `existing?.current_transition !== null` rejected an absent
scope because `undefined !== null`. Require an existing scope before checking
its transition field. An existing scope with a missing field still rejects.

The regression harness executes the actual main entry path with external effects
replaced and stops before role qualification can perform any mutation. The
empty-installation case failed against the original helper. All five cases
pass after correction: empty installation, inactive scope, current transition,
missing transition field, and transition history.

Node 24 syntax checking and Git whitespace checking pass. The accepted migration
and P0 digests remain unchanged. Full database qualification was not rerun for
this JavaScript guard correction; prior receipts remain historical evidence.

Corrected helper blob: `bdcfe58c68cf811f786a3f55f87d1eb9fb2e92fb`.

## Next action

Use the repaired `reconcile/build-6-tested-move` checkout at
`/private/tmp/ecb-build6-final-pass.vH2gy1`, running
`npx -y node@24 server/ecb-human/live-bind.mjs` in a human-operated terminal.
The private installer URI remains outside model/chat custody. OPEN and native
passkey/binding actions remain human-operated. Independently reconstruct exact
M1 after helper completion before declaring success. M2 remains excluded.
