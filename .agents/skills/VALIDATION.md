# Agent Skills validation record

Status: TEST EVIDENCE for the projection library only. This record does not promote a skill, capability contract, or ECOS architecture claim.

## 2026-09-15 — first extraction structural qualification

Validated material:

- ten `SKILL.md` packages in this directory;
- capability-contract coverage for all ten packages;
- fixed trigger-evaluation fixtures for the six highest-use or highest-overlap discovery surfaces;
- twelve training queries and eight held-out validation queries per evaluated skill, each split evenly between positive cases and decision-relevant near misses.

Checks executed:

1. `node tests/agent-skills/validate.mjs`
   - Result: PASS — 10 skills, 6 trigger suites, and the built-in malformed-fixture sensitivity control.
   - Discriminates: repository-local frontmatter/naming constraints, unfinished scaffold markers, fixture JSON shape, counts, balance, uniqueness, and train/validation leakage. The sensitivity control establishes that the checker rejects at least one contract-relevant malformed fixture rather than only passing the live happy path.
2. `skills-ref validate <skill-directory>` for all ten packages.
   - Result: PASS — all ten reported `Valid skill`.
   - Reference implementation: `agentskills/agentskills@69ef37e9424c0a7ea9dd2293b559e43ec8176379`.
   - Discriminates: Agent Skills specification conformance implemented by that revision of `skills-ref`.
3. `skills-ref to-prompt <all-ten-skill-directories>`
   - Result: PASS — serialized one discoverable catalog entry for each of the ten skills.
   - Discriminates: reference-client property reading and discovery serialization across the complete library.
4. `git diff --check`
   - Result: PASS.
   - Discriminates: Git-detectable whitespace errors in the proposed diff.

## Not established

- No model-driven trigger run has yet established activation precision or recall.
- No training failure has yet warranted a description revision.
- The validation queries remain holdouts; do not use them to tune descriptions.
- No with-skill versus baseline task execution has established output-quality improvement.
- No skill or capability contract acquired architectural standing from these checks.

## Next evidence seam

Use a skills-compatible client with all ten skills installed and observable activation to run every trigger query at least three times. Derive description changes only from training failures, then choose among candidate revisions using validation-set trigger rate. After discovery behavior is acceptable, run representative output evals with and without each skill before calling the library mature.
