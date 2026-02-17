import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { env } from "../config/env.js";

export const subscriptionsRouter = Router();

const createSubscriptionSchema = z.object({
  topicId: z.coerce.number().int().positive(),
  locality: z.string().min(2).max(120),
  frequency: z.enum(["daily", "weekly"]).default(env.DEFAULT_DIGEST_FREQUENCY)
});

subscriptionsRouter.get(
  "/subscriptions",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const userId = req.auth!.userId;

    const result = await pool.query(
      `SELECT us.id, us.locality, us.frequency, us.is_active, t.id AS topic_id, t.name AS topic_name, t.slug AS topic_slug
       FROM user_subscriptions us
       JOIN topics t ON t.id = us.topic_id
       WHERE us.user_id = $1
       ORDER BY us.created_at DESC`,
      [userId]
    );

    return res.json({ subscriptions: result.rows });
  }
);

subscriptionsRouter.post(
  "/subscriptions",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    const parsed = createSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid request", issues: parsed.error.issues });
    }

    const userId = req.auth!.userId;
    const { topicId, locality, frequency } = parsed.data;

    const topicExists = await pool.query("SELECT id FROM topics WHERE id = $1", [topicId]);
    if (!topicExists.rowCount) {
      return res.status(404).json({ message: "Topic not found" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO user_subscriptions(user_id, topic_id, locality, frequency)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, topic_id, locality, frequency, is_active, created_at`,
        [userId, topicId, locality, frequency]
      );

      return res.status(201).json({ subscription: result.rows[0] });
    } catch (error: unknown) {
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        return res.status(409).json({ message: "Subscription already exists" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);
