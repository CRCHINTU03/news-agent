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
