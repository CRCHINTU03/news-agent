import { pool } from "../db/pool.js";

export type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  timezone: string;
  status: string;
};

export async function createUser(params: {
  email: string;
  passwordHash: string;
  timezone: string;
}) {
  const result = await pool.query(
    `INSERT INTO users(email, password_hash, timezone)
     VALUES ($1, $2, $3)
     RETURNING id::text AS id, email, timezone, status, created_at`,
    [params.email.toLowerCase(), params.passwordHash, params.timezone]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query(
    `SELECT id::text AS id, email, password_hash, timezone, status
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (!result.rowCount) {
    return null;
  }

  return result.rows[0] as UserRecord;
}
