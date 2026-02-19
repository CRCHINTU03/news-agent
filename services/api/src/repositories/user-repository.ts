import { pool } from "../db/pool.js";

export type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  timezone: string;
  status: string;
  role: "user" | "admin";
  email_opt_out: boolean;
};

export async function createUser(params: {
  email: string;
  passwordHash: string;
  timezone: string;
}) {
  const result = await pool.query(
    `INSERT INTO users(email, password_hash, timezone)
     VALUES ($1, $2, $3)
     RETURNING id::text AS id, email, timezone, status, role, email_opt_out, created_at`,
    [params.email.toLowerCase(), params.passwordHash, params.timezone]
  );

  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query(
    `SELECT id::text AS id, email, password_hash, timezone, status, role, email_opt_out
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (!result.rowCount) {
    return null;
  }

  return result.rows[0] as UserRecord;
}

export async function findUserById(userId: number): Promise<UserRecord | null> {
  const result = await pool.query(
    `SELECT id::text AS id, email, password_hash, timezone, status, role, email_opt_out
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (!result.rowCount) {
    return null;
  }

  return result.rows[0] as UserRecord;
}

export async function markUserEmailOptOut(userId: number) {
  const result = await pool.query(
    `UPDATE users
     SET email_opt_out = TRUE,
         email_opt_out_at = COALESCE(email_opt_out_at, NOW()),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id::text AS id, email, email_opt_out, email_opt_out_at::text`,
    [userId]
  );

  return result.rows[0] ?? null;
}
