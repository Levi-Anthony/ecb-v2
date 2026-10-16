---
name: ecos-source-to-requirements
description: Use this skill when converting ECOS/SIGMA source material, doctrine, conversations, research, or design notes into system requirements. Extract supported behavioral obligations and acceptance conditions while preserving source terminology, uncertainty, authority, and unresolved design choices instead of silently inventing architecture.
metadata:
  status: "projection"
  version: "0.1"
---

# Source to requirements

Explicit user instructions and source standing outrank this skill. The source is the basis; do not repair or complete it from generic knowledge unless explicitly asked.

## Procedure

1. Establish the **source set and its standing**. Separate governing source, evidence, historical material, hypothesis, and projection.
2. Identify the **focal object and intended behavior** before extracting implementation details.
3. Extract explicit and strongly implied obligations in source language.
4. Normalize obligations as:
   - **SHALL** — required for the source intent to remain true;
   - **SHOULD** — strong desired behavior with legitimate exceptions;
   - **OPEN** — consequential choice or definition the source does not settle.
5. For each requirement, state a discriminating **acceptance test** or observable failure when the source supports one.
6. Separate:
   - **FACT / SOURCE-SUPPORTED**;
   - **INFERENCE**;
   - **OPEN / UNSUPPORTED**.
7. Preserve non-collapse distinctions explicitly when later design could erase them.
8. Only after requirements are stable, identify candidate entities, schemas, mechanisms, or implementations—and label them as design hypotheses unless independently authorized.

## Extraction questions

Ask:

- What behavior must survive regardless of implementation?
- What must remain distinguishable?
- What transition must be observable?
- What authority or standing conditions constrain the behavior?
- What failure would falsify the claimed requirement?
- Which tempting design choice is not actually specified by the source?

## Common conversions

Source statement: “an unanswered calibrated question is a valid populated cell.”

Requirement form: the system SHALL permit unresolved calibrated questions to persist without fabricating declarative answers for completeness.

Source statement: exploratory material must not become canon merely because it is polished or recent.

Requirement form: exploratory output SHALL NOT acquire governing standing from recency, polish, retrieval rank, or detail alone.

## Gotchas

- Requirements are not database tables.
- A candidate enum is not source truth merely because the source lists examples.
- Preserve superseded source value separately from former authority.
- Do not make retrieval order an authority order.
- If the source does not settle an approval rule, propagation algorithm, or taxonomy, leave it OPEN.
