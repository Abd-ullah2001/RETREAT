'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Trip } from '@/types';

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(91,78,232,0.25)' }}
    >
      <Link
        href={`/trip/${trip.id}`}
        className="block p-5 rounded-2xl bg-brand-card border border-brand-border hover:border-brand-primary/40 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold">{trip.destination}</h3>
          <StatusBadge status={trip.status} />
        </div>
        <p className="text-sm text-brand-muted mt-2">
          {formatDate(trip.checkin)} — {formatDate(trip.checkout)} · {trip.guests} guests
        </p>
      </Link>
    </motion.div>
  );
}
