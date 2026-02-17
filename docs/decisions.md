# Engineering Decisions (ADR-lite)

## 2026-02-17 - API stack for Sprint 1
- Decision: Use Node.js + TypeScript + Express for initial API service.
- Reason: Fast setup, mature ecosystem, low friction for MVP endpoint delivery.
- Tradeoff: Less built-in structure than NestJS; requires discipline as codebase grows.

## 2026-02-17 - Database and migration strategy
- Decision: Use PostgreSQL with SQL-first migrations stored in repository.
- Reason: Transparent schema evolution, easy review, no ORM lock-in in early phase.
- Tradeoff: Manual query typing and validation effort is higher.

## 2026-02-17 - Authentication approach
- Decision: Use email/password with bcrypt hash and JWT bearer token.
- Reason: Simple MVP-friendly auth model with standard client integration.
- Tradeoff: Refresh-token and token revocation model not implemented yet.
