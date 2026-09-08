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
ADMIN_URL="postgresql://custodian@127.0.0.1:55439/postgres"
DB_URL="postgresql://custodian@127.0.0.1:55439/build6"

psql -X -v ON_ERROR_STOP=1 "$ADMIN_URL" <<'SQL'
create role anon nologin inherit;
create role authenticated nologin inherit;
create role service_role nologin inherit bypassrls;
create role postgres login inherit createrole createdb replication bypassrls;
grant anon, authenticated, service_role to postgres;
SQL
createdb -h 127.0.0.1 -p 55439 -U custodian -O postgres build6

psql -X -v ON_ERROR_STOP=1 "$DB_URL" <<'SQL'
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

apply() {
  echo "Applying accepted predecessor: $1"
  psql -X -v ON_ERROR_STOP=1 "$DB_URL" -f "$1"
}

apply sql/migrations/20260903235721_build_0_atomic_thoughts.sql
psql -X -v ON_ERROR_STOP=1 "$DB_URL" -f tests/build-6/accepted-predecessor-gt01.sql
apply sql/migrations/20260904000010_build_0_least_privilege.sql
apply sql/migrations/20260904093341_build_2_universal_referents.sql
apply sql/migrations/20260904163938_build_3_claims_evidence_links.sql

psql -X -v ON_ERROR_STOP=1 "$DB_URL" <<'SQL'
update public.claims
set asserted_at='2026-09-04 16:39:38.624321+00'::timestamptz
where id='0f89e778-b16e-4840-9129-a2aa3eb6f697'::uuid;
update public.evidence_links
set linked_at='2026-09-04 16:39:38.624321+00'::timestamptz
where id='4c6c0f50-a936-4da6-bb09-233f93320639'::uuid;
SQL

apply sql/migrations/20260904215929_build_4_typed_relation_claims.sql
psql -X -v ON_ERROR_STOP=1 "$DB_URL" <<'SQL'
update public.claims set asserted_at='2026-09-04 16:39:38.624321+00'::timestamptz
where id='0f89e778-b16e-4840-9129-a2aa3eb6f697'::uuid;
update public.claims set asserted_at='2026-09-04 22:02:41.679741+00'::timestamptz
where id in (
  'c7f7d330-e778-4ae5-be96-3a172bea1166'::uuid,
  'cb429206-5abd-4adb-8ff9-d6d6a885034c'::uuid
);
update public.evidence_links set linked_at='2026-09-04 16:39:38.624321+00'::timestamptz
where id='4c6c0f50-a936-4da6-bb09-233f93320639'::uuid;
SQL

apply sql/migrations/20260905022247_build_5a_standing_transition_history.sql
psql -X -v ON_ERROR_STOP=1 "$DB_URL" <<'SQL'
update public.claim_standing_transitions
set recorded_at='2026-09-05 02:24:35.793609+00'::timestamptz
where id='a6925494-a862-441b-a361-5f5ec41dc9dc'::uuid;
SQL

apply sql/migrations/20260906014257_build_5b_versioned_artifacts.sql

psql -X -v ON_ERROR_STOP=1 "$DB_URL" <<'SQL'
do $gate$
declare
  thought_digest text;
begin
  if pg_catalog.to_regnamespace('ecb_governance') is not null then
    raise exception 'BUILD 6 schema exists before candidate qualification';
  end if;
  if pg_catalog.to_regclass('public.artifacts') is null
     or pg_catalog.to_regclass('public.claim_standing_transitions') is null
     or pg_catalog.to_regclass('public.referents') is null then
    raise exception 'Accepted BUILD 5B predecessor is incomplete';
  end if;
  if current_setting('server_version_num')::integer < 170000 then
    raise exception 'BUILD 6 qualification requires PostgreSQL 17+';
  end if;
  select pg_catalog.encode(public.thought_revision_digest(id),'hex')
    into strict thought_digest from public.thoughts
    where id='19a949ea-a8fc-4250-a386-fa64e5530180'::uuid;
  if thought_digest <> '5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55' then
    raise exception 'Accepted GT01 predecessor digest drifted: %', thought_digest;
  end if;
end;
$gate$;
SQL

echo "Accepted BUILD 5B predecessor reconstructed in disposable PG17."
