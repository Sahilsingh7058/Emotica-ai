import { motion } from "framer-motion";

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
    <h2 className="text-xs font-bold text-white/80 mb-5 uppercase tracking-wider">
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
  const firstName = localStorage.getItem("userFirstName") ?? "Guest";
  const lastName = localStorage.getItem("userLastName") ?? "";
  const email = localStorage.getItem("userEmail") ?? "Not signed in";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName[0] ?? "G"}${lastName[0] ?? ""}`.toUpperCase();

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
            className="text-3xl font-extrabold mb-1"
            style={{
              background: "linear-gradient(135deg, #fff, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {fullName}
          </h1>
          <p className="text-white/40 text-sm mb-4">{email}</p>
          <p className="text-white/50 text-sm max-w-xs leading-relaxed">
            On a journey to prioritise mental and emotional wellness. Finding peace one day at a time.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Member since October 2024
          </div>
        </motion.div>

        {/* Account settings */}
        <Section title="Account Settings" delay={0.1}>
          <Row label="Full Name" value={fullName} />
          <Row label="Email" value={email} />
          <Row label="Password" value="••••••••" />
          <Row
            label="Notifications"
            action={
              <button
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
              >
                Edit
              </button>
            }
          />
        </Section>

        {/* Stats */}
        <Section title="Your Wellness Data" delay={0.2}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Journal Entries", value: "12", icon: "✍️" },
              { label: "Moods Logged", value: "35", icon: "😊" },
              { label: "Sessions", value: "8", icon: "🧘" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 text-center border border-white/8 bg-white/3"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div
                  className="text-2xl font-extrabold"
                  style={{
                    background: "linear-gradient(135deg, #fff, #a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <Row
            label="Usage Analytics"
            action={
              <button className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 transition-colors">
                View
              </button>
            }
          />
        </Section>
      </div>
    </div>
  );
}
