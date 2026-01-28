import express from "express";
import { redis } from "../lib/redis";
import { getNow } from "../lib/time";
import crypto from "crypto";
 
const router = express.Router();
 
router.post("/", async (req, res) => {
  const { content, ttl_seconds, max_views } = req.body;
 
  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Invalid content" });
  }
 
  const id = crypto.randomUUID();
  const now = getNow(req);
 
  const paste = {
    id,
    content,
    createdAt: now,
    expiresAt: ttl_seconds ? now + ttl_seconds * 1000 : null,
    maxViews: max_views ?? null,
    views: 0
  };
 
  await redis.set(`paste:${id}`, JSON.stringify(paste));
 
  console.log("Created paste:", {
    id,
    createdAt: paste.createdAt,
    expiresAt: paste.expiresAt,
    maxViews: paste.maxViews
  });
 
  res.json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`
  });
});
 
export default router;
