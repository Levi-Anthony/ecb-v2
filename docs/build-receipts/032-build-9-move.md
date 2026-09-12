# ECO-109 BUILD 9 Constructive Move — final return

Status: complete as a bounded disposable serial specimen; ready for human Metabolize review. This receipt does not perform Metabolize, merge to `main`, open BUILD 10, or confer deployment or action authority.

## Authority, continuity, and evidence freeze

- Move authority: ECO-109 (`3a21b702-2b12-4a91-a726-82eda043b261`), retained commission state OPEN / AUTHORIZED in `evidence/build-9/source/eco-109.json`. The live Linear surface was unavailable to this final integrator; repository evidence, not a substituted live summary, is the proof source.
- Authorized baseline: `2ea989d1a5be083d41b9f83908a7d3a191d5b5ed`.
- Worktree: `/Users/prodadmin/ECB-build-9-move`.
- Branch: `build/eco-109-build-9-move`.
- Final frozen implementation/test qualification HEAD: `8c01b8db29b2bd728f7bf8c64992b0a944b5af0c`.
- Deterministic qualification evidence commit: `22269078402959ec679c9a802454a7d0a031af98`.
- P16 cold-recovery evidence commit: `bba3730f98b3746d0b965b8884bb81243f81563f`.
- Final Move-return integration commit: the commit containing this receipt; it is documentation-only and follows the three frozen hashes above.
- At final-integration entry, local HEAD and `origin/build/eco-109-build-9-move` both equalled `bba3730f98b3746d0b965b8884bb81243f81563f`, the worktree was clean, and `git merge-base --is-ancestor 2ea989d1a5be083d41b9f83908a7d3a191d5b5ed HEAD` succeeded. The baseline is the exact merge base of the baseline and qualification HEAD. No rebase or intervening `main` state was introduced into the proof basis.

The final qualification is only `qual-01` against `8c01b8db29b2bd728f7bf8c64992b0a944b5af0c`, plus the separately retained P16 cold-worker evidence. Earlier `clean-01-*`, `composition-02`, standing probes, and development runs remain failure/history evidence and are not promoted to final qualification.

## Move commit ledger

| Commit | Class | Role |
|---|---|---|
| `2e2a1b09753c785950daebe34360136e81807cec` | implementation, test, documentation/evidence | Retained the authorization/Shape sources and initial protected bounded-inquiry migration, roles, fixture support, setup, and smoke surface. |
| `b7682bf019f9661b81773ff88241fc976b657215` | implementation, test, documentation/evidence | Repaired protected transitions; added finite comparator, recovery projection, primary/supplemental/concurrency/crash/composition harnesses, and preserved development failures. |
| `b0f028cb7528cf695a7a502d6b071a20c2ffcd73` | implementation, test, documentation/evidence | Added native Claim-standing observation/locking and ABA/race coverage, repaired composition setup, compacted recovery, and retained the checkpoint plus pre-qualification evidence. |
| `deed5e0c8cd20b578f248f3e6a66b9a8b668c692` | documentation/evidence only | Recorded the bounded qualification executor and independent-review handoff. |
| `8c01b8db29b2bd728f7bf8c64992b0a944b5af0c` | test only | Added `standing.mjs` to the deterministic qualification sequence and froze the final implementation/test seam. |
| `22269078402959ec679c9a802454a7d0a031af98` | documentation/evidence only | Retained the complete corrected `qual-01` catalog, setup/install logs, five result surfaces, logs, and final positive locator. |
| `bba3730f98b3746d0b965b8884bb81243f81563f` | documentation/evidence only | Retained the separate cold-worker P16 return and independent grading. |
| final receipt commit | documentation only | Integrates the frozen evidence into this cold-reviewable Move return; no implementation or test logic changes. |

## Final implementation and test surfaces

Implementation/test state is exactly that at `8c01b8db29b2bd728f7bf8c64992b0a944b5af0c`.

| Surface | Role |
|---|---|
| `sql/migrations/20260912160000_build_9_recursive_inquiry.sql` | Four protected Artifact roles; immutable transition chain; tuple validation; finite comparison; open, publish, return, observe, retry, reentry, reconstruction; scope/Claim serialization; narrow role grants and indexes. SHA-256 `988b6c1ae8fdd2cd27d26aaf4085e1e414945571fb910d0a2041ee41425648d1`. |
| `server/build-9/card.mjs` | Rebuildable compact projection with exact source pointers and explicit non-promotion; it stores no independent card truth. |
| `server/build-9/recover.mjs` | Read-only locator entry and exact `--source` drill-down through the observer role. |
| `tests/build-9/roles.sql`, `setup.sh`, `support.mjs`, `catalog.mjs` | Disposable PG17 role/fixture setup, exact helpers, and before/after substrate catalog. |
| `tests/build-9/primary.mjs` | P01–P08, P10–P11, P13–P15, P17 acceptance/adversarial controls. SHA-256 `40e71fe3e12819d93c5d9a90273f4958b5ac6e31b7bf69df830d60a58a3ee4b9`. |
| `tests/build-9/supplemental.mjs` | Missing-source/history, fresh-successor, pre-open drift/incomplete coverage, and undeclared-writer controls. |
| `tests/build-9/resilience.mjs`, `crash-worker.mjs` | P09 row-lock orderings and P12 transaction interruption, lost-acknowledgement, and PG17 crash recovery. Resilience SHA-256 `c6fc6d34f9d6c8d3983e325e8b120c172332f256fcf1ad6be4f4155d621bc297`. |
| `tests/build-9/standing.mjs` | Native BUILD 5A Claim-standing ABA plus writer commit/rollback serialization. |
| `tests/build-9/composition.mjs` | P18 differential checker, ACL, trigger, pointer, role-routing, old-source, and designation non-interference controls. |
| `tests/build-9/verify.sh` | One clean disposable qualification sequence; the final freeze includes the standing stage. |
| `tests/build-9/smoke.mjs`, `reload.sh`, `standing-probe.mjs` | Development-only smoke/reload/reproducer surfaces; not independent final qualification evidence. |

## Final physicalization decisions

| Frozen obligation satisfied | Liability removed | Selected realization | Smallest credible alternative | Why no broader semantics/authority were introduced |
|---|---|---|---|---|
| M1–M6; P02, P14, P18 protected participation | Wrong-role artifacts entering a predecessor checker; duplicate semantic stores | `b9_basis`, `b9_inquiry`, `b9_event`, and `b9_judgment` roles on the existing immutable Artifact substrate, with native bindings to existing Claims | One new role plus a protected subtype discriminator | Roles are physical routing/custody only. `depends_on` retains conditional-validity meaning; no Parent, Child, Evaluation, or Epoch primitive and no second Claim store was added. |
| M2, M4, M5; P08, P09, P11, P12 | Torn opening/suspension, stale reentry, duplicate/conflicting successors, ABA collapse | Existing synthetic `ecb7.scopes` row as the serial lock, read-committed transactions, immutable predecessor chain, unique successor/request/terminal indexes, exact CAS and request signatures | Mutable current pointer with CAS | Folded immutable history remains source truth. No pointer authority, global clock, vector clock, or multi-child ordering semantics were added. |
| M5; P08, P09, P18 native standing composition | A native Claim writer changing/restoring decision-bearing standing outside the observation boundary | Shared row locks on every participating existing Claim; retained standing plus standing-transition identities at bind/open/reentry; read-only native source drill-down | Observe only the synthetic basis Artifacts | This composes the existing BUILD 5A writer boundary. The non-login owner receives the narrow UPDATE-column capability required to acquire PostgreSQL row locks, but no BUILD 9 runtime function updates Claim standing. |
| M3, M4, M5; P01, P05, P06 and G1 | Producer assertion, decorative G1, or an insensitive comparator masquerading as proof | Protected finite comparator derives obligation findings from retained rules/witnesses; the same compare/publish/reenter surfaces handle valid G1, substituted insensitive G1, and removed G1 | Trust a signed outcome/evaluator label | Only declared finite field/provenance rules are checked; the retained real invariant source remains non-synthetic. No universal semantic correctness, self-ratification, or amendment claim follows. |
| M5; P07, P08, P10, P15 | Newest-bytes selection, PASS-as-permission, automatic FAIL routing, and wall-time causality | Exact selected versions, complete predecessor/event identities, conservative four-way routing, independently checked D2/remit, and fresh observations | Compare final digest/current value only | Dispositions are bounded inquiry records. PASS is evidence, never automatic CONTINUE; FAIL is routed by the bound parent criterion; historical success never becomes present permission. |
| M6; P13, P15, P16 | Hidden conversational reconstruction, stale cards, and duplicated mutable summaries | Regenerated source-linked compact card plus exact Artifact/Claim/standing-Event drill-down | Stored editable decision summary | Recovery is observational and non-authoritative; missing/corrupt sources yield HOLD. The card cannot write, designate, authorize, or independently establish currentness. |
| P14, P18 custody isolation | Child/runtime acquiring predecessor or real authority | Separate non-inheriting owner, parent, child, observer, and fixture-writer roles with least function grants | One shared runtime credential plus a role flag | Roles authenticate only bounded synthetic custody. Fixture installation remains trusted/excluded; none of the bounded roles is superuser, creator, or BYPASSRLS and no designation/action pointer is written. |
| P09, P12, P18 differential qualification | BUILD 9 proof work mutating inherited/canonical state | Dedicated loopback Docker PostgreSQL 17 `build9` database, reconstructed from accepted migrations for `qual-01` | Reuse the BUILD 8 or canonical cluster | Proof is limited to a disposable BUILD 9 target. Closed BUILD 7/8 proofs were not replayed beyond affected seams; no production/canonical installation occurred. |

## M1–M6 implementation map

| Mechanism | Final realization and evidence-bearing surface |
|---|---|
| M1 — Bind the parent decision | `ecb9.bind` validates and retains the exact synthetic parent contract, decision Claim, dependency Claims/slots and component versions, question/discriminator, step/remit, consequences, stopping/QF and initial Artifact plus native Claim observations. `ecb9.contract` and `ecb9.binding` reconstruct and validate it. |
| M2 — Open one bounded child and suspend continuation | `ecb9.open_child` runs under the serial scope and participating-Claim locks, validates the exact tuple and pre-open observations/consequence threshold, and appends one immutable `open` event. The folded state reports suspension; the successor constraint and active-child gate exclude competing accepted opens. |
| M3 — Conduct and retain bounded child judgment | `ecb9.compare`/`ecb9.examine` derive finite obligation findings; child-only `ecb9.publish` retains exact evidence, criteria, method, proposition/binding, attribution, limits, and typed outcome as one terminal judgment per attempt. `ecb9.retry_attempt` creates a distinct attempt. |
| M4 — Return to the exact dependency | Parent-only `ecb9.return_result` checks exact attempt, parent/version, dependency, component/version, questions, scope/remit and returned judgment binding before appending `return`; the child result satisfies only D1 and does not replace D2 or the whole parent basis. |
| M5 — Independently disposition parent reentry | `ecb9.reenter` re-folds complete history, verifies exact predecessor/request and supplied observations under scope/Claim locks, invokes `ecb9.route`, and appends exactly one CONTINUE, REQUALIFY, REORIENT, or HOLD/QF event. `ecb9.route` re-examines G1 and independently checks all parent conditions. |
| M6 — Preserve history and reentry after interruption | `ecb9.state`, `ecb9.replay`, `ecb9.inspect`, and `ecb9.read_source`, exposed by `recover.mjs`, reconstruct the immutable chain and current observation boundary. Exact request replay returns historical identity and current applicability separately; it cannot append or confer permission. |

## P01–P18 final qualification matrix

All results are qualifying PASS results against the frozen implementation/test HEAD. Unless a row says otherwise, the exact durable evidence is the named `docs/build-receipts/evidence/build-9/qual-01-*.json` file; the corresponding `.log` is the execution transcript. Primary evidence identifies implementation SHA `988b6c1a…`, primary-test SHA `40e71fe3…`, fixture SHA `4838cf38…`, fixture `b9-fixtures/v1`, and method `b9-adversarial/v1`.

| ID | Result | Exact test/control surface | Exact durable evidence | Relevant limit |
|---|---|---|---|---|
| P01 | PASS | `primary.mjs`: valid governance; substitute G1 program through the same compare/publish/reenter surfaces; remove bound G1; finite interpreter exact definition | `qual-01-primary.json` | Finite supplied rules and synthetic specimen; not universal self-proof. |
| P02 | PASS | `primary.mjs`: each publication tuple field swapped; sibling judgment; same focal Referent/different question; positive survives swaps | `qual-01-primary.json` | Exact declared tuple only. |
| P03 | PASS | `primary.mjs`: other dependency bars both answers; same child PASS does not replace D2; irrelevant evidence cannot open | `qual-01-primary.json` | Declared parent contract; no automatic dependency discovery. |
| P04 | PASS | `primary.mjs`: consequence-threshold `necessary`, `display`, `blocked`, `local`, and `no path`; `supplemental.mjs`: pre-open observation incomplete | `qual-01-primary.json`; `qual-01-supplemental.json` | One child level and one active child. |
| P05 | PASS | `primary.mjs`: bare, forged, contradictory, authority-bearing, opaque, missing-witness, wrong-criteria and complete-provenance controls; `supplemental.mjs`: incomplete pre-open observation | `qual-01-primary.json`; `qual-01-supplemental.json` | Bounded inspectable provenance, not universal semantic assurance. |
| P06 | PASS | `primary.mjs`: the same comparator handles sensitive and insensitive G1 plus producer-supplied fake finding | `qual-01-primary.json` | Finite comparator/witness vocabulary; same-author Register-B and trusted custody remain explicit. |
| P07 | PASS | `primary.mjs`: newer unselected version changes neither binding nor route; explicit changed reliance does | `qual-01-primary.json` | Exact retained selection only; no global currentness service. |
| P08 | PASS | `primary.mjs`: governance/applicability/method/criteria/witness ABA, missing coverage, revocation; `supplemental.mjs`: pre-open basis drift and fresh successor; `standing.mjs`: native decision/governance Claim-standing ABA | `qual-01-primary.json`; `qual-01-supplemental.json`; `qual-01-standing.json` | Event identities, not wall time/new clock; limited to declared sources and existing Claim writer. |
| P09 | PASS | `resilience.mjs`: writer commit before stale reentry, writer rollback, reentry-first/stale-writer/fresh observation; `standing.mjs`: native Claim writer commit and rollback with observed real lock wait | `qual-01-resilience.json`; `qual-01-standing.json` | Actual loopback PG17 row-lock serialization only; no distributed concurrency claim. |
| P10 | PASS | `primary.mjs`: CONTINUE, REQUALIFY, REORIENT, two HOLD branches, unrelated artifact; `supplemental.mjs`: fresh successor after drift | `qual-01-primary.json`; `qual-01-supplemental.json` | PASS is never automatic permission; FAIL follows bound consequence and is not automatic REORIENT. |
| P11 | PASS | `primary.mjs`: same request/changed binding, duplicate open, stale attempt, duplicate terminal/evaluator/return/reentry, exact replay/history | `qual-01-primary.json` | Exact local request/predecessor idempotency; no distributed exactly-once. |
| P12 | PASS | `resilience.mjs`/`crash-worker.mjs`: before/after commit for open, publish, return, reentry; lost acknowledgements; PG17 SIGKILL/crash recovery | `qual-01-resilience.json` | Database crash durability in the disposable loopback specimen; no permanent-loss recovery. |
| P13 | PASS | `primary.mjs`: fresh-process open/returned/dispositioned reconstruction and corrupt digest; `supplemental.mjs`: missing payload and missing history | `qual-01-primary.json`; `qual-01-supplemental.json` | Locator plus retained database state is required; unavailable sources conservatively HOLD. |
| P14 | PASS | `primary.mjs`: child attempts reentry/open/observe, contract/Claim mutation, designation, role grant, schema function/action; parent forgery rejected; bounded child publication succeeds; `supplemental.mjs`: undeclared writer rejected | `qual-01-primary.json`; `qual-01-supplemental.json` | Synthetic custody only; installer/fixture credentials are trusted and excluded. |
| P15 | PASS | `primary.mjs`: historical success after change, stale fabricated card, wall-time reorder | `qual-01-primary.json` | History/currentness distinction is local and observational; no temporal ontology. |
| P16 | PASS | Fresh GPT-5.6 Terra/Medium session, memory disabled, fixed read-only command, only final locator; exact judgment and reentry drill-down; independent post-hoc grading against preregistered rubric | `p16-01-cold-recovery.md` at `bba3730f…` | Separate cold evidence, not inferred from deterministic tests; one bounded positive case, not arbitrary-case cognition. |
| P17 | PASS | `primary.mjs`: second active child; attempt-as-parent; depth-one contract; evaluator repeat with no new evidence; indispensable deeper dependency retained as QF | `qual-01-primary.json` | Independent overlapping children and arbitrary recursion remain excluded. |
| P18 | PASS | `composition.mjs`: 49 predecessor function definitions/owners/ACLs unchanged; 663 old column privileges not broadened; trigger routing byte-equivalent; BUILD 7 pointers unchanged; wrong old/new role routes rejected; old behavior usable; bounded roles non-elevated; no designation pointers. `standing.mjs` adds native standing ABA/race composition. | `qual-01-composition.json`; `qual-01-standing.json`; before/after catalogs `qual-01-before.json`, `qual-01-after.json` | Differential affected seams only; no re-proof of all BUILD 7/8 behavior. |

### G1 load-bearing substitution/removal

P01 uses one positive governance program and two adversarial controls through the actual `ecb9.compare` → `ecb9.publish` → `ecb9.return_result` → `ecb9.reenter` path. Substituting an insensitive G1 changes the child judgment to FAIL and the parent route to the bound REORIENT/corrective route. Removing the bound G1 makes positive reliance unavailable rather than leaving the prior CONTINUE intact. The finite-interpreter control binds the exact comparator definition. P03 separately proves D2 remains necessary and that irrelevant evidence cannot earn descent. This is operative substitution/removal evidence, not fixture quotation, a hardcoded expected branch, or a descriptive G1 label.

### Temporal, recovery, and authority coverage

- Serialization: every protected transition holds the existing synthetic scope lock; participating native Claims are locked in stable ID order against the existing BUILD 5A writer boundary. P09 records all three synthetic writer/reentry orders and native Claim commit/rollback races with actual lock-wait observation.
- Stale predecessor/observation and ABA: immutable event predecessors, request signatures, complete Artifact histories, native standing-transition identities, and exact observations reject stale continuation. Change-and-restore remains REQUALIFY; wall time is audit metadata only.
- Rollback/crash/retry/idempotency: P11 distinguishes exact replay from changed tuple/new attempt; P12 retains before/after-commit outcomes, lost acknowledgements, and SIGKILL recovery. Rolled-back writes are not asserted; committed events reconstruct without duplicate transitions.
- Reconstruction/missing source: P13 restarts from open, returned, and dispositioned states and converts corrupt digest, missing payload, or incomplete history into HOLD. `recover.mjs` is read-only; its card is regenerated and source-linked.
- Authority: P14/P18 reject child/parent privilege escalation, Claim/contract mutation, designation, schema/action access, old-checker routing, and old-artifact overwrite. Successful bounded publication demonstrates the role is usable without conferring real authority.

## P16 cold-worker evidence

P16 was deliberately separated from the deterministic qualification executor. The cold worker received no initiating conversation, repository search, implementation/test source, receipts, qualification evidence, fixture archaeology, Linear, GitHub, web, or memory. Its only initial interface was:

```bash
node server/build-9/recover.mjs aeb5f617-5652-41a2-ae37-88dcde1128d4
```

Exact source drill-down was limited to:

```bash
node server/build-9/recover.mjs <source-uuid> --source
```

It recovered all six required facts, descended to judgment `fba53b24-57b6-4c00-b3bf-4cb324035560` and reentry `9239717c-0fb1-48a7-ae1c-2e114ba99f8a`, rejected universal correctness/currentness/authority and historical-permission inferences, and identified the valid bounded inspection route. ECO-109 comment `aeeea207-4829-48b5-8145-8bffb5a98390` independently graded it PASS against the preregistered rubric in comment `c36750da-4bb2-4b24-9755-35c338f880a7`. The first command was blocked by local sandbox/database policy; retrying only that same read-only command after approval added no semantic context and did not alter the coldness contract.

## Preserved development failure and repair lineage

Numbering below is normalized from the retained cause, not inferred from filenames. Every failure remains durable; none is rewritten as a qualification PASS.

| ID | Classification and retained evidence | Diagnosis | Repair and final disposition |
|---|---|---|---|
| T01 | Test/fixture; `smoke-01.log` | Fixture omitted an explicit Referent UUID although the inherited schema requires it. | Fixture helper supplied the UUID; no mechanism inference was drawn. |
| M01 | Move implementation; `smoke-02.log` (with `smoke-02.json`) | PL/pgSQL publication query used ambiguous `id`, colliding with the local publication variable. | Qualified the Artifact column; `smoke-03.log` confirms the repaired smoke path. |
| T02 | Test syntax; `primary-01.log`, source retained as `source/primary-01-invalid.mjs` | Missing `async` in callbacks prevented the primary test from executing. | Corrected callback execution; no result from the invalid run was credited. |
| T03 | Test/helper; `primary-02.json`/`.log`, source retained as `source/primary-02.mjs` | P17 depth control failed in the helper (`undefined.binding`) before reaching the intended SQL wrong-role boundary. | Supplied the exact tuple/predecessor and exercised SQL directly; `primary-03.json`/`.log` passed the assigned fourteen obligations. This development PASS is historical, not final qualification. |
| T04 | Test/environment; `resilience-01.json`/`.log`, invalid source retained as `source/resilience-01-invalid.mjs` | The monitor role could not observe another user's query text, so the harness reported no real lock wait. | Used disposable installation custody for observation only; `resilience-02.json`/`.log` exercised three wait orders and nine interruption cases. Final authority is `qual-01-resilience.*`. |
| M02 | Move implementation, found by inspection and covered by `supplemental-01.json`/`.log` | Pre-open basis/history drift or incomplete observation could be folded into the opening baseline and escape disposition. | Opening now returns REQUALIFY for changed basis/history and HOLD for incomplete coverage; final controls are in `qual-01-supplemental.json`. |
| M03 | Move implementation; `standing-defect-01.json`/`.log` and historical `standing-probe.mjs` | Existing native Claim standing could change outside the synthetic observation boundary while recovery still returned CONTINUE. | Bound participating Claim standing/history, added shared Claim locks, reentry observation, ABA detection, and native source drill-down. |
| M04 | Move implementation; `standing-01.json`/`.log` | The first M03 repair had a SQL operator-precedence error; the recovery helper surfaced the resulting absent/undefined binding. | Parenthesized the expression; `standing-02.json`/`.log` then passed native ABA and writer commit/rollback races. Final authority is `qual-01-standing.*`. |
| T05 | Test setup/custody; `clean-01-composition.json`/`.log` | Composition setup attempted to grant `service_role` without ADMIN option. | Provisioning moved to disposable custodian authority. The failed `clean-01` composition is retained and never promoted. |
| T06 | Test setup/execution context; `composition-02.json`/`.log`, original source retained as `source/composition-01-invalid.mjs` | Role membership alone did not activate the predecessor service role's BYPASSRLS context; the positive old-source control hit Referent RLS. | The positive control uses `SET LOCAL ROLE service_role`; final `qual-01-composition.json` is PASS. |
| T07 | Qualification-harness omission; `QUALIFICATION-HANDOFF.md` | The pre-freeze `verify.sh` sequence did not include the new native standing suite, so it could not qualify the final repair. No full PASS was claimed at that seam. | Commit `8c01b8db…` added `standing.mjs`, froze the implementation/test HEAD, and the single corrected `qual-01` run passed every stage. |

Corrected qualification at `22269078402959ec679c9a802454a7d0a031af98` is the first and only final deterministic qualification: primary PASS (14 assigned obligations), supplemental PASS, resilience PASS, native standing PASS, and final composition P18 PASS. The earlier `clean-01-primary/resilience/supplemental` PASS files predate M03/M04; `clean-01-composition` and `composition-02` are failed setup evidence. None supplies final acceptance.

No failure established an S return: the frozen Shape semantics remained sufficient. No failure established a Sense return: non-amending bounded self-application completed without real authority or premise change. There was no actual S or Sense return condition.

## Positive inquiry and supported recovery interface

- Final positive inquiry locator: `aeb5f617-5652-41a2-ae37-88dcde1128d4`, durably recorded in `evidence/build-9/positive-locator.json` and used by P16.
- Supported card: `node server/build-9/recover.mjs aeb5f617-5652-41a2-ae37-88dcde1128d4`.
- Supported exact drill-down: `node server/build-9/recover.mjs <source-uuid> --source`.

This interface is observational, read-only, local to the retained disposable database, and non-authoritative. A CONTINUE card is a historical bounded inquiry disposition, not present permission. New reliance requires the stated boundary and fresh declared observations.

## Proof travel, remaining limitations, and Question Forward

Established: one serial, synthetic, disposable PostgreSQL 17 specimen can bind a decision-bearing governance dependency, open and suspend one bounded child, retain a finite source-sensitive judgment, return it only to the exact dependency, independently reenter across complete declared Artifact and native Claim observations, survive the exercised local interruption/retry cases, and support cold source-linked recovery without conferring authority.

Not established: distributed exactly-once behavior; permanent-loss recovery; arbitrary/unbounded recursion; overlapping or multi-child concurrency; universal semantic correctness or Evaluation ontology; automatic unknown-dependency discovery or staleness propagation; general temporal/causal ontology; real Master-Key authority/designation/currentness; real consequential action; governed self-amendment; production/canonical BUILD 7/8/9 deployment; final UX; main-branch integration; Metabolize closure; or BUILD 10.

Remaining implementation limits are deliberate specimen boundaries: one active child and depth one; one local PostgreSQL serialization domain; finite declared comparator rules and supplied witnesses; declared-source completeness; trusted fixture/install custody and same-author Register-B; observational recovery requiring retained database state; no admissible recovery from permanent source loss; and no BUILD 9 runtime writer for Claim standing.

Carried Question Forward:

- QF-9.5: causal ordering for overlapping children. Activate only before admitting overlap; first test the existing substrate, then consider mature causal machinery if it fails.
- QF-9.8: authority route for governance-object revision; a later governing/self-amendment inquiry.
- QF-9.9: minimum real authority for the first real consequential action; use the existing post-BUILD-8 authority route, not this specimen.
- QF-9.10: non-circular governed amendment; a later self-amendment inquiry.
- If current applicability cannot be observed, retain HOLD and ask which admissible source can distinguish the condition; if none exists, record structural unobservability rather than certainty.

## Return and next legitimate transition

Every P01–P18 obligation has qualifying evidence. P16 is independently retained rather than inferred from deterministic tests. P18 uses the final composition evidence and includes native Claim-standing ABA/race evidence. PASS has not been promoted into automatic permission, recovery remains observational/non-authoritative, stale pre-repair results remain history only, and no claim travels beyond the frozen non-claims.

The exact next legitimate transition is human Metabolize review and disposition of this BUILD 9 Move return against ECO-109 and the frozen Shape contract. That review may accept, reject, or request bounded clarification. Until separate human authority says otherwise: do not merge to `main`, do not canonically deploy, do not declare BUILD 9 closed, and do not open BUILD 10.

MOVE COMPLETE — READY FOR HUMAN METABOLIZE
