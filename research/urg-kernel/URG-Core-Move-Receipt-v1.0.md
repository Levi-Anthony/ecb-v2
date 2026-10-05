# ECO-136 — URG Portable Core Move Receipt v1.0

**Date:** 5 October 2026, America/Phoenix  
**Principal Shape acceptance:** Linear `3c5e6d1f-e792-4e98-b4a1-dc6d6c51cc83`  
**Canonical implementation commit:** `b65071622e915f2140bc3ef6828fed71d9eb5e09`  
**Move standing:** **PASS**  
**Linear Move Return:** `414c0a8b-3ef5-4e99-af41-bfe8f47a35d3`

## Installed package

- `server/urg-core.ts` — blob `93fbc60841e54f843d43c90ce1b396c2bb882494`
- `schemas/urg-core-v1.contract.json` — blob `c7131e1fa2be9740b1013bb1a8c5cdd2d0529714`
- `tests/urg-core/contract.test.ts` — blob `e2c210d0d5d53855b038e99d31fb1ec1fb7321f7`
- `.github/workflows/eco-136-urg-core.yml` — blob `7e6bfdad463662ab8fa0ae44852ce841c9d60c06`
- ADR-009 — blob `f87c7b1d1456b076b21287f2eebfda451e390378`

## Qualification

GitHub Actions:
- run `37311482672`
- job `111767700150`
- conclusion: SUCCESS

Evidence:
- TypeScript typecheck PASS.
- Portable contract tests: **21 / 21 PASS**.
- Accepted full-core anti-collapse/composition matrix: **42 / 42 PASS**.
- Existing ECO-218 OAuth qualification workflow also completed successfully on the same commit.

Constitutional invariants remained unchanged:
- `docs/invariants.md` — `72b89a2bf7ccb9b2de484be01e45cf5a62e612b6`.

## Physicalization decision

The implementation is a **portable discriminated contract package**, not a seven-field database record.

The current database already supplies:
- stable Referent identity;
- Claim/evidence standing;
- bounded typed relation Claims;
- immutable Artifact custody.

A generalized URG persistence ontology was not earned by this Move. Build 12's own Greenfield correction is direct precedent against reintroducing generalized physical structure merely because it is convenient.

No database migration, MCP capability expansion, Supabase mutation, Vercel deployment or circulation activation was part of this Move.

## Reentry

Open bounded physicalization/reconciliation if a real consumer cannot preserve required URG distinctions through the portable package + existing Referent/Claim/Artifact + native-domain-schema substrate.

**This receipt is implementation evidence. It does not create semantic truth or authority beyond the accepted Shape.**
