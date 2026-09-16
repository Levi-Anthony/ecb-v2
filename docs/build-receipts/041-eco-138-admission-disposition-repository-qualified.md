STATUS: REPOSITORY-QUALIFIED + CANONICAL; PRODUCTION INSTALL UNVERIFIED
DISPOSITION: ADJACENT ECO-138 MOVE RECEIPT
DATE: 2026-09-16 UTC

# ECO-138 — Universal admission provenance + active disposition

## Authority and boundary

Linear commission: ECO-138 — `[Adjacent][Move] ECOS universal admission aperture — add neutral encounter provenance to BUILD 11 receipt plane`.

Parent Shape: ECO-137.

This is an adjacent extension of the installed BUILD 11 ordinary-operation substrate. It is not a new BUILD designation and does not reinstall historical Crucible architecture.

Governing distinctions:

- admission transfers custody, not authority;
- capture broadly, think selectively;
- canonical Thought evidence remains separate from custody provenance;
- operational disposition is not truth, epistemic standing, authority, priority, classification, or routing;
- unknown/unresolved is a legitimate current disposition;
- currentness is explicit, not inferred from newest data.

## Qualified repository delta

Qualified candidate head:

`d5802d938353cd28db46f7e89be70803bb6b1a01`

PR #47 — `ECO-138: universal admission provenance + active disposition`

Squash-merged repository main:

`b077d7496bed63105453ef22ec69423ffe0593fc`

Principal implementation surfaces:

- `sql/migrations/20260916023000_eco138_admission_disposition.sql`
- `sql/migrations/20260916023100_eco138_disposition_transition_fix.sql`
- `tests/eco-138/qualify.sql`
- `.github/workflows/eco-138-admission-disposition.yml`
- `server.ts`

## Physicalized contract

### Admission encounter provenance

`public.thought_admissions` is keyed by the existing ordinary-operation receipt.

It may retain:

- opaque producer-supplied context when genuinely known;
- direct parent admission/operation identity when genuinely known.

It does not duplicate Thought content/source and does not convert provenance into a Claim.

### Active disposition

ECO-138 adds:

- immutable, Referent-backed `thought_disposition_revisions`;
- one exact `thought_disposition_heads` current pointer per Thought;
- predecessor-safe operational disposition transition;
- explicit reentry condition support;
- cold recovery of evidence, custody provenance, and current disposition as distinct surfaces.

Initial system disposition is neutral free-text `unresolved`; no closed lifecycle enum was installed.

### Existing substrate reused

- BUILD 11 `ordinary_operations` remains the sole replay/conflict protocol.
- legacy BUILD 11 capture operation IDs retain their V1 request-digest replay semantics.
- BUILD 12 Artifact semantics are unchanged.
- no Claim relation is used for raw custody lineage.

The runtime capture validator was also corrected so nonblank `content` and `source` are validated without trimming submitted evidence before custody.

## Mechanical qualification

ECO-138 workflow:

- run `35080640126` — PASS

Independent BUILD 12 regression:

- run `35080640296` — PASS

The passing qualification proved, among other obligations:

- predecessor reconstruction;
- low-context admission;
- exact content/source preservation;
- known parent receipt lineage;
- lossless producer context;
- Thought-ID and receipt-ID cold recovery convergence;
- same-operation/full-request replay;
- changed provenance conflict;
- invalid-parent rejection;
- neutral current disposition;
- disposition transition/history preservation;
- deferred reentry recovery;
- stale-predecessor rejection;
- disposition-revision immutability;
- ordinary-role capability confinement;
- no automatic Claim, Evidence Link, or Artifact inflation.

## Failure lineage

The first qualification candidate passed the predecessor and admission cases, then failed when the new disposition transition executed one SQL `UPDATE` whose `thought_id` reference was ambiguous against the function's `RETURNS TABLE` output variable.

Classification: ordinary Move implementation defect.

The correction migration qualified only that column reference. No schema contract, disposition semantics, or proof obligation changed. The same adversarial suite then passed.

## Explicit nonclaims

This receipt does not establish:

- a Crucible-specific ingest database;
- semantic Claim extraction;
- routing or grading;
- a priority ontology;
- a generalized workflow engine;
- Master-Key authority;
- action authorization;
- autonomous processing;
- production installation of ECO-138.

## Production boundary

Repository qualification and canonical merge are proven.

Canonical Supabase installation and canonical Vercel/runtime verification are **not proven by this receipt**. `BUILD_CHECKOUT.md` therefore continues to identify BUILD 12 as the last production-verified state until a separate live installation/verification closes that boundary.

## Reentry

The exact next live boundary is:

1. verify canonical Supabase currentness;
2. apply ECO-138 migrations exactly once from the verified BUILD 12 predecessor;
3. independently verify schema/RPC/current disposition invariants;
4. deploy/verify the canonical runtime contract;
5. only then promote ECO-138 from repository-qualified to production-verified.

ECO-140 may compile against this repository-canonical substrate, but production reliance on ECO-140 also requires this live predecessor installation.