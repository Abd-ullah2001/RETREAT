'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cardVariants } from '@/lib/animations';
import { formatDate } from '@/lib/utils';
import type { Trip } from '@/types';

const destinationImages: Record<string, string> = {
  lisbon: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
};

function imageFor(destination: string) {
  const lower = destination.toLowerCase();
  return Object.entries(destinationImages).find(([key]) => lower.includes(key))?.[1];
}

export function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const image = imageFor(trip.destination);

  return (
    <motion.div custom={index} variants={cardVariants} initial="initial" animate="animate" whileHover="hover" style={{ willChange: 'transform' }}>
      <Link href={`/trip/${trip.id}`} className="photo-card elevated-card-hover block h-[360px] cursor-pointer">
        <div className="relative flex h-[60%] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#E3DAC9,#F8F5EE)]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
          ) : (
            <span className="font-display text-6xl italic text-navy-700/40">{trip.destination.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex h-[40%] flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl font-semibold text-navy-800">{trip.destination}</h3>
            <StatusBadge status={trip.status} />
          </div>
          <p className="mt-2 font-mono text-sm text-slate-400">
            {formatDate(trip.checkin)} - {formatDate(trip.checkout)}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-400">{trip.guests} guests</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ember-500">
              View <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
