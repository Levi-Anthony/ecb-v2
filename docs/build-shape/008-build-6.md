STATUS: SHAPE OPEN — 2026-09-06 America/Phoenix; MECHANISM NOT SELECTED
DISPOSITION: PROJECTION
ROLE: BUILD 6 mechanism inquiry and normalized-entry record
AUTHORITY: Explicit human PR #2 merge instruction and post-verification Shape opening; inherits human-closed Sense at 72c0b79

# BUILD 6 Shape — Governance Bootstrap

**Current technical continuation:** [Runtime, session and record boundary](008-build-6-runtime-boundary.md) supplies the concrete proposal and observed hosting/credential constraints. Earlier alternatives below retain their historical scope.

**Current continuation — 2026-09-07:** [Direct WebAuthn approval](008-build-6-webauthn.md) is the user-preferred mechanism under investigation. Email enrollment is superseded. Exact credentials, RP domain, protected root enrollment and governance scope remain to be resolved before executable freeze. No change to accepted H/remit/P0 or Move status follows.

**Later accepted instance binding:** [Human binding record](008-build-6-human-binding.md) records Levi as initial H with the stated remit and acceptance of exact P0. The earlier unbound-instance language below describes Shape entry. Actual authenticated issuer/subject and scope binding remain pending; no mechanism, fixture or implementation is installed by that acceptance.

## Verified entry

BUILD 5B was already human-closed at
`5af44bb1a14cc098f2f3f105d611cff406135cf9`. The human then authorized merging
[PR #2](https://github.com/Levi-Anthony/ecb-v2/pull/2) and opening Shape only after
repository normalization and BUILD 6 ancestry verification.

Before merge, PR #2 was OPEN, draft, CLEAN and MERGEABLE, with that exact head,
base main at `07fcb9f29c75365c07d36226043d3b17cbc769fd`, and both reported checks
successful. It was marked ready and merged with an exact-head guard using a merge
commit, preserving the accepted predecessor commits.

GitHub reports MERGED at `2026-09-06T22:40:23Z`, merge commit
`1ff284164160f74c398bcfe4d2c300b694070b7f`. Fetch and local inspection confirmed:

- normalized main has parents `07fcb9f` and accepted BUILD 5B `5af44bb`;
- normalized main's tree is exactly equal to the accepted `5af44bb` tree;
- BUILD 6 already descended from `5af44bb` through Sense closure `72c0b79`;
- local merge `cf1615b` incorporates normalized main into `build/build-6-sense`;
- both normalized main and `72c0b79` are ancestors of that local merge;
- its tree is exactly equal to the `72c0b79` tree: integration changed ancestry,
  with no conflict resolution, Sense rewrite or implementation change.

The pre-Shape integration condition is satisfied. **BUILD 6 Shape is now OPEN.**
The [closed Sense record](../build-sense/008-build-6.md) remains unchanged as the
historical closure at `72c0b79`; its then-pending integration statement is resolved
by this later verification. No additional Sense work or BUILD 5B reopening is required.

## Inherited authority and instance limits

The settled graph is:

`externally accepted Levi authority → one-genesis M2 grant → human-accepted exact P0 + explicitly bound H/remit → ordered P0 activation / H designation / exhaustion → completed initialization → first P0/H-authorized exact P1 succession`

All three initialization obligations derive from the prior external grant. P0 does
not authorize its own birth or H's first designation. H receives bounded in-system
power through that designation, even if the human explicitly chooses Levi. Ordinary
governance remains disabled until initialization completes. Success makes bootstrap
competence non-exercisable while preserving the reconstructible historical basis.
P1 requires the previously operative P0 and a valid decision by lawful H over exact P1.

Shape may design representation, authentication, validation, constraints and
enforcement for P0, H/remit, authority basis, exhaustion and recovery observations.
It may derive minimum P0 semantics necessary for this episode. It may not autonomously
choose H, invent/enlarge the normative remit, substitute P0, create recovery authority,
or alter M2. Explicit human/root-authority binding of H/remit and acceptance of exact
P0 as grant subject must precede freezing the bootstrap fixture or executable
transition. Technical validation and a draft mechanism do not supply that acceptance.

One bounded initialization need not mean one execution attempt. A technical failure
does not automatically consume the grant irreversibly. The mechanism must distinguish
lawful continuation/recovery of the same authorization, a second initialization,
and unknown outcome requiring stop. Neither absent observations nor credential
possession establishes new or remaining authority.

## Active Shape question

The [mechanism candidate](008-build-6-mechanism-candidate.md) compares atomic and staged initialization and specifies proposed persistence, authentication, recovery and test obligations. It is a reviewable recommendation only; this Shape remains open and no mechanism or human binding is selected by that document.

The [technical Shape](008-build-6-technical-shape.md) develops caller privileges, exact-policy interpretation, commitment ordering and qualification cases under the separately accepted H/remit/P0. Actual account/scope binding remains the next unresolved instance step; no executable fixture is frozen.

Find the smallest durable, reconstructible, non-bypassable mechanism that enforces
the inherited graph under success, failure, concurrency, restart, stale input,
forged identity and replay. Non-bypassability must be evaluated against an explicit
technical trust boundary; it cannot silently claim protection against unlimited
custody power or elevate custody into warrant.

The mechanism inquiry must resolve these concrete design questions without reopening
the authority chain:

| Design question | Required discrimination |
|---|---|
| How are the exact grant subject and human acceptance bound and recovered? | Accepted exact P0/H/remit and original root basis versus candidate text or caller claims. |
| What is the minimum durable initialization record and completion boundary? | A lawful completed initialization versus partial effects, absent observations or a second genesis. |
| Which enforcement surface owns each ordered obligation? | P0 activation, initial designation and exhaustion cannot be bypassed through another write path or enabled ordinary action. |
| What permits continuation after a failure or restart? | Recoverable same authorization and established outcome versus a new initialization or unknown outcome requiring stop. |
| How is the first succession bound to the prior operative basis? | Exact P1 plus a valid P0/H decision versus stale policy, stale remit, forged identity or newer content. |
| Which retained facts explain legitimacy after reconstruction? | Prior basis, scope, exact subjects, decision/order and exhaustion remain recoverable independently of conversation history. |

Compare mechanisms only where they change one of these discriminations. Any selected
persistent structure must be earned by an obligation. Closed BUILD 5B Artifact roles
and BUILD 5A Claim standing Events cannot be silently repurposed as installed policy
or authority lifecycles. Prior-art pins remain evidence with their existing limits.

## Initial adversarial pressure disposition

All pressures below are APPLICABLE to this bounded episode. These are Shape constraints
inherited from the graph and [Build Contract](../build-contract.md#standing-cross-cutting-adversarial-pressure),
not frozen fixtures, executed checks or selected mechanisms. A candidate must map
each constraint to its actual enforcement surface and eventual acceptance observation.

| Pressure | Disposition | Constraint on the candidate |
|---|---|---|
| Duplicate/replay | APPLICABLE | Completed genesis cannot be exercised again; replay cannot produce another succession effect. |
| Concurrency | APPLICABLE | Competing attempts cannot create multiple genesis completions or authorize incompatible successors from the same prior basis. |
| Stale state/basis | APPLICABLE | A stale observation of unused bootstrap or operative P0/H is insufficient to authorize an effect. |
| Partial failure/rollback | APPLICABLE | Partial initialization cannot enable ordinary governance; continuation requires established original authority and outcome. |
| Restart/reconstruction | APPLICABLE | Recover actual grant, exact subjects, lawful decisions and completion/exhaustion; lost projections confer no authority. |
| Wrong identity/role | APPLICABLE | Claimed H, executor or custodian identity cannot replace the accepted external basis or lawful H designation. |
| Wrong version | APPLICABLE | An authorization for exact P0 or P1 cannot cover substituted content or a different normative remit. |
| Basis drift/revocation | APPLICABLE | Changed or withdrawn required basis cannot be silently treated as still operative; rejection cannot create replacement or recovery powers. No new revocation authority is invented. |
| Checker bypass/false PASS | APPLICABLE | Producer/checker claims cannot confer warrant or bypass the governing transition enforcement. |
| Retry/idempotency | APPLICABLE | Distinguish continuation of the same initialization from another initialization and unknown outcome requiring stop; do not equate each attempt with grant consumption. |
| Time/order ambiguity | APPLICABLE | Prior authority and completion ordering must be recoverable without relying on timestamps or arrival order alone. |
| Unauthorized mutation | APPLICABLE | Normal caller write paths cannot alter accepted subjects, authority, operative policy or exhaustion outside the licensed transition. State the custody trust limit. |

The lawful positive path must remain possible within the original grant. Denying
every transition is not an adequate mechanism. Consolidate enforcement where one
mechanism satisfies several obligations; these pressures do not require a universal
policy engine or separate machinery for every row.

## Apertures and exit boundary

AP-04 remains narrowly active for BUILD 6 enforcement-policy representation. It is
unresolved at Shape opening. AP-01 remains conditional: no new controlled standing
vocabulary is earned just by opening governance Shape. AP-03/AP-07 retain their triggers.

The next work is mechanism comparison and bounded specification against these
constraints. Exact H/remit and P0 acceptance remain explicit human/root-authority
instance decisions at the stated freeze boundary. A candidate may be developed into
a concrete reviewable proposal before requesting that binding; no placeholders may
silently become accepted authority.

No mechanism, Output Contract or bootstrap fixture is frozen by this opening.
Implementation and Move remain unreleased. No canonical contact, policy installation,
Actor ontology, UI, Master Key machinery, universal governance engine or BUILD 7+
is authorized. The untracked collaboration research remains untouched.
