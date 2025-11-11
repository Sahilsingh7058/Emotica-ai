import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, Sun, TrendingUp, X } from 'lucide-react';

// --- Habit Data Structure ---
const initialHabits = [
    { id: 1, name: "Drink Water", streak: 0, lastCompleted: '2025-11-10', emoji: '💧', color: 'blue' }
];

// Available Emojis for selection
const availableEmojis = [
    '🏃', '💻', '💰', '🥦', '😴', '🧠', '💪', '🧘', '💧', '📚', '🌱', '☀️', '🚶', '🍎', '🎨', '🎧', '🎸', '☕'
];

// --- Utility Functions ---

/**
 * Checks if a habit was completed today.
 * @param {string} dateString - The last completion date string (YYYY-MM-DD).
 * @returns {boolean} True if the date is today.
 */
const isCompletedToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
};

/**
 * Generates a motivational message based on the streak count.
 * @param {number} streak - The current streak count.
 * @returns {string} A motivational phrase.
 */
const getMotivation = (streak) => {
    if (streak >= 21) return "🔥 Habit Master! You're unstoppable.";
    if (streak >= 7) return "🌟 Week streak achieved! Keep this momentum going.";
    if (streak > 0) return "✅ Great start! Build on yesterday's success.";
    return "💡 Start today! Every journey begins with a single step.";
};


// --- HabitBuilder Component ---

export default function HabitBuilderApp() {
    const [habits, setHabits] = useState(initialHabits);
    const [newHabitName, setNewHabitName] = useState('');
    // State to handle the selected emoji for the new habit
    const [newHabitEmoji, setNewHabitEmoji] = useState(availableEmojis[0]);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);


    // Function to handle marking a habit as complete
    const handleComplete = (id) => {
        const today = new Date().toISOString().split('T')[0];

        setHabits(prevHabits => 
            prevHabits.map(habit => {
                if (habit.id === id) {
                    if (isCompletedToday(habit.lastCompleted)) {
                        // Already completed today, do nothing.
                        return habit; 
                    }

                    // Check if the completion is on the day immediately following the last completion
                    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
                    let newStreak = habit.streak;

                    if (habit.lastCompleted === yesterday) {
                        newStreak += 1; // Continue streak
                    } else if (habit.lastCompleted !== today) {
                        // Streak broken or starting fresh
                        newStreak = 1; 
                    }
                    
                    return {
                        ...habit,
                        streak: newStreak,
                        lastCompleted: today,
                    };
                }
                return habit;
            })
        );
    };

    // Function to add a new habit
    const handleAddHabit = (e) => {
        e.preventDefault();
        if (newHabitName.trim() === '') return;

        const newHabit = {
            id: Date.now(),
            name: newHabitName.trim(),
            streak: 0,
            lastCompleted: null,
            emoji: newHabitEmoji, // Use the SELECTED emoji
            color: 'indigo' // Default color
        };

        setHabits(prevHabits => [...prevHabits, newHabit]);
        setNewHabitName('');
        setIsEmojiPickerOpen(false); // Close picker after adding
    };

    // Function to remove a habit
    const handleRemoveHabit = (id) => {
        setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    };

    // --- Habit Card Component ---
    const HabitCard = ({ habit }) => {
        const isTodayDone = isCompletedToday(habit.lastCompleted);
        // Note: Tailwind requires static class names for dynamic usage, so we need to rely on the full class string for borders.
        const borderColor = habit.color === 'blue' ? 'border-blue-500' :
                            habit.color === 'purple' ? 'border-purple-500' :
                            habit.color === 'green' ? 'border-green-500' :
                            'border-indigo-500';
                            
        const baseColor = habit.color === 'blue' ? 'text-blue-600 bg-blue-100' :
                          habit.color === 'purple' ? 'text-purple-600 bg-purple-100' :
                          habit.color === 'green' ? 'text-green-600 bg-green-100' :
                          'text-indigo-600 bg-indigo-100';
        
        const completeButtonClasses = isTodayDone
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg transition-all";

        return (
            <div className={`flex items-center justify-between p-4 mb-4 rounded-xl shadow-lg bg-white border-l-4 ${borderColor} transition-shadow duration-300 hover:shadow-xl`}>
                
                <div className="flex items-center flex-grow">
                    <div className={`p-3 rounded-full mr-4 ${baseColor}`}>
                        <span className="text-xl">{habit.emoji}</span>
                    </div>
                    
                    <div>
                        <h3 className={`text-lg font-semibold text-gray-800 ${isTodayDone ? 'line-through opacity-70' : ''}`}>
                            {habit.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <TrendingUp className="w-4 h-4 mr-1 text-yellow-600" />
                            <span className="font-bold text-gray-700 mr-3">{habit.streak}</span>
                            <span className="text-xs">DAY STREAK</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Completion Button */}
                    <button
                        onClick={() => handleComplete(habit.id)}
                        disabled={isTodayDone}
                        className={`p-3 rounded-full ${completeButtonClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400`}
                        aria-label={isTodayDone ? "Completed Today" : "Mark Complete"}
                    >
                        <Check className="w-5 h-5" />
                    </button>
                    
                    {/* Delete Button */}
                    <button
                        onClick={() => handleRemoveHabit(habit.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                        aria-label="Remove Habit"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    };


    // --- Main Render ---
    return (
        <div className="min-h-screen bg-[#4F6483] p-4 sm:p-8 font-sans">
            <div className="max-w-xl mx-auto mt-24">

                {/* Header */}
                <header className="text-center mb-10 pt-8">
                    <h1 className="text-4xl font-extrabold text-white flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-purple-400" />
                        Habit Builder
                    </h1>
                    <p className="text-gray-200 mt-2">Streaks, reminders, and motivational nudges.</p>
                </header>

                {/* Motivational Nudge / Streak Summary */}
                <div className="bg-white p-4 rounded-xl shadow-lg mb-8 border-l-4 border-yellow-500">
                    <h2 className="text-lg font-semibold text-yellow-700 flex items-center">
                        <Sun className="w-5 h-5 mr-2" />
                        Your Daily Nudge
                    </h2>
                    <p className="text-gray-600 mt-1">{getMotivation(habits.reduce((max, habit) => Math.max(max, habit.streak), 0))}</p>
                </div>

                
                <form onSubmit={handleAddHabit} className="flex space-x-3 mb-10 p-4 bg-white rounded-xl shadow-lg relative items-start">
                    
                    {/* Emoji Selector Button and Popover Container */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                            className="p-3 bg-gray-200 rounded-lg text-2xl hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Select habit emoji"
                        >
                            {newHabitEmoji}
                        </button>

                        {isEmojiPickerOpen && (
                            // EMOJI PICKER MENU: Aligned to the right, using full width to force wrapping.
                            <div className=" top-full mt-2 left-0 z-10 bg-white p-2 rounded-xl shadow-2xl border border-gray-100 flex flex-wrap  ">
                                {availableEmojis.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => {
                                            setNewHabitEmoji(emoji);
                                            setIsEmojiPickerOpen(false);
                                        }}
                                        className={`p-1 text-2xl rounded-lg transition-colors ${newHabitEmoji === emoji ? 'bg-indigo-200 ring-2 ring-indigo-500' : 'hover:bg-indigo-100'}`}
                                        aria-label={`Select emoji ${emoji}`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Text Input */}
                    <input
                        type="text"
                        placeholder="Enter habit name (e.g., Meditate for 5 min)"
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="New habit name input"
                    />
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="p-3 bg-indigo-600 text-black rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                        disabled={newHabitName.trim() === ''}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>

                {/* Habit List */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">Your Habits</h2>
                    {habits.length === 0 ? (
                        <p className="text-center text-gray-500 p-10 bg-white rounded-xl shadow-inner">
                            No habits yet! Add your first habit above.
                        </p>
                    ) : (
                        habits.map(habit => (
                            <HabitCard key={habit.id} habit={habit} />
                        ))
                    )}
                </section>
                
                {/* Reminders Section Placeholder */}
                <section className="mt-10 p-6 bg-white rounded-xl shadow-lg border-t-4 border-teal-500">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-teal-600" />
                        Reminders
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        *Feature placeholder: This is where you would set up daily notification times for each habit.
                    </p>
                    <ul className="mt-3 space-y-2 text-gray-700">
                        <li className="flex items-center">
                            <span className="font-semibold text-teal-600 mr-2">💧 Drink Water:</span> 10:00 AM, 2:00 PM
                        </li>
                        <li className="flex items-center">
                            <span className="font-semibold text-teal-600 mr-2">📚 Read:</span> 8:00 PM
                        </li>
                    </ul>
                </section>

            </div>
        </div>
    );
}