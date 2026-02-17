# Digest Worker

Builds personalized digest records from active user subscriptions and ingested articles.

## Current behavior

- Loads active subscriptions grouped by user
- Skips users with a recent digest by frequency window
- Pulls candidate articles by topic and lookback window
- Scores candidates by topic confidence + recency
- Persists `digests` and `digest_items`
- Marks digest status:
  - `pending` when items exist
  - `failed` when no items are available

## Commands

- `npm run run:digest:once`
- `npm run dev:digest`
- `npm run build:digest`
