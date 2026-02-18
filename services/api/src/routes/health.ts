import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime_seconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

healthRouter.get("/metrics", (_req, res) => {
  const memory = process.memoryUsage();

  res.json({
    process_uptime_seconds: process.uptime(),
    process_rss_bytes: memory.rss,
    process_heap_total_bytes: memory.heapTotal,
    process_heap_used_bytes: memory.heapUsed,
    process_external_bytes: memory.external,
    timestamp: new Date().toISOString()
  });
});
