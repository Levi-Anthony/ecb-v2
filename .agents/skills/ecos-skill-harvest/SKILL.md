---
name: ecos-skill-harvest
description: Use this skill when the user has had to re-explain an ECOS/SIGMA action, correction, disposition, analysis pattern, or orientation repeatedly and wants it made reusable. Decide whether the recurring material should become an Agent Skill, a reference inside an existing skill, an eval, or remain an unpromoted concept; then draft the smallest portable skill package.
metadata:
  status: "projection"
  version: "0.1"
---

# Harvest recurring work into Agent Skills

Use the Agent Skills open format. A skill is procedural packaging, not an architectural primitive. Explicit user instructions and current governing project sources outrank any harvested skill.

## 1. Detect a harvest candidate

Look for repeated evidence such as:

- the user repeatedly corrects the same reasoning error;
- the same multi-step operation is reconstructed across chats;
- the agent needs project-specific distinctions to perform a common task reliably;
- a recurring output has stable acceptance criteria;
- a repeated failure has a known prevention procedure.

Do not create a skill merely because a concept is important.

## 2. Classify the candidate

Choose the lightest reusable form:

- **Skill** — repeatable operation/workflow with recognizable activation conditions.
- **Reference inside a skill** — doctrine, vocabulary, pressure registry, examples, or detailed background loaded only when needed.
- **Script** — deterministic repeated computation or validation better executed than re-reasoned.
- **Eval** — recurring failure/edge case that should test an existing skill.
- **Backlog concept** — explanatory idea without a stable procedure yet.

## 3. Bound the skill

State:

- user intent that should trigger it;
- nearby intents that should not trigger it;
- required project-specific knowledge;
- procedure and stopping condition;
- authority/non-promotion limits;
- optional references/scripts needed only on demand.

Prefer one coherent job over a giant doctrine bundle.

## 4. Draft to the spec

Create `<skill-name>/SKILL.md` with:

- `name`: lowercase alphanumeric/hyphen, 1–64 characters, matching the parent directory;
- `description`: concise activation guidance under 1024 characters, preferably phrased `Use this skill when...`;
- optional metadata using string values;
- a lean Markdown body containing only instructions the agent would not reliably know without the skill.

Keep detailed material in one-level-deep `references/`, `scripts/`, `assets/`, or `evals/` as needed.

## 5. Preserve standing

Every ECOS/SIGMA skill should state that it is an operating aid/projection unless independently promoted through the governing route. A skill must not silently amend architecture, settle an aperture, or confer authority.

## 6. Evaluate

Create realistic trigger and near-miss queries when the skill matters enough to test systematically. Evaluate both:

- **trigger quality** — activates when helpful and stays dormant on near-misses;
- **output quality** — following the skill materially improves correctness, consistency, or efficiency over the no-skill baseline.

Revise general rules, not one-off patches for individual eval prompts.

## 7. Metabolize execution traces

After real use, harvest only recurring, discriminating lessons. Remove instructions that create ceremony without improving outcomes. If a skill repeatedly needs the same helper computation, promote that computation to a script rather than re-generating it.

## Gotchas

- Concept importance ≠ skill-worthiness.
- Explanatory power ≠ ontology.
- A frequently used noun may belong in a reference; a frequently repeated operation is the stronger skill candidate.
- Do not create overlapping skills whose descriptions compete for the same user intent unless their decision boundary is explicit.
