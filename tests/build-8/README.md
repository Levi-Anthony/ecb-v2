# ECO-103 BUILD 8 bounded proof

The proof covers only a disposable synthetic target whose native effect and native operation record commit atomically in PostgreSQL, serialized through the accepted scope lock. It establishes no general exactly-once external/distributed effect guarantee. Human Metabolize/BUILD closure is separate.

Read [the Move packet](../../docs/build-receipts/030-build-8-move.md), then `evidence/build-8/freeze.json`, `primary.json`, `supplemental.json`, `holdout.json` and `audit.json` under `docs/build-receipts`. The original pre-mutation gate and composition checkpoint remain durable history. No rerun is necessary merely to review the packet.

From the repository root, reproduce in the dedicated disposable environment:

```sh
bash tests/build-8/verify.sh
```

Requires Docker, Node 24, npm, Deno and Python 3. This resets only `ecb8-move-pg17`, image `pgvector/pgvector:0.8.2-pg17`, loopback `127.0.0.1:55441`, database `build8`. It accepts no arbitrary URL. The existing BUILD 7/6/5B containers and canonical Supabase are not used. Setup adapts only the accepted predecessor script's container/address/database location. Existing fixture/comparator source remains unchanged.

The command installs 5B/6/7, creates the historical 5B request before BUILD 8 composition, installs the bounded lifecycle and fixture logins, runs P01–P14, supplemental and dispatch controls, runs inherited regressions sequentially, checks the freeze, replays the retained holdout, audits and archives. Replaying an already authored holdout is a regression, not another untuned holdout. `--primary` is a development-only pre-freeze run and makes no holdout or completed-Move claim.

Reproduction overwrites working evidence outputs with new UUIDs. Preserve the committed packet to retain the original episode. `disposable.pgdump` is the actual original proof database archive; no disaster-recovery guarantee is inferred from creating it. It contains only synthetic fixtures and imported frozen predecessor examples. No real credentials are used. `live-sources.json` preserves the live-read Linear authority separately from fixture semantics.

To cold-read the retained episode while its dedicated database is available:

```sh
node tests/build-8/cold.mjs docs/build-receipts/evidence/build-8/cold-input.json /tmp/eco103-cold.json
```

The child receives only `(scope, action, declared read boundary)`. No producer or fixture modules supply recovered output. It independently hashes retained bytes, reconstructs topology/native state and evaluates legitimacy, ACK and further-attempt disposition separately. `inspect` uses one NOWAIT lock attempt: an unavailable boundary reports `UNKNOWN / IN_FLIGHT`, HOLD, and no fence. Status/replay changes no lifecycle history. Explicit `reconcile` alone may fence; a fresh attempt then needs a fresh admission.

The small `server/build-8/action.mjs` dispatch boundary commits start before effect. An exact transport retry uses the same request, admission and predecessor and returns recovery rather than redispatching a recovered start. The private SQL helpers and fixture installation surfaces are not granted to runtime callers. No server, API, remote target, generalized executor or policy engine is installed.

Tests and implementation were authored by the same worker. Expected answers are fixed in the test/comparison inputs and do not come from producer/checker output. This is discriminating bounded proof, not independent-author proof or immunity to trusted-owner compromise.
