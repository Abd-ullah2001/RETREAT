'use client';

import { motion } from 'framer-motion';
import { ItineraryDayRow } from './ItineraryDay';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import type { Itinerary } from '@/types';

interface ItineraryPanelProps {
  itinerary: Itinerary | null;
  loading: boolean;
  onGenerate: () => void;
}

export function ItineraryPanel({ itinerary, loading, onGenerate }: ItineraryPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">Itinerary</h2>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-sm font-semibold disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Itinerary'}
        </motion.button>
      </div>
      {loading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
      {itinerary && !loading && (
        <>
          <p className="text-sm text-brand-muted">{itinerary.summary}</p>
          <div className="space-y-3">
            {itinerary.days.map((day, i) => (
              <ItineraryDayRow key={day.day} day={day} index={i} />
            ))}
          </div>
          <ul className="text-sm text-brand-muted list-disc pl-4 space-y-1">
            {itinerary.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
