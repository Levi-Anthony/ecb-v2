STATUS: ACCEPTED AND CLOSED 2026-09-04 AMERICA/PHOENIX
DISPOSITION: EVIDENCE
ROLE: BUILD 1 execution receipt
AUTHORITY: Does not amend the Build Contract, invariants, accepted BUILD 0 receipt, or later Build boundaries

# BUILD 1 Receipt — Harvest Fixture Path

## Result

**PASS — both required qualification paths produced the frozen observable outcomes.**

Fixture: [`build-0-ob1-qualification-seam`](../../harvest/build-1/build-0-ob1-qualification-seam/README.md)

Harvest disposition: **REBUILD**

## Freedom — independent derivation

A fresh ephemeral Codex process ran in a read-only detached worktree at `8568a00`. Its prompt restricted reading to the historical `START_HERE.md`, `BUILD_CHECKOUT.md`, invariants, Build Contract, and acceptance tests; it prohibited browsing, git-history inspection, prior-art search, mutation, acceptance, and installation.

Without canonical OB1 preloaded, the process produced [`independent-candidate.json`](../../harvest/build-1/build-0-ob1-qualification-seam/independent-candidate.json). It independently derived one canonical store, atomic capture, semantic retrieval, durable identity, a thin MCP surface, cross-context verification, and explicit failure behavior. The artifact records `prior_art_seen = false` and false values for accepted, installed, governing, and current.

The candidate also exposed why qualification matters. It proposed different MCP names, left the database engine open, omitted `embedding_model` from its explicit row shape, allowed an auxiliary index, broadened capture provenance, and used “no referent” language alongside durable UUID identity.

## Control — missing encounter

The harness evaluated the independent candidate without a comparison artifact.

Observed trace: [`missing-qualification.json`](../../harvest/build-1/build-0-ob1-qualification-seam/traces/missing-qualification.json)

- `prior_art_qualification = unfinished`;
- `this_requirement_satisfied = false`;
- `overall_installation_qualified = false`;
- `installation_seam_crossed = false`;
- accepted, promoted, installed, authority, governing, and current remain false.

The omission is therefore observable and cannot silently become installed/current state in this fixture.

## Control — completed encounter

A second fresh ephemeral Codex process ran in a read-only detached worktree at `d0f869a`. Its read boundary was the independent candidate, `d0f869a:docs/ob1-prior-art.md`, and `d0f869a:BUILD_CHECKOUT.md`. The comparison used canonical OB1 pinned at `9543c29a3e44a210ce278392b9fac11248997461`.

The preserved [`completed-comparison.json`](../../harvest/build-1/build-0-ob1-qualification-seam/completed-comparison.json) records:

- 5 independently derived findings;
- 14 behaviors already present in prior art;
- 9 explicit conflicts/differences, each with candidate position, prior-art position, decision consequence, and disposition; and
- the exact repository, commit, and local recon receipt.

Observed trace: [`completed-qualification.json`](../../harvest/build-1/build-0-ob1-qualification-seam/traces/completed-qualification.json)

- this fixture's prior-art qualification requirement is complete;
- overall installation qualification remains false;
- the installation seam remains uncrossed; and
- acceptance, promotion, installation, authority, governing designation, and currentness remain false.

The comparison's listed open conflicts are frozen historical output from checkout `d0f869a`. Later BUILD 0 decisions and its accepted receipt supersede those historical gate states; BUILD 1 does not reopen them.

## Awareness — omission and drift

The missing-encounter trace reports `required_encounter_omitted`, assigns the feedback phase `metabolize`, and routes to `control_before_next_authority_bearing_installation`.

The harness also replaced the canonical OB1 commit with a false pin. The resulting [`drifted-qualification.json`](../../harvest/build-1/build-0-ob1-qualification-seam/traces/drifted-qualification.json) reports `qualification_basis_drift`, leaves qualification unfinished, and uses the same Metabolize-to-Control route.

Awareness is exercised only for omission or qualification-basis drift. The fixture creates no universal pre-action gate.

## Identity clarification

The fixture asserts:

`persisted thought + durable UUID ⇒ stable referential addressability`

It separately asserts that this does not implement Universal Referents or imply promotion, assertion, standing, authority, governing designation, or currentness. The candidate's “no referent” wording is therefore not allowed to place durable thought UUIDs outside referential identity.

## Executable evidence

Commands run from the fixture directory:

```sh
deno task test
deno task trace
```

Result:

- 5 tests passed;
- 0 tests failed;
- deterministic trace generation returned `PASS`;
- missing encounter → unfinished;
- completed encounter → complete for this requirement only;
- drifted pin → unfinished;
- installation seam crossed → false;
- standing conferred → false; and
- BUILD 2 opened → false.

Execution summary: [`execution-summary.json`](../../harvest/build-1/build-0-ob1-qualification-seam/traces/execution-summary.json)

Closure verification on 2026-09-04 America/Phoenix reran the BUILD 0 MCP regression suite (6 passed, 0 failed), the BUILD 1 fixture suite (5 passed, 0 failed), and deterministic trace generation (`PASS`).

## Source integrity

All declared local Git object pins resolved to the recorded blobs. The public canonical OB1 commit resolved at the recorded repository. The generated candidate and comparison artifacts match the SHA-256 digests frozen in `fixture.json`.

The neighboring ECB v1 working tree was not mutated. Its selected evidence was read from pinned Git objects, not from current uncommitted files.

## Hard drift check

- BUILD 0 remains accepted and closed.
- BUILD 1 is accepted and closed at metabolization.
- BUILD 2 remains unopened.
- No Universal Referent persistence or general self-installation kernel was created.
- No production runtime, database/schema, migration, MCP surface, deployment, governance primitive, SSMM architecture, Master-Key runtime machinery, or action envelope changed.
- Freedom remains generative.
- Control owns the fixture's qualification seam.
- Awareness exposes omission and pin drift through Metabolize feedback.
- Exactly one fixture and one `REBUILD` disposition were created.

## Metabolization and closure

The human accepted the BUILD 1 PASS evidence for metabolization closure on 2026-09-04 America/Phoenix. BUILD 1 is closed.

The closure preserves the single `REBUILD` disposition, fixture, generated artifacts, qualification traces, source pins, and non-installation standing exactly as reviewed. No reopening condition was observed.

BUILD 2 remains unopened. This closure does not install, release, or begin BUILD 2.
