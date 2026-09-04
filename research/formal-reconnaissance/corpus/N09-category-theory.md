DISPOSITION: EVIDENCE · NEIGHBORHOOD N09 · RECORDS R071–R075

# N09 — Category Theory and Compositional Structure

Primary seam: **S-1 / S-7 — structure-preserving propagation and composition.**

Neighborhood verdict: **one concrete transfer, four guardrails.** Institution theory (R071)
supplies an exact correctness condition for moving a specification between logics, which is
what SIGMA→ECOS projection is. Everything else in this neighborhood failed the §12
admission chain, and quota was reallocated after concrete transfer saturated. This is the
neighborhood where the temptation to promote elegance was strongest and was refused.

---

### R071 — Goguen & Burstall 1992 (institutions)
`CITE` J. A. Goguen, R. M. Burstall. *Institutions: Abstract model theory for specification and programming.* Journal of the ACM 39(1), 95–146, 1992. · **VERIFIED**
`PROBLEM` Specifications must move between logical systems without their meaning changing.
`STRUCTURE` An institution: signatures, sentences, models, and satisfaction, with the **satisfaction condition** — for a signature morphism σ, `M' ⊨ σ(φ) ⟺ M'|σ ⊨ φ`. Truth is invariant under change of notation.
`GUARANTEE` Translating a specification and then interpreting it gives the same answer as interpreting and then translating. Meaning survives the move.
`LOSS` Nothing, when the satisfaction condition holds; it is precisely the condition that nothing is lost.
`DETECTOR` **Satisfaction-condition failure** — a model satisfying the translated sentence whose reduct does not satisfy the original. That is semantic corruption, exhibited concretely.
`REOPEN` Fix the morphism, or the translation is not meaning-preserving and must be rejected.
`SEAM` S-1, S-7
`INTERNAL` FS-0001's TG-04 (commuting preservation); the projection requirement in REQ-S1.
`DELTA` **Answers H4 precisely, and better than functoriality does.** H4 asks whether translation can preserve specified relationships while representation changes, and whether a failed commuting relationship exposes semantic corruption. The satisfaction condition is exactly that: it is a commuting requirement between translation and interpretation, and its failure *is* the semantic-corruption detector H4 hypothesizes. Crucially it requires far less than full functoriality of the transformation — only that the signature morphism have a reduct, which a projection naturally does (drop the ECOS-specific vocabulary and read the SIGMA part). This makes it adoptable where "ECOS is a functor" is not.
`TRANSFER` State projection correctness as a satisfaction condition: an ECOS runtime state satisfies the projected invariant **iff** its SIGMA reduct satisfies the source invariant. A counterexample to the iff is semantic corruption and must block the projection.
`PREREQ` (i) a SIGMA sentence form for invariants, (ii) an ECOS model notion, (iii) a reduct taking an ECOS state to its SIGMA-relevant part. All three are within reach at BUILD 5–6, and the reduct is the only genuinely new artifact.
`PRESERVE` `map ≠ referent`; `runtime reorientation ≠ constitutional redesign`. The translation may change notation, never commitment.
`FALSIFIER` A SIGMA invariant with no ECOS reduct — i.e. one whose truth depends on something the runtime state does not determine. Several v2 invariants about *authority* may be exactly this, which is the same boundary R063 finds from observability. Convergent evidence from two neighborhoods.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL, SEMANTIC
`COST` OBJECT — the reduct is an artifact.
`RETURN` Yes — a satisfaction failure is high-value returned evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R072 — Sannella & Tarlecki 1988 (specification in an arbitrary institution)
`CITE` D. Sannella, A. Tarlecki. *Specifications in an arbitrary institution.* Information and Computation 76(2–3), 165–210, 1988. · **HIGH**
`PROBLEM` Build structured specifications and refinement independently of the underlying logic.
`STRUCTURE` Institution-independent specification-building operations; **implementation as a relation between specifications**, with composition of refinement steps.
`GUARANTEE` Refinement composes vertically (stepwise) and horizontally (across components), independently of the logic.
`LOSS` Logic-specific reasoning power.
`DETECTOR` A refinement step that does not compose.
`REOPEN` Reformulate the step.
`SEAM` S-1
`INTERNAL` The build sequence as stepwise refinement; R020 (refinement calculus).
`DELTA` Supplies the composition property R020 assumes: refinement steps compose vertically, so a chain of small justified projections is itself a justified projection. This matters directly for v2's build-by-Build-Unit discipline — it says the discipline is not merely tractable but sound, provided each step is a genuine refinement.
`TRANSFER` A chain of projection steps is correct if each step is; this licenses the small-diff Build Unit rule at the formal level.
`PREREQ` R071's institution structure.
`PRESERVE` Build Unit boundaries; "one Build Unit should fit in one comprehensible diff."
`FALSIFIER` A v2 projection chain where each step is individually sound and the composite is not — which would indicate a non-compositional side condition somewhere.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` VERIFY_EXISTING
`BUILD` VERIFY_EXISTING
`PRIORITY` 2

### R073 — Wadler 1989 (theorems for free)
`CITE` P. Wadler. *Theorems for free!* FPCA '89, 347–359. · **HIGH**
`PROBLEM` Derive properties of a function from its type alone.
`STRUCTURE` Relational parametricity: a polymorphic function must preserve any relation between the types it is instantiated at, because it cannot inspect them.
`GUARANTEE` Free theorems — preservation properties that hold with no proof about the implementation.
`LOSS` Applies only to genuinely parametric functions; anything that inspects its data is excluded.
`DETECTOR` A relation not preserved, which proves the function is not parametric.
`REOPEN` n/a.
`SEAM` S-7, S-1
`INTERNAL` H4's structure-preserving propagation.
`DELTA` A precise and mostly *negative* insight. Parametricity gives preservation for free **exactly because** the transformation cannot look at the content it carries. A v2 propagation that is genuinely content-blind (routing a packet without interpreting it) gets preservation guarantees for free. But every governance-relevant transformation v2 cares about — qualification, projection, adjudication — *must* inspect content, so it gets nothing for free. The useful consequence: separate the content-blind transport layer, where preservation is free, from the content-inspecting governance layer, where every preservation claim must be paid for.
`TRANSFER` Split propagation into a parametric transport component (free preservation) and an interpreting component (proof obligations). Do not claim preservation for the latter by analogy with the former.
`PREREQ` A type discipline that identifies which components are parametric.
`PRESERVE` `map ≠ mapper`.
`FALSIFIER` A v2 transport layer that must inspect content to route correctly — likely for relevance-based routing, which would remove the free guarantee.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R074 — Goguen 1991 (a categorical manifesto)
`CITE` J. A. Goguen. *A categorical manifesto.* Mathematical Structures in Computer Science 1(1), 49–67, 1991. · **HIGH**
`PROBLEM` When is category theory actually the right tool?
`STRUCTURE` Guidelines: categories for structured objects with structure-preserving maps; functors for translations; adjoints for canonical constructions; colimits for putting things together.
`GUARANTEE` None — methodological guidance from a founder of applied CT.
`LOSS` n/a.
`DETECTOR` Using categorical vocabulary where no morphisms have been identified.
`REOPEN` Identify the morphisms first, or drop the framing.
`SEAM` S-7
`INTERNAL` §12's analogy admission rule; the freeze line.
`DELTA` **Retained specifically as a guardrail against this reconnaissance's own most likely error.** Goguen's own criterion is that the morphisms must be identified before the categorical framing means anything. v2 has objects in abundance and has identified **no morphisms** — there is no defined notion of a structure-preserving map between governance objects. Under the manifesto's own test, ECOS is not yet a category, and calling it one would be exactly the "mathematical convenience as architectural truth" §3 forbids.
`TRANSFER` **None, deliberately.** Categorical framing of ECOS is premature until morphisms are defined. Institution theory (R071) is adoptable precisely because it needs only a signature morphism, not a category of governance objects.
`PREREQ` Identified morphisms — absent.
`PRESERVE` §12; the freeze line.
`FALSIFIER` v2 defines a genuine structure-preserving map between governance objects, at which point the framing earns reconsideration.
`BRANCH` BRANCH_FORCING — adopting it would force closure on the compositional structure of governance objects, which is open.
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` METAPHOR_ONLY
`EFFECT` ALREADY_PRESENT (v2's caution is already correct)
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 1

### R075 — Fong & Spivak 2019 (invitation to applied category theory)
`CITE` B. Fong, D. I. Spivak. *An Invitation to Applied Category Theory: Seven Sketches in Compositionality.* Cambridge University Press, 2019. · **HIGH**
`PROBLEM` Survey of applied categorical constructions, including Galois connections as adjunctions between preorders.
`STRUCTURE` Preorders, monoidal categories, operads, databases as functors, and Galois connections presented at the accessible level.
`GUARANTEE` None — expository.
`LOSS` n/a.
`DETECTOR` n/a.
`REOPEN` n/a.
`SEAM` S-1, S-5
`INTERNAL` AP-10's Galois aperture; the freeze line on "Galois formulations".
`DELTA` Confirms that a Galois connection is exactly an adjunction between preorders, i.e. it needs **only two preorders and two monotone maps** — a much lower bar than "full projection mathematics" suggests. This matters for AP-10: the aperture states that "meaningful partial orders and soundness relations have not been derived from observed behavior", and this record makes precise how small that missing piece actually is. See CF-03 and ACP-02 — the finding is routed to governance, **not adopted**, because the Build Contract freezes Galois formulations and this reconnaissance has no authority to lift a freeze.
`TRANSFER` **None here.** The observation about prerequisite size is recorded and routed to governance as an architecture-change proposal.
`PREREQ` Two preorders that v2 has not yet declared — though see R081 and CF-03 for an argument that one is already available at zero cost.
`PRESERVE` The freeze line. This reconnaissance may not resolve it.
`FALSIFIER` The candidate preorders turn out not to be preorders (e.g. permission comparison is not transitive).
`BRANCH` BRANCH_FORCING
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER (routed to governance as ACP-02)
`EFFECT` CHANGE_PROPOSAL_REQUIRED
`BUILD` ARCHITECTURE_CHALLENGE
`PRIORITY` 2
