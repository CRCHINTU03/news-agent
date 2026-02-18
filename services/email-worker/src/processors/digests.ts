import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import type { DigestItem, PendingDigest } from "../types/index.js";

export async function loadPendingDigests(): Promise<PendingDigest[]> {
  const result = await pool.query(
    `SELECT d.id::text AS digest_id, d.user_id::text, u.email AS user_email, d.scheduled_for::text
     FROM digests d
     JOIN users u ON u.id = d.user_id
     WHERE d.status = 'pending'
     ORDER BY d.created_at ASC
     LIMIT 100`
  );

  return result.rows as PendingDigest[];
}

export async function loadDigestItems(digestId: string): Promise<DigestItem[]> {
  const result = await pool.query(
    `SELECT
       di.article_id::text,
       a.title,
       a.url,
       a.summary,
       di.position,
       di.rank_score::text
     FROM digest_items di
     JOIN articles a ON a.id = di.article_id
     WHERE di.digest_id = $1
     ORDER BY di.position ASC
     LIMIT $2`,
    [digestId, env.EMAIL_DIGEST_MAX_ITEMS]
  );

  return result.rows as DigestItem[];
}

export async function markDigestSent(digestId: string) {
  await pool.query(
    `UPDATE digests
     SET status = 'sent', sent_at = NOW()
     WHERE id = $1`,
    [digestId]
  );
}

export async function markDigestFailed(digestId: string) {
  await pool.query(
    `UPDATE digests
     SET status = 'failed'
     WHERE id = $1`,
    [digestId]
  );
}

export async function insertEmailEvent(params: {
  userId: string;
  digestId: string;
  eventType: "queued" | "delivered" | "bounced";
  providerMessageId?: string;
  metadata?: Record<string, unknown>;
}) {
  await pool.query(
    `INSERT INTO email_events(user_id, digest_id, event_type, provider_message_id, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      params.userId,
      params.digestId,
      params.eventType,
      params.providerMessageId ?? null,
      params.metadata ? JSON.stringify(params.metadata) : null
    ]
  );
}
