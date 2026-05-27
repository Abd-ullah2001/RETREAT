'use client';

import { motion } from 'framer-motion';
import type { Activity } from '@/types';

export function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-3 rounded-xl bg-brand-card border border-brand-border"
    >
      <h4 className="font-medium text-sm">{activity.name}</h4>
      <p className="text-xs text-brand-muted capitalize">{activity.category.replace(/_/g, ' ')}</p>
      {activity.rating != null && (
        <p className="text-xs text-brand-accent mt-1">★ {activity.rating}</p>
      )}
    </motion.div>
  );
}
