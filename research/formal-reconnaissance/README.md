STATUS: COMPLETE — NOTHING INSTALLED
DISPOSITION: EVIDENCE
ROLE: Entry point for the formal reconnaissance
AUTHORITY: None. No finding here changes any rule, contract, test, or decision record.

# SIGMA→ECOS Formal Reconnaissance

I read 100 academic papers to find out whether existing, well-tested mathematics or computer science
already solves problems ECB v2 is working on.

**Nothing here has been installed or decided.** It is all proposals waiting on a human.

---

## Read these — written for a person

| Start here | What it is |
|---|---|
| **[`EXECUTIVE-EXTRACTION.md`](EXECUTIVE-EXTRACTION.md)** | **The whole result, in plain English. If you read one file, read this one.** |
| [`GLOSSARY.md`](GLOSSARY.md) | Decoder for every code, term, and symbol used anywhere in here |
| [`BRINGALONG.md`](BRINGALONG.md) | Self-contained package to paste into an AI that has no file access |
| [`19-architecture-change-proposals.md`](19-architecture-change-proposals.md) | **The two things that need your decision** |
| [`10-question-forward.md`](10-question-forward.md) | What is still open, sorted by whether it blocks you |
| [`08-formalization-probes.md`](08-formalization-probes.md) | Four experiments I specified and did not run. One is doable on paper today |
| [`06-negative-results.md`](06-negative-results.md) | Twelve appealing ideas that did not survive, and why |

## Reference — dense by design, read only if you need the detail

These are working registers. They are precise rather than readable, and that is deliberate: they
exist so a claim can be traced back to its source. Each opens with a plain-English note telling you
whether you need it.

| File | What it is |
|---|---|
| [`02-baseline-register.md`](02-baseline-register.md) | What ECB v2 already requires and already has, per area — assembled *before* I searched |
| [`04-transfer-contracts.md`](04-transfer-contracts.md) | The 19 proposals in full, each with what would prove it wrong |
| [`05-candidate-formalisms.md`](05-candidate-formalisms.md) | The 14 precise statements worth keeping |
| [`07-fulltext-shortlist.md`](07-fulltext-shortlist.md) | The 21 papers worth reading in full, and the exact question each would settle |
| [`11-synthesis-matrix.md`](11-synthesis-matrix.md) | Coverage grid: which fields speak to which parts of the build |
| [`00-SENSE.md`](00-SENSE.md), [`01-SHAPE.md`](01-SHAPE.md) | How I scoped the work and what I refused to touch |

## Machine-facing — you can ignore these

| File | What it is |
|---|---|
| [`corpus/`](corpus/) | The 100 papers, one structured record each, across 14 topic areas |
| [`corpus/ledger.jsonl`](corpus/ledger.jsonl) | The whole thing as 147 machine-readable lines |
| [`09-evidence-ledger.md`](09-evidence-ledger.md) | Traceability table: requirement → question → sources → proposal → consequence |

---

## The rule this operation followed

Research can find things. It cannot install them.

```
a paper says something
  → I write a proposal, with what would prove it wrong
  → an experiment, if one is warranted
  → a result
  → a change proposal, if warranted
  → A SEPARATE HUMAN DECISION          ← nothing has crossed this line
```

Two proposals are sitting at that last line. Neither has been acted on.

## How confident to be in the citations

Each paper record ends with one of three words:

- **VERIFIED** — I checked the author, title, year and venue against a real source during this work. **21 of 100.**
- **HIGH** — a well-known work whose details are stable and widely reproduced, which I did not re-check. **73 of 100.**
- **MEDIUM** — correctly attributed, but the exact venue, year or page range might be off. **6 of 100.**

One check caught a real error: *The Existence of Refinement Mappings* is in **Theoretical Computer
Science 82(2), 1991**, not TOPLAS, despite being frequently miscited that way. That correction is
carried through. It also tells you the 73 unchecked ones probably contain more errors.

**No claim in this research rests on a MEDIUM citation alone.** But two of the six headline findings
rest on HIGH-but-unchecked anchors, and one of those two is the most consequential item here. That
is flagged where it appears.

## What this operation did not do

- It did not claim to survey the literature completely. Blank cells in the coverage grid mean
  **"I did not search there,"** never "there is nothing there."
- It did not touch anything your build contract deliberately froze.
- It did not chase questions whose answers could not change what you build next.
- It did not invent a measurement, an ordering, a probability, or a preference in order to make an
  appealing analogy work. Twelve analogies were recorded as failures instead.

The only change outside this directory: one routing line added to `START_HERE.md` so a fresh agent
can find this work.
