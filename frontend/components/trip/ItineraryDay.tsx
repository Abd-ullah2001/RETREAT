'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Utensils } from 'lucide-react';
import type { ItineraryDay as Day } from '@/types';
import { slideFromLeft } from '@/lib/animations';

export function ItineraryDayRow({ day, index }: { day: Day; index: number }) {
  const [open, setOpen] = useState(false);
  const slots = [
    { label: 'Morning', note: day.morning.note, icon: 'sun' },
    { label: 'Afternoon', note: day.afternoon.note, icon: 'cloud' },
    { label: 'Evening', note: day.evening.note, icon: 'moon' },
  ];

  return (
    <motion.button
      type="button"
      custom={index}
      variants={slideFromLeft}
      initial="initial"
      animate="animate"
      onClick={() => setOpen((value) => !value)}
      className="elevated-card w-full border-l-[3px] border-l-ocean-500 p-4 text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-navy-800">Day {day.day} - {day.date}</h4>
          <span className="mt-1 inline-flex rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-400">{day.theme}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="mt-4 space-y-3">
        {slots.map((slot, slotIndex) => (
          <motion.div key={slot.label} custom={slotIndex} variants={slideFromLeft} initial="initial" animate="animate" className="rounded-2xl bg-ivory-100 p-3">
            <p className="font-mono text-xs uppercase text-slate-400">{slot.icon} {slot.label}</p>
            <p className="mt-1 text-sm italic text-navy-700">{slot.note}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-2xl bg-ivory-100 p-3 text-sm italic text-navy-700">
        <Utensils className="mt-0.5 h-4 w-4 text-ember-500" />
        {day.meal_suggestion}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="mt-3 text-sm leading-6 text-slate-400">Activity details will appear here as the backend enriches the itinerary with place records and booking links.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
