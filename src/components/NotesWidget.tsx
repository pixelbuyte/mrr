"use client";

import { useState, useEffect } from "react";
import { StickyNote, Save } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./Card";

export default function NotesWidget() {
  const [notes, setNotes, isLoaded] = useLocalStorage("dashboard-notes", "");
  const [localNotes, setLocalNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setLocalNotes(notes);
    }
  }, [isLoaded, notes]);

  const handleSave = () => {
    setNotes(localNotes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted || !isLoaded) {
    return (
      <Card title="Quick Notes" icon={<StickyNote size={16} />}>
        <div className="h-32 rounded bg-muted animate-pulse" />
      </Card>
    );
  }

  return (
    <Card title="Quick Notes" icon={<StickyNote size={16} />}>
      <textarea
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        onBlur={handleSave}
        placeholder="Jot down your thoughts..."
        className="w-full h-40 p-3 text-sm bg-muted rounded-lg border border-border resize-none focus:outline-none focus:ring-2 focus:ring-ring/40 text-foreground placeholder:text-muted-foreground font-mono"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">
          {localNotes.length} characters
        </span>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
            saved
              ? "bg-green-500/20 text-green-400"
              : "bg-accent/10 text-accent hover:bg-accent/20"
          }`}
        >
          <Save size={12} />
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
    </Card>
  );
}
