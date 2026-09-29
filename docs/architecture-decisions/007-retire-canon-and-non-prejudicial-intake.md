STATUS: ACCEPTED BY PRINCIPAL FORWARD DIRECTIVE — 2026-09-29
DISPOSITION: DECISION_RECORD

# ADR-007 — Retire canon/canonical terminology; enforce non-prejudicial intake

## CONTEXT

Current ECOS/SIGMA architecture separately represents durable existence/provenance, standing, authority, currentness, qualification, control, supersession, persistence/custody, and production designation.

The legacy terms `canon` and `canonical` increasingly collapse those distinct relations into one omnibus category. That no longer matches the operating model.

Separately, capture/intake language has sometimes implied that admitted matter must “remain capable” of future relevance or use. That imports a future-facing retention/optionality obligation into the intake aperture.

## LOCAL DECISION

Effective 2026-09-29:

1. Do not introduce `canon` or `canonical` as live normative ECOS/SIGMA architecture language.
2. Historical occurrences remain intact where needed for provenance and must be interpreted in their dated context.
3. Live/current surfaces state the exact relation meant: provenance/existence, standing, authority, currentness, qualification, control, supersession, persistence/custody, production designation, or another explicitly named relation.
4. Do not replace the retired omnibus term with another omnibus synonym.
5. Capture/intake is aggressively non-prejudicial: admission records encounter/material + provenance and does not itself confer relevance, standing, authority, persistence, review debt, future optionality, entitlement to retention, qualification, routing, or promotion.
6. Phrasing such as “remain capable” is prohibited where it imposes future optionality or retention as an intake obligation.
7. The historical `thoughts` table may reorganize under an explicit intake module; its current placement is not architecturally final.

No separate investigation is required before halting new use of the retired vocabulary.

## WHY REQUIRED NOW

The retired vocabulary now obscures distinctions that are operationally important to current ECOS behavior and can cause authority/currentness/persistence semantics to be laundered together. Intake likewise needs a capture aperture that does not prejudge what admitted matter deserves downstream.

## ALTERNATIVES CONSIDERED

- Keep `canonical` but define it more carefully — rejected because the term remains an overloaded bundle.
- Investigate every use before stopping new usage — rejected as an unnecessary gate; live work can use precise relations immediately.
- Mass-rewrite all historical occurrences — rejected because it would damage provenance and erase the language under which earlier decisions were made.

## INVARIANTS AFFECTED

- provenance must survive reinterpretation;
- capture/admission does not confer semantic or governance standing;
- currentness and authority remain explicit and independently inspectable;
- historical evidence is not silently rewritten into present vocabulary.

## STANDING / AUTHORITY

Principal forward directive in conversation on 2026-09-29. Durable continuity:
- ECB handoff event 954 / `b6167667-ea3f-45e2-9207-03b851b1ddc9`;
- ECB thought `8bf88173-1582-41b2-8d70-9853657b8164`;
- ECB pulse `dba1b91a-ee30-4e1f-a5b8-6c48d40ca31c`;
- Linear ECO-210 — canceled provenance of the initially unwarranted work container; it is not the live owner. Forward vocabulary routes through ECO-118, intake architecture through ECO-177, and v2 tool-surface debt through ECO-155.

## REVERSIBILITY

Historical vocabulary is preserved, so the decision can be revisited without reconstructing erased evidence. A future change should add a new forward disposition rather than rewriting old records.

## REOPENING CONDITION

Reopen only if a concrete ECOS function cannot be represented precisely by the separated relations above. If such a function exists, name and qualify that function directly; do not restore `canon/canonical` by default.
