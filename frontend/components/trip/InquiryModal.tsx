'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Edit3, ExternalLink, MessageCircle, AlertCircle } from 'lucide-react';
import { markInquirySent, updateInquiryMessage } from '@/lib/api';
import { buttonTap, modalSlideUp } from '@/lib/animations';
import { showToast } from '@/components/shared/ToastProvider';

interface InquiryModalProps {
  inquiryId: string;
  waLink: string | null;
  initialMessage: string;
  bookingUrl: string;
  propertyName?: string;
  propertyImage?: string;
  platform?: string;
  onClose: () => void;
}

export function InquiryModal({
  inquiryId,
  waLink,
  initialMessage,
  bookingUrl,
  propertyName = 'Property',
  propertyImage,
  platform,
  onClose,
}: InquiryModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [editable, setEditable] = useState(false);
  const [link, setLink] = useState(waLink);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveMessage = useCallback(
    async (text: string) => {
      try {
        setIsSaving(true);
        const inquiry = await updateInquiryMessage(inquiryId, text);
        setLink(inquiry.wa_link);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save message';
        setError(message);
        showToast('error', message);
      } finally {
        setIsSaving(false);
      }
    },
    [inquiryId],
  );

  useEffect(() => {
    if (!editable) return;
    const timer = setTimeout(() => saveMessage(message), 500);
    return () => clearTimeout(timer);
  }, [message, editable, saveMessage]);

  const handleOpenWhatsApp = async () => {
    try {
      if (link) window.open(link, '_blank');
      await markInquirySent(inquiryId);
      setSent(true);
      showToast('success', 'Message marked as sent!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark as sent';
      showToast('error', message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      await markInquirySent(inquiryId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('success', 'Message copied and marked as sent!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to copy message';
      showToast('error', message);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/40 p-0 md:items-center md:p-6" onClick={onClose}>
        <motion.div variants={modalSlideUp} initial="initial" animate="animate" exit="exit" onClick={(e) => e.stopPropagation()} className="elevated-card w-full max-w-xl rounded-b-none p-6 md:rounded-[20px]">
          <div className="flex items-start gap-4">
            {propertyImage ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                <Image src={propertyImage} alt="" fill sizes="64px" className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-ivory-200" />
            )}
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-ocean-500">Smart Inquiry</p>
              <h3 className="mt-1 text-2xl font-semibold text-navy-800">{propertyName}</h3>
              {platform && <span className="mt-2 inline-flex rounded-full bg-ivory-200 px-2.5 py-1 text-xs font-semibold capitalize text-navy-700">{platform}</span>}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 rounded-xl bg-ember-50 p-3"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-ember-500 mt-0.5" />
              <p className="text-sm text-ember-700">{error}</p>
            </motion.div>
          )}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-400">AI-drafted message</label>
              <button 
                type="button" 
                onClick={() => setEditable(!editable)} 
                disabled={isSaving}
                className="inline-flex items-center gap-1 text-sm font-semibold text-ocean-500 disabled:opacity-50"
              >
                <Edit3 className="h-4 w-4" /> {editable ? 'Done' : 'Edit'}
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              readOnly={!editable}
              className="min-h-[180px] w-full resize-none rounded-2xl border border-ivory-300 bg-ivory-100 p-4 text-sm leading-6 text-navy-900 outline-none focus:border-ocean-500 disabled:opacity-50"
            />
            <p className="mt-1 text-right font-mono text-xs text-slate-400">{message.length} characters</p>
          </div>

          <div className="mt-5 space-y-3">
            {link ? (
              <motion.button 
                type="button" 
                {...buttonTap} 
                onClick={handleOpenWhatsApp} 
                disabled={sent} 
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 font-semibold text-white disabled:bg-emerald-600"
              >
                {sent ? <Check className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                {sent ? 'Opened in WhatsApp' : 'Open in WhatsApp'}
              </motion.button>
            ) : (
              <>
                <motion.button 
                  type="button" 
                  {...buttonTap} 
                  onClick={handleCopy} 
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ocean-500 py-3 font-semibold text-white"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy Message'}
                </motion.button>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ivory-300 py-3 font-semibold text-ember-500">
                  View Listing <ExternalLink className="h-4 w-4" />
                </a>
              </>
            )}
            <button type="button" onClick={onClose} className="w-full py-2 text-sm font-medium text-slate-400 hover:text-navy-800">
              Cancel
            </button>
          </div>
          <p className="mt-4 text-center font-mono text-xs text-slate-400">Messages are sent from your personal WhatsApp - not from Retreat</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
