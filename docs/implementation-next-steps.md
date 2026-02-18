# Implementation Status and Next Steps

## Current Project Structure
- `apps/web`: placeholder (not implemented yet)
- `apps/admin`: placeholder (not implemented yet)
- `services/api`: implemented and tested
- `services/ingestion`: implemented MVP scaffold
- `services/digest-worker`: implemented MVP scaffold
- `services/email-worker`: implemented MVP scaffold
- `packages/shared`: placeholder
- `packages/config`: placeholder
- `infra/docker`: local Postgres, Redis, MailHog stack
- `docs`: architecture/setup/API/schema/runbook/checkpoint docs

## What Is Implemented
1. Infrastructure + setup baseline
2. API auth/topics/subscriptions + hardening + integration tests
3. Content pipeline schema migration for sources/articles/digests/email events
4. Ingestion worker for RSS normalization and article persistence
5. Digest worker for subscription-based digest generation
6. Email worker for pending digest delivery + email event persistence

## Pending Required Steps
1. Compliance docs: source policy, unsubscribe policy, retention and audit model
2. Ops readiness: staging/prod setup, secrets strategy, CI protection rules
3. End-to-end integration tests spanning ingestion -> digest -> email

## Next Milestones
### Milestone 5: Frontend apps
- `apps/web`: auth, preferences, digest history
- `apps/admin`: source/job/email observability dashboard

### Milestone 6: Production hardening
- Provider abstraction for non-local email providers
- Failure retries and dead-letter strategy
- Better ranking/personalization and topic inference quality

## Immediate Next Task Order
1. Add end-to-end script/test for local full pipeline
2. Build `apps/web` subscription and digest history pages
3. Add `apps/admin` operational dashboard for source/digest/email states
4. Add unsubscribe link flow + API endpoint and event handling
