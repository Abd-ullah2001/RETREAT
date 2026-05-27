'use client';

import { motion } from 'framer-motion';

const orbs = [
  { color: 'bg-brand-primary/15', size: 'w-72 h-72', top: '10%', left: '5%', delay: 0 },
  { color: 'bg-brand-secondary/15', size: 'w-96 h-96', top: '40%', right: '10%', delay: 2 },
  { color: 'bg-brand-teal/15', size: 'w-64 h-64', bottom: '10%', left: '30%', delay: 4 },
];

export function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.color} ${orb.size}`}
          style={{ top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}
    </div>
  );
}
