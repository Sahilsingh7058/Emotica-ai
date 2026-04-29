import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

const stories = [
  {
    title: "The Quiet Forest",
    emoji: "🌲",
    readTime: "3 min",
    color: "from-emerald-600 to-teal-500",
    text: `You walk into a quiet forest just as the sun begins to set. The path beneath your feet is soft with fallen leaves, golden and red, cushioning each step. Above you, tall pine trees sway gently in the evening breeze, their branches whispering secrets to one another.

A small stream runs nearby — you can hear it before you see it. When you find it, the water is clear and cold, tumbling over smooth stones. You sit down on a mossy log and watch the water move. It never stops, never worries, never rushes. It simply flows.

The forest is full of small sounds: a distant owl, the creak of an old branch, the soft rustle of a tiny creature moving through the undergrowth. You are completely safe here. Nothing demands your attention.

The last light of the day filters through the canopy in long golden beams. You breathe in deeply — pine, earth, and cool evening air. With each exhale, the tension of the day dissolves.

You are held by this quiet place. There is nothing to fix, nothing to solve. Only this moment, this breath, this stillness. Let your eyelids grow heavy. The forest will watch over you tonight.`,
  },
  {
    title: "The Floating Lanterns",
    emoji: "🏮",
    readTime: "3 min",
    color: "from-amber-600 to-orange-500",
    text: `Imagine you are sitting in a small wooden boat on a perfectly still lake. The water is as smooth as glass, reflecting the night sky above — millions of stars that seem close enough to touch.

All around you, paper lanterns float on the water. Each one glows with a soft golden light, drifting slowly in all directions. Some carry the worries of the day. Others hold the things you need to let go of. Watch as they drift gently away from you, moving further into the darkness until they are tiny points of light in the distance.

The air is warm and carries the faint scent of cedar wood. You trail your fingers in the still water, and tiny ripples catch the light of the lanterns. Above you, a single shooting star streaks across the sky.

You lie back in the boat, perfectly balanced, perfectly safe. The gentle rocking is like being held. Your breathing naturally slows to match the rhythm of the water.

One by one, the lanterns fade into the night, taking everything heavy with them. Only the stars remain, shining calmly down on you. You are light. You are free. Sleep is coming like a gentle tide.`,
  },
  {
    title: "The Cloud Garden",
    emoji: "☁️",
    readTime: "4 min",
    color: "from-sky-600 to-blue-500",
    text: `You find yourself standing in an extraordinary garden — but this one floats high above the earth, among the clouds. Beneath your feet, the ground is made of the softest white cloud you've ever touched, springy and warm, like the world's most comfortable mattress.

The garden is full of silver flowers that chime softly in the breeze. Each petal catches the moonlight and scatters tiny rainbows across the cloud floor. Fireflies drift between the blooms, glowing softly blue and green.

At the centre of the garden is a hammock woven from moonbeams, swaying gently between two enormous cloud pillars. You climb in, and it holds you perfectly — not too tight, not too loose. You feel weightless.

Below you, through breaks in the clouds, you can see the sleeping world: tiny golden lights of houses and towns, rivers that gleam like silver threads. Up here, all of that is peaceful and far away.

The night air is perfectly warm. A constellation you've never noticed before hangs directly above you, and you trace its shape slowly — a star, then another, then another. Your thoughts grow fewer and softer, like the garden itself.

The hammock rocks gently, and the silver flowers chime their quiet lullaby. You don't need to hold on to anything. The clouds hold you. Drift now. Drift gently to sleep.`,
  },
  {
    title: "The Gentle Rain",
    emoji: "🌧️",
    readTime: "3 min",
    color: "from-indigo-600 to-violet-500",
    text: `It is raining outside — a soft, steady rain that patters against your window in a perfect rhythm. You are tucked safely inside, warm and dry, wrapped in the softest blanket you own. The room is dim and quiet except for the sound of the rain.

You watch the water trace paths down the glass. Some drops race, others join together and take a slower route. There's no hurry. The rain has all night.

Outside, the street is washed clean. The smell of petrichor — that beautiful scent of rain on warm earth — drifts in through the slightly open window. It's a smell that makes you feel calm and nostalgic and safe all at once.

You stretch out fully, feeling the weight of your body sink down. Your toes are warm. Your shoulders soften. The blanket feels like a gentle hug that asks nothing of you.

The rain changes its rhythm every now and then — faster for a moment, then quieter, then a steady gentle patter again. It's like music that was written just for this moment.

You don't need to do anything except listen. The rain will keep falling, washing everything clean, while you rest. Let it carry you. Close your eyes and count the drops. One… two… three… and drift.`,
  },
];

export default function SleepStories() {
  const [activeStory, setActiveStory] = useState<typeof stories[0] | null>(null);

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-16 relative overflow-hidden" style={{ background: BG }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse" style={{ background: "radial-gradient(circle, #4338ca, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse" style={{ background: "radial-gradient(circle, #1e40af, transparent)", animationDelay: "2s" }} />
      </div>

      <AnimatePresence mode="wait">
        {activeStory ? (
          <motion.div key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 max-w-xl mx-auto">
            <button onClick={() => setActiveStory(null)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-6">
              ← Back to stories
            </button>
            <div className="text-center mb-8">
              <div className="text-6xl mb-3">{activeStory.emoji}</div>
              <h2 className="text-2xl font-extrabold text-white">{activeStory.title}</h2>
              <p className="text-white/30 text-xs mt-1">{activeStory.readTime} read · Find a comfortable position</p>
            </div>
            <div className="rounded-3xl p-8 backdrop-blur-xl border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
              {activeStory.text.split("\n\n").map((para, i) => (
                <p key={i} className="text-white/75 leading-[1.9] text-base mb-5 last:mb-0">{para}</p>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 max-w-xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-indigo-300 text-sm font-medium mb-5"><span>🌙</span> Sleep Stories</div>
              <h1 className="text-4xl sm:text-5xl font-extrabold" style={{ background: "linear-gradient(135deg, #fff, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Drift Off Gently
              </h1>
              <p className="mt-4 text-white/40 text-sm">Choose a story, get comfortable, and let your mind wander.</p>
            </div>

            <div className="space-y-4">
              {stories.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.02, y: -3 }}
                  onClick={() => setActiveStory(s)} className="cursor-pointer rounded-3xl p-6 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 transition-all flex items-center gap-5"
                  style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}>{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-lg">{s.title}</h3>
                    <p className="text-white/40 text-xs mt-1">{s.readTime} · {s.text.slice(0, 60)}…</p>
                  </div>
                  <span className="text-white/25 text-xl">›</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
