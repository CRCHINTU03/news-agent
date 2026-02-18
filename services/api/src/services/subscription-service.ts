import { AppError } from "../middleware/errors.js";
import {
  createSubscription,
  deactivateSubscription,
  listSubscriptionsByUser,
  updateSubscription
} from "../repositories/subscription-repository.js";
import { topicExists } from "../repositories/topic-repository.js";

export async function getSubscriptions(userId: number) {
  return listSubscriptionsByUser(userId);
}

export async function addSubscription(params: {
  userId: number;
  topicId: number;
  locality: string;
  frequency: "daily" | "weekly";
}) {
  const exists = await topicExists(params.topicId);
  if (!exists) {
    throw new AppError(404, "Topic not found");
  }

  try {
    return await createSubscription(params);
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new AppError(409, "Subscription already exists");
    }
    throw error;
  }
}

export async function patchSubscription(params: {
  subscriptionId: number;
  userId: number;
  locality?: string;
  frequency?: "daily" | "weekly";
  isActive?: boolean;
}) {
  const updated = await updateSubscription(params);
  if (!updated) {
    throw new AppError(404, "Subscription not found");
  }

  return updated;
}

export async function removeSubscription(subscriptionId: number, userId: number) {
  const removed = await deactivateSubscription(subscriptionId, userId);
  if (!removed) {
    throw new AppError(404, "Subscription not found");
  }
}
