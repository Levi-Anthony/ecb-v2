#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Development-only replacement in the exact disposable database; final proof uses fresh install.
python3 - <<'PY' | docker exec -i ecb9-move-pg17 psql -X -U postgres -d build9 -v ON_ERROR_STOP=1 --single-transaction
from pathlib import Path
import re
s=Path('sql/migrations/20260912160000_build_9_recursive_inquiry.sql').read_text()
for f in re.findall(r'create function .*?end \$\$;',s,re.S): print(f.replace('create function','create or replace function',1))
PY
