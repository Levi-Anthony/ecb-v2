STATUS: ACTIVE
DISPOSITION: PROJECTION
ROLE: Decoder for every label, term, and symbol used in this research
AUTHORITY: None

# Decoder

Every code, technical term, and symbol used anywhere in `research/formal-reconnaissance/`.

If you hit something unexplained in any file here, it is a bug in that file. Tell me and I will
fix it rather than expecting you to look it up.

---

## Codes I invented for this research

These are filing labels, nothing more. They exist so one document can point at another precisely.

| Code | Means | Where |
|---|---|---|
| `R001`–`R100` | The 100 papers, numbered | `corpus/` |
| `TC-001`–`TC-019` | **Transfer contract** — one proposal to move an idea from a paper into ECB v2, with what would prove it wrong | `04-transfer-contracts.md` |
| `CF-01`–`CF-14` | **Candidate formalism** — a precise statement worth keeping | `05-candidate-formalisms.md` |
| `NR-01`–`NR-12` | **Negative result** — an appealing idea that did not survive inspection | `06-negative-results.md` |
| `FP-001`–`FP-004` | **Formalization probe** — a small experiment I specified but did **not** run | `08-formalization-probes.md` |
| `QF-B-…` | An open question that **blocks** work | `10-question-forward.md` |
| `QF-X-…` | An open question that would **decide between** two live options | " |
| `QF-F-…` | An open question that would **show a finding here is wrong** | " |
| `QF-V-…` | An open question that would **confirm** something already believed | " |
| `QF-D-…` | An open question **deliberately left open** for now | " |
| `ACP-01`, `ACP-02` | The two items needing a human decision | `19-architecture-change-proposals.md` |
| `S-1`–`S-7` | The seven areas of the build I was authorised to research | `01-SHAPE.md` |
| `REQ-S1`–`REQ-S7` | What each of those areas currently requires | `02-baseline-register.md` |
| `RQ-01`–`RQ-09` | The nine research questions the seams generated | `09-evidence-ledger.md` |

## How I classified each paper

| Label | Means |
|---|---|
| `TESTABLE_TRANSFER` | The idea moves across, and I can say what would prove it wrong |
| `CONDITIONAL_TRANSFER` | It moves across only if something not yet true becomes true |
| `IMPLEMENTATION_CANDIDATE` | Worth actually building a small version of |
| `METAPHOR_ONLY` | Sounds like it fits; does not actually fit |
| `NO_TRANSFER` | Does not apply, and I kept it to record why |
| `ARCHITECTURE_CHALLENGE` | Suggests something in ECB v2 may be wrong or underspecified |

| Label | Means |
|---|---|
| `BRANCH_NEUTRAL` | Works no matter how your open architectural questions get settled |
| `BRANCH_COMPATIBLE` | Fits every option currently on the table |
| `BRANCH_DEPENDENT` | Only valid if a particular option is chosen |
| `BRANCH_FORCING` | Adopting it would **force** you to close a question you deliberately left open |
| `BRANCH_CONFLICTING` | Contradicts something ECB v2 has already committed to |

| Label | Means |
|---|---|
| `NO_BUILD_EFFECT` | Interesting, changes nothing you would build |
| `VERIFY_EXISTING` | Outside support for something you already do |
| `SHARPEN_CONTRACT` | Makes an existing rule more precise |
| `ADD_ACCEPTANCE_TEST` | Gives you a concrete check you could freeze |
| `ADD_IMPLEMENTATION_CANDIDATE` | Suggests machinery worth prototyping |
| `BLOCK_PENDING_PROBE` | Too uncertain to build safely until an experiment runs |

---

## Academic terms, plainly

| Term | Plain meaning |
|---|---|
| **safety property** | "Nothing bad happens." You can catch a violation from what has happened so far |
| **liveness property** | "Something good eventually happens." You can **never** catch a violation from what has happened so far, because it might still happen |
| **execution monitor** | A program that watches a system run and can stop it |
| **monitorable** | Whether a watchdog could ever reach a verdict at all |
| **runtime verification** | Checking properties while the system runs, rather than beforehand |
| **translation validation** | Rather than proving a translator always works, check each individual translation as it happens |
| **proof-carrying** | The submitted thing brings its own evidence that it is acceptable; a small checker verifies it |
| **semantic preservation** | The guarantee that translating something did not change what it means |
| **refinement mapping** | A way of showing a concrete implementation genuinely implements an abstract specification |
| **simulation relation** | The shape of proof used to show one system correctly implements another |
| **rely / guarantee** | "I promise X, *provided* my environment does Y." Naming the Y is the point |
| **abstract interpretation** | Reasoning about all possible runs of a system by deliberately simplifying it |
| **CEGAR** | When a simplification proves too crude, use the failure itself to decide how to sharpen it |
| **widening / narrowing** | Force a conclusion now by losing precision; recover precision later |
| **Galois connection** | A formal pairing between a detailed view and a simplified view. Needs an ordering on both |
| **closure operator** | Simplify-then-expand. Doing it twice changes nothing more than doing it once |
| **contextual equivalence** | Two things count as the same when no situation can tell them apart |
| **congruence** | An equivalence that stays valid when you put the things inside something larger |
| **belief revision** | The study of how a body of belief should change when new information arrives |
| **AGM** | The dominant belief-revision theory. Assumes new information is always accepted |
| **semi-revision** | A variant where new information can be rejected instead |
| **truth maintenance** | Machinery that tracks why each belief is held, so retracting support propagates correctly |
| **non-monotonic** | Reasoning where learning more can make you withdraw an earlier conclusion |
| **closed-world assumption** | Treating "not in the database" as "false." Only sound if the database is genuinely complete |
| **provenance** | A record of *how* a result was derived, not just that it holds |
| **semiring** | A way of combining evidence where "A and B together" behaves like multiplication and "A or B separately" behaves like addition |
| **bitemporal** | Recording *when something was true* and *when you learned it* as two separate facts |
| **event sourcing** | Treating the log of what happened as the truth, and current state as something you recompute |
| **materialized view** | A precomputed summary that has to be kept up to date as the underlying data changes |
| **lens** | A sync technique that guarantees edits to a view get pushed back to the source |
| **CRDT** | A technique letting copies drift apart and merge back automatically, with no coordination |
| **constraint maintainer** | A gentler sync technique that only requires "if they already agree, leave them alone" |
| **view-update problem** | The question of how to push an edit made to a summary back into the thing it summarises |
| **authorization logic** | A formal language for "who said what, on whose behalf, with what permission" |
| **capability** | In security research: an unforgeable token that **is** permission to act. **Opposite** of ECB v2's usage |
| **confused deputy** | A trusted component doing something on behalf of someone who was not entitled to ask |
| **trust management** | Deciding "is this action permitted?" separately from "who is this?" |
| **observability** | Whether you can work out a system's internal state from its outputs |
| **controllability** | Whether you can drive a system's state where you want it |
| **model predictive control** | Plan over a short horizon, act on the first step only, then re-plan with new information |
| **recursive feasibility** | The guarantee that acting now never leaves you unable to continue lawfully later |
| **invariant set** | The region you can stay inside forever. Leave it and no strategy recovers |
| **institution** | A framework for moving a specification between formal languages without its meaning changing |
| **functor** | A structure-preserving translation between two mathematical worlds |
| **parametricity** | A transformation that cannot inspect its contents automatically preserves relations between them |
| **information bottleneck** | Compress data while keeping what matters for a specific purpose. Needs probabilities |
| **rate–distortion** | How much you can compress for a given amount of acceptable damage. Needs a damage measure |
| **sufficient statistic** | A summary that loses nothing relevant to the question being asked |
| **zero-error** | Guaranteed correct, rather than correct with high probability |
| **reflective tower** | A system that can inspect the thing interpreting it, and so on upward |
| **Löb / Gödel limits** | A consistent system cannot prove its own soundness |
| **requisite variety** | A regulator must have at least as much range as the disturbances it absorbs |
| **argumentation framework** | Machinery for deciding which of a set of mutually attacking claims can be accepted together |
| **Merkle tree / history tree** | A log structure where any retroactive edit becomes mathematically detectable |

---

## Terms from your own ratified Interpretation Contract v1.1

| Term | Plain meaning |
|---|---|
| Band **R** | I retrieved a fact from an identified source |
| Band **M** | I computed or reformatted something mechanically |
| Band **I** | I interpreted evidence |
| Band **D** | I derived something new that downstream work could build on. Highest stakes |
| **ATTESTED** | "I saw this; you cannot check it from where you are sitting" |
| **branch-cut instruction** | "If this turns out wrong, cut everything that depends on it" |

## Terms from your own architecture

Included because I used them, not because I am redefining them.

| Term | As used here |
|---|---|
| **SIGMA** | The layer holding constitutive meaning, identity, and governing commitments |
| **ECOS** | The layer that actually executes: sense, shape, move, metabolize |
| **projection** | Turning a SIGMA commitment into something that constrains ECOS at runtime |
| **evidence return** | What comes back from ECOS to SIGMA. Not an overwrite |
| **qualification** | The review returned evidence must pass before it can change standing |
| **Master Key** | The locally governing discriminator that bounds what is relevant right now |
| **Aperture** | A deliberately preserved open question, with a trigger that reopens it |
| **standing** | What weight a thing carries. Kept separate from truth, relevance, and authority |
| **warrant** | The valid basis authorising a specific actor to do a specific thing in a specific scope |
| **seam** | A join in the build where two concerns meet and something can go wrong |

---

## Symbols

| Symbol | Plain meaning |
|---|---|
| `∼(M,O)` | "Same for this purpose" — two situations treated as equivalent under discriminator M for operation O |
| `γ(a)` | All the concrete situations a simplified view still allows |
| `Permitted_O(x)` | The set of actions allowed in situation x for operation O |
| `ker(Permitted_O)` | Grouping situations together exactly when they permit the same actions |
| `α`, `γ` | Simplify (abstraction) and expand (concretization) |
| `⊑` | "Is at least as detailed as" |
| `⋂` | Intersection — what all of them have in common |
| `⊆` | "Is contained within" |
