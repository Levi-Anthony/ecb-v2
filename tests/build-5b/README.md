STATUS: POSTGRESQL 17 QUALIFICATION IMPLEMENTED; CANONICAL EXECUTION GATED
DISPOSITION: EVIDENCE / PROCEDURE AUTHORITY: Frozen WT07 and BUILD 5B Output
Contract; no independent acceptance authority

# BUILD 5B qualification and execution

The candidate descends from PR #2 (`f47cbad`) and the reviewed Shape
`07fcb9f29c75365c07d36226043d3b17cbc769fd`. The alternative unfinished local
implementation is preserved at `60f510c`; its migration is not adopted here. The
selected migration remains byte-identical to PR #2: SHA-256
`adbcbdf627a7d60e020af74e214c976757b423ac697caefd5d88904082a95b41`.

Run from this directory with Deno and Docker:

```bash
# Read-only prerequisite, before BUILD 5B activation; env file supplies POSTGRES_URL.
deno run --env-file=/absolute/path/to/.env.local --allow-env --allow-net --allow-read --allow-write qualify.ts snapshot
# Creates the fixed loopback-only PG17 container if absent, then rebuilds scratch databases.
bash rehearsal-setup.sh
```

`B5B_EVIDENCE_DIR` selects the evidence directory; default:
`/tmp/ecb5b-qualification-evidence`. Preserve the predecessor snapshot and
qualification evidence outside ephemeral storage before handing work off. After
canonical activation, reuse the retained predecessor snapshot for rehearsals;
the snapshot command deliberately rejects a post-5B database.

The setup owns only container `ecb5b-qualified-pg17` on `127.0.0.1:55438` and
its `rehearsal`, `episode`, and `rehearsal_p19` databases. These databases are
recreated because committed immutable probes cannot be cleaned up in place.
Never copy their Artifact rows to canonical: XID provenance is cluster-local.

| File                  | Responsibility                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `qualify.ts`          | Rebuilds predecessor, checks fidelity, runs baseline and Layer B regressions, WT07, stage recovery, and backend-loss checks; binds results to file hashes. |
| `seed.ts`             | Restores exact accepted predecessor data, including embeddings and historical timestamps, only in disposable PostgreSQL.                                   |
| `runner.ts`           | Exact migration bytes, ledger and schema checks in one transaction; forced rollback before application.                                                    |
| `move.ts`             | Exact seven-Artifact and two-receipt transactions, stage resumption, fresh reconstruction, canonical provenance gates.                                     |
| `verify.ts`           | Read-only exact schema, permissions, inherited bytes, payload hashes, specs, attempts, and receipts.                                                       |
| `harness.ts`          | 39 WT07 findings covering P01–P23; retained P23 controls and observed P17 blocking.                                                                        |
| `layer-b-standing.ts` | Existing standing/history behavior with only the permitted 5B inventory expansion.                                                                         |
| `supplement.ts`       | Actual backend termination, incomplete-attempt recovery, independent hashes, native retrieval.                                                             |
| `fixtures.ts`         | Frozen expected values; not generated from checker results.                                                                                                |

The complete qualification runs on PostgreSQL 17 with pgvector 0.8.2 and
pgcrypto 1.3. It compares all inherited fixture bytes, definitions, constraints,
triggers, permissions, and relevant role attributes to the canonical snapshot.
The historical PG16 rehearsal at `f47cbad` remains evidence of that earlier
candidate; it does not qualify the new runner.

Repairs address test/runner defects: inherited Referents are compared separately
from explicitly permitted new identities; full fixture stages are verified
before commit; P17 observes blocking rather than assuming it after a delay; P23
retains both exact controls; migration ledger identity and resumption are
verified. The resumed packaging also fixes a hardcoded evidence path and
invalidates old PASS evidence when a new qualification starts. No migration,
Shape, or WT07 expectation was changed.

Canonical execution requires a clean committed candidate, the same candidate
remotely anchored on `build/build-5b-pg17-qualification`, and a complete
rehearsal on those exact bytes. With the existing human execution authorization
and gates satisfied:

```bash
deno run --env-file=/absolute/path/to/.env.local --allow-env --allow-net --allow-read --allow-write --allow-run move.ts canonical
```

The runner rechecks predecessor preservation, applies only the selected
migration and ledger atomically, then commits seven exact pre-check Artifacts
and two receipts in separate transactions. Existing exact stages are
reconstructed; partial or mismatched stages stop. It never blindly retries an
uncertain effect. Canonical ends with nine Artifacts and sixteen total
Referents, without probes.

Limits: the local and managed PostgreSQL patch builds differ; major version,
used extension versions, roles and relevant schema are checked. Source
semantics, checker/specification independence, malicious DDL custody, external
trust, automatic eventual completion and BUILD 6 authority are not proven.
Actual backend loss is tested before commit; a lost post-commit network
acknowledgement is not physically induced. Database receipts prove only the
declared obligations. BUILD 5B closure remains a human Metabolize decision.
