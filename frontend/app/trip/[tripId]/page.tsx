'use client';

import { use, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityGrid } from '@/components/trip/ActivityGrid';
import { ItineraryPanel } from '@/components/trip/ItineraryPanel';
import { Navbar } from '@/components/shared/Navbar';
import { PageTransition } from '@/components/shared/PageTransition';
import { PropertyStack } from '@/components/trip/PropertyStack';
import { getTrip, searchActivities, searchProperties } from '@/lib/api';
import { useRetreatStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useWeather } from '@/hooks/useWeather';
import { useItineraryStream } from '@/hooks/useItineraryStream';
import { RestaurantGrid } from '@/components/trip/RestaurantGrid';
import { BudgetTracker } from '@/components/trip/BudgetTracker';
import { ItineraryProgress } from '@/components/trip/ItineraryProgress';
import { ReplanButton } from '@/components/trip/ReplanButton';

const MapView = dynamic(() => import('@/components/trip/MapView'), { ssr: false });

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const queryClient = useQueryClient();
  const properties = useRetreatStore((s) => s.properties);
  const setProperties = useRetreatStore((s) => s.setProperties);
  const setCurrentTrip = useRetreatStore((s) => s.setCurrentTrip);

  const [mapTab, setMapTab] = useState<'properties' | 'activities' | 'restaurants'>('properties');

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

  const numDays = trip ? Math.max(1, Math.round((new Date(trip.checkout).getTime() - new Date(trip.checkin).getTime()) / (1000 * 60 * 60 * 24))) : 5;

  const { data: activitiesData } = useQuery({
    queryKey: ['activities', trip?.destination_lat, trip?.destination_lng],
    queryFn: () => searchActivities({ lat: trip!.destination_lat, lng: trip!.destination_lng, radius: 5000 }),
    enabled: !!trip,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: restaurantsData, isLoading: restaurantsLoading } = useRestaurants({
    lat: trip?.destination_lat || 0,
    lng: trip?.destination_lng || 0,
    radius: 3000,
  });

  const { data: weatherData } = useWeather({
    lat: trip?.destination_lat || 0,
    lng: trip?.destination_lng || 0,
    days: numDays,
  });

  const { progress, isStreaming, error, startStream } = useItineraryStream(tripId);

  if (isLoading || !trip) {
    return (
      <div className="page-bg flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm text-slate-400">Loading trip...</p>
      </div>
    );
  }

  const center: [number, number] = [trip.destination_lat, trip.destination_lng];
  const activities = activitiesData?.activities ?? [];
  const restaurants = restaurantsData?.restaurants ?? [];
  const weatherDays = weatherData?.forecast?.days ?? null;

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
            <aside className="min-h-0 flex flex-col gap-6 pb-4">
              <div className="flex-shrink-0">
                <PropertyStack tripId={tripId} properties={properties} />
              </div>
            </aside>
            <section className="min-h-0 flex flex-col gap-6 pb-4 relative">
              {isStreaming && <ItineraryProgress progress={progress} error={error} />}

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-ivory-300 shadow-sm">
                <div>
                  <h3 className="font-display text-lg text-navy-800">Your AI Itinerary</h3>
                  <p className="text-sm text-slate-500">A personalized plan for your trip</p>
                </div>
                <div className="flex gap-2">
                  {!trip.itinerary && !isStreaming && (
                    <button 
                      onClick={() => startStream((_t) => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); })}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Generate Plan
                    </button>
                  )}
                  <ReplanButton 
                    isVisible={!!trip.itinerary && !isStreaming} 
                    onReplan={(fb) => startStream((_t) => { queryClient.invalidateQueries({ queryKey: ['trip', tripId] }); }, fb)}
                  />
                </div>
              </div>

              {!isStreaming && trip.itinerary && (
                <>
                  <ItineraryPanel itinerary={trip.itinerary} loading={false} onGenerate={() => {}} weatherDays={weatherDays} restaurants={restaurants} />
                  <BudgetTracker itinerary={trip.itinerary} budgetPerDay={user?.budget_tier === 'budget' ? 100 : user?.budget_tier === 'comfort' ? 300 : 800} />
                </>
              )}

              <div className="elevated-card p-5 mt-4">
                <RestaurantGrid restaurants={restaurants} isLoading={restaurantsLoading} />
              </div>

              <div className="elevated-card p-5 mt-4">
                <h3 className="mb-3 text-lg font-semibold text-navy-800">Nearby activities</h3>
                <ActivityGrid activities={activities} />
              </div>
            </section>
            <aside className="hidden min-h-0 xl:block">
              <div className="sticky top-20 h-[calc(100vh-110px)] flex flex-col gap-3">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-ivory-300 w-fit self-end">
                  {(['properties', 'activities', 'restaurants'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setMapTab(tab)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                        mapTab === tab ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-ivory-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex-1 rounded-2xl overflow-hidden border border-ivory-300">
                  <MapView 
                    center={center} 
                    properties={mapTab === 'properties' ? properties : []} 
                    activities={mapTab === 'activities' ? activities : []}
                    restaurants={mapTab === 'restaurants' ? restaurants : []}
                  />
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
