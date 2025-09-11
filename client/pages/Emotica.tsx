import React, { useState, useEffect, useRef } from "react";

// This declaration is for TypeScript and will not cause an issue in a .jsx file,
// but is good practice to include if you were using TypeScript.
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const EmoticaAI = () => {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hi there! Click the microphone button and talk to me about what's on your mind. I'm here to listen. You can also try the features below!",
    },
  ]);
  const [statusText, setStatusText] = useState("Click to start talking.");
  const [isRecording, setIsRecording] = useState(false);
  const chatAreaRef = useRef(null);
  const recognitionRef = useRef(null);
  const voicesRef = useRef([]);

  // IMPORTANT: Replace this with your actual Gemini API key.
  const API_KEY = "";
  const TEXT_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
  
  // NOTE: This audio API URL is for a different model. The current code uses
  // the browser's built-in Speech Synthesis API for audio output.
  const AUDIO_API_URL =
    `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${API_KEY}`;

  // Auto-scroll chat to the bottom
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Request microphone permission on mobile devices
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission denied:", error);
      if (error.name === "NotAllowedError") {
        setStatusText("Microphone permission was denied. Please enable it in your browser settings.");
      } else {
        setStatusText("Error accessing the microphone.");
      }
      return false;
    }
  };

  // Get and store the list of available voices when the component mounts
  useEffect(() => {
    const getVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };

    if ('speechSynthesis' in window) {
      getVoices();
      // Wait for voices to be loaded
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
    }
  }, []);

  // Function to speak the text using the Web Speech API
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const zephyrVoice = voicesRef.current.find(voice => voice.name === 'Zephyr');

      if (zephyrVoice) {
        utterance.voice = zephyrVoice;
      } else {
        console.warn("The 'Zephyr' voice was not found. Using the default voice.");
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      return true;
    }
    console.warn("Speech Synthesis not supported in this browser.");
    return false;
  };

  // Initialize speech recognition
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
      addMessage(transcript, "user");
      await processRequest(transcript);
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

  const retryFetch = async (url, options, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 && retries > 0) {
        await new Promise((res) => setTimeout(res, delay));
        return retryFetch(url, options, retries - 1, delay * 2);
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

  const processRequest = async (userMessage) => {
    setStatusText("Generating response...");

    const lowerCaseMessage = userMessage.toLowerCase();
    if (
      lowerCaseMessage.includes("meditation") ||
      lowerCaseMessage.includes("guided breathing")
    ) {
      await startMeditation();
      return;
    }
    if (
      lowerCaseMessage.includes("creative prompt") ||
      lowerCaseMessage.includes("prompt")
    ) {
      await getCreativePrompt();
      return;
    }

    const textResponse = await getTextFromLLM(userMessage);
    addMessage(textResponse, "assistant");
    speakText(textResponse);
    setStatusText("Click to start talking.");
  };

  const startMeditation = async () => {
    setStatusText("Generating meditation...");
    const meditationPrompt =
      "Create a very short, simple, and calming guided breathing meditation script for a young person. Focus on a positive and relaxing tone. The script should be no more than three or four sentences long.";
    const script = await getTextFromLLM(meditationPrompt);
    addMessage(script, "assistant");
    speakText(script);
    setStatusText("Click to start talking.");
  };

  const getCreativePrompt = async () => {
    setStatusText("Generating prompt...");
    const promptPrompt =
      "Generate a short, creative writing or journaling prompt for a young person to help them express their feelings. Keep it open-ended and positive. For example, 'Write about a time you felt like a superhero.'";
    const creativeText = await getTextFromLLM(promptPrompt);
    addMessage(creativeText, "assistant");
    speakText(creativeText);
    setStatusText("Click to start talking.");
  };

  const getTextFromLLM = async (prompt) => {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [
          {
            text: "You are an empathetic and supportive emotional wellness assistant for youth. You provide kind, thoughtful, and non-judgmental responses. Keep your responses concise and easy to understand. Do not give medical advice.",
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
        "I'm having a bit of trouble right now. Please try again in a moment."
      );
    } catch (error) {
      console.error("Error fetching text from Gemini API:", error);
      return "I'm sorry, something went wrong. Please try again.";
    }
  };

  return (
    <div className="bg-[#4F6483] flex items-center justify-center min-h-screen p-4 pt-[100px]">
      <div className="max-w-lg w-full bg-white/85 backdrop-blur-lg rounded-3xl shadow-xl flex flex-col min-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="header bg-gradient-to-r from-purple-600 to-purple-400 text-white text-center p-6 shadow-md">
          <h1 className="text-3xl font-bold">Emotica AI</h1>
          <p className="text-sm opacity-90 mt-1">
            Voice Assistant for Mental Wellness
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-indigo-50 text-indigo-700 p-4 m-4 rounded-lg text-sm">
          <strong>Disclaimer:</strong> I am an AI assistant, not a doctor or
          therapist. The information I provide is for support only and is not a
          substitute for professional mental health care.
        </div>

        {/* Chat Area */}
        <div
          ref={chatAreaRef}
          className="chat-area flex-1 p-6 space-y-3 overflow-y-auto bg-gray-50"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message-box px-4 py-2 rounded-xl shadow-sm max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Feature Buttons */}
        <div className="feature-buttons flex gap-2 flex-wrap justify-center p-4">
          <button
            onClick={startMeditation}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-medium"
          >
            Guided Meditation ✨
          </button>
          <button
            onClick={getCreativePrompt}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-medium"
          >
            Creative Prompt ✨
          </button>
        </div>

        {/* Input Area */}
        <div className="flex flex-col items-center gap-3 p-6">
          <button
            onClick={async () => {
              if (isRecording) {
                recognitionRef.current.stop();
              } else {
                const permissionGranted = await requestMicrophonePermission();
                if (permissionGranted) {
                  recognitionRef.current.start();
                }
              }
            }}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isRecording
                ? "bg-gradient-to-r from-red-500 to-red-300 animate-pulse"
                : "bg-gradient-to-r from-purple-600 to-purple-400"
            }`}
          >
            🎤
          </button>
          <p className="text-gray-600 text-sm">{statusText}</p>
        </div>
      </div>
    </div>
  );
};

export default EmoticaAI;
