DISPOSITION: EVIDENCE · NEIGHBORHOOD N02 · RECORDS R012–R022

# N02 — Formal Semantics, Refinement, Contracts, Verification

Primary seam: **S-2 whether constitutive obligations are actually implemented and enforced**, and **S-1 projection correctness.**

Neighborhood verdict: the highest-yield neighborhood in the operation. It produced the
safety/liveness boundary (R013–R014), which converts v2's enforcement classification from a
vocabulary into a boundary with a theorem behind it, and translation validation +
proof-carrying code (R017–R018), which is the cheapest credible route to receipts that
demonstrate an invariant actually governed execution.

---

### R012 — Abadi & Lamport 1991 (refinement mappings)
`CITE` M. Abadi, L. Lamport. *The existence of refinement mappings.* Theoretical Computer Science 82(2), 253–284, 1991. Earlier version: LICS 1988. · **VERIFIED — corrected during this operation; frequently miscited as TOPLAS.**
`PROBLEM` Prove a low-level specification implements a high-level one.
`STRUCTURE` A refinement mapping f from concrete to abstract states such that every concrete behavior maps to a legal abstract behavior. Completeness requires auxiliary **history** and **prophecy** variables.
`GUARANTEE` Implementation correctness as behavior inclusion, under stated conditions (machine closure, finite invisible nondeterminism, internal continuity).
`LOSS` Internal steps invisible at the abstract level (stuttering).
`DETECTOR` A concrete behavior with no legal abstract image.
`REOPEN` Add history/prophecy variables, or the implementation is genuinely wrong.
`SEAM` S-1
`INTERNAL` Nothing. v2 has no notion of one specification implementing another.
`DELTA` **Supplies the missing shape for H9.** "ECOS mechanism M lawfully implements SIGMA invariant I" becomes: exhibit a mapping from ECOS runtime states to SIGMA states under which every ECOS behavior is a legal SIGMA behavior. The prophecy-variable result matters practically: **a correct implementation can fail to have a refinement mapping** without extra state, so failure to construct one is not immediate proof of miscompilation — a real guard against false-positive audits.
`TRANSFER` Adopt "behavior inclusion under a state mapping" as the definition of lawful operational implementation; adopt stuttering-insensitivity so ECOS may take internal steps invisible to SIGMA.
`PREREQ` Both levels expressed as state machines with defined behaviors. ECOS has this in principle; SIGMA does not yet.
`PRESERVE` `map ≠ mapper`; the refinement mapping is an artifact and must have its own referent.
`FALSIFIER` A SIGMA invariant that cannot be expressed as a property of behaviors (e.g. one about *why* a state was reached rather than what states occur). Several v2 invariants may be of this kind — see QF-B-02.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` OBJECT — the mapping is an artifact.
`RETURN` A refinement-mapping failure is returnable evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R013 — Alpern & Schneider 1985 (defining liveness)
`CITE` B. Alpern, F. B. Schneider. *Defining liveness.* Information Processing Letters 21(4), 181–185, 1985. · **HIGH**
`PROBLEM` Give a precise definition of liveness and relate it to safety.
`STRUCTURE` Safety = "nothing bad happens", violated by a finite prefix. Liveness = "something good eventually happens", violated only by an infinite behavior. **Every property is the intersection of a safety and a liveness property.**
`GUARANTEE` A complete and canonical decomposition of any trace property.
`LOSS` None — this is a classification theorem.
`DETECTOR` For safety, a finite bad prefix. For liveness, no finite witness exists at all.
`REOPEN` n/a.
`SEAM` S-2
`INTERNAL` The four enforcement modes, and the invariant "no consequential transition may depend solely on an agent remembering an instruction."
`DELTA` **This is the operation's central finding, with R094.** v2's enforcement classification says *where* an obligation is enforced. It never says which obligations *can* be enforced there. The safety/liveness decomposition supplies the missing axis: any v2 obligation of the form "*the system will eventually revalidate / will eventually return evidence / will eventually requalify*" is a **liveness** property, has no finite violating prefix, and therefore cannot be caught by any finite-trace mechanism. Several existing v2 obligations are of exactly this form — every Aperture REVALIDATION TRIGGER is a liveness commitment.
`TRANSFER` Classify every consequential obligation as safety, liveness, or a conjunction, **before** assigning it an enforcement mode. Bound each liveness component into a safety property (attach a deadline, a bounded horizon, or a required-by-event) or explicitly assign it to the AUTHORITY/human surface.
`PREREQ` Obligations expressed as trace properties. Cheap: v2 already has events.
`PRESERVE` The enforcement invariant. This transfer *strengthens* it: an unbounded liveness obligation with no deadline **is** an instruction someone must remember.
`FALSIFIER` Show a v2 liveness obligation that a finite-trace mechanism does in fact enforce; that would contradict the theorem and indicate the obligation was misclassified.
`BRANCH` BRANCH_NEUTRAL — requires no architectural branch to be resolved.
`ENFORCE` Determines the assignment; the finding is *about* the enforcement classes.
`COST` NONE — a classification discipline, not a primitive.
`RETURN` Yes: "evidence will be returned" is liveness and needs bounding.
`STATUS` TESTABLE_TRANSFER
`EFFECT` CHALLENGES_EXISTING — the four-mode classification is incomplete without this axis.
`BUILD` SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST
`PRIORITY` 3

### R014 — Lamport 1977 (safety/liveness origin)
`CITE` L. Lamport. *Proving the correctness of multiprocess programs.* IEEE Transactions on Software Engineering SE-3(2), 125–143, 1977. · **HIGH**
`PROBLEM` Distinguish the two kinds of correctness assertion about concurrent programs.
`STRUCTURE` Invariance ("safety") vs. eventuality ("liveness") assertions with different proof methods.
`GUARANTEE` Different proof obligations for different assertion kinds.
`LOSS` n/a.
`DETECTOR` As R013.
`REOPEN` n/a.
`SEAM` S-2
`INTERNAL` As R013.
`DELTA` Supplies the *proof-method* half: invariance is proved inductively over single steps; eventuality requires a well-founded measure or a fairness assumption. Practical consequence for v2: a safety obligation is dischargeable by a per-transition check (a database constraint, a controller guard); a liveness obligation needs either a decreasing measure or an explicit fairness assumption about the human/agent environment — and v2 has never stated a fairness assumption.
`TRANSFER` Any v2 liveness obligation must name the fairness assumption it relies on (e.g. "a human reviews the proposal queue"). Unnamed fairness assumptions are hidden dependencies on someone remembering.
`PREREQ` As R013.
`PRESERVE` The enforcement invariant.
`FALSIFIER` A v2 eventuality obligation discharged with neither a measure nor a fairness assumption.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` AUTHORITY, OBSERVATIONAL
`COST` NONE
`RETURN` Yes.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP — v2 has unnamed fairness assumptions.
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R015 — Pnueli 1977 (temporal logic of programs)
`CITE` A. Pnueli. *The temporal logic of programs.* FOCS 1977, 46–57. · **HIGH**
`PROBLEM` A language for stating time-dependent correctness properties.
`STRUCTURE` Linear temporal logic: always, eventually, until, next over execution sequences.
`GUARANTEE` A precise, checkable statement of what must hold when.
`LOSS` Everything not expressible in the temporal fragment chosen.
`DETECTOR` A trace violating the formula.
`REOPEN` Strengthen the formula or the implementation.
`SEAM` S-2, S-1
`INTERNAL` Aperture records (WHAT/WHY OPEN/CURRENT EFFECT/TRIGGER/ROUTE) are informal temporal statements: "when TRIGGER, then ROUTE."
`DELTA` Provides the notation in which an Aperture's TRIGGER/ROUTE pair becomes machine-checkable rather than prose. Modest but real: `always (trigger → eventually route)` is a formula, and R013 immediately tells you its liveness half needs bounding.
`TRANSFER` Express aperture triggers as temporal formulas over the event log; the eventually-operator's presence is exactly the liveness flag.
`PREREQ` An event log with the vocabulary the formulas quantify over. BUILD 5.
`PRESERVE` `unknown ≠ nonexistent` — LTL over a closed alphabet must not imply that unrecorded events did not occur.
`FALSIFIER` Aperture triggers turn out to be semantic judgments ("material uncertainty arises") not expressible over any event alphabet — likely for several current apertures.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` OBSERVATIONAL
`COST` NONE now; PERSISTENCE at BUILD 5.
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R016 — Leroy 2009 (CompCert)
`CITE` X. Leroy. *Formal verification of a realistic compiler.* Communications of the ACM 52(7), 107–115, 2009. · **VERIFIED**
`PROBLEM` Compilers can silently break correct source programs; verification of the source is then worthless.
`STRUCTURE` Machine-checked **semantic preservation**: for a source program with defined behavior, every target behavior is an admissible source behavior. Proved via simulation diagrams.
`GUARANTEE` Semantic preservation w.r.t. a defined **observation** — the trace of observable events — not literal structural identity.
`LOSS` Everything not in the observation: register allocation, instruction order, timing, intermediate structure.
`DETECTOR` A target behavior with no source counterpart.
`REOPEN` Fix the compiler pass; the proof localizes the failure.
`SEAM` S-1
`INTERNAL` FS-0001's TG-04 (commuting preservation) and TG-03 (normalization stability).
`DELTA` **Directly answers most of H13.** Source semantics = SIGMA obligations; target = ECOS runtime; what must be preserved = the declared observation, which FS-0001 already enumerates (permissions, limits, provenance obligations, revalidation triggers); legitimate implementation freedom = everything else, explicitly including generated IDs, timestamps, and receipt identity. Miscompilation = a runtime behavior outside the source's admissible set. The crucial and easily-missed condition: **preservation holds only for source programs with defined behavior** — the v2 analogue is that projection correctness is only claimable for a SIGMA state that is itself internally consistent.
`TRANSFER` Define the SIGMA→ECOS observation set explicitly (adopt FS-0001's four), then state projection correctness as behavior inclusion modulo that observation, conditioned on SIGMA-state well-formedness.
`PREREQ` Both semantics defined; a proof or checking discipline. Full verification is far out of reach — see R017 for the affordable route.
`PRESERVE` `map ≠ referent`; the compiled envelope is not the invariant.
`FALSIFIER` The declared observation set turns out to be incomplete — an ECOS behavior preserves all four observables yet violates a SIGMA invariant. **This is the single most valuable experiment in the reconnaissance** (FP-001).
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL, OBSERVATIONAL
`COST` NONE to specify.
`RETURN` A preservation failure is first-class returned evidence.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 3

### R017 — Pnueli, Siegel, Singerman 1998 (translation validation)
`CITE` A. Pnueli, M. Siegel, E. Singerman. *Translation validation.* TACAS '98, LNCS 1384, 151–166. · **HIGH**
`PROBLEM` Verifying a compiler is enormously expensive and must be redone when the compiler changes.
`STRUCTURE` Do not verify the compiler. For **each run**, produce a checkable proof that this source and this target agree; a separate validator checks it.
`GUARANTEE` Per-compilation correctness. A validated run is correct even if the compiler is not.
`LOSS` Says nothing about runs not validated; a bug can still exist and be caught per-run rather than prevented.
`DETECTOR` The validator rejects.
`REOPEN` Reject the output and fall back, rather than shipping an unchecked translation.
`SEAM` S-1, S-2
`INTERNAL` ECB Crucible `transform_receipts` — a nine-field record of what a transformation preserved and stripped. Structurally a receipt without a checker.
`DELTA` **The highest-leverage implementation candidate in the operation.** v2 will not have a stable projection compiler for many builds, so R016-style verification is unreachable. Translation validation is reachable *now* and matches what v2 already wants: each compiled envelope carries a witness that the projection preserved its declared obligations, and an independent validator checks the witness. It converts "receipt" from documentation into a **checked artifact**, which is exactly the gap named in REQ-S1.
`TRANSFER` Emit, with every SIGMA→ECOS projection, a validation witness over the declared observation set; make acceptance of the envelope conditional on an independent validator accepting the witness.
`PREREQ` A declared observation set (R016), a witness format, and a validator that does not share the compiler's code path.
`PRESERVE` `map ≠ mapper` — the validator must be a distinct referent from the compiler, or the check is circular. `capability ≠ warrant` — passing validation licenses the projection, not the action.
`FALSIFIER` Build a projection that passes validation while violating an obligation the witness claims to cover; that falsifies the witness format, not the method.
`BRANCH` BRANCH_NEUTRAL — needs no frozen structure.
`ENFORCE` STRUCTURAL (validator gate) + OBSERVATIONAL (the witness is a receipt).
`COST` OBJECT (witness artifact) + EVENT (validation outcome).
`RETURN` A validation failure returns as evidence of projection insufficiency.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R018 — Necula 1997 (proof-carrying code)
`CITE` G. Necula. *Proof-carrying code.* POPL '97, 106–119. · **HIGH**
`PROBLEM` A host must run untrusted code without trusting its producer.
`STRUCTURE` The code ships with a machine-checkable **proof** of the host's safety policy; the host runs a small trusted checker. Trust moves from the producer to the checker.
`GUARANTEE` If the checker accepts, the policy holds — regardless of the producer's intent or competence.
`LOSS` Only the stated policy is guaranteed; nothing else about the code.
`DETECTOR` The checker rejects.
`REOPEN` Producer must supply a better proof or different code.
`SEAM` S-2, S-6, S-1
`INTERNAL` ECB's `human_gate` review policy — a human is the checker. The enforcement invariant forbidding reliance on an agent remembering.
`DELTA` **Directly serves the architecture's deepest structural need.** v2 must accept work produced by agents it cannot trust, and its current answer is a human gate that does not scale and *is* a memory dependency. PCC gives the shape of the alternative: the producing agent must ship a checkable justification, and the small checker — not the agent's reliability — carries the trust. This also answers the last clause of H13: a receipt that carries its own check is precisely a proof-carrying receipt.
`TRANSFER` Consequential agent-produced transitions carry a checkable warrant witness; the governance surface runs a minimal checker; acceptance depends on the check, never on the producer's standing or confidence.
`PREREQ` A policy expressible as a checkable predicate, and a checker far simpler than the producer. Where the policy is a semantic judgment this fails — and that failure is itself the enforcement-class boundary from R013/R094.
`PRESERVE` `confidence ≠ standing`; `capability ≠ warrant`. A proof licenses the specific act, nothing more.
`FALSIFIER` The consequential v2 transitions all turn out to require semantic judgment, leaving no policy fragment mechanically checkable. Partial success is still valuable: the checkable fragment shrinks the human queue.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL, AUTHORITY
`COST` OBJECT (witness) + GOVERNANCE (checker as a designated authority surface).
`RETURN` Yes — check failures return as evidence.
`STATUS` IMPLEMENTATION_CANDIDATE
`EFFECT` SUPPLIES_MECHANISM
`BUILD` ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R019 — Jones 1983 (rely-guarantee)
`CITE` C. B. Jones. *Specification and design of (parallel) programs.* IFIP Congress 1983, 321–332; and *Tentative steps toward a development method for interfering programs*, TOPLAS 5(4), 596–619, 1983. · **MEDIUM** (two closely related 1983 works; the TOPLAS paper is the citable one)
`PROBLEM` Compositional specification of components that interfere with each other.
`STRUCTURE` A component's **guarantee** holds only under a **rely** condition on its environment; composition discharges each component's rely from the others' guarantees.
`GUARANTEE` Sound compositional reasoning under interference.
`LOSS` Behaviors where the rely condition is violated are simply out of scope.
`DETECTOR` An environment step violating the rely condition.
`REOPEN` Weaken the guarantee or strengthen the rely, explicitly.
`SEAM` S-1, S-7
`INTERNAL` Nothing explicit. v2 states invariants unconditionally.
`DELTA` **Exposes a real gap.** Every ECOS guarantee is implicitly conditional on environment behavior — that the human rail responds, that a surface does not mutate state behind the runtime, that Supabase does not lose a row. v2 states no rely conditions anywhere, which means its guarantees are formally unconditional and therefore false. Naming rely conditions is cheap and converts silent assumptions into inspectable ones. This is the same gap R014 finds from the fairness side.
`TRANSFER` Every projected obligation is stated as rely/guarantee; a violated rely condition is a first-class returnable observation, not an outage.
`PREREQ` An explicit environment model, even an informal one.
`PRESERVE` `operational closure ≠ metaphysical closure`.
`FALSIFIER` A v2 guarantee genuinely independent of every environment assumption. BUILD 0's structural constraints come close; nothing above Layer A will.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` NONE
`RETURN` Yes — rely violations are the archetypal return.
`STATUS` TESTABLE_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R020 — Back & von Wright 1998 (refinement calculus)
`CITE` R.-J. Back, J. von Wright. *Refinement Calculus: A Systematic Introduction.* Springer, 1998. · **HIGH**
`PROBLEM` Derive a program from a specification by correctness-preserving steps.
`STRUCTURE` A refinement relation ⊑ on predicate transformers; stepwise refinement; data refinement.
`GUARANTEE` Each step preserves total correctness; the chain is auditable.
`LOSS` Nondeterminism may only be *reduced*, never introduced.
`DETECTOR` A step that introduces behavior the specification forbids.
`REOPEN` Backtrack to the last sound step.
`SEAM` S-1
`INTERNAL` The build sequence 0–10 is itself a stepwise-refinement discipline.
`DELTA` Supplies the one-directional rule v2 has not stated: **refinement may only reduce nondeterminism.** Applied to projection, this says an ECOS mechanism may narrow what SIGMA permits but may never permit something SIGMA left open — the exact shape of FS-0001's under-approximation requirement, now as a general law rather than a per-case condition.
`TRANSFER` "ECOS may resolve a SIGMA-open choice; ECOS may never widen a SIGMA-closed one" as a projection law.
`PREREQ` A refinement order on permitted behaviors — weaker than a Galois connection but still an order.
`PRESERVE` `runtime reorientation ≠ constitutional redesign`.
`FALSIFIER` A legitimate v2 case where ECOS must permit something SIGMA does not — which would be an architecture challenge, not a transfer failure.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` NONE
`RETURN` None directly.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R021 — Meyer 1992 (design by contract)
`CITE` B. Meyer. *Applying "Design by Contract".* IEEE Computer 25(10), 40–51, 1992. · **HIGH**
`PROBLEM` Make component obligations explicit and checkable at the interface.
`STRUCTURE` Preconditions, postconditions, class invariants; obligations and benefits split between caller and supplier.
`GUARANTEE` Violations are attributed to a specific party at a specific boundary.
`LOSS` Anything not stated in the contract.
`DETECTOR` Runtime assertion violation, with blame assignment.
`REOPEN` Fix the guilty side.
`SEAM` S-2
`INTERNAL` Build Unit template (PURPOSE / INVARIANT SERVED / INPUTS / OUTPUT / ENFORCEMENT / FAILURE BEHAVIOR / TEST / NON-GOAL) — already a contract form.
`DELTA` Adds **blame assignment**, which the Build Unit template lacks. When a v2 obligation is violated, nothing currently determines whether the projection, the runtime, or the caller is responsible — and that determination is what makes returned evidence actionable rather than merely alarming.
`TRANSFER` Each projected obligation names the party whose violation it is; returned evidence carries the blame assignment.
`PREREQ` Identifiable parties at each boundary. v2 has these (client, door, runtime, store).
`PRESERVE` `evidence ≠ assertion` — blame is an assertion requiring its own standing.
`FALSIFIER` A v2 violation class where blame cannot be localized even in principle.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, OBSERVATIONAL
`COST` NONE
`RETURN` Yes — blame is part of the return payload.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 1

### R022 — Lynch & Vaandrager 1995 (forward and backward simulations)
`CITE` N. Lynch, F. Vaandrager. *Forward and backward simulations I: Untimed systems.* Information and Computation 121(2), 214–233, 1995. · **HIGH**
`PROBLEM` Organize the zoo of simulation relations used in implementation proofs.
`STRUCTURE` Forward simulation, backward simulation, refinements, history and prophecy relations, and their completeness results.
`GUARANTEE` A taxonomy with known soundness and completeness for each relation kind.
`LOSS` Each relation kind has a known blind spot; none is universally complete alone.
`DETECTOR` No relation of the chosen kind exists.
`REOPEN` Try the dual kind (forward↔backward) before concluding the implementation is wrong.
`SEAM` S-1
`INTERNAL` FS-0001's TG-04 assumes commuting is the right shape.
`DELTA` Corrects a likely v2 error before it is made: **commuting/forward simulation is not the only valid proof shape.** A correct projection may need a backward simulation (when ECOS resolves a choice earlier than SIGMA does). Concluding "miscompilation" from a failed forward check would be a false positive. Together with R012's prophecy result, this is a guardrail on the audit itself.
`TRANSFER` A projection audit must try forward *and* backward relations before declaring failure.
`PREREQ` As R012.
`PRESERVE` `evidence ≠ assertion` — a failed check is evidence of a failed check.
`FALSIFIER` All real v2 projections turn out forward-simulable, making the caution vacuous. Cheap to check; worth knowing.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` OBSERVATIONAL
`COST` NONE
`RETURN` None directly.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2
