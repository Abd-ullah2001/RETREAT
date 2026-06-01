'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';

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
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: 'easeOut',
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [duration, from, inView, to]);

  const value = decimals === 0 ? Math.round(display).toString() : display.toFixed(decimals);

  return (
    <motion.span ref={ref} className="font-mono">
      {prefix}
      {value}
      {suffix}
    </motion.span>
  );
}
