'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Utensils, Coffee, Pizza, Wine } from 'lucide-react';
import type { ItineraryDay as Day, DayWeather, Restaurant } from '@/types';
import { slideFromLeft } from '@/lib/animations';
import { WeatherPanel } from './WeatherPanel';

export function ItineraryDayRow({
  day,
  index,
  weather,
  restaurants = [],
}: {
  day: Day;
  index: number;
  weather?: DayWeather | null;
  restaurants?: Restaurant[];
}) {
  const [open, setOpen] = useState(false);
  const slots = [
    { label: 'Morning', data: day.morning, icon: '🌅' },
    { label: 'Afternoon', data: day.afternoon, icon: '☀️' },
    { label: 'Evening', data: day.evening, icon: '🌙' },
  ];

  const getRestaurantUrl = (id: string | null) => {
    if (!id) return null;
    const r = restaurants.find((x) => x.id === id);
    return r?.googleMapsUrl || null;
  };

  return (
    <motion.div
      custom={index}
      variants={slideFromLeft}
      initial="initial"
      animate="animate"
      className="elevated-card w-full border-l-[3px] border-l-ember-500 p-4 text-left group"
    >
      <div
        onClick={() => setOpen((value) => !value)}
        className="flex items-start justify-between gap-3 mb-2 cursor-pointer select-none"
      >
        <div>
          <h4 className="text-lg font-semibold text-navy-800">Day {day.day} - {day.date}</h4>
          <span className="mt-1 inline-flex rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-400">{day.theme}</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      <WeatherPanel weather={weather || null} />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            <div className="space-y-3">
              {slots.map((slot, slotIndex) => (
                <motion.div
                  key={slot.label}
                  custom={slotIndex}
                  variants={slideFromLeft}
                  initial="initial"
                  animate="animate"
                  className="rounded-2xl bg-ivory-100 p-3"
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-mono text-xs uppercase text-slate-400">
                      <span className="mr-1">{slot.icon}</span> {slot.label}
                    </p>
                    <p className="font-mono text-xs text-slate-400">{slot.data.start_time} - {slot.data.end_time}</p>
                  </div>
                  
                  <p className="font-medium text-navy-800">{slot.data.activity_name}</p>
                  <p className="mt-1 text-sm italic text-navy-700">{slot.data.note}</p>

                  {slot.data.travel_time_to_next_minutes > 0 && (
                    <div className="flex items-center gap-1 mt-2 font-mono text-xs text-slate-400 bg-white/50 w-fit px-2 py-0.5 rounded-full">
                      <span>↓ {slot.data.travel_time_to_next_minutes} min travel</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-ivory-100 p-3">
              <p className="font-mono text-xs uppercase text-slate-400 mb-1 flex items-center gap-1">
                <Utensils className="w-3 h-3" /> Dining
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-start gap-2">
                  <Coffee className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">
                      {day.meals.breakfast.restaurant_id && getRestaurantUrl(day.meals.breakfast.restaurant_id) ? (
                        <a
                          href={getRestaurantUrl(day.meals.breakfast.restaurant_id)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-emerald-600 font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {day.meals.breakfast.restaurant_name}
                        </a>
                      ) : (
                        <span className="italic text-slate-600">{day.meals.breakfast.restaurant_name}</span>
                      )}
                    </p>
                    <p className="text-xs italic text-slate-500">{day.meals.breakfast.note}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Pizza className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">
                      {day.meals.lunch.restaurant_id && getRestaurantUrl(day.meals.lunch.restaurant_id) ? (
                        <a
                          href={getRestaurantUrl(day.meals.lunch.restaurant_id)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-emerald-600 font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {day.meals.lunch.restaurant_name}
                        </a>
                      ) : (
                        <span className="italic text-slate-600">{day.meals.lunch.restaurant_name}</span>
                      )}
                    </p>
                    <p className="text-xs italic text-slate-500">{day.meals.lunch.note}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Wine className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy-800">
                      {day.meals.dinner.restaurant_id && getRestaurantUrl(day.meals.dinner.restaurant_id) ? (
                        <a
                          href={getRestaurantUrl(day.meals.dinner.restaurant_id)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-emerald-600 font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {day.meals.dinner.restaurant_name}
                        </a>
                      ) : (
                        <span className="italic text-slate-600">{day.meals.dinner.restaurant_name}</span>
                      )}
                    </p>
                    <p className="text-xs italic text-slate-500">{day.meals.dinner.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
