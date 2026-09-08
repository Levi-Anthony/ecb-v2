STATUS: SENSE OPEN — INITIAL EXAMINATION; NO SHAPE OR MOVE RELEASE
DISPOSITION: PROJECTION
ROLE: BUILD 6 focal episode candidate, evidence encounter, and Question Forward
AUTHORITY: Human “Open 6” / “Continue”; subordinate to governing repository sources

# BUILD 6 Sense — Governance Bootstrap

## Decision and governing basis

Determine the smallest reproducible transition from externally authorized bootstrap
to ordinary governed succession, while making the authority basis reconstructible
and preventing a candidate policy from authorizing its own installation.

The [Build Contract](../build-contract.md#governance-activation) already requires:

`bootstrap trust root → initial policy activation → human/warrant authority designation → bootstrap exhaustion → ordinary governed succession`

That sequence governs. The concrete policy, root, authentication binding, storage,
transition atomicity, and fixture remain undecided. The discriminator remains
`proven capability ≠ inherited implementation`. Sense is open; this document does
not bind an Output Contract or freeze a new acceptance trace.

## Entry evidence and distinctions

The human's “Open 6”, followed by “Continue”, closes BUILD 5B on execution-evidence
anchor `7c89e82eaba27ecd3972bf0100a1133363b3304c`. The closure is separately recorded
at `5af44bb` in the [BUILD 5B receipt](../build-receipts/007-build-5b.md).
Its canonical observations are accepted historical evidence, not a new database
inspection in this Sense: nine Artifacts, sixteen Referents, three Claims, one
Evidence Link, one standing transition, RC1=PASS and the expected RC2=FAIL.

Inspection of the selected SQL establishes two physical limits:

- BUILD 5B's Artifact role constraint admits only source representation,
  transformation request, transformed representation, check attempt and receipt.
  The logical Artifact primitive includes policy representations, but the installed
  table does not yet implement a policy lifecycle. Shape must earn any extension.
- BUILD 5A's immutable Event implementation is specifically Claim standing history.
  A governance activation must not be disguised as another qualification of Claim C.
  Sharing identity/history machinery does not license shared transition semantics.

Registered identity, `basis_qualified`, a PASS receipt, a stored document, a caller's
claimed role, and possession of a database credential each fail to establish the
warrant for policy activation. They can contribute evidence or technical capacity;
the governing authority basis remains a separate obligation.

## Recommended focal episode — candidate, not accepted fixture

Use one declared governance scope and one initial policy succession. P0/P1/H below
are symbolic labels; no identities, persistent enums or schemas are allocated.

1. An explicitly identified external human authority authorizes a bounded bootstrap
   act over exact proposed policy P0 and its intended scope. P0's own statements do
   not supply permission to install P0. Preserve the human decision separately from
   the agent's interpretation and the executor's technical identity.
2. Activate P0 through that bounded authority. Establish a designation of the human
   and the warrants for ordinary succession under the contract's required order.
   An intermediate bootstrap state cannot silently enable ordinary governed effects.
3. Exhaust the bootstrap path at an explicit, reconstructible boundary. Ordinary
   agents cannot reuse the original grant, reset an empty-looking projection, or
   replace missing evidence with an assertion that bootstrap never occurred.
4. Propose P1. Activate it only through a valid succession decision under the
   authority operative before the transition. P1 cannot retroactively validate its
   own approval, and merely being newer cannot make P1 governing.
5. Demonstrate refusal of an unapproved P1, a changed version using old approval,
   a caller-asserted human identity, and replay of exhausted bootstrap authority.
   Include a valid succession control so universal denial cannot satisfy the test.
6. Restart and reconstruct the exact policy basis, applicable human/role/warrant,
   bootstrap exhaustion and succession history from durable records, with no need
   to trust the preceding conversation.

This is a proposed minimum exercise of the entire required bootstrap sequence.
The human may narrow or replace it before Sense closure. The initial policy should
cover this one governance succession, not general business actions. Policy-specific
activation is needed here; BUILD 7's first local Master Key and BUILD 8's general
action-envelope lifecycle remain unopened.

## Alternatives and consequences

| Candidate | Consequence under the current contract |
|---|---|
| Treat service-role or owner access as the authority root | Technical ability substitutes for warrant unless an external designation explicitly binds custody, identity, scope and operation. A credential alone is insufficient. |
| Let P0 declare who may install P0 | Circular authority: the candidate supplies the rule that purportedly authorized its own activation. Requires an independently authorized bootstrap basis. |
| Keep the initial human override permanently reusable | Does not demonstrate bootstrap exhaustion; emergency/recovery use needs its own explicit later authority basis. |
| Treat a transformation PASS as policy approval | Violates BUILD 5B's preserved evidence/authority separation. |
| Bounded external root, explicit exhaustion, successor authorized under prior operative basis | Recommended episode; exposes identity, ordering, revocation, failure and reconstruction questions without selecting a universal governance engine. |

## Evidence encounter and qualification limits

**Governing repository sources.** Build Contract governance activation/build sequence;
[invariants](../invariants.md) authority, role, verification and shared-semantics
separation; [glossary](../glossary.md) Warrant, Current, Artifact and Event;
[open apertures](../open-apertures.md) AP-01/03/04/07. E13, E17, E18 and E20 in
[build evidence](../build-evidence.md) put time, permission-relevant state and role
separation on the decision surface. These evidence entries do not select a schema.

**Pinned legacy implementation.** Read-only inspection of `/Users/prodadmin/ecos`
at commit `a5d4fb4f8fcc8162bd593090db4177adfdde0728`, with the inspected files clean:

- `supabase/migrations/20260610223000_create_artifact_draft_always.sql` inserts
  agent-created artifacts as draft/human_gate and fixes actor_type as agent despite
  caller `p_actor`. Its comments report an earlier automatic-promotion defect and
  explicitly state that no privileged bootstrap bypass is implemented. The source
  confirms the creation guard, not the complete downstream approval path or current
  deployed behavior. No legacy test was executed in this Sense.
- `apps/crm-dashboard/lib/artifact-governance.ts` constructs metadata/status/review
  patch requests; its unit test checks allowed values and request construction.
  Those functions do not establish human authentication, bootstrap exhaustion or
  lawful succession. This is scoped source inspection, not a system-wide absence claim.

These encounters support preventing creation/metadata/actor prose from granting
authority. They do not earn legacy tables or enums for v2. The existing human-approval backend was then traced as recorded below; complete
bootstrap/succession qualification remains open.

**Live ECB source read, 2026-09-06.** Artifact
`ssmm-action-button-schema-to-runtime-build-contract-v0-1`, manifest version 4,
status draft, mixed-warrant metadata. Three blocks were read at block version 1:

| Block | Exact source hash | Local consequence / limit |
|---|---|---|
| `/authority-and-change-rule` | `14c01b656770bbdd76541c49cc1fcdb73ed506cda3283b1bde2a59f4f7f4d99b` | Separates compilation from amendment; its inherited architecture does not govern this greenfield repo. |
| `/cross-cutting-runtime-invariants` | `ba90c53a7414e71df7ec6a490596bc2ee4796b494ebdd5a08debb9c050cb4c0b` | Candidate evidence for separating human input, interpretation, acceptance and installed state. |
| `/state-and-transition-contract` | `cef1fdf05f3512dd42de4df2e9b4dfc8741d099deb5dbf535510cb81fdcd0b8c` | Proposed phase-local transition discipline; its broad exactly-once claim is not adopted as a proved v2 property. |

All three blocks identify their standing as compilation proposals pending human
review. Retrieval labels do not promote them. Broad ECB semantic searches returned
adjacent authority/continuity documents and unrelated results, not a qualified
bootstrap implementation. Search coverage is not exhaustive.

**Collaboration proposal.** The local untracked research draft is a use-case candidate:
its controller will eventually need an authoritative basis for effects. It neither
supplies that basis nor authorizes importing the controller, global skill, or full
workflow into BUILD 6. Its untracked file remains untouched.

## Question Forward

| ID | Decision-changing question | Route and discriminator |
|---|---|---|
| Q1 | Which external human authority authorizes bootstrap, over what exact scope/policy, and how is that identity established independently of caller prose? | Sense/human authority disposition. Recommend a narrowly scoped designation by Levi for this bootstrap; no credential or identity binding is inferred from the recommendation. |
| Q2 | What exact initial policy governs ordinary succession, and which prior operative basis authorizes P0→P1? | Sense then Shape; distinguish policy activation from policy content, approval, and executor identity. No candidate may authorize its own installation. |
| Q3 | What commits together, when is bootstrap exhausted, and what operations are allowed in a partially initialized state? | Shape; force crashes/races at each boundary and require recovery without reopening exhausted authority. |
| Q4 | Which role, warrant and governance-standing facts must be persisted, and can existing primitives retain them without semantic overloading? | AP-01/AP-04; use existing Referent identity, leave physical roles/enums undecided, do not create an Actor ontology by default. |
| Q5 | Does this episode require immediate-only validity, delayed effectiveness, retroactivity or revocation? | E13 / Shape. Recommend testing immediate succession first; do not claim bitemporal coverage. A required historical-validity distinction can change the representation. |
| Q6 | What policy/version/activation representations are actually needed beyond the installed five-role Artifact and Claim-history tables? | Shape after focal acceptance. Demonstrate integrity or reconstruction need before extending dedicated storage. |
| Q7 | What surviving authority can repair interrupted initialization without being an unbounded bootstrap override? | Shape/human boundary; distinguish replay, recovery and deliberate future emergency authority. Missing evidence cannot create permission. |

These are open decisions, not reasons to halt independent source inspection. They
block only dependent closure/installation. No answer is supplied merely to finish
a form. The legacy human-approval backend has now been traced below. The next decision
is the minimum external root and policy scope; identity binding, policy bytes and
exhaustion/recovery conditions must be explicit before dependent Shape closes.

## Pressure to carry into Shape

Every consequential Shape must disposition all twelve governing pressures. For
this candidate, proposed attacks include duplicate bootstrap/succession requests;
competing initializers/successors; stale policy and approval versions; crash and
rollback during activation/exhaustion; reconstruction from stale projections;
wrong human/executor/role; substituted exact bytes; revoked basis; bypass through
ordinary credentials; retry after unknown outcome; validity versus recording order;
and unauthorized policy writes. These are inquiry targets, not frozen tests or
claims that a mechanism already handles them.

Structural checks can bind identities, versions, state and committed transitions.
Authority must provide the external root and scoped designation. Semantic judgment
may be needed to accept policy content; observations establish what actually ran.
The final enforcement surfaces belong to Shape. No statement here proves a
non-bypassable boundary while the same actor retains an independent privileged path.

## Current disposition

BUILD 5B closure is recorded; BUILD 6 Sense is open with a recommended episode and
traceable open questions. AP-01 and AP-04 are consulted at their triggered seam;
no controlled vocabulary or enforcement payload is selected. AP-03 activates only
if an executable transition needs semantic judgment; AP-07 only if a new asserted
relation is needed. No new aperture is required merely to duplicate these routes.

Prior-art qualification is partial, not complete. No Sense closure, Shape decision,
Output Contract, acceptance freeze, migration, runtime or canonical state change
has occurred. Continue the bounded root/policy-scope examination before proposing Sense closure.
BUILD 7+ stays unopened.


## Follow-up — authenticated approval boundary

At the same clean legacy commit `a5d4fb4f8fcc8162bd593090db4177adfdde0728`,
`supabase/migrations/20260605010000_artifact_v3_human_door.sql` establishes:

- `artifact_authenticated_human_principal()` requires an authenticated session,
  a non-null authenticated user ID, and an active row in `artifact_human_authorities`.
- `apply_artifact_human_patch_tx` and `review_artifact_change_tx` obtain the principal
  through that helper before supplying the internal human authority path.
- Direct `apply_artifact_patch` execution is revoked from ordinary API roles,
  including service_role; human wrapper access is granted to authenticated users
  and still requires the registry check. Ordinary roles cannot write the registry.
- Review locks the proposal and target, applies against the proposal's base version,
  and retains conflict/review outcomes. The later replacement in
  `20260709010000_eco46_a1w_supersession_write_rpcs.sql` still calls the principal
  helper before accepting a proposal.

This source encounter supports a distinct authenticated-human boundary, not a claim
that a metadata flag authenticates anyone. The inspected migration directory search
found no insertion into the authority registry and no implemented bootstrap
exhaustion path; it does not establish their absence from every deployment or
external administrative process. Current deployed privileges were not queried.

**Consequential comparison:** preserve authenticated reviewer versus claimed actor,
explicit registry/designation versus login alone, and exact-version approval versus
newest content. Do not inherit the registry table, broad status ladder, service-role
API design or ordinary human-approval path as a proof of bootstrap legitimacy.
The trust that establishes the first designated authority remains an external
assumption to authorize and bound, rather than something that registry proves about
its own creation. See the [harvest record](../harvest-ledger.md#build-6--authenticated-approval-and-non-authoritative-creation).

**Recommendation for Sense disposition:** root the one-scope exercise in Levi's
explicit authorization of exact P0 and the designated human's succession power;
require a separate technical binding of that human identity; consume the bootstrap
grant on complete initialization; then exercise one P0-authorized P1 succession.
This recommendation does not create the grant. Whether the technical binding is a
restricted installer custody boundary or authenticated application flow is still
a Shape alternative; the selected boundary must withstand its named caller-forgery
and replay tests. A general human UI is not assumed necessary.
