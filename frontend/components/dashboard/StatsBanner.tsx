'use client';

import { motion, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{display}</span>;
}

export function StatsBanner({
  trips,
  inquiries,
  destinations,
}: {
  trips: number;
  inquiries: number;
  destinations: number;
}) {
  const stats = [
    { label: 'Trips planned', value: trips },
    { label: 'Inquiries sent', value: inquiries },
    { label: 'Destinations explored', value: destinations },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 rounded-2xl bg-brand-card border border-brand-border"
        >
          <p className="text-3xl font-bold text-brand-accent font-[family-name:var(--font-syne)]">
            <AnimatedCounter value={stat.value} />
          </p>
          <p className="text-sm text-brand-muted mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
