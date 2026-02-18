import http from "node:http";
import nodemailer from "nodemailer";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import {
  claimNextEmailJob,
  enqueuePendingDigests,
  insertEmailEvent,
  loadDigestById,
  loadDigestItems,
  markDigestFailed,
  markDigestSent,
  markJobCompleted,
  markJobFailed,
  markJobRetry
} from "./processors/digests.js";
import { renderDigestHtml, renderDigestText } from "./processors/render.js";

const workerStats = {
  service: "email-worker",
  cycles_total: 0,
  queued_jobs_total: 0,
  delivered_jobs_total: 0,
  failed_jobs_total: 0,
  retry_jobs_total: 0,
  last_cycle_started_at: null as string | null,
  last_cycle_finished_at: null as string | null,
  last_error: null as string | null
};

function startObservabilityServer() {
  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 404;
      res.end();
      return;
    }

    if (req.url === "/health") {
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          status: "ok",
          service: workerStats.service,
          uptime_seconds: process.uptime(),
          timestamp: new Date().toISOString()
        })
      );
      return;
    }

    if (req.url === "/metrics") {
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          ...workerStats,
          process_uptime_seconds: process.uptime(),
          timestamp: new Date().toISOString()
        })
      );
      return;
    }

    res.statusCode = 404;
    res.end();
  });

  server.listen(env.EMAIL_HEALTH_PORT, () => {
    console.log(`Email observability listening on :${env.EMAIL_HEALTH_PORT}`);
  });
}

const transporter = nodemailer.createTransport({
  host: env.MAILHOG_SMTP_HOST,
  port: env.MAILHOG_SMTP_PORT,
  secure: false
});

async function processEmailJobs() {
  while (true) {
    const job = await claimNextEmailJob();
    if (!job) {
      break;
    }

    const digest = await loadDigestById(job.digest_id);
    if (!digest) {
      await markJobFailed(job.id, "Digest not found");
      continue;
    }

    try {
      const items = await loadDigestItems(digest.digest_id);
      if (!items.length) {
        await markDigestFailed(digest.digest_id);
        await markJobFailed(job.id, "Digest has no items");
        await insertEmailEvent({
          userId: digest.user_id,
          digestId: digest.digest_id,
          eventType: "bounced",
          metadata: { reason: "Digest has no items" }
        });
        workerStats.failed_jobs_total += 1;
        continue;
      }

      await insertEmailEvent({
        userId: digest.user_id,
        digestId: digest.digest_id,
        eventType: "queued"
      });

      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: digest.user_email,
        subject: `Your News Agent Digest (${items.length} stories)`,
        text: renderDigestText(digest.user_email, items),
        html: renderDigestHtml(digest.user_email, items)
      });

      await markDigestSent(digest.digest_id);
      await markJobCompleted(job.id);
      await insertEmailEvent({
        userId: digest.user_id,
        digestId: digest.digest_id,
        eventType: "delivered",
        providerMessageId: info.messageId,
        metadata: { accepted: info.accepted, rejected: info.rejected }
      });

      workerStats.delivered_jobs_total += 1;
      console.log(`Digest ${digest.digest_id} delivered to ${digest.user_email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown send error";
      workerStats.last_error = errorMessage;

      if (job.attempts < job.max_attempts) {
        await markJobRetry(job, errorMessage);
        workerStats.retry_jobs_total += 1;
      } else {
        await markDigestFailed(digest.digest_id);
        await markJobFailed(job.id, errorMessage);
        await insertEmailEvent({
          userId: digest.user_id,
          digestId: digest.digest_id,
          eventType: "bounced",
          metadata: { message: errorMessage }
        });
        workerStats.failed_jobs_total += 1;
      }

      console.error(`Failed sending digest ${digest.digest_id} to ${digest.user_email}`, error);
    }
  }
}

async function runEmailCycle() {
  workerStats.cycles_total += 1;
  workerStats.last_cycle_started_at = new Date().toISOString();

  await enqueuePendingDigests();
  await processEmailJobs();

  workerStats.last_cycle_finished_at = new Date().toISOString();
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runEmailCycle();
    await pool.end();
    return;
  }

  startObservabilityServer();
  await runEmailCycle();

  const intervalMs = env.EMAIL_WORKER_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    void runEmailCycle();
  }, intervalMs);

  console.log(`Email worker started. Interval: ${env.EMAIL_WORKER_INTERVAL_MINUTES} minutes`);
}

void main();
