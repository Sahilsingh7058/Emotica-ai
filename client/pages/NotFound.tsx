import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{
            background: "radial-gradient(circle, #2563eb, transparent)",
            animationDelay: "2s",
          }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-[9rem] sm:text-[12rem] font-black leading-none select-none"
          style={{
            background: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 40%, #a855f7 70%, #ffffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          404
        </motion.h1>

        <p className="text-white/60 text-lg mb-2">This page doesn't exist.</p>
        <p className="text-white/30 text-sm mb-10">
          The route <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">{location.pathname}</code> could not be found.
        </p>

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 rounded-2xl font-semibold text-white text-sm shadow-xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              boxShadow: "0 0 30px rgba(168,85,247,0.35)",
            }}
          >
            ← Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
