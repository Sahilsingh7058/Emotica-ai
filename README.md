Emotica AI 💜
Emotica AI is a comprehensive web platform dedicated to supporting youth emotional wellness. It provides a safe, beautiful, and engaging space for users to explore 
their feelings and access a suite of targeted tools designed to promote mental well-being.
Built with React, Tailwind CSS, and powered by the Google Gemini API, Emotica AI offers a personalized and interactive experience to help users find balance, focus, and peace.

✨ Features

Wellness Hub: A central dashboard to access all wellness mini-applications.

🧘 Guided Breathing: A "Breathing App" with multiple patterns (e.g., Calm, Balance, Focus) and audio-visual cues to guide your practice.

🎵 Emotion-Based Music: An AI-powered app that suggests music genres, activities, and YouTube search links based on your current mood.

⏳ Meditation Timer: A clean, circular timer to help you focus on your meditation practice for a set duration.

🚀 Focus Booster: A Pomodoro timer with different modes (Focus, Short Break, Long Break) and optional ambient sounds to boost productivity.

✨ Positive Affirmations: A "Daily Vibes" app to receive and save uplifting affirmations, helping to build a positive mindset.

...and more planned: Including a Journal, Bed Time Stories, and a Habit Builder.

🛠️ Tech Stack
Frontend: React (with Vite)
Styling: Tailwind CSS
AI & APIs: Google Gemini API
Routing: React Router
Animation: Framer Motion
Icons: Lucide React

🚀 Getting Started
To get a local copy up and running, follow these simple steps.
Prerequisites
Node.js (v18 or later)
npm
A Google Gemini API Key. You can get one from Google AI Studio.

Installation
1]Clone the repository:
git clone [https://github.com/Sahilsingh7058/Emotica-ai.git](https://github.com/Sahilsingh7058/Emotica-ai.git)

2]Navigate to the client directory:
This project uses a separate client folder for the React frontend.
cd Emotica-ai/client

3]Install NPM packages:
npm install

4]create your environment file:
In the client directory, create a new file named .env and add your Gemini API key. (The React components look for this variable).
VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE

5]Run the development server:
npm run dev

6]Open http://localhost:5173 (or the port shown in your terminal) to view the app in your browser.

🧠 What I Learned

This project was a deep dive into building a modern, interactive, and AI-powered web application. Key learnings include:
Component-Based Architecture: Structuring a complex application into reusable, self-contained React components (e.g., Breathing.tsx, MeditationTimer.jsx, FocusBooster.jsx).
Advanced React Hooks: Utilizing useState, useEffect, useRef, useMemo, and useCallback to manage complex component state, timers, animations, and API calls efficiently.
Client-Side Routing: Implementing a single-page application (SPA) using react-router-dom to create a seamless user experience between the "Wellness Hub" and the individual mini-apps.
AI Integration (Gemini):

Calling the Gemini API to generate dynamic, personalized text content.
Prompt Engineering: Designing detailed system prompts and user prompts to get a specific, structured JSON-like response from the AI (e.g., extracting a [YOUTUBE_QUERY:...] tag from a text blob).
Browser APIs: Using the Web Audio API to generate procedural sounds (like beeps and ambient tones) from scratch, and the Web Speech API for voice-to-text input.
Modern Styling & UX:

Creating a consistent, responsive, and visually appealing UI with Tailwind CSS.
Applying a "card" based design system that works across different devices.
Using Framer Motion and CSS transitions to add meaningful animations and user feedback.
