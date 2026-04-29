import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const tips: Record<number, { emoji: string; label: string; tip: string; color: string }> = {
  1: { emoji: "😴", label: "Completely Drained", tip: "Your body is asking for deep rest. Cancel what you can, hydrate, and prioritise sleep tonight. You are allowed to rest.", color: "#6366f1" },
  2: { emoji: "😓", label: "Very Low", tip: "Try lying down for 20 minutes, even if you don't sleep. A small nourishing snack and water can also help.", color: "#8b5cf6" },
  3: { emoji: "😞", label: "Low", tip: "Step outside for 5 minutes of fresh air and sunlight. Light movement and a gentle stretch can quietly lift your energy.", color: "#7c3aed" },
  4: { emoji: "😐", label: "Below Average", tip: "A glass of cold water and a 10-minute walk can work wonders right now. Avoid screens for 15 minutes.", color: "#2563eb" },
  5: { emoji: "🙂", label: "Average", tip: "You're at half tank! Fuel yourself with a balanced meal and avoid sugar crashes. A short task can build momentum.", color: "#0284c7" },
  6: { emoji: "😊", label: "Okay", tip: "Good foundation! Focus on one priority task. Moderate movement like yoga or a brisk walk could take you to the next level.", color: "#0891b2" },
  7: { emoji: "😀", label: "Good", tip: "Nice energy! Channel it into something meaningful. This is a great time to tackle a creative or challenging task.", color: "#059669" },
  8: { emoji: "😄", label: "Great", tip: "You're in a strong zone. Use this window to make progress on important goals or help someone who needs a hand.", color: "#16a34a" },
  9: { emoji: "🤩", label: "Excellent", tip: "Peak energy! Take on your biggest challenge first. Move your body intensely and make the most of this state.", color: "#ca8a04" },
  10: { emoji: "⚡", label: "Fully Charged", tip: "Maximum power! Create, build, connect, move. Document this feeling — remember what brought you here.", color: "#ea580c" },
};

interface EnergyEntry { level: number; label: string; date: string }

export default function EnergyCheck() {
  const [level, setLevel] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<EnergyEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("energyHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const handleSubmit = () => {
    const entry: EnergyEntry = {
      level,
      label: tips[level].label,
      date: new Date().toLocaleString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" }),
    };
    const updated = [entry, ...history].slice(0, 14);
    setHistory(updated);
    localStorage.setItem("energyHistory", JSON.stringify(updated));
    setSubmitted(true);
  };

  const current = tips[level];

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #ca8a04, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-yellow-300 text-sm font-medium mb-5"><span>⚡</span> Energy Check</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            How's Your Energy?
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="rounded-3xl p-8 backdrop-blur-xl border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
              {/* Big emoji display */}
              <div className="text-center mb-8">
                <motion.div key={level} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl mb-3">{current.emoji}</motion.div>
                <p className="font-bold text-xl" style={{ color: current.color }}>{current.label}</p>
              </div>

              {/* Slider */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/30 mb-3 px-1">
                  <span>Empty</span><span>Full</span>
                </div>
                <input type="range" min={1} max={10} value={level} onChange={(e) => { setLevel(Number(e.target.value)); setSubmitted(false); }}
                  className="w-full accent-yellow-400 cursor-pointer" />
                <div className="flex justify-between mt-1 px-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={`text-xs transition-all ${i + 1 <= level ? "text-yellow-400 font-bold" : "text-white/20"}`}>{i + 1}</span>
                  ))}
                </div>
              </div>

              <motion.button onClick={handleSubmit} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6 w-full py-3.5 rounded-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)` }}>
                Log Energy Level
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl p-8 backdrop-blur-xl border mb-5 text-center" style={{ background: "rgba(255,255,255,0.05)", borderColor: `${current.color}40` }}>
                <div className="text-5xl mb-3">{current.emoji}</div>
                <p className="font-extrabold text-xl mb-1" style={{ color: current.color }}>{current.label}</p>
                <p className="text-white/60 text-sm leading-relaxed mt-3">{current.tip}</p>
                <button onClick={() => setSubmitted(false)} className="mt-5 text-white/30 hover:text-white/60 text-sm transition-colors">Log again</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3 px-1">Recent Energy Logs</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((e, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl px-5 py-3.5 border border-white/8" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-2xl">{tips[e.level].emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full flex-1 bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${(e.level / 10) * 100}%`, background: tips[e.level].color }} />
                      </div>
                      <span className="text-white/60 text-xs font-bold w-5 text-right">{e.level}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{e.label}</p>
                  </div>
                  <span className="text-white/20 text-xs">{e.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
