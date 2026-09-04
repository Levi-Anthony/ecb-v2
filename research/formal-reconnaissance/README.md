STATUS: COMPLETE — RECONNAISSANCE CLOSED, NOTHING PROMOTED
DISPOSITION: EVIDENCE
ROLE: Bounded external formal reconnaissance for the greenfield SIGMA→ECOS build
AUTHORITY: None. No finding here amends an invariant, contract, acceptance test, or ADR.
READ WHEN: A build seam needs a sharper invariant, a failure detector, a test, or implementation machinery
DO NOT USE FOR: Changing architecture. Every consequential result routes through the firewall in `/docs/`.

# SIGMA → ECOS 100-Abstract Formal Reconnaissance

A bounded research operation run against the **live** v2 architecture, not against a
migration target. Prior OB1/ECB implementations were inspected only where the accepted
research Shape implicated them, and only as evidence.

## The firewall

    LITERATURE FINDING
      → TRANSFER CONTRACT        (04-transfer-contracts.md)
      → FORMALIZATION PROBE      (08-formalization-probes.md, only when earned)
      → RESULT
      → ARCHITECTURE-CHANGE PROPOSAL (19-*, only when warranted)
      → SEPARATE GOVERNANCE DECISION

Nothing in this directory has crossed the last arrow. Two architecture-change proposals
are drafted and are awaiting human governance; both are marked as such.

## Reading order

| # | File | Spec output |
|---|---|---|
| — | `00-SENSE.md` | Sense close record |
| — | `01-SHAPE.md` | Research Shape + bound output contract |
| B | `02-baseline-register.md` | Phase 0 internal architecture / prior-art baseline |
| C | `corpus/` | 100 coded source records, 14 neighborhoods |
| D | `04-transfer-contracts.md` | Transfer Contract Registry (TC-001…TC-019) |
| E | `05-candidate-formalisms.md` | Candidate Formalism Registry (CF-01…CF-14) |
| F | `06-negative-results.md` | Negative Results Registry (NR-01…NR-12) |
| G | `07-fulltext-shortlist.md` | 21 warranted full texts, grouped |
| H | `08-formalization-probes.md` | 4 earned formalization probes (FP-001…FP-004) |
| I | `09-evidence-ledger.md`, `corpus/ledger.jsonl` | Machine-ingestible evidence spine |
| J | `10-question-forward.md` | Question Forward register |
| §17 | `11-synthesis-matrix.md` | Cross-corpus synthesis by build function |
| A | `EXECUTIVE-EXTRACTION.md` | **Start here if you only read one file** |
| §19 | `19-architecture-change-proposals.md` | Two proposals awaiting governance |

## Citation confidence

Every record carries a `CITE` line ending in a confidence token:

- `VERIFIED` — bibliographic metadata confirmed against a primary or authoritative
  secondary source during this operation (2026-09-04).
- `HIGH` — canonical work whose author/title/year/venue is stable and widely reproduced;
  not independently re-checked this session.
- `MEDIUM` — correctly attributed work whose exact venue, year, or page range was not
  re-checked and may be off by an edition or a preprint/journal split.

19 records are `VERIFIED`, and one verification produced a correction carried into the
corpus: Abadi & Lamport, *The Existence of Refinement Mappings*, is **TCS 82(2), 1991**,
not TOPLAS (the 1988 LICS paper is the earlier version).

**Unverified citation metadata is itself an aperture**, registered as QF-D-05. No claim in
this reconnaissance depends on a `MEDIUM` citation alone.

## What this operation did not do

- It did not conduct a systematic review, and claims no completeness.
- It did not resolve any item on the Build Contract freeze line.
- It did not open a research loop whose answer could not change the current BUILD.
- It did not manufacture a metric, lattice, order, probability, utility, or state space to
  rescue an analogy. Twelve attractive analogies were recorded as failures instead.
