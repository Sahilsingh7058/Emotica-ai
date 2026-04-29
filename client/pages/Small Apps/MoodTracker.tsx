import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface MoodEntry { emoji: string; label: string; note: string; date: string }

const moods = [
  { emoji: "😄", label: "Great", score: 5, color: "from-emerald-500 to-teal-400" },
  { emoji: "🙂", label: "Good", score: 4, color: "from-green-500 to-lime-400" },
  { emoji: "😐", label: "Neutral", score: 3, color: "from-amber-500 to-yellow-400" },
  { emoji: "😕", label: "Low", score: 2, color: "from-orange-500 to-red-400" },
  { emoji: "😢", label: "Rough", score: 1, color: "from-blue-600 to-indigo-500" },
];

const tips: Record<string, string> = {
  Great: "You're glowing! Share that energy with someone today. 🌟",
  Good: "Nice! Keep doing what's working for you. Maybe go for a short walk.",
  Neutral: "That's okay. Try a 5-minute breathing exercise to gently lift your mood.",
  Low: "Be extra kind to yourself today. Rest if you need it — it's okay.",
  Rough: "I see you. You don't have to push through alone. Reach out to someone.",
};

export default function MoodTracker() {
  const [selected, setSelected] = useState<typeof moods[0] | null>(null);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("moodEntries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  const handleLog = () => {
    if (!selected) return;
    const entry: MoodEntry = {
      emoji: selected.emoji,
      label: selected.label,
      note: note.trim(),
      date: new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [entry, ...entries].slice(0, 30);
    setEntries(updated);
    localStorage.setItem("moodEntries", JSON.stringify(updated));
    setSelected(null);
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #10b981, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-green-300 text-sm font-medium mb-5">
            <span>😊</span> Mood Tracker
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            How are you feeling?
          </h1>
        </motion.div>

        {/* Mood selector */}
        <motion.div className="rounded-3xl p-7 backdrop-blur-xl border border-white/10 mb-6" style={{ background: "rgba(255,255,255,0.05)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between gap-2 mb-6">
            {moods.map((m) => (
              <motion.button key={m.label} onClick={() => setSelected(m)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${selected?.label === m.label ? `bg-gradient-to-b ${m.color} border-transparent shadow-lg` : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-semibold text-white/70">{m.label}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <p className="text-white/60 text-sm mb-3 px-1">{tips[selected.label]}</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a quick note (optional)…" rows={2} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 resize-none border border-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />
                <motion.button onClick={handleLog} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-3 w-full py-3 rounded-xl font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                  Log Mood
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {saved && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-emerald-400 text-sm text-center mt-3 font-medium">
                ✓ Mood logged!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* History */}
        {entries.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Recent Entries</p>
            <div className="space-y-3">
              {entries.slice(0, 7).map((e, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-3xl">{e.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 font-semibold text-sm">{e.label}</p>
                    {e.note && <p className="text-white/40 text-xs truncate">{e.note}</p>}
                  </div>
                  <span className="text-white/25 text-xs flex-shrink-0">{e.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
