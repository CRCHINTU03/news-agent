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
