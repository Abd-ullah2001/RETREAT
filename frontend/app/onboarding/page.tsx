'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, DoorOpen, Gem, Landmark, Mountain, Palmtree, Sparkles } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';
import { buttonTap, onboardingStep } from '@/lib/animations';
import { useAuth } from '@/components/auth-provider';
import type { BudgetTier, TravelStyle } from '@/types';

const styles: Array<{ id: TravelStyle; label: string; icon: typeof Gem; description: string }> = [
  { id: 'luxury', label: 'Luxury', icon: Gem, description: 'Design hotels, private tables, polished pacing.' },
  { id: 'adventure', label: 'Adventure', icon: Mountain, description: 'Open roads, hard-to-find views, active days.' },
  { id: 'cultural', label: 'Cultural', icon: Landmark, description: 'Museums, markets, architecture, neighborhood texture.' },
  { id: 'relaxation', label: 'Relaxation', icon: Palmtree, description: 'Quiet stays, soft starts, restorative space.' },
];

const interestOptions = ['Architecture', 'Food', 'Museums', 'Nature', 'Shopping', 'Wellness', 'Nightlife', 'Local craft'];
const budgets: Array<{ id: BudgetTier; label: string; description: string }> = [
  { id: 'budget', label: 'Budget', description: 'Smart value, character stays, under $120/night.' },
  { id: 'comfort', label: 'Comfort', description: 'Balanced boutique options, $120-300/night.' },
  { id: 'luxury', label: 'Luxury', description: 'The finest in every detail, $300+/night.' },
];

export default function OnboardingPage() {
  const { session, loading, user, completeOnboarding } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name ?? '');
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('relaxation');
  const [interests, setInterests] = useState<string[]>(['Food', 'Architecture']);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('comfort');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/');
      return;
    }

    if (!loading && session && user?.onboarding_completed) {
      router.replace('/dashboard');
    }
  }, [loading, session, user, router]);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );
  };

  const finish = async (skip = false) => {
    setSaving(true);
    try {
      await completeOnboarding({
        name: name.trim() || user?.name || 'Traveler',
        travel_style: skip ? 'relaxation' : travelStyle,
        interests: skip ? ['Food', 'Architecture'] : interests,
        budget_tier: skip ? 'comfort' : budgetTier,
      });
      router.replace('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const canContinue = step !== 0 || name.trim().length > 0;

  return (
    <PageTransition>
      <div className="page-bg min-h-screen px-6 py-8">
        <header className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-display text-2xl font-semibold italic text-navy-900">Retreat</span>
          <motion.button type="button" {...buttonTap} onClick={() => finish(true)} className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-slate-400">
            <DoorOpen className="h-4 w-4" /> Exit
          </motion.button>
        </header>

        <main className="mx-auto grid min-h-[calc(100vh-96px)] max-w-5xl items-center">
          <section className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            <aside>
              <p className="eyebrow">Private directions</p>
              <h1 className="mt-4 font-body text-4xl font-bold leading-tight text-navy-900">Shape your travel profile.</h1>
              <div className="mt-8 flex gap-2">
                {[0, 1, 2, 3].map((item) => (
                  <span key={item} className={`progress-segment ${item <= step ? 'active' : ''}`} />
                ))}
              </div>
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-slate-400">Step {step + 1} of 4</p>
            </aside>

            <div className="min-h-[420px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="name" variants={onboardingStep} initial="initial" animate="animate" exit="exit">
                    <p className="eyebrow-slate">Your name</p>
                    <h2 className="mt-4 font-body text-4xl font-bold text-navy-900">What should we call you?</h2>
                    <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Abdullah" className="input-underline mt-12 max-w-xl" autoFocus />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="style" variants={onboardingStep} initial="initial" animate="animate" exit="exit">
                    <p className="eyebrow-slate">Travel style</p>
                    <h2 className="mt-4 font-body text-4xl font-bold text-navy-900">What rhythm feels right?</h2>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                      {styles.map((style) => {
                        const Icon = style.icon;
                        return (
                          <motion.button key={style.id} type="button" {...buttonTap} onClick={() => setTravelStyle(style.id)} className={`elevated-card p-5 text-left ${travelStyle === style.id ? 'border-navy-900' : ''}`}>
                            <Icon className="h-5 w-5 text-ember-500" />
                            <h3 className="mt-4 font-body text-xl font-bold text-navy-900">{style.label}</h3>
                            <p className="mt-2 text-sm leading-6 text-navy-700">{style.description}</p>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="interests" variants={onboardingStep} initial="initial" animate="animate" exit="exit">
                    <p className="eyebrow-slate">Interests</p>
                    <h2 className="mt-4 font-body text-4xl font-bold text-navy-900">What should the plan notice?</h2>
                    <div className="mt-10 flex flex-wrap gap-3">
                      {interestOptions.map((interest) => (
                        <motion.button key={interest} type="button" {...buttonTap} onClick={() => toggleInterest(interest)} className={`rounded-full border px-5 py-3 text-sm font-semibold ${interests.includes(interest) ? 'border-navy-900 bg-navy-900 text-white' : 'border-ivory-300 bg-ivory-100 text-navy-700'}`}>
                          {interest}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="budget" variants={onboardingStep} initial="initial" animate="animate" exit="exit">
                    <p className="eyebrow-slate">Budget</p>
                    <h2 className="mt-4 font-body text-4xl font-bold text-navy-900">Choose your stay range.</h2>
                    <div className="mt-10 grid gap-4">
                      {budgets.map((budget) => (
                        <motion.button key={budget.id} type="button" {...buttonTap} onClick={() => setBudgetTier(budget.id)} className={`elevated-card flex items-center justify-between gap-4 p-5 text-left ${budgetTier === budget.id ? 'border-navy-900' : ''}`}>
                          <div>
                            <h3 className="font-body text-xl font-bold text-navy-900">{budget.label}</h3>
                            <p className="mt-1 text-sm text-navy-700">{budget.description}</p>
                          </div>
                          <Compass className="h-5 w-5 text-ember-500" />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
            <motion.button type="button" {...buttonTap} onClick={() => setStep((current) => Math.max(0, current - 1))} className="btn-secondary px-6 py-3 opacity-100 disabled:opacity-0" disabled={step === 0}>
              Back
            </motion.button>
            <motion.button
              type="button"
              {...buttonTap}
              disabled={!canContinue || saving}
              onClick={step === 3 ? () => finish(false) : () => setStep((current) => Math.min(3, current + 1))}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {step === 3 ? 'Begin your journey' : 'Continue'} {saving ? <Sparkles className="h-4 w-4 animate-pulse" /> : <ArrowRight className="h-4 w-4" />}
            </motion.button>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
