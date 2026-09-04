STATUS: ACCEPTED AND CLOSED 2026-09-04 AMERICA/PHOENIX
DISPOSITION: EVIDENCE
ROLE: BUILD 4 execution and acceptance receipt
AUTHORITY: Does not amend the Build Contract, closed Shape, apertures, invariants, or acceptance fixture

# BUILD 4 Receipt — Typed Relation Claims

## Result

**PASS — the bound BUILD 4 Output Contract is implemented, frozen Worked Trace 06 completed, and human
metabolization closure is accepted.**

BUILD 4 is closed. This closure does not open or authorize BUILD 5.

## Release provenance

The human explicitly released Move from the closed Shape anchor:

- Shape commit: `33bf6fe7924bf476edf75802de193d23ca309c00`;
- Shape root tree: `6bbed2931de2c3620068060d3b45a6715e933f10`.

Before consequential implementation, `HEAD`, `origin/main`, and this worktree all equalled that commit,
the root tree matched, the main worktree was clean, and `git diff --check` passed.

The Layer A historical baseline also passed before installation:

- BUILD 0 local MCP suite: 6 passed, 0 failed;
- BUILD 1 fixture suite: 5 passed, 0 failed;
- BUILD 1 deterministic trace: PASS;
- historical BUILD 3 closure harness: PASS against the pre-BUILD 4 baseline; and
- BUILD 2 cross-build regression: PASS.

No BUILD 0–3 reopening condition and no canonical substrate drift were present.

## Closure provenance

The human reviewed the Move evidence, accepted it at Metabolize, and closed BUILD 4 with:

- implementation commit: `d11401297e69af0f2e9e18aa55da41af4e8b5f31`;
- implementation root tree: `13beae75500e8b76b1280e7a16ef460b1078fe85`.

Closure verification on 2026-09-04 America/Phoenix confirmed that `HEAD`, local `main`, and
`origin/main` all equalled the implementation commit, that both worktrees were clean, and that the
canonical substrate still matched this receipt exactly: four public tables, four public functions, no
view, one Thought, six Referents, three Claims, one Evidence Link, the five-migration ledger, Claim C at
`ecb_inference`/`unassessed`, Evidence Link L at the frozen GT01 digest, and GT01 intact. That
verification was read-only; the adversarial harnesses were not re-run, because they had passed minutes
earlier against this exact commit and their probes mutate transactionally.

## Installed migration

- canonical project: Supabase `ecb-v2-brain` (`vezxivrvhakclxuvxzso`);
- PostgreSQL: 17.6, UTF-8;
- migration: `20260904215929_build_4_typed_relation_claims`;
- checked-in artifact: `sql/migrations/20260904215929_build_4_typed_relation_claims.sql`;
- artifact blob: `0c7182d07fbe249217352959862b6907dd4672bb`.

Before installation the exact file body passed once with the trailing `COMMIT` replaced by `ROLLBACK`,
and inspection confirmed that no BUILD 4 column, constraint, Claim, or Referent survived that probe.

The migration was applied by executing the checked-in file byte-for-byte over a direct PostgreSQL
connection, so what was applied is provably identical to the committed artifact. The file carries its
own explicit atomic transaction. Its migration-history row was recorded immediately afterwards, so the
canonical migration ledger order is now:

1. `20260903235721_build_0_atomic_thoughts`;
2. `20260904000010_build_0_least_privilege`;
3. `20260904093341_build_2_universal_referents`;
4. `20260904163938_build_3_claims_evidence_links`;
5. `20260904215929_build_4_typed_relation_claims`.

This differs from BUILD 3, which was applied through the managed migration runner and therefore logged
nested-transaction warnings. The direct application avoided an outer wrapping transaction.

**Recorded execution-method deviation, accepted at Metabolize.** Schema activation was atomic under the
migration's own explicit transaction. The migration-ledger write occurred immediately afterwards as a
separate statement and was therefore not part of that transaction. The human reviewed and accepted this
deviation at closure; it did not block closure. A future build that requires ledger and activation to
commit together must select that mechanism explicitly rather than inheriting this one by precedent.

## Canonical state

Independent post-installation inspection established:

- public tables are exactly `claims`, `evidence_links`, `referents`, and `thoughts` — **no new table**;
- public functions are exactly `prepare_claim`, `prepare_evidence_link`, `register_thought_referent`,
  and `search_thoughts` — **no new function**;
- no public view, resolver, RPC, index, Event, Artifact, or BUILD 5+ object appeared;
- canonical counts are one Thought, six Referents, three Claims, and one Evidence Link;
- `public.referents` remains exactly `id + registered_at`;
- GT01 retains its exact BUILD 0 UUID, content, source, and capture instant;
- Claim C2 and relation Claim R each have a same-UUID Referent; and
- all rollback-only probe Claims, Evidence Links, and Referents are absent.

`public.claims` now carries exactly ten columns:

```text
id, proposition, scope, claim_kind, origin, epistemic_standing, asserted_at,
subject_referent_id, predicate, object_referent_id
```

Claim C2 is installed as:

```text
id=c7f7d330-e778-4ae5-be96-3a172bea1166
proposition=The described scene contains at least two distinct objects.
scope=worked_trace_06:gt01_interpretation_dependency
claim_kind=assertion
origin=ecb_inference
epistemic_standing=unassessed
asserted_at=2026-09-04 22:02:41.679741+00
```

Relation Claim R is installed as:

```text
id=cb429206-5abd-4adb-8ff9-d6d6a885034c
proposition=null
scope=worked_trace_06:claim_dependency
claim_kind=relation
origin=ecb_inference
epistemic_standing=unassessed
asserted_at=2026-09-04 22:02:41.679741+00
subject_referent_id=c7f7d330-e778-4ae5-be96-3a172bea1166
predicate=depends_on
object_referent_id=0f89e778-b16e-4840-9129-a2aa3eb6f697
```

Both fixtures share one activation transaction time.

## Structural and authorization verification

- The Claim constraint surface is exactly `claims_depends_on_not_self`, `claims_kind_exclusive_shape`,
  `claims_kind_vocabulary`, `claims_object_referent_fkey`, `claims_origin_ecb_inference`,
  `claims_predicate_vocabulary`, `claims_referent_fkey`, `claims_scope_nonempty`,
  `claims_standing_unassessed`, and `claims_subject_referent_fkey`.
- All three Claim foreign keys are immediate, non-deferrable, and restrictive, and all target
  `public.referents`. No Claim endpoint references `claims` or `thoughts`, so native-binding loss cannot
  erase a relation Claim.
- No uniqueness rule exists over the endpoint/predicate triple.
- `claim_kind` admits exactly `assertion` and `relation`; `predicate` admits exactly `depends_on`; the
  self-relation prohibition is scoped to `depends_on`.
- `prepare_claim` remains `SECURITY INVOKER` with empty `search_path`, schema-qualified, non-callable by
  `PUBLIC`, `anon`, `authenticated`, or `service_role`. It no longer overwrites `claim_kind`, retains
  database ownership of `origin`, `epistemic_standing`, and `asserted_at`, and takes no row lock.
- `service_role` may insert only `id`, `proposition`, `scope`, `claim_kind`, `subject_referent_id`,
  `predicate`, and `object_referent_id`; it cannot supply `origin`, `epistemic_standing`, or
  `asserted_at`, and has no table-level insert, update, or delete.
- Both BUILD 3 tables retain RLS enabled with no policies; `PUBLIC`, `anon`, and `authenticated` have
  no access.
- No column capable of expressing confidence, support counts, classifier identity, rationale, decay,
  validity intervals, currentness, supersession, status, or update time exists on `public.claims`.

## Worked Trace 06

The committed direct-database harness returned:

```json
{
  "suite": "build-4-typed-relation-claims",
  "result": "PASS",
  "checks": [
    "bounded-build-4-expansion",
    "relation-claim-baseline",
    "direction-structural-not-conventional",
    "relation-distinguishable-from-evidence-link",
    "no-support-currentness-or-standing-change",
    "repeated-triples-remain-distinct-claims",
    "endpoint-referent-addressing-and-native-binding-loss",
    "predicate-scoped-self-relation-prohibition",
    "caller-forgery-and-kind-exclusive-shape",
    "no-co-reference-or-model-authority",
    "probe-residue-absent"
  ]
}
```

Observed statuses:

```text
baseline              R  -> relation_claim_recorded         (both endpoints natively bound)
reversal probe        RR -> relation_claim_recorded         (subject C, object C2; distinct Claim)
unbound endpoint      RU -> relation_claim_endpoint_unbound (object 2eede0e4…, native binding false)
native binding lost   R  -> relation_claim_endpoint_unbound (subject binding false after C2 deletion)
dependent assertion   C2 -> not_a_relation_claim
```

The harness also established that:

- endpoint reversal persists as a different Claim and never collapses into `R`, while the canonical
  direction remains singular;
- an Evidence Link attached to relation Claim `R` derives the frozen GT01 digest and leaves `R` a
  relation Claim, so reuse does not collapse relation into evidence;
- asserting the dependency left both endpoint Claims unchanged, including standing and assertion time;
- a second assertion of the identical triple produced two distinct relation Claims;
- deleting the native `claims` row for `C2` left `R` and both endpoint Referents intact;
- deleting any endpoint Referent, or Claim `C` while dependent rows exist, fails rather than cascading;
- a `depends_on` self-relation is rejected by `claims_depends_on_not_self`;
- service-role attempts to supply `origin`, `epistemic_standing`, or `asserted_at` fail at the column
  privilege boundary, and update or delete attempts fail;
- a relation Claim with prose, an assertion Claim with endpoints, a partial relation, a blank or null
  assertion proposition, a foreign predicate, a third claim kind, and an unregistered endpoint each
  fail; and
- every probe rolled back with no canonical residue.

PostgreSQL logs contain the corresponding deliberate permission, check-violation, and
restrictive-foreign-key errors. They are frozen negative-test evidence, not operational failures.

## Current-state BUILD 0–3 regressions

The post-BUILD 4 regression layer returned:

- BUILD 0 local MCP suite: 6 passed, 0 failed;
- BUILD 1 fixture suite: 5 passed, 0 failed;
- BUILD 1 deterministic trace: PASS, regenerating byte-identical traces;
- BUILD 2 cross-build regression: PASS; and
- BUILD 3 cross-build regression: PASS.

The BUILD 3 cross-build harness returned:

```json
{
  "suite": "build-3-cross-build-regression",
  "result": "PASS",
  "checks": [
    "same-uuid-claim-and-link-coupling",
    "restrictive-non-cascading-link-foreign-keys",
    "evidence-link-independent-of-thought-retention",
    "definer-trigger-and-for-share-lock-preserved",
    "least-privilege-not-weakened",
    "no-uniqueness-collapsing-repeated-evidence-use",
    "claim-c-preserved",
    "evidence-link-l-preserved",
    "independent-digest-still-reproducible",
    "accepted-assertion-behavior-preserved",
    "all-four-worked-trace-03-outcomes-producible",
    "probe-residue-absent"
  ],
  "outcomes": [
    "linked_revision_match",
    "linked_revision_mismatch",
    "linked_evidence_unavailable",
    "no_recorded_build_3_evidence_link"
  ]
}
```

All four frozen Worked Trace 03 outcomes remain producible in the expanded substrate, the GT01 digest
remains independently reproducible, and a BUILD 3-shaped `(id, proposition, scope)` insert still
produces an identical accepted assertion Claim through the new `claim_kind` default.

`tests/build-3/harness.ts` and `tests/build-2/harness.ts` remain byte-for-byte unchanged and retain
their role as BUILD 3 and BUILD 2 closure provenance. Neither is repurposed as a post-BUILD 4
whole-schema harness.

## Discrepancies

No closed Shape, canonical-state, or regression discrepancy remains. Four harmless implementation and
test defects were found and corrected during Move:

1. **Migration verification list incomplete.** The first rollback probe aborted because the pre-commit
   constraint assertion omitted `claims_origin_ecb_inference`, `claims_scope_nonempty`, and
   `claims_standing_unassessed` — three BUILD 3 constraints that correctly survive under the frozen
   Shape. The migration body was correct; the assertion list was wrong. Corrected, then the probe
   passed. **The rollback probe did its job: this defect would otherwise have aborted the real
   activation.**
2. **Vacuous harness assertion.** An endpoint check was written as `(A && B) || true`, which can never
   fail, and referenced a field absent from the observation type. Replaced with a real query asserting
   both endpoint Claims retain assertion shape.
3. **Over-specified constraint expectation.** A third-claim-kind probe pinned
   `claims_kind_vocabulary`, but such a row violates both that constraint and
   `claims_kind_exclusive_shape`, and PostgreSQL reports whichever it evaluates first. The rejection is
   the frozen behavior; the constraint name is not. Relaxed, with the reason recorded in the harness.
4. **Unregistered-endpoint probe self-defeating.** The probe reused one UUID as both the Claim id and
   the supposedly unregistered endpoint, so `prepare_claim` registered it before the foreign key was
   checked and the insert succeeded. Replaced with a distinct never-registered UUID; the probe then
   correctly failed with `23503`.

Defects 2 through 4 were local test-implementation defects. None indicates a BUILD 4 representation or
database discrepancy, and none required changing the frozen Shape or Output Contract.

The human reviewed all four at Metabolize and dispositioned them as probe and test defects rather than
Shape or Output Contract defects. Their correction does not justify reopening architecture.

## Metabolize disposition

`METABOLIZED_AND_CLOSED`

Observed behavior matches the closed BUILD 4 Shape under the frozen adversarial surface, and the human
accepted that evidence and closed BUILD 4. No reopening condition was encountered.

Closure is bounded. It accepts the installed substrate and its execution evidence only. It confers no
standing on Claim C2's proposition or on the asserted dependency, promotes no aperture, and does not
authorize BUILD 5. `depends_on` remains a persisted unassessed relation assertion that operationalizes
nothing: it propagates no standing, support, truth, currentness, or authorization, and mutates no
endpoint.

The two-layer regression boundary is preserved. The frozen BUILD 2 and BUILD 3 harnesses remain
historical Layer A authority, and BUILD 4's Layer B regression independently reproduced the inherited
outcomes without modifying them. Narrowed AP-01 and AP-07 remainders, and preserved AP-02 and AP-03,
stay open on their recorded terms. The next permitted operation is a bounded BUILD 5 Sense under its own
checkout and governance.
