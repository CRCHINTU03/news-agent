import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errors.js";
import { createUser, findUserByEmail } from "../repositories/user-repository.js";

export async function signupUser(input: {
  email: string;
  password: string;
  timezone: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 10);

  try {
    return await createUser({
      email: input.email,
      passwordHash,
      timezone: input.timezone
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new AppError(409, "Email already exists");
    }
    throw error;
  }
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError(401, "Invalid credentials");
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: Number(user.id),
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      status: user.status,
      role: user.role,
      email_opt_out: user.email_opt_out
    }
  };
}
