'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRetreatStore } from '@/lib/store';

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function SearchForm() {
  const router = useRouter();
  const setSearchParams = useRetreatStore((s) => s.setSearchParams);
  const [destination, setDestination] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState(2);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback((query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { 'Accept-Language': 'en' } },
    )
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, []);

  const onDestinationChange = (value: string) => {
    setDestination(value);
    setLat(null);
    setLng(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    setDebounceTimer(
      setTimeout(() => fetchSuggestions(value), 300),
    );
  };

  const selectPlace = (place: NominatimResult) => {
    setDestination(place.display_name);
    setLat(parseFloat(place.lat));
    setLng(parseFloat(place.lon));
    setSuggestions([]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lat || !lng || !checkin || !checkout) return;
    const params = { destination, lat, lng, checkin, checkout, guests };
    setSearchParams(params);
    const q = new URLSearchParams({
      destination,
      lat: String(lat),
      lng: String(lng),
      checkin,
      checkout,
      guests: String(guests),
    });
    router.push(`/trip/new?${q.toString()}`);
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-[20px] border border-white/10 backdrop-blur-xl"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      <div className="relative">
        <label className="text-sm text-brand-muted">Destination</label>
        <input
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
          className="w-full mt-1 px-4 py-3 rounded-xl bg-brand-dark border border-brand-border focus:border-brand-primary outline-none"
          placeholder="Where to?"
          required
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 rounded-xl bg-brand-card border border-brand-border overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.display_name}>
                <button
                  type="button"
                  onClick={() => selectPlace(s)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-brand-primary/20"
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-brand-muted">Check-in</label>
          <input
            type="date"
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-brand-dark border border-brand-border"
            required
          />
        </div>
        <div>
          <label className="text-sm text-brand-muted">Check-out</label>
          <input
            type="date"
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-brand-dark border border-brand-border"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-brand-muted">Guests</span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setGuests((g) => Math.max(1, g - 1))}
          className="w-10 h-10 rounded-full bg-brand-card border border-brand-border"
        >
          −
        </motion.button>
        <span className="font-semibold">{guests}</span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => setGuests((g) => Math.min(20, g + 1))}
          className="w-10 h-10 rounded-full bg-brand-card border border-brand-border"
        >
          +
        </motion.button>
      </div>
      <motion.button
        type="submit"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary font-semibold"
      >
        Plan my trip
      </motion.button>
    </motion.form>
  );
}
