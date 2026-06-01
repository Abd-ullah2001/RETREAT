'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { requireSupabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/api';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = requireSupabase();
        
        // Check for error from OAuth provider
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (errorParam) {
          setError(errorDescription || 'Authentication failed');
          setTimeout(() => router.replace('/'), 3000);
          return;
        }

        // Get the session after OAuth callback
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !data.session?.access_token) {
          setError('No session found. Please try again.');
          setTimeout(() => router.replace('/'), 3000);
          return;
        }

        try {
          const user = await verifyAuth(data.session.access_token);
          const nextRoute = user.onboarding_completed ? '/dashboard' : '/onboarding';
          router.replace(nextRoute);
        } catch (verifyError) {
          console.error('Verification failed:', verifyError);
          setError('Failed to verify credentials. Please try again.');
          setTimeout(() => router.replace('/'), 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('Authentication error. Please try again.');
        setTimeout(() => router.replace('/'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="page-bg flex min-h-screen flex-col items-center justify-center gap-5">
      <h1 className="font-display text-4xl font-semibold italic text-navy-900">Retreat</h1>
      {error ? (
        <>
          <p className="text-sm text-ember-500 font-medium">{error}</p>
          <p className="text-xs text-slate-400">Redirecting...</p>
        </>
      ) : (
        <>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-9 w-9 rounded-full border-2 border-ivory-300 border-t-ocean-500" />
          <p className="text-slate-400">Signing you in...</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="page-bg flex min-h-screen flex-col items-center justify-center gap-5">
          <h1 className="font-display text-4xl font-semibold italic text-navy-900">Retreat</h1>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="h-9 w-9 rounded-full border-2 border-ivory-300 border-t-ocean-500" />
          <p className="text-slate-400">Signing you in...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
