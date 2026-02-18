# Production Hardening Checklist

## 1) Queue + Retry Architecture
- [x] Email delivery moved to queue-backed processing with retries and backoff
- [ ] Ingestion jobs moved to queue-backed scheduling
- [ ] Digest jobs moved to queue-backed scheduling
- [ ] Dead-letter queue strategy documented and implemented
- [ ] Idempotency keys enforced for all worker writes

## 2) Logging, Monitoring, Observability
- [x] API metrics endpoint (`/metrics`) and health endpoint (`/health`) available
- [x] Worker runtime counters exposed via local health/metrics HTTP endpoints
- [ ] Centralized log aggregation format and correlation IDs across workers
- [ ] Metrics export integration (Prometheus/Grafana/Datadog)
- [ ] Alerting rules for failure rate and pipeline lag

## 3) API Architecture Layering
- [x] Introduce repository/service split for auth flows
- [ ] Expand repository/service split across subscriptions/topics
- [ ] Introduce DTO mapping layer and standardized response contracts
- [ ] Add stricter domain-level validation in service layer

## 4) Security and Reliability
- [ ] Refresh token/session strategy
- [ ] Secret manager integration for production
- [ ] RBAC/admin scope model
- [ ] Rate limit policy tuning by endpoint and user tier

## 5) Deployment Readiness
- [ ] Staging smoke tests for full pipeline
- [ ] Production runbook with rollback and incident procedures
- [ ] SLOs and error budget definition
