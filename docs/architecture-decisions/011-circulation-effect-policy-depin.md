# ADR-011 — Retire qualification-fixture ceilings from circulation control

**Date:** 5 October 2026  
**Standing:** accepted Greenfield correction under ECO-214 continuity reconciliation.

## Finding

The inherited bundle **100 requests / 16,000 input / 4,000 output / USD 2 / <=48 hour remit** was not derived by the accepted ECO-213 semantic-circulation Shape. It appeared during the bounded qualification renderer and was then copied forward as if it were architecture.

The evidence is direct:

- the original Shape says “bounded implementation” but does not derive these numbers;
- the commission renderer hard-coded exactly those values and auto-generated a 48-hour expiry;
- the storage harness calls the associated remit a **constructed test remit / disposable test only**;
- the commission test asserted the literal string `100,16000,4000,2`;
- the first database migration promoted those values into global CHECK constraints for every remit.

That is qualification-fixture leakage into the durable control plane.

## Classification

| Inherited item | Disposition |
| --- | --- |
| USD 2 aggregate ceiling | **RETIRE as universal/current default.** Keep optional per-remit spend fuse when a real financial/operational policy owns it. |
| 100 request ceiling | **RETIRE as universal/current default.** Keep optional per-remit request fuse when a real operational policy owns it. |
| 16,000 input ceiling | **RETIRE as universal/current default.** It was also documented as tokens while the worker uses a conservative UTF-8-octet token upper bound. Provider capability must be checked directly; a remit may impose a stricter optional ceiling. |
| 4,000 output ceiling | **RETIRE as universal/current default.** Provider/model capability is the technical upper bound; a remit may impose a stricter explicit ceiling. |
| <=48 hour database lifetime / 24-hour successor release | **RETIRE as generic requirement.** Expiry is optional effect-authority policy, separate from durable installation and credential custody. |
| Frozen eight-source corpus | **RETAIN AS QUALIFICATION FIXTURE.** It remains useful evidence for assimilation/reconstruction and the accepted twelve-obligation plan, but it is not a production corpus limit or operating horizon. |

## Durable rule

The control plane keeps optional effect-resource fuses but no longer supplies universal phantom numbers.

- actor/source/effect scope remains explicit;
- enabled/supersession/revocation remains authoritative;
- optional expiry is allowed when the authority actually expires;
- optional aggregate request/spend fuses are allowed when owned by a current policy;
- provider context/completion capability is checked live before dispatch;
- live tariff is quoted and worst-case cost reserved before provider dispatch;
- the eight-source corpus remains a named evidence fixture only.

No NULL limit means “implicitly safe.” It means **that dimension is not bounded by this remit** and must be justified by the governing activation/operational policy before continuous unattended effects are enabled.

## Current ECO-214 consequence

The October 5 successor envelope copied the old bundle under a “same-or-tighter” rule. That copy-forward is superseded as a control rationale. The installation remains fail-closed while provider custody and the corrected execution policy are reconciled. No broader effect authority is created merely by removing phantom global ceilings.

## Reentry

Reopen if real operation demonstrates the need for a distinct time-windowed rate/spend policy object rather than optional per-remit fuses, or if provider capability metadata proves insufficient for safe pre-dispatch resource validation.
