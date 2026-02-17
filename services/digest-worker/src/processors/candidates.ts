import { pool } from "../db/pool.js";
import { env } from "../config/env.js";
import type { CandidateRow, RankedCandidate, UserSubscriptionRow } from "../types/index.js";

function computeScore(confidence: number, publishedAt: string | null): number {
  if (!publishedAt) {
    return confidence;
  }

  const hoursAgo = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60);
  const recency = Math.max(0, 1 - hoursAgo / env.DIGEST_LOOKBACK_HOURS);
  return confidence * 0.7 + recency * 0.3;
}

export async function fetchCandidates(subscriptions: UserSubscriptionRow[]) {
  const topicIds = [...new Set(subscriptions.map((s) => Number(s.topic_id)))];

  const result = await pool.query(
    `SELECT
       a.id::text AS article_id,
       a.title,
       a.url,
       a.summary,
       a.published_at,
       at.confidence::text,
       a.raw_location
     FROM articles a
     JOIN article_topics at ON at.article_id = a.id
     WHERE at.topic_id = ANY($1::bigint[])
       AND a.published_at >= NOW() - ($2::text || ' hours')::interval
     ORDER BY a.published_at DESC
     LIMIT 500`,
    [topicIds, String(env.DIGEST_LOOKBACK_HOURS)]
  );

  const byArticle = new Map<string, number>();

  for (const row of result.rows as CandidateRow[]) {
    const confidence = Number(row.confidence);
    const score = computeScore(confidence, row.published_at);

    const existing = byArticle.get(row.article_id) ?? 0;
    if (score > existing) {
      byArticle.set(row.article_id, score);
    }
  }

  const ranked: RankedCandidate[] = [...byArticle.entries()]
    .map(([articleId, score]) => ({ articleId, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, env.DIGEST_MAX_ITEMS);

  return ranked;
}
