'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { buttonTap } from '@/lib/animations';

interface ReplanButtonProps {
  onReplan: (feedback?: string) => void;
  isVisible: boolean;
}

export function ReplanButton({ onReplan, isVisible }: ReplanButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!isVisible) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate 
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white p-6 rounded-2xl shadow-xl z-50 border border-ivory-300 focus:outline-none"
              >
                <Dialog.Title className="font-display text-xl text-navy-800 mb-2">
                  Regenerate itinerary
                </Dialog.Title>
                <Dialog.Description className="text-slate-500 text-sm mb-6">
                  Want to tweak the plan? Let the AI know what to change, or just regenerate for a fresh take.
                </Dialog.Description>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Any changes? (optional) — e.g. 'more outdoor activities'"
                  className="input-box w-full h-24 resize-none mb-6 text-sm"
                />

                <div className="flex justify-end gap-3">
                  <Dialog.Close asChild>
                    <button className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                  </Dialog.Close>
                  <motion.button
                    variants={buttonTap}
                    initial="initial"
                    whileTap="tap"
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={() => {
                      onReplan(feedback);
                      setIsOpen(false);
                      setFeedback('');
                    }}
                  >
                    Regenerate Plan
                  </motion.button>
                </div>

                <Dialog.Close asChild>
                  <button className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-navy-900 rounded-full hover:bg-ivory-200 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
