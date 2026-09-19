STATUS: ACTIVE
DISPOSITION: CURRENTNESS / MIGRATION-STATE PROJECTION
ROLE: Explain repository migration files versus canonical installation state
CURRENTNESS: 18 September 2026 America/Phoenix

# Migrations

## Read this before interpreting the directory

**File presence in `sql/migrations/` does not mean the migration is installed, pending installation, or still production-appropriate.**

This directory contains several different kinds of migration-era artifacts:

1. **canonically installed migrations** that form the live ECB v2 substrate;
2. **closed Register-B proof implementations** retained as executable evidence but deliberately not installed canonically;
3. **historical/superseded migrations** retained to reconstruct prior states and qualification lineage;
4. **active candidates** that are authorized only inside their controlling bounded implementation commission until separately promoted.

Always reconcile repository evidence with `BUILD_CHECKOUT.md`, the applicable build receipt, and the live canonical migration ledger before claiming installation/currentness.

## BUILD 7–10 status correction

BUILDs 7, 8, 9 and 10 are **not unfinished Builds**. Each is human-closed at implementation Register B.

Their historical migrations are also **not a delayed canonical install queue**.

They are frozen executable proof implementations whose bounded capability claims remain evidence for future production promotion:

| Build | Register-B standing | Historical implementation | Canonical DB install |
|---|---|---|---|
| BUILD 7 | CLOSED | fixture-only Local Master Key / orientation proof; synthetic scope and `G_TEST` grant | NONE |
| BUILD 8 | CLOSED | disposable atomic-ledger Action Envelope proof; synthetic target, `A_TEST`, `advance_one` | NONE |
| BUILD 9 | CLOSED | synthetic recursive inquiry / parent-child-reentry proof | NONE |
| BUILD 10 | CLOSED | disposable bounded semantic-transfer proof with finite specimen checker | NONE |

**Current rule: promote capabilities, not historical migration bytes.**

Any production realization of these capabilities should start from the current live substrate with a new forward migration/interface after current-semantic reconciliation. Do not apply the old BUILD 7–10 files to canonical production merely because they appear chronologically before BUILD 11.

The governing promotion reconciliation is Linear ECO-150. Historical migration bytes remain provenance/evidence and should not be casually rewritten.

## Current canonical production lineage

The live production substrate deliberately proceeded from B0–6 to later current-substrate work without installing BUILD 7–10.

Current production-installed capability lineage includes:

- BUILD 0–6 foundation/governance substrate;
- BUILD 11 ordinary-operation structural kernel;
- corrected BUILD 12 greenfield Artifact slice;
- ECO-138 admission/disposition;
- ECO-140 shaped next-action projection.

BUILD 11 was explicitly qualified and installed **without requiring BUILD 7–10 installation**.

### BUILD 11

- `20260914063000_build_11_ordinary_operation_kernel.sql`

Supplies cross-cutting ordinary-operation mechanics including stable operation identity, replay/conflict, recoverable outcomes, ordinary capability confinement, and semantic-representation-independent evidence custody.

### BUILD 12 historical + correction path

Repository retains the initial Build-12 migrations because disposable/correction qualification reconstructs the prior state:

- `20260915090000_build_12_ordinary_versioned_artifacts.sql`
- `20260915101000_build_12_artifact_key_fetch.sql`
- `20260915102500_build_12_artifact_key_fetch_fix.sql`
- `20260915102000_seed_integral_holonic_grammar_semantic_contract_v1.sql`

Those initial generic/version-family semantics and the conversation-derived semantic seed are **historical evidence only**.

The accepted current physicalization is:

- `20260915114500_build_12_greenfield_artifact_correction.sql`

It leaves the narrow immutable `public.text_artifacts` capability plus bounded create/fetch RPCs and reuses BUILD-11 operation identity rather than introducing a competing version/currentness truth store.

### ECO-138 / ECO-140

- `20260916023000_eco138_admission_disposition.sql`
- `20260916023100_eco138_disposition_transition_fix.sql`
- `20260916030000_eco140_shaped_next_action.sql`

These are canonically installed and production-verified. They do not install BUILD 7–10 semantics and do not confer real action authority/effects.

## Historical BUILD 7–10 files

Retain unchanged as executable proof evidence unless an explicitly governed provenance repair requires otherwise:

- `20260910090000_build_7_local_master_key.sql`
- `20260911130000_build_8_action_envelope.sql`
- `20260911140000_build_8_lifecycle.sql`
- `20260912160000_build_9_recursive_inquiry.sql`
- `20260913070000_build_10_semantic_transfer.sql`

A future BUILD 7'/8'/9'/10' denotes a **production realization of the accepted capability family**, not delayed execution of these historical SQL files.

## Early substrate migrations

BUILD 0:
- `20260903235721_build_0_atomic_thoughts.sql`
- `20260904000010_build_0_least_privilege.sql`

BUILD 2:
- `20260904093341_build_2_universal_referents.sql`

BUILD 3:
- `20260904163938_build_3_claims_evidence_links.sql`

BUILD 4:
- `20260904215929_build_4_typed_relation_claims.sql`

BUILD 5A:
- `20260905022247_build_5a_standing_transition_history.sql`

BUILD 5B:
- `20260906014257_build_5b_versioned_artifacts.sql`

BUILD 6:
- `20260907234712_build_6_governance_bootstrap.sql`

For exact historical execution/qualification standing, read the corresponding `docs/build-receipts/` record rather than inferring it from this inventory.

## Admission rule

Add or install a migration only under an active commission that explicitly governs the intended state transition.

Do not infer authority from:
- filename chronology;
- presence on `main`;
- a closed Register-B proof;
- a passing disposable test;
- a repository merge;
- or a later Build number.

Repository canonicalization, Register-B closure, canonical database installation, runtime exposure and real effect authority are separate state dimensions.
