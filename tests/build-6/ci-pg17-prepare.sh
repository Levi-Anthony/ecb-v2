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

apply() {
  echo "Applying accepted predecessor: $1"
  "${psql_cmd[@]}" -f "$1"
}

apply sql/migrations/20260903235721_build_0_atomic_thoughts.sql
"${psql_cmd[@]}" -f tests/build-6/accepted-predecessor-gt01.sql
apply sql/migrations/20260904000010_build_0_least_privilege.sql
apply sql/migrations/20260904093341_build_2_universal_referents.sql
apply sql/migrations/20260904163938_build_3_claims_evidence_links.sql

"${psql_cmd[@]}" <<'SQL'
update public.claims
set asserted_at='2026-09-04 16:39:38.624321+00'::timestamptz
where id='0f89e778-b16e-4840-9129-a2aa3eb6f697'::uuid;
update public.evidence_links
set linked_at='2026-09-04 16:39:38.624321+00'::timestamptz
where id='4c6c0f50-a936-4da6-bb09-233f93320639'::uuid;
SQL

apply sql/migrations/20260904215929_build_4_typed_relation_claims.sql
"${psql_cmd[@]}" <<'SQL'
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
"${psql_cmd[@]}" <<'SQL'
update public.claim_standing_transitions
set recorded_at='2026-09-05 02:24:35.793609+00'::timestamptz
where id='a6925494-a862-441b-a361-5f5ec41dc9dc'::uuid;
SQL

apply sql/migrations/20260906014257_build_5b_versioned_artifacts.sql

"${psql_cmd[@]}" <<'SQL'
do $gate$
declare
  thought_digest text;
  c_at timestamptz;
  l_at timestamptz;
  tr_at timestamptz;
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
  select pg_catalog.encode(public.thought_revision_digest(id),'hex')
    into strict thought_digest from public.thoughts
    where id='19a949ea-a8fc-4250-a386-fa64e5530180'::uuid;
  if thought_digest <> '5edc4782fb18a5e559ec49364b1f763880812c7cc1c248a33488da1d24d99a55' then
    raise exception 'Accepted GT01 predecessor digest drifted: %', thought_digest;
  end if;
  select asserted_at into strict c_at from public.claims
    where id='0f89e778-b16e-4840-9129-a2aa3eb6f697'::uuid;
  select linked_at into strict l_at from public.evidence_links
    where id='4c6c0f50-a936-4da6-bb09-233f93320639'::uuid;
  select recorded_at into strict tr_at from public.claim_standing_transitions
    where id='a6925494-a862-441b-a361-5f5ec41dc9dc'::uuid;
  if c_at <> '2026-09-04 16:39:38.624321+00'::timestamptz
     or l_at <> '2026-09-04 16:39:38.624321+00'::timestamptz
     or tr_at <> '2026-09-05 02:24:35.793609+00'::timestamptz then
    raise exception 'Accepted predecessor historical times drifted';
  end if;
end;
$gate$;
SQL

# The base migration is now the exact normalized byte sequence that passed disposable run 8.
# Do not regenerate or rewrite it during qualification: prove and execute the committed artifact.
BOOTSTRAP="sql/migrations/20260908013000_build_6_governance_bootstrap.sql"
EXPECTED_BOOTSTRAP_SHA256="e2010025a6de85842c25b740ec2e0af6e15db801e8cc8da67b0f92780bd91bc6"
ACTUAL_BOOTSTRAP_SHA256="$(sha256sum "$BOOTSTRAP" | awk '{print $1}')"
if [[ "$ACTUAL_BOOTSTRAP_SHA256" != "$EXPECTED_BOOTSTRAP_SHA256" ]]; then
  echo "Committed BUILD 6 bootstrap digest drifted: $ACTUAL_BOOTSTRAP_SHA256" >&2
  exit 4
fi
if grep -Eq 'pg_catalog\.(coalesce|least)' "$BOOTSTRAP"; then
  echo "Committed BUILD 6 bootstrap contains invalid SQL construct qualification" >&2
  exit 5
fi
if ! grep -Fq 'search_path=""' "$BOOTSTRAP"; then
  echo "Committed BUILD 6 bootstrap lacks the qualified fixed-search-path catalog check" >&2
  exit 6
fi

for migration in \
  "$BOOTSTRAP" \
  sql/migrations/20260908013100_build_6_setup_recovery_surface.sql \
  sql/migrations/20260908013200_build_6_decision_result_surface.sql
do
  echo "Applying committed BUILD 6 migration: $migration"
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
