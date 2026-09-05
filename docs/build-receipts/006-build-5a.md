STATUS: MOVE COMPLETE; VERIFICATION PASSED; HUMAN METABOLIZE CLOSURE REQUIRED
DISPOSITION: EVIDENCE
ROLE: BUILD 5A execution and acceptance receipt
AUTHORITY: Does not amend the Build Contract, closed Shape, apertures, invariants, or acceptance fixture

# BUILD 5A Receipt — Immutable Events + Standing Transition History

## Result

**PASS — the bound BUILD 5A Output Contract is implemented and frozen Worked Trace 04 completed, with
one recorded SHAPE_OR_CONTRACT_DEFECT in the frozen trace text requiring human disposition.**

This is Move evidence, not Metabolize closure. BUILD 5A remains on the human rail, and BUILD 5B is not
opened or authorized.

**This execution receipt is implementation evidence. It is not the BUILD 5B Transformation Receipt and
carries no E07 independent-validator semantics.** The migration and the harness were produced by the
same agent, and no independent validator checked the declared obligations. That question belongs to
BUILD 5B.

## Release provenance

The human explicitly released Move from the closed Shape anchor:

- Shape commit: `4502f1eebb560e244ab1ee9cebf953f1ebd87a27`;
- Shape root tree: `dbff47fe458ac4fdac6a52dd8705ced7bc74bab0`.

## Entry gate

All nine gate steps passed before any mutation:

- `HEAD`, local `main`, and `origin/main` all equalled the Shape commit, and the root tree matched;
- both worktrees were clean;
- canonical predecessor state was re-verified read-only with no drift: four tables, four functions, no
  view, one Thought, six Referents, three Claims, one Evidence Link, the five-migration ledger, Claim C
  at `ecb_inference`/`unassessed`, Evidence Link L at the frozen anchor, GT01 intact;
- no BUILD 0–4 reopening condition was present;
- the eight frozen historical artifacts were byte-identical to the Shape commit;
- Layer A baseline passed: BUILD 0 6/6; BUILD 1 5/5 with deterministic trace PASS; BUILD 2 cross-build
  PASS; BUILD 3 cross-build PASS; BUILD 4 PASS;
- probe validation ran before canonical contact: `deno fmt`, `deno lint`, and `deno check` on both new
  harnesses, fixture-ID integrity, non-vacuous assertions, predecessor-schema assumptions, and
  negative-probe semantics; and
- the migration and its bounded verification block passed a full rollback probe, after which canonical
  state was confirmed unchanged.

## Migration identity and execution method

- canonical project: Supabase `ecb-v2-brain` (`vezxivrvhakclxuvxzso`);
- migration: `20260905022247_build_5a_standing_transition_history`;
- checked-in artifact: `sql/migrations/20260905022247_build_5a_standing_transition_history.sql`;
- artifact blob: `a2362daad01cb6748d536270c2d326ba039b259f`.

**Execution mechanism, selected explicitly rather than inherited.** Required properties were stated
first: all-or-nothing activation of schema, functions, trigger, constraint replacement and TR1;
applied bytes provably identical to the committed artifact; and a canonical ledger record.

Direct execution of the file's exact bytes over a single PostgreSQL connection was selected, relying on
the file's own `BEGIN`/`COMMIT` with no outer wrapper. The managed runner was rejected because it
imposes an outer transaction around a migration that already carries its own, which is what produced
BUILD 3's nested-transaction warnings. This satisfies atomicity and provenance.

The ledger row was written as a separate statement after the activation committed, because embedding a
ledger write inside the migration would depart from the bound Output Contract, which enumerates exactly
what the migration may do. The contract boundary forces the split. The residual gap is that a ledger row
could in principle be missing if that second statement failed; it was verified immediately and the
ledger now reads six migrations in order, ending with
`20260905022247 build_5a_standing_transition_history`.

## Canonical state after Move

```text
tables     claim_standing_transitions, claims, evidence_links, referents, thoughts
functions  prepare_claim, prepare_claim_standing_transition, prepare_evidence_link,
           register_thought_referent, search_thoughts, thought_revision_digest
views      0        indexes added: none        RLS: enabled, zero policies on all
counts     1 Thought | 7 Referents | 3 Claims | 1 Evidence Link | 1 standing transition
Claim C    ecb_inference / basis_qualified
Link L     5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55 (unchanged)
GT01       unchanged
```

Transition TR1 is installed as:

```text
id=a6925494-a862-441b-a361-5f5ec41dc9dc
claim_id=0f89e778-b16e-4840-9129-a2aa3eb6f697
from_standing=unassessed  to_standing=basis_qualified
basis_evidence_link_id=4c6c0f50-a936-4da6-bb09-233f93320639
observed_revision_digest=5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55
recorded_at=2026-09-05 02:24:35.793609+00
```

No Artifact, transformation receipt, currentness column, temporal-validity column, second predicate,
third claim kind, additional standing value, view, resolver, RPC, index, MCP tool, runtime change,
deployment change, or BUILD 5B+ surface appeared.

## Worked Trace 04

```json
{
  "suite": "build-5a-standing-transition-history",
  "result": "PASS",
  "checks": [
    "bounded-build-5a-expansion",
    "canonical-qualification-baseline",
    "independent-revision-encoding-agreement",
    "transition-and-history-cannot-diverge",
    "stale-prior-no-op-forgery-and-immutability-rejected",
    "competing-transitions-serialized-and-rejected",
    "drift-yields-revalidation-with-anchor-preserved",
    "evidence-link-not-mutated-and-not-stale",
    "no-propagation-to-c2-or-relation-r",
    "probe-residue-absent"
  ]
}
```

The reconstructed drift history was:

```text
unassessed -> basis_qualified   basis 5edc4782…d99a55  observed 5edc4782…d99a55  basis_match=true
basis_qualified -> revalidation_required
                                basis 5edc4782…d99a55  observed 5ce23dfa…c26c53  basis_match=false
status=standing_history_reconstructed   applied_standing=revalidation_required
```

The harness also established that: the database-derived revision agrees with an independent
reimplementation of `ecb_thought_revision_v1_sha256`; a transition to a standing the Claim constraint
rejects leaves neither history row nor Referent; a rolled-back transition leaves no applied standing
change; stale declared prior standing, no-op transitions, a basis Evidence Link belonging to another
Claim, caller-supplied derived revision or recorded time, and update or delete of history or of the
Claim are each rejected; a competing transition queues on the Claim row lock; Evidence Link L is
unmutated and not treated as stale; Claim C2 and relation Claim R are byte-identical across every
transition and acquire no transitions of their own; and every probe rolled back leaving GT01 and Claim
C's applied standing at their canonical values.

## Layer A and Layer B regression

**Layer A — historical acceptance, unchanged and not re-run as gates.** `tests/build-2/harness.ts`,
`tests/build-3/harness.ts`, `tests/build-4/harness.ts`, `tests/build-2-cross-build/harness.ts`, and
`tests/build-3-cross-build/harness.ts` remain byte-frozen provenance of their own Build Units.

**Layer B — current-state regression after Move:**

- BUILD 0 local MCP suite: 6 passed, 0 failed;
- BUILD 1 fixture suite: 5 passed, 0 failed; deterministic trace PASS, byte-identical;
- BUILD 2 cross-build regression: PASS;
- BUILD 3 + BUILD 4 cross-build regression: PASS across fifteen checks, reproducing all four Worked
  Trace 03 outcomes.

## Discrepancies

### D1 — SHAPE_OR_CONTRACT_DEFECT (open; requires human disposition)

**Frozen Worked Trace 04 challenge 4 is unsatisfiable as written.** It requires that session B "must
queue on the Claim row lock and then be rejected because its declared prior standing no longer matches"
while also requiring that "both roll back; neither may remain."

Those cannot both hold. If session A rolls back, B's declared prior standing is again truthful and B
legitimately succeeds rather than being rejected. If B is rejected because the prior standing changed,
then A must have committed and cannot also roll back — and A's committed transition would be a second
canonical transition, which the Output Contract does not authorize.

This reaches the Shape and contract layer, so it is not classified as a probe defect. It was **not
worked around silently.** The implementation proves the underlying falsifier in two parts, recorded in
the harness itself: competing transitions are serialized by the Claim row lock, observed directly
through `pg_blocking_pids`; and a transition whose declared prior standing does not match applied
standing is rejected by the identical mechanism. Together these establish that two transitions
declaring the same prior standing cannot both commit as independently valid.

**Proposed minimum correction, for human disposition at Metabolize:** amend challenge 4 to require that
B queues on the lock and that, after A's outcome is known, B either commits with a still-truthful prior
standing or is rejected with a stale one — with challenge 5 retained as the rejection proof. No
substantive requirement changes; only the internally contradictory conjunction is repaired.

BUILD 5A's installed substrate is unaffected by this defect.

### D2 — TEST_OR_PROBE_DEFECT (corrected)

The concurrency probe captured whether the competing session was rejected but never asserted it — a
vacuous capture of exactly the class FH-04 warns about. Investigating it is what exposed D1. The probe
now asserts the outcome it actually observes and documents the two-part proof.

### D3 — TEST_OR_PROBE_DEFECT (corrected)

`deno lint` reported an unused `sql` parameter on the rejection-probe function, which opens its own
connections. Removed.

Both test defects were corrected before canonical contact by the mandated pre-mutation probe-validation
pass. No implementation or execution-tooling defect was encountered: the migration applied on its first
canonical attempt after a clean rollback probe.

## Metabolize disposition

`READY_FOR_HUMAN_METABOLIZE_REVIEW`

Observed behavior matches the closed BUILD 5A Shape under the frozen adversarial surface, except for the
recorded D1 defect in the frozen trace text, which requires human disposition. No BUILD 0–4 reopening
condition was encountered.

BUILD 5A is not declared accepted or closed. BUILD 5B remains unopened and unauthorized, E07 remains
candidate evidence routed to BUILD 5B, and `depends_on` continues to propagate nothing.
