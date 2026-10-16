# ECO-152 — Orientation Kernel: Isolated Full-Lifecycle Implementation Return

**Episode date:** 18 September 2026 America/Phoenix; execution receipts dated 19 September UTC.  
**Commission:** ECO-152 — BUILD 7-prime orientation kernel, isolated full-lifecycle qualification.  
**Standing:** Executed Register B proof return for governing review; not production acceptance.  
**Review surface:** PR #67, `build/eco-152-orientation-lifecycle`.  
**Qualified executable head:** `b64768408c46ab86f85c28eeaa431721110278c1`.  
**Final run:** GitHub Actions `35427931275`, job `105857039688`, SUCCESS.  
**Result:** 64 named checks PASS, historical-lineage regression PASS, containment PASS, orderly disposable database restart PASS.  
**Effect boundary:** No canonical database installation, real authority issuance, production tool registration, or external-effect executor.

## 1. Currentness, inherited authority and decision question

The Principal's **“Continue”** accepted the preceding recommendation to release this commission from its naming-only sequencing pause. The release is recorded in ECO-152 comment `59fe6a29-c8d9-415e-bdd9-ecadbff3d533`; the implementation preflight is comment `aa183ca9-d207-476a-a9f2-c974ccb9aef1`. The existing commission, not that comment alone, determines the allowed mutation and stop boundaries.

Inherited sources were live-recovered before implementation:

- ECO-152: current implementation authority and lifecycle/pressure/return contract.
- ECO-151: accepted orientation-kernel Architecture Shape, mirrored in `ECO-151-BUILD-7p-Orientation-Kernel-Architecture-Shape-2026-09-18.md`, Git blob `81f874f67b05d3a71cb07a212c6d3a709b14e1c7`.
- ECO-150: versioned Universal Referent Grammar / provisional Principal Governing Orientation interface, Linear document `a7ec2b1b-00f6-447d-8b22-276d98be6b70`, slug `1a3029daf04f`.
- Current repository entry guidance, Build Contract, invariants, BUILD 11 ordinary-operation kernel, and corrected BUILD 12 immutable Text Artifact mechanism.
- ECO-159: the newer quadrant counterexample and exact assessed-input lineage repair, propagated into ECO-152 in comment `1a04cc2e-94ae-4742-a157-a5225ed7ca77`.

The implementation branch started at `main@2f4d89c25c4959cc2e876fe158a40b51e1b3494c`. ECO-159 supplied an implementation lesson, not a predecessor migration. Historical BUILDs 7–10 and ECO-149/ECO-159 were **not installed as prerequisites**.

The decision-relevant uncertainty was whether the current operation/Artifact substrate could sustain the complete orientation lifecycle while preserving representation, qualification, currentness, and independent binding authority as separate things. Exact input lineage, change and recovery had to work together for the result to mean anything.

Naming remains independently governed under ECO-158. Implementation identifiers are provisional. Gate K remains deferred to future Register A qualification. No naming adoption or quadrant semantic/logical reopening occurred.

## 2. Implementation delta and why it exists

The candidate adds a private `ecb_orientation` domain with three accountable state families:

- **Scopes:** Referent-backed fixed focal identity, boundary/use manifest, monotonically advancing epoch, exact current binding, and latest selected change fence.
- **Records:** immutable links between ordinary-operation identity, Text Artifact payload, scope, semantic role, exact referenced inputs, epoch, predecessor, reviewer/authority capability and result.
- **Capabilities:** independently typed, scope-limited fixture reviewer and binding-authority capabilities, with subject/issuer, method/remit/basis Artifacts, expiry and one-way revocation.

Eight record roles cover scope opening, Resolution, qualification, observation, applicability, selected change fencing, authority decision, and binding transition. These are roles within one bounded module, not eight services.

Two public remote procedure calls (RPCs) provide confined writes and cold resolution: `orientation_v1_write` and `orientation_v1_resolve`. The write dispatcher does not erase the different role contracts; each role retains its own exact binding and capability checks. No public effect-execution function is introduced.

The observed historical-lineage failure earned an additional private qualification-insertion guard. It protects the stronger historical claim while leaving imperfect observations available for inspection. It is not a generic semantic evaluator.

Executable files, applied in this order in the disposable reconstruction:

1. `sql/migrations/20260919065000_eco152_orientation_kernel.sql`
2. `sql/migrations/20260919070500_eco152_historical_lineage_guard.sql`

The first file is retained as the original executable specimen; the second is the forward repair. **Neither filename makes either file a pending production migration.** The qualified mechanism is their tested composition, not the first file alone.

Tests are `tests/eco-152/qualify.py`, `history_lineage.py`, and `containment.py`, run by `.github/workflows/eco-152-orientation-lifecycle.yml`.

## 3. Source-of-truth allocation

| Concern | Accountable mechanism | Does not establish |
|---|---|---|
| Exact semantic payload | Existing immutable BUILD 12 Text Artifacts | Truth, currentness or authority merely from text |
| Operation/replay identity | Existing BUILD 11 ordinary-operation receipts and request digests | Permission to repeat a consequential effect |
| Scope identity | Referent plus immutable scope manifest | Real-world co-reference from UUID uniqueness |
| Currentness | Private scope epoch and exact binding-event head | Latest-record-wins or latest-Resolution-wins |
| Qualification | Immutable typed assessment of exact Resolution/scope/use/epoch | Current selection or independent binding authority |
| Binding authority | Separate fixture capability and exact immutable authority-decision tuple | Real Principal authority or effect authorization |
| Changed applicability | Retained observation, authenticated assessment, selected fence and scoped requalification | Perfect automatic detection of every relevant change |
| Historical proof | Preserved payload and exact prior-Resolution constituent lineage | Reconstruction of missing meaning from a digest |

Existing `depends_on` Claims remain available for external semantic discoverability. This isolated encounter did not need a Claim mirror to enforce exact revision/currentness, and did not create one as a substitute for the typed binding. It does not qualify cross-module dependency discovery.

## 4. Integrated lifecycle trace

One primary fixture scope used `inspect_nonexecuting`; a second independent scope used `independent_nonexecuting`. The semantic judgments are synthetic test stipulations, not measured facts about the world.

| Primary epoch | Actual transition and observation |
|---:|---|
| 0 | Open scope; record multiple exact Resolutions; qualify one. Neither the newest Resolution nor qualification becomes current. |
| 1 | Separately authorize and select Resolution A. Cold resolver returns A and bounded nonexecuting applicability. |
| 1 | Record/assess an unaffected observation. Attempting to fence it is rejected; current applicability remains. |
| 2 | Select material change; fence advances while old binding/history remains. Fresh reliance requires requalification. |
| 3 | Requalify the same A against the selected change and reaffirm through a new binding event. |
| 4–5 | Qualify/select B, then A. The new A binding has a different event identity from the prior A binding. |
| 6 | Two concurrent reaffirm attempts against one epoch/predecessor produce exactly one committed winner. |
| 7 | Induced pre-commit failure rolls back; retry of the uncommitted operation creates one new committed binding. |
| 8 | Reviewer revocation blocks fresh reliance; a newly commissioned fixture reviewer permits requalification/reaffirmation. |
| 9–10 | Binding-authority revocation remains distinct from qualification. Replacement fixture authority withdraws to no-current, then permits a new selection. |
| 11 | Unknown change with unavailable historical payload fences use. An old-basis historical PASS is rejected; INCOMPLETE custody remains possible. |
| 12–13 | A newly formed exact basis qualifies without claiming lost historical equivalence; it is selected and later withdrawn. Full history remains recoverable. |
| 14 | Added historical-lineage regression preserves a suspect observation and its selected fence, rejects the counterfeit historical PASS, and allows a new exact-basis qualification without making it current. |

At the end, the primary scope is explicitly no-current at epoch 14. The independent scope remains unchanged and applicable. The final retained state contains two scopes, 58 orientation records/operations, seven fixture capability records, and 81 Text Artifacts including predecessor/fixture material. These counts describe this run, not architectural cardinality requirements.

## 5. Replay, concurrency, ABA and rollback

Exact replay recovered the committed envelope. Reusing an operation ID with changed submitted bytes conflicted. Duplicate JSON keys were rejected before normalization; unsupported profiles and wrong source revisions were rejected.

**ABA** means the A→B→A state pattern in which matching the current Resolution alone would miss an intervening change. The implementation compares both epoch and exact predecessor binding-event ID. The regression supplied the current epoch with an old A predecessor and was rejected.

The concurrency check used two actual client processes, not sequential calls labeled concurrent. Exactly one committed; the other received `orientation_epoch_conflict`, and the head advanced once. This is one bounded race test, not a reliability distribution or distributed consensus claim.

For lost-response recovery, a committed observation response was deliberately discarded and the exact request reissued. It returned `replayed=true`.

For atomicity, the public binding call succeeded inside a transaction, then a division-by-zero was induced before commit. The operation count remained zero and the complete public resolver state equaled the before-state. Retrying the same uncommitted operation then committed once with `replayed=false`. This tests database transaction recovery, not external-effect exactly-once delivery.

## 6. Qualification and reviewer evidence

Qualification is bound to the exact Resolution, scope, declared use, current epoch, method/remit/basis and fixture reviewer. The tests rejected wrong use, wrong-scope reviewer, missing reviewer credential, expired/revoked reviewer, raw PASS Artifact substitution, and PASS without a retained negative-control reference.

The retained reviewer method explicitly states that it stipulates semantic outcomes for fixture testing. Checking its authenticated identity and exact evidence references **does not prove semantic adequacy of arbitrary findings**. The executed negative controls qualify the mechanism's discrimination; mere field presence or an authenticated PASS string does not become universal proof.

A decisive unresolved Question Forward entry without a route blocked only its dependent positive use. Its custody was retained. The same question did not globally invalidate the independent scope/use.

## 7. Authority separation

Ordinary runtime access did not become reviewer authority, and reviewer capability did not become binding authority. The authority decision is independently authenticated and names the exact scope, acting subject, issuer/evidence basis, action, Resolution, qualification, epoch and predecessor.

Tests rejected missing authority, wrong actor, reviewer-as-binder, and attempted reuse of an authority decision for a different Resolution tuple. Binding-authority revocation made authority unavailable while qualification applicability remained separately observable. A later fixture capability permitted withdrawal; no real authority source was fabricated.

A historical replay after revocation still recovered the original receipt. A fresh resolver continued to report reliance unavailable. Recovery is not reauthorization.

## 8. Historical-lineage counterexample and repair

The first complete suite passed 60 checks in run 4. Evidence audit found that the historical check distinguished payload absence, but not a present unrelated payload. The added control carried an unrelated Artifact through ordinary observation, authenticated applicability and selected change, then requested historical PASS requalification.

**Run 5 exposed a real implementation defect.** The invalid request committed PASS:

- counterfeit operation: `6cdeea29-e3c4-46d4-b040-2d2b36d2d743`;
- resulting qualification Artifact: `8a3d9d86-10fd-4b88-8b98-5bf2dcdec2bc`;
- purported before Artifact: `25eddd88-4a87-4589-9fec-be083cb4917d`;
- assessed Resolution: `b6f0bb27-6caf-457e-8079-79d3af8ecdef`.

The before Artifact existed but was not the relevant prior Resolution or a constituent of its exact source/grammar/evidence/dependency manifest. This was a deterministic lineage enforcement failure, not an upstream semantic or mechanism-family defect.

The forward guard executes at immutable qualification insertion. A claimed historical PASS must have available prior payload and bind to the exact Resolution cited by the selected change, or an exact constituent of that Resolution's manifest. Invalid claims roll back their Artifact and ordinary-operation receipt as part of the same transaction.

In run 6 the same class of counterfeit returned `orientation_historical_lineage_mismatch` with exit 3, and the rejected operation `e26c1750-a42c-471b-9e2d-a27bd9aac2eb` had zero committed receipts. A new Resolution identity could not launder the historical claim. Conversely, new-basis qualification without a historical claim remained allowed and did not become current or authoritative.

This establishes a red/green mechanism contrast at the same acceptance surface. It is not an independent-worker trial. The older 60-check PASS remains historical evidence, not the final verdict.

## 9. Withdrawal and no-current

Withdrawal creates an immutable event, increments the scope epoch and sets current binding explicitly to null. It does not erase old Resolutions, qualifications, authority decisions or binding events. Cold resolution does not silently pick the newest remaining Artifact.

Both an intermediate and final no-current condition were exercised. The final historical regression also demonstrated that qualifying a new exact basis alone leaves no-current intact.

## 10. Cold recovery and retained evidence

Public calls used a fresh PostgreSQL client process per invocation. The workflow additionally performed an **orderly restart of the disposable database container**, then reconstructed state through a new ordinary client. Parsed before/after resolver objects were exactly equal. Their file hashes differ because one file is compact JSON and the other is pretty-printed; byte identity is not claimed between those two editions.

The final archive retains exact source files, their SHA-256 identities, the checked-out commit, predecessor hashes/logs, migration logs, named expected/observed checks, complete ordinary-operation requests/results, before/after state exports, concurrency outputs, historical-counterexample requests, and restart state. Fixture capability key digests are omitted from exported capability state. The executable harness contains deliberate nonproduction fixture keys; no production credential was used.

Final archive: GitHub artifact **`10579417984`**, `eco152-orientation-35427931275-1`, **391,987 bytes**. SHA-256:

`eb67903864867b8ad9eb451382f2cda27c936f6f9cd1245d63222f37ec980b4f`

The archive was downloaded and independently rehashed in the control-room container. All 64 named checks were inspected as passed, and the restart objects were independently compared after extraction. The actual tested SHA is `b64768408c46ab86f85c28eeaa431721110278c1`, not a synthetic pull-request merge.

Selected raw identities:

| Archive member | SHA-256 |
|---|---|
| `checks.jsonl` | `27a1ed8943163170ea897471491ac844e018c9ad15a6b670efa86857ad0a59d7` |
| `before.json` | `9f1122ff995e390019816ced3b027c8b533fdc523301e222d3cae200962b0d00` |
| `after.json` — before added regression | `7349b3cfcc1392fe684bad392617b7f6a5729989ddaaa579ad8baea6a5987da3` |
| `history-regression-after.json` — final full state | `976aa89f81191ec852b4a39dcd92f1578c5b676320fa283a39c362d4d3438fe9` |
| `cold-state.json` | `dd286e094689ee99e36e92c00c3581dc7d12548b0515bfe7a6bcb0b026f81783` |
| `restart-state.json` | `c17d5a19a301bb49a8ec1e33276383d5ddce4d834db0296a6f2549fb9394444e` |

GitHub reports expiry **18 December 2026, 06:55:35 UTC**. The downloaded archive is also supplied with the execution response. This repository return preserves interpretation and exact identities, not an assertion that the GitHub binary archive has infinite retention. Before later promotion relying on original raw observations, preserve/recover the archive while available; a rerun is new evidence, not recovery of missing original bytes.

## 11. Security, capability and deployment containment

The ordinary client is a non-superuser login that assumes only `anon` and supplies the existing runtime key plus fixture capabilities when the relevant role requires them. Direct private reads/writes and becoming the schema administrator were rejected. Cluster-role commissioning used the disposable custodian; it was not smuggled into candidate execution.

PostgreSQL was pinned to the previously recovered pgvector image digest and exposed on loopback. The final database reported PostgreSQL 17.10. No canonical Supabase project or service-role credential is used by the candidate test path. Containment lint exercised positive and negative canaries, but is explicitly not a universal arbitrary-program safety proof.

**Publication-side effect:** the existing Git integration did create a Vercel branch deployment. Direct inspection recovered `dpl_9azx6tL6nd8xWpwxyT3PQNe6wUE3`, READY, source `git`, matching the qualified branch/head, `target: null`, with a branch-preview alias. Therefore this return does **not** say that no deployment of any kind occurred. No production-target deployment was requested by this worker, no production branch was merged, and no server/tool registration file was changed. This preview is not orientation installation evidence: the new SQL ran only in the disposable Actions database, and no outward orientation RPC/MCP adapter was installed by this work.

## 12. Failure and repair lineage

| Run | Exact head / run ID | Outcome and disposition |
|---|---|---|
| 1 | `6c26353f8fbb044dfc49edd01e0baa817d04c513` / `35427433646` | Runner misparsed single-quoted health command; failed before database startup or checkout. Repaired quoting only. |
| 2 | `b9c8026beffa4d546cd83c156de851b23fe4f307` / `35427527865` | Database/containment succeeded; retained predecessor script expected port 55439. Aligned disposable workflow port without changing predecessor. |
| 3 | `996e2aa1bbda314e6291d0366ce37a9a2555e727` / `35427579674` | Predecessor and candidate migration succeeded; fixture role grant correctly denied to schema owner. Moved only role commissioning to cluster custodian. |
| 4 | `10f5637cbe4d4339494ee579565b80a6132df5c7` / `35427677234` | Original 60-check suite and orderly restart passed. Not final after a consequential coverage gap was identified. |
| 5 | `8021962740df99f288ab5258b2e48333f050d8e5` / `35427809038` | Added exact-history control exposed invalid committed PASS. Genuine local implementation defect. |
| 6 | `b64768408c46ab86f85c28eeaa431721110278c1` / `35427931275` | Forward guard, all 64 checks, containment and restart passed. Counterfeit rejected without a committed receipt. |

The run-5 archive was also downloaded and verified: artifact `10580325034`, 356,901 bytes, SHA-256 `4212e2e3602af879754babeb7e0bbeab91269b094eab605d662aa17cbe5feadd`. Preserve it alongside the final positive evidence; the repair would be less interpretable without the falsifying observation.

## 13. Fact, inference and unknown

**Fact:** the identified executable revision ran against the disposable reconstruction; 64 named checks and the orderly restart passed; a real historical-lineage defect was observed and then rejected after repair; source and raw archive hashes were checked; no main merge or canonical database installation was performed by this execution.

**Inference:** the selected scope/head plus immutable Artifact/operation/typed-binding allocation is a coherent basis for a separately governed production-promotion decision in the tested profile. The evidence supports preserving the accepted semantic and architecture separations, not redesigning them because local implementation needed repair.

**Unknown/unproven:** real authority issuance and revocation integration; actual semantic reviewer quality; production installation and recovery; outward Model Context Protocol (MCP), application or Vercel parity; load, availability and security under hostile production conditions; crash/power-loss/failover behavior; arbitrary dependency-change chains or perfect impact discovery; real-world truth of the fixture; full Universal Referent Grammar closure; Register A independence/replication.

## 14. Register B verdict and reentry disposition

**PASS — bounded isolated orientation lifecycle qualified for the tested database/RPC profile, after the documented forward historical-lineage repair.**

The result supports the integrated architecture across recording, qualification, independent authority, selection, material/unknown change, requalification, replacement, withdrawal and recovery. It does not equate passing tests with semantic truth, production fitness, authority activation, or universal conformance.

No ECO-143 semantic-generator, ECO-144 requirements, ECO-146 operating-context, ECO-147 quadrant logical, or ECO-151 mechanism-family reentry was triggered. The encountered defects were corrected as workflow/test-custody or local implementation liabilities.

Outcome branches were decision-sensitive: coherent operation supports continuation; an exact enforcement failure requires local repair/retest; failure of the selected mechanism family would reopen ECO-151; an interface/meaning conflict would return to ECO-150/ECO-136; genuine authority or production exposure not covered by the commission stops execution. The actual counterexample followed the local repair branch rather than being explained away.

## 15. Exact production-installation and authority blockers

A real production authority must commission and revoke orientation-binding capability for a declared subject, scope/use, acting identity and remit. Fixture credentials and successful qualifications cannot supply that authority. A production semantic reviewer, where needed, also requires separately grounded commissioning and evidence of fitness.

A separately governed installation Move must live-reconcile the then-current database/runtime baseline, specify installation/rollback and permissions, select the actual consumer boundary, preserve both implementation files' logical obligations, and qualify that installed path. Do not apply the historical BUILD-7 SQL or treat this proof's timestamped files as an automatic migration queue.

Production load, failure recovery, outward schema/tool parity and real authority/effects were deliberately not smuggled into this isolated encounter. Their absence is a boundary, not a reason to reopen qualified quadrant meaning or resurrect Gate K as an implementation prerequisite.

## 16. Exact next seam

Submit this return and PR #67 for governing review and repository disposition. The tested implementation remains on its dedicated review branch; this return does not itself merge it or claim canonical installation.

The next consequential Move is controlled production promotion/installation under an explicit real authority and consumer contract, or a specifically commissioned further isolated encounter addressing a decision-relevant residual. Keep naming work independent unless its outcome actually changes the implementation contract. Do not demand another generic round of theory merely to improve confidence.

Cold reentry: read current ECO-152 and its release/preflight/return comments, this return, the accepted ECO-151 architecture, both candidate SQL files and the exact run-6 source manifest. Recover the run-5 counterexample and run-6 archive with their own identities. Treat any later code changes as new candidates requiring affected requalification. Stop before production installation, real authority activation, outward production tool exposure or effect execution without the corresponding commission.
