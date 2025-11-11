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
    focus: { time: 25 * 60, label: "Focus Time", color: "#6366F1" },
    shortBreak: { time: 5 * 60, label: "Short Break", color: "#10B981" },
    longBreak: { time: 15 * 60, label: "Long Break", color: "#3B82F6" },
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
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isSoundPlaying) {
      playAmbientSound();
    } else {
      stopAmbientSound();
    }
    return () => stopAmbientSound();
  }, [isSoundPlaying, selectedSound]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === "focus") {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (newSessions % 4 === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("focus");
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].time);
    setIsActive(false);
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
    if (audioRef.current) {
      stopAmbientSound();
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(
        sounds[selectedSound].frequency,
        ctx.currentTime
      );
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioRef.current = { osc, ctx };
    } catch (e) {
      console.error("Web Audio API failed:", e);
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
    <div className="min-h-screen bg-[#4F6483] flex justify-center p-4 pt-[120px] pb-12">
      <motion.div
        className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-4 text-center h-fit text-gray-800"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-3xl font-extrabold text-purple-700 mb-1"
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Focus Booster
        </motion.h1>
        <p className="text-gray-500 text-base mb-4">
          Use the Pomodoro technique with soothing sounds
        </p>

        <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
          {Object.entries(modes).map(([key, { label }]) => (
            <motion.button
              key={key}
              onClick={() => switchMode(key)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-2 px-3 rounded-lg text-base font-semibold transition-all ${
                mode === key
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-4"
        >
          <div className="relative w-48 h-48">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full transform -rotate-90"
            >
              <circle
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="100"
                cx="120"
                cy="120"
                className="text-gray-200"
              />
              <motion.circle
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 100}`}
                strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                strokeLinecap="round"
                stroke={modes[mode].color}
                fill="transparent"
                r="100"
                cx="120"
                cy="120"
                className="drop-shadow-lg"
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <h2 className="text-5xl font-extrabold tracking-tight text-gray-800 select-none">
                {formatTime(timeLeft)}
              </h2>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-center gap-5 mb-6">
          <motion.button
            onClick={toggleTimer}
            whileTap={{ scale: 0.9 }}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all text-xl"
          >
            {isActive ? <Pause size={28} /> : <Play size={28} />}
          </motion.button>

          <motion.button
            onClick={resetTimer}
            whileTap={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-all text-xl"
          >
            <RotateCcw size={26} />
          </motion.button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <select
            value={selectedSound}
            onChange={(e) => setSelectedSound(e.target.value)}
            disabled={isSoundPlaying}
            className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-base font-medium bg-white disabled:opacity-70"
          >
            {Object.entries(sounds).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => setIsSoundPlaying(!isSoundPlaying)}
            className={`p-3 rounded-full transition-colors ${
              isSoundPlaying 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isSoundPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-block bg-gray-100 rounded-2xl px-6 py-3 border border-gray-200">
            <p className="text-gray-600 text-xl">
              {modes[mode].label} • Session {sessions + 1}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}