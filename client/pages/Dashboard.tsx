import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { useAuth, useApiFetch } from "@/context/AuthContext";
import { Sparkles, X, Loader, Check } from "lucide-react";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface Option { text: string }
interface Question { id: number; question: string; options: Option[] }
interface Result {
  mood: string;
  description: string;
  color: string;
  suggestion: string;
  suggestedAppId?: string;
  totalScore?: number;
}

const moodConfig: Record<string, { emoji: string; accent: string; glow: string }> = {
  "Thriving": { emoji: "🌟", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  "Doing Okay": { emoji: "🌤️", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  "Feeling Strained": { emoji: "🌊", accent: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
  "Struggling": { emoji: "💜", accent: "#a855f7", glow: "rgba(168,85,247,0.3)" },
};

interface MoodDataPoint { date: string; avg_score: number }
interface MoodCount { mood: string; count: number }
interface AppUsage { app_id: string; app_name: string; opens: number }
interface Stats {
  avg_score: number | null;
  total_assessments: number;
  mood_counts: MoodCount[];
  weekly_trend: MoodDataPoint[];
  top_apps: AppUsage[];
  trend: string;
  wellness_label: string;
  insights: string[];
}
interface Streak { current_streak: number; longest_streak: number; total_days: number }

const MOOD_COLORS: Record<string, string> = {
  "Thriving": "#10b981",
  "Doing Okay": "#f59e0b",
  "Feeling Strained": "#3b82f6",
  "Struggling": "#a855f7",
};

const APP_COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#e11d48"];

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

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/5 animate-pulse ${className}`} />
  );
}

// Invert score so higher chart value = better wellness
function invertScore(score: number) { return Math.max(0, 30 - score); }

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Daily check-in state
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinQuestions, setCheckinQuestions] = useState<Question[]>([]);
  const [checkinCurrentIndex, setCheckinCurrentIndex] = useState(0);
  const [checkinAnswers, setCheckinAnswers] = useState<string[]>([]);
  const [checkinSelectedOption, setCheckinSelectedOption] = useState<string | null>(null);
  const [checkinResult, setCheckinResult] = useState<Result | null>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);

  const startCheckin = async () => {
    setCheckinLoading(true);
    setCheckinError(null);
    setShowCheckin(true);
    try {
      const response = await fetch("/api/assessment/daily-questions");
      if (!response.ok) throw new Error("Could not start assessment. Please try again.");
      const data: Question[] = await response.json();
      setCheckinQuestions(data);
      setCheckinCurrentIndex(0);
      setCheckinAnswers([]);
      setCheckinResult(null);
      setCheckinSelectedOption(null);
    } catch (err: any) {
      setCheckinError(err.message || "Failed to load check-in questions.");
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckinAnswerSelect = (answer: string) => {
    setCheckinSelectedOption(answer);
    setTimeout(() => {
      const newAnswers = [...checkinAnswers, answer];
      setCheckinAnswers(newAnswers);
      setCheckinSelectedOption(null);
      if (checkinCurrentIndex < checkinQuestions.length - 1) {
        setCheckinCurrentIndex(checkinCurrentIndex + 1);
      } else {
        submitCheckin(newAnswers);
      }
    }, 300);
  };

  const submitCheckin = async (finalAnswers: string[]) => {
    setCheckinSubmitting(true);
    setCheckinError(null);
    try {
      const response = await fetch("/api/assessment/daily-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!response.ok) throw new Error("Failed to score check-in.");
      const data = await response.json();
      setCheckinResult(data);

      await apiFetch("/api/assessment/save", {
        method: "POST",
        body: JSON.stringify({
          mood: data.mood,
          description: data.description,
          suggestion: data.suggestion,
          suggestedAppId: data.suggestedAppId,
          totalScore: data.totalScore,
          answers: finalAnswers,
        }),
      });

      const [s, str] = await Promise.all([
        apiFetch<Stats>("/api/mood/stats"),
        apiFetch<Streak>("/api/streak"),
      ]);
      setStats(s);
      setStreak(str);
    } catch (err: any) {
      setCheckinError(err.message || "Failed to submit check-in.");
    } finally {
      setCheckinSubmitting(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate("/"); return; }

    Promise.all([
      apiFetch<Stats>("/api/mood/stats"),
      apiFetch<Streak>("/api/streak"),
    ])
      .then(([s, str]) => { setStats(s); setStreak(str); })
      .catch(() => setError("Could not load your dashboard. Please try again."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  const trendData = stats?.weekly_trend.map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    wellness: Math.round(invertScore(d.avg_score)),
  })) ?? [];

  const wellnessColor = MOOD_COLORS[stats?.wellness_label ?? ""] ?? "#a855f7";

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      {/* Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              Your Wellness Dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold"
              style={{ background: "linear-gradient(135deg, #fff, #d8b4fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Hi, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 text-white/40 text-sm">Here's how your mental wellness journey is looking.</p>
          </div>
          <motion.button
            onClick={startCheckin}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-lg border border-purple-400/20 self-start md:self-auto"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            <span>🧠</span>
            <span>Daily Check-in</span>
            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
          </motion.button>
        </motion.div>

        {error && (
          <div className="rounded-2xl px-5 py-4 mb-8 border border-red-500/20 bg-red-500/10 text-red-300 text-sm">{error}</div>
        )}

        {/* ── Stats row ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Current Streak" value={`${streak?.current_streak ?? 0} 🔥`} sub="consecutive days" color="#f59e0b" />
            <StatCard label="Longest Streak" value={`${streak?.longest_streak ?? 0} days`} sub="personal best" color="#a855f7" />
            <StatCard label="Check-ins Done" value={stats?.total_assessments ?? 0} sub="total assessments" color="#60a5fa" />
            <StatCard label="Overall State" value={stats?.wellness_label ?? "—"} sub={`avg score ${(stats?.avg_score ?? 0).toFixed(1)}`} color={wellnessColor} />
          </div>
        )}

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Mood trend area chart */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-1">Wellness Trend (30 days)</p>
            <p className="text-white/35 text-xs mb-5">Higher = feeling better</p>

            {loading ? (
              <SkeletonBlock className="h-48" />
            ) : trendData.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-white/25 text-sm">
                <span className="text-3xl mb-3">📈</span>
                <p>Complete check-ins to see your trend.</p>
                <Link to="/" className="mt-3 text-purple-400 text-xs hover:text-purple-300">Take assessment →</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 30]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "rgba(13,9,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: 12 }}
                    labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  />
                  <Area type="monotone" dataKey="wellness" stroke="#a855f7" strokeWidth={2} fill="url(#wellnessGrad)" dot={{ fill: "#a855f7", r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Mood distribution */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-5">Mood Distribution</p>
            {loading ? (
              <SkeletonBlock className="h-48" />
            ) : !stats?.mood_counts.length ? (
              <div className="h-48 flex items-center justify-center text-white/25 text-sm text-center">No data yet</div>
            ) : (
              <div className="space-y-3">
                {stats.mood_counts.map((m) => {
                  const total = stats.total_assessments;
                  const pct = Math.round((m.count / total) * 100);
                  return (
                    <div key={m.mood}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">{m.mood}</span>
                        <span className="text-white/40">{m.count}x</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ background: MOOD_COLORS[m.mood] ?? "#a855f7" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── App usage + Insights row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top apps */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-5">Most Used Wellness Apps</p>
            {loading ? (
              <SkeletonBlock className="h-40" />
            ) : !stats?.top_apps.length ? (
              <div className="h-40 flex flex-col items-center justify-center text-white/25 text-sm text-center">
                <span className="text-3xl mb-3">🔮</span>
                <p>Open some apps to see your usage.</p>
                <Link to="/smallapps" className="mt-3 text-purple-400 text-xs hover:text-purple-300">Browse apps →</Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.top_apps} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="app_name" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(13,9,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: 12 }} />
                  <Bar dataKey="opens" radius={[0, 6, 6, 0]}>
                    {stats.top_apps.map((_, i) => <Cell key={i} fill={APP_COLORS[i % APP_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* AI Insights */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-5">Personalised Insights ✨</p>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-8" />)}</div>
            ) : (
              <div className="space-y-3">
                {(stats?.insights ?? ["Complete your first check-in to get insights."]).map((insight, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-3 rounded-xl px-4 py-3 border border-white/6" style={{ background: "rgba(168,85,247,0.07)" }}>
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">→</span>
                    <p className="text-white/70 text-sm leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Quick actions ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Check-in", icon: "🧠", onClick: startCheckin },
            { label: "Journal", icon: "✍️", link: "/journal" },
            { label: "Breathe", icon: "🌬️", link: "/apps/breathing" },
            { label: "All Apps", icon: "🔮", link: "/smallapps" },
          ].map((a) => (
            a.link ? (
              <Link key={a.label} to={a.link}>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                  className="rounded-2xl p-4 text-center border border-white/8 hover:border-purple-500/30 transition-all cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="text-2xl mb-2">{a.icon}</div>
                  <p className="text-white/60 text-sm font-semibold">{a.label}</p>
                </motion.div>
              </Link>
            ) : (
              <motion.div key={a.label} onClick={a.onClick} whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}
                className="rounded-2xl p-4 text-center border border-white/8 hover:border-purple-500/30 transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="text-2xl mb-2">{a.icon}</div>
                <p className="text-white/60 text-sm font-semibold">{a.label}</p>
              </motion.div>
            )
          ))}
        </motion.div>
      </div>

      {/* Daily Check-in Modal Overlay */}
      <AnimatePresence>
        {showCheckin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
              <div className="absolute bottom-1/3 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-2xl bg-[#0b0c16]/95 border border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setShowCheckin(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 p-2 rounded-full hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {checkinLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-white/60 text-lg">Loading your daily check-in questions...</p>
                </div>
              ) : checkinSubmitting ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                  <p className="text-white/60 text-lg">Analyzing your responses...</p>
                </div>
              ) : checkinError ? (
                <div className="text-center py-8">
                  <div className="text-red-400 text-5xl mb-4">⚠️</div>
                  <h3 className="text-xl font-bold text-white mb-2">Check-in Error</h3>
                  <p className="text-white/50 text-sm mb-6">{checkinError}</p>
                  <button
                    onClick={startCheckin}
                    className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all"
                  >
                    Try Again
                  </button>
                </div>
              ) : checkinResult ? (
                // Result screen
                <div className="text-center">
                  <motion.div
                    className="text-7xl mb-4"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    {moodConfig[checkinResult.mood]?.emoji || "💜"}
                  </motion.div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Your Day's Check-in</p>
                  <h2 className="text-3xl font-extrabold mb-4" style={{ color: checkinResult.color }}>
                    {checkinResult.mood}
                  </h2>
                  <p className="text-white/70 leading-relaxed mb-8 max-w-md mx-auto">
                    {checkinResult.description}
                  </p>

                  {checkinResult.suggestedAppId && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowCheckin(false);
                        navigate(`/smallapps?highlight=${checkinResult.suggestedAppId}`);
                      }}
                      className="cursor-pointer rounded-2xl p-5 text-left mb-6 border transition-all duration-200"
                      style={{
                        background: moodConfig[checkinResult.mood]?.glow || "rgba(168,85,247,0.15)",
                        borderColor: `${checkinResult.color}50`
                      }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: checkinResult.color }}>
                        ✨ Daily recommendation — tap to open
                      </p>
                      <p className="text-white/80 text-sm leading-relaxed">{checkinResult.suggestion}</p>
                      <div className="flex items-center mt-3 text-sm font-semibold" style={{ color: checkinResult.color }}>
                        <span>Open the tool</span>
                        <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>→</motion.span>
                      </div>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => setShowCheckin(false)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-2xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg"
                  >
                    Return to Dashboard
                  </motion.button>
                </div>
              ) : checkinQuestions.length > 0 ? (
                // Active check-in
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/40 text-xs font-medium tracking-wider uppercase">Daily Check-in</span>
                    <span className="text-white/60 text-xs font-semibold">
                      {checkinCurrentIndex + 1} / {checkinQuestions.length}
                    </span>
                  </div>

                  <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((checkinCurrentIndex + 1) / checkinQuestions.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={checkinCurrentIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-6 text-center leading-snug">
                        {checkinQuestions[checkinCurrentIndex].question}
                      </h3>

                      <div className="space-y-3">
                        {checkinQuestions[checkinCurrentIndex].options.map((opt) => (
                          <motion.button
                            key={opt.text}
                            onClick={() => handleCheckinAnswerSelect(opt.text)}
                            disabled={checkinSelectedOption !== null}
                            whileHover={{ scale: 1.01, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={[
                              "w-full text-left px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border",
                              checkinSelectedOption === opt.text
                                ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-purple-500/40 hover:text-white"
                            ].join(" ")}
                          >
                            {opt.text}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
