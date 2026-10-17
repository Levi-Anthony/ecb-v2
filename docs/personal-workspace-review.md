# Distinct API workflow review — 16 October 2026

## FINAL VERDICT — no blocking defect in reviewed source candidate

Both UUID case findings below are corrected and independently re-probed. Final `npm run test:personal` PASS 25/25; `npm run typecheck:personal` PASS; extra reviewer capture probes PASS (3 independent, plus 8 inherited fixture tests). Explicit uppercase capture probe now returns 200 RAW_CUSTODY_VERIFIED with original uppercase operation echo while matching canonical lowercase native receipt. `git diff --check` PASS, no unmerged index entries. Root separately reports OAuth59/MCP34/workflow3 and OAuth/MCP typechecks PASS; these wider checks were not independently rerun by this reviewer.

Final reviewed SHA256 manifest:

```
d3c21b3876f0a3c5b58667d93821706b06c7c7a8f5e48e5df8e8572b3f0259f1  server/personal-app.ts
65f877b2770d69a9bb89df0b62768bee01b4d907b2b74612e3e01f474fcd56c5  server/personal-app-ui.ts
7d0809b925b9c5a7b693091200334ee374d1419aa24cffe81a66d9ee89632951  tests/personal-app.test.ts
68be9bfa80f2ef8f1e399f9bb10d23394b4281a570c2e4b4add278d2406cad2d  tests/personal-capture-reentry.test.ts
cd5b8f5b4f3c89484bd100422459fd0465e9de4ba78de31292402c5411234b4e  tests/personal-workflow-view.test.ts
04a6ee974649be4d73a45a56e7c8a572e1a663e4ef7999d05833a7068bff1092  .github/workflows/eco-218-oauth.yml
71bb9e4b4efb808ffb4bca52bea86f744f7466e68db6a12582d7df09a30f6b94  package.json
275ac54eccc5d2e3ca621c0ac71081ae048cebe8ed65476cd8fa4f2b6480a524  vercel.json
bf9e4f54e8a24cbed7dd45646aff0c7c9842e682916226f57a00bc575ad87d40  docs/personal-workspace.md
```

Recommendation: source candidate is ready for existing source integration/release controls, subject to exact publication and CI qualification by the lead. Include both newly authored test files when staging; they were untracked during review. No production release, actual browser/Principal use, live RPC grant/current-debt qualification or native incorporation follows from this verdict. Historical review stages below document corrected findings and should not be read as unresolved final blockers.

Reviewer context: /root/pgo_workfront, separate from root implementer, same platform/repository. Scope only working-tree diff server/personal-app.ts and tests/personal-app.test.ts. UI worker changes excluded. No production/native invocation or deployment claimed; no source edits by reviewer.

Conclusion at reviewed diff: one bounded P2 identity-normalization defect; otherwise no blocking fidelity/security finding. Existing 12 tests independently PASS.

## API correction re-review

Root corrected the P2: validate requestedCycleId, canonicalize to lowercase, dispatch and compare canonical identity. Independent uppercase request probe now PASS (200, canonical lowercase dispatched and returned). Updated regression includes uppercase positive case. Final API SHA256 `7fbcb857604edac4b4336f97c2cabae51dd855339173f8419451c121d123c4f8`; API tests `826c5898bef25f3f98cbf2e8e17126585cac8816fb4ce5317a15d43f0d28371d`. Original finding below is preserved as resolved history. No remaining API blocker at this correction. UI review pending worker completion.

Reviewed SHA256: server/personal-app.ts `8567135613eacd6ec340c426a403f1b666e4ee4fc20cb6a35205f6bddb5dd8e7`; tests/personal-app.test.ts `afdacd9675bcfcc6db717c612db77fcaefa899d33b26f508aa3bedbb09fd5642`.

## Finding

## Capture UI distinct review — complete

No blocking defect found in capture worker's final code/tests. Independently executed 20 tests (12 API + 8 capture) and personal typecheck, all PASS. Reviewed sessionStorage lifecycle: exact serialized body and UUID preserved before dispatch, readback checked, reload restores content read-only without automatic POST, explicit review resets consent, fresh consent required, unresolved edit/replacement denied, in-flight duplicate suppressed, exact successful receipt identity required, storage divergence/denial/corruption/removal failure blocks unsafe effects, and successful outcome clears pending storage then enables a distinct occurrence. Same existing sessionFetch can retry a 401 after supported context/refresh, with identical body and operation identity. No credentials stored, no cookie/auth code changed. Privacy text discloses same-origin script visibility and session/tab loss boundaries; sessionStorage is bounded retry custody, not durable server history.

Additional reviewer probes in `/tmp/ecos-capture-review-probes.mjs`: malformed claimed-success Thought identity retains unresolved request and denies replacement; UNKNOWN/CAPTURE_REPORTED_VERIFY_UNAVAILABLE/CUSTODY_NOT_VERIFIED keep exact pending body and require fresh consent; altered storage readback before POST stops dispatch. All three pass (plus inherited eight = 11). An initial hidden-element assertion failed because the fixture creates elements without parsing original HTML hidden attributes; corrected the reviewer assertion to actual new-occurrence handler behavior and reran successfully. This was a test-fixture mismatch, not a source defect.

Capture test SHA256 `68be9bfa80f2ef8f1e399f9bb10d23394b4281a570c2e4b4add278d2406cad2d`. UI reviewed capture snapshot SHA256 `c187c7675dd287122b0ba350c033182eb66682516c4ce9558341512758d2bb62`; root's independent workflow-view edits may change overall UI hash, so final combined UI re-review pending.

## Historical resolved API finding

## Final combined pass, pending capture UUID case correction

Reviewed all working-tree differences from origin/main: API, UI, tests, test-script expansion, CI path filters, branch-only Git deployment suppression and current/historical workspace document. No parallel auth modules/routes remain in the candidate relative to main. New tests are still untracked until parent stages them; ensure both personal-capture-reentry and personal-workflow-view are included in publication. `npm run test:personal` independently PASS 24; `npm run typecheck:personal` PASS; additional reviewer probes PASS 11 (8 inherited + 3 independent). `git diff --check` PASS. Root/child reads preserve all native fields; display proof/status and old-snapshot failure label; request sequence prevents stale child response from replacing newer root; local composition clears on cycle changes. No write route added by workflow navigation.

New capture guard's existence is legitimate: runtime server.ts ~493 returns operation_id from native row; fetchThought returns id. Requiring matching operation and exact readback id/content/source closes source-level receipt weakness without changing actual runtime shape. However an uppercase operation UUID currently passes accepted request regex and persists, then strict comparison with native canonical-lowercase operation_id yields UNKNOWN 502. Independent probe reproduced it. Compare UUID identities case-insensitively after validating string shape; preserve original request echo for exact stored UI request compatibility. Add uppercase capture positive regression. This is the sole remaining bounded P2 in final reviewed code.

Docs preserve historical PR109 evidence beneath explicit supersession, correctly state current candidate excludes original /app auth and Artifact-saving feature, and conserve actual-use/native/release obligations. Branch suppression adds only feat/ecos-personal-workspace=false and retains main's existing entries; source review is not deployment proof. CI now triggers on personal source/tests and npm personal scripts include all new personal tests.

`cycle_id` validation is case insensitive but comparison to `inspected.cycle.id` is exact string comparison. Native SQL receives uuid and `to_jsonb(c)` serializes its UUID PK canonically lowercase. A caller selecting valid uppercase `40CA3BBD-C905-4EC5-B202-BFB49FCD6605` is dispatched successfully but incorrectly gets HTTP 502 native_cycle_identity_mismatch. Independent injected-port probe reproduced lowercase 200 vs uppercase 502 with the same canonical native identity. Normalize a validated request UUID to lowercase before dispatch/comparison, and add uppercase positive regression. This preserves refusal of genuinely wrong/missing native identity.

## Verified fidelity and gates

Repository SQL `sql/migrations/20261010221105_workflow_governance.sql:133-166` selects actual cycle into strict row, returns cycle=to_jsonb(c) plus contract, phase, debt, scope_decisions, open_children, zero_balance, next_action, obligations, routed_proposals, monitor and events. The repaired field projection preserves every named output rather than using nonexistent children/proposals aliases. Default principal route remains fixed root. Optional cycle read selects existing native inspect, no write/controller change.

Missing `cycle.id` rejection is legitimate fail-closed, not an unsupported restriction on real SQL shape: strict existing cycle selection and actual PK guarantee id on successful native return. Malformed native snapshot cannot be presented as a successful read. Existing guard errors remain sanitized. No account/session/grant/credential changes. Canonical origin and Principal/enrollment authorization run before any ports. Requested cycle remains selected only after UUID validation. The same authorized Principal already has native/root traversal authority; adding child selection does not confer native mutation authority or expose data to unenrolled readers.

Independent probes: valid default/lowercase 200; uppercase equivalent 502 (finding); bad and empty identity 400 with no commission/inspection calls; missing returned cycle.id 502; denied Principal 403 with no ports. Snapshot with zero_balance=false conserves false without promotion. Full-field regression deep-equality verifies scope/proof/events/observer standing.

Limit: source SQL is current repository contract, not fresh installed live payload/grants verification. Managed native inspection remains unexposed. Reviewer has not reviewed incomplete UI/capture changes. Same-platform distinct implementation/review context is not external semantic certification.

PGO priority agreed: complete pending-capture recovery and native projection/reentry repairs before adding Thought→Artifact features, conserving release/actual-use/native-receiving distinctions.
