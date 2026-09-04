STATUS: ACTIVE  
DISPOSITION: TEST_AUTHORITY  
ROLE: Frozen behavioral expectations

# ECB v2 Acceptance Tests

Implementation is judged against observable behavior, not against resemblance to ECB v1.

## HARNESS TRACE 00 — Progressive orientation and governed non-knowledge

**STATUS: FROZEN FOR CUSTODY TRANSFER**

### Context

A fresh agent receives repository access without conversational context and executes `/prompts/harness-orientation-test.md` read-only.

### Required report

The agent reports:

- current Build Unit;
- pass condition;
- governing invariants implicated by that Build Unit;
- explicit non-goals;
- escalation conditions;
- **FILES CONSULTED** — every file opened and the concrete need that caused it to be opened;
- **PRESERVED UNKNOWNS** — matters deliberately left unresolved because the current Build Unit does not require them.

### Required behavior

The report must demonstrate progressive discovery:

1. enter through `START_HERE.md`;
2. orient through `BUILD_CHECKOUT.md`;
3. open only governing or test material implicated by a concrete reporting need;
4. preserve consequential non-knowledge that does not block the current Build Unit;
5. make no repository changes.

It should be possible to identify exact standing enums, governance bootstrap, Master-Key physicalization, relation ontology, and the formal status of Bounded Infinity as intentionally unnecessary for passing BUILD 0.

### Failure

FAIL if the agent:

- requires chat history to orient;
- preloads the repository or reads every document without a concrete need;
- treats an unresolved higher-build question as a BUILD 0 requirement;
- invents closure for a preserved unknown;
- modifies code or documentation.

## GOLDEN TRACE 01 — Cross-context atomic recall

**STATUS: PASSED 2026-09-03 AMERICA/PHOENIX (`2026-09-04` UTC)**

Execution evidence: [`build-receipts/001-build-0.md`](build-receipts/001-build-0.md). The fixture remains frozen as regression authority.

### Fixture

From AI Context A, capture this exact thought:

> GT01: The brass heron waits beneath the violet staircase.

Include:

- source = `golden_trace_01`
- captured_at
- durable record identity

### Context reset

Context B begins without conversational access to the captured sentence.

### Operation

Semantic query:

> What waits beneath the violet staircase?

### Required result

ECB returns the GT01 thought as a relevant result.

A subsequent fetch/get by returned record identity yields the persisted source record.

### Must preserve

- same canonical evidence record;
- durable identity;
- source metadata;
- no second brain/cache acting as authority;
- no conversion of the thought into a promoted claim.

### Failure

FAIL if:

- semantic retrieval cannot recover it;
- retrieval returns fabricated content;
- source/provenance is lost;
- a duplicate canonical record is created by retrieval;
- the system requires conversational memory to succeed.

## Worked Trace 02 — Stable referent resolution

**STATUS: PASSED AND ACCEPTED 2026-09-04 — BUILD 2 CLOSED**
**EXECUTION EVIDENCE: [`build-receipts/003-build-2.md`](build-receipts/003-build-2.md)**

### Fixtures

- existing Thought / Referent UUID: `19a949ea-a8fc-4250-a386-fa64e5530180` (GT01);
- registered-only UUID: `2eede0e4-b27a-4383-850e-a448f0113c9f`;
- absent probe UUID: `ce654422-bb4f-4c6b-bf3d-e32b3dd10e8f`;
- rollback-probe UUID: `09eb6cc9-b204-4a6d-a1a4-b62fafcf8141`;
- activation-concurrency UUID: `93d06071-b8aa-4b2d-b20d-99d2d6fc1ed7`.

The fixture labels live only in this test authority. They are not descriptions, aliases,
classifications, claims, standing, or native-binding records in the canonical brain.

### Context A — activation and registration

Activate BUILD 2 in one transaction using ADR-004's exact order. Acquire `SHARE ROW EXCLUSIVE` on
`public.thoughts` before any activation change; install the invoker registration trigger before
backfill; register every existing Thought under its unchanged UUID; register the registered-only
fixture without a Thought or other native record; then install the immediate non-deferrable same-UUID
foreign key and frozen privilege boundary before commit.

The registered-only fixture is part of activation, not later acceptance setup.

For backfilled Thoughts, `registered_at` is one database-generated activation-transaction time, not a
copy of Thought `captured_at`. Registration time is database-assigned for every new Referent.

### Context reset

Context B begins without conversational access to Context A. It receives only the three exact UUIDs and
the declared Thought scope.

### Operation

For each UUID, the acceptance harness queries only whether it exists in the universal registry (`R`)
and whether the same UUID exists in the current Thought surface (`T`). Resolve by exact UUID, never by
description or semantic similarity. Do not create a SQL resolver function, view, RPC, stored
observation, or MCP tool.

### Required result

| UUID / condition | R | T | Required observation |
|---|---:|---:|---|
| absent probe | 0 | 0 | `referent_not_registered(scope=thoughts)` |
| registered-only fixture | 1 | 0 | registered + `native_binding.absent_in_scope(scope=thoughts)` |
| GT01 | 1 | 1 | registered + `native_binding.present(type=thought)` |
| attempted/observed broken coupling | 0 | 1 | commit rejected; observation class `referent_coupling_broken` |

The `R=0, T=1` row defines integrity-failure classification. Structural coupling must make it
uncommittable after activation; the test may exercise it through a deliberately rejected transaction
or an isolated noncanonical harness state, never by leaving canonical corruption behind.

### Atomicity result

Directly attempt to insert Thought UUID `09eb6cc9-b204-4a6d-a1a4-b62fafcf8141` with empty content and
otherwise structurally valid values. The `BEFORE INSERT` trigger must attempt Referent registration
before the existing nonempty-content constraint rejects the Thought. Neither the Thought nor the
trigger-created Referent may remain committed.

A pre-database embedding failure does not satisfy this proof.

### Activation concurrency result

While the activation transaction holds its `SHARE ROW EXCLUSIVE` lock, a second database session
attempts to insert Thought UUID `93d06071-b8aa-4b2d-b20d-99d2d6fc1ed7`. The insert must queue. After
activation commits, it may proceed only through the installed registration trigger and immediate
foreign key, producing `R=1, T=1` inside the probe transaction. Roll back the probe transaction so
neither probe row becomes canonical fixture state.

### Authorization result

- `anon` and `authenticated` have no direct registry or resolver access;
- `public.referents` has RLS enabled with no client policy, and the service role has no registry
  `UPDATE` or `DELETE` capability;
- the service role has registry `SELECT` plus column-level `INSERT (id)` only and cannot supply
  `registered_at`;
- direct trigger-function `EXECUTE` is unavailable to `PUBLIC`, `anon`, and `authenticated`;
- the current bearer-protected MCP tool inventory remains exactly `capture_thought`, `fetch`, and
  `search`;
- canonical-boundary verification uses only the existing server-side service-role/admin boundary; and
- technical capability confers no standing, authority, warrant, or currentness.

### Must preserve

- GT01's exact BUILD 0 UUID and Thought content/provenance;
- one identity-only registry with exactly `id` and `registered_at`;
- the existing direct Thought runtime path, unchanged;
- one invoker registration trigger and immediate non-deferrable non-cascading same-UUID foreign key;
- description-independent, classification-independent, binding-independent addressability;
- observation results are derived, not stored as semantic state;
- registered-only absence does not create a persisted question or epistemic standing;
- UUID uniqueness does not become subject uniqueness or co-reference/entity resolution;
- BUILD 0 and BUILD 1 evidence remains unchanged; and
- no BUILD 3+ primitive or later native-binding/refinement behavior.

### Failure

FAIL if:

- any existing Thought UUID changes or lacks its same-UUID Referent after activation;
- activation, backfill, and coupling are not atomic;
- a concurrent Thought writer can cross activation through the old insert path instead of queuing;
- a new Thought can commit without its Referent;
- the rollback probe does not attempt registration before failure or leaves either probe row committed;
- the registered-only fixture requires or acquires description, classification, native type, native
  binding, assertion, standing, authority, warrant, authorization, or currentness;
- exact lookup guesses, searches semantically, or merges UUIDs;
- a SQL resolver function, view, RPC, stored observation, or MCP Referent tool appears;
- the direct Thought runtime changes or a transactional capture RPC is added;
- a new public/MCP authorization surface appears;
- the registry contains another column or BUILD 2 adds another persistent table; or
- later refinement/binding of the registered-only fixture is implemented.

## Worked Trace 03 — Evidence versus inference

**STATUS: PASSED 2026-09-04 AMERICA/PHOENIX — ACCEPTED AND CLOSED AT METABOLIZE**

**IMPLEMENTATION: INSTALLED AND VERIFIED**

**EXECUTION EVIDENCE: [`build-receipts/004-build-3.md`](build-receipts/004-build-3.md)**

### Frozen fixtures

- existing GT01 Thought / Referent `T`:
  `19a949ea-a8fc-4250-a386-fa64e5530180`;
- Claim `C`: `0f89e778-b16e-4840-9129-a2aa3eb6f697`;
- Evidence Link `L`: `4c6c0f50-a936-4da6-bb09-233f93320639`;
- rollback-only no-link Claim probe `C0`: `cf0ca1fc-a4f7-487b-aea5-cfb23a467919`;
- rollback-only forged-revision Link probe `LF`:
  `c85a5356-0930-4c94-a30d-cfd0e53a0a42`; and
- rollback-only concurrent Link probe `LR`:
  `6c7cc7be-c23f-434f-a8eb-927cbe80b99b`.

The canonical BUILD 3 activation inserts only C and L. Probe IDs are used inside rolled-back
transactions and may not remain in canonical state.

Probe inputs are fixed as follows:

```text
C0.proposition=The worked trace contains an unlinked probe assertion.
C0.scope=worked_trace_03:no_link_probe
LF.claim_id=C
LF.evidence_referent_id=T
LF.forged_digest=0000000000000000000000000000000000000000000000000000000000000000
LR.claim_id=C
LR.evidence_referent_id=T
content_mutation=GT01: The brass heron waits beneath the cobalt staircase.
source_mutation=golden_trace_01_privileged_probe
captured_at_mutation=2026-09-04T00:12:35.225094+00:00
```

Claim C is exactly:

```text
proposition=The described scene contains both a brass heron and a violet staircase.
scope=worked_trace_03:gt01_interpretation
claim_kind=assertion
origin=ecb_inference
epistemic_standing=unassessed
asserted_at=database transaction time
```

Evidence Link L is exactly:

```text
claim_id=0f89e778-b16e-4840-9129-a2aa3eb6f697
evidence_referent_id=19a949ea-a8fc-4250-a386-fa64e5530180
role=used_as_basis
evidence_revision_scheme=ecb_thought_revision_v1_sha256
evidence_revision_digest=5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55
linked_at=database transaction time
```

### Frozen revision scheme

```text
ASCII("ECB-THOUGHT-REVISION-V1") || UINT8(0x00)
|| frame(0x01, UTF8_EXACT(content))
|| frame(0x02, UTF8_EXACT(source))
|| frame(0x03, INT64_BE(captured_at_unix_microseconds))

frame(tag, payload) = UINT8(tag) || UINT64_BE(octet_length(payload)) || payload
digest = SHA-256(digest_input)
```

Field order and tags are fixed. PostgreSQL text is encoded exactly as UTF-8 without trimming, case
folding, Unicode normalization, terminators, or line-ending conversion. `captured_at` is the represented
UTC instant encoded as signed 64-bit big-endian microseconds since the Unix epoch. Nulls, infinity, an
out-of-domain timestamp, or conversion failure reject link creation. Digest storage is 32-byte `bytea`;
machine display is 64 lowercase hexadecimal characters.

For GT01:

```text
content=GT01: The brass heron waits beneath the violet staircase.
source=golden_trace_01
captured_at=2026-09-04T00:12:35.225093+00:00
captured_at_unix_microseconds=1788480755225093
digest_input_octets=131
sha256=5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55
```

The harness implements this encoding independently of the database trigger and must reproduce the
frozen digest before other BUILD 3 observations count.

### Required machine-legible outcomes

For a Claim with no Link, the harness emits one no-link result. Otherwise it emits one result per
Evidence Link, each with exactly one of these status strings:

```text
linked_revision_match
linked_revision_mismatch
linked_evidence_unavailable
no_recorded_build_3_evidence_link
```

Every result contains `claim_id`. Link-bearing results also contain `evidence_link_id`,
`evidence_referent_id`, `evidence_revision_scheme`, and lowercase `linked_revision_digest`.

| Status | Additional required fields | What it establishes |
|---|---|---|
| `linked_revision_match` | equal `current_revision_digest`; exact current Thought in `source_evidence` | L exists and the current Thought equals the source-bearing revision recorded when L was created. |
| `linked_revision_mismatch` | unequal `current_revision_digest`; `source_evidence=null` | L exists and a current Thought with the same Referent UUID differs from L's recorded revision. It does not establish which value is true or preserve old payload. |
| `linked_evidence_unavailable` | `current_revision_digest=null`; `source_evidence=null` | L exists, but no Thought is present in the current evidence surface for its evidence Referent. Historical BUILD 3 basis remains recorded. |
| `no_recorded_build_3_evidence_link` | Link/revision/source fields null | No BUILD 3 Evidence Link is recorded for this Claim. It does not establish that the Claim was never supported. |

The harness uses one exact-UUID query shaped as:

```sql
select
  claim.id,
  claim.proposition,
  claim.scope,
  claim.claim_kind,
  claim.origin,
  claim.epistemic_standing,
  claim.asserted_at,
  link.id as evidence_link_id,
  link.evidence_referent_id,
  link.role,
  link.evidence_revision_scheme,
  link.evidence_revision_digest,
  link.linked_at,
  thought.content,
  thought.source,
  thought.captured_at
from public.claims as claim
left join public.evidence_links as link on link.claim_id = claim.id
left join public.thoughts as thought on thought.id = link.evidence_referent_id
where claim.id = $1::uuid
order by link.id;
```

The harness then independently derives the current digest and applies this precedence:

```text
no Link row -> no_recorded_build_3_evidence_link
Link row + no Thought row -> linked_evidence_unavailable
Link row + unequal digest -> linked_revision_mismatch
Link row + equal digest -> linked_revision_match
```

No SQL resolver, view, RPC, MCP tool, or production result contract is permitted.

### Fresh-context evidence/assertion distinction

Any BUILD 3 Shape fails if ECB cannot answer differently across a fresh context:

> What does the source say?

versus:

> What has ECB inferred?

The distinction must be reconstructible from persistence. Prompt memory, caller convention, retrieval
rank, or model confidence cannot supply the missing separation.

The fresh context receives C's UUID and no conversational memory of GT01 or the Claim fixture. Using the
frozen query and outcome rules:

- **What does the source say?** returns GT01's exact `content`, `source`, `captured_at`, and Referent UUID
  only when the status is `linked_revision_match`.
- **What has ECB inferred?** returns C's proposition, scope, `origin=ecb_inference`,
  `epistemic_standing=unassessed`, assertion time, and L's historical-basis identity without presenting
  the proposition as source text.

### Frozen adversarial challenges

PASS means no falsifier below is produced under the declared challenge surface. A happy-path result
alone is insufficient.

1. **Baseline and independent digest**
   - Verify C, L, and their same-UUID Referents.
   - Verify exact table columns, checks, immediate non-deferrable restrictive foreign keys, triggers,
     RLS, grants, and absence of forbidden fields/surfaces.
   - Independently reproduce the frozen GT01 digest and obtain `linked_revision_match`.
2. **Caller forgery and direct writes**
   - As `service_role`, attempt LF insertion while supplying 32 zero bytes as the digest. It must fail
     because the role lacks insert privilege on database-derived columns.
   - In separate rollback-only transactions, first insert LF as the owner while supplying the forged
     digest, then insert LF as `service_role` using only allowed columns. In both cases the trigger must
     overwrite/derive all revision values and produce the frozen GT01 digest.
   - `service_role` attempts to update/delete Claim, Link, or their Referents and to update/delete
     Thought must fail. `PUBLIC`, `anon`, and `authenticated` must have no new access.
3. **Source-bearing privileged mutation**
   - In separate owner transactions, change only GT01 `content`, only `source`, and only `captured_at`
     (use `2026-09-04T00:12:35.225094+00:00` for the timestamp probe).
   - Each mutation must yield `linked_revision_mismatch`, retain C and L, serialize
     `source_evidence=null`, and roll back without canonical residue.
4. **Non-evidence mutation**
   - In an owner transaction, replace only GT01's embedding with a distinct finite 384-dimensional
     vector by changing its first parsed component by `+0.5`, while leaving `content`, `source`, and
     `captured_at` byte/instant-equal.
   - The outcome must remain `linked_revision_match`. Roll back.
5. **Evidence disappearance and non-cascade**
   - In an owner transaction, delete only the GT01 Thought. Deletion must not delete its Referent, C, or
     L, and the outcome must be `linked_evidence_unavailable`. Roll back.
   - Attempting to delete C's Referent, L's Referent, the evidence Referent, or C while dependent rows
     exist must fail rather than cascade or null an endpoint.
6. **No recorded BUILD 3 basis**
   - Insert C0 through the allowed Claim boundary without an Evidence Link, observe
     `no_recorded_build_3_evidence_link`, and roll back.
7. **Concurrent mutation boundary**
   - Session A, acting as `service_role`, begins a transaction and inserts LR against C and GT01 through
     allowed columns. The trigger locks GT01 `FOR SHARE` and derives its digest; A remains open.
   - Session B, acting through the privileged challenge boundary, attempts a source-bearing GT01 update
     and must queue.
   - A verifies LR's frozen digest and rolls back. B may then proceed but also rolls back. Neither LR nor
     its Referent nor the Thought mutation may remain.
8. **Origin/standing and lineage separation**
   - Verify `origin=ecb_inference` and `epistemic_standing=unassessed` are separate columns.
   - Verify only `unassessed` is currently accepted and no BUILD 3 transition/history machinery exists.
   - Treat a hypothetical later qualification change as a schema-compatibility inspection: origin and L
     remain stable; no current-support meaning is read from `used_as_basis`.
9. **SIGMA/ECOS and regression preservation**
   - `public.referents` remains exactly `id + registered_at`.
   - Claims and Links contain no relation endpoints or positional/quadrant semantics and are not treated
     as exhaustive of future Referent-backed examination structures.
   - Apply the two-layer regression authority below. The public/MCP inventory remains exactly
     `capture_thought`, `fetch`, and `search`.

### Frozen two-layer BUILD 0–2 regression authority

#### Layer A — historical acceptance

The original BUILD 0–2 acceptance evidence and harnesses remain unchanged as provenance of their
respective closed Build Units. In particular, `tests/build-2/harness.ts` remains the historical BUILD 2
closure harness; its assertions are not weakened, rewritten, or reinterpreted as post-BUILD 3
whole-database cardinality requirements.

The completed pre-Move execution against the released BUILD 3 baseline established:

```text
BUILD_0=PASS (6/6)
BUILD_1=PASS (5/5; deterministic trace PASS)
BUILD_2_HISTORICAL_ACCEPTANCE_HARNESS=PASS
```

#### Layer B — current-state regression

After BUILD 3 installation, verify all enduring BUILD 0–2 behavior and invariants in the legitimately
expanded substrate. Run the BUILD 0 runtime contract suite and BUILD 1 fixture/trace suite unchanged.
For BUILD 2, a minimum local cross-build regression harness verifies that:

- `public.referents` remains exactly the accepted identity-only `id + registered_at` registry;
- every existing Thought UUID retains a same-UUID Referent;
- the immediate, non-deferrable, restrictive Thought-to-Referent foreign key remains accepted;
- the accepted Thought registration trigger and direct Thought runtime behavior remain effective;
- a new Thought capture atomically creates its same-UUID Referent;
- a failed Thought capture leaves neither attempted Thought nor Referent committed;
- the registered-only BUILD 2 fixture remains registered without a Thought or semantic standing;
- GT01 retains its accepted UUID and BUILD 0/2-preserved state except inside rollback-only adversarial
  probes;
- BUILD 2 Referent RLS and privileges are no weaker;
- exact-UUID Referent semantics remain unchanged; and
- no BUILD 2 SQL resolver, view, RPC, MCP Referent tool, co-reference behavior, or
  native-binding/refinement behavior appears.

The cross-build projection does not require the entire public schema to contain only `referents` and
`thoughts`, the entire public function inventory to contain only `register_thought_referent` and
`search_thoughts`, or total Referent count to equal total Thought count plus one. Those assertions
proved that BUILD 2 itself installed no later-build machinery; they are not permanent prohibitions on
authorized later Build Units adding their own Referent-backed native records.

Worked Trace 03 supplies the complementary expansion proof: only the BUILD 3-authorized public tables,
functions, and triggers are added; Claim C and Evidence Link L account for their required new
Referents; and no additional unexplained canonical object or forbidden BUILD 4+ surface appears.

### Failure

FAIL if any frozen challenge produces a counterexample, including if:

- source evidence and ECB assertion can be returned as though they were the same record or authorship;
- the Claim-to-evidence lineage cannot be traversed in the declared direction;
- evidence revision drift can be silently accepted as the originally linked basis;
- link existence is treated as proof or automatic promotion;
- basis, confidence, standing, warrant, authority, authorization, or currentness collapse;
- later loss of support would require deleting the Claim or forgetting the known support lineage;
- caller input, an unlocked pre-read, or a privileged post-creation mutation can be accepted silently as
  L's original revision;
- any source-bearing mutation returns `linked_revision_match`, or embedding-only mutation returns
  mismatch;
- native Thought disappearance erases lineage or is reported as no recorded basis;
- `unassessed` is interpreted as a truth, support, confidence, authority, or workflow judgment;
- any challenge leaves probe rows or mutated GT01 state committed; or
- the implementation adds a forbidden BUILD 4/5, governance, SIGMA/ECOS, runtime, public, or exhaustive
  ontology surface.

Freeze did not authorize implementation. The later explicit human Move release authorized the
installed and verified BUILD 3 transition, and the human accepted its evidence at Metabolize. This
trace remains frozen test authority; passing it did not open or authorize BUILD 4.

## Worked Trace 04 — Standing change with history

**STATUS: RESERVED**  
**UNLOCKS: BUILD 5**

Freeze before BUILD 5 implementation.

Must prove a prior representation can become stale/superseded/revalidation-required without losing historical reconstructibility.

## Worked Trace 05 — Governed local closure

**STATUS: RESERVED**  
**UNLOCKS: BUILD 7/8**

Must include:

- mapper;
- local Master Key;
- warrant;
- aperture;
- explicit current designation;
- action envelope;
- revalidation trigger.

Freeze expected answers before implementation.
