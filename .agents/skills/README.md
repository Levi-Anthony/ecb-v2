# ECOS Agent Skills

Status: PROJECTION / reusable operating aids. These skills do not amend ECB architecture, create authority, or supersede governing repository sources.

This directory packages recurring ECOS/SIGMA procedures so agents do not require repeated conversational reconstruction. Skills follow the Agent Skills open format: each skill is a folder with `SKILL.md`; detailed material is kept in references only when needed.

## First skill set

- `ecos-orient` — recover focal object, altitude, telos, Master Key, standing, sources, open loops, and legitimate next seam.
- `ecos-question-forward` — preserve consequential unknowns as calibrated questions/apertures instead of manufacturing closure.
- `ecos-differentiate-integrate` — separate conflated functions, then recover why they belonged together without premature reification.
- `ecos-fca-diagnostic` — apply Freedom/Control/Awareness as Master-Key-relative, counterfactual, non-gesture diagnostics.
- `ecos-source-to-requirements` — convert source doctrine into testable requirements without silently inventing architecture.
- `ecos-state-intention-diff` — compare live state with intended function using realized/deferred/drift/unobservable dispositions.
- `ecos-ssmm` — run a bounded Sense → Shape → Move → Metabolize episode without phase or authority collapse.
- `ecos-reentry-propagation` — compile accumulated work into a loss-resistant reentry/propagation packet.
- `ecos-authority-audit` — audit evidence, assertion, standing, warrant, currentness, verification, and promotion boundaries.
- `ecos-skill-harvest` — extract repeated corrections and project-specific procedures into new or revised Agent Skills.

## Concepts deliberately not promoted to standalone skills

These are important but are currently better treated as referenced concepts, pressures, or candidate mechanisms rather than independent procedures:

- Master Key
- FCA mobilized/enactive disclosures
- Overshoot Principle
- Drives
- contrast signal
- trigger
- routing
- system clock
- creative pause
- propagation as a system primitive

The `ecos-fca-diagnostic` pressure registry records the current provisional placement of Overshoot and related active-side hypotheses.

## Precedence

Explicit human instructions and current governing repository sources outrank these skills. In `ecb-v2`, begin with `START_HERE.md` and `BUILD_CHECKOUT.md` when current Build state, authority, or permitted action matters. A skill may help reason about architecture; it does not confer architectural standing.

## Source discipline

This first set was extracted from repeated project work, corrections, governing repo patterns, and the current conversation. It should be evaluated against real tasks and revised from execution traces rather than expanded speculatively.

## Capability contracts

These contracts describe what result each skill is intended to make reliably available. They classify the skill's realization inside this library; they do not add architectural capability types or imply that a Skill, MCP tool, service, or UI action are equivalent.

| Skill | Realization here | Activation input | Promised bounded result | Explicit non-result / stop |
|---|---|---|---|---|
| `ecos-orient` | Composite semantic procedure | ECOS/SIGMA entry or reentry where focal object, altitude, purpose, authority, current state, or next seam is materially unclear | Decision-sufficient orientation naming focal object, containing altitude, telos, Master Key, standing/authority, decision-relevant unknowns, and smallest legitimate next seam | Does not decide or implement the work, preload the whole system, or confer standing; stop once those orientation fields can be stated without hand-waving |
| `ecos-question-forward` | Semantic procedure | A consequential unknown, contradiction, deferral, or missing dependency that cannot yet be responsibly closed | A calibrated aperture preserving WHAT, WHY OPEN, CURRENT EFFECT, TRIGGER, ROUTE, and provenance | Does not answer the question, turn every uncertainty into an aperture, or repeatedly reopen a dormant aperture; stop when a successor can tell what changes, why deferral is safe, and when/where inquiry resumes |
| `ecos-differentiate-integrate` | Semantic procedure | A fused/overloaded concept or a candidate distinction at risk of premature reification | Functional distinctions with discriminators, weakest supported ontological standing, and the shared upstream function explaining the prior integration | Does not promote a primitive or schema; stop when both why-distinguishable and why-integrated are answered |
| `ecos-fca-diagnostic` | Semantic diagnostic | A concrete FCA claim or system condition anchored to a focal object, altitude, and Master Key | Counterfactual, non-gesture account of each implicated capacity, its instantiation, required possibility or constraint/sensing role, and absence failure | Does not balance FCA abstractly or canonize mobilized expressions; stop with a supported mapping or an explicit provisional disposition |
| `ecos-source-to-requirements` | Transformation adapter | Bounded source material whose behavioral obligations need extraction | Source-standing-preserving SHALL / SHOULD / OPEN requirements with supported acceptance conditions and non-collapse constraints | Does not repair the source or select schema/implementation; stop when obligations are stable enough for separately authorized design |
| `ecos-state-intention-diff` | Transformation adapter | An explicit intention source and observable current-state evidence | Obligation-level REALIZED / DEFERRED-BY-DESIGN / DRIFT-CONTRADICTION / UNOBSERVABLE-UNTESTED dispositions with consequence and next discriminator | Does not turn every gap into a build request or infer intention from implementation; stop at the smallest decision-relevant delta |
| `ecos-ssmm` | Composite semantic procedure | An activated bounded episode whose Sense, Shape, Move, and Metabolize responsibilities must remain distinguishable | Phase-correct development of the episode with phase-specific closure, evidence, apertures, and reentry disposition | Does not originate the episode or create warrant; stop at the authorized phase boundary and avoid ceremonial phase expansion |
| `ecos-reentry-propagation` | Transformation adapter | Accumulated work that another session, agent, or branch must resume without losing standing or open state | A task-relative projection of authoritative pointers, accepted evidence, hypotheses, conflicts, decisions, dependencies, open loops, and exact next seam | Does not become a second source of truth or promote newer synthesis; stop when a cold successor can reenter correctly from the packet and its pointers |
| `ecos-authority-audit` | Semantic diagnostic | A consequential claim/action where evidence, assertion, verification, confidence, standing, warrant, authority, authorization, currentness, or capability may be conflated | A dimension-by-dimension audit plus any required promotion, verification, or retrieval boundary findings | Does not grant standing, warrant, or permission; stop when each consequential claim/action has a supported disposition or explicit unresolved requirement |
| `ecos-skill-harvest` | Composite semantic procedure | Repeated correction or procedure with evidence that reusable packaging is wanted | Selection of the lightest earned form—skill, reference, script, eval, or backlog concept—and, when warranted, a bounded validated package | Does not equate importance with skill-worthiness or concept with capability; stop at a validated package or an explicit non-promotion disposition |

## Evaluation state

The six highest-use or highest-overlap discovery surfaces currently have fixed trigger fixtures under their `evals/` directories:

- `ecos-orient`
- `ecos-question-forward`
- `ecos-state-intention-diff`
- `ecos-ssmm`
- `ecos-reentry-propagation`
- `ecos-authority-audit`

Each contains twelve training queries and eight held-out validation queries, evenly split between should-trigger cases and decision-relevant near misses. Run routing evaluations with the complete ten-skill catalog installed so near misses can exercise actual sibling-skill boundaries. The fixtures are evidence inputs, not evidence that the descriptions already pass. Do not revise descriptions from the validation set; use it only to select among revisions derived from training failures.

Run the repository-local structural check with:

```bash
node tests/agent-skills/validate.mjs
```

Run the official reference validator against each skill with:

```bash
for skill in .agents/skills/*/SKILL.md; do skills-ref validate "$(dirname "$skill")"; done
```

Structural validation establishes format and fixture integrity only. Trigger reliability requires repeated model-driven activation runs, and output quality requires with-skill versus baseline execution and grading.

See the [validation record](VALIDATION.md) for the latest recorded scope and results.
