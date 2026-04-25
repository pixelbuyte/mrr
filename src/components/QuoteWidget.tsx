"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import Card from "./Card";

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "We become what we think about.", author: "Earl Nightingale" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
];

function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export default function QuoteWidget() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setQuote(getDailyQuote());
  }, []);

  if (!mounted || !quote) {
    return (
      <Card className="col-span-full">
        <div className="h-16 rounded bg-muted animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="col-span-full bg-gradient-to-r from-accent/5 via-card to-accent/5">
      <div className="flex gap-3 items-start py-2">
        <Quote size={24} className="text-accent flex-shrink-0 mt-1" />
        <div>
          <p className="text-base md:text-lg font-medium italic text-foreground leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            — {quote.author}
          </p>
        </div>
      </div>
    </Card>
  );
}
