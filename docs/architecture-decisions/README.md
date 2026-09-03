STATUS: ACTIVE  
DISPOSITION: DECISION_RECORD  
ROLE: Index and template for local architectural closure

# Architecture Decision Records

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
