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
  INGESTION_INTERVAL_MINUTES: Number(process.env.INGESTION_INTERVAL_MINUTES ?? 15),
  INGESTION_MAX_ITEMS_PER_SOURCE: Number(process.env.INGESTION_MAX_ITEMS_PER_SOURCE ?? 30)
};
