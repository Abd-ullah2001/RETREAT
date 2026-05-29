'use client';

import Image from 'next/image';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { PageTransition } from '@/components/shared/PageTransition';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getInquiries } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

type Filter = 'all' | 'sent' | 'draft';

export default function InquiriesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
    staleTime: 5 * 60 * 1000,
  });

  const visible = inquiries.filter((inq) => filter === 'all' || inq.status === filter);

  return (
    <PageTransition>
      <div className="gradient-mesh min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <header>
            <h1 className="text-4xl font-semibold text-navy-800">Inquiry Tracker</h1>
            <p className="mt-2 text-slate-400">Track all your property inquiries</p>
          </header>
          <div className="mt-8 inline-flex rounded-full bg-ivory-200 p-1">
            {(['all', 'sent', 'draft'] as const).map((tab) => (
              <button key={tab} type="button" onClick={() => setFilter(tab)} className="relative rounded-full px-5 py-2 text-sm font-semibold capitalize">
                {filter === tab && <motion.span layoutId="inquiry-tab" className="absolute inset-0 rounded-full bg-navy-900" />}
                <span className={`relative z-10 ${filter === tab ? 'text-white' : 'text-navy-700'}`}>{tab}</span>
              </button>
            ))}
          </div>

          {isLoading && <p className="mt-8 font-mono text-sm text-slate-400">Loading...</p>}
          <div className="mt-6 space-y-4">
            {visible.map((inq, i) => {
              const property = inq.property_snapshot;
              const image = property?.imageUrls?.[0];
              return (
                <motion.article
                  key={inq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="elevated-card elevated-card-hover p-4"
                >
                  <div className="flex gap-4">
                    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl bg-ivory-200">
                      {image && <Image src={image} alt="" fill sizes="72px" className="object-cover" unoptimized />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="truncate text-xl font-semibold text-navy-800">{property?.name ?? 'Property'}</h3>
                          <p className="font-mono text-xs text-slate-400">{formatDate(inq.created_at)}</p>
                        </div>
                        <StatusBadge status={inq.status} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-navy-700">{inq.final_message}</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button type="button" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)} className="text-sm font-semibold text-ocean-500">
                          View message
                        </button>
                        {inq.wa_link && (
                          <a href={inq.wa_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                            Open WhatsApp <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expanded === inq.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="mt-4 rounded-2xl bg-ivory-100 p-4 text-sm leading-6 text-navy-700">{inq.final_message}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
          {!isLoading && visible.length === 0 && (
            <div className="elevated-card mt-8 p-8 text-center">
              <h2 className="text-2xl font-semibold text-slate-400">No inquiries yet</h2>
              <a href="/dashboard" className="mt-4 inline-flex rounded-full bg-ember-500 px-5 py-3 font-semibold text-white">
                Go back to planning
              </a>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
