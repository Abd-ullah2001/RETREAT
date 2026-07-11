'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Menu, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { buttonTap } from '@/lib/animations';

export function Navbar({ variant = 'app' }: { variant?: 'landing' | 'app' }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
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

  const landingLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Blog', href: '#blog' },
    { label: 'Resources', href: '#resources' },
  ].map((link) => (
    <Link key={link.label} href={link.href} className="text-sm font-medium text-[#2B2927]/80 transition-colors hover:text-[#2B2927]">
      {link.label}
    </Link>
  ));

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isLanding ? 'fixed bg-[#FDFBF7]/90 border-b border-[#2B2927]/10 backdrop-blur-md' : 'glass-nav sticky'} top-0 z-40 flex h-20 w-full items-center justify-between px-6 md:px-12`}
    >
      <Link href={isLanding ? '/' : '/dashboard'} className="flex items-center gap-2 font-display text-2xl font-bold tracking-wider text-[#2B2927]">
        <svg className="h-6 w-6 stroke-[#2B2927] fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
        <span>RETREAT</span>
      </Link>

      <div className="hidden items-center gap-8 md:flex">
        {isLanding ? (
          <>
            <div className="flex items-center gap-6">
              {landingLinks}
            </div>
            <div className="flex items-center gap-5 ml-4">
              <Link href="/dashboard" className="text-sm font-medium text-[#2B2927]/80 transition-colors hover:text-[#2B2927]">
                Sign in
              </Link>
              <motion.div {...buttonTap}>
                <Link href="/dashboard" className="btn-primary py-2 px-5 text-sm">
                  Get started
                </Link>
              </motion.div>
            </div>
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

      <motion.button type="button" {...buttonTap} onClick={() => setOpen((value) => !value)} className={`grid h-10 w-10 place-items-center rounded-full border md:hidden border-[#2B2927]/20 text-[#2B2927]`}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sketch-card absolute inset-x-4 top-24 p-6 md:hidden z-50 bg-[#FDFBF7]"
        >
          <div className="flex flex-col gap-5">
            {isLanding ? (
              <>
                {landingLinks}
                <hr className="border-[#2B2927]/10" />
                <div className="flex flex-col gap-4">
                  <Link href="/dashboard" className="text-center text-sm font-medium text-[#2B2927]/80">
                    Sign in
                  </Link>
                  <Link href="/dashboard" className="btn-primary inline-flex items-center justify-center py-3 text-sm">
                    Get started
                  </Link>
                </div>
              </>
            ) : appLinks}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
