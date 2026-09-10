#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
container=ecb6-qualified-pg17
image=pgvector/pgvector:0.8.2-pg17
if ! docker inspect "$container" >/dev/null 2>&1; then
 docker run -d --name "$container" -p 127.0.0.1:55439:5432 -e POSTGRES_USER=custodian -e POSTGRES_HOST_AUTH_METHOD=trust "$image" >/dev/null
 for ((i=0;i<30;i++)); do
  if docker exec "$container" pg_isready -U custodian >/dev/null 2>&1; then break; fi
  sleep 1
 done
 docker exec -i "$container" psql -U custodian -d postgres -v ON_ERROR_STOP=1 <<'SQL'
create role anon nologin inherit;
create role authenticated nologin inherit;
create role service_role nologin inherit bypassrls;
create role postgres login inherit createrole createdb replication bypassrls;
grant anon, authenticated, service_role to postgres;
SQL
fi
test "$(docker inspect "$container" --format '{{.Config.Image}}')" = "$image"
test "$(docker inspect "$container" --format '{{(index (index .HostConfig.PortBindings "5432/tcp") 0).HostIp}}')" = 127.0.0.1
# Explicit reset affects only this named disposable database in the dedicated container.
if [[ "${1:-}" == --reset ]]; then
 docker exec "$container" dropdb -U custodian --if-exists build6
 docker exec -i "$container" psql -U custodian -d postgres -v ON_ERROR_STOP=1 <<'SQL'
drop role if exists ecb_human_verifier;
drop role if exists ecb_governance_executor;
drop role if exists ecb_governance_owner;
SQL
fi
# Otherwise refuse to overwrite an existing rehearsal.
docker exec "$container" createdb -U custodian -O postgres build6
# Copy a retained, accepted BUILD 5B rehearsal, never the live canonical database.
docker exec ecb5b-qualified-pg17 pg_dump -U custodian -d episode --no-comments | docker exec -i "$container" psql -U custodian -d build6 -v ON_ERROR_STOP=1 >/dev/null
