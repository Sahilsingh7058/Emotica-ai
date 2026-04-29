import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface Habit { id: string; name: string; emoji: string; streak: number; lastChecked: string; checks: string[] }

const EMOJIS = ["💧", "🏃", "📚", "🧘", "🛏️", "🥗", "☀️", "✍️", "🎵", "💊", "🚶", "🙏"];

function todayStr() { return new Date().toDateString(); }

export default function HabitBuilder() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("💧");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("habits");
    if (stored) setHabits(JSON.parse(stored));
  }, []);

  const save = (updated: Habit[]) => { setHabits(updated); localStorage.setItem("habits", JSON.stringify(updated)); };

  const addHabit = () => {
    if (!newName.trim()) return;
    const h: Habit = { id: Date.now().toString(), name: newName.trim(), emoji: newEmoji, streak: 0, lastChecked: "", checks: [] };
    save([h, ...habits]);
    setNewName(""); setAdding(false);
  };

  const toggleCheck = (id: string) => {
    const today = todayStr();
    save(habits.map((h) => {
      if (h.id !== id) return h;
      const alreadyChecked = h.lastChecked === today;
      if (alreadyChecked) {
        const checks = h.checks.filter((c) => c !== today);
        return { ...h, checks, lastChecked: checks[checks.length - 1] ?? "", streak: Math.max(0, h.streak - 1) };
      } else {
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = h.lastChecked === yesterday.toDateString();
        return { ...h, checks: [...h.checks, today], lastChecked: today, streak: isConsecutive ? h.streak + 1 : 1 };
      }
    }));
  };

  const deleteHabit = (id: string) => save(habits.filter((h) => h.id !== id));

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm font-medium mb-5"><span>📅</span> Habit Builder</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Build Better Habits
          </h1>
          <p className="mt-3 text-white/40 text-sm">Small daily wins compound into lasting change.</p>
        </motion.div>

        {/* Add habit */}
        <div className="mb-6">
          <AnimatePresence>
            {!adding ? (
              <motion.button onClick={() => setAdding(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} exit={{ opacity: 0 }}
                className="w-full py-3.5 rounded-2xl border border-dashed border-white/20 text-white/40 hover:border-blue-500/40 hover:text-white/60 text-sm font-medium transition-all">
                + Add New Habit
              </motion.button>
            ) : (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-3xl p-6 backdrop-blur-xl border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                <p className="text-white/50 text-sm mb-4">Choose an emoji:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setNewEmoji(e)} className={`w-10 h-10 rounded-xl text-xl transition-all ${newEmoji === e ? "bg-blue-600/40 border border-blue-500/50" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>{e}</button>
                  ))}
                </div>
                <input type="text" placeholder="Habit name (e.g. Drink 8 glasses of water)" value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 mb-4 transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />
                <div className="flex gap-3">
                  <motion.button onClick={addHabit} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
                    Add Habit
                  </motion.button>
                  <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-xl text-white/40 border border-white/10 bg-white/5 text-sm">Cancel</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Habits list */}
        {habits.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm">No habits yet — add your first one above.</div>
        ) : (
          <div className="space-y-3">
            {habits.map((h) => {
              const checked = h.lastChecked === todayStr();
              return (
                <motion.div key={h.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl px-5 py-4 flex items-center gap-4 border transition-all ${checked ? "border-blue-500/30 bg-blue-500/8" : "border-white/8 bg-white/4"}`}
                  style={{ background: checked ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.04)" }}>
                  <button onClick={() => toggleCheck(h.id)} className={`w-10 h-10 rounded-xl text-2xl flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-blue-600/40 border border-blue-500/50" : "bg-white/5 border border-white/15 hover:bg-white/10"}`}>
                    {checked ? "✓" : h.emoji}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${checked ? "text-blue-300 line-through" : "text-white"}`}>{h.name}</p>
                    {h.streak > 0 && <p className="text-xs text-orange-400 mt-0.5">🔥 {h.streak} day streak</p>}
                  </div>
                  <button onClick={() => deleteHabit(h.id)} className="text-white/20 hover:text-red-400 text-lg transition-colors">×</button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
