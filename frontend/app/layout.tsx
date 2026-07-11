import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { LayoutClient } from '@/components/layout-client';
import './globals.css';

export const metadata: Metadata = {
  title: 'Retreat - AI Trip Planning',
  description: 'AI-powered trip planning and smart booking automation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
