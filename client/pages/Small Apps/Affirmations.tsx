import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const AFFIRMATIONS = [
  "I am worthy of love and kindness, especially from myself.",
  "I am doing the best I can with what I have right now.",
  "My feelings are valid. It's okay to feel what I feel.",
  "I am growing stronger and wiser with every challenge I face.",
  "I deserve rest. Slowing down is not giving up.",
  "I am enough. I don't need to prove my worth to anyone.",
  "Today, I choose to treat myself with compassion.",
  "Small steps still move me forward. Progress is progress.",
  "I am allowed to ask for help. That's a sign of strength.",
  "I release what I cannot control and focus on what I can.",
  "My mind and body are working hard for me every single day.",
  "I bring something unique and valuable to this world.",
  "I am allowed to take up space. My presence matters.",
  "I choose peace over perfection.",
  "Difficult moments pass. I have survived every hard day so far.",
  "I am not defined by my mistakes. I learn and I grow.",
  "Joy is available to me, even in simple things.",
  "I trust myself to navigate whatever comes next.",
  "I am building a life that feels good from the inside.",
  "Being kind to myself is the most important thing I can do today.",
  "I am capable of more than I give myself credit for.",
  "My story is still being written — and that's exciting.",
  "I am supported, even when I feel alone.",
  "Healing is not linear, and that is perfectly okay.",
  "I choose thoughts that lift me, not ones that limit me.",
];

const GRADIENTS = [
  "from-purple-600 to-violet-500", "from-rose-600 to-pink-500",
  "from-blue-600 to-cyan-500", "from-emerald-600 to-teal-500",
  "from-amber-600 to-orange-500", "from-indigo-600 to-blue-500",
];

export default function Affirmations() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const [saved, setSaved] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [gradIdx, setGradIdx] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("savedAffirmations");
    if (stored) setSaved(JSON.parse(stored));
  }, []);

  const next = () => {
    setIndex((i) => { let n = Math.floor(Math.random() * AFFIRMATIONS.length); while (n === i) n = Math.floor(Math.random() * AFFIRMATIONS.length); return n; });
    setGradIdx((g) => (g + 1) % GRADIENTS.length);
  };

  const saveThis = () => {
    const affirmation = AFFIRMATIONS[index];
    if (saved.includes(affirmation)) return;
    const updated = [affirmation, ...saved].slice(0, 20);
    setSaved(updated);
    localStorage.setItem("savedAffirmations", JSON.stringify(updated));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const isSaved = saved.includes(AFFIRMATIONS[index]);

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #a855f7, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-sm font-medium mb-5"><span>✨</span> Positive Affirmations</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #d8b4fe)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Today's Affirmation
          </h1>
        </motion.div>

        {/* Main affirmation card */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: -20 }} transition={{ duration: 0.4 }}
              className={`rounded-3xl p-10 text-center relative overflow-hidden border border-white/10`}
              style={{ background: "rgba(255,255,255,0.06)" }}>
              {/* Gradient orb inside card */}
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${GRADIENTS[gradIdx]} pointer-events-none`} />
              <div className="text-6xl mb-6">✨</div>
              <p className="text-white text-xl sm:text-2xl font-bold leading-relaxed relative z-10">
                "{AFFIRMATIONS[index]}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-8">
          <motion.button onClick={next} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 py-3.5 rounded-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
            Next Affirmation →
          </motion.button>
          <motion.button onClick={saveThis} disabled={isSaved} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className={`px-4 py-3.5 rounded-2xl font-bold border transition-all ${isSaved ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" : "text-white/50 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white"}`}>
            {isSaved ? "⭐" : "☆"}
          </motion.button>
        </div>
        <AnimatePresence>
          {justSaved && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-purple-400 text-sm text-center mb-6">⭐ Saved to your collection!</motion.p>}
        </AnimatePresence>

        {/* Saved section */}
        {saved.length > 0 && (
          <div>
            <button onClick={() => setShowSaved((s) => !s)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-4">
              <span>{showSaved ? "▾" : "▸"}</span>
              Saved Affirmations ({saved.length})
            </button>
            <AnimatePresence>
              {showSaved && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                  {saved.map((a, i) => (
                    <div key={i} className="rounded-2xl px-5 py-4 border border-white/8 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="text-yellow-400 mt-0.5">⭐</span>
                      <p className="text-white/70 text-sm leading-relaxed">"{a}"</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
