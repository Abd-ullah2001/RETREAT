'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth-provider';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-4 border-b border-brand-border"
    >
      <Link href="/dashboard" className="font-[family-name:var(--font-syne)] text-xl font-bold text-brand-primary">
        Retreat
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-sm text-brand-muted hover:text-white">
          Dashboard
        </Link>
        <Link href="/inquiries" className="text-sm text-brand-muted hover:text-white">
          Inquiries
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            {user.avatar_url && (
              <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-brand-muted hover:text-white"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
