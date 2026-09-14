#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="prj_oevToBKwqj7yHjyQCHs5zevegWCM"
ORG_ID="team_wueYGTZ3nxHz1WhMg8UE9gSy"
RUNTIME_KEY_FILE="${HOME}/.ecb-v2-runtime/ordinary-db-key"
DIGEST_URL="https://vezxivrvhakclxuvxzso.supabase.co/functions/v1/ecb11-brain-key-digest"

if [[ ! -s "$RUNTIME_KEY_FILE" ]]; then
  echo "Missing local runtime key: $RUNTIME_KEY_FILE" >&2
  exit 2
fi

runtime_key="$(tr -d '\r\n' < "$RUNTIME_KEY_FILE")"
if (( ${#runtime_key} < 32 )); then
  echo "Local runtime key is invalid." >&2
  exit 3
fi

brain_digest="$(python3 - "$DIGEST_URL" <<'PY'
import json, sys, urllib.request
with urllib.request.urlopen(sys.argv[1], timeout=30) as r:
    payload = json.load(r)
value = payload.get('digest', '')
if payload.get('status') != 'ok' or len(value) != 64:
    raise SystemExit('Could not obtain existing bearer verifier.')
print(value)
PY
)"

VERCEL=(npx --yes vercel@latest)
export VERCEL_PROJECT_ID="$PROJECT_ID"
export VERCEL_ORG_ID="$ORG_ID"

if ! "${VERCEL[@]}" whoami >/dev/null 2>&1; then
  echo "Vercel login required; opening authentication flow."
  "${VERCEL[@]}" login
fi

set_secret() {
  local name="$1"
  local target="$2"
  local value="$3"
  "${VERCEL[@]}" env rm "$name" "$target" --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | "${VERCEL[@]}" env add "$name" "$target" --sensitive >/dev/null
}

for target in preview production; do
  set_secret "ECB_ORDINARY_DB_KEY" "$target" "$runtime_key"
  set_secret "ECB_BRAIN_KEY_SHA256" "$target" "$brain_digest"
done

for target in preview production; do
  listing="$("${VERCEL[@]}" env ls "$target")"
  grep -q 'ECB_ORDINARY_DB_KEY' <<<"$listing" || { echo "Runtime key missing from Vercel $target." >&2; exit 4; }
  grep -q 'ECB_BRAIN_KEY_SHA256' <<<"$listing" || { echo "Bearer verifier missing from Vercel $target." >&2; exit 5; }
done

unset runtime_key brain_digest
printf '%s\n' "BUILD11_VERCEL_RUNTIME_SECRETS=VERIFIED"
printf '%s\n' "No secret value was printed."
