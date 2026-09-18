# Quadrant Logical Architecture Contract v0.1

**Commission:** ECO-147 — substrate-independent Architecture Shape for the bounded quadrant module  
**Parent:** ECO-136  
**Accepted predecessor:** ECO-146 Architecture Sense  
**Qualified requirement basis:** ECO-144 R01–R10  
**Qualified semantic basis:** Functional Contract v0.2 + ECO-143 bounded Register B qualification  
**Repository continuity basis:** `research/quadrant-grammar/` on canonical `ecb-v2/main`  
**Standing:** reviewable Architecture Shape candidate; no physical design, implementation, deployment, runtime-conformance, or authority claim is created by this document.

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
