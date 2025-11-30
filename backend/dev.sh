#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if [ -f "venv/bin/activate" ]; then
  source "venv/bin/activate"
fi

export PYTHONPATH="$DIR"
UVICORN_CMD=${UVICORN_CMD:-python3 -m uvicorn}

exec $UVICORN_CMD app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --reload --app-dir "$DIR"
