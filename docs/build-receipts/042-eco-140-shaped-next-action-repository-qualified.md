STATUS: REPOSITORY-QUALIFIED + CANONICAL; PRODUCTION INSTALL UNVERIFIED
DISPOSITION: ADJACENT ECO-140 MOVE RECEIPT
DATE: 2026-09-16 UTC

# ECO-140 — Active disposition → shaped next atomic action

## Authority and boundary

Linear commission: ECO-140 — `[Adjacent][Move] Active Disposition → Shaped Next Atomic Action — physicalize current projection + stale-basis rejection`.

Controlling Shape: ECO-139.

This adjacent Move installs a system-wide obligation on active disposition:

> every current active disposition exposes exactly one shaped `ACTION` or explicit `HOLD`.

Companion operating law:

> **Shape continuously. Execute selectively.**

The mechanism is not a general planner, task manager, executor, or action-authority system.

Operational definition of atomic action:

> the smallest action whose observable outcome can materially update the current disposition without hiding another consequential decision inside it.

## Qualified repository delta

Qualified candidate head:

`7fd654d3db4df072aa623f5dafe0cf1bd5da3ead`

PR #48 — `ECO-140: active disposition → shaped next atomic action`

Squash-merged repository main:

`bf991b23c5f991a954d86967a779cf2445e0c36a`

Principal implementation surfaces:

- `sql/migrations/20260916030000_eco140_shaped_next_action.sql`
- `tests/eco-140/qualify.sql`
- `.github/workflows/eco-140-shaped-next-action.yml`
- `server.ts`

## Physicalized contract

### Immutable shaped expression

The shaped expression reuses BUILD 12 immutable `text_artifacts`.

Artifact persistence does not confer:

- projection currentness;
- truth;
- standing;
- authority;
- execution permission.

A newer Artifact never becomes current merely because it is newer.

### Projection role belongs to disposition currentness

`public.thought_disposition_projections` binds one disposition revision to:

- one exact projection Artifact;
- one structural projection kind: `ACTION` or `HOLD`;
- binding time.

The binding is immutable.

There is no separate next-action currentness subsystem. The current projection is the projection bound to the exact current disposition revision.

Thus:

`current disposition revision -> exact ACTION/HOLD projection Artifact`

### Truthful installation transition

Existing ECO-138 dispositions are not retroactively rewritten as though next-action shaping existed earlier.

Installation advances each then-current disposition once to a new revision whose predecessor is the old current revision and whose projection is an explicit neutral HOLD stating that re-shaping is required before consequential reliance.

New admissions receive a neutral HOLD structurally, without an LLM/planner invocation.

### Deterministic teeth

The repository mechanism enforces:

- every current active disposition has one projection;
- head advancement to an unprojected revision fails closed;
- ACTION/HOLD projection bindings are immutable;
- `HOLD` requires a concrete reentry condition when explicitly selected through the ordinary transition RPC;
- exact predecessor/current disposition revision is required for reshaping;
- BUILD 11 operation identity supplies replay/conflict semantics;
- stale predecessor fails;
- newest Artifact does not substitute for explicitly current projection;
- the old ECO-138 unprojected disposition RPC is no longer executable by the ordinary role after ECO-140;
- cold recovery returns the exact current projection by disposition revision rather than recency.

### Runtime contract

The outward ordinary tool inventory stays small:

- `capture_thought`
- `search`
- `fetch`
- `set_thought_disposition`
- `create_artifact`
- `fetch_artifact`

No planner/executor tool is added.

`set_thought_disposition` now binds an exact existing projection Artifact plus `ACTION`/`HOLD` kind while preserving exact predecessor currentness.

`fetch` returns evidence, custody provenance, active disposition, and exact current projection as distinct surfaces.

## Semantic responsibilities deliberately not frozen

The system does not mechanically score or choose a universal “best next action.”

Worker/model judgment remains responsible for:

- whether an action is actually atomic at the present decision surface;
- which uncertainty is decision-bearing;
- whether more inquiry is valuable;
- ACTION versus HOLD;
- whether the expected observation can genuinely reshape the frontier;
- whether the smallest legitimate next action is a Principal meaning/taste question rather than a technical operation.

Those judgments remain inspectable through the projection Artifact rather than being reduced to a global optimizer.

## Mechanical qualification

All three independent workflows passed on the exact qualified head `7fd654d3db4df072aa623f5dafe0cf1bd5da3ead`:

- ECO-140 shaped next atomic action — run `35081716208` — PASS;
- ECO-138 admission provenance + active disposition regression — run `35081716210` — PASS;
- BUILD 12 greenfield Artifact regression — run `35081716104` — PASS.

The ECO-140 proof covered:

- installation coverage for every current disposition;
- neutral HOLD initialization without semantic planning;
- exact ACTION binding;
- cold recovery of exact current projection;
- newest-candidate non-substitution;
- replay/conflict;
- stale-predecessor rejection;
- HOLD reentry requirement;
- ACTION → HOLD reshaping;
- historical projection preservation;
- unprojected-head rejection;
- projection-binding immutability;
- old unprojected disposition-RPC bypass denial;
- direct ordinary-role projection-write denial;
- Claim/Evidence-Link standing non-inflation;
- final one-current-projection invariant;
- no planner or action-authority runtime surface.

## Explicit nonclaims

This receipt does not establish:

- autonomous planning;
- generalized task management;
- recursive decomposition by default;
- action execution;
- action authorization;
- Master-Key authority;
- a priority optimizer;
- queue/SLA infrastructure;
- production installation of ECO-138 or ECO-140.

A current shaped ACTION is guidance only. It is not entitlement to execute.

## Production boundary

Repository qualification and canonical merge are proven.

Canonical live installation is **not proven by this receipt**. ECO-140 depends on ECO-138's active-disposition substrate, so live installation order is necessarily:

1. verify BUILD 12 production predecessor/currentness;
2. install and verify ECO-138;
3. install and verify ECO-140;
4. deploy/verify canonical runtime code;
5. run one live cold-recovery specimen proving current ACTION/HOLD projection;
6. only then call the system-wide shaping investment production-installed.

Until that proof exists, `BUILD_CHECKOUT.md` remains correct in identifying BUILD 12 as the last production-verified state.

## Exact reentry seam

The next atomic action is **live installation/verification**, not more architecture design.

If the live predecessor differs materially from the qualified BUILD 12 → ECO-138 → ECO-140 sequence, reconcile actual state before mutation. Do not replay migrations blindly and do not weaken the shaping contract to fit a stale runtime.