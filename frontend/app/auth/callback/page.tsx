'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.access_token) {
        try {
          await verifyAuth(data.session.access_token);
          router.replace('/dashboard');
        } catch {
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark">
      <p className="text-brand-muted">Signing you in...</p>
    </div>
  );
}
