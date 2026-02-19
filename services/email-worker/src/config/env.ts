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
  REDIS_HOST: process.env.REDIS_HOST ?? "localhost",
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
  MAILHOG_SMTP_HOST: process.env.MAILHOG_SMTP_HOST ?? "localhost",
  MAILHOG_SMTP_PORT: Number(process.env.MAILHOG_SMTP_PORT ?? 1025),
  EMAIL_FROM: process.env.EMAIL_FROM ?? "no-reply@news-aggregator.local",
  API_PUBLIC_URL: process.env.API_PUBLIC_URL ?? "http://localhost:4000",
  UNSUBSCRIBE_TOKEN_SECRET: process.env.UNSUBSCRIBE_TOKEN_SECRET ?? "dev_unsubscribe_secret_change_me",
  EMAIL_WORKER_INTERVAL_MINUTES: Number(process.env.EMAIL_WORKER_INTERVAL_MINUTES ?? 15),
  EMAIL_DIGEST_MAX_ITEMS: Number(process.env.EMAIL_DIGEST_MAX_ITEMS ?? 20),
  EMAIL_HEALTH_PORT: Number(process.env.EMAIL_HEALTH_PORT ?? 4103)
};
