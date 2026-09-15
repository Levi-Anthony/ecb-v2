STATUS: ACTIVE  
DISPOSITION: PROJECTION  
ROLE: Universal repo entry point  
AUTHORITY: None independently; routes to governing sources  
READ WHEN: Entering the repository, starting a fresh agent, or becoming disoriented  
DO NOT USE FOR: Creating or changing architecture

# ECB v2 — Start Here

ECB v2 is a greenfield build.

ECB v1 is evidence, not inherited architecture.

OB1 is the substrate lineage.

The architecture program develops valuable behavior on the smallest clean substrate while preserving earned distinctions. Ordinary personal operation proceeds concurrently using available, already-earned capability. Serve the user's actual task; consult architecture when it changes interpretation, legitimacy, or required capability. Neither personal use nor architectural evidence automatically acquires the other's standing.

## Current governing distinction

proven capability ≠ inherited implementation

Preserve behavior before implementation.

Do not migrate complexity merely because it exists.

## Repository document dispositions

These are harness roles, not epistemic standings:

| Disposition | Meaning |
|---|---|
| GOVERNING | Constrains implementation; cannot be silently overridden. |
| TEST_AUTHORITY | Frozen expected behavior used to judge implementation. |
| EVIDENCE | Informs decisions but cannot govern by itself. |
| PROJECTION | Current working/reentry view derived from governing sources. |
| APERTURE | Explicitly unresolved; carries why it is open and what would reactivate it. |
| DECISION_RECORD | Local architectural closure with preserved reopening condition. |

## Where am I?

For ordinary personal work, begin with the user's request and the [ordinary-operation guidance](BUILD_CHECKOUT.md#ordinary-personal-operation). Read the remaining Build state when it affects the task. For Build work or uncertainty about governing scope, begin with `BUILD_CHECKOUT.md` and follow its decision-relevant sources.

Do not infer current Build state or governing authority solely from:

- newest file;
- recent commit;
- open code;
- TODO comments;
- ECB v1 structure;
- chat history.

## What governs?

Read only as needed, in this order:

1. `/BUILD_CHECKOUT.md`

   Current Build disposition and ordinary-operation guidance. It distinguishes available personal use from separately authorized architecture work and retains installation and authority limits. It is a reentry projection, not independent architectural authority.

2. `/docs/invariants.md`

   Hard architectural boundaries. If implementation would make one of these distinctions unrecoverable: **STOP.** Do not work around the invariant.

3. `/docs/build-contract.md`

   Defines the build boundary, architectural minimum, build order, promotion rules, and enforcement discipline. Read when the current Build Unit requires architectural interpretation.

4. `/docs/acceptance-tests.md`

   Defines frozen observable behavior. Tests outrank implementation convenience.

5. `/docs/glossary.md`

   Use when a term is unclear. Do not silently invent a meaning.

6. `/docs/open-apertures.md`

   Use when you encounter something the architecture intentionally does not yet answer. An aperture is not permission to guess.

7. `/docs/build-evidence.md`

   Use during Sense when the active decision surface intersects candidate architectural evidence recorded there. Evidence must be considered before the affected decision closes, but it does not govern or promote itself.

8. `/docs/harvest-ledger.md`

   Use when ECB v1 behavior or implementation becomes relevant. v1 may supply evidence. It does not supply authority merely by existing.

9. `/docs/ob1-prior-art.md`

   Use when canonical OB1 behavior, lineage, or reuse becomes relevant. It pins the upstream state, separates core from optional/community precedent, and records the mine-first coverage receipt. It is evidence, not authority.

## Progressive discovery rule

Do not preload the whole architecture.

Use the reentry route above; expand beyond ordinary-operation guidance when the task requires it.

Expand context only when the actual task exposes a decision-relevant need. The Build procedures below apply to commissioned Build work; they do not require a Build commission, acceptance test, or closure cycle for ordinary personal use.

Route uncertainty as follows:

| Condition | Route |
|---|---|
| Unclear current task | Recover the user's request and accepted scope; use `BUILD_CHECKOUT.md` for Build state and operating boundaries |
| Possible invariant violation | `docs/invariants.md` |
| Architectural behavior unclear | `docs/build-contract.md` |
| Build acceptance requirement unclear | `docs/acceptance-tests.md` |
| Term ambiguous | `docs/glossary.md` |
| Question intentionally unresolved | `docs/open-apertures.md` |
| Active decision intersects candidate BUILD evidence | `docs/build-evidence.md` |
| Need to know what v1 actually did | `docs/harvest-ledger.md` and `/harvest/v1` |
| Need to know what canonical OB1 already solves | `docs/ob1-prior-art.md` |
| Mathematical or formal-semantics probe | `research/formal-semantics/README.md` |
| Human-door deployment choice | `docs/deployment-shapes/human-door.md` |
| Custody-transfer harness test | `prompts/harness-orientation-test.md` |
| New architectural choice required | Create an ADR in `/docs/architecture-decisions/` |

Do not resolve a problem at a higher architectural altitude when a lower-level implementation fact will decide it.

## Unknowns rule

ECB v2 is expected to contain explicit unknowns.

Every consequential unknown must state:

- **WHAT** — what is unresolved?
- **WHY OPEN** — why has it not been resolved?
- **CURRENT EFFECT** — what may safely proceed despite it?
- **TRIGGER** — what concrete condition requires reopening it?
- **ROUTE** — where the inquiry belongs when triggered?

If those fields are present, an unknown is governed.

Do not turn an aperture into an answer merely to make the system look complete.

## Build rule

Every coding session works on one Build Unit.

A Build Unit must state:

- PURPOSE
- INVARIANT SERVED
- INPUTS
- OUTPUT
- STANDING
- ENFORCEMENT
- FAILURE BEHAVIOR
- APERTURE
- REVALIDATION TRIGGER
- TEST
- NON-GOAL

One Build Unit should fit in one comprehensible diff.

Do not introduce adjacent abstractions unless the current test cannot pass without them.

## Authority rule

Recency, polish, retrieval rank, implementation convenience, and model confidence do not create authority.

A fresh agent may:

- inspect;
- infer;
- propose;
- implement within the active Build Unit.

It may not silently:

- amend invariants;
- broaden the Build Unit;
- promote an aperture to architecture;
- import ECB v1 schema;
- create new persistent architecture without justification;
- treat newest as governing.

If the current Build Unit cannot be completed without one of those operations:

**STOP AND OPEN AN ADR OR ESCALATE TO THE HUMAN RAIL.**

## Completion loop

For Register B work, use the [bounded learning-through-action floor](docs/build-contract.md#register-b--bounded-learning-through-action)
to qualify the next Move. Do not substitute exhaustive conceptual closure for an authorized,
observable, recoverable experiment. The governing rule and its limits live in the Build Contract.

For every Build Unit:

1. **ORIENT** — Read `BUILD_CHECKOUT`.
2. **BUILD** — Implement only the bounded capability.
3. **TEST** — Run the frozen acceptance condition.
4. **METABOLIZE** — Compare actual behavior to expected behavior.
5. **ROUTE**
   - Pass → return the evidence for applicable closure disposition; do not infer permission for a successor or installation.
   - Unexpected but nonblocking → record evidence/aperture.
   - Architectural pressure → ADR.
   - Invariant conflict → stop.
   - Test failure → repair the smallest responsible layer.

Do not expand scope merely because the current implementation succeeded.

## Current next handle

Follow the reentry route under “Where am I?” for the actual task.
