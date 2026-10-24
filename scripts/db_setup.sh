#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to your Tiger Data connection string}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$script_dir/../backend/app/db/schema.sql"
