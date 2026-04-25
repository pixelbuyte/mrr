"use client";

import { useState, useEffect } from "react";
import { CloudRain, Sun, Cloud, CloudSnow, CloudLightning, Wind, Droplets, Eye } from "lucide-react";
import Card from "./Card";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  city: string;
  high: number;
  low: number;
}

function getWeatherIcon(condition: string) {
  const size = 36;
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return <CloudLightning size={size} />;
  if (c.includes("rain") || c.includes("drizzle")) return <CloudRain size={size} />;
  if (c.includes("snow")) return <CloudSnow size={size} />;
  if (c.includes("cloud") || c.includes("overcast")) return <Cloud size={size} />;
  return <Sun size={size} />;
}

function generateWeather(): WeatherData {
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"];
  const hour = new Date().getHours();
  const base = hour < 12 ? 18 : 24;
  const temp = base + Math.floor(Math.sin(Date.now() / 86400000) * 6);
  return {
    temperature: temp,
    condition: conditions[Math.abs(new Date().getDay()) % conditions.length],
    humidity: 45 + (new Date().getDay() * 7) % 30,
    windSpeed: 5 + (new Date().getDay() * 3) % 15,
    feelsLike: temp - 2,
    city: "Your City",
    high: temp + 4,
    low: temp - 6,
  };
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWeather(generateWeather());
    const interval = setInterval(() => setWeather(generateWeather()), 600000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !weather) {
    return (
      <Card title="Weather" icon={<Sun size={16} />}>
        <div className="space-y-3">
          <div className="h-10 w-24 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Weather" icon={<Sun size={16} />}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-4xl font-bold">{weather.temperature}°C</div>
          <p className="text-sm text-muted-foreground mt-1">{weather.condition}</p>
          <p className="text-xs text-muted-foreground">
            H:{weather.high}° L:{weather.low}°
          </p>
        </div>
        <div className="text-accent">{getWeatherIcon(weather.condition)}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Droplets size={14} className="text-blue-400" />
          <span>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wind size={14} className="text-teal-400" />
          <span>{weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye size={14} className="text-purple-400" />
          <span>Feels {weather.feelsLike}°</span>
        </div>
      </div>
    </Card>
  );
}
