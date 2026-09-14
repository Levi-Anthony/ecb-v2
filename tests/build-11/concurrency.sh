#!/usr/bin/env bash
set -euo pipefail

: "${BUILD11_DATABASE_URL:?BUILD11_DATABASE_URL is required}"
KEY='build11-test-runtime-key-00000000000000000000'
OP='33333333-aaaa-4333-8333-333333333333'
CONTENT='BUILD 11 concurrent replay specimen: copper bell in fog.'
SOURCE='build11_concurrency'
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

call_capture() {
  local out="$1"
  psql -X -qAt -v ON_ERROR_STOP=1 "$BUILD11_DATABASE_URL" >"$out" <<SQL
set role anon;
select pg_catalog.set_config('request.headers','{"x-ecb-runtime-key":"$KEY"}',false);
select thought_id::text || '|' || replayed::text
from public.ecb11_capture_thought(
  '$OP'::uuid,
  '$CONTENT',
  '$SOURCE',
  null
);
SQL
}

call_capture "$TMP/a.txt" &
pid_a=$!
call_capture "$TMP/b.txt" &
pid_b=$!
wait "$pid_a"
wait "$pid_b"

line_a="$(tail -n1 "$TMP/a.txt")"
line_b="$(tail -n1 "$TMP/b.txt")"
id_a="${line_a%%|*}"
id_b="${line_b%%|*}"
flag_a="${line_a##*|}"
flag_b="${line_b##*|}"

if [[ -z "$id_a" || "$id_a" != "$id_b" ]]; then
  echo "concurrent replay returned different Thought identities" >&2
  cat "$TMP/a.txt" >&2
  cat "$TMP/b.txt" >&2
  exit 1
fi

if [[ "$flag_a$flag_b" != "falsetrue" && "$flag_a$flag_b" != "truefalse" ]]; then
  echo "expected one initial commit and one replay, got $flag_a / $flag_b" >&2
  exit 1
fi

operation_count="$(psql -X -qAt "$BUILD11_DATABASE_URL" -c "select count(*) from public.ordinary_operations where id='$OP'::uuid")"
thought_count="$(psql -X -qAt "$BUILD11_DATABASE_URL" -c "select count(*) from public.thoughts where id='$id_a'::uuid")"
content_count="$(psql -X -qAt "$BUILD11_DATABASE_URL" -c "select count(*) from public.thoughts where content='$CONTENT' and source='$SOURCE'")"

[[ "$operation_count" == "1" ]]
[[ "$thought_count" == "1" ]]
[[ "$content_count" == "1" ]]

echo "BUILD11_CONCURRENCY=PASS thought_id=$id_a"
