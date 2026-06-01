'use client';

import { motion } from 'framer-motion';
import { shimmer } from '@/lib/animations';

export function SkeletonCard() {
  return (
    <motion.div
      variants={shimmer}
      animate="animate"
      className="skeleton h-24 rounded-2xl"
    />
  );
}
