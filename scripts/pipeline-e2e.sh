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

echo "[1/8] Running DB migrations"
npm run db:migrate

echo "[2/8] Verifying at least one active RSS source"
SOURCE_COUNT="$(${PSQL_CMD[@]} -t -A -c "SELECT COUNT(*) FROM sources WHERE is_active = TRUE AND type = 'rss';")"
if [ "${SOURCE_COUNT:-0}" -eq 0 ]; then
  echo "[ERROR] No active RSS sources found. Add one source before running pipeline:e2e."
  exit 1
fi

echo "[3/8] Running ingestion once"
npm run run:ingestion:once

echo "[4/8] Ensuring at least one active, emailable subscription exists"
EMAILABLE_SUB_COUNT="$(${PSQL_CMD[@]} -t -A -c "SELECT COUNT(*) FROM user_subscriptions us JOIN users u ON u.id = us.user_id WHERE us.is_active = TRUE AND u.status = 'active' AND u.email_opt_out = FALSE;")"
if [ "${EMAILABLE_SUB_COUNT:-0}" -eq 0 ]; then
  echo "[INFO] No active emailable subscriptions found. Seeding temporary E2E user/subscription."
  ${PSQL_CMD[@]} -v ON_ERROR_STOP=1 <<'SQL'
INSERT INTO users(email, password_hash, timezone, status, role, email_opt_out)
VALUES ('pipeline-e2e@example.com', 'pipeline_hash', 'UTC', 'active', 'user', FALSE)
ON CONFLICT (email) DO UPDATE
SET status = 'active',
    role = 'user',
    email_opt_out = FALSE,
    updated_at = NOW();

WITH target_user AS (
  SELECT id FROM users WHERE email = 'pipeline-e2e@example.com'
),
target_topic AS (
  SELECT at.topic_id
  FROM article_topics at
  GROUP BY at.topic_id
  ORDER BY COUNT(*) DESC
  LIMIT 1
),
fallback_topic AS (
  SELECT id AS topic_id FROM topics ORDER BY id ASC LIMIT 1
),
chosen_topic AS (
  SELECT topic_id FROM target_topic
  UNION ALL
  SELECT topic_id FROM fallback_topic WHERE NOT EXISTS (SELECT 1 FROM target_topic)
  LIMIT 1
)
INSERT INTO user_subscriptions(user_id, topic_id, locality, frequency, is_active)
SELECT u.id, t.topic_id, 'Pipeline E2E Locality', 'daily', TRUE
FROM target_user u
CROSS JOIN chosen_topic t
ON CONFLICT (user_id, topic_id, locality)
DO UPDATE SET is_active = TRUE, frequency = 'daily';
SQL
fi

echo "[5/8] Running digest generation once"
npm run run:digest:once

echo "[6/8] Running email delivery once"
npm run run:email:once

echo "[7/8] Validating digest records"
DIGEST_SENT_COUNT="$(${PSQL_CMD[@]} -t -A -c "SELECT COUNT(*) FROM digests WHERE status = 'sent';")"
if [ "${DIGEST_SENT_COUNT:-0}" -eq 0 ]; then
  echo "[ERROR] No sent digests found after pipeline run."
  exit 1
fi

echo "[8/8] Validating email events"
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
