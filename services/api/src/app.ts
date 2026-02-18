import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { requestLogger } from "./middleware/request-logging.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { digestsRouter } from "./routes/digests.js";
import { healthRouter } from "./routes/health.js";
import { topicsRouter } from "./routes/topics.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use(healthRouter);
app.use(authRouter);
app.use(topicsRouter);
app.use(subscriptionsRouter);
app.use(digestsRouter);
app.use(adminRouter);
app.use(notFoundHandler);
app.use(errorHandler);
