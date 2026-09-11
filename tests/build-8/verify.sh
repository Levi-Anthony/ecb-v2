#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# No arbitrary DB address or credentials are accepted. Reuse the frozen disposable setup.
npm ci --ignore-scripts --prefix tests/build-7
bash tests/build-7/setup.sh
node tests/build-8/composition.mjs
echo 'COMPOSITION CHECKPOINT ONLY: full lifecycle proof not yet implemented.'
