STATUS: P2.0 CONSTRUCTED — RUNTIME GATES UNCHANGED
DISPOSITION: PROJECTION
ROLE: Phase 2 obligation-to-capability and zipper-boundary harness
AUTHORITY: Derived from the human-authorized Phase 2 Final Shape Vector and current ECB v2 governing sources
REVALIDATE: On any named capability activation, failed frozen falsifier, or governing-source change

# P2.0 — Projection and Boundary Harness

## Purpose and scope

This harness maps the settled ECOS / SSMM obligations onto the greenfield ECB v2 substrate. It is the
only Phase 2 installation unit opened by the current authorization.

It does not implement SSMM, add persistence, import legacy ECOS, create substitute substrate, select a
final interface, activate recursion or propagation, or reopen settled architecture.

For this harness, **decision-material** means capable of changing at least one currently governed
branch, phase closure, Output Contract, standing or currentness judgment, action eligibility,
authorization result, execution consequence, or required reopen scope. This supplies the decision
consequence whenever the tables use “material.”

## Reading the matrix

Each row is one independently falsifiable obligation. `OWNING LAYER` names the layer that must make the
capability correct. `ECOS PROJECTION` names how ECOS consumes or expresses it; it never transfers
ownership of canonical identity, truth, authority, history, currentness, or lifecycle into ECOS.

Availability has exactly these meanings:

| Value | Meaning in this harness |
|---|---|
| `AVAILABLE` | Installed and evidenced in the current greenfield substrate for the stated scope. |
| `EXPECTED_IN_BUILD_N` | Not installed. The named ECB capability is currently projected for Build N; capability evidence, not the number, releases its consumers. |
| `ECOS_LOCAL` | Characteristic ECOS behavior to compile over installed substrate. This classification does not release a gated runtime. |
| `INTERFACE_LOCAL` | Replaceable access or interaction behavior with no canonical-state authority. |
| `APERTURE` | An explicit unresolved distinction with a discriminating forward question and a nonblocking current effect. |
| `CONFLICT` | A concrete contradiction with settled architecture; no current row has this status. |

Owning layers are `ECB`, `ECOS`, or `INTERFACE`. A zipper seam still has one owner: ECB owns the
canonical capability; ECOS owns its operational projection; an interface owns only replaceable
presentation or transport behavior.

## Boundary decision procedure

Apply these questions in order to each missing requirement:

1. Can ECOS preserve and enforce it using installed ECB capabilities without competing identity,
   truth, authority, history, lifecycle, or current-state machinery?
   - Yes → `P2-COMPILE`: implement the minimum ECOS projection after its capability gates release.
2. Must correctness remain invariant across consumers, or would failure compromise canonical identity,
   provenance, standing, authority, currentness, history, transactionality, or cross-surface consistency?
   - Yes → `P2-ROUTE-SUBSTRATE`: stop the local workaround and route the exact property to the narrow
     ECB Shape / Build qualification.
3. Is it characteristic operational work whose failure is confined to the ECOS projection?
   - Yes → keep it in the smallest local ECOS Shape; projection failure routes `P2-RESHAPE-LOCAL`.
4. Would either answer assume a fact that can change the owning layer?
   - Yes → `P2-HOLD`: preserve an Aperture and ask the discriminating forward question.
5. Does observed implementation evidence contradict a settled constitutive commitment?
   - Yes → preserve the falsifier and use `P2-REOPEN-UPSTREAM` at the smallest governing surface.
6. Would continuing collapse a constitutive distinction or authorize an unavailable transition?
   - Yes → `P2-STOP` before mutation.

Implementation convenience, existing legacy anatomy, newest content, retrieval rank, and client
affordances are not inputs to this classification.

## Zipper topology

```text
evidence-only semantic recall ───────────────────────────┐
                                                        v
ECB canonical substrate ──> ECOS operational projections ──> Door / Human Rail / Agent Rail
 identity, provenance,       orientation, SSMM,             replaceable access and enactment
 standing, authority,        continuity, qualification      surfaces; never canonical stores
 history, currentness,
 governed transitions

             failure of a shared invariant ──> route down to the smallest ECB Build Shape
             failure of a correct projection ─> reshape the smallest ECOS-local seam
             uncertain owner ──────────────────> hold with a discriminating forward question
```

The arrows are reads, projections, qualified requests, and evidence-bearing returns. They are not
authority inheritance or replicated state flows.

## Explicit assumptions and tradeoffs

Assumptions fixed for this P2.0 projection:

- accepted Build 2 receipts accurately describe the installed substrate;
- Build 3 is shaped but has no implementation or installation receipt;
- the Build Contract's Build 3–10 sequence is the current dependency projection, while the named
  capability remains the release condition; and
- no concrete upstream contradiction has been produced by constructing this map.

Tradeoffs accepted for this harness:

- row-level granularity creates more maintenance work, but permits one failed obligation to reopen
  without broad architectural churn;
- a documentation/static harness can freeze omissions, classifications, and routes now, but cannot
  establish future runtime semantics; each later seam still needs executable field fixtures;
- exact ECOS payloads and physical structures remain open, which prevents premature ontology and
  duplicate state at the cost of deferring implementation convenience; and
- interface-specific behavior is intentionally replaceable, so a future Door may require a local
  redesign while canonical state and governance remain untouched.

## A. Zipper substrate and control obligations

| ID | SOURCE OBLIGATION | REQUIRED CAPABILITY | OWNING LAYER | CURRENT AVAILABILITY | ECOS PROJECTION | ENFORCEMENT / OBSERVATION | FALSIFIER | FAILURE ROUTE | MINIMUM REOPEN SCOPE |
|---|---|---|---|---|---|---|---|---|---|
| P20-Z01 | Persistent first-class subjects retain stable identity; ECOS must not create competing identity. | Universal Referent registration and resolution. | ECB | AVAILABLE | Address focal objects and all later first-class loop objects by ECB Referent IDs. | STRUCTURAL: Referent constraint and exact-ID observation; no ECOS identity registry. | One persisted ECOS first-class object is addressable only by a local/client identifier. | P2-ROUTE-SUBSTRATE; P2-STOP any shadow registry. | ECB Referent coverage for the exact missing object kind. |
| P20-Z02 | Evidence and provenance remain distinguishable from assertion and retrieval. | Stable Thought evidence identity, source, capture time, and provenance-bearing access. | ECB | AVAILABLE | Sense may retrieve evidence but labels it evidence with source and Referent identity. | STRUCTURAL + OBSERVATIONAL: canonical Thought fields and exact-source inspection. | Retrieved text is presented as an ECB assertion or loses its source-bearing identity. | P2-ROUTE-SUBSTRATE if provenance is absent; otherwise P2-RESHAPE-LOCAL. | Missing ECB evidence interface or the smallest ECOS evidence projection. |
| P20-Z03 | Claims, evidentiary basis, and standing must remain independently reconstructable. | Claim + standing + Evidence Link substrate. | ECB | EXPECTED_IN_BUILD_3 | Project assertions and their qualification separately from cited evidence. | STRUCTURAL + SEMANTIC observation against frozen Worked Trace 03; capability remains unavailable until built and verified. | ECOS must store a duplicate assertion/standing record to distinguish source from inference. | P2-ROUTE-SUBSTRATE. | ECB Build 3 capability only; do not redesign ECOS. |
| P20-Z04 | Required relationships use typed relation support without a competing relation truth store. | Referent-to-Referent typed relation Claims. | ECB | EXPECTED_IN_BUILD_4 | Read relation Claims into contextual Sense/Shape projections; do not persist quadrant positions as ontology classes. | STRUCTURAL endpoint/type checks plus semantic qualification. | ECOS needs a canonical local edge table to preserve a relationship used by multiple consumers. | P2-ROUTE-SUBSTRATE. | ECB Build 4 predicate and relation-Claim slice required by the failing seam. |
| P20-Z05 | Consequential transitions have immutable, attributable history; correction is additive. | Immutable Events with actor, authority basis, inputs, outcome, and time. | ECB | EXPECTED_IN_BUILD_5 | Render phase and governance history without conversational reconstruction. | STRUCTURAL immutability + transaction-bound Event creation + replay observation. | A consequential transition can be known only from mutable live state or agent prose. | P2-ROUTE-SUBSTRATE. | ECB Build 5 Event property required by that transition. |
| P20-Z06 | Maps, receipts, Master-Key expressions, envelopes, policies, and packets remain versioned representations, not their referents. | Immutable or versioned Artifacts with provenance and stable identity. | ECB | EXPECTED_IN_BUILD_5 | Use artifacts for addressable orientation, closures, receipts, and justified frozen handoffs. | STRUCTURAL version lineage + provenance observation; artifact identity remains separate from represented referent. | ECOS overwrites a representation in place or treats an artifact ID as the subject's identity. | P2-ROUTE-SUBSTRATE. | ECB Build 5 Artifact/version property used by the seam. |
| P20-Z07 | Authority must be valid and reconstructable; capability, standing, confidence, or possession cannot manufacture it. | Bootstrap trust root, policy activation, authority designation, bootstrap exhaustion, governed succession. | ECB | EXPECTED_IN_BUILD_6 | Display and consume validated authority references; never infer authority from worker capability. | AUTHORITY checks plus restart reconstruction and succession history. | An ECOS worker can authorize a transition because it can execute it or because retrieved content says it may. | P2-ROUTE-SUBSTRATE; P2-STOP the transition. | ECB Build 6 authority property implicated by the attempt. |
| P20-Z08 | Current is explicitly designated for a scope and is not synonymous with newest. | Governed currentness designation and query. | ECB | EXPECTED_IN_BUILD_6 | Resolve the operative object for the declared operation/scope before presenting it as current. | AUTHORITY + STRUCTURAL designation constraint; adversarial newer/non-current observation. | ECOS selects the newest or highest-ranked representation as operative without designation. | P2-ROUTE-SUBSTRATE; P2-STOP the dependent transition. | ECB currentness designation for the exact object/scope. |
| P20-Z09 | A current local Master Key is a decision-complete orientation handle whose carried distinctions remain independently addressable. | Versioned Master-Key expression plus explicit governed designation. | ECB | EXPECTED_IN_BUILD_7 | Compose working orientation under the designated local Master Key and expose stable pointers/tracers to every decision-changing input and sensor trigger. | AUTHORITY designation + structural reachability + fresh-worker reconstruction. | Two workers using the same claimed Master Key cannot recover the same decision-changing basis, or the expression collapses focal object, frame, warrant, evidence, or sensors. | P2-ROUTE-SUBSTRATE if designation/reachability fails; otherwise P2-RESHAPE-LOCAL. | ECB Build 7 Master-Key property or the smallest ECOS orientation projection. |
| P20-Z10 | A proposal does not authorize Move; proposal, acceptance, installation, authority, standing, currentness, custody, and execution permission remain distinct. | Governed Action Envelope lifecycle and eligibility decision. | ECB | EXPECTED_IN_BUILD_8 | Bind an accepted/installed Shape to a validated envelope; present each lifecycle and permission state separately. | AUTHORITY + STRUCTURAL lifecycle ordering inside the canonical transaction boundary. | A proposal, acceptance click, current designation, or capable worker can directly trigger consequential execution. | P2-ROUTE-SUBSTRATE; P2-STOP execution. | ECB Build 8 lifecycle transition or policy that failed. |
| P20-Z11 | Consequential state changes are atomic and cross-surface consistent. | Transactional transition boundary coupling authority check, state change, Event, and required receipt references. | ECB | EXPECTED_IN_BUILD_8 | Invoke one governed transition and consume its committed result; do not coordinate canonical writes in client code. | STRUCTURAL + AUTHORITY transaction tests, concurrent attack, rollback residue inspection. | A partial Move can commit, or Door and Agent Rail can observe contradictory canonical states after commit. | P2-ROUTE-SUBSTRATE; P2-STOP the seam. | Exact ECB transition transaction; no general ECOS transaction store. |
| P20-Z12 | Semantic memory is not live state; retrieval is not authority; representation is not installation. | Evidence-only semantic retrieval with operative state resolved through governed structures. | ECB | AVAILABLE | Keep recalled material in an evidence lane until explicit qualification and canonical resolution establish its operative role. | SEMANTIC labeling + AUTHORITY checks at every consequential boundary. | A stale retrieved instruction changes currentness, standing, authority, eligibility, or target without a governed transition. | P2-STOP; P2-RESHAPE-LOCAL unless an ECB check is absent. | Contaminated ECOS projection, or the exact missing ECB authorization check. |
| P20-Z13 | Runtime release follows capability evidence, not a hard-coded build number. | Capability-gate evaluation over installed evidence. | ECOS | ECOS_LOCAL | Report each dependency as unavailable/available from receipts and tests; Build 8 is only the current final-prerequisite projection. | OBSERVATIONAL gate over named receipts and falsifier results. | Runtime opens because checkout says “Build 8” although one required capability is absent or unverified. | P2-STOP; P2-RESHAPE-LOCAL. | P2 capability-gate evaluator only. |
| P20-Z14 | Legacy systems are capability evidence and prior art only; import occurs only after a qualified trigger and never supplies authority by existence. | Triggered prior-art qualification with provenance and return to greenfield derivation. | ECOS | ECOS_LOCAL | Ask only whether prior behavior/value/failure fixtures affect the active seam; record disposition without importing anatomy or state. | OBSERVATIONAL audit of trigger, sources, comparison, and selected behavior. | A legacy schema, runtime object, tool inventory, dashboard, or state is copied because it works or exists. | P2-STOP; discard the import; P2-RESHAPE-LOCAL. | The exact greenfield seam and qualification record; no legacy-wide review. |
| P20-Z15 | Settled SIGMA / ECOS / SSMM commitments reopen only under a preserved concrete contradiction, non-executability result, or unavoidable constitutive collapse. | Falsifier capture and minimum-scope upstream routing. | ECOS | ECOS_LOCAL | Preserve failing evidence and name the smallest governing decision surface it contradicts. | OBSERVATIONAL falsifier record reviewed before any upstream amendment. | Upstream architecture is rederived to simplify implementation, or a real contradiction is hidden by local accommodation. | P2-STOP, then P2-REOPEN-UPSTREAM only with the falsifier. | Smallest contradicted upstream decision; never the whole architecture by default. |

## B. P2.1 minimal single-loop SSMM obligations

All `ECOS_LOCAL` rows below remain gated by P20-Z03 through P20-Z11. They classify ownership; they do
not authorize runtime installation.

| ID | SOURCE OBLIGATION | REQUIRED CAPABILITY | OWNING LAYER | CURRENT AVAILABILITY | ECOS PROJECTION | ENFORCEMENT / OBSERVATION | FALSIFIER | FAILURE ROUTE | MINIMUM REOPEN SCOPE |
|---|---|---|---|---|---|---|---|---|---|
| P20-L01 | The first loop begins from contrast/activation, then makes focal selection explicit. | Contrast intake and one addressable focal selection. | ECOS | ECOS_LOCAL | Record the encountered contrast and select one ECB Referent as focal under a declared frame. | SEMANTIC evaluation + observable focal-selection closure. | Work silently retargets, or the focal subject cannot be identified after worker replacement. | P2-RESHAPE-LOCAL. | Contrast-to-focal selection projection. |
| P20-L02 | Working orientation operates under the current Master Key and does not rely on conversational reconstruction. | Reconstructable orientation projection referencing the designated Master Key and decision-changing inputs. | ECOS | ECOS_LOCAL | Compose focal object, frame, closed decisions, dependencies, evidence, sensors, and apertures through stable references. | SEMANTIC composition + fresh-worker replay against P20-Z09. | A fresh worker needs the prior agent's explanation to know the frame or governing discriminator. | P2-RESHAPE-LOCAL unless a referenced ECB capability is absent. | Working-orientation composition only. |
| P20-L03 | Sense identifies the active focal object and preserves reference and frame. | Focal/frame-preserving Sense workspace projection. | ECOS | ECOS_LOCAL | Every Sense observation remains traceable to the selected Referent and frame. | SEMANTIC validation at Sense closure. | An observation cannot be attributed to the active focal/frame or silently changes either. | P2-RESHAPE-LOCAL. | Sense focal/frame projection. |
| P20-L04 | Sense performs the settled comprehensive broad-but-shallow examination. | Complete examination-region plan with low default resolution. | ECOS | ECOS_LOCAL | Instantiate every required region for the focal context before selective deepening. | SEMANTIC completeness check against the settled region grammar. | One required region disappears because no signal was initially retrieved. | P2-RESHAPE-LOCAL. | Sense coverage projection; do not rederive the grammar. |
| P20-L05 | Quadrants / Drives appear at required low resolution without becoming permanent ontology classes. | Contextual directional-position projection over relation/evidence inputs. | ECOS | ECOS_LOCAL | Render the settled quadrants/Drives as positions in this examination only. | SEMANTIC projection check plus structural absence of quadrant class fields in canonical identity. | A position is omitted, or persisted as an intrinsic class of a Referent. | P2-RESHAPE-LOCAL; P2-STOP ontological persistence. | Quadrant/Drive projection only; upstream grammar stays closed absent falsifier. |
| P20-L06 | Low relevance is represented explicitly; unknown and nonexistent remain distinct. | Per-region observation state including explicit low-signal and unknown outcomes. | ECOS | ECOS_LOCAL | Emit an explicit qualified low-signal observation or forward question instead of dropping the region. | SEMANTIC completeness and outcome-vocabulary check. | An empty retrieval produces no region record or is interpreted as nonexistence. | P2-RESHAPE-LOCAL. | Sense observation projection. |
| P20-L07 | Unknowns become calibrated forward questions, not cosmetic answers or maximal inquiry. | Question record with missing evidence, decision consequence, trigger, and route. | ECOS | ECOS_LOCAL | Preserve the strongest question whose answer can change a named decision consequence. | SEMANTIC evaluation using the decision-material definition. | A decision-changing unknown is guessed away, or a non-decision-changing unknown opens work without a trigger. | P2-RESHAPE-LOCAL or P2-HOLD for ownership ambiguity. | Question/Aperture projection only. |
| P20-L08 | Resolution increases only where the current decision consequence requires it. | Master-Key-governed resolution control. | ECOS | ECOS_LOCAL | Deepen a region only when a stated possible answer changes a governed branch, closure, contract, eligibility, or consequence. | SEMANTIC trace from deepening request to decision consequence. | All regions are maximized, or a decision-changing branch remains at a resolution that cannot distinguish its outcomes. | P2-RESHAPE-LOCAL. | Sense resolution policy. |
| P20-L09 | Material contradiction and ambiguity remain explicit. | Contradiction/ambiguity projection with evidence, affected decision, and route. | ECOS | ECOS_LOCAL | Carry incompatible claims or interpretations without selecting one by confidence or recency alone. | SEMANTIC consistency check and closure refusal where consequence remains unresolved. | Conflicting evidence is merged into one answer or hidden from Shape. | P2-RESHAPE-LOCAL. | Sense contradiction projection. |
| P20-L10 | Sense refuses closure when a decision-material unknown is neither answered nor apertured. | Explicit Sense-closure decision over represented unknowns. | ECOS | ECOS_LOCAL | Produce a closure record referencing the exact orientation state and disposition of every decision-changing unknown. | SEMANTIC closure policy; negative fixture with one undispositioned unknown. | Shape begins while one unknown can change its lawful output and has no answer, Aperture, or blocker route. | P2-STOP transition; P2-RESHAPE-LOCAL. | Sense closure policy and record. |
| P20-L11 | The exact state authorizing Shape remains addressable; “agent thinks it has enough context” is not closure. | Versioned Sense output/closure Artifact with stable Referent and provenance. | ECB | EXPECTED_IN_BUILD_5 | Pass the accepted Sense artifact identity, not an in-memory transcript, into Shape. | STRUCTURAL artifact/version check + transition precondition. | Shape input cannot identify the exact closed Sense state after interruption. | P2-ROUTE-SUBSTRATE. | ECB Artifact property for phase closure; then local projection if needed. |
| P20-L12 | Shape examines Sense rather than merely continuing it. | Separate Shape examination context bound to the closed Sense input. | ECOS | ECOS_LOCAL | Open a second examination with explicit input identity and independent disposition. | SEMANTIC phase-role check; worker-replacement trace. | Shape mutates Sense in place or cannot show which closed Sense output it challenged. | P2-RESHAPE-LOCAL. | Sense-to-Shape projection boundary. |
| P20-L13 | Shape pressures assumptions and alternatives, exposes falsifiers and dependencies, and preserves reopening conditions. | Structured pressure pass over each output-changing premise. | ECOS | ECOS_LOCAL | Record premise, live alternative, falsifier, dependency, preservation obligation, and reopen observation at decision-required resolution. | SEMANTIC checklist tied to a named Output Contract consequence. | A hidden premise or plausible alternative later changes permitted execution without a preserved falsifier/reopen path. | P2-RESHAPE-LOCAL. | Failed Shape pressure dimension only. |
| P20-L14 | Shape binds the minimum sufficient Output Contract only after examination. | Post-pressure contract binding and explicit Shape closure. | ECOS | ECOS_LOCAL | Bind only fields/actions needed to preserve the selected Shape and its tests; identify the closed Shape artifact. | SEMANTIC ordering check: pressure precedes binding; contract-minimization challenge. | A preselected output suppresses a decision-changing Sense observation, or Shape closes without a bound executable contract. | P2-RESHAPE-LOCAL. | Output Contract formation/closure seam. |
| P20-L15 | Acceptance and installation do not themselves confer authority, standing, currentness, custody, or execution permission. | Distinct lifecycle projections backed by P20-Z07 through P20-Z10. | ECOS | ECOS_LOCAL | Display and require each relevant state independently before Move. | AUTHORITY ordering fixture across every skipped transition. | Any one state is inferred from another or from interface interaction. | P2-STOP; P2-RESHAPE-LOCAL if substrate states are intact. | Move-eligibility projection. |
| P20-L16 | Move is bounded, seated, attributable, and evidence-producing. | Validated Action Envelope, actor/worker/custody binding, bounded target, and receipt expectation. | ECB | EXPECTED_IN_BUILD_8 | Execute only the envelope's target, scope, actor/worker mode, constraints, and required return contract. | AUTHORITY + STRUCTURAL preflight; transactional event/receipt reference; postcondition observation. | Execution retargets, exceeds bounds, lacks a valid seat/actor attribution, or has no evidence-return requirement. | P2-ROUTE-SUBSTRATE; P2-STOP execution. | ECB Action Envelope/transition property implicated by the attempt. |
| P20-L17 | Claimed execution is not verification. | Evidence-return and independent verification result. | ECOS | ECOS_LOCAL | Keep execution claim, observation, and verification as separately attributable results. | OBSERVATIONAL verifier against Output Contract; claimed-only negative fixture. | Worker success prose changes completion/standing without returned and checked evidence. | P2-STOP completion; P2-RESHAPE-LOCAL unless receipt support is absent. | Verification projection or exact missing ECB receipt property. |
| P20-L18 | Action occurred, result observed, result verified, interpretation made, and standing changed remain distinct. | Typed outcome stages with separate actors, evidence, and transition authority. | ECB | EXPECTED_IN_BUILD_5 | Metabolize projects the distinct stages and requests governed standing change only through its own transition. | STRUCTURAL Event lineage + SEMANTIC/AUTHORITY checks for stage ordering. | One “done” status asserts all five stages or interpretation silently changes standing. | P2-ROUTE-SUBSTRATE; P2-STOP standing change. | ECB Event/standing-transition property used by Metabolize. |
| P20-L19 | Metabolize preserves what landed, what changed, returned evidence, unresolved residue, qualification effects, and reopening conditions. | Evidence-bearing result composition over Events, Artifacts, Claims, and Apertures. | ECOS | ECOS_LOCAL | Produce a Metabolize projection with stable references for each applicable outcome class and explicit absence where none exists. | SEMANTIC completeness + fresh-worker reconstruction. | The next worker cannot distinguish attempted action from landed change or cannot find unresolved residue/reopen triggers. | P2-RESHAPE-LOCAL unless canonical evidence is missing. | Metabolize result projection. |
| P20-L20 | Free-form residue is convenience/projection data and never unexplained authoritative state. | Residue provenance, role label, and prohibition on direct governance effect. | ECOS | ECOS_LOCAL | Carry prose only as non-derivable context or evidence linked to the canonical objects it summarizes. | SEMANTIC labeling + AUTHORITY denial on residue-only transitions. | Residue text overrides canonical state or is required to recover information already represented canonically. | P2-STOP; P2-RESHAPE-LOCAL. | Residue composition and authority boundary. |
| P20-L21 | Metabolize supplies a sufficient basis for the next Sense without asserting exhaustive closure. | Next-Sense seed referencing current focal state, returned evidence, residue, apertures, and triggers. | ECOS | ECOS_LOCAL | Compose the smallest seed that preserves every input capable of changing the next orientation. | SEMANTIC re-entry test after context reset. | The next Sense must reconstruct a decision-changing fact from chat or inherits a stale conclusion as current. | P2-RESHAPE-LOCAL. | Metabolize-to-Sense composition. |

## C. P2.2 continuity and re-entry obligations

| ID | SOURCE OBLIGATION | REQUIRED CAPABILITY | OWNING LAYER | CURRENT AVAILABILITY | ECOS PROJECTION | ENFORCEMENT / OBSERVATION | FALSIFIER | FAILURE ROUTE | MINIMUM REOPEN SCOPE |
|---|---|---|---|---|---|---|---|---|---|
| P20-C01 | A fresh worker reconstructs the minimum decision-complete working position from canonical state, provenance-bearing history, and relevant semantic memory. | Canonical query plus ECOS re-entry composition. | ECOS | ECOS_LOCAL | Resolve current governed state first, then compose referenced history/evidence and non-authoritative semantic recall. | OBSERVATIONAL fresh-worker fixture with no conversation history. | Replacement worker cannot resume correctly without prose from the prior worker or treats retrieval as operative state. | P2-RESHAPE-LOCAL unless a canonical dependency is absent. | Re-entry composition or exact missing ECB capability. |
| P20-C02 | Re-entry composes the smallest sufficient context for the entering worker. | Decision-consequence-aware context selection. | ECOS | ECOS_LOCAL | Include an item only when removing it changes correct orientation, lawful branch, required constraint, or reopen behavior. | SEMANTIC deletion/minimization test. | Context omits a decision-changing item or carries canonically reconstructable bulk with no re-entry effect. | P2-RESHAPE-LOCAL. | Re-entry selector/composer. |
| P20-C03 | Continuity logging persists consequential transitions and non-derivable continuation residue. | Immutable Event history plus provenance-bearing residue Artifact where justified. | ECB | EXPECTED_IN_BUILD_5 | Query Events for derivable history; persist only residue whose loss changes correct continuation. | STRUCTURAL immutability and provenance + deletion counterfactual. | Consequential transition exists only in handoff prose, or all chat is persisted as canonical state. | P2-ROUTE-SUBSTRATE for history; P2-RESHAPE-LOCAL for residue selection. | ECB Event/Artifact property or ECOS residue rule, whichever failed. |
| P20-C04 | Pulse/sensing detects drift, staleness, dependency change, unresolved conditions, and reorientation triggers. | Revalidation observer over explicit sensor triggers and governed currentness. | ECOS | ECOS_LOCAL | Evaluate the triggers already carried or reachable from the current Master Key; emit evidence, not automatic authority. | OBSERVATIONAL scheduled/on-entry checks with trigger provenance and false-positive review. | A changed dependency remains invisible, or a sensor directly changes standing/currentness/authority. | P2-RESHAPE-LOCAL; P2-STOP unauthorized transition. | Trigger observer and return path; missing general currentness routes ECB. |
| P20-C05 | Handoff is not another state database; information persists in its native authoritative structure. | Reference-based handoff projection. | ECOS | ECOS_LOCAL | Point to canonical objects and add only the non-derivable delta. | SEMANTIC duplication audit and exact-reference resolution. | Handoff fields become independently editable copies of current state. | P2-STOP; P2-RESHAPE-LOCAL. | Handoff projection only. |
| P20-C06 | Routine handoff approaches the delta between canonically reconstructable state and receiver need. | Delta composer and receiver requirement declaration. | ECOS | ECOS_LOCAL | Compute `receiver-required context − canonically reconstructable context`; preserve only the remainder plus references. | OBSERVATIONAL field-deletion test. | Removing a duplicated field has no effect on correct re-entry, yet the field is required/maintained. | P2-RESHAPE-LOCAL. | Handoff delta composition. |
| P20-C07 | If prose must restate canonical information for correct re-entry, the projection or canonical representation is insufficient. | Counter-test separating projection failure from substrate insufficiency. | ECOS | ECOS_LOCAL | Remove the prose and ask whether canonical query composition can recover the same decision-changing content. | OBSERVATIONAL A/B fresh-worker comparison. | The harness accepts mandatory duplicated prose without routing the actual deficiency. | P2-RESHAPE-LOCAL or P2-ROUTE-SUBSTRATE according to the counter-test. | Composer if data exists; exact ECB representation if it does not. |
| P20-C08 | Frozen handoff artifacts exist only for non-derivable human residue, evidentiary value of the projection, or unearned reconstructability. | Justification record and versioned Artifact. | ECB | EXPECTED_IN_BUILD_5 | Request a frozen artifact only with one named justification and provenance. | STRUCTURAL Artifact lineage + SEMANTIC justification check. | Every transfer creates a narrative snapshot, or a justified historical projection is overwritten. | P2-RESHAPE-LOCAL if unjustified; P2-ROUTE-SUBSTRATE if Artifact support is absent. | Freeze decision or ECB Artifact property. |

## D. P2.3 access and enactment obligations

| ID | SOURCE OBLIGATION | REQUIRED CAPABILITY | OWNING LAYER | CURRENT AVAILABILITY | ECOS PROJECTION | ENFORCEMENT / OBSERVATION | FALSIFIER | FAILURE ROUTE | MINIMUM REOPEN SCOPE |
|---|---|---|---|---|---|---|---|---|---|
| P20-A01 | One canonical context is available across compatible MCP-capable environments without per-client authoritative memory. | Canonical MCP access fabric with stable Referent-based operations. | INTERFACE | AVAILABLE | Extend access only when a later authorized slice requires it; current inventory remains capture, fetch, and search. | OBSERVATIONAL cross-client exact-ID result comparison; inventory audit. | A client must maintain authoritative ECOS state locally to preserve continuity. | P2-STOP shadow state; P2-RESHAPE-LOCAL or route missing canonical capability to ECB. | Access projection or exact substrate capability; not a second store. |
| P20-A02 | MCP is an access fabric, not the brain. | Stateless/thin transport over canonical operations. | INTERFACE | INTERFACE_LOCAL | Transport requests, identities, and results without granting standing, authority, or currentness. | AUTHORITY denial + restart/client-removal observation. | Removing an MCP client destroys canonical state, or connecting confers governance power. | P2-STOP; P2-RESHAPE-LOCAL. | MCP adapter/auth projection only. |
| P20-A03 | Human Door provides direct visibility and bounded control over the same canonical system. | Human-readable projection plus governed command submission. | INTERFACE | INTERFACE_LOCAL | Show canonical state/provenance and submit bounded requests to the same transition boundary used elsewhere. | Cross-surface consistency observation + authority checks. | Door displays or mutates an independent truth/currentness store. | P2-STOP; P2-RESHAPE-LOCAL. | Human Door projection only. |
| P20-A04 | Human Door is not the canonical store and need not be the final dashboard. | Replaceable query-generated interface. | INTERFACE | INTERFACE_LOCAL | Keep presentation state disposable; persist only through native canonical operations. | Door-removal/rebuild test. | Canonical re-entry or history fails when the Door is removed. | P2-STOP; P2-RESHAPE-LOCAL. | Door persistence boundary. |
| P20-A05 | Human Rail and Agent Rail stay distinct because actor, authority, embodiment, capability, custody, consequence, and receipt conditions differ. | Rail-specific enactment policy over shared canonical envelopes/events. | ECOS | ECOS_LOCAL | Select a rail explicitly and bind its actor/worker/custody/receipt requirements without duplicating the canonical lifecycle. | AUTHORITY policy fixtures for each rail; shared-state comparison. | One rail inherits another's authority or receipt conditions because both use the same client/tool. | P2-STOP execution; P2-RESHAPE-LOCAL. | Rail policy projection; missing actor/authority primitives route ECB. |
| P20-A06 | Door ≠ Rail, Client ≠ Worker, Worker ≠ Actor, and Capability ≠ authority. | Independently addressable role and participation references. | ECB | EXPECTED_IN_BUILD_8 | Present each role explicitly at action eligibility and receipt time; allow one entity to occupy multiple roles without merging them. | STRUCTURAL role references + AUTHORITY negative tests. | Client connection is treated as actor authority, or worker execution is attributed to the Door. | P2-ROUTE-SUBSTRATE; P2-STOP execution. | ECB Action Envelope actor/worker/custody property; no universal role ontology. |

## E. P2.4 recursive self-application obligations

| ID | SOURCE OBLIGATION | REQUIRED CAPABILITY | OWNING LAYER | CURRENT AVAILABILITY | ECOS PROJECTION | ENFORCEMENT / OBSERVATION | FALSIFIER | FAILURE ROUTE | MINIMUM REOPEN SCOPE |
|---|---|---|---|---|---|---|---|---|---|
| P20-R01 | Recursion does not install before substrate recursion exists and one single-loop SSMM survives field use. | Referent-backed governance objects as lawful focal objects plus evidenced base-loop fitness. | ECB | EXPECTED_IN_BUILD_9 | Gate recursive opening on both substrate receipt and base-loop field evidence. | STRUCTURAL focalization check + OBSERVATIONAL gate. | A nested loop opens before either prerequisite is evidenced. | P2-STOP; P2-ROUTE-SUBSTRATE if focal recursion is missing. | ECB Build 9 recursion property or local release gate. |
| P20-R02 | Recursive work uses the same SSMM grammar; no separate “tiny SSMM” mechanism exists. | Scale-variable projection of the same four-phase grammar. | ECOS | ECOS_LOCAL | Lower resolution while retaining each phase's required function and closure distinctions. | SEMANTIC grammar-equivalence fixture. | A lightweight path skips a phase function or writes to a separate recursive state machine. | P2-STOP shadow mechanism; P2-RESHAPE-LOCAL. | Recursive SSMM projection only. |
| P20-R03 | Recursion opens only when uncertainty about legitimacy, orientation, standing, warrant, scope, propagation, consequence, or permitted action can change the current decision. | Master-Key-governed recursion eligibility evaluation. | ECOS | ECOS_LOCAL | Name the uncertainty, affected dimension, possible decision-changing outcomes, and parent-loop return point. | SEMANTIC materiality test before child-loop creation. | Recursion opens for an interesting but branch-inert unknown, or a branch-changing uncertainty cannot open. | P2-RESHAPE-LOCAL. | Recursion eligibility rule. |
| P20-R04 | Unresolved material alone does not authorize recursion; otherwise preserve an Aperture. | Aperture fallback with trigger and recheck condition. | ECOS | ECOS_LOCAL | Hold the question when its present resolution cannot change the active decision; recheck only on the recorded trigger. | OBSERVATIONAL no-child-loop fixture and later trigger replay. | An unresolved item automatically spawns recursion or disappears without a recheck condition. | P2-RESHAPE-LOCAL. | Recursion/Aperture router. |

## F. P2.5 propagation obligations

| ID | SOURCE OBLIGATION | REQUIRED CAPABILITY | OWNING LAYER | CURRENT AVAILABILITY | ECOS PROJECTION | ENFORCEMENT / OBSERVATION | FALSIFIER | FAILURE ROUTE | MINIMUM REOPEN SCOPE |
|---|---|---|---|---|---|---|---|---|---|
| P20-P01 | Propagation opens only when substrate propagation support exists. | Evidence-bearing kernel packet/artifact with provenance, identity, history, and receipt. | ECB | EXPECTED_IN_BUILD_10 | Keep outbound/inbound propagation disabled until the capability receipt and qualification fixtures pass. | STRUCTURAL packet/Artifact checks + release gate. | ECOS serializes an ad hoc authoritative packet before substrate support exists. | P2-STOP; P2-ROUTE-SUBSTRATE. | ECB Build 10 propagation property; physical form stays apertured until earned. |
| P20-P02 | A receiving component must qualify what it receives. | Receiver-side qualification with local authority/currentness applicability decision. | ECB | EXPECTED_IN_BUILD_10 | Present packet claims/evidence for local evaluation; never auto-install. | AUTHORITY + SEMANTIC qualification transition and rejection fixture. | Receipt alone changes local standing, authority, currentness, warrant, or applicability. | P2-STOP; P2-ROUTE-SUBSTRATE. | ECB receiver qualification transition. |
| P20-P03 | Propagation does not imply inherited truth, standing, authority, currentness, warrant, or applicability. | Dimension-preserving packet contract and explicit local dispositions. | ECB | EXPECTED_IN_BUILD_10 | Display sender assertions and sender-side qualifications with provenance while leaving local dimensions unset until qualified. | STRUCTURAL field separation + adversarial high-authority sender fixture. | Any sender field is copied into an operative local dimension without local qualification. | P2-STOP; P2-ROUTE-SUBSTRATE. | Packet/qualification field or policy that collapsed dimensions. |
| P20-P04 | Packets and projections are evidence-bearing transfers, not automatic governance. | Transfer receipt plus separate governance-installation path. | ECB | EXPECTED_IN_BUILD_10 | Metabolize receipt as evidence; open a local governed transition only when separately warranted. | Event/receipt observation + AUTHORITY denial on transfer alone. | “Received” and “installed/current” are one state transition. | P2-STOP; P2-ROUTE-SUBSTRATE. | ECB transfer-versus-install transition boundary. |

## Capability gate for the first installed loop

P2.1 remains closed until all of these named capabilities are installed and their frozen acceptance
surfaces pass together:

| Gate | Current status | Current expected build | Required evidence before release |
|---|---|---|---|
| Stable Referent identity | AVAILABLE | Build 2 | Accepted Build 2 receipt and regression pass. |
| Claim / standing / evidence provenance | UNAVAILABLE | Build 3 | Worked Trace 03 plus installation receipt; closed Shape is not installation. |
| Required typed relation support | UNAVAILABLE | Build 4 | Frozen relation trace and receipt for only the required predicates. |
| Immutable Events and versioned Artifacts | UNAVAILABLE | Build 5 | Transition-history and version/replay acceptance evidence. |
| Governance bootstrap / valid authority | UNAVAILABLE | Build 6 | Restart-reconstructable bootstrap, exhaustion, and succession evidence. |
| Current local Master Key | UNAVAILABLE | Build 7 | Explicit designation and decision-complete reachability evidence. |
| Governed action eligibility / Action Envelope lifecycle | UNAVAILABLE | Build 8 | Out-of-order denial, bounded execution, atomicity, and receipt evidence. |

`CURRENT_EXPECTED_SSMM_RUNTIME_GATE=ECB_BUILD_8_CAPABILITY_SET` is therefore a projection, not an
authorization. Any missing named capability keeps the gate closed even if Build 8 exists; equivalent
capability evidence can update the projected number without changing the obligation.

## Populated P2.0 Apertures

These unresolved questions do not authorize a transition and do not block the current documentation
harness. They are populated results, not cosmetic blanks.

### P20-AP01 — Cross-consumer status of continuity residue

- **WHAT:** Whether any non-derivable continuity residue will need correctness guarantees across ECOS
  and another consumer, or remains a local composition concern.
- **WHY OPEN:** No field-used SSMM loop or second consumer exists, so assigning substrate or local
  ownership now would guess at consequence.
- **CURRENT EFFECT:** P2.0 and ECB Builds may proceed; no residue store or object type is authorized.
- **DISCRIMINATING FORWARD QUESTION:** Can loss, contradiction, or concurrent mutation of this residue
  change canonical currentness, standing, authority, eligibility, or correct re-entry for more than one
  consumer?
- **TRIGGER:** First encountered residue whose deletion changes a fresh worker's correct resumption.
- **ROUTE:** Yes → `P2-ROUTE-SUBSTRATE` to the smallest Event/Artifact qualification. No → local ECOS
  Shape. Evidence insufficient → `P2-HOLD`.

### P20-AP02 — Exact ECOS projection physical form

- **WHAT:** Whether phase outputs remain generic versioned Artifacts, earn specialized physical
  structures, or can remain query projections.
- **WHY OPEN:** ECB Artifact support is uninstalled and no operational loop has produced recurring
  integrity, query, lifecycle, transaction, or reconstruction pressure.
- **CURRENT EFFECT:** The obligation matrix may guide future Shapes; it does not authorize tables,
  object types, schemas, or payload enums.
- **DISCRIMINATING FORWARD QUESTION:** Which exact integrity or reconstruction failure cannot be
  prevented or observed using Referent-backed versioned Artifacts and projections?
- **TRIGGER:** P2.1 Shape after Build 5 capability evidence, or an earlier concrete falsifier.
- **ROUTE:** Generic representation suffices → local ECOS Shape. Cross-consumer invariant missing →
  `P2-ROUTE-SUBSTRATE`. Undetermined → `P2-HOLD`.

### P20-AP03 — Pulse execution cadence and surface

- **WHAT:** Whether revalidation sensing runs on entry, on governed events, on a schedule, or through a
  combination.
- **WHY OPEN:** No operational Master Key or field drift profile exists; choosing cadence now would
  convert an interface/operations guess into architecture.
- **CURRENT EFFECT:** P20-C04 fixes the sensing function and authority boundary only.
- **DISCRIMINATING FORWARD QUESTION:** What maximum undetected interval changes a named authorized
  transition or re-entry result, and which observable event starts that interval?
- **TRIGGER:** First operational dependency or revalidation trigger with a bounded consequence window.
- **ROUTE:** Local scheduling/presentation → `INTERFACE_LOCAL` or ECOS-local Shape. Shared currentness or
  transaction guarantee → `P2-ROUTE-SUBSTRATE`. Otherwise `P2-HOLD`.

## Advance and stop conditions

P2.0 may emit `P2-ADVANCE` only when:

- every matrix row has an owner, capability, populated availability, projection, observation or
  enforcement method, falsifier, route, and minimum reopen scope;
- the acceptance matrix survives the structural harness;
- a fresh worker can derive why runtime is still gated from these persisted artifacts without the
  implementing worker's explanation; and
- no P2.0 file creates runtime, database, interface, legacy import, recursion, propagation, or alternate
  canonical state.

Emit `P2-STOP` before further mutation if any row can be satisfied only by collapsing a constitutive
distinction, pretending an unavailable capability exists, or creating a second authoritative surface.
