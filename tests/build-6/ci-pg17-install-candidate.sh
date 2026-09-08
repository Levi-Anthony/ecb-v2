#!/usr/bin/env bash
set -euo pipefail

: "${BUILD6_DATABASE_URL:?BUILD6_DATABASE_URL is required}"

# Reconstruct the accepted predecessor and install the normalized base plus the earlier
# construction corrections.
bash "$(dirname -- "${BASH_SOURCE[0]}")/ci-pg17-prepare.sh"

# Run-4 evidence earned minimum dependency privilege for the private native owner.
psql -X -v ON_ERROR_STOP=1 "$BUILD6_DATABASE_URL" \
  -f sql/migrations/20260908013300_build_6_native_extension_usage.sql

# Run-5 evidence established that the NOLOGIN native owner also needs a narrow RLS route to the
# already-existing universal Referent registry; no BYPASSRLS or runtime-role mutation is granted.
psql -X -v ON_ERROR_STOP=1 "$BUILD6_DATABASE_URL" \
  -f sql/migrations/20260908013400_build_6_referent_registry_integration.sql

# Run-6 evidence exposed a local PL/pgSQL identifier collision in registration result persistence.
psql -X -v ON_ERROR_STOP=1 "$BUILD6_DATABASE_URL" \
  -f sql/migrations/20260908013500_build_6_registration_result_ambiguity.sql
