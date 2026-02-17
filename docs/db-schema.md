# Database Schema (Sprint 1)

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

## schema_migrations
- `version` TEXT PK
- `applied_at` TIMESTAMPTZ

Migration file path:
- `services/api/db/migrations/001_init.sql`
