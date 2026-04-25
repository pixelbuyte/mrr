"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Moon, Sun, RefreshCw } from "lucide-react";
import ClockWidget from "../components/ClockWidget";
import WeatherWidget from "../components/WeatherWidget";
import TodoWidget from "../components/TodoWidget";
import NotesWidget from "../components/NotesWidget";
import PomodoroWidget from "../components/PomodoroWidget";
import HabitsWidget from "../components/HabitsWidget";
import BookmarksWidget from "../components/BookmarksWidget";
import QuoteWidget from "../components/QuoteWidget";
import MoodWidget from "../components/MoodWidget";
import FocusWidget from "../components/FocusWidget";

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const saved = localStorage.getItem("dashboard-dark-mode");
    setDarkMode(saved ? saved === "true" : prefersDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    if (darkMode) {
      document.documentElement.style.setProperty("--background", "#0b1120");
      document.documentElement.style.setProperty("--foreground", "#e2e8f0");
      document.documentElement.style.setProperty("--card", "#141c2e");
      document.documentElement.style.setProperty("--card-foreground", "#e2e8f0");
      document.documentElement.style.setProperty("--muted", "#1e293b");
      document.documentElement.style.setProperty("--muted-foreground", "#94a3b8");
      document.documentElement.style.setProperty("--border", "#1e293b");
      document.documentElement.style.setProperty("--accent", "#818cf8");
      document.documentElement.style.setProperty("--accent-foreground", "#0b1120");
      document.documentElement.style.setProperty("--ring", "#818cf8");
    } else {
      document.documentElement.style.setProperty("--background", "#f8fafc");
      document.documentElement.style.setProperty("--foreground", "#0f172a");
      document.documentElement.style.setProperty("--card", "#ffffff");
      document.documentElement.style.setProperty("--card-foreground", "#0f172a");
      document.documentElement.style.setProperty("--muted", "#f1f5f9");
      document.documentElement.style.setProperty("--muted-foreground", "#64748b");
      document.documentElement.style.setProperty("--border", "#e2e8f0");
      document.documentElement.style.setProperty("--accent", "#6366f1");
      document.documentElement.style.setProperty("--accent-foreground", "#ffffff");
      document.documentElement.style.setProperty("--ring", "#6366f1");
    }
    localStorage.setItem("dashboard-dark-mode", String(darkMode));
  }, [darkMode, mounted]);

  const toggleDark = () => setDarkMode((d) => !d);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <LayoutDashboard size={18} className="text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Daily Dashboard</h1>
                <p className="text-xs text-muted-foreground -mt-0.5">Your personal command center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={toggleDark}
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Toggle theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1: Clock + Weather */}
          <ClockWidget />
          <WeatherWidget />
          <MoodWidget />

          {/* Row 2: Focus */}
          <FocusWidget />
          <PomodoroWidget />

          {/* Row 3: Todo + Habits + Bookmarks */}
          <TodoWidget />
          <HabitsWidget />
          <BookmarksWidget />

          {/* Row 4: Notes */}
          <NotesWidget />

          {/* Row 5: Quote */}
          <QuoteWidget />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            Daily Dashboard &middot; All data stored locally in your browser
          </p>
        </div>
      </footer>
    </div>
  );
}
