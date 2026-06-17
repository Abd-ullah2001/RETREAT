'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import type { Restaurant } from '@/types';
import { cardVariants } from '@/lib/animations';

interface RestaurantCardProps {
  restaurant: Restaurant;
  index: number;
}

export function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  const isOpen = restaurant.openingHours ? true : false; // Naive approximation, should ideally use real time logic

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="photo-card flex flex-col h-72 cursor-pointer group"
      onClick={() => {
        if (restaurant.googleMapsUrl) {
          window.open(restaurant.googleMapsUrl, '_blank');
        }
      }}
    >
      <div className="relative h-[45%] w-full overflow-hidden">
        {restaurant.photoUrls?.[0] ? (
          <Image
            src={restaurant.photoUrls[0]}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-sm">No photo</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-display text-lg text-navy-800 line-clamp-1">{restaurant.name}</h3>
          <p className="eyebrow-slate text-xs uppercase mt-1 line-clamp-1">
            {restaurant.cuisine || 'Restaurant'}
          </p>

          <div className="flex items-center gap-2 mt-2">
            {restaurant.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                <span className="font-mono text-sm text-slate-700">{restaurant.rating.toFixed(1)}</span>
                <span className="font-mono text-xs text-slate-400">({restaurant.reviewCount})</span>
              </div>
            )}
            {restaurant.priceLevel && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-sm text-slate-700 tracking-widest">
                  {'$'.repeat(restaurant.priceLevel)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-ocean-600 transition-colors">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">View on Maps</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="text-xs text-slate-500 font-medium">
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
