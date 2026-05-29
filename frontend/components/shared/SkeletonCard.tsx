'use client';

import { motion } from 'framer-motion';
import { shimmer } from '@/lib/animations';

export function SkeletonCard() {
  return (
    <motion.div
      variants={shimmer}
      animate="animate"
      className="h-24 rounded-2xl"
      style={{
        background: 'linear-gradient(90deg, #E3DAC9 25%, #F0EBE0 50%, #E3DAC9 75%)',
        backgroundSize: '400% 100%',
      }}
    />
  );
}
