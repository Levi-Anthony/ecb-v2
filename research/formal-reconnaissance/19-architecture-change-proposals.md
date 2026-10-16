STATUS: AWAITING GOVERNANCE — NEITHER ADOPTED
DISPOSITION: EVIDENCE
ROLE: The two things that need your decision
AUTHORITY: **None.** A proposal is not a decision.

# Two things that need your decision

Research can find things. It cannot install them. These two crossed the line from "interesting" to
"this may need to change" — and stopped there, which is where they are supposed to stop.

Plain-English version first. The structured detail follows each one.

---

## In plain English

### Proposal 1 — Say what *kind* of obligation each rule is, before saying where it is enforced

**What you have now.** Every important step in ECB v2 has to declare how it is enforced, choosing
from four categories, and there is a hard rule that nothing important may rest on someone
remembering.

**The problem.** The four categories say *where* enforcement happens. They never say *what a given
place can actually enforce*. And there is a proven limit here:

- A watchdog can catch "something bad happened."
- A watchdog can **never** catch "something good never happened" — because it might still happen.

Every one of your deliberately-open questions carries a promise shaped like "reopen this when X."
That is the second kind. No watchdog can ever catch it failing. So those promises are, right now,
resting on someone remembering — which is the exact thing your own rule forbids.

There is a second, smaller version of the same confusion: what a watchdog can *stop* and what it can
merely *notice* are two different limits, and your one "observational" category currently covers
both as if they were the same.

**The proposed change.** Before assigning a rule to an enforcement category, first say which kind it
is: *"nothing bad happens"*, *"something good eventually happens"*, both, or *"a pattern across many
runs"*. Anything in the second category must either get a deadline — which converts it into
something a watchdog can catch — or be handed to a person on purpose, with the assumption you are
making about them written down.

**What it costs.** Nothing structural. One extra field, and a discipline.

**What it gains.** Your enforcement table becomes something that can be checked and found wrong.
Right now it cannot be.

**What it costs you elsewhere.** Some rules will move from "the system handles it" to "a person
handles it," which increases human load. There is a real limit on how much a person can absorb, so
this is not free.

**Cheap first step.** Check the seven enforcement rows already written for Build 0 against this
distinction. I predict they pass. If they do, that is cheap evidence the idea works before you
change anything.

**What would prove me wrong.** Show me an ECB v2 obligation of the second kind that a watchdog
genuinely does enforce.

### Proposal 2 — One of your open questions may be resting on a reason that has expired

**What you have now.** There is a note in your architecture saying, roughly: *we cannot do the more
formal version of this yet, because we have not derived the right kind of ordering from how the
system actually behaves.* Separately, your build contract freezes that whole area of mathematics.

**The problem.** I think that ordering might already exist, for free.

Here is the chain. If you define "two situations are the same for this purpose" as *they permit
exactly the same actions*, you automatically get a proper grouping of situations — no invention
required. Groupings like that naturally arrange themselves from coarse to fine. And the formal
machinery your architecture is holding off on needs, at minimum, exactly that kind of arrangement.

So the reason given for keeping that question open — *we have not derived a suitable ordering* —
may no longer be true. And an open question resting on a reason that has expired is a closure you
did not notice making.

**What I am NOT proposing.** I am not proposing you unfreeze anything. Research does not unfreeze
things. The only question I am putting to you is: *is that note's stated reason still true?*

**What it costs.** Nothing to ask. Unknown for anything that might follow — which is precisely why
I am asking rather than acting.

**The risk of even engaging.** The freeze exists because doing this mathematics too early is a real
hazard, and that hazard has not gone away. Opening the question invites exactly the drift the whole
firewall exists to prevent.

**Do the cheap test first.** This depends entirely on whether "what is permitted" is genuinely
determined by the situation, the discriminator, and the operation — or whether it sometimes depends
on something nobody wrote down. If it is the latter, the whole chain above collapses and the note's
reason stands unchanged. **Do not consider this proposal before running that test.**

**Also:** this rests on one of the citations I did not verify, and it is the most consequential item
in the whole research. Check the source before acting.

---

## Structured detail

## ACP-01 — Add an enforceability axis to the enforcement classification

| Field | Content |
|---|---|
| **Current contract** | `docs/invariants.md`: "Every consequential transition requirement that is implemented or activated SHALL declare its enforcement mode and enforcement surface", with four modes (STRUCTURAL, SEMANTIC, AUTHORITY, OBSERVATIONAL) and seven surfaces. The invariant adds: "No consequential transition may depend solely on an agent remembering an instruction." |
| **Observed problem** | The classification states **where** enforcement happens and never **what a surface can bear**. Consequently (a) the enforcement table is unfalsifiable — nothing checks whether a declared mode can carry its obligation; (b) every Aperture REVALIDATION TRIGGER is an unbounded **liveness** commitment with no finite violating prefix, so no finite-trace mechanism can catch its violation, which makes it precisely the "instruction someone must remember" the invariant forbids; (c) OBSERVATIONAL conflates two different limits — what can be *enforced* (safety, per R094) and what can be *detected* (monitorable, strictly larger, per R096). |
| **Evidence** | R013 (every property = safety ∧ liveness), R014 (different proof obligations; eventuality needs a measure or a fairness assumption), R094 (EM enforces exactly the safety properties), R096 (three-valued verdicts; monitorable ⊋ safety ∪ co-safety). |
| **Transfer contract** | TC-001, TC-002. Formalism CF-05. |
| **Proposed change** | Add to the enforcement declaration a required **property class** field — safety / liveness / conjunction / outside-single-trace — determined before a mode is assigned. Require every liveness component to be either bounded into a safety property (a deadline, a required-by-event) or assigned to AUTHORITY with a **named fairness assumption**. Require observational verdicts to be three-valued, with `inconclusive` persisted rather than rendered as a pass. |
| **Expected gain** | The enforcement table becomes falsifiable. Unbounded revalidation obligations become visible as the memory dependencies they are. `unknown ≠ nonexistent` gains a mechanism instead of only a prohibition. |
| **Expected loss** | Every existing enforcement declaration must be reclassified. Some obligations will move from STRUCTURAL to AUTHORITY, which increases human-rail load — and R089's requisite-variety bound says that load is finite. |
| **Primitive cost** | NONE. A classification discipline and one field. |
| **Branch impact** | BRANCH_NEUTRAL. Resolves no open architectural branch. |
| **Falsifier** | Exhibit a v2 liveness obligation genuinely enforced by a finite-trace mechanism. |
| **Contract impact** | Amends `docs/invariants.md` §Enforcement. Would add an acceptance test asserting no invariant classified unobservable carries an evidence-driven revalidation trigger. |
| **Implemented-v2-state impact** | BUILD 0's five STRUCTURAL and two OBSERVATIONAL rows would need reclassification. QF-V-03 predicts they pass, which would be cheap confirming evidence — **run that check before adopting**. |
| **Governance standing** | Requires human authorization via the change route in `docs/invariants.md`. **Not adopted.** |

---

## ACP-02 — Reconsider whether the Galois freeze line's stated prerequisite is still unmet

| Field | Content |
|---|---|
| **Current contract** | `docs/build-contract.md` freeze line includes "full projection mathematics" and "Galois formulations". AP-10 states: "meaningful partial orders and soundness relations **have not been derived from observed behavior**." |
| **Observed problem** | That premise may no longer hold. R031 shows `ker(Permitted_O)` is an equivalence relation by construction — the kernel of any function is — hence a **partition**, at zero cost and with nothing invented. R081's decision-theoretic ordering, specialized to deterministic decision rules, reduces to **partition refinement**; partitions of a set form a complete lattice under refinement. R075 confirms a Galois connection is an adjunction between preorders, i.e. it needs only two preorders and two monotone maps. So a **behavior-derived** partial order may already be available — which is precisely what AP-10 says is missing, and precisely the distinction §12 draws between a *derived* order and an *invented* one. |
| **Evidence** | R031, R081, R075, R002 (closure-operator presentation), R008 (completeness as adequacy-for-an-operation). |
| **Candidate formalism** | CF-03; related CF-01, CF-04. |
| **Proposed change** | **Not** to lift the freeze. To put one question to governance: *given that a partial order may now be derivable from observed permission behavior rather than invented, is AP-10's stated prerequisite still unmet?* If the answer is no, AP-10's WHY OPEN needs amending regardless of whether the freeze moves. |
| **Expected gain** | AP-10 currently rests on a premise this reconnaissance has reason to doubt. An aperture resting on a stale premise is a hidden closure, which is exactly what the aperture discipline exists to prevent. |
| **Expected loss** | Engaging the question invites exactly the literature-induced architecture drift §8 forbids. The freeze exists because premature projection mathematics is a real hazard, and that hazard has not diminished. |
| **Primitive cost** | NONE for the observation. Unknown for anything that might follow, which is the reason for caution. |
| **Branch impact** | **BRANCH_FORCING.** Adoption would force resolution of an open architectural question. Per §7, it cannot be promoted automatically, and this operation does not promote it. |
| **Falsifier** | FP-003. If `Permitted_O` is not a function, the kernel is undefined, no partition exists, no order follows, and AP-10's premise stands unchanged. **ACP-02 is blocked on FP-003 and should not be considered before it runs.** |
| **Contract impact** | Potentially `docs/build-contract.md` freeze line and AP-10's WHY OPEN. Nothing else. |
| **Implemented-v2-state impact** | None. No BUILD 0 code or schema is affected. |
| **Governance standing** | Requires a human decision. **This reconnaissance has no authority to lift a freeze, and does not claim the freeze is wrong** — only that one of its stated reasons may have expired. **Not adopted. Blocked on FP-003.** |

---

## Proposals considered and not made

| Candidate | Why not proposed |
|---|---|
| Add **Agent** as a sixth Layer B primitive | Two neighborhoods converge on it (TC-019) and v2's warrant definition presupposes an actor — but structure-is-earned governs, and BUILD 0–5 do not need it. Recorded as QF-B-04 so BUILD 6's Shape starts from it, rather than proposed now. |
| Adopt provenance semirings into the Evidence Link schema | TC-011 is strong, but BUILD 3 has not been Shaped and no v2 record has exercised evidence composition. Proposing schema before the build that needs it is exactly the structure-is-earned violation the contract forbids. |
| Replace "bidirectional" language in v2 documents | NR-02 justifies the prohibition, but no current governing document uses the term. Nothing to change; recorded as a vocabulary hazard instead. |
| Add a "lawful-continuation set" object | CF-09 is compelling, but the object cannot be computed and only a conservative approximation is realistic. BLOCK_PENDING_PROBE is the honest standing, not a change proposal. |
