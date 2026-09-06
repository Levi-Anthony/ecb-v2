#!/usr/bin/env bash
# Rebuild the disposable BUILD 5B rehearsal database from scratch.
#
# Artifacts are immutable by construction, so a rehearsal cannot clean up after itself and must not
# try. Every run starts from a new database. Nothing here touches canonical state.
#
# Baseline fidelity note: the BUILD 0-5A migrations derive their fixture timestamps from their own
# transaction clock, so replaying them at a different wall-clock time cannot reproduce the canonical
# bytes that WT07's frozen A1 encodes. The time-derived predecessor values are therefore aligned
# explicitly to the canonical facts, which were read read-only from ecb-v2-brain. Only these three
# values are set; every other predecessor fact is produced by the migrations themselves.
set -euo pipefail

PGPORT="${PGPORT:-5433}"
PGHOST="${PGHOST:-127.0.0.1}"
DBNAME="${DBNAME:-rehearsal}"
SUPERUSER_URL="postgres://postgres@${PGHOST}:${PGPORT}/postgres"
DB_URL="postgres://postgres@${PGHOST}:${PGPORT}/${DBNAME}"
MIGRATIONS="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../sql/migrations" && pwd)"

# Canonical predecessor facts, read read-only from ecb-v2-brain (vezxivrvhakclxuvxzso).
GT01_CONTENT='GT01: The brass heron waits beneath the violet staircase.'
GT01_SOURCE='golden_trace_01'
GT01_CAPTURED='2026-09-04T00:12:35.225093Z'
C_ASSERTED='2026-09-04T16:39:38.624321Z'
C2_R_ASSERTED='2026-09-04T22:02:41.679741Z'
L_LINKED='2026-09-04T16:39:38.624321Z'
TR1_RECORDED='2026-09-05T02:24:35.793609Z'

psql "$SUPERUSER_URL" -v ON_ERROR_STOP=1 -q -c "drop database if exists ${DBNAME};"
psql "$SUPERUSER_URL" -v ON_ERROR_STOP=1 -q -c "create database ${DBNAME};"

# Supabase-equivalent baseline: the managed platform's roles and extension schema.
psql "$DB_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
create schema if not exists extensions;
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (
  version text primary key, name text, statements text[]
);
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role login noinherit bypassrls password 'rehearsal';
  end if;
end $$;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema extensions to anon, authenticated, service_role;
create extension if not exists pgcrypto with schema extensions;
SQL

apply() {
  psql "$DB_URL" -v ON_ERROR_STOP=1 -q -f "${MIGRATIONS}/$1" >/dev/null
  echo "  applied $1"
}

apply 20260903235721_build_0_atomic_thoughts.sql
apply 20260904000010_build_0_least_privilege.sql
apply 20260904093341_build_2_universal_referents.sql

# GT01 is captured evidence, not migration content; BUILD 3's Evidence Link requires it to exist.
EMB="$(python3 -c "print('[' + ','.join('%.6f' % (((i*37%97)+1)/97.0) for i in range(384)) + ']')")"
psql "$DB_URL" -v ON_ERROR_STOP=1 -q -c \
  "insert into public.thoughts (id, content, source, captured_at, embedding, embedding_model)
   values ('19a949ea-a8fc-4250-a386-fa64e5530180', '${GT01_CONTENT}', '${GT01_SOURCE}',
           '${GT01_CAPTURED}'::timestamptz, '${EMB}'::extensions.vector(384), 'gte-small');"
echo "  seeded GT01"

apply 20260904163938_build_3_claims_evidence_links.sql
apply 20260904215929_build_4_typed_relation_claims.sql

# Align the time-derived predecessor values to canonical before BUILD 5A's drift check reads them.
psql "$DB_URL" -v ON_ERROR_STOP=1 -q -c \
  "set session_replication_role = replica;
   update public.claims set asserted_at = '${C_ASSERTED}'::timestamptz
     where id = '0f89e778-b16e-4840-9129-a2aa3eb6f697';
   update public.claims set asserted_at = '${C2_R_ASSERTED}'::timestamptz
     where id in ('c7f7d330-e778-4ae5-be96-3a172bea1166','cb429206-5abd-4adb-8ff9-d6d6a885034c');
   update public.evidence_links set linked_at = '${L_LINKED}'::timestamptz
     where id = '4c6c0f50-a936-4da6-bb09-233f93320639';
   set session_replication_role = default;"

apply 20260905022247_build_5a_standing_transition_history.sql

psql "$DB_URL" -v ON_ERROR_STOP=1 -q -c \
  "set session_replication_role = replica;
   update public.claim_standing_transitions set recorded_at = '${TR1_RECORDED}'::timestamptz
     where id = 'a6925494-a862-441b-a361-5f5ec41dc9dc';
   set session_replication_role = default;"
echo "  aligned predecessor timestamps to canonical"

echo "Predecessor ready. Applying BUILD 5B through the bound runner mechanism:"
REHEARSAL_DATABASE_URL="$DB_URL" deno run --allow-env --allow-net --allow-read \
  "$(dirname "${BASH_SOURCE[0]}")/runner.ts"
