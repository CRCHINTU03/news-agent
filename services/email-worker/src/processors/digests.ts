import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import type { DigestItem, EmailJob, PendingDigest } from "../types/index.js";

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

export async function enqueuePendingDigests() {
  await pool.query(
    `INSERT INTO email_jobs(digest_id, user_id, status, available_at)
     SELECT d.id, d.user_id, 'queued', NOW()
     FROM digests d
     WHERE d.status = 'pending'
     ON CONFLICT (digest_id) DO NOTHING`
  );
}

export async function claimNextEmailJob(): Promise<EmailJob | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const jobResult = await client.query(
      `SELECT id::text, digest_id::text, user_id::text, attempts, max_attempts
       FROM email_jobs
       WHERE status IN ('queued', 'retry')
         AND available_at <= NOW()
       ORDER BY available_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`
    );

    if (!jobResult.rowCount) {
      await client.query("COMMIT");
      return null;
    }

    const job = jobResult.rows[0] as EmailJob;
    await client.query(
      `UPDATE email_jobs
       SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
       WHERE id = $1`,
      [job.id]
    );

    await client.query("COMMIT");
    return {
      ...job,
      attempts: job.attempts + 1
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loadDigestById(digestId: string): Promise<PendingDigest | null> {
  const result = await pool.query(
    `SELECT d.id::text AS digest_id, d.user_id::text, u.email AS user_email, d.scheduled_for::text
     FROM digests d
     JOIN users u ON u.id = d.user_id
     WHERE d.id = $1`,
    [digestId]
  );

  if (!result.rowCount) {
    return null;
  }

  return result.rows[0] as PendingDigest;
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

export async function markJobCompleted(jobId: string) {
  await pool.query(
    `UPDATE email_jobs
     SET status = 'completed', updated_at = NOW(), last_error = NULL
     WHERE id = $1`,
    [jobId]
  );
}

export async function markJobRetry(job: EmailJob, errorMessage: string) {
  const backoffSeconds = Math.min(300, Math.pow(2, job.attempts) * 5);

  await pool.query(
    `UPDATE email_jobs
     SET status = 'retry',
         available_at = NOW() + ($2::text || ' seconds')::interval,
         updated_at = NOW(),
         last_error = $3
     WHERE id = $1`,
    [job.id, String(backoffSeconds), errorMessage]
  );
}

export async function markJobFailed(jobId: string, errorMessage: string) {
  await pool.query(
    `UPDATE email_jobs
     SET status = 'failed',
         updated_at = NOW(),
         last_error = $2
     WHERE id = $1`,
    [jobId, errorMessage]
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
