#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Exact disposable address only. Retains old archives; caller supplies a unique run name.
run_name="${1:?unique evidence run name required}"
[[ "$run_name" =~ ^[a-zA-Z0-9-]+$ ]]
evidence=docs/build-receipts/evidence/build-9
[[ ! -e "$evidence/$run_name-primary.json" ]]
npm ci --ignore-scripts --no-audit --no-fund --prefix tests/build-7
bash tests/build-9/setup.sh --reset > "$evidence/$run_name-setup.log" 2>&1
node tests/build-9/catalog.mjs "$evidence/$run_name-before.json"
docker exec -i ecb9-move-pg17 psql -X -U postgres -d build9 -v ON_ERROR_STOP=1 --single-transaction < sql/migrations/20260912160000_build_9_recursive_inquiry.sql > "$evidence/$run_name-install.log" 2>&1
docker exec -i ecb9-move-pg17 psql -X -U custodian -d build9 -v ON_ERROR_STOP=1 < tests/build-9/roles.sql >> "$evidence/$run_name-install.log" 2>&1
node tests/build-9/catalog.mjs "$evidence/$run_name-after.json"
node tests/build-9/primary.mjs "$run_name-primary.json" > "$evidence/$run_name-primary.log" 2>&1
node tests/build-9/supplemental.mjs "$run_name-supplemental.json" > "$evidence/$run_name-supplemental.log" 2>&1
node tests/build-9/resilience.mjs "$run_name-resilience.json" > "$evidence/$run_name-resilience.log" 2>&1
node tests/build-9/standing.mjs "$run_name-standing.json" > "$evidence/$run_name-standing.log" 2>&1
node tests/build-9/composition.mjs "$evidence/$run_name-before.json" "$evidence/$run_name-after.json" "$run_name-composition.json" > "$evidence/$run_name-composition.log" 2>&1
