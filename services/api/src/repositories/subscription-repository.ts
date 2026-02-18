import { pool } from "../db/pool.js";

export async function listSubscriptionsByUser(userId: number) {
  const result = await pool.query(
    `SELECT us.id::text, us.locality, us.frequency, us.is_active, t.id::text AS topic_id, t.name AS topic_name, t.slug AS topic_slug
     FROM user_subscriptions us
     JOIN topics t ON t.id = us.topic_id
     WHERE us.user_id = $1
     ORDER BY us.created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function createSubscription(params: {
  userId: number;
  topicId: number;
  locality: string;
  frequency: "daily" | "weekly";
}) {
  const result = await pool.query(
    `INSERT INTO user_subscriptions(user_id, topic_id, locality, frequency)
     VALUES ($1, $2, $3, $4)
     RETURNING id::text, user_id::text, topic_id::text, locality, frequency, is_active, created_at`,
    [params.userId, params.topicId, params.locality, params.frequency]
  );

  return result.rows[0];
}

export async function updateSubscription(params: {
  subscriptionId: number;
  userId: number;
  locality?: string;
  frequency?: "daily" | "weekly";
  isActive?: boolean;
}) {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (params.locality !== undefined) {
    fields.push(`locality = $${values.length + 1}`);
    values.push(params.locality);
  }
  if (params.frequency !== undefined) {
    fields.push(`frequency = $${values.length + 1}`);
    values.push(params.frequency);
  }
  if (params.isActive !== undefined) {
    fields.push(`is_active = $${values.length + 1}`);
    values.push(params.isActive);
  }

  values.push(params.userId, params.subscriptionId);

  const query = `
    UPDATE user_subscriptions
    SET ${fields.join(", ")}
    WHERE user_id = $${values.length - 1} AND id = $${values.length}
    RETURNING id::text, user_id::text, topic_id::text, locality, frequency, is_active, created_at
  `;

  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
}

export async function deactivateSubscription(subscriptionId: number, userId: number) {
  const result = await pool.query(
    `UPDATE user_subscriptions
     SET is_active = FALSE
     WHERE id = $1 AND user_id = $2
     RETURNING id::text`,
    [subscriptionId, userId]
  );

  return result.rows[0] ?? null;
}
