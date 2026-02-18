import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import { getDigestHistory } from "../services/digest-service.js";

export const digestsRouter = Router();

digestsRouter.get(
  "/digests",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.auth!.userId;
    const digests = await getDigestHistory(userId, 20);
    return res.json({ digests });
  })
);
