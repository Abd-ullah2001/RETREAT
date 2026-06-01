'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { pageVariants } from '@/lib/animations';

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-bg min-h-screen">
      {children}
    </motion.div>
  );
}
