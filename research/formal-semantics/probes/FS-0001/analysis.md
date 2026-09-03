STATUS: ANALYZED

DISPOSITION: PROJECTION

PROBE_ID: FS-0001

ROLE: Normalized classification and candidate test generators

AUTHORITY: None independently

# FS-0001 — Bounded Action Abstraction

## New distinction

Represent uncertainty asymmetrically:

- the abstraction may over-approximate concrete states still possible;
- the action envelope must under-approximate actions legitimate across those states.

For abstraction \(a\), concretization set \(\gamma(a)\), and operation/Move class \(O\):

\[
\mathrm{Permitted}_O(a)
\subseteq
\bigcap_{c\in\gamma(a)} \mathrm{Permitted}_O(c)
\]

This is a candidate soundness condition, not yet a frozen invariant.

## Operational equivalence

Use the operation-indexed relation:

\[
x\sim_{M,O}y
\iff
x\text{ and }y\text{ license the same relevant action distinctions under Master Key }M\text{ for operation }O.
\]

This preserves:

operational equivalence ≠ identity.

It also yields a failure detector: if two states in one current equivalence class license different actions for \(O\), the abstraction is too coarse and must refine or refuse the action.

## Technical correction

Do not impose \(P^2=P\) on a compiler \(\alpha_M:X\rightarrow A_M\); the second application may be ill-typed.

Use semantic normalization stability first:

> Under unchanged source state, Master Key, warrant, scope, compiler version, and relevant context, recompilation must preserve consequential action semantics even when generated IDs, timestamps, or receipts differ.

A genuine projection can be reconsidered only after an earned embedding \(i:A\rightarrow X\) makes \(P=i\circ\alpha\) type-correct.

## Classification

| Item | Classification | Current route |
|---|---|---|
| Over-approximate states / under-approximate legitimate actions | Candidate soundness condition | Test-generator pipeline; AP-10 |
| Operation-indexed quotient \(\sim_{M,O}\) | Immediate reasoning machinery | Use to state collapsed distinctions and counterexamples |
| Semantic normalization stability | Candidate preservation test | Freeze only with an actual compiler specimen |
| Commuting preservation checks | Candidate test grammar | Compare promised preserved semantics, not artifact identity |
| Abstract interpretation | Serious prior-art quarry | Investigate when AP-10 triggers |
| Galois connection | Formalization aperture | Requires earned partial orders |
| Functorial transformations | Research hypothesis | Do not assume full functoriality |
| Conformal geometry | Research hypothesis | Requires an operationally meaningful metric |
| FCA as a vector space | Rejected shortcut | Do not manufacture a metric for mathematical convenience |

## Candidate test generators

### TG-01 — Robust-action soundness

Given an abstraction \(a\), operation \(O\), concrete witnesses \(c_1,c_2\in\gamma(a)\), and candidate action \(u\):

- if \(u\in\mathrm{Permitted}_O(a)\), require \(u\in\mathrm{Permitted}_O(c_1)\cap\mathrm{Permitted}_O(c_2)\);
- a witness for which \(u\) is illegitimate fails the abstraction.

### TG-02 — Refinement before license

Given \(c_1,c_2\in\gamma(a)\) that license different outcomes for desired action \(u\):

- require the compiler to refine/revalidate or refuse \(u\);
- fail if it emits an envelope authorizing \(u\) without discrimination.

### TG-03 — Semantic normalization stability

Compile twice with unchanged source state, Master Key, warrant, scope, compiler version, and relevant context:

- permit differences in generated IDs, timestamps, or receipt identity;
- require equality of consequential permissions, limits, provenance obligations, and revalidation triggers.

### TG-04 — Commuting preservation

Compare legitimate paths \(A\rightarrow B\rightarrow C\) and \(A\rightarrow C\):

- do not require artifact identity;
- require agreement on each relation, standing, warrant limit, provenance handle, and loss disposition promised to survive.

## Applied now

- Registered AP-10 for formal semantics of bounded action abstraction.
- Used AP-10 because AP-09 already identifies BUILD 0 physical substrate activation; existing aperture identities were not renumbered.
- Installed the formal-semantics research pipeline and stable probe layout.
- Preserved the source verbatim and separated it from this normalized projection.
- Made operational equivalence, robust-action soundness, normalization stability, and commuting preservation available as candidate test generators.

## Not applied now

- No frozen invariant changed.
- No Build Contract boundary changed.
- No acceptance test changed.
- No Galois connection, categorical ontology, conformal metric, or FCA vectorization was asserted.
- No BUILD 0 implementation dependency was introduced.

## Revalidation trigger

AP-10 triggers when automated action-envelope compilation or a build failure requires a formal answer about the safety of a lossy abstraction.
