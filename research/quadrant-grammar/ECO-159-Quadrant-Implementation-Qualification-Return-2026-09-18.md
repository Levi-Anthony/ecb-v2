# ECO-159 — Quadrant Implementation Qualification + Exact-Binding Repair Return

**Date:** 18 September 2026 America/Phoenix / 19 September UTC  
**Controlling commission:** Linear ECO-159  
**Parent implementation commission:** ECO-149  
**Accepted physical-design predecessor:** ECO-148  
**Repository base at Move opening:** `main@709070caa1567f74b69803679a1ff1963723cbe1`  
**Qualified repair head before documentation-only return commits:** `4966f2ff331c5cd3527b9af61d592031371796b3`  
**Evidence run:** GitHub Actions `35424644034`, job `105848375009` — **SUCCESS**  
**Evidence artifact:** `10578578084`, `eco159-reliance-binding-evidence`, SHA-256 `b7d83e9b9db178ff921e5dd18adc2d6ff0e4b6500f9481ee5b51e8a5a9c91d89`  
**Installation boundary:** disposable PostgreSQL 17 + pgvector only; canonical Supabase/runtime unchanged.

## 1. Question and decision

ECO-159 opened after explicit ECO-148 continuity acceptance to inspect the consequential claims made by the isolated ECO-149 implementation before treating those patterns as safe inputs to production-promotion work.

The focal question was:

> Does the implementation mechanically bind a positive reliance disposition to the exact basis and inquiry that the cited PASS assessment actually assessed, or can a client assemble individually valid same-channel records into an unsupported positive bundle?

This is a C1-C6 integrity question: the six accepted logical crossings are only preserved if the handoff/reliance record carries the chain actually qualified rather than a syntactically valid substitute.

## 2. Finding — demonstrated local implementation defect

The historical ECO-149 `quadrant_v1_qualify` enforced:

- runtime-key confinement;
- same-channel basis/inquiry/assessment role membership;
- exact current assessment epoch;
- PASS result for positive reliance;
- assessment-use / permitted-use compatibility;
- live, non-revoked reviewer capability;
- decisive-gap rejection;
- explicit unresolved-authority rejection;
- requested/permitted-use constraints.

It did **not** enforce two mechanically decidable bindings:

1. the relied-on inquiry's `basis_receipt` had to equal the relied-on basis receipt;
2. the relied-on assessment's `input_receipts` had to include the relied-on basis and inquiry.

Therefore same-channel membership could substitute for exact qualified lineage.

The new pre-repair discriminator created an alternate basis/inquiry in the existing channel, created a current PASS assessment explicitly assessing the original basis/inquiry, and then asked the historical qualifier to support reliance on the alternate pair using that assessment.

The call succeeded before repair. The transaction was rolled back. The run emitted:

`ECO159_PRE_REPAIR_COUNTEREXAMPLE=OBSERVED`

Classification: **local ECO-149 implementation/enforcement defect**. The logical contract already requires exact qualified custody; the selected physical mechanism family can enforce it directly. No semantic, requirements, logical-architecture, or physical mechanism-family reentry was triggered.

## 3. Forward repair

The historical ECO-149 migration is preserved unchanged as evidence.

Forward migration:

`sql/migrations/20260919054000_eco159_quadrant_exact_reliance_binding.sql`

It replaces only `public.quadrant_v1_qualify` and adds two checks before reliance issuance:

- `quadrant_scope_incompatible:inquiry_basis` when the inquiry does not cite the relied-on basis;
- `quadrant_scope_incompatible:assessment_inputs` when the assessment did not include the relied-on basis and inquiry in its exact input receipts.

New reliance envelopes identify validator revision `eco159-binding-v1`.

No new schema family, provider, authority source, service, queue, cache, model call, or effect surface was introduced.

## 4. Qualification evidence

Run `35424644034` reconstructed the accepted predecessor through BUILD 5B, BUILD 6, BUILD 11, corrected BUILD 12, ECO-138 and ECO-140, then applied the historical ECO-149 migration and original ECO-149 qualification fixture.

Observed sequence:

1. historical ECO-149 fixture qualified;
2. pre-repair mismatch counterexample succeeded and rolled back;
3. ECO-159 forward repair applied;
4. assessment-input mismatch was rejected;
5. inquiry/basis mismatch was rejected;
6. correctly bound positive reliance succeeded;
7. ECO-149 systems-pressure suite was rerun through the repaired qualifier and returned `ECO149_PRESSURE=PASS`;
8. containment check returned `ECO159_CONTAINMENT=PASS`.

The repair did not weaken replay, stale-writer, reviewer-revocation, no-route Question Forward, rollback, lost-response, or cold database reconstruction behavior.

## 5. What was mechanically enforced vs supplied by the fixture

### Mechanically enforced in the tested database / remote procedure call (RPC) boundary

- exact operation identity and changed-request conflict;
- duplicate JSON-key rejection before normalization;
- private-table confinement for the ordinary role;
- reviewer-secret authentication and reviewer expiry/revocation;
- current channel epoch / stale-assessment fencing;
- record-role and same-channel custody;
- assessment PASS requirement for positive reliance;
- assessment use = permitted use;
- exact inquiry -> basis binding after ECO-159;
- exact assessment -> basis + inquiry inclusion after ECO-159;
- decisive-gap blocking;
- the literal `required_unresolved` authority state blocking positive reliance;
- requested/permitted-use consistency;
- atomic rollback, exact replay and concurrent-head fencing in the tested scope;
- no quadrant effect executor.

### Supplied or judged by the fixture, not established mechanically as semantic truth

- the factual content of the basis;
- whether the four quadrant inquiries were substantively adequate;
- the reviewer's semantic method and remit;
- the assessment proposition and PASS judgment;
- whether the provided negative-control description was semantically discriminating;
- whether a given real-world authority is actually unnecessary, resolved, legitimate or current;
- the truth of the rock/garden specimen;
- the fitness of the result for a real production consumer.

The database requires a negative-control field for PASS; it does not prove the control is a good semantic test. Reviewer authentication establishes fixture capability possession, not universal reviewer warrant.

The `authority_status` field remains payload-supplied in this proof. The qualifier blocks the explicit `required_unresolved` state but does not resolve real production authority. That is within the nonexecuting fixture claim envelope and must not be promoted into an authority claim.

## 6. Consumer-boundary result

The tested consumer boundary is the existing confined **database/RPC boundary**:

- public security-definer RPCs;
- ordinary `anon` role;
- BUILD 11 runtime-key confinement;
- private semantic/currentness tables inaccessible directly.

This does **not** establish:

- Vercel process behavior;
- Model Context Protocol (MCP) tool-schema parity;
- production client retry behavior;
- user-facing API compatibility;
- production crash/restart recovery;
- real reviewer provisioning;
- real orientation/action authority;
- external effects.

A future production use that crosses one of those boundaries needs evidence at that boundary. The database/RPC result is not an automatic promotion decision.

## 7. Design-departure disposition

ECO-159 strengthens an enforcement relation already required by the accepted design:

`positive reliance -> exact qualified basis + inquiry + assessment lineage`

It does not change the four-role architecture, C1-C6 meanings, source-of-truth family, history model, authority separation, or change/requalification model.

Disposition: **implementation repair; no ECO-148 amendment required**.

Reopen ECO-148 only if a future implementation shows that exact qualified lineage cannot be maintained by this mechanism family without changing physical allocation. Reopen ECO-147 or earlier layers only if the meaning of what must be bound changes.

## 8. Updated claim envelope

After the ECO-159 repair, the repository implementation supports this bounded claim:

> On the reconstructed current ECB v2 predecessor in disposable PostgreSQL, a positive quadrant reliance record can be issued only when the cited basis and inquiry form the same exact inquiry chain, the cited current PASS assessment includes those exact receipts among its assessed inputs, use/reviewer/currentness/gap constraints pass, and no explicit unresolved required authority remains.

This claim is structural and bounded. It does not establish semantic truth, production authority, external effects, production installation, outward consumer parity, availability, performance, or Register A independent-transfer standing.

## 9. Production-promotion consequences

ECO-150 and its successors should carry one explicit invariant forward:

**Qualification/reliance must preserve exact assessed-input lineage; same scope/channel/currentness membership is not substitutable for evidence that the specific basis and inquiry were assessed.**

For BUILD 7-prime / the production orientation kernel shaped in ECO-151, the analogous rule is that qualification and current binding must remain attached to the exact Orientation Resolution, scope/use and qualified inputs they purport to authorize for reliance. Shared currentness or same-scope membership is insufficient.

This finding does not release ECO-152. ECO-152 remains separately paused before implementation for the active first-class naming sequence. Naming may change public labels or interface forms; it must not weaken exact binding.

## 10. Register B verdict and stop

**PASS after local repair.**

The Move found a real counterexample, repaired the mechanically decidable liability without changing the accepted architecture, and demonstrated that the repaired function preserves the previously tested pressure behavior.

Stop before production installation, outward runtime/tool exposure, real authority provisioning, effect activation, naming adoption, or ECO-152 release.

Exact next governed seams:

- ECO-150 / production-promotion continuity: ingest the exact-input binding finding;
- ECO-152: when its independent naming pause is explicitly lifted, preserve the analogous exact qualification/current-binding contract in the orientation-kernel implementation;
- future Register A: Gate K / independent-transfer standing remains separate and unclosed.
