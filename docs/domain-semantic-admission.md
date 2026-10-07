# Domain-semantic admission and D&I boundary

**Date:** 7 October 2026, America/Phoenix  
**Owner:** ECO-202 — situated inquiry orchestration.  
**Principal commission:** BRAIN `a1dd854e-f36b-4003-9c71-c51478dc97a4`.  
**Contract:** `ecos:domain-semantic-admission:0.1.0`.  
**Disposition:** first operational package installed for systems engineering; generic evaluator is domain-neutral, but no other domain is admitted until it has explicit Native Package descriptors.

## Purpose

Turn Differentiation & Integration (D&I) from a notebook workflow into an executable domain-semantic admission boundary over the existing ECO-202 inquiry coordinator.

The unit of classification is an **atomic responsibility/problem solved**, not a whole framework or brand. Each responsibility is evaluated against current native prior art and returns exactly one disposition:

- **INHERIT** — native semantics adequately solve the responsibility; retain native ownership.
- **FEDERATE** — native semantics remain authoritative, but the present use requires explicit cross-domain correspondence.
- **EXTEND** — a named consequential obligation remains after current native-practice inspection and an existing ECOS mechanism plus falsifier are supplied.
- **QUALIFY** — the boundary is not yet earned; preserve a Question Forward / reentry rather than manufacture an extension.

This composes FR-1, FR-2 and FR-3. It does not add a URG primitive or reopen ECO-136/ECO-221.

## Runtime mechanics

The existing ordinary `search` ingress is extended to contract `ecb-v2-search/0.7.0`. Its optional `inquiry.domain_admission` block currently accepts the `systems-engineering` domain.

The execution order is:

1. ECO-202 performs ordinary situated inquiry discovery, exact recovery and current working projection.
2. The supplied D&I responsibilities are bound to the resulting `inquiry_basis_ref`.
3. `evaluateDIBoundary` checks each responsibility against registered native packages and anti-reinvention gates.
4. Any blocking QUALIFY result forces the combined inquiry disposition to HOLD and adds `domain_admission:<responsibility_id>` to reentry.
5. The returned `domain_admission.ledger_projection` is a materialized current view; durable historical custody still uses BRAIN/Artifacts/ledger records rather than treating the projection as the source of truth.

## Hard gates

The implementation currently enforces:

- no EXTEND when native prior art was not checked;
- no EXTEND when the authoritative native source is unavailable;
- attributable evidence is required after prior-art inspection;
- an atomic responsibility cannot simultaneously claim native ADEQUATE coverage and an unmet extension obligation;
- EXTEND requires a named unmet obligation, an existing ECOS mechanism and a falsifier;
- FEDERATE requires explicit correspondence targets;
- required-for-current-use unresolved decisions force HOLD.

These are structural gates. They do not determine domain truth or perform semantic atomization automatically.

## Native Package descriptor

A package records domain, native authority, edition, semantic scope, native identity scheme, access routes, validation routes, currentness routes and source references. It is a descriptor/adaptor boundary, not a copy of the native ontology.

The first registry is `server/native-packages/systems-engineering.ts` and currently contains:

- OMG SysML 2.0;
- OMG Systems Modeling API and Services 1.0;
- ISO/IEC/IEEE 42010:2022;
- NASA-HDBK-1009A (2025).

Current source checks on 7 October 2026 confirm SysML 2.0 and Systems Modeling API 1.0 are formal OMG specifications adopted September 2025; NASA-HDBK-1009A is ACTIVE dated 12 March 2025; ISO/IEC/IEEE 42010:2022 is published edition 2.

## Remaining adapter responsibilities

This increment deliberately does **not** fabricate:

- responsibility atomization from arbitrary source prose;
- native-prior-art search or coverage judgments;
- semantic equivalence;
- cross-domain correspondence truth;
- a new native package from an unverified domain;
- persisted boundary decisions merely because a projection was returned.

Those functions require attributable semantic adapters and durable custody. Until supplied, callers pass prepared atomic responsibilities with explicit source/evidence refs; missing support returns QUALIFY/HOLD.

## First systems-engineering use

The standing Systems Engineering × SIGMA/ECOS D&I ledger manifest remains BRAIN `21e58c47-2f40-47ef-8fc8-6e6c4451b6c1`.

Use this boundary for every subsequent Session 4+ construct:

1. preserve course/current-practice/project source lanes;
2. atomize the exact responsibility;
3. identify the relevant registered native package(s);
4. inspect current native evidence;
5. invoke INHERIT/FEDERATE/EXTEND/QUALIFY mechanically;
6. persist consequential decisions to the append-only D&I ledger with source, standing and supersession;
7. let later standards/project changes requalify the current projection.

## Ownership and forward installation

- **ECO-202:** runtime ingress, boundary evaluator integration, D&I adapter and current projection.
- **Systems Engineering D&I ledger:** source/evidence history and pedagogical/current-practice comparison.
- **ECO-51:** Level/seating checks when a boundary decision depends on constitution.
- **ECO-218/ECO-219:** connected consumer schema refresh and invocation delivery.
- **ECO-214:** hosted circulation/worker activation and longitudinal qualification.
- **Closed URG/circulation kernel work:** reused; not reopened by this installation.

The next operational frontier is the semantic adapter: automate responsibility atomization and native-prior-art resolution while retaining exact evidence and forcing HOLD wherever native coverage or extension necessity is not attributable.
