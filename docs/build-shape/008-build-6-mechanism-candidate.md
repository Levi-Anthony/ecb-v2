STATUS: CANDIDATE — NOT SELECTED, FROZEN OR INSTALLED
DISPOSITION: PROJECTION
ROLE: Reviewable BUILD 6 mechanism proposal
AUTHORITY: Inherits accepted M2 and Shape scope; supplies no new human binding or execution permission

# BUILD 6 — One committed initialization, recoverable exact decisions

## Recommendation

Use a narrowly privileged database transition boundary. One transaction makes initial policy activation, initial H designation and bootstrap exhaustion effective together. Retain the accepted subjects and human decisions before execution; retain the consequential transition and resulting current-state pointer atomically. After interruption, reconstruct the result before deciding whether any execution remains necessary.

This preserves the accepted ordering without exposing partially usable governance. One initialization may have several failed execution attempts. Success is one durable transition, not a promise of exactly-once network delivery.

H means the designated human authority; P0 is the initial policy; P1 is the first successor. The current external authority exercised by Levi remains the source of the initial grant. H's later power comes from designation. Credential possession, candidate creation and database execution confer neither.

The proposal is confined to the already accepted BUILD 6 episode. It does not install Master Keys, action envelopes, a dashboard, an Actor ontology or a universal policy engine.

## Alternatives compared

| Candidate | Benefit | Decisive limitation |
|---|---|---|
| Agent/controller coordinates direct table writes | Few new database interfaces | Ordinary credentials could bypass checks or separate state from authority history. Does not meet the declared boundary. |
| Several independently committed initialization stages | Supports external effects and long-running stages | Introduces partially initialized states, reconciliation and more intermediate permissions. No external effect is required by this episode. |
| One database transition with prior durable decisions | Atomic visibility; one concurrency boundary; straightforward result reconstruction | Requires carefully restricted entry functions and an authenticated decision-ingestion boundary. Selected recommendation, not yet ratified. |
| Generic governance/event/policy framework | Broad future extensibility | Unproven scope and extra semantic machinery; no obligation here requires a general interpreter. Defer. |

Reconsider the single transaction if a required initialization act cannot occur in the same database transaction. Do not silently put an external side effect inside this guarantee.

## Minimum persistent responsibilities

Recommend four narrowly scoped native record families. Table/function names below are proposed labels, not frozen vocabulary. Every persistent first-class subject receives its own Referent ID; references are type-checked at the operation boundary. These records do not overload the five existing BUILD 5B Artifact roles or Claim-standing transitions.

| Record family | Retained facts | Why persistence is earned |
|---|---|---|
| Immutable governance subjects | Exact policy/remit/accepted-basis representation, format version, digest, source provenance and Referent identity | Acceptance must survive source edits and bind exact material. Storage itself confers no authority. |
| Immutable governance decisions | Decision subject, scope, independently established principal, authority basis, expected operative predecessor, execution limits and request identity | A worker restart must recover actual authorization without reconstructing it from prose. A changed subject cannot reuse approval. |
| One scope record | Scope identity, immutable root-binding reference, current transition pointer | Provides a row to lock even before genesis and a transactionally maintained current position. Registration alone enables nothing. |
| Immutable governance transitions | Genesis or succession, decision reference, prior/resulting policy and designation, ordered obligations, executor, committed outcome and scope sequence | Couples action and historical basis; makes replay, branching and reconstruction detectable. |

Use a separate immutable withdrawal decision referencing an earlier unconsumed decision if withdrawal is exercised by its already-authorized issuer. This implements withdrawal of that issuer's own pending authorization, not authority to revoke another principal, undo committed initialization, or restore bootstrap power. The proposed P0/remit below expressly includes this bounded behavior for H. Root withdrawal before genesis uses the accepted external root, never the future H.

An append-only decision/withdrawal sequence determines whether a grant is usable; do not overwrite its original evidence. All decision ingestion and effect operations lock the same scope row so withdrawal and execution have an explicit serial order. A withdrawal committed first prevents use; an effect committed first remains historical fact. No remote observation or wall-clock comparison substitutes for that order.

The scope's current pointer is maintained only by the transition boundary and must agree with the terminal transition in the single predecessor chain. A disagreement is an integrity failure: return a diagnostic, do not repair by guessing the newest record. A unique genesis per scope and unique successor per predecessor independently prevent duplicate genesis and branching. Immutable lineage records remain authoritative reconstruction evidence.

## Human acceptance and technical trust

Recommended authentication pattern: verified Supabase Auth human sessions, with an explicit issuer/subject binding to the external root for genesis, and to the installed H for later decisions. Preserve the external source of the first binding; enrollment is not proof of its own legitimacy. A login merely identifies a principal. It does not designate H or determine the remit.

The reviewed acceptance operation receives the exact candidate identifiers and digests, displays the subjects to the human through a review surface, and records acceptance through an authenticated human-only route. It must derive identity from verified authentication, never caller-supplied `actor`, email, metadata or an agent's assertion that Levi approved. The same person may occupy root and H roles; the two bases remain separately recoverable.

This is a proposed technical pattern, not evidence that a human account, session flow or principal binding is already installed in v2. Before freezing executable expectations, qualify that path locally and bind the actual issuer/subject through human-root acceptance. The existing kernel bearer key must not become a human approval credential. No new polished UI is required for qualification, but a usable exact-subject review/confirmation path is required; an agent-authored acceptance row is insufficient.

Authentication establishes identity at decision time. The durable grant then supplies its declared execution scope; later logout does not retroactively erase an issued grant. Withdrawal/currentness checks occur at execution. Do not conflate session revocation with grant withdrawal. If the accepted grant requires a live human session at effect time, that is an additional explicit condition and must be tested.

Recommend private tables and narrowly privileged internal transition functions with fixed search paths and non-login ownership. Ordinary API roles, the model's kernel/service credential and human sessions receive no direct writes to governance state. Human entry functions may submit decisions only after authentication and scope checks; the execution entry may exercise only a previously committed matching decision. Internal function execution is revoked from PUBLIC and ordinary callers. Any exposed wrapper must perform the same checks and may not accept caller-forged principal context.

The exact wrapper/role arrangement must be tested, including direct SQL, REST/RPC and function calls. A direct database role able to forge JWT context, change grants, impersonate the human, alter functions or write protected tables lies outside the claimed ordinary-caller boundary. If the model has such custody in the operating deployment, non-bypassability against that model is not established. Restrict operational credentials before making that claim; do not rename custody as authority.

## Transition behavior

### Record a decision

1. Authenticate the issuer through the qualified human boundary.
2. Lock the exact scope. For genesis, verify the accepted external root binding; for succession, verify installed H, current policy and remit.
3. Load immutable subjects and compare exact bytes/digests and expected prior state. Validate the bounded policy format; reject unknown fields/unsupported semantics rather than interpreting them generously.
4. Retain the exact decision with its basis and declared limits; commit. A retry with the same request identity and bytes returns that decision. The same identity with different material is a conflict.

This operation does not activate the subject. Decision acceptance and execution remain distinct.

### Execute initialization

1. Lock the scope; inspect any existing transition for this decision/request.
2. If the exact initialization already committed, return its retained result without another effect, even if bootstrap is now exhausted. This is historical result retrieval, not renewed authority.
3. Otherwise verify a previously committed, unwithdrawn genesis decision for this scope, exact P0 and H/remit, binding basis and execution conditions. Require that no genesis exists.
4. Create one transition retaining the ordered subacts: activate P0; designate H with the accepted remit; exhaust bootstrap. Set the scope pointer to that transition in the same transaction. All three subacts derive from the same prior grant; P0 does not authorize the designation.
5. Commit before reporting success. A failure rolls back all effect records, Referent registrations and pointer changes. The prior committed decision remains.

Bootstrap exhaustion is established by the committed genesis transition, not by a separately resettable flag. A new request ID cannot create a second genesis. Ordinary governance checks require that complete transition, not a pending acceptance or intermediate write.

### Execute first succession

Lock the same scope; return an exact already-committed result when present; otherwise require current P0, valid H/remit, a prior committed H decision over exact P1 and matching expected predecessor, plus no prior withdrawal. Append the succession transition and change the pointer atomically. Another request against the old predecessor must fail after the first commits. A fresh authorization under a new operative basis is a different decision, never an automatic retry.

P1 cannot silently replace H, enlarge the remit, recreate bootstrap competence or execute unrelated operations. Those are outside the proposed bounded profile and require their applicable architecture route. Successful BUILD 6 succession does not itself authorize BUILD 7 implementation.

### Recover from interruption

| Observed position after an authoritative scope-locked read | Response |
|---|---|
| Exact transition committed | Return the original outcome and current position; no repeated effect. |
| No effect committed; exact decision remains usable | Retry within that same authorization, rechecking current basis and conditions. |
| Decision withdrawn or predecessor changed | Explain the specific conflict; preserve history; do not manufacture replacement authority. |
| Database unavailable or integrity cannot be established | Report outcome unknown and the read/reconciliation route. Do not infer failure from a timeout. |

A scope-locked read serializes with a still-running attempt before declaring no committed effect. A speculative replica or stale cache cannot establish retry eligibility. A separate durable attempt table is not currently earned: this episode has no external effect before its database commit, and the prior decision plus committed transition recover the consequential state. Add attempt persistence only if required attempt-level evidence or external dispatch introduces a concrete need; do not copy BUILD 5B's attempt mechanism by name.

## Proposed P0 and remit for human review

The [decision package](008-build-6-review-package.md) carries the exact candidate P0 bytes/digest, proposed H/remit and bounded policy-language semantics. It is not an acceptance record.

These are explicit recommendations, not inferred designations or accepted policy. This section defines the normative proposal in plain language; its eventual exact encoded representation must remain bound to the same meaning and receive the required acceptance before freeze.

**Initial H recommendation: Levi.** Reason: the accepted root disposition permits him, and this personal system currently has one human operator who supplies the reserved decisions. A requirement for a separate approver, shared operation or delegated responsibility would change this recommendation.

**Proposed remit:** H may accept or decline an exact successor policy for this governance scope and withdraw H's own unconsumed succession authorization. H may inspect the history and obtain explanations. This designation supplies no authority to designate another H, delegate its power, enlarge its remit, reset bootstrap, alter historical records, deploy infrastructure or authorize arbitrary world actions. Those remain under their independently applicable authority routes.

**Proposed P0:** A successor becomes operative only through a previously committed, unwithdrawn decision by the currently designated H within that remit, binding the exact successor and current predecessor. The transition must preserve scope, H/remit, prior authority history and bootstrap exhaustion. Candidate storage, verification, recency and executor capability do not substitute for that decision. This policy grants no other operational capability.

**Constructed first-succession case:** P1 adds a nonempty human explanation requirement for subsequent policy-acceptance decisions while preserving the other conditions. P0 does not require that explanation field; P1 does. This supplies an observable policy difference without inventing a new authority. The exact P1 candidate and its decision will be included in the future reviewable worked trace. It is a qualification case within the real policy mechanism, not the final whole-ECOSystem policy. If this particular policy difference is not useful to Levi, choose another bounded semantic difference before freeze rather than installing ceremony for its own sake.

The proposed remit and P0 are intentionally narrow for BUILD 6, while later work can earn additional capabilities through explicit extension. They do not constrain Levi's broader external activity or convert every ordinary action into a policy approval.

## Candidate checks and analytical review

Not frozen tests and not executed PASS claims. Each denial must be paired with the corresponding permitted case using the same enforcement path.

| Pressure | Candidate observation |
|---|---|
| Prior authority / forged identity | Accepted root can record exact genesis; an agent's claimed root/H or login without binding cannot. |
| Wrong version | Exact P0/P1 decision succeeds; changed bytes, digest, remit or scope is rejected. |
| Duplicate/replay | Same request returns the original result; changed request identity cannot repeat genesis or fork a predecessor. |
| Concurrency | Two genesis attempts and two successor attempts against one predecessor yield at most one effect; loser gets an explicit current-state conflict or exact replay result. |
| Partial failure | Inject failure after each initialization subact and before pointer update; no partial governance survives. A lawful retry remains possible. |
| Restart | Disconnect before commit, after commit/before response, and while a competing request holds the lock. Reconstruction distinguishes each without a second effect. |
| Stale state / withdrawal | Decision is checked against live locked scope and ordered withdrawals; stale or withdrawn grants cannot enact. Historical replay retrieval remains possible. |
| Checker bypass | Producer/PASS payloads cannot write acceptance or enable an effect. Ordinary roles cannot call internal mutation functions or modify tables directly. |
| Time/order | Causal references and predecessor sequence establish order; timestamp equality/reordering cannot change legitimacy. |
| Unauthorized mutation | Direct table, RPC, role-context forgery and altered wrapper paths fail within the declared trust boundary. Owner/DDL custody remains an explicit limit. |
| Positive succession | Lawful P1 becomes current through P0/H authority and its changed condition affects later decision validation. P0 is retained as historical basis. |
| Re-entry legibility | Fresh operator view shows exact policy, H/remit, decision, bootstrap exhaustion, pending decision/conflict and next permitted operation without prior conversation. |

Analytical failure found and addressed during design: checking exhausted bootstrap before checking for an already committed exact result would incorrectly turn a successful retry into a denial. Result recovery therefore precedes new-effect eligibility. Another: an unlocked “no result” read could race a still-running transaction; absence used for retry requires the same scope lock.

Remaining qualification: authentication/principal binding, exact encoded policy semantics, privilege containment, function/wrapper arrangement, actual concurrency and termination behavior. The document establishes a testable candidate, not their operational proof.

## Prior-art encounter and sources

Canonical OB1 `main` was checked with `git ls-remote` during this pass: `9543c29a3e44a210ce278392b9fac11248997461`, matching the existing complete [recon receipt](../ob1-prior-art.md). The local checkout at that commit was clean. No new upstream changes require a repeat inventory.

* OB1 `schemas/per-agent-identity/schema.sql`, read in full: stable principal identity distinct from rotatable keys is useful. Its broad service-role control over identities/keys is not a suitable human-warrant boundary. Disposition: QUARRY the distinction; do not inherit its authority model.
* OB1 `integrations/agent-memory-api/index.ts`, inspected auth, audit and review implementations: shared-key access, caller review data, separate mutation/review/audit writes solve memory review pressures but do not supply atomic governance or bootstrap. Disposition: REJECT direct reuse for this boundary; retain the prior-art comparison.
* ECOS-build `a5d4fb4f8fcc8162bd593090db4177adfdde0728`, `20260605010000_artifact_v3_human_door.sql`: authenticated-human lookup, explicit reviewer membership, version checks and restricted wrappers are useful patterns. `20260610223000_create_artifact_draft_always.sql`: creation cannot self-promote through actor prose. Disposition: ADAPT behavior with v2's externally grounded genesis; no legacy status ladder/table inheritance.
* BUILD 5A/5B provide transactionally coupled history and exact retained subjects as local evidence. Their native semantics remain unchanged.

Technical design sources: [PostgreSQL 17 locking](https://www.postgresql.org/docs/17/explicit-locking.html) supports scope serialization and requires care around rollback; [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) documents execution privileges and safe definer configuration. [Supabase functions](https://supabase.com/docs/guides/database/functions) and [session documentation](https://supabase.com/docs/guides/auth/sessions) inform the proposed authentication/privilege boundary. These sources explain mechanisms; they supply no ECOS authority. Supabase changelog was retrieved through curl after the web tool rejected its Markdown content type; the recent index was inspected. No implementation/version qualification is claimed.

## Decision and next handle

Recommend this atomic mechanism over staged initialization. Before fixture/transition freeze, obtain explicit H/remit binding and exact encoded P0 acceptance as required by [BUILD_CHECKOUT](../../BUILD_CHECKOUT.md). First finish the local technical qualification of the human acceptance boundary and turn the policy proposal into an exact review package; no production inspection or mutation is commissioned here.

Changing the external authority graph, adding external initialization effects, or needing broader succession semantics would change this recommendation. No evidence currently requires them.

ECO-89 holds this proposal. Existing Shape remains OPEN; no Output Contract, test authority, role assignment, credentials, schema, migration, deployed function or policy is installed by this document.
