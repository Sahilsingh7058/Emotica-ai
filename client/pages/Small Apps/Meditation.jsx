import React, { useState, useEffect, useRef } from 'react';

// Utility function to format seconds into MM:SS
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const MeditationTimer = () => {
  const [duration, setDuration] = useState(300); // Default 5 minutes (300s)
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Ready to focus.');
  const timerRef = useRef(null);

  const CIRCUMFERENCE = 628; // 2 * PI * R (R = 100)

  // 🧠 Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setStatus('Meditation complete!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  // 🧩 Handlers
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value, 10);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsRunning(false);
    setStatus('Ready to focus.');
  };

  const handleStartPause = () => {
    if (timeLeft <= 0) {
      handleReset();
      setIsRunning(true);
      setStatus('Focusing...');
      return;
    }
    setIsRunning((prev) => {
      const running = !prev;
      setStatus(running ? 'Focusing...' : 'Paused.');
      return running;
    });
  };

  const handleReset = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTimeLeft(duration);
    setStatus('Ready to focus.');
  };

  // Progress Circle Calculation
  const progressPercent = ((duration - timeLeft) / duration) * 100;
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

  return (
    <div className="flex flex-col items-center py-8 px-4 w-full min-h-screen bg-gradient-to-b from-purple-50 to-white pt-">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 ">
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-3 relative z-10">
          Meditation Timer
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Find your peace, one breath at a time.
        </p>

        {/* Status Display */}
        <div
          className={`text-center text-lg font-semibold mb-6 p-2 rounded-lg min-h-[3rem] transition-colors duration-500 ${
            isRunning
              ? 'text-green-700 bg-green-50'
              : timeLeft === 0
              ? 'text-purple-700 bg-purple-50'
              : 'text-yellow-700 bg-yellow-50'
          }`}
        >
          {status}
        </div>

        {/* Timer Display */}
        <div className="flex justify-center mb-10">
          <div className="relative w-60 h-60">
            <svg
              viewBox="0 0 240 240"
              className="w-full h-full transform -rotate-90"
            >
              {/* Background Circle */}
              <circle
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="100"
                cx="120"
                cy="120"
                className="text-gray-200"
              />
              {/* Progress Circle */}
              <circle
                strokeWidth="10"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="100"
                cx="120"
                cy="120"
                className="text-purple-500 transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-6xl font-extrabold text-gray-800 select-none">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Duration Selector */}
        <div className="mb-8">
          <label
            htmlFor="duration-select"
            className="block text-center text-sm font-medium text-gray-700 mb-2"
          >
            Set Meditation Duration
          </label>
          <select
            id="duration-select"
            value={duration}
            onChange={handleDurationChange}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-lg font-medium appearance-none bg-white"
          >
            <option value={180}>3 Minutes</option>
            <option value={300}>5 Minutes</option>
            <option value={600}>10 Minutes</option>
            <option value={900}>15 Minutes</option>
            <option value={1200}>20 Minutes</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleStartPause}
            className={`flex-1 py-3 px-4 rounded-full text-white font-bold text-lg shadow-md transition-all ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-green-900 hover:bg-green-900'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={handleReset}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-lg shadow-md transition-all ${
              isRunning
                ? 'bg-purple-300 text-purple-600 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
            disabled={isRunning}
          >
            Reset
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Timer stops automatically when complete.
      </p>
    </div>
  );
};

export default MeditationTimer;
