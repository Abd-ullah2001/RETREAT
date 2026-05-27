import { FloatingOrbs } from '@/components/landing/FloatingOrbs';
import { Hero } from '@/components/landing/Hero';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-brand-dark">
      <FloatingOrbs />
      <Hero />
    </main>
  );
}
