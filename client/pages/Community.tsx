import React from "react";

// Placeholder data for community posts
const communityPosts = [
  {
    id: 1,
    title: "Feeling a little down today, any tips for a quick mood boost?",
    author: "Grace",
    date: "2 hours ago",
    content: "Just feeling a bit unmotivated. Looking for some easy, quick things to do to lift my spirits. Thanks, everyone!",
  },
  {
    id: 2,
    title: "Shared a positive moment: a simple act of kindness",
    author: "Alex",
    date: "4 hours ago",
    content: "I held the door for a stranger today and they gave me the biggest smile. It's amazing how a small thing can make your whole day better.",
  },
  {
    id: 3,
    title: "What are your favorite self-care rituals?",
    author: "Maria",
    date: "6 hours ago",
    content: "I love to listen to a new album and just relax. What do you all do to unwind and take care of yourselves?",
  },
  {
    id: 4,
    title: "Need to clear my mind. Any nature walks or peaceful spots you recommend?",
    author: "John",
    date: "1 day ago",
    content: "Feeling overwhelmed and need to get outside. Any peaceful places you love to visit for a quiet moment?",
  },
  {
    id: 5,
    title: "Celebrated a small victory: finished a difficult project!",
    author: "Sophie",
    date: "2 days ago",
    content: "After weeks of hard work, my project is finally done! It feels so good to see it through. Never give up!",
  },
  {
    id: 6,
    title: "Looking for recommendations on mood-boosting music playlists",
    author: "David",
    date: "3 days ago",
    content: "Trying to build a new playlist for when I'm feeling low. Share your go-to songs or artists!",
  },
];

export default function Community(){
  return (
    <div className="bg-[#4F6483] min-h-screen py-16 px-4 sm:px-6 lg:px-8 pt-[100px]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-sm">
            Community Forum
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            Share your thoughts and connect with others on a similar journey.
          </p>
        </div>

        {/* Post Creation Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create a New Post</h2>
          <textarea
            className="w-full h-24 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="Share what's on your mind..."
          ></textarea>
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-full shadow-md transition-all hover:bg-purple-700">
              Post
            </button>
          </div>
        </div>

        {/* Community Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition-transform hover:scale-[1.02] hover:shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">{post.content}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>By {post.author}</span>
                <span>{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
