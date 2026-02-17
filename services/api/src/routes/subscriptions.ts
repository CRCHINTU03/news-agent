import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { AppError, asyncHandler } from "../middleware/errors.js";

export const subscriptionsRouter = Router();

const createSubscriptionSchema = z.object({
  topicId: z.coerce.number().int().positive(),
  locality: z.string().min(2).max(120),
  frequency: z.enum(["daily", "weekly"]).default(env.DEFAULT_DIGEST_FREQUENCY)
});

const updateSubscriptionSchema = z.object({
  locality: z.string().min(2).max(120).optional(),
  frequency: z.enum(["daily", "weekly"]).optional(),
  isActive: z.boolean().optional()
}).refine((payload) => Object.keys(payload).length > 0, {
  message: "At least one field is required"
});

subscriptionsRouter.get(
  "/subscriptions",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
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
  })
);

subscriptionsRouter.post(
  "/subscriptions",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parsed = createSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid request");
    }

    const userId = req.auth!.userId;
    const { topicId, locality, frequency } = parsed.data;

    const topicExists = await pool.query("SELECT id FROM topics WHERE id = $1", [topicId]);
    if (!topicExists.rowCount) {
      throw new AppError(404, "Topic not found");
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
        throw new AppError(409, "Subscription already exists");
      }
      throw error;
    }
  })
);

subscriptionsRouter.patch(
  "/subscriptions/:id",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "Invalid subscription id");
    }

    const parsed = updateSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid request");
    }

    const userId = req.auth!.userId;
    const fields: string[] = [];
    const values: unknown[] = [];

    if (parsed.data.locality !== undefined) {
      fields.push(`locality = $${values.length + 1}`);
      values.push(parsed.data.locality);
    }
    if (parsed.data.frequency !== undefined) {
      fields.push(`frequency = $${values.length + 1}`);
      values.push(parsed.data.frequency);
    }
    if (parsed.data.isActive !== undefined) {
      fields.push(`is_active = $${values.length + 1}`);
      values.push(parsed.data.isActive);
    }

    values.push(userId, id);

    const query = `
      UPDATE user_subscriptions
      SET ${fields.join(", ")}
      WHERE user_id = $${values.length - 1} AND id = $${values.length}
      RETURNING id, user_id, topic_id, locality, frequency, is_active, created_at
    `;

    const result = await pool.query(query, values);
    if (!result.rowCount) {
      throw new AppError(404, "Subscription not found");
    }

    return res.json({ subscription: result.rows[0] });
  })
);

subscriptionsRouter.delete(
  "/subscriptions/:id",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError(400, "Invalid subscription id");
    }

    const userId = req.auth!.userId;
    const result = await pool.query(
      `UPDATE user_subscriptions
       SET is_active = FALSE
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (!result.rowCount) {
      throw new AppError(404, "Subscription not found");
    }

    return res.status(204).send();
  })
);
