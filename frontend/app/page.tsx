'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Mail, Menu, Play, Star, X } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { SessionExpiredToast } from '@/components/shared/SessionExpiredToast';

const faqs = [
  ['How does RETREAT plan trips?', 'RETREAT combines your preferences, dates, budget and destination with travel data to create a live itinerary with stays, activities and estimated costs.'],
  ['Which platforms does RETREAT use?', 'RETREAT can compare options from major travel platforms and keeps the final booking flow connected to trusted providers.'],
  ['Can I customize my itinerary?', 'Yes. Trip boards are editable, so you can swap activities, adjust days and refine the plan before booking.'],
  ['Is my payment information secure?', 'Payment happens through secure booking partners. RETREAT helps organize and compare, without storing card details in the landing flow.'],
  ['Can I get a refund?', 'Refund policies depend on the provider, fare and stay rules shown during checkout.'],
  ['Do you offer 24/7 support?', 'Yes. Active travelers can get support for changes, inquiries and trip coordination while they are on the road.'],
];

const testimonials = [
  ['RETREAT planned our 10-day Japan trip perfectly. It saved us hours of research and made our trip unforgettable!', 'Sarah J.', 'New York, USA'],
  ['The itinerary felt thoughtful, flexible and easy to change. We found stays and cafes we would have missed on our own.', 'David L.', 'London, UK'],
  ['It felt like having a patient travel planner in my pocket, especially when our dates changed at the last minute.', 'Elena R.', 'Madrid, Spain'],
];

function AuthForm({ openAuth }: { openAuth: () => void }) {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="auth-section-inline">
      <h2>Start your journey</h2>
      <p>Sign up or sign in to plan your perfect trip with AI.</p>
      <button type="button" onClick={() => signInWithGoogle()} className="mock-primary" style={{ width: '100%', marginBottom: 12 }}>
        <svg className="h-5 w-5 inline mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </button>
      <div style={{ textAlign: 'center', margin: '12px 0', color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>or</div>
      <button type="button" onClick={openAuth} className="mock-secondary" style={{ width: '100%' }}>
        <Mail size={16} className="inline mr-2" />
        Sign up with email
      </button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
        Already have an account? <button type="button" onClick={openAuth} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 900 }}>Sign in</button>
      </p>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { session, loading, user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [quote, setQuote] = useState(0);

  useEffect(() => {
    if (!loading && session && user) {
      router.replace(user.onboarding_completed ? '/dashboard' : '/onboarding');
    }
  }, [loading, session, user, router]);

  const openAuth = () => setAuthOpen(true);

  return (
    <main className="mockup-landing">
      <SessionExpiredToast />

      {/* ─── NAVBAR ─── */}
      <nav className="mock-nav">
        <Link href="#hero" className="mock-logo">
          <svg viewBox="0 0 42 24" aria-hidden="true"><path d="M4 20L21 4l17 16" /><path d="M10 20L21 10l11 10" /><path d="M16 20L21 15l5 5" /></svg>
          RETREAT
        </Link>
        <div className="mock-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Blog</a>
          <a href="#faq">Resources</a>
        </div>
        <div className="mock-actions">
          <button type="button" onClick={openAuth}>Sign in</button>
          <button type="button" className="mock-primary" onClick={openAuth}>Get started</button>
        </div>
        <button type="button" className="mock-menu" onClick={() => setMenuOpen((c) => !c)} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mock-mobile-menu">
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Blog</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>Resources</a>
          <button type="button" onClick={openAuth}>Sign in</button>
          <button type="button" className="mock-primary" onClick={openAuth}>Get started</button>
        </div>
      )}

      {/* ─── HERO: FULL-VIEWPORT VIDEO BACKGROUND ─── */}
      <section id="hero" className="mock-hero-video">
        {/* Full-screen video */}
        <video autoPlay muted loop playsInline preload="auto" className="hero-bg-video">
          <source src="/retreat-hero.webm" type="video/webm" />
          <source src="/retreat-hero.mp4" type="video/mp4" />
        </video>

        {/* RETREAT banner - plain text with mirror effect, no background */}
        <div className="hero-mirror-banner">
          <h1 className="mirror-text">RETREAT</h1>
        </div>

        {/* Decorative elements */}
        <div className="hero-plane" aria-hidden="true">
          <svg viewBox="0 0 60 60" width="60" height="60"><path d="M8 38l18-6 8-20 6 2-6 18 18 6-4 4-20-8-12 8z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </div>
        <div className="hero-balloon" aria-hidden="true" />
      </section>

      {/* ─── TRUST BADGES + STATS ─── */}
      <section className="mock-trust">
        <p>TRUSTED BY TRAVELERS WORLDWIDE</p>
        <div className="partner-row">
          {['Booking.com', 'Airbnb', 'Expedia', 'TripAdvisor', 'Skyscanner', 'Google', 'VISA'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="stat-row">
          <div>
            <Image src="/images/metric_luggage.png" alt="" width={48} height={48} unoptimized />
            <strong>25K+</strong>
            <span>Trips planned every month</span>
          </div>
          <div>
            <Image src="/images/metric_star.png" alt="" width={48} height={48} unoptimized />
            <strong>4.9/5</strong>
            <span>Rating from happy travelers</span>
          </div>
          <div>
            <Image src="/images/metric_globe.png" alt="" width={48} height={48} unoptimized />
            <strong>120+</strong>
            <span>Countries covered</span>
          </div>
        </div>
      </section>

      {/* ─── SIGN UP / SIGN IN SECTION (replacing demo video) ─── */}
      <section className="mock-auth-section">
        <div className="auth-illustration" style={{ position: 'relative', overflow: 'hidden', background: '#f0e4d4' }}>
          <Image
            src="/images/sign-up-image.png"
            alt="Traveler with backpack illustration"
            width={600}
            height={500}
            style={{ 
              objectFit: 'contain',
              width: '100%',
              height: '100%',
              minHeight: 350,
              mixBlendMode: 'multiply', 
              opacity: 0.8 
            }}
            unoptimized
          />
        </div>
        <AuthForm openAuth={openAuth} />
      </section>

      {/* ─── AI TRIP PLANNER ─── */}
      <section id="features" className="mock-features">
        <div className="feature-row">
          <div className="art-panel notebook">
            <div className="bubble">Plan a 7-day trip to Bali, for a couple in November under $2500</div>
            <div className="bubble small">Got it! Here&rsquo;s your perfect Bali trip.</div>
            <Image src="/images/bali_temple.png" alt="Bali temple illustration" width={400} height={260} style={{ objectFit: 'contain', mixBlendMode: 'multiply', opacity: 0.72, marginTop: 12 }} />
          </div>
          <div className="feature-copy">
            <span>AI TRIP PLANNER</span>
            <h2>Tell us what you want. AI handles the rest.</h2>
            <span>Just chat with RETREAT in plain English. Our AI will plan your entire trip — flights, stays, activities and more.</span>
            <ul>
              <li>✓ Personalized itineraries</li>
              <li>✓ Best-rated stays</li>
              <li>✓ Built around your preferences</li>
            </ul>
            <button type="button" onClick={openAuth}>Learn more →</button>
          </div>
        </div>
      </section>

      {/* ─── LIVE PREVIEW ─── */}
      <section className="mock-features">
        <div className="feature-row reverse">
          <div className="feature-copy">
            <span>LIVE PREVIEW</span>
            <h2>Preview your trip before you book.</h2>
            <span>See your full itinerary, places, stays and costs in one place. Make changes anytime before locking it in.</span>
            <ul>
              <li>✓ Live itinerary preview</li>
              <li>✓ Flexible & editable</li>
              <li>✓ Shared trips</li>
            </ul>
            <button type="button" onClick={openAuth}>Learn more →</button>
          </div>
          <div className="art-panel">
            <div className="itinerary">
              <div className="paper">
                <h3>Your Itinerary</h3>
                <p><span>Day 1</span> Arrive Tokyo</p>
                <p><span>Day 2</span> Explore Shibuya</p>
                <p><span>Day 3</span> Kyoto temples</p>
                <p><span>Day 4</span> Nara day trip</p>
              </div>
              <div className="map">
                <Image src="/images/itinerary_map.png" alt="Map with location pins" width={300} height={220} style={{ objectFit: 'cover', width: '100%', height: '100%', mixBlendMode: 'multiply', opacity: 0.72 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BEST STAYS & FLIGHTS ─── */}
      <section className="mock-features">
        <div className="feature-row">
          <div className="feature-copy">
            <span>BEST STAYS & FLIGHTS</span>
            <h2>Handpicked stays from top platforms.</h2>
            <span>RETREAT searches Booking.com and Airbnb to find you the best places to stay, verified by reviews and budget mapping.</span>
            <ul>
              <li>✓ Best rates, always</li>
              <li>✓ Verified reviews</li>
              <li>✓ Secure bookings</li>
            </ul>
            <button type="button" onClick={openAuth}>Explore →</button>
          </div>
          <div className="art-panel" style={{ minHeight: 300, position: 'relative', overflow: 'hidden', padding: 0 }}>
            <Image
              src="/images/property-image.png"
              alt="Curated property picks illustration"
              width={600}
              height={500}
              style={{ 
                objectFit: 'cover',
                objectPosition: '50% 50%',
                width: '100%',
                height: '100%',
                minHeight: 300,
                mixBlendMode: 'multiply', 
                opacity: 0.75 
              }}
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ─── BOOK WITH CONFIDENCE ─── */}
      <section className="mock-features">
        <div className="feature-row reverse">
          <div className="feature-copy">
            <span>BOOK WITH CONFIDENCE</span>
            <h2>We handle the details, you enjoy the journey.</h2>
            <span>Flights, stays, activities and transfers — all in one trip, managed by AI.</span>
            <ul>
              <li>✓ Secure payments</li>
              <li>✓ 24/7 trip support</li>
              <li>✓ Protection at every step</li>
            </ul>
            <button type="button" onClick={openAuth}>Learn more →</button>
          </div>
          <div className="art-panel" style={{ minHeight: 300, position: 'relative', overflow: 'hidden', padding: 0 }}>
            <Image
              src="/images/passport.png"
              alt="Passport and travel illustration"
              width={600}
              height={500}
              style={{ 
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                minHeight: 300,
                mixBlendMode: 'multiply', 
                opacity: 0.8 
              }}
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ─── HOW RETREAT WORKS ─── */}
      <section id="how-it-works" className="mock-how">
        <h2>How RETREAT works</h2>
        <div className="how-wrap">
          <div className="steps">
            {[
              ['Tell us your plan', 'Share your destination, dates, budget and preferences.'],
              ['AI builds your trip', 'Our AI creates the perfect itinerary just for you.'],
              ['Book & enjoy', 'Review, customize and book. Your adventure begins.'],
            ].map(([title, desc], i) => (
              <div key={title}>
                <b>{i + 1}</b>
                <span>
                  <strong>{title}</strong>
                  {desc}
                </span>
              </div>
            ))}
            <button type="button" className="mock-primary small" onClick={openAuth} style={{ marginTop: 8 }}>Start planning now</button>
          </div>
          <div className="art-panel" style={{ minHeight: 320, position: 'relative', overflow: 'hidden', padding: 0, borderRadius: 16 }}>
            <Image
              src="/images/trip-ui.png"
              alt="Trip planning UI dashboard"
              width={700}
              height={500}
              style={{ 
                objectFit: 'contain',
                width: '100%',
                height: '100%',
                minHeight: 320,
                mixBlendMode: 'multiply', 
                opacity: 0.85 
              }}
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ─── WHY TRAVELERS CHOOSE RETREAT ─── */}
      <section className="mock-why">
        <h2>Why travelers choose RETREAT</h2>
        <div className="why-wrap">
          <div className="agent-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <h3>Your personal AI travel agent</h3>
            <p>Always here to plan, change and perfect your trips.</p>
            <div className="compact" style={{ position: 'relative', height: 120 }}>
              <svg viewBox="0 0 220 118" width="100%" height="100%">
                <circle cx="110" cy="40" r="24" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M70 100c12-30 28-44 40-44s28 14 40 44" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M30 110c20-40 50-60 80-60s60 20 80 60" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" />
              </svg>
            </div>
            <button type="button" className="mock-primary tiny" onClick={openAuth}>Create my agent</button>
            {/* Decorative illustration overlay */}
            <div style={{ position: 'absolute', bottom: -10, right: -10, opacity: 0.12, width: 120, height: 80 }}>
              <Image src="/images/illustrations-1.png" alt="" fill style={{ objectFit: 'contain' }} unoptimized />
            </div>
          </div>
          <div className="benefits">
            {[
              ['Your personal AI travel agent', 'Smart recommendations tailored to you.'],
              ['Real-time Updates', 'We monitor changes so you do not have to.'],
              ['24/7 Support', 'Always here when you need us.'],
              ['All-in-One', 'Flights, stays, activities and more.'],
            ].map(([title, desc]) => (
              <div key={title}>
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" /></svg>
                <span>
                  <strong>{title}</strong>
                  {desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="mock-testimonial">
        <p>Trusted by explorers around the world</p>
        <div className="quote-card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Decorative illustration background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}>
            <Image src="/images/illustrations-2.png" alt="" fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
          <button type="button" onClick={() => setQuote((quote + testimonials.length - 1) % testimonials.length)} aria-label="Previous testimonial"><ChevronLeft size={16} /></button>
          <AnimatePresence mode="wait">
            <motion.div key={quote} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} style={{ position: 'relative', zIndex: 1 }}>
              <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} />)}</div>
              <blockquote>“{testimonials[quote][0]}”</blockquote>
              <strong>{testimonials[quote][1]}</strong>
              <span>{testimonials[quote][2]}</span>
            </motion.div>
          </AnimatePresence>
          <button type="button" onClick={() => setQuote((quote + 1) % testimonials.length)} aria-label="Next testimonial"><ChevronRight size={16} /></button>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="mock-faq">
        <h2>Frequently asked questions</h2>
        <div>
          {faqs.map(([question, answer], index) => (
            <article key={question}>
              <button type="button" onClick={() => setFaqOpen(faqOpen === index ? null : index)}>
                <span>{question}</span>
                {faqOpen === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {faqOpen === index && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{answer}</motion.p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section id="pricing" className="mock-cta" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background illustration */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
          <Image src="/images/illustrations-2.png" alt="" fill style={{ objectFit: 'cover' }} unoptimized />
        </div>
        <div className="compact" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M30 60l20-30 20 30" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2>Ready for your next adventure?</h2>
          <p>Let us plan your perfect trip today.</p>
          <div>
            <button type="button" className="mock-primary" onClick={openAuth}>Plan my trip</button>
            <button type="button" className="mock-secondary" onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
          </div>
        </div>
        <div className="van" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
          <svg viewBox="0 0 100 60" width="100%" height="100%">
            <rect x="10" y="20" width="70" height="25" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M10 20c8-14 20-16 40-12 14 3 24 4 30 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="30" cy="50" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="65" cy="50" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="mock-footer" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 40, right: 20, opacity: 0.06, width: 150, height: 100, pointerEvents: 'none' }}>
          <Image src="/images/illustrations-1.png" alt="" fill style={{ objectFit: 'contain' }} unoptimized />
        </div>
        <div>
          <strong>
            <svg viewBox="0 0 42 24" aria-hidden="true" width="42" height="24"><path d="M4 20L21 4l17 16" /><path d="M10 20L21 10l11 10" /><path d="M16 20L21 15l5 5" /></svg>
            RETREAT
          </strong>
          <p>AI trip planning made effortless.</p>
        </div>
        <div>
          <h3>Product</h3>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">Resources</a>
        </div>
        <div>
          <h3>Company</h3>
          <a href="#pricing">Pricing</a>
          <a href="#testimonials">Blog</a>
          <a href="#faq">Careers</a>
          <a href="#faq">Contact</a>
        </div>
        <div>
          <h3>Resources</h3>
          <a href="#faq">Documentation</a>
          <a href="#faq">Help Center</a>
        </div>
        <div>
          <h3>Legal</h3>
          <a href="#faq">Terms of service</a>
          <a href="#faq">Privacy policy</a>
        </div>
        <div className="copyright">
          <span>© 2024 Retreat. All rights reserved.</span>
          <span>Social icons</span>
        </div>
      </footer>

      {/* Auth Modal (for email sign-up) */}
      <AnimatePresence>
        {authOpen && (
          <AuthModalInline isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function AuthModalInline({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signUpWithEmail(email, password);
      setSignupSuccess(true);
      setPassword('');
      setAuthMode('signin');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Signup failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign in failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-[#2B2927]/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        className="relative w-full max-w-md bg-[var(--paper)] sketch-card p-6 md:p-8 z-10"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-[var(--ink)]" aria-label="Close"><X size={20} /></button>
        <div className="flex justify-center mb-4">
          <span className="font-display text-2xl font-bold tracking-wider text-[var(--ink)]">RETREAT</span>
        </div>
        <h2 className="font-display text-xl font-bold text-center text-[var(--ink)] mb-1">
          {authMode === 'signup' ? 'Create your agent' : 'Welcome back'}
        </h2>
        <p className="text-sm text-[var(--muted)] text-center mb-5">Start planning your perfect journey.</p>

        <button type="button" onClick={() => signInWithGoogle()} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[var(--ink)] font-semibold text-sm text-[var(--ink)] py-3 px-4 rounded-full shadow-[2px_2px_0px_0px_var(--ink)] hover:shadow-[3px_3px_0px_0px_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Continue with Google
        </button>

        <div className="relative my-5 flex items-center">
          <div className="flex-1 border-t border-[var(--ink)]/10" />
          <span className="px-3 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">or</span>
          <div className="flex-1 border-t border-[var(--ink)]/10" />
        </div>

        {signupSuccess && (
          <p className="text-xs font-semibold text-green-700 text-center mb-2">Account created! You can now sign in below.</p>
        )}
        <form onSubmit={authMode === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 w-full bg-white border-2 border-[var(--ink)] rounded-full px-4 text-sm text-[var(--ink)] outline-none" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="h-12 w-full bg-white border-2 border-[var(--ink)] rounded-full px-4 text-sm text-[var(--ink)] outline-none" required />
          {authError && <p className="text-xs font-semibold text-red-600">{authError}</p>}
          <button type="submit" disabled={authLoading} className="w-full bg-[var(--sage)] hover:bg-[#3d5a46] text-white font-bold py-3 px-4 rounded-full border-2 border-[var(--sage)] transition-colors text-sm uppercase tracking-wider">
            {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Start Planning' : 'Log In'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <span className="text-[var(--muted)]">
            {authMode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button type="button" onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} className="font-bold text-[var(--sage)] hover:underline">
            {authMode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}