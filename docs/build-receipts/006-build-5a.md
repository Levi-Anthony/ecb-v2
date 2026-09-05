STATUS: ACCEPTED AND CLOSED 2026-09-05 AMERICA/PHOENIX
DISPOSITION: EVIDENCE
ROLE: BUILD 5A execution and acceptance receipt
AUTHORITY: Does not amend the Build Contract, closed Shape, apertures, invariants, or acceptance fixture

# BUILD 5A Receipt — Immutable Events + Standing Transition History

## Result

**PASS — the bound BUILD 5A Output Contract is implemented, frozen Worked Trace 04 completed, the D1
acceptance-specification defect is repaired and resolved, and human metabolization closure is
accepted.**

BUILD 5A is closed. This closure does not open or authorize BUILD 5B.

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

### D1 — SHAPE_OR_CONTRACT_DEFECT, ACCEPTANCE_SPECIFICATION_SUBTYPE (RESOLVED)

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

**RESOLVED 2026-09-05 America/Phoenix.** The human dispositioned D1 as a SHAPE_OR_CONTRACT_DEFECT of
the acceptance-specification subtype — a defect in the frozen trace produced during Shape, not in the
K4 architecture, the Output Contract, the installed transition mechanism, the concurrency invariant, or
the canonical substrate — and authorized a minimal repair without reopening architectural Shape.

Frozen challenge 4 now requires that B queues while A holds the lock and that, after A resolves, B is
rejected if A committed away from the prior standing, or may proceed if A rolled back and that standing
remains applied. Challenge 5 remains the explicit stale-prior rejection proof, and no test formulation
may require an additional committed canonical transition merely to prove concurrency. Probe residue
requirements are unchanged.

The BUILD 5A acceptance harness was updated so the repaired requirement is **asserted rather than
merely observed**: it now asserts that B queued, that the prior standing remained applied after A rolled
back, and that B then proceeded on that still-truthful prior. Post-repair verification returned Worked
Trace 04 PASS across all ten checks with `concurrency_queued=true`, and canonical state was confirmed
identical before and after — one Thought, seven Referents, three Claims, one Evidence Link, one
transition, Claim C at `basis_qualified`, Evidence Link L and GT01 unchanged. **No new canonical
mutation was performed for this repair.**

The repair changed no semantic, architectural, enforcement, concurrency, privilege, or implementation
requirement. BUILD 5A's installed substrate was unaffected by the defect and is unaffected by the
repair.

### D2 — TEST_OR_PROBE_DEFECT (corrected)

The concurrency probe captured whether the competing session was rejected but never asserted it — a
vacuous capture of exactly the class FH-04 warns about. Investigating it is what exposed D1. The probe
now asserts the outcome it actually observes and documents the two-part proof.

### D3 — TEST_OR_PROBE_DEFECT (corrected)

`deno lint` reported an unused `sql` parameter on the rejection-probe function, which opens its own
connections. Removed.

Both test defects were corrected before canonical contact by the mandated pre-mutation probe-validation
pass, and the human accepted them as corrected TEST_OR_PROBE_DEFECTS. No implementation or
execution-tooling defect was encountered: the migration applied on its first canonical attempt after a
clean rollback probe.

## Closure provenance

The human accepted the Move evidence, dispositioned and resolved D1, and closed BUILD 5A with:

- implementation commit: `7648b394dc22aff878d5293d3f0c4083e0fb4aeb`;
- implementation root tree: `fb7e982ffbc0e567acc8b1047e5dc666c7214c68`.

Accepted at closure: Worked Trace 04 PASS; BUILD 3+4 Layer B projection PASS; BUILD 2 cross-build PASS;
BUILD 0 and BUILD 1 regression PASS; frozen Layer A authority unchanged; no unauthorized BUILD 5B+
surface; no Claims UPDATE grant; Evidence Link L preserved; Claim C2 and relation Claim R unchanged and
non-propagating; historical basis and observed revision distinguishable; no probe residue.

## Metabolize disposition

`METABOLIZED_AND_CLOSED`

Observed behavior matches the closed BUILD 5A Shape under the repaired frozen adversarial surface, and
the human accepted that evidence and closed BUILD 5A. No BUILD 0–4 reopening condition was encountered
and no discrepancy remains open.

Closure is bounded. It accepts the installed substrate and its execution evidence only. It confers no
standing on Claim C's proposition beyond the recorded `basis_qualified` qualification against its
declared basis, promotes no aperture, does not promote E07, and does not authorize BUILD 5B.
`depends_on` continues to propagate nothing, and `revalidation_required` continues to assert neither
falsity, lack of support, supersession, nor loss of currentness.

BUILD 5B remains unopened and unauthorized and must close before BUILD 6 may open. The next permitted
operation is a bounded BUILD 5B Sense under its own checkout and governance.
