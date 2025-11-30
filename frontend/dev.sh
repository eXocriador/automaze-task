#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

export NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000}"

if [ ! -d "node_modules" ]; then
  npm install
fi

exec npm run dev -- --hostname 0.0.0.0 --port "${PORT:-3000}"
