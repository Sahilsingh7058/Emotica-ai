import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthPage from "./AuthPage";

interface Option { text: string }
interface Question { id: number; question: string; options: Option[] }
interface Result {
  mood: string;
  description: string;
  suggestion: string;
  suggestedAppId?: string;
  totalScore?: number;
}

type AssessmentState = "idle" | "fetching" | "active" | "submitting" | "complete";

const moodConfig: Record<string, { emoji: string; accent: string; glow: string }> = {
  "Thriving": { emoji: "🌟", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  "Doing Okay": { emoji: "🌤️", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  "Feeling Strained": { emoji: "🌊", accent: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
  "Struggling": { emoji: "💜", accent: "#a855f7", glow: "rgba(168,85,247,0.3)" },
  "Feeling Positive": { emoji: "🌟", accent: "#10b981", glow: "rgba(16,185,129,0.3)" },
  "Feeling a Bit Sad": { emoji: "🌤️", accent: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
  "Feeling Overwhelmed": { emoji: "🌊", accent: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
};

const stats = [
  { value: "10+", label: "Wellness Tools" },
  { value: "24/7", label: "AI Support" },
  { value: "100%", label: "Private & Safe" },
  { value: "Free", label: "Always" },
];

const features = [
  {
    icon: "🤖",
    title: "Talk to Emotica",
    description: "An AI companion that listens without judgment, available any time you need to be heard.",
    color: "from-purple-500 to-violet-600",
    link: "/emotica",
    tag: "AI Chat",
  },
  {
    icon: "🧪",
    title: "Mental Wellness Assessment",
    description: "10 holistic questions to understand your emotional state and get a personalised recommendation.",
    color: "from-indigo-500 to-purple-600",
    link: null,
    tag: "Assessment",
    action: "start",
  },
  {
    icon: "✍️",
    title: "Private Journal",
    description: "Write your thoughts freely in a beautiful, encrypted-feeling digital diary.",
    color: "from-amber-500 to-orange-500",
    link: "/journal",
    tag: "Journal",
  },
  {
    icon: "🌬️",
    title: "Breathing & Meditation",
    description: "Guided breathing patterns and a clean meditation timer to reset your nervous system.",
    color: "from-teal-500 to-cyan-500",
    link: "/apps/breathing",
    tag: "Calm",
  },
  {
    icon: "🎶",
    title: "Ambient Sounds",
    description: "Layer rain, brown noise, binaural beats — build your perfect focus or sleep atmosphere.",
    color: "from-blue-500 to-indigo-500",
    link: "/apps/sounds",
    tag: "Sounds",
  },
  {
    icon: "📅",
    title: "Habit Builder",
    description: "Track small daily habits with streaks and gentle accountability — change starts here.",
    color: "from-emerald-500 to-teal-500",
    link: "/apps/habits",
    tag: "Habits",
  },
];

export default function Index() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [assessmentState, setAssessmentState] = useState<AssessmentState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const startAssessment = async () => {
    setAssessmentState("fetching");
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/assessment/questions");
      if (!response.ok) throw new Error("Could not start the assessment. Please try again.");
      const data: Question[] = await response.json();
      setQuestions(data);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setResult(null);
      setSelectedOption(null);
      setAssessmentState("active");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAssessmentState("idle");
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedOption(answer);
    setTimeout(() => {
      const newAnswers = [...userAnswers, answer];
      setUserAnswers(newAnswers);
      setSelectedOption(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        submitAssessment(newAnswers);
      }
    }, 350);
  };

  const submitAssessment = async (finalAnswers: string[]) => {
    setAssessmentState("submitting");
    setError(null);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      if (!response.ok) throw new Error("Could not process your results.");
      const data: Result = await response.json();
      setResult(data);
      setAssessmentState("complete");
      fetch("/api/assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: data.mood, description: data.description, suggestion: data.suggestion,
          suggestedAppId: data.suggestedAppId, totalScore: data.totalScore, answers: finalAnswers,
        }),
      }).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAssessmentState("active");
    }
  };

  const resetAssessment = () => {
    setAssessmentState("idle");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setResult(null);
    setSelectedOption(null);
  };

  // ── Assessment active ─────────────────────────────────────────────────────
  if (assessmentState === "active" && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0f1e 0%, #1a0533 60%, #0d1a3a 100%)" }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          <div className="absolute bottom-1/3 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
        </div>

        <div className="w-full max-w-2xl relative z-10">
          <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-white/40 text-sm font-medium tracking-wider uppercase">Emotional Check-in</span>
            <span className="text-white/60 text-sm">{currentQuestionIndex + 1} / {questions.length}</span>
          </motion.div>

          <div className="w-full h-1.5 bg-white/10 rounded-full mb-10 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)" }}
              initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-10">
            {questions.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${
                i < currentQuestionIndex ? "w-2 h-2 bg-purple-400" : i === currentQuestionIndex ? "w-6 h-2 bg-purple-500" : "w-2 h-2 bg-white/15"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: "easeInOut" }} className="rounded-3xl p-8 sm:p-10 backdrop-blur-xl border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-8 text-center">{currentQuestion.question}</h2>
              <div className="space-y-3">
                {currentQuestion.options.map((opt) => (
                  <motion.button key={opt.text} onClick={() => handleAnswerSelect(opt.text)} disabled={selectedOption !== null}
                    whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.98 }}
                    className={["w-full text-left px-6 py-4 rounded-2xl font-medium text-sm transition-all duration-200 border",
                      selectedOption === opt.text
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-purple-500/40 hover:text-white",
                    ].join(" ")}>
                    {opt.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <motion.button onClick={resetAssessment} className="mt-6 text-white/30 hover:text-white/60 text-sm transition-colors mx-auto block" whileHover={{ scale: 1.05 }}>
            ← Cancel
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Submitting loader ─────────────────────────────────────────────────────
  if (assessmentState === "submitting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(135deg, #0d0f1e 0%, #1a0533 60%, #0d1a3a 100%)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-14 h-14 rounded-full border-4 border-purple-500/30 border-t-purple-500 mb-6" />
        <p className="text-white/60 text-lg">Analysing your responses…</p>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (assessmentState === "complete" && result) {
    const config = moodConfig[result.mood] ?? { emoji: "💜", accent: "#a855f7", glow: "rgba(168,85,247,0.3)" };

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0f1e 0%, #1a0533 60%, #0d1a3a 100%)" }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-25 animate-orb-pulse"
            style={{ background: `radial-gradient(circle, ${config.glow}, transparent)` }} />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15 animate-orb-pulse"
            style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
        </div>

        <motion.div className="relative z-10 w-full max-w-lg" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <motion.div className="text-8xl text-center mb-4" animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
            {config.emoji}
          </motion.div>

          <div className="rounded-3xl p-8 sm:p-10 backdrop-blur-xl border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.06)", boxShadow: `0 0 60px ${config.glow}` }}>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Your Check-in Result</p>
            <h2 className="text-3xl font-extrabold mb-4" style={{ color: config.accent }}>{result.mood}</h2>
            <p className="text-white/70 leading-relaxed mb-8">{result.description}</p>

            {result.suggestedAppId && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/smallapps?highlight=${result.suggestedAppId}`)}
                className="cursor-pointer rounded-2xl p-5 text-left mb-6 border transition-all duration-200"
                style={{ background: `${config.glow}`, borderColor: `${config.accent}50` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: config.accent }}>
                  ✨ Suggested for you — tap to explore
                </p>
                <p className="text-white/80 text-sm leading-relaxed">{result.suggestion}</p>
                <div className="flex items-center mt-3 text-sm font-semibold" style={{ color: config.accent }}>
                  <span>Open the wellness tool</span>
                  <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>→</motion.span>
                </div>
              </motion.div>
            )}

            <motion.button onClick={resetAssessment} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-2xl font-semibold text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
              Done
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Landing page ──────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden">

        {/* Full-bleed background image */}
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F6633200b88854ecb85d819712761f1b4%2F7454e5b05c4045b5891a0d2796ffad2f?format=webp&width=800"
          alt="Hands reaching towards the sky"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Deep gradient overlays — darkens image while preserving mood */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,8,24,0.45) 0%, rgba(13,15,30,0.55) 40%, rgba(26,5,51,0.75) 75%, #0d0f1e 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,15,30,0.3) 0%, transparent 50%, rgba(13,15,30,0.3) 100%)" }} />

        {/* Animated purple/blue orbs layered on top of image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-orb-pulse"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          <div className="absolute bottom-1/3 right-1/6 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 animate-orb-pulse"
            style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "3s" }} />
        </div>

        <div className="relative z-10 px-6 w-full max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: "easeOut" }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm text-purple-300 text-sm font-medium mb-10"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI-Powered Mental Wellness
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-extrabold tracking-tight leading-[0.9] text-5xl sm:text-7xl md:text-8xl lg:text-[6rem] mb-6"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #e0c3fc 40%, #a855f7 70%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Feel Better,<br />
              <span style={{
                background: "linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #60a5fa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Every Day</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-white/55 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-12"
            >
              Emotica is your personal AI companion for mental wellness — offering emotional check-ins, breathing tools, journaling, ambient sounds, and a supportive AI chat, all in one place.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <motion.button
                onClick={startAssessment}
                disabled={assessmentState === "fetching"}
                whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(168,85,247,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="relative rounded-full px-10 py-4 font-bold text-white text-base overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 30px rgba(168,85,247,0.35)" }}
              >
                {assessmentState === "fetching" ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Starting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Take the Wellness Check
                    <span>✨</span>
                  </span>
                )}
              </motion.button>

              <Link to="/emotica">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="rounded-full border border-white/20 bg-white/5 px-10 py-4 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:border-white/35 transition-all">
                  Talk to Emotica →
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-8 sm:gap-16"
            >
              {stats.map((s, i) => (
                <motion.div key={i} className="text-center" whileHover={{ scale: 1.08 }}>
                  <div className="text-2xl sm:text-3xl font-extrabold"
                    style={{ background: "linear-gradient(135deg, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {s.value}
                  </div>
                  <div className="text-white/35 text-xs mt-1 font-medium tracking-wider uppercase">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>

        {error && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 text-red-300 bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-3 text-sm">
            {error}
          </motion.p>
        )}
      </section>

      {/* ── Features Grid ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0d1a3a 0%, #0d0f1e 40%, #1a0533 70%, #0d0f1e 100%)" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-[100px] opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[80px] opacity-10" style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/8 text-purple-300 text-sm font-medium mb-6">
              <span>🌿</span> Everything You Need
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold"
              style={{ background: "linear-gradient(135deg, #fff 0%, #d8b4fe 60%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your Wellness Toolkit
            </h2>
            <p className="mt-5 text-white/45 text-lg max-w-2xl mx-auto">
              Every tool crafted with care to support your mental and emotional health — from a 2-minute check-in to a full journaling session.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative rounded-3xl p-7 border border-white/8 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/30 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)" }}
                onClick={() => {
                  if (f.action === "start") startAssessment();
                  else if (f.link) navigate(f.link);
                }}>

                {/* Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5 border border-white/10 bg-white/5 text-white/40">
                  {f.tag}
                </div>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 shadow-lg transition-all duration-300 group-hover:scale-110`}>
                  {f.icon}
                </div>

                <h3 className="text-lg font-bold text-white mb-2.5">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-5">{f.description}</p>

                <div className="flex items-center gap-1 text-purple-400 text-sm font-semibold group-hover:text-purple-300 transition-colors">
                  <span>{f.action === "start" ? "Start Now" : "Open"}</span>
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>→</motion.span>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(168,85,247,0.03))" }} />
              </motion.div>
            ))}
          </div>

          {/* View all */}
          <motion.div className="text-center mt-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
            <Link to="/smallapps">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="rounded-full border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all">
                View All 12 Wellness Tools →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How Emotica Helps ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#080b14" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Why People Love Emotica</h2>
            <p className="text-white/40 max-w-xl mx-auto">Built around how people actually feel — not how they're supposed to feel.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🔒", title: "Completely Private", desc: "Your data stays on your device. No accounts required to start. No data sold, ever." },
              { icon: "🧠", title: "Science-Backed Tools", desc: "Breathing techniques, gratitude journaling, and habit tracking are all evidence-based wellness practices." },
              { icon: "💬", title: "Always Available", desc: "2am anxiety or a midday slump — Emotica is there without appointment, judgment, or waitlists." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                className="rounded-3xl p-8 border border-white/6 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-white text-lg mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0f1e, #1a0533, #0d1a3a)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-20 animate-shimmer"
            style={{ background: "linear-gradient(120deg, transparent 0%, rgba(168,85,247,0.4) 50%, transparent 100%)", backgroundSize: "200% 100%" }} />
        </div>

        <motion.div className="relative z-10 max-w-3xl mx-auto text-center" initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>

          <div className="inline-block mb-6 text-5xl animate-float">💜</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
            Your wellbeing<br />
            <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              starts with one step.
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
            Take a 2-minute wellness check-in and let Emotica guide you to the right tool for how you're feeling right now.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button onClick={startAssessment} disabled={assessmentState === "fetching"}
              whileHover={{ scale: 1.06, boxShadow: "0 0 60px rgba(168,85,247,0.5)" }} whileTap={{ scale: 0.96 }}
              className="rounded-full px-10 py-4 font-bold text-white text-base transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 30px rgba(168,85,247,0.3)" }}>
              Begin Wellness Check ✨
            </motion.button>

            <motion.button onClick={() => setShowAuthModal(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="rounded-full border border-white/20 bg-white/5 px-10 py-4 text-base font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all">
              Create Free Account
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-4 sm:px-6 border-t border-white/5" style={{ background: "#05070f" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Emotica
            </span>
            <span className="text-white/20 text-sm">&copy; 2025 All rights reserved.</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Contact Us"].map((label) => (
              <a key={label} href="#" className="text-sm text-white/25 hover:text-white/60 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>

      <AuthPage isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
