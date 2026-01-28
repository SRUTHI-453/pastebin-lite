import { Router, Request, Response } from 'express';
import { Redis } from '@upstash/redis';

const router = Router();
const redis = Redis.fromEnv();

router.get('/healthz', async (req: Request, res: Response) => {
  try {
    await redis.ping();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

export default router;
