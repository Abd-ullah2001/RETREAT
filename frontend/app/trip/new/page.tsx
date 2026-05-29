'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createTrip, searchProperties } from '@/lib/api';
import { useRetreatStore } from '@/lib/store';

function NewTripContent() {
  const params = useSearchParams();
  const router = useRouter();
  const setProperties = useRetreatStore((s) => s.setProperties);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const destination = params.get('destination');
    const lat = params.get('lat');
    const lng = params.get('lng');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    const guests = params.get('guests');

    if (!destination || !lat || !lng || !checkin || !checkout || !guests) {
      router.replace('/dashboard');
      return;
    }

    (async () => {
      try {
        const parsedGuests = parseInt(guests, 10);
        const trip = await createTrip({
          destination,
          destination_lat: parseFloat(lat),
          destination_lng: parseFloat(lng),
          checkin,
          checkout,
          guests: parsedGuests,
        });
        const { properties } = await searchProperties({ destination, checkin, checkout, guests: parsedGuests });
        setProperties(properties);
        router.replace(`/trip/${trip.id}`);
      } catch {
        setError('Failed to create trip. Please try again.');
      }
    })();
  }, [params, router, setProperties]);

  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="h-10 w-10 rounded-full border-2 border-ivory-300 border-t-ember-500" />
      <p className="font-mono text-sm text-slate-400">{error ?? 'Creating your trip...'}</p>
    </div>
  );
}

export default function NewTripPage() {
  return (
    <Suspense>
      <NewTripContent />
    </Suspense>
  );
}
