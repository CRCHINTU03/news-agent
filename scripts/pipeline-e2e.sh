#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f ".env" ]; then
  echo "[ERROR] .env not found. Copy .env.example first."
  exit 1
fi

# Load .env for DB connection values
set -a
# shellcheck disable=SC1091
source .env
set +a

POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5433}"
POSTGRES_DB="${POSTGRES_DB:-news_aggregator}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

export PGPASSWORD="$POSTGRES_PASSWORD"
PSQL_CMD=(psql "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}")

echo "[1/7] Running DB migrations"
npm run db:migrate

echo "[2/7] Verifying at least one active RSS source"
SOURCE_COUNT="$(${PSQL_CMD[@]} -t -A -c "SELECT COUNT(*) FROM sources WHERE is_active = TRUE AND type = 'rss';")"
if [ "${SOURCE_COUNT:-0}" -eq 0 ]; then
  echo "[ERROR] No active RSS sources found. Add one source before running pipeline:e2e."
  exit 1
fi

echo "[3/7] Running ingestion once"
npm run run:ingestion:once

echo "[4/7] Running digest generation once"
npm run run:digest:once

echo "[5/7] Running email delivery once"
npm run run:email:once

echo "[6/7] Validating digest records"
DIGEST_SENT_COUNT="$(${PSQL_CMD[@]} -t -A -c "SELECT COUNT(*) FROM digests WHERE status = 'sent';")"
if [ "${DIGEST_SENT_COUNT:-0}" -eq 0 ]; then
  echo "[ERROR] No sent digests found after pipeline run."
  exit 1
fi

echo "[7/7] Validating email events"
EMAIL_EVENT_COUNT="$(${PSQL_CMD[@]} -t -A -c "SELECT COUNT(*) FROM email_events WHERE event_type IN ('queued','delivered');")"
if [ "${EMAIL_EVENT_COUNT:-0}" -lt 2 ]; then
  echo "[ERROR] Expected queued/delivered email events were not recorded."
  exit 1
fi

LAST_DIGEST="$(${PSQL_CMD[@]} -t -A -c "SELECT id || ' | user=' || user_id || ' | status=' || status || ' | sent_at=' || COALESCE(sent_at::text,'NULL') FROM digests ORDER BY id DESC LIMIT 1;")"
LAST_EVENTS="$(${PSQL_CMD[@]} -t -A -c "SELECT event_type || ' @ ' || event_timestamp::text FROM email_events ORDER BY id DESC LIMIT 2;")"

echo "[PASS] End-to-end pipeline completed successfully."
echo "Latest digest: $LAST_DIGEST"
echo "Latest email events:"
echo "$LAST_EVENTS"
