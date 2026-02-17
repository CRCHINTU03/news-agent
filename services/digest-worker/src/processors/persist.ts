import { pool } from "../db/pool.js";
import type { RankedCandidate } from "../types/index.js";

export async function createDigest(userId: string) {
  const result = await pool.query(
    `INSERT INTO digests(user_id, scheduled_for, status)
     VALUES ($1, NOW(), 'processing')
     RETURNING id::text`,
    [userId]
  );

  return result.rows[0].id as string;
}

export async function saveDigestItems(digestId: string, candidates: RankedCandidate[]) {
  let position = 1;
  for (const candidate of candidates) {
    await pool.query(
      `INSERT INTO digest_items(digest_id, article_id, rank_score, position)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (digest_id, article_id)
       DO NOTHING`,
      [digestId, candidate.articleId, candidate.score, position]
    );
    position += 1;
  }
}

export async function finalizeDigest(digestId: string, hasItems: boolean) {
  if (!hasItems) {
    await pool.query(
      `UPDATE digests
       SET status = 'failed'
       WHERE id = $1`,
      [digestId]
    );
    return;
  }

  await pool.query(
    `UPDATE digests
     SET status = 'pending'
     WHERE id = $1`,
    [digestId]
  );
}
