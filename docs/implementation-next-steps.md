# Implementation Status and Next Steps

## Current Project Structure

- `apps/web`: placeholder (not implemented yet)
- `apps/admin`: placeholder (not implemented yet)
- `services/api`: implemented baseline API service
- `services/ingestion`: placeholder (not implemented yet)
- `services/digest-worker`: placeholder (not implemented yet)
- `services/email-worker`: placeholder (not implemented yet)
- `packages/shared`: placeholder
- `packages/config`: placeholder
- `infra/docker`: local Postgres, Redis, MailHog stack
- `docs`: architecture/setup/API/schema/runbook/checkpoint docs

## What Is Implemented

1. Local infrastructure and project scaffolding
- Docker compose stack for Postgres/Redis/MailHog
- Bootstrap script and monorepo package workspace setup
- Baseline CI workflow for repository validation

2. API baseline (`services/api`)
- Runtime stack: Node.js + TypeScript + Express
- Env loading with root `.env` support
- DB connection pool and SQL migration runner
- Initial schema migration: `001_init.sql`
  - `users`
  - `topics` (+ initial seed rows)
  - `user_subscriptions`
  - `schema_migrations`
- Auth + subscription endpoints:
  - `GET /health`
  - `POST /auth/signup`
  - `POST /auth/login`
  - `GET /topics`
  - `GET /subscriptions` (auth)
  - `POST /subscriptions` (auth)

3. Verified working flow
- Build success for API
- Migration applied successfully
- Manual endpoint tests completed for signup/login/topics/subscriptions

## Required Steps (Still Pending)

1. Product and compliance documentation
- Finalize product requirements doc
- Finalize source policy/legal constraints for feed usage
- Create unsubscribe/compliance checklist (CAN-SPAM baseline)
- Define data retention policy
- Define audit event model

2. Delivery/operations readiness
- Add staging environment provisioning plan
- Add production environment provisioning plan
- Define secrets management approach
- Enforce required CI checks on pull requests

3. Engineering hardening
- Add centralized error handler and request logging middleware
- Add auth token refresh/revocation design
- Add API integration tests and test database workflow
- Add lint/format/test CI stages

## Next Implementation Milestones

## Milestone 1: Complete API CRUD and hardening
- [x] Add `PATCH /subscriptions/:id`
- [x] Add `DELETE /subscriptions/:id` (deactivate flow)
- [x] Add consistent API error model
- [x] Add request id + structured logging
- [x] Add basic rate limiting on auth routes
- [x] Add integration test for auth + subscription lifecycle

## Milestone 2: Ingestion service foundation (`services/ingestion`)
- Build RSS fetch scheduler
- Normalize feed items to article model
- Add dedup strategy (URL + content hash)
- Persist raw + normalized article metadata

## Milestone 3: Digest pipeline (`services/digest-worker`)
- Build per-user digest job
- Topic/locality matching and ranking
- Save digest records and digest items

## Milestone 4: Email delivery (`services/email-worker`)
- Build email template rendering
- Send via MailHog in local and provider adapter in prod
- Retry/bounce/unsubscribe handling

## Milestone 5: Frontend apps
- `apps/web`: signup/login, preferences, digest history
- `apps/admin`: source health, job health, delivery stats

## Recommended Immediate Task Order

1. Finish API CRUD + integration tests
2. Add article schema migration (`sources`, `articles`, `article_topics`, `digests`, `digest_items`, `email_events`)
3. Start ingestion MVP with 2-3 RSS connectors
4. Build first digest generation job
5. Wire local email preview/send flow
