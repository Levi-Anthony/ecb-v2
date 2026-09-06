#!/usr/bin/env bash
# Local-only PG17 qualification. Rebuilds only the named disposable databases.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
container=ecb5b-qualified-pg17
image=pgvector/pgvector:0.8.2-pg17
if ! docker inspect "$container" >/dev/null 2>&1; then
  docker run -d --name "$container" -p 127.0.0.1:55438:5432 \
    -e POSTGRES_USER=custodian -e POSTGRES_HOST_AUTH_METHOD=trust "$image"
  ready=false
  for ((i=0; i<60; i++)); do
    if docker exec "$container" pg_isready -U custodian -d postgres >/dev/null 2>&1; then
      ready=true
      break
    fi
    sleep 1
  done
  "$ready" || { echo 'Disposable PostgreSQL startup failed' >&2; exit 1; }
  docker exec -i "$container" psql -U custodian -d postgres -v ON_ERROR_STOP=1 <<'SQL'
create role anon nologin inherit;
create role authenticated nologin inherit;
create role service_role nologin inherit bypassrls;
create role postgres login inherit createrole createdb replication bypassrls;
grant anon, authenticated, service_role to postgres;
alter database postgres owner to postgres;
create schema extensions authorization postgres;
create schema supabase_migrations authorization postgres;
create extension pgcrypto with schema extensions;
create extension vector with schema extensions;
set role postgres;
create table supabase_migrations.schema_migrations (
  version text primary key, statements text[], name text, created_by text,
  idempotency_key text unique, rollback text[]
);
SQL
fi
test "$(docker inspect "$container" --format '{{.Config.Image}}')" = "$image"
test "$(docker inspect "$container" --format '{{(index (index .HostConfig.PortBindings "5432/tcp") 0).HostIp}}')" = 127.0.0.1
test "$(docker inspect "$container" --format '{{(index (index .HostConfig.PortBindings "5432/tcp") 0).HostPort}}')" = 55438
docker start "$container" >/dev/null
deno task rehearse
