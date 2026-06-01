'use client';

import Image from 'next/image';
import { ExternalLink, Heart, MapPin, Star, X } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  index: number;
  onSwipe: (direction: 'left' | 'right') => void;
}

export function PropertyCard({ property, index, onSwipe }: PropertyCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const greenOpacity = useTransform(x, [0, 120], [0, 1]);
  const redOpacity = useTransform(x, [-120, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      style={{ x, rotate, willChange: 'transform' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileHover={{ y: -4 }}
      className="photo-card relative mx-auto h-[560px] w-full max-w-sm cursor-grab active:cursor-grabbing"
    >
      <motion.div className="absolute inset-0 z-10 bg-emerald-100 pointer-events-none" style={{ opacity: greenOpacity }} />
      <motion.div className="absolute inset-0 z-10 bg-ember-100 pointer-events-none" style={{ opacity: redOpacity }} />
      <motion.span className="absolute right-6 top-6 z-20 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg" style={{ opacity: greenOpacity }}>
        <Heart className="h-7 w-7 fill-current" />
      </motion.span>
      <motion.span className="absolute left-6 top-6 z-20 grid h-14 w-14 place-items-center rounded-full bg-ember-500 text-white shadow-lg" style={{ opacity: redOpacity }}>
        <X className="h-7 w-7" />
      </motion.span>

      <div className="relative h-[52%] overflow-hidden">
        {property.imageUrls[0] ? (
          <Image src={property.imageUrls[0]} alt={property.name} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" unoptimized />
        ) : (
          <div className="h-full w-full bg-ivory-200" />
        )}
        <span className="eyebrow absolute left-4 top-4 rounded bg-navy-900/50 px-2 py-1 text-white">
          {property.platform === 'booking' ? 'Booking.com' : 'Airbnb'}
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-navy-900/75 px-3 py-1 font-mono text-xs text-white">
          {property.reviewCount ?? 0} reviews
        </span>
      </div>

      <div className="relative z-20 flex h-[48%] flex-col p-5">
        <h3 className="line-clamp-2 text-xl font-semibold text-navy-800">{property.name}</h3>
        <p className="mt-2 flex items-center gap-1 text-sm text-slate-400">
          <MapPin className="h-4 w-4" /> <span className="line-clamp-1">{property.address}</span>
        </p>
        {property.rating != null && (
          <div className="mt-3 flex items-center gap-1 text-sm text-navy-700">
            <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
            <span className="font-mono">{property.rating}</span>
            <span className="text-slate-400">({property.reviewCount ?? 0})</span>
          </div>
        )}
        <p className="mt-3 font-mono text-3xl font-medium text-navy-900">
          {property.currency} {property.pricePerNight}
          <span className="text-sm font-normal text-slate-400"> /night</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 4).map((a) => (
            <span key={a} className="rounded-full bg-ivory-200 px-2.5 py-1 text-xs text-navy-700">
              {a}
            </span>
          ))}
        </div>
        <a href={property.bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-ember-500">
          View listing <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
