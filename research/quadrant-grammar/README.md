STATUS: ACTIVE ARCHITECTURE CONTINUITY SURFACE
DISPOSITION: PORTABLE HANDOFF / ARCHITECTURE DOCUMENTATION SOURCE OF TRUTH
ROLE: Shared repository continuity surface for the current qualified quadrant-grammar and downstream architecture-documentation chain
AUTHORITY: Repository continuity is canonical for architectural documentation location/history; semantic standing remains inherited from the governing sources identified below
READ WHEN: Beginning or resuming quadrant architecture inquiry, checking requirement lineage, or reconstructing the post-ECO-144 descent
DO NOT USE FOR: Treating repository presence, recency, or polish as semantic ratification, runtime conformance, or execution authority

# Quadrant grammar — architecture continuity chain

This directory is the shared source of truth for **architectural documentation continuity** for the quadrant branch of ECO-136.

That means downstream architecture documents, qualified handoff packets, architecture Sense/Shape returns, and later physical-design documentation should be persisted here so a cold worker can reconstruct the current architectural lineage without relying on a particular ChatGPT workspace or Library.

This does **not** mean repository location creates semantic authority. A file's epistemic/decision standing remains whatever its governing source, qualification record, and explicit supersession state establish. Linear remains the coordination/commission surface. The repository is the durable shared documentation surface.

If a repository artifact conflicts with a later governing decision, explicit supersession/currentness controls interpretation. Do not infer authority from newest commit alone.

## Current chain

| File | Source / standing |
| --- | --- |
| [SIGMA-ECOS-Quadrant-Grammar-Register-B-Functional-Contract-v0.2.md](./SIGMA-ECOS-Quadrant-Grammar-Register-B-Functional-Contract-v0.2.md) | Current amended semantic basis; qualified for provisional bounded use by ECO-143. Original Library lineage: `libfile_17c4b7ceeb78819195d33c5010c02917`. |
| [ECO-143-Register-B-Qualification-Return-2026-09-18.md](./ECO-143-Register-B-Qualification-Return-2026-09-18.md) | Bounded Register B semantic qualification evidence and claim envelope. Original Library lineage: `libfile_3dc26a2a204c81919dd314df015db46a`. |
| [ECO-144-Quadrant-Design-Requirements-and-Qualification-2026-09-18.md](./ECO-144-Quadrant-Design-Requirements-and-Qualification-2026-09-18.md) | Qualified substrate-independent design requirements baseline; sufficient for separately governed architecture inquiry. Original Library lineage: `libfile_366415ba3ff08191ad3dc4b189b71e2e`. |
| [Quadrant-Grammar-Post-ECO-144-Descent-Plan-2026-09-18.md](./Quadrant-Grammar-Post-ECO-144-Descent-Plan-2026-09-18.md) | Project-management sequencing guidance; no architectural or semantic authority independently. Original Library lineage: `libfile_4858090377c08191ae9476990ecb2dff`. |
| [Quadrant-Architecture-Intake-Packet-ECO-144-Baseline.md](./Quadrant-Architecture-Intake-Packet-ECO-144-Baseline.md) | ECO-145-qualified cold-readable interface to the ECO-144 requirements baseline. It does not itself authorize architecture or implementation. |
| [ECO-145-Packet-Composition-Fidelity-and-Transfer-Return-2026-09-18.md](./ECO-145-Packet-Composition-Fidelity-and-Transfer-Return-2026-09-18.md) | Packet fidelity, traceability, and bounded cold-transfer qualification return. |
| [ECO-146-Quadrant-Architecture-Sense-Return-2026-09-18.md](./ECO-146-Quadrant-Architecture-Sense-Return-2026-09-18.md) | Accepted substrate-independent Architecture Sense: A–G responsibility families, CP1–CP6 control points, recoverability/composition boundaries, capability reconnaissance, Q1–Q7 Shape decision surface, and upstream reentry routes. |
| [Quadrant-Logical-Architecture-Contract-v0.1.md](./Quadrant-Logical-Architecture-Contract-v0.1.md) | ECO-147-qualified logical architecture contract accepted for continuity: Situated Basis → Inquiry State → Applicability Reconciler → Reliance Qualifier, with six logical contracts, lifecycle/change/reliance semantics, conformance hooks, and physical-design boundary. |
| [ECO-147-Quadrant-Architecture-Shape-and-Qualification-Return-2026-09-18.md](./ECO-147-Quadrant-Architecture-Shape-and-Qualification-Return-2026-09-18.md) | Architecture Shape qualification evidence. Gates A–J pass within the bounded analytical/transfer envelope after a documented local contract-navigation repair and affected retest. No physical/runtime conformance is claimed. |
| [Quadrant-Physical-Design-Spec-v0.1.md](./Quadrant-Physical-Design-Spec-v0.1.md) | ECO-148 frozen physical-design specification; accepted for bounded Register B continuity subject to the later corrections recorded in the continuity-acceptance note. Historical Gate K/minimality wording is not current Register B guidance. |
| [ECO-148-Quadrant-Physical-Design-and-Qualification-Return-2026-09-18.md](./ECO-148-Quadrant-Physical-Design-and-Qualification-Return-2026-09-18.md) | ECO-148 frozen physical-design qualification return and provenance evidence. Acceptance does not establish production readiness or runtime conformance. |
| [ECO-148-Continuity-Acceptance-2026-09-18.md](./ECO-148-Continuity-Acceptance-2026-09-18.md) | Current continuity disposition: explicitly accepts the frozen ECO-148 package for bounded Register B use, records Gate K deferral and Register B method supersession, links ECO-149 implementation evidence, and preserves production promotion as a separate governed seam. |

## Current progression

`functional contract → ECO-143 bounded semantic qualification → ECO-144 qualified design requirements → ECO-145 portable architecture intake → ECO-146 accepted Architecture Sense → ECO-147 accepted logical Architecture Shape/freeze → ECO-148 accepted substrate-specific physical design → Register B method reorientation → ECO-149 bounded Register B implementation evidence → separately governed production-promotion reconciliation`

**Current frontier:** ECO-148 physical design is explicitly accepted for bounded Register B continuity. The two frozen design editions are now canonical in this directory without rewriting their historical bytes; [ECO-148-Continuity-Acceptance-2026-09-18.md](./ECO-148-Continuity-Acceptance-2026-09-18.md) records their current standing and the corrections that govern interpretation.

A Principal Register B reorientation on 2026-09-18 supersedes ECO-148's old Gate K/minimality implications for current implementation decisions. Gate K remains historically unclosed and preserved for future Register A qualification; it is not a Register B implementation prerequisite. "Smallest" is not a current architecture/slice/probe/proof/next-Move optimization target.

ECO-149 subsequently produced bounded Register B implementation evidence and reported no semantic/logical upstream reentry. Its return supports the ECO-148 physical allocation in the tested class while recording a practical current-substrate refinement. This does not establish canonical Supabase/runtime installation, real-consumer parity, operational recovery, or effect authority.

Production promotion remains separately governed. ECO-150 and any authorized successors own production-promotion reconciliation; accepting or closing ECO-148 must not be read as production readiness.

Current governing method is carried by `docs/build-contract.md`, `docs/invariants.md`, the durable Linear reorientation referent `3019bc73-ba4c-49ac-a0b0-90977bd4e713`, and the ECO-148 continuity-acceptance note. Repository presence or physical implementation does not independently create semantic standing or authority.

## Continuity discipline

- Persist accepted architecture-documentation outputs in this directory or a clearly linked descendant path.
- Preserve source wording when fidelity matters.
- Every descent artifact must state what it inherits, what it adds, what it does not establish, and what reopens it.
- Do not silently “clean up” a source into a new authority.
- Traceability should flow both directions: requirement → responsibility/mechanism → test, and failed test → mechanism → requirement/reentry.
- Requirement sufficiency, Architecture Sense, logical Architecture Shape, physical design, implementation conformance, and runtime evidence remain separate claims.
- Prefer a new versioned/qualified artifact over overwriting historical evidence when standing changes.
- Update this index when the architectural frontier materially advances.
