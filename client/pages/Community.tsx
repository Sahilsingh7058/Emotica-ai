import { useState } from "react";
import { motion } from "framer-motion";

const BG = "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)";

interface Post {
  id: number;
  title: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
  tag: string;
}

const seedPosts: Post[] = [
  {
    id: 1,
    title: "Feeling a little down today — any tips?",
    author: "Grace",
    avatar: "G",
    date: "2 hours ago",
    content: "Just feeling unmotivated. Looking for easy, quick things to lift my spirits. Thanks everyone!",
    likes: 14,
    tag: "Mood",
  },
  {
    id: 2,
    title: "A simple act of kindness made my day",
    author: "Alex",
    avatar: "A",
    date: "4 hours ago",
    content: "I held the door for a stranger and they gave me the biggest smile. Small things really do matter.",
    likes: 28,
    tag: "Gratitude",
  },
  {
    id: 3,
    title: "What are your favourite self-care rituals?",
    author: "Maria",
    avatar: "M",
    date: "6 hours ago",
    content: "I love putting on a new album and just relaxing. What do you all do to unwind?",
    likes: 21,
    tag: "Self-care",
  },
  {
    id: 4,
    title: "Need to clear my mind — peaceful spots?",
    author: "John",
    avatar: "J",
    date: "1 day ago",
    content: "Feeling overwhelmed and need to get outside. Any peaceful places you love to visit?",
    likes: 9,
    tag: "Anxiety",
  },
  {
    id: 5,
    title: "Finished a difficult project! 🎉",
    author: "Sophie",
    avatar: "S",
    date: "2 days ago",
    content: "After weeks of hard work, my project is finally done! It feels so good. Never give up!",
    likes: 47,
    tag: "Win",
  },
  {
    id: 6,
    title: "Mood-boosting music recommendations?",
    author: "David",
    avatar: "D",
    date: "3 days ago",
    content: "Building a new playlist for when I'm feeling low. Share your go-to songs or artists!",
    likes: 33,
    tag: "Music",
  },
];

const tagColors: Record<string, string> = {
  Mood: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  Gratitude: "bg-pink-500/20 text-pink-300 border-pink-500/20",
  "Self-care": "bg-teal-500/20 text-teal-300 border-teal-500/20",
  Anxiety: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  Win: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
  Music: "bg-purple-500/20 text-purple-300 border-purple-500/20",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [newPost, setNewPost] = useState("");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now(),
      title: newPost.trim().slice(0, 80),
      author: localStorage.getItem("userFirstName") || "You",
      avatar: (localStorage.getItem("userFirstName")?.[0] || "Y").toUpperCase(),
      date: "Just now",
      content: newPost.trim(),
      likes: 0,
      tag: "Mood",
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes: likedIds.has(id) ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  };

  return (
    <div
      className="min-h-screen px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative overflow-hidden"
      style={{ background: BG }}
    >
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 rounded-full blur-3xl opacity-15 animate-orb-pulse"
          style={{ background: "radial-gradient(circle, #0ea5e9, transparent)", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-purple-300 text-sm font-medium mb-5">
            <span>🌐</span> Community
          </div>
          <h1
            className="text-5xl sm:text-6xl font-extrabold"
            style={{
              background: "linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Community Forum
          </h1>
          <p className="mt-4 text-white/50 max-w-lg mx-auto">
            Share your thoughts and connect with others on a similar journey.
          </p>
        </motion.div>

        {/* New post box */}
        <motion.div
          className="rounded-3xl p-6 backdrop-blur-xl border border-white/10 mb-12"
          style={{ background: "rgba(255,255,255,0.05)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
            Share what's on your mind
          </p>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write something kind, share a win, or ask for support…"
            className="w-full h-24 bg-transparent text-white placeholder-white/25 text-sm leading-relaxed focus:outline-none resize-none"
          />
          <div className="flex justify-end mt-4 pt-4 border-t border-white/8">
            <motion.button
              onClick={handlePost}
              disabled={!newPost.trim()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              Post
            </motion.button>
          </div>
        </motion.div>

        {/* Posts grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map((post) => (
            <motion.div
              key={post.id}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.01 }}
              className="rounded-3xl p-6 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                  >
                    {post.avatar}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold">{post.author}</p>
                    <p className="text-white/30 text-xs">{post.date}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${tagColors[post.tag] ?? "bg-white/10 text-white/50 border-white/10"}`}>
                  {post.tag}
                </span>
              </div>

              <h3 className="text-white font-bold text-base mb-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed flex-1">
                {post.content}
              </p>

              <button
                onClick={() => toggleLike(post.id)}
                className={`mt-4 flex items-center gap-2 text-sm font-medium transition-colors ${
                  likedIds.has(post.id) ? "text-pink-400" : "text-white/30 hover:text-pink-400"
                }`}
              >
                <span>{likedIds.has(post.id) ? "❤️" : "🤍"}</span>
                <span>{post.likes + (likedIds.has(post.id) ? 0 : 0)}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
