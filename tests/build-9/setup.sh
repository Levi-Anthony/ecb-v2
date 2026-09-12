#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
task_setup=$(mktemp tests/build-9/setup-generated.XXXXXX)
trap 'rm -f "$task_setup"' EXIT
python3 - "$task_setup" <<'PY'
from pathlib import Path
import sys
s=Path('tests/build-7/setup.sh').read_text().replace('ecb7-move-pg17','ecb9-move-pg17').replace('55440','55442').replace('/build7','/build9').replace('postgres build7','postgres build9')
Path(sys.argv[1]).write_text(s)
PY
bash "$task_setup" "${1:-}"
for migration in sql/migrations/20260911130000_build_8_action_envelope.sql sql/migrations/20260911140000_build_8_lifecycle.sql; do
 docker exec -i ecb9-move-pg17 psql -X -U postgres -d build9 -v ON_ERROR_STOP=1 --single-transaction < "$migration"
done
