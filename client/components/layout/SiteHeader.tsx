import { NavLink } from "react-router-dom";
import Logo from "@/components/Logo";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "@/pages/AuthPage";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/journal", label: "Journal", end: false },
  { to: "/community", label: "Community", end: false },
  { to: "/smallapps", label: "Apps", end: false },
  { to: "/dashboard", label: "Dashboard", end: false },
  { to: "/emotion-analysis", label: "Emotions", end: false },
  { to: "/support", label: "Support", end: false },
];

export default function SiteHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={["fixed top-0 inset-x-0 z-50 transition-all duration-400",
          isScrolled ? "backdrop-blur-xl border-b border-white/10" : "bg-transparent"].join(" ")}
        style={isScrolled ? { background: "rgba(13,15,30,0.85)" } : undefined}>

        <div className="mx-auto w-full max-w-7xl px-6 py-4 flex items-center justify-between">
          <NavLink to="/" className="flex-shrink-0"><Logo /></NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => [
                  "px-4 py-2 rounded-xl text-sm font-medium tracking-wide transition-all duration-200",
                  isActive ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/8",
                ].join(" ")}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side — auth + streak */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(p => !p)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white/80 text-sm font-medium">{user.name.split(" ")[0]}</span>
                  {user.streak > 0 && (
                    <span className="text-xs text-amber-400 font-semibold">🔥 {user.streak}</span>
                  )}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/10 overflow-hidden z-50"
                        style={{ background: "rgba(13,9,30,0.97)", backdropFilter: "blur(20px)" }}>
                        <div className="px-4 py-3 border-b border-white/8">
                          <p className="text-white text-sm font-semibold">{user.name}</p>
                          <p className="text-white/40 text-xs">{user.email}</p>
                        </div>
                        <NavLink to="/dashboard" onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                          📊 Dashboard
                        </NavLink>
                        <NavLink to="/profile" onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                          👤 Profile
                        </NavLink>
                        <button onClick={() => { logout(); setShowUserMenu(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button onClick={() => setShowAuth(true)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                Sign In
              </motion.button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Toggle menu">
            <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-white rounded-full origin-center" transition={{ duration: 0.2 }} />
            <motion.span animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 bg-white rounded-full" transition={{ duration: 0.15 }} />
            <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-white rounded-full origin-center" transition={{ duration: 0.2 }} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-72 z-50 border-l border-white/10 flex flex-col pt-24 pb-8 px-6"
              style={{ background: "rgba(13,15,30,0.97)", backdropFilter: "blur(24px)" }}>

              {/* Mobile user badge */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 mb-6 px-1 pb-4 border-b border-white/8">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user.name}</p>
                    {user.streak > 0 && <p className="text-amber-400 text-xs">🔥 {user.streak} day streak</p>}
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => [
                      "px-4 py-3.5 rounded-xl text-sm font-medium transition-all",
                      isActive ? "text-white bg-purple-600/30 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/8",
                    ].join(" ")}>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4">
                {isAuthenticated ? (
                  <button onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 transition-all">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => { setShowAuth(true); setMenuOpen(false); }}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                    Sign In / Register
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthPage isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
