'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cardVariants } from '@/lib/animations';
import { formatDate } from '@/lib/utils';
import type { Trip } from '@/types';

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      style={{ willChange: 'transform' }}
    >
      <Link href={`/trip/${trip.id}`} className="elevated-card elevated-card-hover block p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-navy-800">{trip.destination}</h3>
          <StatusBadge status={trip.status} />
        </div>
        <p className="mt-3 font-mono text-xs text-slate-400">
          {formatDate(trip.checkin)} - {formatDate(trip.checkout)} / {trip.guests} guests
        </p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ocean-500">
          View Trip <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </motion.div>
  );
}
