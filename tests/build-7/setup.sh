#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
# Dedicated disposable cluster; never accepts an arbitrary database URL.
container=ecb7-move-pg17
image=pgvector/pgvector:0.8.2-pg17
if docker inspect "$container" >/dev/null 2>&1; then
 if [[ "${1:-}" != --reset ]]; then echo 'Existing BUILD 7 rehearsal; use --reset for this disposable container only.' >&2; exit 2; fi
 test "$(docker inspect "$container" --format '{{.Config.Image}}')" = "$image"
 test "$(docker inspect "$container" --format '{{(index (index .HostConfig.PortBindings "5432/tcp") 0).HostIp}}')" = 127.0.0.1
 docker rm -f "$container" >/dev/null
fi
docker run -d -v "$PWD:$PWD:ro" --name "$container" -p 127.0.0.1:55440:5432 -e POSTGRES_USER=custodian -e POSTGRES_HOST_AUTH_METHOD=trust "$image" >/dev/null
for ((i=0;i<30;i++)); do if docker exec "$container" pg_isready -U custodian >/dev/null 2>&1; then break; fi; sleep 1; done
# Reuse the accepted reconstruction script with only disposable location substitutions.
# Historical files remain byte-for-byte unchanged.
task_tmp=$(mktemp -d /tmp/ecb7-rehearsal.XXXXXX)
trap 'rm -rf "$task_tmp"' EXIT
python3 - "$PWD" "$task_tmp" <<'PY'
from pathlib import Path
import sys,shlex
root=Path(sys.argv[1]);tmp=Path(sys.argv[2])
s=(root/'tests/build-6/ci-reconstruct-build5b.sh').read_text().replace('55439','55440').replace('/build6','/build7').replace('postgres build6','postgres build7')
s='\n'.join('ROOT='+shlex.quote(str(root)) if line.startswith('ROOT=') else line for line in s.splitlines())+'\n'
(tmp/'predecessor.sh').write_text(s)
for program in ['psql','createdb']:
 wrapper=tmp/program
 wrapper.write_text('#!/usr/bin/env python3\nimport subprocess,sys\nraise SystemExit(subprocess.call('+repr(['docker','exec','-i','-w',str(root),'ecb7-move-pg17',program])+"+[a.replace('55440','5432') for a in sys.argv[1:]]))\n")
 wrapper.chmod(0o755)
PY
export PATH="$task_tmp:$PATH"
BUILD6_DATABASE_URL=postgresql://postgres@127.0.0.1:55440/build7 BUILD6_DISPOSABLE=YES bash "$task_tmp/predecessor.sh"
# Seed through the existing BUILD 5B helpers with the only URL override held in this temporary entry.
python3 - "$PWD" "$task_tmp" <<'PY'
from pathlib import Path
import sys
root=Path(sys.argv[1]);tmp=Path(sys.argv[2])
s=(root/'tests/build-6/ci-seed-build5b-artifacts.ts').read_text().replace('55439/build6','55440/build7').replace('"../build-5b/fixtures.ts"','"'+(root/'tests/build-5b/fixtures.ts').as_uri()+'"')
(tmp/'seed.ts').write_text(s)
PY
deno run --config tests/build-5b/deno.json --allow-read --allow-env --allow-net=127.0.0.1:55440 "$task_tmp/seed.ts"
psql -X 'postgresql://postgres@127.0.0.1:55440/build7' -v ON_ERROR_STOP=1 --single-transaction -f sql/migrations/20260907234712_build_6_governance_bootstrap.sql
psql -X 'postgresql://postgres@127.0.0.1:55440/build7' -v ON_ERROR_STOP=1 --single-transaction -f sql/migrations/20260910090000_build_7_local_master_key.sql
psql -X 'postgresql://custodian@127.0.0.1:55440/build7' -v ON_ERROR_STOP=1 -f tests/build-7/roles.sql
