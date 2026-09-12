#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Location-only adaptation of the accepted predecessor reconstruction. Historical
# BUILD 7 cluster and files are preserved. No arbitrary endpoint is accepted.
task_setup=$(mktemp tests/build-8/setup-generated.XXXXXX)
trap 'rm -f "$task_setup"' EXIT
python3 - "$task_setup" <<'PY'
from pathlib import Path
import sys
s=Path('tests/build-7/setup.sh').read_text()
s=s.replace('ecb7-move-pg17','ecb8-move-pg17').replace('55440','55441')
s=s.replace('/build7','/build8').replace('postgres build7','postgres build8')
Path(sys.argv[1]).write_text(s)
PY
bash "$task_setup" "${1:-}"
