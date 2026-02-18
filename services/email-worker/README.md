# Email Worker

Processes pending digests and delivers digest emails through SMTP (MailHog in local development).

## Current behavior

- Loads `pending` digests
- Loads digest items for each digest
- Renders text + HTML email payload
- Sends via SMTP
- Updates digest status:
  - `sent` when delivered
  - `failed` when send fails or digest has no items
- Records `email_events` entries (`queued`, `delivered`, `bounced`)

## Commands

- `npm run run:email:once`
- `npm run dev:email`
- `npm run build:email`
