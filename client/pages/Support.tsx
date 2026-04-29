import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const faqs = [
  {
    question: "What is Emotica AI?",
    answer:
      "Emotica AI is a voice-based mental wellness assistant designed to provide emotional support and guidance through private, non-judgmental conversations. It offers digital journaling, guided meditations, and a community forum.",
  },
  {
    question: "Is my data private and secure?",
    answer:
      "Yes, we take your privacy very seriously. All conversations and journal entries are securely stored and encrypted. We do not share your personal data with any third parties.",
  },
  {
    question: "Is this a substitute for a therapist?",
    answer:
      "No. Emotica AI is a supportive tool for general self-care, not a replacement for professional mental health care. If you're experiencing a crisis, please reach out to a qualified professional.",
  },
  {
    question: "How do I get started?",
    answer:
      "Click 'Ask Emotica' on the homepage to start a conversation, or explore the Small Apps section for tools like guided breathing and journaling.",
  },
  {
    question: "What languages does Emotica AI support?",
    answer:
      "Currently Emotica AI primarily supports English. We're actively working to add more languages in the future.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        open ? "border-purple-500/30 bg-purple-500/5" : "border-white/8 bg-white/3"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-5 text-left gap-4"
      >
        <span className="text-white/85 font-semibold text-sm">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-purple-400 text-xl font-light flex-shrink-0 leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <p className="px-5 pb-5 text-white/55 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-purple-500/50 transition-colors";

export default function Support() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-sm font-medium mb-5">
            <span>🛟</span> Help Centre
          </div>
          <h1
            className="text-5xl sm:text-6xl font-extrabold"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Support
          </h1>
          <p className="mt-4 text-white/50 max-w-md mx-auto">
            We're here to help you on your wellness journey.
          </p>
        </motion.div>

        {/* FAQ */}
        <motion.section
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-5">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FAQItem key={i} q={f.question} a={f.answer} />
            ))}
          </div>
        </motion.section>

        {/* Contact form */}
        <motion.section
          className="rounded-3xl p-8 backdrop-blur-xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-2">Contact Us</h2>
          <p className="text-white/40 text-sm mb-7">
            Didn't find what you were looking for? Send us a message.
          </p>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="text-5xl mb-4">💜</div>
                <p className="text-white font-semibold text-lg">Message sent!</p>
                <p className="text-white/50 text-sm mt-2">We'll get back to you as soon as possible.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className={inputClass}
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  required
                  className={`${inputClass} resize-none`}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                >
                  Send Message
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </div>
  );
}
