import { pool } from "../db/pool.js";

export async function insertUnsubscribeEvent(userId: number, metadata?: Record<string, unknown>) {
  await pool.query(
    `INSERT INTO email_events(user_id, digest_id, event_type, metadata)
     VALUES ($1, NULL, 'unsubscribed', $2::jsonb)`,
    [userId, metadata ? JSON.stringify(metadata) : null]
  );
}
