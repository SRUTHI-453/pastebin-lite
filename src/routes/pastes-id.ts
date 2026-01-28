import express from "express";
import { redis } from "../lib/redis";
import { getNow } from "../lib/time";
import type { Paste } from "../types";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const raw = await redis.get(`paste:${id}`);

  if (!raw) {
    return res.status(404).json({ error: "Not found" });
  }

  const paste = raw as Paste;

  const now = Date.now();

  console.log("NOW:", now);
  console.log("EXPIRES AT:", paste.expiresAt);
  console.log("VIEWS:", paste.views, "MAX:", paste.maxViews);

  // Check if paste has expired (TTL)
  if (paste.expiresAt && now >= paste.expiresAt) {
    // Delete the expired paste
    await redis.del(`paste:${id}`);
    return res.status(404).json({ error: "Expired" });
  }

  // Check if view limit has been reached BEFORE incrementing
  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    // Delete the paste that exceeded view limit
    await redis.del(`paste:${id}`);
    return res.status(404).json({ error: "View limit exceeded" });
  }

  // Increment views
  paste.views++;

  // Check if this was the last allowed view
  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    // This was the last view, delete the paste after serving it
    await redis.del(`paste:${id}`);
  } else {
    // Save updated view count
    await redis.set(`paste:${id}`, JSON.stringify(paste));
  }

  res.json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null ? null : paste.maxViews - paste.views,
    expires_at: paste.expiresAt
      ? new Date(paste.expiresAt).toISOString()
      : null,
  });
});

export default router;
