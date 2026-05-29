'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Activity } from '@/types';

export function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-ivory-300 bg-ivory-50 p-3"
    >
      <h4 className="line-clamp-2 text-sm font-semibold text-navy-800">{activity.name}</h4>
      <p className="mt-1 text-xs capitalize text-slate-400">{activity.category.replace(/_/g, ' ')}</p>
      {activity.rating != null && (
        <p className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-gold-400">
          <Star className="h-3 w-3 fill-current" /> {activity.rating}
        </p>
      )}
    </motion.div>
  );
}
