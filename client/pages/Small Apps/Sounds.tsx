import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface SoundConfig { id: string; label: string; emoji: string; color: string; description: string; type: "white" | "brown" | "pink" | "rain" | "binaural" }

const SOUNDS: SoundConfig[] = [
  { id: "rain", label: "Rain", emoji: "🌧️", color: "from-blue-600 to-cyan-500", description: "Soft rain on a quiet evening", type: "rain" },
  { id: "white", label: "White Noise", emoji: "🌊", color: "from-slate-500 to-gray-400", description: "Steady static to mask distractions", type: "white" },
  { id: "brown", label: "Brown Noise", emoji: "🍂", color: "from-amber-700 to-orange-600", description: "Deep, warm low-frequency sound", type: "brown" },
  { id: "pink", label: "Pink Noise", emoji: "🌸", color: "from-pink-600 to-rose-500", description: "Balanced noise for focus & sleep", type: "pink" },
  { id: "binaural", label: "Deep Calm", emoji: "🧠", color: "from-violet-600 to-purple-500", description: "Gentle tones for deep relaxation", type: "binaural" },
];

function createNoise(ctx: AudioContext, type: SoundConfig["type"]): AudioNode {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white" || type === "rain" || type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      if (type === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
      } else {
        data[i] = w * 0.3;
      }
    }
  } else if (type === "brown") {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * w) / 1.02;
      data[i] = lastOut * 3.5;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  if (type === "rain") {
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 2000;
    const filter2 = ctx.createBiquadFilter();
    filter2.type = "lowpass";
    filter2.frequency.value = 8000;
    source.connect(filter);
    filter.connect(filter2);
    return filter2;
  }

  return source;
}

function createBinaural(ctx: AudioContext): AudioNode {
  const merger = ctx.createChannelMerger(2);
  [200, 210].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(merger, 0, i);
    osc.start();
  });
  return merger;
}

export default function Sounds() {
  const [playing, setPlaying] = useState<Set<string>>(new Set());
  const [volume, setVolume] = useState(0.5);
  const nodesRef = useRef<Map<string, { ctx: AudioContext; gain: GainNode; sources: AudioNode[] }>>(new Map());

  useEffect(() => {
    return () => { nodesRef.current.forEach((n) => n.ctx.close()); };
  }, []);

  const toggleSound = (sound: SoundConfig) => {
    if (playing.has(sound.id)) {
      const node = nodesRef.current.get(sound.id);
      if (node) { node.ctx.close(); nodesRef.current.delete(sound.id); }
      setPlaying((p) => { const n = new Set(p); n.delete(sound.id); return n; });
    } else {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);

      let outputNode: AudioNode;
      if (sound.type === "binaural") {
        outputNode = createBinaural(ctx);
      } else {
        const source = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * 4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const w = Math.random() * 2 - 1;
          if (sound.type === "pink") {
            b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
            b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
            b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
          } else if (sound.type === "brown") {
            lastOut = (lastOut + 0.02 * w) / 1.02;
            data[i] = lastOut * 3.5;
          } else {
            data[i] = w * (sound.type === "rain" ? 0.15 : 0.3);
          }
        }
        source.buffer = buffer;
        source.loop = true;

        if (sound.type === "rain") {
          const f1 = ctx.createBiquadFilter(); f1.type = "highpass"; f1.frequency.value = 2200;
          const f2 = ctx.createBiquadFilter(); f2.type = "lowpass"; f2.frequency.value = 7000;
          source.connect(f1); f1.connect(f2); outputNode = f2;
        } else {
          outputNode = source;
        }
        source.start();
      }
      outputNode.connect(masterGain);
      nodesRef.current.set(sound.id, { ctx, gain: masterGain, sources: [] });
      setPlaying((p) => new Set(p).add(sound.id));
    }
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    nodesRef.current.forEach((n) => { n.gain.gain.value = v; });
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #0d9488, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto">
        <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-teal-300 text-sm font-medium mb-5"><span>🎶</span> Stress Relief Sounds</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #99f6e4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ambient Sounds
          </h1>
          <p className="mt-3 text-white/40 text-sm">Mix and layer sounds to create your perfect atmosphere.</p>
        </motion.div>

        {/* Volume */}
        <div className="rounded-2xl px-6 py-4 border border-white/8 mb-6 flex items-center gap-4" style={{ background: "rgba(255,255,255,0.04)" }}>
          <span className="text-white/40 text-sm">🔈</span>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => handleVolume(Number(e.target.value))} className="flex-1 accent-teal-400 cursor-pointer" />
          <span className="text-white/40 text-sm">🔊</span>
        </div>

        {/* Sound cards */}
        <div className="space-y-3">
          {SOUNDS.map((s, i) => {
            const isOn = playing.has(s.id);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onClick={() => toggleSound(s)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`cursor-pointer rounded-2xl p-5 flex items-center gap-5 border transition-all ${isOn ? "border-teal-500/40" : "border-white/10 hover:border-teal-500/20"}`}
                style={{ background: isOn ? "rgba(13,148,136,0.12)" : "rgba(255,255,255,0.04)" }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0 ${isOn ? "shadow-teal-500/30" : ""}`}>
                  {s.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold">{s.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.description}</p>
                </div>
                <div className={`w-10 h-6 rounded-full border transition-all flex items-center px-0.5 flex-shrink-0 ${isOn ? "bg-teal-500 border-teal-400" : "bg-white/10 border-white/15"}`}>
                  <motion.div animate={{ x: isOn ? 16 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {playing.size > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
            <p className="text-teal-400/60 text-sm">{playing.size} sound{playing.size > 1 ? "s" : ""} playing · Use headphones for the best experience</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
