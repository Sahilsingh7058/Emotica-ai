import React, { useState, useEffect, useRef } from 'react';

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const MeditationTimer = () => {
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('Ready to focus.');
  const timerRef = useRef(null);

  const CIRCUMFERENCE = 628;

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

  const progressPercent = ((duration - timeLeft) / duration) * 100;
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * progressPercent) / 100;

  return (
    <div className="bg-[#4F6483] min-h-screen flex flex-col items-center pt-[120px] pb-12 px-4 w-full">
      <div className="max-w-4xl w-full bg-white p-4 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-1">
          Meditation Timer
        </h1>
        <p className="text-center text-base text-gray-500 mb-4">
          Find your peace, one breath at a time.
        </p>

        <div
          className={`text-center text-xl font-semibold mb-3 p-2 rounded-lg min-h-[3rem] transition-colors duration-500 ${
            isRunning
              ? 'text-green-700 bg-green-50'
              : timeLeft === 0
              ? 'text-purple-700 bg-purple-50'
              : 'text-yellow-700 bg-yellow-50'
          }`}
        >
          {status}
        </div>

        <div className="flex justify-center mb-4">
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

            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-5xl font-extrabold text-gray-800 select-none">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="duration-select"
            className="block text-center text-base font-medium text-gray-700 mb-2"
          >
            Set Meditation Duration
          </label>
          <select
            id="duration-select"
            value={duration}
            onChange={handleDurationChange}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-xl font-medium appearance-none bg-white"
          >
            <option value={180}>3 Minutes</option>
            <option value={300}>5 Minutes</option>
            <option value={600}>10 Minutes</option>
            <option value={900}>15 Minutes</option>
            <option value={1200}>20 Minutes</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleStartPause}
            className={`flex-1 py-2 px-4 rounded-full font-bold text-xl shadow-md transition-all ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>

          <button
            onClick={handleReset}
            className={`flex-1 py-2 px-4 rounded-full font-bold text-xl shadow-md transition-all ${
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

      <p className="mt-4 text-base text-gray-400">
        Timer stops automatically when complete.
      </p>
    </div>
  );
};

export default MeditationTimer;