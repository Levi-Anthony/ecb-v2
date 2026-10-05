# ECO-136 — URG Portable Core Move Receipt v1.1

**Date:** 5 October 2026, America/Phoenix  
**Principal Shape acceptance:** Linear `3c5e6d1f-e792-4e98-b4a1-dc6d6c51cc83`  
**Current canonical implementation commit:** `a253b73897b17f9080bf50097ac215beecd9d73d`  
**Supersedes for current Move evidence:** `URG-Core-Move-Receipt-v1.0.md`  
**Move standing:** **PASS — post-closure implementation-fidelity hardening qualified**

## Why v1.1 exists

The initial package at `b65071622e915f2140bc3ef6828fed71d9eb5e09` passed its declared mechanical qualification, but a later exact-source audit against the Principal-accepted full-core Shape and the installed seven axis contracts exposed implementation omissions.

The omissions were in the executable representation, not the accepted semantics:
- mapper/frame/access had been compressed too far;
- fidelity/standing dimensions were too thin;
- typed material change/requalification was not explicit;
- positive witness/basis requirements for several axis contracts were underrepresented.

Those defects were repaired rather than reinterpreting Shape.

## Current installed package

- `server/urg-core.ts` — blob `cb1139a0b63d383d8a9883b80418811e8d23717b`
- `schemas/urg-core-v1.contract.json` — blob `5d739296b5e02833859681bc97baf0bc25285975`
- `tests/urg-core/contract.test.ts` — blob `926912334b4db73cae8ecd143e211bbf04223bf2`
- `.github/workflows/eco-136-urg-core.yml` — blob `87381fb110f605c4aa89f8b7a8a01e9f449d5508`
- ADR-009 — blob `69fea0b9ba32f5ff894783697691e99c9f3eb1ca`
- `package.json` — blob `dbc42cd70f352c4c03320f44a2dfe9eeb46ff747`

Constitutional source remains unchanged:
- `docs/invariants.md` — `72b89a2bf7ccb9b2de484be01e45cf5a62e612b6`

## Current executable fidelity

Implementation revision `1.0.2` now preserves:

- R / grain / B / G as independently recoverable coordinates;
- mapper / frame / access independently rather than one opaque context field;
- coverage / activation / disposition as orthogonal;
- evidence/warrant, authority/custody and currentness as separately attributable;
- Level witness C + O + constitutive-dependence/asymmetry witness d;
- Direction transformation tau + declared conditions c + witness reference for every supported A/C/T/D classification;
- State basis + occasion + consequential F;
- Line contract + positions + warranted continuity links;
- Stage basis + witnessed Line + Line position + G + Level witness + projection + distinct occurrence identity for STAGE_LEVEL;
- Type typology/schema + conditions + classifier + native relation semantics + witness;
- native n-ary/role-bearing relations with source schema edition and situated basis;
- projections with mapper, mapping relation, G, frame, access, scope/resolution, evidence basis, content, omissions and independent fidelity;
- typed material-change records with source/destination basis, continuity mode, affected claims/dependencies and requalification targets;
- strengthened Question Forward basis/standing/signal/routing/reentry fields.

## Exact qualification

GitHub Actions run `37313488632`, job `111774369369`, head `a253b73897b17f9080bf50097ac215beecd9d73d`: **SUCCESS**.

Passed:
- URG TypeScript typecheck;
- URG portable contract tests: **38 / 38**;
- inherited full-core anti-collapse/composition matrix: **42 / 42**;
- ordinary MCP typecheck + tests: **11 / 11**;
- OAuth typecheck + tests: **7 / 7**;
- circulation typecheck + tests: **29 / 29**.

No regression suite failed.

## Important proof lesson

The earlier mechanically green package was not semantically complete enough. This is a live demonstration of the constitutional rule:

> verification PASS does not self-establish semantic completeness, truth, authority or currentness.

The correction path itself is evidence that the source-precedence and requalification discipline is functioning.

## Residual environment note

`npm ci` emitted **2 high-severity vulnerability warnings** during the qualification job. This Move did not change dependency versions, and the workflow does not establish the identity, exploitability or remediation status of those findings. Therefore this receipt makes **no security-clean claim** for the ordinary runtime. The warning is preserved as separate dependency/security evidence rather than converted into a URG semantic defect.

## Non-mutations

This hardening still did not:
- alter `docs/invariants.md`;
- add a generalized URG database ontology;
- widen Build 4 relation predicates;
- add MCP tools/capability scopes;
- mutate Supabase;
- deploy/activate Vercel;
- activate circulation/provider effects.

## Current reentry

Reenter the exact semantic or physical seam if real use exposes cross-contract contradiction, UNCOVERED semantics, consumer-forced collapse, persistence inadequacy, source/currentness ambiguity, human/agent truth-surface divergence, or a portable-contract fidelity omission of comparable consequence.

**MOVE PASS remains valid at implementation revision 1.0.2.**
