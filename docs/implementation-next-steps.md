# Implementation Status and Next Steps

## Current Project Structure
- `apps/web`: implemented (user auth, subscriptions, digest history)
- `apps/admin`: implemented (operations dashboard)
- `services/api`: implemented and tested
- `services/ingestion`: implemented and validated
- `services/digest-worker`: implemented and validated
- `services/email-worker`: implemented and validated
- `packages/shared`: minimal/placeholder
- `packages/config`: minimal/placeholder
- `infra/docker`: local Postgres, Redis, MailHog stack
- `docs`: setup, architecture, API, schema, runbook, checkpoints

## What Is Implemented
1. Infrastructure and local environment baseline
2. API auth/topics/subscriptions/digests with middleware and layered architecture
3. Content pipeline schema and ingestion worker
4. Digest generation worker with ranking and persistence
5. Email worker with queue-backed retries and event tracking
6. End-to-end validation script (`npm run pipeline:e2e`)
7. Web and admin MVP applications

## Pending Required Steps
1. Unsubscribe capability (secure token/link + suppression behavior)
2. Strong admin authorization (RBAC/role checks)
3. Wider integration and resilience tests (failure/retry/dead-letter paths)
4. Production readiness items (alerts, runbooks, deployment hardening)

## Next Milestones
### Milestone 6: Reliability + Governance
- [ ] Unsubscribe flow and policy compliance
- [ ] Admin RBAC hardening
- [ ] Dead-letter and retry observability improvements

### Milestone 7: Production Readiness
- [ ] Secrets and environment hardening
- [ ] Alerting and SLO-backed monitoring
- [ ] Deployment and rollback runbooks

## Immediate Next Task Order
1. Implement unsubscribe link/token flow end-to-end
2. Add RBAC middleware for admin endpoints and app/admin routes
3. Add integration tests for unsubscribe and email retry failure paths
4. Add runbooks + dashboard/alert checklist for production operations
