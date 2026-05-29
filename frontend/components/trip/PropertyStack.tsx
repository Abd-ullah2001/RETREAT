'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { InquiryModal } from './InquiryModal';
import { PropertyCard } from './PropertyCard';
import { createInquiry, recordInteraction } from '@/lib/api';
import { useRetreatStore } from '@/lib/store';
import type { Property } from '@/types';

interface PropertyStackProps {
  tripId: string;
  properties: Property[];
}

export function PropertyStack({ tripId, properties }: PropertyStackProps) {
  const swiped = useRetreatStore((s) => s.swipedPropertyIds);
  const markInterested = useRetreatStore((s) => s.markInterested);
  const markSkipped = useRetreatStore((s) => s.markSkipped);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [filter, setFilter] = useState<'all' | 'booking' | 'airbnb'>('all');
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [inquiryData, setInquiryData] = useState<{ wa_link: string | null; ai_message: string; property: Property } | null>(null);

  const filtered = useMemo(() => properties.filter((p) => filter === 'all' || p.platform === filter), [properties, filter]);
  const visible = filtered.filter((p) => !swiped.has(p.id));
  const current = visible[0];

  const handleSwipe = useCallback(async (direction: 'left' | 'right', property: Property) => {
    setExitDir(direction);
    setTimeout(async () => {
      if (direction === 'right') {
        markInterested(property.id);
        await recordInteraction(tripId, { propertyId: property.id, platform: property.platform, propertySnapshot: property, action: 'interested' });
        const inquiry = await createInquiry({ tripId, propertyId: property.id, platform: property.platform, propertySnapshot: property });
        setInquiryId(inquiry.id);
        setInquiryData({ wa_link: inquiry.wa_link, ai_message: inquiry.ai_message, property });
      } else {
        markSkipped(property.id);
        await recordInteraction(tripId, { propertyId: property.id, platform: property.platform, propertySnapshot: property, action: 'skipped' });
      }
      setExitDir(null);
    }, 400);
  }, [markInterested, markSkipped, tripId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!current) return;
      if (event.key === 'ArrowLeft') handleSwipe('left', current);
      if (event.key === 'ArrowRight') handleSwipe('right', current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, handleSwipe]);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-navy-800">Find your stay</h2>
          <p className="font-mono text-xs text-slate-400">{filtered.length} properties</p>
        </div>
        <div className="flex rounded-full bg-ivory-200 p-1">
          {(['all', 'booking', 'airbnb'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${filter === item ? 'bg-navy-900 text-white' : 'text-navy-700'}`}
            >
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[560px]">
        {visible[1] && <div className="elevated-card absolute inset-x-5 top-4 h-[540px] opacity-60" />}
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              exit={
                exitDir === 'right'
                  ? { x: 320, rotate: 12, opacity: 0, transition: { duration: 0.4 } }
                  : exitDir === 'left'
                    ? { x: -320, rotate: -12, opacity: 0, transition: { duration: 0.4 } }
                    : { opacity: 0 }
              }
            >
              <PropertyCard property={current} index={0} onSwipe={(dir) => handleSwipe(dir, current)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {current ? (
        <>
          <div className="flex justify-center gap-8">
            <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => handleSwipe('left', current)} className="grid h-14 w-14 place-items-center rounded-full bg-ivory-200 text-navy-700 shadow-sm">
              <X className="h-7 w-7" />
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.88 }} onClick={() => handleSwipe('right', current)} className="grid h-14 w-14 place-items-center rounded-full bg-ember-500 text-white shadow-sm">
              <Heart className="h-7 w-7 fill-current" />
            </motion.button>
          </div>
          <div className="flex justify-center gap-1.5">
            {filtered.slice(0, 8).map((p) => (
              <motion.span key={p.id} layout className={`h-1.5 rounded-full ${p.id === current.id ? 'w-6 bg-ember-500' : swiped.has(p.id) ? 'w-1.5 bg-ivory-300' : 'w-1.5 bg-slate-300'}`} />
            ))}
          </div>
        </>
      ) : (
        <p className="elevated-card py-8 text-center text-slate-400">No more properties to review</p>
      )}

      {inquiryId && inquiryData && (
        <InquiryModal
          inquiryId={inquiryId}
          waLink={inquiryData.wa_link}
          initialMessage={inquiryData.ai_message}
          bookingUrl={inquiryData.property.bookingUrl}
          propertyName={inquiryData.property.name}
          propertyImage={inquiryData.property.imageUrls[0]}
          platform={inquiryData.property.platform}
          onClose={() => {
            setInquiryId(null);
            setInquiryData(null);
          }}
        />
      )}
    </section>
  );
}
