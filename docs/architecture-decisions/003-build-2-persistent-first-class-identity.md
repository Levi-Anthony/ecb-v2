STATUS: ACCEPTED 2026-09-04
DISPOSITION: DECISION_RECORD

# ADR-003 — Persistent first-class identity registration for BUILD 2

## CONTEXT

The Build Contract previously described a Referent as the universal stable identity of a persistently
addressable governance object, and the universal-identity invariant enumerated governance objects.
BUILD 0 nevertheless established a persisted Thought with a durable ECB UUID, and BUILD 1 ratified the
resulting stable referential addressability without claiming that Universal Referents had been
implemented.

BUILD 2 must close that semantic gap. Its minimum proof requires a subject to remain stably
addressable and exactly resolvable before ECB has encountered its description, classification, or a
native binding. Implementation cannot begin while registration appears limited to already-described
governance objects.

## LOCAL DECISION

Referent registration extends from governance-object identity to persistent first-class identity.
Every persistent first-class subject of inspection or relation, including existing and future
Thoughts, is eligible for and subject to the universal identity rule even when its description,
classification, or native binding has not yet been encountered.

The selected BUILD 2 physical Shape is only:

```text
referents(
  id UUID PRIMARY KEY,
  registered_at TIMESTAMPTZ NOT NULL
)
```

There is no `native_type`. BUILD 2 adds no description, alias, metadata, semantic state, standing,
authority, currentness, or native-binding table.

Registration means that the UUID exists in `referents`. It supplies stable referential addressability.
It is not semantic promotion, assertion, standing, authority, warrant, authorization, governing
designation, or currentness. It does not guarantee semantic discoverability.

UUID uniqueness is not subject uniqueness. Registration does not decide whether two Referents are
co-referential and does not perform entity resolution. Observing that a registered UUID has no native
record in the inspected scope does not create persisted epistemic or question standing.

Existing BUILD 0 Thoughts retain their exact UUIDs. In particular, GT01 remains
`19a949ea-a8fc-4250-a386-fa64e5530180`; activation registers that same UUID and does not mint a
replacement.

Before BUILD 2 activation, an accepted BUILD 0 Thought without a `referents` row is expected substrate
state. Activation is one atomic transition: it creates the identity spine, registers every existing
Thought under the same UUID with a database-generated activation-transaction timestamp, and installs
structural same-UUID coupling. If any part fails, activation does not commit. After activation, a
committed Thought without its same-UUID Referent is an integrity violation.

After activation, creation of a new Thought and its same-UUID Referent is atomic. A failed Thought
capture may not leave a newly registered Referent behind. Registration of a subject with no encountered
Thought binding remains independently valid. BUILD 2 does not implement later attachment of a Thought
or another native representation to such an already-registered Referent.

Exact-UUID observation in the BUILD 2 Thought scope is:

| `R` — UUID in `referents` | `T` — same UUID in current Thought surface | Required observation |
|---|---|---|
| 0 | 0 | `referent_not_registered(scope=...)` |
| 1 | 0 | registered; `native_binding.absent_in_scope(scope=thoughts)` |
| 1 | 1 | registered; `native_binding.present(type=thought)` |
| 0 | 1 | `referent_coupling_broken` |

These observations are resolver results, not additional persisted semantic state.

No new public or MCP authorization surface is created by this decision. BUILD 2 preserves the current
human-door bearer boundary. The registry has RLS enabled with no client policy; `anon` and
`authenticated` receive no direct registry access. Only the `SELECT` and bounded registration/capture
access required by BUILD 2 remains inside the existing server-side service-role boundary; it receives
no registry `UPDATE` or `DELETE` capability. Technical access does not confer governance authority.

## WHY REQUIRED NOW

Without this ratification, two incompatible implementations remain locally plausible: a registry only
for governance objects, or a universal registry that includes the existing Thought substrate and
subjects whose native representation is absent. They produce different persistent identity sets,
different activation behavior, and different answers for the same UUID. BUILD 2 cannot be released
until this choice and its acceptance consequences are explicit.

## ALTERNATIVES CONSIDERED

### Governance objects only

Retain the prior wording and leave Thoughts outside the registry. Rejected because the same durable ECB
UUID would be referentially addressable but excluded from the purported universal identity spine.

### Identity spine — selected

Register only UUID and registration time, keep type-specific content native, and derive the bounded
Thought-scope observation from registry/native-record presence. This is the smallest Shape that proves
identity can precede description, classification, or encountered native binding.

### Typed or descriptive registry

Add `native_type`, descriptions, aliases, metadata, classification, or a binding table. Rejected for
BUILD 2 because each addition conflates or prematurely couples identity with semantics not required by
the frozen proof.

### Entity-resolution registry

Treat UUID uniqueness as subject uniqueness or merge likely co-referential records. Rejected because
referential identity is not a co-reference claim, and BUILD 2 has no claim/evidence standing machinery
with which to govern that decision.

## INVARIANTS AFFECTED

- identity ≠ description;
- thought ≠ promoted object;
- unknown ≠ nonexistent;
- unclassified ≠ invalid;
- evidence ≠ assertion;
- relevance ≠ authority;
- confidence ≠ standing;
- current ≠ newest;
- capability ≠ warrant or authorization; and
- type-specific content remains in its native record.

## STANDING / AUTHORITY

The Build Contract routes invariant changes through an explicit architecture decision and human
authorization. The human explicitly required this semantic extension and authorized the bounded
ADR-003 ratification on 2026-09-04, conditional on coherent repository reconstruction and no new
blocking Shape issue. Read-only reconstruction found no conflicting authority or BUILD 1 reopening
condition.

This acceptance ratifies pre-implementation Shape only. It does not release BUILD 2 implementation.

## REVERSIBILITY

Before implementation, this decision is documentation-only and can be superseded by another explicit
human-ratified ADR. After activation, removing registry rows would erase recorded identity and cannot
be treated as a reversible schema cleanup. Any later supersession must preserve existing UUIDs and
their registration evidence or explicitly govern their disposition.

## REOPENING CONDITION

Reopen before implementation if the frozen trace cannot be passed without adding description,
classification, native type, semantic state, standing, authority, currentness, co-reference/entity
resolution, a native-binding table, or a new public/MCP authorization surface.

Reopen after release if exact-UUID observation cannot distinguish the four declared `R`/`T` states, if
activation or new Thought capture can commit `T=1, R=0`, if failed Thought capture can leave its newly
created Referent committed, or if preserving the existing GT01 UUID proves impossible.
