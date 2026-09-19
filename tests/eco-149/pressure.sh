#!/usr/bin/env bash
set -euo pipefail

DB="${1:?database URL required}"
RUNTIME_KEY='build11-test-runtime-key-00000000000000000000'
REVIEWER_KEY='eco149-reviewer-key'
CAP='14900000-0000-4149-8149-000000000103'
BASIS='14900000-0000-4149-8149-000000000001'
INQUIRY='14900000-0000-4149-8149-000000000010'

psql_admin() {
  psql -X -v ON_ERROR_STOP=1 "$DB" -Atq "$@"
}

channel="$(psql_admin -c "select channel_id from ecb_quadrant.records where receipt_id='$BASIS'::uuid")"
epoch="$(psql_admin -c "select epoch from ecb_quadrant.channels where id='$channel'::uuid")"

[[ -n "$channel" && -n "$epoch" ]] || { echo "ECO149_PRESSURE=FAIL missing channel/epoch"; exit 1; }

# Create a current-epoch assessment so later revocation is discriminated from staleness.
psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch" >/dev/null <<'SQL'
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);
set role anon;
select * from public.quadrant_v1_assess(
  '14900000-0000-4149-8149-000000000070'::uuid,
  :'channel'::uuid,
  :epoch::bigint,
  '14900000-0000-4149-8149-000000000103'::uuid,
  '{"profile":"ecb.quadrant/1","role":"assessment","proposition":"current basis is boundedly assessable for reversible_trial","input_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"method":"fixture-v1","use":"reversible_trial","result":"PASS","negative_control":{"case":"material no-route question","observed":"must suspend dependent reliance","would_reverse":"no-route still yields supported reliance"},"scope":"fixture reversible_trial","limits":"synthetic structural pressure"}'
);
reset role;
SQL

# A material no-route QF may not yield supported reliance.
set +e
no_route_out="$(psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch" 2>&1 <<'SQL'
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);
set role anon;
select * from public.quadrant_v1_qualify(
  '14900000-0000-4149-8149-000000000071'::uuid,
  :'channel'::uuid,
  :epoch::bigint,
  '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"14900000-0000-4149-8149-000000000070","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":true,"qf":[{"question":"Can the material seam question be answered?","route":"none_available","restriction":"dependent reliance suspended"}]}'
);
SQL
)"
no_route_status=$?
set -e
if [[ $no_route_status -eq 0 ]] || ! grep -q 'quadrant_scope_incompatible:decisive_gap' <<<"$no_route_out"; then
  echo "ECO149_PRESSURE=FAIL material no-route QF did not block supported reliance"
  echo "$no_route_out"
  exit 1
fi

# The same bounded state may be represented truthfully as suspended rather than promoted.
psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch" >/dev/null <<'SQL'
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);
set role anon;
select * from public.quadrant_v1_qualify(
  '14900000-0000-4149-8149-000000000072'::uuid,
  :'channel'::uuid,
  :epoch::bigint,
  '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"14900000-0000-4149-8149-000000000070","disposition":"suspended","authority_status":"not_required_for_nonexecuting_use","decisive_gap":true,"qf":[{"question":"Can the material seam question be answered?","route":"none_available","restriction":"dependent reliance suspended"}]}'
);
reset role;
SQL

# Commission an immutable ordinary receipt and use it as fixture revocation provenance.
psql -X -v ON_ERROR_STOP=1 "$DB" >/dev/null <<'SQL'
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);
set role anon;
select * from public.ecb12_create_artifact(
  '14900000-0000-4149-8149-000000000073'::uuid,
  'ECO-149 fixture reviewer revocation provenance'
);
reset role;
SQL
psql_admin -c "update ecb_quadrant.reviewer_capabilities set revoked_by_receipt_id='14900000-0000-4149-8149-000000000073'::uuid where id='$CAP'::uuid" >/dev/null

# Revocation blocks fresh positive reliance while historical records remain.
set +e
revoked_out="$(psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch" 2>&1 <<'SQL'
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000","x-ecb-quadrant-reviewer-key":"eco149-reviewer-key"}',
  false
);
set role anon;
select * from public.quadrant_v1_qualify(
  '14900000-0000-4149-8149-000000000074'::uuid,
  :'channel'::uuid,
  :epoch::bigint,
  '{"profile":"ecb.quadrant/1","role":"reliance","requested_use":"reversible_trial","permitted_use":"reversible_trial","basis_receipt":"14900000-0000-4149-8149-000000000001","inquiry_receipt":"14900000-0000-4149-8149-000000000010","assessment_receipt":"14900000-0000-4149-8149-000000000070","disposition":"supported","authority_status":"not_required_for_nonexecuting_use","decisive_gap":false,"qf":[]}'
);
SQL
)"
revoked_status=$?
set -e
if [[ $revoked_status -eq 0 ]] || ! grep -q 'quadrant_reviewer_unavailable_or_revoked' <<<"$revoked_out"; then
  echo "ECO149_PRESSURE=FAIL reviewer revocation did not block fresh reliance"
  echo "$revoked_out"
  exit 1
fi
historical_count="$(psql_admin -c "select count(*) from ecb_quadrant.records where receipt_id in ('14900000-0000-4149-8149-000000000070'::uuid,'14900000-0000-4149-8149-000000000072'::uuid)")"
[[ "$historical_count" == "2" ]] || { echo "ECO149_PRESSURE=FAIL revocation erased historical evidence"; exit 1; }

# Two concurrent selected writes with the same expected epoch: exactly one commits.
selection_payload='{"profile":"ecb.quadrant/1","role":"selection","selected_receipts":["14900000-0000-4149-8149-000000000001","14900000-0000-4149-8149-000000000010"],"reason":"concurrency pressure"}'
run_selection() {
  local op="$1" out="$2"
  set +e
  psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch" -v op="$op" -v payload="$selection_payload" >"$out" 2>&1 <<'SQL'
select pg_catalog.set_config(
  'request.headers',
  '{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',
  false
);
set role anon;
select * from public.quadrant_v1_record(
  :'op'::uuid,'selection',:'payload',:'channel'::uuid,:epoch::bigint,true
);
reset role;
SQL
  echo $? >"$out.status"
  set -e
}
run_selection '14900000-0000-4149-8149-000000000080' /tmp/eco149-a.out &
p1=$!
run_selection '14900000-0000-4149-8149-000000000081' /tmp/eco149-b.out &
p2=$!
wait "$p1" "$p2"
s1="$(cat /tmp/eco149-a.out.status)"
s2="$(cat /tmp/eco149-b.out.status)"
if [[ "$s1" == "0" && "$s2" == "0" ]] || [[ "$s1" != "0" && "$s2" != "0" ]]; then
  echo "ECO149_PRESSURE=FAIL concurrency did not yield exactly one winner"
  cat /tmp/eco149-a.out /tmp/eco149-b.out
  exit 1
fi
if [[ "$s1" != "0" ]]; then loser=/tmp/eco149-a.out; else loser=/tmp/eco149-b.out; fi
grep -q 'quadrant_revision_conflict' "$loser" || { echo "ECO149_PRESSURE=FAIL losing writer was not stale-revision rejection"; cat "$loser"; exit 1; }

epoch_after_concurrency="$(psql_admin -c "select epoch from ecb_quadrant.channels where id='$channel'::uuid")"
[[ "$epoch_after_concurrency" == "$((epoch + 1))" ]] || { echo "ECO149_PRESSURE=FAIL concurrency advanced epoch incorrectly"; exit 1; }

# Simulate lost response: commit a non-head record, discard response, then exact replay.
lost_payload='{"profile":"ecb.quadrant/1","role":"selection","selected_receipts":["14900000-0000-4149-8149-000000000001"],"reason":"lost-response replay pressure"}'
psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch_after_concurrency" -v payload="$lost_payload" >/dev/null <<'SQL'
select pg_catalog.set_config('request.headers','{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',false);
set role anon;
select * from public.quadrant_v1_record(
  '14900000-0000-4149-8149-000000000090'::uuid,'selection',:'payload',:'channel'::uuid,:epoch::bigint,false
);
reset role;
SQL
replayed="$(psql -X -v ON_ERROR_STOP=1 "$DB" -Atq -v channel="$channel" -v epoch="$epoch_after_concurrency" -v payload="$lost_payload" <<'SQL' | tail -n 1
select pg_catalog.set_config('request.headers','{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',false);
set role anon;
select replayed::text from public.quadrant_v1_record(
  '14900000-0000-4149-8149-000000000090'::uuid,'selection',:'payload',:'channel'::uuid,:epoch::bigint,false
);
SQL
)"
[[ "$replayed" == "true" || "$replayed" == "t" ]] || { echo "ECO149_PRESSURE=FAIL lost-response replay did not recover exact result"; exit 1; }

# Induce failure after the function has written inside an explicit transaction.
# Connection abort before COMMIT must roll the whole operation back.
set +e
rollback_out="$(psql -X -v ON_ERROR_STOP=1 "$DB" -v channel="$channel" -v epoch="$epoch_after_concurrency" 2>&1 <<'SQL'
begin;
select pg_catalog.set_config('request.headers','{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',false);
set role anon;
select * from public.quadrant_v1_record(
  '14900000-0000-4149-8149-000000000091'::uuid,
  'selection',
  '{"profile":"ecb.quadrant/1","role":"selection","selected_receipts":["14900000-0000-4149-8149-000000000001"],"reason":"induced rollback pressure"}',
  :'channel'::uuid,:epoch::bigint,true
);
reset role;
select 1/0;
commit;
SQL
)"
rollback_status=$?
set -e
if [[ $rollback_status -eq 0 ]] || ! grep -q 'division by zero' <<<"$rollback_out"; then
  echo "ECO149_PRESSURE=FAIL induced post-write failure did not occur"
  echo "$rollback_out"
  exit 1
fi
op91="$(psql_admin -c "select count(*) from public.ordinary_operations where id='14900000-0000-4149-8149-000000000091'::uuid")"
epoch_after_rollback="$(psql_admin -c "select epoch from ecb_quadrant.channels where id='$channel'::uuid")"
[[ "$op91" == "0" && "$epoch_after_rollback" == "$epoch_after_concurrency" ]] || {
  echo "ECO149_PRESSURE=FAIL induced failure left partial operation/head state"
  exit 1
}

# Fresh connection reconstructs current state only from durable identity.
fresh_epoch="$(psql -X -v ON_ERROR_STOP=1 "$DB" -Atq -v channel="$channel" <<'SQL' | tail -n 1
select pg_catalog.set_config('request.headers','{"x-ecb-runtime-key":"build11-test-runtime-key-00000000000000000000"}',false);
set role anon;
select public.quadrant_v1_resolve(:'channel'::uuid)->>'epoch';
SQL
)"
[[ "$fresh_epoch" == "$epoch_after_concurrency" ]] || { echo "ECO149_PRESSURE=FAIL fresh-process recovery lost current epoch"; exit 1; }

echo "ECO149_PRESSURE=PASS"
