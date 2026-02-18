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
  MAILHOG_SMTP_HOST: process.env.MAILHOG_SMTP_HOST ?? "localhost",
  MAILHOG_SMTP_PORT: Number(process.env.MAILHOG_SMTP_PORT ?? 1025),
  EMAIL_FROM: process.env.EMAIL_FROM ?? "no-reply@news-aggregator.local",
  EMAIL_WORKER_INTERVAL_MINUTES: Number(process.env.EMAIL_WORKER_INTERVAL_MINUTES ?? 15),
  EMAIL_DIGEST_MAX_ITEMS: Number(process.env.EMAIL_DIGEST_MAX_ITEMS ?? 20)
};
