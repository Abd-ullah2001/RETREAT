'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { requireSupabase } from '@/lib/supabase';
import api, { verifyAuth, completeOnboarding as completeOnboardingApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (profile?: { name?: string; travel_style?: string; interests?: string[]; budget_tier?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = requireSupabase();

    const clearSession = async () => {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('retreat.session_expired', 'true');
        window.location.href = '/';
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.access_token) {
        verifyAuth(data.session.access_token)
          .then((profile) => {
            if (profile) {
              setUser(profile);
            } else {
              void clearSession();
            }
          })
          .catch(() => void clearSession())
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.access_token) {
        try {
          const profile = await verifyAuth(newSession.access_token);
          if (profile) {
            setUser(profile);
          } else {
            await clearSession();
          }
        } catch {
          await clearSession();
        }
      } else {
        setUser(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const supabase = requireSupabase();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const normalizeAuthIdentifier = (value: string) => {
    const raw = value.trim();
    const [local, domain] = raw.split('@');
    const normalizedLocal = local.trim().replace(/\s+/g, '_') || 'user';
    if (!domain || domain.trim() === '') {
      return `${normalizedLocal}@retreat.local`;
    }

    const cleanedDomain = domain.trim().replace(/\s+/g, '');
    const normalizedDomain = cleanedDomain.includes('.') ? cleanedDomain : `${cleanedDomain || 'retreat'}.local`;
    return `${normalizedLocal}@${normalizedDomain}`;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = requireSupabase();
    const authEmail = normalizeAuthIdentifier(email);
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password });
    if (error) throw error;
    setSession(data.session);
    if (data.session?.access_token) {
      setUser(await verifyAuth(data.session.access_token));
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const authEmail = normalizeAuthIdentifier(email);
    // Create account on the backend but do NOT sign the user in automatically.
    // Users should explicitly log in after signing up.
    await api.post('/api/v1/auth/signup', { email: authEmail, password });
  };

  const signOut = async () => {
    const supabase = requireSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const completeOnboarding = async (body: { name?: string; travel_style?: string; interests?: string[]; budget_tier?: string } = {}) => {
    const profile = await completeOnboardingApi(body);
    setUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
