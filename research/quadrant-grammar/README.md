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

## Current progression

`functional contract → ECO-143 bounded semantic qualification → ECO-144 qualified design requirements → ECO-145 portable architecture intake → separately governed Architecture Sense`

Architecture Sense is the next legitimate phase once separately commissioned. It must derive architectural responsibilities and open choices from R01–R10 under a declared operating context, without selecting schemas, vendors, storage, APIs, or deployment topology.

## Continuity discipline

- Persist accepted architecture-documentation outputs in this directory or a clearly linked descendant path.
- Preserve source wording when fidelity matters.
- Every descent artifact must state what it inherits, what it adds, what it does not establish, and what reopens it.
- Do not silently “clean up” a source into a new authority.
- Traceability should flow both directions: requirement → responsibility/mechanism → test, and failed test → mechanism → requirement/reentry.
- Requirement sufficiency, architecture qualification, physical design, implementation conformance, and runtime evidence remain separate claims.
- Prefer a new versioned/qualified artifact over overwriting historical evidence when standing changes.
- Update this index when the architectural frontier materially advances.
