"use client";

import { useState, useEffect } from "react";
import { Crosshair, Sparkles } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./Card";

interface FocusData {
  date: string;
  text: string;
}

export default function FocusWidget() {
  const [focus, setFocus, isLoaded] = useLocalStorage<FocusData | null>("dashboard-focus", null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const isToday = focus?.date === today;

  const save = () => {
    if (!draft.trim()) return;
    setFocus({ date: today, text: draft.trim() });
    setEditing(false);
  };

  const startEdit = () => {
    setDraft(isToday && focus ? focus.text : "");
    setEditing(true);
  };

  if (!mounted || !isLoaded) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <div className="h-16 rounded bg-muted animate-pulse" />
      </Card>
    );
  }

  return (
    <Card
      className="col-span-full lg:col-span-2"
      title="Today's Focus"
      icon={<Crosshair size={16} />}
    >
      {editing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="What's your #1 priority today?"
            className="flex-1 px-4 py-3 text-base bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={save}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Set
          </button>
        </div>
      ) : isToday && focus ? (
        <button
          onClick={startEdit}
          className="w-full text-left group"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20 group-hover:border-accent/40 transition-colors">
            <Sparkles size={20} className="text-accent flex-shrink-0" />
            <p className="text-lg font-medium text-foreground">{focus.text}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Click to edit
          </p>
        </button>
      ) : (
        <button
          onClick={startEdit}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors"
        >
          <Crosshair size={18} />
          <span className="text-sm font-medium">Set your focus for today</span>
        </button>
      )}
    </Card>
  );
}
