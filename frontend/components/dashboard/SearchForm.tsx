'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, AlertCircle, Loader2, Minus, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { searchPlaces, type PlaceSuggestion } from '@/lib/api';
import { useRetreatStore } from '@/lib/store';
import { buttonTap, scaleIn } from '@/lib/animations';
import { showToast } from '@/components/shared/ToastProvider';

const searchSchema = z.object({
  destination: z.string().min(3, 'Destination must be at least 3 characters'),
  checkin: z.string().min(1, 'Check-in date is required'),
  checkout: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest required').max(16, 'Maximum 16 guests'),
});

type SearchFormData = z.infer<typeof searchSchema>;

export function SearchForm() {
  const router = useRouter();
  const setSearchParams = useRetreatStore((s) => s.setSearchParams);
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
    setValue,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      destination: '',
      checkin: '',
      checkout: '',
      guests: 2,
    },
  });

  const destination = watch('destination');
  const checkin = watch('checkin');
  const guests = watch('guests');

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      setSuggestions(await searchPlaces(query));
    } catch {
      showToast('error', 'Failed to fetch suggestions');
      setSuggestions([]);
    }
  }, []);

  const onDestinationChange = (value: string) => {
    setLat(null);
    setLng(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(setTimeout(() => fetchSuggestions(value), 300));
  };

  const selectPlace = (place: PlaceSuggestion) => {
    setValue('destination', place.display_name);
    setLat(parseFloat(place.lat));
    setLng(parseFloat(place.lon));
    setSuggestions([]);
  };

  const onSubmit = (data: SearchFormData) => {
    if (!lat || !lng) {
      showToast('error', 'Please select a destination from the dropdown');
      return;
    }

    const params = { destination: data.destination, lat, lng, checkin: data.checkin, checkout: data.checkout, guests: data.guests };
    setSearchParams(params);
    const q = new URLSearchParams({
      destination: data.destination,
      lat: String(lat),
      lng: String(lng),
      checkin: data.checkin,
      checkout: data.checkout,
      guests: String(data.guests),
    });
    router.push(`/trip/new?${q.toString()}`);
  };

  const today = new Date().toISOString().slice(0, 10);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <motion.form
      id="new-trip"
      onSubmit={handleSubmit(onSubmit)}
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="elevated-card elevated-card-hover p-6 md:p-8"
    >
      <h2 className="text-2xl font-semibold text-navy-800">Plan a new trip</h2>

      {hasErrors && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-2 rounded-xl bg-ember-50 p-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-ember-500 mt-0.5" />
          <div className="text-sm text-ember-700">
            {errors.destination && <p>{errors.destination.message}</p>}
            {errors.checkin && <p>{errors.checkin.message}</p>}
            {errors.checkout && <p>{errors.checkout.message}</p>}
            {errors.guests && <p>{errors.guests.message}</p>}
            {!lat && destination && <p>Please select destination from dropdown</p>}
          </div>
        </motion.div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr_0.7fr_auto]">
        {/* Destination */}
        <div className="relative">
          <label className="text-sm font-medium text-navy-700">Destination</label>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-ivory-300 bg-ivory-100 px-4 py-3 focus-within:border-ocean-500">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              {...register('destination')}
              onChange={(e) => {
                register('destination').onChange?.(e);
                onDestinationChange(e.target.value);
              }}
              className="w-full bg-transparent text-navy-900 outline-none placeholder:text-slate-400"
              placeholder="Where to?"
            />
          </div>
          {suggestions.length > 0 && (
            <motion.ul
              variants={scaleIn}
              initial="initial"
              animate="animate"
              className="elevated-card absolute z-20 mt-2 max-h-72 w-full overflow-auto p-1"
            >
              {suggestions.map((s) => (
                <li key={s.display_name}>
                  <button
                    type="button"
                    onClick={() => selectPlace(s)}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-navy-700 hover:bg-ocean-100"
                  >
                    {s.display_name}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-navy-700">Check-in</label>
            <input
              type="date"
              min={today}
              {...register('checkin')}
              className="mt-1 w-full rounded-2xl border border-ivory-300 bg-ivory-100 px-4 py-3 text-navy-900 outline-none focus:border-ocean-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-navy-700">Check-out</label>
            <input
              type="date"
              min={checkin || today}
              {...register('checkout')}
              className="mt-1 w-full rounded-2xl border border-ivory-300 bg-ivory-100 px-4 py-3 text-navy-900 outline-none focus:border-ocean-500"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="text-sm font-medium text-navy-700">Guests</label>
          <div className="mt-1 flex h-[50px] items-center justify-between rounded-2xl border border-ivory-300 bg-ivory-100 px-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setValue('guests', Math.max(1, guests - 1))}
              className="grid h-9 w-9 place-items-center rounded-full bg-ivory-50 text-navy-700"
            >
              <Minus className="h-4 w-4" />
            </motion.button>
            <span className="font-mono text-navy-900">{guests}</span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setValue('guests', Math.min(16, guests + 1))}
              className="grid h-9 w-9 place-items-center rounded-full bg-ivory-50 text-navy-700"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <motion.button
            type="submit"
            {...buttonTap}
            disabled={isSubmitting}
            className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-ember-500 px-6 font-semibold text-white disabled:opacity-70 lg:w-auto"
          >
            Search
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
