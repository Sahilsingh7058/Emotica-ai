import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { getStreak, updateStreak, logAppUsage } from "../db";

const router = Router();

// GET /api/streak
router.get("/", requireAuth, (req: AuthRequest, res: Response): void => {
  const streak = getStreak(req.user!.userId);
  res.json(streak ?? { current_streak: 0, longest_streak: 0, total_days: 0 });
});

// POST /api/streak/checkin  — manual daily check-in
router.post("/checkin", requireAuth, (req: AuthRequest, res: Response): void => {
  updateStreak(req.user!.userId);
  res.json(getStreak(req.user!.userId));
});

// POST /api/usage  — log an app open
router.post("/usage", requireAuth, (req: AuthRequest, res: Response): void => {
  const { appId, appName, durationSeconds } = req.body;
  if (!appId || !appName) { res.status(400).json({ error: "appId and appName required" }); return; }
  logAppUsage(req.user!.userId, appId, appName, durationSeconds ?? 0);
  res.json({ success: true });
});

export default router;
