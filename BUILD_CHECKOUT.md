STATUS: IMPLEMENTED — METABOLIZE AWAITING HUMAN CLOSURE
DISPOSITION: PROJECTION
ROLE: Current human/agent checkout
AUTHORITY: Derived from the Build Contract, invariants, ADR-003, ADR-004, frozen acceptance behavior, and explicit human reentry instruction
CURRENT BUILD UNIT: BUILD 2 — Universal Referents (IMPLEMENTED; CLOSURE UNOPENED)

# BUILD 2 — Universal Referents

## CURRENT MOVE

BUILD 2 is implemented in the canonical database and frozen Worked Trace 02 passes. Stop at BUILD 2
Metabolize for human closure.

The human explicitly released implementation from Shape commit
`866b3fcac248e667af80cee4e0e60e6d8ff07cfe` and root tree
`d058b9f29fee15f9741512380cb5d17c5aac6d02`. Migration
`20260904093341_build_2_universal_referents` is installed in canonical Supabase project
`vezxivrvhakclxuvxzso`. Execution evidence is recorded in
[`docs/build-receipts/003-build-2.md`](docs/build-receipts/003-build-2.md).

Do not declare BUILD 2 closed or open BUILD 3 without explicit human metabolization closure.

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

## SELECTED PHYSICAL REALIZATION

ADR-004 freezes one imperative migration using:

- a `SECURITY INVOKER` row-level `BEFORE INSERT` trigger on `public.thoughts` that inserts only `NEW.id`
  into `public.referents` and contains no conflict suppression;
- the existing direct Thought runtime unchanged;
- no SQL resolver function, view, RPC, stored observation, or MCP addition;
- service-role `SELECT` plus column-level `INSERT (id)` on `public.referents`, with no `UPDATE` or
  `DELETE`;
- an immediate, `NOT DEFERRABLE`, same-UUID foreign key with no cascade, set-null, or set-default
  behavior;
- registered-only fixture insertion inside activation;
- a `SHARE ROW EXCLUSIVE` activation lock on `public.thoughts`; and
- rollback proof after the trigger has attempted registration.

Error serialization remains outside BUILD 2 because there is no production Referent resolver/API.

## ACTIVATION TRANSITION

Before BUILD 2 activation, an accepted BUILD 0 Thought without a Referent row is expected substrate
state.

Activation SHALL be one database transaction that:

1. begins and acquires `SHARE ROW EXCLUSIVE` on `public.thoughts` before any activation change;
2. creates `public.referents` with exactly the selected two-column Shape and a
   `transaction_timestamp()` default for `registered_at`;
3. creates and installs the invoker registration trigger;
4. registers every then-existing `public.thoughts` UUID without changing that UUID;
5. registers fixture `2eede0e4-b27a-4383-850e-a448f0113c9f` without a Thought;
6. assigns all activation registrations the database transaction time rather than rewriting Thought
   `captured_at` as registration time;
7. installs the immediate, non-deferrable, non-cascading same-UUID foreign key;
8. enables RLS, installs and verifies the frozen grants, and verifies the schema/coupling Shape; and
9. commits, releasing queued writers only after every preceding change is active.

If any step fails, none of activation commits.

After activation, a committed Thought without its same-UUID Referent is an integrity violation. New
Thought creation and its new same-UUID Referent registration SHALL commit atomically. A failed Thought
capture may not leave that newly created Referent committed.

The trigger inserts a fresh Thought UUID into `public.referents` before the Thought insert. It does not
use `ON CONFLICT`. An already-registered UUID therefore fails rather than silently acquiring a later
Thought binding.

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
- ADR-004;
- frozen Worked Trace 02; and
- the exact pre-implementation commit/tree anchor for this Shape.

## OUTPUT — OBSERVED

One bounded BUILD 2 implementation that produces:

- one canonical `public.referents` identity spine;
- same-UUID registration of every existing Thought;
- structural post-activation Thought-to-Referent coupling;
- atomic registration for every newly committed Thought;
- a write-interlocked activation transition;
- one registered Referent with no Thought in the inspected scope; and
- exact-UUID observations matching all four declared `R`/`T` cases.

This output is installed in the canonical project. Passing execution evidence does not itself close the
Build Unit.

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
- a row-level invoker registration trigger on every direct Thought insert;
- a `SHARE ROW EXCLUSIVE` activation interlock that queues concurrent Thought writers;
- atomic activation/backfill/coupling installation; and
- atomic creation of a new Thought with its new Referent.

**OBSERVATIONAL — exact-UUID acceptance harness:**

- resolve only by supplied UUID;
- compare registry and current Thought-surface presence;
- return the frozen `R`/`T` observation; and
- rerun BUILD 0 and BUILD 1 regression suites.

The resolver result is not another truth store. Observation uses harness queries only; no persistent
resolver object is authorized.

## AUTHORIZATION BOUNDARY

No new public, client, or MCP authorization surface is part of BUILD 2.

- preserve the existing single human door and bearer boundary;
- grant `anon` and `authenticated` no direct access to `public.referents` or BUILD 2 resolver behavior;
- enable RLS without client policies on `public.referents`;
- grant the service role only `SELECT` plus column-level `INSERT (id)` on `public.referents`, with no
  table-level insert, `UPDATE`, or `DELETE`;
- revoke direct trigger-function `EXECUTE` from `PUBLIC`, `anon`, and `authenticated`; and
- do not infer governance authority from database capability or bearer possession.

Worked Trace 02 is verified at the canonical persistence boundary. No new MCP tool is required to pass.

## TEST / PASS CONDITION

**EXECUTION RESULT: PASS — HUMAN METABOLIZATION CLOSURE PENDING**

See [`docs/build-receipts/003-build-2.md`](docs/build-receipts/003-build-2.md).

Pass only if frozen Worked Trace 02 proves across fresh contexts that:

1. GT01 retained its exact BUILD 0 UUID and now resolves as `R=1, T=1`;
2. the registered-only fixture resolves as `R=1, T=0` without any descriptive, classificatory,
   standing, authority, currentness, or native-binding row;
3. the absent fixture resolves as `R=0, T=0` without manufacturing unknown/question state;
4. a `T=1, R=0` commit is structurally rejected and classified as coupling failure when observed;
5. a direct Thought insert queues behind the activation lock and resumes only through the committed
   trigger and foreign key;
6. the rollback probe fires the trigger and then fails an existing Thought constraint, leaving neither
   the Thought nor its newly attempted Referent committed;
7. database inspection finds only the selected identity spine plus the required trigger/coupling
   machinery;
8. the BUILD 0 MCP regression suite still passes 6/6 with the runtime and tool inventory unchanged;
9. the BUILD 1 fixture suite still passes 5/5 and deterministic traces do not drift; and
10. no BUILD 3+ standing, claim, evidence-link, relation, event, artifact, governance, or binding
   machinery exists.

## FAILURE BEHAVIOR

- invalid or unregistered UUID lookup returns `referent_not_registered`; it does not guess by text;
- duplicate UUID registration fails explicitly and does not claim subject equivalence;
- concurrent Thought writes queue at the activation interlock and do not cross the old insert path;
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
- weakening the invoker trigger, activation interlock, atomic rollback, or post-activation coupling.

## NON-GOALS / DO NOT BUILD

- do not treat implementation or PASS evidence as human closure;
- do not add `native_type`;
- do not add description, alias, metadata, semantic state, standing, authority, or currentness;
- do not add a native-binding table;
- do not add a SQL resolver function, view, RPC, stored observation, or MCP Referent tool;
- do not replace the direct Thought insert with a transactional RPC or deploy a runtime change;
- do not implement later binding/refinement of an already-registered Referent;
- do not implement semantic discovery, co-reference, entity resolution, merge, split, or deduplication;
- do not add claims, Evidence Links, typed relation claims, Events, Artifacts, warrants, governance
  bootstrap, Master-Key physicalization, action envelopes, or BUILD 3+ machinery;
- do not change BUILD 0 content, embedding, retrieval, MCP tool semantics, or GT01 UUID;
- do not modify BUILD 1 evidence; and
- do not deploy or mutate the canonical database during Shape ratification.

## HUMAN STOP CONDITIONS

Stop and return to the human rail if the exact Shape anchor becomes absent or unreachable, a BUILD 0/1
reopening condition appears, an invariant would collapse, passing the trace requires crossing a
non-goal, or any step would open BUILD 3 before BUILD 2 closure.

## CURRENT HUMAN GATE

BUILD 2 implementation and acceptance evidence are complete. Human metabolization closure remains
required before BUILD 2 can be declared closed or a BUILD 3 checkout can be installed.
