DISPOSITION: EVIDENCE · NEIGHBORHOOD N13 · RECORDS R092–R093

# N13 — Geometry

> Machine-facing records. Plain-English result: [`../EXECUTIVE-EXTRACTION.md`](../EXECUTIVE-EXTRACTION.md) · Decoder: [`../GLOSSARY.md`](../GLOSSARY.md)


Primary seam: H5 — does the architecture instantiate a metric or local geometry sufficient
for mathematical conformality?

Neighborhood verdict: **H5 resolves to METAPHOR_ONLY at the prerequisite check.** Quota was
cut from 3 to 2 because no further coverage could change the answer: the prerequisite is a
metric on constitutive meaning, v2 has none, and §12 forbids inventing one. The single
substantive contribution is a **guardrail** — v2 *does* possess one real metric, in exactly
the place where using it as a meaning-metric would violate two frozen invariants.

---

### R092 — Ahlfors 1973 (conformal invariants)
`CITE` L. V. Ahlfors. *Conformal Invariants: Topics in Geometric Function Theory.* McGraw-Hill, 1973. · **HIGH**
`PROBLEM` Which properties of a domain survive conformal (angle-preserving) mapping?
`STRUCTURE` Conformal maps preserve angles and orientation locally; conformal invariants (extremal length, modulus, capacity) are quantities unchanged by such maps.
`GUARANTEE` Exact preservation of specified invariants under a rigorously defined class of maps.
`LOSS` Global distances and areas; only local angle structure is preserved.
`DETECTOR` An angle not preserved — the map is not conformal.
`REOPEN` n/a.
`SEAM` S-1
`INTERNAL` The Build Contract freeze line: "literal conformal geometry." FS-0001 classified conformal geometry as a research hypothesis requiring an operationally meaningful metric.
`DELTA` **Answers H5 definitively and negatively.** Conformality is defined only where angles are — requiring a Riemannian metric, or at minimum an inner product on tangent spaces. v2 has no metric on constitutive meaning, no tangent structure, no differentiable manifold of governance states, and no principled route to any of them. The §12 chain breaks at NATIVE PREREQUISITES and cannot be repaired without inventing exactly the metric §12 forbids. "Angle-preserving" as applied to SIGMA→ECOS is a figure of speech about proportion, not a mathematical claim.
`TRANSFER` **None.** Recorded as a closed negative result so the analogy is not re-opened without new prerequisites.
`PREREQ` A metric or inner product on governance states. Absent; inventing it is forbidden.
`PRESERVE` §12; the freeze line; FS-0001's rejection of manufacturing a metric for convenience.
`FALSIFIER` v2 earns a genuine metric on constitutive meaning from observed behavior — not from convenience. Nothing in the current architecture points toward one.
`BRANCH` BRANCH_DEPENDENT (prerequisites absent)
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` METAPHOR_ONLY
`EFFECT` ALREADY_PRESENT (confirms FS-0001's classification)
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 0

### R093 — Amari & Nagaoka 2000 (information geometry)
`CITE` S. Amari, H. Nagaoka. *Methods of Information Geometry.* AMS/Oxford University Press, 2000. · **HIGH**
`PROBLEM` Give statistical models a differential-geometric structure.
`STRUCTURE` Manifolds of probability distributions with the Fisher information metric and dual affine connections; divergences as geometric quantities.
`GUARANTEE` Geometric invariants of statistical inference with a canonical metric — the Fisher metric is not arbitrary.
`LOSS` Applies only to parameterized families of probability distributions.
`DETECTOR` The model is not a smooth family; the geometry does not apply.
`REOPEN` n/a.
`SEAM` S-5
`INTERNAL` BUILD 0's 384-dimensional `gte-small` embedding space with cosine similarity — v2's **only** real metric structure.
`DELTA` **The neighborhood's one substantive contribution, and it is a guardrail.** Information geometry earns its metric from a probability model; v2's embedding space has a metric earned from a *retrieval* model. It is genuine — Golden Trace 01 measured a real similarity of 0.919 — and it is a metric on **embedding vectors**, not on meaning, standing, or relevance. Treating cosine similarity as a meaning-metric would violate `map ≠ referent` (the embedding is a map of the thought) and `confidence ≠ standing` (similarity is not standing). Because this is the one place a metric genuinely exists, it is the one place the conformality analogy could be smuggled back in, and it must not be.
`TRANSFER` **None, plus an explicit prohibition:** embedding-space geometry may rank retrieval candidates and may never determine standing, relevance-as-authority, or governance conclusions.
`PREREQ` A probability family — absent. The embedding metric is not one.
`PRESERVE` `map ≠ referent`; `confidence ≠ standing`; `relevance ≠ authority`; `truth ≠ relevance`.
`FALSIFIER` A v2 mechanism where embedding distance legitimately determines a governance outcome. If one appears, it is an invariant violation to be caught, not a transfer to be adopted.
`BRANCH` BRANCH_CONFLICTING (if adopted as a meaning metric)
`ENFORCE` STRUCTURAL (as a prohibition)
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER
`EFFECT` CHALLENGES_EXISTING (challenges a latent misuse)
`BUILD` ADD_ACCEPTANCE_TEST — assert that no governance conclusion depends on a similarity score.
`PRIORITY` 2
