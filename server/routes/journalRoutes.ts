import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from "../db";

const router = Router();

// GET /api/journal
router.get("/", requireAuth, (req: AuthRequest, res: Response): void => {
  const entries = getJournalEntries(req.user!.userId);
  res.json(entries);
});

// POST /api/journal
router.post("/", requireAuth, (req: AuthRequest, res: Response): void => {
  const { content, mood_tag } = req.body;
  if (!content?.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }
  const id = createJournalEntry(req.user!.userId, content.trim(), mood_tag);
  res.status(201).json({ id, content: content.trim(), mood_tag: mood_tag ?? null });
});

// PUT /api/journal/:id
router.put("/:id", requireAuth, (req: AuthRequest, res: Response): void => {
  const { content, mood_tag } = req.body;
  if (!content?.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }
  const updated = updateJournalEntry(Number(req.params.id), req.user!.userId, content.trim(), mood_tag);
  if (!updated) { res.status(404).json({ error: "Entry not found" }); return; }
  res.json({ success: true });
});

// DELETE /api/journal/:id
router.delete("/:id", requireAuth, (req: AuthRequest, res: Response): void => {
  const deleted = deleteJournalEntry(Number(req.params.id), req.user!.userId);
  if (!deleted) { res.status(404).json({ error: "Entry not found" }); return; }
  res.json({ success: true });
});

export default router;
