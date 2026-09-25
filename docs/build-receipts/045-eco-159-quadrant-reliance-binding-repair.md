# 045 — ECO-159 Quadrant Exact Reliance-Binding Repair

**Standing:** repository qualification receipt; no production installation  
**Commission:** Linear ECO-159  
**Parent:** ECO-149  
**PR:** #66 — ECO-159: enforce exact quadrant reliance bindings  
**Qualified repair head:** `4966f2ff331c5cd3527b9af61d592031371796b3`  
**Workflow run:** `35424644034` — SUCCESS  
**Job:** `105848375009`  
**Evidence artifact:** `10578578084`, digest `sha256:b7d83e9b9db178ff921e5dd18adc2d6ff0e4b6500f9481ee5b51e8a5a9c91d89`

## Defect

Historical ECO-149 positive reliance checked same-channel basis/inquiry/assessment membership but did not ensure:

- inquiry -> exact relied-on basis;
- assessment inputs -> exact relied-on basis + inquiry.

The disposable pre-repair counterexample demonstrated that a current PASS assessment of one pair could support a different same-channel pair.

Receipt: `ECO159_PRE_REPAIR_COUNTEREXAMPLE=OBSERVED`.

## Repair

Forward migration:

`sql/migrations/20260919054000_eco159_quadrant_exact_reliance_binding.sql`

Added exact inquiry-basis and assessment-input binding to `public.quadrant_v1_qualify`.

Historical ECO-149 migration bytes remain unchanged.

## Qualification

- mismatched assessment inputs rejected;
- inquiry/basis mismatch rejected;
- correctly bound positive path passed;
- repaired qualifier retained ECO-149 systems-pressure behavior: `ECO149_PRESSURE=PASS`;
- containment: `ECO159_CONTAINMENT=PASS`.

## Claim boundary

This qualifies exact structural lineage at the disposable database/RPC boundary. It does not establish semantic truth, real authority, production installation, outward MCP/Vercel parity, external effects, performance/reliability, or Register A transfer standing.

Full return:

`research/quadrant-grammar/ECO-159-Quadrant-Implementation-Qualification-Return-2026-09-18.md`
