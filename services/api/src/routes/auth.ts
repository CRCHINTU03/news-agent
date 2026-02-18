import { Router } from "express";
import { z } from "zod";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { AppError, asyncHandler } from "../middleware/errors.js";
import { loginUser, signupUser } from "../services/auth-service.js";

export const authRouter = Router();
const authRateLimit = createRateLimiter(20, 60_000);

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  timezone: z.string().default("UTC")
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post("/auth/signup", authRateLimit, asyncHandler(async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, "Invalid request");
  }

  const { email, password, timezone } = parsed.data;
  const user = await signupUser({ email, password, timezone });
  return res.status(201).json({ user });
}));

authRouter.post("/auth/login", authRateLimit, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, "Invalid request");
  }

  const { email, password } = parsed.data;
  const auth = await loginUser({ email, password });
  return res.json(auth);
}));
