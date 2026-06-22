import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import { useAuth, useApiFetch } from "@/context/AuthContext";

const appMapping: Record<string, { id: string; name: string }> = {
  "/apps/breathing": { id: "breathing", name: "Breathing App" },
  "/apps/mood": { id: "mood", name: "Mood Tracker" },
  "/apps/gratitude": { id: "gratitude", name: "Gratitude Log" },
  "/apps/meditation": { id: "meditation", name: "Meditation Timer" },
  "/apps/sleep": { id: "sleep", name: "Sleep Stories" },
  "/apps/focus": { id: "focus", name: "Focus Booster" },
  "/apps/energy": { id: "energy", name: "Energy Check" },
  "/apps/sounds": { id: "sounds", name: "Stress Relief Sounds" },
  "/apps/habits": { id: "habits", name: "Habit Builder" },
  "/apps/kindness": { id: "kindness", name: "Kindness Journal" },
  "/apps/affirmations": { id: "affirmations", name: "Positive Affirmations" },
  "/journal": { id: "journal", name: "Journal App" },
};

export default function RootLayout() {
  const { user } = useAuth();
  const apiFetch = useApiFetch();
  const location = useLocation();

  const currentAppRef = useRef<{ id: string; name: string; startTime: number } | null>(null);

  useEffect(() => {
    const handleLogUsage = async (app: { id: string; name: string; startTime: number }) => {
      const duration = Math.round((Date.now() - app.startTime) / 1000);
      if (duration > 0 && user) {
        try {
          await apiFetch("/api/streak/usage", {
            method: "POST",
            body: JSON.stringify({
              appId: app.id,
              appName: app.name,
              durationSeconds: duration,
            }),
          });
        } catch (err) {
          console.error("[ActivityTracker] Failed to log app usage:", err);
        }
      }
    };

    const prevApp = currentAppRef.current;
    if (prevApp && prevApp.id !== appMapping[location.pathname]?.id) {
      handleLogUsage(prevApp);
      currentAppRef.current = null;
    }

    const matchedApp = appMapping[location.pathname];
    if (matchedApp) {
      if (!currentAppRef.current || currentAppRef.current.id !== matchedApp.id) {
        currentAppRef.current = {
          id: matchedApp.id,
          name: matchedApp.name,
          startTime: Date.now(),
        };
      }
    }
  }, [location.pathname, user, apiFetch]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const activeApp = currentAppRef.current;
      if (activeApp && user) {
        const duration = Math.round((Date.now() - activeApp.startTime) / 1000);
        if (duration > 0) {
          const token = localStorage.getItem("emotica_token");
          fetch("/api/streak/usage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              appId: activeApp.id,
              appName: activeApp.name,
              durationSeconds: duration,
            }),
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  return (
    <div className="min-h-dvh bg-background text-foreground bg-neutral-500">
      <SiteHeader />
      <main className=""> 
        <Outlet />
      </main>
    </div>
  );
}
