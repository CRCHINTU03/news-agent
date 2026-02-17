# Database Schema

## users
- `id` BIGSERIAL PK
- `email` TEXT UNIQUE NOT NULL
- `password_hash` TEXT NOT NULL
- `timezone` TEXT NOT NULL
- `status` TEXT NOT NULL
- `created_at`, `updated_at` TIMESTAMPTZ

## topics
- `id` BIGSERIAL PK
- `name` TEXT NOT NULL
- `slug` TEXT UNIQUE NOT NULL
- `created_at` TIMESTAMPTZ

## user_subscriptions
- `id` BIGSERIAL PK
- `user_id` BIGINT FK -> users.id
- `topic_id` BIGINT FK -> topics.id
- `locality` TEXT NOT NULL
- `frequency` TEXT CHECK (`daily|weekly`)
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMPTZ
- Unique composite: (`user_id`, `topic_id`, `locality`)

## sources
- `id` BIGSERIAL PK
- `name` TEXT NOT NULL
- `type` TEXT CHECK (`rss|api`)
- `url` TEXT UNIQUE NOT NULL
- `is_active` BOOLEAN DEFAULT TRUE
- `fetch_interval_minutes` INT NOT NULL DEFAULT 15
- `last_fetched_at` TIMESTAMPTZ
- `created_at`, `updated_at` TIMESTAMPTZ

## articles
- `id` BIGSERIAL PK
- `source_id` BIGINT FK -> sources.id
- `title` TEXT NOT NULL
- `url` TEXT UNIQUE NOT NULL
- `summary` TEXT
- `content_hash` TEXT NOT NULL
- `published_at` TIMESTAMPTZ
- `language` TEXT
- `raw_location` TEXT
- `created_at`, `updated_at` TIMESTAMPTZ

## article_topics
- `article_id` BIGINT FK -> articles.id
- `topic_id` BIGINT FK -> topics.id
- `confidence` NUMERIC(4,3)
- PK: (`article_id`, `topic_id`)

## digests
- `id` BIGSERIAL PK
- `user_id` BIGINT FK -> users.id
- `scheduled_for` TIMESTAMPTZ NOT NULL
- `sent_at` TIMESTAMPTZ
- `status` TEXT CHECK (`pending|processing|sent|failed`)
- `created_at` TIMESTAMPTZ

## digest_items
- `id` BIGSERIAL PK
- `digest_id` BIGINT FK -> digests.id
- `article_id` BIGINT FK -> articles.id
- `rank_score` NUMERIC(7,4)
- `position` INT
- `created_at` TIMESTAMPTZ
- Unique: (`digest_id`, `article_id`), (`digest_id`, `position`)

## email_events
- `id` BIGSERIAL PK
- `user_id` BIGINT FK -> users.id
- `digest_id` BIGINT FK -> digests.id
- `event_type` TEXT CHECK (`queued|delivered|opened|clicked|bounced|complained|unsubscribed`)
- `event_timestamp` TIMESTAMPTZ
- `provider_message_id` TEXT
- `metadata` JSONB
- `created_at` TIMESTAMPTZ

## schema_migrations
- `version` TEXT PK
- `applied_at` TIMESTAMPTZ

## Migration files
- `services/api/db/migrations/001_init.sql`
- `services/api/db/migrations/002_content_pipeline.sql`
