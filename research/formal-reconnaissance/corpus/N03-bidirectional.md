DISPOSITION: EVIDENCE · NEIGHBORHOOD N03 · RECORDS R023–R030

# N03 — Bidirectional Transformation, Lenses, View-Update

Primary seam: **S-1 / S-3 — SIGMA→ECOS projection versus asymmetric ECOS→SIGMA evidence return.**

Neighborhood verdict: **the most valuable negative result in the operation.** The
architecture is *not* a bidirectional transformation in the technical sense, and the
classical lens laws are incompatible with `current ≠ newest`. H8's own alternative reading
— projection + evidence-bearing return + separate qualification — is the correct one, and
this neighborhood establishes it by exhibiting the exact law that fails. Two records
(R026, R028) nonetheless supply real machinery once the lens framing is dropped.

---

### R023 — Foster, Greenwald, Moore, Pierce, Schmitt 2007 (lenses)
`CITE` J. N. Foster, M. B. Greenwald, J. T. Moore, B. C. Pierce, A. Schmitt. *Combinators for bidirectional tree transformations: A linguistic approach to the view-update problem.* TOPLAS 29(3), 17, 2007. · **VERIFIED**
`PROBLEM` Propagate an edit made to a view back to the source that generated it.
`STRUCTURE` A lens is a pair `get : S → V` and `put : V × S → S` satisfying well-behavedness: **GetPut** `put(get(s), s) = s` and **PutGet** `get(put(v, s)) = v`.
`GUARANTEE` Round-tripping. Edits to the view are faithfully and totally reflected in the source.
`LOSS` `get` may discard source detail; `put` restores it from the original source argument.
`DETECTOR` A law violation — a round trip that does not return what was put.
`REOPEN` Restrict the lens's domain, or weaken to a quasi-lens.
`SEAM` S-1, S-3
`INTERNAL` The SIGMA→ECOS→SIGMA cycle; "return is not overwrite"; qualification before standing change.
`DELTA` **PutGet is exactly the law the architecture forbids.** PutGet requires that what is put into the source is fully readable back out of the view — i.e. **the update is unconditionally accepted**. ECB v2 requires the opposite: returned evidence is qualified, may be rejected, may be accepted only in part, and may leave standing unchanged. A well-behaved lens therefore cannot model the return path without deleting qualification.
`TRANSFER` **None as stated.** The transfer proposition is negative and load-bearing: do not adopt lens laws, and do not describe the cycle as bidirectional in v2 documents, because the phrase imports a totality commitment the architecture rejects.
`PREREQ` Total `put` accepted without adjudication — absent by design.
`PRESERVE` `evidence ≠ assertion`; `confidence ≠ standing`; `current ≠ newest`.
`FALSIFIER` Exhibit a v2 return path where returned evidence is unconditionally incorporated. If one exists it is an invariant violation, not a lens.
`BRANCH` BRANCH_CONFLICTING
`ENFORCE` —
`COST` NONE
`RETURN` Decisive: settles that return is not `put`.
`STATUS` NO_TRANSFER
`EFFECT` CHALLENGES_EXISTING — challenges the *analogy*, not the architecture.
`BUILD` SHARPEN_CONTRACT (by prohibition)
`PRIORITY` 2

### R024 — Bancilhon & Spyratos 1981 (constant complement)
`CITE` F. Bancilhon, N. Spyratos. *Update semantics of relational views.* ACM TODS 6(4), 557–575, 1981. · **HIGH**
`PROBLEM` Which view updates have a unique, well-defined translation to the base?
`STRUCTURE` A view's **complement** captures what the view discards; an update is translatable iff it holds the complement constant.
`GUARANTEE` Uniqueness of the translation, given a chosen complement.
`LOSS` Updates that would disturb the complement are simply rejected as untranslatable.
`DETECTOR` The update would change the complement.
`REOPEN` Choose a different complement — a design decision with consequences, not a fact.
`SEAM` S-3
`INTERNAL` Master Key collapse (what the projection discards) and Aperture (what is preserved as excluded).
`DELTA` Strong conceptual hit: **the Aperture is the complement.** The formal insight that transfers is the *rejection* behavior — the theory's answer to an untranslatable update is to refuse it, not to guess. That is exactly the posture v2 wants for unqualified returned evidence, and it is a mature result rather than a preference.
`TRANSFER` Returned evidence that would alter what the projection deliberately excluded is **not** automatically incorporable; refusal is the principled default, and the aperture record names what is being disturbed.
`PREREQ` An explicit complement — v2's apertures are informal and incomplete, so the complement is only partially known.
`PRESERVE` `omission ≠ irrelevance`.
`FALSIFIER` A v2 return that must be incorporated even though it disturbs an aperture; that would show refusal is the wrong default.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` SEMANTIC, AUTHORITY
`COST` NONE
`RETURN` Yes — supplies the default disposition for out-of-scope returns.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R025 — Dayal & Bernstein 1982 (correct view update translation)
`CITE` U. Dayal, P. A. Bernstein. *On the correct translation of update operations on relational views.* ACM TODS 8(3), 381–416, 1982. · **MEDIUM** (widely cited as 1982; the TODS issue is dated 1982–83)
`PROBLEM` Characterize correct translations of view updates.
`STRUCTURE` Correctness conditions on translation procedures; conditions under which no correct translation exists.
`GUARANTEE` Where a correct translation exists, it is characterized; where none does, that is proved.
`LOSS` Untranslatable updates.
`DETECTOR` The correctness conditions fail.
`REOPEN` Redesign the view.
`SEAM` S-3
`INTERNAL` As R024.
`DELTA` Adds the impossibility half: for some views **no** correct update translation exists at all. Applied to v2: there will be returned observations that cannot be translated into any standing change without corrupting something — and the architecture currently has no vocabulary for "this evidence is real, relevant, and untranslatable."
`TRANSFER` Add an explicit qualification outcome meaning *accepted as evidence, untranslatable into standing* — distinct from rejected and from deferred.
`PREREQ` A qualification outcome vocabulary. AP-01 governs; this is an input to it.
`PRESERVE` `truth ≠ relevance`; `relevance ≠ authority`. Untranslatable is not false.
`FALSIFIER` Every real returned observation proves translatable, making the extra outcome dead vocabulary.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` SEMANTIC
`COST` NONE now; feeds AP-01's enum.
`RETURN` Yes — a new return disposition.
`STATUS` CONDITIONAL_TRANSFER
`EFFECT` EXPOSES_GAP
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R026 — Meertens 1998 (constraint maintainers)
`CITE` L. Meertens. *Designing constraint maintainers for user interaction.* Manuscript, CWI/Kestrel, 1998. · **VERIFIED**
`PROBLEM` Keep two related structures consistent when either may change, without privileging a direction.
`STRUCTURE` A **consistency relation** R ⊆ A × B plus maintainers that restore R after a change on either side; **stability** (do nothing if already consistent) rather than round-trip identity.
`GUARANTEE` Consistency restoration and stability. Notably **not** the lens laws.
`LOSS` A unique result; several restorations may be admissible.
`DETECTOR` R does not hold after restoration.
`REOPEN` Choose among admissible restorations by an explicit policy.
`SEAM` S-1, S-3
`INTERNAL` The SIGMA↔ECOS relation; ECO-46's stamp-and-surface, which restores *legibility* of inconsistency rather than consistency itself.
`DELTA` **This is the correct formal home for the cycle, in place of lenses.** A consistency relation with a restoration policy accommodates everything lenses forbid: restoration may be partial, may be non-unique, may be policy-selected, and — critically — **stability is the only identity-like law required**, which is compatible with qualification. It also validates ECO-46's design: surfacing a superseded artifact with a successor pointer is a legitimate maintainer that restores legibility without asserting the new content governs.
`TRANSFER` Model SIGMA↔ECOS as a consistency relation R with (a) a projection maintainer SIGMA→ECOS, (b) a return maintainer ECOS→SIGMA whose output is a *qualification proposal*, not a state change, and (c) stability: a consistent pair is left alone.
`PREREQ` R stated explicitly — currently implicit everywhere in v2.
`PRESERVE` "Return is not overwrite." The return maintainer proposes; qualification disposes.
`FALSIFIER` A v2 seam where consistency cannot be stated as a relation because the two sides share no common vocabulary — plausible for constitutive meaning vs. runtime state, and the reason FP-002 exists.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` SEMANTIC, AUTHORITY
`COST` OBJECT — the consistency relation is an artifact.
`RETURN` Reshapes it: return produces proposals, matching ECB's existing `propose_artifact_patch` lifecycle.
`STATUS` TESTABLE_TRANSFER
`EFFECT` SUPPLIES_MECHANISM
`BUILD` SHARPEN_CONTRACT + ADD_IMPLEMENTATION_CANDIDATE
`PRIORITY` 3

### R027 — Hofmann, Pierce, Wagner 2011 (symmetric lenses)
`CITE` M. Hofmann, B. Pierce, D. Wagner. *Symmetric lenses.* POPL '11, 371–384. · **HIGH**
`PROBLEM` Neither side is a view of the other; both hold information the other lacks.
`STRUCTURE` A shared **complement** carrying what neither side determines; laws weakened accordingly; symmetric lenses compose.
`GUARANTEE` Composition and round-tripping modulo the complement.
`LOSS` Information in the complement is not recoverable from either side alone.
`DETECTOR` Weakened law violation.
`REOPEN` Enlarge the complement.
`SEAM` S-1, S-3
`INTERNAL` SIGMA holds constitutive meaning ECOS lacks; ECOS holds runtime state SIGMA lacks.
`DELTA` The symmetry diagnosis is right — SIGMA and ECOS are genuinely not view-of relations — but symmetric lenses still require *round-tripping modulo complement*, which still presumes acceptance. Useful mainly as confirmation that the asymmetry is structural rather than incidental, and that the complement (aperture) is a first-class object rather than a leftover.
`TRANSFER` Weak: the complement should be a named artifact, which R024 already establishes more directly.
`PREREQ` Round-trip acceptance — still absent.
`PRESERVE` As R023.
`FALSIFIER` As R023.
`BRANCH` BRANCH_CONFLICTING (laws) / BRANCH_COMPATIBLE (complement-as-object)
`ENFORCE` —
`COST` NONE
`RETURN` Confirms asymmetry is structural.
`STATUS` METAPHOR_ONLY
`EFFECT` ALREADY_PRESENT
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 1

### R028 — Diskin, Xiong, Czarnecki 2011 (delta lenses)
`CITE` Z. Diskin, Y. Xiong, K. Czarnecki. *From state- to delta-based bidirectional model transformations: the asymmetric case.* Journal of Object Technology 10, 6:1–25, 2011. · **HIGH**
`PROBLEM` State-based BX cannot tell *what changed*, only what the states are, so it must guess the update.
`STRUCTURE` Propagate **deltas** (explicit changes with identity of what changed) rather than states; laws are stated over delta composition.
`GUARANTEE` Update propagation that respects the actual change, not a diff inferred after the fact.
`LOSS` Requires the change to be observable as a delta.
`DETECTOR` Delta composition laws fail.
`REOPEN` Recover the delta or refuse propagation.
`SEAM` S-3, S-4
`INTERNAL` Event as "immutable record of a consequential transformation"; "Correction creates a successor event."
`DELTA` **Strong and immediately applicable.** v2 already committed to deltas without naming the commitment: Events are deltas, and correction-by-successor-event is delta composition. The delta-lens literature supplies the reason this is the *right* choice — state-based reconciliation must infer intent and gets it wrong — which retroactively justifies a v2 decision that currently rests on preference. It also warns that delta propagation requires **stable identity of the changed element across the change**, which is precisely REQ-S4's referent requirement, making S-3 and S-4 formally interdependent.
`TRANSFER` Evidence return propagates deltas with referent identity, never post-hoc state diffs. Any return path that reconstructs a change by comparing snapshots is unsound.
`PREREQ` Referent identity stable across the change (BUILD 2) and events carrying what changed (BUILD 5).
`PRESERVE` `identity ≠ description`; a delta identifies its referent, it does not redescribe it.
`FALSIFIER` A v2 return path where snapshot-diffing provably recovers the true change — possible only where identity is total and changes are non-overlapping.
`BRANCH` BRANCH_COMPATIBLE
`ENFORCE` STRUCTURAL
`COST` NONE beyond already-planned Events.
`RETURN` Yes — fixes the return payload shape as delta + referent.
`STATUS` TESTABLE_TRANSFER
`EFFECT` VERIFY_EXISTING + SHARPENS_EXISTING
`BUILD` SHARPEN_CONTRACT
`PRIORITY` 2

### R029 — Stevens 2010 (BX semantic issues)
`CITE` P. Stevens. *Bidirectional model transformations in QVT: semantic issues and open questions.* Software and Systems Modeling 9(1), 7–20, 2010. · **HIGH**
`PROBLEM` Real BX standards are semantically underspecified; practitioners assume properties that do not hold.
`STRUCTURE` Analysis of correctness, hippocraticness (do no harm when already consistent), and undefinedness in QVT-R.
`GUARANTEE` None — this is a critique.
`LOSS` n/a.
`DETECTOR` Ambiguity in the standard produces divergent tool behavior.
`REOPEN` Specify the missing semantics.
`SEAM` S-1, S-3
`INTERNAL` The v2 risk of adopting "bidirectional" as a description.
`DELTA` **Guardrail record.** Documents that a large industrial community adopted bidirectionality as a framing and then discovered its obligations were unmet and its tools divergent. That is the concrete failure mode this reconnaissance exists to prevent, and it is the reason R023's negative result is worth recording explicitly rather than passing over.
`TRANSFER` None. Retained as disconfirming evidence and as a caution about vocabulary import.
`PREREQ` n/a.
`PRESERVE` §12 analogy admission rule.
`FALSIFIER` n/a.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER
`EFFECT` CHALLENGES_EXISTING (the analogy)
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 2

### R030 — Czarnecki, Foster, Hu, Lämmel, Schürr, Terwilliger 2009 (BX cross-discipline)
`CITE` K. Czarnecki, J. N. Foster, Z. Hu, R. Lämmel, A. Schürr, J. Terwilliger. *Bidirectional transformations: A cross-discipline perspective.* ICMT 2009, LNCS 5563, 260–283. · **HIGH**
`PROBLEM` Reconcile BX notions across databases, programming languages, and model-driven engineering.
`STRUCTURE` A comparative map of BX formulations and their differing law sets.
`GUARANTEE` None — a survey.
`LOSS` n/a.
`DETECTOR` n/a.
`REOPEN` n/a.
`SEAM` S-1, S-3
`INTERNAL` —
`DELTA` Efficient screening instrument: it demonstrates that "bidirectional" names at least four inequivalent law sets, so claiming v2 "is bidirectional" would be uninformative even if a law set fitted. Confirms saturation of the neighborhood — records after this one restated already-coded law variants.
`TRANSFER` None.
`PREREQ` n/a.
`PRESERVE` —
`FALSIFIER` n/a.
`BRANCH` BRANCH_NEUTRAL
`ENFORCE` —
`COST` NONE
`RETURN` None.
`STATUS` NO_TRANSFER
`EFFECT` ALREADY_PRESENT
`BUILD` NO_BUILD_EFFECT
`PRIORITY` 1
