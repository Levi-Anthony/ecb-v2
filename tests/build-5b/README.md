STATUS: REHEARSAL COMPLETE ON POSTGRESQL 16; CANONICAL CONTACT NOT MADE
DISPOSITION: EVIDENCE
ROLE: BUILD 5B disposable rehearsal harness and its observed results
AUTHORITY: None. This is a pre-canonical rehearsal, not a WT07 execution receipt and not a BUILD 5B closure.

# BUILD 5B rehearsal — Worked Trace 07 on a disposable database

[Worked Trace 07](../../docs/acceptance/build-5b-wt07.md) requires a disposable PostgreSQL database
for the commit-dependent, crash, savepoint and concurrency cases, because BUILD 5B's mechanism turns
on a *committed* attempt marker and those probes cannot be rolled back or cleaned up afterwards. The
Artifact table is immutable by construction, so a rehearsal cannot tidy after itself and must not
try. Every run starts from a new database.

Nothing here contacts canonical state.

## Running it

```bash
./rehearsal-setup.sh                       # rebuilds the disposable database end to end
export REHEARSAL_DATABASE_URL=...          # superuser, disposable database
export REHEARSAL_SERVICE_URL=...           # service_role, disposable database
export REHEARSAL_ADMIN_URL=...             # superuser, maintenance database (for P19's copy)
export REHEARSAL_P19_URL=...               # superuser, rehearsal_p19
deno task check
deno run --allow-env --allow-net --allow-read harness.ts
```

| File | Role |
|---|---|
| `rehearsal-setup.sh` | Rebuilds the predecessor and applies BUILD 5B through the bound runner. |
| `runner.ts` | The migration mechanism: one outer transaction, exact file bytes, parameterized ledger write, rollback probe. |
| `fixtures.ts` | The frozen WT07 values. They judge recovered content; they never supply it. |
| `harness.ts` | The producer, the WT07 stages, P01–P23, fresh-context reconstruction and Layer B. |

## Observed result — 2026-09-06

**39 of 39 checks passed** on a freshly rebuilt database. Every challenge is reported explicitly;
no assertion is vacuous and no captured boolean goes unchecked.

Migration mechanism, proved before application:

| Property | Evidence |
|---|---|
| all-or-nothing activation | full path run and forced to roll back; zero residue in table, functions and ledger |
| applied bytes identical to the artifact | `20260906014257_build_5b_versioned_artifacts.sql`, 26656 bytes, SHA-256 `adbcbdf627a7d60e020af74e214c976757b423ac697caefd5d88904082a95b41` |
| no nested transaction | the runner refuses a file carrying its own `BEGIN`/`COMMIT` |

Canonical WT07 receipts, derived by the database:

| Receipt | Result | Components |
|---|---|---|
| RC1 `6d0b744b` | `PASS` | all six true |
| RC2 `1217d889` | `FAIL` | `output_format` false, `grounding` true, `preservation` null/`not_evaluated`, `producer_succeeded` still true |

Installed checker definition digest observed at receipt time:
`310aa83181ea186b1dc5ea1ea377c99a12a09ee1d527552bb8b07c676f0f0912`.

OP1 and OP2 carry distinct identities and the same derived specification digest
`c7f66a66fab4350147d3d9f1192e42c811b35f2799ede94cbef5dd8477d7d774`, which is the intended reading of
branching: two operations over one input, with no successor or currentness implication.

P23, the proof-sensitivity control the hardening delta added, discriminates through the identical
installed checker: the unchanged A2 control returns all six true and `PASS`, and the single mutation
of `basis.observed_digest` to sixty-four zeros returns `preservation` false with the other five true
and result `FAIL`. Both ran under the same observed checker definition digest. No malformed-format
rejection or grounding failure substituted for detecting the preservation violation.

## Defects found and classified

**D-R1 — TEST_OR_PROBE_DEFECT (corrected).** The first run reported RC1w and S5 as failures. The
implementation was correct; the harness compared receipt source witnesses by `JSON.stringify`, and
receipt payloads are serialized as PostgreSQL `jsonb`, which does not preserve key order. Field-wise
comparison replaced string equality. No implementation, Shape or contract change followed, and the
observed component outcomes were identical before and after the repair.

No implementation defect and no Shape or contract defect was found in this rehearsal.

## Declared limitations — read before treating any of this as Move evidence

1. **Engine version delta.** The canonical predecessor `ecb-v2-brain` runs PostgreSQL 17.6.1.166.
   This rehearsal ran on **PostgreSQL 16.13**, the only server obtainable in the execution
   environment; the PostgreSQL global development repository is refused by the environment's network
   policy and Ubuntu 24.04 ships no PostgreSQL 17 package. The Output Contract asks for the
   predecessor's major version and, where it is unavailable, for tooling to be resolved before
   canonical state is touched. The human released the Move with this delta explicitly accepted and
   the rehearsal bounded to PostgreSQL 16. `xid8` and `pg_current_xact_id()` have existed since
   PostgreSQL 13 and savepoint semantics are stable across 16 and 17, so the delta is expected to be
   immaterial — but that expectation is **unmeasured here**, and P14, P15, P16 and P17 are exactly
   the cases that depend on it. Their PostgreSQL 17 behaviour remains unobserved.

2. **Baseline construction.** The BUILD 0–5A migrations derive their fixture timestamps from their own
   transaction clock and hard-code the canonical values in their drift checks, so replaying them at a
   different wall-clock time cannot reproduce the bytes WT07's frozen A1 encodes. Three time-derived
   predecessor values were therefore set explicitly from canonical facts read read-only from
   `ecb-v2-brain`: Claim C and C2/R `asserted_at`, L `linked_at`, and TR1 `recorded_at`. Every other
   predecessor fact is produced by the migrations themselves. With that alignment the rehearsal
   predecessor matches canonical exactly on tables, views, functions, and all fixture counts, and
   GT01's revision digest recomputes to the frozen `5edc4782…`. The alignment is rehearsal
   scaffolding; canonical needs none of it.

3. **Synthetic embedding.** GT01's 384-dimension embedding is a deterministic local vector, not the
   canonical one. The revision digest scheme excludes the embedding, so no checked value depends on
   it; only similarity ranking would, and no BUILD 5B obligation reads it.

4. **Probe residue is expected here and forbidden canonically.** This database ends with 146
   Artifacts. Canonical must contain exactly the nine reserved fixtures. The scratch database is
   discarded; nothing in it is portable to canonical.

5. **What a rehearsal pass does not establish.** It does not accept BUILD 5B, does not open BUILD 6,
   and does not certify database correctness, specification completeness, or independence from a
   defect shared by the specification, checker and acceptance oracle. A database owner who rewrites
   the checker and its evidence can falsify any self-hosted receipt; BUILD 5B claims no external
   trust root. The canonical WT07 pass has not been observed, because canonical contact has not
   been made.
