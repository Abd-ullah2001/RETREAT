'use client';

import { motion } from 'framer-motion';
import { floatOrb } from '@/lib/animations';

export function FloatingOrbs() {
  const orbs = [
    'left-[4%] top-[12%] h-[320px] w-[320px] bg-ocean-300/12',
    'right-[6%] top-[16%] h-[260px] w-[260px] bg-ember-400/8',
    'bottom-[8%] left-[42%] h-[300px] w-[300px] bg-emerald-500/8',
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {orbs.map((classes, index) => (
        <motion.div
          key={classes}
          variants={floatOrb(index * 2)}
          animate="animate"
          className={`absolute rounded-full blur-[80px] ${classes}`}
        />
      ))}
    </div>
  );
}
