'use client';

import { motion } from 'framer-motion';
import type { Itinerary } from '@/types';
import { cardVariants } from '@/lib/animations';

interface BudgetTrackerProps {
  itinerary: Itinerary | null;
  budgetPerDay: number | null;
}

export function BudgetTracker({ itinerary, budgetPerDay }: BudgetTrackerProps) {
  if (!itinerary) {
    return (
      <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-ivory-300 w-full animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
        <div className="h-8 bg-slate-100 rounded w-32 mb-4" />
        <div className="flex items-end gap-2 h-24">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded-t-md h-full" />
          ))}
        </div>
      </div>
    );
  }

  const maxCost = Math.max(
    ...(itinerary.days.map((d) => d.estimated_day_cost_usd) || []),
    budgetPerDay || 0
  );

  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-ivory-300 w-full shadow-sm">
      <div className="flex flex-col">
        <span className="eyebrow-slate">TRIP ESTIMATE</span>
        <span className="font-mono text-2xl text-navy-900 mt-1">
          ${itinerary.estimated_total_cost_usd} USD
        </span>
      </div>

      <div className="relative h-24 mt-4 flex items-end gap-2 border-b border-ivory-300 pb-1">
        {budgetPerDay && maxCost > 0 && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-amber-300 z-0"
            style={{ bottom: `${Math.min(100, (budgetPerDay / maxCost) * 100)}%` }}
          />
        )}
        
        {itinerary.days.map((day, i) => {
          const cost = day.estimated_day_cost_usd;
          const heightPercent = maxCost > 0 ? (cost / maxCost) * 100 : 0;
          const isOverBudget = budgetPerDay && cost > budgetPerDay;

          return (
            <motion.div
              key={day.day}
              variants={cardVariants}
              custom={i}
              className="flex flex-col items-center flex-1 z-10 group"
            >
              <div
                className={`w-full rounded-t-sm transition-colors ${
                  isOverBudget ? 'bg-ember-500' : 'bg-ocean-500 group-hover:bg-ocean-600'
                }`}
                style={{ height: `${Math.max(4, heightPercent)}%` }}
              />
              <span className="font-mono text-[10px] text-slate-400 mt-2">D{day.day}</span>
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <span className="font-mono text-xs text-slate-400">Estimates are approximate</span>
        {budgetPerDay && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-amber-300" />
            <span className="font-mono text-[10px] text-slate-400">Budget (${budgetPerDay}/day)</span>
          </div>
        )}
      </div>
    </div>
  );
}
