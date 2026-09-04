STATUS: RATIFIED PRE-IMPLEMENTATION SHAPE — HUMAN IMPLEMENTATION RELEASE REQUIRED
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Derived from the Build Contract, invariants, ADR-003, frozen acceptance behavior, and explicit human reentry instruction
CURRENT BUILD UNIT: BUILD 2 — Universal Referents (SHAPED; IMPLEMENTATION UNOPENED)

# BUILD 2 — Universal Referents

## CURRENT MOVE

BUILD 2 Shape is ratified. Stop at the human implementation gate.

Do not create or alter schema, migrations, runtime, MCP, database, deployment, or remote state until a
separate explicit human release opens implementation. The committed root tree containing this checkout,
ADR-003, and Worked Trace 02 is the required pre-implementation provenance checkpoint.

BUILD 0 and BUILD 1 remain closed. Preserve their receipts, fixtures, runtime, migrations, and deployed
state exactly unless a recorded reopening condition is observed.

## PURPOSE

Install the minimum universal identity spine needed for stable persistence and exact-UUID resolution to
precede description, classification, or an encountered native binding.

## GOVERNING DISTINCTION

`durable persisted ECB UUID ⇒ stable referential addressability`

Keep distinct:

- identity ≠ description;
- referential addressability ≠ semantic discoverability;
- registration ≠ semantic promotion;
- registration ≠ assertion;
- registration ≠ standing;
- registration ≠ authority;
- registration ≠ warrant or authorization;
- registration ≠ currentness;
- UUID uniqueness ≠ subject uniqueness;
- referential identity ≠ co-reference/entity resolution; and
- observed unresolved native binding ≠ persisted epistemic/question standing.

## SELECTED SHAPE

Candidate B — Identity Spine:

```text
referents(
  id UUID PRIMARY KEY,
  registered_at TIMESTAMPTZ NOT NULL
)
```

No `native_type`.

No description, alias, metadata, semantic state, standing, authority, currentness, or native-binding
table.

The registry contains identity only. Type-specific content remains in its native record.

## ACTIVATION TRANSITION

Before BUILD 2 activation, an accepted BUILD 0 Thought without a Referent row is expected substrate
state.

Activation SHALL be one database transaction that:

1. creates `public.referents` with exactly the selected two-column Shape;
2. registers every existing `public.thoughts` UUID without changing that UUID;
3. assigns those backfilled rows one database-generated activation-transaction time rather than
   rewriting Thought `captured_at` as registration time; and
4. installs structural same-UUID coupling from every Thought to its Referent.

If any step fails, none of activation commits.

After activation, a committed Thought without its same-UUID Referent is an integrity violation. New
Thought creation and its new same-UUID Referent registration SHALL commit atomically. A failed Thought
capture may not leave that newly created Referent committed.

Existing BUILD 0 Thoughts retain exactly their existing UUID. GT01 remains:

`19a949ea-a8fc-4250-a386-fa64e5530180`

Registration of a subject whose Thought binding has not been encountered is valid. BUILD 2 does not
implement later refinement or binding of an already-registered unclassified Referent into a Thought or
another native representation.

`registered_at` records the enclosing database registration transaction time. It is database-assigned,
not caller-supplied semantic or historical time.

## EXACT-UUID OBSERVATION

Let:

- `R` = the UUID exists in `public.referents`;
- `T` = the same UUID exists in the current BUILD 2 native Thought surface.

| R | T | Required observation |
|---|---|---|
| 0 | 0 | `referent_not_registered(scope=...)` |
| 1 | 0 | registered + `native_binding.absent_in_scope(scope=thoughts)` |
| 1 | 1 | registered + `native_binding.present(type=thought)` |
| 0 | 1 | `referent_coupling_broken` |

These are observation results, not persisted classification, standing, assertion, or binding state.
`R=0, T=1` is a detectable integrity-failure classification and must be structurally uncommittable after
activation.

## INPUTS

- BUILD 0 closure receipt and GT01 durable UUID;
- BUILD 1 closure checkout, receipt, fixture, and identity clarification;
- the Build Contract and constitutive invariants as amended through ADR-003;
- ADR-003;
- frozen Worked Trace 02; and
- the exact pre-implementation commit/tree anchor for this Shape.

## OUTPUT — AFTER HUMAN IMPLEMENTATION RELEASE ONLY

One bounded BUILD 2 implementation that produces:

- one canonical `public.referents` identity spine;
- same-UUID registration of every existing Thought;
- structural post-activation Thought-to-Referent coupling;
- atomic registration for every newly committed Thought;
- one registered Referent with no Thought in the inspected scope; and
- exact-UUID observations matching all four declared `R`/`T` cases.

No implementation output is authorized by the current checkout.

## STANDING

Referent registration supplies stable addressability only.

It does not:

- describe or classify the subject;
- assert the subject's existence, meaning, type, or relations;
- make the subject semantically discoverable;
- promote a Thought or any other native record;
- establish subject uniqueness, co-reference, or entity resolution;
- confer epistemic, governance, or action standing;
- confer authority, warrant, authorization, governing designation, or currentness; or
- make an absent native binding a persisted question.

## ENFORCEMENT

**STRUCTURAL — schema constraint and transaction:**

- UUID primary-key uniqueness in `public.referents`;
- post-activation same-UUID foreign-key coupling from `public.thoughts` to `public.referents`;
- atomic activation/backfill/coupling installation; and
- atomic creation of a new Thought with its new Referent.

**OBSERVATIONAL — exact-UUID acceptance harness:**

- resolve only by supplied UUID;
- compare registry and current Thought-surface presence;
- return the frozen `R`/`T` observation; and
- rerun BUILD 0 and BUILD 1 regression suites.

The resolver result is not another truth store.

## AUTHORIZATION BOUNDARY

No new public, client, or MCP authorization surface is part of BUILD 2.

- preserve the existing single human door and bearer boundary;
- grant `anon` and `authenticated` no direct access to `public.referents` or BUILD 2 resolver behavior;
- enable RLS without client policies on `public.referents`;
- keep only the `SELECT` and bounded registration/capture access required by BUILD 2 inside the
  existing server-side service-role boundary, with no `UPDATE` or `DELETE`; and
- do not infer governance authority from database capability or bearer possession.

Worked Trace 02 is verified at the canonical persistence boundary. No new MCP tool is required to pass.

## TEST / PASS CONDITION

Pass only if frozen Worked Trace 02 proves across fresh contexts that:

1. GT01 retained its exact BUILD 0 UUID and now resolves as `R=1, T=1`;
2. the registered-only fixture resolves as `R=1, T=0` without any descriptive, classificatory,
   standing, authority, currentness, or native-binding row;
3. the absent fixture resolves as `R=0, T=0` without manufacturing unknown/question state;
4. a `T=1, R=0` commit is structurally rejected and classified as coupling failure when observed;
5. failed new-Thought capture leaves neither the Thought nor its newly created Referent committed;
6. database inspection finds only the selected identity spine plus the required coupling change;
7. the BUILD 0 MCP regression suite still passes 6/6;
8. the BUILD 1 fixture suite still passes 5/5 and deterministic traces do not drift; and
9. no BUILD 3+ standing, claim, evidence-link, relation, event, artifact, governance, or binding
   machinery exists.

## FAILURE BEHAVIOR

- invalid or unregistered UUID lookup returns `referent_not_registered`; it does not guess by text;
- duplicate UUID registration fails explicitly and does not claim subject equivalence;
- activation failure rolls back the entire activation transition;
- Thought/Referent coupling failure blocks commit;
- capture failure rolls back both newly attempted rows; and
- any need for excluded semantic or authorization state returns to the human Shape gate.

## APERTURE

Remain unresolved because BUILD 2 does not require them:

- later binding/refinement of an already-registered unclassified Referent;
- semantic discovery by description, alias, embedding, type, or classification;
- co-reference, merge, split, deduplication, or entity resolution;
- claims, Evidence Links, standing vocabularies, authority, warrant, and currentness;
- bindings to native surfaces other than the current Thought scope; and
- a public or MCP Referent interface.

These are nonblocking because none changes the selected persistence Shape, activation transaction,
authorization boundary, four-state observation, or frozen acceptance result.

## REVALIDATION TRIGGER

Reopen Shape before implementation if Worked Trace 02 cannot pass without:

- adding a field or table excluded by Candidate B;
- making identity depend on description, classification, or encountered native binding;
- implementing later binding/refinement of the registered-only fixture;
- creating co-reference/entity-resolution behavior;
- adding a new public/MCP authorization surface;
- changing an existing Thought UUID; or
- weakening atomic activation or post-activation coupling.

## NON-GOALS / DO NOT BUILD

- do not implement BUILD 2 before explicit human release;
- do not add `native_type`;
- do not add description, alias, metadata, semantic state, standing, authority, or currentness;
- do not add a native-binding table;
- do not implement later binding/refinement of an already-registered Referent;
- do not implement semantic discovery, co-reference, entity resolution, merge, split, or deduplication;
- do not add claims, Evidence Links, typed relation claims, Events, Artifacts, warrants, governance
  bootstrap, Master-Key physicalization, action envelopes, or BUILD 3+ machinery;
- do not change BUILD 0 content, embedding, retrieval, MCP tool semantics, or GT01 UUID;
- do not modify BUILD 1 evidence; and
- do not deploy or mutate the canonical database during Shape ratification.

## HUMAN STOP CONDITIONS

Stop and return to the human rail if implementation has not been explicitly released, the exact Shape
anchor is absent or unreachable, a BUILD 0/1 reopening condition appears, an invariant would collapse,
or passing the trace requires crossing a non-goal.

## CURRENT HUMAN GATE

The pre-implementation Shape is ratified and remotely anchored. Implementation remains unopened until
the human explicitly releases BUILD 2 from this committed state.
