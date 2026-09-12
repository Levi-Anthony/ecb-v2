# BUILD 9 qualification handoff — executor allocation and review boundary

Date: 2026-09-12 America/Phoenix
State effect: continuity/accountability only; no BUILD 9 semantic change, implementation change, authority creation, or qualification result.

## Durable starting state

Move issue: ECO-109 — OPEN / AUTHORIZED.
Branch: `build/eco-109-build-9-move`.
Implementation handoff checkpoint before this note: `b0f028cb7528cf695a7a502d6b071a20c2ffcd73`.
Worktree: `/Users/prodadmin/ECB-build-9-move`.

The prior implementation worker stopped intentionally after preserving and pushing the Claim-standing repair and handoff evidence. `HANDOFF-CHECKPOINT.md` is the authoritative description of that implementation delta and its incomplete qualification state.

## Remaining-work classification

The remaining immediate task is no longer open-ended BUILD 9 physicalization. It is a bounded qualification execution:

1. verify branch/worktree continuity;
2. make one already-identified qualification-harness correction: include `tests/build-9/standing.mjs` in `tests/build-9/verify.sh` with retained run-named evidence;
3. freeze that harness seam;
4. execute one clean reset/install qualification run;
5. preserve evidence and stop on the first failed stage;
6. if green, return the compact execution facts needed for independent harness review;
7. do not perform P16 in the same worker/session.

No speculative BUILD 9 mechanism change is authorized before the first clean qualification run.

## Worker allocation decision

For this bounded qualification executor, use **GPT-5.6 Sol with Low/Light reasoning**.

Rationale: the authorized responsibility is procedural execution of settled design, not architecture, implementation design, or ambiguous defect repair. Sol provides sufficient agentic coding/repository reliability without spending Astra-class allowance on deterministic work. Low/Light reasoning is intentional because the executor must stop rather than solve a nontrivial failure.

**Astra is reserved for a later commission only if evidence establishes a genuinely hard implementation/debugging, architectural, or failure-adjudication problem.** Reasoning effort for such a commission should be selected from the actual defect entropy, not inherited automatically from the BUILD phase or previous worker.

P16 remains a separate fresh lower-capability/fixed-context cold-worker falsifier under the accepted Shape contract. It must not be performed by the qualification executor.

This worker-allocation decision refines the original ECO-109 recommendation rather than contradicting it: Astra-class implementation leadership was appropriate while residual physicalization entropy remained. The present remaining task has a different responsibility class.

## Harness/reviewer split

The qualification executor is not the review layer.

On any fresh qualification failure, it must:

- preserve produced evidence;
- not rerun;
- not repair;
- not tune tests to the implementation;
- return the exact failure and evidence location;
- stop for harness review.

On a completely green run, it must return only the compact execution record: continuity result, harness commit, frozen HEAD, run name, stage results/evidence paths, positive locator, recovery commands, and explicit `P16 = NOT RUN` status.

The harness/review conversation then independently reconstructs the P-obligation map, checks evidence against the frozen contract, and decides whether the next commission is P16, a bounded repair, or a return boundary.

## General operational learning carried forward

Model and reasoning selection should follow **residual task entropy and authorized responsibility**, not phase labels, historical model choice, or a blanket preference for the strongest worker.

Use stronger reasoning/model capacity when the worker is authorized to resolve genuine ambiguity. For settled execution with a hard stop on ambiguity, spend the minimum capability that preserves reliable custody and instruction fidelity.

This is an operational orchestration lesson for Metabolize/review; it does not amend BUILD 9 semantics or the ECB architectural contract.
