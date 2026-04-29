import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

type Tab = "gave" | "received";
interface Entry { text: string; date: string; tab: Tab }

export default function Kindness() {
  const [tab, setTab] = useState<Tab>("gave");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kindnessEntries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    const entry: Entry = { text: text.trim(), date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), tab };
    const updated = [entry, ...entries].slice(0, 50);
    setEntries(updated);
    localStorage.setItem("kindnessEntries", JSON.stringify(updated));
    setText(""); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = entries.filter((e) => e.tab === tab);

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #e11d48, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-rose-300 text-sm font-medium mb-5"><span>🤝</span> Kindness Journal</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #fda4af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Spread Kindness
          </h1>
          <p className="mt-3 text-white/40 text-sm">Track kindness given and received — it matters more than you think.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl border border-white/10 mb-6" style={{ background: "rgba(255,255,255,0.04)" }}>
          {([["gave", "🤲 Kindness I Gave"], ["received", "💝 Kindness I Received"]] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? "text-white" : "text-white/40 hover:text-white/60"}`}
              style={tab === t ? { background: t === "gave" ? "linear-gradient(135deg, #be123c, #e11d48)" : "linear-gradient(135deg, #9d174d, #be185d)" } : {}}>
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="rounded-3xl p-6 backdrop-blur-xl border border-white/10 mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white/50 text-sm mb-3">
            {tab === "gave" ? "What kind thing did you do today?" : "What kind thing did someone do for you?"}
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={tab === "gave" ? "I held the door for a stranger…" : "My friend checked in on me…"}
            rows={3} className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none border border-white/10 resize-none transition-colors mb-4"
            style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />
          <motion.button onClick={handleSave} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: tab === "gave" ? "linear-gradient(135deg, #be123c, #e11d48)" : "linear-gradient(135deg, #9d174d, #be185d)" }}>
            {tab === "gave" ? "Log Act of Kindness 🤲" : "Log Kindness Received 💝"}
          </motion.button>
          <AnimatePresence>
            {saved && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-rose-400 text-sm text-center mt-3">✓ Logged! The world needs more of this.</motion.p>}
          </AnimatePresence>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className="text-center text-white/25 text-sm py-8">No entries yet. {tab === "gave" ? "Go do something kind!" : "Notice the kindness around you!"}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-1">{filtered.length} entr{filtered.length === 1 ? "y" : "ies"}</p>
            {filtered.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-2xl px-5 py-4 border border-white/8 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="text-xl mt-0.5">{tab === "gave" ? "🤲" : "💝"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/75 text-sm leading-relaxed">{e.text}</p>
                  <p className="text-white/30 text-xs mt-1">{e.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
