import { env } from "../config/env.js";
import { AppError } from "../middleware/errors.js";
import { insertUnsubscribeEvent } from "../repositories/email-event-repository.js";
import { findUserById, markUserEmailOptOut } from "../repositories/user-repository.js";
import { buildUnsubscribeToken, verifyUnsubscribeToken } from "../utils/unsubscribe-token.js";

export async function createUnsubscribeLink(userId: number) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const token = buildUnsubscribeToken({
    userId,
    email: user.email,
    secret: env.UNSUBSCRIBE_TOKEN_SECRET
  });

  const unsubscribeUrl = `${env.API_PUBLIC_URL}/unsubscribe/confirm?token=${encodeURIComponent(token)}`;
  return { token, unsubscribeUrl };
}

export async function confirmUnsubscribeFromToken(token: string) {
  const payload = verifyUnsubscribeToken(token, env.UNSUBSCRIBE_TOKEN_SECRET);
  if (!payload) {
    throw new AppError(400, "Invalid or expired unsubscribe token");
  }

  const user = await findUserById(payload.uid);
  if (!user || user.email.toLowerCase() !== payload.em.toLowerCase()) {
    throw new AppError(400, "Invalid unsubscribe token payload");
  }

  const updated = await markUserEmailOptOut(payload.uid);
  if (!updated) {
    throw new AppError(404, "User not found");
  }

  if (!user.email_opt_out) {
    await insertUnsubscribeEvent(payload.uid, {
      source: "unsubscribe_token",
      email: user.email
    });
  }

  return {
    userId: payload.uid,
    email: user.email,
    email_opt_out: true
  };
}
