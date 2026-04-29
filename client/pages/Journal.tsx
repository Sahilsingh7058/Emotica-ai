import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useApiFetch } from "@/context/AuthContext";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface JournalEntry {
  id: number | string;
  content: string;
  mood_tag: string | null;
  created_at: string;
  local?: boolean;
}

const MOOD_TAGS = [
  { label: "😊 Good", value: "good" },
  { label: "😔 Sad", value: "sad" },
  { label: "😤 Frustrated", value: "frustrated" },
  { label: "😰 Anxious", value: "anxious" },
  { label: "🧘 Calm", value: "calm" },
  { label: "🤔 Reflective", value: "reflective" },
];

const MOOD_COLOR: Record<string, string> = {
  good: "#10b981", sad: "#60a5fa", frustrated: "#f97316",
  anxious: "#a855f7", calm: "#0d9488", reflective: "#f59e0b",
};

export default function Journal() {
  const { isAuthenticated } = useAuth();
  const apiFetch = useApiFetch();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      apiFetch<JournalEntry[]>("/api/journal")
        .then(setEntries)
        .catch(() => {
          const local = localStorage.getItem("journalEntries");
          if (local) setEntries(JSON.parse(local));
        })
        .finally(() => setLoading(false));
    } else {
      const local = localStorage.getItem("journalEntries");
      if (local) setEntries(JSON.parse(local));
    }
  }, [isAuthenticated]);

  const saveEntry = useCallback(async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (isAuthenticated) {
        const entry = await apiFetch<JournalEntry>("/api/journal", {
          method: "POST",
          body: JSON.stringify({ content: text.trim(), mood_tag: selectedMood }),
        });
        setEntries(prev => [entry, ...prev]);
      } else {
        const entry: JournalEntry = {
          id: Date.now().toString(),
          content: text.trim(),
          mood_tag: selectedMood,
          created_at: new Date().toISOString(),
          local: true,
        };
        const updated = [entry, ...entries].slice(0, 50);
        setEntries(updated);
        localStorage.setItem("journalEntries", JSON.stringify(updated));
      }
      setText("");
      setSelectedMood(null);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  }, [text, selectedMood, isAuthenticated, entries, apiFetch]);

  const deleteEntry = useCallback(async (id: number | string) => {
    if (isAuthenticated && typeof id === "number") {
      await apiFetch(`/api/journal/${id}`, { method: "DELETE" }).catch(() => {});
    } else {
      const updated = entries.filter(e => e.id !== id);
      localStorage.setItem("journalEntries", JSON.stringify(updated));
    }
    setEntries(prev => prev.filter(e => e.id !== id));
  }, [isAuthenticated, entries, apiFetch]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #d97706, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-amber-300 text-sm font-medium mb-5">
            <span>✍️</span> Private Journal
            {isAuthenticated && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">Synced</span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold"
            style={{ background: "linear-gradient(135deg, #fff, #fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Your Journal
          </h1>
          <p className="mt-3 text-white/40 text-sm">
            {isAuthenticated ? "Entries are saved securely to your account." : "Sign in to sync your entries across devices."}
          </p>
        </motion.div>

        {/* Write box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 backdrop-blur-xl border border-white/10 mb-6"
          style={{ background: "rgba(255,255,255,0.05)" }}>

          <div className="flex flex-wrap gap-2 mb-4">
            {MOOD_TAGS.map((m) => (
              <button key={m.value} onClick={() => setSelectedMood(selectedMood === m.value ? null : m.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={selectedMood === m.value
                  ? { background: `${MOOD_COLOR[m.value]}25`, borderColor: `${MOOD_COLOR[m.value]}60`, color: MOOD_COLOR[m.value] }
                  : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}>
                {m.label}
              </button>
            ))}
          </div>

          <textarea value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) saveEntry(); }}
            placeholder="What's on your mind today? Write freely — this is your space..."
            rows={5}
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none border border-white/10 resize-none transition-colors mb-4"
            style={{ background: "rgba(255,255,255,0.08)", color: "white" }} />

          <div className="flex items-center justify-between">
            <p className="text-white/20 text-xs">Ctrl + Enter to save</p>
            <motion.button onClick={saveEntry} disabled={!text.trim() || saving}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}>
              {saving ? "Saving…" : "Save Entry"}
            </motion.button>
          </div>

          <AnimatePresence>
            {savedFeedback && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-amber-400 text-sm text-center mt-3">
                ✓ Entry saved{isAuthenticated ? " to your account" : ""}!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Entry list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-24 bg-white/5 animate-pulse" />)}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-center text-white/25 text-sm py-12">No entries yet — start writing above.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-1">
              {entries.length} entr{entries.length === 1 ? "y" : "ies"}
            </p>
            <AnimatePresence>
              {entries.map((entry, i) => (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl px-5 py-4 border border-white/8 group relative"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {entry.mood_tag && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{ color: MOOD_COLOR[entry.mood_tag] ?? "white", borderColor: `${MOOD_COLOR[entry.mood_tag] ?? "white"}40`, background: `${MOOD_COLOR[entry.mood_tag] ?? "white"}15` }}>
                          {MOOD_TAGS.find(m => m.value === entry.mood_tag)?.label ?? entry.mood_tag}
                        </span>
                      )}
                    </div>
                    <button onClick={() => deleteEntry(entry.id)}
                      className="text-white/0 group-hover:text-white/30 hover:text-red-400 transition-all text-lg leading-none flex-shrink-0">
                      ×
                    </button>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  <p className="text-white/25 text-xs mt-2">{formatDate(entry.created_at)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
