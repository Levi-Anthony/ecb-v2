STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: The main summary. Written in plain English.
AUTHORITY: None. Nothing here has been installed or decided.

# What this research found

Every term, code, and symbol used anywhere in this directory is decoded in
[`GLOSSARY.md`](GLOSSARY.md). If something here is unexplained, that is a fault in this
document, not something you should have to look up.

---

## What I did

I read 100 academic papers to find out whether existing, well-tested mathematics or computer
science already solves problems ECB v2 is working on.

I was looking for four things: **tests** you could freeze, **warning signs** that tell you
something has gone wrong, **machinery** worth building, and **appealing ideas that turn out not
to fit** — because knowing an analogy is false is worth as much as finding a true one.

Nothing here has been decided or installed. No rule, contract, test, or decision record in ECB v2
was changed. It is all proposals waiting on a human.

## The result in one sentence

**ECB v2 is very good at saying what must stay true, and has almost no way to check whether it
actually stayed true.**

Two numbers make the point. Of the seven areas I examined, **four have no test at all**. And the
papers produced about **four times as many** "make this rule sharper" results as "build this new
thing" results.

That is the right shape for a system that has done its thinking and not yet done its building. The
literature's contribution here is checks and warning signs, not architecture.

---

## The six findings that matter

### 1. "We'll come back to this later" can never be enforced automatically

ECB v2 has a hard rule: nothing important may depend on a person or an AI simply *remembering* to
do it. It must be built into the structure.

But ECB v2 is also full of promises shaped like *"reopen this when X happens."* Every deliberately
open question has one.

Here is the problem, and it is a proven result rather than an opinion:

- A watchdog program **can** catch "something bad happened." The bad thing shows up, and it stops you.
- A watchdog program **can never** catch "something good never happened," because at any moment the
  good thing might still be coming. There is no point at which it can declare failure.

So "we'll revisit this when X" cannot be caught by any watchdog. Which makes it exactly the thing
the rule forbids — someone remembering.

**Fix:** attach a deadline ("revisit by this date, or when this specific event happens"), which
turns it into something a watchdog *can* catch — or hand it to a human on purpose and write down
that you did. Costs nothing structural.

*This came from a topic area that was not in the research plan. I added it partway through.*

### 2. Receipts you can check, instead of receipts you have to trust

When a commitment in SIGMA gets turned into something running in ECOS, how do you know the
translation was faithful?

Two options. Prove the translator is always correct — a multi-year research project. Or: every time
it translates, it also produces a short note saying *"here is why this output kept what mattered,"*
and a separate small program checks that note.

The second is what compiler engineers actually do when proving the whole compiler is out of reach.
It is available now, and it changes a receipt from *a record of what happened* into *a record you
can verify*.

It also answers a different question: how ECB v2 accepts work from an AI it cannot fully trust. The
AI ships its reasoning in checkable form, and a small checker — not the AI's confidence or
reputation — decides.

### 3. The obvious academic theory has exactly the wrong rule built into it

There is a well-developed field on how a body of belief should change when new information arrives.
Its central theory has a rule baked in at the foundation: **new information is always accepted.**

That is the precise opposite of "newest is not automatically current." So the theory cannot be
used — not because it is too weak, but because its defining assumption is the thing ECB v2 exists
to refuse.

There is a branch of the same field where incoming information has to **earn** admission and can be
turned away with nothing changing. That branch fits — and it describes what your Charter's intake
lane already does: a specimen arrives, gets no privilege from being new, and may itself be the thing
rejected.

**You reinvented it.** The gain is not novelty. It is that the academic version comes with a
checklist of properties you can test your process against, instead of judging each case by feel.

### 4. One free win and one hard limit

**Free.** You often need to say "these two situations count as the same for what I am doing right
now." That can be made rigorous with no new machinery at all: *two situations are the same when they
permit exactly the same actions.* That is automatically a well-behaved notion of sameness. Nothing
invented, nothing imported, no cost.

**Hard limit.** If two genuinely different underlying situations always produce identical evidence
coming back from the running system, no amount of evidence will ever tell them apart. That is
structural, not a matter of better instruments.

The consequence matters: some of ECB v2's core principles probably can **never** be re-checked by
watching the system run — only re-decided by a person. Worth knowing which ones, because attaching
an "evidence will trigger a review" promise to a principle evidence cannot see means that review
will never happen.

### 5. The two obvious ways to keep two things in sync are both wrong here

Software has two famous techniques for keeping two copies in agreement. One guarantees that edits to
a summary view get pushed back into the source. The other lets copies drift apart and merges them
automatically.

**Both work by automatically accepting changes.** ECB v2's whole point is that changes get reviewed
before they count. So both are out — for the *same underlying reason*, which is worth noticing.

A third, less famous technique only requires *"if the two already agree, leave them alone."* That
one fits, because it permits a partial fix, a proposed fix, or no fix at all.

### 6. One of your open questions may already be answered — and I do not get to say so

There is a note in your architecture saying, roughly: *we cannot do the more formal version of this
yet, because we have not earned the right kind of ordering.*

I think that ordering may already exist for free, as a side effect of finding 4.

But your build contract explicitly freezes that area, and research does not overrule the build
contract. So this goes to you as a **question** — is that note's stated reason still true? — not as
a change. It also depends on the cheap test below, and it rests on my weakest sourcing.

---

## What you already do that has a mature academic precedent

Five places where you independently reinvented established machinery. The value is not novelty — it
is that each academic version comes with named properties you can test against.

| What you do | What it turns out to be |
|---|---|
| The Charter's intake lane, where a specimen must earn its level and may be rejected | Non-prioritized belief revision |
| "Recursive inspection is lazy — only open it when something forces you to" | The known way to make an infinitely deep self-inspecting system actually implementable |
| The human rail, and the requirement for an external starting point of trust | A formal necessity, not a convenience: no system can certify its own soundness |
| Frozen invariants plus the hard-stop rule | A protected core that provably survives *any* sequence of inputs |
| Supersession stamps that surface old content with a pointer to its successor | A legitimate way of restoring consistency without asserting the new thing governs |

## Rules worth making sharper before you build

1. **Say what kind of obligation each rule is** before saying where it is enforced — see finding 1.
2. **Name what you are assuming about the environment.** Every guarantee ECB v2 makes secretly
   depends on something else behaving (the human responding, the database not losing rows). None of
   those are written down, which makes the guarantees technically unconditional and therefore false.
3. **Split two different meanings of "source."** Right now one field records *which door the text
   came in through*. Governance will need *which evidence supports this claim*. A door label cannot
   answer the second question.
4. **Separate "we were wrong" from "the world changed."** Your evidence-return list currently mixes
   them. They need different handling, and using the wrong one either erases a correct belief or
   preserves an error.
5. **Stop calling the cycle "bidirectional."** The word implies the automatic acceptance you do not
   want, and it means four different things in four different fields.
6. **Write down that the current door is a known, temporary exposure** — it holds full authority and
   acts for anyone with the shared key. Fine today with one user. Not fine later.

## Tests you could freeze immediately

- **Rebuild test.** Throw away everything derived, recompute it from the event log, require the
  result to match. Any mismatch points at hidden state you did not know you had.
- **No-similarity-governs test.** Assert that no governance conclusion ever depends on a
  search-similarity score.
- **Reopening test.** A step that closes something must leave its own reopening condition still
  satisfiable. An open question whose reopening its own step destroyed is broken.
- **Three-way verdicts.** Checks return satisfied / violated / **can't tell yet** — and "can't tell
  yet" gets recorded, never quietly counted as a pass.
- **No backdating.** A rule governs an act only if the rule was in force at the time *and* was
  recorded before the act.
- **No self-authorising start.** The bootstrap must not depend on the very policy it is activating.

## Worth building a small version of

| What | When | Why |
|---|---|---|
| The checkable-receipt scheme from finding 2 | Builds 5–6 | Best value for effort found |
| Storing *why* a claim is supported, at the moment it is stored | **Build 3** | **The only thing here with a deadline** |
| Recording both "when it was true" and "when we learned it" | Build 6 | Turns backdating from a vigilance problem into an impossible one |
| A log where retroactive edits are mathematically detectable | Build 6 | Git may already give you most of this — check first |
| Evidence that composes ("supported by A and B, or by C") | Build 3 | Only together with the absence rule below |

## What I rejected, and why

Twelve appealing ideas did not survive. The five that matter:

- **The two sync techniques** in finding 5 — both require automatic acceptance.
- **The main belief-revision theory** — assumes new information always wins.
- **Two compression theories** that sound perfect for "keep only what's relevant" — both require
  inventing a probability distribution, and one also requires inventing a measure of how bad each
  loss is. Inventing either would be exactly the move your own rules forbid.
- **Geometric "angle-preserving" language** — requires a distance measure on meaning. You do not have
  one. The *one* real distance measure you do have (search similarity) is precisely where using it
  this way would break four frozen rules at once.
- **A well-known cybernetics theorem** often quoted to justify systems modelling themselves — its
  actual conditions do not hold here. There is a better argument for the same conclusion.

Two words to avoid: **"bidirectional"** and **"capability."** The second is worse — in security
research a capability *is* permission to act, the exact opposite of what it means in your invariants.

## What stays deliberately unsettled

The frozen areas stayed frozen. Several genuinely strong findings were parked because acting on them
would have required opening something you closed on purpose. Research does not get to unfreeze
things.

## What actually blocks progress

1. **Is what's permitted always determined?** Given the same situation, discriminator, and
   operation — or does it sometimes depend on something nobody wrote down? Testable on paper today
   against your two architecture decision records and the substrate closure. If it depends on
   unwritten context, a good chunk of what I built collapses — and that is important to learn about
   *the architecture*.
2. **Are your core principles even the kind of thing a watchdog can check?** Several look like
   statements about patterns across many runs, which sit outside what any monitor can see.
3. **Does Build 3 need to store "why" from the start?** Yes, and it cannot be added later.
4. **Do you need an "actor" as a basic object before Build 6?** Two unrelated areas of the
   literature independently point at the same gap, and your own definition of warrant already
   assumes one. But adding a new basic object because a paper suggested it is exactly what your
   structure-is-earned rule guards against. Your call, not mine.
5. **What exactly must survive the SIGMA-to-ECOS translation?** Three of my proposals need that list
   closed before they can be built.

## What can safely stay open

The philosophy-of-mind questions, a universal classification scheme, automatic discovery of guiding
discriminators, the full relationship vocabulary, the final interface, and self-inspection depth
until Build 9. Also every blank cell in my coverage table — those mean **"I did not search there,"**
never "there is nothing there."

## What you should not trust too far

- **I ran none of the experiments.** Four are specified; zero executed.
- **I properly checked 21 of the 100 citations.** The rest are well-known works I did not
  re-verify. One check caught a real error, which tells me the unchecked ones contain more.
- **Findings 4 and 6 rest on citations I did not check** — and finding 6 is the one with the biggest
  consequences.
- **Five of the fourteen topic areas produced no rejected ideas at all**, and two of those were
  chosen after I already knew what I wanted to find. That is a bias in my own method.
- **This is not a complete survey** and does not claim to be.
