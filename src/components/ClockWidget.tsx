"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Card from "./Card";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "🌙";
  if (hour < 12) return "☀️";
  if (hour < 17) return "🌤️";
  if (hour < 21) return "🌆";
  return "🌙";
}

export default function ClockWidget() {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <Card className="col-span-full lg:col-span-2">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="h-16 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-6 w-32 rounded bg-muted animate-pulse mt-3" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2 bg-gradient-to-br from-accent/10 via-card to-card">
      <div className="flex flex-col items-center justify-center py-4">
        <span className="text-3xl mb-2">{getGreetingEmoji()}</span>
        <h2 className="text-lg font-medium text-muted-foreground mb-1">
          {getGreeting()}
        </h2>
        <div className="text-5xl md:text-6xl font-bold tracking-tight tabular-nums text-foreground">
          {format(now, "hh:mm")}
          <span className="text-2xl md:text-3xl text-muted-foreground ml-1">
            {format(now, "ss")}
          </span>
          <span className="text-lg md:text-xl text-muted-foreground ml-2">
            {format(now, "a")}
          </span>
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          {format(now, "EEEE, MMMM do, yyyy")}
        </p>
      </div>
    </Card>
  );
}
