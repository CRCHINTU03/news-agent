import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../../.env");
loadEnv({ path: rootEnvPath });

export const env = {
  POSTGRES_HOST: process.env.POSTGRES_HOST ?? "localhost",
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT ?? 5433),
  POSTGRES_DB: process.env.POSTGRES_DB ?? "news_aggregator",
  POSTGRES_USER: process.env.POSTGRES_USER ?? "postgres",
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? "postgres",
  DIGEST_INTERVAL_MINUTES: Number(process.env.DIGEST_INTERVAL_MINUTES ?? 60),
  DIGEST_LOOKBACK_HOURS: Number(process.env.DIGEST_LOOKBACK_HOURS ?? 72),
  DIGEST_MAX_ITEMS: Number(process.env.DIGEST_MAX_ITEMS ?? 20),
  DIGEST_HEALTH_PORT: Number(process.env.DIGEST_HEALTH_PORT ?? 4102)
};
