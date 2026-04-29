import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

type Mode = "work" | "break";

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

function playTone(freq: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.8);
  } catch { /* no-op */ }
}

export default function FocusBooster() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = mode === "work" ? WORK_SEC : BREAK_SEC;
  const progress = 1 - timeLeft / total;
  const circ = 2 * Math.PI * 90;

  const switchMode = useCallback((next: Mode) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setMode(next);
    setTimeLeft(next === "work" ? WORK_SEC : BREAK_SEC);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (mode === "work") { setSessions((s) => s + 1); playTone(880); switchMode("break"); }
          else { playTone(660); switchMode("work"); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, switchMode]);

  const handleToggle = () => {
    if (!running) playTone(660);
    setRunning((r) => !r);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTimeLeft(mode === "work" ? WORK_SEC : BREAK_SEC);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #ea580c, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-orange-300 text-sm font-medium mb-4"><span>⏳</span> Focus Booster</div>
          <h1 className="text-3xl font-extrabold text-white">Pomodoro Timer</h1>
          <p className="text-white/40 text-sm mt-1">25 min focus · 5 min rest</p>
        </motion.div>

        {/* Mode tabs */}
        <div className="flex gap-2 justify-center mb-8">
          {(["work", "break"] as Mode[]).map((m) => (
            <button key={m} onClick={() => switchMode(m)} disabled={running}
              className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${mode === m ? (m === "work" ? "bg-orange-600/40 border-orange-500/50 text-white" : "bg-emerald-600/40 border-emerald-500/50 text-white") : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-40"}`}>
              {m === "work" ? "🎯 Focus" : "☕ Break"}
            </button>
          ))}
        </div>

        {/* Circular timer */}
        <div className="relative flex items-center justify-center mb-8">
          <svg width="220" height="220" className="-rotate-90">
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="110" cy="110" r="90" fill="none" stroke={mode === "work" ? "#f97316" : "#10b981"} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-white tabular-nums">{mm}:{ss}</span>
            <span className="text-white/40 text-sm mt-1">{mode === "work" ? "Stay focused" : "Rest up!"}</span>
          </div>
        </div>

        {/* Sessions */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: Math.min(sessions + 4, 8) }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < sessions ? "bg-orange-400" : "bg-white/15"}`} />
          ))}
        </div>
        <p className="text-white/30 text-xs mb-8">{sessions} session{sessions !== 1 ? "s" : ""} completed today</p>

        <div className="flex gap-3 justify-center">
          <motion.button onClick={handleToggle} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-3 rounded-xl font-bold text-white" style={{ background: mode === "work" ? "linear-gradient(135deg, #ea580c, #f97316)" : "linear-gradient(135deg, #059669, #10b981)" }}>
            {running ? "Pause" : "Start"}
          </motion.button>
          <motion.button onClick={handleReset} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-3 rounded-xl font-semibold text-white/60 border border-white/10 bg-white/5">
            Reset
          </motion.button>
        </div>
      </div>
    </div>
  );
}
