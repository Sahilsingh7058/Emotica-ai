import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function FocusBooster() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("focus");
  const [sessions, setSessions] = useState(0);
  const [selectedSound, setSelectedSound] = useState("rain");
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const audioRef = useRef(null);

  const modes = {
    focus: { time: 25 * 60, label: "Focus Time", color: "#6366F1" }, // Indigo
    shortBreak: { time: 5 * 60, label: "Short Break", color: "#10B981" }, // Green
    longBreak: { time: 15 * 60, label: "Long Break", color: "#3B82F6" }, // Blue
  };

  const sounds = {
    rain: { name: "Rain", frequency: 200 },
    waves: { name: "Ocean Waves", frequency: 150 },
    forest: { name: "Forest", frequency: 180 },
    cafe: { name: "Café Ambience", frequency: 220 },
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) handleTimerComplete();
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isSoundPlaying) playAmbientSound();
    else stopAmbientSound();
    return () => stopAmbientSound();
  }, [isSoundPlaying, selectedSound]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === "focus") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) switchMode("longBreak");
      else switchMode("shortBreak");
    } else switchMode("focus");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const playAmbientSound = () => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(sounds[selectedSound].frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioRef.current = { osc, ctx };
    }
  };

  const stopAmbientSound = () => {
    if (audioRef.current) {
      audioRef.current.osc.stop();
      audioRef.current.ctx.close();
      audioRef.current = null;
    }
  };

  const progress = ((modes[mode].time - timeLeft) / modes[mode].time) * 100;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-10  text-white font-sans transition-colors duration-500 "
      style={{ backgroundColor: modes[mode].color }}
    >
      <motion.div
        className="mt-10 max-w-2xl w-full rounded-3xl p-8 border border-white/20 shadow-2xl"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="text-center mb-8 ">
          <motion.h1
            className="text-4xl font-extrabold mb-2 text-white"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            Focus Booster
          </motion.h1>
          <p className="text-white/80 text-sm">
            Use the Pomodoro technique with soothing sounds
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-8 bg-white/10 rounded-xl p-1">
          {Object.entries(modes).map(([key, { label }]) => (
            <motion.button
              key={key}
              onClick={() => switchMode(key)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                mode === key
                  ? "bg-white text-black shadow-lg"
                  : "text-white hover:bg-white/20"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Timer */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-10"
        >
          <svg className="w-full h-64" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="12"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#fff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
              className="drop-shadow-lg"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h2 className="text-6xl font-extrabold tracking-tight text-white">
              {formatTime(timeLeft)}
            </h2>
            <p className="text-white/80 mt-1 text-sm">
              {modes[mode].label} • Session {sessions + 1}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex justify-center gap-5 mb-10">
          <motion.button
            onClick={toggleTimer}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-black p-5 rounded-full shadow-lg hover:scale-110 transition-all"
          >
            {isActive ? <Pause size={28} /> : <Play size={28} />}
          </motion.button>

          <motion.button
            onClick={resetTimer}
            whileTap={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-white/20 text-white p-5 rounded-full hover:bg-white/30 transition-all"
          >
            <RotateCcw size={26} />
          </motion.button>
        </div>

      
        {/* Stats */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="inline-block bg-white/10 rounded-2xl px-6 py-3 border border-white/20">
            <span className="text-white/80">Completed Sessions: </span>
            <span className="text-white font-bold text-xl">{sessions}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
