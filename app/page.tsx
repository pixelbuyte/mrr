"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  CloudSun,
  Dumbbell,
  Flame,
  GlassWater,
  ListTodo,
  LoaderCircle,
  MapPin,
  MoonStar,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Sparkles,
  SunMedium,
  Target,
  TimerReset,
  Trash2,
  Waves,
  Zap,
} from "lucide-react";

type FocusTask = {
  id: string;
  text: string;
  done: boolean;
  tag: string;
};

type WellnessMetrics = {
  sleepHours: number;
  hydration: number;
  movement: number;
  energy: number;
  mood: number;
};

type WeatherState =
  | {
      status: "idle" | "loading";
    }
  | {
      status: "ready";
      temperature: number;
      wind: number;
      condition: string;
      place: string;
    }
  | {
      status: "error";
      message: string;
    };

type HabitDefinition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

const INITIAL_TASKS: FocusTask[] = [
  {
    id: "task-1",
    text: "Ship one meaningful thing before lunch",
    done: false,
    tag: "Deep work",
  },
  {
    id: "task-2",
    text: "Review inbox and clear the real blockers",
    done: true,
    tag: "Admin",
  },
  {
    id: "task-3",
    text: "Plan tonight's recovery window",
    done: false,
    tag: "Life",
  },
];

const HABIT_DEFINITIONS: HabitDefinition[] = [
  {
    id: "sunlight",
    label: "Morning light",
    description: "Step outside and reset your rhythm.",
    icon: SunMedium,
    accent: "from-amber-400/25 to-orange-400/15",
  },
  {
    id: "water",
    label: "Water first",
    description: "Front-load hydration before the day drifts.",
    icon: GlassWater,
    accent: "from-cyan-400/25 to-sky-400/15",
  },
  {
    id: "movement",
    label: "Move your body",
    description: "Even ten deliberate minutes counts.",
    icon: Dumbbell,
    accent: "from-emerald-400/25 to-lime-400/15",
  },
  {
    id: "winddown",
    label: "Night reset",
    description: "Close loops and make tomorrow lighter.",
    icon: MoonStar,
    accent: "from-violet-400/25 to-fuchsia-400/15",
  },
];

const DEFAULT_WELLNESS: WellnessMetrics = {
  sleepHours: 7.5,
  hydration: 5,
  movement: 30,
  energy: 3,
  mood: 4,
};

const FOCUS_PRESETS = [15, 25, 45];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getWeatherLabel(code: number) {
  const mapping: Record<number, string> = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Freezing fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  };

  return mapping[code] ?? "Mixed conditions";
}

function getStreak(entries: string[], todayKey: string) {
  const completedDays = new Set(entries);
  const cursor = parseDateKey(todayKey);
  let streak = 0;

  while (completedDays.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildMonthCells(baseDate: Date) {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const daysInMonth = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0
  ).getDate();
  const leadingDays = firstDay.getDay();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNumber);
    return {
      key: getDateKey(date),
      label: date.getDate(),
      inMonth: dayNumber >= 1 && dayNumber <= daysInMonth,
    };
  });
}

function getScaleLabel(value: number, labels: string[]) {
  return labels[Math.max(0, Math.min(labels.length - 1, value - 1))];
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const rawValue = window.localStorage.getItem(key);
      if (rawValue !== null) {
        return JSON.parse(rawValue) as T;
      }
    } catch {
      // Ignore storage issues and keep the default state.
    }

    return initialValue;
  });
  const isFirstPersist = useRef(true);

  useEffect(() => {
    if (isFirstPersist.current) {
      isFirstPersist.current = false;
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore storage issues so the dashboard still works in private mode.
    }
  }, [key, state]);

  return [state, setState] as const;
}

function Panel({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(8,15,35,0.35)] backdrop-blur-xl sm:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  icon: Icon,
  eyebrow,
  title,
  description,
}: Readonly<{
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
          {eyebrow}
        </p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/8 p-2 text-cyan-200">
            <Icon className="size-4" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-sm text-slate-300">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderControl({
  icon: Icon,
  label,
  helper,
  min,
  max,
  value,
  step = 1,
  accent,
  onChange,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  helper: string;
  min: number;
  max: number;
  value: number;
  step?: number;
  accent: string;
  onChange: (nextValue: number) => void;
}>) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("rounded-2xl bg-gradient-to-br p-2 text-white", accent)}>
            <Icon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-slate-400">{helper}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-cyan-200">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan-300"
      />
    </div>
  );
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [draftTask, setDraftTask] = useState("");
  const [focusTasks, setFocusTasks] = usePersistentState<FocusTask[]>(
    "daily-dashboard-focus-tasks",
    INITIAL_TASKS
  );
  const [habitHistory, setHabitHistory] = usePersistentState<Record<string, string[]>>(
    "daily-dashboard-habit-history",
    {}
  );
  const [wellness, setWellness] = usePersistentState<WellnessMetrics>(
    "daily-dashboard-wellness",
    DEFAULT_WELLNESS
  );
  const [notesByDate, setNotesByDate] = usePersistentState<Record<string, string>>(
    "daily-dashboard-notes",
    {}
  );
  const [intentionByDate, setIntentionByDate] = usePersistentState<
    Record<string, string>
  >("daily-dashboard-intention", {});
  const [sessionLength, setSessionLength] = usePersistentState<number>(
    "daily-dashboard-session-length",
    25
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [weather, setWeather] = useState<WeatherState>({ status: "idle" });

  useEffect(() => {
    const updateTime = () => setNow(new Date());

    updateTime();

    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    let cancelled = false;
    const geolocation = typeof navigator !== "undefined" ? navigator.geolocation : undefined;

    if (!geolocation) {
      window.setTimeout(() => {
        if (!cancelled) {
          setWeather({
            status: "error",
            message: "Location-based weather is not available on this device.",
          });
        }
      }, 0);

      return () => {
        cancelled = true;
      };
    }

    window.setTimeout(() => {
      if (!cancelled) {
        setWeather({ status: "loading" });
      }
    }, 0);

    geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const query = new URLSearchParams({
            latitude: String(coords.latitude),
            longitude: String(coords.longitude),
            current: "temperature_2m,weather_code,wind_speed_10m",
          });
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${query.toString()}`
          );

          if (!response.ok) {
            throw new Error("Weather request failed.");
          }

          const data = (await response.json()) as {
            timezone?: string;
            current?: {
              temperature_2m?: number;
              weather_code?: number;
              wind_speed_10m?: number;
            };
          };

          if (cancelled) return;

          setWeather({
            status: "ready",
            temperature: Math.round(data.current?.temperature_2m ?? 0),
            wind: Math.round(data.current?.wind_speed_10m ?? 0),
            condition: getWeatherLabel(data.current?.weather_code ?? 0),
            place:
              data.timezone?.split("/").pop()?.replace(/_/g, " ") ?? "Your area",
          });
        } catch {
          if (!cancelled) {
            setWeather({
              status: "error",
              message: "Live weather could not be loaded right now.",
            });
          }
        }
      },
      () => {
        if (!cancelled) {
          setWeather({
            status: "error",
            message: "Allow location access to see live weather here.",
          });
        }
      },
      { timeout: 10000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!now) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-slate-950/45 p-8 text-center shadow-[0_28px_120px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
              <LoaderCircle className="size-6 animate-spin" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
              Preparing your dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Loading your private daily system
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              Pulling in your saved focus, habits, and notes so the day opens with
              context.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const activeDate = now;
  const todayKey = getDateKey(activeDate);
  const dailyNote = notesByDate[todayKey] ?? "";
  const dailyIntention = intentionByDate[todayKey] ?? "";
  const completedTasks = focusTasks.filter((task) => task.done).length;
  const focusPercent = focusTasks.length
    ? Math.round((completedTasks / focusTasks.length) * 100)
    : 0;
  const greeting = now ? getGreeting(now.getHours()) : "Welcome back";
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(activeDate);
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(activeDate);
  const monthCells = buildMonthCells(activeDate);

  const habitCards = HABIT_DEFINITIONS.map((habit) => {
    const entries = habitHistory[habit.id] ?? [];
    return {
      ...habit,
      checked: entries.includes(todayKey),
      streak: getStreak(entries, todayKey),
    };
  });

  const completedHabits = habitCards.filter((habit) => habit.checked).length;
  const longestHabitStreak = habitCards.reduce(
    (longest, habit) => Math.max(longest, habit.streak),
    0
  );
  const energyLabel = getScaleLabel(wellness.energy, [
    "Low",
    "Steady",
    "Ready",
    "Sharp",
    "Flying",
  ]);
  const moodLabel = getScaleLabel(wellness.mood, [
    "Heavy",
    "Flat",
    "Okay",
    "Good",
    "Excellent",
  ]);
  const dashboardScore = Math.min(
    100,
    Math.round(
      focusPercent * 0.45 +
        (completedHabits / HABIT_DEFINITIONS.length) * 25 +
        (wellness.sleepHours / 9) * 12 +
        (wellness.hydration / 8) * 10 +
        (wellness.movement / 45) * 8
    )
  );
  const focusTimeLabel = `${String(Math.floor(secondsLeft / 60)).padStart(
    2,
    "0"
  )}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const weekMomentum = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(parseDateKey(todayKey), index - 6);
    const key = getDateKey(date);
    const count = HABIT_DEFINITIONS.reduce((total, habit) => {
      return total + ((habitHistory[habit.id] ?? []).includes(key) ? 1 : 0);
    }, 0);

    return {
      key,
      count,
      shortLabel: new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(date),
    };
  });

  const insights: string[] = [];

  if (focusPercent < 60) {
    insights.push("Block one uninterrupted session for your highest-leverage task.");
  }

  if (completedHabits < 2) {
    insights.push("A quick ritual stack will raise the feel of the whole day.");
  }

  if (wellness.sleepHours < 7) {
    insights.push("Protect recovery today. Favor fewer important moves over more noise.");
  }

  if (!dailyNote.trim()) {
    insights.push("Capture a single sentence tonight so tomorrow starts with context.");
  }

  function toggleTask(id: string) {
    setFocusTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  function removeTask(id: string) {
    setFocusTasks((current) => current.filter((task) => task.id !== id));
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draftTask.trim();

    if (!text) return;

    setFocusTasks((current) => [
      {
        id: createId(),
        text,
        done: false,
        tag: "Personal",
      },
      ...current,
    ]);
    setDraftTask("");
  }

  function toggleHabit(id: string) {
    setHabitHistory((current) => {
      const existing = current[id] ?? [];
      const nextEntries = existing.includes(todayKey)
        ? existing.filter((entry) => entry !== todayKey)
        : [...existing, todayKey].sort();

      return {
        ...current,
        [id]: nextEntries,
      };
    });
  }

  function updateWellness<K extends keyof WellnessMetrics>(
    key: K,
    value: WellnessMetrics[K]
  ) {
    setWellness((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/45 p-6 shadow-[0_28px_120px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.20),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[1.2fr,0.8fr] xl:items-end">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                  <Sparkles className="size-3.5" />
                  Personal daily dashboard
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-medium text-slate-300">
                  Local-first and private
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-300/80">
                  {formattedDate}
                </p>
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {greeting}. Keep today clear, calm, and intentional.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Your dashboard balances focus, habits, recovery, and reflection
                  in one place so the day feels guided instead of crowded.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200">
                  <CalendarDays className="size-4 text-cyan-200" />
                  {formattedTime}
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200">
                  <Target className="size-4 text-emerald-200" />
                  {Math.max(focusTasks.length - completedTasks, 0)} priorities left
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200">
                  <Flame className="size-4 text-amber-200" />
                  {longestHabitStreak} day best streak
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                {
                  label: "Daily rhythm",
                  value: `${dashboardScore}%`,
                  helper: "Based on focus, habits, and recovery",
                  accent: "text-cyan-200",
                },
                {
                  label: "Focus cleared",
                  value: `${completedTasks}/${focusTasks.length || 0}`,
                  helper: "Meaningful tasks done today",
                  accent: "text-emerald-200",
                },
                {
                  label: "Current state",
                  value: `${energyLabel} / ${moodLabel}`,
                  helper: "Energy and mood snapshot",
                  accent: "text-fuchsia-200",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/10 bg-slate-950/35 p-4"
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className={cn("mt-2 text-2xl font-semibold", item.accent)}>
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.helper}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
          <div className="grid gap-6">
            <Panel>
              <div className="flex flex-col gap-5">
                <SectionHeading
                  icon={ListTodo}
                  eyebrow="Focus board"
                  title="Today's priorities"
                  description="Keep the day small enough to win on purpose."
                />

                <form
                  className="flex flex-col gap-3 sm:flex-row"
                  onSubmit={addTask}
                >
                  <input
                    type="text"
                    value={draftTask}
                    onChange={(event) => setDraftTask(event.target.value)}
                    placeholder="Add a task worth doing today"
                    className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-cyan-300/50"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    <Plus className="size-4" />
                    Add task
                  </button>
                </form>

                <div className="space-y-3">
                  {focusTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 rounded-[22px] border border-white/8 bg-slate-950/35 px-4 py-3 transition",
                        task.done && "border-emerald-300/20 bg-emerald-300/8"
                      )}
                    >
                      <button
                        type="button"
                        aria-label={`Toggle ${task.text}`}
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-full border transition",
                          task.done
                            ? "border-emerald-300 bg-emerald-300 text-slate-950"
                            : "border-white/15 bg-white/5 text-slate-300 hover:border-cyan-200 hover:text-cyan-100"
                        )}
                      >
                        <CheckCircle2 className="size-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-medium text-white",
                            task.done && "text-slate-300 line-through"
                          )}
                        >
                          {task.text}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                          {task.tag}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={`Remove ${task.text}`}
                        onClick={() => removeTask(task.id)}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Completion
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {focusPercent}%
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                        style={{ width: `${focusPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Habit hits
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {completedHabits}/{HABIT_DEFINITIONS.length}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Tiny rituals make the rest easier.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Recovery view
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {wellness.sleepHours.toFixed(1)}h
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Sleep is setting the tone right now.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
              <Panel>
                <div className="space-y-5">
                  <SectionHeading
                    icon={Flame}
                    eyebrow="Rituals"
                    title="Daily habit streaks"
                    description="Simple wins that compound over time."
                  />
                  <div className="grid gap-3">
                    {habitCards.map((habit) => {
                      const Icon = habit.icon;

                      return (
                        <button
                          key={habit.id}
                          type="button"
                          onClick={() => toggleHabit(habit.id)}
                          className={cn(
                            "rounded-[24px] border p-4 text-left transition",
                            habit.checked
                              ? "border-cyan-300/35 bg-white/10"
                              : "border-white/8 bg-slate-950/30 hover:border-white/15"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "rounded-2xl bg-gradient-to-br p-3 text-white",
                                  habit.accent
                                )}
                              >
                                <Icon className="size-4" />
                              </span>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {habit.label}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-slate-300">
                                  {habit.description}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                                Streak
                              </p>
                              <p className="mt-1 text-lg font-semibold text-cyan-200">
                                {habit.streak}d
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Panel>

              <Panel>
                <div className="space-y-5">
                  <SectionHeading
                    icon={Waves}
                    eyebrow="Recovery"
                    title="Wellness snapshot"
                    description="Track what changes the quality of the day."
                  />

                  <SliderControl
                    icon={MoonStar}
                    label="Sleep"
                    helper="Last night in hours"
                    min={4}
                    max={10}
                    step={0.5}
                    value={wellness.sleepHours}
                    accent="from-violet-500 to-indigo-500"
                    onChange={(value) => updateWellness("sleepHours", value)}
                  />
                  <SliderControl
                    icon={GlassWater}
                    label="Hydration"
                    helper="Glasses of water today"
                    min={0}
                    max={10}
                    value={wellness.hydration}
                    accent="from-cyan-500 to-sky-500"
                    onChange={(value) => updateWellness("hydration", value)}
                  />
                  <SliderControl
                    icon={Dumbbell}
                    label="Movement"
                    helper="Active minutes so far"
                    min={0}
                    max={90}
                    step={5}
                    value={wellness.movement}
                    accent="from-emerald-500 to-lime-500"
                    onChange={(value) => updateWellness("movement", value)}
                  />
                  <SliderControl
                    icon={Zap}
                    label="Energy"
                    helper={energyLabel}
                    min={1}
                    max={5}
                    value={wellness.energy}
                    accent="from-amber-500 to-orange-500"
                    onChange={(value) => updateWellness("energy", value)}
                  />
                  <SliderControl
                    icon={Sparkles}
                    label="Mood"
                    helper={moodLabel}
                    min={1}
                    max={5}
                    value={wellness.mood}
                    accent="from-fuchsia-500 to-pink-500"
                    onChange={(value) => updateWellness("mood", value)}
                  />
                </div>
              </Panel>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
              <Panel>
                <div className="space-y-5">
                  <SectionHeading
                    icon={NotebookPen}
                    eyebrow="Journal"
                    title="Evening note"
                    description="Leave tomorrow a breadcrumb before the day ends."
                  />
                  <textarea
                    value={dailyNote}
                    onChange={(event) =>
                      setNotesByDate((current) => ({
                        ...current,
                        [todayKey]: event.target.value,
                      }))
                    }
                    placeholder="What mattered, what felt off, and what you want to remember tomorrow..."
                    className="min-h-48 w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                  />
                  <p className="text-sm text-slate-400">
                    Saved automatically in your browser for personal use.
                  </p>
                </div>
              </Panel>

              <Panel>
                <div className="space-y-5">
                  <SectionHeading
                    icon={CalendarDays}
                    eyebrow="Momentum"
                    title="Calendar and last 7 days"
                    description="A quick visual of how consistent the week feels."
                  />

                  <div className="rounded-[24px] border border-white/8 bg-slate-950/35 p-4">
                    <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.22em] text-slate-500">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <span key={day}>{day}</span>
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {monthCells.map((cell) => (
                        <div
                          key={cell.key}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded-2xl border text-sm",
                            cell.key === todayKey
                              ? "border-cyan-300 bg-cyan-300 text-slate-950"
                              : cell.inMonth
                                ? "border-white/8 bg-white/5 text-slate-200"
                                : "border-transparent bg-transparent text-slate-600"
                          )}
                        >
                          {cell.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {weekMomentum.map((day) => (
                      <div key={day.key} className="space-y-2 text-center">
                        <div className="flex h-24 items-end justify-center rounded-2xl border border-white/8 bg-slate-950/35 p-3">
                          <div
                            className="w-full rounded-full bg-gradient-to-t from-cyan-300 to-violet-300"
                            style={{
                              height: `${Math.max(18, (day.count / HABIT_DEFINITIONS.length) * 100)}%`,
                              opacity: day.count === 0 ? 0.2 : 1,
                            }}
                          />
                        </div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          {day.shortLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            </div>
          </div>

          <div className="grid auto-rows-max gap-6">
            <Panel>
              <div className="space-y-5">
                <SectionHeading
                  icon={Target}
                  eyebrow="Focus"
                  title="Session timer"
                  description="Start one clean block and let the noise wait."
                />

                <div className="grid grid-cols-3 gap-2">
                  {FOCUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setSessionLength(preset);
                        setTimerRunning(false);
                        setSecondsLeft(preset * 60);
                      }}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                        sessionLength === preset
                          ? "border-cyan-300 bg-cyan-300 text-slate-950"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20"
                      )}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>

                <div className="rounded-[28px] border border-white/8 bg-slate-950/40 p-6 text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Time remaining
                  </p>
                  <p className="mt-4 text-6xl font-semibold tracking-tight text-white">
                    {focusTimeLabel}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerRunning((current) => !current)}
                      disabled={secondsLeft === 0}
                      className="inline-flex min-w-28 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {timerRunning ? (
                        <>
                          <Pause className="size-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="size-4" />
                          Start
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimerRunning(false);
                        setSecondsLeft(sessionLength * 60);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20"
                    >
                      <TimerReset className="size-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-slate-950/35 p-4">
                  <p className="text-sm font-medium text-white">Focus rule</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Start the timer only after you know the first visible move
                    you are making.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="space-y-5">
                <SectionHeading
                  icon={CloudSun}
                  eyebrow="Live"
                  title="Local conditions"
                  description="A lightweight weather glance for planning the day."
                />

                <div className="rounded-[28px] border border-white/8 bg-slate-950/40 p-5">
                  {weather.status === "loading" || weather.status === "idle" ? (
                    <div className="flex items-center gap-3 text-slate-300">
                      <LoaderCircle className="size-5 animate-spin text-cyan-200" />
                      Pulling in live weather for your location...
                    </div>
                  ) : weather.status === "ready" ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-4xl font-semibold text-white">
                            {weather.temperature}&deg;
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {weather.condition}
                          </p>
                        </div>
                        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-100">
                          <CloudSun className="size-6" />
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin className="size-4 text-cyan-200" />
                          {weather.place}
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                          Wind {weather.wind} km/h
                        </span>
                      </div>
                    </div>
                  ) : weather.status === "error" ? (
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
                      {weather.message}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Hydration
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {wellness.hydration}/8
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Keep your energy stable through the afternoon.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Movement
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {wellness.movement} min
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      The fastest way to clear mental drag.
                    </p>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <div className="space-y-5">
                <SectionHeading
                  icon={Sparkles}
                  eyebrow="Mindset"
                  title="Intention and smart prompts"
                  description="Anchor the day with one sentence and a few useful nudges."
                />

                <textarea
                  value={dailyIntention}
                  onChange={(event) =>
                    setIntentionByDate((current) => ({
                      ...current,
                      [todayKey]: event.target.value,
                    }))
                  }
                  placeholder="What matters most today, beyond just being busy?"
                  className="min-h-28 w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                />

                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div
                      key={insight}
                      className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm leading-6 text-slate-200"
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}
