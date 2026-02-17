import { pool } from "../db/pool.js";
import type { Source } from "../types.js";

export async function listActiveSources(): Promise<Source[]> {
  const result = await pool.query(
    `SELECT id, name, type, url
     FROM sources
     WHERE is_active = TRUE
     ORDER BY id ASC`
  );

  return result.rows as Source[];
}

export async function markSourceFetched(sourceId: string) {
  await pool.query(
    `UPDATE sources
     SET last_fetched_at = NOW(), updated_at = NOW()
     WHERE id = $1`,
    [sourceId]
  );
}
