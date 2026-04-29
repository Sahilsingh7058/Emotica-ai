import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface AuthPageProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "login" | "register";

export default function AuthPage({ isOpen, onClose }: AuthPageProps) {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => { setEmail(""); setName(""); setPassword(""); setError(null); setSuccess(false); };

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (mode === "register" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), name.trim(), password);
      }
      setSuccess(true);
      setTimeout(() => { onClose(); reset(); }, 900);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); onClose(); reset(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); reset(); } }}>
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

      <motion.div
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: "rgba(13,9,30,0.97)" }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7, #6366f1)" }} />

        <div className="p-8">
          {/* Close button */}
          <button onClick={() => { onClose(); reset(); }}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all text-lg">
            ×
          </button>

          {/* Logged-in state */}
          {isAuthenticated && user ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-3xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">{user.name}</h2>
              <p className="text-white/40 text-sm mb-3">{user.email}</p>
              {user.streak > 0 && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6">
                  🔥 {user.streak} day streak
                </div>
              )}
              <div className="space-y-3 mt-4">
                <button onClick={handleLogout}
                  className="w-full py-3 rounded-2xl font-semibold text-sm text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  Sign Out
                </button>
                <button onClick={() => { onClose(); reset(); }}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-2xl border border-white/10 bg-white/5 mb-7">
                {(["login", "register"] as Mode[]).map((m) => (
                  <button key={m} onClick={() => { setMode(m); reset(); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === m ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    style={mode === m ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" } : {}}>
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{ opacity: 0, x: mode === "login" ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  <h2 className="text-2xl font-extrabold text-white mb-6">
                    {mode === "login" ? "Welcome back" : "Join Emotica"}
                  </h2>

                  {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                      <div className="text-5xl mb-4">✅</div>
                      <p className="text-white font-semibold">{mode === "login" ? "Welcome back!" : "Account created!"}</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {mode === "register" && (
                        <div>
                          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Full Name</label>
                          <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-purple-500/60 transition-colors"
                            style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />
                        </div>
                      )}
                      <div>
                        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Email</label>
                        <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                          className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-purple-500/60 transition-colors"
                          style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />
                      </div>
                      <div>
                        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Password</label>
                        <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                          className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-purple-500/60 transition-colors"
                          style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />
                      </div>

                      {error && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                          {error}
                        </motion.p>
                      )}

                      <motion.button onClick={handleSubmit} disabled={loading}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-50 mt-2"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                              className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            {mode === "login" ? "Signing in…" : "Creating account…"}
                          </span>
                        ) : (
                          mode === "login" ? "Sign In" : "Create Account"
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
