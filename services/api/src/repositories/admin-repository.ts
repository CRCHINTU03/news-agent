import { pool } from "../db/pool.js";

export async function getOverviewCounts() {
  const [sources, articles24h, digestsByStatus, emailEvents24h, emailJobsByStatus] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM sources WHERE is_active = TRUE"),
    pool.query("SELECT COUNT(*)::int AS count FROM articles WHERE created_at >= NOW() - INTERVAL '24 hours'"),
    pool.query("SELECT status, COUNT(*)::int AS count FROM digests GROUP BY status"),
    pool.query("SELECT event_type, COUNT(*)::int AS count FROM email_events WHERE event_timestamp >= NOW() - INTERVAL '24 hours' GROUP BY event_type"),
    pool.query("SELECT status, COUNT(*)::int AS count FROM email_jobs GROUP BY status")
  ]);

  return {
    activeSources: sources.rows[0]?.count ?? 0,
    recentArticles24h: articles24h.rows[0]?.count ?? 0,
    digestsByStatus: digestsByStatus.rows,
    emailEvents24h: emailEvents24h.rows,
    emailJobsByStatus: emailJobsByStatus.rows
  };
}

export async function listSources(limit = 50) {
  const result = await pool.query(
    `SELECT id::text, name, type, url, is_active, fetch_interval_minutes, last_fetched_at::text, updated_at::text
     FROM sources
     ORDER BY updated_at DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function listRecentDigests(limit = 50) {
  const result = await pool.query(
    `SELECT d.id::text, d.user_id::text, u.email, d.status, d.sent_at::text, d.created_at::text
     FROM digests d
     JOIN users u ON u.id = d.user_id
     ORDER BY d.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function listEmailJobs(limit = 50) {
  const result = await pool.query(
    `SELECT id::text, digest_id::text, user_id::text, status, attempts, max_attempts, available_at::text, last_error, updated_at::text
     FROM email_jobs
     ORDER BY updated_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function listEmailEvents(limit = 100) {
  const result = await pool.query(
    `SELECT id::text, user_id::text, digest_id::text, event_type, provider_message_id, event_timestamp::text
     FROM email_events
     ORDER BY event_timestamp DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}
