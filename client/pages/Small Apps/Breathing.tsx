import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const LEVEL_CONFIGS = {
  EASY: { 
    INHALE: 3000, 
    HOLD: 1000,   
    EXHALE: 4000,
    label: 'Calm (3:1:4)',
  },
  MEDIUM: { 
    INHALE: 4000, 
    HOLD: 2000,   
    EXHALE: 6000,
    label: 'Balance (4:2:6)',
  },
  HARD: { 
    INHALE: 5000, 
    HOLD: 5000,   
    EXHALE: 7000, 
    label: 'Focus (5:5:7)',
  },
};

type Phase = 'INHALE' | 'HOLD' | 'EXHALE';
type Status = 'idle' | 'running' | 'paused';
type Level = keyof typeof LEVEL_CONFIGS;

interface Cycle {
  phase: Phase;
  duration: number;
  label: string;
}

const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.15);

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

  const cycleSequence = useMemo(() => {
    const times = LEVEL_CONFIGS[selectedLevel];
    return [
      { phase: 'INHALE', duration: times.INHALE, label: 'Inhale Deeply' },
      { phase: 'HOLD', duration: times.HOLD, label: 'Hold' },
      { phase: 'EXHALE', duration: times.EXHALE, label: 'Exhale Slowly' },
    ];
  }, [selectedLevel]);

  const currentCycle = useMemo(() => cycleSequence[currentCycleIndex], [currentCycleIndex, cycleSequence]);
  
  const stopAndReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('idle');
    setCurrentCycleIndex(0);
    setTimeRemaining(0);
    setTotalCycles(0);
  }, []);

  const startTimer = useCallback((initialTime: number) => {
    startTimeRef.current = performance.now();
    setTimeRemaining(initialTime);

    const tick = (timestamp: number) => {
      setStatus(prevStatus => {
        if (prevStatus !== 'running') return prevStatus;

        const elapsed = timestamp - startTimeRef.current;
        const newRemaining = currentCycle.duration - elapsed;
        setTimeRemaining(Math.max(0, newRemaining));

        if (newRemaining <= 0) {
          const nextIndex = (currentCycleIndex + 1) % cycleSequence.length;
          
          playBeep();
          
          setCurrentCycleIndex(nextIndex);
          startTimeRef.current = performance.now();

          if (currentCycle.phase === 'EXHALE') {
            setTotalCycles(prev => prev + 1);
          }
        }

        timerRef.current = setTimeout(() => requestAnimationFrame(tick), 50); 
        return prevStatus;
      });
    };

    timerRef.current = setTimeout(() => requestAnimationFrame(tick), 50);

  }, [currentCycleIndex, currentCycle.duration, cycleSequence.length, currentCycle.phase]);


  useEffect(() => {
    if (status === 'running') {
      if (timerRef.current) clearTimeout(timerRef.current);
      
      startTimer(currentCycle.duration);
      
      if (currentCycleIndex === 0 && totalCycles === 0) {
        playBeep();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, currentCycleIndex, currentCycle.duration, startTimer, totalCycles]); 

  useEffect(() => {
    stopAndReset();
  }, [selectedLevel, stopAndReset]);


  const handleStart = () => {
    if (status === 'idle' || status === 'paused') {
      setStatus('running');
      if (status === 'idle') {
        setCurrentCycleIndex(0);
        setTotalCycles(0);
        setTimeRemaining(cycleSequence[0].duration);
      } else {
        startTimeRef.current = performance.now() - (currentCycle.duration - timeRemaining);
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
  
  const progressPercent = currentCycle.duration > 0 ? (1 - timeRemaining / currentCycle.duration) * 100 : 0;
  
  const scale = status === 'running' 
    ? (
        currentCycle.phase === 'INHALE' 
          ? 1 + progressPercent / 300
          : currentCycle.phase === 'EXHALE' 
          ? 1.33 - progressPercent * 0.33 / 100
          : 1.33
      )
    : 1;

  const displayContent = useMemo(() => {
    if (status === 'running') {
      return Math.ceil(timeRemaining / 1000);
    }
    if (status === 'paused') {
      return 'Paused';
    }
    return 'Tap to Start';
  }, [status, timeRemaining]);

  const currentTimes = LEVEL_CONFIGS[selectedLevel];
  const cycleDisplay = `${currentTimes.INHALE/1000}s Inhale, ${currentTimes.HOLD/1000}s Hold, ${currentTimes.EXHALE/1000}s Exhale`;
  
  const selectedLevelLabel = LEVEL_CONFIGS[selectedLevel].label.split(' ')[0];


  return (
    <div className="min-h-screen bg-[#4F6483] flex justify-center p-4 pt-[120px] pb-12">
      
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-4 text-center h-fit">
        
        <h1 className="text-3xl font-extrabold text-blue-800 mb-1">Guided Breathing</h1>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2 text-base">Select Focus:</label>
          <div className="flex justify-center space-x-3">
            {Object.entries(LEVEL_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedLevel(key as Level)}
                disabled={status === 'running'}
                className={`py-2 px-4 rounded-full font-medium transition duration-200 text-base
                  ${selectedLevel === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {config.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <p className="text-gray-500 mb-4 text-base">
          Rhythm for <span className='font-semibold text-blue-700'>{selectedLevelLabel}</span>: {cycleDisplay}
        </p>

        <div className="flex justify-center items-center h-48 w-full mb-4">
          <div 
            onClick={status !== 'running' ? handleStart : undefined}
            className={`w-48 h-48 rounded-full shadow-2xl transition-all ease-in-out flex items-center justify-center 
              ${currentCycle.phase === 'INHALE' ? 'bg-indigo-300' : currentCycle.phase === 'HOLD' ? 'bg-green-300' : 'bg-red-300'}
              ${status !== 'running' ? 'cursor-pointer hover:shadow-xl active:scale-[0.98]' : ''}
            `}
            style={{ 
              transform: `scale(${scale})`,
              transitionDuration: status === 'running' ? (currentCycle.phase === 'HOLD' ? '300ms' : `${currentCycle.duration}ms`) : '300ms', 
              transitionProperty: 'transform, background-color',
              minWidth: '192px', 
              minHeight: '192px',
            }}
          >
            <div className="text-5xl font-bold text-gray-800">
              {displayContent}
            </div>
          </div>
        </div>

        <div className="mb-4 h-12">
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
        
        <p className="text-xl text-gray-600 mb-6">
          Completed Cycles: <span className="font-semibold text-blue-700">{totalCycles}</span>
        </p>


        <div className="flex justify-center space-x-4">
          <button
            onClick={handleStart}
            disabled={status === 'running'}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-xl"
          >
            {status === 'paused' ? 'Resume' : 'Start'}
          </button>
          
          <button
            onClick={handlePause}
            disabled={status !== 'running'}
            className="flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-xl"
          >
            Pause
          </button>
          
          <button
            onClick={handleStop}
            disabled={status === 'idle'}
            className="flex items-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-xl"
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Breathing;