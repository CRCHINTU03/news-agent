import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errors.js";
import {
  getAdminDigests,
  getAdminEmailEvents,
  getAdminEmailJobs,
  getAdminOverview,
  getAdminSources
} from "../services/admin-service.js";

export const adminRouter = Router();

adminRouter.get(
  "/admin/overview",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const overview = await getAdminOverview();
    return res.json({ overview });
  })
);

adminRouter.get(
  "/admin/sources",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const sources = await getAdminSources();
    return res.json({ sources });
  })
);

adminRouter.get(
  "/admin/digests",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const digests = await getAdminDigests();
    return res.json({ digests });
  })
);

adminRouter.get(
  "/admin/email-jobs",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const jobs = await getAdminEmailJobs();
    return res.json({ jobs });
  })
);

adminRouter.get(
  "/admin/email-events",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const events = await getAdminEmailEvents();
    return res.json({ events });
  })
);
