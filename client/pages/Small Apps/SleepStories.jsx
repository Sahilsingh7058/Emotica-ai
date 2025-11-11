import React, { useState, useEffect, useCallback } from 'react';
import { Moon, BookOpen, ChevronLeft, Loader, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fetchSleepStories = async () => {
  const apiKey = "AIzaSyDwab2RiWSDtGPHoCL8o0CD0QCyozV_Mp4";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemPrompt =
    "You are a gentle storyteller specializing in peaceful, short narratives for sleep and relaxation. The stories should focus on natural, soothing imagery.";
  const userQuery =
    "Generate 4 original calming bedtime stories with a title and content. Each story should be 3-4 paragraphs long, deeply relaxing, and use soft natural imagery. ";

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            content: { type: "STRING" },
          },
          required: ["title", "content"],
        },
      },
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("API failed");
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const StoryList = ({ stories, onSelectStory }) => (
  <motion.div
    className="space-y-3 p-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    {stories.map((story, index) => (
      <motion.button
        key={index}
        onClick={() => onSelectStory(story)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full text-left p-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl shadow-md flex items-center group transition-colors duration-200"
      >
        <BookOpen className="w-5 h-5 mr-3 text-indigo-300 group-hover:text-indigo-400 transition-colors" />
        <span className="text-gray-100 font-semibold text-lg group-hover:text-white transition-colors">
          {story.title}
        </span>
      </motion.button>
    ))}
  </motion.div>
);

const StoryReader = ({ story, onBack }) => (
  <motion.div
    className="p-6 h-full flex flex-col"
    key={story.title}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    transition={{ duration: 0.5 }}
  >
    <button
      onClick={onBack}
      className="flex items-center text-indigo-300 hover:text-indigo-200 transition-colors mb-4 self-start"
    >
      <ChevronLeft className="w-5 h-5 mr-1" />
      <span className="font-medium">Back to Stories</span>
    </button>
    <h1 className="text-3xl font-serif text-white mb-6 border-b border-gray-700 pb-3">
      {story.title}
    </h1>
    <motion.div
      className="overflow-y-auto flex-grow pr-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <motion.p
        className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        {story.content}
      </motion.p>
    </motion.div>
  </motion.div>
);

const App = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloading, setReloading] = useState(false);

  const loadStories = useCallback(async () => {
    setIsLoading(true);
    const generatedStories = await fetchSleepStories();
    if (generatedStories) {
      setStories(generatedStories);
      setError(null);
    } else {
      setError("Failed to load stories. Showing peaceful defaults.");
      setStories([
        {
          title: "The Quiet Shoreline",
          content:
            "A gentle wave rolls onto a beach of smooth, grey stones, creating a soft, continuous whisper. The scent of salt and cool air drifts over you, calming the mind. Each wave pulls back, taking with it a tiny piece of your daily worries.",
        },
        {
          title: "Mountain Stream's Lullaby",
          content:
            "You find yourself at the edge of a deep, ancient forest. A tiny mountain stream winds gently through the ferns and beneath the tall, silent pines. Its water makes a soft, rhythmic burbling sound—a promise of peace.",
        },
      ]);
    }
    setIsLoading(false);
    setReloading(false);
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleReload = async () => {
    setReloading(true);
    await loadStories();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b bg-[#4F6483]  text-white font-sans flex items-center justify-center p-4">
      <motion.div
        layout
        className={`w-full max-w-4xl bg-gray-800 rounded-3xl shadow-2xl overflow-hidden ${
          selectedStory ? "h-[90vh]" : "max-h-[90vh]"
        }`}
        transition={{ layout: { duration: 0.6 } }}
      >
        <div className="p-6 bg-indigo-900/40 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Moon className="w-8 h-8 text-indigo-300 mr-3 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-white tracking-wider">
              Bed Time Stories
            </h1>
          </div>
          {!selectedStory && (
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={handleReload}
                whileTap={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="flex items-center text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                <RefreshCcw
                  className={`w-4 h-4 mr-1 ${
                    reloading ? "animate-spin text-indigo-400" : ""
                  }`}
                />
                Reload
              </motion.button>
              <span className="text-sm text-gray-400">
                {stories.length} Loaded
              </span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center p-12 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
              >
                <Loader className="w-12 h-12 text-indigo-400" />
              </motion.div>
              <motion.p
                className="mt-6 text-xl font-medium text-gray-300"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                Generating your calming stories...
              </motion.p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              className="p-6 text-center text-red-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-lg font-semibold mb-2">{error}</p>
            </motion.div>
          ) : selectedStory ? (
            <StoryReader
              key="reader"
              story={selectedStory}
              onBack={() => setSelectedStory(null)}
            />
          ) : (
            <StoryList
              key="list"
              stories={stories}
              onSelectStory={(s) => setSelectedStory(s)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;
