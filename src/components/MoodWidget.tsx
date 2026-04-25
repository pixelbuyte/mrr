"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./Card";

const MOODS = [
  { emoji: "😊", label: "Great", color: "bg-green-500/20 text-green-400" },
  { emoji: "🙂", label: "Good", color: "bg-blue-500/20 text-blue-400" },
  { emoji: "😐", label: "Okay", color: "bg-yellow-500/20 text-yellow-400" },
  { emoji: "😔", label: "Low", color: "bg-orange-500/20 text-orange-400" },
  { emoji: "😢", label: "Tough", color: "bg-red-500/20 text-red-400" },
];

interface MoodEntry {
  date: string;
  mood: number;
}

export default function MoodWidget() {
  const [moodLog, setMoodLog, isLoaded] = useLocalStorage<MoodEntry[]>("dashboard-mood", []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayEntry = moodLog.find((m) => m.date === today);

  const setMood = (index: number) => {
    const updated = moodLog.filter((m) => m.date !== today);
    updated.push({ date: today, mood: index });
    setMoodLog(updated);
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = moodLog.find((m) => m.date === dateStr);
    return { date: dateStr, mood: entry?.mood, day: d.toLocaleDateString("en", { weekday: "short" }).charAt(0) };
  });

  if (!mounted || !isLoaded) {
    return (
      <Card title="Mood" icon={<Heart size={16} />}>
        <div className="h-20 rounded bg-muted animate-pulse" />
      </Card>
    );
  }

  return (
    <Card title="Mood" icon={<Heart size={16} />}>
      <p className="text-xs text-muted-foreground mb-3">How are you feeling today?</p>
      <div className="flex justify-between gap-1 mb-4">
        {MOODS.map((mood, i) => (
          <button
            key={mood.label}
            onClick={() => setMood(i)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              todayEntry?.mood === i
                ? `${mood.color} scale-110 ring-1 ring-current`
                : "hover:bg-muted"
            }`}
          >
            <span className="text-xl">{mood.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{mood.label}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-between gap-1 pt-3 border-t border-border">
        {last7.map((d) => (
          <div key={d.date} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-muted">
              {d.mood !== undefined ? MOODS[d.mood].emoji : "·"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
