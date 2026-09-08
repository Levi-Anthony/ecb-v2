#!/usr/bin/env bash
set -euo pipefail

: "${BUILD6_DATABASE_URL:?BUILD6_DATABASE_URL is required}"
if [[ "${BUILD6_DISPOSABLE:-}" != "YES" ]]; then
  echo "BUILD6_DISPOSABLE=YES is required" >&2
  exit 2
fi
if [[ "$BUILD6_DATABASE_URL" == *"vezxivrvhakclxuvxzso"* ]]; then
  echo "Refusing canonical ecb-v2-brain" >&2
  exit 3
fi

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

psql_cmd=(psql -X -v ON_ERROR_STOP=1 "$BUILD6_DATABASE_URL")

# Reuse the already-qualified BUILD 5B disposable-PG17 compatibility boundary.
"${psql_cmd[@]}" <<'SQL'
create role anon nologin inherit;
create role authenticated nologin inherit;
create role service_role nologin inherit bypassrls;
create role postgres login inherit createrole createdb replication bypassrls;
grant anon, authenticated, service_role to postgres;
create schema extensions authorization postgres;
create schema supabase_migrations authorization postgres;
create extension pgcrypto with schema extensions;
create extension vector with schema extensions;
create table supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text,
  created_by text,
  idempotency_key text unique,
  rollback text[]
);
SQL

predecessor=(
  sql/migrations/20260903235721_build_0_atomic_thoughts.sql
  sql/migrations/20260904000010_build_0_least_privilege.sql
  sql/migrations/20260904093341_build_2_universal_referents.sql
  sql/migrations/20260904163938_build_3_claims_evidence_links.sql
  sql/migrations/20260904215929_build_4_typed_relation_claims.sql
  sql/migrations/20260905022247_build_5a_standing_transition_history.sql
  sql/migrations/20260906014257_build_5b_versioned_artifacts.sql
)

for migration in "${predecessor[@]}"; do
  echo "Applying accepted predecessor: $migration"
  "${psql_cmd[@]}" -f "$migration"
done

# Gate: BUILD 6 must be absent immediately after predecessor reconstruction.
"${psql_cmd[@]}" <<'SQL'
do $gate$
begin
  if pg_catalog.to_regnamespace('ecb_governance') is not null then
    raise exception 'BUILD 6 schema exists before BUILD 6 qualification';
  end if;
  if pg_catalog.to_regclass('public.artifacts') is null
     or pg_catalog.to_regclass('public.claim_standing_transitions') is null
     or pg_catalog.to_regclass('public.referents') is null then
    raise exception 'Accepted BUILD 5B predecessor is incomplete';
  end if;
  if current_setting('server_version_num')::integer < 170000 then
    raise exception 'BUILD 6 qualification requires PostgreSQL 17+';
  end if;
end;
$gate$;
SQL

build6=(
  sql/migrations/20260908013000_build_6_governance_bootstrap.sql
  sql/migrations/20260908013100_build_6_setup_recovery_surface.sql
  sql/migrations/20260908013200_build_6_decision_result_surface.sql
)

for migration in "${build6[@]}"; do
  echo "Applying BUILD 6 construction: $migration"
  "${psql_cmd[@]}" -f "$migration"
done

"${psql_cmd[@]}" <<'SQL'
select current_setting('server_version') as server_version,
       extversion as vector_version
from pg_catalog.pg_extension
where extname = 'vector';

select n.nspname as governance_schema,
       count(c.oid) filter (where c.relkind = 'r') as native_tables
from pg_catalog.pg_namespace n
left join pg_catalog.pg_class c on c.relnamespace = n.oid
where n.nspname = 'ecb_governance'
group by n.nspname;
SQL
