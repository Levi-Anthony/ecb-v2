STATUS: ACTIVE  
DISPOSITION: DECISION_RECORD  
ROLE: Index and template for local architectural closure

# Architecture Decision Records

## Index

| ADR | Status | Bounded decision |
|---|---|---|
| [ADR-001](001-build-0-human-door.md) | ACCEPTED | Supabase Edge Function as the BUILD 0 human door |
| [ADR-002](002-build-0-physical-substrate.md) | ACCEPTED | BUILD 0 physical substrate |
| [ADR-003](003-build-2-persistent-first-class-identity.md) | ACCEPTED | Persistent first-class identity registration for BUILD 2 |
| [ADR-004](004-build-2-physical-realization.md) | ACCEPTED | BUILD 2 trigger, coupling, interlock, and privilege realization |
| [ADR-005](005-cross-cutting-integrity-and-promotion-discipline.md) | ACCEPTED BY HUMAN GOVERNING DISPOSITION | Cross-cutting integrity, promotion, requalification, and adversarial-disposition discipline |

Create an ADR when the active Build Unit requires a local architectural choice that is not already licensed by governing sources.

Each ADR must record:

- **CONTEXT** — the concrete condition requiring a choice;
- **LOCAL DECISION** — the bounded choice being closed;
- **WHY REQUIRED NOW** — why the active Build Unit cannot proceed without closure;
- **ALTERNATIVES CONSIDERED** — the viable options actually compared;
- **INVARIANTS AFFECTED** — governing constraints served or placed under pressure;
- **STANDING / AUTHORITY** — who or what licenses this local closure;
- **REVERSIBILITY** — what can be undone and what evidence would survive;
- **REOPENING CONDITION** — the concrete observation that makes this closure insufficient.

An ADR may close a locally delegated architectural choice.

It may not amend a governing invariant or broaden the build contract unless separately authorized through the governing change route.

## Minimal template

```text
STATUS: PROPOSED | ACCEPTED | SUPERSEDED
DISPOSITION: DECISION_RECORD

# ADR-NNN — Decision title

## CONTEXT

## LOCAL DECISION

## WHY REQUIRED NOW

## ALTERNATIVES CONSIDERED

## INVARIANTS AFFECTED

## STANDING / AUTHORITY

## REVERSIBILITY

## REOPENING CONDITION
```
