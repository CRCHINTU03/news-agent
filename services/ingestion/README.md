# Ingestion Service

Fetches content from configured sources and persists normalized articles.

## Scope (current)

- Load active sources from `sources` table
- Fetch RSS feed items
- Normalize fields to article payload
- Generate deterministic content hash
- Upsert into `articles` and map to `article_topics`
- Update source fetch timestamp

## Commands

- `npm run run:ingestion:once`
- `npm run dev:ingestion`
- `npm run build:ingestion`

## Prerequisites

1. DB migrations applied (`npm run db:migrate`)
2. At least one `rss` source row exists in `sources`

## Example source insert

```sql
INSERT INTO sources(name, type, url, is_active, fetch_interval_minutes)
VALUES ('BBC World', 'rss', 'http://feeds.bbci.co.uk/news/world/rss.xml', TRUE, 15)
ON CONFLICT (url) DO NOTHING;
```
