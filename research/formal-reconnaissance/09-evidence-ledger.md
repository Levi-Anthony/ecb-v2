STATUS: COMPLETE
DISPOSITION: EVIDENCE
ROLE: Output I — evidence and provenance ledger
AUTHORITY: None

# Evidence Ledger

> **Plain-English note.** This is a traceability table. Each row follows one finding from
> *"what ECB v2 requires"* through *"which papers"* and *"what they established"* to *"what it means
> for the build."* It exists so nothing here has to be taken on trust — you can walk any claim back
> to its source.
>
> **You do not need to read this.** It is for auditing and for machines. The same content in
> machine-readable form is `corpus/ledger.jsonl`. Terms are decoded in
> [`GLOSSARY.md`](GLOSSARY.md).

Every consequential finding is traceable along the §15 spine:

    BASELINE REQUIREMENT → RESEARCH APERTURE → SOURCE(S) → ESTABLISHED SOURCE CLAIM
      → TRANSFER CONTRACT → FORMALIZATION PROBE → RESULT → CURRENT STANDING
      → BUILD CONSEQUENCE

The machine-ingestible form is `corpus/ledger.jsonl` — one JSON object per line, no prose
reasoning required to consume it. This file is its human-readable projection.

## Research apertures

| ID | Aperture |
|---|---|
| RQ-01 | What makes a SIGMA→ECOS projection *correct* rather than merely documented? |
| RQ-02 | Which obligations can a given enforcement surface actually bear? |
| RQ-03 | How does returned evidence change standing without "newest wins"? |
| RQ-04 | Is SIGMA↔ECOS a bidirectional transformation? |
| RQ-05 | Can local closure be lawful and sound without the frozen lattice? |
| RQ-06 | How is a rule succession tested for activity, atomicity and non-retroactivity? |
| RQ-07 | What preserves referential identity without manufacturing truth or authority? |
| RQ-08 | How does evidence compose, and how is *absence* of evidence represented? |
| RQ-09 | What does propagation across surfaces require, and what may it never automate? |

## Spine

| Req | Aperture | Sources | Established claim | TC | Probe | Result | Standing | Build |
|---|---|---|---|---|---|---|---|---|
| REQ-S2 | RQ-02 | R013, R014, R094 | EM enforces exactly the safety properties; every property = safety ∧ liveness | TC-001 | — | Enforcement classification lacks the axis that says what each surface can bear | TESTABLE_TRANSFER | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST → **ACP-01** |
| REQ-S2 | RQ-02 | R096, R054 | Finite-prefix monitoring is three-valued; monitorable ⊋ safety ∪ co-safety | TC-002 | — | A two-valued observational surface collapses `unknown ≠ nonexistent` | TESTABLE_TRANSFER | ADD_ACCEPTANCE_TEST |
| REQ-S1 | RQ-01 | R016, R017, R018 | Per-run validation replaces per-compiler verification; preservation is modulo a declared observation | TC-003 | FP-001 | Receipts can become checked artifacts rather than documentation | IMPLEMENTATION_CANDIDATE | ADD_IMPLEMENTATION_CANDIDATE |
| REQ-S2, S6 | RQ-06 | R018, R059, R055 | Trust moves from producer to a small fixed checker | TC-004 | — | The human gate is a memory dependency the enforcement invariant forbids | IMPLEMENTATION_CANDIDATE | ADD_IMPLEMENTATION_CANDIDATE |
| REQ-S5 | RQ-05 | R031, R078, R032, R035 | Contextual equivalence is the kernel of an observation function | TC-005 | FP-003 | ∼(M,O) becomes rigorous at **zero primitive cost** | TESTABLE_TRANSFER | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| REQ-S1, S3 | RQ-04 | R026 (+), R023/R027/R029 (−) | Lens PutGet forces unconditional acceptance; constraint maintainers require only stability | TC-006 | FP-002 | **H8 answered: not a bidirectional transformation** | TESTABLE_TRANSFER (positive) / NO_TRANSFER (lenses) | SHARPEN_CONTRACT |
| REQ-S3 | RQ-03 | R049, R050, R051 (+), R046 (−) | AGM Success axiomatizes acceptance; non-prioritized revision drops it | TC-007 | — | **v2 independently reinvented semi-revision** (ECB intake lane) | TESTABLE_TRANSFER | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| REQ-S3 | RQ-03 | R048 | Update and revision satisfy different postulate sets | TC-008 | — | v2's return list conflates correction with world-change | TESTABLE_TRANSFER | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| REQ-S1 | RQ-01 | R071, R072 | Satisfaction condition: truth invariant under change of notation | TC-009 | FP-001 | **H4 answered**; a failed satisfaction condition is the corruption detector | TESTABLE_TRANSFER | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| REQ-S1 | RQ-01 | R012, R020, R022 | Behavior inclusion under a state mapping; refinement only reduces nondeterminism | TC-010 | — | **H9 answered**; forward-only audits can produce false negatives | TESTABLE_TRANSFER | SHARPEN_CONTRACT |
| REQ-S4 | RQ-08 | R038, R040, R041, R054 | Provenance is a commutative semiring over the **positive** fragment only | TC-011 | — | Adopting semirings without the negation caveat treats absence of provenance as provenance of absence | TESTABLE_TRANSFER | ADD_IMPLEMENTATION_CANDIDATE + ADD_ACCEPTANCE_TEST |
| REQ-S6 | RQ-06 | R042, R043 | Valid time and transaction time are independent and jointly checkable | TC-012 | — | **Backdating becomes a constraint violation** — the cheapest structural win found | IMPLEMENTATION_CANDIDATE | ADD_IMPLEMENTATION_CANDIDATE |
| REQ-S6, S4 | RQ-06 | R097, R098, R086 | History trees detect retroactive alteration by a malicious logger | TC-013 | — | Immutability by convention is unfalsifiable from inside the system | IMPLEMENTATION_CANDIDATE | ADD_IMPLEMENTATION_CANDIDATE |
| REQ-S3 | RQ-03 | R052, R053 | A belief is *in* only while a justification is; retraction propagates | TC-014 | — | **Answers U-03**, the baseline's unanswered live question | IMPLEMENTATION_CANDIDATE | ADD_IMPLEMENTATION_CANDIDATE — **prerequisite expires at BUILD 3** |
| REQ-S5 | RQ-05 | R065, R068, R003 | Recursive feasibility; controlled-invariant sets | TC-015 | — | Supplies the soundness condition the Master Key triad lacks | TESTABLE_TRANSFER | ADD_ACCEPTANCE_TEST; continuation set BLOCK_PENDING_PROBE |
| REQ-S3, S2 | RQ-02, RQ-03 | R063, R079, R082 | Unobservable states are indistinguishable to **any** estimator | TC-016 | FP-004 | An unobservable invariant's evidence-driven trigger can never fire | TESTABLE_TRANSFER | SHARPEN_CONTRACT + ADD_ACCEPTANCE_TEST |
| REQ-S5 | RQ-05 | R004, R005, R006, R032 | Spurious counterexamples drive minimal refinement; no lattice required | TC-017 | — | The CEGAR **loop** is adoptable while the Galois **algebra** stays frozen | TESTABLE_TRANSFER | ADD_ACCEPTANCE_TEST |
| REQ-S7 | RQ-09 | R099 | Convergence is bought by making conflict resolution semantic-free | TC-018 | — | Convergence below, adjudication above — a layer boundary v2 has not drawn | TESTABLE_TRANSFER | SHARPEN_CONTRACT |
| REQ-S6 | RQ-06, RQ-07 | R055, R056, R058, R045, R061 | Authorization is a derivation from identified principals' statements | TC-019 | — | **Two independent neighborhoods converge on one missing primitive: Agent** | TESTABLE_TRANSFER | SHARPEN_CONTRACT; BUILD 6 |

## Negative spine

Negative results are traced identically, because a rejected analogy is a finding.

| Req | Aperture | Sources | Established claim | Result | Standing | Build |
|---|---|---|---|---|---|---|
| REQ-S1 | RQ-01, RQ-05 | R001, R002, R075 | A Galois connection is an adjunction between preorders | Prerequisite may be closer to met than AP-10 assumes | **BRANCH_FORCING** — NR-01 | ARCHITECTURE_CHALLENGE → **ACP-02** |
| REQ-S3 | RQ-04 | R023, R027, R029, R030 | PutGet forces unconditional acceptance | Lens laws contradict qualification | BRANCH_CONFLICTING — NR-02 | SHARPEN_CONTRACT by prohibition |
| REQ-S3 | RQ-03 | R046, R047 | Success postulate; total entrenchment | Contradicts `current ≠ newest` and AP-01's dimensional separation | BRANCH_CONFLICTING — NR-03 | SHARPEN_CONTRACT |
| REQ-S5 | — | R077, R080, R076 | IB and rate-distortion need distributions and distortion measures | Prerequisites absent; inventing them is forbidden by §12 | DEFER / DISCARD — NR-04, NR-05, NR-09 | NO_BUILD_EFFECT |
| REQ-S7 | — | R074 | A category needs identified morphisms | v2 has objects and no morphisms | DEFER — NR-06 | NO_BUILD_EFFECT |
| REQ-S1 | — | R092, R093 | Conformality requires a metric | No metric on constitutive meaning; the one real metric is on embeddings | METAPHOR_ONLY / BRANCH_CONFLICT — NR-07, NR-08 | ADD_ACCEPTANCE_TEST (prohibition) |
| REQ-S7 | — | R090, R091 | Conant–Ashby assumes optimality; VSM yields no falsifier | Neither can justify a v2 structure | NO_BUILD_VALUE / METAPHOR_ONLY — NR-10, NR-11 | NO_BUILD_EFFECT |
| REQ-S3, S7 | RQ-09 | R099 | Convergence removes adjudication | Must not touch standing | BRANCH_CONFLICTING for standing — NR-12 | SHARPEN_CONTRACT |

## Worked example in the spec's own notation

    REQ-S1
    → RQ-01
    → R016 + R017 + R071
    → established semantic-preservation-modulo-observation property
    → TC-003
    → FP-001
    → NOT YET RUN
    → IMPLEMENTATION_CANDIDATE
    → ADD_IMPLEMENTATION_CANDIDATE

Note the honest `NOT YET RUN`. No probe in this operation has been executed, so no spine
entry carries a probe result. Any future reader should treat probe-dependent standings as
provisional on exactly that.
