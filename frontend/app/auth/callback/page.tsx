'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { requireSupabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = requireSupabase();
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.access_token) {
        try {
          await verifyAuth(data.session.access_token);
          router.replace('/dashboard');
        } catch {
          await supabase.auth.signOut();
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
    });
  }, [router]);

  return (
    <div className="gradient-mesh flex min-h-screen flex-col items-center justify-center gap-5">
      <h1 className="font-display text-4xl font-semibold italic text-navy-900">Retreat</h1>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-9 w-9 rounded-full border-2 border-ivory-300 border-t-ocean-500" />
      <p className="text-slate-400">Signing you in...</p>
    </div>
  );
}
