STATUS: READY FOR HUMAN METABOLIZE
DISPOSITION: BOUNDED MOVE EVIDENCE — NOT BUILD CLOSURE
AUTHORITY: ECO-103; human-accepted Astra Shape as amended by I1–I9 and E1–E6
BOUNDARY: DISPOSABLE ATOMIC-LEDGER SYNTHETIC TARGET ONLY

# ECO-103 BUILD 8 Move return

The accepted R1–R6 vertical slice passes P01–P14, the E1–E6 controls, literal fresh-process recovery, and an additional untuned post-freeze holdout. The proof covers only a disposable synthetic target whose native effect and native target-operation record commit atomically within the accepted PostgreSQL transaction boundary, serialized through the accepted scope lock. No general exactly-once external, distributed or arbitrary-runtime guarantee travels. Human Metabolize and BUILD 8 closure remain separate.

## 1. PRE-MUTATION GATE — PASS

This was a continuation from `build/eco-103-build-8-move@b4b813dd0779dc1f697ba42b2f7132538f18df95`, not a new Shape. Initial recovery found a clean worktree and matching remote branch. Current remote `main` remained `61b4a0524fdc089cbf2b244584ba073deb05c351`, an ancestor of the checkpoint. The original [pre-mutation gate and decision/source map](../build-shape/012-build-8-move-gate.json) at `19064a9` remains unchanged durable evidence, including its historical environment-readiness limitation. The continuation found a usable local Docker environment; it did not replace that historical observation retroactively.

The checkpoint contained the composition migration, pre-mutation map and disposable workflow, but no R1–R6 lifecycle. Its CI run `34599866512` reached the composition/historical-binding path and then failed in the test's trigger-predicate deparser (`pg_get_expr` cannot deparse a trigger's OLD/NEW range table). Classification: **invalid/inconclusive test**, not mechanism falsification. The completed composition implementation was retained. Only the failing inspection was repaired using `pg_get_triggerdef`.

Live authority was recovered in its controlling order, with exact content retained in [live-sources.json](evidence/build-8/live-sources.json):

| Order / authority | Exact recovered source and implementation consequence |
|---|---|
| Repository reentry | Current `main` BUILD_CHECKOUT and `docs/build-shape/011-build-8-shape-closure-metabolize.md`; pre-Move normalization and cold reentry, subordinate to ECO-103's newer explicit Move opening. |
| Human Shape closure | ECO-98 `4872ef52-488c-41bb-be4c-a99da401e27e`; accepted bounded mechanism, no Shape restart. |
| Integrated constraints | ECO-98 `6165616d-f60e-4726-889e-efe356b3868a`; I1–I9 govern locator, revision, tick, meanings, actor, complete history and enforcement placement. |
| External-review amendments | ECO-98 `608c8937-40a6-4470-b1b7-d0f319e998d9`; E1–E6 govern trigger partition, UNKNOWN, replay/fence, custody, isolation and claim scope. |
| Full selected mechanism | Astra document `a2b6c22e-9690-439b-8dcc-8f7179f6349c`, updated `2026-09-11T11:40:00.024Z`; D1–D9, R1–R6, temporal contract and unchanged P01–P14 propositions. Later human patches control earlier candidate wording. |
| Pre-Move Metabolize | ECO-102 `e7894d91-5385-4f39-b6a5-e0b5de8345b6` and normalization at `61b4a05`; closed PASS, no prerequisite requiring real authority. |
| Governing repository law | Build Contract v0.3, invariants, glossary; ratification ECO-98 `309764b9-69e7-473b-b8b2-d2926ef9e9b2`. SHOULD strength preserved. |
| Decision-relevant test/aperture evidence | Acceptance tests including WT07 and Layer B boundary; AP-02/03/04/10 and evidence ledger E07/E08/E09/E12/E13/E14/E20/E22. Evidence is not promoted into governing law. |
| Accepted Sense dependency | ECO-97 closure `69d6dab3-be2c-4969-a852-8f19a7841bd5`, patch `5e006f48-43d8-4fc7-ba28-e5edbe23e943`, full record `017726af-b544-477c-8304-582403b7acd3`; distinct designation may co-instantiate with authorization, temporal conditions are specific, synthetic proof suffices. |
| Concrete inherited seams | BUILD 5B migration/checker/WT07; BUILD 6 closure 026; BUILD 7 migration, repaired qualification, fixture support, cold reader and receipts 027/028. Closed guarantees were reused without replaying real ceremonies or inheriting action authority. |
| Move authority/currentness | ECO-103 updated `2026-09-11T12:24:15.357Z`, live-reread before implementation and at return preparation; description unchanged. Branch-only mutations, synthetic proof, commit/push and review preparation authorized. |

No required architecture decision was missing. Function names, JSON encodings, finite supplied interpretations, local wrapper/test plumbing and the dedicated disposable location were routine implementation choices. No target/effect, retry, authority composition or persistence topology was changed.

## 2. IMPLEMENTED DELTA

| Changed surface | Necessary purpose |
|---|---|
| `sql/migrations/20260911130000_build_8_action_envelope.sql` (durable checkpoint, unchanged in continuation) | Four BUILD 8 Artifact roles, isolated custody, positive 5B trigger partition, BUILD 8 immutable preparation, exact document and scope-lock helpers. |
| `sql/migrations/20260911140000_build_8_lifecycle.sql` | Bounded target fixture/contract/grant, complete history fold, finite qualification, authorization/designation, admission/start/effect, protected environment changes, ACK, explicit reconcile and read-only inspection. No new table/index. |
| `server/build-8/recover.mjs` | Independent byte hashing and cold topology/native-state reconstruction, historical legitimacy, present reliance, ACK and entitlement separation. No fixture import. |
| `server/build-8/action.mjs` | Small dispatch boundary: commit start before effect; exact retries of recovered starts observe rather than redispatch. No service or general executor. |
| `tests/build-8/composition.mjs` | Repair actual trigger-definition inspection; move test endpoint to dedicated BUILD 8 disposable port. Historical request-before-migration and unchanged checker PASS retained. |
| `tests/build-8/setup.sh`, `roles.sql`, `inherited.mjs`, `support.mjs` | Dedicated disposable setup, authenticated synthetic principals, location-only inherited fixture wrapper, protected comparison/grant fixtures and exact test operations. |
| `tests/build-8/primary.mjs`, `supplemental.mjs`, `dispatch.mjs`, `cold.mjs` | P01–P14, additional integrity/authentication/temporal tests, replay boundary tests and literal child-process recovery. |
| `tests/build-8/holdout.mjs` | Additional semantic plus failure/recovery pressure authored after freeze, executed once untuned, retained for later regression. |
| `tests/build-8/inherited-regression.mjs`, `seal.mjs`, `verify.sh`, `README.md` | Unchanged inherited behavioral checks with location/count wrapper, exact freeze verification, definition/privilege audit, archive and reproduction. |
| `.github/workflows/build-8-disposable-pg17.yml`, `.gitignore` | Complete disposable CI proof/evidence upload; ignore only generated inherited support. |
| `BUILD_CHECKOUT.md`, this receipt, `evidence/build-8/*` | Branch-local reentry state, full return contract, live sources, hashes, exact inputs/results, retained failures and database archive. |

The complete installed function definitions, owners, grants and volatility are in [audit.json](evidence/build-8/audit.json). The 20 functions are `doc`, `lock_scope`, `prepare_artifact`, `retain`, `keys`, `initial`, `history`, `expected`, `event`, `fixture`, `propose`, `examine`, `qualify`, `conditions`, `observation`, `authorize`, `control`, `fixture_event`, `ack`, and `inspect`. All are owned by `ecb8_owner`. Private helpers are not granted to runtime.

Custody roles: `ecb8_owner`, `ecb8_evaluator`, `ecb8_executor`, `ecb8_observer`, all NOLOGIN/NOINHERIT. Disposable login principals: `b8_actor`, `b8_other`, `b8_evaluator`, `b8_observer`. Protected initial fixture maps authenticated `session_user` to distinct Referent identities; caller actor text does not authenticate anyone. BUILD 8 custody has SELECT plus UPDATE only on the constrained `synthetic` lock column of `ecb7.scopes`, with no pointer/general UPDATE. Shared Artifact/Referent policies enable only the necessary read/retention surfaces. Existing BUILD 5B immutability and BUILD 7 preparation/designation paths are preserved.

## 3. CONTRACT MAP

| Contract | Concrete enforcement surface and implementation | Proof |
|---|---|---|
| R1 | Schema/retention + semantic evaluation: four roles, exact unique-key JSON, bytes/digests, exact envelope manifest, `doc`, `propose`, `examine` | P02–P04, P13, metadata/identity controls |
| R2 | Semantic evaluation + authorization check: finite `examine`, protected `qualify`, seven finding classes and four terminal outcomes; no caller PASS | P03–P05, holdout |
| R3 | Authorization check + transaction: `authorize`, A_TEST tuple, authenticated actor, grant rights, expected history/selection predecessor; separate authorization/designation sections | P02/P05–P07, supplemental |
| R4 | Transaction + controller + revalidation: `lock_scope`, `conditions`, `control`; target/orientation/dependency/revocation checks at declared boundaries | P06–P10 |
| R5 | Transaction + controller + runtime observer: committed admission/start XID gates, atomic effect/terminal event, ACK surface and independent native fold | P08–P12, dispatch, cold |
| R6 | Runtime observer + revalidation + explicit reconciliation transaction: `inspect`, independent `recover`, `control(reconcile)` | P09–P14, holdout |
| I1 | Controller: `(S,A)` exact locator; one immutable target-initial fixture is native target data, not an episode-root/currentness object | P02/P13/P14; zero BUILD 8 tables |
| I2 | Controller + transaction: `history` starts native revision 0, increments for committed increment/readiness changes only | P06/P08/P14; supplemental tick/revision |
| I3 | Controller: protected numeric integer tick starts 10, strictly increases; DB time is provenance only | P07, supplemental |
| I4 | Runtime observer: native increment counts independently of ACK or legitimacy; complete-history threshold, conservative UNKNOWN | P11–P14, cold, holdout |
| I5 | Schema/controller: `b8_event` subtype/participant/predecessor/data semantics in Artifact storage | P05/P09/P13/P14 |
| I6 | Authorization check: protected fixture maps `session_user`, exact login/actor grant binding | P02/P05/P14 |
| I7 | Transaction/controller: all consequential append paths lock, fold complete bounded history, compare expected predecessor, reject forks/cycles/gaps/terminal conflict; no newest repair | P02/P06/P09/P10/P13, supplemental topology controls |
| I8 | Actual schema constraint, transaction, controller, semantic evaluation, authorization check, runtime observer and revalidation surfaces listed here | Code + tests + audited definitions |
| I9 | Schema/privileges/controller: four bounded routing roles; no qualification-start or duplicated inherited source bytes | E1, P05/P14, structural audit |
| E1 | Trigger partition + immutable preparation, unchanged 5B function binding | composition PASS: 18/18 accepted roles each exactly one path; pre-migration request → post-migration PASS |
| E2 | Real scope-lock NOWAIT observation (one zero-wait acquisition attempt); no retry/fence on unavailable observation | P12 hidden commit/abort, mixed holdout |
| E3 | Read-only `inspect`/recovery; recovered dispatch commands do not redispatch; only explicit reconcile fences | P09/P11/P12, dispatch, holdout |
| E4 | Column grants/RLS + distinct owner; no inherited BUILD 7 custody | E1 audit, P06 actual BUILD 7 designation, P14 negative UPDATE/role controls |
| E5 | Actual isolation guard in `lock_scope`; separate post-lock history statements | P10 committed-competitor waiter PASS, rollback-waiter PASS, three REPEATABLE READ rejections |
| E6 | Boundaries in implementation, fixtures, receipts and return; atomic native history | Whole packet; no external effect runtime |

Qualification finding classes are exact binding, closure, action meaning, temporal/retry contract, expression meaning, orientation grounding, and declared current basis. FAIL dominates INCOMPLETE/INDETERMINATE while all findings remain visible. Qualification grants eligibility only. Unsupported wording remains INCOMPLETE; an unresolved supplied interpretation is INDETERMINATE. No new semantic class was invented to make a control pass.

## 4. P01–P14 RESULTS

Actual clean command: `bash tests/build-8/verify.sh --primary`. Individual accepted suite command: `node tests/build-8/primary.mjs`. [Full results](evidence/build-8/primary.json), [log](evidence/build-8/primary.log). All 14 groups PASS; 109 named controls retained in the primary result. Negative results below are expected discrimination, not failed acceptance groups.

| ID | Actual outcome and discriminating controls |
|---|---|
| P01 | PASS: full episode and literal cold process recover value 1 / one effect / legitimate; no authorization cannot admit, effect count 0. |
| P02 | PASS: valid wrong actor/target/revision/method/orientation/evaluation/source-version/grant fields and predecessor reject; wrong protected authentication basis rejects; wrong scope/action cannot escape locator. |
| P03 | PASS: canonical/paraphrase PASS; increment/maximum/access/contradictory prose/native-discrimination/recognized wrong target FAIL; unsupported wording INCOMPLETE; unresolved comparator INDETERMINATE; FAIL precedence. |
| P04 | PASS: each required dependency removed separately → non-PASS; valid wrong digest/version fails; removed payload with retained digest is not recovered from expectation; expression-only defect fails; unrelated revision change leaves PASS. |
| P05 | PASS: eligibility cannot admit, absent/wrong grant and inherited designation cannot substitute; forged protected roles/evaluation fail; matching grant cannot promote FAIL; supplemental valid-digest authorization-without-designation is unusable. |
| P06 | PASS: newer candidate cannot displace selected envelope; exact replacement grant/predecessor required; Key/source drift blocks qualification/authorization/admission/effect; target ABA advances revision twice and blocks. |
| P07 | PASS: issue at 10; reject 12; admit 19; reject fresh admission 20; effect from old admission at 21; reject 30; revocation before admission/effect blocks; later revocation preserves legitimate history; tick does not fence by itself. |
| P08 | PASS: admission alone has no effect; drift after admission blocks; effect-first readiness/revocation/deadline changes preserve historical legitimacy; selected-orientation drift blocks effect under same shared lock. |
| P09 | PASS: admission rollback, committed admission without start, same-transaction start/effect rejection, committed start with aborted effect, fresh child exit after start; no fresh admission until explicit fence; fenced delayed executor rejects; fresh admitted attempt may then effect once. |
| P10 | PASS: competing starts yield one unresolved winner; actual READ COMMITTED blocked waiter sees competitor's committed native effect and rejects with `b8_effect_allowance_consumed`; rolled-back contender permits truthful waiter; exact replay and new envelope do not reset allowance; REPEATABLE READ fails closed for admission/effect/reconcile. |
| P11 | PASS: commit with no ACK observation recovers one effect and HOLD; ACK-without-increment remains zero effect / RECONCILE_REQUIRED. |
| P12 | PASS: real uncommitted lock-held commit and abort branches both return identical UNKNOWN / IN_FLIGHT and HOLD; after release the same reader distinguishes effect from unresolved no-effect; explicit fence blocks old executor; replay storms add no fence/admission/start. |
| P13 | PASS: exact locator/read-boundary child reconstructs bytes/method/grant/history; missing source/contract/predecessor/envelope yields UNKNOWN/HOLD; supplemental valid-digest fork, cycle, wrong scope and missing predecessor reject; newer candidate cannot substitute. |
| P14 | PASS: runtime/owner pointer UPDATE and custody assumption fail; identity/immutability/native revision upheld; privileged injected increment remains observed value 1 with failed legitimacy and consumed allowance; zero BUILD 8 tables and zero real governance rows. |

Supplemental command: `node tests/build-8/supplemental.mjs` — 18 controls PASS, [results](evidence/build-8/supplemental.json). Dispatch command: `node tests/build-8/dispatch.mjs` — two scenarios PASS, ten exact replays each with zero lifecycle appends, [results](evidence/build-8/dispatch.json). Inherited command: `node tests/build-8/inherited-regression.mjs` — 10/10 unchanged Layer B checks plus 5B positive/negative checker, identity, Thought revision and BUILD 6 separation checks PASS, [results](evidence/build-8/inherited/layer-b-regression.json).

## 5. ADVERSARIAL / CONCURRENCY RESULTS

E1's historical request is created before the BUILD 8 composition migration. The same unchanged bound 5B function produces the expected later PASS. The catalog-derived trigger predicates route all five 5B, nine BUILD 7 and four BUILD 8 roles exactly once. Caller digest/time/XID injection is rejected by the preparation function when a disposable rollback-only privilege fixture lets the probe reach that trigger; ordinary callers also lack the derived-column grants. Exact whitespace bytes and one-time Referent registration are tested.

The READ COMMITTED waiter assertion is explicitly labelled the accepted E5 mechanism falsifier in the harness. No snapshot refresh, alternate reader or retry workaround was inserted around it. Both committed and rolled-back competitors behaved as accepted. REPEATABLE READ rejection occurs at controller entry before admission/effect. UNKNOWN uses actual failed NOWAIT row-lock acquisition, not a network-error label or doctored view. The logical tick is unrelated to that observation bound.

The untuned holdout added a mixed storm of nine exact dispatch replays and thirteen status readers around a slow lock-held effect. It completed one effect, retained exactly two starts/admissions and the one earlier explicitly requested fence, and created no storm-induced fence or redispatch. [Holdout evidence](evidence/build-8/holdout.json).

## 6. COLD RECOVERY

Actual command: `node tests/build-8/cold.mjs docs/build-receipts/evidence/build-8/cold-input.json docs/build-receipts/evidence/build-8/cold-output.json`, launched as a new process by P01. [Input](evidence/build-8/cold-input.json) contains only exact scope/action and `ecb8-disposable-55441/build8`; [output](evidence/build-8/cold-output.json) contains the reconstructed retained closure and independently calculated state.

Result: `EFFECT_ESTABLISHED`, native value 1, revision 1, ready true, one effect, legitimacy true, ACK observations empty, retry HOLD, remaining occurrence allowance 0, recovery dispatch permission false. Historical authorization/designation/admission remain inspectable independently of present target mismatch/consumed allowance. Missing exact payload/history/method cases return UNKNOWN and withhold further reliance. The reader never receives expected fixtures as input and never executes/fences an action. Database custody and declared retained observation completeness remain trust assumptions.

## 7. STRUCTURAL-LEVERAGE AUDIT

Every retained distinction below is stable/mechanically decidable at this bounded resolution. The final column records lost freedom/information and the smaller-mechanism comparison, not a claim that physical structure is always superior.

| Distinction / rejected collapse | Liability moved into actual enforcement | Freedom/information and smaller comparison |
|---|---|---|
| Four Artifact routing roles vs one generic blob | Trigger/custody boundaries prevent producer basis/evaluation/event promotion | Candidate meanings remain free to be defective/uninterpreted; a generic role would still need equivalent protected subtype routing. No fifth role earned. |
| Separate BUILD 8 custody vs BUILD 7 owner reuse | Column privilege ceiling prevents accidental Master-Key pointer mutation | Deliberate BUILD 7 designation remains available under its own basis; no extra custody service/table. |
| Full immutable history + exact predecessor vs newest row/pointer | Reject forks, replay conflict, stale appends and reconstruction ambiguity under lock | Historical alternatives/invalid inputs remain retained; transient fold replaces a persisted BUILD 8 currentness registry. |
| Exact envelope manifest vs digest-only/latest/redundant aggregate digest | Byte/identity/role/revision closure survives context loss and detects mismatch | No source abstraction or duplicate inherited snapshot; existing envelope digest already commits the manifest. |
| Finite protected comparison/terminal findings vs producer PASS/arbitrary-language evaluator | Semantic contradictions reach the real comparator and non-PASS cannot authorize | Unsupported novelty stays explicit; interpretation beyond the supplied finite vocabulary is not pretended or generalized. |
| Separate authorization/designation meanings in one event vs two systems or collapsed eligibility | Exact grant/actor/predecessor and selected envelope remain inspectable | No distinct act is imposed where Shape allowed one protected act; neither meaning is lost. |
| Admission and committed start vs one done flag/one transaction for lifecycle | Distinguishes no attempt, entered-but-unresolved, rollback, terminal effect and fence | One extra committed boundary is required by the accepted failure distinction; no separate native target table/receipt store. |
| Native operation/terminal co-instantiation vs ACK-as-effect | One transaction commits the non-idempotent native increment and terminal record, while observers separate effect from legitimacy/ACK | Explicitly limits target class; no claim about escaped external effects or arbitrary runtimes. |
| Explicit reconcile fence vs timeout/replay fence or blind retry | Serializes delayed executor exclusion before later attempt | Status retains observational freedom and cannot abort progress; only explicit reconcile changes lifecycle. |
| Protected integer tick + boundary-specific checks vs wall time/universal validity | Reproducible issue/admission/effect and drift semantics | No universal clock or continuous-validity rule; old admission at 21 remains possible. |
| READ COMMITTED guard vs remembered environment assumption | Rejects unsupported isolation before consequences | Bounded environment restriction is explicit; no new concurrency subsystem or harness-hidden redesign. |

Rejected generic additions: target table, episode-root object, envelope pointer, second closure digest, policy engine, generalized executor, warrant lifecycle, extra semantic-method classes, real runtime/deployment service, BUILD 9/10 behavior. No smaller examined collapse preserved the accepted tested distinctions with less liability; no global minimality proof is claimed.

## 8. CANONICAL / EXTERNAL EFFECTS

Canonical Supabase/ECB schema/data mutation: **NONE**. Canonical BUILD 7/8 install: **NONE**. Real Master-Key designation, action authorization and real action effect: **NONE**. External production execution: **NONE**.

Authorized noncanonical effects: isolated repository files/commits/push/review preparation; dedicated local synthetic Docker/PostgreSQL fixtures and fault probes; ordinary GitHub Actions/evidence artifact and potential incidental Git/Vercel metadata on branch push. Such metadata is neither runtime installation authority nor BUILD 8 proof. The eventual PR/commit identifiers are recorded in the returned review link and completion manifest.

## 9. QUESTION FORWARD / APERTURES

Real Master-Key authority/currentness → separate human/authority and BUILD 7 binding review before real reliance. Real action authority/BUILD 6 remit → human adjudication before any real target/operation. Canonical installation → separate commission. Effects outside atomic ledger/fence → Shape adjudication. Unsupported semantics/new operation/valid false PASS → AP-03/qualification contract and affected proof. Permission-relevant invisible change → observation-contract review and withhold reliance. Deletion/migration/cluster loss → AP-02 and separate recovery rehearsal. Operational runtime exposure → access/deployment Sense. Concrete unsafe lossy abstraction → AP-10. Recursion/propagation/final UX → owning future Sense, BUILD 9/10 unopened.

AP-01 receives no broad standing vocabulary; AP-02 narrows only exact retained closure; AP-03 only finite comparison/findings; AP-04 only exact synthetic authority/admission; AP-05/06/08 inactive; AP-07 no relation expansion; AP-09/11 retain closed access substrate; AP-10 open/inactive. No surviving unresolved cell is indispensable to this bounded proof, and none is prematurely closed.

## 10. EVIDENCE PACKET / REPRODUCTION

Branch: `build/eco-103-build-8-move`; continuation ancestry anchored at `b4b813dd0779dc1f697ba42b2f7132538f18df95`, normalized main `61b4a0524fdc089cbf2b244584ba073deb05c351`. Exact implementation/comparison hashes: [freeze.json](evidence/build-8/freeze.json), 18 files frozen before holdout authorship. Definitions/privilege audit and PostgreSQL 17.10 READ COMMITTED observation: [audit.json](evidence/build-8/audit.json). Exact fixture/native history archive: [disposable.pgdump](evidence/build-8/disposable.pgdump). Full reproduction: `bash tests/build-8/verify.sh`; detailed boundary in [README](../../tests/build-8/README.md).

Executed sequence: clean setup/composition + `verify.sh --primary` → `seal.mjs --freeze` → newly authored `holdout.mjs` → first untuned holdout PASS → `seal.mjs --audit` → `pg_dump`. `deno fmt --check`, shell syntax and `git diff --check` pass. Reproduction/CI reruns of the same holdout are labelled regression, not independent new holdouts.

Failure/repair lineage, all before the accepted freeze:

| Observation | Classification / disposition |
|---|---|
| Checkpoint `pg_get_expr` trigger deparse failure | Invalid/inconclusive test. Trigger-aware catalog deparser repaired; actual partition/historical binding then PASS. |
| Initial shell empty-argument plumbing and supplemental test variable typo | Invalid/inconclusive test. Corrected plumbing; no architecture consequence. |
| Initial SQL CASE parsing and ambiguous local `id` name | Implementation failure. Corrected ordinary syntax/binding; failed installation transaction/fixture operation committed no action effect. |
| Historical authorization replay JSON subtraction precedence | Implementation failure. Corrected parenthesization; replay test passed without changing the accepted meaning. Original [failure log](evidence/build-8/development-supplemental-01.log) retained. |
| Wait-statistics read with insufficient test principal visibility | Invalid/inconclusive test. Custodian-only test statistics reader used; actual controller unchanged. Original [development report](evidence/build-8/development-primary-01.json) and [log](evidence/build-8/development-primary-01.log) retained. |
| Inherited fixed-population probe overlapped fixture creation | Invalid/inconclusive test. Reran after fixture writers finished; final harness serializes this inventory-sensitive check. Historical test expectations/code unchanged. |
| Final clean proof / freeze / untuned holdout | PASS. No post-freeze implementation/comparison repair; no refreeze required. |

No mechanism-design, architectural-claim or source/assumption falsifier survived. Deliberately malformed/illegitimate fixtures are negative controls, not architectural failures. Same-worker authorship and correlated specification/custody limitations remain explicit; no independent-author proof claim.

## 11. BOUNDARY AUDIT

No main merge; no canonical mutation; no real authority/effect; no canonical BUILD 7 prerequisite; no BUILD 9/10 opening; no generic executor/policy/currentness/propagation system; no hidden target-class or retry redesign; no final UX or deployment requirement. Existing 5B/7 function sources and historical harnesses remain unchanged. Synthetic grants cannot provision another runtime action/target. Qualification, authorization, designation, admission, start, native effect, ACK, legitimacy and present applicability remain independently recoverable.

## 12. MOVE STATUS

`READY FOR HUMAN METABOLIZE`

This packet does not close BUILD 8, merge main, or authorize canonical installation.
