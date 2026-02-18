import nodemailer from "nodemailer";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import {
  insertEmailEvent,
  loadDigestItems,
  loadPendingDigests,
  markDigestFailed,
  markDigestSent
} from "./processors/digests.js";
import { renderDigestHtml, renderDigestText } from "./processors/render.js";

const transporter = nodemailer.createTransport({
  host: env.MAILHOG_SMTP_HOST,
  port: env.MAILHOG_SMTP_PORT,
  secure: false
});

async function runEmailCycle() {
  const pendingDigests = await loadPendingDigests();

  if (!pendingDigests.length) {
    console.log("No pending digests to send");
    return;
  }

  for (const digest of pendingDigests) {
    try {
      const items = await loadDigestItems(digest.digest_id);
      if (!items.length) {
        await markDigestFailed(digest.digest_id);
        await insertEmailEvent({
          userId: digest.user_id,
          digestId: digest.digest_id,
          eventType: "bounced",
          metadata: { reason: "Digest has no items" }
        });
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
      await insertEmailEvent({
        userId: digest.user_id,
        digestId: digest.digest_id,
        eventType: "delivered",
        providerMessageId: info.messageId,
        metadata: { accepted: info.accepted, rejected: info.rejected }
      });

      console.log(`Digest ${digest.digest_id} delivered to ${digest.user_email}`);
    } catch (error) {
      await markDigestFailed(digest.digest_id);
      await insertEmailEvent({
        userId: digest.user_id,
        digestId: digest.digest_id,
        eventType: "bounced",
        metadata: {
          message: error instanceof Error ? error.message : "Unknown send error"
        }
      });

      console.error(`Failed sending digest ${digest.digest_id} to ${digest.user_email}`, error);
    }
  }
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runEmailCycle();
    await pool.end();
    return;
  }

  await runEmailCycle();

  const intervalMs = env.EMAIL_WORKER_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    void runEmailCycle();
  }, intervalMs);

  console.log(`Email worker started. Interval: ${env.EMAIL_WORKER_INTERVAL_MINUTES} minutes`);
}

void main();
