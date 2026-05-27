'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/shared/PageTransition';
import { Navbar } from '@/components/shared/Navbar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getInquiries } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function InquiriesPage() {
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiries,
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-brand-dark">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold mb-6">My Inquiries</h1>
          {isLoading && <p className="text-brand-muted">Loading...</p>}
          <div className="space-y-4">
            {inquiries.map((inq, i) => (
              <motion.div
                key={inq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl bg-brand-card border border-brand-border"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">
                    {(inq.property_snapshot as { name?: string })?.name ?? 'Property'}
                  </h3>
                  <StatusBadge status={inq.status} />
                </div>
                <p className="text-sm text-brand-muted mt-2 line-clamp-2">{inq.final_message}</p>
                <p className="text-xs text-brand-muted mt-2">{formatDate(inq.created_at)}</p>
                {inq.wa_link && (
                  <a
                    href={inq.wa_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm text-[#25D366]"
                  >
                    Open in WhatsApp →
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
