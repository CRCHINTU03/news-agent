import { Router } from "express";
import { pool } from "../db/pool.js";

export const topicsRouter = Router();

topicsRouter.get("/topics", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, name, slug FROM topics ORDER BY name ASC"
  );

  return res.json({ topics: result.rows });
});
