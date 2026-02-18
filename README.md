# News Agent

News Agent aggregates public news feeds, matches content to user interests (topic + locality), and processes personalized digest emails.

## Monorepo Structure

- `apps/web` - User-facing app (not implemented yet)
- `apps/admin` - Admin app (not implemented yet)
- `services/api` - Auth, topics, subscriptions APIs
- `services/ingestion` - RSS ingestion, normalization, dedup, persistence
- `services/digest-worker` - Digest generation and ranking pipeline
- `services/email-worker` - Pending digest email delivery pipeline
- `packages/shared` - Shared package placeholder
- `packages/config` - Shared config placeholder
- `infra/docker` - Local Postgres, Redis, MailHog stack
- `docs` - Architecture, runbook, schema, changelog

## Quick Start

```bash
cp .env.example .env
./scripts/bootstrap.sh
npm install
npm run db:migrate
npm run pipeline:e2e
```

## Local Services

- API: `http://localhost:4000`
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`
- MailHog UI: `http://localhost:8025`

## Key Commands

- Build API: `npm run build:api`
- Run API tests: `npm run test:api`
- Run ingestion once: `npm run run:ingestion:once`
- Run digest generation once: `npm run run:digest:once`
- Run email delivery once: `npm run run:email:once`
- Run full pipeline validation: `npm run pipeline:e2e`
- Run workers in watch mode: `npm run dev:ingestion`, `npm run dev:digest`, `npm run dev:email`
- Run web app (MVP): `npm run dev:web`

## Current Milestone Status

- Project setup complete
- API baseline and hardening complete
- Ingestion and digest generation complete
- Email worker complete
- End-to-end pipeline script complete
