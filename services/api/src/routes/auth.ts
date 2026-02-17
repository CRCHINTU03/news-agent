import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { AppError, asyncHandler } from "../middleware/errors.js";

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
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users(email, password_hash, timezone)
       VALUES ($1, $2, $3)
       RETURNING id, email, timezone, status, created_at`,
      [email.toLowerCase(), passwordHash, timezone]
    );

    return res.status(201).json({ user: result.rows[0] });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new AppError(409, "Email already exists");
    }
    throw error;
  }
}));

authRouter.post("/auth/login", authRateLimit, asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, "Invalid request");
  }

  const { email, password } = parsed.data;
  const result = await pool.query(
    `SELECT id, email, password_hash, timezone, status
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (!result.rowCount) {
    throw new AppError(401, "Invalid credentials");
  }

  const user = result.rows[0] as {
    id: number;
    email: string;
    password_hash: string;
    timezone: string;
    status: string;
  };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      status: user.status
    }
  });
}));
