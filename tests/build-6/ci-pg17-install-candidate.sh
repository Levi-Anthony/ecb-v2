#!/usr/bin/env bash
set -euo pipefail

: "${BUILD6_DATABASE_URL:?BUILD6_DATABASE_URL is required}"

# Reconstruct the accepted predecessor and install the normalized base plus the earlier
# construction corrections.
bash "$(dirname -- "${BASH_SOURCE[0]}")/ci-pg17-prepare.sh"

# Run-4 evidence earned one additional minimum dependency privilege for the private native owner.
psql -X -v ON_ERROR_STOP=1 "$BUILD6_DATABASE_URL" \
  -f sql/migrations/20260908013300_build_6_native_extension_usage.sql
