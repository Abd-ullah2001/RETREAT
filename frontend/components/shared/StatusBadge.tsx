'use client';

import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';

const colors: Record<string, string> = {
  draft: 'bg-gold-100 text-gold-400',
  sent: 'bg-emerald-100 text-emerald-600',
  planning: 'bg-ocean-100 text-ocean-500',
  active: 'bg-ember-100 text-ember-500',
  completed: 'bg-slate-200 text-navy-700',
};

export function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';

  return (
    <motion.span
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        colors[status] ?? colors.planning,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full bg-current', isActive && 'animate-pulse')} />
      {status}
    </motion.span>
  );
}
