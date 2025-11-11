import React, { useState, useEffect } from 'react';
import { RefreshCw, Heart, Star } from 'lucide-react';

const affirmations = [
  "I am doing my best, and my best is enough.",
  "I allow myself to feel my feelings without judgment.",
  "I breathe in calm, I breathe out stress.",
  "Peace flows through me with every breath.",
  "I choose to see the good in this moment.",
  "I am safe, and I am loved.",
  "I release the need to control everything.",
  "I forgive myself for my past mistakes and choose to move forward.",
  "I am grounded, centered, and calm.",
  "My inner peace is stronger than my external chaos.",
  "I am capable of handling today's challenges.",
  "I am worthy of all the good things life offers.",
  "I am proud of how far I've come.",
  "I believe in myself and my abilities.",
  "My worth is not tied to my productivity.",
  "I am resilient, resourceful, and strong.",
  "I trust my intuition to guide me toward what's right for me.",
  "Confidence grows within me more each day.",
  "I am becoming the best version of myself.",
  "I am enough, just as I am.",
  "Growth is a slow process, and I am patient with my own pace.",
  "Small progress is still progress.",
  "Every step I take brings me closer to my goals.",
  "I celebrate my effort, not just my results.",
  "Each day is a new opportunity to grow.",
  "I trust the timing of my journey.",
  "I am learning to embrace uncertainty with courage.",
  "Challenges are lessons that help me grow stronger.",
  "I allow change to flow naturally through my life.",
  "I am proud of my commitment to keep showing up."
];

const themes = [
  { name: 'Lavender', bg: 'from-purple-50 via-violet-50 to-fuchsia-50', card: 'bg-white', accent: 'purple', icon: Star }
];

export default function AffirmationsApp() {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [lastIndex, setLastIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [theme, setTheme] = useState(0);
  const [favorites, setFavorites] = useState([]);
  
  const currentTheme = themes[theme];

  const getRandomAffirmation = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * affirmations.length);
    } while (newIndex === lastIndex && affirmations.length > 1);
    setLastIndex(newIndex);
    return affirmations[newIndex];
  };

  const displayNewAffirmation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentAffirmation(getRandomAffirmation());
      setIsAnimating(false);
    }, 300);
  };

  const toggleFavorite = () => {
    if (favorites.includes(currentAffirmation)) {
      setFavorites(favorites.filter(fav => fav !== currentAffirmation));
    } else {
      setFavorites([...favorites, currentAffirmation]);
    }
  };

  const cycleTheme = () => {
    setTheme((prev) => (prev + 1) % themes.length);
  };

  useEffect(() => {
    setCurrentAffirmation(getRandomAffirmation());
  }, []);

  const isFavorited = favorites.includes(currentAffirmation);

  return (
    <div className={`min-h-screen bg-[#4F6483] flex flex-col items-center p-4 pt-[120px] pb-12 transition-all duration-700`}>
      <div className="w-full max-w-4xl space-y-6">
        
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
            Daily Vibes
          </h1>
          <p className="mt-4 text-lg text-white">
            Take a breath. Receive your moment of peace. ✨
          </p>
        </div>

        <div className={`bg-white shadow-2xl rounded-3xl p-6 md:p-8 text-center h-fit border border-gray-100`}>
          
          <div className="min-h-[100px] flex items-center justify-center mb-6">
            <p 
              className={`text-2xl md:text-3xl font-bold text-center text-purple-400 transition-all duration-300 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {currentAffirmation || 'Loading your affirmation...'}
            </p>
          </div>

          <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <button
                onClick={displayNewAffirmation}
                disabled={isAnimating}
                className={`flex w-full sm:w-auto items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
                New Affirmation
              </button>

              <button
                onClick={toggleFavorite}
                className={`flex w-full sm:w-auto items-center justify-center gap-2 ${
                  isFavorited 
                    ? `bg-purple-600 text-white` 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } font-semibold py-3 px-6 rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                {isFavorited ? 'Saved' : 'Save'}
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Theme:</span>
              <button
                onClick={cycleTheme}
                className={`px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm hover:bg-purple-200 transition-all`}
              >
                {currentTheme.name} 🎨
              </button>
            </div>
          </div>

        </div>

        {favorites.length > 0 && (
          <div className={`bg-white backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100`}>
            <h3 className={`text-xl font-bold text-purple-700 mb-4 flex items-center gap-2`}>
              <Heart className="w-5 h-5 fill-current text-purple-500" />
              Your Saved Affirmations ({favorites.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {favorites.map((fav, idx) => (
                <div key={idx} className={`p-3 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium`}>
                  {fav}
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-gray-300 text-sm italic">
          Remember: Healing is a journey, not a race. You're doing great. 💚
        </p>
      </div>
    </div>
  );
}