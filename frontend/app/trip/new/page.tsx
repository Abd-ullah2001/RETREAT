'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
        const trip = await createTrip({
          destination,
          destination_lat: parseFloat(lat),
          destination_lng: parseFloat(lng),
          checkin,
          checkout,
          guests: parseInt(guests, 10),
        });
        const { properties } = await searchProperties({
          destination,
          checkin,
          checkout,
          guests: parseInt(guests, 10),
        });
        setProperties(properties);
        router.replace(`/trip/${trip.id}`);
      } catch {
        setError('Failed to create trip. Please try again.');
      }
    })();
  }, [params, router, setProperties]);

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <p className="text-brand-muted">{error ?? 'Creating your trip...'}</p>
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
