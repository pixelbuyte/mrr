"use client";

import { useState, useEffect } from "react";
import { Target, Plus, X, Flame } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./Card";

interface Habit {
  id: string;
  name: string;
  icon: string;
  completedDates: string[];
}

const HABIT_ICONS = ["💪", "📚", "🧘", "💧", "🏃", "🍎", "😴", "✍️", "🎯", "🧹"];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...dates].sort().reverse();
  const today = getTodayStr();
  if (sorted[0] !== today) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export default function HabitsWidget() {
  const [habits, setHabits, isLoaded] = useLocalStorage<Habit[]>("dashboard-habits", []);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("💪");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits([
      ...habits,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        icon: selectedIcon,
        completedDates: [],
      },
    ]);
    setNewName("");
    setShowAdd(false);
  };

  const toggleToday = (id: string) => {
    const today = getTodayStr();
    setHabits(
      habits.map((h) => {
        if (h.id !== id) return h;
        const done = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: done
            ? h.completedDates.filter((d) => d !== today)
            : [...h.completedDates, today],
        };
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  if (!mounted || !isLoaded) {
    return (
      <Card title="Habits" icon={<Target size={16} />}>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const today = getTodayStr();

  return (
    <Card title="Habits" icon={<Target size={16} />}>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {habits.length === 0 && !showAdd && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Track your daily habits here
          </p>
        )}
        {habits.map((habit) => {
          const doneToday = habit.completedDates.includes(today);
          const streak = getStreak(habit.completedDates);
          return (
            <div
              key={habit.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 group transition-colors"
            >
              <button
                onClick={() => toggleToday(habit.id)}
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                  doneToday
                    ? "bg-accent/20 scale-110"
                    : "bg-muted grayscale opacity-50"
                }`}
              >
                {habit.icon}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    doneToday ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {habit.name}
                </p>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400">
                    <Flame size={10} />
                    <span>{streak} day streak</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="mt-3 space-y-2 p-3 bg-muted/50 rounded-lg">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Habit name..."
            className="w-full px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <div className="flex gap-1 flex-wrap">
            {HABIT_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                  selectedIcon === icon
                    ? "bg-accent/20 ring-2 ring-accent"
                    : "hover:bg-muted"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={addHabit}
              className="flex-1 px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-lg hover:opacity-90"
            >
              Add Habit
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground border border-dashed border-border rounded-lg hover:border-accent hover:text-accent transition-colors"
        >
          <Plus size={14} />
          Add Habit
        </button>
      )}
    </Card>
  );
}
