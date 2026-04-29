import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";

const LEVEL_CONFIGS = {
  EASY: { INHALE: 3000, HOLD: 1000, EXHALE: 4000, label: "Calm" },
  MEDIUM: { INHALE: 4000, HOLD: 2000, EXHALE: 6000, label: "Balance" },
  HARD: { INHALE: 5000, HOLD: 5000, EXHALE: 7000, label: "Focus" },
};

type Phase = "INHALE" | "HOLD" | "EXHALE";
type Status = "idle" | "running" | "paused";
type Level = keyof typeof LEVEL_CONFIGS;

const phaseConfig: Record<Phase, { label: string; color: string; glow: string; ring: string }> = {
  INHALE: {
    label: "Inhale Deeply",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.5)",
    ring: "#3b82f6",
  },
  HOLD: {
    label: "Hold",
    color: "from-emerald-500 to-teal-400",
    glow: "rgba(16,185,129,0.5)",
    ring: "#10b981",
  },
  EXHALE: {
    label: "Exhale Slowly",
    color: "from-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.5)",
    ring: "#8b5cf6",
  },
};

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    /* no-op */
  }
};

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

export default function Breathing() {
  const [status, setStatus] = useState<Status>("idle");
  const [selectedLevel, setSelectedLevel] = useState<Level>("MEDIUM");
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);

  const cycleSequence = useMemo(() => {
    const t = LEVEL_CONFIGS[selectedLevel];
    return [
      { phase: "INHALE" as Phase, duration: t.INHALE, label: "Inhale Deeply" },
      { phase: "HOLD" as Phase, duration: t.HOLD, label: "Hold" },
      { phase: "EXHALE" as Phase, duration: t.EXHALE, label: "Exhale Slowly" },
    ];
  }, [selectedLevel]);

  const currentCycle = useMemo(
    () => cycleSequence[currentCycleIndex],
    [cycleSequence, currentCycleIndex],
  );

  const stopAndReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("idle");
    setCurrentCycleIndex(0);
    setTimeRemaining(0);
    setTotalCycles(0);
  }, []);

  const startTimer = useCallback(
    (initialTime: number) => {
      startTimeRef.current = performance.now();
      setTimeRemaining(initialTime);

      const tick = (timestamp: number) => {
        if (status !== "running") return;
        const elapsed = timestamp - startTimeRef.current;
        const newRemaining = currentCycle.duration - elapsed;
        setTimeRemaining(Math.max(0, newRemaining));

        if (newRemaining <= 0) {
          const nextIndex = (currentCycleIndex + 1) % cycleSequence.length;
          playBeep();
          setCurrentCycleIndex(nextIndex);
          startTimeRef.current = performance.now();
          if (currentCycle.phase === "EXHALE") setTotalCycles((p) => p + 1);
        }
        timerRef.current = setTimeout(() => requestAnimationFrame(tick), 50);
      };

      timerRef.current = setTimeout(() => requestAnimationFrame(tick), 50);
    },
    [currentCycleIndex, status, currentCycle.duration, currentCycle.phase, cycleSequence.length],
  );

  useEffect(() => {
    if (status === "running") {
      if (timerRef.current) clearTimeout(timerRef.current);
      startTimer(currentCycle.duration);
      if (currentCycleIndex === 0 && totalCycles === 0) playBeep();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [status, currentCycleIndex, currentCycle.duration, startTimer, totalCycles]);

  useEffect(() => { stopAndReset(); }, [selectedLevel, stopAndReset]);

  const progressPercent = (1 - timeRemaining / currentCycle.duration) * 100;
  const scale =
    currentCycle.phase === "INHALE"
      ? 1 + progressPercent / 300
      : currentCycle.phase === "EXHALE"
      ? 1.33 - (progressPercent * 0.33) / 100
      : 1.33;

  const displayContent = useMemo(() => {
    if (status === "running") return Math.ceil(timeRemaining / 1000);
    if (status === "paused") return "⏸";
    return "▶";
  }, [status, timeRemaining]);

  const cfg = phaseConfig[currentCycle.phase];
  const currentTimes = LEVEL_CONFIGS[selectedLevel];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{
            background: "radial-gradient(circle, #0ea5e9, transparent)",
            animationDelay: "2s",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <motion.div
          className="rounded-3xl p-8 text-center backdrop-blur-xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.05)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-3xl font-extrabold mb-1"
            style={{
              background: "linear-gradient(135deg, #fff, #93c5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Guided Breathing
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {currentTimes.INHALE / 1000}s inhale · {currentTimes.HOLD / 1000}s hold · {currentTimes.EXHALE / 1000}s exhale
          </p>

          {/* Level selector */}
          <div className="flex justify-center gap-3 mb-8">
            {(Object.keys(LEVEL_CONFIGS) as Level[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedLevel(key)}
                disabled={status === "running"}
                className={[
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                  selectedLevel === key
                    ? "text-white border-purple-500/50 bg-purple-600/40"
                    : "text-white/40 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white/70",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {LEVEL_CONFIGS[key].label}
              </button>
            ))}
          </div>

          {/* Breathing circle */}
          <div className="flex justify-center items-center h-64 mb-8">
            <div
              onClick={status !== "running" ? () => setStatus("running") : undefined}
              className={`relative flex items-center justify-center rounded-full transition-all duration-150 ${status !== "running" ? "cursor-pointer" : ""}`}
              style={{
                width: 180,
                height: 180,
                transform: status === "running" ? `scale(${scale})` : "scale(1)",
                transitionDuration: `${timeRemaining}ms`,
                background: `linear-gradient(135deg, ${
                  currentCycle.phase === "INHALE"
                    ? "#3b82f6, #06b6d4"
                    : currentCycle.phase === "HOLD"
                    ? "#10b981, #14b8a6"
                    : "#8b5cf6, #a855f7"
                })`,
                boxShadow: `0 0 60px ${cfg.glow}, 0 0 120px ${cfg.glow}40`,
              }}
            >
              {/* Inner ripple ring */}
              {status === "running" && (
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: cfg.ring }}
                />
              )}
              <span className="text-4xl font-black text-white relative z-10">
                {displayContent}
              </span>
            </div>
          </div>

          {/* Phase label */}
          <div className="h-10 flex items-center justify-center mb-6">
            {status === "running" && (
              <motion.p
                key={currentCycle.phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-extrabold"
                style={{ color: cfg.ring }}
              >
                {cfg.label}
              </motion.p>
            )}
            {status === "paused" && (
              <p className="text-2xl font-extrabold text-amber-400">Paused</p>
            )}
            {status === "idle" && (
              <p className="text-white/30 text-lg">Tap the circle to begin</p>
            )}
          </div>

          {/* Cycle counter */}
          <p className="text-white/30 text-sm mb-8">
            Completed cycles:{" "}
            <span
              className="font-bold"
              style={{
                background: "linear-gradient(135deg, #fff, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {totalCycles}
            </span>
          </p>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <motion.button
              onClick={() => setStatus("running")}
              disabled={status === "running"}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
            >
              {status === "paused" ? "Resume" : "Start"}
            </motion.button>

            <motion.button
              onClick={() => setStatus("paused")}
              disabled={status !== "running"}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white border border-white/15 bg-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Pause
            </motion.button>

            <motion.button
              onClick={stopAndReset}
              disabled={status === "idle"}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white border border-white/15 bg-white/8 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Stop
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
