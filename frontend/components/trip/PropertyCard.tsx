'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { Property } from '@/types';
import { Star } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  index: number;
  onSwipe: (direction: 'left' | 'right') => void;
}

export function PropertyCard({ property, index, onSwipe }: PropertyCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const greenOpacity = useTransform(x, [0, 120], [0, 1]);
  const redOpacity = useTransform(x, [-120, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 120) onSwipe('right');
    else if (info.offset.x < -120) onSwipe('left');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(91,78,232,0.25)' }}
      className="relative w-full max-w-sm mx-auto rounded-[20px] bg-brand-card border border-brand-border overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <motion.div className="absolute inset-0 bg-green-500/20 pointer-events-none z-10" style={{ opacity: greenOpacity }} />
      <motion.div className="absolute inset-0 bg-red-500/20 pointer-events-none z-10" style={{ opacity: redOpacity }} />
      <motion.span className="absolute top-4 right-4 text-4xl z-20" style={{ opacity: greenOpacity }}>
        ❤️
      </motion.span>
      <motion.span className="absolute top-4 left-4 text-4xl z-20" style={{ opacity: redOpacity }}>
        ❌
      </motion.span>
      <div className="h-48 overflow-hidden">
        {property.imageUrls[0] ? (
          <img src={property.imageUrls[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-border" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold">{property.name}</h3>
        <p className="text-2xl font-bold text-brand-accent mt-1">
          {property.currency} {property.pricePerNight}
          <span className="text-sm text-brand-muted font-normal"> / night</span>
        </p>
        {property.rating != null && (
          <div className="flex items-center gap-1 mt-2 text-sm text-brand-muted">
            <Star className="w-4 h-4 fill-brand-accent text-brand-accent" />
            {property.rating} ({property.reviewCount ?? 0} reviews)
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-3">
          {property.amenities.slice(0, 4).map((a) => (
            <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-brand-border text-brand-muted">
              {a}
            </span>
          ))}
        </div>
        <a
          href={property.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-sm text-brand-primary hover:underline"
        >
          View on {property.platform === 'booking' ? 'Booking.com' : 'Airbnb'} →
        </a>
      </div>
    </motion.div>
  );
}
