'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTransition } from '@/components/shared/PageTransition';
import { Navbar } from '@/components/shared/Navbar';
import { PropertyStack } from '@/components/trip/PropertyStack';
import { ItineraryPanel } from '@/components/trip/ItineraryPanel';
import { ActivityGrid } from '@/components/trip/ActivityGrid';
import { useRetreatStore } from '@/lib/store';
import { generateItinerary, getTrip, searchActivities, searchProperties } from '@/lib/api';

const MapView = dynamic(() => import('@/components/trip/MapView'), { ssr: false });

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const queryClient = useQueryClient();
  const properties = useRetreatStore((s) => s.properties);
  const setProperties = useRetreatStore((s) => s.setProperties);
  const setCurrentTrip = useRetreatStore((s) => s.setCurrentTrip);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const t = await getTrip(tripId);
      setCurrentTrip(t);
      if (properties.length === 0) {
        const { properties: props } = await searchProperties({
          destination: t.destination,
          checkin: t.checkin,
          checkout: t.checkout,
          guests: t.guests,
        });
        setProperties(props);
      }
      return t;
    },
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['activities', trip?.destination_lat, trip?.destination_lng],
    queryFn: () =>
      searchActivities({
        lat: trip!.destination_lat,
        lng: trip!.destination_lng,
        radius: 5000,
      }),
    enabled: !!trip,
  });

  const itineraryMutation = useMutation({
    mutationFn: () => generateItinerary(tripId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  if (isLoading || !trip) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-brand-muted">Loading trip...</p>
      </div>
    );
  }

  const center: [number, number] = [trip.destination_lat, trip.destination_lng];
  const activities = activitiesData?.activities ?? [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold mb-6">{trip.destination}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <PropertyStack tripId={tripId} properties={properties} />
            </div>
            <div className="lg:col-span-5">
              <ItineraryPanel
                itinerary={trip.itinerary}
                loading={itineraryMutation.isPending}
                onGenerate={() => itineraryMutation.mutate()}
              />
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-brand-muted mb-2">Nearby activities</h3>
                <ActivityGrid activities={activities} />
              </div>
            </div>
            <div className="lg:col-span-3 h-[400px]">
              <MapView center={center} properties={properties} activities={activities} />
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
