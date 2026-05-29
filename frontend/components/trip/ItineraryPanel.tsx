'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, Loader2 } from 'lucide-react';
import { ItineraryDayRow } from './ItineraryDay';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { buttonTap } from '@/lib/animations';
import type { Itinerary } from '@/types';

interface ItineraryPanelProps {
  itinerary: Itinerary | null;
  loading: boolean;
  onGenerate: () => void;
}

const messages = ['Analyzing activities...', 'Ranking properties...', 'Building your days...'];

export function ItineraryPanel({ itinerary, loading, onGenerate }: ItineraryPanelProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setMessageIndex((index) => (index + 1) % messages.length), 2000);
    return () => clearInterval(timer);
  }, [loading]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-navy-800">Your Itinerary</h2>
        <motion.button type="button" {...buttonTap} onClick={onGenerate} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-ocean-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Generating' : 'Generate Plan'}
        </motion.button>
      </div>
      {loading && (
        <div className="elevated-card space-y-4 p-5">
          <div className="flex items-center gap-2 text-navy-800">
            <span className="font-semibold">AI is planning your trip</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span key={dot} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: dot * 0.15, duration: 0.8 }} className="h-1.5 w-1.5 rounded-full bg-ocean-500" />
              ))}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={messages[messageIndex]} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="font-mono text-sm text-slate-400">
              {messages[messageIndex]}
            </motion.p>
          </AnimatePresence>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      {itinerary && !loading && (
        <>
          <p className="text-sm leading-6 text-navy-700">{itinerary.summary}</p>
          <div className="space-y-3">
            {itinerary.days.map((day, i) => (
              <ItineraryDayRow key={day.day} day={day} index={i} />
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-navy-800">Travel Tips</h3>
            {itinerary.tips.map((tip) => (
              <div key={tip} className="flex gap-2 rounded-2xl border-l-[3px] border-l-gold-400 bg-gold-100 p-3 text-sm text-navy-700">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                {tip}
              </div>
            ))}
          </div>
        </>
      )}
      {!itinerary && !loading && (
        <div className="elevated-card p-5 text-sm leading-6 text-slate-400">
          Generate a plan to assemble activities, property signals, meal ideas, and travel tips for this trip.
        </div>
      )}
    </section>
  );
}
