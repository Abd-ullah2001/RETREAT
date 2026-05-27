'use client';

import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <motion.div
      className="h-48 rounded-2xl bg-brand-card border border-brand-border overflow-hidden"
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
      style={{
        backgroundImage:
          'linear-gradient(90deg, #1A1826 0%, #2D2B3D 50%, #1A1826 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}
