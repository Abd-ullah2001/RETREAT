'use client';

import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { fadeUp } from '@/lib/animations';

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
    { label: 'Trips Planned', value: trips },
    { label: 'Inquiries Sent', value: inquiries },
    { label: 'Places Saved', value: destinations },
  ];

  return (
    <section className="grid grid-cols-1 border-y border-ivory-300 md:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          custom={index}
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="px-6 py-8 text-center md:border-r md:border-ivory-300 md:last:border-r-0"
        >
          <p className="font-mono text-5xl font-medium text-navy-900">
            <AnimatedCounter to={stat.value} duration={1.2} />
          </p>
          <p className="mt-3 text-sm font-medium uppercase tracking-wider text-slate-400">{stat.label}</p>
        </motion.div>
      ))}
    </section>
  );
}
