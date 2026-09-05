STATUS: REFROZEN AFTER CONSTITUTIONAL DELTA REQUALIFICATION — 2026-09-05 AMERICA/PHOENIX
DISPOSITION: TEST_AUTHORITY
ROLE: Worked Trace 07 — retained Artifact transformation and bounded check receipt
AUTHORITY: Explicit human reconciliation authorization for bounded acceptance tightening and Shape closure; no Move release

# Worked Trace 07 — Exact-version transformation checks

Recovered from provenance-only WIP `ea549649ad9993b0f89674227a2846423ce97076` and requalified on
hardening `0e969b9f72dc198976d7538748a341148edf09b2`. The corrected freeze adds P23 and its
same-checker sensitivity requirements. Original fixtures and P01–P22 are preserved. This is expected
behavior, not an execution receipt. ADR renumbering to 006 does not change WT07 identity.

## Frozen behavior and interpretation

TR1 → retained A1 → predeclared transformation request → retained A2 → previously committed check
attempt → bounded check → persistent Transformation Receipt. A defective output whose producer claims
success produces observed FAIL. Retained payload cannot be replaced with a hash or external locator.

Receipt coverage is **TR1→A1 grounding AND A1→A2 preservation**, reported separately. Scope is exactly
`recorded_transition_only`. A receipt is an Artifact specimen; it is not an assertion that the source
Claim is true, currently supported, accepted, warranted, authorized, governing, or current. E15 adds no
SIGMA→ECOS proof obligation. No Claim standing changes. E07's general state model is not promoted.

[Closed Shape](../build-shape/007-build-5b.md) binds physical fields, record roles, enforcement, checker
custody, transaction boundaries, and Output Contract. This trace supplies expected behavior and
falsifiers independently of the future producer's output. No executable PASS has yet been observed.

## Frozen fixture identities

Inherited, unchanged:

| Label | UUID |
|---|---|
| TR1 | a6925494-a862-441b-a361-5f5ec41dc9dc |
| C | 0f89e778-b16e-4840-9129-a2aa3eb6f697 |
| L | 4c6c0f50-a936-4da6-bb09-233f93320639 |
| GT01 | 19a949ea-a8fc-4250-a386-fa64e5530180 |
| C2 | c7f7d330-e778-4ae5-be96-3a172bea1166 |
| R | cb429206-5abd-4adb-8ff9-d6d6a885034c |

New identifiers reserved by Shape, not yet installed:

| Label | UUID | Role / participation |
|---|---|---|
| A1 | 8777e33d-7555-40aa-92f9-d5107395c0c7 | source_representation; context TR1 |
| OP1 | ba27d938-c586-4c09-ac31-9c67a2d0b5e0 | transformation_request; context A1 |
| A2 | 95b5db1d-cb79-439b-ae93-0bdaef5cfda2 | transformed_representation; context OP1; producer_succeeded=true |
| CHECK1 | 661fc2b6-63f8-4cfc-8d29-697213ac2286 | check_attempt; context OP1; target A2 |
| RC1 | 6d0b744b-9707-46cb-b771-9085501e93ee | transformation_receipt; context CHECK1 |
| OP2 | f64d508d-df25-47c8-8d6d-e26a6dc9a906 | transformation_request; context A1 |
| A_BAD | 9c322dda-54b8-4838-bdf1-2df471f0f992 | transformed_representation; context OP2; producer_succeeded=true |
| CHECK2 | 407027f9-05cf-4bc3-85dc-012d2e0aa3fe | check_attempt; context OP2; target A_BAD |
| RC2 | 1217d889-e874-4875-9c8a-d78c86156583 | transformation_receipt; context CHECK2 |

All new Artifacts have fresh same-UUID Referents. No family row, extra Claim, extra standing transition,
semantic relation predicate, or current-version designation is created.

## Exact source and output formats

A1 is the following single line of UTF-8 text, excluding the code-fence newline. Retain it verbatim:

```json
{"format":"transition_v1","event":"a6925494-a862-441b-a361-5f5ec41dc9dc","claim":"0f89e778-b16e-4840-9129-a2aa3eb6f697","from":"unassessed","to":"basis_qualified","recorded_at":"2026-09-05T02:24:35.793609Z","basis":{"link":"4c6c0f50-a936-4da6-bb09-233f93320639","evidence":"19a949ea-a8fc-4250-a386-fa64e5530180","scheme":"ecb_thought_revision_v1_sha256","linked_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55","observed_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"},"scope":"recorded_transition_only"}
```

A2 is the following single line, with the same text boundary:

```json
{"format":"basis_v1","basis":{"evidence":"19a949ea-a8fc-4250-a386-fa64e5530180","link":"4c6c0f50-a936-4da6-bb09-233f93320639","scheme":"ecb_thought_revision_v1_sha256","linked_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55","observed_digest":"5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55"},"transition":{"id":"a6925494-a862-441b-a361-5f5ec41dc9dc","claim":"0f89e778-b16e-4840-9129-a2aa3eb6f697","from":"unassessed","to":"basis_qualified","recorded_at":"2026-09-05T02:24:35.793609Z"},"scope":"recorded_transition_only"}
```

A_BAD is exactly A2 with the entire `observed_digest` member removed from `basis`, including its
preceding comma. Its producer still declares success. This is an actual retained defective output,
not a passing output with a fabricated failure label.

For other probe payloads, object key order and JSON whitespace do not change correspondence, but
exact stored bytes/digests must remain inspectable. All keys are mandatory and exhaustive, all leaf
values are strings, and all objects must have unique keys at every depth. `format` and `scope` have
exact literals above. UUID, UTC timestamp, and hex encodings follow Shape. Extra interpretation keys
such as `truth`, `current`, or `authorized` fail exact format. The checker must not silently delete,
normalize away, or fix a defective member to obtain PASS.

The transformation changes layout from transition-centric to basis-centric by moving event fields
under `transition` and preserving the five named basis fields. This is not arbitrary summarization.
A1 and A2 always differ in format/layout; equality of bytes is not the success condition.

## Frozen operation and attempt payload content

The database derives request payload with exactly these keys:

- `contract_id`: `ecb_transition_relayout_v1`;
- `contract_version`: integer 1;
- `source_format`: `transition_v1`;
- `output_format`: `basis_v1`;
- `scope`: `recorded_transition_only`;
- `coverage`: `grounding_and_preservation`;
- `obligations`: the ordered array `input_format, output_format, participation, grounding,
  preservation, checker_binding`;
- `checker_id`: `prepare_build_5b_artifact/v1`;
- `checker_definition`: full installed function definition obtained by database introspection;
- `checker_definition_digest`: its UTF-8 SHA-256 hex;
- `trust_boundary`: `service_role_producer; trusted_database_and_ddl; no_external_trust_root`.

An attempt payload has exactly `event` (`check_requested`), `operation_id`, `operation_digest`,
`input_id`, `input_digest`, `output_id`, `contract_id`, `checker_id`, and `checker_definition_digest`.
All are database-derived from the immutable request/input plus explicit target. The attempt does not
assert that an output exists, that a check ran, or that a producer report is true.

Payload serialization for these generated records is PostgreSQL jsonb text; exact generated bytes
and derived digest are retained. Producer representations use their exact supplied text. Receipt
payload keys and component outcome aggregation are frozen in Shape's Q5 section.

## Required canonical sequence after a separate Move release

1. Reverify the accepted predecessor read-only and run the required disposable rehearsal before
   canonical contact. Stop if existing facts differ; do not rewrite fixtures to accommodate drift.
2. Atomically activate schema and ledger as frozen by Shape. This transaction contains no fixtures.
3. In one later transaction, insert A1, OP1, A2, CHECK1, OP2, A_BAD, CHECK2 in dependency order. Verify
   their exact IDs/roles/payloads, derived hashes, generated specs, and Referent coupling, then COMMIT.
4. In a different top-level transaction, request RC1 and RC2 by their attempt IDs, with caller
   payload NULL and no derived columns. The database must derive RC1=PASS and RC2=FAIL. Assert results
   and full tuple bindings; COMMIT only if expected results and preservation checks hold.
5. In a fresh connection with no producer-memory dependency, reconstruct both checked input/output
   payloads, operation specifications/checker definitions, attempt/result IDs, source witnesses,
   component outcomes, and producer success reports from persistence alone.

A failed receipt stage leaves the committed attempts incomplete. Recovery must inspect exact IDs
before retry, verify all prior bytes, and complete only the missing stage. Partial presence within an
allegedly atomic stage is a discrepancy, not permission to insert around it. The migration record
proves schema activation only; it does not claim the fixture episode completed.

## Required observations

- RC1: all six components true, result PASS, source witness exactly the inherited episode, input and
  output digests independently recomputed from retained text, and both coverage directions explicit.
- RC2: producer_succeeded=true but output_format=false and result FAIL; grounding=true; preservation
  not evaluated if the malformed output prevents tuple extraction, with an explicit reason. The
  missing member is retained as missing. This failure confers no Claim standing or authority.
- A1 reconstructs byte-for-byte after both outputs exist. OP1 and OP2 preserve separate operation
  identities sharing the same input. No output is current merely because it was written later.
- After installation: 1 Thought, 16 Referents, 3 Claims, 1 Evidence Link, 1 standing transition,
  9 Artifacts; 6 public tables, 8 public functions, zero public views. One additional unique partial
  index beyond the new table's primary-key index; no other added schema surface.
- C remains ecb_inference/basis_qualified; TR1, L, GT01, C2 and R retain their accepted bytes. No new
  standing Event is used to manufacture receipt evidence.

## Frozen adversarial challenges — disposable database, no canonical probe residue

Use a disposable PostgreSQL database with the verified predecessor migrations/fixtures plus BUILD 5B.
Commit-dependent probes commit there. Do not disable immutable protections for cleanup; discard the
scratch database after collecting results. No current canonical database mutation is authorized by
freezing these tests.

| ID | Challenge | Required result |
|---|---|---|
| P01 | Update/delete/TRUNCATE A1, output, request, attempt, or receipt; include no-op and empty update | Each prohibited operation rejects. Retained original bytes and Referent coupling remain. No service_role bypass/trigger privilege is introduced. |
| P02 | Substitute only a URI or digest for A1 payload; then remove the external target | Format/grounding cannot PASS; exact old payload is required for legitimate reconstruction. No external fetch rescues absent stored payload. |
| P03 | Producer declares true while omitting observed_digest as in A_BAD | Observed FAIL; producer flag remains true and independent of result. |
| P04 | For each episode scalar, mutate A1 and map the same wrong value faithfully into A2 | Well-formed compatible mutations yield grounding=false, preservation=true, result FAIL. Use syntactically valid wrong UUID/time/digest/standing values. No deriving the expected result with the checker under test. |
| P05 | Rewrite request obligations after output exists; supply custom spec/receipt payload on insert | Update or forged non-null payload rejects. No caller-selected weakened obligation can pass. Creating another request uses the same fixed rule and a different operation identity. |
| P06 | Reuse passing receipt payload/ID for another output, operation, input, or attempt | Supplied receipt bytes reject, reused row ID rejects, wrong output participation is FAIL, and any legitimate new request recomputes rather than copying PASS. |
| P07 | Change bytes between checking and publication, or after receipt commit | Immutable write boundary rejects changes; aborting receipt publication removes receipt/its new Referent. Original committed marker remains INCOMPLETE. |
| P08 | No attempt; then committed attempt without receipt; then receipt with a registered target lacking native output | Distinguish NO_CHECK_PERFORMED at the scoped snapshot, INCOMPLETE/no_terminal_observation, and terminal INCOMPLETE/unavailable output. None is observed FAIL or PASS. |
| P09 | Correct A1/A2 both built from the same corrupted producer source cache | Checker reads actual source rows and gives grounding=false. State remaining correlated specification/checker/database limitations explicitly; a second agent is not the oracle. |
| P10 | Two operations share A1 and each produces its own output | Both may persist; branching has no unique/current successor implication. No re-use of BUILD 5A stale-prior rejection merely because a predecessor repeats. |
| P11 | Output and its Referent roll back before attempt publication | Attempt referencing the now-unregistered ID rejects. For registered-but-native-missing target, terminal result is INCOMPLETE. Successful receipt cannot remain for a nonexistent persisted output. |
| P12 | Observe Claims, L, TR1, GT01, C2, R before/after every result category | Byte-identical; no standing transition, support/currentness propagation, authority designation, or new relation assertion. |
| P13 | Duplicate JSON keys, malformed JSON, null/number instead of required string, extra truth/currentness fields | Strict format fails before lossy parsing/coercion can yield PASS; original text retained. Probe both nested and top-level duplicates. |
| P14 | Create attempt and request receipt in same transaction, then repeat through SAVEPOINT/release | Receipt rejects before actual checking because top-level created_xid is the same. Rolled-back marker cannot have supported a performed check through this boundary. |
| P15 | Attempt committed; kill/disconnect or force rollback after receipt computation but before commit | Fresh reader sees committed attempt and no receipt, hence INCOMPLETE. If commit acknowledgement was uncertain, exact-ID read resolves actual persisted result. Never infer success from INSERT RETURNING alone. |
| P16 | Another session tries an uncommitted attempt, then retries after its commit | It cannot check the invisible marker; a new transaction may check after commit. No dirty-read or top-level XID forgery is accepted. |
| P17 | Two sessions publish different receipt IDs for the same committed attempt | Unique partial index permits at most one terminal result. Test winner-commit and winner-rollback branches separately; assert blocking and final row/Referent counts. No contradictory requirement that a committed winner also roll back. |
| P18 | Re-submit exact completed attempt after an uncertain client outcome | Read and verify the existing receipt tuple; duplicate insertion cannot add another receipt or orphan Referent. A re-observation uses a new attempt. |
| P19 | Request's checker definition/binding is no longer supported | Terminal INCOMPLETE/checker_definition_mismatch without running a different check under the old identity. Use an isolated alternate checker-definition deployment for this probe, not a mutation of canonical authority. |
| P20 | Supply forged payload_digest, recorded_at, created_xid, or producer flag on a non-output role | Column/role protection rejects. Recompute every retained payload hash independently. Forged created_xid cannot bypass committed-attempt gating. |
| P21 | Registered source Referent has no Event native row or lacks its Link native row | Terminal INCOMPLETE with scoped unavailable source; unknown is not nonexistent/false. A physically present source whose fields contradict A1 is FAIL, not silently filtered out as missing. |
| P22 | Mis-typed native context, self-reference, forward-reference cycle, or an existing Referent ID reused for a new Artifact | Invalid native creation rejects without residue. Referent row remains id+registered_at; identity is not co-reference. |
| P23 | Preserve valid output format and correct A1/source, but change only A2 basis.observed_digest to 64 zero hex characters; producer_succeeded remains true | Through the identical installed checker/spec as the unchanged A2 control: input_format=true, output_format=true, participation=true, grounding=true, preservation=false, checker_binding=true, result FAIL. The unchanged A2 control yields all six true/PASS. No malformed-format rejection or source-grounding failure may substitute for detecting the preservation violation. |

For P04 and P09 use a constant fixture witness independent of producer/checker logic. For P19 retain
which alternate implementation was deployed and prove the mismatch, not a vacuous always-pass flag.
Malformed invocation rejection is distinct from an observed failed check; the implementation must
not catch arbitrary database exceptions and emit a made-up FAIL or PASS.

## Proof-sensitivity controls — frozen hardening delta

The governing proof-sensitivity law requires discrimination by the same checking surface used for the
proposition under test. The canonical A_BAD/P03 negative control establishes format sensitivity;
P04/P09 establish grounding sensitivity. Neither alone establishes preservation sensitivity because
P03 may stop tuple extraction and P04 deliberately preserves its wrong input faithfully.

P23 closes that gap in the disposable rehearsal. Start with the exact frozen A1 and A2 and the
installed `ecb_transition_relayout_v1` specification. Use the normal request/output/committed-attempt/
receipt path for both controls under the same checker definition and binding. The sole payload
mutation is `basis.observed_digest` in the output, set to
`0000000000000000000000000000000000000000000000000000000000000000`, a syntactically valid digest that
differs from the frozen source. The independently fixed expected outcomes are those in P23.
All other output values and producer_succeeded=true are preserved. Output bytes/hashes, request and
checker bindings, receipts, and component observations must be retained in the rehearsal report.
Do not derive the expected result by calling the checker or reuse the producer to define the oracle.

A duplicate wrapper, a fabricated failure label, invocation rejection, an always-PASS checker, or a
control exercising a different checker/spec cannot satisfy P23. The positive result and known
violation must be differentiated by the actual receipt-deriving function with no test-only behavior.
Use separate exact operation/attempt identities where required; do not bypass the one-result-per-
attempt rule. These controls add no canonical fixture; the existing nine reserved rows are unchanged.

Report the scope supported by each control and its observed components. A failed or unperformed
control supplies no proof of that obligation: report the observation or indeterminacy and withhold
the WT07 pass/Move evidence claim. This does not add a runtime receipt standing, a new enum, or a
per-receipt calibration gate; the selected six-component runtime rule is unchanged. A finite control
does not certify every possible error, database correctness, or completeness of the specification.

The [Shape pressure matrix](../build-shape/007-build-5b.md#standing-adversarial-pressure-dispositions)
traces all twelve governing pressures to P01–P23 or explicit constraints, with scoped deferral leases.

## Fresh-context reconstruction and checking limits

A fresh consumer retrieves each receipt and follows attempt → operation → input, plus target output.
It obtains exact bytes, spec and checker definition, witness, component results, producer report,
observation metadata, and distinct transaction IDs from the database. The consumer recomputes hashes
without calling the stored check function. No fixture lookup in process memory may stand in for
persisted payload/spec/witness. Expected fixtures may judge the recovered content, not supply it.

Where no terminal receipt exists, inspect attempts; do not use absence alone to claim the checker did
not run. Where no attempt exists, the committed-marker gate justifies only the bounded statement that
no check through this installed boundary could have run before that snapshot. External computation,
concurrent later commits, and owner/DDL bypass are not covered. A result proves a bounded check under
its declared contract, not universal checker correctness or independence of all possible errors.

## Frozen two-layer regression boundary

Layer A: all BUILD 0–5A historical harnesses, receipts and preexisting acceptance text remain
byte-identical. Do not re-run old exact-cardinality gates against the expanded schema and then weaken
them. The accepted BUILD 5A D1 repair remains historical authority.

Layer B: verify enduring capture/fetch/search and their atomic capture boundary; same-UUID Referent
registration and bare identity semantics; Claim/evidence/origin distinctions; all four WT03 evidence
revision outcomes; the exact Thought digest scheme; relation direction/repeated assertions and no
propagation; existing RLS/function protections and no additional Claims UPDATE/DELETE grant; TR1's
transition/history atomicity, forgery/no-op/stale-prior rejection, repaired concurrency requirement,
retained basis vs observed revision, and C2/R preservation. Project only whole-schema counts/inventories
to the permitted Artifact expansion. The Artifact receipt does not itself certify these regressions.

Run mutation-bearing Layer B probes on the disposable rehearsal with the frozen canonical fixtures;
canonical verification reads actual deployed definitions, privileges, fixture contents and counts.
If those disagree with the tested artifact/state, stop and classify the discrepancy. No canonical
probe rerun is authorized merely by a document update.

## Pass, failure, and stopping rule

PASS requires the same-surface positive/negative controls including P23, every applicable expected
result, all adversarial cases, byte reconstruction, independent
hashes, both coverage directions, durable-attempt failure semantics, and Layer B preservation. Report
each challenge explicitly; no vacuous assertions or unchecked captured booleans. Canonical state must
contain only the nine new fixture Artifacts/Referents; scratch probe state must not appear there.

FAIL includes any false producer success becoming PASS; lost payload; changed checked bytes;
ambiguous request/receipt tuple; lack of start evidence after an executed-but-aborted check;
loss of failed/incomplete observation; unearned authority/currentness; or an enduring regression.
Classify implementation, probe, tooling, and Shape/contract defects before selecting a repair route.

Passing this trace later does not accept BUILD 5B or open BUILD 6. Move must stop for human Metabolize.
This Shape freezes expected behavior only. **MOVE remains unreleased.**
