'use client';

import { animate, motion } from 'framer-motion';
import { Bookmark, MapPin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cardVariants } from '@/lib/animations';

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
    { label: 'Trips Planned', value: trips, icon: MapPin, color: 'text-ocean-500', note: 'Itineraries in motion' },
    { label: 'Inquiries Sent', value: inquiries, icon: MessageCircle, color: 'text-emerald-600', note: 'Host conversations tracked' },
    { label: 'Places Saved', value: destinations, icon: Bookmark, color: 'text-ember-500', note: 'Destinations under review' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="elevated-card elevated-card-hover overflow-hidden p-6"
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-start justify-between">
              <p className="font-mono text-4xl font-medium text-navy-900">
                <AnimatedCounter value={stat.value} />
              </p>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ivory-100">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-navy-800">{stat.label}</p>
            <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
