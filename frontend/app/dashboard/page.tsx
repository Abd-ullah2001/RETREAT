'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageTransition } from '@/components/shared/PageTransition';
import { Navbar } from '@/components/shared/Navbar';
import { SearchForm } from '@/components/dashboard/SearchForm';
import { StatsBanner } from '@/components/dashboard/StatsBanner';
import { TripCard } from '@/components/dashboard/TripCard';
import { useAuth } from '@/components/auth-provider';
import { getInquiries, getTrips } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace('/');
  }, [loading, session, router]);

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
    enabled: !!session,
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
    enabled: !!session,
  });

  const destinations = new Set(trips.map((t) => t.destination)).size;
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <p className="text-brand-muted">Loading...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <div>
            <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
              {greeting}, {user?.name?.split(' ')[0] ?? 'Traveler'}
            </h1>
            <p className="text-brand-muted text-sm mt-1">{formatDate(new Date().toISOString())}</p>
          </div>
          <StatsBanner
            trips={trips.length}
            inquiries={inquiries.filter((i) => i.status === 'sent').length}
            destinations={destinations}
          />
          <SearchForm />
          <section>
            <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold mb-4">My Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
}
