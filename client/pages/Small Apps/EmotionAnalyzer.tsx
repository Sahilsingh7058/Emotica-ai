import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAuth, useApiFetch } from "@/context/AuthContext";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const EMOTION_COLORS: Record<string, string> = {
  anger: "#ef4444",
  fear: "#8b5cf6",
  joy: "#fbbf24",
  love: "#ec4899",
  sadness: "#60a5fa",
  surprise: "#34d399",
};

const EMOTION_EMOJIS: Record<string, string> = {
  anger: "😤",
  fear: "😨",
  joy: "😊",
  love: "❤️",
  sadness: "😢",
  surprise: "😲",
};

const EMOTION_DESCRIPTIONS: Record<string, string> = {
  anger: "Frustration, irritation, or displeasure",
  fear: "Anxiety, nervousness, or unease",
  joy: "Happiness, contentment, or excitement",
  love: "Affection, care, or deep connection",
  sadness: "Sorrow, disappointment, or grief",
  surprise: "Shock, amazement, or sudden realization",
};

export default function EmotionAnalyzer() {
  const { isAuthenticated } = useAuth();
  const apiFetch = useApiFetch();

  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    emotion: string;
    confidence: number;
    probabilities: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<
    Array<{ text: string; emotion: string; confidence: number; timestamp: string }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("emotionHistory") || "[]");
    } catch {
      return [];
    }
  });

  const analyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/predict/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error("Prediction service unavailable");
      const data = await res.json();
      setResult(data);
      const entry = {
        text: text.trim().slice(0, 100),
        emotion: data.emotion,
        confidence: data.confidence,
        timestamp: new Date().toISOString(),
      };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem("emotionHistory", JSON.stringify(updated));

      if (isAuthenticated) {
        apiFetch("/api/emotion/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim().slice(0, 500),
            emotion: data.emotion,
            confidence: data.confidence,
            probabilities: data.probabilities,
          }),
        }).then(() => setSaved(true)).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze emotion. Is the prediction server running?");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? Object.entries(result.probabilities).map(([emotion, prob]) => ({
        emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        key: emotion,
        probability: Math.round(prob * 100),
      }))
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden pt-[100px] pb-20 px-4 sm:px-6 lg:px-8" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #ec4899, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-sm font-medium mb-5">
            <span>🧠</span> ML-Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold"
            style={{ background: "linear-gradient(135deg, #fff, #c4b5fd, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Emotion Analyzer
          </h1>
          <p className="mt-3 text-white/40 text-sm max-w-lg mx-auto">
            Uses a deep learning model (92.81% accuracy) to detect emotions from text. Just type or paste anything.
          </p>
          {isAuthenticated && (
            <p className="mt-1 text-green-400/50 text-xs">Analyses are saved to your Emotion Analysis dashboard.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 backdrop-blur-xl border border-white/10 mb-6"
          style={{ background: "rgba(255,255,255,0.05)" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type how you're feeling, a journal entry, or any text..."
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none border border-white/10 resize-none transition-colors mb-4"
            style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) analyze(); }}
          />
          <div className="flex items-center justify-between">
            <span className="text-white/20 text-xs">{text.length} chars</span>
            <motion.button
              onClick={analyze}
              disabled={!text.trim() || loading}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              {loading ? "Analyzing..." : "Analyze Emotion"}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl px-5 py-4 mb-6 border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="rounded-3xl p-8 text-center backdrop-blur-xl border"
                style={{
                  background: `${EMOTION_COLORS[result.emotion]}15`,
                  borderColor: `${EMOTION_COLORS[result.emotion]}40`,
                }}>
                <div className="text-6xl mb-3">{EMOTION_EMOJIS[result.emotion] || "🧠"}</div>
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-2">Detected Emotion</p>
                <h2 className="text-4xl font-extrabold mb-2" style={{ color: EMOTION_COLORS[result.emotion] || "#a855f7" }}>
                  {result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1)}
                </h2>
                <p className="text-white/50 text-sm mb-4">{EMOTION_DESCRIPTIONS[result.emotion] || ""}</p>
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border" style={{ borderColor: `${EMOTION_COLORS[result.emotion]}40`, background: `${EMOTION_COLORS[result.emotion]}20` }}>
                  <span className="text-lg">{EMOTION_EMOJIS[result.emotion]}</span>
                  <span className="font-bold text-lg" style={{ color: EMOTION_COLORS[result.emotion] }}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-white/40 text-xs">confidence</span>
                </div>
                {saved && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 border border-green-500/30 bg-green-500/10 text-green-400 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Saved to dashboard
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-3xl p-6 backdrop-blur-xl border border-white/10"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-white font-bold mb-4">Probability Breakdown</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="emotion" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(13,9,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: 12 }}
                      formatter={(value: number) => [`${value}%`, "Probability"]}
                    />
                    <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={entry.key} fill={EMOTION_COLORS[entry.key] || "#a855f7"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="rounded-3xl p-6 backdrop-blur-xl border border-white/10 mt-6"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-white font-bold mb-3 text-sm">Recent Analyses</p>
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5 border border-white/6" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-lg">{EMOTION_EMOJIS[entry.emotion] || "🧠"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-xs truncate">{entry.text}</p>
                    <p className="text-white/30 text-[10px]">{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: EMOTION_COLORS[entry.emotion] }}>
                    {entry.emotion} ({(entry.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
