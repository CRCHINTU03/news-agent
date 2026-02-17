import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  const start = Date.now();

  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(
      JSON.stringify({
        level: "info",
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs
      })
    );
  });

  next();
}
