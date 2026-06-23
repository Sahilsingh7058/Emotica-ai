import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface App {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path?: string;
  comingSoon?: boolean;
}

const smallApps: App[] = [
  {
    id: "breathing",
    title: "Breathing App",
    description: "Calm your nervous system with guided breathing patterns designed to reduce stress instantly.",
    icon: "🌬️",
    color: "from-blue-500 to-cyan-400",
    path: "/apps/breathing",
  },
  {
    id: "journal",
    title: "Journal App",
    description: "Write down your thoughts and feelings in a private, beautiful digital journal.",
    icon: "✍️",
    color: "from-amber-500 to-yellow-400",
    path: "/journal",
  },
  {
    id: "mood",
    title: "Mood Tracker",
    description: "Track your daily mood and discover your emotional patterns over time.",
    icon: "😊",
    color: "from-green-500 to-emerald-400",
    path: "/apps/mood",
  },
  {
    id: "gratitude",
    title: "Gratitude Log",
    description: "Cultivate positivity by recording things you're grateful for each day.",
    icon: "💖",
    color: "from-pink-500 to-rose-400",
    path: "/apps/gratitude",
  },
  {
    id: "meditation",
    title: "Meditation Timer",
    description: "A clean and simple timer for your daily meditation practice.",
    icon: "🧘",
    color: "from-violet-500 to-purple-400",
    path: "/apps/meditation",
  },
  {
    id: "sleep",
    title: "Sleep Stories",
    description: "Calming bedtime stories and soundscapes to guide you into restful sleep.",
    icon: "🌙",
    color: "from-indigo-500 to-blue-400",
    path: "/apps/sleep",
  },
  {
    id: "focus",
    title: "Focus Booster",
    description: "Harness the Pomodoro technique with ambient sounds to stay in deep flow.",
    icon: "⏳",
    color: "from-orange-500 to-amber-400",
    path: "/apps/focus",
  },
  {
    id: "energy",
    title: "Energy Check",
    description: "Log your energy levels and get personalized tips on when to rest or recharge.",
    icon: "⚡",
    color: "from-yellow-400 to-lime-400",
    path: "/apps/energy",
  },
  {
    id: "sounds",
    title: "Stress Relief Sounds",
    description: "Play relaxing rain, ocean waves, or forest sounds to melt away tension.",
    icon: "🎶",
    color: "from-teal-500 to-cyan-400",
    path: "/apps/sounds",
  },
  {
    id: "habits",
    title: "Habit Builder",
    description: "Build healthy habits with streaks, gentle reminders, and motivational nudges.",
    icon: "📅",
    color: "from-blue-500 to-indigo-400",
    path: "/apps/habits",
  },
  {
    id: "kindness",
    title: "Kindness Journal",
    description: "Record kind actions you've done or received to nurture compassion in your life.",
    icon: "🤝",
    color: "from-rose-500 to-pink-400",
    path: "/apps/kindness",
  },
  {
    id: "affirmations",
    title: "Positive Affirmations",
    description: "Receive daily affirmations crafted to boost your confidence and self-belief.",
    icon: "✨",
    color: "from-purple-500 to-violet-400",
    path: "/apps/affirmations",
  },
  {
    id: "emotion-analyzer",
    title: "Emotion Analyzer",
    description: "Analyze any text with our deep learning model to detect emotions with 92.81% accuracy.",
    icon: "🧠",
    color: "from-violet-500 to-purple-400",
    path: "/apps/emotion-analyzer",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function SmallApps() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const appRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightId) {
      const el = appRefs.current[highlightId];
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 700);
      }
    }
  }, [highlightId]);

  return (
    <div className="min-h-screen relative overflow-hidden pt-[100px] pb-20 px-4 sm:px-6 lg:px-8"
      style={{ background: "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)" }}>

      {/* Floating ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute top-2/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)" }} />
      </div>

      {/* Page header */}
      <motion.div
        className="max-w-7xl mx-auto text-center mb-16 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-purple-300 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          Wellness Toolkit
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, #e0c3fc 50%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Small Apps
        </h1>
        <p className="mt-5 text-lg text-white/50 max-w-xl mx-auto">
          Bite-sized tools designed to support your mental and emotional wellbeing — anytime, anywhere.
        </p>
      </motion.div>

      {/* Apps grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {smallApps.map((app) => {
          const isHighlighted = app.id === highlightId;

          return (
            <motion.div
              key={app.id}
              ref={(el) => { appRefs.current[app.id] = el; }}
              variants={cardVariants}
              whileHover={!isHighlighted ? { scale: 1.02, y: -6 } : {}}
              className={[
                "relative flex flex-col items-center text-center rounded-3xl p-7 transition-all duration-500",
                "backdrop-blur-xl border",
                isHighlighted
                  ? "bg-white/10 border-purple-500/70 animate-highlight-pulse"
                  : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-purple-500/30",
              ].join(" ")}
            >
              {/* Recommended badge */}
              {isHighlighted && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/30 whitespace-nowrap"
                >
                  <span>✨</span>
                  <span>Recommended for you</span>
                </motion.div>
              )}

              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-4xl shadow-lg mb-5`}
                style={{ boxShadow: isHighlighted ? "0 8px 32px rgba(168,85,247,0.4)" : undefined }}>
                {app.icon}
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{app.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed flex-1">{app.description}</p>

              <div className="mt-6 w-full">
                {app.comingSoon ? (
                  <span className="inline-block px-5 py-2 rounded-full text-sm text-white/40 border border-white/10 bg-white/5">
                    Coming Soon
                  </span>
                ) : (
                  <Link to={app.path!} className="block">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={[
                        "w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all",
                        isHighlighted
                          ? "bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-500/40"
                          : "bg-purple-600/70 hover:bg-purple-600",
                      ].join(" ")}
                    >
                      {isHighlighted ? "Open This App →" : "Open App"}
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
