import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../../.env");
loadEnv({ path: rootEnvPath });

const envSchema = z.object({
  API_PORT: z.coerce.number().default(4000),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default("news_aggregator"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  JWT_SECRET: z.string().min(10).default("dev_jwt_secret_change_me"),
  UNSUBSCRIBE_TOKEN_SECRET: z.string().min(10).default("dev_unsubscribe_secret_change_me"),
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  DEFAULT_DIGEST_FREQUENCY: z.enum(["daily", "weekly"]).default("daily")
});

export const env = envSchema.parse(process.env);
