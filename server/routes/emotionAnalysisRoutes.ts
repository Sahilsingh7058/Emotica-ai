import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { getJournalEntries, getChatHistory, saveEmotionAnalysis, getEmotionAnalyses } from "../db";

const router = Router();

router.post("/save", requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const { text, emotion, confidence, probabilities } = req.body;
    if (!text || !emotion || confidence == null || !probabilities) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }
    const id = saveEmotionAnalysis(req.user!.userId, text, emotion, confidence, probabilities);
    res.json({ success: true, id });
  } catch (error) {
    console.error("Failed to save emotion analysis:", error);
    res.status(500).json({ success: false, error: "Failed to save emotion analysis" });
  }
});

const ANALYSIS_DAYS = {
  week: 7,
  month: 30,
};

interface EmotionResult {
  emotion: string;
  confidence: number;
  probabilities: Record<string, number>;
}

interface AnalysisItem {
  id: number | string;
  source: "journal" | "chat" | "emotion_analysis";
  text: string;
  timestamp: string;
  mood_tag?: string | null;
}

interface AnalysisResponse {
  period: string;
  range: "week" | "month";
  total_texts: number;
  emotion_counts: Record<string, number>;
  dominant_emotion: string;
  dominant_confidence: number;
  daily_breakdown: Array<{
    date: string;
    emotions: Record<string, number>;
    dominant: string;
  }>;
  emotion_trend: Array<{
    date: string;
    emotion: string;
    count: number;
  }>;
}

async function batchPredict(texts: string[]): Promise<EmotionResult[]> {
  if (texts.length === 0) return [];
  try {
    const res = await fetch("http://127.0.0.1:8000/api/predict/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });
    if (!res.ok) throw new Error(`Prediction API returned ${res.status}`);
    const data = await res.json();
    return data.results as EmotionResult[];
  } catch {
    return [];
  }
}

router.get("/analysis", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const range = (req.query.range as string) === "month" ? "month" : "week";
    const days = ANALYSIS_DAYS[range];
    const userId = req.user!.userId;

    const journals = getJournalEntries(userId, 200);
    const chatMessages = getChatHistory(userId, 200);
    const savedAnalyses = getEmotionAnalyses(userId, 200);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const items: AnalysisItem[] = [
      ...journals
        .filter((j) => new Date(j.created_at) >= cutoff && j.content.trim().length > 3)
        .map((j) => ({
          id: j.id,
          source: "journal" as const,
          text: j.content,
          timestamp: j.created_at,
          mood_tag: j.mood_tag,
        })),
      ...chatMessages
        .filter((m) => m.sender === "user" && new Date(m.created_at) >= cutoff && m.text.trim().length > 3)
        .map((m) => ({
          id: m.id,
          source: "chat" as const,
          text: m.text,
          timestamp: m.created_at,
        })),
      ...savedAnalyses
        .filter((a) => new Date(a.created_at) >= cutoff && a.text.trim().length > 0)
        .map((a) => ({
          id: a.id,
          source: "emotion_analysis" as const,
          text: a.text,
          timestamp: a.created_at,
        })),
    ];

    items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (items.length === 0) {
      res.json({
        period: `${days}-day`,
        range,
        total_texts: 0,
        emotion_counts: {},
        dominant_emotion: "none",
        dominant_confidence: 0,
        daily_breakdown: [],
        emotion_trend: [],
      } satisfies AnalysisResponse);
      return;
    }

    const texts = items.map((i) => i.text);
    const predictions = await batchPredict(texts);

    const emotionCounts: Record<string, number> = {};
    const dateGroups: Record<string, { emotions: Record<string, number>; total: number }> = {};

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i];
      if (!pred) continue;
      const dateKey = items[i].timestamp.slice(0, 10);

      emotionCounts[pred.emotion] = (emotionCounts[pred.emotion] || 0) + 1;

      if (!dateGroups[dateKey]) dateGroups[dateKey] = { emotions: {}, total: 0 };
      dateGroups[dateKey].emotions[pred.emotion] = (dateGroups[dateKey].emotions[pred.emotion] || 0) + 1;
      dateGroups[dateKey].total += 1;
    }

    let dominantEmotion = "none";
    let dominantCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > dominantCount) {
        dominantCount = count;
        dominantEmotion = emotion;
      }
    }

    const dominantConfidence = predictions.length > 0
      ? Math.max(...predictions.filter(Boolean).map((p) => p!.confidence))
      : 0;

    const sortedDates = Object.keys(dateGroups).sort();
    const dailyBreakdown = sortedDates.map((date) => {
      const day = dateGroups[date];
      return {
        date,
        emotions: day.emotions,
        dominant: Object.entries(day.emotions).sort((a, b) => b[1] - a[1])[0][0],
      };
    });

    const emotionTrend = sortedDates.flatMap((date) =>
      Object.entries(dateGroups[date].emotions).map(([emotion, count]) => ({
        date,
        emotion,
        count,
      }))
    );

    const response: AnalysisResponse = {
      period: `${days}-day`,
      range,
      total_texts: predictions.filter(Boolean).length,
      emotion_counts: emotionCounts,
      dominant_emotion: dominantEmotion,
      dominant_confidence: Math.round(dominantConfidence * 100) / 100,
      daily_breakdown: dailyBreakdown,
      emotion_trend: emotionTrend,
    };

    res.json(response);
  } catch (error) {
    console.error("Emotion analysis error:", error);
    res.status(500).json({ error: "Failed to analyze emotions" });
  }
});

export default router;
