# CIVS correspondence requirements handoff — SysML native model element ↔ ECOS Referent/Claim correspondence

**Contract:** `ecos:civs-correspondence-requirements-handoff:0.1.0`  
**Handoff:** `ecos:civs:domain-semantic-admission:correspondence-handoff:2026-10-07:v0.1`  
**Source CIR:** `ecos:cir:domain-semantic-admission:2026-10-07:v1.2`  
**Correspondence:** `civs:correspondence:native-to-ecos`

> This handoff derives requirements and falsifiers from the inspected case. It does not select a correspondence formalism or upgrade FEDERATE into semantic truth.

## Current known

- The installed Domain-Semantic Admission evaluator routes the inspected responsibility to FEDERATE when supplied ADEQUATE native coverage, checked prior art, requires_cross_domain_correspondence=true, and explicit ECOS correspondence targets.
- Removing correspondence_targets changes the structural result to QUALIFY with CORRESPONDENCE_TARGET_REQUIRED.
- The source native semantics remain owned by OMG/other native authorities; ECOS semantics remain separately owned.
- The CIR records correspondence standing as NOT_ESTABLISHED and semantic enforcement as SEMANTIC.
- The current inspected direction is native-to-ECOS and cardinality remains unresolved.
- CIVS already preserves exact source/target/basis/currentness/semantic-owner fields sufficient to investigate the problem without choosing mathematics.

## Explicit non-claims

- FEDERATE is not proof of co-reference, equivalence, semantic adequacy, constitution, or mapping truth.
- Bidirectional navigation does not imply invertibility.
- A GENERALIZATION label in the D&I corpus does not supply a composition or inversion law.
- Indexical relevance is not the correspondence relation; relevance-to-current-use and semantic mapping are separate jobs.
- Persistence of a mapping claim would not confer standing or currentness.
- No category-theoretic, relation-algebraic, lens-like, graph-morphism, ontology-alignment, or other mathematical formalism is selected by this handoff.

## Requirements

### CR-01 — Identity and relation-kind semantics — OPEN
What exact semantic relation is being asserted between a native element and an ECOS Referent/Claim, and which identity distinctions must remain non-collapsible?
Required for: any relied cross-domain mapping; co-reference/equivalence/generalization claims
Evidence needed: exact source/target identities and editions; native and ECOS semantic definitions; attributable relation-kind judgment
Falsifier: Two distinct native elements or meanings are collapsed by the proposed relation without an explicit many-to-one judgment.
Failure consequence: Keep correspondence NOT_ESTABLISHED; retain FEDERATE only as routing.
Limits: Do not infer relation kind from names or structural similarity.

### CR-02 — Directionality — OPEN
Is the relied relation native→ECOS, ECOS→native, bidirectional navigation, or a pair of independently warranted directional relations?
Required for: lookup/traversal semantics; update propagation; consumer explanations
Evidence needed: directional worked cases; semantic-owner judgment; failure cases for reverse lookup
Falsifier: Reverse traversal yields a semantically invalid or non-unique result while the model treats direction as symmetric.
Failure consequence: Keep reverse direction unavailable/unqualified.
Limits: Direction is not implied by a stored edge.

### CR-03 — Cardinality — OPEN
What cardinalities are valid for each relation kind and use: 1:1, 1:N, N:1, N:M, or context-dependent?
Required for: deterministic lookup; uniqueness claims; composition
Evidence needed: ordinary examples for each allowed cardinality; collision/ambiguity cases; declared uniqueness constraints
Falsifier: An ordinary case requires multiple valid targets where the contract asserted uniqueness.
Failure consequence: Do not provide a unique lookup contract; surface ambiguity.
Limits: Unknown cardinality must remain explicit.

### CR-04 — Partiality and undefined cases — OPEN
Can correspondence legitimately be undefined for some source/target elements, and how is absence distinguished from not-yet-qualified or failed lookup?
Required for: safe lookup; graceful degradation; extension decisions
Evidence needed: positive mapping cases; legitimate no-mapping cases; qualification-pending cases
Falsifier: The mechanism fabricates a target or extension merely because no mapping is found.
Failure consequence: Represent partiality/unknown explicitly; HOLD affected promotion.
Limits: Do not totalize the mapping by convenience.

### CR-05 — Composition — OPEN
When A↔B and B↔C relations exist, under what conditions may A↔C be derived, and what proof/evidence must travel with the composition?
Required for: multi-hop navigation; derived correspondence; high-confidence structural resurfacing
Evidence needed: at least two real multi-hop cases; counterexample where composition fails; evidence/currentness propagation rule
Falsifier: Composed result changes meaning or standing even though individual links appear valid.
Failure consequence: Do not compose automatically; preserve explicit hops.
Limits: A need for composition must be demonstrated before algebra is selected.

### CR-06 — Inversion and equivalence — OPEN
What conditions, if any, warrant an inverse relation or equivalence rather than merely reverse navigation?
Required for: round-trip updates; equivalence claims; bidirectional synchronization
Evidence needed: round-trip cases; lossiness demonstration; semantic-owner equivalence judgment
Falsifier: Round-trip loses information, produces multiple targets, or changes semantic scope.
Failure consequence: Treat inverse/equivalence as NOT_ESTABLISHED.
Limits: No inverse follows from FEDERATE.

### CR-07 — Standing and currentness — OPEN
What independent standing/currentness belongs to the mapping claim, separate from standing/currentness of source and target objects?
Required for: present-use reliance; audit/reentry; consumer trust
Evidence needed: mapping judgment receipt; source/target edition refs; currentness/requalification rule
Falsifier: One side changes edition while the mapping remains silently CURRENT.
Failure consequence: Mark mapping stale/unknown and requalify.
Limits: Persistence is not currentness.

### CR-08 — Edition change and field reconstitution — OPEN
Which source/target changes invalidate, preserve, or require recomputation of correspondence, and which typed changes/requalification paths result?
Required for: schema evolution; source upgrades; field reconstitution
Evidence needed: edition-change cases; dependency map; requalification outcome
Falsifier: A consequential source/target edition change leaves relied mapping unchanged without an attributable reconciliation.
Failure consequence: Trigger dependency/requalification review; do not hide coordinate change.
Limits: Reseat is only one possible downstream typed change.

### CR-09 — Indexical use-basis separation — OPEN
How is a semantically valid mapping distinguished from its relevance/applicability under the current R/B/G/F and intended use?
Required for: cross-context resurfacing; projection delta; current-use admission
Evidence needed: same mapping under at least two different G/F/use bases; case where mapping exists but is not consequential
Falsifier: Stored mapping is automatically promoted into present relevance/standing.
Failure consequence: Keep mapping dormant/candidate until current-use qualification.
Limits: Indexical relevance remains a derived situated relation, not a mapping primitive.

### CR-10 — Semantic ownership and authority — OPEN
Who may assert/revise/reject the mapping semantics, and how are native authority, ECOS governance, coordination, custody, and action authority kept separate?
Required for: governance; conflict resolution; future automated updates
Evidence needed: role-specific authority refs; conflict/escalation case; custody versus semantic-owner distinction
Falsifier: A repository owner, assignee, or automated worker silently becomes semantic authority.
Failure consequence: HOLD semantic mutation; route to named semantic/Principal authority.
Limits: Assignment and custody do not confer semantic authority.

### CR-11 — Evidence and falsifiability — OPEN
What evidence is sufficient for each mapping claim, and which observations would falsify or narrow it?
Required for: qualification; machine checking; cold-reader verification
Evidence needed: positive worked cases; hostile/negative controls; evidence sensitivity refs
Falsifier: Mapping survives a targeted negative case that should change its disposition or scope.
Failure consequence: Downgrade/revise mapping and affected dependent claims.
Limits: Structural tests cannot substitute for semantic evidence.

### CR-12 — Multiplicity and uncertainty — OPEN
Can multiple incompatible/provisional mappings coexist, and how are confidence/uncertainty and decision consequences represented without scalar truth collapse?
Required for: open research/frontier cases; multiple frameworks/editions; consumer agency
Evidence needed: case with competing mappings; routing rule for unresolved alternatives; explicit decision consequence
Falsifier: System silently chooses one plausible mapping where evidence supports multiple alternatives.
Failure consequence: Preserve alternatives/QF; do not collapse to one mapping.
Limits: Do not introduce probabilistic machinery until an ordinary case earns it.

### CR-13 — Update propagation — OPEN
If a mapping is used to propagate edits or generated objects, what may propagate, in which direction, under whose authority, and how are conflicts/rollback handled?
Required for: future graphical controls; bidirectional model synchronization; machine action
Evidence needed: authorized update case; conflict case; rollback/audit evidence
Falsifier: A correspondence causes unauthorized or semantically lossy mutation.
Failure consequence: No propagation; mapping remains read/navigate-only.
Limits: Current CIVS work does not authorize bidirectional semantic mutation.

### CR-14 — Consumer legibility — OPEN
What minimum mapping/proof/currentness information must human and agent consumers see to understand why a cross-domain result is safe to rely on?
Required for: two-door substrate; cold reentry; future dashboards
Evidence needed: fresh-reader case; consumer simulation falsifier; omission visibility test
Falsifier: Consumer interprets FEDERATE or visual adjacency as equivalence/truth.
Failure consequence: Expose relation kind, standing/currentness, evidence, omissions and QF; HOLD reliance if hidden.
Limits: Consumer accommodation does not define mapping truth.

## Formalism-selection gate

Status: **NOT_EARNED**. Selected formalism: **NONE**.

Admission triggers:
- At least two ordinary cases require machine-checkable multi-hop composition, inversion, partial mapping, cardinality, or update-propagation behavior that the current typed relation + evidence/currentness contract cannot express without ad hoc hidden logic.
- A demonstrated correctness/reentry failure is attributable to missing mapping semantics rather than missing evidence, currentness, authority, or consumer exposure.
- The required behavior is reusable across more than one specific native construct/domain case and has explicit falsifiers.

Any candidate must preserve:
- exact source/target identity and editions
- native semantic ownership separate from ECOS governance
- partiality and unresolved alternatives
- direction/cardinality without forced symmetry
- mapping standing/currentness separate from object standing
- attributable evidence and semantic owner
- typed change/requalification on consequential edition/basis change
- human/agent legibility and exact reentry
- no standing by persistence or mathematical elegance
- separation of correspondence from indexical relevance

Stop / do-not-formalize conditions:
- If typed URG native_relation plus explicit correspondence-inspection fields and evidence are sufficient for current ordinary cases, do not add a mathematical formalism.
- If the perceived problem is actually missing native evidence, consumer exposure, authority, or currentness, repair that layer instead of formalizing correspondence.
- If a candidate would require reopening the URG Level/Quadrant kernel, inventing a universal primitive, or reifying indexical relevance, return the demonstrated blocker before mutation.

Mind-changers:
- Repeated ordinary multi-hop composition cases may earn explicit compositional machinery.
- A real bidirectional synchronized-update case with loss/conflict behavior may earn an invertible/partial update formalism.
- Persistent competing/uncertain mappings may earn richer mapping-state/uncertainty custody.
- An authoritative native API may already provide mapping identity/version semantics that ECOS should inherit/federate instead of re-deriving.

## Next reentry

Next work package: **CIVS:WP8:qualification**.
Route: Use docs/civs-reentry.md plus this handoff and the current CIR to prepare/run cold-reader, pointer/currentness, independent worked-trace, and degradation checks.
Condition: Do not mark correspondence formalism selected or fresh-agent behavior qualified until independent evidence exists.
Evidence required: fresh cold-reader return over the fourteen-item contract; pointer/currentness recovery on exact refs; independent reproduction of worked FEDERATE trace and negative control; WP6 degradation-route checks; visible record of any HOLD/failure

## Omissions

- No correspondence formalism is selected.
- No semantic correspondence claim is promoted to SUPPORTED.
- No bidirectional update/action behavior is authorized.
- No new URG primitive or mapping persistence lifecycle is installed.
- No fresh-agent qualification is performed by this handoff.
