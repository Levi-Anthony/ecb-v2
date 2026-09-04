STATUS: MOVE COMPLETE; VERIFICATION PASSED; HUMAN METABOLIZE CLOSURE REQUIRED
DISPOSITION: EVIDENCE
ROLE: BUILD 3 execution and acceptance receipt
AUTHORITY: Does not amend the Build Contract, closed Shape, apertures, invariants, or acceptance fixture

# BUILD 3 Receipt — Claims + Standing + Evidence Links

## Result

**PASS — the bound BUILD 3 Output Contract is implemented and frozen Worked Trace 03 completed.**

This is Move evidence, not Metabolize closure. BUILD 3 remains on the human rail, and BUILD 4 is not
opened or authorized.

## Release provenance

The human explicitly released implementation from the corrected Shape/test-authority anchor:

- Shape commit: `29b2601faf4b76062cf85e449ac9b05a82a75dd3`;
- Shape root tree: `339f009f3c4d9861e62cfe17e066497929d92809`.

Before consequential implementation, `HEAD` and `origin/main` matched that commit, the root tree
matched, the main worktree was clean, and `git diff --check` passed.

The two-layer historical baseline also passed before installation:

- BUILD 0 local MCP suite: 6 passed, 0 failed;
- BUILD 1 fixture suite: 5 passed, 0 failed;
- BUILD 1 deterministic trace: PASS; and
- unchanged historical BUILD 2 closure harness: PASS.

No BUILD 0–2 reopening condition was present.

## Installed migration

- canonical project: Supabase `ecb-v2-brain` (`vezxivrvhakclxuvxzso`);
- PostgreSQL: 17.6, UTF-8;
- `pgcrypto`: 1.3 in `extensions`;
- migration: `20260904163938_build_3_claims_evidence_links`;
- activation transaction time: `2026-09-04 16:39:38.624321+00`.

The checked-in migration is
`sql/migrations/20260904163938_build_3_claims_evidence_links.sql`. Before installation, its exact body
passed once with the final `COMMIT` replaced by `ROLLBACK`; inspection confirmed that no BUILD 3 table
or Referent survived that probe. The managed migration runner supplied its own outer transaction, so
PostgreSQL logged the expected nested-`BEGIN` and trailing-`COMMIT` warnings while applying the file's
explicit atomic transaction. The migration installed and its history entry committed successfully.

Canonical migration order is now:

1. `20260903235721_build_0_atomic_thoughts`;
2. `20260904000010_build_0_least_privilege`;
3. `20260904093341_build_2_universal_referents`;
4. `20260904163938_build_3_claims_evidence_links`.

## Canonical state

Independent post-installation inspection established:

- public tables are exactly `claims`, `evidence_links`, `referents`, and `thoughts`;
- public functions are exactly `prepare_claim`, `prepare_evidence_link`,
  `register_thought_referent`, and `search_thoughts`;
- canonical counts are one Thought, four Referents, one Claim, and one Evidence Link;
- `public.referents` remains exactly `id + registered_at`;
- GT01 retains its exact BUILD 0 UUID, content, source, capture instant, embedding model, and
  384-dimensional embedding;
- Claim C and Evidence Link L each have a same-UUID Referent;
- all rollback-only BUILD 2 and BUILD 3 probe Referents are absent; and
- no public view, resolver, RPC, Event, Artifact, relation endpoint, standing history, SIGMA/ECOS
  position, or BUILD 4+ object appeared.

Claim C is installed as:

```text
id=0f89e778-b16e-4840-9129-a2aa3eb6f697
proposition=The described scene contains both a brass heron and a violet staircase.
scope=worked_trace_03:gt01_interpretation
claim_kind=assertion
origin=ecb_inference
epistemic_standing=unassessed
asserted_at=2026-09-04 16:39:38.624321+00
```

Evidence Link L is installed as:

```text
id=4c6c0f50-a936-4da6-bb09-233f93320639
claim_id=0f89e778-b16e-4840-9129-a2aa3eb6f697
evidence_referent_id=19a949ea-a8fc-4250-a386-fa64e5530180
role=used_as_basis
evidence_revision_scheme=ecb_thought_revision_v1_sha256
evidence_revision_digest=5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55
linked_at=2026-09-04 16:39:38.624321+00
```

## Structural and authorization verification

- Claims and Evidence Links contain exactly the seven frozen columns each.
- All four BUILD 3 foreign keys are immediate, non-deferrable, and restrictive.
- Evidence Link retains no foreign key to `thoughts`, so native Thought disappearance does not erase
  historical lineage.
- Each new table has exactly one row-level `BEFORE INSERT` preparation/registration trigger.
- The Link trigger is `SECURITY DEFINER`, owned by the migration owner, with empty `search_path`; both
  trigger functions are schema-qualified and directly executable by none of `PUBLIC`, `anon`,
  `authenticated`, or `service_role`.
- Both tables have RLS enabled with no policies.
- `service_role` has `SELECT` and only the frozen column-level `INSERT` grants; it has no table-level
  insert, update, or delete capability.
- `PUBLIC`, `anon`, and `authenticated` have no BUILD 3 table access.
- No uniqueness rule collapses repeated historical basis links or requires every Claim to have a Link.

The security advisor returned only `rls_enabled_no_policy` at INFO level for all four canonical tables.
That is intentional: client roles have no grants or policies, while the server-side service role has
the frozen least-privilege grants. The performance advisor returned INFO notices for the two
unindexed Evidence-Link endpoint foreign keys. No index was added because BUILD 3 has no observed
workload pressure earning one, and the bound minimum Shape does not authorize schema convenience.

## Worked Trace 03

The committed direct-database harness returned:

```json
{
  "suite": "build-3-evidence-versus-inference",
  "result": "PASS",
  "checks": [
    "exact-build-3-expansion",
    "independent-canonical-revision-encoding",
    "fresh-context-evidence-assertion-separation",
    "caller-forgery-rejected-or-overwritten",
    "direct-write-least-privilege",
    "source-bearing-drift-explicit",
    "embedding-excluded-from-evidence-revision",
    "evidence-unavailability-distinct-from-no-link",
    "historical-lineage-non-cascade",
    "unavailable-and-invalid-timestamp-link-rejection",
    "for-share-transaction-race-boundary",
    "origin-standing-lineage-separation",
    "probe-residue-absent"
  ],
  "observations": {
    "baseline": {
      "status": "linked_revision_match",
      "linked_revision_digest": "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
      "current_revision_digest": "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55",
      "source_evidence": {
        "referent_id": "19a949ea-a8fc-4250-a386-fa64e5530180",
        "content": "GT01: The brass heron waits beneath the violet staircase.",
        "source": "golden_trace_01",
        "captured_at": "2026-09-04 00:12:35.225093+00"
      }
    },
    "source_mutations": [
      {
        "field": "content",
        "status": "linked_revision_mismatch",
        "current_digest": "5ce23dfa64a69e028ef9b92a160eab15afd32471f0e21245157e58b3dfc26c53"
      },
      {
        "field": "source",
        "status": "linked_revision_mismatch",
        "current_digest": "3ba04b1179000449b335fb9046eef19d85fab90ee691eda8404218ddd1a01f7c"
      },
      {
        "field": "captured_at",
        "status": "linked_revision_mismatch",
        "current_digest": "2e3c5c1a09a9b29fb66a9ad50274b2769dc522c5c3648a48d232dd8dbb8bda21"
      }
    ],
    "embedding_only": {
      "status": "linked_revision_match",
      "current_revision_digest": "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"
    },
    "evidence_disappearance": {
      "status": "linked_evidence_unavailable",
      "current_revision_digest": null,
      "source_evidence": null
    },
    "no_recorded_basis": {
      "claim_id": "cf0ca1fc-a4f7-487b-aea5-cfb23a467919",
      "status": "no_recorded_build_3_evidence_link",
      "evidence_link_id": null,
      "current_revision_digest": null,
      "source_evidence": null
    },
    "concurrent_mutation": {
      "queued": true,
      "derived_digest": "5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"
    }
  }
}
```

The harness also established that:

- service-role canonical revision forgery fails at the column privilege boundary;
- owner-supplied derived values are overwritten by the preparation trigger;
- an allowed service-role Link insert derives the persisted Thought revision;
- service-role update/delete attempts fail for Claim, Link, Referent, and Thought;
- each source-bearing mutation yields mismatch while serializing no changed source payload;
- deleting the Thought yields unavailable while retaining T's Referent, C, and L;
- deletion of C, C's Referent, L's Referent, or T's Referent fails rather than cascading;
- missing, infinite-time, and out-of-domain-time evidence cannot create a Link;
- the source update queues behind the Link trigger's `FOR SHARE` lock; and
- every mutation, disappearance, no-link, forgery, and concurrency fixture rolls back.

PostgreSQL logs contain the corresponding deliberate permission, restrictive-FK, missing-evidence,
finite-time, range, and nonempty-content errors. They are frozen negative-test evidence, not
operational failures.

## Current-state BUILD 0–2 regressions

The post-BUILD 3 regression layer returned:

- BUILD 0 local MCP suite: 6 passed, 0 failed;
- live deployed MCP: stateless initialization passed, exact tool inventory remained
  `capture_thought`, `fetch`, and `search`, and exact-UUID GT01 fetch passed;
- BUILD 1 fixture suite: 5 passed, 0 failed;
- BUILD 1 deterministic trace: PASS; and
- BUILD 2 cross-build regression projection: PASS.

The cross-build harness returned:

```json
{"suite":"build-2-cross-build-regression","result":"PASS","checks":["identity-only-registry-shape","same-uuid-thought-coupling","thought-registration-trigger-preserved","atomic-new-thought-registration","failed-thought-capture-rollback","registered-only-fixture-unrefined","gt01-preserved","referent-least-privilege-not-weakened","exact-uuid-observation-semantics","no-resolver-coreference-or-native-refinement","probe-residue-absent"]}
```

The historical `tests/build-2/harness.ts` remains byte-for-byte unchanged and retains its role as BUILD
2 closure provenance. It is not repurposed as a post-BUILD 3 whole-schema cardinality test.

## Discrepancies

No closed Shape, canonical-state, or regression discrepancy remains.

The first post-installation harness invocation used the reserved word `constraint` as a query alias and
failed during read-only static inspection before adversarial mutations began. The alias was corrected,
the harness was formatted and type-checked, and the complete surface then passed twice with no residue.
This was a local test implementation defect, not a BUILD 3 representation or database discrepancy.

The managed migration wrapper emitted nested transaction warnings described above. Canonical history,
fixtures, schema, and transaction-time equality verify that the bounded activation committed as one
migration.

## Metabolize disposition

`READY_FOR_HUMAN_METABOLIZE_REVIEW`

Observed behavior matches the closed BUILD 3 Shape under the frozen adversarial surface. No reopening
condition was encountered, but this receipt does not declare BUILD 3 metabolized or closed. The exact
next action is explicit human review and closure or a concrete reopening instruction. BUILD 4 remains
unopened and unauthorized.
