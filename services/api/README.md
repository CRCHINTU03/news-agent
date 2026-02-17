# API Service

Core backend API for News Agent.

## Endpoints (Sprint 1 baseline)
- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /topics`
- `GET /subscriptions` (auth)
- `POST /subscriptions` (auth)
- `PATCH /subscriptions/:id` (auth)
- `DELETE /subscriptions/:id` (auth, soft delete)

## Local commands
- `npm run dev:api`
- `npm run db:migrate`
- `npm run test:api`

See `/docs/api-contract.md` for request/response details.
