STATUS: EXECUTABLE EVIDENCE FIXTURE
DISPOSITION: EVIDENCE
GOVERNING: NO
BUILD UNIT: BUILD 1 — Harvest Fixture Path

# BUILD 0 OB1 Qualification Seam

This fixture freezes one demonstrated regrowth-boundary failure without implementing an installation
controller or Universal Referents.

## Frozen behavior

Freedom receives the historical BUILD 0 Shape at `8568a00:BUILD_CHECKOUT.md` and may generate an
independent candidate without canonical OB1 preloaded.

Control requires a provenance-bearing comparison against canonical OB1 commit
`9543c29a3e44a210ce278392b9fac11248997461` before this fixture's prior-art qualification requirement
may complete.

Awareness makes an omitted encounter or drifted comparison pin visible during the fixture's
Metabolize feedback path and routes it to Control before another authority-bearing installation.

Completing the comparison does not accept, install, authorize, govern, promote, or designate the
candidate current.

## Evidence artifacts

- `fixture.json` — source pins, generation boundary, identity rule, and case definitions.
- `independent-candidate.json` — output from a fresh ephemeral Codex process in a read-only detached
  worktree at commit `8568a00`; canonical OB1 was not provided.
- `completed-comparison.json` — output from a second ephemeral Codex process in a read-only detached
  worktree at commit `d0f869a`; its read boundary was the independent candidate,
  `docs/ob1-prior-art.md`, and `BUILD_CHECKOUT.md`.
- `harness.ts` — bounded evaluator for qualification, standing, identity, Control, and Awareness
  outcomes.
- `harness.test.ts` — executable assertions for missing, completed, drifted, contamination, and
  identity paths.
- `run.ts` — deterministic trace generator.
- `traces/` — preserved missing/completed/drifted outcomes and the execution summary.

The fixture records Git blob identities for the local source files. The full source documents are
not duplicated.

`completed-comparison.json` preserves the comparison context at historical checkout `d0f869a`. Its
`open_conflicts` list records gates that were open at that historical point; it does not override
the later accepted BUILD 0 receipt or reopen those gates now.

## Evaluative standard

A prior-art encounter satisfies this fixture requirement only when:

1. repository, commit, and local recon receipt match the frozen pin;
2. the comparison separately records independently derived behavior and behavior already present in
   OB1;
3. every conflict/difference states the candidate position, prior-art position, decision
   consequence, and disposition; and
4. the comparison explicitly confers no acceptance, installation, authority, governing designation,
   or currentness.

The harness does not accept a judgment based only on `relevant`, `sufficient`, `appropriate`,
`meaningful`, `material`, `good`, `useful`, or a synonym.

## Identity boundary

For a persisted thought, a durable UUID supplies stable referential addressability. It does not by
itself imply promotion, assertion, standing, authority, governing designation, currentness, or
implementation of BUILD 2 Universal Referents.

## Run

From this directory:

```sh
deno task test
deno task trace
```

The trace task is deterministic for the frozen fixture inputs.
