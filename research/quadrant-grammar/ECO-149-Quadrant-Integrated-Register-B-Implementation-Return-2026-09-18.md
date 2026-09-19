# ECO-149 — Quadrant Integrated Register-B Implementation Return

**Date:** 18 September 2026 America/Phoenix  
**Controlling commission:** Linear ECO-149  
**Parent:** ECO-136  
**Physical-design predecessor:** ECO-148  
**Qualified implementation/test head:** `45dd7b9837848713f65d8efa89424d038c1da292`  
**Final evidence run:** GitHub Actions `35410564998`, run 10 — **SUCCESS**  
**Evidence receipts:** `ECO149_QUALIFICATION=PASS`; `ECO149_PRESSURE=PASS`; `ECO149_CONTAINMENT=PASS`  
**Installation boundary:** disposable PostgreSQL 17 + pgvector only; canonical Supabase/runtime unchanged.

## 1. CURRENTNESS / exact source and runtime basis

ECO-149 executed after the Register-B method correction became canonical through PRs #56/#57.

The qualification workflow reconstructed the accepted ECB v2 predecessor through:
- BUILD 5B reconstruction;
- accepted BUILD 6;
- BUILD 11 ordinary-operation kernel;
- corrected BUILD 12 greenfield Artifact path;
- canonical ECO-138 admission/disposition;
- ECO-140 shaped next-action projection.

The candidate migration was then applied only to that disposable reconstruction.

During the work, repository currentness separately advanced through documentation-only PR #59, which records BUILD 7–10 as closed proof implementations rather than a pending migration queue. That documentation change does not alter the qualified ECO-149 mechanism or predecessor schema.

No canonical Supabase project ID is used by the ECO-149 fixture/workflow, no service-role credential is required by its ordinary path, and no quadrant effect-execution surface is created.

## 2. PREFLIGHT — uncertainty, evidence-bearing boundary, containment boundary

### Decision-relevant uncertainty

The implementation question was whether the accepted four-role / C1–C6 architecture could operate coherently on the current ECB v2 substrate while preserving:
- exact basis and history;
- inquiry and coverage distinctions;
- qualified assessment rather than raw PASS text;
- change/requalification semantics;
- bounded reliance distinct from authority/effect;
- recoverable handoff/reuse;
- replay, stale-writer, rollback and restart behavior.

### Evidence-bearing boundary

The implemented encounter includes:
- Referent-backed channel and reviewer-capability subjects;
- immutable issued records bound to BUILD-11 ordinary-operation identity and BUILD-12 text Artifacts;
- basis, inquiry, assessment, change, selection and reliance records;
- explicit current epoch/head fencing;
- authenticated fixture reviewer capability;
- Claim/Evidence Link integration for Artifact evidence;
- cold public resolution;
- public ordinary-role RPC invocation through the confined anon/runtime-key boundary.

### Containment boundary

The candidate is intentionally nonproduction:
- disposable PostgreSQL only;
- fixture-limited reviewer capability;
- no real authority source;
- no external effect executor;
- no canonical data/schema mutation;
- no production tool registration or consumer cutover.

The test boundary is broad enough for integrated evidence but low consequence.

## 3. IMPLEMENTED DELTA

Candidate migration:

`sql/migrations/20260918233000_eco149_quadrant_integrated_slice.sql`

It introduces private schema `ecb_quadrant` with:

### `reviewer_capabilities`
Referent-backed capability identity containing:
- exact method Artifact;
- exact remit Artifact;
- exact qualification-basis Artifact;
- secret digest;
- expiry;
- revocation receipt.

Only revocation is permitted as a post-creation mutation in the disposable mechanism.

### `channels`
Referent-backed scoped operational channel containing:
- monotonically fenced epoch;
- exact current head receipt.

### `records`
Immutable bindings between:
- BUILD-11 ordinary-operation receipt;
- BUILD-12 text Artifact;
- channel;
- semantic record role;
- observed/result epoch;
- reviewer capability where applicable;
- validator revision.

Supported roles include source snapshot, basis, inquiry, assessment, change, selection, reliance and reviewer-revocation vocabulary.

### Current semantic substrate extensions

The candidate:
- adds scoped quadrant lineage predicates `quad_revises`, `quad_refocuses_from`, and `quad_refines_question`;
- makes Evidence Link revision resolution scheme-aware for Thoughts and Text Artifacts;
- makes standing-transition basis verification use that common resolver.

### Public bounded RPC surface

- `quadrant_v1_record`
- `quadrant_v1_assess`
- `quadrant_v1_qualify`
- `quadrant_v1_resolve`

These are callable by the ordinary `anon` runtime role through the existing BUILD-11 runtime-key boundary. Direct access to private quadrant tables/functions is denied.

No `quadrant_*execute*` effect surface exists.

## 4. DATA / IDENTITY / HISTORY realization

Persistent first-class channel and reviewer-capability subjects are Referents.

Every issued semantic record is anchored to:
1. a stable BUILD-11 ordinary-operation identity;
2. an immutable BUILD-12 text Artifact envelope;
3. an immutable private semantic binding.

Operation replay is exact:
- same operation identity + same request returns the committed result;
- same identity + changed request conflicts.

Currentness is not “latest Artifact.” Selected basis/inquiry/change/selection transitions update the exact channel head under expected-epoch fencing.

Assessment and reliance records do not silently move the channel head.

Historical records remain immutable across:
- new selections;
- change;
- stale assessment rejection;
- reviewer revocation.

Artifact evidence can participate in Evidence Links and standing transitions through an exact text-Artifact revision digest without pretending the Artifact creates Claim standing.

## 5. FOUR-ROLE + C1–C6 traceability

### Situated Basis / C1

A basis record carries focal R, boundary, governing orientation/use, scope, source standing and stop/reentry.

Observed:
- exact replay recovers the same committed identity/envelope;
- duplicate JSON keys are rejected before jsonb normalization;
- changed-request identity reuse conflicts.

This is a bounded basis profile, not a universal URG/PGO implementation.

### Inquiry State / C2

Inquiry records bind:
- basis receipt;
- question;
- relational seat;
- answer burden;
- all four coverage meanings;
- Question Forward.

The system does not infer adequacy merely because all four coverage positions are populated or unresolved.

### Warrant / Assessment / C3

Assessment requires:
- exact input receipts;
- method/use/result/scope/limits;
- authenticated reviewer capability;
- explicit negative control for PASS.

A wrong reviewer secret is rejected.

Raw ordinary Artifact text containing `PASS` cannot become an assessment record or reliance basis.

### Applicability Reconciler / C4

Change records preserve:
- before receipt;
- after summary;
- change classification;
- affected scope;
- unknown impact;
- whether historical semantic payload is available.

A claim of historical requalification is rejected when prior semantic payload is unavailable.

A selected change advances the channel fence; prior assessment remains historically recoverable but cannot support fresh reliance after the epoch changes.

### Reliance Qualifier / C5

A supported/narrowed reliance requires:
- exact basis/inquiry/assessment records in the channel;
- current assessment epoch;
- PASS result;
- matching assessed/permitted use;
- live reviewer capability;
- no decisive gap;
- no unresolved required authority.

The implementation creates no external effect.

### Handoff / Reuse / C6

Changing requested/permitted use from the assessed reversible use to a permanent/broader use is rejected.

Cold resolution returns exact record/envelope lineage and current epoch through the bounded public resolver.

A fresh connection reconstructed current state without conversational memory.

## 6. INTEGRATED ENCOUNTER

The running fixture uses one rock R1 under a reversible garden-border seating trial.

The encounter:
1. establishes situated basis;
2. records an inquiry with four explicitly unresolved quadrant burdens and QF;
3. creates authenticated bounded assessment;
4. qualifies nonexecuting reversible use;
5. rejects silent use expansion;
6. records material change and advances the current fence;
7. rejects stale reliance;
8. preserves evidence/standing history;
9. reconstructs the channel cold;
10. exercises additional pressure against revocation, concurrency, lost response and transaction failure.

The point is not that the rock fixture is substantively true. The point is whether the architecture preserves the required distinctions under actual state transitions.

## 7. NEGATIVE CONTROLS

Observed negative controls include:

- changed bytes under reused operation ID → conflict;
- duplicate JSON key → rejected;
- populated fourfold inquiry does not self-establish adequacy;
- PASS without explicit negative control → rejected;
- wrong reviewer secret → rejected;
- changed/broader use inherits old assessment → rejected;
- digest-only historical requalification without prior meaning → rejected;
- stale assessment after selected change → rejected;
- raw Artifact text saying PASS → cannot become assessment standing;
- direct anonymous private-table mutation → denied;
- supported reliance with a material decisive no-route QF → rejected;
- reviewer revocation → fresh supported reliance rejected;
- concurrent same-epoch selected writers → one winner, one stale-revision rejection;
- effect-execution surface → absent.

These failures are evidence-bearing expected discriminations, not test-suite defects.

## 8. SYSTEMS-PRESSURE RESULTS

### Duplicate / replay
PASS.

Exact replay returns the existing result; changed request conflicts.

### Concurrent / stale revision
PASS.

Two separate client transactions attempted selected writes at the same expected epoch. Exactly one committed. The loser returned `quadrant_revision_conflict`. The channel advanced exactly one epoch.

### Partial failure / atomicity
PASS.

A selected write succeeded inside an explicit transaction and was followed by an induced division-by-zero before commit. Connection failure rolled the transaction back. No ordinary operation remained and the channel epoch did not advance.

### Lost response
PASS.

A non-head write committed while its response was deliberately discarded. Exact replay in a later call recovered the committed result with `replayed=true`.

### Restart / fresh-process reconstruction
PASS within the database/RPC boundary.

A fresh PostgreSQL client connection reconstructed the current channel epoch through `quadrant_v1_resolve` using durable identity only.

This does not establish Vercel/MCP process-restart behavior.

### Drift / revocation
PASS for fixture reviewer capability.

A current-epoch assessment was created; fixture revocation was then recorded. Fresh supported reliance was rejected while historical assessment and suspended reliance remained.

### No-route QF
PASS for the bounded contract.

A material decisive gap with no available route could not produce supported reliance. The same state could be preserved explicitly as `suspended` rather than converted into a fabricated positive.

### Judgment/model/service unavailable
Bounded analogue PASS; generalized provider claim unproven.

Wrong/unavailable/revoked reviewer capability cannot create or sustain fresh positive reliance while previously stored basis/inquiry/history remains. The selected mechanism uses a deterministic fixture reviewer and therefore does not test an external model-provider outage.

### Historical semantic payload absence
PASS.

The candidate rejects a historical-requalification claim when prior semantic payload is unavailable.

## 9. REPLAY / CONCURRENCY / RESTART / RECOVERY

The combined evidence supports:
- exact operation identity;
- request-equivalence replay;
- changed-input conflict;
- expected-epoch CAS;
- serializable decision outcome for competing current-head writes at this bounded row-lock surface;
- transactional rollback;
- response-loss recovery;
- fresh-client cold reconstruction.

It does **not** establish:
- distributed multi-database consensus;
- arbitrary external-effect exactly-once semantics;
- production availability/service levels;
- consumer retry behavior outside the tested RPC boundary.

## 10. CONSUMER-CROSSING result

PASS at the **actual confined database/RPC consumer boundary** used by the existing ordinary runtime capability topology.

The test invokes public `SECURITY DEFINER` RPCs as `anon`, authenticated by the existing BUILD-11 runtime key, while private quadrant tables/functions remain inaccessible.

Several early test-harness failures were caused precisely by attempting forbidden direct private reads. Those failures were retained and repaired by moving the tests back to the public returned contract rather than weakening privileges.

**Not tested:** outward Vercel/MCP tool registration, ChatGPT/custom-app schema parity, or production consumer cutover. No such exposure was required to discriminate the current physical architecture and none is claimed.

## 11. SECURITY / AUTHORITY / EFFECT-boundary result

Observed:
- ordinary consumer cannot directly mutate private quadrant tables;
- wrong reviewer secret cannot assess;
- revoked reviewer cannot sustain new positive reliance;
- raw Artifact text cannot manufacture assessment status;
- ACTION/HOLD or retrieval is not used as effect authority;
- no effect executor exists;
- workflow contains no canonical Supabase target or service-role dependency for ECO-149.

The final containment checker was repaired after a false-sensitivity defect was discovered in run 7. The corrected checker avoids containing the literal canonical reference it searches for and fails explicitly on any match.

Run 10 emitted `ECO149_CONTAINMENT=PASS`.

Real PGO designation authority and real action/effect authority remain outside the candidate.

## 12. FAILURES + local repairs

The implementation episode retained failure lineage rather than treating retries as invisible:

1. Initial harness issue: psql variable use inside a dollar-quoted block prevented intended qualification. Local test repair.
2. Run 2: replay assertion attempted direct anonymous read from private `ecb_quadrant.records`. Privilege denial was correct; test repaired to inspect public RPC return.
3. Run 3: later anonymous RPC arguments again queried private quadrant records. Repaired by carrying channel/epoch from prior public returns.
4. Run 4: raw-PASS control queried private `ordinary_operations` even though the public Artifact RPC had already returned the Artifact identity. Repaired to use returned identity.
5. Run 5: patch introduced malformed `DO $` delimiters. Syntax-only repair.
6. Run 7: core qualification passed, but post-run audit found the canonical-reference containment check could self-match without failing because of its `! grep` shell construction. Checker repaired and explicit PASS receipts added.
7. Commission audit found required systems pressures under-covered. Added the decision-bearing pressure harness.
8. Run 10: full qualification, pressure suite and corrected containment all passed.

None of these failures required changing the accepted quadrant semantics or four-role/C1–C6 logical architecture.

## 13. FACT / INFERENCE / UNKNOWN

### FACT

- The exact qualified candidate head is `45dd7b9837848713f65d8efa89424d038c1da292`.
- Final evidence run `35410564998` succeeded.
- Predecessor BUILD 11 and corrected BUILD 12 qualifications passed in the reconstruction.
- The ECO-149 integrated SQL suite passed.
- Added systems-pressure suite passed.
- Corrected containment suite passed.
- No canonical Supabase mutation occurred.
- No quadrant effect executor was installed.
- Public RPCs can operate through confined anon/runtime-key capability while direct private DML remains denied.

### INFERENCE

The selected physical allocation—B11 operation identity + B12 immutable Artifact custody + private bounded semantic/currentness control surfaces + existing Claim/Evidence/standing primitives—is a coherent current-substrate basis for further URG/PGO capability work at Register B.

This evidence strengthens ECO-150's recommendation that a future BUILD 7' should reuse these current primitives rather than replay the historical BUILD-7 migration.

### UNKNOWN / unproven

- production installation behavior;
- Vercel/MCP outward interface parity;
- performance/load behavior;
- external model-provider failure behavior;
- real authority issuance/revocation sources;
- real action/effect adapters;
- universal semantic correctness;
- full URG architecture;
- Register-A independent replication/transferability.

## 14. QUESTION FORWARD / residual uncertainty

1. **BUILD-7' interface:** Does the current minimum URG/PGO interface remain coherent when mapped onto this proven current-substrate pattern?
   - Consequence: determines whether BUILD-7' can Shape directly or must reenter PGO/URG meaning.

2. **Authenticated judgment provisioning:** What production authority commissions/revokes semantic reviewer capability, if such a reviewer is needed?
   - Consequence: required before production positive reliance using that mechanism; not required to retain exploratory custody.

3. **Outward consumer exposure:** What is the first real use that earns MCP/tool exposure of a promoted capability?
   - Consequence: determines API/tool shape; absence does not invalidate the database/RPC architecture.

4. **External effect authority:** What real authority relationship and target earn a BUILD-8' effect adapter?
   - Consequence: remains a separate later Move.

## 15. REENTRY dispositions

No ECO-143/ECO-144/ECO-147 semantic/logical reentry was triggered.

Local implementation/test defects were repaired locally.

ECO-148 physical allocation is supported in the bounded tested class, with one practical refinement: use current B11/B12 primitives as the generic identity/Artifact plane and keep specialized semantic/currentness control private behind narrow public RPCs.

The production-promotion dependency question routes to ECO-150, not backward into the historical BUILD-7 migration.

## 16. REGISTER B VERDICT

**PASS — bounded integrated physical realization qualified for the tested isolated class.**

More exactly:

> Against a disposable reconstruction of the current ECB v2 substrate through ECO-140, the ECO-149 candidate demonstrates that the accepted four-role / C1–C6 quadrant architecture can be physically realized as a confined integrated database/RPC capability using current Referent, BUILD-11 operation, BUILD-12 Artifact, Claim/Evidence/standing and bounded new semantic/currentness mechanisms. The tested mechanism preserves the required negative distinctions, survives decision-relevant replay/concurrency/rollback/restart/revocation pressures, and keeps reliance separate from truth, authority and effect activation.

This verdict does **not** establish production installation, outward MCP parity, real authority/effects, full URG closure or Register-A standing.

## 17. EXACT NEXT SEAM

ECO-149 has produced the decision-bearing implementation evidence ECO-150 was waiting to harvest.

The next dependency seam is therefore:

1. ingest ECO-149 findings into ECO-150;
2. close ECO-150 Sense if its BUILD-7' dependency/interface recommendation remains unchanged;
3. open a separately governed BUILD-7' Architecture Shape / production-promotion commission against the **current** production baseline;
4. reuse the proven current-substrate mechanics where adequate;
5. do not apply the historical BUILD-7 SQL;
6. stop before canonical production installation unless that later commission explicitly reaches and authorizes its installation boundary.

Repository normalization of this qualified proof implementation may be performed separately from production database/runtime installation.