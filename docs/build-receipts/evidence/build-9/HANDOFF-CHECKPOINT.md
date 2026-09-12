# BUILD 9 continuity checkpoint — implementation stopped by user

This is a handoff-only checkpoint, not a Move return, qualification completion, or phase closure.

Worktree: `/Users/prodadmin/ECB-build-9-move`
Branch: `build/eco-109-build-9-move`
Previous durable checkpoint and pre-handoff local/remote HEAD: `b7682bf019f9661b81773ff88241fc976b657215`.
Pre-handoff ahead/behind: 0/0. All newer work was uncommitted; exact status is retained in `handoff-precommit-status.txt`. The commit containing this note preserves that delta.

## Semantic delta since b7682bf

The recovery projection was compacted while retaining exact source drill-down, and the Node files were formatted. A reproduced implementation defect showed that the existing BUILD 5A Claim-standing writer could change parent/dependency standing outside the new fixture observation boundary while recovery still reported CONTINUE. The SQL now locks participating Claims with shared row locks, retains their initial standing/transition-identity observations in the inquiry contract, includes current native standing history in reentry observations, detects standing drift/ABA, and permits read-only drill-down to native Claims and standing Events. The added UPDATE-column privilege belongs only to the non-login owner and supplies PostgreSQL row-lock capability; no bounded runtime function updates Claim standing. Targeted standing tests and the original failure are retained. Composition test setup was also repaired for role-grant custody and the predecessor service-role execution context. These are implementation/test deltas under the existing contract, not an architecture or authority amendment.

## Existing evidence and limitations at stop

- `clean-01-primary.json`, `clean-01-resilience.json`, and `clean-01-supplemental.json` record the earlier clean-install run, BEFORE the Claim-standing repair. They do not qualify the final SQL revision in this checkpoint.
- `clean-01-composition.json` is FAIL/inconclusive setup: insufficient role-grant authority. `composition-02.json` remains FAIL/inconclusive positive-control setup: inherited service-role membership did not supply the required active BYPASSRLS context. The test now provisions with disposable custodian and uses `SET LOCAL ROLE service_role` for that positive control; this latest composition test revision has NOT been rerun.
- `standing-defect-01.json` and `.log` retain the invalid CONTINUE after a native Claim standing change (implementation defect). `standing-probe.mjs` is the historical reproducer; its evidence filename and diagnostic text describe the original failure, not a new acceptance test.
- `standing-01.json` is FAIL: the first repair had a SQL operator-precedence error, surfaced through the recovery helper. The expression was parenthesized. `standing-02.json` is PASS for the targeted native-standing ABA and writer commit/rollback race cases. No full suite has been run against this final repair.
- `reload-03.log` through `reload-05.log` retain development reload operations. The current loopback Docker database `ecb9-move-pg17` / `build9` / port `55442` contains development reloads, not a clean final qualification install. `development.pgdump` is the older archive from b7682bf, not a snapshot of this checkpoint's current database.
- The positive locator file was advanced by the earlier clean run. Treat it as historical fixture evidence; older inquiry contracts may predate the new Claim-basis snapshot.
- P16 cold-worker testing and any frozen untuned holdout have not occurred. No complete P01–P18 acceptance claim exists.
- `tests/build-9/.venv` is ignored local tokenizer tooling, not source evidence. No test or qualification command was run during this handoff-only operation.

No active BUILD 9 implementation/test process was found during handoff inspection. The BUILD 8 worktree was excluded from all writes. Resume work only under the fresh worker's applicable instructions; this checkpoint does not itself commission additional work.
