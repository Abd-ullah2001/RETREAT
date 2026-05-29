'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bell, Menu, Plus, X } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { buttonTap } from '@/lib/animations';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 48], [0.78, 1]);

  const links = (
    <>
      <Link href="/dashboard" className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
        Dashboard
      </Link>
      <Link href="/inquiries" className="text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
        Inquiries
      </Link>
    </>
  );

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ opacity: navOpacity }}
      className="glass-card sticky top-0 z-40 flex h-16 items-center justify-between px-5 md:px-8"
    >
      <Link href="/dashboard" className="font-display text-2xl font-semibold italic text-navy-900">
        Retreat
      </Link>

      <div className="hidden items-center gap-6 md:flex">
        {links}
        <motion.button
          type="button"
          {...buttonTap}
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-full border border-ivory-300 text-navy-700"
        >
          <Bell className="h-4 w-4" />
        </motion.button>
        <motion.div {...buttonTap}>
          <Link href="/dashboard#new-trip" className="inline-flex items-center gap-2 rounded-full bg-ember-500 px-4 py-2 text-sm font-semibold text-white">
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
      </div>

      <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-ivory-300 text-navy-900 md:hidden">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card absolute inset-x-4 top-20 rounded-2xl p-5 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {links}
            <Link href="/dashboard#new-trip" className="inline-flex items-center justify-center gap-2 rounded-full bg-ember-500 px-4 py-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> New Trip
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
