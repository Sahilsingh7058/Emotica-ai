import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const durations = [
  { label: "2 min", seconds: 120 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "20 min", seconds: 1200 },
];

const messages = [
  "Breathe in… breathe out…",
  "Let your thoughts drift by like clouds…",
  "You are exactly where you need to be.",
  "With each breath, you find more peace.",
  "Relax your shoulders. Soften your jaw.",
  "Nothing to do, nowhere to be — just breathe.",
  "You are safe. You are calm. You are enough.",
];

function playBell() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 2.5);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 2.5);
  } catch { /* no-op */ }
}

export default function MeditationTimer() {
  const [selected, setSelected] = useState(durations[1]);
  const [timeLeft, setTimeLeft] = useState(durations[1].seconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = 1 - timeLeft / selected.seconds;
  const circ = 2 * Math.PI * 90; // radius 90

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (msgRef.current) clearInterval(msgRef.current);
    setRunning(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { stop(); setDone(true); playBell(); return 0; }
        return t - 1;
      });
    }, 1000);
    msgRef.current = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); if (msgRef.current) clearInterval(msgRef.current); };
  }, [running, stop]);

  const handleStart = () => { setDone(false); setRunning(true); playBell(); };
  const handleReset = () => { stop(); setTimeLeft(selected.seconds); setDone(false); };
  const handleSelect = (d: typeof durations[0]) => { stop(); setSelected(d); setTimeLeft(d.seconds); setDone(false); };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-violet-300 text-sm font-medium mb-4"><span>🧘</span> Meditation Timer</div>
          <h1 className="text-3xl font-extrabold text-white">Find Your Stillness</h1>
        </motion.div>

        {/* Duration picker */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {durations.map((d) => (
            <button key={d.label} onClick={() => handleSelect(d)} disabled={running}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${selected.label === d.label ? "bg-violet-600/50 border-violet-500/60 text-white" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40"}`}>
              {d.label}
            </button>
          ))}
        </div>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center mb-8">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="110" cy="110" r="90" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} style={{ transition: "stroke-dashoffset 1s linear" }} />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-white tabular-nums">{mm}:{ss}</span>
            {running && (
              <AnimatePresence mode="wait">
                <motion.p key={msgIndex} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-white/40 text-xs mt-2 max-w-[160px]">
                  {messages[msgIndex]}
                </motion.p>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!running && !done && (
            <motion.button onClick={handleStart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              Begin
            </motion.button>
          )}
          {running && (
            <motion.button onClick={stop} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 rounded-xl font-bold text-white border border-white/15 bg-white/8">
              Pause
            </motion.button>
          )}
          {(running || done || timeLeft < selected.seconds) && (
            <motion.button onClick={handleReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 rounded-xl font-semibold text-white/60 border border-white/10 bg-white/5">
              Reset
            </motion.button>
          )}
        </div>

        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-emerald-300 font-bold">Session Complete!</p>
            <p className="text-white/50 text-sm mt-1">Take a moment to notice how you feel.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
