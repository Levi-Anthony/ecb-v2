STATUS: SHAPE CLOSED — 2026-09-05 AMERICA/PHOENIX; MOVE NOT RELEASED
DISPOSITION: DECISION_RECORD
ROLE: Bounded BUILD 5B second examination and Output Contract
AUTHORITY: Explicit human Sense-closure and Shape authorization; subordinate to governing invariants

# BUILD 5B Shape — Retained representations and bounded check receipts

## Entry and human corrections

[SENSE is closed](../build-sense/007-build-5b.md) by the human disposition in this thread. The accepted
focal episode is TR1 → A1 → predeclared transformation → A2 → bounded check → persistent receipt,
including defective output whose producer reports success. All five corrections are applied:

- active Q1–Q6 do not create an aperture; the unearned entry is removed;
- AP-02 is narrowly reactivated for retained Artifact payload, exact versions, and minimum retention;
- a Transformation Receipt is evidence of a bounded check, never acceptance, warrant, authority,
  authorization, standing, or currentness;
- E15 is methodological evidence for predeclared obligations, not a SIGMA→ECOS correctness requirement;
- Artifact representation and receipt semantic role remain distinct; a receipt may be an Artifact
  specimen without requiring another physical primitive.

Predecessor remains `d2ee85b7fcf38192c94720977e1d51325769ddc0`, tree
`9404280ad44d8d1f7d9532517dbc12dfe974dfba`. The existing uncommitted Sense documents were preserved and
corrected. There was no canonical contact, executable implementation, schema application, commit, or
remote mutation during Shape. Closure below is a design disposition, not observed implementation PASS.

## Second examination: candidates and exact rejection reasons

| Candidate | Examination and disposition |
|---|---|
| K1: mutable document plus hash/locator | Reject: removing the locator target prevents A1 reconstruction; a hash cannot recover payload. Overwrite also makes an earlier check refer to different bytes. |
| K2: immutable versions plus producer-written receipt | Reject: producer emits success for A_BAD and supplies matching-looking result metadata; no independent path discriminates the missing observed digest. |
| K3: run the producer transformation twice / compare only A1 and A2 | Reject: both reproduce an erroneous source fact. Exact preservation of wrong A1 passes while TR1 grounding fails. A second process using the same derivation is insufficient. |
| K4: one transaction for output, check-start record, and receipt; absent receipt means no check | Reject: checker can run, then transaction aborts; persistence equals the never-run case. Neither absence nor an in-transaction start marker distinguishes the two. |
| K5: dedicated Artifact-family, version, operation, checker-role, witness, and receipt tables with current-version counter | Not required by any surviving falsifier. A mutable head imports currentness/single-successor pressure; separate semantic obligations do not earn all these physical structures. Dedicated typed tables could be lawful later but cost more for this episode. |
| K6: external checker with independently credentialed publisher | Viable in principle, but requires another credential boundary and an authenticated result-publication protocol. The local property is decidable from persisted typed source rows and fixed field correspondence; independent credentials do not themselves improve detection of a shared specification error. No external actor, key, or service is earned here. |
| K7: one immutable Artifact store, role-checked participation, database-derived checks, previously committed attempt marker | Survives the named adversarial cases at design level. Five record roles preserve the distinct obligations; exact payloads are retained; the checker obtains source facts independently of the producer; publication is inseparable from checking; a committed marker survives an aborted check. Selected. |

K7 was refined from an initially smaller four-role model after K4's indistinguishable histories were
identified. The fifth role and commit-boundary discriminator are earned by Q4/Q5, not general job
orchestration. The rejected four-role form is not described as having always solved that problem.

## Q1 — identity, versioning, and lineage

Select one table, `public.artifacts`, with five native record roles:

| `artifact_role` | Meaning | `context_id` | `target_id` |
|---|---|---|---|
| `source_representation` | Retained A1 input bytes that purport to represent an Event episode | Source Event Referent, TR1 in WT07 | NULL |
| `transformation_request` | Immutable predeclared operation/specification specimen | A1 Artifact | NULL |
| `transformed_representation` | Retained candidate output bytes plus producer-success assertion | Operation request | NULL |
| `check_attempt` | Durable request to check this operation/output tuple; does not claim execution | Operation request | Output Referent to examine |
| `transformation_receipt` | Database-derived terminal check observation | Check-attempt Artifact | NULL |

Every row has its own UUID and same-UUID Referent registration. No row reuses the UUID of the thing it
represents. A1 and each transformed output are individually addressable versions; input lineage is
reachable as output → operation → A1. Separate Artifact-family identity and numeric version/head
counters are not earned. Distinct operations and outputs may share A1. This expresses branching, not
supersession, equivalence, unique succession, or currentness. No content-hash uniqueness is installed.

The minimum transform accepts A1's source format and produces the output format below. It is not a
general arbitrary-depth editor or operation graph. Later formats require another scoped decision.
Operation, attempt, and receipt records are Artifact specimens with different obligations. Their
persistent identity does not introduce a new logical primitive or an Actor/Mapper ontology.

## Q2 — exact transformation and coverage

Freeze **both** TR1→A1 grounding and A1→A2 preservation for the first receipt. They are reported
separately. A preservation-only result is insufficient for PASS and may not imply source grounding.
The checked scope is `recorded_transition_only`. It checks an account of the recorded episode, not
whether Claim C is true, whether its original qualification was correct, or whether a source is
currently supportive. No present Thought payload/digest or applied Claim standing is used as a
substitute for the historical Event and Evidence Link.

The source tuple is obtained directly from one SQL observation joining the Event's
`basis_evidence_link_id` to L. Observe L's `claim_id` as well and compare it to the Event's claim;
a present inconsistent Link is a grounding failure, not a filtered-out missing row:

`event_id, claim_id, from_standing, to_standing, recorded_at, link_id, evidence_referent_id,
evidence_revision_scheme, evidence_revision_digest, observed_revision_digest`.

Recorded time is rendered as UTC with exactly six fractional digits and `Z`; UUIDs are lowercase
canonical strings; digests are lowercase 64-character hex. Representation formats and the literal
WT07 fixture are frozen in [Worked Trace 07](../acceptance/build-5b-wt07.md).

The operation specification `ecb_transition_relayout_v1` is fixed before any output can be inserted.
It declares source format `transition_v1`, output format `basis_v1`, coverage `grounding_and_preservation`,
scope `recorded_transition_only`, and obligation identifiers:

`input_format, output_format, participation, grounding, preservation, checker_binding`.

No caller may provide or edit an operation specification. Request insertion derives its complete
specification plus the exact installed checker definition and SHA-256 of that definition. That
payload is retained, not just its hash. The checker identity is `prepare_build_5b_artifact/v1`.
Output insertion requires an already-existing request. The specification is also a fixed installed
constant: creating a new request after privately computing bytes cannot rewrite the checked rule.
The system makes no claim about when private producer computation occurred.

## Q3 — checking power and trust boundary

The producer is a local TypeScript transformation in the future WT07 harness. It constructs output
from parsed A1 with a declared field mapping; it does not create receipt outcomes. The SQL checker
independently reads stored text, verifies strict shape, obtains the source tuple from typed Event/Link
rows, and compares grounding and preservation separately. It must not invoke the producer, consume a
producer-supplied expected answer, or accept the producer's success flag as evidence of preservation.

This different evidence path catches: omitted/changed/swapped fields; source errors consistently
repeated in A1/A2; extra truth/currentness assertions; altered operation participation; duplicate JSON
keys; malformed payloads; replay or code-binding mismatch. It does not prove that the declared contract
is complete, that PostgreSQL or SHA-256 is faultless, or that a defect shared by the specification,
checker, and acceptance oracle cannot survive. Mutation cases with independently fixed expected
outcomes validate discriminating power before Move touches canonical state. Agent/process count is
not the independence criterion.

The bounded adversary has the existing `service_role` capabilities: it can submit representations,
request operations/checks, lie about producer success, replay submissions, and choose permitted IDs.
It cannot update/delete Artifact rows, disable triggers, alter checker code, forge derived columns, or
write a result without executing the checker. Trusted database ownership, DDL access, and the release
process remain outside that boundary. A database owner who rewrites the checker and its evidence can
falsify any self-hosted database receipt; BUILD 5B does not claim a cryptographic external trust root.
This limitation is carried in every operation specification, not hidden in the final report.

## Q4 — what survives and four-way discrimination

Retain exact PostgreSQL text payloads for A1 and candidate outputs, including malformed/failed output;
operation specification and full checker definition; native participation IDs; attempt identity;
terminal receipt, component outcomes, source witness, and the exact input/output/operation/checker
hashes observed. No deletion/expiry policy is activated in this slice. Payload bytes mean UTF-8 encoding
of stored text, with no normalization. Hash scheme is `ecb_artifact_utf8_sha256_v1`, plain SHA-256 of
those bytes, distinct from the Thought digest scheme. Receipt text and operation text are themselves
retained Artifact payloads with derived digests. Hashes bind evidence; they never replace it.

The following projection is performed from persistence for a specified operation/output tuple, not
by selecting the newest row:

| Persisted state | Truthful observation |
|---|---|
| No committed attempt in the observer's snapshot | `NO_CHECK_PERFORMED` **through this checker boundary as of that snapshot**. The checker cannot run without a previously committed attempt. No claim about arbitrary external calculations or a later concurrent commit. |
| Attempt exists, no terminal receipt | `INCOMPLETE`, reason `no_terminal_observation`. Check was requested; it may not yet have run, may be running, or may have aborted. Never call this an observed check failure. |
| Receipt has observed violating component(s) | `FAIL`, with explicit false components, preserving any missing evidence flags too. |
| Receipt has no observed violation but required evidence/binding is unavailable | `INCOMPLETE`, with missing components/reasons; never PASS. |
| Receipt has all six components true | `PASS`, only for the exact frozen tuple and declared scope. |

Multiple attempts are inspected individually. No “latest result wins” rule is installed. A failed
attempt is not overwritten by a later successful attempt. A completed receipt with unavailable
source evidence is a persisted incomplete observation, distinct from an attempt without a terminal
observation. No terminal receipt is inferred from the producer's report.

### Why the marker must commit first

Every Artifact gets database-derived `created_xid` of type `xid8`, using `pg_current_xact_id()`.
Before checking any payload for a receipt, its visible attempt must have a different `created_xid`
from the current top-level transaction. A visible immutable row not created by this transaction was
committed already under PostgreSQL visibility rules. A savepoint cannot bypass this: the function
returns the top-level ID even in a subtransaction. No XID ordering, wall-clock comparison, transaction
status retention, or 32-bit `xmin` arithmetic is used.

Thus a check that actually passes its entry boundary cannot erase its own start marker by aborting.
Absent marker and aborted check no longer have identical persisted histories. An invocation rejected
before that boundary is not a performed bounded check. Attempts do not promise eventual completion;
there is no background worker, lease, or liveness guarantee.

The XID is local execution metadata, not Referent identity, version order, or bitemporal validity.
A logical import into another cluster requires explicit requalification of this execution metadata;
copying XIDs blindly is outside this slice and is a reopening trigger.

## Q5 — physical realization and enforcement

Exactly one new table; no changes to existing tables, functions, grants, enums, or Claim standing.

| Column | Physical contract |
|---|---|
| `id` | UUID primary key; default generated UUID; fresh same-UUID Referent registration required |
| `artifact_role` | Non-null text; exactly the five roles above, a native discrimination tag rather than Claim kind/standing |
| `context_id` | Non-null UUID; restrictive, non-deferrable FK to Referents |
| `target_id` | UUID; restrictive, non-deferrable FK to Referents; non-null only for check_attempt |
| `payload_text` | Non-null text after preparation; exact producer bytes for representations, derived for other roles |
| `payload_digest` | Non-null bytea; exactly 32 bytes, database-derived |
| `recorded_at` | Non-null timestamptz; database-derived transaction timestamp, not currentness or execution order |
| `producer_succeeded` | Boolean; non-null only for transformed_representation; separately inspectable producer assertion |
| `created_xid` | Non-null xid8; database-derived top-level creation transaction |

`id` also has a restrictive, non-deferrable FK to Referents. Target nullability and producer-flag
nullability are explicit CHECKs by role. CHECKs also reject context_id=id and target_id=id. There is one additional unique partial index on `context_id`
where role is transformation_receipt: one terminal observation per attempt. It is earned by retry
and concurrent-publication ambiguity. It imposes no uniqueness on output lineage or content.

Two new trigger functions, both `SECURITY INVOKER`, with empty search_path and fully qualified names:

1. `public.prepare_build_5b_artifact()` — row BEFORE INSERT; validates allowed input roles/columns,
   resolves native participants, derives spec or attempt or receipt payload, derives hashes/time/XID,
   and registers the fresh Referent. An ID already registered is rejected, matching the fresh-native
   creation posture; this does not introduce a general native-binding lifecycle.
2. `public.reject_build_5b_artifact_mutation()` — statement BEFORE UPDATE OR DELETE OR TRUNCATE;
   always raises, including no-op or zero-row attempts. No bypass parameter, replication-role change,
   or temporary privilege grant is available to service_role.

Revoke all function execution from PUBLIC, anon, authenticated, and service_role. The functions are
used only by their installed triggers. Enable RLS with zero policies; revoke all table privileges from
those roles, then grant service_role SELECT and INSERT only on
`id, artifact_role, context_id, target_id, payload_text, producer_succeeded`. Retain the existing
Referent SELECT/INSERT(id) grants. No UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, or table-wide INSERT
grant is added. Digest, time and XID are not caller-insertable. For operation/attempt/receipt roles,
non-null caller payload is rejected before derivation; NULL/omission requests preparation.

Ordinary immutable participants need no row locks: there is no mutable head and no allowed row update.
Source Event/Link observations are obtained by one joined SELECT snapshot, with the witness copied
into the receipt. No additional UPDATE grant or SECURITY DEFINER function is introduced just to use
row locks. Owner/DDL bypass is outside the stated producer threat boundary.

Native validation:

- source_representation requires only the registered source Referent; its purported Event/source
  contents are checked later, so wrong/missing native evidence remains observable rather than erased;
- transformation_request context must be a source_representation; its payload is derived;
- transformed_representation context must be a transformation_request; payload may be malformed so
  observed failures can be retained; its exact bytes are not silently corrected;
- check_attempt context must be a transformation_request; target must be registered, but need not
  have an available output native row; its derived payload binds operation/input IDs and digests,
  target ID, contract/checker identities, and means only `check_requested`;
- transformation_receipt context must be a check_attempt committed in a different top-level
  transaction. Its target is derived from the attempt. A wrong native output role or output belonging
  to a different operation is an observed participation failure. An absent native output is unavailable
  evidence. The same distinction applies to unavailable source Event/Link versus observed mismatch.

### Receipt evaluation and payload

`input_format` and `output_format` require JSON objects with unique keys at every depth, exact key sets,
correct string types and literals, and no extra fields. Apply the JSON uniqueness test **before**
conversion to jsonb can discard duplicate keys. JSON syntax/representation errors produce an observed
format failure; an unexpected database/permission/internal error aborts the statement and leaves the
committed attempt incomplete, not a fabricated terminal result.

`participation` checks output role and native operation pointer. `grounding` compares A1's full
normalized tuple to the separately read source witness; `preservation` compares A1 and A2 tuples and
their bounded scope. `checker_binding` requires the request's retained specification/checker identity
and definition hash to match the installed implementation before evaluation. A different definition
or unsupported spec is unavailable checking capability: INCOMPLETE, not an invented result under
another contract. Do not evaluate further with an unqualified checker.

For evaluable checks, true/false/null are preserved individually. False means an observed violation;
null means not evaluated or unavailable, with a reason. Any observed false yields FAIL, even if other
components are unavailable; otherwise any null yields INCOMPLETE; only all true yields PASS.
Producer_succeeded is recorded but has no weight in this rule.

The derived JSON receipt has exactly: `receipt_version` (1), `scope`, `coverage`, `attempt_id`,
`operation_id`, `input_id`, `output_id`, `operation_digest`, `input_digest`, `output_digest`,
`checker_id`, `checker_definition_digest`, `observed_checker_definition_digest`, `producer_succeeded`,
`checks`, `reasons`, `source_witness`, and `result`. Digests are hex strings or null if unavailable;
checker_id is the fixed identifier above. `checks` has exactly the six named obligations, each boolean
or null. `reasons` maps each non-true check to one of `mismatch`, `invalid_format`, `unavailable`,
`not_evaluated`, `wrong_participant`, or `checker_definition_mismatch`. `source_witness` is the ten-field
source tuple with L's observed `claim_id` as an additional `link_claim_id` consistency field, or null.
Stored representation rows supply exact full bytes; the request supplies the full retained checker
and obligation definition. The receipt does not duplicate a canonical relation assertion.

Observation time and transaction are the receipt row's metadata. Timestamp ordering is not used to
prove commit ordering. A result returned by INSERT RETURNING is uncommitted until its transaction
commits. The producer/harness may report durable receipt creation only after confirmed commit or a
fresh exact-ID read resolving an uncertain commit.

### Publication, retry, and crash cases

- Schema activation is atomic by itself. No BUILD 5A record is strengthened or changed during it;
  concurrent old writers need no new activation lock. Reverify preservation at Move's named gates.
- A1, operation, output, and check_attempt may commit together; result computation is forbidden in
  that transaction. The boundary is enforced by created_xid, not caller sequencing advice.
- Receipt INSERT computes the result and writes its payload/Referent in one transaction. Failure
  rolls back both; the attempt survives. There is no separate caller-supplied passing-status write.
- If output creation rolls back, its Referent rolls back too; an attempt referencing that unregistered
  ID is rejected. If a target Referent exists but native output is unavailable, receipt is INCOMPLETE.
  Neither case can manufacture PASS for a nonexistent persisted output.
- A concurrent uncommitted attempt is invisible to another checker and cannot be used. After commit,
  a fresh transaction can check it. Same-transaction and savepoint bypasses reject before checking.
- Multiple publishers for one attempt may compute, but the unique partial index permits only one
  terminal receipt. A losing insert rolls back its new Referent; read the existing exact-attempt
  receipt and verify its tuple. A retry does not update it. Another observation needs a new attempt.
- Aborted receipt insertion cannot leave a successful receipt. Aborted attempt creation cannot have
  passed the different-top-level-transaction entry test. A committed attempt without a terminal
  observation remains explicitly incomplete, including after disconnect or restart.

## Q6 — participation versus asserted relation

The role-dependent pointers specify what this native record consumed, requested, or checked. They
are not open-ended subject/predicate/object assertions, and they cannot express `depends_on`, support,
supersession, or currentness. There is no inverse/mirrored graph register and no additional relation
predicate. To assert such a semantic relation later, use the governing Claim route. Source witness
and repeated IDs in a receipt are observation evidence, not another canonical relation truth store.
AP-07 is not broadened. No Referent row gains type, standing, positional, or quadrant semantics.
Future shaped examinations may still be independently addressable Artifacts over stable focal Referents.

## Enforcement mapping

| Obligation | Mode / surface | Failure behavior |
|---|---|---|
| Identity, immutable payload, exact native participation | STRUCTURAL / PK, FKs, role CHECKs, insertion and mutation triggers, grants | Reject invalid write; no orphan Referent or partial artifact |
| Predeclared specification and receipt field custody | STRUCTURAL / insertion trigger and column grants | Reject forged payload/derived fields; no producer-written PASS |
| Marker survives failed check | STRUCTURAL / derived xid8 plus distinct-transaction gate | Reject same-transaction computation; committed attempt remains on later failure |
| Grounding and preservation under declared rules | STRUCTURAL comparison plus OBSERVATIONAL / SQL check and retained witness | FAIL on observed violation; INCOMPLETE on missing evidence; no authority or semantic-truth claim |
| Result and exact evidence binding | STRUCTURAL / immutable rows, trigger, hashes, unique attempt-result index, transaction | Replay mismatch cannot reuse passing payload; no receipt for rolled-back result |
| Human/governance acceptance or currentness | Not activated | No new authority policy, standing, designation, or automatic upstream consequence |

## Pinned installation qualification — completed for this candidate

Follow-up is scoped to retained snapshots, write custody, source/operation binding, and tests. All v1
reads use `cfa7a6dd3b849f399a4aff9f7596da1752bc7871` in the local ecos repository. No v1 runtime was run.

- `supabase/migrations/20260602100000_artifacts_v2.sql:40–138,155–230,305–330` shows separate mutable
  blocks, revision ledger, snapshot payloads, initial broad grants, version interlock, and patch return.
- The later `20260605010000_artifact_v3_human_door.sql:312–419,675–712,1178–1210` actually captures
  reconstructable block-state/content and invokes snapshot writing inside patch execution; it revokes
  direct writes and exposes bounded functions. `write_artifact_snapshot` nevertheless uses an upsert
  that updates an existing version's snapshot and is service-role callable. Thus a retained snapshot
  is not by itself an immutable, independently checked receipt. Do not inherit its update path or
  treat self-generated `reconstructable=true` metadata as independent verification.
- A pinned search for function definitions found later patch-engine replacements. The terminal
  `20260619220327_artifact_block_reorder_op.sql:197–208,450–475` retains the version lock and synchronous
  snapshot write. No later `write_artifact_snapshot` definition was found at this pin. The finding is
  based on these implementation paths, not solely the opening design document.
- `scripts/ecb-artifacts-v2-verify.py:87–147,178–185` asserts block content/hash visibility, stale-version
  and bad-hash rejection, unchanged version after failure, snapshots, and reconstructable block state.
  These are useful test patterns, but checking a returned flag/path is narrower than validating every
  declared preservation obligation. The script intentionally leaves a test artifact and calls a live
  MCP endpoint; it was inspected, not executed or adopted as this build's harness.
- `supabase/tests/artifact_v3_human_door.sql:55–85,278–315` checks direct-write/role boundaries and
  database-derived revision identity, and ends in rollback. It concerns human-governed editing, not
  this receipt semantics. None of its role/authority ontology is imported.

**Disposition:** preserve retained payload and independent inspection of exact state; rebuild the
immutable write/check boundary for the frozen episode. Decline editor/embeddings/current-version/human
review machinery because no falsifier requires it. No unresolved prior-art contradiction blocks K7's
selection under the declared threat model. Any future candidate that invokes an unexamined v1 mechanic
must reopen only the applicable qualification seam.

Current official docs confirm the mechanics used by the design: [JSON uniqueness testing](https://www.postgresql.org/docs/17/functions-json.html),
[transactional triggers](https://www.postgresql.org/docs/17/trigger-definition.html),
[top-level xid8](https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-TXID-SNAPSHOT),
[transaction visibility](https://www.postgresql.org/docs/17/transaction-iso.html),
[built-in SHA-256](https://www.postgresql.org/docs/17/functions-binarystring.html), and
[invoker functions and execution grants](https://supabase.com/docs/guides/database/functions).
Supabase's changelog was consulted; the inspected breaking changes do not require an extension,
API/logging integration, or platform change for this design. This does not replace installed-version
verification and local database probes at Move entry.

## Output Contract — bound, executable only after a separate Move release

Move may produce exactly:

1. One timestamped SQL migration creating artifacts, the two functions, two triggers, and one partial
   unique index above, with exact constraints/RLS/grants. It changes no existing schema/grant/function.
   Activation and migration-ledger recording must be one transaction. Generate the filename through
   the project CLI only during Move; use a single outer transaction with the new file's exact bytes
   and a parameterized migration-ledger write, without a nested BEGIN/COMMIT in the file. Record file
   hash and runner evidence. Rollback-probe this mechanism before canonical application; if the runner
   cannot prove both properties, classify and stop before applying rather than inherit old mechanics.
2. One local WT07 harness, including the small A1→A2 producer, independent fixed expected mutations,
   fresh-context reconstruction, and fixture activation/resumption by exact IDs. No public MCP tool,
   app API, runtime endpoint, worker, or new service. Format/lint/type checks and a disposable PostgreSQL
   rehearsal are required before canonical fixture work. Use the installed predecessor's PostgreSQL
   major version; if unavailable, resolve tooling before touching canonical state.
3. Canonical WT07 fixtures only as enumerated in its authority: seven pre-check Artifacts, then two
   derived receipts in a later transaction, for nine Artifacts/nine Referents total. Each stage is
   atomic and verified by exact IDs and digests. Existing fixture at a stage must match exactly or
   stop; never overwrite or duplicate it. No Claim standing change or additional standing Event.
4. A minimum BUILD 0–5A Layer B regression projection for the permitted added inventory, preserving
   all enduring behavior listed in WT07. Historical Layer A harnesses/receipts remain byte-identical.
5. Minimum test/readme/lockfile wiring; one BUILD 5B execution receipt reporting actual results,
   discrepancies, final counts, source/implementation pins, and honest checking limitations; checkout
   update with observed Move evidence. That execution receipt is not a substitute for RC1/RC2.

Testing with committed check-attempts is required and must use a disposable noncanonical database for
fault/crash/savepoint/concurrency cases. Do not disable immutable protections or add canonical fixtures
just to clean up probes. Canonical contact is the schema activation, the frozen fixture stages, and
named read-only confirmation; mutation-bearing old regressions run against the disposable rehearsal
with the preserved fixture state. Every contact answers a named question. No ritual canonical reruns.

No code, migration, canonical mutation, deployment, credentials, commit, or push is performed by this
Shape document. Human Move release must anchor the reviewed Shape tree and define the entry gate.

## Closure, apertures, and reopening

Q1–Q6 are closed narrowly by the selected identities/lineage, both-scope check, distinct evidence path,
retention and marker rule, publication boundary, and native participation semantics. AP-02 is narrowed
for this Artifact slice; Thought retention/version guarantees remain unchanged. AP-01 has no new Claim
standing; AP-03/04 remain inactive; AP-07 remains unbroadened. No new aperture is created for these
resolved local decisions. E07 and E15 remain unpromoted as general doctrine.

The [WT07 acceptance authority](../acceptance/build-5b-wt07.md) is frozen in Shape. Its challenges cover
all human-specified falsifiers plus duplicate-key parsing, subtransaction bypass, incomplete attempt
recovery, and competing result publication. The constraints are logically compatible: the attempt
commits first; output is not rolled back while a successful receipt survives; crash probes run on an
isolated database and do not need extra canonical residue. Implementation still has to prove them.

Reopen Shape if a named adversarial case defeats K7; the exact checker cannot discriminate a declared
producer defect; source witness cannot be read consistently; the ordinary role can mutate/bypass the
boundary; the committed-marker gate does not work on the actual installed engine; or importing prior
rows across a database installation invalidates the XID assumption. Broader transformation semantics,
new native roles, expired retention, a new checker definition, or an external trust-root requirement
also require an explicit later decision. A tooling or probe defect alone does not reopen architecture.

Reopen Sense/human contract disposition only if the accepted episode or governing distinctions must
change. No such blocker was found under the declared boundary. **SHAPE=CLOSED; MOVE=UNRELEASED.**

## Shape verification record

Documentation verification passed: local link targets and fenced blocks; nine unique reserved fixture
UUIDs; all twenty-two challenge identifiers; literal A1/A2 field correspondence; source UUIDs, digests,
and TR1 time anchored to the accepted BUILD 5A receipt. A_BAD's specified deletion breaks the exact
output format while leaving its producer-success assertion independent.

All 80 predecessor files outside the four intentional tracked documentation edits remain byte-identical
to the predecessor, including migrations, runtime, tests, governing contract/invariants/glossary,
evidence ledger, and historical receipts. The entire previous acceptance document is an unchanged
byte prefix; only the WT07 index entry was appended. New Sense/Shape/trace/ADR documents account for
the remaining four files. No implementation, database test, or canonical contact occurred.

Independent document-byte calculations: A1 SHA-256
`8b80af401b26d8aa98ad9c4a27bb5385b8b6ac8aa40138f7736950a144ca355c`; A2 SHA-256
`1d04efad1b7663fdee99c50a05cc8a8a6a682bf9fb6783da4d0b0fa445211c6c`. These check the literal
UTF-8 fixture text without a trailing newline. They are not an execution receipt for a future checker.
