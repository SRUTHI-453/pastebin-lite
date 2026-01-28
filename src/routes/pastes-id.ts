import express from "express";
import { redis } from "../lib/redis";
import { getNow } from "../lib/time";
import type { Paste } from "../types";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const raw = await redis.get(`paste:${id}`);

  if (!raw || typeof raw !== "string") {
    return res.status(404).json({ error: "Not found" });
  }

  const paste: Paste = JSON.parse(raw);
  const now = getNow(req);

  if (paste.expiresAt && now >= paste.expiresAt) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  paste.views++;
  await redis.set(`paste:${id}`, JSON.stringify(paste));

  res.json({
    content: paste.content,
    remaining_views: paste.maxViews === null ? null : paste.maxViews - paste.views,
    expires_at: paste.expiresAt ? new Date(paste.expiresAt).toISOString() : null
  });
});

export default router;
