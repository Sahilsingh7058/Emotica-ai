import "dotenv/config";
import express from "express";
import cors from "cors";
import { saveAssessmentResponse } from "./db";
import { optionalAuth, AuthRequest } from "./middleware/requireAuth";
import authRoutes from "./routes/authRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import journalRoutes from "./routes/journalRoutes";
import streakRoutes from "./routes/streakRoutes";
import chatRoutes from "./routes/chatRoutes";
import habitRoutes from "./routes/habitRoutes";
import emotionAnalysisRoutes from "./routes/emotionAnalysisRoutes";

export function createServer() {
  const app = express();

  const isProd = process.env.NODE_ENV === "production";

  app.use(cors({
    origin: isProd
      ? (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean)
      : true,   // dev: allow all — Express runs as Vite middleware (same origin)
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Health check ──────────────────────────────────────────────────────────
  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "pong", version: "2.0.0" });
  });

  // ── Auth ──────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);

  // ── Analytics / Mood ─────────────────────────────────────────────────────
  app.use("/api/mood", analyticsRoutes);

  // ── Journal ───────────────────────────────────────────────────────────────
  app.use("/api/journal", journalRoutes);

  // ── Streaks + Usage ───────────────────────────────────────────────────────
  app.use("/api/streak", streakRoutes);

  // ── Chat ──────────────────────────────────────────────────────────────────
  app.use("/api/chat", chatRoutes);

  // ── Habits ────────────────────────────────────────────────────────────────
  app.use("/api/habits", habitRoutes);

  // ── Emotion Analysis ────────────────────────────────────────────────────
  app.use("/api/emotion", emotionAnalysisRoutes);

  // ── Assessment save (optionally attaches user from token) ─────────────────
  app.post("/api/assessment/save", optionalAuth, (req: AuthRequest, res) => {
    try {
      const { mood, description, suggestion, suggestedAppId, totalScore, answers } = req.body;

      if (!mood || !description || !suggestion || !Array.isArray(answers)) {
        res.status(400).json({ success: false, error: "Missing required fields" });
        return;
      }

      const id = saveAssessmentResponse({
        userId: req.user?.userId,
        mood,
        description,
        suggestion,
        suggestedAppId,
        totalScore,
        answers,
      });

      res.json({ success: true, id });
    } catch (error) {
      console.error("Failed to save assessment:", error);
      res.status(500).json({ success: false, error: "Failed to save assessment response" });
    }
  });

  return app;
}
