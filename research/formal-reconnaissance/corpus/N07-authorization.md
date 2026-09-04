DISPOSITION: EVIDENCE · NEIGHBORHOOD N07 · RECORDS R055–R062

# N07 — Authorization, Policy Succession, Capability, Trust

Primary seam: **S-6 — authority, warrant, bootstrap, rule succession.**

Neighborhood verdict: supplies the vocabulary v2's warrant definition already presupposes
(R055), the demonstration that capability-based systems make `capability ≠ warrant`
concrete rather than aspirational (R060–R061), and — with R042 and R097 — a complete,
implementable answer to H11's four succession questions.

---

### R055 — Abadi, Burrows, Lampson, Plotkin 1993 (access control calculus)
`CITE` M. Abadi, M. Burrows, B. Lampson, G. Plotkin. *A calculus for access control in distributed systems.* ACM TOPLAS 15(4), 706–734, 1993. · **VERIFIED**
`PROBLEM` Decide whether a request should be granted when principals speak for one another, delegate, and act as groups or roles.
`STRUCTURE` A modal logic of principals: `A says s`, the `A ⇒ B` ("speaks for") relation, quoting `A|B`, roles, and handoff rules. Access decisions are derivations in this logic.
`GUARANTEE` A grant is a proof. The reason for a decision is a derivation that can be exhibited and audited.
`LOSS` Everything about *why the principal wanted* the act; the calculus reasons about authority, not motive.
`DETECTOR` No derivation exists for a request that was nonetheless granted — an authority failure.
`REOPEN` Add a credential, or refuse.
`SEAM` S-6
`INTERNAL` Warrant: "the valid basis authorizing a specified operation by a specified actor in a specified scope." `capability ≠ warrant`; `standing ≠ warrant`; `relevance ≠ authority`.
`DELTA` **v2's definition of warrant is almost verbatim a request for this calculus** — operation, actor, scope are exactly the parameters of an ABLP access decision. The delta is that v2 has the definition and no derivation system, so "valid basis" is currently adjudicated by a human reading. ABLP makes warrant a *derivable* object: the basis is a proof term naming which principal said what, on whose behalf, under which delegation.
`TRANSFER` Represent warrant as a derivation in a principal calculus; the derivation is the artifact that a receipt carries; delegation is `speaks for`, not a copied credential.
`PREREQ` Principals as first-class objects. v2 has no Agent primitive — the same gap R045 found from the provenance side. Two independent neighborhoods converging on one missing primitive is strong evidence it is genuinely missing.
`PRESERVE` `capability ≠ warrant`; `standing ≠ warrant`. Holding a key is not a derivation.
`FALSIFIER` A v2 authorization whose basis cannot be expressed as a derivation from statements by identified principals — e.g. one resting on unstated context.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` AUTHORITY, STRUCTURAL
`COST` OBJECT — principals; the derivation artifact.
`RETURN` Yes — a failed derivation is returnable evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT + ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R056 — Lampson, Abadi, Burrows, Wobber 1992 (authentication in distributed systems)
`CITE` B. Lampson, M. Abadi, M. Burrows, E. Wobber. *Authentication in distributed systems: Theory and practice.* ACM TOCS 10(4), 265–310, 1992. · **HIGH**
`PROBLEM` Apply the theory to a real system: channels, certificates, delegation, revocation, and the trusted computing base.
`STRUCTURE` Principals for channels, keys, and roles; certificates as signed statements; explicit TCB.
`GUARANTEE` Each authorization traces to statements by identified principals over authenticated channels.
`LOSS` Anything outside the TCB is not guaranteed, and the TCB must be named.
`DETECTOR` An authorization tracing to an unidentified principal or an unauthenticated channel.
`REOPEN` Extend the certificate chain, or refuse.
`SEAM` S-6
`INTERNAL` BUILD 0's shared bearer key as "the BUILD 0 technical boundary" (ADR-001).
`DELTA` Supplies the concept v2 most needs before BUILD 6 and does not have: an explicitly named **trusted computing base**. BUILD 0's bearer key is a channel authenticator that identifies *no principal at all* — every caller is the same principal. ADR-001 is correct to call it a technical boundary rather than an authority model, and this record makes precise what would have to change: distinct principals, and a named TCB, before any authorization claim is meaningful.
`TRANSFER` Before BUILD 6, name the TCB explicitly and record that the current door authenticates a channel, not an actor.
`PREREQ` Distinguishable principals.
`PRESERVE` `capability ≠ warrant` — key possession authenticates a channel only.
`FALSIFIER` A single-principal deployment where channel authentication genuinely suffices — true for BUILD 0 today, false as soon as delegation exists.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` AUTHORITY, STRUCTURAL
`COST` GOVERNANCE
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R057 — Blaze, Feigenbaum, Lacy 1996 (decentralized trust management)
`CITE` M. Blaze, J. Feigenbaum, J. Lacy. *Decentralized trust management.* IEEE Symposium on Security and Privacy, 164–173, 1996. · **VERIFIED**
`PROBLEM` Separate the question "who is this?" from "is this action permitted?"
`STRUCTURE` PolicyMaker: policies, credentials, and a **compliance checker** that answers "do these credentials authorize this action under this policy?"
`GUARANTEE` Authorization is a checkable question with a general answer procedure, independent of identity resolution.
`LOSS` Semantics of the assertions themselves — the checker verifies compliance, not wisdom.
`DETECTOR` The compliance checker returns "not authorized".
`REOPEN` Present more credentials, or change policy through the policy route.
`SEAM` S-6
`INTERNAL` Human rail as the sole compliance checker. `review_policy` = `human_gate`.
`DELTA` **Establishes that "is this authorized?" is a separable, mechanizable service** — and that separating it from identity is the key design move. v2's authority decisions are currently entangled with a human who is simultaneously identity resolver, compliance checker, and policy author. Splitting the compliance-checking role out is achievable well before a full authority model exists, and it directly reduces the human-memory dependency the enforcement invariant forbids.
`TRANSFER` Introduce a compliance-checking surface distinct from the human authority: it answers whether presented credentials satisfy the active policy, and never decides what the policy should be.
`PREREQ` Policies expressed as checkable assertions rather than prose. This is the real cost.
`PRESERVE` `relevance ≠ authority`; `capability ≠ warrant`. The checker has no authority to change policy.
`FALSIFIER` All v2 policies prove inexpressible as checkable assertions, leaving nothing for a checker to do. Partial expressibility is still a win.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` AUTHORITY
`COST` GOVERNANCE
`RETURN` Yes — a compliance failure returns as evidence.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R058 — Li, Mitchell, Winsborough 2002 (RT framework)
`CITE` N. Li, J. C. Mitchell, W. H. Winsborough. *Design of a role-based trust-management framework.* IEEE Symposium on Security and Privacy, 114–130, 2002. · **HIGH**
`PROBLEM` Combine roles with decentralized attribute-based delegation, with a tractable semantics.
`STRUCTURE` RT credential forms including attribute-based delegation, intersection, and **delegation of authority over an attribute** (as distinct from delegating the attribute).
`GUARANTEE` Well-defined semantics (via Datalog) with decidable evaluation for the core language.
`LOSS` Expressiveness beyond the chosen RT fragment.
`DETECTOR` Required authority not derivable from the credential set.
`REOPEN` Issue a further credential.
`SEAM` S-6
`INTERNAL` "human/warrant authority designation" in the activation chain.
`DELTA` Supplies a distinction v2's activation chain needs and does not draw: **delegating an authority is not the same as delegating the power to delegate it.** "Authority designation" in the Build Contract is one step and hides both. Without the distinction, bootstrap exhaustion is unimplementable, because you cannot tell whether a designated authority may designate further authorities.
`TRANSFER` Designation records state whether the designee receives the authority, the power to re-delegate it, or both. Bootstrap exhaustion is then the removal of a re-delegation power, which is checkable.
`PREREQ` Credentials with delegation depth. Modest.
`PRESERVE` `capability ≠ warrant or authorization`.
`FALSIFIER` A v2 governance model where every designation is inherently re-delegable — that would make exhaustion impossible and is worth discovering early.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` AUTHORITY, STRUCTURAL
`COST` OBJECT
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R059 — Appel & Felten 1999 (proof-carrying authentication)
`CITE` A. Appel, E. Felten. *Proof-carrying authentication.* ACM CCS '99, 52–62. · **HIGH**
`PROBLEM` Different systems use different authorization logics; a verifier should not have to implement them all.
`STRUCTURE` The requester supplies a **proof** in a general higher-order logic that its request is authorized; the verifier runs one small proof checker.
`GUARANTEE` The verifier's trusted base is a single checker, independent of which authorization logic the requester used.
`LOSS` The burden of proof construction moves to the requester.
`DETECTOR` The proof checker rejects.
`REOPEN` Construct a different proof, or the request is genuinely unauthorized.
`SEAM` S-6, S-2
`INTERNAL` Human rail as universal verifier. R018 (proof-carrying code) is the same idea for a different policy class.
`DELTA` **Completes the R018 transfer for the authority surface specifically.** Where R018 says agents ship checkable safety justifications, this says agents ship checkable *authorization* justifications — and that the verifier stays small and fixed even as authorization policies evolve. That property matters disproportionately for v2, where the policy layer is expected to change for many builds while the checker should not.
`TRANSFER` A consequential agent action presents a warrant derivation (R055) that a small fixed checker validates; the human rail adjudicates only what the checker cannot decide.
`PREREQ` A logic in which v2 warrants are expressible, and a checker. Substantial but bounded work.
`PRESERVE` `capability ≠ warrant`; `confidence ≠ standing`.
`FALSIFIER` v2 warrants prove to rest irreducibly on unformalizable human judgment; then the checkable fragment is empty. Partial coverage remains valuable and is the realistic expectation.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` AUTHORITY, STRUCTURAL
`COST` GOVERNANCE + OBJECT
`RETURN` Yes.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R060 — Dennis & Van Horn 1966 (capabilities)
`CITE` J. B. Dennis, E. C. Van Horn. *Programming semantics for multiprogrammed computations.* CACM 9(3), 143–155, 1966. · **HIGH**
`PROBLEM` Control what a computation may access, structurally.
`STRUCTURE` A **capability** is an unforgeable reference that both designates an object and carries the permitted operations. No ambient authority: you can only act on what you hold.
`GUARANTEE` Authority is bounded by possession, structurally rather than by policy lookup.
`LOSS` No global view of who can do what; auditing requires tracking capability flow.
`DETECTOR` An operation performed without a corresponding capability — impossible if the mechanism is sound.
`REOPEN` Grant a capability.
`SEAM` S-6, S-4
`INTERNAL` `capability ≠ warrant or authorization` — a frozen invariant that uses the word in the *opposite* sense.
`DELTA` **A terminology collision worth catching now.** In the capability literature a capability *is* the authorization; in v2, `capability` explicitly is **not** warrant. Both usages are internally coherent, and importing capability-system vocabulary without noting the inversion would corrupt a frozen invariant by lexical drift. The substantive transfer survives the collision: designation and permission travel together in an unforgeable reference, which is a strong model for how an action envelope should be shaped.
`TRANSFER` Shape action envelopes as capability-like: the envelope designates its target and carries its permitted operations, and holding one is the only way to act. Never call it "capability" in v2 prose.
`PREREQ` Unforgeability — cryptographic or database-enforced.
`PRESERVE` `capability ≠ warrant`. The envelope embodies a warrant already granted; it does not create one.
`FALSIFIER` A v2 action that must be performed without holding a designating envelope — e.g. an emergency human override, which would need its own explicit treatment.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` OBJECT
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R061 — Miller, Yee, Shapiro 2003 (capability myths demolished)
`CITE` M. S. Miller, K.-P. Yee, J. Shapiro. *Capability myths demolished.* Technical Report SRL2003-02, Johns Hopkins University, 2003. · **HIGH**
`PROBLEM` Widespread confusion between access control lists and capabilities, and the resulting security failures.
`STRUCTURE` Comparison across three models; analysis of the **confused deputy** problem — a component with authority acting on another's behalf without knowing whose authority it is exercising.
`GUARANTEE` None — an analysis.
`LOSS` n/a.
`DETECTOR` The confused deputy: a component performing an act it is authorized to perform, on behalf of a requester who is not.
`REOPEN` Pass designation and authority together instead of separately.
`SEAM` S-6, S-2
`INTERNAL` v2 agents act on a human's behalf through a shared bearer key.
`DELTA` **Names the exact failure mode v2's current architecture is exposed to.** The BUILD 0 door holds full service-role authority and acts for any caller presenting the bearer key: it is a textbook confused deputy. This is acceptable at BUILD 0, where there is one user and no delegation — but it must not be carried into BUILD 6, and nothing in the repository currently records that it is a known, named, temporary exposure.
`TRANSFER` Record the confused-deputy exposure as an explicit aperture on the door; require that from BUILD 6 the door acts under the requester's authority, not its own.
`PREREQ` Distinguishable requesters (again: the missing Agent primitive).
`PRESERVE` `capability ≠ warrant`.
`FALSIFIER` v2 remains genuinely single-principal forever — true today, and it is exactly the assumption that will silently expire.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` STRUCTURAL, AUTHORITY
`COST` NONE now; OBJECT at BUILD 6.
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R062 — Boella, Pigozzi, van der Torre 2016 (AGM contraction and revision of rules)
`CITE` G. Boella, G. Pigozzi, L. van der Torre. *AGM contraction and revision of rules.* Journal of Logic, Language and Information 25(3), 273–297, 2016. · **MEDIUM**
`PROBLEM` Belief revision assumes propositions; **norms and rules** behave differently under change.
`STRUCTURE` Adaptation of AGM operations to sets of rules, where a rule's removal changes what is derivable rather than what is asserted.
`GUARANTEE` Postulates for rule change analogous to but distinct from propositional revision.
`LOSS` Propositional AGM intuitions that do not survive the move to rules.
`DETECTOR` A rule change whose consequences differ from the propositional prediction.
`REOPEN` Reformulate the change at the rule level.
`SEAM` S-6, S-3
`INTERNAL` "ordinary governed succession"; ECB Interpretation Contract v1.1's explicit ruling that an amendment is "NOT derivation-class" and requires human ratification.
`DELTA` **Confirms a distinction ECB already discovered by hand and pays for repeatedly.** The Interpretation Contract had to rule, case by case, that a contract amendment is a different *kind* of change from a derivation. This literature says that is not an ECB idiosyncrasy but a structural fact: rule change and belief change obey different postulates. The transfer converts a repeated human ruling into a typed distinction.
`TRANSFER` Type governance changes as rule-change or claim-change at the point of proposal; route them differently; never let a claim-change path modify a rule.
`PREREQ` Rules represented as first-class objects distinct from claims. BUILD 6.
`PRESERVE` `runtime reorientation ≠ constitutional redesign` — this is that invariant's formal counterpart.
`FALSIFIER` A v2 change that is genuinely both, requiring a joint operation — likely for a rule *about* rules, which is exactly the self-amendment case (see R087).
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` AUTHORITY, SEMANTIC
`COST` OBJECT
`RETURN` Yes — a returned observation may motivate a rule change, which must not travel the evidence path.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING + SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2
