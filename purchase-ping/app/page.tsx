'use client';
import { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AppShell from '@/components/AppShell';

export default function Home() {
  const [entered, setEntered] = useState(false);
  if (entered) return <AppShell />;
  return <LandingPage onEnter={() => setEntered(true)} />;
}
