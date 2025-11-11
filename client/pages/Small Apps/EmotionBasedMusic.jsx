import React, { useState, useCallback } from 'react';

// --- API Constants and Utility Functions ---

// The API key is initialized as an empty string, the Canvas environment handles providing it.
const apiKey = "AIzaSyDwab2RiWSDtGPHoCL8o0CD0QCyozV_Mp4"; 
// Updated to the correct, mandated model name
const TEXT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

// Utility function for retrying fetch calls with exponential backoff
const retryFetch = async (url, options, retries = 3, delay = 1000) => {
    try {
        const response = await fetch(url, options);
        if (response.status === 429 && retries > 0) {
            // Suppress console output for retries as instructed
            await new Promise(res => setTimeout(res, delay));
            return retryFetch(url, options, retries - 1, delay * 2);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            // Suppress console output for retries as instructed
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
    1) A suitable *music genre* (e.g., Lofi Hip-Hop, Classical, Ambient Electronica).
    2) A simple *activity* to do while listening (e.g., stretch, draw, focus on homework).
    3) A creative *sample track title* that fits the mood and genre.
    Format the response using an H2 title and bullet points (Markdown format). *At the very end of your response, output a single line with the exact YouTube search query, prefixed by [YOUTUBE_QUERY:...]* (e.g., [YOUTUBE_QUERY:Lofi Hip Hop for Studying and Relaxation]).`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        // Enabling Google Search grounding for up-to-date ideas
        tools: [{ "google_search": {} }], 
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

        // Extract sources if grounding was used
        let sources = [];
        const groundingMetadata = result?.candidates?.[0]?.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
            sources = groundingMetadata.groundingAttributions
                .map(attribution => ({
                    uri: attribution.web?.uri,
                    title: attribution.web?.title,
                }))
                .filter(source => source.uri && source.title);
        }

        return {
            text: recommendationText,
            searchQuery: searchQuery,
            sources: sources
        };
    } catch (error) {
        console.error("Error fetching text from Gemini API:", error);
        return {
            text: "I'm sorry, something went wrong with the AI. Please try again in a moment.",
            searchQuery: `${mood} music for relaxation`,
            sources: []
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
const MarkdownContent = ({ content, searchQuery, sources }) => {
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
            {sources.length > 0 && (
                <div className="mt-4 pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Sources:</p>
                    <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                        {sources.slice(0, 3).map((source, index) => (
                            <li key={index}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.title}</a></li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
};

export default function EmotionBasedMusic() {
    const [selectedMood, setSelectedMood] = useState(null);
    const [recommendation, setRecommendation] = useState({ 
        text: 'Select a mood above to receive your music suggestion.', 
        searchQuery: '',
        sources: [] 
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleMoodClick = useCallback(async (mood) => {
        // Prevent action if already loading
        if (isLoading) return; 

        setSelectedMood(mood);
        setIsLoading(true);
        // Display a loading message using simple text, handled by MarkdownContent
        setRecommendation({ 
            text: '<div class="spinner-container flex justify-center items-center"><div class="spinner"></div></div>', 
            searchQuery: '',
            sources: [] 
        });

        const result = await fetchRecommendation(mood);
        
        setRecommendation(result);
        setIsLoading(false);
    }, [isLoading]);


    return (
        <div className="bg-[#4F6483] min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex justify-center pt-[120px] font-sans">
            {/* Custom Styles moved into standard <style> block */}
            <style>
                {`
                :root {
                    --emotica-purple: #7c3aed;
                    --emotica-pink: #a78bfa;
                }
                .header-icon {
                    background: linear-gradient(135deg, var(--emotica-purple) 0%, var(--emotica-pink) 100%);
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
                }
                .mood-button {
                    transition: all 0.2s;
                    border: 2px solid transparent;
                }
                .mood-button:hover:not(.selected) {
                    border-color: #d1d5db; /* Light gray border on hover */
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
                `}
            </style>
            
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center border border-gray-100 h-fit">
                
                {/* Header Section */}
                <div className="header-icon mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl shadow-md">
                    🎵
                </div>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Music for My Mood</h1>
                <p className="text-gray-500 mb-8">Tap the emotion that best describes how you feel right now to get a personalized music recommendation.</p>

                {/* Mood Selection Buttons */}
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

                {/* Recommendation Output Area */}
                <div 
                    id="output-area" 
                    // Fixed height and scrollable for clean layout
                    className="bg-purple-50/5 border border-gray-200 p-6 rounded-xl h-[350px] overflow-y-auto text-left transition-opacity duration-300 shadow-inner"
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="spinner"></div>
                            <span className="ml-4 text-gray-500">Generating suggestion...</span>
                        </div>
                    ) : (
                        <MarkdownContent 
                            content={recommendation.text} 
                            searchQuery={recommendation.searchQuery} 
                            sources={recommendation.sources}
                        />
                    )}
                </div>

                <p className="text-xs text-gray-400 mt-4">Recommendations are generated by Emotica AI. Music links are external YouTube search results.</p>
            </div>
        </div>
    );
}