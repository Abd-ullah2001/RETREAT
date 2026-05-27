'use client';

import { motion } from 'framer-motion';
import type { ItineraryDay as Day } from '@/types';

export function ItineraryDayRow({ day, index }: { day: Day; index: number }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-2xl bg-brand-card border border-brand-border"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-[family-name:var(--font-syne)] font-bold">Day {day.day}</h4>
        <span className="text-xs text-brand-muted">{day.date}</span>
      </div>
      <p className="text-sm text-brand-primary mt-1">{day.theme}</p>
      <div className="mt-3 space-y-2 text-sm">
        <p>☀️ {day.morning.note}</p>
        <p>🌤️ {day.afternoon.note}</p>
        <p>🌙 {day.evening.note}</p>
      </div>
      <p className="text-xs text-brand-muted mt-2">🍽 {day.meal_suggestion}</p>
    </motion.div>
  );
}
