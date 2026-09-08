#!/usr/bin/env bash
set -euo pipefail

if [[ "${BUILD6_DISPOSABLE:-}" != "YES" ]]; then
  echo "BUILD6_DISPOSABLE=YES is required" >&2
  exit 2
fi
if [[ -z "${BUILD6_DATABASE_URL:-}" ]]; then
  echo "BUILD6_DATABASE_URL is required" >&2
  exit 2
fi
if [[ "${BUILD6_DATABASE_URL}" == *"vezxivrvhakclxuvxzso"* ]]; then
  echo "Refusing canonical ecb-v2-brain" >&2
  exit 3
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

npm run check
npm run qualify
