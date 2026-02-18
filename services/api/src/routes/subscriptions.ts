import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { AppError, asyncHandler } from "../middleware/errors.js";
import { env } from "../config/env.js";
import {
  addSubscription,
  getSubscriptions,
  patchSubscription,
  removeSubscription
} from "../services/subscription-service.js";

export const subscriptionsRouter = Router();

const createSubscriptionSchema = z.object({
  topicId: z.coerce.number().int().positive(),
  locality: z.string().min(2).max(120),
  frequency: z.enum(["daily", "weekly"]).default(env.DEFAULT_DIGEST_FREQUENCY)
});

const updateSubscriptionSchema = z
  .object({
    locality: z.string().min(2).max(120).optional(),
    frequency: z.enum(["daily", "weekly"]).optional(),
    isActive: z.boolean().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required"
  });

subscriptionsRouter.get(
  "/subscriptions",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.auth!.userId;
    const subscriptions = await getSubscriptions(userId);
    return res.json({ subscriptions });
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
    const subscription = await addSubscription({ userId, topicId, locality, frequency });

    return res.status(201).json({ subscription });
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
    const subscription = await patchSubscription({
      subscriptionId: id,
      userId,
      locality: parsed.data.locality,
      frequency: parsed.data.frequency,
      isActive: parsed.data.isActive
    });

    return res.json({ subscription });
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
    await removeSubscription(id, userId);

    return res.status(204).send();
  })
);
