#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="vezxivrvhakclxuvxzso"
STATE_DIR="${HOME}/.ecb-v2-runtime"
KEY_FILE="${STATE_DIR}/ordinary-db-key"

umask 077
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

if [[ ! -s "$KEY_FILE" ]]; then
  echo "Missing local BUILD 11 runtime key: $KEY_FILE" >&2
  exit 2
fi

key="$(tr -d '\r\n' < "$KEY_FILE")"
if (( ${#key} < 32 )); then
  echo "Existing runtime key file is invalid: $KEY_FILE" >&2
  exit 2
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required for this verified repair so the current Supabase CLI can be used." >&2
  exit 3
fi

SUPABASE=(npx --yes supabase@latest)

if ! "${SUPABASE[@]}" projects list >/dev/null 2>&1; then
  printf '%s\n' "Supabase login required; opening the CLI login flow."
  "${SUPABASE[@]}" login
fi

tmp_env="$(mktemp)"
cleanup() {
  rm -f "$tmp_env"
  unset key
}
trap cleanup EXIT INT TERM
chmod 600 "$tmp_env"
printf 'ECB_ORDINARY_DB_KEY=%s\n' "$key" > "$tmp_env"

"${SUPABASE[@]}" secrets set \
  --env-file "$tmp_env" \
  --project-ref "$PROJECT_REF"

secret_list="$("${SUPABASE[@]}" secrets list --project-ref "$PROJECT_REF")"
if ! printf '%s\n' "$secret_list" | grep -q 'ECB_ORDINARY_DB_KEY'; then
  echo "Supabase reported success but ECB_ORDINARY_DB_KEY is not present in the remote secret list." >&2
  exit 4
fi

printf '%s\n' "BUILD11_RUNTIME_SECRET=VERIFIED"
printf '%s\n' "Local recovery copy: $KEY_FILE"
printf '%s\n' "The secret value was not printed."
