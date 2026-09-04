STATUS: SENSE CLOSED — SHAPE UNOPENED; MOVE UNAUTHORIZED; IMPLEMENTATION UNOPENED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Derived from the Build Contract, constitutive invariants, closed BUILD 0–3 evidence, accepted BUILD 3 closure anchor, and explicit human BUILD 4 Sense authorization
CURRENT BUILD UNIT: BUILD 4 — Typed Relation Claims (SENSE CLOSED; SHAPE UNOPENED)

# BUILD 4 — Typed Relation Claims

## CURRENT MOVE

`CLOSE SENSE → AWAIT EXPLICIT SHAPE AUTHORIZATION`

```text
SENSE=CLOSED
SHAPE=UNOPENED
MOVE=UNAUTHORIZED
IMPLEMENTATION=UNOPENED
AP01=REACTIVATED_NARROWLY_FOR_BUILD_4
AP07=ACTIVATED_MINIMUM_RELATION_PREDICATE_ONLY
FULL_RELATION_ONTOLOGY=DEFERRED
AP02=PRESERVED_AS_NARROWED
AP03=PRESERVED_UNCHANGED
BUILD_5_TEMPORAL_HISTORY_CURRENTNESS_SUPERSESSION=UNOPENED
BUILD_3_REGRESSION_AUTHORITY=TWO_LAYER_OBLIGATION_CARRIED_INTO_SENSE
WORKED_TRACE_06=CANDIDATE_NOT_ACCEPTANCE_AUTHORITY
```

The human authorized BUILD 4 Sense only, entered from accepted BUILD 3 closure anchor
`da00e015385877d54c7f326784f80dafd207446e`. Sense verified that anchor, the clean working state, and the
canonical substrate before substantive work. No drift was found.

BUILD 3 is closed and is not reopened by this checkout. BUILD 0, BUILD 1, and BUILD 2 remain closed.
Preserve their receipts, fixtures, runtime, migrations, harnesses, and installed state unless a recorded
reopening condition is observed.

Do not enter Shape, freeze a physical schema, select a predicate or claim-kind value, write or apply a
migration, mutate the canonical database, add runtime or MCP behavior, deploy, create an ADR, or open
BUILD 5+ until a human separately authorizes the next phase.

## PURPOSE

Define the minimum persistent typed-relation Claim that lets ECB assert one referent-to-referent
relation as a Claim while preserving the installed Claim, Evidence Link, and Referent distinctions and
creating no competing relation truth store.

## GOVERNING DISTINCTION

`ECB asserts that A stands in relation R to B ≠ A stands in relation R to B`

Keep distinct:

- relation Claim ≠ Evidence Link;
- assertion Claim ≠ typed relation Claim;
- asserted relation ≠ relational fact;
- confidence ≠ standing;
- relation assertion ≠ currentness, supersession, or support;
- directional position ≠ permanent ontological class;
- one relation truth store ≠ convenient duplication;
- relation assertion ≠ co-reference or entity resolution;
- native binding loss ≠ Claim erasure; and
- classification output ≠ governing truth.

## INVARIANTS SERVED

- evidence ≠ assertion;
- confidence ≠ standing;
- standing ≠ warrant;
- capability ≠ warrant or authorization;
- relevance ≠ authority;
- current ≠ newest;
- identity ≠ description;
- unknown ≠ nonexistent;
- directional position ≠ permanent ontological class; and
- every persistent first-class Claim has stable Referent identity.

## FOCAL OBJECT

The smallest persistent typed-relation Claim required to express one referent-to-referent relation as a
Claim under a single relation truth store.

The focal object is not a relation ontology, predicate taxonomy, graph traversal surface, co-reference
or entity-resolution mechanism, relation lifecycle, or inverse/symmetry machinery.

## SENSE CLOSURE — 2026-09-04 AMERICA/PHOENIX

### Entry verification

```text
ANCHOR=da00e015385877d54c7f326784f80dafd207446e
MAIN=ANCHOR; ORIGIN_MAIN=ANCHOR; WORKING_TREE=CLEAN
CANONICAL_TABLES=claims, evidence_links, referents, thoughts
CANONICAL_FUNCTIONS=prepare_claim, prepare_evidence_link, register_thought_referent, search_thoughts
CANONICAL_VIEWS=0
COUNTS=1 Thought; 4 Referents; 1 Claim; 1 Evidence Link
MIGRATIONS=20260903235721, 20260904000010, 20260904093341, 20260904163938
CLAIM_C=origin ecb_inference; epistemic_standing unassessed
LINK_L=5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55
GT01=content, source, and capture instant intact
SUBSTRATE_DRIFT=NONE
```

Verification was read-only. The frozen adversarial harnesses were not executed, because their
rollback-only probes mutate within a transaction and Sense does not authorize canonical mutation.

### Evidence inspected

- the Build Contract's BUILD 4 order, Layer B primitives, "structure is earned" test, and the closed
  rule that a referent-to-referent relation is expressed as a Claim;
- the constitutive non-collapse invariants, universal-identity section, and enforcement classification;
- the controlled glossary entries for Claim, Evidence Link, Referent, and Standing;
- the accepted BUILD 3 checkout, migration, receipt, and frozen harness, including its closure-state
  cardinality assertions;
- the current acceptance-test surface, including reserved Worked Trace 04 and Worked Trace 05;
- AP-07 and the materially adjacent AP-01, AP-02, and AP-03;
- targeted OB1 relation prior art read directly from the pinned canonical clone at
  `9543c29a3e44a210ce278392b9fac11248997461`, specifically
  `schemas/typed-reasoning-edges/schema.sql` and `recipes/typed-edge-classifier/README.md`; and
- BUILD evidence E01 Question Forward, E02 Sense Closure Contract, E04 Variable Resolution, E13
  Bitemporality, E14 Absence Observed, and E22 Reopen Conditions Designed Before Failure.

Consultation does not promote evidence into architecture.

### Relevant known state

- `public.claims` holds `id, proposition, scope, claim_kind, origin, epistemic_standing, asserted_at`
  with an immediate restrictive same-UUID Referent foreign key, RLS enabled and no policies, and a
  service-role insert grant limited to `id`, `proposition`, and `scope`.
- `public.claims` currently cannot hold a non-assertion Claim. The `claims_kind_assertion` check
  constrains `claim_kind = 'assertion'`, and `prepare_claim` unconditionally overwrites `claim_kind`,
  `origin`, `epistemic_standing`, and `asserted_at`.
- `public.evidence_links` holds `id, claim_id, evidence_referent_id, role, evidence_revision_scheme,
  evidence_revision_digest, linked_at` with three immediate restrictive foreign keys and deliberately no
  foreign key to `thoughts`, so evidence disappearance preserves historical lineage.
- BUILD 3 imposed no uniqueness collapsing repeated historical uses of the same evidence and no
  requirement that every Claim have an Evidence Link.
- `public.referents` remains exactly `id + registered_at` and is native-type agnostic.
- Four Referents are registered: GT01 Thought `19a949ea-a8fc-4250-a386-fa64e5530180`; registered-only
  `2eede0e4-b27a-4383-850e-a448f0113c9f` with no native record; Claim C
  `0f89e778-b16e-4840-9129-a2aa3eb6f697`; Evidence Link L `4c6c0f50-a936-4da6-bb09-233f93320639`.
- No current runtime operation creates a relation Claim, and no relation surface exists in canonical
  state.
- No sufficient relation-Claim representation exists in pinned OB1 prior art.

### Inputs

- accepted BUILD 0–3 migrations, receipts, fixtures, harnesses, and regression behavior;
- `docs/build-contract.md`, `docs/invariants.md`, and `docs/glossary.md`;
- `docs/acceptance-tests.md`, including reserved Worked Traces 04 and 05;
- `docs/open-apertures.md`, specifically AP-01, AP-02, AP-03, and AP-07;
- applicable candidate evidence in `docs/build-evidence.md`;
- `docs/ob1-prior-art.md` plus the pinned OB1 sources named above; and
- the explicit human BUILD 4 Sense authorization and the E-1 and E-2 dispositions recorded below.

### Human dispositions recorded at Sense

**E-1 — RESOLVED.** AP-01 is narrowly reactivated for BUILD 4 because BUILD 4 requires a second Claim
kind. BUILD 4 may not route around `claim_kind` merely to avoid reopening AP-01; the governing Claim
distinction already includes assertion Claims and typed-relation Claims. AP-01 narrows only far enough
to support the relation-Claim behavior earned by the Worked Trace. **The exact second `claim_kind` value
is not selected by Sense; that vocabulary decision belongs to Shape.** Broader claim-kind, origin,
epistemic-standing, governance-standing, action-standing, qualification, and history vocabularies remain
open on their existing terms.

**E-2 — RESOLVED.** BUILD 4 Shape may alter or supersede the BUILD 3-installed `claims_kind_assertion`
constraint and `prepare_claim` behavior if the selected Shape requires that change to admit
typed-relation Claims. The permission does not require that physical design. Any BUILD 4 candidate must
preserve accepted BUILD 3 assertion behavior and must demonstrate that preservation through the
cross-build regression projection. BUILD 3's assertion-only constraint was the closed physical surface of
BUILD 3, not the complete Claim ontology, and must not be read as a permanent prohibition on later Claim
kinds. **This does not reopen BUILD 3.**

### Closed decisions that Shape may not reopen

- a referent-to-referent relation is a Claim;
- no competing relation truth store may be created;
- every persistent first-class Claim retains stable Referent identity under the same UUID;
- Thoughts remain evidence and gain no standing fields;
- Evidence Link remains distinct from a relation Claim;
- confidence remains distinct from standing, and standing from warrant and authority;
- relation classification or model output does not become governing truth automatically;
- directional position does not become a permanent ontological class;
- Referent registration performs no co-reference or entity resolution, and UUID uniqueness does not
  imply subject uniqueness;
- `unassessed` continues to mean only that no separate epistemic qualification has been recorded;
- BUILD 5 retains standing-change history, Events, versioned Artifacts, transformation receipts, and
  supersession/currentness history, including temporal validity and bitemporality;
- the complete relation ontology remains deferred; and
- BUILD 0–3 closed behavior remains reconstructibly preserved.

### Question Forward set

These questions can each change schema, constraints, vocabulary, or the pass harness. They enter Shape
explicitly rather than being answered during Sense.

1. **Earned predicate.** Which single predicate is actually earned by the trace? `supersedes` and
   `evolved_into` import BUILD 5 currentness; `supports` imports support semantics adjacent to Evidence
   Link and standing; `contradicts` imports least but reads symmetric and under-tests direction;
   `depends_on` is cleanly asymmetric and imports neither support nor currentness; `related_to` may
   assert too little to be falsifiable. Which makes direction reversal observably wrong without
   importing deferred semantics?
2. **Physical representation.** Extend `public.claims` with nullable endpoint columns and a second
   claim kind; keep one `claims` identity/standing spine plus a one-to-one typed extension holding
   endpoints; or use a standalone relation-Claim table with its own Referent. Falsifier for all three:
   does any relation fact become representable in two places? A separate table is not automatically a
   competing store, but must justify why relation Claims need a parallel standing model.
3. **BUILD 3 surface change.** Which branches require altering `claims_kind_assertion` and
   `prepare_claim`? E-2 permits but does not require that change; the cross-build projection must prove
   preserved assertion behavior either way.
4. **Direction and arity.** Binary and directed is the minimum. Is anything beyond binary earned, and
   how is direction made unambiguous structurally rather than by caller convention?
5. **Symmetry and inverse.** Asserted, derived, or absent? Absent is smallest. If a predicate reads
   symmetric, does a single directed row over-claim?
6. **Canonical structure versus proposition text.** `claims.proposition` is non-null and non-empty. For
   a relation Claim, is proposition text derived, supplied, or absent? If both structure and text
   exist, which is canonical, and what prevents disagreement inside one row?
7. **Origin, standing, time, and Evidence-Link reuse.** Do relation Claims reuse `ecb_inference` and
   `unassessed` unchanged? May an existing Evidence Link attach to a relation Claim without
   modification, and does that reuse assert anything unintended about basis?
8. **Endpoint existence and native-binding loss.** Endpoints should target `referents` with restrictive
   foreign keys, mirroring BUILD 3's deliberate omission of a `thoughts` foreign key. Must an endpoint
   Referent exist at assertion time? What is observed when an endpoint's native record later
   disappears?
9. **Multiplicity and uniqueness.** Would tuple uniqueness over subject, predicate, and object wrongly
   collapse distinct Claims asserted at different times, scopes, or bases? What, if anything,
   legitimately deduplicates?
10. **Self-relations.** Is a self-relation invalid universally or only per predicate? A universal check
    is premature ontology; a predicate-property table is premature ontology in the other direction.
    Does BUILD 4 need to represent this at all?
11. **Co-reference exclusion.** Two Referents may denote the same subject. What observation proves
    BUILD 4 performed no co-reference or entity resolution?
12. **Boundary against support, currentness, supersession, and history.** What exact observable proves
    a relation Claim confers none of these, analogous to BUILD 3's historical-lineage-only
    `used_as_basis`?
13. **Enduring BUILD 3 projection.** Which BUILD 3 behaviors are permanent invariants versus
    closure-state snapshots?

### Contradictions and dependencies

**C1 — AP-07 presumes a BUILD 4 trace that does not exist.** AP-07 permits only predicates required by
BUILD 4's worked trace, but Worked Trace 04 is reserved for BUILD 5 and no BUILD 4 trace exists.
Resolution is to construct the trace, never to infer predicates from OB1's vocabulary.

**C2 — AP-01 reactivation.** A typed relation Claim requires a second `claim_kind`, which is AP-01's own
recorded reactivation trigger. Resolved by E-1.

**C3 — BUILD 3 surface authority.** Two of the three representation branches require altering
BUILD 3-installed objects. Resolved by E-2, which permits without requiring that change and does not
reopen BUILD 3.

**C4 — BUILD 3 regression-authority composition, carried into Sense.** The frozen BUILD 3 harness
asserts a closure-state whole-schema snapshot that any authorized BUILD 4 expansion breaks:

```text
tables    === ["claims", "evidence_links", "referents", "thoughts"]
functions === ["prepare_claim", "prepare_evidence_link",
               "register_thought_referent", "search_thoughts"]
claim_count === "1" && link_count === "1" && referent_count === "4"
```

The cardinality assertion breaks unconditionally, because inserting a relation Claim into
`public.claims` increments `claim_count` even if BUILD 4 adds no table and no function. No BUILD 4
design can satisfy the frozen BUILD 3 harness. The obligation is therefore recorded now rather than
discovered at Move:

1. **Layer A — historical acceptance.** `tests/build-3/harness.ts` remains byte-frozen as BUILD 3
   closure provenance. It is not weakened, rewritten, or re-run as a post-BUILD 4 whole-schema gate.
2. **Layer B — current-state regression.** A minimum cross-build BUILD 3 regression harness verifies
   the enduring projection, including preserved accepted assertion behavior required by E-2, plus a
   BUILD 4 expansion proof that only authorized objects and Referents explain the delta and no BUILD 5+
   surface appears.

The exact enduring projection is Question 13 and is frozen with the trace, not here.

**Dependencies.** Installed BUILD 2 Referent spine; installed BUILD 3 `claims` and `evidence_links`; the
four existing Referents as candidate fixtures. No external service, provider choice, or unresolved
deployment dependency is required for Shape.

### Blockers

None.

E-1 and E-2 were the two escalations gating Shape entry. Both are resolved. The Question Forward set is
routed to Shape, and remaining unknowns route to narrowly reactivated AP-01, minimally activated AP-07,
preserved AP-02 and AP-03, or BUILD 5.

## TARGETED PRIOR-ART DISPOSITIONS

Read directly from the pinned canonical clone at `9543c29a3e44a210ce278392b9fac11248997461`. Evidence,
not authority. Nothing is promoted by resemblance.

| OB1 construct | Disposition | Exact reason |
|---|---|---|
| `thought_edges` keyed to `thoughts.id` beside `edges` keyed to `entities.id` | REJECT | Per-native-type edge tables are what a universal Referent exists to avoid. Confirms BUILD 2. |
| `id BIGSERIAL` surrogate key | REJECT | No stable Referent identity; violates universal identity. |
| `UNIQUE (from, to, relation)` | REJECT | Collapses two distinct assertions into one row. |
| `thought_edges_upsert` accumulating `support_count`, taking `GREATEST(confidence)`, extending `valid_until` | REJECT | Mutates one row to represent repeated assertion, destroying per-assertion identity, time, origin, and basis. |
| `CHECK (from_thought_id <> to_thought_id)` | REJECT AS UNIVERSAL RULE | Universal self-relation prohibition is premature ontology; if it matters it is predicate-specific. |
| `ON DELETE CASCADE` on both endpoints | REJECT | Erases relation history on native deletion; contradicts BUILD 3 non-cascade lineage. |
| `confidence NUMERIC(3,2)` on the edge | REJECT FOR BUILD 4 | Collapses confidence into the relation record. |
| `valid_from`, `valid_until`, `decay_weight`, "NULL valid_until = still current" | REJECT / DEFER | Currentness and temporal validity on the relation row; reserved to BUILD 5 and E13. |
| `updated_at` trigger with UPDATE and DELETE grants | REJECT | Mutable relation rows; a Claim is asserted, not edited. |
| `metadata JSONB` bag | REJECT | BUILD 3 excluded a metadata bag. |
| Six-label vocabulary `supports`, `contradicts`, `evolved_into`, `supersedes`, `depends_on`, `related_to` | DEFER | AP-07 permits only what the trace earns. A candidate pool, never an inherited enum. |
| `classifier_version` tag | QUARRY | Separates model-output provenance from truth and distinguishes vocabulary changes during audit. Routes to AP-03. |
| Same supersession represented in `thought_edges` and `thoughts.supersedes`, mirrored non-atomically across two calls, best-effort, without preflight or automatic reconciliation | REJECT — GOVERNING NEGATIVE EXEMPLAR | The competing-relation-truth-store invariant demonstrated in its own source. |
| Documented backwards direction writes in pre-fix classifier builds, setting `supersedes` on the older thought pointing at the newer and inverting the stated contract | REJECT — PROMOTE TO FALSIFIER | Direction correctness was violated in production by caller convention. Direction must be enforced structurally and reversal must be falsified. |

## CANDIDATE FALSIFICATION TARGET — CANDIDATE ONLY

`WORKED_TRACE_06=CANDIDATE_NOT_ACCEPTANCE_AUTHORITY`

Recorded in `docs/acceptance-tests.md` under the non-colliding identifier **Worked Trace 06 — Typed
relation claim**, unlocking BUILD 4. Trace ordinals already run by creation order rather than build
order, since Worked Trace 04 unlocks BUILD 5. Reserved Worked Traces 04 and 05 are untouched and are not
renumbered or repurposed.

This target is candidate material for Shape. It is not frozen and carries no acceptance authority. Shape
freezes the final construction after the predicate and representation questions close.

Candidate fixture design uses only already-installed Referents and requires no new canonical Thought:

- endpoint (i) Claim C `0f89e778-b16e-4840-9129-a2aa3eb6f697`, a Referent whose native record is a Claim;
- endpoint (ii) GT01 `19a949ea-a8fc-4250-a386-fa64e5530180`, a Referent whose native record is a Thought;
- endpoint (iii) registered-only `2eede0e4-b27a-4383-850e-a448f0113c9f`, a Referent with no native
  record.

Candidate falsifiers:

1. reversing endpoints yields an observably different and wrong assertion, structurally prevented;
2. a relation Claim is distinguishable from an Evidence Link in persistence, not by caller memory;
3. asserting the relation confers no support, currentness, supersession, or standing change on either
   endpoint;
4. two separately asserted relation Claims over the same triple remain two Claims, with no upsert,
   accumulation, or tuple-uniqueness collapse;
5. no relation fact is representable in two places;
6. the relation Claim has a same-UUID Referent, and **loss of an endpoint's native binding does not
   erase the relation Claim while the endpoint Referent remains registered**;
7. classification-shaped input does not become governing truth;
8. asserting a relation between two Referents performs no co-reference;
9. only BUILD 4-authorized objects and Referents explain the expansion, with no BUILD 5+ surface; and
10. accepted BUILD 3 assertion behavior is preserved under the cross-build projection.

Falsifier 6 concerns native-binding loss only. It does not grant or imply a general deletion policy.

## CURRENT STANDING

This checkout records closed BUILD 4 Sense, the verified entry anchor, the recorded E-1 and E-2
dispositions, the Question Forward set, targeted prior-art dispositions, the carried BUILD 3
regression-authority obligation, and a candidate falsification target.

It does not select a predicate, a `claim_kind` value, a physical representation, or an enforcement
surface. It confers no implementation standing, warrant, authority, Shape authorization, or Move
authorization. No ADR was created.

## ENFORCEMENT UNTIL SHAPE AUTHORIZATION

**SEMANTIC — review against governing text:**

- preserve every listed non-collapse distinction;
- reject any candidate that lets a relation Claim read as a relational fact, a support judgment, or a
  currentness designation; and
- reject any candidate whose correctness depends on callers remembering endpoint direction.

**OBSERVATIONAL — repository diff:**

- the Sense closure diff may change governing documentation only;
- it may not add an ADR, schema, migration, runtime, MCP, test-execution, database, deployment, or
  remote-state change; and
- the candidate falsification target may not be cited as acceptance authority.

No implemented consequential transition is active in this checkout.

## FAILURE BEHAVIOR

Return to the human rail if:

- expressing one relation Claim requires changing a closed Thought, Referent, or Evidence Link identity
  decision;
- the minimum relation Claim cannot be represented without importing BUILD 5 temporal, history,
  currentness, or supersession machinery;
- a candidate collapses relation Claim into Evidence Link, or confidence into standing;
- preserving accepted BUILD 3 assertion behavior proves impossible alongside a second claim kind;
- a single relation truth store proves insufficient, which would be an invariant conflict rather than a
  design problem;
- a BUILD 0–3 reopening condition is observed; or
- a new public or MCP authorization surface becomes necessary.

## APERTURES

- **AP-01 — Controlled standing vocabulary:** REACTIVATED NARROWLY FOR BUILD 4. A second `claim_kind` is
  required. The exact value is a Shape decision. Broader claim-kind, origin, epistemic-standing,
  governance-standing, action-standing, qualification, and history vocabularies remain open on their
  existing terms.
- **AP-07 — Full relation ontology:** ACTIVATED TO MINIMUM RESOLUTION ONLY. Exactly one predicate,
  earned by the BUILD 4 trace. The complete relation ontology remains deferred.
- **AP-02 — Stable evidence interface:** PRESERVED AS NARROWED BY BUILD 3. Unchanged by BUILD 4 Sense.
- **AP-03 — Semantic-evaluation schema:** PRESERVED UNCHANGED. Classifier provenance and evaluation
  payloads route here, not to BUILD 4.

## REVALIDATION / REOPENING TRIGGERS

Reopen BUILD 4 Sense only if newly encountered governing evidence changes the focal object, a
Sense-closed decision, the Question Forward set, the no-blocker finding, or the recorded E-1 or E-2
dispositions.

Do not reopen Sense for a narrow difficulty in selecting a predicate, representation, constraint, or
harness projection. Those are Shape decisions routed above.

Reopen BUILD 3 only on its own recorded reopening conditions. E-2 does not reopen BUILD 3.

## NON-GOALS / DO NOT BUILD

- do not enter Shape until a separate human authorization;
- do not select the predicate, the second `claim_kind` value, or the physical representation during
  Sense;
- do not freeze the candidate Worked Trace 06 as acceptance authority;
- do not implement a relation ontology, predicate taxonomy, graph traversal, or inverse/symmetry
  machinery;
- do not add confidence scoring, warrants, authority, currentness, governance standing, governance
  activation, or action authorization;
- do not implement temporal validity, decay, standing transitions, review history, supersession
  history, Events, Artifacts, or transformation receipts;
- do not perform or imply co-reference or entity resolution;
- do not add a second relation truth store, evidence store, or authoritative cache;
- do not import OB1 or ECB v1 schema by resemblance;
- do not modify the frozen BUILD 3 harness or reinterpret its closure-state snapshot as an enduring
  invariant;
- do not add or change MCP tools, runtime behavior, deployment, credentials, or remote state; and
- do not open or select BUILD 5+.

## NEXT HANDLE

`AWAIT EXPLICIT HUMAN SHAPE AUTHORIZATION.`

The exact next authorized action is read-only human review of this closed Sense state. No Shape entry,
predicate or vocabulary selection, schema freeze, migration authoring or application, test execution
against the canonical database, deployment, ADR, or remote mutation is authorized. After an explicit
Shape authorization, answer the Question Forward set adversarially and stop again before binding an
Output Contract.
