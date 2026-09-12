#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# No arbitrary DB address or credentials are accepted. Only the named BUILD 8
# disposable cluster is reset; the accepted BUILD 7 rehearsal is preserved.
npm ci --ignore-scripts --no-audit --no-fund --prefix tests/build-7
bash tests/build-8/setup.sh --reset
evidence=docs/build-receipts/evidence/build-8
mkdir -p "$evidence"
node tests/build-8/composition.mjs > "$evidence/composition.log" 2>&1
docker exec -i ecb8-move-pg17 psql -X -U postgres -d build8 -v ON_ERROR_STOP=1 --single-transaction < sql/migrations/20260911140000_build_8_lifecycle.sql
docker exec -i ecb8-move-pg17 psql -X -U custodian -d build8 -v ON_ERROR_STOP=1 < tests/build-8/roles.sql
node tests/build-8/primary.mjs 2>&1 | tee "$evidence/primary.log"
node tests/build-8/supplemental.mjs 2>&1 | tee "$evidence/supplemental.log"
node tests/build-8/dispatch.mjs 2>&1 | tee "$evidence/dispatch.log"
# Inventory-sensitive inherited checks are deliberately serialized after all
# fixture creation. No historical fixed-cardinality test is weakened or edited.
node tests/build-8/inherited-regression.mjs > "$evidence/inherited.log" 2>&1
if [[ "${1:-}" != --primary ]]; then
 node tests/build-8/seal.mjs --check
 node tests/build-8/holdout.mjs 2>&1 | tee "$evidence/holdout.log"
 node tests/build-8/seal.mjs --audit
 docker exec ecb8-move-pg17 pg_dump -U custodian -d build8 --format=custom > "$evidence/disposable.pgdump"
fi
deno fmt --check server/build-8 tests/build-8/*.mjs
git diff --check
