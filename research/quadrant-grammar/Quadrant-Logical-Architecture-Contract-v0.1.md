# Quadrant Logical Architecture Contract v0.1

**Commission:** ECO-147 — substrate-independent Architecture Shape for the bounded quadrant module  
**Parent:** ECO-136  
**Accepted predecessor:** ECO-146 Architecture Sense  
**Qualified requirement basis:** ECO-144 R01–R10  
**Qualified semantic basis:** Functional Contract v0.2 + ECO-143 bounded Register B qualification  
**Repository continuity basis:** `research/quadrant-grammar/` on canonical `ecb-v2/main`  
**Standing:** reviewable Architecture Shape candidate; no physical design, implementation, deployment, runtime-conformance, or authority claim is created by this document.

**Cold-reader navigation:** Appendix A carries the inherited grammar, A–G, CP1–CP6, exact R01–R10, reentry labels and identity constraint. It is part of this contract; no external source is needed to recover those definitions. Qualification evidence remains separately scoped in the companion return.

## 1. Purpose and operating context

This contract selects the smallest substrate-independent logical architecture found sufficient to realize the accepted ECO-146 responsibility surface without reopening R01–R10.

The focal capability is the bounded quadrant inquiry module within SIGMA/ECOS/ECB v2. It supports situated inquiry about a referent when an account is preserved, constructed, assessed, revised, transferred, or relied upon. It does not define the whole URG, perform raw-intake redesign, create authority, plan or execute real-world effects, or choose storage/runtime technology.

A contributor may construct or revise inquiry material; an evaluator may assess meaning, evidence, boundary, coverage or sufficiency; a consumer may interpret, decide, hand off, or act using the result; governing sources supply authority where authority is required. One participant may occupy several roles, but role basis and limits must remain distinguishable.

**Consequential reliance** occurs whenever an account, claim, coverage judgment or sufficiency result is treated as adequate support for an interpretation, decision, promotion, handoff, or action whose meaning or permissibility would change if the account were wrong, stale, underspecified, outside scope, or inadequately warranted.

The architecture therefore distinguishes preserving evidence from qualifying reliance. Incomplete material may be retained and explored where the governing orientation permits; incompleteness must not silently become adequacy.

## 2. Selected logical architecture

The selected architecture has four logical roles and six inter-role contracts.

The four roles are:

1. **Situated Basis**
2. **Inquiry State**
3. **Applicability Reconciler**
4. **Reliance Qualifier**

These are logical responsibility boundaries, not mandated services, processes, actors, tables, objects, or deployment units. Physical design may combine or separate them provided the contracts and failure distinctions below remain recoverable.

The architecture deliberately does **not** create a fifth universal “account object,” global graph, universal currentness service, or giant record. Composition is use-scoped and may resolve information by reference.

### 2.1 Situated Basis

**Purpose:** preserve the recoverable subject, orientation and situated context under which an inquiry is meaningful.

**Primary responsibility families:** A and B.  
**Primary control points:** CP1, plus the basis side of CP5 and CP6.  
**Primary requirements:** R01, R02, R03, R07, R09, R10.

The Situated Basis must preserve or resolve, as required by the particular use:

- the focal referent and its warranted continuity;
- the distinction among referent, representation and mapper where consequential;
- the operative boundary and its rationale;
- constituent/co-relatum standing and relevance criterion;
- known open context and return paths;
- Governing Orientation, intended use, priorities, time/state scope, stop/fail/reentry conditions;
- source standing and governing authority where required.

It may refer to surrounding identity, source-custody, governance, or orientation capabilities rather than duplicating them.

**Output standing:** a Situated Basis is an inspectable basis for inquiry and later applicability assessment. It is not proof of completeness, truth, authority, currentness, or adequacy for a future use.

**Lifecycle/currentness:** changes in boundary, G, time/state, source standing, or explicitly known context create a new basis state or revision relationship. Ordinary enrichment may extend the account without changing the basis. Explicit refocus creates a linked new focal inquiry rather than masquerading as traversal of the previous subject.

**Failure behavior:** unavailable, incompatible, or inadequately warranted basis is exposed as such. Stable identity alone must not conceal a changed boundary or subject.

**Does not own:** claim support, fourfold coverage, semantic sufficiency, global co-reference, or execution authority.

### 2.2 Inquiry State

**Purpose:** preserve the question, coverage, claims, warrant and material uncertainty that constitute the current inquiry about the Situated Basis.

**Primary responsibility families:** C, D and E.  
**Primary control points:** CP2, CP3 and CP4.  
**Primary requirements:** R03–R08 and R10.

Inquiry State must preserve enough lineage to inspect:

- original questions and their clarified/decomposed descendants;
- relational seat and answer burden;
- fourfold coverage meanings;
- whether an obligation is unconsidered, unresolved, warrantedly deferred/nonconsequential for the use, or answered with warranted standing;
- claims and the evidence or source basis supporting each claim role;
- shared source identity when one datum supports several roles;
- support limits, correction conditions, and qualification basis;
- material Question Forward branches, including contrasting outcomes, why they matter, evidence/notice routes, present consequence, permitted interim use, and reentry.

Inquiry State may be physically distributed. The logical role does not imply one monolithic record.

**Output standing:** Inquiry State preserves what has been asked, claimed, supported, left open and qualified. Presence or completeness of declarations does not itself establish adequacy.

**Lifecycle/currentness:** clarification, additional evidence, changed warrant, resolved/unanswerable QF, or newly consequential questions may produce new inquiry state while preserving prior meaning and source lineage.

**Failure behavior:** ambiguity must be retained, clarified or decomposed; unsupported claims remain restricted; generic “need more information” does not satisfy Question Forward; successful reference resolution does not imply support.

**Does not own:** deciding whether historical results remain applicable after change, or granting permission to rely.

### 2.3 Applicability Reconciler

**Purpose:** determine how observed change affects the applicability of prior basis, inquiry results, judgments and prior reliance dispositions while preserving history.

**Primary responsibility family:** F, with A–E as inputs.  
**Primary control point:** CP5 and the currentness side of CP6.  
**Primary requirement:** R09 plus whichever originating requirements are affected.

The Applicability Reconciler must distinguish at least:

- enrichment;
- refocus;
- boundary revision;
- changed G or intended use;
- changed time/state scope;
- changed evidence or warrant;
- clarification/decomposition;
- changed governing/source standing.

It must preserve the previous basis and result under their original scope, identify affected claims or a conservatively bounded affected scope, expose unresolved impact, and retain justified unaffected use where warranted.

It must not claim perfect semantic impact detection. It operates on observed or otherwise surfaced changes. When impact cannot be localized precisely, it uses the smallest **warranted** conservative affected scope rather than assuming universal invalidity or universal validity.

**Historical recoverability requirement:** a change marker, digest, checksum, or revision identifier is insufficient when the prior meaning is needed to interpret or requalify an affected result. The historical basis must remain recoverable directly or through a source whose semantic content and standing are still recoverable. If historical meaning is unavailable, the loss is explicit and affected historical/requalification claims narrow accordingly.

**Output standing:** a scoped applicability assessment, not a new semantic authority.

**Failure behavior:** no “latest wins,” no relabeling-as-requalification, and no silent destruction of valid historical results.

**Does not own:** automatic detection of every external change, global dependency discovery, or the final use-level reliance decision.

### 2.4 Reliance Qualifier

**Purpose:** discharge the use-level obligation before consequential reliance, including transfer or reuse by a downstream consumer.

**Primary responsibility family:** G, composed with A–F.  
**Primary control point:** CP6.  
**Primary requirements:** R02, R05, R06, R08, R09 and R10.

For a specific intended use, the Reliance Qualifier composes an **Applicable Basis** from exact recoverable versions or equivalent lineage of:

- Situated Basis;
- relevant Inquiry State;
- applicable change/requalification assessment;
- governing standing and authority where needed;
- relevant qualification/check results and their claim limits.

It then determines whether the requested use is supported, must be narrowed, must be suspended, or remains indeterminate pending a stated reentry condition. Physical design may choose different representation words; these meanings must remain distinguishable.

A prior producer disposition is reusable only when its basis, use, scope and standing remain applicable. A downstream consumer that changes intended use must obtain a new use-scoped disposition.

**Output standing:** a qualified statement about a particular use under a particular basis. It does not create external authority, truth, implementation conformance, or dispatch permission beyond the governing sources that actually supply those things.

**Activated-transition enforcement:** where a consequential transition is physically activated, the future realization must not depend solely on an agent remembering this contract. The transition must have a non-memory-only enforcement surface that requires a current use-scoped qualified disposition and the governing authority/authorization independently required for that transition. Architecture qualification does not choose that surface here.

**Failure behavior:** missing decisive support, stale applicability, incompatible basis, changed use, unsupported judgment, or absent authority blocks only the affected reliance while preserving permitted custody, inquiry and clarification.

**Does not own:** execution, authority creation, action planning, or universal semantic truth.

## 3. Why four roles are minimal

The chosen four-role arrangement is the smallest found that preserves every consequential failure boundary.

- Situated Basis cannot collapse into identity: the same referent can be situated under different boundaries, G, scope and standing.
- Inquiry State cannot collapse into Situated Basis: a correctly situated inquiry can still have ambiguous questions, unsupported claims or unresolved decisive gaps.
- Applicability Reconciler cannot collapse into Inquiry State: change can make a previously warranted result inapplicable without making its historical meaning false or malformed.
- Reliance Qualifier cannot collapse into any one preceding role: a set of individually adequate parts can still be jointly inadequate for a particular use.

Conversely, C/D/E are not forced into three separate components. Their meanings remain distinct inside Inquiry State, but no independent lifecycle or authority boundary requires separate named logical units at this resolution.

## 4. Logical contracts

### C1 — Situated Basis resolution contract

**Crosses:** focal reference, boundary, G/use, scope, source standing, known context, relevant authority reference.

**Preconditions:** source/reference identity is inspectable; unresolved co-reference or unavailable source is visible rather than guessed.

**Postconditions:** a consumer can recover the declared basis and know which elements are available, unavailable, historical, incompatible, or unresolved.

**Enforcement mode:** hybrid. Resolution and explicit version/scope comparisons may be deterministic; adequacy, co-reference, applicability and authority interpretation remain semantic/authority judgments.

**Negative case:** all references resolve, but G and boundary scopes are incompatible. The contract must not report a jointly applicable basis.

### C2 — Inquiry formation and coverage contract

**Crosses:** original question, refinements, seat, answer burden, fourfold obligations, claim roles, coverage meanings.

**Preconditions:** Situated Basis is identified sufficiently for the inquiry; ambiguity is retained if not resolved.

**Postconditions:** a reviewer can reconstruct the question lineage and why each coverage/claim role exists without equating one utterance or stored item to one quadrant.

**Enforcement mode:** hybrid. Explicit cross-product relations and availability may be checked deterministically; adequate interpretation and consequentiality remain judgmental.

**Negative case:** four populated positions contain generic unresolved text and a generic follow-up. Formal presence passes, but semantic coverage remains inadequate for a decisive use.

### C3 — Warrant and assessment contract

**Crosses:** proposition or judgment, exact inputs/basis, source/evidence origin, method/checker where applicable, result, standing, scope, limits and correction/reentry route.

**Preconditions:** the proposition being assessed is explicit enough that the evidence can be related to it.

**Postconditions:** the result states no more than the method/evidence warrants. Shared source origin remains shared; necessary conditions do not become sufficient conditions.

**Enforcement mode:** deterministic, semantic or hybrid per proposition. Formal entailment can be deterministic on complete supplied premises. Boundary adequacy, relevance, source support and sufficiency require qualified judgment.

**Proof sensitivity:** a PASS claim requires contract-relevant discriminating sensitivity to the claimed violation, including a meaningful negative control or equivalent evidence. PASS is bounded to the checked proposition.

**Negative case:** a judgment record exists but provides no basis demonstrating why its conclusion is adequate. The Reliance Qualifier must treat it as unsupported rather than “review completed.”

### C4 — Change and requalification contract

**Crosses:** observed change, before/after basis, affected dependencies or use, historical result, impact assessment, unresolved impact and continue/revise/suspend/reopen disposition.

**Preconditions:** a relevant change has been surfaced; the prior basis is recoverable to the degree required.

**Postconditions:** affected scope is explicit; history survives; unchanged valid use is retained only when warranted; missing historical meaning limits requalification claims.

**Enforcement mode:** hybrid. Declared revision comparison and stale exact-basis binding can be deterministic; semantic impact and continued validity require judgment.

**Negative case:** a digest changes but prior semantic payload is unavailable. The system may know “something changed” but may not claim to know what historical meaning or applicability should be restored.

### C5 — Reliance request and disposition contract

**Crosses:** intended use, exact applicable basis, current coverage/warrant/QF, applicability assessment, authority where required, use-scoped result and reentry.

**Preconditions:** the intended use is explicit; the relevant A–F basis is recoverable or its absence is itself explicit.

**Postconditions:** the result states why the use may proceed, must narrow, must stop, or remains indeterminate; the qualification envelope is recoverable.

**Enforcement mode:** hybrid at evaluation, with deterministic enforcement required later for any activated mechanically decidable transition precondition. A physical transition cannot use “agent remembered the rule” as its only gate.

**Negative case:** a current ACTION/HOLD-like operational projection exists but no governing warrant/authority for the requested use is present. Projection currentness does not satisfy this contract.

### C6 — Handoff and reuse contract

**Crosses:** the account or references, exact basis lineage, current use-scoped disposition, unresolved QF/reentry, qualification envelope and known currentness limits.

**Preconditions:** the transferred material identifies what it is sufficient for and its exact or equivalent recoverable basis.

**Postconditions:** a downstream consumer can reuse the prior result only for compatible use and basis; changed use, material basis drift or lost decisive support invokes C4/C5 again.

**Enforcement mode:** hybrid. Exact lineage/use comparison may be deterministic; use compatibility and semantic sufficiency may require judgment.

**Negative case:** a producer-qualified reversible trial is reused to justify a permanent policy. The changed use forces new qualification.

## 5. Composition and currentness model

The architecture rejects a single global “current account” flag.

Currentness is relational and use-scoped:

- a source may be currently retrievable yet inapplicable;
- a historical source may remain the correct basis for a historical claim;
- a claim may remain historically warranted while no longer supporting the present use;
- a QF branch may remain open while unrelated reliance proceeds;
- a prior use disposition may remain valid for its exact basis while a changed downstream use requires fresh qualification.

The Reliance Qualifier composes an Applicable Basis at reliance time. Composition may use direct content or references. Reference presence and successful retrieval are only prerequisites; joint scope, standing and applicability must still be established.

No giant mandatory account/blob/graph is required. A future physical design may choose replication or snapshots for performance or resilience, but semantic authority and currentness remain determined by this logical contract, not by storage locality.

## 6. Question Forward and uncertainty model

A material unresolved branch remains first-class enough to recover:

- the calibrated question;
- why it matters under G;
- contrasting possible findings;
- discriminating evidence or signal;
- actual notice/evidence route, if any;
- present consequence;
- permitted interim use;
- reentry condition.

A notice route may be use-triggered, tied to an existing evidence-arrival route, or supplied by a separately qualified observation capability. No universal background monitor is required.

When no credible route exists, explicit unanswerability is valid. The affected use is bounded accordingly. Recording a reminder or desired future test is not evidence and does not guarantee eventual notice.

## 7. Lifecycle and change flow

### 7.1 Inquiry/reliance flow

1. Establish or recover Situated Basis.
2. Form or recover Inquiry State under that basis.
3. Qualify claim support and semantic assessments with inspectable standing.
4. Expose material QF branches and present consequences.
5. Reconcile any surfaced basis/change condition.
6. On a consequential use request, compose the Applicable Basis.
7. Produce a use-scoped reliance disposition.
8. If a physical consequential transition is later activated, require the qualified disposition plus independently required governing authority through a non-memory-only enforcement surface.

### 7.2 Change/requalification flow

1. Surface a change or possible change.
2. Preserve the prior basis and historical result.
3. Classify the observed change type.
4. Recover relevant dependencies and prior use envelope.
5. Assess the smallest warranted affected scope; if uncertain, use a conservative explicit bound.
6. Preserve unaffected justified use.
7. Mark affected use unresolved/suspended until adequate reassessment.
8. Re-run only the affected semantic/check obligations.
9. Produce a new use-scoped reliance disposition when reliance is requested.

### 7.3 Handoff/reuse flow

A handoff carries or points to the exact basis lineage, use envelope, unresolved QF and reentry route. The receiving consumer must not infer that producer qualification covers a new use. Compatible use may reuse prior qualified assessments; incompatible or changed use re-enters C5.

### 7.4 Failure/stale-basis flow

Missing decisive sources, incompatible scopes, lost historical semantic payload, unsupported assessments, stale basis bindings, or unresolved governing authority do not erase the account. They narrow or suspend only the affected reliance and remain recoverable as explicit failure state.

## 8. Resolution of ECO-146 Q1–Q7

### Q1 — identity, boundary and open context

Use a stable focal reference together with a versioned/recoverable Situated Basis. Boundary changes are basis revisions; refocus is a linked new focal inquiry; ordinary enrichment does not automatically change identity or boundary. Open context is admitted through a relevance criterion and recoverable references, not exhaustive pre-enumeration.

**Rejected:** unchanged identity proves unchanged subject/boundary; one giant context graph.  
**Reverser:** evidence that the operating context requires a different identity/refocus distinction at requirements level.

### Q2 — joint applicability of a composed basis

Resolve an Applicable Basis for the specific use from exact source/basis versions or equivalent lineage, then assess joint compatibility of G, boundary, time/state, standing and evidence. Individual successful retrieval is insufficient.

**Rejected:** “all links resolved” equals current; a permanently self-authorizing snapshot.  
**Reverser:** a new governing requirement that explicitly requires a fully self-contained authoritative snapshot for every use.

### Q3 — refinement and coverage coupling

Use a hybrid model. Explicit seat/burden relations may derive candidate coverage mechanically, while ambiguous natural-language interpretation, adequate clarification and consequential deferral retain qualified judgment. Original question lineage is always recoverable.

**Rejected:** one question/utterance equals one coordinate; coverage is purely manually declared; coverage is purely re-derived without preserved lineage.  
**Reverser:** a bounded formal input language that makes a specific subset of these judgments fully decidable.

### Q4 — mechanical versus judgmental obligations

Partition propositions, not actors. Mechanically decidable explicit relations may be deterministically checked. Boundary adequacy, relevance, evidence support and sufficiency remain judgmental/hybrid unless later formalized. Every judgment has inspectable basis, standing, limits and correction route. Activated deterministic transition preconditions must later have physical enforcement.

**Rejected:** “human review” as automatic adequacy; “all fields present” as conformance; all semantics forced into structure.  
**Reverser:** qualification evidence proving a narrower proposition is mechanically decidable.

### Q5 — notice and reentry

Question Forward carries a credible route when one exists, commonly use-triggered or connected to an existing evidence-return path. A background monitor is not assumed. No-route cases remain explicitly unanswerable.

**Rejected:** perpetual monitor by default; reminder equals future detection.  
**Reverser:** operating context changes to require idle-time liveness/notification, which is U3 reentry.

### Q6 — localized change with history

Use exact historical lineage plus scoped impact/requalification. Preserve prior meaning and disposition; use explicit dependency recovery where available; when impact precision is unsupported, suspend the smallest conservative scope. Digest-only history is insufficient when meaning is required.

**Rejected:** newest wins; global invalidation; relabeling as requalification.  
**Reverser:** requirements change to demand perfect automatic impact detection, which is not currently claimed.

### Q7 — reliance across consumers and handoffs

Discharge reliance through a use-scoped Reliance Qualifier at every consequential use boundary. Producer assessments may be reused only under compatible basis/use. A new consumer intent requires fresh qualification. Future activated consequential transitions require non-memory-only enforcement.

**Rejected:** producer qualification covers arbitrary future use; each consumer is expected to remember prose independently.  
**Reverser:** a changed operating context that materially changes what counts as a consequential reliance boundary.

## 9. Boundary with surrounding ECOS capabilities

The quadrant module may depend on surrounding capabilities for:

- stable referent identity;
- raw/source custody;
- governance and authority resolution;
- immutable/versioned historical storage;
- artifact/receipt representation;
- runtime observation;
- authorization and execution.

It does not infer semantic adequacy from those capabilities.

The module owns:

- the quadrant-specific situated-basis obligations;
- question/coverage/warrant/QF meaning;
- change/applicability semantics for quadrant inquiry;
- use-scoped reliance qualification for the quadrant result.

It does not own:

- global identity resolution;
- creation of governing authority;
- execution permission;
- generic event sourcing;
- universal dependency graphs;
- a system-wide notification service;
- whole-URG architecture.

## 10. Cross-cutting adversarial-pressure disposition

| Pressure | Disposition | Logical obligation |
|---|---|---|
| duplicate/replay | APPLICABLE | Repeated identical evidence/checks do not become independent corroboration or new standing. Preserve source identity and semantic idempotence. |
| concurrency | APPLICABLE | Conflicting basis/revisions must not silently resolve by arrival order. Explicit succession/reconciliation is required. Physical serialization remains open. |
| stale state/basis | APPLICABLE | Every use disposition is bound to an exact or equivalent recoverable basis; stale bindings cannot qualify a changed use. |
| partial failure/rollback | APPLICABLE | Partial composition or incomplete assessment may be retained as evidence but cannot become a qualified use disposition. Physical transaction strategy remains open. |
| restart/reconstruction | APPLICABLE | Reliance cannot require hidden conversation or volatile memory; exact basis/history must be recoverable to the claimed scope. |
| wrong identity/role | APPLICABLE | Stable ID does not prove co-reference, authority or role standing; role non-collapse is preserved. |
| wrong version | APPLICABLE | Qualification binds exact/equivalent versions and their standing. |
| basis drift/revocation | APPLICABLE | C4 reassesses affected applicability while retaining history. |
| checker bypass/false PASS | APPLICABLE | C3 proof sensitivity plus C5 prevents unchecked PASS from becoming authority or sufficiency. |
| retry/idempotency | APPLICABLE | Repeating the same qualification request cannot amplify evidence/standing; changed inputs constitute a new basis. |
| time/order ambiguity | APPLICABLE | Time/state scope is explicit; newest does not mean governing or applicable. |
| unauthorized mutation | APPLICABLE | Changes cannot self-promote to governing/authorized standing; authorization remains a distinct surrounding responsibility. |

## 11. Traceability and conformance hooks

| Requirement | A–G | Primary logical role/contract | Positive hook | Negative hook |
|---|---|---|---|---|
| R01 | A/F | Situated Basis, C1/C4 | recover original focal subject through enrichment | stable ID + changed subject/boundary must not pass unchanged |
| R02 | B/G | Situated Basis + Reliance Qualifier, C1/C5 | recover applicable G/standing for requested use | mapper purpose/current packet must not create authority |
| R03 | A/C | Situated Basis + Inquiry State, C1/C2 | explicit boundary/seat remains inspectable | expressly excluded relation silently made constituent |
| R04 | C | Inquiry State, C2/C3 | clarification changes burden explicitly with lineage | wording/access token alone assigns coordinate |
| R05 | C/E/G | Inquiry State + Reliance Qualifier, C2/C5 | four obligations + warranted open/deferred meanings | four populated/generic unresolved cells imply adequacy |
| R06 | D | Inquiry State, C3 | shared datum keeps one origin across roles | reused datum becomes independent corroboration |
| R07 | A/E/F | Situated Basis + Reconciler, C1/C4 | relevant discovered context enters without rewriting history | predeclared list treated as universe |
| R08 | E/G | Inquiry State + Reliance Qualifier, C2/C5 | calibrated question changes disposition under contrasting evidence | reminder or generic question treated as sufficient |
| R09 | F | Applicability Reconciler, C4 | before/after basis + scoped impact + history retained | digest-only change marker called requalification |
| R10 | G | Reliance Qualifier, C5/C6 | cold reviewer recovers why exact use may proceed/stop | well-formed package or current projection self-authorizes |

## 12. Physical-design handoff

Physical design may choose:

- database, document, graph, log, object or mixed persistence;
- API/payload syntax;
- whether the four roles share a process/service;
- cache/snapshot strategy;
- event sourcing or another history realization;
- identifiers and indexes consistent with universal-identity constraints;
- synchronous versus asynchronous resolution;
- human/model/software allocation for judgment;
- UI and workflow presentation;
- concrete observer/notification mechanisms where a qualified notice promise is required;
- concrete enforcement surfaces for activated consequential transitions.

Physical design must preserve:

- exact/equivalent recoverable basis binding;
- historical semantic recoverability where relied upon;
- source standing and role non-collapse;
- question/coverage/warrant/QF distinctions;
- use-scoped rather than global sufficiency/currentness;
- explicit refocus/boundary/G/change semantics;
- scoped requalification;
- non-memory-only enforcement for activated mechanically decidable consequential transition requirements;
- proof-sensitivity limits on PASS;
- no silent promotion from storage, recency, successful retrieval, operational currentness or check result to authority/warrant.

Physical design may **not** reopen R01–R10, A–G, CP1–CP6 or Q1–Q7 merely because a substrate makes another arrangement convenient. Reopen only through the reentry routes below.

## 13. Explicit nonclaims

This contract does not establish:

- schema, API, storage layout or deployment topology;
- a universal Account, Relational Face, graph, event stream, state machine or enum;
- a particular model/human review allocation;
- automatic detection of all real-world change;
- universal co-reference or identity resolution;
- runtime conformance, performance, reliability or usability;
- external authority or action permission;
- full URG architecture or ECO-136 closure;
- final terminology or ontology.

## 14. Reentry conditions

Return to **ECO-144 requirements** if a required logical behavior cannot be stated without changing R01–R10.

Return to **ECO-143 / semantic contract** if identical clarified R/G/boundary/scope/seat/burden still requires incompatible coordinates or a forbidden/class-specific generator.

Return to **ECO-146 / Principal operating context** if consumer, reliance, notice/liveness or surrounding-responsibility ambiguity would change the module responsibility boundary or stop condition.

Return to **governing-source reconciliation** if source conflict or authority ambiguity changes scope, standing or permission.

Remain within later **physical-design/implementation repair** when the logical contract is coherent and only a proposed physical mechanism fails to realize it.

---

**Shape claim envelope:** Under the declared operating context and qualified R01–R10 / accepted A–G surface, this four-role architecture is the smallest arrangement found that preserves situated basis, inquiry/warrant/uncertainty, scoped change/requalification, and use-level reliance as distinct logical failure boundaries while permitting composition by reference and substrate-specific realization later. This statement is architecture qualification evidence only; it is not physical or runtime conformance.

## Appendix A. Inherited definitions for contract-only recovery

This appendix repairs definition/navigation omissions exposed by the first ECO-147 cold transfer. It adds no logical role, required behavior, physical allocation, or new semantic authority. Sections 1–14 remain the selected Shape; the inherited passages below make their fixed inputs locally readable.

**Reading path:** A.1 defines the grammar and symbols used throughout; A.2 defines A–G; A.3 defines CP1–CP6; A.4 carries the complete fixed R01–R10 register; A.5 resolves reentry labels and identity constraints. Use §11 to trace these obligations to the chosen roles/contracts and positive/negative hooks, §4 for interfaces, §7 for flows, and §12 for physical choices.

**Standing and evidence boundary:** A cold worker can recover what each inherited obligation means and how the selected architecture assigns it. This document alone does not independently authenticate its upstream sources, prove universal minimality, or establish executed qualification/runtime conformance. The companion ECO-147 qualification return retains those separate evidence claims. The cold-transfer test asks recovery of logical meaning and responsibility, not independent repetition of upstream qualification. Actual inquiry-specific authority, evidence, relevance and adequacy come from the Situated Basis and warrant contracts; they are inputs to this architecture, not missing universal answers to invent.

**Source key and provenance:** D = ECO-144 requirements return, blob `d19fccbd0f7f200ab0340d26a3fd937370e6f78a`; S = accepted ECO-146 Sense return, blob `7a7ddff9a7aaf029a9f03afece737e7d01fcd190`; packet = ECO-145-qualified intake, blob `85f09bc8b9371969fcff784aa5e3d182b560ac3f`. All are in `research/quadrant-grammar/` on the canonical baseline `b3d2f6d404ab165b0bb277a3423ae3955800ad99`. C = amended `SIGMA-ECOS-Quadrant-Grammar-Register-B-Functional-Contract-v0.2.md`; Q = `ECO-143-Register-B-Qualification-Return-2026-09-18.md`; P = current ECO-136; I = its Principal-approved integration comment `a9c94cbc-7d93-43be-a202-cac188d29000`. Citations and T1–T10 specimen pointers in A.4 retain D's original source numbering; those evidence specimens are not new instructions or missing logical definitions. The historical phrase “none is selected here” in D/R10 describes D's requirements layer; §§2–4 of this contract select the logical architecture.

### A.1 Governing orientation, symbols and minimum grammar

Inherited governing orientation, verbatim from S §3:

> Specify what a downstream SIGMA/ECOS system must preserve, distinguish, expose, and re-open so that quadrant inquiry can be used provisionally without encoding a known semantic defect.

Parent lock, verbatim:

> The mapper’s purpose must not silently become the mapped referent’s purpose, and the map’s selected contents must not silently become the referent’s exhaustive contents.

Operational commitment, verbatim:

> Every admitted referent is handled as holonically situated and potentially compositionally incomplete.

Holonically situated preserves constituent organization, participation contexts, partial knowledge and revisable boundaries; it is not proof that the account exhausts reality.

**Navigation glossary [C §§1–9; D §§2–4]:** R is the focal referent; G is the Governing Orientation; a constituent is counted within R's operative boundary; a co-relatum is another referent/context in a specified participation relation with R. A question's burden is what an adequate answer must establish. Warrant is the support for the particular claim and use, with its limits. “Move” denotes the scoped action or use at issue. Question Forward (QF) makes material uncertainty discriminable and actionable for later reentry. None of these labels prescribes a stored entity.

The following operational grammar is reproduced verbatim from D §3:

For ordinary traversal, preserve focal R, G, consequential constituent boundary/individuation, time/state scope, and relevance criterion. Known co-relata are initial scope, not an exhaustive universe. A property made salient as a predicate of R does not automatically become a new focal referent.

Constitutive inquiry concerns R as presently bounded, including its constituent organization. Participatory inquiry concerns the same R through a specified relation crossing or exceeding that boundary. Material dependence, enclosure, scale and number do not determine the seat.

The other distinction concerns the answer’s burden: establish what governs what may, must or cannot obtain, or establish the determinate case. Identifying an installed dependency is a determinate burden; establishing its implications is a governing burden. The same content can serve both. A unique admissible outcome does not erase that distinction.

| Seat / burden | Governing burden | Determinate burden |
|---|---|---|
| Constitutive | UL: what governs what R can be/do as this bounded whole? | UR: what characterizes R as this bounded whole here? |
| Participatory | LL: what governs what can occur through R’s specified participation? | LR: what obtains through that participation here? |

These are working coordinates, not ratified pole names. Four obligations must be available, but neither four answers nor exactly four stored questions are required. Many questions or claims can contribute to one obligation; a compound question may require several obligations.

Rejected generators remain: subjective/objective; consciousness or phenomenology; spatial interior/exterior or internal/external; inferred/observed; interpretive/directly known or observable; hidden/visible; individual/collective; small/large or local/global; evidence type, format or storage; mapper confidence; rule/fact as lexical classes; many possibilities/one actuality; changed focal referent; permanent evidence bins. “Take R’s place” is an optional anti-projection cue across all positions, not a generator or consciousness attribution.

### A.2 Accepted responsibility families A–G

The following definitions and obligations are reproduced verbatim from S §5; their allocation to the four chosen roles is in §§2 and 11.

Letters are local traceability labels. These seven families are a minimal analytical grouping at this resolution, not seven components, services or actors. They group obligations with different failure and recovery conditions; Shape may combine or divide their realization if every distinction survives.

| Responsibility / requirement basis | Necessary result and failure if absent | What later qualification must make observable or recoverable |
|---|---|---|
| **A — Preserve focal continuity and situated context.** R01/R03/R07; R09 history constraint. | Keep R, its map and mapper distinguishable where consequential; preserve original input/source, warranted identity, boundary/rationale, constituent and co-relatum standing, relevance criterion, context return paths and exposed incompleteness. Recognize explicit refocus and open discovery. Without A, an unchanged ID can conceal a changed subject or boundary. | A reviewer can recover the original focal subject; distinguish enriching the account from revising its boundary or making a report focal; and identify known context and unresolved return questions. No completeness or real-world co-reference guarantee follows from an ID. |
| **B — Resolve applicable orientation and standing.** R02/R10; R01 non-substitution; R09 currentness. | Recover the intended use, relevant G, frame assumptions, priorities, scope, stopping and governing authority where needed. Distinguish source claims, stipulations, instructions and qualification judgments. Without B, a plausible result inherits an inapplicable purpose or authority. | The basis relied on, its source standing, applicability and limits can be inspected together. Unavailable or incompatible sources remain visible. Mapper purpose does not become attributed purpose. Source availability and semantic applicability have separate dispositions. |
| **C — Make question burdens and fourfold coverage inspectable.** R03/R04/R05; R01/R06 protections. | Preserve the original question, its relation to refinements, the requested relation and adequate-answer burden; retain alternatives or decomposition where unresolved. Expose all four obligations and distinguish unconsidered, unresolved, warranted deferral and warranted answer. Without C, labels or filled positions masquerade as adequate inquiry. | A reviewer can reconstruct why a coordinate is justified, what remains ambiguous and whether clarification changed the task. Access swaps do not change the structural burden. Coverage records preserve their meanings without imposing enumeration values or storage cardinality. |
| **D — Preserve warrant for each claim role.** R06/R10. | Maintain source/access, evidence scope, shared origin, inferential role, support limitations and correction conditions for each consequential claim. Keep necessary conditions, sufficient conditions, attributed reports, occurrences and proposed actions distinguishable. Without D, traceable evidence can still support an illicit stronger conclusion. | One datum reused in several roles remains one origin; exact rule wording and premise completeness delimit any inference. A reviewer can distinguish what is supported from what merely could be true. Neither digest equality nor classification establishes semantic support. |
| **E — Discriminate material uncertainty and reentry.** R08/R05/R07/R10. | Convert every branch that can change the scoped interpretation, boundary, Move or stop condition into a calibrated question, contrasting signal, evidence/notice route and consequence. Preserve genuine unanswerability. Without E, “unknown” either silently passes or blocks everything indiscriminately. | A cold operator can identify which observation would change which disposition, where that evidence could be noticed, and what remains possible meanwhile. No-route cases remain explicit; a planned test is not evidence. Stop adding questions when no new consequential branch is discriminated. |
| **F — Reconcile change, affected applicability and history.** R09 with R01–R08/R10. | Distinguish refocus, boundary revision, changed G/time/state, warrant update, question clarification and enrichment. Preserve old basis and scope; assess affected claims or a conservatively bounded scope; retain justified unaffected use. Without F, new information erases history or leaves obsolete conclusions apparently current. | Before/after basis, changed condition, affected-use reasoning, unresolved impact and continue/revise/suspend/reopen disposition are recoverable. A claim cannot appear requalified before the required assessment supports it. Perfect impact inference and detection of unobserved changes are not promised. |
| **G — Bound consequential reliance and conformance claims.** R10 with R02/R05/R06/R08/R09. | Before a sufficiency claim or consequential reliance, recover the applicable A–F basis and determine what the use is sufficient for, what blocks it and what permits reentry. Without G, individually legible information can still be assembled into an invalid action or handoff. | A reviewer can explain why this use may proceed, must narrow or must stop. A known decisive gap blocks affected reliance while allowing preservation and authorized clarification. The result cannot create authority or promote requirements/architecture evidence into runtime conformance. |

### A.3 Accepted control points CP1–CP6

The following is reproduced verbatim from S §7. Reentry labels U1–U5 resolve locally in A.5.

A control point is a circumstance where a consequential distinction must be exposed and acted upon. It is not a selected API, interceptor, service, approval step or state machine. Several points may coincide in one use; a continued inquiry may encounter them repeatedly.

| Point / trigger | Required visibility and response | Responsibility / reentry |
|---|---|---|
| **CP1 — Establish or change focal subject/context.** Admit an underspecified account, focalize another subject, or confront a constituent/co-relatum choice. | Recover original source, R/map/mapper roles, boundary and rationale, known relations and criterion. Preserve unknowns. If subject or boundary changes, make the change explicit and assess affected scope; if it cannot be decided, retain alternatives and bound use. Raw preservation can continue. | A/B; E/F when unresolved/changed. R01/R03/R07/R09; U1/U3 if required behavior/context cannot be stated. |
| **CP2 — Formulate, classify, clarify or claim inquiry coverage.** | Expose original and derived questions, adequate-answer burden and seat, all four obligations and coverage meanings. Clarify/decompose ambiguous wording or preserve alternatives; never force a coordinate or quietly change the task. A material blank receives QF or a warranted scoped disposition. | C/A/E. R04/R05/R08; U2 for persistent conflict under identical clarified burden. |
| **CP3 — Use evidence for a claim role or stronger conclusion.** | Expose source/access, exact scope, dependence, inference and limits. Shared origin is not corroboration. A rule is not execution; necessary is not sufficient. Unsupported support claims remain unresolved/restricted and feed CP4/CP6. | D/B. R06/R10; repair warrant first, U2 only for a persistent grammar-induced defect. |
| **CP4 — Defer, stop inquiry, or route an uncertainty.** | Show why the gap does or does not change this Move, contrasting findings, evidence/notice route and reentry. A decisive question cannot be labeled deferred merely because it is recorded. No present route means explicit unanswerability and an honest use boundary. | E/C/G. R05/R08/R10; U3 for missing decision-relevant operating purpose. |
| **CP5 — Discover context or learn of a change.** | Distinguish enrichment, boundary revision, refocus, G/time/state change, clarification and warrant update. Preserve old basis. Identify affected claims or a conservative affected scope; expose unresolved applicability. Continue only justified unaffected use; requalification requires assessment, not a relabel. | F with A–E. R09 and affected originating R; U1/U2 only when requirements/grammar actually need change. |
| **CP6 — Report sufficiency, rely, or transfer as adequate support.** | Recover the applicable subject/G/boundary/question/evidence/coverage/QF basis, with source standing, historical/current distinctions and stop disposition. Missing decisive support, stale warrant or an unqualified new use blocks that reliance. Do not infer permission from a current projection. Preserve allowed clarification/custody. | G/B/D/E/F. R02/R06/R08/R09/R10; U1–U4 according to localization. |

CP6 also applies when a source was available earlier but is unavailable at reliance. An independently sufficient recoverable basis can support only the use it actually warrants; an obsolete cache or broken link cannot be silently counted as current support. CP5 and CP6 must together make the chosen design's limits on change notice intelligible. This statement does not claim detection of every outside change.

### A.4 Exact inherited R01–R10 register

Reproduced verbatim from D §4, also carried identically in S Appendix A. These passages retain their requirements-layer standing and source citations. They are not a reopening of the qualified baseline.

### R01 — Referential continuity and situated incompleteness

**Basis:** C §§1–2, 9, 10.1; P’s exact lock and composable-reference correction; Q §§2, 9.

**Required behavior:** Preserve or resolve the focal referent sufficiently to keep claims and questions about that R under their original scope. Keep referent, representation and mapper distinguishable where consequential. Preserve source/raw input for underspecified admissions; assign or resolve identity only to the degree warranted. Make material uncertainty about constituent, containing or participatory context recoverable. Identity continuity must coexist with incomplete or corrected accounts. Focalizing a component, property, report, co-relatum or containing system as a new subject requires explicit refocus with a recoverable connection to the earlier inquiry.

**Prohibited failure:** An ID is treated as proof of completeness; missing relations become nonexistent; the report becomes the person; or a changed subject is represented as quadrant traversal.

**Conformance and limits:** A reviewer must be able to recover the original subject and distinguish a reported feeling about Mira from an inquiry into report typography. Explicit reference changes and source availability can be checked mechanically; whether two references denote the same real subject requires warrant. No global identity-resolution algorithm or one-ID-per-word rule follows.

**Reentry:** Evidence of mistaken identity, subject substitution, or previously omitted consequential context reopens the affected inquiry, preserving original attribution. Specimens T2, T5, T6.

### R02 — Recoverable Governing Orientation, scope and standing

**Basis:** C §§0, 3, 8.3, 9, 10.3; P’s exact lock and map/mapper distinction; Q §§2, 9.

**Required behavior:** Before treating a traversal as reliable for a use, recover enough purpose, relevance, consequential frame assumptions, priorities, ideal end state, time/state scope and stop/fail/reentry conditions to judge that use. Resolve authority from governing sources where action or promotion is at issue. Distinguish a source’s claim, a stipulation, a design instruction and a qualification judgment. The mapper’s G may select the question; it must not become R’s attributed purpose. Unresolved orientation supports only the bounded inquiry permitted by the available basis, not invented closure.

**Prohibited failure:** A packet creates its own authority; an organizer’s aim becomes Mira’s intention; a new intended use silently inherits the old inquiry’s adequacy; or a broken governing reference is counted as recovered context.

**Conformance and limits:** A cold reviewer can recover why the inquiry was undertaken and which source authorizes the proposed use. Reference availability and declared scope differences are mechanically checkable. Correct interpretation, sufficient orientation and applicable authority remain judgments. No universal approval ceremony or mandatory human gate is installed.

**Reentry:** Changed G, scope, governing source or claimed authority prompts assessment of affected applicability. Specimens T5, T7, T9.

### R03 — Explicit boundary and relational seat

**Basis:** C §§2.2, 5.1, 9, 10.2; I; Q §§2–4, 7.

**Required behavior:** Recover what counts as constituent, the operative criterion or rationale under G, known co-relata and the relation the question requires an answer about. Permit an incomplete account under an explicit boundary. Distinguish new information already admitted by that criterion from a change in the criterion or in expressly excluded/ included standing. When a consequential constituent/co-relatum choice is unresolved, expose the alternative seats and the evidence or decision needed; do not force one.

**Prohibited failure:** Causal necessity, physical casing, spatial extent or convenience chooses the seat. A database expressly excluded from S1 becomes constituent without boundary revision and assessment of affected answers.

**Conformance and limits:** Original and revised boundaries and the reason for changed seating are recoverable. Comparing declared membership or boundary references can expose an explicit change; it cannot prove the boundary is adequate. Refinement need not create a new real referent or ID in every case; the required result is legible scope and continuity, not an identity-allocation policy.

**Reentry:** A relation conflicts with the recoverable boundary or new evidence makes individuation consequentially inadequate. Specimens T2, T3.

### R04 — Question-directed generation and ambiguity handling

**Basis:** C §§5–7, 10.4–10.5, 11; I; Q §§2, 5–6.

**Required behavior:** Construct or justify coordinates from relational seat crossed with answer burden under the declared envelope. Expose the intended relation and what an adequate answer must establish sufficiently for inspection. When wording underdetermines either distinction, clarify, decompose or retain alternatives as unresolved. Preserve the original question and the relationship of any clarified/decomposed questions to it sufficiently to detect a changed task. Class-specific generators are not permitted.

**Prohibited failure:** “Actual,” “rule,” “possible,” “why” or first-person language alone assigns a coordinate; one ambiguous sentence must receive one label; a governing conclusion is treated as observed execution; or clarification silently changes the asked question.

**Conformance and limits:** Hold R/G/boundary/scope constant while changing access: the structural obligation stays fixed. Change identification to admissibility: the burden changes explicitly. A supplied cross-product and declared answer roles are mechanically inspectable; correct interpretation of unrestricted natural language is not thereby guaranteed.

**Reentry:** Persistent conflicting coordinates after relation and answer burden are fixed, or a necessary class-specific exception, suspends affected classification and reopens semantic qualification. Specimens T1, T5, T8.

### R05 — Fourfold coverage without fabricated completeness

**Basis:** C §§2.1, 4, 6, 9, 10.6; I’s optional terminology; Q §§3–4, 9.

**Required behavior:** Make all four obligations available and their coverage conspicuous under the inquiry’s envelope. Distinguish unconsidered, considered but unresolved, considered and currently nonconsequential/deferred under G, and answered with warranted standing. These are meanings to preserve, not prescribed enumeration values. A blank material cell must lead to a specific question or a warranted scoped disposition. A traversal can be sufficient for a Move with unresolved answers if those unknowns do not defeat that Move’s conditions.

**Prohibited failure:** Four filled cells imply truth; four unknown labels imply adequate consideration; a quadrant disappears because evidence is missing; or “deferred” hides an outcome-determinative gap.

**Conformance and limits:** A reviewer can inspect each obligation and distinguish missing inquiry from legitimate openness. Availability of four positions and explicit coverage declarations is mechanically checkable; adequacy of the questions and deferrals is not. No mandatory “Relational Face” entity, account cardinality or user-interface grid follows.

**Reentry:** New relevance, evidence or intended use makes a deferred/unconsidered obligation consequential, or a completion claim exceeds its actual coverage. Specimens T4, T7, T9.

### R06 — Independent evidence and warrant for each claim role

**Basis:** C §§8, 9, 10.4, 10.6; Q §§3–7 and Appendix C.

**Required behavior:** Preserve what evidence is available, its provenance/access, the claim and scope it supports, limitations and correction conditions. Allow one datum to serve multiple obligations while retaining its shared origin and distinct inferential roles. Keep factual occurrence, attributed report, stipulation, derived constraint and proposed action distinguishable when those differences affect use. Record rule necessity/sufficiency as warranted by its actual content; do not silently strengthen it.

**Prohibited failure:** Reuse becomes independent corroboration; signature validity proves delivery; a required switch output becomes an observed output; one commit proves all-path deduplication; or an unavailable acknowledgment proves nonoccurrence.

**Conformance and limits:** Each consequential conclusion can be traced to what supports it and what it does not establish. Shared source identities, explicit scope and formal implications under complete supplied premises can be checked. Completeness of premises, source authenticity and causal/explanatory adequacy require their own warrant. Confidence is neither evidence nor a coordinate.

**Reentry:** Contradictory evidence, source correction/loss, changed access or a claim exceeding support reopens affected warrant; coordinates change only if the structural question changes. Specimens T1, T3, T4, T5, T8.

### R07 — Open-world discovery and recoverable context

**Basis:** C §§1.3, 2, 5.1, 9, 17; I’s Lower-discovery repair; Q §§4, 7.

**Required behavior:** Preserve known constituent and participatory context together with a criterion admitting newly disclosed consequential relations. Maintain return paths to known context or calibrated questions where context is unknown. Admit discovery without requiring exhaustive co-relata pre-enumeration. Assess whether a discovery enriches the account, changes boundary/G, or affects prior answers. Do not rewrite history as though the new relation was already known.

**Prohibited failure:** A predeclared list is treated as the universe; unrelated discoveries endlessly expand inquiry; every new relation forces re-individuation; or unrecorded context is treated as absent.

**Conformance and limits:** An introduced vibration can enter the rock’s seating inquiry under its existing criterion; an irrelevant relation can be set aside with a scoped reason. Reference reachability and recorded before/after accounts can be checked; relevance and completeness of impact assessment require judgment. No exhaustive graph or mandatory recursive materialization follows.

**Reentry:** A discovery meets the relevance criterion or challenges its adequacy for G. Specimens T2, T3, T6.

### R08 — Question Forward that discriminates consequences

**Basis:** C §§1.3, 9, 12–12.1, 16; P’s current formulation; Q §7.

**Required behavior:** For each material uncertainty branch, expose a specific question, why it matters under G, discriminating evidence or signal, contrasting possible findings and their effect on the claim, boundary, Move or stop condition. Make the notice/evidence route and reentry recoverable. Preserve explicit unanswerability when no present route is available; a desired future test is not existing evidence. Add questions until consequential branches are covered and stop when additional questions would be redundant or nonconsequential.

**Prohibited failure:** “Need more information” substitutes for a calibrated question; a fixed count defines sufficiency; two materially different outcomes lead to no different disposition; or an unanswered material question is treated as answered because a follow-up exists.

**Conformance and limits:** A cold operator can identify what observation would change what decision. Presence of the components and declared links can be checked; their discrimination, feasibility and qualitative sufficiency require judgment. No automatic-question-generator accuracy claim is implied.

**Reentry:** A newly consequential branch lacks a discriminating question or the nominated signal cannot resolve the alternatives. Specimens T1, T4, T6, T9.

### R09 — Explicit change, scoped requalification and preserved history

**Basis:** C §§2.3, 3, 5.1, 7, 10, 16–17; I; Q §§2, 4, 7.

**Required behavior:** Distinguish refocus, boundary revision, changed G/time/state, evidence/warrant update, question clarification and ordinary account enrichment. Preserve old answers under their original basis. Identify affected claims or a conservatively bounded affected scope, expose unresolved applicability, and prevent those claims being presented as requalified until the required assessment supports it. Keep unaffected use available where its continued validity is warranted. Preserve the reason for continuing, revising, suspending or reopening sufficiently for reentry.

**Prohibited failure:** Current answers inherit validity after a material change without assessment; all history is overwritten; every metadata/access change invalidates everything; or a relabeling is called completed requalification.

**Conformance and limits:** Before/after scope, declared change and disposition can be inspected. A declared change can mechanically trigger an explicit applicability check; automatic detection of every real-world change, dependency or semantic effect is not established. Event sourcing, a particular dependency graph and perfect impact inference are not required by this document.

**Reentry:** Any of the source contract’s failure conditions or Q §7 triggers occurs. Specimens T2–T7.

### R10 — Bounded reliance and recoverable conformance claims

**Basis:** C §§0, 3–4, 9–10, 13–17; P’s enforcement split and exact lock; Q §§8–11; ECO-144’s completion contract.

**Required behavior:** Before reporting adequate inquiry or relying on its results for a consequential Move, recover its applicable basis, coverage, support, unresolved material questions and stop/fail/reentry disposition. A claim of sufficiency must state what it is sufficient for and preserve the qualification envelope. A known outcome-determinative gap prevents the affected reliance, while raw preservation and authorized clarification remain possible. Recoverability may be compositional and must not require hidden conversation state. Distinguish this requirements result, later architecture qualification and eventual installation/behavior evidence.

**Prohibited failure:** A compliant-looking form proves semantic fitness; the package authorizes itself; unknowns always block every action or never block any action; bounded qualification becomes universal ontology or full ECO-136 acceptance; or specification becomes deployment evidence.

**Conformance and limits:** A reviewer can determine why the declared use may proceed or must stop, and recover the supporting materials. Reference resolution and declared gate conditions are mechanically checkable; sufficiency of their meaning and evidence remains a scoped judgment. The future architecture must show how its chosen mechanisms support these behaviors, but none is selected here.

**Reentry:** The intended use exceeds the qualified envelope, consequential sources cannot be recovered, or conformance claims outrun the demonstrated evidence. Specimens T4, T7, T9, T10.

### A.5 Local reentry labels and universal identity constraint

The labels used in the inherited control-point table resolve to the already-selected routes in §14:

| Label | Local meaning and destination |
|---|---|
| U1 | Required behavior would need to change: ECO-144 requirements reentry. |
| U2 | Persistent generator conflict under identical clarified R/G/boundary/scope/seat/burden: ECO-143 / semantic contract. |
| U3 | Consumer, reliance, notice/liveness or surrounding-responsibility uncertainty changes the module boundary or stop condition: ECO-146 / Principal operating-context reentry. |
| U4 | Source conflict or authority ambiguity changes scope, standing or permission: governing-source reconciliation. |
| U5 | A method or physical mechanism fails while logical meaning remains coherent: repair/narrow the responsible design or implementation and its evidence, without reopening semantics solely for that failure. |

The universal-identity constraint referenced in §12 is inherited from `docs/invariants.md`, blob `e7b36a56a3a1eff58d7e2debce4aaeb6e1a359d4`: every persistent first-class subject of inspection or relation has a stable Referent identity; type-specific content remains in its native record. Registration may precede description/classification/native binding. It does not confer semantic identity with a represented subject, co-reference, description, standing, warrant, authority, promotion or currentness. UUID uniqueness does not prove subject uniqueness. This is a constraint on later realization, not an identifier format or schema choice.
