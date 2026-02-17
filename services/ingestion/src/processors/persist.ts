import { pool } from "../db/pool.js";
import type { NormalizedArticle } from "../types.js";

export async function persistArticle(sourceId: string, article: NormalizedArticle) {
  const articleResult = await pool.query(
    `INSERT INTO articles(source_id, title, url, summary, content_hash, published_at, language, raw_location)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (url)
     DO UPDATE SET
       title = EXCLUDED.title,
       summary = EXCLUDED.summary,
       content_hash = EXCLUDED.content_hash,
       published_at = EXCLUDED.published_at,
       language = EXCLUDED.language,
       raw_location = EXCLUDED.raw_location,
       updated_at = NOW()
     RETURNING id`,
    [
      sourceId,
      article.title,
      article.url,
      article.summary,
      article.contentHash,
      article.publishedAt,
      article.language,
      article.rawLocation
    ]
  );

  const articleId = articleResult.rows[0].id as string;

  for (const topicSlug of article.topicSlugs) {
    const topic = await pool.query("SELECT id FROM topics WHERE slug = $1", [topicSlug]);
    if (!topic.rowCount) {
      continue;
    }

    const topicId = topic.rows[0].id as string;
    await pool.query(
      `INSERT INTO article_topics(article_id, topic_id, confidence)
       VALUES ($1, $2, $3)
       ON CONFLICT (article_id, topic_id)
       DO UPDATE SET confidence = EXCLUDED.confidence`,
      [articleId, topicId, 0.75]
    );
  }

  return articleId;
}
