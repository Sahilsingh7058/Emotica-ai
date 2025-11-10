import React, { useState, useEffect, useRef } from "react";
import Logo2 from "./img/Logo2.png";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const EmoticaAI = () => {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hi there! Click the microphone button and talk to me about what's on your mind. I'm here to listen. You can also type your message or try the features below!",
    },
  ]);
  const [statusText, setStatusText] = useState("Click to start talking.");
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatAreaRef = useRef(null);
  const recognitionRef = useRef(null);

  const API_KEY = "AIzaSyDwab2RiWSDtGPHoCL8o0CD0QCyozV_Mp4";
  const TEXT_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

  // Auto-scroll chat
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Simple fetch with retry
  const retryFetch = async (url, options, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && retries > 0) {
          await new Promise((res) => setTimeout(res, delay));
          return retryFetch(url, options, retries - 1, delay * 2);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((res) => setTimeout(res, delay));
        return retryFetch(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // 🔊 Speak with browser voice
  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
  
    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice =
      voices.find(v => v.name.toLowerCase().includes("female")) ||
      voices.find(v => v.name.toLowerCase().includes("zira")) || // Windows
      voices.find(v => v.name.toLowerCase().includes("samantha")) || // Mac
      voices.find(v => v.lang === "en-US");
  
    if (femaleVoice) utterance.voice = femaleVoice;
  
    utterance.rate = 1.1;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // Speech recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setStatusText("Voice recognition not supported in this browser.");
      return;
    }

    const newRecognition = new window.webkitSpeechRecognition();
    newRecognition.continuous = false;
    newRecognition.lang = "en-US";
    newRecognition.interimResults = false;

    recognitionRef.current = newRecognition;

    newRecognition.onstart = () => {
      setIsRecording(true);
      setStatusText("Listening...");
    };

    newRecognition.onend = () => {
      setIsRecording(false);
      setStatusText("Processing...");
    };

    newRecognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        await handleRequest(transcript);
      }
    };

    newRecognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsRecording(false);
      setStatusText("Error. Please try again.");
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, []);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      if (error.name === "NotAllowedError") {
        setStatusText("Microphone permission denied. Please enable it.");
      } else {
        setStatusText("Error accessing microphone.");
      }
      return false;
    }
  };

  const handleRequest = async (userMessage) => {
    setIsLoading(true);
    addMessage(userMessage, "user");
    setStatusText("Generating response...");

    const lowerCaseMessage = userMessage.toLowerCase();
    if (lowerCaseMessage.includes("meditation")) {
      await startMeditation();
    } else if (lowerCaseMessage.includes("prompt")) {
      await getCreativePrompt();
    } else {
      const textResponse = await getTextFromLLM(userMessage);
      addMessage(textResponse, "assistant");
      speakText(textResponse); // use browser voice
    }

    setStatusText("Click to start talking.");
    setIsLoading(false);
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim() || isLoading) return;
    const message = inputText;
    setInputText("");
    await handleRequest(message);
  };

  const startMeditation = async () => {
    setStatusText("Generating meditation...");
    const meditationPrompt =
      "Create a short and calming guided breathing meditation script for a young person. No more than 3-4 sentences.";
    const script = await getTextFromLLM(meditationPrompt);
    addMessage(script, "assistant");
    speakText(script);
  };

  const getCreativePrompt = async () => {
    setStatusText("Generating prompt...");
    const promptPrompt =
      "Generate a short, creative writing prompt for a young person to express their feelings.";
    const creativeText = await getTextFromLLM(promptPrompt);
    addMessage(creativeText, "assistant");
    speakText(creativeText);
  };
  const cleanTextForSpeech = (text: string) => {
    // Remove all emojis and other pictographic symbols
    return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "");
  };
  const getTextFromLLM = async (prompt) => {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [
          {
            text: "You are an empathetic and supportive emotional wellness assistant for youth. Be kind, simple, and encouraging.",
          },
        ],
      },
    };
    try {
      const response = await retryFetch(TEXT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return (
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm having a bit of trouble right now. Please try again."
      );
    } catch (error) {
      console.error("Error fetching text from Gemini:", error);
      return "I'm sorry, something went wrong.";
    }
  };

  return (
    <div className="bg-[#4F6483] flex items-center justify-center min-h-screen p-4 pt-[100px] font-sans text-gray-800">
      <div className="max-w-xl w-full bg-white/85 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col min-h-[80vh] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="header bg-gradient-to-r from-purple-600 to-purple-400 text-white text-center p-6 shadow-lg rounded-t-3xl">
          <h1 className="text-3xl font-bold tracking-tight">Emotica AI</h1>
          <p className="text-sm opacity-90 mt-1">
            Voice Assistant for Mental Wellness
          </p>
        </div>

        {/* Chat Area */}
        <div
          ref={chatAreaRef}
          className="chat-area flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/70"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-5 py-3 rounded-2xl shadow-md max-w-[85%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Buttons */}
        <div className="flex gap-2 flex-wrap justify-center p-4">
          <button
            onClick={startMeditation}
            className="px-5 py-3 bg-white hover:bg-gray-100 rounded-full text-sm font-medium shadow-sm transition-transform hover:scale-105"
            disabled={isLoading}
          >
            Guided Meditation ✨
          </button>
          <button
            onClick={getCreativePrompt}
            className="px-5 py-3 bg-white hover:bg-gray-100 rounded-full text-sm font-medium shadow-sm transition-transform hover:scale-105"
            disabled={isLoading}
          >
            Creative Prompt ✨
          </button>
        </div>

        {/* Input Area */}
        <div className="flex flex-col items-center gap-4 p-6 border-t border-gray-200">
          <div className="flex w-full gap-2">
            <input
              type="text"
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleTextSubmit();
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleTextSubmit}
              className="p-3 bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600"
              disabled={isLoading}
            >
              ➤
            </button>
          </div>
          <button
            onClick={async () => {
              if (isRecording) {
                recognitionRef.current.stop();
              } else {
                const granted = await requestMicrophonePermission();
                if (granted) recognitionRef.current.start();
              }
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
              isRecording ? "bg-purple-300 animate-pulse" : "bg-purple-500"
            } ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={isLoading}
          >
            <img
              src={Logo2}
              alt="Emotica"
              className="h-12 md:h-14 lg:h-[70px] w-auto select-none"
              draggable={false}
            />
          </button>
          <p className="text-gray-600 text-sm mt-1">{statusText}</p>
        </div>
      </div>
    </div>
  );
};

export default EmoticaAI;
