'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, BedDouble, Building2, CalendarDays, Check, ChevronDown, CloudSun, Mail, MapPin, MessageCircle, Search, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { buttonTap, cardVariants, floatOrb, slideFromLeft } from '@/lib/animations';
import { FloatingOrbs } from './FloatingOrbs';

export function Hero() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, session, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (session && !loading) {
      router.push('/dashboard');
    }
  }, [session, loading, router]);

  const handleEmailAuth = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-navy-900 text-white">
      <FloatingOrbs />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p
            custom={0}
            variants={slideFromLeft}
            initial="initial"
            animate="animate"
            className="font-mono text-xs uppercase tracking-[0.24em] text-ocean-300"
          >
            AI Travel Operations Platform
          </motion.p>
          <motion.h1
            custom={1}
            variants={slideFromLeft}
            initial="initial"
            animate="animate"
            className="mt-6 max-w-3xl text-6xl font-semibold leading-[0.95] md:text-7xl"
          >
            Your travel,
            <span className="block italic text-gradient-ocean">orchestrated.</span>
          </motion.h1>
          <motion.p
            custom={2}
            variants={slideFromLeft}
            initial="initial"
            animate="animate"
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl"
          >
            Intelligent itinerary planning, accommodation search, and automated booking workflows powered by adaptive AI.
          </motion.p>
          <motion.div custom={3} variants={slideFromLeft} initial="initial" animate="animate" className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {['No credit card', 'Live stay ranking', 'Email or Google'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/8 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-500" />
                <p className="text-xs font-semibold text-slate-300">{item}</p>
              </div>
            ))}
          </motion.div>
          <motion.div custom={4} variants={slideFromLeft} initial="initial" animate="animate" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="button"
              {...buttonTap}
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ember-500 px-7 py-4 font-semibold text-white shadow-lg shadow-ember-500/25"
            >
              Start Planning <ArrowRight className="h-4 w-4" />
            </motion.button>
            <motion.a
              href="#features"
              {...buttonTap}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 font-semibold text-white"
            >
              See how it works
            </motion.a>
          </motion.div>
          <motion.form
            custom={5}
            variants={slideFromLeft}
            initial="initial"
            animate="animate"
            onSubmit={handleEmailAuth}
            className="mt-6 max-w-xl rounded-[24px] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-navy-900/20 backdrop-blur"
          >
            <div className="flex rounded-full bg-white/10 p-1">
              {(['signup', 'signin'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${authMode === mode ? 'bg-white text-navy-900' : 'text-slate-300'}`}
                >
                  {mode === 'signup' ? 'Sign up' : 'Log in'}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email address"
                  className="h-12 w-full rounded-full border border-white/10 bg-navy-900/70 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-ocean-300"
                  required
                />
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="h-12 w-full rounded-full border border-white/10 bg-navy-900/70 px-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-ocean-300"
                minLength={6}
                required
              />
            </div>
            {authError && <p className="mt-3 text-sm text-ember-400">{authError}</p>}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="submit"
                {...buttonTap}
                disabled={authLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ocean-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {authMode === 'signup' ? 'Create account' : 'Log in with email'}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                type="button"
                {...buttonTap}
                onClick={() => signInWithGoogle()}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
              >
                Continue with Google
              </motion.button>
            </div>
          </motion.form>
        </div>

        <motion.div variants={floatOrb(0)} animate="animate" className="relative">
          <div className="glass-card-navy rounded-[28px] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-mono text-xs uppercase text-ocean-300">Live Trip Board</p>
                <h2 className="mt-1 text-2xl font-semibold">Lisbon Operations</h2>
              </div>
              <CloudSun className="h-8 w-8 text-gold-400" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                {['Arrival and Alfama walk', 'Coastal day in Cascais', 'Inquiry follow-ups'].map((item, i) => (
                  <motion.div
                    key={item}
                    custom={i}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    className="rounded-2xl border border-white/10 bg-white/8 p-4"
                  >
                    <p className="font-mono text-xs text-slate-300">Day {i + 1}</p>
                    <p className="mt-1 font-semibold">{item}</p>
                  </motion.div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-ocean-100/10">
                  <MapPin className="absolute left-8 top-8 h-5 w-5 text-ember-400" />
                  <MapPin className="absolute bottom-8 right-10 h-5 w-5 text-ocean-300" />
                  <div className="absolute inset-x-8 top-1/2 h-px bg-white/20" />
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Building2 className="h-4 w-4 text-ember-400" /> 18 ranked stays
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                    <MessageCircle className="h-4 w-4 text-emerald-500" /> 4 smart inquiries
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                    <CalendarDays className="h-4 w-4 text-gold-400" /> 3 day itinerary
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs uppercase text-slate-300">AI planning run</p>
                <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">Ready</span>
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ['Search stays', '18 options ranked'],
                  ['Build itinerary', '3 days balanced'],
                  ['Draft inquiries', '4 hosts prepared'],
                ].map(([label, value], index) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] items-center gap-3">
                    <span className="text-xs text-slate-300">{label}</span>
                    <div className="h-2 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${86 - index * 12}%` }}
                        transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
                        className="h-full rounded-full bg-ocean-300"
                      />
                    </div>
                    <span className="col-start-2 font-mono text-xs text-ocean-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <motion.a
        href="#features"
        animate={{ y: [0, 8, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ocean-300"
      >
        <ChevronDown className="h-7 w-7" />
      </motion.a>
    </section>
  );
}

export function FeatureSections() {
  const features = [
    {
      icon: Sparkles,
      title: 'Plans your entire trip in seconds',
      body: 'Retreat turns dates, preferences, and destination context into a practical day-by-day operating plan.',
      accent: 'text-ocean-500',
      mockup: <PlanTripMockup />,
    },
    {
      icon: Building2,
      title: 'Ranked properties from Booking.com and Airbnb',
      body: 'Compare price, guest fit, location, and review signals without juggling tabs during planning.',
      accent: 'text-ember-500',
      mockup: <PropertyRankingMockup />,
    },
    {
      icon: MessageCircle,
      title: 'One tap to contact any host',
      body: 'AI drafts warm, specific inquiries and routes them through WhatsApp or a ready-to-copy message.',
      accent: 'text-emerald-600',
      mockup: <InquiryMockup />,
    },
  ];

  return (
    <section id="features" className="bg-ivory-50 px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-16">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 0.45 }}
              className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              <div>
                <Icon className={`h-8 w-8 ${feature.accent}`} />
                <h2 className="mt-5 text-4xl font-semibold text-navy-800">{feature.title}</h2>
                <p className="mt-4 max-w-xl text-lg leading-8 text-navy-700">{feature.body}</p>
              </div>
              <div className="elevated-card p-5">
                {feature.mockup}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function PlanTripMockup() {
  const days = [
    ['Day 1', 'Arrive, check in, Alfama sunset walk'],
    ['Day 2', 'Belem pastries, museums, river dinner'],
    ['Day 3', 'Sintra day trip and coastal viewpoints'],
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-ivory-100 p-4">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-ocean-500" />
          <div>
            <p className="font-mono text-xs uppercase text-slate-400">Trip brief</p>
            <p className="font-semibold text-navy-800">Lisbon / 3 nights / 2 guests</p>
          </div>
        </div>
      </div>
      {days.map(([label, plan]) => (
        <div key={label} className="rounded-2xl border border-ivory-300 bg-ivory-50 p-4">
          <p className="font-mono text-xs text-ocean-500">{label}</p>
          <p className="mt-1 font-semibold text-navy-800">{plan}</p>
        </div>
      ))}
    </div>
  );
}

function PropertyRankingMockup() {
  const stays = [
    ['Airbnb', 'Chiado design loft', '$142', '96% match'],
    ['Booking.com', 'Baixa boutique hotel', '$168', '92% match'],
    ['Airbnb', 'Alfama tiled apartment', '$121', '89% match'],
  ];

  return (
    <div className="space-y-3">
      {stays.map(([platform, name, price, score], index) => (
        <div key={name} className="grid grid-cols-[84px_1fr] gap-4 rounded-2xl bg-ivory-100 p-3">
          <div className="relative overflow-hidden rounded-xl bg-ocean-100">
            <div className={`h-24 ${index === 0 ? 'bg-ocean-300' : index === 1 ? 'bg-ember-400' : 'bg-emerald-500'} opacity-80`} />
            <BedDouble className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-ivory-50 px-2 py-1 text-xs font-semibold text-navy-700">{platform}</span>
              <span className="font-mono text-xs text-emerald-600">{score}</span>
            </div>
            <p className="mt-3 truncate font-semibold text-navy-800">{name}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1 text-gold-400"><Star className="h-4 w-4 fill-current" /> 4.{9 - index}</span>
              <span className="font-mono text-lg text-navy-900">{price}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InquiryMockup() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-emerald-100 p-4">
        <p className="font-mono text-xs uppercase text-emerald-600">AI-drafted message</p>
        <p className="mt-2 text-sm leading-6 text-navy-700">
          Hi Maria, we love your Alfama apartment. Is it available for July 15-18 for two guests? We are looking for a quiet stay near transit.
        </p>
      </div>
      <div className="rounded-2xl bg-ivory-100 p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-navy-800">Host contact</span>
          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">WhatsApp ready</span>
        </div>
        <button type="button" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 font-semibold text-white">
          <Check className="h-4 w-4" /> Open in WhatsApp
        </button>
      </div>
    </div>
  );
}
