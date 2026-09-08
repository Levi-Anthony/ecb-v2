# BUILD 6 bounded governance executor

This adapter can inspect one governance scope, execute one already-committed exact governance decision, and recover one request outcome. It authenticates only as `ecb_governance_executor`.

It cannot issue human decisions, enroll credentials, operate the human browser, change H/remit, reopen bootstrap, or write native governance tables directly. The database revalidates the exact committed decision, predecessor, withdrawal state, policy bytes/digest, prior-transaction boundary and scope serialization before any effect.

Commands:

- `node index.mjs inspect <scope-id>` — read current transition and pending executable decisions.
- `node index.mjs execute <scope-id> <decision-id> <request-id> [transition-id]` — request one exact effect. Same request+input recovers prior success; changed input conflicts.
- `node index.mjs recover <scope-id> <request-id>` — reconstruct confirmed effect, confirmed decision-only state, or scope-locked absence.
- `node index.mjs health` — verify the runtime database role.

Required environment: `ECB_EXECUTOR_DATABASE_URL`, restricted to the `ecb_governance_executor` database login.
