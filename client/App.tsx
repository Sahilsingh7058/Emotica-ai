import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import RootLayout from "@/components/layout/RootLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Journal from "@/pages/Journal";
import Community from "@/pages/Community";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Emotica from "./components/Emotica";
import SmallApps from "./pages/SmallApps";
import Dashboard from "./pages/Dashboard";

// Small Apps
import Breathing from "@/pages/Small Apps/Breathing";
import MoodTracker from "@/pages/Small Apps/MoodTracker";
import Gratitude from "@/pages/Small Apps/Gratitude";
import MeditationTimer from "@/pages/Small Apps/MeditationTimer";
import SleepStories from "@/pages/Small Apps/SleepStories.jsx";
import FocusBooster from "@/pages/Small Apps/FocusBooster";
import EnergyCheck from "@/pages/Small Apps/EnergyCheck";
import Sounds from "@/pages/Small Apps/Sounds";
import HabitBuilder from "@/pages/Small Apps/HabitBuilder.tsx";
import Kindness from "@/pages/Small Apps/Kindness";
import Affirmations from "@/pages/Small Apps/Affirmations";
import EmotionAnalyzer from "@/pages/Small Apps/EmotionAnalyzer";
import EmotionAnalysis from "@/pages/EmotionAnalysis";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<RootLayout />}>
                <Route index element={<Index />} />
                <Route path="journal" element={<Journal />} />
                <Route path="community" element={<Community />} />
                <Route path="support" element={<Support />} />
                <Route path="profile" element={<Profile />} />
                <Route path="emotica" element={<Emotica />} />
                <Route path="smallapps" element={<SmallApps />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Small Apps */}
                <Route path="apps/breathing" element={<Breathing />} />
                <Route path="apps/mood" element={<MoodTracker />} />
                <Route path="apps/gratitude" element={<Gratitude />} />
                <Route path="apps/meditation" element={<MeditationTimer />} />
                <Route path="apps/sleep" element={<SleepStories />} />
                <Route path="apps/focus" element={<FocusBooster />} />
                <Route path="apps/energy" element={<EnergyCheck />} />
                <Route path="apps/sounds" element={<Sounds />} />
                <Route path="apps/habits" element={<HabitBuilder />} />
                <Route path="apps/kindness" element={<Kindness />} />
                <Route path="apps/affirmations" element={<Affirmations />} />
                <Route path="apps/emotion-analyzer" element={<EmotionAnalyzer />} />
                <Route path="emotion-analysis" element={<EmotionAnalysis />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

createRoot(document.getElementById("root")!).render(<App />);
