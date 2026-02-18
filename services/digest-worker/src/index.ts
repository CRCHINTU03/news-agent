import http from "node:http";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { fetchCandidates } from "./processors/candidates.js";
import { createDigest, finalizeDigest, saveDigestItems } from "./processors/persist.js";
import { hasRecentDigest, loadActiveSubscriptionsByUser } from "./processors/subscriptions.js";

const workerStats = {
  service: "digest-worker",
  cycles_total: 0,
  digests_created_total: 0,
  cycles_failed: 0,
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

  server.listen(env.DIGEST_HEALTH_PORT, () => {
    console.log(`Digest observability listening on :${env.DIGEST_HEALTH_PORT}`);
  });
}

async function runDigestCycle() {
  workerStats.cycles_total += 1;
  workerStats.last_cycle_started_at = new Date().toISOString();
  const subscriptionsByUser = await loadActiveSubscriptionsByUser();

  if (!subscriptionsByUser.size) {
    workerStats.last_cycle_finished_at = new Date().toISOString();
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
      workerStats.digests_created_total += 1;

      console.log(`Digest ${digestId} generated for user ${userId} with ${candidates.length} items`);
    } catch (error) {
      workerStats.cycles_failed += 1;
      workerStats.last_error = error instanceof Error ? error.message : "Unknown digest error";
      console.error(`Failed to generate digest for user ${userId}`, error);
    }
  }

  workerStats.last_cycle_finished_at = new Date().toISOString();
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runDigestCycle();
    await pool.end();
    return;
  }

  startObservabilityServer();
  await runDigestCycle();

  const intervalMs = env.DIGEST_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    void runDigestCycle();
  }, intervalMs);

  console.log(`Digest worker started. Interval: ${env.DIGEST_INTERVAL_MINUTES} minutes`);
}

void main();
