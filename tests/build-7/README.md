# BUILD 7 disposable proof

Controlling receipt: [027-build-7-move.md](../../docs/build-receipts/027-build-7-move.md). BUILD 7 is awaiting human Metabolize, not closed. No real Master-Key authority or designation is established.

The implementation is a local bounded evaluator, exact cold reader and one SQL extension over existing Artifacts/Referents/Claims. The C2 method consumes independently supplied finite comparison semantics, including the meaning of the exact short expression. Unknown prose is INCOMPLETE; producer-provided meaning cannot qualify it. This is not a general natural-language evaluator.

## Reentry without reconstruction

Read `BUILD_CHECKOUT.md`, receipt 027, `post-repair-freeze.json`, `summary.json` and `expression-defect-discovery.json` in `docs/build-receipts/evidence/build-7`. The original false PASS is retained. Pre-repair qualification and first holdout remain historical evidence, not restored acceptance. Current C2 method digest begins `bc69f19c97d78394`.

The latest completed step is repaired freeze → new untuned holdout PASS → affected 19-group primary regression PASS → audit/archive. No implementation rerun is needed merely to review the packet.

## Reproduce the proof when required

Requires Node (tested with v24), npm, Deno, Docker and Python 3. Commands are fixed to disposable container `ecb7-move-pg17`, PostgreSQL 17 image `pgvector/pgvector:0.8.2-pg17`, loopback `127.0.0.1:55440`, database `build7`. No arbitrary production URL is accepted. Fixture logins use trust authentication inside this dedicated loopback proof cluster.

```sh
bash tests/build-7/verify.sh
```

This explicitly resets only the named disposable container, reconstructs the accepted BUILD 5B substrate with BUILD 6 schema but no governance activation, installs BUILD 7, runs primary/repair/new-holdout tests, inherited checks, audit, dump and syntax/format verification. It rewrites working evidence outputs with new UUIDs; preserve the committed receipt/archive to retain the original episode. Replaying the recorded holdout is a regression, not another untuned holdout. New implementation changes require a new freeze and unseen holdout.

For an existing proof DB, affected checks can run separately:

```sh
npm test --prefix tests/build-7
node --test tests/build-7/expression-repair.test.mjs
node --test tests/build-7/holdout-post-repair.test.mjs
node tests/build-7/seal.mjs
```

`seal.mjs` is a read-only database audit. It verifies frozen file hashes and records evidence counts; it does not substitute for running tests. The old `holdout.test.mjs` and pre-repair logs are historical. `layer-b.mjs` preserves the original BUILD 5B checks and adapts only loopback location and exact pre-probe population counts; it does not change frozen source.

## Exact archive and cold read

`docs/build-receipts/evidence/build-7/disposable.pgdump` retains the actual original and repaired disposable episodes. A prepared replacement disposable cluster must have the roles installed by `setup.sh` before restoring. To restore the exact archived episode into the dedicated disposable container:

```sh
bash tests/build-7/setup.sh --reset
docker exec -i ecb7-move-pg17 pg_restore -U custodian -d build7 --clean --if-exists < docs/build-receipts/evidence/build-7/disposable.pgdump
npm ci --prefix tests/build-7 --ignore-scripts --no-audit --no-fund
node tests/build-7/cold.mjs docs/build-receipts/evidence/build-7/cold-input.json /tmp/build7-cold-recovered.json
```

The archive inventory was checked; the new-cluster restoration command is documented, not claimed as an additional tested disaster-recovery mechanism. The tested cold process reads exact retained bytes from the existing proof DB without fixture/producer imports or originating conversation. It returns current selection, historical event, qualification and present reliance separately. Undeclared changes are outside its observation contract. No action is executed by cold recovery.
