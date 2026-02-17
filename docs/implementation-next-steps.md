# Implementation Status and Next Steps

## Current Project Structure
- `apps/web`: placeholder (not implemented yet)
- `apps/admin`: placeholder (not implemented yet)
- `services/api`: implemented and tested
- `services/ingestion`: implemented MVP scaffold (RSS fetch + normalize + persist)
- `services/digest-worker`: implemented MVP scaffold (subscription-based digest generation)
- `services/email-worker`: placeholder (not implemented yet)
- `packages/shared`: placeholder
- `packages/config`: placeholder
- `infra/docker`: local Postgres, Redis, MailHog stack
- `docs`: architecture/setup/API/schema/runbook/checkpoint docs

## What Is Implemented
1. Infrastructure + setup baseline
2. API auth/topics/subscriptions + hardening + integration tests
3. Content pipeline schema migration for sources/articles/digests/email events
4. Ingestion worker for RSS sources with normalization and article persistence
5. Digest worker for per-user digest generation and ranked digest items

## Pending Required Steps
1. Compliance docs: source policy, unsubscribe policy, retention and audit model
2. Ops readiness: staging/prod setup, secrets strategy, CI protection rules
3. End-to-end pipeline tests across ingestion -> digest -> email

## Next Milestones
### Milestone 4: Email delivery (`services/email-worker`)
- Build email template rendering
- Add MailHog adapter for local sends
- Persist queued/delivered/bounce/unsubscribe events in `email_events`

### Milestone 5: Frontend apps
- `apps/web`: auth, preferences, digest history
- `apps/admin`: source/job/email observability dashboard

## Immediate Next Task Order
1. Implement email worker that sends pending digests and marks sent state
2. Add digest-to-email mapping and event recording
3. Add one end-to-end command/script for local pipeline validation
4. Add integration tests for digest worker and email worker
