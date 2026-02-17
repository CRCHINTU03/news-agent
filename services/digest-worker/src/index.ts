import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { fetchCandidates } from "./processors/candidates.js";
import { createDigest, finalizeDigest, saveDigestItems } from "./processors/persist.js";
import { hasRecentDigest, loadActiveSubscriptionsByUser } from "./processors/subscriptions.js";

async function runDigestCycle() {
  const subscriptionsByUser = await loadActiveSubscriptionsByUser();

  if (!subscriptionsByUser.size) {
    console.log("No active subscriptions found");
    return;
  }

  for (const [userId, subscriptions] of subscriptionsByUser.entries()) {
    const frequency = subscriptions[0].frequency;
    const skip = await hasRecentDigest(userId, frequency);
    if (skip) {
      continue;
    }

    try {
      const candidates = await fetchCandidates(subscriptions);
      const digestId = await createDigest(userId);
      await saveDigestItems(digestId, candidates);
      await finalizeDigest(digestId, candidates.length > 0);

      console.log(`Digest ${digestId} generated for user ${userId} with ${candidates.length} items`);
    } catch (error) {
      console.error(`Failed to generate digest for user ${userId}`, error);
    }
  }
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runDigestCycle();
    await pool.end();
    return;
  }

  await runDigestCycle();

  const intervalMs = env.DIGEST_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    void runDigestCycle();
  }, intervalMs);

  console.log(`Digest worker started. Interval: ${env.DIGEST_INTERVAL_MINUTES} minutes`);
}

void main();
