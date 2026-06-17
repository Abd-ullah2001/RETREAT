'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils } from 'lucide-react';
import type { Restaurant } from '@/types';
import { RestaurantCard } from './RestaurantCard';
import { cardVariants } from '@/lib/animations';

interface RestaurantGridProps {
  restaurants: Restaurant[];
  isLoading: boolean;
}

const TABS = ['All', 'Breakfast', 'Lunch', 'Dinner'] as const;
type TabType = typeof TABS[number];

export function RestaurantGrid({ restaurants, isLoading }: RestaurantGridProps) {
  const [activeTab, setActiveTab] = useState<TabType>('All');

  const filteredRestaurants = useMemo(() => {
    if (activeTab === 'All') return restaurants;
    return restaurants.filter((r) => {
      if (activeTab === 'Breakfast') return r.servesBreakfast;
      if (activeTab === 'Lunch') return r.servesLunch;
      if (activeTab === 'Dinner') return r.servesDinner;
      return true;
    });
  }, [restaurants, activeTab]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow-slate mb-1">RESTAURANTS</p>
        <h2 className="font-display text-xl text-navy-800">Where to eat</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'text-white' : 'text-slate-600 hover:text-navy-900 bg-ivory-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="restaurant-tab"
                  className="absolute inset-0 bg-navy-900 rounded-full -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRestaurants.map((restaurant, i) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={i} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center p-12 text-center bg-ivory-100 rounded-2xl border border-ivory-300 border-dashed"
        >
          <div className="w-12 h-12 bg-ivory-300 rounded-full flex items-center justify-center mb-3">
            <Utensils className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-display text-lg text-navy-800">No restaurants found</h3>
          <p className="text-slate-500 text-sm max-w-xs mt-1">
            Try adjusting your search or selecting a different meal type.
          </p>
        </motion.div>
      )}
    </div>
  );
}
