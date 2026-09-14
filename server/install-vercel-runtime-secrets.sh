#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="prj_oevToBKwqj7yHjyQCHs5zevegWCM"
ORG_ID="team_wueYGTZ3nxHz1WhMg8UE9gSy"
PREVIEW_BRANCH="build/eco-132-r4-runtime-confinement"
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

set_preview_secret() {
  local name="$1"
  local value="$2"
  "${VERCEL[@]}" env rm "$name" preview "$PREVIEW_BRANCH" --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | "${VERCEL[@]}" env add "$name" preview "$PREVIEW_BRANCH" --sensitive >/dev/null
}

set_production_secret() {
  local name="$1"
  local value="$2"
  "${VERCEL[@]}" env rm "$name" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | "${VERCEL[@]}" env add "$name" production --sensitive >/dev/null
}

# Preview is deliberately scoped to the active qualification branch so the CLI
# never needs an interactive Git-branch prompt. Production remains global.
set_preview_secret "ECB_ORDINARY_DB_KEY" "$runtime_key"
set_preview_secret "ECB_BRAIN_KEY_SHA256" "$brain_digest"
set_production_secret "ECB_ORDINARY_DB_KEY" "$runtime_key"
set_production_secret "ECB_BRAIN_KEY_SHA256" "$brain_digest"

preview_listing="$("${VERCEL[@]}" env ls preview "$PREVIEW_BRANCH")"
production_listing="$("${VERCEL[@]}" env ls production)"

grep -q 'ECB_ORDINARY_DB_KEY' <<<"$preview_listing" || { echo "Runtime key missing from Vercel preview branch $PREVIEW_BRANCH." >&2; exit 4; }
grep -q 'ECB_BRAIN_KEY_SHA256' <<<"$preview_listing" || { echo "Bearer verifier missing from Vercel preview branch $PREVIEW_BRANCH." >&2; exit 5; }
grep -q 'ECB_ORDINARY_DB_KEY' <<<"$production_listing" || { echo "Runtime key missing from Vercel production." >&2; exit 6; }
grep -q 'ECB_BRAIN_KEY_SHA256' <<<"$production_listing" || { echo "Bearer verifier missing from Vercel production." >&2; exit 7; }

unset runtime_key brain_digest
printf '%s\n' "BUILD11_VERCEL_RUNTIME_SECRETS=VERIFIED"
printf '%s\n' "Preview scope: $PREVIEW_BRANCH"
printf '%s\n' "No secret value was printed."
