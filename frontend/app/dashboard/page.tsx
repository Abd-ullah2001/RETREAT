'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, CalendarDays, CheckCircle2, Clock3, Compass, Home, Inbox, Map, MessageCircle, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/Navbar';
import { PageTransition } from '@/components/shared/PageTransition';
import { SearchForm } from '@/components/dashboard/SearchForm';
import { StatsBanner } from '@/components/dashboard/StatsBanner';
import { TripCard } from '@/components/dashboard/TripCard';
import { useAuth } from '@/components/auth-provider';
import { getInquiries, getTrips } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Inquiry, Trip } from '@/types';

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
    staleTime: 5 * 60 * 1000,
  });

  const { data: inquiries = [] } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const destinations = new Set(trips.map((t) => t.destination)).size;
  const sentInquiries = inquiries.filter((i) => i.status === 'sent').length;
  const pendingInquiries = inquiries.filter((i) => i.status === 'draft').length;
  const latestTrip = trips[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading || !session) {
    return (
      <div className="gradient-mesh flex min-h-screen items-center justify-center">
        <p className="font-mono text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="gradient-mesh min-h-screen">
        <Navbar />
        <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6">
          <DashboardRail pendingInquiries={pendingInquiries} />
          <main className="min-w-0 space-y-6">
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="elevated-card overflow-hidden p-6 md:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-ocean-500">Operations center</p>
                    <h1 className="mt-3 text-4xl font-semibold text-navy-900 md:text-5xl">
                      {greeting}, {user?.name?.split(' ')[0] ?? 'Traveler'}
                    </h1>
                    <p className="mt-3 max-w-2xl text-navy-700">
                      Trips, stay shortlists, host messages, and itinerary generation are now grouped into one command surface.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-navy-900 p-4 text-white">
                    <p className="font-mono text-xs uppercase text-ocean-300">Today</p>
                    <p className="mt-2 text-2xl font-semibold">{formatDate(new Date().toISOString())}</p>
                    <p className="mt-1 text-sm text-slate-300">{pendingInquiries} inquiry drafts need review</p>
                  </div>
                </div>
                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  <StatusTile icon={Sparkles} label="AI readiness" value={trips.length ? 'Ready to plan' : 'Waiting for trip'} tone="ocean" />
                  <StatusTile icon={MessageCircle} label="Host pipeline" value={pendingInquiries ? `${pendingInquiries} drafts` : 'Clear'} tone="emerald" />
                  <StatusTile icon={CalendarDays} label="Next trip" value={latestTrip?.destination ?? 'Not scheduled'} tone="ember" />
                </div>
              </div>
              <NextActions latestTrip={latestTrip} pendingInquiries={pendingInquiries} />
            </section>

            <StatsBanner trips={trips.length} inquiries={sentInquiries} destinations={destinations} />

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <SearchForm />
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold text-navy-800">Your Trips</h2>
                      <p className="text-sm text-slate-400">Active planning boards and saved travel workspaces.</p>
                    </div>
                    <Link href="#new-trip" className="hidden items-center gap-2 rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-white md:inline-flex">
                      <Plus className="h-4 w-4" /> New Trip
                    </Link>
                  </div>
                  {trips.length ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      {trips.map((trip, i) => (
                        <TripCard key={trip.id} trip={trip} index={i} />
                      ))}
                    </div>
                  ) : (
                    <PremiumEmptyState />
                  )}
                </section>
              </div>
              <ActivityPanel trips={trips} inquiries={inquiries} />
            </section>
          </main>
        </div>
      </div>
    </PageTransition>
  );
}

function DashboardRail({ pendingInquiries }: { pendingInquiries: number }) {
  const items = [
    { label: 'Overview', icon: Home, href: '/dashboard', active: true },
    { label: 'Trips', icon: Map, href: '#trips' },
    { label: 'Inquiries', icon: Inbox, href: '/inquiries', badge: pendingInquiries },
    { label: 'Saved Places', icon: Compass, href: '#saved' },
  ];

  return (
    <aside className="elevated-card hidden h-[calc(100vh-96px)] sticky top-20 p-4 lg:block">
      <div className="rounded-2xl bg-navy-900 p-4 text-white">
        <p className="font-display text-2xl italic">Retreat</p>
        <p className="mt-2 text-xs text-slate-300">Travel operations cockpit</p>
      </div>
      <nav className="mt-5 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-semibold ${item.active ? 'bg-ocean-100 text-ocean-500' : 'text-navy-700 hover:bg-ivory-100'}`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" /> {item.label}
              </span>
              {!!item.badge && <span className="rounded-full bg-ember-500 px-2 py-0.5 font-mono text-xs text-white">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-2xl bg-ivory-100 p-4">
        <Bell className="h-5 w-5 text-ember-500" />
        <p className="mt-3 text-sm font-semibold text-navy-800">Concierge mode</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Review drafts, compare stays, and keep bookings moving.</p>
      </div>
    </aside>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  tone: 'ocean' | 'emerald' | 'ember';
}) {
  const color = tone === 'ocean' ? 'text-ocean-500 bg-ocean-100' : tone === 'emerald' ? 'text-emerald-600 bg-emerald-100' : 'text-ember-500 bg-ember-100';
  return (
    <div className="rounded-2xl border border-ivory-300 bg-ivory-100 p-4">
      <Icon className={`h-5 w-5 rounded-lg p-0.5 ${color}`} />
      <p className="mt-3 font-mono text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-navy-800">{value}</p>
    </div>
  );
}

function NextActions({ latestTrip, pendingInquiries }: { latestTrip?: Trip; pendingInquiries: number }) {
  const actions = [
    latestTrip ? { label: `Open ${latestTrip.destination}`, href: `/trip/${latestTrip.id}`, icon: ArrowRight } : { label: 'Plan a first trip', href: '#new-trip', icon: Plus },
    { label: pendingInquiries ? 'Review inquiry drafts' : 'View inquiry tracker', href: '/inquiries', icon: MessageCircle },
    { label: 'Generate next itinerary', href: latestTrip ? `/trip/${latestTrip.id}` : '#new-trip', icon: Sparkles },
  ];

  return (
    <div className="elevated-card p-5">
      <h2 className="text-2xl font-semibold text-navy-800">Next Actions</h2>
      <div className="mt-4 space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.label} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }}>
              <Link href={action.href} className="flex items-center justify-between rounded-2xl bg-ivory-100 p-4 text-sm font-semibold text-navy-800 hover:bg-ocean-100">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-ocean-500" /> {action.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityPanel({ trips, inquiries }: { trips: Trip[]; inquiries: Inquiry[] }) {
  const tripEvents = trips.slice(0, 3).map((trip) => ({
    label: `${trip.destination} trip board created`,
    meta: formatDate(trip.created_at),
    icon: Map,
  }));
  const inquiryEvents = inquiries.slice(0, 4).map((inquiry) => ({
    label: `${inquiry.status === 'sent' ? 'Sent' : 'Drafted'} inquiry for ${inquiry.property_snapshot?.name ?? 'property'}`,
    meta: formatDate(inquiry.created_at),
    icon: inquiry.status === 'sent' ? CheckCircle2 : Clock3,
  }));
  const events = [...inquiryEvents, ...tripEvents].slice(0, 6);

  return (
    <aside className="space-y-6">
      <div className="elevated-card p-5">
        <h2 className="text-2xl font-semibold text-navy-800">Activity Feed</h2>
        <div className="mt-4 space-y-3">
          {events.length ? (
            events.map((event) => {
              const Icon = event.icon;
              return (
                <div key={`${event.label}-${event.meta}`} className="flex gap-3 rounded-2xl bg-ivory-100 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ivory-50 text-ocean-500">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-navy-800">{event.label}</p>
                    <p className="mt-1 font-mono text-xs text-slate-400">{event.meta}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-2xl bg-ivory-100 p-4 text-sm leading-6 text-slate-400">
              Your planning feed will show trip creation, inquiry drafts, and sent messages as they happen.
            </p>
          )}
        </div>
      </div>
      <div className="elevated-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ember-500">Travel intelligence</p>
        <h3 className="mt-3 text-2xl font-semibold text-navy-800">Keep the trip moving</h3>
        <p className="mt-2 text-sm leading-6 text-navy-700">
          Retreat watches for unfinished planning work: missing itineraries, unsent host messages, and trips without enough stay options.
        </p>
      </div>
    </aside>
  );
}

function PremiumEmptyState() {
  return (
    <div className="elevated-card overflow-hidden p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_260px] md:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ocean-500">First workspace</p>
          <h3 className="mt-3 text-3xl font-semibold text-navy-800">Build a live trip board</h3>
          <p className="mt-3 max-w-xl text-navy-700">
            Search a destination and Retreat will assemble stays, activities, itinerary drafts, and inquiry workflows into one board.
          </p>
          <Link href="#new-trip" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ember-500 px-5 py-3 font-semibold text-white">
            Start planning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-[24px] bg-navy-900 p-4 text-white">
          {['Destination search', 'Stay ranking', 'AI itinerary', 'Host inquiry'].map((item, index) => (
            <div key={item} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-b-0">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 font-mono text-xs">{index + 1}</span>
              <span className="text-sm font-semibold">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
