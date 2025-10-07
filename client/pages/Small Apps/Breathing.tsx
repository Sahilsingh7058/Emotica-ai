import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// --- Configuration for Difficulty Levels (Times in milliseconds) ---
const LEVEL_CONFIGS = {
  EASY: { 
    INHALE: 3000, 
    HOLD: 1000,   
    EXHALE: 4000,
    label: 'Calm (3:1:4)', // Updated label for emotion
  },
  MEDIUM: { 
    INHALE: 4000, 
    HOLD: 2000,   
    EXHALE: 6000,
    label: 'Balance (4:2:6)', // Updated label for emotion
  },
  HARD: { 
    INHALE: 5000, 
    HOLD: 5000,   
    EXHALE: 7000, 
    label: 'Focus (5:5:7)', // Updated label for emotion
  },
};

// --- Types ---
type Phase = 'INHALE' | 'HOLD' | 'EXHALE';
type Status = 'idle' | 'running' | 'paused';
type Level = keyof typeof LEVEL_CONFIGS;

interface Cycle {
  phase: Phase;
  duration: number;
  label: string;
}

// Function to generate a simple beep tone
const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Configuration
    oscillator.type = 'sine'; // Sine wave for a clean tone
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz (A4)
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); // Volume

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start tone and quickly fade out
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.15); // Fade out over 150ms

    // Stop and cleanup after sound is played
    oscillator.stop(audioContext.currentTime + 0.2); 
  } catch (e) {
    console.error("Web Audio API not supported or failed to play sound:", e);
  }
};


const Breathing = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [selectedLevel, setSelectedLevel] = useState<Level>('MEDIUM');
  const [currentCycleIndex, setCurrentCycleIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalCycles, setTotalCycles] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  // Dynamically generate the cycle sequence based on the selected level
  const cycleSequence = useMemo(() => {
    const times = LEVEL_CONFIGS[selectedLevel];
    return [
      { phase: 'INHALE', duration: times.INHALE, label: 'Inhale Deeply' },
      { phase: 'HOLD', duration: times.HOLD, label: 'Hold' },
      { phase: 'EXHALE', duration: times.EXHALE, label: 'Exhale Slowly' },
    ];
  }, [selectedLevel]);

  // Get current cycle configuration
  const currentCycle = useMemo(() => cycleSequence[currentCycleIndex], [currentCycleIndex]);
  
  // Custom hook to stop/reset the timer and state
  const stopAndReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('idle');
    setCurrentCycleIndex(0);
    setTimeRemaining(0);
    setTotalCycles(0);
  }, []);

  // Function to start the timer loop
  const startTimer = useCallback((initialTime: number) => {
    startTimeRef.current = performance.now();
    setTimeRemaining(initialTime);

    const tick = (timestamp: number) => {
      if (status !== 'running') return;

      const elapsed = timestamp - startTimeRef.current;
      const newRemaining = currentCycle.duration - elapsed;
      setTimeRemaining(Math.max(0, newRemaining));

      if (newRemaining <= 0) {
        // --- Phase Transition Logic ---
        const nextIndex = (currentCycleIndex + 1) % cycleSequence.length;
        
        // **TRIGGER BEEP on phase change**
        playBeep();
        
        setCurrentCycleIndex(nextIndex);
        startTimeRef.current = performance.now(); // Reset start time for the next phase

        // Increment total cycles every time the sequence completes (e.g., after EXHALE)
        if (currentCycle.phase === 'EXHALE') {
          setTotalCycles(prev => prev + 1);
        }
      }

      // Use setTimeout with requestAnimationFrame for smoother UI updates
      timerRef.current = setTimeout(() => requestAnimationFrame(tick), 50); 
    };

    timerRef.current = setTimeout(() => requestAnimationFrame(tick), 50);

  }, [currentCycleIndex, status, currentCycle.duration, cycleSequence.length]);


  // Effect to manage the transition and continuous loop
  useEffect(() => {
    if (status === 'running') {
      // Clean up any existing timer before starting a new one
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Start the timer with the duration of the new phase
      startTimer(currentCycle.duration);
      
      // If we are starting from idle, play the initial beep right away
      if (currentCycleIndex === 0 && totalCycles === 0) {
        playBeep();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, currentCycleIndex, currentCycle.duration, startTimer, totalCycles]); 

  // Effect to reset the app when the level changes
  useEffect(() => {
    stopAndReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, stopAndReset]);


  // --- Controls ---

  const handleStart = () => {
    if (status === 'idle' || status === 'paused') {
      setStatus('running');
      // If idle, start from the beginning of the INHALE phase time.
      if (status === 'idle') {
        setCurrentCycleIndex(0);
        setTotalCycles(0);
      }
    }
  };

  const handlePause = () => {
    if (status === 'running') {
      setStatus('paused');
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const handleStop = () => {
    stopAndReset();
  };
  
  // Calculate the progress percentage for the time display
  const progressPercent = (1 - timeRemaining / currentCycle.duration) * 100;
  
  // Calculate the scale for the breathing circle animation
  const scale = currentCycle.phase === 'INHALE' 
    ? 1 + progressPercent / 300 // Scale up from 1 to 1.33
    : currentCycle.phase === 'EXHALE' 
    ? 1.33 - progressPercent * 0.33 / 100 // Scale down from 1.33 to 1
    : 1.33; // Hold steady

  // --- Logic for content display inside the circle ---
  const displayContent = useMemo(() => {
    if (status === 'running') {
      // Show whole seconds, rounding up
      return Math.ceil(timeRemaining / 1000);
    }
    if (status === 'paused') {
      return 'Paused';
    }
    // Idle state
    return 'Tap to Start';
  }, [status, timeRemaining]);

  // Get current cycle display text
  const currentTimes = LEVEL_CONFIGS[selectedLevel];
  const cycleDisplay = `${currentTimes.INHALE/1000}s Inhale, ${currentTimes.HOLD/1000}s Hold, ${currentTimes.EXHALE/1000}s Exhale`;
  
  // Determine the display name for the selected level (e.g., 'Calm')
  const selectedLevelLabel = LEVEL_CONFIGS[selectedLevel].label.split(' ')[0];


  return (
    <div className="min-h-screen bg-[#4F6483] flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-6 md:p-10 text-center  ">
        
        <h1 className="text-3xl font-extrabold text-blue-800 mb-2">Guided Breathing</h1>
        
        {/* Level Selector */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Select Focus:</label>
          <div className="flex justify-center space-x-3">
            {Object.entries(LEVEL_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedLevel(key as Level)}
                disabled={status === 'running'}
                className={`py-2 px-4 rounded-full font-medium transition duration-200 
                  ${selectedLevel === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {/* Displaying only the emotion name */}
                {config.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-gray-500 mb-8">
          Rhythm for <span className='font-semibold text-blue-700'>{selectedLevelLabel}</span>: {cycleDisplay}
        </p>

        {/* Breathing Circle Visualization (Now Clickable) */}
        <div className="flex justify-center items-center h-64 w-full mb-8">
          <div 
            onClick={status !== 'running' ? handleStart : undefined} // Clickable when not running
            className={`w-40 h-40 md:w-56 md:h-56 rounded-full shadow-2xl transition-all duration-100 ease-in-out flex items-center justify-center 
              ${currentCycle.phase === 'INHALE' ? 'bg-indigo-300' : currentCycle.phase === 'HOLD' ? 'bg-green-300' : 'bg-red-300'}
              ${status === 'running' ? '' : 'transform scale-100'}
              ${status !== 'running' ? 'cursor-pointer hover:shadow-xl active:scale-[0.98]' : ''}
            `}
            style={{ 
              transform: status === 'running' ? `scale(${scale})` : 'scale(1)',
              transitionDuration: `${timeRemaining}ms`, 
              minWidth: '160px', 
              minHeight: '160px',
            }}
          >
            <div className="text-3xl font-bold text-gray-800">
              {displayContent}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-8 h-12">
          {status === 'running' && (
            <p className={`text-4xl font-black transition-colors duration-500 
              ${currentCycle.phase === 'INHALE' ? 'text-indigo-600' : currentCycle.phase === 'HOLD' ? 'text-green-600' : 'text-red-600'}
            `}>
              {currentCycle.label}
            </p>
          )}
          {status === 'paused' && <p className="text-4xl font-black text-yellow-600">PAUSED</p>}
          {status === 'idle' && <p className="text-4xl font-black text-gray-400">Ready</p>}
        </div>
        
        {/* Cycle Counter */}
        <p className="text-lg text-gray-600 mb-8">
          Completed Cycles: <span className="font-semibold text-blue-700">{totalCycles}</span>
        </p>


        {/* Controls (Kept for clarity and alternative control) */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStart}
            disabled={status === 'running'}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {status === 'paused' ? 'Resume' : 'Start'}
          </button>
          
          <button
            onClick={handlePause}
            disabled={status !== 'running'}
            className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            Pause
          </button>
          
          <button
            onClick={handleStop}
            disabled={status === 'idle'}
            className="flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Breathing;
