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

**STATUS: FROZEN ADVERSARIAL ACCEPTANCE AUTHORITY — BUILD 5A SHAPE CLOSED; MOVE UNRELEASED**

**UNLOCKS: BUILD 5A**

**IMPLEMENTATION: UNOPENED**

**FROZEN: 2026-09-04 America/Phoenix**

The reserved minimum governing requirement is preserved verbatim and is sharpened, not weakened:

> Prove a prior representation can become stale, superseded, or revalidation-required without losing
> historical reconstructibility.

BUILD 5A discharges it through the revalidation-required path. Stale and superseded designations are
not built; `revalidation_required` asserts neither.

### Frozen vocabulary

```text
epistemic_standing ∈ { unassessed, basis_qualified, revalidation_required }
```

`basis_qualified` — the proposition was examined against the evidence revision declared by its Evidence
Link and the qualification succeeded. Asserts no truth, support strength, confidence, warrant,
authority, authorization, governance acceptance, currentness, or workflow position.

`revalidation_required` — the evidence currently observed for the declared basis differs from the
revision the recorded qualification was evaluated against, so that qualification cannot be relied upon
without re-examination. Asserts neither falsity, lack of support, supersession, nor loss of currentness.

### Frozen fixtures

Inherited: GT01 Thought `19a949ea-a8fc-4250-a386-fa64e5530180`; Claim C
`0f89e778-b16e-4840-9129-a2aa3eb6f697`; Evidence Link L `4c6c0f50-a936-4da6-bb09-233f93320639`; Claim C2
`c7f7d330-e778-4ae5-be96-3a172bea1166`; relation Claim R `cb429206-5abd-4adb-8ff9-d6d6a885034c`.

Installed by BUILD 5A activation:

```text
TR1 = a6925494-a862-441b-a361-5f5ec41dc9dc
      claim_id=C  from=unassessed  to=basis_qualified
      basis_evidence_link_id=L
      observed_revision_digest=<derived>  recorded_at=<database-assigned>
```

Rollback-only probes, which may not remain in canonical state:

```text
TR2 = db18ae39-8bf8-483f-a56c-ba4e29fb37d2   basis_qualified -> revalidation_required after drift
SP  = 6efc5da1-cf53-4749-bcc6-b02a74fd76bf   stale declared prior standing
FP  = 05332754-b2e3-45cb-8f65-aaca27410cb5   privilege/forgery probe
NP  = b3912428-eaac-4469-bcfe-672abdca08f3   no-op transition (from = to)
CP  = 7ddc3b5d-c4df-48df-9aa4-92e08af3bc49   concurrency probe
```

`digest_v1 = 5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55`
`digest_v2 = 5ce23dfa64a69e028ef9b92a160eab15afd32471f0e21245157e58b3dfc26c53`, produced by the frozen
BUILD 3 content mutation `GT01: The brass heron waits beneath the cobalt staircase.`

**Canonical activation installs TR1 only.** GT01 must not be permanently mutated, because BUILD 0, 2 and
3 preservation depends on it. The drift and revalidation steps are exercised entirely inside rolled-back
transactions, and the complete three-state sequence is proven executably within one such transaction.
Canonical end state: Claim C at `basis_qualified` with exactly one recorded transition.

### Frozen sequence

```text
T0   C inherited: origin=ecb_inference, epistemic_standing=unassessed.
     L anchors C's historical basis to GT01 @ digest_v1. R remains C2 depends_on C.
T0q  Insert TR1. The trigger locks C, verifies the declared prior standing, derives the
     observed revision from the current Thought, and applies basis_qualified.
T1   (probe) Owner mutates GT01 content to the frozen BUILD 3 string, yielding digest_v2.
T2   (probe) Insert TR2. The trigger derives digest_v2, verifies the declared prior standing,
     and applies revalidation_required.
T3   Reconstruct from persistence alone, then roll back.
```

### Frozen machine-legible outcomes

```text
no_recorded_standing_transition
standing_history_reconstructed
applied_standing_diverged_from_history      ← must never appear
```

Every result carries `claim_id`, `applied_standing`, and an ordered `history` array. Each history entry
carries `from_standing`, `to_standing`, `basis_evidence_link_id`, `basis_revision_digest` read from the
Evidence Link, `observed_revision_digest`, a derived `basis_match` boolean, and `recorded_at`.

Ordering is by `recorded_at`, with the `from → to` chain as the structural integrity guarantee: each
entry's `from_standing` must equal the previous entry's `to_standing`, and the first must equal
`unassessed`. `applied_standing` must equal the final entry's `to_standing`, or the result is
`applied_standing_diverged_from_history` and the trace fails.

### Frozen fresh-context reconstruction

Given only C's UUID and no conversational memory, the harness must establish:

- C was originally asserted `unassessed`;
- C was qualified `basis_qualified` against the basis declared by L, whose anchor is `digest_v1`;
- `digest_v1` remains L's immutable historical anchor and L is unmutated;
- a differing revision was observed at the recorded revalidation time;
- C moved `basis_qualified → revalidation_required` at that time;
- both prior standing states and their ordering are recoverable;
- ECB makes no claim about when GT01 actually changed; and
- C2 and relation R are unchanged.

The historical basis anchor read from L must be distinguishable from the currently observed evidence
revision. A harness that cannot tell them apart fails.

### Frozen adversarial challenges

PASS means no falsifier is produced. A happy-path result alone is insufficient.

1. **Baseline and bounded expansion.** Verify TR1, C at `basis_qualified`, the same-UUID Referent for
   TR1, exact columns, checks, three restrictive Referent foreign keys, trigger shape and ownership,
   RLS, and grants. Verify exactly one new table and the authorized functions; no view, resolver, RPC,
   index, Artifact, receipt, or BUILD 5B/6+ surface appears.
2. **Atomicity A — history persistence failure blocks the transition.** Force the transition insert to
   fail after the standing update is attempted; C's applied standing must be unchanged and no
   transition may exist.
3. **Atomicity B — standing-change failure blocks the history.** Force the Claim update to fail; no
   transition row and no Referent may remain.
4. **Concurrency C — competing transitions.** Repaired 2026-09-05 America/Phoenix by explicit human
   disposition; see the repair note below. Session A acquires the Claim row lock while attempting a
   transition away from applied standing `S`. Session B attempts a competing transition declaring the
   same prior standing `S`. B **must queue** while A holds the lock. After A resolves:
   - if A **committed** a transition away from `S`, B **must be rejected** because its declared prior
     standing is stale;
   - if A **rolled back** and `S` therefore remains applied standing, B **may proceed** because its
     declared prior standing remains truthful.

   The harness may prove these two consequences separately: direct concurrent blocking and
   serialization using rollback-only probe transactions, and stale-prior rejection through the identical
   transition mechanism, which challenge 5 supplies. **No test formulation may require an additional
   committed canonical transition merely to prove concurrency.** Probe residue requirements are
   unchanged.

   The required property is unchanged: two competing transitions declaring the same prior standing must
   serialize, and cannot both commit as independently valid successors of that same prior state.
5. **Stale prior standing.** A transition declaring a prior standing that is not C's applied standing
   must be rejected.
6. **No-op transition.** NP with `from_standing = to_standing` must be rejected.
7. **Forgery and least privilege.** `service_role` attempts to supply `recorded_at` or
   `observed_revision_digest` must fail at the column privilege boundary; the observed revision is
   database-derived. Attempts to update or delete any transition, Claim, Evidence Link, or Referent must
   fail. `PUBLIC`, `anon`, and `authenticated` must have no access. A transition whose
   `basis_evidence_link_id` belongs to a different Claim must be rejected.
8. **Drift and revalidation.** Mutate GT01, insert TR2, observe `basis_match=false` on that entry and
   `standing_history_reconstructed` with the full ordered chain, then roll back leaving no residue.
9. **Evidence Link is not mutated and does not go stale.** L's role, scheme, digest, endpoints and link
   time must be identical before and after the whole trace.
10. **No propagation.** Claim C2 and relation Claim R must be byte-identical before and after every
    transition. Asserting a standing change on C must alter neither.
11. **Encoding agreement.** The database-derived observed revision for an unmutated GT01 must equal L's
    stored anchor and the harness's independent reimplementation of
    `ecb_thought_revision_v1_sha256`.
12. **Residue.** No probe transition, Referent, standing change, or evidence mutation may remain.
13. **Regression.** Apply the frozen enduring BUILD 3 and BUILD 4 projection below. The public and MCP
    inventory remains exactly `capture_thought`, `fetch`, and `search`.

### Repair note — challenge 4, 2026-09-05 America/Phoenix

The originally frozen challenge 4 carried a logically unsatisfiable conjunction, found during BUILD 5A
Move and dispositioned by the human as a SHAPE_OR_CONTRACT_DEFECT of the acceptance-specification
subtype. It required both that session B be rejected for a stale prior standing and that session A roll
back. B can be rejected for a stale prior only if A committed a transition away from that standing; if A
rolls back, B's declared prior becomes truthful again and B may lawfully proceed. The two requirements
cannot both hold.

The repair removes only the contradictory conjunction. It changes no semantic, architectural,
enforcement, concurrency, privilege, or implementation requirement, and it does not reopen the BUILD 5A
Shape, Output Contract, transition mechanism, concurrency invariant, or canonical substrate.

### Frozen enduring BUILD 3 + BUILD 4 projection

**Layer A — historical acceptance.** `tests/build-2/harness.ts`, `tests/build-3/harness.ts`, and
`tests/build-4/harness.ts` remain byte-frozen as closure provenance of their own Build Units. None is
re-run as a post-BUILD 5A whole-schema gate.

**Layer B — current-state regression.** After BUILD 5A installation verify that: the kind-exclusive
Claim shape holds; `claim_kind` admits exactly `assertion` and `relation`; `predicate` admits exactly
`depends_on` with the predicate-scoped self-relation prohibition; Claim endpoint foreign keys remain
restrictive to `referents` with no foreign key to `claims` or `thoughts`; no uniqueness collapses the
endpoint triple; `prepare_claim` remains SECURITY INVOKER, non-callable, lock-free, and does not
overwrite `claim_kind`; `service_role` insert columns on `claims` are unchanged with still no UPDATE or
DELETE; RLS remains enabled with zero policies; relation Claim R and Claim C2 are unchanged; Evidence
Link L is unchanged; GT01's digest remains independently reproducible; all four Worked Trace 03 outcomes
remain producible; `evidence_links` retains no foreign key to `thoughts`; and `prepare_evidence_link`
retains SECURITY DEFINER with its FOR SHARE lock and caller-forgery rejection.

**Demoted from enduring to closure snapshot by this lawful expansion:** *Claim C retains
`epistemic_standing = unassessed`*. BUILD 5A lawfully moves it to `basis_qualified`. The re-projected
obligation is that C retains its exact proposition, scope, kind, origin, and `asserted_at`, while its
applied standing is whatever the recorded transition chain applies. Also demoted: the exact public table
and function lists; the three-Claim, six-Referent, one-Link counts; `claims` having exactly ten columns;
and `epistemic_standing` admitting only `unassessed`.

### Prohibited interpretations

`revalidation_required` does not mean false, unsupported, superseded, or not current.
`basis_qualified` does not mean true, accepted, warranted, or authorized. A recorded transition confers
no currentness by virtue of being newest. A BUILD 5A Event is not a Transformation Receipt and claims no
independent verification, acceptance, preservation of declared obligations, correctness of the acting
mechanism, or receipt standing.

### Failure

FAIL if any frozen challenge produces a counterexample, including if a standing change commits without
its transition or a transition remains recording a standing change that did not commit; if two
transitions declaring the same prior standing both commit; if applied standing diverges from the chain;
if the historical basis anchor cannot be distinguished from currently observed evidence; if L is
mutated or treated as stale; if C2 or R change; if an unexplained canonical object, Artifact, receipt,
or BUILD 5B/6+ surface appears; or if an enduring BUILD 0–4 behavior regresses.

Freezing does not authorize implementation. A separate human Move release remains required.

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

## Worked Trace 06 — Typed relation claim

**STATUS: PASSED 2026-09-04 AMERICA/PHOENIX — ACCEPTED AND CLOSED AT METABOLIZE**

**UNLOCKS: BUILD 4**

**IMPLEMENTATION: INSTALLED AND VERIFIED**

**EXECUTION EVIDENCE: [`build-receipts/005-build-4.md`](build-receipts/005-build-4.md)**

**FROZEN: 2026-09-04 America/Phoenix at BUILD 4 Shape closure**

Promoted from candidate to acceptance authority after one representation survived the BUILD 4 second
examination. Trace ordinals run by creation order, not build order: Worked Trace 04 unlocks BUILD 5 and
Worked Trace 05 unlocks BUILD 7/8. Identifier 06 is the next free ordinal, so no reserved trace is
renumbered or repurposed.

### Frozen focal behavior

Express one referent-to-referent relation as a Claim, under a single relation truth store, without
collapsing relation Claim into Evidence Link or asserted relation into relational fact.

### Frozen vocabulary

```text
CLAIM_KIND ∈ { assertion, relation }
PREDICATE  = depends_on
```

`depends_on` means the subject Claim's validity is conditional on the object Referent. It asserts
neither endpoint's truth, support, confidence, currentness, standing, or authority, and triggers no
propagation or cascade.

### Frozen fixtures

- existing GT01 Thought / Referent `T`: `19a949ea-a8fc-4250-a386-fa64e5530180`;
- existing registered-only Referent `X`: `2eede0e4-b27a-4383-850e-a448f0113c9f`;
- existing BUILD 3 assertion Claim `C`: `0f89e778-b16e-4840-9129-a2aa3eb6f697`;
- existing BUILD 3 Evidence Link `L`: `4c6c0f50-a936-4da6-bb09-233f93320639`;
- new assertion Claim `C2`: `c7f7d330-e778-4ae5-be96-3a172bea1166`;
- new relation Claim `R`: `cb429206-5abd-4adb-8ff9-d6d6a885034c`;
- rollback-only reversal probe `RR`: `1d43f2e8-d5ac-47f9-bf11-0aee12e840ea`;
- rollback-only duplicate-triple probe `RD`: `99452a5e-9ee4-4e09-9426-e706fc24cffd`;
- rollback-only unbound-endpoint probe `RU`: `6a628b2e-2a01-4d90-aa58-7ee2e14d4a9c`;
- rollback-only self-relation probe `RS`: `d19eb743-7768-4624-aaa5-ea7dd2e6e31b`; and
- rollback-only Evidence Link on relation Claim probe `LR6`:
  `4bbf51ab-c29d-4fa5-90e1-6d7d329d9370`.

The BUILD 4 activation inserts only `C2` and `R`. Probe identifiers are used inside rolled-back
transactions and may not remain in canonical state.

Claim `C2` is exactly:

```text
proposition=The described scene contains at least two distinct objects.
scope=worked_trace_06:gt01_interpretation_dependency
claim_kind=assertion
origin=ecb_inference
epistemic_standing=unassessed
asserted_at=database transaction time
subject_referent_id=null; predicate=null; object_referent_id=null
```

Relation Claim `R` is exactly:

```text
proposition=null
scope=worked_trace_06:claim_dependency
claim_kind=relation
origin=ecb_inference
epistemic_standing=unassessed
asserted_at=database transaction time
subject_referent_id=c7f7d330-e778-4ae5-be96-3a172bea1166
predicate=depends_on
object_referent_id=0f89e778-b16e-4840-9129-a2aa3eb6f697
```

### Required machine-legible outcomes

The harness queries by exact UUID and emits exactly one of:

```text
relation_claim_recorded
relation_claim_endpoint_unbound
not_a_relation_claim
```

Every result contains `claim_id` and `claim_kind`. Relation results also contain `scope`, `origin`,
`epistemic_standing`, `asserted_at`, `subject_referent_id`, `predicate`, `object_referent_id`, and a
per-endpoint native-binding presence flag.

| Status | Required fields | What it establishes |
|---|---|---|
| `relation_claim_recorded` | both endpoints registered and natively bound | `R` exists as a relation Claim and both endpoint Referents currently have a native record in the inspected scope. |
| `relation_claim_endpoint_unbound` | at least one endpoint registered with no native record | The relation Claim and its endpoint Referents persist while a native binding is absent. It does not establish deletion, invalidity, or loss of the assertion. |
| `not_a_relation_claim` | relation fields null | The identified Claim is an assertion Claim. It does not establish that no relation exists elsewhere. |

Precedence: `claim_kind = 'assertion'` yields `not_a_relation_claim`; otherwise an unbound endpoint
yields `relation_claim_endpoint_unbound`; otherwise `relation_claim_recorded`.

No SQL resolver, view, RPC, MCP tool, or production serialization surface is permitted.

### Frozen adversarial challenges

PASS means no falsifier below is produced. A happy-path result alone is insufficient.

1. **Baseline and bounded expansion**
   - Verify `C2`, `R`, and their same-UUID Referents, and obtain `relation_claim_recorded`.
   - Verify exact `claims` columns, the kind, shape, predicate, and self-relation constraints, both
     restrictive endpoint foreign keys, the trigger, RLS, and grants.
   - Verify **no new table and no new function** were added, and that no view, resolver, RPC, index, or
     BUILD 5+ object appeared.
2. **Direction**
   - Insert `RR` asserting `C depends_on C2`, the exact reversal, in a rolled-back transaction. It must
     succeed as a **different** Claim with different endpoints, never collapse to `R`, and never be
     reported as the same relation. Roll back.
3. **Relation versus Evidence Link**
   - Verify a relation Claim carries a predicate and two Referent endpoints and no revision scheme,
     digest, or role; and that an Evidence Link carries scheme, digest, and role and no predicate.
   - In a rolled-back transaction attach Evidence Link `LR6` to relation Claim `R` through the allowed
     boundary. It must succeed, derive the frozen GT01 digest, and leave `R` a relation Claim rather
     than converting it into evidence or converting the link into a relation. Roll back.
4. **No support, currentness, supersession, or standing change**
   - Verify `R` carries no column capable of expressing support, confidence, currentness, validity
     interval, or supersession.
   - Verify that asserting `R` left Claim `C` and Claim `C2` rows unchanged, including their
     `epistemic_standing` and `asserted_at`.
5. **Multiplicity**
   - Insert `RD` asserting the identical triple `C2 depends_on C` in a rolled-back transaction. It must
     succeed as a second, distinct Claim with its own identity, Referent, and assertion time. No
     uniqueness violation, upsert, accumulation, or counter increment may occur. Roll back.
6. **Endpoint addressing and native-binding disappearance**
   - Insert `RU` asserting `C2 depends_on X`, where `X` is registered with no native record, in a
     rolled-back transaction. It must succeed, proving endpoints address Referents rather than native
     types. Observe `relation_claim_endpoint_unbound`. Roll back.
   - In an owner transaction delete only the native `claims` row for `C2`. `R`, `C2`'s Referent, and
     `C`'s Referent must survive, and the outcome must be `relation_claim_endpoint_unbound`. Roll back.
   - Deleting any endpoint Referent, or `C` while dependent rows exist, must fail rather than cascade
     or null an endpoint.
7. **Self-relation**
   - Insert `RS` asserting `C2 depends_on C2` in a rolled-back transaction. It must fail on
     `claims_depends_on_not_self`. Verify the constraint is predicate-scoped and imposes no universal
     prohibition on future predicates.
8. **Caller forgery and least privilege**
   - As `service_role`, attempts to supply `origin`, `epistemic_standing`, or `asserted_at` must fail at
     the column privilege boundary.
   - A relation Claim missing any relation field, an assertion Claim carrying any relation field, a
     relation Claim with a non-null proposition, an assertion Claim with a null or blank proposition,
     and any predicate other than `depends_on` must each fail.
   - `service_role` attempts to update or delete any Claim, Evidence Link, or Referent must fail.
     `PUBLIC`, `anon`, and `authenticated` must have no access.
9. **No co-reference and no model authority**
   - Verify asserting `R` created no identity, equivalence, merge, or resolution record, and that
     `public.referents` remains exactly `id + registered_at`.
   - Verify no column can carry confidence, classifier identity, model version, or rationale, so
     classifier-shaped input cannot become governing truth.
10. **BUILD 0–3 regression under the two-layer model**
    - Apply the frozen enduring BUILD 3 projection below. The public and MCP inventory remains exactly
      `capture_thought`, `fetch`, and `search`.

### Frozen enduring BUILD 3 projection

#### Layer A — historical acceptance

`tests/build-3/harness.ts` remains byte-frozen as BUILD 3 closure provenance. It is not weakened,
rewritten, or re-run as a post-BUILD 4 whole-schema gate. Its closure-state assertions — the exact public
table list, the exact public function list, and `claim_count = 1`, `link_count = 1`,
`referent_count = 4` — proved that BUILD 3 installed no later-build machinery. They are not permanent
prohibitions on an authorized later Build Unit. The cardinality assertion breaks unconditionally once a
relation Claim exists.

#### Layer B — current-state regression

After BUILD 4 installation, verify that:

- `claims` and `evidence_links` exist with same-UUID Referent coupling;
- every assertion Claim requires a non-null, non-empty `proposition` and carries
  `claim_kind='assertion'`, `origin='ecb_inference'`, `epistemic_standing='unassessed'`, and a
  database-assigned `asserted_at`;
- Claim `C` retains its exact proposition, scope, kind, origin, standing, and assertion time;
- Evidence Link `L` retains its exact role, scheme, digest, endpoints, and link time;
- the GT01 revision digest remains independently reproducible and yields `linked_revision_match`;
- all four frozen Worked Trace 03 outcomes remain producible;
- `evidence_links` retains no foreign key to `thoughts` and historical lineage does not cascade;
- `prepare_evidence_link` remains `SECURITY DEFINER` with its `FOR SHARE` lock and caller-forgery
  rejection;
- service-role privileges are no weaker and no `UPDATE` or `DELETE` is granted on either table;
- RLS remains enabled with zero policies on both tables; and
- no uniqueness rule collapses repeated historical uses of the same evidence.

The following are closure-state snapshots and are **not** enduring invariants: the exact public table
and function lists; `claim_count = 1`, `link_count = 1`, `referent_count = 4`; `claims` having exactly
the seven BUILD 3 columns; `claim_kind` admitting only `assertion`; and `proposition` being
unconditionally `NOT NULL`.

### Failure

FAIL if any frozen challenge produces a counterexample, including if:

- endpoint reversal collapses to the same relation or is reported identically;
- a relation Claim is indistinguishable from an Evidence Link without caller memory;
- asserting a relation changes any endpoint's standing or implies support, currentness, or
  supersession;
- two separately asserted identical triples become one record;
- any relation fact becomes canonically representable in two places;
- native-binding disappearance erases a relation Claim whose endpoint Referent remains registered;
- confidence, classifier identity, or model output acquires governing effect;
- asserting a relation performs co-reference or entity resolution;
- an unexplained canonical object, new table, new function, or BUILD 5+ surface appears; or
- an enduring BUILD 0–3 behavior in the projection above regresses.

Freezing did not authorize implementation. The later explicit human Move release authorized the
installed and verified BUILD 4 transition, and the human accepted its evidence at Metabolize. This trace
remains frozen test authority; passing it did not open or authorize BUILD 5.


## Worked Trace 07 — Exact-version transformation checks

**STATUS: FROZEN IN BUILD 5B SHAPE; MOVE UNRELEASED**

[Complete BUILD 5B authority](acceptance/build-5b-wt07.md): retained A1/A2 payloads, predeclared
transformation obligations, both source grounding and preservation, database-derived receipts,
committed check-attempt evidence, producer false-success, and twenty-two adversarial challenges.

This addition does not alter any preceding trace or release implementation.
