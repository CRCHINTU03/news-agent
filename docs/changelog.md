# Changelog

## 2026-02-17
- Added `services/api` TypeScript Express service scaffold.
- Implemented endpoints: `/health`, `/auth/signup`, `/auth/login`, `/topics`, `/subscriptions` (GET/POST).
- Added JWT middleware and password hashing.
- Added SQL migration runner and initial migration (`001_init.sql`).
- Added checkpoint documentation:
  - `docs/decisions.md`
  - `docs/api-contract.md`
  - `docs/db-schema.md`
  - `docs/runbook.md`

- Added `docs/implementation-next-steps.md` with status, pending items, and milestone plan.
- Added subscription update/deactivate endpoints (`PATCH /subscriptions/:id`, `DELETE /subscriptions/:id`).
- Added request logging middleware with per-request id.
- Added centralized error middleware and standardized error response shape.
- Added auth route in-memory rate limiting (signup/login).
- Added integration test suite for auth + subscription lifecycle.
- Added migration `002_content_pipeline.sql` for source/article/digest/email pipeline tables.
- Added `services/ingestion` service scaffold with RSS fetch, normalization, hashing, and persistence.
- Added root scripts for ingestion build/run (`dev:ingestion`, `build:ingestion`, `run:ingestion:once`).
- Updated README, runbook, and schema docs for ingestion and new DB model.
- Added `services/digest-worker` service scaffold for subscription-based digest generation.
- Added digest ranking logic (topic confidence + recency) and persistence to `digests`/`digest_items`.
- Added root scripts for digest build/run (`dev:digest`, `build:digest`, `run:digest:once`).
- Updated runbook/env/README and implementation status docs for digest worker.
- Added `docs/completion-summary.md` documenting completed milestones and validation outcomes through digest generation.
