STATUS: ACTIVE

DISPOSITION: PROJECTION

ROLE: Research pipeline for mathematical probes and formal-semantics test generators

AUTHORITY: None independently; promotion routes to governing repo surfaces

# Formal Semantics Research Pipeline

This pipeline gives mathematical work a durable place without allowing mathematical elegance to become architecture by proximity.

Use it when a probe may sharpen a failure detector, preservation rule, equivalence relation, refinement trigger, or acceptance-test pattern.

Do not preload this material during ordinary BUILD 0 work. Enter only when the current Move exposes a formal-semantics question or an aperture trigger routes here.

## Pipeline

| Stage | Input | Required output | Disposition |
|---|---|---|---|
| 1. INTAKE | Human or agent mathematical probe | Stable probe ID, dated source, provenance, verbatim source | EVIDENCE |
| 2. NORMALIZE | Raw notation and argument | Typed symbols, explicit domains, claims separated from metaphors | PROJECTION |
| 3. CLASSIFY | Normalized claims | Immediate machinery, prior-art quarry, aperture, hypothesis, correction, or rejection | PROJECTION |
| 4. OPERATIONALIZE | Candidate useful claim | Operation/Move class, failure detector, smallest counterexample, revalidation condition | PROJECTION |
| 5. GENERATE | Operational claim | Candidate fixture and expected observation, kept beside the probe | EVIDENCE |
| 6. EVALUATE | Candidate test against real specimens | Pass/fail evidence and limits | EVIDENCE |
| 7. ROUTE | Evaluated result | Acceptance test, ADR, aperture, glossary proposal, or archive | Existing target disposition |

## Promotion rule

A probe cannot promote itself.

- A candidate invariant requires explicit human authorization and the change route in `/docs/invariants.md`.
- A frozen behavior requires installation in `/docs/acceptance-tests.md` before implementation is judged by it.
- A local architectural closure requires an ADR with a reopening condition.
- An unresolved consequential question belongs in `/docs/open-apertures.md`.
- A useful but untested correspondence remains evidence.

Recency, mathematical sophistication, explanatory beauty, and resemblance to an existing concept do not create authority.

## Normalization checklist

Every analyzed probe must answer:

- What are the concrete and abstract domains?
- Which maps are actually type-correct?
- What is the operation or Move class under consideration?
- Which distinctions are intentionally collapsed?
- Which observable failure would show the abstraction is too coarse?
- What must remain invariant across recompilation or alternate transformation paths?
- What evidence would falsify the proposed correspondence?
- What is intentionally deferred?

## Test-generator grammar

Candidate tests may use four reusable patterns:

1. **Robust-action soundness** — every action emitted from an abstraction remains legitimate for every unresolved concrete state represented by it.
2. **Refinement trigger** — if two represented concrete states license different outcomes for the requested operation, the abstraction must refine or refuse the action.
3. **Semantic normalization stability** — unchanged source state, Master Key, warrant, scope, compiler version, and relevant context must not yield materially different action semantics merely because compilation is repeated.
4. **Commuting preservation** — alternate legitimate transformation paths need not produce identical artifacts, but must agree on every relation, standing, warrant limit, provenance handle, and loss disposition promised to survive.

These are research patterns until a specific Build Unit freezes concrete inputs and expected observations.

## Probe layout

Each probe lives at:

`research/formal-semantics/probes/<PROBE-ID>/`

Required files:

- `source.md` — verbatim evidence and provenance;
- `analysis.md` — normalized claims, classification, candidate tests, triggers, and route.

Do not add a generalized schema or executable research framework until repeated probes demonstrate that the document protocol is insufficient.
