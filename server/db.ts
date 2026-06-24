import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "emotica.sqlite");
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    UNIQUE NOT NULL,
    name        TEXT    NOT NULL,
    password_hash TEXT,
    avatar_url  TEXT,
    streak      INTEGER DEFAULT 0,
    last_active TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assessment_responses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    mood            TEXT    NOT NULL,
    description     TEXT    NOT NULL,
    suggestion      TEXT    NOT NULL,
    suggested_app_id TEXT,
    total_score     INTEGER,
    answers         TEXT    NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT    NOT NULL,
    mood_tag   TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_usage (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id     TEXT    NOT NULL,
    app_name   TEXT    NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    opened_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS streaks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak  INTEGER DEFAULT 0,
    longest_streak  INTEGER DEFAULT 0,
    last_checkin    TEXT,
    total_days      INTEGER DEFAULT 0,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enabled    INTEGER DEFAULT 1,
    hour       INTEGER DEFAULT 9,
    minute     INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender     TEXT NOT NULL,
    text       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS habits (
    id           TEXT PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    emoji        TEXT NOT NULL,
    streak       INTEGER DEFAULT 0,
    last_checked TEXT,
    checks       TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_assessment_user ON assessment_responses(user_id);
  CREATE INDEX IF NOT EXISTS idx_assessment_created ON assessment_responses(created_at);
  CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
  CREATE INDEX IF NOT EXISTS idx_app_usage_user ON app_usage(user_id);
  CREATE INDEX IF NOT EXISTS idx_app_usage_app ON app_usage(app_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
  CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);

  CREATE TABLE IF NOT EXISTS emotion_analyses (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text          TEXT    NOT NULL,
    emotion       TEXT    NOT NULL,
    confidence    REAL    NOT NULL,
    probabilities TEXT    NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_emotion_user ON emotion_analyses(user_id);
  CREATE INDEX IF NOT EXISTS idx_emotion_created ON emotion_analyses(created_at);
`);

// ─── Migrations — safely add columns that may be missing from older DBs ───────
const existingUserCols = (db.prepare("PRAGMA table_info(users)").all() as any[]).map(c => c.name);
const addIfMissing = (col: string, def: string) => {
  if (!existingUserCols.includes(col)) {
    db.exec(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
  }
};
addIfMissing("password_hash", "TEXT");
addIfMissing("avatar_url",    "TEXT");
addIfMissing("streak",        "INTEGER DEFAULT 0");
addIfMissing("last_active",   "TEXT");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  avatar_url: string | null;
  streak: number;
  last_active: string | null;
  created_at: string;
}

export interface AssessmentData {
  userId?: number;
  mood: string;
  description: string;
  suggestion: string;
  suggestedAppId?: string;
  totalScore?: number;
  answers: string[];
}

export interface JournalEntry {
  id: number;
  user_id: number;
  content: string;
  mood_tag: string | null;
  created_at: string;
  updated_at: string;
}

// ─── User functions ────────────────────────────────────────────────────────────

export function createUser(email: string, name: string, passwordHash: string): number | bigint {
  const stmt = db.prepare(`
    INSERT INTO users (email, name, password_hash, last_active) VALUES (?, ?, ?, datetime('now'))
  `);
  const r = stmt.run(email, name, passwordHash);

  // Initialise streak row
  db.prepare(`INSERT OR IGNORE INTO streaks (user_id) VALUES (?)`).run(r.lastInsertRowid);
  return r.lastInsertRowid;
}

export function getUserByEmail(email: string): DbUser | undefined {
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as DbUser | undefined;
}

export function getUserById(id: number): DbUser | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as DbUser | undefined;
}

export function touchUserActive(userId: number): void {
  db.prepare(`UPDATE users SET last_active = datetime('now') WHERE id = ?`).run(userId);
}

export function updateUserProfile(id: number, name: string, email: string): void {
  db.prepare(`UPDATE users SET name = ?, email = ? WHERE id = ?`).run(name, email, id);
}

export function updateUserPassword(id: number, passwordHash: string): void {
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(passwordHash, id);
}

export function getUserWellnessStats(userId: number) {
  const journals = db.prepare(`SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ?`).get(userId) as { count: number };
  const assessments = db.prepare(`SELECT COUNT(*) as count FROM assessment_responses WHERE user_id = ?`).get(userId) as { count: number };
  const emotions = db.prepare(`SELECT COUNT(*) as count FROM emotion_analyses WHERE user_id = ?`).get(userId) as { count: number };
  return {
    journals: journals?.count ?? 0,
    assessments: assessments?.count ?? 0,
    emotions: emotions?.count ?? 0,
  };
}

// ─── Assessment functions ──────────────────────────────────────────────────────

export function saveAssessmentResponse(data: AssessmentData): number | bigint {
  const stmt = db.prepare(`
    INSERT INTO assessment_responses
      (user_id, mood, description, suggestion, suggested_app_id, total_score, answers)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const r = stmt.run(
    data.userId ?? null,
    data.mood,
    data.description,
    data.suggestion,
    data.suggestedAppId ?? null,
    data.totalScore ?? null,
    JSON.stringify(data.answers),
  );

  // Update streak if user is logged in
  if (data.userId) updateStreak(data.userId);
  return r.lastInsertRowid;
}

export function getAssessmentHistory(userId: number, limit = 30) {
  return db.prepare(`
    SELECT id, mood, total_score, suggested_app_id, created_at
    FROM assessment_responses
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit);
}

export function getMoodStats(userId: number) {
  const avg = db.prepare(`
    SELECT AVG(total_score) as avg_score, COUNT(*) as total
    FROM assessment_responses WHERE user_id = ?
  `).get(userId) as { avg_score: number | null; total: number };

  const moodCounts = db.prepare(`
    SELECT mood, COUNT(*) as count
    FROM assessment_responses WHERE user_id = ?
    GROUP BY mood ORDER BY count DESC
  `).all(userId) as Array<{ mood: string; count: number }>;

  const weekly = db.prepare(`
    SELECT DATE(created_at) as date, AVG(total_score) as avg_score
    FROM assessment_responses
    WHERE user_id = ? AND created_at >= date('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all(userId) as Array<{ date: string; avg_score: number }>;

  const topApps = db.prepare(`
    SELECT app_id, app_name, COUNT(*) as opens
    FROM app_usage WHERE user_id = ?
    GROUP BY app_id ORDER BY opens DESC LIMIT 5
  `).all(userId) as Array<{ app_id: string; app_name: string; opens: number }>;

  return { avg_score: avg.avg_score, total_assessments: avg.total, mood_counts: moodCounts, weekly_trend: weekly, top_apps: topApps };
}

// ─── Journal functions ─────────────────────────────────────────────────────────

export function getJournalEntries(userId: number, limit = 50) {
  return db.prepare(`
    SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit) as JournalEntry[];
}

export function createJournalEntry(userId: number, content: string, moodTag?: string): number | bigint {
  const r = db.prepare(`
    INSERT INTO journal_entries (user_id, content, mood_tag) VALUES (?, ?, ?)
  `).run(userId, content, moodTag ?? null);
  updateStreak(userId);
  return r.lastInsertRowid;
}

export function updateJournalEntry(id: number, userId: number, content: string, moodTag?: string): boolean {
  const r = db.prepare(`
    UPDATE journal_entries SET content = ?, mood_tag = ?, updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(content, moodTag ?? null, id, userId);
  return r.changes > 0;
}

export function deleteJournalEntry(id: number, userId: number): boolean {
  const r = db.prepare(`DELETE FROM journal_entries WHERE id = ? AND user_id = ?`).run(id, userId);
  return r.changes > 0;
}

// ─── App usage tracking ────────────────────────────────────────────────────────

export function logAppUsage(userId: number, appId: string, appName: string, durationSeconds: number) {
  db.prepare(`
    INSERT INTO app_usage (user_id, app_id, app_name, duration_seconds) VALUES (?, ?, ?, ?)
  `).run(userId, appId, appName, durationSeconds);
}

// ─── Streak functions ──────────────────────────────────────────────────────────

export function updateStreak(userId: number): void {
  const today = new Date().toDateString();
  const row = db.prepare(`SELECT * FROM streaks WHERE user_id = ?`).get(userId) as any;
  if (!row) return;

  if (row.last_checkin === today) return; // Already checked in today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = row.last_checkin === yesterday.toDateString();

  const newStreak = wasYesterday ? row.current_streak + 1 : 1;
  const longest = Math.max(newStreak, row.longest_streak);

  db.prepare(`
    UPDATE streaks SET current_streak = ?, longest_streak = ?, last_checkin = ?,
    total_days = total_days + 1, updated_at = datetime('now') WHERE user_id = ?
  `).run(newStreak, longest, today, userId);

  db.prepare(`UPDATE users SET streak = ? WHERE id = ?`).run(newStreak, userId);
}

export function getStreak(userId: number) {
  return db.prepare(`SELECT * FROM streaks WHERE user_id = ?`).get(userId);
}

// ─── Chat functions ───────────────────────────────────────────────────────────

export interface ChatMessage {
  id: number;
  user_id: number;
  sender: string;
  text: string;
  created_at: string;
}

export function getChatHistory(userId: number, limit = 50): ChatMessage[] {
  return db.prepare(`
    SELECT * FROM chat_messages 
    WHERE user_id = ? 
    ORDER BY created_at ASC 
    LIMIT ?
  `).all(userId, limit) as ChatMessage[];
}

export function saveChatMessage(userId: number, sender: string, text: string): number | bigint {
  const stmt = db.prepare(`
    INSERT INTO chat_messages (user_id, sender, text) 
    VALUES (?, ?, ?)
  `);
  const r = stmt.run(userId, sender, text);
  return r.lastInsertRowid;
}

export function clearChatHistory(userId: number): boolean {
  const r = db.prepare(`DELETE FROM chat_messages WHERE user_id = ?`).run(userId);
  return r.changes > 0;
}

// ─── Habit functions ───────────────────────────────────────────────────────────

export interface DbHabit {
  id: string;
  user_id: number;
  name: string;
  emoji: string;
  streak: number;
  last_checked: string;
  checks: string; // JSON string
  created_at: string;
}

export function getHabits(userId: number): DbHabit[] {
  return db.prepare(`SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as DbHabit[];
}

export function saveHabit(userId: number, habit: { id: string; name: string; emoji: string }): void {
  db.prepare(`
    INSERT INTO habits (id, user_id, name, emoji, streak, last_checked, checks)
    VALUES (?, ?, ?, ?, 0, '', '[]')
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, emoji = excluded.emoji
  `).run(habit.id, userId, habit.name, habit.emoji);
}

export function updateHabitProgress(userId: number, habitId: string, streak: number, lastChecked: string, checks: string): void {
  db.prepare(`
    UPDATE habits SET streak = ?, last_checked = ?, checks = ?
    WHERE id = ? AND user_id = ?
  `).run(streak, lastChecked, checks, habitId, userId);
}

export function deleteHabit(userId: number, habitId: string): void {
  db.prepare(`DELETE FROM habits WHERE id = ? AND user_id = ?`).run(habitId, userId);
}

// ─── Emotion Analysis functions ─────────────────────────────────────────────

export interface DbEmotionAnalysis {
  id: number;
  user_id: number;
  text: string;
  emotion: string;
  confidence: number;
  probabilities: string;
  created_at: string;
}

export function saveEmotionAnalysis(
  userId: number,
  text: string,
  emotion: string,
  confidence: number,
  probabilities: Record<string, number>,
): number | bigint {
  const stmt = db.prepare(`
    INSERT INTO emotion_analyses (user_id, text, emotion, confidence, probabilities)
    VALUES (?, ?, ?, ?, ?)
  `);
  const r = stmt.run(userId, text, emotion, confidence, JSON.stringify(probabilities));
  return r.lastInsertRowid;
}

export function getEmotionAnalyses(userId: number, limit = 200) {
  return db.prepare(`
    SELECT * FROM emotion_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit) as DbEmotionAnalysis[];
}

export default db;
