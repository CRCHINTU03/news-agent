import { Router } from "express";
import { asyncHandler } from "../middleware/errors.js";
import { getTopics } from "../services/topic-service.js";

export const topicsRouter = Router();

topicsRouter.get(
  "/topics",
  asyncHandler(async (_req, res) => {
    const topics = await getTopics();
    return res.json({ topics });
  })
);
