import { FeatureSections, Hero } from '@/components/landing/Hero';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <FeatureSections />
      <section className="bg-navy-800 px-6 py-20 text-center text-white">
        <h2 className="text-5xl font-semibold">Ready to plan smarter?</h2>
        <p className="mt-4 text-slate-300">Join travelers using Retreat to turn trip planning into a calm operating system.</p>
        <a href="/dashboard" className="mt-8 inline-flex rounded-full bg-ember-500 px-7 py-4 font-semibold text-white">
          Start for free
        </a>
      </section>
      <footer className="flex flex-col items-center justify-between gap-4 bg-ivory-200 px-6 py-8 text-sm text-navy-700 md:flex-row">
        <span className="font-display text-xl italic text-navy-900">Retreat</span>
        <span>Built with AI. Designed for travelers.</span>
        <div className="flex gap-5">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </footer>
    </main>
  );
}
