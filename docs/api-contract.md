# API Contract (Sprint 1 Baseline)

Base URL (local): `http://localhost:4000`

## GET /health
- Description: Service health check.
- Response: `200 OK`
```json
{ "status": "ok" }
```

## POST /auth/signup
- Description: Register a user.
- Request:
```json
{ "email": "user@example.com", "password": "password123", "timezone": "America/New_York" }
```
- Response: `201 Created`
```json
{ "user": { "id": 1, "email": "user@example.com", "timezone": "America/New_York", "status": "active", "created_at": "..." } }
```
- Errors: `400`, `409`, `500`

## POST /auth/login
- Description: Authenticate and return JWT.
- Request:
```json
{ "email": "user@example.com", "password": "password123" }
```
- Response: `200 OK`
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "email": "user@example.com", "timezone": "America/New_York", "status": "active" }
}
```
- Errors: `400`, `401`

## GET /topics
- Description: List available subscription topics.
- Response: `200 OK`
```json
{ "topics": [{ "id": 1, "name": "Technology", "slug": "technology" }] }
```

## GET /subscriptions
- Description: List subscriptions for authenticated user.
- Auth: `Authorization: Bearer <jwt>`
- Response: `200 OK`

## POST /subscriptions
- Description: Create a subscription for authenticated user.
- Auth: `Authorization: Bearer <jwt>`
- Request:
```json
{ "topicId": 2, "locality": "San Francisco, CA", "frequency": "daily" }
```
- Response: `201 Created`
- Errors: `400`, `401`, `404`, `409`, `500`
