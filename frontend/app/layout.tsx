import type { Metadata } from 'next';
import { Inter, Syne } from 'next/font/google';
import { Providers } from '@/components/providers';
import { LayoutClient } from '@/components/layout-client';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const syne = Syne({ subsets: ['latin'], variable: '--font-syne' });

export const metadata: Metadata = {
  title: 'Retreat — AI Trip Planning',
  description: 'AI-powered trip planning and smart booking automation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
