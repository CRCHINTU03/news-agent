#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

docker compose -f infra/docker/docker-compose.yml up -d

echo "Local setup complete."
echo "Postgres: localhost:5432"
echo "Redis: localhost:6379"
echo "MailHog UI: http://localhost:8025"
