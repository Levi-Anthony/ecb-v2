STATUS: MOVE IMPLEMENTATION DECISION — ECO-136 — 2026-10-05
DISPOSITION: ACCEPTED WITHIN PRINCIPAL-AUTHORIZED MOVE
AUTHORITY: Principal accepted the qualified full-core Shape and authorized continuation into Move.

# ADR-009 — URG portable core is a discriminated contract package, not a new database ontology

## Context

ECO-136 Shape is explicitly accepted. The current Greenfield repository already has:

- a universal Referent identity spine;
- Claims and evidence/standing machinery;
- immutable text Artifacts;
- local/scoped semantic implementations such as the quadrant slice;
- a production MCP/runtime whose current public tools are intentionally bounded.

The repository history also contains a relevant negative precedent: BUILD 12 briefly introduced a generic versioned Artifact object/version schema and then deliberately retired it because that physicalization had not been earned. The current Build 4 relation Claim store also has a deliberately narrow predicate vocabulary rather than a universal relation ontology.

The accepted URG full core says the seven locked distinction families are semantically nonidentical and must not be flattened into one "axis record." It also says native domain semantics should descend into URG without ontology capture.

## Decision

Install the first canonical executable URG core as a **portable discriminated contract package**:

- `server/urg-core.ts` — executable TypeScript types plus bounded structural validation;
- `schemas/urg-core-v1.contract.json` — language-neutral machine descriptor;
- `tests/urg-core/contract.test.ts` — discriminating contract tests;
- a dedicated CI workflow that also reruns the accepted full-core matrix.

The package models each URG semantic job as a distinct record kind and includes separate native-relation, projection and Question-Forward records. Shared situated context is limited to referent/boundary plus attributable PGO/frame/source references.

## Explicit non-decisions

This Move does **not**:

- add a universal database table with Level/Quadrant/Direction/State/Line/Stage/Type columns;
- widen the Build 4 `claims.predicate` vocabulary;
- reintroduce the retired BUILD 12 generic version-family schema;
- add new MCP tools or expand capability scopes;
- deploy or activate a new provider/runtime surface;
- promote checker PASS into semantic or governance authority.

The existing database remains a compatible substrate, not the ontology of URG.

## Why this is the canonical implementation seam

The accepted core must be directly consumable by multiple future consumers, including consumers not implemented in TypeScript or not sharing one database. A source-level typed package + language-neutral descriptor gives them a stable contract while preserving native schema semantics.

Database physicalization would currently force one of two unearned choices:

1. flatten semantically different contracts into a common storage shape; or
2. introduce a generalized relation/version system broader than the accepted Move requires.

Both would prepay the wrong debt.

## Reopening condition

Open a bounded physicalization/reconciliation decision if a real consumer cannot preserve required URG distinctions using the portable contract plus existing Referent/Claim/Artifact substrate, or if first use demonstrates that persistent first-class axis/native-relation claims need a generalized database representation.

Such evidence may justify a migration. It does not authorize silent widening of existing tables.
