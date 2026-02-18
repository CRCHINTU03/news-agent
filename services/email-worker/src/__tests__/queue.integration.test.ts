import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { pool } from "../db/pool.js";
import { claimNextEmailJob, enqueuePendingDigests, markJobRetry } from "../processors/digests.js";

beforeEach(async () => {
  await pool.query("DELETE FROM email_jobs");
  await pool.query("DELETE FROM email_events");
  await pool.query("DELETE FROM digest_items");
  await pool.query("DELETE FROM digests");
  await pool.query("DELETE FROM user_subscriptions");
  await pool.query("DELETE FROM users");
});

after(async () => {
  await pool.end();
});

test("enqueue and claim pending digest email job with retry", async () => {
  const userInsert = await pool.query(
    `INSERT INTO users(email, password_hash, timezone)
     VALUES ('queue-test@example.com', 'hash', 'UTC')
     RETURNING id::text`
  );
  const userId = userInsert.rows[0].id as string;

  const digestInsert = await pool.query(
    `INSERT INTO digests(user_id, scheduled_for, status)
     VALUES ($1, NOW(), 'pending')
     RETURNING id::text`,
    [userId]
  );
  const digestId = digestInsert.rows[0].id as string;

  await enqueuePendingDigests();

  const job = await claimNextEmailJob();
  assert.ok(job, "Expected queued email job to be claimed");
  assert.equal(job!.digest_id, digestId);
  assert.equal(job!.attempts, 1);

  await markJobRetry(job!, "Simulated SMTP failure");

  const queued = await pool.query(
    `SELECT status, attempts, max_attempts, last_error
     FROM email_jobs
     WHERE id = $1`,
    [job!.id]
  );

  assert.equal(queued.rows[0].status, "retry");
  assert.equal(Number(queued.rows[0].attempts), 1);
  assert.equal(Number(queued.rows[0].max_attempts), 3);
  assert.equal(queued.rows[0].last_error, "Simulated SMTP failure");
});
