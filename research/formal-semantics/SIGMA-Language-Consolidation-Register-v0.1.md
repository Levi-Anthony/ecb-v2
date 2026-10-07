# SIGMA Language Consolidation Register — Terms, Relations + Standing

Artifact key: `sigma-language-consolidation-register`
Version: 1
Kind: spec

---

## Language + standing grammar

The earlier flat disposition list was malformed. It mixed lifecycle, synonymy, D&I standing, and historical-use restrictions into one pseudo-axis.

Current entries in this register that still use labels such as `RETAIN / ALIAS / SCOPED / PROVENANCE-ONLY` are therefore **legacy provisional shorthand** until explicitly reclassified through the four-axis grammar below. They must not be read as proof that a full D&I has already occurred.

### Axis A — prospective language use

**PREFERRED** — default term for current prospective use at the stated seat.

**PERMITTED / SCOPED** — may be used prospectively only inside an explicit instrument, contract, layer, or qualified sense.

**DEPRECATED** — still interpretable and temporarily tolerated, but new use should migrate unless exact compatibility requires it.

**RETIRED** — do not use prospectively for the former job.

This axis answers: **Should we keep using this term prospectively, and where?**

### Axis B — relation to neighboring vocabulary

**PRIMARY** — chosen current label for the structure/job.

**ALIAS** — alternate label for the same structure/job at the same seat.

**PREDECESSOR / SUCCESSOR** — lineage relation across versions or theory development.

**PROJECTION / REPRESENTATION** — a view/materialization of another structure, not an alias for the structure itself.

**NO-EQUIVALENCE ESTABLISHED** — neighboring terms remain distinct or unresolved; shared wording does not license substitution.

**RELATION OPEN** — D&I has not yet established whether the terms are alias, predecessor/successor, projection, sibling, or something else.

This axis answers: **What is this term's relation to nearby terms?**

### Axis C — D&I / structural standing

**D&I-QUALIFIED** — explicit differentiation and integration has established characteristic work, nearest-neighbor boundaries, sensors/discriminators, hostile substitutions, and resulting standing.

**DERIVED FROM QUALIFIED STRUCTURE** — the distinction follows from already-qualified operators/contracts strongly enough for current use, but has not received its own full D&I.

**PROTECTED PENDING D&I** — do not merge or retire yet because plausible independent work would be lost, but irreducibility has not been fully qualified.

**OPEN** — live unresolved semantic/structural question.

**FAILED / COLLAPSED** — dedicated D&I showed the proposed distinction does not survive.

This axis answers: **How strongly has the distinction itself been earned?**

### Axis D — historical-use restriction

**CURRENT-FACING PERMITTED** — may appear in current normative/explanatory language subject to Axis A scope.

**EXACT-SCOPED HISTORICAL USE** — preserve and reuse only when referring to the named historical instrument, API, artifact, procedure, or lineage.

**PROVENANCE-ONLY** — may appear to report historical language or source wording; must not control current prospective language.

This axis answers: **Where may the historical term still legitimately appear?**

### Important consequence: RETIRED and PROVENANCE-ONLY are not siblings

A term can be:

- RETIRED prospectively + PROVENANCE-ONLY historically;
- RETIRED prospectively + EXACT-SCOPED HISTORICAL USE for compatibility or a named instrument;
- PREFERRED prospectively + PROVENANCE-ONLY for one obsolete sense;
- PERMITTED / SCOPED prospectively while an older broader use is retired.

Never encode these as one flat enum.

### Sensor requirement

A state, disposition, qualification, or D&I result is malformed if it cannot answer:

1. **What discriminating question was asked?**
2. **What observable or attributable answer would move the classification?**
3. **What nearby alternative would the sensor distinguish?**
4. **What transition/reentry condition follows from each answer?**

A label without a sensor is descriptive prose, not an operational classification.

### Burden of proof

Merging, retiring, or declaring alias-equivalence requires proof that no independent distinction, constraint, typed operation, inference, provenance role, sensor, or generative question is lost.

Protective retention is not proof of irreducibility.

Difficulty, abstraction, unfamiliarity, or stylistic preference are not grounds for retirement.


## Core theory terms

| Term | Disposition | Current job / boundary |
|---|---|---|
| **SIGMA** | RETAIN | Applied instrumental constitutive meta-architecture. Do not reduce to worldview synthesis, ECOS, or a domain method. |
| **Binding Infinity** | RETAIN | Governing problem/relation: preserve indefinitely extensible recoverability and generativity while permitting finite, PGO-bound work. |
| **local closure without global foreclosure** | RETAIN | Compact governing law of Binding Infinity. Local sufficiency does not exhaust the referent or remaining possibility space. |
| **constitutive** | RETAIN / CLARIFY | Names the layer of reusable conceptual relations and constraints from which more specific operations can descend. Not a synonym for “important” or for constituent membership. |
| **Operational layer / ECOS** | RETAIN | Runtime realization, continuity, records, tools, authority, workflows, and execution. Does not define SIGMA's purpose. |
| **meta-architecture** | RETAIN | Architecture of reusable operators/relations for constructing, comparing, governing, revising, and relating lower-level architectures/inquiries. |
| **instrumental** | RETAIN | Concepts are used because of the work they enable; utility alone does not promote them to metaphysical truth. |
| **open-world** | RETAIN / CLARIFY | The grammar admits unknown, novel, or unclassified referents/relations without requiring a complete prior ontology. Not “anything goes.” |
| **finite coherence / finite-coherence architecture** | SCOPED | ECO-162 descriptor for coherent finite engagement with an open semantic field. Useful formal architecture label; not a replacement name for SIGMA or Binding Infinity. |
| **generativity** | RETAIN | Capacity to expose or produce new distinctions, relations, questions, constraints, hypotheses, and possibilities—not merely organize known content. |
| **sensemaking** | RETAIN / CLARIFY | Beneficiary-facing activity of making a referent/situation intelligible enough for inquiry or use. Do not collapse into navigation or generativity. |
| **integration** | CLARIFY | Use only when previously distinct structures are actually combined while preserving required distinctions. Do not use for comparison, coexistence, relation, composition, or reconciliation. |
| **orchestration** | SCOPED / CLARIFY | Coordinated use of multiple installed capabilities under governing conditions. Retain in “generative orchestration basis” and the qualified situated orchestration profile. Do not use as generic synonym for coordination. |
| **coordination** | RETAIN | Ordering and governing interactions, phases, branches, returns, and transitions. Broader plain term than orchestration. |

## Referential and structural terms

| Term | Disposition | Current job / boundary |
|---|---|---|
| **Referent (R)** | RETAIN | The thing currently held as the object of inquiry. Stable reference does not imply complete description or ontological exhaustion. |
| **focal referent** | RETAIN | The Referent currently privileged as R in a bounded inquiry. |
| **seat / seating** | RETAIN / CLARIFY | The situated placement of R together with the coordinates needed to inquire into it lawfully. Not a synonym for R itself. |
| **focal seat** | RETAIN / CLARIFY | The current situated inquiry seat. Keep distinct from the referent, frame, and PGO. |
| **boundary (B)** | RETAIN | The declared constituent/individuation cut for the current inquiry. Boundary can change without necessarily changing PGO or frame. |
| **individuation** | RETAIN | The act/criterion by which a referent is treated as this bounded whole rather than another. Do not collapse into boundary text alone. |
| **grain** | RETAIN | Resolution at which a referent is individuated or inspected. Grain change can force reseating; it is not automatically “more detail.” |
| **frame (F)** | RETAIN | Interpretive/methodological coordinate through which mapping/disclosure occurs. Does not equal referent or mapper. |
| **mapper** | RETAIN | The standpoint/agent/process producing or applying a map. Preserve separately where attribution changes interpretation. |
| **access** | RETAIN | The means/conditions through which a method or participant can obtain a disclosure. Related to frame, not identical to it. |
| **map / representation** | RETAIN | Representation of the referent. Map ≠ referent; representation does not create standing/currentness/authority. |
| **engagement projection / view** | SCOPED / RETAIN | Convenient composed read/interface over independent coordinates. Never the source of truth, authority, or currentness by itself. |
| **holon** | RETAIN | Internal/general term for a whole that is also part of larger wholes. Carries Wilber/Koestler genealogy and recursive whole/part obligations. |
| **holonic** | RETAIN | Adjective for those whole/part relations and recursive constraints. Plain-language “whole/part” may introduce it but does not replace it. |
| **holarchy / holarchic** | RETAIN / CLARIFY | Ordered whole/part dependency structure. Do not use for any hierarchy, ranking, or containment tree. |
| **constituent / constitutive relation** | RETAIN | What helps compose the designated whole as that whole. Keep distinct from relevance and participation. |
| **participatory relation** | RETAIN | Relation in which R participates in a larger field/whole without thereby making the related item a constituent of R. |
| **Level** | RETAIN | Witnessed asymmetric existence/dependency + constitutive organization relation. Not size, rank, complexity, or universal ladder. |
| **Quadrant** | RETAIN | One of four required co-arising, inseparable, irreducible disclosures of the same referent. Generator/naming is OPEN. |
| **Face** | ALIAS / SCOPED | Useful descriptive term for a disclosed aspect/position where source context warrants it. Do not silently replace formal Quadrant terms before the fork is resolved. |
| **Line** | RETAIN | Continuing basis for comparing development/change across multiple states or positions. Not a single ability score. |
| **State** | RETAIN | Actual configuration of R under an explicit basis and occasion. Basis-relative; not Stage. |
| **Stage** | RETAIN | PGO-relevant developmental landmark requiring a valid Level relation and Line. Not every state or sequence position. |
| **Type** | RETAIN | Classification under an explicit classification scheme. Type need not imply development, hierarchy, or identity essence. |
| **Direction** | RETAIN | Fundamental directional pressure/capacity: preserve self, adapt in relation, form a larger whole, dissolve current whole. |
| **capacity** | RETAIN | Ability/potential to move or respond in a Direction under conditions. Do not equate with actual change. |
| **capability** | RETAIN / CLARIFY | Composed usable ability arising from capacities plus conditions/resources/coordination. Do not use interchangeably with Direction or capacity. |
| **possibility space** | RETAIN / CLARIFY | Set/range of admissible states or continuations. |
| **possibility structure** | RETAIN | Constraints, dependencies, topology/relations, and generative organization that shape a possibility space. Do not merge with possibility space. |
| **latent** | RETAIN / CLARIFY | Not currently manifest/determinate but structurally available under the relevant grammar. Not a synonym for unknown, dormant, or absent. |
| **location** | OPEN / SCOPED | Current Quadrant-axis language in the singular/plural × latent/location formulation. Preserve for the fork; do not globalize beyond the current semantic work. |

## Governing and telic terms

| Term | Disposition | Current job / boundary |
|---|---|---|
| **Principal Governing Orientation (PGO)** | RETAIN / PREFERRED | Current primary term for the governing/telic axis. Carries purpose/telos, initiating contrast, obligations, relevance/admissibility, evidence/access where governing, intended Move, sufficiency/stop/fail, reentry, unresolved questions, and related reliance conditions. |
| **Governing Orientation (GO)** | ALIAS / RETAIN GENERIC | Generic descriptor/category for the PGO lineage. Use when discussing the function without asserting the complete PGO record. |
| **Master Key** | ALIAS / PROVENANCE-SCOPED | Historical/instrument lineage for governing orientation/operational-definition grounding. Do not use as current primary theory term unless invoking that specific instrument/procedure. |
| **Orientation Resolution** | RETAIN / SCOPED | Representation/materialization of one governing composition. Does not itself create currentness, qualification, authority, or the governing function. |
| **Orientation Scope** | RETAIN / SCOPED | Declared scope over which a governing orientation applies. Do not conflate with referent boundary. |
| **telos / purpose** | RETAIN | Why the work exists / intended end or valued change. A major PGO component, not the whole PGO. |
| **initiating contrast** | RETAIN | The difference, tension, problem, or opportunity that caused the inquiry to open. Helps explain why this PGO exists. |
| **obligation / constraint** | RETAIN | Condition the work must respect. Not interchangeable with preference, evidence, or authority. |
| **relevance** | RETAIN / DISCIPLINED | Relation to the active PGO. Must state or recover the discriminator. Relevance does not imply truth, existence, authority, or constituency. |
| **admissibility** | RETAIN | Whether material may legitimately enter a bounded decision/inquiry surface under stated criteria. Not the same as truth or relevance. |
| **consequence / consequentiality** | RETAIN | Ability of a difference to change interpretation, evidence burden, standing, decision, transition, or action under the active PGO. |
| **sufficiency** | RETAIN | Enough support/resolution for a declared use under a PGO. Never global completeness. |
| **stopping condition** | RETAIN | Explicit condition under which additional inquiry is no longer required for the bounded use. Derived downstream of PGO. |
| **definition of done** | ALIAS / SCOPED | Useful implementation/project expression of a stopping condition. Not equivalent to PGO or general sufficiency. |
| **fail condition** | RETAIN | Condition showing the current orientation/result cannot support the intended use. |
| **reopening / reentry condition** | RETAIN | Condition that makes previously closed/dormant inquiry consequential again. |
| **local closure** | RETAIN | Bounded close under the current PGO. Not metaphysical or global closure. |
| **global foreclosure** | RETAIN | Illicit conversion of local closure into denial of remaining possibility/remainder. Used mainly in the paired law. |
| **meaning** | CLARIFY | Keep when genuinely semantic or telic; do not use as an unsupported all-purpose positive term. “Meaningful” must resolve to a stated standard/consequence. |

## Evidence, standing, currentness and authority

These terms must not be merged. The architecture depends on their independent changeability.

| Term | Disposition | Current job / boundary |
|---|---|---|
| **claim / assertion** | RETAIN | Proposition expressed by a source/actor. Assertion alone gives no warrant or standing. |
| **evidence** | RETAIN | Observed/material support relevant to a claim or decision. Evidence ≠ claim and ≠ warrant. |
| **warrant** | RETAIN | Basis that licenses an inference, reliance, or transition from evidence/conditions to a claim/use. |
| **standing** | RETAIN | What a claim/result/record is currently entitled to support. Standing ≠ confidence, warrant, authority, or currentness. |
| **qualification** | RETAIN | Bounded evaluation of an exact subject against an exact basis/use. Qualification ≠ currentness and ≠ truth. |
| **confidence** | RETAIN | Degree of belief/uncertainty. Confidence does not create standing. |
| **truth** | RETAIN | Property/claim about correspondence or correctness within the relevant semantics. Never infer from relevance, currentness, persistence, or authority. |
| **verification** | RETAIN | Result of a specified checker/method against specified obligations. Verification proves only what the checking surface can discriminate. |
| **PASS** | RETAIN / SCOPED | Qualification result whose force is bounded by checker sensitivity, inputs, obligations, and negative controls. |
| **proof sensitivity** | RETAIN | Requirement that a PASS surface can detect relevant violations of the proposition it claims to establish. |
| **currentness** | RETAIN | Whether a representation/result is the currently selected/re relied-on one for a scope. Current ≠ newest. |
| **current binding / binding state** | RETAIN / SCOPED | Coordination state created by an explicit binding transition. Not truth, qualification, or action permission. |
| **authority** | RETAIN | Standing to decide, bind, approve, govern, or otherwise confer a defined effect. Must name the authority type/scope. |
| **authorization / permission** | RETAIN | Permission to perform a particular action/effect. Authority may be a basis; authorization is the scoped permission. |
| **custody** | RETAIN | Responsibility/control over a work item, artifact, transition, or action surface. Custody ≠ authority. |
| **source** | RETAIN | Origin of a claim/record/evidence item. |
| **provenance** | RETAIN | Traceable origin, lineage, transformations, and custody relevant to interpreting an item. |
| **applicability** | RETAIN | Whether a result/contract legitimately applies under current conditions. Applicability ≠ truth or currentness. |
| **reliance** | RETAIN | Actual permitted use of a result for a declared purpose. Often downstream of qualification/current binding. |
| **promotion** | RETAIN | Explicit change from one standing/dimension to another. No silent promotion across dimensions. |

## Temporal and coordination terms

| Term | Disposition | Current job / boundary |
|---|---|---|
| **SSMM** | RETAIN | Sense–Shape–Move–Metabolize. Temporal/coordination grammar and fractal work pattern. |
| **Sense** | RETAIN | Oriented opening, recovery, discrimination, questioning, and evidence contact. Not endless exploration. |
| **Shape** | RETAIN | Progressive organization/binding of the field into a form ready for consequential Move. Not merely “planning.” |
| **Move** | RETAIN | Consequential commitment/enactment. Move-open does not itself create external authority. |
| **Metabolize** | RETAIN | Receive consequences, update standing, preserve residue, propagate learning, and seed closure/reentry. |
| **metabolization** | ALIAS / GRAMMATICAL | Noun for the process performed by Metabolize. Do not treat as a separate phase. |
| **phase** | RETAIN | Coordination state within an SSMM episode. Phase ≠ permission or truth. |
| **episode** | RETAIN | Bounded instance of work with lineage, parent/child relation, and phase state. |
| **branch** | RETAIN | Divergent child or parallel work path whose dependency/order must remain explicit where consequential. |
| **return** | RETAIN | Structured transfer of a child/branch result back to its receiving work surface. |
| **suspension** | RETAIN | Temporary halt that preserves reentry conditions and standing. Not closure. |
| **reentry** | RETAIN | Lawful resumption/reopening using preserved coordinates, lineage, and trigger conditions. |
| **supersession** | RETAIN | Explicit lineage relation by which a successor displaces a predecessor's current governing use while preserving history. |
| **temporal fractal** | RETAIN / CLARIFY | Same SSMM generative/coordination grammar recurs lawfully across nested work scales. Do not use merely for visual self-similarity. |
| **causal time / happened-before** | RETAIN / SCOPED | Ordering relation needed where dependency/transition semantics require more than timestamps. |
| **epoch / basis** | RETAIN / SCOPED | Applicability/currentness basis under which a qualification or result was earned. Useful where same payload can change standing across dependency histories. |

## Typed operations and transition terms

Typed operations must not be flattened into generic verbs when the operation contract matters.

| Term | Disposition | Current job / boundary |
|---|---|---|
| **Seat** | RETAIN | Establish a lawful situated basis for inquiry around R and required coordinates. |
| **Enrich** | RETAIN | Add structure/evidence/relations without changing the controlling referent/boundary in ways that require reseating. |
| **ReviseBoundary** | RETAIN | Change the declared constituent/individuation boundary under explicit continuity logic. |
| **Reseat** | RETAIN | Change the focal referent under preserved lineage and requalification. Not just “change focus.” |
| **Refocus** | ALIAS / CLARIFY | Plain/older descriptor. Use only when no referent identity/boundary contract is being asserted; otherwise use Reseat. |
| **Reorient** | RETAIN | Change PGO/governing orientation while preserving other coordinates unless independently changed. |
| **ChangeFrame** | RETAIN | Change mapper/frame/access conditions and requalify affected mappings/evidence. |
| **Requalify** | RETAIN | Re-evaluate standing/applicability against a changed basis or material dependency. |
| **Relate** | RETAIN | Add or assert a typed relation without silently changing identity or constituency. |
| **Compose** | RETAIN | Form a higher-order/composite structure from related constituents under explicit individuation/continuity. |
| **TraverseQ / Quadrant traversal** | RETAIN / SCOPED | Move among Quadrant obligations while holding R/B fixed. |
| **projection / derive view** | RETAIN | Produce a representation for a use without promoting it to source of truth/currentness. |
| **binding transition** | RETAIN | Explicit transition that establishes current reliance/currentness for scope when warranted. |
| **select / reaffirm / withdraw** | RETAIN / SCOPED | Currentness/binding operations; keep distinct where implementation contract does. |
| **exteriorize** | RETAIN / CLARIFY | Move material out of active computation while preserving Question Forward/reentry/fidelity. Not deletion. |
| **reconcile / reconciliation** | RETAIN | Resolve effects of change across prior support and new obligations. |
| **two-sided reconciliation** | RETAIN | Explicitly checks both affected-old support and destination/new-basis obligations. Do not merge into generic “review.” |
| **transport / bridge** | SCOPED | ECO-191 change/reuse operation moving support across basis where continuity is warranted. Not generic synonym for transformation. |
| **handoff / transfer** | RETAIN / CLARIFY | Externalize/reconstruct a bounded engagement across worker/surface. Handoff representation ≠ authority/currentness. |
| **reconstruction** | RETAIN | Recover enough situated structure from a handoff/record to resume lawfully. |
| **compression / folding** | RETAIN / CLARIFY | Reduce active representation while preserving required distinctions/recovery handles. “Fold” remains useful in Integral lineage; do not treat every summary as a formal fold. |
| **unfold / re-expand** | RETAIN | Recover compressed/dormant structure when consequential. |

## Aperture, inquiry and diagnostic terms

| Term | Disposition | Current job / boundary |
|---|---|---|
| **Question Forward (QF)** | RETAIN | Convert a material unresolved difference into an explicit answerable question with a reentry route. Not a generic todo list. |
| **sensor** | RETAIN / SCOPED | Observable trigger/condition tied to a Question Forward or dormant possibility. |
| **discovery aperture** | RETAIN | Bounded opening through which candidate structure/evidence can enter inquiry under current orientation. Not generic search. |
| **Situated Referent Discovery** | RETAIN / SCOPED | Current leading opening/recovery/generative frontier. A procedure/frontier inside SIGMA, not SIGMA's top-level purpose. |
| **Overshoot** | RETAIN / SCOPED | Bound-finding/disconfirmation procedure: intentionally cross the assumed bound to detect incoherence/vacuity and recover the last coherent position. |
| **Decoder Ring** | RETAIN / SCOPED | Historical token-portable derivation procedure. Distinct from PGO/Governing Orientation and from the deeper architecture. |
| **Bootstrap Warrant** | RETAIN | Cross-cutting transition precondition permitting provisional first engagement without completed prior loop. |
| **Bootstrap B** | RETAIN / SCOPED | ECO-191 formal bootstrap contract; use exact source semantics, not as generic bootstrap synonym. |
| **Three Goedel-Signals** | SCOPED / CLARIFY | Diagnostic escalation aliases over existing failure modes: circularity/regress, smuggled standing, performative contradiction. Not new semantic primitives. |
| **operationalizability** | CLARIFY / RETAIN-SCOPED | Older strong selection pressure. Retain as “can this produce/usefully govern observable work?” but do not let it replace PGO-relative consequentiality, sufficiency, or truth/standing distinctions. |
| **definition of done** | ALIAS / SCOPED | Implementation/project expression of bounded sufficiency. Not the general theory of stopping. |
| **holonic spelunking / profundity-spelunking** | ALIAS / EXPLANATORY | Memorable failure label for ungated expansion. Keep as explanatory language, not as a formal state. |
| **motivated under-mapping** | RETAIN / DIAGNOSTIC | Failure generator in which inquiry closes or narrows because mapping cost is avoided. Keep separate from legitimate PGO-bound stopping. |

## Claim-status and architecture-status grammar

These words describe different burdens. Do not use them as interchangeable markers of confidence.

| Term | Disposition | Use |
|---|---|---|
| **axiom** | RETAIN / STRICT | Explicit starting stipulation of the instrument/theory at a declared scope. Does not imply metaphysical truth. Current examples include holonic and Quadrant instrumental axioms. |
| **invariant** | RETAIN / STRICT | Relation/distinction that must remain preserved across a specified class of transformations or implementations. Scope and transformation class must be named. |
| **law** | RETAIN / STRICT | Strong derived/governing relation that organizes multiple lower rules and survives the relevant pass/fail burden. Use sparingly. “Local closure without global foreclosure” can function as a governing law. |
| **principle** | RETAIN | General governing or design rule whose exact enforcement may vary by layer. Weaker than a formal invariant unless separately installed. |
| **contract** | RETAIN / STRICT | Explicit set of obligations, interfaces, allowed changes, forbidden changes, failure conditions, and requalification conditions for a bounded object/operation. |
| **requirement** | RETAIN | A must-condition under a declared scope/authority. |
| **obligation** | RETAIN | Required burden placed on inquiry, a worker, or a structure under specified conditions. |
| **rule** | RETAIN | Explicit conditional or normative relation. State scope and authority where consequential. |
| **heuristic** | RETAIN | Useful guide that does not by itself bind standing or guarantee correctness. |
| **operator** | RETAIN | Reusable transformation/inquiry move with identifiable input/output and preserved/changed coordinates. |
| **instrument** | RETAIN | Portable method/tool composed of rules/operators used to produce or test a result. |
| **procedure** | RETAIN | Ordered method for performing work. A procedure may instantiate an instrument or contract. |
| **framework** | CLARIFY | Broad organizing structure. Too weak to stand in for meta-architecture, contract, or theory when those stronger claims are intended. |
| **theory** | RETAIN | Coherent explanatory/generative structure with explicit commitments and relations that is now compiled and subjected to pass/fail hardening. |
| **hypothesis** | RETAIN / RESERVED | Genuine unresolved explanatory or structural claim awaiting discriminatory test. Do not apply to installed theory commitments merely because they remain revisable. |
| **candidate** | RETAIN / RESERVED | Alternative under selection/qualification. Once selected/installed, remove candidate language. |
| **provisional** | RETAIN / RESERVED | Temporarily usable under explicit limits pending a named condition. Not a generic humility word. |
| **working** | CLARIFY | Current but not necessarily qualified. Name what makes it “working.” |
| **installed** | RETAIN | Currently adopted in an architecture/runtime at the named layer. Installed ≠ proven true. |
| **qualified** | RETAIN | Has passed an explicit bounded evaluation for a declared use/basis. |
| **governing** | RETAIN | Currently controls decisions/interpretation within an authorized scope. Governing ≠ universal truth. |
| **current** | RETAIN | Selected/re relied-on now for the specified scope. Current ≠ newest. |
| **historical / provenance** | RETAIN | Preserved evidence of prior state/source. Does not control current use unless separately restored. |
| **superseded** | RETAIN | Replaced for current governing use by an explicit successor while remaining recoverable as history. |
| **retired** | RETAIN | No longer used prospectively for its former job. Distinguish from superseded where there is no one successor. |

## Current consolidation decisions

The following decisions are strong enough to guide current language now.

### Retain as distinct
Referent; boundary; grain; frame; mapper; access; evidence; warrant; standing; qualification; confidence; currentness; authority; authorization; custody; applicability; truth; activation; coverage; disposition; PGO; URG; SSMM; fidelity; recoverability; Question Forward; Level; Line; State; Stage; Type; Direction; capacity; capability.

These terms protect independently variable structure. They must not be compressed into generic “context,” “status,” “orientation,” or “meaning.”

### Normalize primary naming
Use **Principal Governing Orientation (PGO)** as the primary current term for the governing/telic function.

Use **Governing Orientation** as the generic category/descriptor.

Treat **Master Key** as retained historical/instrument language unless invoking that specific derivation/operational-definition instrument.

### Preserve descriptor/object distinctions
An **engagement projection** is a view, not the engagement itself.

An **Orientation Resolution** is a representation of a governing composition, not the governing function itself.

A **Current Binding** is a coordination/currentness state, not qualification or truth.

A **handoff** is a transfer/reconstruction mechanism, not the transferred referent or authority.

### Preserve structural-family distinctions
Do not merge Level, Line, State, Stage, Type, Direction, capacity, or capability.

Do not merge constituency with participation.

Do not merge possibility space with possibility structure.

Do not merge unknown, latent, dormant, uncovered, unexamined, and nonconsequential-now.

### Preserve formal status distinctions
Do not call an axiom an invariant unless preservation across a transformation class has been established.

Do not call a principle a contract unless explicit obligations/interfaces/failures are specified.

Do not call an installed theory commitment a hypothesis merely because it remains falsifiable.

Do not call a historical term current merely because search/retrieval still returns it.

## Terms intentionally left open

Language consolidation does not decide live structural questions.

### Quadrant generator
The fourfold co-arising, inseparability, and irreducibility are installed theory commitments.

The generator/naming remains OPEN between:
- the installed ECO-221 product: **Constitutive / Participatory × Governing / Determinate**;
- the bleeding-edge **I / It / We / Its** disclosure formulation;
- current SIGMA axis language such as **singular / plural × latent / location**, insofar as it claims generator standing.

These must be translated into the same contract format before adjudication.

### Mapper / frame / access packaging
All three are retained because they can matter independently. Whether they should remain one packaged F-coordinate in every formal surface is an implementation/formalization question, not a vocabulary merge.

### Fidelity / recoverability relation
Both are retained. Fidelity names preservation of independent distinctions; recoverability names the ability to reconstruct/re-enter them after compression/change. Whether recoverability is fully derivable from fidelity or a distinct cross-cutting requirement remains a theory-compilation question.

### Binding / current reliance
“Binding” is overloaded across Binding Infinity, Current Binding, binding transition, and Shape's increasing constraint. Keep all current uses only with explicit qualifiers until the relation among them is formally compiled.


---

## Pending consolidation additions integrated for repository review

The following sections are copied from pending human-gated ECB proposals so the complete language surface can be reviewed in one place. Their presence here does not apply those ECB proposals or change artifact standing.


## Coverage, activation and disposition

These are three different questions. Never collapse them into one generic **status**.

### Coverage — has this been examined?

**UNEXAMINED** — not yet inspected under the relevant obligation.

**EXAMINED** — inspected enough to assign a current disposition, including “still unresolved.”

Coverage says nothing by itself about truth, relevance, activity, or standing.

### Activation — is this receiving current attention/computation?

**ACTIVE** — currently participating in the work.

**DORMANT** — preserved and recoverable but not currently active.

Activation says nothing by itself about truth, standing, or future relevance.

### Disposition — what is the current treatment under the declared basis?

**RELIED_FOR_DECLARED_USE** — qualified enough to support the named use under the current basis. Not global truth.

**UNRESOLVED** — material uncertainty remains.

**NONCONSEQUENTIAL_NOW** — examined and currently unable to change the governing Move under the active PGO.

**CONDITIONAL / SENSORED** — currently nonblocking or dormant, with an explicit condition that would change its disposition.

**REJECTED / CONTRADICTED WITH WARRANT** — excluded for the declared basis with retained reason/evidence.

**PROHIBITED / IMPOSSIBLE UNDER QUALIFIED RULE** — stronger exclusion under an explicit rule and scope.

### Important combinations

The grammar must permit combinations such as:

- ACTIVE + UNRESOLVED;
- DORMANT + CONDITIONAL;
- ACTIVE + REJECTED, when retained as an adversarial comparator;
- EXAMINED + NONCONSEQUENTIAL_NOW;
- UNEXAMINED + DORMANT.

This prevents:
- not retrieved → absent;
- not active → irrelevant;
- unresolved → invalid;
- rejected for one basis → impossible everywhere;
- examined → relied upon.


## Unknown, latent, dormant, uncovered and absent

These terms are not synonyms.

**unknown** — the relevant fact/relation/state is not currently known.

**unexamined** — the inquiry has not yet tested or inspected the relevant obligation.

**latent** — a possibility, relation, structure, or capacity is structurally available but not currently determinate/manifest under the stated conditions.

**dormant** — known/preserved material is not currently active in the work.

**uncovered** — the current grammar or classification scheme cannot faithfully represent/classify the case yet. This is a positive diagnostic result, not failure to force a label.

**omitted** — not present in the current representation. Omission alone says nothing about existence or relevance.

**absent / nonexistent** — a positive claim that the referent/relation does not obtain under the stated semantics and evidence. Requires its own warrant.

No transition among these states may be inferred merely from retrieval behavior or lack of current activation.


## Legacy, proposal and scoped terms

These terms remain part of the project's language history. Their current standing must be explicit.

| Term | Disposition | Current standing |
|---|---|---|
| **worldview synthesis** | PROVENANCE-ONLY as SIGMA definition | Real historical description of an earlier SIGMA articulation. No longer the defining identity. |
| **Integral as keystone** | ALIAS / PROVENANCE | Useful historical statement that Integral held a structurally special role. Current language: Wilber/Integral is the primary structural genealogy, not master doctrine. |
| **Master Key** | ALIAS / SCOPED | Retain for the historical/token-portable instrument lineage and exact artifacts. PGO is the preferred current governing-axis term. |
| **Decoder Ring** | SCOPED | Distinct derivation procedure. Do not merge with PGO or Master Key output. |
| **FIBERR** | PROVENANCE / DOMAIN-SCOPED | Historical scoped work/orientation record/container family that tracks Filaments. Not a universal primitive. |
| **Filament** | PROVENANCE / SCOPED | Separate holonic/Integral grammar lineage. Do not collapse with FIBERR merely because they share recursive grammar. |
| **BRIMAR** | PROPOSAL-ONLY | Qualified naming proposal for a narrower orienting-composition projection. Not the deeper mechanism and not adopted. |
| **BRAID** | PROVENANCE / NO PROMOTION | Structural resonance only. No current promotion. |
| **Two-Door principle** | RETAIN / SCOPED | Boundary/admission pattern where the exact current artifact invokes it. Do not let the metaphor substitute for the explicit transition/gate contract. |
| **Activation Primer** | PROVENANCE / SCOPED | Historical operational artifact. Use the current activation/coverage/disposition grammar for theory-level explanation. |
| **vibe hazard** | EXPLANATORY ALIAS | Informal failure label for relying on felt elegance/relevance without an operational discriminator. Never a formal status. |
| **conformal transfer / conformal projection** | SCOPED / CLARIFY | Historical relation-preservation language. Retain where a qualified same-form-across-seat/scale claim is intended; do not use as loose synonym for similarity or transport. |
| **holoformic** | SCOPED | Reserved for type-similar/holoformic relation where distinct instances share relational form. Not a synonym for token-portable instrument or holonic. |
| **Crucible** | PROVENANCE / PROJECT-NAME | Historical/project identity. Not a theory term for the current deeper mechanism unless explicitly reintroduced. |


## Situated inquiry basis and composed views

The orchestration profile uses the situated inquiry index:

`kappa = (R, B, G, F)`

where:
- **R** = focal Referent;
- **B** = declared constituent boundary / individuation criterion;
- **G** = governing orientation / PGO interface;
- **F** = mapper, frame, and access conditions where consequential.

**Disposition: RETAIN / SCOPED.**

`kappa` is a compact situated inquiry basis. It is not a claim that R, B, G, and F are the only independent coordinates in the full theory.

It does not absorb:
- evidence;
- warrant;
- standing;
- qualification;
- currentness;
- authority;
- phase/SSMM state;
- coverage;
- activation;
- disposition.

Those remain independently variable where they affect interpretation or action.

A stable handle for R does not imply complete individuation.

A provisional R/B is permitted during bootstrap where the current use allows it.

Use `kappa` when the composed situated basis is the object of reasoning. Do not let the tuple replace the richer contracts of its coordinates.


## Recall and discovery modes

The situated orchestration profile defines four distinct jobs. They must not be merged into generic “retrieval.”

### Exact recall — RETAIN
Recover an explicitly addressed record, edition, or as-of basis faithfully.

Exact recall is record-directed. Semantic similarity is not a substitute.

### Situated recomposition — RETAIN
Revisit known material under a changed PGO, boundary, frame, or situated basis and explicitly requalify it.

The material may be the same while its current applicability or standing changes.

### Semantic discovery — RETAIN
Propose potentially relevant material or relations where no explicit path is yet established.

Discovery produces candidates, not relied evidence or current standing.

### Cross-context structural resurfacing — RETAIN
Activate prior material from another or apparently unrelated inquiry when an explicit or newly discovered structural/semantic path makes it consequential for the current use.

This may begin with semantic discovery, including embeddings or latent-space similarity, but relied use must recover identity/source/basis/standing and establish current applicability.

### Anti-collapse rules
Do not infer:
- semantic similarity → relevance;
- relevance → applicability;
- applicability → truth/currentness;
- repeated resurfacing → standing/authority;
- semantic rediscovery → exact recall.

“Retrieval” may be used as an umbrella implementation word only when the specific mode does not matter.


## READY, HOLD and bounded-use dispositions

**READY — RETAIN / SCOPED**

READY means the declared bounded use is sufficiently qualified under its current situated basis and PGO.

READY does not imply:
- complete knowledge;
- global closure;
- truth in every domain;
- universal currentness;
- authority beyond the declared use.

**HOLD — RETAIN / SCOPED**

HOLD means the bounded use is not yet sufficiently qualified and must preserve a discriminating Question Forward plus an exact reentry destination or condition.

HOLD is not:
- rejection;
- failure of the entire theory;
- archival dormancy;
- proof of impossibility.

**“depreciated state with explicit pointers to finish” — PROVENANCE-ONLY / SOURCE LANGUAGE**

Preserve as Principal source language for incomplete/reduced-reliance state.

Do not silently redefine it as HOLD or introduce it as a new executable status without an explicit contract.


## Target observables and unearned performance language

The orchestration profile preserves two useful target-observable terms.

### relational flow — RETAIN / SCOPED
Useful information can move across whole/part, participation, Quadrant, PGO, time/State/Line, domain schema, and discovered semantic relations while provenance and standing remain recoverable.

This is currently a target observable, not an established uplift claim.

### high-ratio recallable compression — RETAIN / SCOPED
Compact durable identity/relation/claim structures can reconstruct substantially richer situated understanding for later work without storing exhaustive monolithic history.

This is currently a target observable, not a proven compression ratio or recall-quality result.

Do not convert desired effects into performance claims before measurement.

Terms such as “high-ratio,” “efficient,” “better recall,” or “improved flow” require an explicit comparator and measurement basis when used as empirical claims.


## PGO non-manufacture law

**PGO may select and govern. PGO does not manufacture.**

This is a first-class anti-collapse law.

PGO may govern:
- consequential distinctions;
- relevance/admissibility under the engagement;
- required resolution;
- sufficiency;
- stop/fail conditions;
- reentry conditions;
- intended Move;
- which evidence/access conditions matter for the current use.

PGO does not by itself manufacture:
- Referent identity;
- constitutive membership;
- Level;
- evidence;
- truth;
- currentness;
- Type membership;
- authority;
- authorization/permission.

A relation can become essential to the current inquiry without becoming constitutive of the focal Referent.

A change in PGO may radically alter relevance, required evidence, active relations, and sufficiency while R and B remain unchanged.

This law protects the governing/telic axis from leaking into ontology, structure, epistemic standing, or authority.


## Three Goedel-Signals

The **Three Goedel-Signals** are retained as diagnostic escalation aliases over existing failure classes. They are not new semantic primitives.

### G1 — circularity / infinite regression
A justification, decomposition, or recursive opening depends on its own unsupported result or expands without earning an independent consequential distinction.

Do not fire on legitimate feedback loops, recurrent processes, or cyclic real-world dependencies merely because they are cyclic.

### G2 — smuggled standing
A claim acquires actuality, warrant, necessity, currentness, authority, or permission beyond its attributable basis.

Repair by restoring exact provenance/standing, requalifying, rejecting unsupported carryover, or routing the missing authority/warrant decision.

### G3 — performative contradiction
A proposed realization defeats a condition required by the governing commitment under which the realization is justified.

Ordinary tradeoff, preference tension, or downside is insufficient.

**Disposition: SCOPED / CLARIFY.**
Keep these as compact diagnostic names. Do not promote them into a new ontology or duplicate the underlying contracts they diagnose.


---

## Fixture-audit notes — PGO-Directed Situated Referent Orchestration Profile v0.1

The orchestration profile is a primary language fixture because it composes installed SIGMA/ECOS contracts without claiming a new primitive.

The current audit found these repair classes:

1. activation must remain distinct from disposition;
2. currentness/supersession must control over recency;
3. evidence, warrant, standing, and applicability must remain distinct;
4. typed coordinate changes must not be hidden in prose;
5. operational control must remain distinct from research reentry;
6. PGO may select and govern consequentiality but must not manufacture identity, constitution, evidence, truth/currentness, Type, authority, or permission;
7. exact recall, situated recomposition, semantic discovery, and cross-context structural resurfacing must remain distinct;
8. READY/HOLD are bounded-use dispositions, not generic status labels;
9. target observables such as relational flow and high-ratio recallable compression remain unmeasured until explicit comparators and measurements exist.

BRAIN fixture-audit receipt: `bd695ef7-ddc1-4df3-8acb-d8a02f5bae34`.


---

## Polysemy control — overloaded load-bearing terms

Some terms legitimately appear in more than one contract. Do not solve this by deleting the term. Qualify the use so the active contract is explicit.

### constitutive
Retain three distinct uses:

1. **constitutive layer** — SIGMA's layer of reusable conceptual relations and constraints;
2. **constitutive relation / constituency** — what composes a designated whole as that whole;
3. **Quadrant Constitutive** — the installed ECO-221 Quadrant seat, pending generator reentry.

Do not use bare **constitutive** where more than one of these readings is plausible.

### governing
Retain distinct uses:

1. **governing orientation / PGO** — telic/consequential orientation of the engagement;
2. **governing invariant / governing rule** — currently controlling normative rule under authorized standing;
3. **Quadrant Governing** — the installed ECO-221 Quadrant burden/position;
4. **governing law** — a theory-level relation only where law-standing is actually claimed.

Do not infer relation among these merely from the shared adjective.

### binding
Retain only with a qualifier:

- **Binding Infinity** — theory-level relation between open possibility and finite work;
- **Current Binding** — scoped currentness/reliance state;
- **binding transition** — operation that establishes or changes current reliance/currentness;
- **Shape binding / binding pressure** — progressive increase of constraint and action-readiness inside SSMM.

These are related by theory but not interchangeable.

### State / state
Reserve capitalized **State** for the qualified URG developmental/configurational contract.

Use lowercase **state** only for generic system condition, activation state, binding state, or other explicitly qualified state variables.

Do not let lowercase implementation state silently inherit URG State semantics.

### orientation
Prefer:
- **PGO / Governing Orientation** for the governing/telic coordinate;
- **Orientation Resolution** for a representation/materialization of one governing composition;
- **reorientation / Reorient** for the typed operation changing PGO;
- **oriented opening** only as a descriptive SSMM phrase.

Do not use **orientation** alone when it is unclear whether the object is PGO, a representation, or a process.

### basis
**Basis** is retained but should normally be qualified:
- situated inquiry basis;
- qualification basis;
- as-of basis;
- continuity basis;
- evidence basis;
- comparison basis.

A bare “basis changed” is insufficient when different kinds of basis would trigger different requalification.

### semantic
Retain **semantic** where meaning, reference, representation, interpretation, or domain semantics are genuinely at issue.

Prefer qualified forms:
- semantic discovery;
- semantic relation;
- domain semantics;
- semantic standing;
- semantic transformation.

Do not use semantic as a prestige adjective for anything conceptual.

### current / currentness
**Currentness** names the independent dimension.

Use **current** only with a recoverable scope: current for which referent, artifact, use, engagement, binding, or authority surface?

Current never means newest by default.

### standing
**Standing** remains the primary term for what a claim/result/record is currently entitled to support.

Always identify the object whose standing is being discussed. Do not let “standing” absorb warrant, confidence, authority, qualification, or currentness.

## Polysemy rule

When one surface form names several legitimate contracts:

1. retain the term if each use is established and useful;
2. qualify each use at first occurrence;
3. do not infer equivalence from shared wording;
4. do not create a new synonym solely to avoid repetition;
5. promote a vocabulary split only if qualification remains persistently ambiguous or causes operational error.

This is fidelity-preserving disambiguation, not terminological proliferation.
