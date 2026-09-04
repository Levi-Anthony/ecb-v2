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

**STATUS: FROZEN — PRE-IMPLEMENTATION**
**UNLOCKS: BUILD 2 IMPLEMENTATION ONLY AFTER EXACT SHAPE ANCHOR AND HUMAN RELEASE**

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

**STATUS: RESERVED**  
**UNLOCKS: BUILD 3**

Freeze before BUILD 3 implementation.

Must prove ECB can answer differently:

“What does the source say?” versus “What has ECB inferred?” with reconstructible provenance.

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
