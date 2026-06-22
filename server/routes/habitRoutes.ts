import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { getHabits, saveHabit, updateHabitProgress, deleteHabit as deleteDbHabit } from "../db";

const router = Router();

// GET /api/habits
router.get("/", requireAuth, (req: AuthRequest, res: Response): void => {
  const dbHabits = getHabits(req.user!.userId);
  // Parse checks JSON string to array
  const habits = dbHabits.map(h => ({
    id: h.id,
    name: h.name,
    emoji: h.emoji,
    streak: h.streak,
    lastChecked: h.last_checked,
    checks: JSON.parse(h.checks)
  }));
  res.json(habits);
});

// POST /api/habits
router.post("/", requireAuth, (req: AuthRequest, res: Response): void => {
  const { id, name, emoji } = req.body;
  if (!id || !name?.trim() || !emoji) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  saveHabit(req.user!.userId, { id, name: name.trim(), emoji });
  res.status(201).json({ id, name: name.trim(), emoji, streak: 0, lastChecked: "", checks: [] });
});

// PUT /api/habits/:id/progress
router.put("/:id/progress", requireAuth, (req: AuthRequest, res: Response): void => {
  const { streak, lastChecked, checks } = req.body;
  if (streak === undefined || lastChecked === undefined || !Array.isArray(checks)) {
    res.status(400).json({ error: "Missing progress fields" });
    return;
  }
  updateHabitProgress(
    req.user!.userId,
    req.params.id,
    streak,
    lastChecked,
    JSON.stringify(checks)
  );
  res.json({ success: true });
});

// DELETE /api/habits/:id
router.delete("/:id", requireAuth, (req: AuthRequest, res: Response): void => {
  deleteDbHabit(req.user!.userId, req.params.id);
  res.json({ success: true });
});

export default router;
