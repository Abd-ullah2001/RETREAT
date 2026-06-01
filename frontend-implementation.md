# Retreat — Frontend Implementation Plan
### World-Class AI Travel Operations Platform UI

---

## HOW TO READ THIS DOCUMENT

- `[YOU]` — Human does this manually
- `[AI]` — Antigravity builds this completely

**Rules for the AI agent before starting:**
- Never use purple gradients, neon colors, black backgrounds, or generic SaaS patterns
- Every page transition uses Framer Motion AnimatePresence — non-negotiable
- Color system defined once in `tailwind.config.ts` — never use ad-hoc hex codes in components
- All API calls go through `lib/api.ts` only — never raw fetch/axios in components
- Never use `useEffect` to fetch data — use TanStack Query hooks exclusively
- Leaflet map must always load with `dynamic()` and `ssr: false` — never import directly
- Every interactive element has Framer Motion `whileHover` and `whileTap` — no exceptions
- Typography hierarchy: `Playfair Display` (editorial headings), `DM Sans Bold` (onboarding/question headings), `DM Sans` (body), `DM Mono` (data/numbers)
- The app is light-themed — warm ivory/cream backgrounds, deep navy text, ember orange accents
- Never build a "chatbot in the center" layout — this is a travel operations platform
- Page backgrounds are flat `ivory-50` (#FDFCF8) — no gradient mesh — clean like the Stitch design
- Ember orange (`#D4622A`) is the ONLY accent color on primary CTAs — used sparingly
- Remove `FloatingOrbs` from dashboard and inner app pages — orbs are landing page only

---

## DESIGN IDENTITY

**The feeling:** Condé Nast Traveller meets Stripe. Editorial luxury meets operational clarity.

**Reference:** The Stitch designs approved by the founder — warm cream backgrounds, editorial serif headings, ember orange CTAs, generous whitespace, photo-first cards, bottom-border-only inputs on forms.

**NOT:** Dark mode. Purple gradients. Neon. Generic SaaS admin panels. Cluttered dashboards.

**Mental model:** A luxury travel atelier that happens to be software. Every screen should feel like it belongs in a premium print magazine that came to life.

---

## DESIGN TOKENS

Define exactly in `tailwind.config.ts`. Never deviate.

```ts
colors: {
  ivory: {
    50:  '#FDFCF8',   // ALL page backgrounds — flat, no gradient
    100: '#F8F5EE',   // card backgrounds
    200: '#F0EBE0',   // subtle borders, dividers
    300: '#E3DAC9',   // stronger borders, input borders
  },
  navy: {
    900: '#0D1B2A',   // primary text, wordmark
    800: '#1B2D42',   // headings
    700: '#243B55',   // secondary text
    600: '#2E5077',   // links
    500: '#3A6FA8',   // interactive navy
  },
  ocean: {
    500: '#1A7FA8',   // secondary actions, map elements
    400: '#2E9DC7',   // hover
    300: '#56B8D8',   // light accent
    100: '#E0F4FB',   // light blue bg
  },
  ember: {
    500: '#D4622A',   // PRIMARY CTA color — buttons, eyebrow labels, highlights
    400: '#E07A48',   // hover state
    100: '#FAE8DF',   // light ember bg
  },
  emerald: {
    600: '#1A7A5E',   // success, sent status
    500: '#22A07A',   // active states, WhatsApp button
    100: '#D6F5EC',   // light bg
  },
  gold: {
    400: '#C9A84C',   // star ratings, premium accents
    100: '#F5EDD3',   // light gold bg
  },
  slate: {
    400: '#94A3B8',   // muted text, eyebrow labels (non-ember)
    300: '#CBD5E1',   // disabled states
    200: '#E2E8F0',   // skeleton base
  }
}
```

---

## TYPOGRAPHY SYSTEM

```ts
// app/layout.tsx
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic']
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500']
})
```

Usage rules — strictly enforced:
- `font-display` (Playfair Display) — landing page hero, section titles, destination names, dashboard greeting, trip names
- `font-body font-bold` (DM Sans 700) — onboarding question headings, large bold UI headings where editorial feel is NOT needed
- `font-body` (DM Sans 400/500) — all body text, labels, buttons, nav links, form inputs
- `font-mono` (DM Mono) — prices, dates, coordinates, counters, status codes, eyebrow labels (uppercase)

---

## FRAMER MOTION ANIMATION LIBRARY

**File:** `lib/animations.ts` — define ALL variants here. Never write inline variants.

```ts
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } }
}

export const cardVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }),
  hover: { y: -4, transition: { duration: 0.2, ease: 'easeOut' } }
}

export const slideFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08, duration: 0.35 }
  })
}

export const slideFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }
}

export const swipeLeft = {
  exit: { x: -320, rotate: -12, opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }
}

export const swipeRight = {
  exit: { x: 320, rotate: 12, opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }
}

export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: { repeat: Infinity, duration: 1.8, ease: 'linear' }
  }
}

export const floatOrb = (delay: number) => ({
  animate: {
    y: [0, -18, 0], x: [0, 12, 0],
    transition: { repeat: Infinity, duration: 7 + delay, ease: 'easeInOut', delay }
  }
})

export const buttonTap = { whileTap: { scale: 0.96 }, whileHover: { scale: 1.02 } }
export const magneticHover = { whileHover: { scale: 1.04, y: -2 } }

export const modalSlideUp = {
  initial: { opacity: 0, y: 60, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  exit: { opacity: 0, y: 40, scale: 0.97, transition: { duration: 0.2 } }
}

export const drawerSlideUp = {
  initial: { y: '100%' },
  animate: { y: 0, transition: { type: 'spring', stiffness: 280, damping: 30 } },
  exit: { y: '100%', transition: { duration: 0.25 } }
}

export const onboardingStep = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } }
}

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
}
```

---

## CSS UTILITY CLASSES

**File:** `app/globals.css`

```css
/* Page background — flat ivory, no gradient */
.page-bg {
  background: #FDFCF8;
}

/* Cards */
.elevated-card {
  background: #FDFCF8;
  border: 1px solid #E3DAC9;
  box-shadow: 0 2px 8px rgba(13, 27, 42, 0.06), 0 1px 2px rgba(13, 27, 42, 0.04);
  border-radius: 20px;
}

.elevated-card-hover {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.elevated-card-hover:hover {
  box-shadow: 0 12px 40px rgba(13, 27, 42, 0.12), 0 4px 12px rgba(13, 27, 42, 0.06);
  transform: translateY(-2px);
}

/* Photo card — image fills top, content below */
.photo-card {
  background: #FDFCF8;
  border: 1px solid #E3DAC9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(13, 27, 42, 0.08);
}

/* Glass navbar */
.glass-nav {
  background: rgba(253, 252, 248, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(227, 218, 201, 0.7);
}

/* Section divider */
.section-divider {
  border: none;
  border-top: 1px solid #E3DAC9;
}

/* Eyebrow label — ember orange, uppercase, mono */
.eyebrow {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #D4622A;
}

/* Eyebrow label — slate variant */
.eyebrow-slate {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94A3B8;
}

/* Bottom-border input (onboarding style) */
.input-underline {
  background: transparent;
  border: none;
  border-bottom: 1.5px solid #E3DAC9;
  border-radius: 0;
  padding: 12px 4px;
  font-family: var(--font-body);
  font-size: 18px;
  color: #0D1B2A;
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease;
}
.input-underline:focus {
  border-bottom-color: #0D1B2A;
}
.input-underline::placeholder {
  color: #CBD5E1;
}

/* Standard boxed input */
.input-box {
  background: #F8F5EE;
  border: 1px solid #E3DAC9;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #0D1B2A;
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.input-box:focus {
  border-color: #0D1B2A;
  box-shadow: 0 0 0 3px rgba(13, 27, 42, 0.06);
}

/* Primary CTA button */
.btn-primary {
  background: #D4622A;
  color: white;
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: 8px;
  padding: 12px 28px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  letter-spacing: 0.02em;
}
.btn-primary:hover { background: #E07A48; }

/* Secondary button */
.btn-secondary {
  background: #F0EBE0;
  color: #0D1B2A;
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: 8px;
  padding: 12px 28px;
  border: 1px solid #E3DAC9;
  cursor: pointer;
}

/* Dark pill button — from onboarding */
.btn-dark {
  background: #0D1B2A;
  color: white;
  font-family: var(--font-body);
  font-weight: 500;
  border-radius: 8px;
  padding: 14px 40px;
  border: none;
  cursor: pointer;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 13px;
}

/* Image scrim — gradient overlay on photo cards */
.photo-scrim {
  background: linear-gradient(to top, rgba(13, 27, 42, 0.72) 0%, rgba(13, 27, 42, 0.1) 50%, transparent 100%);
}

/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(90deg, #E3DAC9 25%, #F0EBE0 50%, #E3DAC9 75%);
  background-size: 400% 100%;
  border-radius: 8px;
}

/* Dark section bg */
.section-dark {
  background: #0D1B2A;
}

/* Progress bar segments (onboarding) */
.progress-segment {
  height: 2px;
  background: #E3DAC9;
  border-radius: 2px;
  flex: 1;
  transition: background 0.3s ease;
}
.progress-segment.active {
  background: #0D1B2A;
}
```

---

## SHARED COMPONENTS

### `components/shared/Navbar.tsx` [AI]

**Landing page variant (transparent → glass on scroll):**
- Height: `64px`
- Default: transparent background
- On scroll past 80px: transitions to `glass-nav` CSS class using Framer Motion `useScroll`
- Left: "Retreat" wordmark — `font-display`, italic, `text-2xl`, `navy-900`
- Center: Nav links — "Discovery", "Accommodations", "Itinerary", "Journal" — `font-body`, `text-sm`, `slate-400`, uppercase, `tracking-widest`
- Right: "Start Planning" CTA — `btn-primary` class, small size
- Mobile: hide center links, show hamburger

**App variant (always visible, always glass):**
- Always `glass-nav` background — no transparent state
- Left: "Retreat" wordmark
- Center: "Discover", "My Trips", "Inquiries" — nav links
- Right: User avatar (32px circle, from Supabase), sign out option on click

### `components/shared/PageWrapper.tsx` [AI]
- `motion.div` with `pageVariants`
- Background: `page-bg` class (flat ivory)
- `min-h-screen`

### `components/shared/SkeletonCard.tsx` [AI]
- `skeleton` CSS class with `shimmer` animation
- Match height/radius of the card it replaces

### `components/shared/StatusBadge.tsx` [AI]
- `draft` → `gold-100` bg, `gold-400` text
- `sent` → `emerald-100` bg, `emerald-600` text
- `planning` → `ocean-100` bg, `ocean-500` text
- `active` → `ember-100` bg, `ember-500` text
- `completed` → `slate-200` bg, `slate-400` text
- `scaleIn` animation on mount. Pulse dot for `active`.

### `components/shared/AnimatedCounter.tsx` [AI]
- `useMotionValue` + `animate()` + `useInView`
- `font-mono`, large
- Triggers only when in viewport

---

## PAGE 1 — LANDING PAGE [AI]

**File:** `app/page.tsx`

Follows the approved Stitch design exactly. Warm cream editorial aesthetic.

### Navbar
- Use transparent → glass scroll variant
- Links: "Discovery", "Accommodations", "Itinerary", "Journal"
- CTA: "Start Planning" — `ember-500` background, white text

### Section 1 — Hero

Full viewport height. Background: full-bleed travel photography (use a high-quality Unsplash URL as placeholder — a Mediterranean coastal scene).

Over the image: dark scrim `linear-gradient(to bottom, rgba(13,27,42,0.3) 0%, rgba(13,27,42,0.55) 100%)`

Content — left-aligned, centered vertically, `max-w-2xl`, `pl-16`:
- Eyebrow: "PRIVATE DIRECTIONS" — `eyebrow` CSS class, white
- Hero headline:
  ```
  Your travel,
  orchestrated.
  ```
  Font: `font-display`, `text-7xl`, white, `font-normal`. "orchestrated." on second line, italic.
- CTA button: "START YOUR JOURNEY" — `btn-primary`, rounded-lg, `mt-8`, `buttonTap` animation
- All text animates in with `fadeUp` variant, staggered

Right side — floating dashboard preview card:
- `glass-card-navy` style: `background: rgba(13,27,42,0.75)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.12)`, `border-radius: 20px`, padding `p-5`
- Shows miniature trip UI:
  - Small header: "Santorini, Greece · Jun 12–19" in `font-mono`, white, small
  - Two mini property cards (just image + name + price, 100px tall each)
  - Small 3-step itinerary timeline (Day 1, Day 2, Day 3 as dots connected by line)
- Floats with `floatOrb(0)` subtle y animation
- Animates in from right with `slideFromRight`, delay `0.5s`

Scroll chevron: animated bounce at bottom center, white, fades on scroll via `useScroll`

### Section 2 — Discovery

Background: `ivory-50`. Padding: `py-24 px-16`.

Header row (space-between):
- Left: "Discovery" — `font-display`, `text-4xl`, `navy-900`
- Left below: Body text — "Discover destinations curated by local artisans and architectural visionaries. Every location is a masterpiece of intentionality." — `font-body`, `slate-400`, `max-w-xs`
- Right: "VIEW ALL DESTINATIONS →" — `eyebrow-slate` class, link

Photo grid — two large cards side by side:
- Each card: `photo-card` CSS class
- Image fills top 65% of card
- Bottom 35%: destination name (`font-display`, `lg`, `navy-800`) + subtitle (`slate-400`, `sm`)
- Hover: image scales to `scale(1.03)` smoothly — `transition: transform 0.4s ease` on the `img`
- Cards animate in with `cardVariants` stagger

### Section 3 — Interactive Mapping

Background: `ivory-50`. Two columns 50/50. Padding `py-24`.

Left column:
- Eyebrow: "// ITINERARY" — `eyebrow-slate`
- Headline: "Interactive Mapping." — `font-display`, `text-5xl`, `navy-900`
- Body text about map features
- Three feature rows with icons:
  - "The Route Passage"
  - "Old Road Management"
  - "Atelier Architectural Survey"
  - Each row: icon (Lucide) + label in `font-body`, `navy-700`
  - Each animates in with `slideFromLeft` stagger

Right column:
- Actual Leaflet map (dynamic import, ssr: false)
- CartoDB Voyager tiles
- Height: `400px`, `border-radius: 16px`
- Show a sample route line on the map using Leaflet Polyline
- Two sample markers (use Rome coordinates as default)
- No controls shown (zoomControl: false, attributionControl: false)

### Section 4 — Atelier Accommodations

Background: `ivory-50`. Centered. Padding `py-24`.

Header: "Atelier Accommodations." — `font-display`, `text-5xl`, `navy-900`, `text-center`, `mb-16`

Three property cards in a row (`grid-cols-3`). Each card:
- `photo-card` CSS class
- Image top 55%
- Content bottom 45%: property name (`font-display`, `lg`), rating row (gold stars + `font-mono` number), price (`font-mono`, `xl`, `navy-900`), one-line description (`slate-400`, `sm`)
- Platform badge top-left corner of image: "BOOKING" or "AIRBNB" — `eyebrow` class, white, small chip with semi-transparent dark background
- "EXPLORE →" button at bottom — `btn-dark` class but smaller, `buttonTap`
- Cards animate in with `cardVariants` stagger

### Section 5 — Intelligence Dark Section

Background: `section-dark` (`navy-900`). Full width. Padding `py-24 px-16`.

Two columns:

Left column:
- Eyebrow: "THE OPERATIVE PLAN" — `eyebrow` class but white
- Headline: "Intelligence behind the experience." — `font-display`, `text-5xl`, white, italic on "experience."
- Two feature blocks below:
  - **Dynamic Logistics**: title in `font-body font-semibold` white, description `slate-400`
  - **Preference Learning**: same styling
- Each block animates in with `fadeUp`

Right column:
- Large circular radar/compass graphic
- SVG: concentric circles, subtle `navy-700` stroke, center sparkle icon in `ember-500`
- Animate: outer ring slowly rotates — `animate={{ rotate: 360 }}`, `transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}`

### Section 6 — Sophisticated Concierge

Background: `ivory-50`. Centered. Padding `py-24`.

Header:
- "Sophisticated Concierge" — `font-display`, `text-5xl`, `navy-900`, `text-center`
- Subtitle: "A digital concierge that learns your language, live with refined intelligence serving your every request." — `slate-400`, `text-center`, `max-w-lg`, `mx-auto`

Chat preview card:
- `elevated-card`, `max-w-2xl`, `mx-auto`, `mt-12`
- Top bar: green dot + "WhatsApp Preview" label, "OPEN" button in `ember-500`
- Chat bubble area: two message bubbles
  - Outgoing (right aligned): AI-drafted inquiry message in white bubble on `emerald-500` background
  - Property host reply (left aligned): grey bubble, `ivory-200` background
- Bottom input bar: `input-box` with send icon

### Section 7 — Testimonial

Background: `ivory-50`. Centered. Padding `py-24 px-16`.

- Large quotation mark: `font-display`, `text-9xl`, `ember-500`, line-height 0, decorative
- Quote text: "Retreat has redefined the very concept of agency. It isn't just about the booking; it's the invisible orchestration of time and space that makes every journey feel inevitable." — `font-display`, `text-3xl`, `navy-800`, `max-w-3xl`, `mx-auto`, italic
- Attribution: name + title — `font-mono`, `slate-400`, `text-sm`, `mt-8`
- Animate with `fadeUp` on viewport enter using `useInView`

### Section 8 — Ready to Begin

Background: `ivory-50`. Centered. Padding `py-24`.

- Headline: "Ready to begin?" — `font-display`, `text-5xl`, `navy-900`
- Subtitle — `slate-400`
- Two buttons:
  - "START FOR FREE" — `btn-primary`, `buttonTap`
  - "WATCH DEMO" — `btn-secondary`, `buttonTap`

### Footer

Background: `ivory-200`. Padding `py-12 px-16`.
- Left: "Retreat" wordmark + "© 2024 Retreat Atelier" — `font-mono`, `slate-400`, `text-xs`
- Right: "Privacy" + "Terms" — `font-body`, `slate-400`, `text-sm`
- Horizontal rule above footer: `section-divider`

---

## PAGE 2 — ONBOARDING [AI]

**File:** `app/onboarding/page.tsx`

**When shown:** After first Google OAuth login. Check `users.onboarding_completed` field. If false → redirect here before dashboard. If already completed → skip to dashboard.

**Route guard:** Implement in `middleware.ts` — authenticated users with `onboarding_completed = false` are redirected to `/onboarding`.

**Layout:** Full viewport. Background: flat `ivory-50`. Centered content. No navbar.

**Header (fixed top):**
- Left: "Retreat" wordmark — `font-display`, italic, `navy-900`, `text-xl`
- Center: Progress segments — 4 horizontal bars, 2px height, `max-w-xs`, gap `8px`
  - Active segment: `navy-900` background
  - Inactive: `ivory-300` background
  - Animate active segment with smooth `background` transition
- Right: "EXIT" — `font-mono`, `text-sm`, `slate-400`, uppercase, `tracking-widest`. On click: mark `onboarding_completed = true` with defaults → redirect to `/dashboard`

**Content area:** Vertically and horizontally centered. `max-w-lg`.

Each step uses `AnimatePresence` with `mode="wait"` and `onboardingStep` variant for slide transitions between steps.

---

### Step 1 — Name

- Eyebrow: "INTRODUCTION" — `eyebrow` CSS class (ember orange)
- Question: "What should we call you?" — `font-body font-bold`, `text-6xl`, `navy-900`
- Input: `input-underline` CSS class — bottom border only, large, placeholder "Full name"
- Autofocus on mount
- Continue button: `btn-dark` class, "CONTINUE", `buttonTap`
- On submit: store name in local step state, advance to step 2

---

### Step 2 — Travel Style

- Eyebrow: "YOUR STYLE" — `eyebrow` CSS class
- Question: "How do you like to travel?" — `font-body font-bold`, `text-5xl`, `navy-900`
- Four style cards in a 2×2 grid:

  Each card (`photo-card` style, `cursor-pointer`):
  - Background image representing the style
  - Dark scrim overlay
  - Style name in white `font-display`, italic, centered
  - On select: card gets `ring-2 ring-ember-500` border + checkmark overlay (`scaleIn`)
  - Only one selectable at a time
  - `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`

  Cards:
  - **Luxury** — use a hotel suite image
  - **Adventure** — use a mountain/hiking image
  - **Cultural** — use a museum/city image
  - **Relaxation** — use a beach/spa image

- Continue button below grid: `btn-dark`, "CONTINUE", `buttonTap`

---

### Step 3 — Interests

- Eyebrow: "INTERESTS" — `eyebrow` CSS class
- Question: "What excites you most?" — `font-body font-bold`, `text-5xl`, `navy-900`
- Subtitle: "Select all that apply" — `font-mono`, `slate-400`, `text-sm`
- Activity chips in a wrapping flex row:

  Each chip:
  - `elevated-card` style, `px-5 py-3`, `rounded-full`, `cursor-pointer`
  - Icon (Lucide) + label in `font-body`, `navy-800`
  - On select: background becomes `navy-900`, text white, icon white
  - Multi-select — any number can be selected
  - `whileTap={{ scale: 0.94 }}`
  - Animate in with `cardVariants` stagger

  Chips: 🍽 Food & Dining, 🥾 Hiking, 🏛 Art & Culture, 🌙 Nightlife, 🏖 Beaches, 📜 History, 🛍 Shopping, 🧘 Wellness, 📸 Photography, 🎭 Theatre, 🏊 Water Sports, 🚴 Cycling

- Continue button: `btn-dark`, "CONTINUE"

---

### Step 4 — Budget

- Eyebrow: "BUDGET" — `eyebrow` CSS class
- Question: "What's your usual travel budget?" — `font-body font-bold`, `text-5xl`, `navy-900`
- Three budget cards in a row:

  Each card (`elevated-card` + `elevated-card-hover`, `cursor-pointer`):
  - Top: icon (Lucide: Wallet/CreditCard/Diamond)
  - Budget tier name: `font-display`, `xl`, `navy-800`
  - Price range: `font-mono`, `slate-400`, `sm`
  - Description: `font-body`, `slate-400`, `sm`
  - On select: `ring-2 ring-navy-900` + `navy-900` checkmark top-right corner (`scaleIn`)
  - Only one selectable

  Cards:
  - **Budget** · Under $100/night · "Smart spending, rich experiences"
  - **Comfort** · $100–$300/night · "Quality without compromise"
  - **Luxury** · $300+/night · "The finest in every detail"

- Final button: "BEGIN YOUR JOURNEY" — `btn-primary`, full width, `buttonTap`
- On submit:
  - PATCH `/api/v1/auth/me` with `{ name, travel_style, interests, budget, onboarding_completed: true }`
  - Update Supabase `users` table
  - Redirect to `/dashboard` with `pageVariants` transition

---

### Supabase schema update for onboarding [YOU]

Run this in Supabase SQL Editor:

```sql
ALTER TABLE users
  ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN travel_style TEXT,
  ADD COLUMN interests TEXT[],
  ADD COLUMN budget_tier TEXT CHECK (budget_tier IN ('budget', 'comfort', 'luxury'));
```

---

## PAGE 3 — DASHBOARD [AI]

**File:** `app/dashboard/page.tsx`

The dashboard follows the same editorial warmth as the landing page and onboarding. Clean, generous, photo-first.

### Layout

Background: `page-bg` (flat `ivory-50`). Navbar fixed top (app variant). Content starts `pt-20`.
Max content width: `max-w-6xl mx-auto px-8`.

### Top Section

Two rows:

**Row 1 — Greeting + date:**
- Left: "Good morning, [name]" — `font-display`, `text-4xl`, `font-normal`, `navy-800`
  - "name" pulled from Supabase user profile. If onboarding was skipped, show "traveler"
- Right: Current date — `font-mono`, `text-sm`, `slate-400`, uppercase

**Row 2 — Section label + CTA:**
- Left: eyebrow label "YOUR JOURNEYS" — `eyebrow-slate`
- Right: "NEW TRIP +" — `btn-primary`, small, `buttonTap`

`section-divider` below the two rows.

### Stats Strip

3 stats in a horizontal row. No card backgrounds — just bare numbers and labels with dividers between them. Like a magazine editorial stat block.

Each stat:
- Large number: `AnimatedCounter`, `font-mono`, `text-5xl`, `navy-900`
- Label below: `font-body`, `text-sm`, `slate-400`, uppercase, `tracking-wider`

Stats: "TRIPS PLANNED" · "INQUIRIES SENT" · "PLACES SAVED"

Dividers: `1px solid #E3DAC9` between each stat (vertical).

Animate in with `fadeUp` stagger.

### Search Form

`elevated-card`, `p-8`, `mt-10`.

Header:
- Eyebrow: "PLAN A TRIP" — `eyebrow` CSS class
- Title: "Where are you going?" — `font-display`, `text-3xl`, `navy-900`

Form layout — horizontal on desktop, stacked on mobile:

**Destination input:**
- `input-box` CSS class, large, placeholder "Destination"
- Search icon (Lucide `MapPin`) inside, `slate-400`
- 300ms debounce → Nominatim autocomplete
- Dropdown: `elevated-card`, absolute, `z-50`
- Each result: place name + flag. Click to select.
- Dropdown animates with `scaleIn`

**Check-in / Check-out:**
- Two `input-box` date inputs side by side
- Labels above: `eyebrow-slate` style
- Min: today

**Guests stepper:**
- Label: "GUESTS" — `eyebrow-slate`
- `-` / number / `+` — minimal style, `whileTap={{ scale: 0.9 }}`
- Min 1, max 16

**Submit:**
- `btn-primary`, "SEARCH & PLAN →", full width on mobile
- Loading: replaces text with spinning Lucide `Loader2` icon
- On submit: `POST /api/v1/trips` → navigate to `/trip/[id]`

### My Trips Grid

Header row: "Your Trips" — `font-display`, `text-2xl`, `navy-800`

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap `24px`

Each `TripCard` — photo-first, like the Discovery section on the landing page:
- `photo-card` CSS class, `cursor-pointer`
- Top 60%: destination photo (if no photo, show a warm gradient placeholder: `linear-gradient(135deg, #E3DAC9, #F8F5EE)` with destination initial centered)
- Bottom 40% (`p-4`):
  - Destination name: `font-display`, `text-xl`, `navy-800`
  - Dates: `font-mono`, `text-sm`, `slate-400`
  - Bottom row: `StatusBadge` + "View →" link in `ember-500`
- `cardVariants` stagger
- `elevated-card-hover` — lifts on hover

**Empty state** (no trips yet):
- Single card, dashed `ivory-300` border, centered content
- "Plan your first trip" — `font-display`, `text-xl`, `slate-400`
- "+" icon, large, `slate-300`
- Click navigates to the search form (smooth scroll)

---

## PAGE 4 — TRIP DETAIL [AI]

**File:** `app/trip/[tripId]/page.tsx`

Three-column layout. Background: `page-bg`.

### Layout

Full viewport minus navbar. Three fixed-height columns with internal scroll:
- Left: `w-[380px]` — Property Stack
- Middle: `flex-1` — Itinerary Panel
- Right: `w-[320px]` — Map

Mobile: single column, tab switcher at top (Properties / Itinerary / Map)

### Left Panel — Property Stack

**Header:**
- "Find your stay" — `font-display`, `xl`, `navy-800`
- Property count: `font-mono`, `text-sm`, `slate-400`
- Filter pills: "All" · "Booking.com" · "Airbnb"
  - Active: `navy-900` bg, white text
  - Inactive: `ivory-200` bg, `navy-700` text

**`PropertyStack` component:**
- Stack of cards — current card on top, ghost of next card visible 8px below
- Drag left/right with `useDragControls` + `useMotionValue` x
- Right drag: card tints `emerald-100`, ❤️ icon fades in
- Left drag: card tints `ember-100`, ✕ icon fades in
- Release at 100px threshold: fires `swipeRight` or `swipeLeft` exit animation
- Next card rises from behind with spring

**`PropertyCard`:**
- `photo-card` CSS class
- Image: top 52%, `next/image`, `object-cover`
- Platform badge: top-left of image — `eyebrow` class, white, small, `bg-black/40 px-2 py-1 rounded`
- Review count: top-right of image — `font-mono`, white, small
- Content (48%): `p-4`
  - Name: `font-display`, `text-lg`, `navy-800`
  - Address: `font-body`, `text-sm`, `slate-400`, MapPin icon
  - Rating: gold stars + `font-mono` review count
  - Price: `font-mono`, `text-2xl`, `navy-900` + "/night" `slate-400`
  - Amenity chips: `ivory-200` bg, `navy-700` text, `text-xs`, `rounded-full`
  - "View listing →" — `ember-500` text, `text-sm`
- `whileHover={{ scale: 1.01 }}`

**Action buttons:**
- Two circles, 56px diameter
- Left ✕: `ivory-200` bg, `slate-600` icon — `whileTap={{ scale: 0.88 }}`
- Right ❤️: `ember-500` bg, white icon — `whileTap={{ scale: 0.88 }}`
- Keyboard: ← skip, → interested

**Progress dots:**
- Active dot: `ember-500`, `w-6 h-2`
- Inactive: `slate-300`, `w-2 h-2`
- `layout` prop on active dot for smooth position animation

### Middle Panel — Itinerary

**Header:**
- "Your Itinerary" — `font-display`, `xl`, `navy-800`
- "Generate Plan" — `btn-primary`, small

**AI loading state:**
- Eyebrow: "AI IS WORKING" — `eyebrow` CSS class
- Animated text cycles: "Analyzing activities..." → "Ranking properties..." → "Building your days..."
- `AnimatePresence mode="wait"`, `onboardingStep` variant, 2-second interval
- 3 `skeleton` placeholder blocks below

**`ItineraryDay` card:**
- `elevated-card`, left border `3px solid ember-500`
- Header: "Day 1 — Mon 15 Jul" (`font-display`, `lg`) + theme chip (`gold-100` bg, `gold-400` text)
- Three slots: ☀️ Morning · 🌤 Afternoon · 🌙 Evening
  - Activity name: `font-body font-medium`, `navy-800`
  - AI note: `font-body`, `slate-400`, `text-sm`, italic
- Meal row: fork icon + `font-body`, `slate-400`, italic
- Click to expand: `AnimatePresence` height animation reveals full activity details
- `slideFromLeft` stagger animation on mount

**Tips section:**
- "Travel Tips" — `eyebrow-slate`
- 3 tip cards: `gold-100` bg, `gold-400` left border `3px`, `p-3`, `rounded-lg`
- Lightbulb icon + tip text

### Right Panel — Map

**`MapView` component** (dynamic, ssr:false):
- CartoDB Voyager tiles
- Height: 100% of panel
- `border-radius: 20px`
- Property markers: house SVG, `ember-500`
- Activity markers: circle SVG, `ocean-500`
- Popup: `elevated-card` styled
- Fit bounds on load
- Hover sync with property cards: hovered card's marker pulses

---

## PAGE 5 — INQUIRY MODAL [AI]

**File:** `components/trip/InquiryModal.tsx`

Triggered by heart tap on property card.

**Overlay:** `motion.div`, `bg-navy-900/40`, full screen, `z-50`. Click outside to dismiss.

**Modal:** `modalSlideUp` variant. `elevated-card`. `max-w-[560px]`. Centered on desktop. `drawerSlideUp` on mobile (full-width bottom sheet).

**Header:**
- Eyebrow: "SMART INQUIRY" — `eyebrow` CSS class
- Property name: `font-display`, `xl`, `navy-800`
- Property thumbnail: 56px, `rounded-xl`, + platform badge

**Message textarea:**
- Label: "AI-DRAFTED MESSAGE" — `eyebrow-slate`
- `input-box` style but as `<textarea>`, 6 rows
- Pre-filled with `ai_message`
- Edit icon (Lucide `Pencil`) — top right, clicking enables editing
- Character count: `font-mono`, `text-xs`, `slate-400`, bottom-right

**Actions:**

IF `wa_link`:
- "Open in WhatsApp" — `emerald-500` bg, white, WhatsApp icon, full width, `buttonTap`
- After click: transitions to "✓ Opened in WhatsApp", then calls `PATCH /inquiries/:id/sent`

IF no `wa_link`:
- "Copy Message" — `ocean-500` bg, white, copy icon, full width
- After click: "✓ Copied" + `PATCH /inquiries/:id/sent`
- "View Listing →" — `ember-500` text below

**Footer:**
- "Cancel" — `slate-400`, small. Closes modal.
- Note: `font-mono`, `text-xs`, `slate-400`, centered — "Sent from your WhatsApp account"

---

## PAGE 6 — INQUIRIES PAGE [AI]

**File:** `app/inquiries/page.tsx`

Background: `page-bg`. Max width `max-w-4xl mx-auto px-8 pt-24`.

**Header:**
- Eyebrow: "INQUIRY TRACKER" — `eyebrow` CSS class
- Title: "Your Inquiries" — `font-display`, `text-4xl`, `navy-800`

**Filter tabs:**
- "All" · "Sent" · "Draft"
- Active tab: `navy-900` bg, white text, `rounded-full`
- `motion.div layoutId="tab-indicator"` for smooth sliding transition
- `whileTap={{ scale: 0.97 }}`

**Inquiry list:**
Each item: `elevated-card elevated-card-hover`, horizontal layout, `p-5`
- Left: property thumbnail 72px, `rounded-xl`
- Center: property name (`font-display`, `lg`), dates (`font-mono`, `sm`, `slate-400`), message preview truncated (`slate-400`, `sm`)
- Right: `StatusBadge` + timestamp `font-mono`, `text-xs`, `slate-400`
- Expand on click: `AnimatePresence` reveals full message + action buttons
- `cardVariants` stagger

**Empty state:**
- "No inquiries yet" — `font-display`, `text-2xl`, `slate-400`
- "Go back to planning" CTA — `btn-primary`

---

## PAGE 7 — AUTH CALLBACK [AI]

**File:** `app/auth/callback/page.tsx`

Full page centered. `page-bg`.
- "Retreat" wordmark — `font-display`, italic, `navy-900`, `text-2xl`
- Spinner: Lucide `Loader2`, `animate-spin`, `ember-500`, 32px
- "Signing you in..." — `font-body`, `slate-400`
- Handle Supabase OAuth hash → check `onboarding_completed` → redirect accordingly

---

## ROUTING LOGIC [AI]

**File:** `middleware.ts`

```ts
// Route protection rules:
// / (landing) — public
// /onboarding — authenticated only, redirect to /dashboard if onboarding_completed
// /dashboard — authenticated + onboarding_completed, else /onboarding
// /trip/[id] — authenticated only
// /inquiries — authenticated only
// /auth/callback — public
```

On every request: check Supabase session cookie. If no session and route is protected → redirect to `/`. If session exists but `onboarding_completed = false` and route is not `/onboarding` → redirect to `/onboarding`.

---

## GLOBAL STATE — ZUSTAND [AI]

**File:** `lib/store.ts`

```ts
interface ReturnState {
  searchParams: {
    destination: string; lat: number; lng: number
    checkin: string; checkout: string; guests: number
  } | null
  setSearchParams: (p: ...) => void

  currentTrip: Trip | null
  setCurrentTrip: (t: Trip | null) => void

  swipedPropertyIds: Set<string>
  interestedPropertyIds: Set<string>
  currentPropertyIndex: number
  markInterested: (id: string) => void
  markSkipped: (id: string) => void
  resetSwipeState: () => void

  mapSelectedId: string | null
  mapSelectedType: 'property' | 'activity' | null
  setMapSelected: (id: string | null, type: 'property' | 'activity' | null) => void

  inquiryModalOpen: boolean
  inquiryProperty: Property | null
  openInquiryModal: (p: Property) => void
  closeInquiryModal: () => void

  onboardingData: {
    name: string; travelStyle: string
    interests: string[]; budget: string
  }
  setOnboardingData: (data: Partial<...>) => void
}
```

---

## TANSTACK QUERY HOOKS [AI]

**`hooks/useProperties.ts`** — key: `['properties', tripId]`, staleTime: 15min
**`hooks/useActivities.ts`** — key: `['activities', lat, lng]`, staleTime: 24hr
**`hooks/useTrip.ts`** — key: `['trip', tripId]`, refetchOnWindowFocus: false
**`hooks/useInquiries.ts`** — key: `['inquiries']`, mutations: create, updateMessage, markSent
**`hooks/useAuth.ts`** — Supabase `onAuthStateChange`, signInWithGoogle, signOut, POST /auth/verify on login

---

## API CLIENT [AI]

**File:** `lib/api.ts`

```ts
// Axios instance with baseURL: NEXT_PUBLIC_API_URL
// Request interceptor: Authorization: Bearer token
// Response interceptor: 401 → signOut + redirect /

export const searchProperties = (p) => api.get('/properties/search', { params: p })
export const searchActivities = (p) => api.get('/activities/search', { params: p })
export const createTrip = (b) => api.post('/trips', b)
export const getTripById = (id) => api.get(`/trips/${id}`)
export const generateItinerary = (id) => api.post(`/trips/${id}/itinerary`)
export const createInquiry = (b) => api.post('/inquiries', b)
export const updateInquiryMessage = (id, b) => api.patch(`/inquiries/${id}/message`, b)
export const markInquirySent = (id) => api.patch(`/inquiries/${id}/sent`)
export const getInquiries = () => api.get('/inquiries')
export const updateUserProfile = (b) => api.patch('/auth/me', b)
```

---

## TYPESCRIPT TYPES [AI]

**File:** `types/index.ts`

```ts
export type Platform = 'booking' | 'airbnb'
export type TripStatus = 'planning' | 'active' | 'completed'
export type InquiryStatus = 'draft' | 'sent'
export type BudgetTier = 'budget' | 'comfort' | 'luxury'
export type TravelStyle = 'luxury' | 'adventure' | 'cultural' | 'relaxation'

export interface Property {
  id: string; platform: Platform; name: string; description: string | null
  imageUrls: string[]; pricePerNight: number; currency: string; totalPrice: number
  rating: number | null; reviewCount: number | null; maxGuests: number
  bedrooms: number | null; amenities: string[]; lat: number; lng: number
  address: string; bookingUrl: string
}

export interface Activity {
  id: string; placeId: string; name: string; category: string
  rating: number | null; reviewCount: number | null; priceLevel: number | null
  address: string; lat: number; lng: number; openingHours: string[] | null
  phoneNumber: string | null; website: string | null; bookingUrl: string | null
  photoUrls: string[]
}

export interface ItineraryTimeSlot { activity_id: string; note: string }

export interface ItineraryDay {
  day: number; date: string; theme: string
  morning: ItineraryTimeSlot; afternoon: ItineraryTimeSlot; evening: ItineraryTimeSlot
  meal_suggestion: string
}

export interface Itinerary {
  summary: string; recommended_property_ids: string[]
  days: ItineraryDay[]; tips: string[]
}

export interface Trip {
  id: string; userId: string; destination: string
  destinationLat: number; destinationLng: number
  checkin: string; checkout: string; guests: number
  status: TripStatus; itinerary: Itinerary | null; createdAt: string
}

export interface Inquiry {
  id: string; tripId: string; userId: string
  propertyId: string; platform: Platform; propertySnapshot: Property
  aiMessage: string; finalMessage: string; waLink: string | null
  status: InquiryStatus; sentAt: string | null; createdAt: string
}

export interface User {
  id: string; email: string; name: string | null; avatarUrl: string | null
  travelStyle: TravelStyle | null; interests: string[]; budgetTier: BudgetTier | null
  onboardingCompleted: boolean
}

export interface SearchParams {
  destination: string; lat: number; lng: number
  checkin: string; checkout: string; guests: number; currency?: string
}
```

---

## DEPENDENCIES [AI]

```bash
npm install framer-motion@11 @tanstack/react-query@5 zustand@5 \
  leaflet react-leaflet @types/leaflet \
  axios @supabase/supabase-js @supabase/auth-helpers-nextjs \
  react-hook-form @hookform/resolvers zod \
  lucide-react date-fns clsx tailwind-merge \
  class-variance-authority @radix-ui/react-dialog \
  @radix-ui/react-popover @radix-ui/react-select \
  @radix-ui/react-tabs @sentry/nextjs
```

---

## NEXT.JS CONFIG [AI]

```ts
const nextConfig = {
  images: {
    domains: [
      'cf.bstatic.com',
      'a0.muscache.com',
      'maps.googleapis.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com'
    ]
  }
}
```

---

## RESPONSIVE BREAKPOINTS

- **Mobile** `< 768px`: Single column everywhere. Map hidden behind tab. Navbar hamburger. Inquiry modal is full-screen drawer.
- **Tablet** `768–1024px`: Two-column trip page (left + middle). Map as collapsible bottom sheet.
- **Desktop** `> 1024px`: Full three-column trip page. All panels visible.

---

## PERFORMANCE

- MapView: always `dynamic()` with `ssr: false`
- Images: `next/image` with `sizes` prop
- Heavy components: `React.memo()`
- TanStack Query: `staleTime` on every query matches Redis TTL
- Fonts: `next/font/google` with `display: 'swap'`

---

## FINAL CHECKLIST [YOU]

### Theme Consistency
- [ ] All pages use flat `ivory-50` background — no gradient mesh
- [ ] Ember orange appears only on: CTA buttons, eyebrow labels, property card swipe accent, inquiry modal label
- [ ] All eyebrow labels use `eyebrow` or `eyebrow-slate` CSS class
- [ ] Playfair Display on: hero headings, dashboard greeting, destination names, trip card names
- [ ] DM Sans Bold on: onboarding question headings only
- [ ] No colored icons on stats strip — bare numbers only
- [ ] All cards are `elevated-card` or `photo-card` — nothing else
- [ ] Trip cards on dashboard are photo-first (image top 60%)
- [ ] Navbar is always visible glass on inner app pages

### Onboarding
- [ ] Onboarding skips correctly if `onboarding_completed = true`
- [ ] All 4 steps complete and save to Supabase
- [ ] Progress bar advances correctly
- [ ] EXIT button skips with defaults
- [ ] Step transitions use `onboardingStep` slide variant
- [ ] Bottom-border-only input on Step 1

### Interactions
- [ ] All buttons have `whileTap` scale
- [ ] Property card drag tints correctly (green right, red left)
- [ ] Swipe spring physics feel smooth
- [ ] Itinerary day cards expand on click
- [ ] Inquiry modal: drawer on mobile, centered modal on desktop
- [ ] Stats strip counters animate from 0 on viewport enter

### Data & Routing
- [ ] Google OAuth → onboarding (first time) → dashboard
- [ ] Google OAuth → dashboard (returning user)
- [ ] Properties and activities load on trip page
- [ ] AI itinerary generates and shows day cards
- [ ] Interested → inquiry modal with AI message
- [ ] WhatsApp deep link opens correctly

---

## ENV VARIABLES

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://retreat-backend-154252958232.us-central1.run.app
NEXT_PUBLIC_SENTRY_DSN=
```
