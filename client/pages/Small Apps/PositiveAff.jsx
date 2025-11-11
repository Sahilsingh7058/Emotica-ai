import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Heart, Sun, Moon, Star } from 'lucide-react';

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
  { name: 'Lavender', bg: 'from-purple-50 via-violet-50 to-fuchsia-50', card: 'bg-white/90', accent: 'purple', icon: Star }
];

export default function AffirmationsApp() {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [lastIndex, setLastIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [theme, setTheme] = useState(0);
  const [favorites, setFavorites] = useState([]);
  
  const currentTheme = themes[theme];
  const IconComponent = currentTheme.icon;

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
    <div className={`min-h-screen bg-gradient-to-br bg-[#4F6483] flex items-center justify-center p-4 transition-all duration-700`}>
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-5xl font-black text-white">
              Daily <span className={`text-${currentTheme.accent}-500`}>Vibes</span>
            </h1>
          </div>
          <p className="text-white text-lg font-medium">
            Take a breath. Receive your moment of peace. ✨
          </p>
        </div>

        {/* Main Card */}
        <div className={`${currentTheme.card} backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border-4 border-${currentTheme.accent}-200 transition-all duration-300`}>
          
          {/* Affirmation Display */}
          <div className="min-h-[200px] flex items-center justify-center mb-8">
            <p 
              className={`text-2xl md:text-3xl font-bold text-center text-${currentTheme.accent}-700 transition-all duration-300 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {currentAffirmation || 'Loading your affirmation...'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={displayNewAffirmation}
              disabled={isAnimating}
              className={`flex items-center gap-2 bg-${currentTheme.accent}-500 hover:bg-${currentTheme.accent}-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
              New Affirmation
            </button>

            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-2 ${
                isFavorited 
                  ? `bg-${currentTheme.accent}-500 text-white` 
                  : 'bg-gray-100 text-gray-700'
              } hover:bg-${currentTheme.accent}-400 hover:text-white font-semibold py-4 px-6 rounded-full shadow-md transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Saved' : 'Save'}
            </button>
          </div>

          {/* Theme Selector */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Theme:</span>
            <button
              onClick={cycleTheme}
              className={`px-4 py-2 rounded-full bg-${currentTheme.accent}-100 text-${currentTheme.accent}-700 font-semibold text-sm hover:bg-${currentTheme.accent}-200 transition-all`}
            >
              {currentTheme.name} 🎨
            </button>
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className={`${currentTheme.card} backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 border-${currentTheme.accent}-200`}>
            <h3 className={`text-xl font-bold text-${currentTheme.accent}-700 mb-4 flex items-center gap-2`}>
              <Heart className="w-5 h-5 fill-current" />
              Your Saved Affirmations ({favorites.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {favorites.map((fav, idx) => (
                <div key={idx} className={`p-3 rounded-lg bg-${currentTheme.accent}-50 text-${currentTheme.accent}-700 text-sm`}>
                  {fav}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm italic">
          Remember: Healing is a journey, not a race. You're doing great. 💚
        </p>
      </div>
    </div>
  );
}