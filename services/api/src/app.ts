import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { topicsRouter } from "./routes/topics.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use(authRouter);
app.use(topicsRouter);
app.use(subscriptionsRouter);
