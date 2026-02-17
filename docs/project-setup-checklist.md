# Project Setup Checklist

## Scope Baseline
- [x] MVP scope documented
- [x] Repository structure created
- [ ] Product requirements doc finalized
- [ ] Source policy and legal constraints finalized

## Engineering Foundation
- [x] Monorepo scaffold created
- [x] Environment template added (`.env.example`)
- [x] Local infrastructure compose stack added
- [x] Bootstrap script added
- [ ] Base CI workflow (lint/test/build)
- [ ] Initial API contract draft

## DevOps
- [x] Local dependencies: PostgreSQL, Redis, MailHog
- [ ] Staging environment provisioning
- [ ] Production environment provisioning
- [ ] Secrets management strategy

## Security and Compliance
- [ ] Data retention policy
- [ ] Unsubscribe/compliance requirements checklist
- [ ] Audit event model

## Exit Criteria for Project Setup
- [x] Team can clone repo and run local infrastructure in one command
- [x] Directory boundaries for apps/services/packages are clear
- [ ] CI status checks required on pull requests
