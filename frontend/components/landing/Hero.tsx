'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function Hero() {
  const { signInWithGoogle, session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session && !loading) {
      router.push('/dashboard');
    }
  }, [session, loading, router]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="font-[family-name:var(--font-syne)] text-5xl md:text-7xl font-bold max-w-3xl"
      >
        Plan less.{' '}
        <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
          Retreat
        </span>{' '}
        more.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="mt-6 text-lg text-brand-muted max-w-xl"
      >
        AI-powered trip planning. Smart booking automation.
      </motion.p>
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => signInWithGoogle()}
        className="mt-10 px-8 py-4 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary font-semibold text-white shadow-lg shadow-brand-primary/30"
      >
        Continue with Google
      </motion.button>
    </div>
  );
}
