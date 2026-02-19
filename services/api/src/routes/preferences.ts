import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { AppError, asyncHandler } from "../middleware/errors.js";
import {
  confirmUnsubscribeFromToken,
  createUnsubscribeLink
} from "../services/preferences-service.js";

export const preferencesRouter = Router();

const confirmSchema = z.object({
  token: z.string().min(20)
});

preferencesRouter.post(
  "/unsubscribe/request",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.auth!.userId;
    const result = await createUnsubscribeLink(userId);
    return res.json(result);
  })
);

preferencesRouter.post(
  "/unsubscribe/confirm",
  asyncHandler(async (req, res) => {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(400, "Invalid request");
    }

    const result = await confirmUnsubscribeFromToken(parsed.data.token);
    return res.json({
      message: "You have been unsubscribed from digest emails.",
      result
    });
  })
);

preferencesRouter.get(
  "/unsubscribe/confirm",
  asyncHandler(async (req, res) => {
    const token = req.query.token;
    if (typeof token !== "string" || token.length < 20) {
      throw new AppError(400, "Invalid request");
    }

    await confirmUnsubscribeFromToken(token);
    res.type("text/plain");
    return res.send("Unsubscribe successful. You will no longer receive digest emails.");
  })
);
