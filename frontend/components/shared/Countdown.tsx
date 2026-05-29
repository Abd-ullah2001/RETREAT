'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownProps {
  initialSeconds: number;
  onComplete?: () => void;
  label?: string;
}

export function Countdown({ initialSeconds, onComplete, label = 'Sending in' }: CountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 rounded-full bg-ocean-100 px-4 py-2"
    >
      <span className="text-sm font-medium text-ocean-600">{label}</span>
      <motion.span
        key={seconds}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-mono font-semibold text-ocean-700"
      >
        {seconds}s
      </motion.span>
    </motion.div>
  );
}
