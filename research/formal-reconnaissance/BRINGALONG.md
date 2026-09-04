# BRINGALONG — SIGMA→ECOS Formal Reconnaissance

**Paste this entire document.** It is self-contained. You do not need filesystem access to use it.

---

## 0. TRANSPORT HEADER — read before using any claim below

Composed under **Interpretation Contract v1.1** (ECB `interpretation-contract-v1-1`, RATIFIED AND
GOVERNING, ratified by Levi 2026-07-26) and the **Bring-Along** instrument (ECB
`bring-along-core`, DRAFT — not authority, ECO-71).

Assembly mode: **debt-push** (P1, machine door — the sender holds the ledger; you are not being
asked to excavate it). Format: **I4 tiering** under many-item load, superseding I3.

### Defaults for every unit below unless a unit overrides them

| Field | Value |
|---|---|
| ORIGIN | Claude Opus 5, Claude Code remote session, repo `Levi-Anthony/ecb-v2` |
| SOURCE | `research/formal-reconnaissance/` on branch `claude/sigma-ecos-formal-reconnaissance-apwp7s`; draft PR #1; Linear ECO-86 |
| SCOPE | ECB v2 greenfield build, SIGMA→ECOS governed transformation cycle |
| AUTHORITY / STANDING | **SPECIMEN / CANDIDATE. Disposition EVIDENCE. Authority NONE.** Nothing was promoted. |
| VERIFICATION | See §5. 21 of 100 citations web-verified 2026-09-04; 73 canonical-unrechecked; 6 medium |
| DATE | 2026-09-04 |

### ATTESTED — Interpretation Contract §8

**Every unit in this bringalong is ATTESTED.** You cannot verify the sender's primary sources on
your surface.

- **Attesting agent / surface:** Claude Opus 5, Claude Code remote container with repo + ECB MCP + Linear access.
- **Inaccessible source:** the repository directory `research/formal-reconnaissance/` (31 files, ~4,900 lines) and its machine-ingestible `corpus/ledger.jsonl` (147 records).
- **Stable handles:** GitHub `Levi-Anthony/ecb-v2` PR #1; commits `8b96eba`, `c85f466`; Linear ECO-86.
- **Date observed:** 2026-09-04.
- **Branch-cut instruction (required, verbatim):** *If later verification contradicts a claim
  attested here, remove all downstream conclusions that depend on it unless they have acquired
  independent support.*

ATTESTED does not mean false or weak. It means **you have not verified it**. Published literature
cited below *is* independently verifiable on your surface if you have web access — the codings,
counts, and transfer propositions are not.

### What you may and may not do with this

- **May:** reason from it, disagree with it, use it as a premise for provisional work that stays
  visibly conditional and severable, and dissent per Interpretation Contract §12.
- **May not:** ratify any of it. Ratification is Levi's alone (Bring-Along axiom A2: ground is made
  by ratification, not by production — not by "sounds good," not by absence of objection).
- **May not:** treat any item as governing ECB v2. None of it amends an invariant, the build
  contract, an acceptance test, or an ADR.
- **Watch for:** the failure mode this contract exists to prevent — an **I** or **D** unit entering
  a chain under an **R** label. Bands are marked per item.

### Absence discipline

Where this reconnaissance reports "no evidence found," read **"not found under the queries and
surfaces searched"** — never "does not exist." Unsearched literature is an explicit open aperture.
This applies especially to the empty cells in the synthesis matrix.

---

## 1. WHAT THE OPERATION WAS — band R

A bounded external formal-research operation run against the **live** ECB v2 architecture, not
against a migration target. It asked: which mature mathematical, computational, formal, database,
control, provenance, governance or systems frameworks can supply testable semantics, invariants,
proof obligations, failure detectors or implementation machinery for the SIGMA→ECOS cycle.

`SIGMA → operational projection → ECOS runtime → evidence return → qualification`

**Counts (band M, computed from the ledger, not estimated):** 100 coded sources across 14
neighborhoods · 19 transfer contracts · 14 candidate formalisms · 12 rejected analogies · 4
specified formalization probes, **0 executed** · 21 warranted full texts · 2 architecture-change
proposals awaiting governance · 25 open questions.

**Shape of the result (band I):** 44 SHARPEN_CONTRACT against 12 ADD_IMPLEMENTATION_CANDIDATE.
The architecture is strong on distinctions and weak on **discharge** — four of seven build seams
have no frozen test at all. The literature's contribution is failure detectors and proof
obligations for commitments ECB v2 already holds, not new architecture.

---

## 2. TIER 1 — six load-bearing items

Each carries: the finding, why it matters, its band, its falsifier, and the ratification ask.
**Per Bring-Along P4 these are severable — accept some, reject others, without unpicking the rest.**

### T1-1 · The enforcement classification is missing an axis — band **D**

`docs/invariants.md` declares four enforcement modes (STRUCTURAL / SEMANTIC / AUTHORITY /
OBSERVATIONAL) and seven surfaces. It says **where** enforcement happens and never **what a
surface can bear**.

Established results (band R, both web-verified): execution monitors enforce **exactly the safety
properties** (Schneider, *Enforceable security policies*, ACM TISSEC 3(1):30–50, 2000); finite-prefix
monitoring is three-valued and the monitorable class strictly exceeds safety ∪ co-safety (Bauer,
Leucker & Schallhart, ACM TOSEM 20(4):14, 2011). Every property decomposes into a safety and a
liveness part (Alpern & Schneider, IPL 21(4):181–185, 1985 — canonical, not re-checked).

**The consequence (band D):** every Aperture REVALIDATION TRIGGER in ECB v2 is an unbounded
**liveness** commitment. It has no finite violating prefix, so no finite-trace mechanism can ever
catch its violation — which makes it precisely the *"instruction someone must remember"* that ECB
v2's own enforcement invariant forbids. Also: OBSERVATIONAL currently conflates two different
limits — what can be **enforced** (safety) and what can be **detected** (monitorable, larger).

**Falsifier:** exhibit an ECB v2 liveness obligation genuinely enforced by a finite-trace mechanism.

**Ratification ask:** accept that enforcement declarations gain a property-class field
(safety / liveness / conjunction / outside-single-trace) assigned *before* a mode, with liveness
either bounded into safety or assigned to AUTHORITY with a named fairness assumption. Routed as
**ACP-01**. Primitive cost NONE, BRANCH_NEUTRAL.

*This neighborhood was not in the research plan. It was discovered during Shape.*

### T1-2 · Receipts can carry their own check — band **D**

Verifying a SIGMA→ECOS projection *compiler* is unreachable for many builds. Validating each
**run** is reachable now.

Established (band R): translation validation checks each compilation against a per-run witness
rather than verifying the compiler (Pnueli, Siegel & Singerman, TACAS '98 — canonical, not
re-checked); semantic preservation is stated modulo a **declared observation** and only for
well-formed sources (Leroy, CACM 52(7):107–115, 2009 — verified); proof-carrying code moves trust
from the producer to a small fixed checker (Necula, POPL '97 — canonical, not re-checked).

**Consequence (band D):** a projection emits a witness that its declared obligations were
preserved; an **independent** validator — not sharing the compiler's code path — gates acceptance.
This turns "receipt" from documentation into a **checked artifact**, which is the exact gap the
Phase 0 baseline register names. It is also the shape of the answer to how ECB v2 accepts work
from agents it cannot trust without relying on a human gate that does not scale.

**Falsifier:** build a projection that passes validation while violating a covered obligation —
that falsifies the witness format, not the method.

**Ratification ask:** accept as an implementation candidate for BUILD 5–6, prototype-scoped.
Links to Linear ECO-72 (D2E — Doctrine-to-Execution Compiler).

### T1-3 · One named axiom is exactly what `current ≠ newest` forbids — band **D**

Established (band R, all three web-verified): AGM's **Success** postulate states `A ∈ K * A` — the
new input is *always* in the revised belief set, so acceptance is axiomatic (Alchourrón, Gärdenfors
& Makinson, *JSL* 50(2):510–530, 1985). Semi-revision drops Success: consolidation may discard the
input itself (Hansson, *J. Applied Non-Classical Logics* 7:151–175, 1997). Credibility-limited
revision adds an explicit admissibility set and a defined **reject-without-change** outcome
(Hansson, Fermé, Cantwell & Falappa, *JSL* 66(4):1581–1596, 2001).

**Consequence (band D):** classical AGM is BRANCH_CONFLICTING for ECB v2 — not too weak, but built
on the single axiom the architecture exists to refuse. Two further barriers: AGM needs a
deductively closed belief set (ECB v2 has typed records) and its entrenchment representation needs
a **total** preorder (ECB v2's standing is deliberately multi-dimensional). The non-prioritized
family has none of these problems and works over belief *bases*, which is what ECB v2 has.

**And (band I):** the ECB Charter's intake lane — "portables transfer, records re-qualify… a
specimen that earns its level," where the incoming specimen may itself be rejected — **is
semi-revision, independently reinvented.** The value is not novelty; it is that semi-revision comes
with named postulates, so the qualification rule can be *tested* rather than judged case by case.

**Falsifier:** a qualification outcome that violates a semi-revision postulate for a good reason —
which would show the postulate set is wrong for ECB v2, and is genuinely informative.

**Ratification ask:** accept qualification = credibility screening → non-prioritized revision, as
two separately warranted operations, with changing the admissibility criterion routed to governance
and never to the evidence path.

### T1-4 · Two kernel constructions, one free, one limiting — band **D**

**Forward.** Contextual equivalence is the kernel of an observation function (Plotkin, *TCS*
5(3):223–255, 1977 — canonical, **not re-checked**). Since the kernel of any function is an
equivalence relation by construction, defining `x ∼(M,O) y ⟺ Permitted_O(x) = Permitted_O(y)`
makes FS-0001's operation-indexed equivalence rigorous **with no metric, order, lattice or
probability invented** — primitive cost NONE. "Abstraction *a* is adequate for O" becomes: γ(a)
lies inside one ∼(M,O) class.

**Backward.** Two states producing identical output trajectories are indistinguishable to **any**
estimator; unobservability is structural, not a limitation of the observer (Kalman, IFAC 1960 —
canonical, **not re-checked**). So a SIGMA invariant that is not *return-observable* **cannot be
revalidated by runtime evidence at all** — it can only be re-authorized. Predicted partition:
structural invariants (no partial capture) are observable; authority/relevance invariants
(`relevance ≠ authority`, `confidence ≠ standing`) are not, because both sides produce the same
trace.

**Falsifier for both:** `Permitted_O` is not a function — the same state, Master Key and operation
yield different permissions because permission depends on unrecorded context. Then the kernel is
undefined and ∼(M,O) has no rigorous reading. **This is testable on paper today** (see FP-003).

**Ratification ask:** accept the kernel definition of ∼(M,O), and accept that no invariant
classified return-unobservable may carry an evidence-driven revalidation trigger.

*Citation caution: both anchors here are canonical-but-unrechecked. Verify before promoting.*

### T1-5 · The two obvious "keep two things in sync" framings are both incompatible — band **D**

**Lenses.** A well-behaved lens requires **PutGet**: `get(put(v,s)) = v` — the update is
unconditionally reflected (Foster, Greenwald, Moore, Pierce & Schmitt, ACM TOPLAS 29(3):17, 2007 —
verified). That is unconditional acceptance, which qualification forbids. BRANCH_CONFLICTING.

**CRDTs.** Convergence without coordination is purchased precisely by making conflict resolution
**automatic and semantic-free** — a lattice join or last-writer-wins (Shapiro, Preguiça, Baquero &
Zawirski, SSS 2011 — canonical, not re-checked). Last-writer-wins is a direct violation of
`current ≠ newest`. BRANCH_CONFLICTING **for standing**.

**Consequence (band D):** both rejections have the same root — each guarantees *automatic, total*
incorporation of an update, which is the thing ECB v2 exists to refuse. Replacements: a
**consistency relation with a restoration maintainer** (Meertens, *Designing constraint maintainers
for user interaction*, 1998 — verified), which requires only **stability** and admits partial,
non-unique, policy-selected restoration; and a **layer boundary** — CRDT convergence is correct and
valuable *below* standing, for append-only evidence replication, and never above it.

**Two vocabulary hazards.** (a) "Bidirectional" imports a totality commitment ECB v2 rejects and
names at least four inequivalent law sets — say *projection + evidence-bearing return + separate
qualification* instead. (b) "**Capability**" means the **opposite** in the object-capability
literature (where a capability *is* the authorization) to what `capability ≠ warrant` means in ECB
v2. Importing that word would silently invert a frozen invariant.

**Falsifier:** an ECB v2 standing decision safely resolvable by a deterministic merge rule; or a
return path where evidence is legitimately incorporated unconditionally (that would be an invariant
violation, not evidence for lenses).

**Ratification ask:** accept both prohibitions and the layer boundary.

### T1-6 · An aperture may be resting on an expired premise — band **D** · **BRANCH_FORCING**

AP-10 states: *"meaningful partial orders and soundness relations have not been derived from
observed behavior."* The Build Contract freeze line separately freezes "Galois formulations" and
"full projection mathematics."

**The observation (band D):** `ker(Permitted_O)` is an equivalence relation by construction, hence
a **partition**, at zero cost. Blackwell's decision-theoretic ordering of information structures,
specialized to deterministic decision rules, reduces to **partition refinement** (Blackwell, *Ann.
Math. Statist.* 24(2):265–272, 1953 — canonical, **not re-checked**). Partitions form a complete
lattice under refinement. And a Galois connection is just an adjunction between preorders — two
preorders and two monotone maps. So a **behavior-derived** partial order may already be available,
which is precisely what AP-10 says is missing, and precisely the distinction between a *derived*
order and an *invented* one.

**What is NOT being claimed:** that the freeze should be lifted. **Research does not lift a
freeze.** The only question put to governance is whether AP-10's WHY OPEN rests on a premise that
has expired — because an aperture resting on a stale premise is a hidden closure, which is what the
aperture discipline exists to prevent.

**Falsifier:** FP-003. If `Permitted_O` is not a function, no kernel, no partition, no order, and
AP-10's premise stands unchanged. **ACP-02 is blocked on FP-003 and should not be considered before
it runs.**

**Ratification ask:** none yet. This is BRANCH_FORCING and cannot be promoted automatically. It
needs a human decision, after FP-003.

*Citation caution: the anchor here is canonical-but-unrechecked, and this is the most
governance-consequential item in the bringalong. Verify Blackwell before acting.*

---

## 3. TIER 2 — one paragraph each

**TC-014 · The only finding with a deadline.** Retraction semantics (Doyle, *A truth maintenance
system*, *Artificial Intelligence* 12(3):231–272, 1979 — verified) require that a claim record its
**justification at creation**. If a claim is persisted without justification structure, what
happens to it when its supporting evidence is later withdrawn can never be computed. This must be
decided in **BUILD 3's Shape** or the question becomes permanently unanswerable. Correct answer is
neither cascade-delete (destroys evidence) nor leaving the claim standing (unsound), but
recomputing support status — where *unsupported ≠ deleted and ≠ false*.

**TC-012 · The cheapest structural win.** Valid time (when a fact holds) and transaction time (when
it was recorded) are independent, queryable dimensions. A policy governs an act only if its
valid-time interval contains the act **and** its transaction-time precedes the act's record. That
turns backdating from an oversight requiring vigilance into a **schema constraint violation** —
moving a governance obligation from human memory into structure, which is what the enforcement
invariant demands. Pairs with tamper-evident history trees so log immutability becomes falsifiable
from outside rather than asserted from inside.

**TC-011 · Provenance composes — but only positively.** Provenance forms a commutative semiring:
join multiplies (joint use), union adds (alternative derivations); the polynomial form is most
general and everything else is a homomorphic image (Green, Karvounarakis & Tannen, PODS '07 —
verified). **Critical caveat:** the framework is defined for **positive** relational algebra;
negation is delicate and non-canonical. ECB v2's `unknown ≠ nonexistent` sits exactly in that gap.
Adopting semirings without the caveat produces a system that treats *absence of provenance as
provenance of absence*. Absence must be an explicit typed observation — "searched, not found, at
time t, over scope S."

**TC-019 · A missing primitive, found twice.** ECB v2's five Layer B primitives (Referent, Claim,
Evidence Link, Event, Artifact) contain no **actor** — yet its own definition of warrant is "the
valid basis authorizing a specified operation by a specified **actor** in a specified scope." Two
independent neighborhoods (provenance; authorization) converge on the same gap, which is evidence
it is real rather than a framing artifact. **Do not act before BUILD 6** — structure-is-earned
governs and BUILD 0–5 do not need it. Also unrecorded: the current door holds full service-role
authority and acts for any bearer-key holder — a textbook **confused deputy**, harmless at BUILD 0
with one principal, and an assumption that will expire quietly.

**TC-015 · The soundness condition the Master Key triad lacks.** Recursive feasibility: if a
feasible plan exists now, one must exist at the next step. Translated — **a Move that closes
locally must not destroy the evidence, authority or state required to satisfy its own reopening
trigger.** Without this an Aperture can be recorded, triggerable in principle, and unreopenable in
fact. Needs no order, metric or optimization; only feasibility.

**TC-009 · Projection correctness has a mature form.** An institution's satisfaction condition —
truth invariant under change of notation (Goguen & Burstall, *JACM* 39(1):95–146, 1992 — verified) —
gives: an ECOS state satisfies the projected invariant **iff** its SIGMA reduct satisfies the source
invariant. A counterexample to the "iff" **is** the semantic-corruption detector. It needs only a
signature morphism with a reduct — far less than "ECOS is a functor," which fails because ECB v2 has
objects in abundance and no defined morphisms.

**Four probes, none executed.** FP-001 (is FS-0001's four-observable set sufficient?), FP-002 (can
SIGMA and ECOS state a shared consistency relation?), **FP-003 (is `Permitted_O` a function?)**,
FP-004 (which invariants are return-observable?). FP-003 is executable on paper today against
ADR-001, ADR-002 and the AP-09 closure, and gates the largest downstream set at the lowest cost.

**What was rejected beyond T1-5.** Information bottleneck and rate-distortion (need an invented
probability distribution, and for the latter a distortion measure = a utility function — the
inventions the analogy-admission rule forbids); conformal geometry (needs a metric on constitutive
meaning that does not exist — and the *one* real metric ECB v2 has, 384-d `gte-small` cosine, is
where treating it as a meaning metric would violate four frozen invariants); ECOS as a category (no
morphisms defined); Conant–Ashby as justification for the self-model (assumes optimality and
determinism, neither of which holds — use causal-connection reflection instead); Beer's VSM (yields
no falsifier).

---

## 4. TIER 3 — one-line glossary

- **SIGMA / ECOS** — constitutive meaning layer / operational execution layer of the ECB v2 build.
- **S-1…S-7** — the seven authorized research seams: projection correctness, enforcement boundary, evidence return, referential identity, bounded closure, rule succession, recursion/propagation.
- **R001–R100** — coded source records. **TC-001…019** transfer contracts. **CF-01…14** candidate formalisms. **NR-01…12** rejected analogies. **FP-001…004** probes. **QF-*** open questions. **ACP-01/02** architecture-change proposals.
- **Band R / M / I / D** — Retrieved / Mechanical / Interpretation / Derivation, per Interpretation Contract v1.1 §2.
- **ATTESTED** — sender accessed it; receiver cannot verify it on this surface. Orthogonal to band.
- **BRANCH_NEUTRAL / _COMPATIBLE / _DEPENDENT / _FORCING / _CONFLICTING** — whether a transfer depends on, forces, or contradicts resolution of an open architectural branch.
- **∼(M,O)** — operation-indexed operational equivalence under Master Key M for operation O.
- **γ(a)** — concretization: the set of concrete states an abstraction still admits.
- **Aperture** — an explicitly preserved non-closure with WHAT / WHY OPEN / CURRENT EFFECT / TRIGGER / ROUTE.
- **Master Key** — locally governing discriminator bounding present relevance; cannot manufacture truth, standing, warrant or authority.

---

## 5. LIMITS — carry these with every claim above

1. **No probe was executed.** Every probe-dependent standing is provisional on exactly that.
2. **21 of 100 citations were web-verified** on 2026-09-04; 73 are canonical-but-unrechecked; 6 are
   medium-confidence. One verification produced a correction — *The Existence of Refinement
   Mappings* is **TCS 82(2):253–284, 1991**, not TOPLAS as it is frequently miscited — which is
   direct evidence the unverified remainder contains further errors. No claim rests on a
   medium-confidence citation alone. **T1-4 and T1-6 rest on canonical-but-unrechecked anchors and
   T1-6 is the most governance-consequential item here.**
3. **Five of fourteen neighborhoods produced no rejected analogy**, and two of those were shaped
   around findings the operation had already made — so their uniformly positive yield is partly a
   selection effect and should be discounted.
4. **No systematic-review completeness is claimed.** Unsearched literature is an explicit aperture.
5. **Nothing is promoted.** No invariant, build-contract clause, acceptance test or ADR was
   amended. The only non-additive repository change was a single routing row in `START_HERE.md`
   (disposition PROJECTION).

---

## 6. CLOSING RECAP

The reconnaissance did not find ECB v2 a new architecture, and did not look for one. It found that
the architecture's commitments are unusually well drawn and unusually **undischarged**: four of
seven seams have no frozen test, several obligations are assigned to surfaces that provably cannot
bear them, and at least one open aperture may be resting on a premise that has since expired.

Six items are handed back for per-item ratification (T1-1 … T1-6). Two are routed to governance and
neither is adopted (ACP-01, ACP-02 — the latter blocked on FP-003). One has a deadline (TC-014, at
BUILD 3). One is cheap and gates everything else (FP-003, executable on paper today).

**You may reason from all of it. You may ratify none of it.** Detection is the operator's;
articulation was the agent's; ratification is Levi's.

*END OF BRINGALONG*
