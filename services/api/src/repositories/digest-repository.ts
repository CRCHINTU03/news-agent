import { pool } from "../db/pool.js";

type DigestRow = {
  id: string;
  status: string;
  sent_at: string | null;
  created_at: string;
};

type DigestItemRow = {
  digest_id: string;
  position: number;
  rank_score: string;
  title: string;
  url: string;
  summary: string | null;
};

export async function listSentDigestsByUser(userId: number, limit = 20): Promise<DigestRow[]> {
  const result = await pool.query(
    `SELECT id::text, status, sent_at::text, created_at::text
     FROM digests
     WHERE user_id = $1 AND status = 'sent'
     ORDER BY sent_at DESC NULLS LAST, created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows as DigestRow[];
}

export async function listDigestItems(digestIds: string[]): Promise<DigestItemRow[]> {
  if (!digestIds.length) {
    return [];
  }

  const result = await pool.query(
    `SELECT di.digest_id::text, di.position, di.rank_score::text, a.title, a.url, a.summary
     FROM digest_items di
     JOIN articles a ON a.id = di.article_id
     WHERE di.digest_id = ANY($1::bigint[])
     ORDER BY di.digest_id DESC, di.position ASC`,
    [digestIds]
  );

  return result.rows as DigestItemRow[];
}
