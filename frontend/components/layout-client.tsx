'use client';

import { AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { SessionExpiredToast } from '@/components/shared/SessionExpiredToast';

export function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      <SessionExpiredToast />
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </>
  );
}
