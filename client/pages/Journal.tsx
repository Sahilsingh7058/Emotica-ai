
import PagePlaceholder from "./PagePlaceholder";
import React, { useState } from "react";

export default function Journal() {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<string[]>([]);


  const handleAddEntry = () => {
    if (entry.trim() !== "") {
      setEntries([entry, ...entries]);
      setEntry("");
    }
  };


  return (
    <div className=" min-h-screen bg-gradient-to-tl from-blue-50  flex flex-col items-center py-12 px-4 pt-[100px] ">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-700 mb-6 text-center text">
        Your Daily Journal !!
      </h1>
      <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl">
        Write down your thoughts, feelings, and reflections. Journaling can help
        bring clarity and peace of mind.
      </p>


      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 mb-8">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your thoughts here..."
          className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-700"
        />
        <button
          onClick={handleAddEntry}
          className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md transition duration-200"
        >
          Add Entry
        </button>
      </div>
      <div className="w-full max-w-2xl space-y-6">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center">
            No journal entries yet. Start writing your first one!
          </p>
        ) : (
          entries.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-blue-400"
            >
              <p className="text-gray-800 whitespace-pre-line">{item}</p>
              <p className="text-sm text-gray-500 mt-3">
                {new Date().toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
