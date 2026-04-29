import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface GratEntry { items: string[]; date: string }

const quotes = [
  "Gratitude turns what we have into enough.",
  "The more grateful I am, the more beauty I see.",
  "Small things, when appreciated, become extraordinary.",
  "Gratitude is the fairest blossom which springs from the soul.",
  "What you appreciate, appreciates.",
];

export default function Gratitude() {
  const [items, setItems] = useState(["", "", ""]);
  const [entries, setEntries] = useState<GratEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const stored = localStorage.getItem("gratitudeEntries");
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  const handleSave = () => {
    const filled = items.filter((i) => i.trim());
    if (filled.length === 0) return;
    const entry: GratEntry = {
      items: filled,
      date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    };
    const updated = [entry, ...entries].slice(0, 20);
    setEntries(updated);
    localStorage.setItem("gratitudeEntries", JSON.stringify(updated));
    setItems(["", "", ""]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #ec4899, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-pink-300 text-sm font-medium mb-5">
            <span>💖</span> Gratitude Log
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Count Your Blessings
          </h1>
          <p className="mt-4 text-white/40 text-sm italic">"{quote}"</p>
        </motion.div>

        {/* Entry form */}
        <motion.div className="rounded-3xl p-7 backdrop-blur-xl border border-white/10 mb-6" style={{ background: "rgba(255,255,255,0.05)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-white/50 text-sm mb-5">Name 3 things you're grateful for today:</p>
          <div className="space-y-3 mb-5">
            {items.map((val, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-pink-400 font-bold text-lg w-5 flex-shrink-0">{i + 1}.</span>
                <input
                  type="text"
                  placeholder={["Something that made you smile…", "Someone you appreciate…", "Something you often overlook…"][i]}
                  value={val}
                  onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-pink-500/50 transition-colors"
                  style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
                />
              </div>
            ))}
          </div>
          <motion.button onClick={handleSave} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full py-3 rounded-xl font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg, #be185d, #ec4899)" }}>
            Save Today's Entry 💖
          </motion.button>
          <AnimatePresence>
            {saved && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-pink-400 text-sm text-center mt-3">✓ Saved! Beautiful things to be grateful for.</motion.p>}
          </AnimatePresence>
        </motion.div>

        {/* Past entries */}
        {entries.length > 0 && (
          <div>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Past Entries</p>
            <div className="space-y-3">
              {entries.slice(0, 5).map((e, i) => (
                <div key={i} className="rounded-2xl px-5 py-4 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-white/30 text-xs mb-2">{e.date}</p>
                  <ul className="space-y-1">
                    {e.items.map((item, j) => (
                      <li key={j} className="text-white/70 text-sm flex gap-2"><span className="text-pink-400">♥</span>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
