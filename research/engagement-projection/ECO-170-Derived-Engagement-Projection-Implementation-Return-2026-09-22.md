# ECO-170 — Derived Engagement Projection: Isolated Implementation / Probe Return

**Date:** 22 September 2026, America/Phoenix  
**Register:** B  
**Controlling issue:** ECO-170  
**Parent use contract:** ECO-181 return `33c83850-f7da-4431-8c0e-b1f425988dad` / slug `d6392db39dea`  
**Review surface:** GitHub PR #83 — `build/eco-170-engagement-projection`  
**Verdict:** **PASS for the bounded isolated engagement-projection kernel and ECO-179 receiving-worker specimen.**  
**Production standing:** NONE. No merge, canonical database/runtime mutation, real ECO-179 execution, or real authority activation is established.

## 1. Result

ECO-170 tested the hypothesis that a useful present-work engagement can be derived from independently standing constituents rather than stored as a new canonical “current work” object.

For the bound ECO-179 specimen, a deterministic projection was sufficient to:

- reconstruct focal identity, seat/boundary, PGO, phase, exact source basis, orientation/warrant state, authority state, dependencies and reentry state;
- distinguish **ready/recoverable** from **authorized to execute**;
- admit a new relevant relation without focal substitution;
- localize invalidation to a material changed constituent;
- preserve applicability across an unrelated repository-head change when exact bound sources were unchanged;
- require refocus when focal grain changed;
- preserve qualification when authority changed and preserve authority when warrant changed;
- keep SSMM phase change from creating authority;
- turn a dormant reentry signal into “reconsider,” not “execute”;
- reconstruct the same projection after process-state serialization/restart;
- expose a bounded permitted source-recovery action under fixture-only launch authority.

No evidence from this probe earned a canonical engagement table, durable session store, push-invalidation bus, queue/workflow engine, or persisted projection snapshot.

## 2. Physical Shape

Frozen Shape source:

`research/engagement-projection/ECO-170-Derived-Engagement-Projection-Physical-Shape-2026-09-22.md`

Selected physical allocation:

- `tests/eco-170/engagement-projection.mjs` — pure deterministic projection/recovery functions;
- `tests/eco-170/fixture.json` — exact bounded ECO-179 specimen manifest and standing/install distinctions;
- `tests/eco-170/qualify.mjs` — adversarial qualification harness and machine receipt;
- `.github/workflows/eco-170-engagement-projection.yml` — isolated qualification runner and containment checks.

No `server.ts`, `api/`, or `sql/migrations/` change is part of the candidate.

## 3. Exact specimen/source contact

Real focal specimen:

- ECO-179 UUID `a6ad4441-722d-4a6b-8a84-afbac417ceed`;
- parent ECO-136;
- real current standing recovered as **commissioned/unopened, Sense-only**;
- current ECO-170 Principal launch does **not** launch real ECO-179.

The qualification harness verifies the following repository sources by Git blob SHA from the tested checkout:

| Source | Expected / verified Git blob |
|---|---|
| ECO-179 pre-Sense harvest | `be8a0b83d7febea43d8a27d6a25330a8a5b3136e` |
| ECO-179 Sense commission mirror | `e7e6b82521969660f45cdf50b0044c4013ed8c54` |
| Quadrant Functional Contract v0.2 | `a61642dfdf5a2abdb4edf0fa81b7842d23e3970f` |
| Quadrant Logical Architecture Contract v0.1 | `e3d6fef43d1e81190547e6fa453424c0341190a3` |

Git verifies repository custody only. Linear/current Principal authority facts remain separate explicit constituents.

## 4. Evidence lineage and custody repair

### Run 1 — useful but not final

- Run: `35781794783`
- Candidate branch head at trigger: `df60992e6184f95abb6e5e90414b0133668d6aa2`
- Result: 15 named checks PASS; containment PASS.
- Artifact: `10718117583`, SHA-256 `3a964781046b939ad47959c96ca00a0346adcc1edca1ab53d4745458685a913b`.

Pre-verdict log audit found the workflow had actually checked out GitHub’s synthetic PR merge:

`3d9c8f9b7341a72fd4c635a488ddd1365df3a168`

rather than the exact candidate head. This was classified as an evidence-custody/harness defect, not a projection-semantic failure. The run remains historical supporting evidence but is **not** the final qualification basis.

### Run 2 — final exact-head qualification

Checkout was repaired to bind explicitly to the PR head and assert observed HEAD equality before testing.

- **Exact tested head:** `0e208cd64bd12dfd065c91c07edaa83303478b13`
- Run: `35782091346`
- Job: `106929823454`
- Workflow conclusion: **SUCCESS**
- Explicit receipt: `ECO170_TESTED_HEAD=0e208cd64bd12dfd065c91c07edaa83303478b13`
- `ECO170_QUALIFICATION=PASS`
- `ECO170_CHECK_COUNT=15`
- `ECO170_CONTAINMENT=PASS`
- Final artifact: `10718098224`
- Artifact size: 4,430 bytes
- Artifact digest: `sha256:cee9ec30f1d25b7a7c581bc29c3a6673b679371da27bfbbbac24db5486a111f5`
- Artifact expiry reported by GitHub: **22 October 2026 20:43:13 UTC**

The artifact contains the qualification log and machine-readable `artifacts/eco-170/receipt.json`.

## 5. Named qualification controls

All fifteen controls passed on the exact tested head:

1. `exact_repository_source_blobs`
2. `real_authority_negative_control`
3. `fixture_authority_positive_control`
4. `material_source_change_local_invalidation`
5. `unrelated_repository_head_does_not_invalidate`
6. `new_relation_admitted_without_focal_substitution`
7. `focal_grain_change_requires_refocus`
8. `pgo_change_requalifies_without_rewriting_sources`
9. `warrant_change_remains_separate`
10. `authority_revocation_does_not_rewrite_qualification`
11. `phase_change_without_authority_does_not_create_authority`
12. `dormant_reentry_signal_reconsiders_only`
13. `cold_restart_reconstruction_stable`
14. `constituent_independence_visible`
15. `fca_positive_utility`

## 6. Receiving-worker walkthrough

### Real-state recovery

The projection reconstructs ECO-179 as:

- correct focal identity;
- bounded semantic-definition episode under ECO-136;
- recovered PGO and Sense-only stop;
- exact material source basis;
- orientation qualification/application fields separately visible;
- real authority status **absent** for ECO-179 launch in this episode.

Therefore the real next action is:

> preserve reentry and require explicit ECO-179 launch authority.

This is a useful successful result. The worker does not treat “Todo,” “ready,” source recoverability, qualification, or projection existence as execution permission.

### Fixture-only positive control

An isolated fixture authority constituent was then changed to `fixture_permitted` for Sense.

Without changing focal identity or semantic source basis, the projection changed the permitted action to:

> open fixture Sense and recover required sources.

The implementation then exercised that bounded source-recovery action and verified the four bound repository source blobs. No real ECO-179 state changed.

## 7. Material-change / independence evidence

### Material semantic-source change

Changing one material source digest caused:

- orientation applicability → `requalification_required`;
- next action → non-permitted until requalification;
- unrelated sources/history preserved;
- fixture authority preserved as a distinct constituent.

This demonstrates local invalidation rather than global reset.

### Unrelated repository-head change

Changing only the discovery/head value while leaving exact bound source blobs unchanged did **not** invalidate the semantic source basis.

This is an important currentness result:

> repository recency is discovery context; exact bound constituent identity controls reliance.

### Focal change

Changing focal identity while leaving the prior qualification tuple intact produced `refocus_required`. The implementation did not silently reuse the old qualification for the new referent.

### PGO change

Changing PGO digest caused requalification while preserving exact source history.

### Warrant / authority separation

- qualification changed to INDETERMINATE while fixture authority remained present → action stayed fenced;
- authority changed to revoked while qualification remained PASS/applicable → action stayed fenced.

Neither dimension rewrote the other.

### Phase / authority separation

Changing phase to `sense_open` with authority still absent did not manufacture permission.

### Dormant reentry signal

A fired QF/reentry discriminator generated only:

`{ disposition: "reconsider" }`

and did not authorize execution.

## 8. Positive generative utility / FCA

The probe was not merely a rejection harness.

**Freedom:** a newly relevant ECO-178 relation could enter the dependency set without requiring a frozen initial inventory and without replacing focal ECO-179.

**Control:** PGO, focal identity, material dependency state and authority constrained which next action was permitted.

**Awareness:** exact source identities, current applicability, authority state, dependencies, QF and change consequences remained visible and traceable.

This satisfies the bounded FCA requirement for the tested encounter.

## 9. Restart / interruption recovery

The fixture constituent set was serialized and reconstructed into a fresh projection invocation. The resulting projection hash exactly matched the original projection hash.

This proves deterministic reconstruction for the bounded kernel from the supplied durable constituent representation.

It does **not** prove a production host can yet discover and assemble every constituent automatically after a real client/process interruption. That remains the connected-interaction seam.

## 10. What was observed, exercised, copied and simulated

### Observed live

- current Linear coordination and commission state used to bind the specimen;
- current GitHub repository head and exact source blobs;
- actual GitHub Actions execution;
- exact-head custody assertion;
- actual branch/PR state;
- artifact creation and digest;
- platform-generated Vercel Preview Comments check for the PR head.

### Exercised physically

- deterministic projection code;
- Git blob source verification;
- authority-negative behavior;
- fixture source-recovery action;
- all fifteen state-change controls;
- serialization/restart reconstruction;
- workflow containment.

### Copied into bounded fixture representation

- ECO-179 focal/seat/PGO/phase/source identities;
- current architecture/install standing needed to distinguish ECO-152 isolated evidence and ECO-156 Shape standing.

### Simulated deliberately

- fixture-only launch authority;
- material source mutation;
- unrelated repository-head mutation;
- new relation admission;
- focal refocus;
- PGO change;
- warrant change;
- authority revocation;
- phase change;
- dormant reentry signal.

### Not exercised / not claimed

- real ECO-179 Sense execution;
- direct live Linear/GitHub source-adapter automation inside the projection code;
- actual ECO-152 SQL/RPC runtime composition;
- production database installation;
- production interaction-host integration;
- production currentness/authority resolver;
- real human/organizational authority issuance;
- persistent signal delivery;
- queue/workflow requirements;
- load, latency, multi-process concurrency or failover;
- merge or production deployment.

## 11. Installation / deployment state

- PR #83 is **draft / open / unmerged**.
- Candidate implementation exists only on `build/eco-170-engagement-projection`.
- No runtime/API/schema files are changed.
- No canonical Supabase state was mutated.
- No production target was requested or promoted.
- GitHub shows a Vercel “Preview Comments” check and a branch-preview feedback URL for the PR head. This is platform-generated preview activity and is **not** treated as production installation or qualification evidence.

The tested kernel is therefore **qualified isolated implementation evidence**, not installed ECOS runtime capability.

## 12. Design consequences

### Supported

1. **Derived/read-model first remains viable.**
2. No monolithic canonical engagement object is required for the tested encounter.
3. Exact source lineage can coexist with a changing discovery/repository head.
4. Focal, PGO, warrant, authority, phase and dependency applicability can vary independently without collapsing.
5. Open-world relation admission is compatible with stable focal identity.
6. A cold projection can produce a useful “do not execute yet” action as well as a positive permitted next action.
7. Read-only/deterministic implementation gives high observability and reversibility.

### Not earned

1. Dedicated engagement-projection persistence.
2. Server-side durable session state.
3. Push invalidation or universal dependency watchers.
4. Dedicated activation/disposition persistence.
5. Queue/workflow/subscription machinery.
6. Production API surface.
7. Production orientation-binding authority.
8. Automatic semantic promotion.

## 13. Question Forward disposition

### Durable projection identity

**Not earned by this probe.** Reconstructible projection history was sufficient. Reopen only if exact historical cross-worker reliance cannot be reconstructed economically/unambiguously from constituent history.

### Push invalidation

**Not earned.** Use-time rehydration/local change detection is sufficient for this probe. Reopen on demonstrated missed material change or unacceptable recovery cost.

### Dedicated activation/disposition persistence

**Not earned.** Current explicit phase/authority/QF constituents were sufficient for the bounded case. Reopen if real connected reentry cannot reconstruct dormant/active state without ambiguity.

### Connected source assembly

**Still open and now sharper.** The kernel assumes a normalized constituent bundle. A real interaction surface must still discover/hydrate the authoritative Linear/repository/currentness/authority constituents without relying on hidden chat memory or manual worker choreography.

This is the strongest remaining implementation seam.

## 14. Upstream / companion consequences

No semantic or architecture defect requires reopening ECO-181, ECO-151, ECO-156, or the accepted finite-coherence architecture.

Decision-bearing evidence to route:

- **ECO-181:** use contract successfully produced an executable bounded probe.
- **ECO-155:** source-to-behavior evidence supports a deterministic composed read/projection and exposes connected-source custody as the next tool/interface seam.
- **ECO-176:** capability / realization / installation / activation remained operationally distinguishable; an unmerged qualified realization could inform an isolated consumer without pretending it was installed.
- **ECO-180:** the selected intervention reduced the reentry problem inside the normalized fixture; remaining friction is upstream source discovery/composition at the connected interaction surface.
- **ECO-177:** no new Crucible hard dependency was demonstrated by this probe.

## 15. Production-promotion boundary

This Move does **not** justify direct production promotion.

The projection kernel is qualified, but the real operational capability still lacks evidence for automatic connected-source assembly, host/client context custody, real authority resolution, and production recovery.

Accordingly, the next evidence-bearing implementation should compose this result with the accepted ECO-156 interaction-surface contract, not install the current test harness as a production service.

ECO-176/177 remain useful independent architecture Sense lanes and may change ownership/interface details, but their complete returns are not retroactively made prerequisites for this PASS.

## 16. Governed stop

**ECO-170 bounded implementation/probe: PASS.**

Stop before:

- merging PR #83;
- production deployment;
- canonical database/runtime mutation;
- real ECO-179 execution;
- real authority activation;
- installing new persistence/queue/session machinery.

The immediate remaining frontier is connected interaction/source composition and production-promotion Shape, separately governed.
