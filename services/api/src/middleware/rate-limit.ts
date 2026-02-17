import type { NextFunction, Request, Response } from "express";

type CounterEntry = {
  count: number;
  resetAt: number;
};

const counters = new Map<string, CounterEntry>();

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const current = counters.get(key);

    if (!current || now > current.resetAt) {
      counters.set(key, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    if (current.count >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests"
      });
    }

    current.count += 1;
    counters.set(key, current);
    return next();
  };
}
