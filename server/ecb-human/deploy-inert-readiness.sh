#!/usr/bin/env bash
set -euo pipefail

# BUILD 6 deployment-preparation helper.
# This script intentionally deploys an INERT human-service package: no database
# credential, setup capability, enrollment secret, or canonical mutation.
# Run only from an authenticated human-operated Vercel CLI environment.

EXPECTED_TEAM_ID='team_wueYGTZ3nxHz1WhMg8UE9gSy'
EXPECTED_PROJECT_ID='prj_EQ2Q1Ybb1VFhP5pWRbZXdArVwKw4'
EXPECTED_PROJECT_NAME='ecb-human'
EXPECTED_ORIGIN='https://ecos.effortlessconnection.com'

command -v vercel >/dev/null || {
  echo 'ERROR: authenticated Vercel CLI is required' >&2
  exit 2
}

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root"

# Never inherit deployment credentials through this helper. Vercel authentication
# remains in the operator's CLI/session; project selection is explicit below.
forbidden_local_re='SERVICE_ROLE|JWT_SECRET|JWT_SIGN|POSTGRES_URL|POSTGRES_PRISMA_URL|DATABASE_OWNER|SUPABASE_SECRET|SETUP_SECRET|EXECUTOR_DATABASE_URL|INSTALLER_DATABASE_URL|ECB_BRAIN_KEY|HUMAN_DATABASE_URL'
while IFS='=' read -r key _; do
  if [[ "$key" =~ $forbidden_local_re ]]; then
    echo "ERROR: forbidden local environment key present: $key" >&2
    exit 3
  fi
done < <(env)

export VERCEL_ORG_ID="$EXPECTED_TEAM_ID"
export VERCEL_PROJECT_ID="$EXPECTED_PROJECT_ID"

who="$(vercel whoami 2>/dev/null | tail -n 1 || true)"
[[ -n "$who" ]] || {
  echo 'ERROR: Vercel CLI is not authenticated' >&2
  exit 4
}

echo "Vercel account: $who"
echo "Target team: $EXPECTED_TEAM_ID"
echo "Target project: $EXPECTED_PROJECT_NAME ($EXPECTED_PROJECT_ID)"
echo "Expected origin: $EXPECTED_ORIGIN"

# Human/operator inspection gate. Do not continue if any project variable implies
# owner/service-role/JWT signing, installer/executor, agent-key, setup capability,
# or a human DB credential. This inert deployment intentionally has none.
echo '--- project environment inventory (must contain no privileged/runtime DB keys) ---'
vercel env ls
cat <<'EOF'
CHECK BEFORE CONTINUING:
  The project environment inventory above must NOT contain any key matching:
  SERVICE_ROLE | JWT_SECRET | JWT_SIGN | POSTGRES_URL | POSTGRES_PRISMA_URL |
  DATABASE_OWNER | SUPABASE_SECRET | SETUP_SECRET | EXECUTOR_DATABASE_URL |
  INSTALLER_DATABASE_URL | ECB_BRAIN_KEY | HUMAN_DATABASE_URL
If any such key exists, STOP and do not deploy.
EOF

if [[ "${ECB_HUMAN_INERT_DEPLOY_CONFIRM:-}" != 'YES' ]]; then
  echo 'STOP: after inspecting the environment inventory, rerun with ECB_HUMAN_INERT_DEPLOY_CONFIRM=YES.'
  exit 10
fi

# Explicit project IDs above prevent accidental deployment to the Git-linked ecb-v2.
# No --env flags are supplied. The package must therefore fail closed at runtime.
deployment_url="$(vercel deploy --prod --yes 2>&1 | tee /tmp/ecb-human-vercel-deploy.log | tail -n 1)"
echo "Deployment result: $deployment_url"

echo '--- expected inert behavior ---'
echo 'The deployed handler must return HTTP 503 JSON:'
echo '  {"error":"service_unavailable","outcome":"unknown"}'
echo 'until a separately qualified HUMAN_DATABASE_URL exists.'
echo 'No enrollment/setup capability is created by this deployment.'
