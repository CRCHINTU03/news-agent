# Runbook (Local Development)

## Prerequisites
- Docker running
- Node.js 20+
- npm 9+

## One-time setup
1. `cp .env.example .env`
2. `./scripts/bootstrap.sh`
3. `npm install`

## Run DB migrations
- `npm run db:migrate`

## Start API service
- `npm run dev:api`

## Start ingestion service
- One cycle: `npm run run:ingestion:once`
- Watch mode: `npm run dev:ingestion`

## Start digest worker
- One cycle: `npm run run:digest:once`
- Watch mode: `npm run dev:digest`

## Start email worker
- One cycle: `npm run run:email:once`
- Watch mode: `npm run dev:email`

## Smoke tests
- Health: `curl http://localhost:4000/health`
- Topics: `curl http://localhost:4000/topics`
- API tests: `npm run test:api`

## Configure ingestion sources
Before ingestion can persist items, insert at least one source row:

```sql
INSERT INTO sources(name, type, url, is_active, fetch_interval_minutes)
VALUES ('BBC World', 'rss', 'http://feeds.bbci.co.uk/news/world/rss.xml', TRUE, 15)
ON CONFLICT (url) DO NOTHING;
```

## Verify pipeline output
After running ingestion + digest + email workers:

```sql
SELECT id, user_id, status, sent_at FROM digests ORDER BY id DESC LIMIT 10;
SELECT digest_id, article_id, rank_score, position FROM digest_items ORDER BY digest_id DESC, position ASC LIMIT 50;
SELECT user_id, digest_id, event_type, provider_message_id, event_timestamp FROM email_events ORDER BY id DESC LIMIT 50;
```

## Common issues
- DB auth/port mismatch: ensure `.env` points to Postgres at `localhost:5433`.
- Empty ingestion run: verify `sources` table has active `rss` rows.
- Empty digest output: verify active `user_subscriptions` exist and recent articles are tagged to those topics.
- No email visible in MailHog: verify `MAILHOG_SMTP_HOST`/`MAILHOG_SMTP_PORT` and run `docker compose ... up -d`.
