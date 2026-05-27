'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateInquiryMessage, markInquirySent } from '@/lib/api';

interface InquiryModalProps {
  inquiryId: string;
  waLink: string | null;
  initialMessage: string;
  bookingUrl: string;
  onClose: () => void;
}

export function InquiryModal({
  inquiryId,
  waLink,
  initialMessage,
  bookingUrl,
  onClose,
}: InquiryModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [editable, setEditable] = useState(false);
  const [link, setLink] = useState(waLink);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveMessage = useCallback(
    async (text: string) => {
      const inquiry = await updateInquiryMessage(inquiryId, text);
      setLink(inquiry.wa_link);
    },
    [inquiryId],
  );

  useEffect(() => {
    if (!editable) return;
    const timer = setTimeout(() => saveMessage(message), 500);
    return () => clearTimeout(timer);
  }, [message, editable, saveMessage]);

  const handleOpenWhatsApp = async () => {
    if (link) window.open(link, '_blank');
    await markInquirySent(inquiryId);
    setSent(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    await markInquirySent(inquiryId);
    setCopied(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-t-3xl bg-brand-card border border-brand-border p-6"
        >
          <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold">WhatsApp inquiry</h3>
          <button
            type="button"
            onClick={() => setEditable(!editable)}
            className="text-sm text-brand-primary mt-2"
          >
            {editable ? 'Done editing' : 'Edit message'}
          </button>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            readOnly={!editable}
            className="w-full mt-4 p-4 rounded-xl bg-brand-dark border border-brand-border min-h-[160px] text-sm resize-none"
          />
          <div className="flex gap-3 mt-4">
            {link ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={handleOpenWhatsApp}
                disabled={sent}
                className="flex-1 py-3 rounded-xl bg-[#25D366] font-semibold text-white"
              >
                {sent ? '✓ Sent' : 'Open in WhatsApp'}
              </motion.button>
            ) : (
              <>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopy}
                  className="flex-1 py-3 rounded-xl bg-brand-primary font-semibold"
                >
                  {copied ? '✓ Copied' : 'Copy Message'}
                </motion.button>
                <motion.a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3 rounded-xl border border-brand-border text-center font-semibold"
                >
                  View Listing
                </motion.a>
              </>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-brand-border"
            >
              Cancel
            </motion.button>
          </div>
          <p className="text-xs text-brand-muted mt-4 text-center">
            This message will be sent from your WhatsApp account
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
