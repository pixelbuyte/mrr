"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Plus, Trash2, Check } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import Card from "./Card";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export default function TodoWidget() {
  const [todos, setTodos, isLoaded] = useLocalStorage<TodoItem[]>("dashboard-todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  if (!mounted || !isLoaded) {
    return (
      <Card title="To-Do" icon={<CheckSquare size={16} />}>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded bg-muted animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="To-Do" icon={<CheckSquare size={16} />}>
      {todos.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{completedCount}/{todos.length} completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring/40 text-foreground placeholder:text-muted-foreground"
        />
        <button
          onClick={addTodo}
          className="p-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {todos.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No tasks yet. Add one above!
          </p>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-colors"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                todo.completed
                  ? "bg-accent border-accent text-accent-foreground"
                  : "border-border hover:border-accent"
              }`}
            >
              {todo.completed && <Check size={12} />}
            </button>
            <span
              className={`flex-1 text-sm ${
                todo.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-400 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
