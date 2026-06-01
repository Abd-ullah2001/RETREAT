'use client';

import { use, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityGrid } from '@/components/trip/ActivityGrid';
import { ItineraryPanel } from '@/components/trip/ItineraryPanel';
import { Navbar } from '@/components/shared/Navbar';
import { PageTransition } from '@/components/shared/PageTransition';
import { PropertyStack } from '@/components/trip/PropertyStack';
import { generateItinerary, getTrip, searchActivities, searchProperties } from '@/lib/api';
import { useRetreatStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

const MapView = dynamic(() => import('@/components/trip/MapView'), { ssr: false });

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const queryClient = useQueryClient();
  const properties = useRetreatStore((s) => s.properties);
  const setProperties = useRetreatStore((s) => s.setProperties);
  const setCurrentTrip = useRetreatStore((s) => s.setCurrentTrip);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/');
      return;
    }

    if (!loading && session && user && !user.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [loading, session, user, router]);

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const t = await getTrip(tripId);
      setCurrentTrip(t);
      if (properties.length === 0) {
        try {
          const { properties: props } = await searchProperties({
            destination: t.destination,
            checkin: t.checkin,
            checkout: t.checkout,
            guests: t.guests,
          });
          setProperties(props);
        } catch (err) {
          console.warn('Property search failed', err);
        }
      }
      return t;
    },
    refetchOnWindowFocus: false,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['activities', trip?.destination_lat, trip?.destination_lng],
    queryFn: () => searchActivities({ lat: trip!.destination_lat, lng: trip!.destination_lng, radius: 5000 }),
    enabled: !!trip,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const itineraryMutation = useMutation({
    mutationFn: () => generateItinerary(tripId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  if (isLoading || !trip) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm text-slate-400">Loading trip...</p>
      </div>
    );
  }

  const center: [number, number] = [trip.destination_lat, trip.destination_lng];
  const activities = activitiesData?.activities ?? [];

  return (
    <PageTransition>
      <div className="page-bg min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-[1480px] px-4 py-5">
          <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-semibold text-navy-900">{trip.destination}</h1>
              <p className="font-mono text-sm text-slate-400">{trip.checkin} - {trip.checkout} / {trip.guests} guests</p>
            </div>
          </div>
          <div className="grid min-h-[calc(100vh-150px)] grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)_320px]">
            <aside className="min-h-0 overflow-y-auto pb-4">
              <PropertyStack tripId={tripId} properties={properties} />
            </aside>
            <section className="min-h-0 overflow-y-auto pb-4">
              <ItineraryPanel itinerary={trip.itinerary} loading={itineraryMutation.isPending} onGenerate={() => itineraryMutation.mutate()} />
              <div className="elevated-card mt-6 p-5">
                <h3 className="mb-3 text-lg font-semibold text-navy-800">Nearby activities</h3>
                <ActivityGrid activities={activities} />
              </div>
            </section>
            <aside className="hidden min-h-0 xl:block">
              <div className="sticky top-20 h-[calc(100vh-110px)]">
                <MapView center={center} properties={properties} activities={activities} />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
