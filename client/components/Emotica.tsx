import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo2 from "./img/Logo2.png";
import { useAuth } from "@/context/AuthContext";

declare global { interface Window { webkitSpeechRecognition: any } }

interface Message {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: Date;
}

interface GeminiPart { text: string }
interface GeminiContent { role: "user" | "model"; parts: GeminiPart[] }

const API_KEY = "AIzaSyA7370sbYTvrzpz_uHCO0HJ4nIsdW-E1Io";
const TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

// Detect emotional tone of user message
function detectTone(msg: string): "distressed" | "anxious" | "positive" | "neutral" {
  const lower = msg.toLowerCase();
  if (/\b(suicid|hurt myself|self.harm|kill|hopeless|can't go on|end it)\b/.test(lower)) return "distressed";
  if (/\b(anxious|panic|scared|overwhelm|stress|worry|nervous|can't breathe)\b/.test(lower)) return "anxious";
  if (/\b(happy|great|amazing|grateful|excited|love|wonderful|joy)\b/.test(lower)) return "positive";
  return "neutral";
}

function buildSystemPrompt(user: { name: string } | null, recentMood?: string): string {
  const userName = user ? user.name.split(" ")[0] : "there";
  const moodContext = recentMood ? `The user's most recent wellness check-in result was: "${recentMood}". ` : "";

  return `You are Emotica, a compassionate AI mental wellness companion. ${moodContext}

You are talking with ${userName}. Your role:
- Listen deeply and validate feelings without jumping to solutions
- Ask one thoughtful follow-up question per response to encourage reflection
- Offer specific, actionable coping techniques when appropriate
- Recommend the app's wellness tools naturally when relevant (breathing, journaling, meditation, sounds)
- If someone seems in crisis, gently encourage professional help and provide crisis line information
- Keep responses warm, concise (2-4 sentences), and free of clinical jargon
- Never diagnose or replace professional mental health care
- Remember context from earlier in this conversation

Wellness tools you can recommend: Breathing App, Meditation Timer, Stress Relief Sounds, Journal, Habit Builder, Mood Tracker, Gratitude Log, Focus Booster, Sleep Stories, Positive Affirmations.`;
}

const retryFetch = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
  try {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return retryFetch(url, options, retries - 1, delay * 2);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return retryFetch(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
};

const cleanForSpeech = (text: string) =>
  text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");

export default function EmoticaAI() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      sender: "assistant",
      text: `Hi${user ? " " + user.name.split(" ")[0] : ""}! 👋 I'm Emotica, your mental wellness companion. How are you feeling right now? You can talk to me, or use the mic button to speak.`,
      timestamp: new Date(),
    },
  ]);
  const [conversationHistory, setConversationHistory] = useState<GeminiContent[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("Click the mic to start talking.");

  const chatRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const addMessage = useCallback((text: string, sender: "user" | "assistant") => {
    const msg: Message = { id: Date.now().toString(), text, sender, timestamp: new Date() };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setStatusText("Voice recognition not supported in this browser.");
      return;
    }
    const rec = new window.webkitSpeechRecognition();
    rec.continuous = false;
    rec.lang = "en-US";
    rec.interimResults = false;
    recognitionRef.current = rec;

    rec.onstart = () => { setIsRecording(true); setStatusText("Listening…"); };
    rec.onend   = () => { setIsRecording(false); setStatusText("Processing…"); };
    rec.onresult = async (e: any) => {
      const t = e.results[0][0].transcript;
      if (t.trim()) await handleRequest(t);
    };
    rec.onerror = () => { setIsRecording(false); setStatusText("Error. Please try again."); };

    return () => { rec.onresult = null; rec.onerror = null; rec.onend = null; };
  }, []);

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utt = new SpeechSynthesisUtterance(cleanForSpeech(text));
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.toLowerCase().includes("female"))
      || voices.find(v => v.name.toLowerCase().includes("zira"))
      || voices.find(v => v.name.toLowerCase().includes("samantha"))
      || voices.find(v => v.lang === "en-US");
    if (voice) utt.voice = voice;
    utt.rate = 1.05; utt.pitch = 1.05;
    window.speechSynthesis.speak(utt);
  };

  const callGemini = async (userMessage: string, history: GeminiContent[]): Promise<string> => {
    const tone = detectTone(userMessage);

    // If distressed, prepend a crisis-aware override into the history
    const safetyPrefix: GeminiContent[] = tone === "distressed" ? [{
      role: "model",
      parts: [{ text: "I hear that you're going through something really painful right now. Your feelings are valid. If you're having thoughts of hurting yourself, please reach out to a crisis line like 988 (Suicide & Crisis Lifeline in the US) or text HOME to 741741. I'm here with you — can you tell me more about what's happening?" }]
    }] : [];

    const systemPrompt = buildSystemPrompt(user ?? null);
    const contents: GeminiContent[] = [...history, { role: "user", parts: [{ text: userMessage }] }];

    const payload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: tone === "distressed" ? [...safetyPrefix, ...contents] : contents,
      generationConfig: {
        temperature: tone === "anxious" ? 0.6 : 0.85,
        maxOutputTokens: 300,
      },
    };

    const res = await retryFetch(TEXT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm here — please try again in a moment.";
  };

  const handleRequest = async (userMessage: string) => {
    setIsLoading(true);
    addMessage(userMessage, "user");
    setStatusText("Thinking…");

    try {
      const reply = await callGemini(userMessage, conversationHistory);

      // Update conversation history for multi-turn context (keep last 12 turns = 6 exchanges)
      setConversationHistory(prev => [
        ...prev.slice(-10),
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: reply }] },
      ]);

      addMessage(reply, "assistant");
      speakText(reply);
    } catch {
      addMessage("I'm having trouble connecting right now. Please try again.", "assistant");
    } finally {
      setStatusText("Click the mic to start talking.");
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText("");
    await handleRequest(msg);
  };

  const toggleMic = async () => {
    if (isRecording) { recognitionRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      recognitionRef.current?.start();
    } catch {
      setStatusText("Microphone permission denied.");
    }
  };

  const sendQuickPrompt = (prompt: string) => {
    if (!isLoading) handleRequest(prompt);
  };

  const quickActions = [
    { label: "🧘 Guide me through breathing", prompt: "Guide me through a quick breathing exercise." },
    { label: "✍️ Journal prompt", prompt: "Give me a journaling prompt for today." },
    { label: "💭 I need to vent", prompt: "I just need to vent about something." },
    { label: "😴 Help me sleep", prompt: "I can't sleep. What can I do?" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col" style={{ height: "84vh" }}>
        {/* Header */}
        <div className="flex-shrink-0 rounded-t-3xl px-6 py-4 border-b border-white/8"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))", backdropFilter: "blur(20px)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Emotica AI
              </h1>
              <p className="text-white/35 text-xs">Voice & text wellness companion</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/40 text-xs">Online</span>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4"
          style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)" }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={["px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[82%] shadow-md",
                  msg.sender === "user" ? "text-white rounded-br-sm" : "text-white/85 border border-white/10 rounded-bl-sm"].join(" ")}
                  style={msg.sender === "user"
                    ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" }
                    : { background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="px-5 py-3 rounded-2xl rounded-bl-sm border border-white/10 flex gap-1 items-center"
                style={{ background: "rgba(255,255,255,0.07)" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: d }} />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick action chips */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-white/8 flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => sendQuickPrompt(a.prompt)} disabled={isLoading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-white/50 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white/80 transition-all disabled:opacity-40">
              {a.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 rounded-b-3xl px-5 py-5 border-t border-white/8"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)" }}>
          <div className="flex gap-3 mb-4">
            <input type="text" placeholder="Type your message…" value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()} disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }} />
            <motion.button onClick={handleTextSubmit} disabled={isLoading || !inputText.trim()}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              className="px-4 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              ➤
            </motion.button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <motion.button onClick={toggleMic} disabled={isLoading}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${isLoading ? "opacity-40 cursor-not-allowed" : ""}`}
              style={{
                background: isRecording ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "linear-gradient(135deg, #7c3aed, #6366f1)",
                boxShadow: isRecording ? "0 0 30px rgba(168,85,247,0.7)" : "0 0 20px rgba(124,58,237,0.4)",
              }}
              animate={isRecording ? { scale: [1, 1.08, 1] } : {}}
              transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}>
              <img src={Logo2} alt="Mic" className="h-10 w-auto select-none" draggable={false} />
            </motion.button>
            <p className="text-white/30 text-xs">{statusText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
