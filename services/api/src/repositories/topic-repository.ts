import { pool } from "../db/pool.js";

export async function listTopics() {
  const result = await pool.query(
    "SELECT id::text AS id, name, slug FROM topics ORDER BY name ASC"
  );

  return result.rows;
}

export async function topicExists(topicId: number) {
  const result = await pool.query("SELECT id FROM topics WHERE id = $1", [topicId]);
  return Boolean(result.rowCount);
}
