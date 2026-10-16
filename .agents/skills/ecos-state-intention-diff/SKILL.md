---
name: ecos-state-intention-diff
description: Use this skill when comparing the current implementation, repository, runtime, governance surface, or operating behavior against ECOS/SIGMA architectural intention. Classify each dimension as realized, deferred-by-design, drift/contradiction, or unobservable/untested, and distinguish local success from Master-Key fit.
metadata:
  status: "projection"
  version: "0.1"
---

# State–intention diff

Explicit user instructions and current governing sources outrank this skill. This is an audit procedure, not an architecture amendment.

## Procedure

1. Define the **intention source**. Prefer explicit governing or source material over reconstruction from current implementation.
2. Define the **current-state evidence**: repository state, runtime behavior, database state, user workflow, receipts, logs, or observed operation.
3. Compare by **functional obligation**, not vocabulary or file similarity.
4. For each obligation, assign one disposition:
   - **REALIZED** — causally instantiated and supported by evidence;
   - **DEFERRED-BY-DESIGN** — absent, but the absence is explicit and governed;
   - **DRIFT / CONTRADICTION** — current behavior works against the intended function;
   - **UNOBSERVABLE / UNTESTED** — evidence is insufficient to tell.
5. Separate **operational success** from **architectural standing**. A mechanism can work locally while serving the wrong containing Master Key.
6. Run an FCA/altitude check on any suspected drift: is a locally healthy control, freedom, or awareness distribution becoming pathological at a higher altitude?
7. Identify the smallest decision-relevant delta. Do not convert every gap into a build request.

## Questions

- What behavior was the mechanism intended to preserve or enable?
- What does the current mechanism actually make possible or impossible?
- What is explicitly withheld rather than missing accidentally?
- What would count as evidence that the implementation has become the “fish studying water” and is preserving itself instead of its purpose?
- Does real use expose capability the architecture cannot reveal in vitro?

## Output

Return a compact table or structured audit with:

`dimension → intention → current evidence → disposition → consequence → next discriminator`

## Gotchas

- “Works” is not the same as “aligned.”
- “Missing” is not the same as “deferred.”
- “Newest” is not the same as “current.”
- Do not infer intention from the implementation under review.
