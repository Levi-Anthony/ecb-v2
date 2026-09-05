STATUS: ACTIVE  
DISPOSITION: APERTURE  
ROLE: Explicitly governed unknowns  
AUTHORITY: None as answers; authoritative as a record that these questions remain open

# Open Architectural Apertures

An aperture is not a TODO list.

It records a distinction that has been encountered but is intentionally unresolved.

Each aperture must state why remaining open is currently safer or cheaper than premature closure.

## AP-01 — Controlled standing vocabulary

**WHAT**  
Exact enum values for claim kind, evidentiary basis, epistemic standing, governance standing, and action standing.

**WHY OPEN**  
The dimensional separation is architecturally required. The exact vocabulary has not yet been exercised enough by real v2 records to justify freezing it.

**CURRENT EFFECT**  
REACTIVATED NARROWLY FOR BUILD 5 on 2026-09-04 America/Phoenix, over the closed BUILD 4 narrowing.

NARROWED BY CLOSED BUILD 5A SHAPE. `epistemic_standing` is closed at exactly `unassessed`,
`basis_qualified`, and `revalidation_required`.

`basis_qualified` means the proposition was examined against the evidence revision declared by its
Evidence Link and the qualification succeeded. It asserts no truth, support strength, confidence,
warrant, authority, authorization, governance acceptance, currentness, or workflow position. Its entire
content is qualification with respect to a declared basis, which is what makes it capable of becoming
unreliable when that basis moves.

`revalidation_required` means the evidence currently observed for the declared basis differs from the
revision the recorded qualification was evaluated against, so that qualification cannot be relied upon
without re-examination. It does not assert that the Claim is false, unsupported, superseded, not
current, or invalid.

Broader vocabularies remain open.

BUILD 5A exercises no qualification-rejection branch, so no negative value is closed and none is
needed. Qualification outcome is not standing. A qualification may reject or preserve conflict while leaving the
prior epistemic standing unchanged, so BUILD 5 does **not** create `rejected`, `failed`, or any negative
standing value merely to encode a qualification outcome. Preserve
`evidence arrival != qualification outcome != standing change`. Rejected evidence or qualification must
not disappear as though never observed; the minimum representation preserving that outcome is a Shape
question if the E08 branch enters frozen Worked Trace 04.

`claims.epistemic_standing` is the materialized/applied epistemic standing resulting from a successful
qualification transition. It is not to be renamed or described as "latest authorized standing":
"latest" imports recency semantics and "authorized" imports authority and warrant semantics BUILD 5 has
not earned.

The BUILD 4 narrowing remains accepted and unchanged.

`claim_kind` is closed at exactly `assertion` and `relation`. `relation` designates a typed
referent-to-referent relation Claim and matches the Build Contract's "assertion or typed relation"
without inventing vocabulary. Origin and epistemic-standing values are unchanged from BUILD 3: a
relation Claim is recorded with `origin=ecb_inference` and `epistemic_standing=unassessed` exactly as an
assertion Claim is.

No third claim kind, no relation-specific origin, and no relation-specific standing value is admitted.

The closed BUILD 3 values remain accepted and unchanged: `claim_kind=assertion`,
`origin=ecb_inference`, and `epistemic_standing=unassessed`. `unassessed` means only that no separate
epistemic qualification has been recorded under the BUILD 3 model; it does not mean unsupported, false,
doubtful, low-confidence, provisional, accepted, current, unauthorized, or invalid. `inference` is
origin, not standing. BUILD 3's assertion-only physical constraint was the closed physical surface of
BUILD 3, not the complete Claim ontology, and is not a permanent prohibition on later Claim kinds.

Broader claim-kind, origin, evidentiary-basis, epistemic, governance-standing, action-standing,
qualification, and history vocabularies remain open on their existing terms.

**TRIGGER**  
Reactivate further when a build needs a claim kind or origin beyond `assertion`, `relation`, and
`ecb_inference`, an epistemic value beyond those BUILD 5 Shape closes, governance or action standing, or
a standing transition those values cannot represent.

**ROUTE**  
Worked Trace 04 / BUILD 5 for qualification history; otherwise the first build whose behavior requires
the additional controlled value. Preserve all dimensional separations.

## AP-02 — Stable evidence interface

**WHAT**  
Exact guarantees Layer A supplies to governance for evidence identity, version/hash, locator, retention, and mutation behavior.

**WHY OPEN**  
BUILD 3 has closed the minimum stable interface for a Thought-backed Evidence Link. The broader locator,
retention, algorithm-migration, non-Thought evidence, privileged-mutation history, Event, and Artifact
contracts have not been exercised enough to close without importing later-build machinery.

**CURRENT EFFECT**  
NARROWED BY CLOSED BUILD 3 SHAPE. The BUILD 3 requirement is resolved and no longer blocks Move. Evidence
revision is the Thought Referent UUID plus a database-derived digest using scheme
`ecb_thought_revision_v1_sha256`: SHA-256 over the frozen tagged, length-framed UTF-8 text and signed
UTC-microsecond encoding of `content + source + captured_at`. The Evidence-Link trigger locks the
persisted Thought `FOR SHARE`, derives the digest inside link creation, and prevents normal callers from
supplying canonical revision fields. Embedding and retrieval state are excluded. Mismatch and native
Thought disappearance preserve Claim and Link and never substitute changed bytes as original evidence.
General locator policy, historical payload retention, digest-scheme migration, versioned Artifacts,
and standing/current-support history remain open.

CONSULTED; NOT REACTIVATED at BUILD 5 Sense closure. Reactivation is conditional on the Worked Trace 04
reconstructibility question resolving toward retaining what a prior basis *was* rather than that it
*changed*. On Worked Trace 03's precedent, which deliberately serializes no changed source payload, it
is expected to stay closed. Storing an observed digest is not payload retention and does not reactivate
this aperture.

BUILD 5B: REACTIVATED NARROWLY for exact Artifact version payload and retention under explicit human
Sense-closure and Shape authorization. The candidate episode needs to recover what a representation contained, not
merely detect that its digest changed. This activates the later Artifact seam; it does not alter the
closed Thought revision scheme, broaden Evidence Link endpoints, or promise historical Thought
payload reconstruction. See [the BUILD 5B examination](build-sense/007-build-5b.md), Q1 and Q4.

NARROWED BY REQUALIFIED BUILD 5B SHAPE ON HARDENED LINEAGE: retain exact Artifact text, individual version identity, fixed
operation/checker specification, durable attempts, and receipt/witness observations under the bounded
[WT07 contract](acceptance/build-5b-wt07.md). No deletion/expiry policy is activated. Digest remains an
integrity anchor rather than payload. This local narrowing does not extend the Thought revision
projection, Evidence Link endpoint contract, or retention of all historical evidence. Move remains
unreleased; these are selected guarantees to implement, not observations of installed behavior.


**TRIGGER**  
Reactivate if a new source-bearing Thought field is outside the v1 projection, historical payload must
be reconstructed after drift/disappearance, SHA-256 or the v1 encoding must migrate, or a non-Thought
evidence surface requires a different locator/retention contract.

**ROUTE**  
Reopen AP-02 and the narrow BUILD 3 Shape only for a v1-contract falsifier; otherwise route payload and
version history to BUILD 5+ and derive later interfaces from observed evidence behavior.

## AP-03 — Semantic-evaluation schema

**WHAT**  
Exact payload and lifecycle for typed semantic evaluations used by consequential transition policies.

**WHY OPEN**  
The architectural requirement is settled. No early build yet needs a consequential semantic transition.

**CURRENT EFFECT**  
Does not block BUILDS 0–4. CONSULTED; NOT REACTIVATED at BUILD 5 Sense closure: the Worked Trace 04
mismatch condition is a digest comparison, decidable structurally with no semantic-evaluation payload.
Conditional reactivation only if qualification Q resolves toward an outcome that is a judgment rather
than a comparison.

**TRIGGER**  
BUILD 5 or later introduces a transition that cannot be decided structurally.

**ROUTE**  
Specify only the evaluation types required by that transition.

## AP-04 — Enforcement-policy payload

**WHAT**  
Exact schema for transition policies describing structural, semantic, authority, and observational enforcement.

**WHY OPEN**  
The enforcement classification is ratified. The concrete transition set is not yet instantiated.

**CURRENT EFFECT**  
Does not block evidence-layer work. OPEN AND INACTIVE at BUILD 5 Sense closure: the focal episode
contains no consequential governance-policy transition. Activation is not inferred from standing history
alone.

**TRIGGER**  
First consequential governance transition.

**ROUTE**  
BUILD 5/6 contract extraction.

## AP-05 — Kernel packet physicalization

**WHAT**  
Whether propagation packets remain generic artifacts or earn a dedicated physical representation.

**WHY OPEN**  
No propagation workload exists yet in v2. Premature table creation would violate structure-is-earned.

**CURRENT EFFECT**  
No block through BUILD 9.

**TRIGGER**  
BUILD 10 demonstrates generic artifact representation creates integrity, lifecycle, query, or transaction pressure.

**ROUTE**  
Schema-promotion ADR.

## AP-06 — Bounded Infinity formal status

**WHAT**  
Whether Bounded Infinity is ultimately primitive, generative constraint, explanatory compression, or something else.

**WHY OPEN**  
Its current phenotype is operationally represented through Master Key, Aperture, and Revalidation. Further metaphysical/formal resolution does not alter current build behavior.

**CURRENT EFFECT**  
No block.

**TRIGGER**  
A real vertical slice cannot preserve bounded local closure plus legitimate reopening using the current mechanisms.

**ROUTE**  
Upstream architecture Shape.

## AP-07 — Full relation ontology

**WHAT**  
Complete set/hierarchy of relation predicates.

**WHY OPEN**  
The system has not earned a universal relation taxonomy.

**CURRENT EFFECT**  
NARROWED BY CLOSED BUILD 4 SHAPE. BUILD 3 did not activate this aperture. BUILD 4 closes exactly one
predicate: `depends_on`, meaning the subject Claim's validity is conditional on the object Referent.

`depends_on` asserts neither endpoint's truth, support, confidence, currentness, standing, or authority,
and triggers no propagation or cascade. It was selected because it is the only candidate that is
asymmetric, makes endpoint reversal observably wrong, and imports neither support semantics adjacent to
Evidence Link nor BUILD 5 currentness semantics.

The complete relation ontology remains DEFERRED. BUILD 4 admits no second predicate, taxonomy or
hierarchy, inverse or symmetry machinery, graph traversal surface, relation lifecycle, co-reference or
entity resolution, and no adoption of the six-label OB1 typed-edge vocabulary by resemblance. The
self-relation prohibition closed by BUILD 4 is scoped to `depends_on` alone and imposes no universal
rule on future predicates.

NOT ACTIVATED BY INHERITANCE at BUILD 5 Sense closure. BUILD 5 being open does not broaden this
aperture. BUILD 5 may encounter supersession or currentness semantics, but must not broaden BUILD 4's
relation ontology or repurpose `depends_on` to mean supersedes, supports, or current. `depends_on`
remains non-propagating: dependency exists is distinct from evidence or basis changed, from revalidation
required, from standing changed, and from any currentness or supersession designation.

**TRIGGER**  
Repeated ambiguity, integrity failures, or cross-domain reuse demonstrates a higher-order relation grammar is needed.

**ROUTE**  
Relation-schema ADR for anything broader than BUILD 4's single closed predicate.

## AP-08 — Final human UI

**WHAT**  
Persistent dashboard/interface architecture.

**WHY OPEN**  
Views have not yet stabilized through repeated use.

**CURRENT EFFECT**  
Query-generated views are sufficient.

**TRIGGER**  
Repeated human use demonstrates a stable view deserves persistent interface affordance.

**ROUTE**  
Separate UI Shape.

## AP-09 — BUILD 0 physical substrate activation — CLOSED 2026-09-03

**WHAT**

The exact deployed runtime, canonical vector-capable database integration, embedding route, model identity, and vector dimension for BUILD 0.

**CLOSURE EVIDENCE**

Supabase project `ecb-v2-brain` (`vezxivrvhakclxuvxzso`) is provisioned and connected. A deployed probe verified native `gte-small` output as 384 finite normalized values. ADR-001 selects the Codex/Supabase Edge Function door and bearer boundary; ADR-002 records the combined physical substrate. The probe was deleted, the governed migrations installed pgvector plus the canonical table and similarity function, and Golden Trace 01 passed through the deployed runtime without triggering reopening.

**CURRENT EFFECT**

BUILD 0 runtime implementation is authorized only within ADR-001, ADR-002, and `/BUILD_CHECKOUT.md`. No additional store, model, door, persistent field, or tool is licensed.

**REOPENING TRIGGER**

Golden Trace 01 cannot pass using the selected store, runtime, model, dimension, or bearer boundary.

**ROUTE**

Identify the exact failed physical assumption → reopen ADR-001 or ADR-002 only as narrowly as required → preserve one canonical brain and one current door.

## AP-10 — Formal semantics of bounded action abstraction

**WHAT**

Whether action-envelope compilation can be formalized using operational equivalence, abstract interpretation, and eventually a Galois-style abstraction/concretization relation.

**WHY OPEN**

The conceptual correspondence is strong, especially the pairing of an over-approximation of possible concrete states with an under-approximation of legitimately permitted actions. Functioning ECB v2 envelope specimens do not yet exist, and meaningful partial orders and soundness relations have not been derived from observed behavior.

**CURRENT EFFECT**

No block on BUILDS 0–7. Operational equivalence, robust-action soundness, semantic normalization stability, and commuting preservation checks may be used as reasoning machinery and candidate test generators. They do not become governing invariants or frozen acceptance tests merely by appearing in a probe.

**TRIGGER**

Automated envelope compilation, or a build failure, requires a formal answer to whether a lossy abstraction still safely licenses an action.

**ROUTE**

Use the formal-semantics research pipeline → derive semantics from actual envelope specimens → test operational equivalence and robust-action soundness first → introduce a Galois connection, categorical structure, or metric only if it adds discriminating power → route any closure through a frozen acceptance test, ADR, or explicit human authorization as appropriate.

## AP-11 — Human-door deployment — CLOSED 2026-09-03

**WHAT**

Whether BUILD 0's single remote MCP human door is deployed as a Supabase Edge Function beside the canonical database or as a Vercel Fluid Function connected to Supabase.

**CLOSURE EVIDENCE**

The human accepted ADR-001: Codex is the first client, one Supabase Edge Function is the current door, a shared bearer key is the BUILD 0 technical boundary, and Vercel billing is out of scope. Codex's installed client supports Streamable HTTP with a bearer token sourced from an environment variable.

**CURRENT EFFECT**

The selected Supabase door is deployed and passed Golden Trace 01. Vercel Fluid Functions remain a compatibility fallback, not a co-equal endpoint. Do not add a second door during post-BUILD-0 metabolization.

**REOPENING TRIGGER**

An ADR-001 reopening condition is observed during the minimum client experiment or Golden Trace 01.

**ROUTE**

Record the concrete failure → test Vercel Fluid Functions as the first fallback → amend or supersede ADR-001 through the human route → keep exactly one current endpoint.

## Aperture rule

If a build discovers a new consequential unknown:

1. determine whether the current Build Unit can proceed without resolving it;
2. if yes, register an aperture with WHAT / WHY OPEN / CURRENT EFFECT / TRIGGER / ROUTE;
3. if no, resolve only enough to restore the current Build Unit;
4. do not broaden into unrelated architecture.
