'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const colors: Record<string, string> = {
  planning: 'bg-brand-muted/20 text-brand-muted',
  active: 'bg-brand-primary/20 text-brand-primary',
  completed: 'bg-brand-teal/20 text-brand-teal',
  draft: 'bg-brand-accent/20 text-brand-accent',
  sent: 'bg-brand-teal/20 text-brand-teal',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', colors[status] ?? colors.planning)}
    >
      {status}
    </motion.span>
  );
}
