import Image from 'next/image';
import { FeatureSections, Hero } from '@/components/landing/Hero';
import { Navbar } from '@/components/shared/Navbar';
import { SessionExpiredToast } from '@/components/shared/SessionExpiredToast';
import { Compass, Send, Sparkles, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <main>
      <SessionExpiredToast />
      <Navbar variant="landing" />
      <Hero />
      <FeatureSections />

      <section id="accommodations" className="bg-ivory-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-5xl font-semibold text-navy-900">Atelier Accommodations.</h2>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              ['BOOKING', 'Cliffside caldera suite', '$312', 'Aegean-facing suite with private terrace.', 'https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=900&q=80'],
              ['AIRBNB', 'Architect house in Alfama', '$184', 'Tiled interiors, river light, quiet courtyard.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'],
              ['BOOKING', 'Boutique riad courtyard', '$226', 'Handmade detail, pool court, medina access.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80'],
            ].map(([platform, name, price, description, image]) => (
              <article key={name} className="photo-card h-[420px]">
                <div className="relative h-[55%] overflow-hidden">
                  <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" />
                  <span className="eyebrow absolute left-4 top-4 rounded bg-navy-900/55 px-2 py-1 text-white">{platform}</span>
                </div>
                <div className="flex h-[45%] flex-col p-5">
                  <h3 className="font-display text-xl font-semibold text-navy-800">{name}</h3>
                  <p className="mt-2 flex items-center gap-1 text-sm text-gold-400"><Star className="h-4 w-4 fill-current" /> <span className="font-mono">4.9</span></p>
                  <p className="mt-2 font-mono text-xl text-navy-900">{price}<span className="text-sm text-slate-400"> /night</span></p>
                  <p className="mt-2 text-sm text-slate-400">{description}</p>
                  <a href="/dashboard" className="btn-dark mt-auto inline-flex justify-center px-4 py-3 text-xs">Explore</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-dark px-6 py-24 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow text-white">The operative plan</p>
            <h2 className="mt-4 font-display text-5xl font-semibold">Intelligence behind the <span className="italic">experience.</span></h2>
            <div className="mt-10 space-y-6">
              <div><h3 className="font-body text-lg font-semibold">Dynamic Logistics</h3><p className="mt-2 text-slate-300">Dates, distance, property quality, and host messaging stay coordinated as your trip evolves.</p></div>
              <div><h3 className="font-body text-lg font-semibold">Preference Learning</h3><p className="mt-2 text-slate-300">Retreat adapts planning recommendations to your pace, budget, and interests.</p></div>
            </div>
          </div>
          <div className="grid place-items-center">
            <div className="relative grid h-72 w-72 place-items-center rounded-full border border-navy-500">
              <div className="absolute h-48 w-48 rounded-full border border-navy-500" />
              <div className="absolute h-24 w-24 rounded-full border border-navy-500" />
              <Sparkles className="h-12 w-12 text-ember-500" />
            </div>
          </div>
        </div>
      </section>

      <section id="journal" className="bg-ivory-50 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-5xl font-semibold text-navy-900">Sophisticated Concierge</h2>
          <p className="mt-4 text-slate-400">A digital concierge that learns your language, live with refined intelligence serving your every request.</p>
        </div>
        <div className="elevated-card mx-auto mt-12 max-w-2xl p-5">
          <div className="flex items-center justify-between border-b border-ivory-300 pb-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-navy-800"><span className="h-2 w-2 rounded-full bg-emerald-500" /> WhatsApp Preview</span>
            <a href="/dashboard" className="text-sm font-semibold text-ember-500">OPEN</a>
          </div>
          <div className="mt-5 space-y-4">
            <p className="ml-auto max-w-md rounded-2xl bg-emerald-500 p-4 text-left text-sm leading-6 text-white">Hi Maria, we love your Alfama apartment. Is it available for July 15-18 for two guests?</p>
            <p className="max-w-md rounded-2xl bg-ivory-200 p-4 text-left text-sm leading-6 text-navy-700">Yes, the dates are available. I can also share transit tips nearby.</p>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <input className="input-box" placeholder="Message" />
            <button className="btn-primary grid h-11 w-11 place-items-center p-0" aria-label="Send"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <section className="bg-ivory-50 px-6 py-24 text-center">
        <p className="font-display text-9xl leading-none text-ember-500">&ldquo;</p>
        <blockquote className="mx-auto max-w-3xl font-display text-3xl italic text-navy-800">Retreat has redefined the very concept of agency. It is the invisible orchestration of time and space that makes every journey feel inevitable.</blockquote>
        <p className="mt-8 font-mono text-sm uppercase tracking-widest text-slate-400">Mira Chen / Editorial Traveler</p>
      </section>

      <section className="bg-ivory-50 px-6 py-24 text-center">
        <Compass className="mx-auto h-8 w-8 text-ember-500" />
        <h2 className="mt-6 font-display text-5xl font-semibold text-navy-900">Ready to begin?</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">Open a new board and let Retreat assemble stays, activities, and host outreach into one calm workflow.</p>
        <a href="/dashboard" className="btn-primary mt-8 inline-flex">
          Begin your journey
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
