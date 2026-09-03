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

**STATUS: FROZEN FOR BUILD 0**

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

**STATUS: RESERVED**  
**UNLOCKS: BUILD 2**

Freeze before BUILD 2 implementation.

Must prove repeated references can resolve to one stable identity without making description equal identity.

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
