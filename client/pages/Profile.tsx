import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useApiFetch } from "@/context/AuthContext";
import AuthPage from "./AuthPage";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Shield,
  Loader2,
  Calendar,
  Edit3,
  Save,
  X,
  FileText,
  Smile,
  BarChart2,
  Settings,
  Sparkles
} from "lucide-react";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const Section = ({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    className="rounded-3xl p-7 backdrop-blur-xl border border-white/10"
    style={{ background: "rgba(255,255,255,0.04)" }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <h2 className="text-xs font-bold text-white/80 mb-5 uppercase tracking-wider flex items-center gap-2">
      <Settings className="w-4 h-4 text-purple-400" />
      {title}
    </h2>
    {children}
  </motion.div>
);

const Row = ({
  label,
  value,
  action,
}: {
  label: string;
  value?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3.5 border-b border-white/6 last:border-0">
    <span className="text-white/40 text-sm">{label}</span>
    {value && <span className="text-white/70 text-sm font-medium">{value}</span>}
    {action}
  </div>
);

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const apiFetch = useApiFetch();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState<{ journals: number; assessments: number; emotions: number } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Edit form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load stats and set initial form values
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword("");
      setIsLoadingStats(true);

      apiFetch<{ journals: number; assessments: number; emotions: number }>("/api/auth/profile-stats")
        .then((data) => {
          setStats(data);
        })
        .catch((err) => {
          console.error("Failed to load profile stats:", err);
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    } else {
      setStats(null);
    }
  }, [user, apiFetch]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiFetch<{ success: boolean; token: string; user: any }>("/api/auth/update-profile", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password ? password : undefined,
        }),
      });

      if (response.success) {
        localStorage.setItem("emotica_token", response.token);
        await refreshUser();
        setIsEditing(false);
        setPassword("");
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to format join date
  const getJoinDate = () => {
    if (!user?.created_at) return "October 2024";
    try {
      const date = new Date(user.created_at);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return "October 2024";
    }
  };

  const fullName = user?.name ?? "Guest";
  const emailVal = user?.email ?? "Not signed in";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "G";

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{
            background: "radial-gradient(circle, #2563eb, transparent)",
            animationDelay: "2.5s",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {!user ? (
          /* Locked State / Guest Mode */
          <motion.div
            className="rounded-3xl p-10 backdrop-blur-xl border border-white/10 text-center space-y-6 shadow-2xl"
            style={{ background: "rgba(255,255,255,0.03)" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
              <Shield className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-white">Unlock Your Profile</h1>
              <p className="text-white/60 max-w-sm mx-auto text-sm leading-relaxed">
                Log in or register to track your wellness journey, save your progress, and view personalized emotional analytics.
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-3.5 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center gap-2 mx-auto"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  boxShadow: "0 10px 25px rgba(124, 58, 237, 0.3)",
                }}
              >
                <Sparkles className="w-4 h-4" />
                Sign In / Register
              </button>
            </div>
          </motion.div>
        ) : (
          /* Profile Mode */
          <>
            {/* Avatar card */}
            <motion.div
              className="rounded-3xl p-8 backdrop-blur-xl border border-white/10 flex flex-col items-center text-center"
              style={{ background: "rgba(255,255,255,0.05)" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Avatar ring */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white mb-5 shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7, #6366f1)",
                  boxShadow: "0 0 40px rgba(168,85,247,0.4)",
                }}
              >
                {initials}
              </div>

              <h1
                className="text-3xl font-extrabold mb-1 tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #fff, #c4b5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {fullName}
              </h1>
              <p className="text-white/40 text-sm mb-4">{emailVal}</p>
              <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                On a journey to prioritise mental and emotional wellness. Finding peace one day at a time.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Member since {getJoinDate()}
              </div>
            </motion.div>

            {/* Account Settings / Edit Form */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <Section title="Account Settings" delay={0.1}>
                  <Row label="Full Name" value={fullName} />
                  <Row label="Email" value={emailVal} />
                  <Row label="Password" value="••••••••" />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setName(user.name);
                        setEmail(user.email);
                        setPassword("");
                        setIsEditing(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                  </div>
                </Section>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Section title="Edit Account Profile">
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                          placeholder="Your Name"
                          required
                          disabled={isSaving}
                        />
                      </div>

                      {/* Email input */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-purple-400" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                          placeholder="your.email@example.com"
                          required
                          disabled={isSaving}
                        />
                      </div>

                      {/* Password input */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-white/40 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-purple-400" />
                          New Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-all"
                          placeholder="Leave blank to keep current password"
                          disabled={isSaving}
                          minLength={6}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white/60 border border-white/10 bg-transparent hover:bg-white/5 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white border border-purple-500/40 bg-purple-600/30 hover:bg-purple-600/50 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats */}
            <Section title="Your Wellness Data" delay={0.2}>
              <div className="grid grid-cols-3 gap-4">
                {isLoadingStats ? (
                  /* Loading placeholder pulse */
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl p-6 text-center border border-white/8 bg-white/3 animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 mx-auto mb-3" />
                      <div className="w-12 h-6 bg-white/10 mx-auto rounded mb-2" />
                      <div className="w-16 h-3 bg-white/5 mx-auto rounded" />
                    </div>
                  ))
                ) : (
                  <>
                    {/* Journal Entries */}
                    <div className="rounded-2xl p-4 text-center border border-white/8 bg-white/3 hover:bg-white/5 transition-all duration-300 group">
                      <div className="text-2xl mb-1 flex justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div
                        className="text-2xl font-extrabold"
                        style={{
                          background: "linear-gradient(135deg, #fff, #a855f7)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {stats?.journals ?? 0}
                      </div>
                      <div className="text-white/40 text-xs mt-1">Journal Entries</div>
                    </div>

                    {/* Moods Logged */}
                    <div className="rounded-2xl p-4 text-center border border-white/8 bg-white/3 hover:bg-white/5 transition-all duration-300 group">
                      <div className="text-2xl mb-1 flex justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <Smile className="w-6 h-6" />
                      </div>
                      <div
                        className="text-2xl font-extrabold"
                        style={{
                          background: "linear-gradient(135deg, #fff, #10b981)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {stats?.assessments ?? 0}
                      </div>
                      <div className="text-white/40 text-xs mt-1">Moods Logged</div>
                    </div>

                    {/* Emotion Analyses */}
                    <div className="rounded-2xl p-4 text-center border border-white/8 bg-white/3 hover:bg-white/5 transition-all duration-300 group">
                      <div className="text-2xl mb-1 flex justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <BarChart2 className="w-6 h-6" />
                      </div>
                      <div
                        className="text-2xl font-extrabold"
                        style={{
                          background: "linear-gradient(135deg, #fff, #3b82f6)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {stats?.emotions ?? 0}
                      </div>
                      <div className="text-white/40 text-xs mt-1">AI Analyses</div>
                    </div>
                  </>
                )}
              </div>
            </Section>
          </>
        )}
      </div>

      {/* Auth Page Modal (Controlled locally) */}
      <AuthPage isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
