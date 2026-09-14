#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="vezxivrvhakclxuvxzso"
STATE_DIR="${HOME}/.ecb-v2-runtime"
KEY_FILE="${STATE_DIR}/ordinary-db-key"

umask 077
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

if [[ -s "$KEY_FILE" ]]; then
  key="$(tr -d '\r\n' < "$KEY_FILE")"
  if (( ${#key} < 32 )); then
    echo "Existing runtime key file is invalid: $KEY_FILE" >&2
    exit 2
  fi
else
  if command -v openssl >/dev/null 2>&1; then
    key="$(openssl rand -hex 32)"
  else
    key="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
  fi
  printf '%s\n' "$key" > "$KEY_FILE"
  chmod 600 "$KEY_FILE"
fi

if command -v supabase >/dev/null 2>&1; then
  SUPABASE=(supabase)
elif command -v npx >/dev/null 2>&1; then
  SUPABASE=(npx --yes supabase)
else
  echo "Supabase CLI not found. Install it, then rerun this script." >&2
  exit 3
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
  --project-ref "$PROJECT_REF" \
  --env-file "$tmp_env"

printf '%s\n' "BUILD11_RUNTIME_SECRET=INSTALLED"
printf '%s\n' "Local recovery copy: $KEY_FILE"
printf '%s\n' "The secret value was not printed."
