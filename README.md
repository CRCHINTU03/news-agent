# News Agent

News Agent is a platform to aggregate up-to-date public news content, match it to user interests (topics + locality), and send personalized email digests.

## Vision

Build a reliable pipeline that:
- pulls content from open/public feeds (RSS and APIs),
- normalizes and de-duplicates stories,
- classifies stories by topic and location relevance,
- delivers personalized digests to subscribers.

## Monorepo Structure

- `apps/web` - User-facing app (signup, preferences, digest history)
- `apps/admin` - Admin app (source health, jobs, delivery monitoring)
- `services/api` - Core API (auth, subscriptions, digests, user settings)
- `services/ingestion` - Feed ingestion and normalization workers
- `services/digest-worker` - Digest assembly and ranking jobs
- `services/email-worker` - Email delivery, retries, unsubscribe events
- `packages/shared` - Shared types, utilities, constants
- `packages/config` - Shared tooling/config (lint, tsconfig, env helpers)
- `infra/docker` - Local infrastructure (Postgres, Redis, MailHog)
- `docs` - Product and engineering documents
- `scripts` - Setup/utility scripts

## Current Status

This repository currently contains project setup scaffolding.
Service implementation starts in Sprint 1.

## Quick Start

### 1) Clone and enter project

```bash
git clone https://github.com/CRCHINTU03/news-agent.git
cd news-agent
