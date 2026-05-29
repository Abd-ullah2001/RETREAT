'use client';

import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [duration, from, to]);

  const value = decimals === 0 ? Math.round(display).toString() : display.toFixed(decimals);

  return (
    <motion.span>
      {prefix}
      {value}
      {suffix}
    </motion.span>
  );
}
