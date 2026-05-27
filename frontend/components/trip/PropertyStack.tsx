'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PropertyCard } from './PropertyCard';
import type { Property } from '@/types';
import { useRetreatStore } from '@/lib/store';
import { recordInteraction, createInquiry } from '@/lib/api';
import { InquiryModal } from './InquiryModal';

interface PropertyStackProps {
  tripId: string;
  properties: Property[];
}

export function PropertyStack({ tripId, properties }: PropertyStackProps) {
  const swiped = useRetreatStore((s) => s.swipedPropertyIds);
  const markInterested = useRetreatStore((s) => s.markInterested);
  const markSkipped = useRetreatStore((s) => s.markSkipped);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [inquiryData, setInquiryData] = useState<{
    wa_link: string | null;
    ai_message: string;
    property: Property;
  } | null>(null);

  const visible = properties.filter((p) => !swiped.has(p.id));
  const current = visible[0];

  const handleSwipe = async (direction: 'left' | 'right', property: Property) => {
    setExitDir(direction);

    setTimeout(async () => {
      if (direction === 'right') {
        markInterested(property.id);
        await recordInteraction(tripId, {
          propertyId: property.id,
          platform: property.platform,
          propertySnapshot: property,
          action: 'interested',
        });
        const inquiry = await createInquiry({
          tripId,
          propertyId: property.id,
          platform: property.platform,
          propertySnapshot: property,
        });
        setInquiryId(inquiry.id);
        setInquiryData({
          wa_link: inquiry.wa_link,
          ai_message: inquiry.ai_message,
          property,
        });
      } else {
        markSkipped(property.id);
        await recordInteraction(tripId, {
          propertyId: property.id,
          platform: property.platform,
          propertySnapshot: property,
          action: 'skipped',
        });
      }
      setExitDir(null);
    }, 400);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            exit={
              exitDir === 'right'
                ? { x: 300, rotate: 15, opacity: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                : exitDir === 'left'
                  ? { x: -300, rotate: -15, opacity: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
                  : { opacity: 0 }
            }
          >
            <PropertyCard property={current} index={0} onSwipe={(dir) => handleSwipe(dir, current)} />
          </motion.div>
        )}
      </AnimatePresence>
      {current && (
        <div className="flex justify-center gap-8">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSwipe('left', current)}
            className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500 text-2xl"
          >
            ❌
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => handleSwipe('right', current)}
            className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500 text-2xl"
          >
            ❤️
          </motion.button>
        </div>
      )}
      {!current && (
        <p className="text-center text-brand-muted py-8">No more properties to review</p>
      )}
      {inquiryId && inquiryData && (
        <InquiryModal
          inquiryId={inquiryId}
          waLink={inquiryData.wa_link}
          initialMessage={inquiryData.ai_message}
          bookingUrl={inquiryData.property.bookingUrl}
          onClose={() => {
            setInquiryId(null);
            setInquiryData(null);
          }}
        />
      )}
    </div>
  );
}
