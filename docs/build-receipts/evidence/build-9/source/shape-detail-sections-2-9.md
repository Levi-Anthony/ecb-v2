## 2. Top-down and bottom-up derivation

The capability requires more than subject addressability. It requires an exact answer to: **which unresolved component could change this parent's next legitimate step, what did the child establish about it, and does that still support the parent now?** Omitting any part permits an elegant but false PASS.

| Required distinction / liability if absent | Existing carrier and inspected limitation | Selected minimum |
| -- | -- | -- |
| Focal subject versus inquiry/question | Referents provide subject identity; immutable Artifacts provide separately addressable representations. One subject may have several inquiries. | Retain inquiry identity plus focal Referent and exact question/discriminator. Do not identify inquiry with its subject. |
| Exact decision-bearing dependency versus generic related evidence | BUILD 4 has only `depends_on`; its meaning is conditional validity, not parenthood or support. | One scoped parent-decision Claim and its exact `depends_on` Claim to the governance component. Native inquiry participation points to that Claim; it creates no competing relation register. |
| Exact past basis versus newest bytes | BUILD 5B retains payload text/digest and universal identity. BUILD 3 Evidence Link preparation is Thought-specific. | Retained Artifact versions and explicit native participation references for non-Thought evidence. Do not pretend BUILD 3 already accepts arbitrary Artifact evidence endpoints. |
| Child judgment versus producer assertion | BUILD 5B receipt checks a fixed relayout contract; BUILD 7 publication binds a candidate, method, findings and evaluator. Neither is a generic BUILD 9 evaluator. | Bounded judgment contract carried as Artifact content with protected publication; do not relabel an old receipt as proof of the new proposition. |
| Result returned versus parent reentry | BUILD 7 designation/recovery separates historical selection from present reliance. BUILD 8 has protected full-history folding and exact replay. Neither already implements recursive reentry. | A distinct parent-side disposition event, bound to a fresh observation boundary and exact predecessor. Child publication cannot perform that transition. |
| Intervening change versus equal final values | Version and predecessor histories can retain change and restoration. | Compare retained history and current dependency observations, including change-and-restore. A digest equality alone cannot establish uninterrupted applicability. |
| Recovery versus authority | BUILD 7 read-only reader reconstructs exact bytes/history and reports reliance gaps. | A deterministic read projection with source links; recovery never appends a reentry or authorizes continuation. |

**Concrete substrate inspection.** At the pinned main, `sql/migrations/20260904163938_build_3_claims_evidence_links.sql` prepares evidence links by reading `public.thoughts`, with the fixed Thought revision scheme. `20260904215929_build_4_typed_relation_claims.sql` admits only `depends_on`; AP-07 defines its conditional-validity semantics. `20260906014257_build_5b_versioned_artifacts.sql` supplies retained text, SHA-256, role vocabulary, universal Referents and committed-attempt/receipt machinery. Its checker has fixed `ecb_transition_relayout_v1` semantics. `20260910090000_build_7_local_master_key.sql` protects `attempt`, `publish`, `designate`, and declared-dependency `applicability`; `server/build-7/recover.mjs` separates historical designation from present reliance. `20260911130000_build_8_action_envelope.sql` has explicit role routing, isolated custody and a guarded scope-lock boundary. These are inspected precedents, not generic BUILD 9 functions ready to call unchanged.

**Earned structure:** distinct machine-recognizable participation for inquiry contract/opening, judgment publication and parent disposition; immutable exact references; protected predecessor/basis validation; a complete recovery projection. These distinctions are earned by wrong-role publication, naked judgment, stale reentry and cold-reconstruction falsifiers. They may use a small family of new Artifact roles or a protected discriminator within a new role family. Existing payloads without enforced bindings are insufficient. Dedicated logical primitives or tables for Parent, Child, Evaluation or Epoch are not earned.

The obligation is frozen; role count, field spelling and physical placement are not. Move must preserve the single Claim truth store and immutable source truth. A convenience index or pointer must be rebuildable and incapable of independently conferring currentness. No globally minimal schema claim is made.

Structural-leverage comparison at this resolution:

| Proposed protection | Mechanical obligation and liability removed | Freedom retained / smaller alternative |
| -- | -- | -- |
| Protected inquiry participation | Exact tuple, dependency membership and publication-role checks prevent a well-formed wrong result releasing the parent. | Question and evidence content remain open to semantic judgment. One protected Artifact family can suffice; separate Parent/Child tables are not required. Unchecked JSON merely relocates the obligation to the model. |
| Protected parent reentry | Predecessor and observed-basis validation prevent stale continuation and duplicate successors. | Semantic disposition remains inspectable judgment. A local transaction/CAS can suffice; no general coordinator is mandated. A prompt reminder or read-only snapshot cannot replace the write-boundary check. |
| Retained judgment findings | Coverage, exact method binding and outcome consistency prevent producer-label substitution. | Novel interpretations remain explicit uncertainty. One judgment record can carry findings and limits; a separate universal Evaluation store adds no demonstrated protection. |
| Exact history plus observation closure | Complete-chain and version checks distinguish change-and-restore, partial completion and missing state. | Irrelevant changes do not require reevaluation. Existing event/version identities suffice; a clock or duplicated currentness ledger adds no demonstrated discrimination. |
| Source-linked recovery card | Deterministic retrieval/folding removes repeated search and hidden-state reconstruction. | Local comparison and explanation remain with the worker. A regenerated projection is smaller than an independently maintained semantic summary; the raw evidence remains available for challenge. |

## 3. Selected behavioral mechanism — SH1, SH2, SH5

The following names describe responsibilities, not required tables or services. Every persisted first-class subject has a stable Referent; exact versions have their own retained identities. Revising an inquiry contract creates a new retained version with explicit lineage; it does not overwrite the old question.

**M1 — Bind the parent decision.** Retain a parent inquiry contract with:

* inquiry/version identity, focal Referent, initiating contrast and active discriminator;
* exact proposed next inspection step and scope; permitted inquiry remit and exclusions;
* exact governing/decision basis, source standing, versioned bytes and each decision-bearing dependency;
* a parent decision Claim and exact scoped `depends_on` Claim identifying the governance component whose status conditions that Claim;
* the unresolved proposition, admissible answer branches and their different parent consequences;
* why parent-resolution disposition is insufficient, what is suspended, and the reentry conditions;
* observation sources and freshness/change rules for each dependency, plus known limits;
* the bounded child remit, stopping condition, and unresolved-question route.

A dependency slot is a locator into this retained contract, not another truth store. It references the canonical dependency Claim and the exact component/version. Structural checks verify endpoints and slot membership. Semantic examination verifies that the proposition actually conditions the specified next step. A merely syntactically present or irrelevant dependency cannot open recursion.

**M2 — Open one bounded child and suspend dependent parent continuation.** The opening binds the exact parent inquiry version, predecessor, dependency Claim/slot, focal component Referent/version, child question, criteria/method basis and remit. It records the consequence test and why this uncertainty cannot safely remain at parent resolution. Opening and suspension are one consistent transition: a committed child cannot coexist with a falsely unsuspended dependent parent step. A failed opening cannot create an effective child. One active child is admitted for this specimen; competing attempts cannot create two accepted successors.

The child may examine the same focal Referent under a different question, or make an exact component focal. Both cases retain distinct inquiry identities and questions. Inquiry parenthood is native participation in the opening, not `depends_on` repurposed as nesting, causal predecessor, or holarchic containment.

**M3 — Conduct and retain bounded child judgment.** The committed opening is sufficient attempt evidence for the first evaluation attempt; no redundant start object is mandated. Retain the exact evidence and resulting judgment under section 4. If an interrupted attempt must be retried, retain a new attempt identity and predecessor tied to the same child contract; replay alone does not initiate it. A new method/criterion is a new explicitly bound attempt/contract, never a mutation of the old result. Only one terminal judgment per exact attempt is admissible; conflicting retries are rejected.

**M4 — Return to the exact dependency.** A returned judgment must match child contract, attempt, parent version, dependency, component/version, proposition and scope. Attaching an out-of-date result may preserve historical evidence but cannot satisfy a different active dependency. The same bytes from another child are not the same participation. A valid FAIL is a valid returned judgment; a forged or incomplete PASS is not valid support. All other parent dependencies remain independently necessary according to the retained parent contract.

If several historical attempts exist, parent reentry explicitly identifies the relied-on attempt/result and dispositions earlier conflicting or failed findings. It must not select the newest success by timestamp or silently erase an earlier contradiction. If requalification changes the parent contract's exact basis, retain a successor version and an explicit correspondence or rejection of the old child result; equality of the returned label is not that correspondence.

**M5 — Independently disposition parent reentry.** Recover the parent contract, result and complete intervening history; observe the declared decision-bearing state at the reentry boundary. Validate both the child judgment's applicability and the parent's whole decision basis. The reentry act binds parent/version, open/attempt/result identities, dependency, observed versions/history boundary, expected parent predecessor, disposition, reasons and next route. It is separately attributable and inspectable even if the same human or process produced the child.

| Disposition | Exact condition and consequence |
| -- | -- |
| CONTINUE | The result supports the required branch under the exact child contract; the parent's proposed next step, focal question, dependency conditions and independent remit still apply; required observations are complete; no unhandled decision-bearing change intervened. Commit only the specified inquiry continuation disposition. No action authorization or designation follows. |
| REQUALIFY | The focal question remains applicable, but a decision-bearing version, method, criterion, dependency, observation condition, designation or remit basis changed, or its continuity is unresolved. Direct continuation is withheld. Obtain the named new evidence/judgment or independent designation/remit disposition; then perform another parent reentry. Equivalent outputs alone cannot discharge this route. |
| REORIENT | A supported finding defeats the parent's present discriminator, proposed step or framing, or the focal subject/question/scope must change. Preserve the old inquiry and record the reason and successor inquiry route. This records a need for a new orientation; it does not designate a replacement Master Key or amend governance. |
| HOLD / Question Forward | Missing payload/history/observation, unresolved conflict, missing remit, unavailable admissible method or unresolved child result prevents a supported next disposition. Retain the exact constraint, calibrated question, observable discriminator, route and restart condition. If no admissible observation exists, say so explicitly. |

Precedence is conservative: missing integrity or observation needed to choose a branch yields HOLD; established framing defeat yields REORIENT; otherwise decision-bearing drift yields REQUALIFY; CONTINUE requires all positive conditions. HOLD may carry a known requalification task. A FAIL does not mechanically imply REORIENT: the parent contract determines whether it defeats the framing, requires a narrower requalification, or leaves an unresolved question. A PASS never mechanically implies CONTINUE.

**M6 — Preserve history and reentry after interruption.** Read-only reconstruction reports the last established transition and presently supported routes. It never invents absent result/reentry records. Exact request replay returns the same historical record and separately reports present applicability; it cannot mint another transition or resume work. New reentry after an earlier HOLD/REQUALIFY uses a new request bound to the new predecessor and observations.

## 4. Minimum judgment/provenance contract — SH3

A consequential child judgment must retain or exactly reach:

| Required binding | What a reviewer can inspect |
| -- | -- |
| Participation | Parent inquiry/version, dependency Claim/slot, child inquiry/attempt, focal subject/component version and scope. |
| Proposition | The exact question answered and meaning of its outcome; no broader proposition silently substituted on return. |
| Evidence | Exact retained input bytes or immutable native records with identity, revision scheme/digest, source provenance, missing items and admissibility limits. A mutable locator or digest without required historical bytes is insufficient. |
| Standard | Predeclared criteria/obligations and exact comparison/interpretation basis, including who supplied it and its standing. |
| Method | Identified method/version, recoverable method or procedure, configuration that affects findings, supported interpretation range and required observations. |
| Attribution | Producer, evaluator/checker and observer identities or authenticated roles where they affect custody, plus their separate remits. A role name is not a real authority root. |
| Transformation | Obligation-level findings and evidence witnesses, contradictions, coverage and limits; enough to challenge how inputs support the result. No private chain-of-thought requirement. |
| Outcome | PASS, FAIL, INDETERMINATE or UNKNOWN with explicit semantics and non-promotion limits. Preserve native INCOMPLETE where a reused method reports missing inputs; do not normalize it to FAIL or success. |

PASS means all required checks correspond within this identified contract. FAIL means an established violation, retained by finding. INDETERMINATE means available evidence/method cannot discriminate a required branch. UNKNOWN means required state or evidence is unavailable; it is not proof of nonexistence. Non-PASS cannot supply positive support for a proposition requiring PASS. A parent may still take a separately justified diagnostic route whose condition is a negative finding.

The protected publisher checks tuple, method, obligation coverage, admissible role and consistency of outcome with findings. Stable equality/coverage checks belong in structure. Semantic correspondence remains a bounded evaluator responsibility with witnesses and sensitivity controls. Producer-supplied labels and self-reported interpretation cannot certify themselves. Unsupported novel interpretation remains incomplete/indeterminate, not coerced into the finite comparison vocabulary.

**Evaluation disposition:** a dedicated universal Evaluation primitive is not earned. A bounded judgment Artifact with distinct protected publication is earned. Generic storage does not imply generic evaluation semantics. The BUILD 5B receipt and BUILD 7 evaluator establish feasibility of retained transformations but do not prove this new contract. No generalized “add an Evaluation everywhere” invariant is ratified.

Bad-Evaluation controls must reach the actual parent acceptance surface: bare label; changed latest bytes; missing input; method or criteria drift; wrong proposition/scope; opaque procedure; producer-forged findings; contradictory prose versus structured result; untested comparator sensitivity; authority/currentness embedded in output. In each case reject positive reliance or retain explicit uncertainty. A correct hash over an opaque or false assertion does not fix its semantics.

## 5. Recursion threshold and stopping rule — SH4

Open descent only when the retained parent contract can show **two admissible answers with different legitimate next-step consequences**, identifies the exact dependency causing that difference, and shows that parent-level evidence/interpretation cannot discharge it at the required resolution. There must be a bounded admissible inquiry path capable of discriminating those branches. This is a semantic judgment with retained witnesses, followed by structural enforcement of its exact scope.

Pair A: the parent's next bounded inspection relies on governance component G's proof-sensitivity condition. Evidence that G's declared comparator distinguishes the named violating case permits reliance, while evidence of insensitive PASS withholds it. The parent summary lacks the comparator/witness examination needed to decide; a child must inspect that component.

Pair B1: an unresolved display label for G changes neither proposition, basis nor next step. Record the calibrated question if useful; no child opens. Pair B2: another parent dependency independently bars the same proposed step under every admissible answer to the candidate child question. For that step, opening the child has no decision consequence; HOLD and route the blocker. Pair B3: the required exact witness is already available and can be checked at parent resolution. Perform that local check; no recursive episode is earned. Reconsider only when a changed next-step proposal makes the dependency consequential.

The stopping rule is an analytical boundary, not confidence by exhaustion: stop when the declared proposition has a supported bounded judgment, when no unresolved issue can change this next step at the active resolution, or when admissible evidence/remit is unavailable. The latter preserves HOLD/QF; it does not turn inability into success. Do not inquire into universal evaluator correctness. A new challenge must name a concrete decision-bearing premise and pass the same threshold. Repeating the same question/basis without new evidence or an admissible new discrimination path is not progress.

For this first specimen, only one child level and one active child are admitted. A genuine indispensable deeper dependency is retained as QF/HOLD and returned for scope disposition, not suppressed or implemented recursively by stealth. This is a proof-boundary limit, not a universal recursion-depth law. If no real self-application specimen can complete without changing that accepted capability premise, classify RETURN TO SENSE.

## 6. Intervening change, causality and enforcement — SH5, SH6, SH8

| Intervening finding | Reentry treatment |
| -- | -- |
| Parent focal identity, initiating contrast, proposed step or scope changes | Old return remains historical; REORIENT or explicitly bind a successor inquiry. Never silently attach to the new question. |
| Exact governance component/version, criterion, evaluator method, interpretation basis or other decision-bearing dependency changes | REQUALIFY affected reliance; invalidate direct continuation. Preserve the old judgment's historical scope. |
| Governing designation/remit revoked, withdrawn, replaced or expired where continuity is required | Withhold continuation; independent governing route must restore applicable basis. Child success cannot restore it. |
| Dependency changes and returns to its original bytes | Intervening event/predecessor identity remains a change. REQUALIFY continuity unless the already-bound contract explicitly classifies it as non-decision-bearing; no ABA shortcut. |
| Unrelated retained evidence or audit wall time changes | No automatic requalification. Retain why it lies outside the declared dependency/condition set. |
| Required observation missing, contradictory, stale or outside declared coverage | HOLD with the exact missing discriminator. Absence of a change record is not evidence of no change without the observation-completeness assumption. |
| Change races with parent reentry | Both must participate in a common serialization/conflict boundary. A stale observation cannot commit continuation; retry is a new observation/reentry decision, not a blind retry. |

Use immutable transition identity, explicit predecessor and exact dependency/version history. Wall time is audit metadata, except where an independently supplied condition explicitly uses time. There is no global tick, epoch object or vector clock. A coherent read snapshot supports historical reconstruction; it alone does not close the race at a subsequent write boundary. Move must derive a protected serialization or compare-and-validate realization covering every declared decision-bearing writer in the disposable specimen.

The dormant multi-child falsifier remains exact: overlapping independent children return in an order whose causal dependencies cannot be reconstructed faithfully from existing predecessor/dependency/history. Such overlap is not admitted here. If later admitted, test the existing substrate first; only demonstrated insufficiency activates mature happened-before/version-vector/epoch comparison. Parent/change races in this serial specimen do not by themselves earn distributed causal machinery.

| Obligation | Enforcement mode and required surface |
| -- | -- |
| Exact identities, versions, roles, dependency membership, one active child, predecessor, duplicate conflicts | STRUCTURAL: protected controller/transaction plus constraints as needed. Never rely on model recollection. |
| Decision consequence, scope correspondence, evidence interpretation, change relevance | SEMANTIC: bounded evaluation with retained standard, findings and witnesses. |
| Completeness/freshness of declared observations | OBSERVATIONAL: identified retained observation route; STRUCTURAL revalidation at parent transition boundary. |
| Child publication cannot authorize/designate/amend or advance parent | STRUCTURAL custody/publication boundary; AUTHORITY checks for any independently supplied inquiry remit. |
| Parent disposition and historical/current applicability separation | STRUCTURAL transaction/revalidation and SEMANTIC disposition basis. |
| New governing authority, invariant changes, real actions | AUTHORITY: separate existing human/governing route; unavailable to this specimen. |

One actor may occupy several roles, but records and privileges must preserve the difference. The child can publish evidence within its remit; it cannot mutate the parent contract, dependency truth, designation/currentness or reentry history. The parent controller may record bounded inquiry disposition; it cannot create real authority or execute an Action Envelope.

## 7. Cold reconstruction and cognitive offload — SH7

A fresh reader receives only a durable inquiry locator and access to the declared retained state. It follows exact pointers, validates identity/role/digest, obtains the full predecessor chain and declared observation closure, and produces a compact information card:

1. parent focal Referent, question, proposed step and governing basis;
2. exact unresolved dependency and consequence that earned descent;
3. child question, subject/version, remit and attempt state;
4. returned judgment or explicit unresolved status, with findings/limits and exact provenance links;
5. relevant changes since opening, including missing observation coverage;
6. last parent disposition, present applicability, and admissible next route/constraint.

The card is a derived read projection. It carries its source identities and observation boundary, cannot independently establish currentness, and is regenerated or rejected if those inputs change. It need not duplicate raw evidence. A retained decision summary is immutable evidence of what was decided then, not a live currentness cache.

Externalize repeated fragile inference: identity/question distinction, dependency membership, why the child matters, criteria, witnesses, changes, remits, unresolved questions and reentry conditions. Leave cheap local reasoning to the worker: wording an explanation, comparing a supplied witness, selecting an already admissible inquiry route, or noticing a new anomaly and recording it. Do not precompute all possible interpretations or synthesize certainty from missing state.

**Cold-worker falsifier:** Move supplies a deliberately lower-capability worker, or a fresh worker constrained to a fixed context budget, with the recovery card and exact drill-down access, no initiating conversation and no fixture answers. For the bounded specimen, target an initial card of at most 2,000 tokens and at most 8,000 total input tokens per case. These are diagnostic test budgets, not ontology or universal operational limits. Test normal continuation, drift, missing evidence, same-Referent/different-question and replay after later change. Retain worker/version, actual input/token counts, source accesses and decisions. It must correctly recover all six facts above, reject all forbidden continuations, and identify the valid positive route; universal HOLD is not success.

If success requires inferring unstated dependency, authority or intervening change, the representation is under-externalized. If success requires a manually authored answer card per fixture, independent mutable truth, or exhaustive interpretations, it is over-materialized. A generic reader/format/query defect is Move repair; missing decision semantics is Shape revision. An isolated worker error with complete state is reported as such, not automatically an architecture defect. Budgets cannot be relaxed post hoc to claim the original test passed.

## 8. First bounded specimen — SH9

Select a **synthetic governance-reliance inquiry over its own reentry/evidence machinery**. The focal subject is a retained representation G of the bounded governance mechanism used by the inquiry, not an unrelated sample document. The fixture explicitly binds the parent to G1 as its inspection basis under synthetic-only remit. It also retains the real governing invariant source/version from which the tested distinction derives, without designating the synthetic representation as real governance.

Parent question: “May this exact retained inquiry judgment be relied upon for the next bounded inspection step under G1, or must reliance be requalified/reoriented/held?” The parent has at least two separately addressable necessary dependencies: D1, the proof-sensitivity/provenance condition of the governance component; D2, independent continued applicability of the parent basis/remit. D1 becomes unresolved because the parent's receipt summary does not establish whether the exact comparator used distinguishes the declared violating case. A child makes that same decision-bearing component focal and examines its exact method and witnesses against a protected finite comparison basis. The result answers D1 only. Parent reentry still checks D2 and the complete retained parent contract.

This is self-application because the system examines a property of the very judgment/reentry machinery on which its current inquiry relies, then applies its unchanged governance constraints to its own returned judgment. It is not self-ratification: the child neither supplies the controlling standard nor changes it, and the synthetic dependency cannot authorize real reliance or amendment. The comparator of the bounded property is not asked to prove its own universal correctness; declared method/custody assumptions remain inspectable.

| Variant within the one specimen family | Required observable result |
| -- | -- |
| Valid exact witnesses; no decision-bearing change | Child support plus independent parent checks yield CONTINUE for the named inspection step. |
| Same child PASS; D2 changes during descent | Parent REQUALIFY, never direct continuation. A fresh applicable basis and separate reentry can later continue. |
| Child establishes that the relied-on comparator accepts the named violating case | Parent cannot treat D1 as supported; the declared parent framing/step is defeated and routes to REORIENT or the specifically justified corrective inquiry, without changing the rule. |
| Missing comparator, witness, history or observation | UNKNOWN/INCOMPLETE and HOLD with actionable QF; no forged certainty. |
| D1 display label only, or exact needed witness already checked at parent resolution | No child opening; local QF/check suffices. |
| Parent and child share focal Referent but have different questions; a second similar inquiry is present | Exact question/dependency binding survives restart and rejects result swapping. |

The proof must include a path that completes the bounded positive case and paths that select all four parent dispositions. It cannot pass only by blocking everything. Newly required requalification is performed only over the synthetic retained inquiry basis; any real governance replacement remains outside the specimen.

Alternatives lose at this boundary: governance-object registration/quotation proves only addressability; naked Evaluation-of-Evaluation risks returning a label with no parent decision consequence; exhaustive nested inquiry creates unearned regress; multi-child coordination tests a larger temporal capability; actual action/self-amendment introduces independent authority dependencies. The strongest part of the secondary Evaluation-of-Evaluation candidate is retained as the D1 adversarial probe within the selected specimen, without opening another mechanism.

**Analytical discrimination, performed in Shape; not execution evidence.** Hold the parent subject G, question, dependency D1 and criterion “the declared violating witness must be rejected” constant. Method M-good yields PASS for the corresponding witness and FAIL for the violating witness; M-bad yields PASS for both. A receipt containing only “PASS” cannot distinguish these situations. The selected judgment retains both witnesses, method identity and obligation-level outcomes, so the parent has a basis to distinguish support from insensitivity. Now keep the M-good child result constant but replace D2's retained applicability event while the child is open. A result-only mechanism produces the same continuation in both cases; the selected reentry contract requires REQUALIFY in the changed case. Restore D2's bytes but retain the intervening event: a digest-only mechanism again collapses the cases; the selected history contract still requires disposition. Finally remove D2's observation coverage: the selected mechanism returns HOLD, not “unchanged.” These comparisons earn provenance, independent reentry and retained history without earning a universal Evaluation or epoch primitive. P01/P05/P06/P08/P09 must test these consequences against actual implementation later.

## 9. Finite Move proof contract — SH10

These are acceptance obligations, not reported PASS results. Each negative control must exercise the same acceptance/reader surface as its corresponding positive case. Preserve original failures, exact method/fixture versions and corrections. Freeze implementation plus comparison contract before an untuned holdout; label subsequent reruns as regressions, not new independence.

Failure routes: **M** = implementation diverges from these frozen semantics, repair in Move. **S** = compliant realization cannot satisfy the obligation or the contract omits a necessary distinction, return to Shape. **T** = invalid/inconclusive test or environment, repair evidence path without altering semantics; do not claim PASS. **Sense** = accepted capability premise itself must change, RETURN TO SENSE. Each row gives M/S discrimination; all may have T if the test failed to exercise its intended boundary.

| ID | Obligation and paired/adversarial control | Falsifier and disposition |
| -- | -- | -- |
| P01 | End-to-end serial self-application; valid D1/D2 versus defective governance-property witness | Mere quotation, a hardcoded outcome, or no changed legitimate parent route is failure. M for bypass/incorrect fixture; S if the selected mechanism only proves plumbing; Sense if non-amending self-application is impossible. |
| P02 | Exact parent/child/component identity, version, question and dependency; swap one at a time, including same subject/different question | Wrong tuple accepted. M for missing enforcement; S if retained semantics cannot distinguish the cases. |
| P03 | Exact dependency is load-bearing and child result supports only it; add irrelevant evidence and independently bar D2 | Irrelevant child opens or PASS substitutes for whole parent basis. M for omitted threshold/whole-basis check; S for ambiguous dependency contract. |
| P04 | Paired recursion threshold A/B1/B2/B3 | Child materializes when answers cannot change the proposed next step or parent resolution suffices; alternatively necessary bounded child can never open. M for wrong gate; S for inadequate threshold. |
| P05 | Inspectable judgment: bare label, missing input, criteria/method drift, opaque procedure, scope mismatch, contradictory prose/typed outcome | Positive parent reliance survives any undisposed violation. M for checks/retention defect; S if defined provenance remains insufficient. |
| P06 | Same checking surface distinguishes known correspondence from the named violating governance case; producer-forged judgment and insensitive comparator controls | Insensitive PASS can support parent continuation. M for evaluator/publication bug; S for missing independent comparison basis or inadequate proof contract. No universal semantic correctness claim. |
| P07 | Current versus newest: retain newer undesignated basis alongside older applicable basis | Reader silently chooses latest, or newer presence alone causes blanket requalification. M for selection logic; S for incomplete applicability semantics. |
| P08 | Child PASS with parent/component/method/criterion/remit drift; include change-and-restore and revocation | Direct continuation without disposition of drift. M for stale/ABA defect; S if observation/history cannot represent the distinction. |
| P09 | Race parent reentry against a declared basis writer; commit and rollback variants | Stale continuation crosses the protected boundary or rolled-back change becomes asserted fact. M for concurrency/isolation error; S if no compliant bounded serialization is possible. |
| P10 | All four parent dispositions, positive and negative branch witnesses; unrelated change control | Always-HOLD, PASS→CONTINUE shortcut, FAIL→automatic reorientation, or irrelevant changes invalidate everything. M for branch error; S for missing decision rule. |
| P11 | Duplicate open/result/reentry and lost acknowledgement; identical retry versus changed tuple | Duplicate accepted transition, changed request masquerades as retry, replay creates entitlement. M for idempotency defect; S if contract cannot distinguish replay from a new attempt. |
| P12 | Kill between opening, evaluation/result publication, return and reentry; include rollback before/after committed opening and lost result/reentry acknowledgement | Phantom completion, active child without parent suspension, or lost committed result/reentry. M for commit/recovery defect; S for missing retained transition. |
| P13 | Fresh process with only locator/state; delete or hide one required payload/history link; restart at open, returned and dispositioned points | Conversational memory/fixture imports needed, or missing evidence produces success. M for reader defect; S for under-specified retention. |
| P14 | Child attempts parent disposition, contract/Claim modification, designation, authority grant, schema/runtime mutation or action dispatch; roles audited | Any unauthorized mutation succeeds through the bounded interface. M for privilege defect; S if mechanism needs such access; Sense if real authority/amendment is indispensable. |
| P15 | Replay a once-valid continuation after later basis change; corrupt/obsolete derived card; reorder wall-clock timestamps | Historical disposition becomes present permission, cache becomes independent truth, or wall time supplies causality. M for reader/currentness bug; S for inadequate historical/current distinction. |
| P16 | Lower-capability/context-constrained cold-worker test in section 7, including valid positive route | Hidden-state inference/manual per-case answer cards or token-heavy archaeology required. M for presentation/query defect; S for missing semantics or duplicate truth requirement. |
| P17 | Second active child and evaluator-of-evaluator repeat with no new discriminating evidence | General recursion silently opens, or unresolved deeper dependency disappears. M for boundary defect; S for stopping-rule defect; Sense if bounded capability needs a different premise. |
| P18 | Exact substrate composition: new publication roles cannot hit old checker paths, overwrite old artifacts, broaden old privileges or alter BUILD 7 current selection | Reuse changes predecessor semantics/custody. M for integration defect; S if preserving both contracts requires semantic redesign. Test affected seams only, not full closed-Build proof replay for reassurance. |

Cross-cutting disposition: duplicate/replay P11/P15; concurrency P09/P11/P17; stale basis P07/P08/P15; partial failure/rollback P12; restart P13/P16; wrong identity/role P02/P14; wrong version P02/P07; drift/revocation P08/P09; checker bypass/false PASS P05/P06; retry/idempotency P11/P12; time/order ambiguity P08/P09/P15; unauthorized mutation P14/P18. **All twelve are APPLICABLE** within this bounded slice. Independent overlapping children are **DEFERRED**, safe because only one active child is admitted; the deferral expires before admitting overlap, through QF-9.5 and temporal-coordination Sense. There is no blanket NOT_APPLICABLE exemption for concurrency.

Move's return must map each P-ID to exact retained observations, controls, method/implementation version, result, limits and failure route. A skipped obligation is not PASS. Same-worker authorship and trusted custody are explicit Register-B limits; independent-author assurance is not manufactured by a second process or a holdout alone.


