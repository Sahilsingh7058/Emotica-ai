import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { getChatHistory, saveChatMessage, clearChatHistory } from "../db";

const router = Router();

// GET /api/chat - get chat history
router.get("/", requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const history = getChatHistory(req.user!.userId);
    res.json({ success: true, messages: history });
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// POST /api/chat - save a message
router.post("/", requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { sender, text } = req.body;
    if (!sender || !text) {
      res.status(400).json({ error: "Sender and text are required" });
      return;
    }
    if (sender !== "user" && sender !== "assistant") {
      res.status(400).json({ error: "Sender must be 'user' or 'assistant'" });
      return;
    }
    const id = saveChatMessage(req.user!.userId, sender, text);
    res.json({ success: true, id });
  } catch (error) {
    console.error("Failed to save chat message:", error);
    res.status(500).json({ error: "Failed to save chat message" });
  }
});

// DELETE /api/chat - clear chat history
router.delete("/", requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    clearChatHistory(req.user!.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to clear chat history:", error);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

export default router;
