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
- Errors: `400`, `409`, `429`, `500`

## POST /auth/login
- Description: Authenticate and return JWT.
- Request:
```json
{ "email": "user@example.com", "password": "password123" }
```
- Response: `200 OK`
- Errors: `400`, `401`, `429`, `500`

## GET /topics
- Description: List available subscription topics.
- Response: `200 OK`

## GET /subscriptions
- Description: List subscriptions for authenticated user.
- Auth: `Authorization: Bearer <jwt>`
- Response: `200 OK`
- Errors: `401`

## POST /subscriptions
- Description: Create a subscription for authenticated user.
- Auth: `Authorization: Bearer <jwt>`
- Request:
```json
{ "topicId": 2, "locality": "San Francisco, CA", "frequency": "daily" }
```
- Response: `201 Created`
- Errors: `400`, `401`, `404`, `409`, `500`

## PATCH /subscriptions/:id
- Description: Update subscription locality/frequency/active status.
- Auth: `Authorization: Bearer <jwt>`
- Request (any one or more fields):
```json
{ "locality": "San Jose, CA", "frequency": "weekly", "isActive": true }
```
- Response: `200 OK`
- Errors: `400`, `401`, `404`, `500`

## DELETE /subscriptions/:id
- Description: Soft-delete subscription (sets `is_active=false`).
- Auth: `Authorization: Bearer <jwt>`
- Response: `204 No Content`
- Errors: `400`, `401`, `404`, `500`

## Error model
- Standard error response shape:
```json
{ "message": "Human readable message", "requestId": "uuid-if-available" }
```
