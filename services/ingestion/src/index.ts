import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { fetchRssItems } from "./fetchers/rss.js";
import { normalizeRssItem } from "./processors/normalize.js";
import { persistArticle } from "./processors/persist.js";
import { listActiveSources, markSourceFetched } from "./processors/sources.js";

async function runIngestionCycle() {
  const sources = await listActiveSources();

  if (!sources.length) {
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
      console.error(`Failed ingestion for source '${source.name}'`, error);
    }
  }
}

async function main() {
  const runOnce = process.argv.includes("--once");

  if (runOnce) {
    await runIngestionCycle();
    await pool.end();
    return;
  }

  await runIngestionCycle();

  const intervalMs = env.INGESTION_INTERVAL_MINUTES * 60 * 1000;
  setInterval(() => {
    void runIngestionCycle();
  }, intervalMs);

  console.log(`Ingestion worker started. Interval: ${env.INGESTION_INTERVAL_MINUTES} minutes`);
}

void main();
