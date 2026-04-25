"use client";

import { useState, useEffect } from "react";
import { Bookmark, Plus, Trash2, ExternalLink, X } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./Card";

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  color: string;
}

const COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
];

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: "1", title: "GitHub", url: "https://github.com", color: "bg-gray-500" },
  { id: "2", title: "Gmail", url: "https://mail.google.com", color: "bg-red-500" },
  { id: "3", title: "YouTube", url: "https://youtube.com", color: "bg-red-500" },
  { id: "4", title: "Twitter", url: "https://x.com", color: "bg-blue-500" },
  { id: "5", title: "Reddit", url: "https://reddit.com", color: "bg-orange-500" },
  { id: "6", title: "ChatGPT", url: "https://chat.openai.com", color: "bg-green-500" },
];

export default function BookmarksWidget() {
  const [bookmarks, setBookmarks, isLoaded] = useLocalStorage<BookmarkItem[]>(
    "dashboard-bookmarks",
    DEFAULT_BOOKMARKS
  );
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newColor, setNewColor] = useState("bg-blue-500");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addBookmark = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    setBookmarks([
      ...bookmarks,
      { id: Date.now().toString(), title: newTitle.trim(), url, color: newColor },
    ]);
    setNewTitle("");
    setNewUrl("");
    setShowAdd(false);
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  if (!mounted || !isLoaded) {
    return (
      <Card title="Quick Links" icon={<Bookmark size={16} />}>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Quick Links" icon={<Bookmark size={16} />}>
      <div className="grid grid-cols-3 gap-2">
        {bookmarks.map((bm) => (
          <a
            key={bm.id}
            href={bm.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col items-center justify-center p-3 rounded-xl hover:bg-muted/70 transition-colors"
          >
            <div
              className={`w-10 h-10 ${bm.color} rounded-xl flex items-center justify-center text-white text-sm font-bold mb-1.5 group-hover:scale-105 transition-transform`}
            >
              {bm.title.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-full">
              {bm.title}
            </span>
            <ExternalLink
              size={10}
              className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteBookmark(bm.id);
              }}
              className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-red-400 transition-all"
            >
              <Trash2 size={10} />
            </button>
          </a>
        ))}
      </div>

      {showAdd ? (
        <div className="mt-3 space-y-2 p-3 bg-muted/50 rounded-lg">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title..."
            className="w-full px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBookmark()}
            placeholder="URL..."
            className="w-full px-3 py-2 text-sm bg-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-1 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full ${c} transition-transform ${
                  newColor === c ? "scale-125 ring-2 ring-offset-2 ring-accent ring-offset-card" : ""
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={addBookmark}
              className="flex-1 px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-lg hover:opacity-90"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-muted-foreground border border-dashed border-border rounded-lg hover:border-accent hover:text-accent transition-colors"
        >
          <Plus size={14} />
          Add Link
        </button>
      )}
    </Card>
  );
}
