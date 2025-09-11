
import { Link } from "react-router-dom";

// An array of objects to represent the small apps
const smallApps = [
  {
    title: "Breathing App",
    description: "A simple guide for mindful breathing exercises to help you relax and de-stress.",
    icon: "🌬️",
    path: "/breathing"
  },
  {
    title: "Journal App",
    description: "Write down your thoughts and feelings in a private, digital journal.",
    icon: "✍️",
    path: "/journal"
  },
  {
    title: "Mood Tracker",
    description: "Track your daily mood and understand your emotional patterns over time.",
    icon: "😊"
  },
  {
    title: "Gratitude Log",
    description: "Cultivate positivity by recording things you're thankful for each day.",
    icon: "💖"
  },
  {
    title: "Meditation Timer",
    description: "A clean and simple timer for your daily meditation practice.",
    icon: "🧘"
  },
  {
    title: "Sleep Stories",
    description: "Listen to calming bedtime stories and soundscapes to improve sleep quality.",
    icon: "🌙",
    path: "/sleep-stories"
  },
  {
    title: "Focus Booster",
    description: "Use the Pomodoro technique with soothing background sounds to stay productive.",
    icon: "⏳",
    path: "/focus"
  },
  {
    title: "Energy Check",
    description: "Log your energy levels and get tips on when to rest or recharge.",
    icon: "⚡",
    path: "/energy"
  },
  {
    title: "Stress Relief Sounds",
    description: "Play relaxing ambient sounds like rain, waves, or forest to ease stress.",
    icon: "🎶",
    path: "/sounds"
  },
  {
    title: "Habit Builder",
    description: "Build healthy habits with streaks, reminders, and motivational nudges.",
    icon: "📅",
    path: "/habits"
  },
  {
    title: "Kindness Journal",
    description: "Record kind actions you’ve done or received to nurture compassion.",
    icon: "🤝",
    path: "/kindness"
  },
  {
    title: "Positive Affirmations",
    description: "Receive daily affirmations to boost your confidence and self-esteem.",
    icon: "✨"
  }
];

// The SmallApps component with a grid layout
export default function SmallApps (){
  return (
<div className="bg-[#4F6483] min-h-screen py-16 px-4 sm:px-6 lg:px-8 pt-[120px]">
        <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
          Small Apps
        </h1>
        <p className="mt-4 text-lg text-white">
          Explore a collection of small tools designed to support your wellness journey.
        </p>
      </div>

      {/* The responsive grid container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {smallApps.map((app, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4 p-4 bg-purple-100 rounded-full">
              {app.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">
              {app.title}
            </h2>
            <p className="mt-2 text-gray-500 flex-1">
              {app.description}
            </p>

            <Link
              to={app.path}
            >
                <button
            className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-full shadow-md hover:bg-purple-700 transition-colors"
             >
            Open App
          </button>
            </Link>

            
          </div>
        ))}
      </div>
    </div>
  );
};