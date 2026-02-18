import http from "node:http";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { fetchRssItems } from "./fetchers/rss.js";
import { normalizeRssItem } from "./processors/normalize.js";
import { persistArticle } from "./processors/persist.js";
import { listActiveSources, markSourceFetched } from "./processors/sources.js";

const workerStats = {
  service: "ingestion-worker",
  cycles_total: 0,
  cycles_success: 0,
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

  server.listen(env.INGESTION_HEALTH_PORT, () => {
    console.log(`Ingestion observability listening on :${env.INGESTION_HEALTH_PORT}`);
  });
}

async function runIngestionCycle() {
  workerStats.cycles_total += 1;
  workerStats.last_cycle_started_at = new Date().toISOString();
  const sources = await listActiveSources();

  if (!sources.length) {
    workerStats.cycles_success += 1;
    workerStats.last_cycle_finished_at = new Date().toISOString();
    console.log("No active sources configured");
    return;
  }

  for (const source of sources) {
    if (source.type !== "rss") {
      console.log(`Skipping unsupported source type for ${source.name}`);
      continue;
    }

    try {
      const items = await fetchRssItems(source.url);
      const limitedItems = items.slice(0, env.INGESTION_MAX_ITEMS_PER_SOURCE);

      let persistedCount = 0;
      for (const item of limitedItems) {
        const normalized = normalizeRssItem(item as Record<string, unknown>);
        if (!normalized) {
          continue;
        }

        await persistArticle(source.id, normalized);
        persistedCount += 1;
      }

      await markSourceFetched(source.id);
      console.log(`Source '${source.name}' processed ${persistedCount} items`);
    } catch (error) {
      workerStats.cycles_failed += 1;
      workerStats.last_error = error instanceof Error ? error.message : "Unknown ingestion error";
      console.error(`Failed ingestion for source '${source.name}'`, error);
    }
  }

  workerStats.cycles_success += 1;
  workerStats.last_cycle_finished_at = new Date().toISOString();
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runIngestionCycle();
    await pool.end();
    return;
  }

  startObservabilityServer();
  await runIngestionCycle();

  const intervalMs = env.INGESTION_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    void runIngestionCycle();
  }, intervalMs);

  console.log(`Ingestion worker started. Interval: ${env.INGESTION_INTERVAL_MINUTES} minutes`);
}

void main();
