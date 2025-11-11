import React, { useState, useCallback } from 'react';

// --- API Constants and Utility Functions ---

const API_KEY = "AIzaSyDwab2RiWSDtGPHoCL8o0CD0QCyozV_Mp4"; // Canvas will automatically provide this key
const TEXT_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=" + API_KEY;

// Utility function for retrying fetch calls with exponential backoff
const retryFetch = async (url, options, retries = 3, delay = 1000) => {
    try {
        const response = await fetch(url, options);
        if (response.status === 429 && retries > 0) {
            console.warn(`Rate limit hit, retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return retryFetch(url, options, retries - 1, delay * 2);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Network error, retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return retryFetch(url, options, retries - 1, delay * 2);
        }
        throw error;
    }
};

// Simulated YouTube Search (Generates a clean YouTube results URL)
const searchYouTube = (query) => {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

// --- Main LLM Call Logic ---
const fetchRecommendation = async (mood) => {
    const prompt = `Based on the mood "${mood}", suggest a helpful music recommendation for a young person. Give a clear, engaging response that includes: 
    1) A suitable **music genre** (e.g., Lofi Hip-Hop, Classical, Ambient Electronica).
    2) A simple **activity** to do while listening (e.g., stretch, draw, focus on homework).
    3) A creative **sample track title** that fits the mood and genre.
    Format the response using an H2 title and bullet points (Markdown format). **At the very end of your response, output a single line with the exact YouTube search query, prefixed by [YOUTUBE_QUERY:...]** (e.g., [YOUTUBE_QUERY:Lofi Hip Hop for Studying and Relaxation]).`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: "You are a specialized music recommendation AI focused on emotional wellness for youth. Your suggestions are kind, thoughtful, and aim to either regulate or amplify the user's current emotion in a healthy way. Keep your tone supportive and avoid medical language." }]
        }
    };

    try {
        const response = await retryFetch(TEXT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        let fullText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        const queryMatch = fullText.match(/\[YOUTUBE_QUERY:(.*?)\]/);
        const searchQuery = queryMatch ? queryMatch[1].trim() : `${mood} music for relaxation`;
        
        const recommendationText = fullText.replace(/\[YOUTUBE_QUERY:.*?\]/g, '').trim();

        return {
            text: recommendationText,
            searchQuery: searchQuery
        };
    } catch (error) {
        console.error("Error fetching text from Gemini API:", error);
        return {
            text: "I'm sorry, something went wrong with the AI. Please try again in a moment.",
            searchQuery: `${mood} music for relaxation`
        };
    }
};


// --- React Component ---

const moods = [
    { label: "Stressed", emoji: "😩", dataMood: "Stressed" },
    { label: "Anxious", emoji: "😬", dataMood: "Anxious" },
    { label: "Tired", emoji: "😴", dataMood: "Tired" },
    { label: "Happy", emoji: "😊", dataMood: "Happy" },
    { label: "Sad", emoji: "😔", dataMood: "Sad" },
    { label: "Bored", emoji: "😐", dataMood: "Bored" },
    { label: "Angry", emoji: "😡", dataMood: "Angry" },
];

// Helper component to render Markdown content simply
const MarkdownContent = ({ content, searchQuery }) => {
    // Basic Markdown to JSX/Tailwind conversion
    const htmlOutput = content
        .replace(/## (.*)/g, '<h2 class="text-xl font-semibold text-gray-800 mb-3">$1</h2>')
        .replace(/\* (.*)/g, '<p class="text-gray-700 ml-4 mb-2 flex items-start"><span class="mt-1 mr-2 text-purple-600 font-bold">•</span>$1</p>')
        .trim();

    return (
        <>
            <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
            {searchQuery && (
                <a 
                    href={searchYouTube(searchQuery)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block mt-4 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold text-center transition-all duration-200 shadow-md hover:bg-red-600 hover:shadow-lg"
                >
                    Play on YouTube (Search for: "{searchQuery}")
                </a>
            )}
        </>
    );
};

export default function EmotionBasedMusic() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [recommendation, setRecommendation] = useState({ text: 'Select a mood above to receive your music suggestion.', searchQuery: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleMoodClick = useCallback(async (mood) => {
        if (isLoading) return;

        setSelectedMood(mood);
        setIsLoading(true);
        setRecommendation({ 
            text: '<div class="spinner-container flex justify-center items-center"><div class="spinner"></div></div>', 
            searchQuery: '' 
        });

        const result = await fetchRecommendation(mood);
        
        // This is safe because MarkdownContent handles the display logic
        setRecommendation({ 
            text: result.text, 
            searchQuery: result.searchQuery 
        });
        setIsLoading(false);
    }, [isLoading]);


    return (
        // FIX: Changed background color to match SmallApps.jsx and added centering/padding
        <div className="bg-[#4F6483] min-h-screen py-16 px-4 sm:px-6 lg:px-8 pt-[120px] flex justify-center">
            <style jsx="true">{`
                :root {
                    --emotica-purple: #7c3aed;
                    --emotica-pink: #a78bfa;
                }
                .header-icon {
                    background: linear-gradient(135deg, var(--emotica-purple) 0%, var(--emotica-pink) 100%);
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
                }
                .mood-button.selected {
                    background: linear-gradient(90deg, var(--emotica-purple) 0%, var(--emotica-pink) 100%);
                    box-shadow: 0 3px 10px rgba(124, 58, 237, 0.3);
                }
                .spinner {
                    border: 4px solid rgba(0, 0, 0, 0.1);
                    border-left-color: var(--emotica-purple);
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            
            {/* FIX: Changed max-w-lg to max-w-4xl to make the card wider */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center border border-gray-100 h-fit">
                <div className="header-icon mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl shadow-md">
                    🎵
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Music for My Mood</h1>
                <p className="text-gray-500 mb-8">Tap the emotion that best describes how you feel right now to get a personalized music recommendation.</p>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {moods.map((mood) => (
                        <button
                            key={mood.dataMood}
                            onClick={() => handleMoodClick(mood.dataMood)}
                            disabled={isLoading}
                            className={`mood-button 
                                ${selectedMood === mood.dataMood ? 'selected text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer text-sm
                            `}
                        >
                            {mood.label} {mood.emoji}
                        </button>
                    ))}
                </div>

                <div 
                    id="output-area" 
                    // FIX: Set fixed height and overflow-y-auto for scrolling
                    className="bg-f9f9ff border border-gray-200 p-6 rounded-xl h-[250px] overflow-y-auto text-left transition-opacity duration-300"
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <MarkdownContent 
                            content={recommendation.text} 
                            searchQuery={recommendation.searchQuery} 
                        />
                    )}
                </div>

                <p className="text-xs text-gray-400 mt-4">Recommendations are generated by Emotica AI. Music links are external YouTube search results.</p>
            </div>
        </div>
    );
}