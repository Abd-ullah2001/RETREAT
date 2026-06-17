'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ItineraryProgressProps {
  progress: { step: number; message: string; percent: number } | null;
  error: string | null;
}

export function ItineraryProgress({ progress, error }: ItineraryProgressProps) {
  return (
    <div className="absolute inset-0 z-50 bg-ivory-50/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-2xl">
      <h2 className="font-display italic text-3xl text-navy-800 mb-8 tracking-tight">Retreat</h2>
      
      {error ? (
        <div className="flex flex-col items-center gap-4 bg-ember-50 border border-ember-200 p-6 rounded-2xl max-w-sm w-full text-center">
          <p className="text-ember-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary text-sm px-6 py-2"
          >
            Refresh page
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="w-full bg-ivory-300 h-1.5 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-ember-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress?.percent || 5}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={progress?.step || 0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-body text-slate-500 text-center text-sm"
            >
              {progress?.message || 'Preparing...'}
            </motion.p>
          </AnimatePresence>

          <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-slate-300"
                animate={{
                  y: ['0%', '-50%', '0%'],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
