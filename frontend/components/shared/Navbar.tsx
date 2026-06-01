'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Menu, Plus, X } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { buttonTap } from '@/lib/animations';

export function Navbar({ variant = 'app' }: { variant?: 'landing' | 'app' }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const landingBg = useTransform(scrollY, [0, 80], ['rgba(253, 252, 248, 0)', 'rgba(253, 252, 248, 0.88)']);
  const landingBorder = useTransform(scrollY, [0, 80], ['rgba(227, 218, 201, 0)', 'rgba(227, 218, 201, 0.7)']);
  const isLanding = variant === 'landing';

  const appLinks = (
    <>
      <Link href="/dashboard" className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
        Discover
      </Link>
      <Link href="/dashboard" className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
        My Trips
      </Link>
      <Link href="/inquiries" className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
        Inquiries
      </Link>
    </>
  );

  const landingLinks = ['Discovery', 'Accommodations', 'Itinerary', 'Journal'].map((label) => (
    <Link key={label} href={`#${label.toLowerCase()}`} className="text-xs font-medium uppercase tracking-widest text-white/80 transition-colors hover:text-white">
      {label}
    </Link>
  ));

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      style={isLanding ? { backgroundColor: landingBg, borderBottomColor: landingBorder } : undefined}
      className={`${isLanding ? 'fixed border-b backdrop-blur-xl' : 'glass-nav sticky'} top-0 z-40 flex h-16 w-full items-center justify-between px-5 md:px-8`}
    >
      <Link href={isLanding ? '/' : '/dashboard'} className={`font-display text-2xl font-semibold italic ${isLanding ? 'text-white drop-shadow' : 'text-navy-900'}`}>
        Retreat
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        {isLanding ? (
          <>
            {landingLinks}
            <motion.div {...buttonTap}>
              <Link href="/dashboard" className="btn-primary px-4 py-2 text-sm">
                Start Planning
              </Link>
            </motion.div>
          </>
        ) : (
          <>
            {appLinks}
            <motion.button
              type="button"
              {...buttonTap}
              aria-label="Notifications"
              className="grid h-9 w-9 place-items-center rounded-full border border-ivory-300 text-navy-700"
            >
              <Bell className="h-4 w-4" />
            </motion.button>
            <motion.div {...buttonTap}>
              <Link href="/dashboard#new-trip" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                <Plus className="h-4 w-4" /> New Trip
              </Link>
            </motion.div>
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt="" width={36} height={36} className="rounded-full" unoptimized />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-ocean-100 font-semibold text-ocean-500">
                    {(user.name ?? user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <button type="button" onClick={() => signOut()} className="text-sm font-medium text-slate-400 hover:text-navy-900">
                  Sign out
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <motion.button type="button" {...buttonTap} onClick={() => setOpen((value) => !value)} className={`grid h-10 w-10 place-items-center rounded-full border md:hidden ${isLanding ? 'border-white/40 text-white' : 'border-ivory-300 text-navy-900'}`}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="elevated-card absolute inset-x-4 top-20 p-5 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {isLanding ? landingLinks : appLinks}
            <Link href={isLanding ? '/dashboard' : '/dashboard#new-trip'} className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm">
              {isLanding ? 'Start Planning' : <><Plus className="h-4 w-4" /> New Trip</>}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
