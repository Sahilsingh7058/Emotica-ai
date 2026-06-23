import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { useAuth, useApiFetch } from "@/context/AuthContext";
import { Loader } from "lucide-react";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

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

const EMOTION_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  joy: { emoji: "😊", color: "#10b981", label: "Joy" },
  sadness: { emoji: "😢", color: "#3b82f6", label: "Sadness" },
  anger: { emoji: "😤", color: "#ef4444", label: "Anger" },
  fear: { emoji: "😨", color: "#a855f7", label: "Fear" },
  love: { emoji: "❤️", color: "#ec4899", label: "Love" },
  surprise: { emoji: "😲", color: "#fbbf24", label: "Surprise" },
};

const EMOTION_COLORS = Object.fromEntries(
  Object.entries(EMOTION_CONFIG).map(([k, v]) => [k, v.color])
);

const ORDERED_EMOTIONS = Object.keys(EMOTION_CONFIG);

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-2xl bg-white/5 animate-pulse ${className}`} />;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-extrabold" style={{ color: color ?? "white" }}>{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function EmotionAnalysis() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const [range, setRange] = useState<"week" | "month">("week");
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/"); return; }

    setLoading(true);
    setError(null);

    apiFetch<AnalysisResponse>(`/api/emotion/analysis?range=${range}`)
      .then(setData)
      .catch(() => setError("Could not load emotion analysis. Please try again."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, range]);

  const emotionEntries = data
    ? Object.entries(data.emotion_counts)
        .sort((a, b) => b[1] - a[1])
    : [];

  const barData = emotionEntries.map(([emotion, count]) => ({
    emotion,
    count,
    color: EMOTION_COLORS[emotion] ?? "#8b5cf6",
    emoji: EMOTION_CONFIG[emotion]?.emoji ?? "❓",
  }));

  const trendEmotions = data
    ? [...new Set(data.emotion_trend.map(t => t.emotion))]
        .sort((a, b) => (ORDERED_EMOTIONS.indexOf(a) - ORDERED_EMOTIONS.indexOf(b)))
    : [];

  const trendDates = data
    ? [...new Set(data.emotion_trend.map(t => t.date))].sort()
    : [];

  const areaData = trendDates.map(date => {
    const point: Record<string, string | number> = { date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
    trendEmotions.forEach(emotion => {
      const found = data?.emotion_trend.find(t => t.date === date && t.emotion === emotion);
      point[emotion] = found?.count ?? 0;
    });
    return point;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Emotion Analysis
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold"
                style={{ background: "linear-gradient(135deg, #fff, #d8b4fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Emotion Analysis
              </h1>
              <p className="mt-2 text-white/40 text-sm">Understand the emotions detected in your texts over time.</p>
            </div>
            <div className="flex gap-2 p-1 rounded-2xl border border-white/10 bg-white/5 self-start">
              {(["week", "month"] as const).map(r => (
                <button key={r}
                  onClick={() => setRange(r)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    range === r
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {r === "week" ? "Weekly" : "Monthly"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="rounded-2xl px-5 py-4 mb-8 border border-red-500/20 bg-red-500/10 text-red-300 text-sm">{error}</div>
        )}

        {loading ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonBlock className="h-64" />
              <SkeletonBlock className="h-64" />
            </div>
            <SkeletonBlock className="h-48" />
          </motion.div>
        ) : !data || emotionEntries.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 rounded-3xl border border-white/8"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <span className="text-6xl mb-6">📊</span>
            <h3 className="text-xl font-bold text-white mb-2">No Emotion Data Yet</h3>
            <p className="text-white/40 text-sm text-center max-w-md">
              Start typing in the Emotion Analyzer to see your emotional patterns over time.
            </p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            {/* ── Stat cards ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Texts Analyzed" value={data.total_texts} color="#60a5fa" />
              <StatCard label="Dominant Emotion"
                value={`${EMOTION_CONFIG[data.dominant_emotion]?.emoji ?? "❓"} ${EMOTION_CONFIG[data.dominant_emotion]?.label ?? data.dominant_emotion}`}
                color={EMOTION_COLORS[data.dominant_emotion] ?? "#a855f7"} />
              <StatCard label="Confidence"
                value={`${(data.dominant_confidence * 100).toFixed(1)}%`}
                sub={`top emotion: ${data.dominant_emotion}`}
                color="#10b981" />
              <StatCard label="Days of Data"
                value={data.daily_breakdown.length}
                sub={range === "week" ? "past 7 days" : "past 30 days"}
                color="#f59e0b" />
            </motion.div>

            {/* ── Emotion Distribution + Trend row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emotion distribution bar chart */}
              <motion.div variants={itemVariants}
                className="rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-white font-bold mb-1">Emotion Distribution</p>
                <p className="text-white/35 text-xs mb-5">Number of texts per detected emotion</p>
                <ResponsiveContainer width="100%" height={Math.max(180, barData.length * 40)}>
                  <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="emotion"
                      tick={({ x, y, payload }) => {
                        const emoji = EMOTION_CONFIG[payload.value]?.emoji ?? "❓";
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={0} dy={4} textAnchor="end" fill="rgba(255,255,255,0.7)" fontSize={11}>
                              {`${emoji} ${EMOTION_CONFIG[payload.value]?.label ?? payload.value}`}
                            </text>
                          </g>
                        );
                      }}
                      width={120} axisLine={false} tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ background: "rgba(13,9,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: 12 }}
                      labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                      formatter={(value: number, name: string, props: any) => [value, props.payload.emotion]}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Emotion trend area chart */}
              <motion.div variants={itemVariants}
                className="rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-white font-bold mb-1">Emotion Trend</p>
                <p className="text-white/35 text-xs mb-5">How emotions change over time</p>
                {areaData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-white/25 text-sm">Not enough data for a trend yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        {trendEmotions.map(emotion => (
                          <linearGradient key={emotion} id={`grad_${emotion}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={EMOTION_COLORS[emotion] ?? "#8b5cf6"} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={EMOTION_COLORS[emotion] ?? "#8b5cf6"} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "rgba(13,9,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: 12 }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                      />
                      {trendEmotions.map(emotion => (
                        <Area key={emotion} type="monotone" dataKey={emotion} stackId="1"
                          stroke={EMOTION_COLORS[emotion] ?? "#8b5cf6"} strokeWidth={1.5}
                          fill={`url(#grad_${emotion})`} dot={false} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  {trendEmotions.map(emotion => (
                    <div key={emotion} className="flex items-center gap-1.5 text-xs text-white/50">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: EMOTION_COLORS[emotion] ?? "#8b5cf6" }} />
                      {EMOTION_CONFIG[emotion]?.emoji} {EMOTION_CONFIG[emotion]?.label ?? emotion}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Daily breakdown ── */}
            <motion.div variants={itemVariants}
              className="rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
              <p className="text-white font-bold mb-5">Daily Breakdown</p>
              <div className="space-y-3">
                {data.daily_breakdown.map(day => {
                  const domColor = EMOTION_COLORS[day.dominant] ?? "#8b5cf6";
                  const domEmoji = EMOTION_CONFIG[day.dominant]?.emoji ?? "❓";
                  const total = Object.values(day.emotions).reduce((a, b) => a + b, 0);
                  return (
                    <motion.div key={day.date} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="rounded-2xl p-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/70 text-sm font-semibold">{formatDate(day.date)}</span>
                        <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: domColor }}>
                          {domEmoji} {EMOTION_CONFIG[day.dominant]?.label ?? day.dominant}
                        </span>
                      </div>
                      <div className="flex gap-1.5 h-2 rounded-full overflow-hidden bg-white/5">
                        {Object.entries(day.emotions)
                          .sort((a, b) => b[1] - a[1])
                          .map(([emotion, count]) => (
                            <div key={emotion}
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(count / total) * 100}%`,
                                background: EMOTION_COLORS[emotion] ?? "#8b5cf6",
                              }}
                            />
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {Object.entries(day.emotions)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 4)
                          .map(([emotion, count]) => (
                            <span key={emotion} className="text-xs text-white/40">
                              {EMOTION_CONFIG[emotion]?.emoji ?? "❓"} {EMOTION_CONFIG[emotion]?.label ?? emotion}: {count}
                            </span>
                          ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
