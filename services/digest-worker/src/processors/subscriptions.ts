import { pool } from "../db/pool.js";
import type { UserSubscriptionRow } from "../types/index.js";

export async function loadActiveSubscriptionsByUser() {
  const result = await pool.query(
    `SELECT user_id::text, frequency, topic_id::text, locality
     FROM user_subscriptions us
     JOIN users u ON u.id = us.user_id
     WHERE us.is_active = TRUE
       AND u.status = 'active'
       AND u.email_opt_out = FALSE
     ORDER BY user_id ASC`
  );

  const grouped = new Map<string, UserSubscriptionRow[]>();

  for (const row of result.rows as UserSubscriptionRow[]) {
    const existing = grouped.get(row.user_id) ?? [];
    existing.push(row);
    grouped.set(row.user_id, existing);
  }

  return grouped;
}

export async function hasRecentDigest(userId: string, frequency: "daily" | "weekly") {
  const interval = frequency === "daily" ? "24 hours" : "7 days";

  const result = await pool.query(
    `SELECT id
     FROM digests
     WHERE user_id = $1
       AND created_at >= NOW() - INTERVAL '${interval}'
       AND status IN ('pending', 'processing', 'sent')
     LIMIT 1`,
    [userId]
  );

  return Boolean(result.rowCount);
}
