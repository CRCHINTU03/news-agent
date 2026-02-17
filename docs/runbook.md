# Runbook (Local Development)

## Prerequisites
- Docker running
- Node.js 20+
- npm 9+ (or pnpm if preferred)

## One-time setup
1. `cp .env.example .env`
2. `./scripts/bootstrap.sh`
3. `npm install`

## Run DB migrations
- `npm run db:migrate`

## Start API service
- `npm run dev:api`

## Smoke test commands
- Health: `curl http://localhost:4000/health`
- Topics: `curl http://localhost:4000/topics`

## Common issues
- Port already in use: stop existing local services or update `.env` ports.
- DB connection refused: verify docker compose services are up.
- Auth 401: ensure bearer token from `/auth/login` is passed to protected routes.
