# ECO-170 — Qualification Receipt

**Register:** B  
**Date:** 22 September 2026 America/Phoenix  
**PR:** #83  
**Base:** `main@18059fd7a752aa93e716598847956c96faf3611a`

## Final qualified candidate

- Exact tested head: `0e208cd64bd12dfd065c91c07edaa83303478b13`
- Workflow run: `35782091346`
- Job: `106929823454`
- Result: SUCCESS
- `ECO170_TESTED_HEAD=0e208cd64bd12dfd065c91c07edaa83303478b13`
- `ECO170_QUALIFICATION=PASS`
- `ECO170_CHECK_COUNT=15`
- `ECO170_CONTAINMENT=PASS`

Evidence artifact:

- ID: `10718098224`
- Name: `eco170-engagement-projection-evidence`
- Size: 4,430 bytes
- SHA-256: `cee9ec30f1d25b7a7c581bc29c3a6673b679371da27bfbbbac24db5486a111f5`
- Expires: 22 October 2026 20:43:13 UTC

## Checks

All PASS:

- exact_repository_source_blobs
- real_authority_negative_control
- fixture_authority_positive_control
- material_source_change_local_invalidation
- unrelated_repository_head_does_not_invalidate
- new_relation_admitted_without_focal_substitution
- focal_grain_change_requires_refocus
- pgo_change_requalifies_without_rewriting_sources
- warrant_change_remains_separate
- authority_revocation_does_not_rewrite_qualification
- phase_change_without_authority_does_not_create_authority
- dormant_reentry_signal_reconsiders_only
- cold_restart_reconstruction_stable
- constituent_independence_visible
- fca_positive_utility

## Pre-verdict historical run

Run `35781794783` was green but checked out synthetic PR merge `3d9c8f9b7341a72fd4c635a488ddd1365df3a168`. It is preserved as supporting evidence only.

Artifact `10718117583`: SHA-256 `3a964781046b939ad47959c96ca00a0346adcc1edca1ab53d4745458685a913b`.

The exact-head custody repair changed only the workflow checkout/assertion behavior; projection semantics/tests remained unchanged.

## Containment

No candidate changes to:

- `server.ts`
- `api/`
- `sql/migrations/`

No canonical Supabase mutation, real ECO-179 execution, real authority activation, merge or production promotion is claimed.

PR #83 remains draft/unmerged. A platform-generated Vercel preview feedback check exists but is not qualification or production-installation evidence.
