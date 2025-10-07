import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RootLayout from "@/components/layout/RootLayout";
import Journal from "@/pages/Journal";
import Breathing from "@/pages/Small Apps/Breathing";
import Community from "@/pages/Community";
import Support from "@/pages/Support";
import Profile from "@/pages/Profile";
import Emotica from "./components/Emotica";
import SmallApps from "./pages/SmallApps";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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

            <Route path="/Small Apps/Breathing" element={<Breathing />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
