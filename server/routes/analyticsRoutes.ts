import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { getAssessmentHistory, getMoodStats } from "../db";

const router = Router();

// GET /api/mood/history — last 30 assessments
router.get("/history", requireAuth, (req: AuthRequest, res: Response): void => {
  const history = getAssessmentHistory(req.user!.userId, 30);
  res.json(history);
});

// GET /api/mood/stats — aggregated analytics
router.get("/stats", requireAuth, (req: AuthRequest, res: Response): void => {
  const stats = getMoodStats(req.user!.userId);

  // Compute mood label trend description
  const total = stats.total_assessments;
  const avg = stats.avg_score ?? 0;
  let trend = "stable";
  if (stats.weekly_trend.length >= 2) {
    const first = stats.weekly_trend[0].avg_score;
    const last = stats.weekly_trend[stats.weekly_trend.length - 1].avg_score;
    if (last < first - 1) trend = "improving";  // lower score = better
    else if (last > first + 1) trend = "declining";
  }

  // Convert score to wellness label
  const wellnessLabel =
    avg <= 7 ? "Thriving"
    : avg <= 15 ? "Doing Okay"
    : avg <= 22 ? "Feeling Strained"
    : "Struggling";

  res.json({
    ...stats,
    trend,
    wellness_label: wellnessLabel,
    insights: generateInsights(avg, total, stats.mood_counts),
  });
});

function generateInsights(avgScore: number, total: number, moodCounts: Array<{ mood: string; count: number }>): string[] {
  const insights: string[] = [];

  if (total === 0) {
    insights.push("Complete your first wellness check-in to see personalised insights.");
    return insights;
  }

  if (avgScore <= 7) {
    insights.push("You're consistently thriving — your wellbeing foundation is solid.");
    insights.push("Consider helping others through the community or journaling your wins.");
  } else if (avgScore <= 15) {
    insights.push("You're doing reasonably well. Small daily habits will help you reach the next level.");
    insights.push("Try a 5-minute breathing session each morning to start the day grounded.");
  } else if (avgScore <= 22) {
    insights.push("You've been under some strain lately. Prioritise rest and reduce screen time.");
    insights.push("The ambient sounds app can help create a calmer environment during stressful periods.");
  } else {
    insights.push("You're going through a tough time. Please be gentle with yourself.");
    insights.push("Journalling even 2-3 sentences a day can significantly reduce emotional burden.");
    insights.push("Consider reaching out to someone you trust — connection is powerful medicine.");
  }

  if (total >= 7) {
    insights.push(`You've completed ${total} check-ins — consistency like this is what drives real change.`);
  }

  const topMood = moodCounts[0];
  if (topMood) {
    insights.push(`Your most frequent state has been "${topMood.mood}" (${topMood.count} times).`);
  }

  return insights;
}

export default router;
