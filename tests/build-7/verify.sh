#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
evidence=docs/build-receipts/evidence/build-7
mkdir -p "$evidence"
bash tests/build-7/setup.sh --reset > "$evidence/setup.log" 2>&1
npm ci --prefix tests/build-7 --ignore-scripts --no-audit --no-fund
npm test --prefix tests/build-7 > "$evidence/primary.log" 2>&1
node --test tests/build-7/expression-repair.test.mjs > "$evidence/expression-repair.log" 2>&1
node --test tests/build-7/holdout-post-repair.test.mjs > "$evidence/holdout-post-repair.log" 2>&1
node tests/build-7/regression.mjs > "$evidence/regression.log" 2>&1
node tests/build-7/layer-b.mjs > "$evidence/layer-b.log" 2>&1
node tests/build-7/seal.mjs
# Full durable, disposable reconstruction material. No canonical database is contacted.
docker exec ecb7-move-pg17 pg_dump -U custodian -d build7 --format=custom > "$evidence/disposable.pgdump"
node --check server/build-7/qualification.mjs
node --check server/build-7/recover.mjs
deno fmt --check server/build-7 tests/build-7/*.mjs tests/build-7/package.json > "$evidence/format.log" 2>&1
printf 'BUILD 7 disposable verification complete. Human Metabolize remains pending.\n'
