# Retreat — Frontend Implementation Plan
### World-Class AI Travel Operations Platform UI

---

## HOW TO READ THIS DOCUMENT

- `[YOU]` — Human does this manually
- `[AI]` — Antigravity builds this completely

**Rules for the AI agent before starting:**
- Never use purple gradients, neon colors, black backgrounds, or generic SaaS patterns
- Every page transition uses Framer Motion AnimatePresence — non-negotiable
- Color system is defined once in `tailwind.config.ts` — never use ad-hoc hex codes in components
- All API calls go through `lib/api.ts` only — never raw fetch/axios in components
- Never use `useEffect` to fetch data — use TanStack Query hooks exclusively
- Leaflet map must always be loaded with `dynamic()` and `ssr: false` — never import directly
- Every interactive element has a Framer Motion `whileHover` and `whileTap` — no exceptions
- Typography: `Playfair Display` for hero headings, `DM Sans` for body, `DM Mono` for data/numbers
- The app is light-themed — warm ivory backgrounds, deep navy text, ocean blue accents
- Never build a "chatbot in the center" layout — this is an operations platform

---

## DESIGN IDENTITY

**The feeling:** Apple Maps meets Notion. Stripe Dashboard meets Airbnb. Calm, intelligent, luxurious, spatially aware.

**NOT:** Dark mode AI startup. Neon cyberpunk. Generic SaaS dashboard. Purple gradients.

**Mental model for every screen:** This is a travel operations center. It should feel like a premium mission control — alive with data, intelligent, cinematic.

---

## DESIGN TOKENS

Define these exactly in `tailwind.config.ts` under `theme.extend.colors`. Never deviate.

```ts
colors: {
  ivory: {
    50:  '#FDFCF8',   // page background
    100: '#F8F5EE',   // card background
    200: '#F0EBE0',   // subtle borders, dividers
    300: '#E3DAC9',   // stronger borders
  },
  navy: {
    900: '#0D1B2A',   // primary text
    800: '#1B2D42',   // headings
    700: '#243B55',   // secondary text
    600: '#2E5077',   // links
    500: '#3A6FA8',   // interactive navy
  },
  ocean: {
    500: '#1A7FA8',   // primary action blue
    400: '#2E9DC7',   // hover state
    300: '#56B8D8',   // light accent
    100: '#E0F4FB',   // light blue bg
  },
  ember: {
    500: '#D4622A',   // sunset orange — CTAs, highlights
    400: '#E07A48',   // hover
    100: '#FAE8DF',   // light bg
  },
  emerald: {
    600: '#1A7A5E',   // success, confirmed
    500: '#22A07A',   // active states
    100: '#D6F5EC',   // light bg
  },
  gold: {
    400: '#C9A84C',   // premium accents, stars
    100: '#F5EDD3',   // light gold bg
  },
  slate: {
    400: '#94A3B8',   // muted text
    300: '#CBD5E1',   // disabled
    200: '#E2E8F0',   // skeleton base
  }
}
```

---

## TYPOGRAPHY SYSTEM

Install via `next/font/google`:

```ts
// app/layout.tsx fonts
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700']
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500']
})
```

Usage rules:
- `font-display` (`Playfair Display`) — hero headings, section titles, destination names
- `font-body` (`DM Sans`) — all body text, UI labels, buttons, form inputs
- `font-mono` (`DM Mono`) — prices, dates, coordinates, status codes, counters

---

## FRAMER MOTION ANIMATION LIBRARY

Define these as reusable variants in `lib/animations.ts`. Import and use everywhere — never write inline variants ad-hoc.

```ts
// lib/animations.ts — define all of these

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

export const countUp = { initial: 0 } // use with useMotionValue + animate()

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
```

---

## GLASSMORPHISM UTILITY CLASSES

Add to `globals.css`:

```css
.glass-card {
  background: rgba(253, 252, 248, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(227, 218, 201, 0.6);
  box-shadow: 0 4px 24px rgba(13, 27, 42, 0.06), 0 1px 4px rgba(13, 27, 42, 0.04);
}

.glass-card-navy {
  background: rgba(13, 27, 42, 0.82);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(58, 111, 168, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

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
}

.gradient-mesh {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(26, 127, 168, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(212, 98, 42, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(26, 122, 94, 0.05) 0%, transparent 50%),
    #FDFCF8;
}

.text-gradient-ocean {
  background: linear-gradient(135deg, #1A7FA8, #2E9DC7, #1A7A5E);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-warm {
  background: linear-gradient(135deg, #0D1B2A, #D4622A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## COMPONENT ARCHITECTURE

### Shared Components (`components/shared/`)

**`PageWrapper.tsx`**
- Wraps every page
- Applies `pageVariants` from `lib/animations.ts` using `motion.div`
- Background: `gradient-mesh` CSS class
- Min height: `100vh`

**`Navbar.tsx`**
- Fixed top, full width
- Height: `64px`
- Background: `glass-card` on scroll, transparent at top
- Detects scroll with `useScroll` from Framer Motion — transition opacity and blur on scroll
- Left: Retreat wordmark — "Retreat" in `font-display`, italic, `navy-900`
- Right: User avatar (from Supabase session), notification bell, new trip button
- New trip button: `ember-500` background, white text, rounded-full, `buttonTap` animation
- Mobile: collapse to hamburger with drawer

**`SkeletonCard.tsx`**
- Uses `shimmer` animation variant
- Background: `linear-gradient(90deg, #E3DAC9 25%, #F0EBE0 50%, #E3DAC9 75%)`
- `backgroundSize: 400% 100%`
- Apply `shimmer.animate` from animations.ts
- Rounded corners match the card it replaces

**`StatusBadge.tsx`**
- Props: `status: 'draft' | 'sent' | 'planning' | 'active' | 'completed'`
- `draft` → gold background + text
- `sent` → emerald background + text
- `planning` → ocean background + text
- `active` → ember background + text
- `completed` → slate background + text
- Animate in with `scaleIn` variant
- Small dot indicator animates with pulse for `active` status

**`AnimatedCounter.tsx`**
- Props: `from: number, to: number, duration?: number, suffix?: string`
- Uses `useMotionValue`, `animate()`, `useTransform` from Framer Motion
- Font: `font-mono`, large size
- Trigger animation when element enters viewport using `useInView`

**`FloatingOrbs.tsx`**
- 3 blurred gradient circles, positioned absolute, pointer-events none, z-0
- Orb 1: `ocean-300` at 12% opacity, 400px diameter, top-left quadrant
- Orb 2: `ember-400` at 8% opacity, 300px diameter, top-right quadrant
- Orb 3: `emerald-500` at 6% opacity, 350px diameter, bottom-center
- Each uses `floatOrb(delay)` animation with different delays (0, 2, 4)
- `filter: blur(80px)` on each

---

## PAGE 1 — LANDING PAGE [AI]

**File:** `app/page.tsx`

The landing page is cinematic. It is NOT a simple marketing page. It is a live preview of the product.

### Section 1 — Hero

Layout: Full viewport height. Dark navy background (`navy-900`). Light text.

Left half (55%):
- Small eyebrow label: "AI Travel Operations Platform" — `font-mono`, `ocean-300`, uppercase, letter-spacing wide
- Hero headline (2 lines):
  ```
  Your travel,
  orchestrated.
  ```
  Font: `font-display`, `7xl` (72px), white, italic on "orchestrated"
- Subheadline: "Intelligent itinerary planning, accommodation search, and automated booking workflows — powered by adaptive AI." — `DM Sans`, `slate-300`, `xl`
- Two CTA buttons:
  - Primary: "Start Planning" — `ember-500` bg, white text, large, rounded-full, `buttonTap`
  - Secondary: "See how it works" — transparent, white border, white text, rounded-full
- Both buttons animate in with `slideFromLeft` variant, delay 0.6s

Right half (45%):
- Floating dashboard preview card — `glass-card-navy`, large rounded corners
- Shows a miniaturized version of the trip dashboard:
  - Fake itinerary timeline with 3 days
  - Small map placeholder with animated dots
  - Two property cards stacked
  - Weather widget
- All elements inside animate with stagger using `cardVariants`
- The whole preview card floats using `floatOrb(0)` animation (subtle y movement)
- Add `FloatingOrbs` behind the preview card

Scroll indicator: animated chevron at bottom center, bounce animation, fades on scroll.

### Section 2 — Feature Strips (3 sections)

Background: `ivory-50`. Each section alternates layout (text left/right).

Use `useInView` from Framer Motion — animate each section in as it enters viewport.

**Feature 1: AI Planning Intelligence**
- Icon: brain/sparkle in `ocean-500`
- Headline: "Plans your entire trip in seconds"
- Body: Describe the AI itinerary generation
- Visual: Animated itinerary timeline card with 3 staggered day blocks

**Feature 2: Accommodation Engine**
- Icon: building in `ember-500`
- Headline: "Ranked properties from Booking.com & Airbnb"
- Body: Describe the multi-platform property search
- Visual: 2 property cards side by side with rating scores

**Feature 3: Smart Inquiry System**
- Icon: message in `emerald-500`
- Headline: "One tap to contact any host"
- Body: Describe the AI message drafting + WhatsApp flow
- Visual: WhatsApp message preview mockup

### Section 3 — CTA Banner

Background: `navy-800`. Centered.
- Headline: "Ready to plan smarter?" — `font-display`, `5xl`, white
- Subheadline: "Join thousands of travelers using Retreat." — `slate-300`
- Single CTA: "Start for free" — `ember-500`, large, rounded-full
- Background: subtle animated gradient using CSS `@keyframes`

### Section 4 — Footer

Simple. `ivory-200` background.
- Left: Retreat wordmark
- Center: "Built with AI. Designed for travelers."
- Right: Links (Privacy, Terms)

---

## PAGE 2 — DASHBOARD [AI]

**File:** `app/dashboard/page.tsx`

This is the mission control. The heart of the app.

### Layout

Full page. `gradient-mesh` background. Navbar fixed top.
Content starts at `pt-20` (below navbar).

### Top Bar

Below navbar, above bento grid:
- Left: Greeting — "Good morning, [name]" in `font-display`, `3xl`, `navy-900`
- Right: Date display in `font-mono`, `slate-400` + "New Trip" button

### Stats Banner

3 animated stat cards in a row. Each is an `elevated-card`:

**Card 1 — Trips Planned**
- `AnimatedCounter` from 0 to user's trip count
- Label: "Trips Planned"
- Icon: map pin in `ocean-500`

**Card 2 — Inquiries Sent**
- `AnimatedCounter` from 0 to inquiry count
- Label: "Inquiries Sent"
- Icon: message in `emerald-500`

**Card 3 — Places Saved**
- `AnimatedCounter` from 0 to saved activities count
- Label: "Places Saved"
- Icon: bookmark in `ember-500`

Animate the three cards in with `cardVariants` staggered.

### Search Form Card

`elevated-card` with `elevated-card-hover`. Padding `p-8`. Below stats.

Title: "Plan a new trip" — `font-display`, `2xl`, `navy-800`

Form layout — horizontal row on desktop, stacked on mobile:

**Destination input:**
- Full text input with search icon
- On type (300ms debounce): call `GET https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5`
- Show autocomplete dropdown with results — `elevated-card`, absolute positioned
- Each result: place name + country. On click: store `display_name`, `lat`, `lon`
- Dropdown animates in with `scaleIn` variant

**Date range:**
- Two date inputs side by side: "Check-in" and "Check-out"
- Style as custom inputs matching design system
- Min date: today

**Guests stepper:**
- Label: "Guests"
- `-` button, number display, `+` button
- Min 1, max 16
- Buttons: `whileTap={{ scale: 0.9 }}`

**Submit button:**
- Full width on mobile, auto on desktop
- Background: `ember-500` → gradient to `ember-400`
- Text: "Search & Plan Trip"
- Icon: arrow right, animates right on hover
- `buttonTap` animation
- On submit: POST to `/api/v1/trips` then navigate to `/trip/[tripId]`
- Loading state: spinner replaces arrow icon

### My Trips Grid

Title: "Your Trips" — `font-display`, `xl`, `navy-800`

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap 6

Each `TripCard`:
- `elevated-card` + `elevated-card-hover`
- Top section: destination name in `font-display`, `xl`, `navy-800`
- Dates row: `font-mono`, `slate-400`, small
- Status badge: `StatusBadge` component
- Bottom row: "View Trip" link → `ocean-500` text with arrow icon
- `cardVariants` with stagger index
- Empty state: illustrated empty card with "Plan your first trip" CTA

---

## PAGE 3 — TRIP DETAIL [AI]

**File:** `app/trip/[tripId]/page.tsx`

This is the most complex and most important page. It has three panels.

### Layout

Full viewport. No scroll on the outer container. Three columns:
- Left panel: `w-[380px]`, fixed height, internal scroll
- Middle panel: `flex-1`, fixed height, internal scroll
- Right panel: `w-[320px]`, fixed height, no scroll (map fills it)

Mobile: single column, panels stack vertically with tab switcher.

Background: `gradient-mesh`.

### Left Panel — Property Stack

**Header:**
- "Find your stay" — `font-display`, `xl`, `navy-800`
- Property count badge: "24 properties" — `font-mono`, `slate-400`
- Platform filter pills: "All", "Booking.com", "Airbnb" — toggle pills

**`PropertyStack` component:**
- Shows one property at a time as a stack of cards
- Current card is on top, faint shadow of next card visible behind it
- Drag gesture using `useDragControls` + `useMotionValue` for x position
- As user drags right: card tints `emerald-100`, heart icon fades in at `scale: 1.2`
- As user drags left: card tints `ember-100`, X icon fades in at `scale: 1.2`
- Drag threshold: 100px — on release past threshold triggers swipe
- On Interested: `swipeRight` exit animation → push job to backend
- On Skip: `swipeLeft` exit animation → record as skipped
- Next card slides up from behind with spring animation

**`PropertyCard` component (inside the stack):**
- Full bleed hero image — top 52% of card
- Platform badge (booking/airbnb) — top-left corner of image, semi-transparent
- Favorite count or review count — top-right corner
- Content section (48%):
  - Property name: `font-display`, `lg`, `navy-800`
  - Address: `slate-400`, small, with location pin icon
  - Rating row: gold stars + review count in `font-mono`
  - Price row: `font-mono`, `2xl`, `navy-900` + "/night" in `slate-400`
  - Amenity chips: first 4 amenities as small chips (`ivory-200` bg)
- Bottom row:
  - "View listing" → opens `bookingUrl` in new tab, `ocean-500` text
  - `whileHover={{ scale: 1.01 }}` on the whole card

**Action buttons below stack:**
- Two large circular buttons:
  - Left: X button — `ivory-200` bg, `slate-600` icon, 56px diameter
  - Right: Heart button — `ember-500` bg, white icon, 56px diameter
  - Both: `whileTap={{ scale: 0.88 }}`, spring animation
- Keyboard support: left arrow = skip, right arrow = interested

**Progress indicator:**
- Small dots below buttons showing position in the stack
- Active dot: `ember-500`, wider. Inactive: `slate-300`
- Animate active dot position with `layout` prop

### Middle Panel — Itinerary

**Header:**
- "Your Itinerary" — `font-display`, `xl`, `navy-800`
- "Generate Plan" button — `ocean-500` bg, white text, small
- On click: POST to `/api/v1/trips/:tripId/itinerary`

**Loading state while AI generates:**
- Show elegant "AI is planning your trip..." state
- Animated dots: 3 dots bouncing in sequence (`staggerChildren`)
- Rotating subtle text: "Analyzing activities..." → "Ranking properties..." → "Building your days..."
- Cycle through these 3 messages every 2 seconds using `AnimatePresence` with `mode="wait"`
- Skeleton blocks for 3 day cards

**`ItineraryPanel` when data loaded:**
- Each day as an `ItineraryDay` card, staggered in with `slideFromLeft`

**`ItineraryDay` component:**
- `elevated-card` with left border: 3px solid `ocean-500`
- Header row: "Day 1 — Monday 15 July" + theme label (`gold-400` bg chip)
- Three time slots inside (Morning, Afternoon, Evening):
  - Icon: ☀️ 🌤️ 🌙
  - Activity name linked to the activity data
  - AI reasoning note: italic, `slate-400`, small
- Meal suggestion row: fork icon + italic text
- Each time slot animates in with `slideFromLeft` stagger on mount
- Expandable: clicking the day card expands to show full activity details
- Expansion uses `AnimatePresence` + `motion.div` with `height` animation

**AI tips section:**
- Below all days
- "Travel Tips" header
- 3 tip items with lightbulb icon, `gold-100` background, `gold-400` left border

### Right Panel — Map

**`MapView` component:**
- Must load with `dynamic(() => import('...'), { ssr: false })`
- Leaflet map with OpenStreetMap tiles
- Height: `100%` (fills the right panel)
- Rounded corners: `20px`
- Custom map style: set `TileLayer` to CartoDB Voyager tiles for premium look:
  `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`
  Attribution: `© OpenStreetMap contributors © CARTO`
- Property markers: custom SVG icon — house shape, `ember-500` fill, white border
- Activity markers: custom SVG icon — circle with activity emoji, `ocean-500` fill
- On marker click: popup with name, rating, price (for properties) or name + category (for activities)
- Popup style: `elevated-card` styled (white bg, rounded, shadow)
- Fit bounds to show all markers on load
- When user hovers a property card in the left panel: that marker pulses (scale animation using CSS)
- Attribution: small, bottom right, `slate-300`

---

## PAGE 4 — INQUIRY MODAL [AI]

**File:** `components/trip/InquiryModal.tsx`

Triggered when user taps the heart button on a property. Full-screen overlay on mobile, centered modal on desktop.

### Overlay

`motion.div` — `initial={{ opacity: 0 }}`, `animate={{ opacity: 1 }}` — semi-transparent `navy-900` at 40% opacity. Click outside to cancel.

### Modal Card

`modalSlideUp` animation variant. `elevated-card`. Max width `560px`. Centered.

**Header section:**
- Small label: "Smart Inquiry" — `font-mono`, `ocean-500`, uppercase
- Property name: `font-display`, `xl`, `navy-800`
- Platform badge + property image thumbnail (60px, rounded)

**Message section:**
- Label: "AI-drafted message" — `slate-400`, small
- Textarea: pre-filled with `ai_message` from backend
- Style: `ivory-100` bg, `navy-700` border, `navy-900` text, `font-body`, `rounded-xl`, `p-4`
- Edit icon button top-right of textarea — clicking enables editing
- Character count: `font-mono`, small, `slate-400`, bottom right of textarea

**Action section (conditional):**

IF `wa_link` exists:
- Green "Open in WhatsApp" button — `emerald-500` bg, white text, WhatsApp icon, full width
- `buttonTap` animation
- On click: `window.open(wa_link, '_blank')` then call `PATCH /inquiries/:id/sent`
- After click: button transitions to "✓ Opened in WhatsApp" — `emerald-600` bg, checkmark icon
- Show note: "The message will be sent from your WhatsApp account"

IF no `wa_link` (no host phone number):
- "Copy Message" button — `ocean-500` bg, white text, copy icon, full width
- On click: copy `final_message` to clipboard, button transitions to "✓ Copied"
- Below: "View Listing" link — opens `bookingUrl`, `ember-500` text

**Cancel link:**
- Below action button
- "Cancel" — `slate-400` text, small, `whileHover={{ color: navy-800 }}`

**Footer note:**
- `font-mono`, `slate-400`, `xs`, centered
- "Messages are sent from your personal WhatsApp — not from Retreat"

---

## PAGE 5 — INQUIRIES PAGE [AI]

**File:** `app/inquiries/page.tsx`

**Header:**
- "Inquiry Tracker" — `font-display`, `3xl`, `navy-800`
- Subtitle: "Track all your property inquiries" — `slate-400`

**Filter tabs:**
- "All", "Sent", "Draft" — pill tabs
- Active tab: `navy-900` bg, white text
- Inactive: `ivory-200` bg
- Sliding indicator: `motion.div` with `layoutId="inquiry-tab"` for smooth transition

**Inquiry list:**
- Each item as an `elevated-card` + `elevated-card-hover`
- Left: property image thumbnail (72px, rounded-xl)
- Center: property name (`font-display`), dates (`font-mono`), message preview (truncated, `slate-400`)
- Right: `StatusBadge` + timestamp in `font-mono`
- "View message" expands the card to show full message text with `AnimatePresence`
- "Open WhatsApp" re-triggers the deep link if status is sent
- Staggered animation with `cardVariants`

**Empty state:**
- Illustrated empty state
- "No inquiries yet" — `font-display`, `xl`, `slate-400`
- "Go back to planning" CTA

---

## PAGE 6 — AUTH CALLBACK [AI]

**File:** `app/auth/callback/page.tsx`

Simple loading page shown during Supabase OAuth redirect:
- Centered layout
- Retreat wordmark
- Subtle spinner — animated circle using Framer Motion `rotate` animation
- "Signing you in..." — `font-body`, `slate-400`
- Handle Supabase session from URL hash → redirect to `/dashboard`

---

## GLOBAL STATE — ZUSTAND [AI]

**File:** `lib/store.ts`

```ts
interface ReturnState {
  // Search params
  searchParams: {
    destination: string
    lat: number
    lng: number
    checkin: string
    checkout: string
    guests: number
  } | null
  setSearchParams: (params: ...) => void

  // Current trip
  currentTrip: Trip | null
  setCurrentTrip: (trip: Trip | null) => void

  // Property swipe state
  swipedPropertyIds: Set<string>
  interestedPropertyIds: Set<string>
  currentPropertyIndex: number
  markInterested: (id: string) => void
  markSkipped: (id: string) => void
  resetSwipeState: () => void

  // Map state
  mapSelectedId: string | null
  mapSelectedType: 'property' | 'activity' | null
  setMapSelected: (id: string | null, type: 'property' | 'activity' | null) => void

  // Inquiry modal state
  inquiryModalOpen: boolean
  inquiryProperty: Property | null
  openInquiryModal: (property: Property) => void
  closeInquiryModal: () => void
}
```

---

## TANSTACK QUERY HOOKS [AI]

**File:** `hooks/useProperties.ts`
- Query key: `['properties', tripId]`
- Fetches `GET /api/v1/properties/search` with trip params
- `staleTime: 15 * 60 * 1000` (15 minutes — matches Redis TTL)
- Returns `{ properties, sources, isLoading, isError }`

**File:** `hooks/useActivities.ts`
- Query key: `['activities', lat, lng]`
- Fetches `GET /api/v1/activities/search`
- `staleTime: 24 * 60 * 60 * 1000` (24 hours — matches Redis TTL)

**File:** `hooks/useTrip.ts`
- Query key: `['trip', tripId]`
- Fetches `GET /api/v1/trips/:tripId`
- `refetchOnWindowFocus: false`

**File:** `hooks/useInquiries.ts`
- Query key: `['inquiries']`
- Fetches `GET /api/v1/inquiries`
- Mutations: `useCreateInquiry`, `useUpdateMessage`, `useMarkSent`
- On `useCreateInquiry` success: open inquiry modal with returned `ai_message` and `wa_link`

**File:** `hooks/useAuth.ts`
- Wraps Supabase `onAuthStateChange`
- Exposes `user`, `session`, `signInWithGoogle`, `signOut`
- On sign in: calls `POST /api/v1/auth/verify` to upsert user in DB

---

## API CLIENT [AI]

**File:** `lib/api.ts`

- Create Axios instance: `baseURL: process.env.NEXT_PUBLIC_API_URL`
- Request interceptor: attach `Authorization: Bearer ${session.access_token}`
- Response interceptor: on 401 → `supabase.auth.signOut()` → redirect to `/`
- All functions fully typed using types from `types/index.ts`
- Export named functions for every endpoint — never use Axios directly in components:
  ```ts
  export const searchProperties = (params) => api.get('/properties/search', { params })
  export const searchActivities = (params) => api.get('/activities/search', { params })
  export const createTrip = (body) => api.post('/trips', body)
  export const getTripById = (id) => api.get(`/trips/${id}`)
  export const generateItinerary = (id) => api.post(`/trips/${id}/itinerary`)
  export const createInquiry = (body) => api.post('/inquiries', body)
  export const updateInquiryMessage = (id, body) => api.patch(`/inquiries/${id}/message`, body)
  export const markInquirySent = (id) => api.patch(`/inquiries/${id}/sent`)
  export const getInquiries = () => api.get('/inquiries')
  ```

---

## TYPESCRIPT TYPES [AI]

**File:** `types/index.ts`

Define all types here. Import everywhere. Never use `any`.

```ts
export type Platform = 'booking' | 'airbnb'
export type TripStatus = 'planning' | 'active' | 'completed'
export type InquiryStatus = 'draft' | 'sent'

export interface Property {
  id: string
  platform: Platform
  name: string
  description: string | null
  imageUrls: string[]
  pricePerNight: number
  currency: string
  totalPrice: number
  rating: number | null
  reviewCount: number | null
  maxGuests: number
  bedrooms: number | null
  amenities: string[]
  lat: number
  lng: number
  address: string
  bookingUrl: string
}

export interface Activity {
  id: string
  placeId: string
  name: string
  category: string
  rating: number | null
  reviewCount: number | null
  priceLevel: number | null
  address: string
  lat: number
  lng: number
  openingHours: string[] | null
  phoneNumber: string | null
  website: string | null
  bookingUrl: string | null
  photoUrls: string[]
}

export interface ItineraryTimeSlot {
  activity_id: string
  note: string
}

export interface ItineraryDay {
  day: number
  date: string
  theme: string
  morning: ItineraryTimeSlot
  afternoon: ItineraryTimeSlot
  evening: ItineraryTimeSlot
  meal_suggestion: string
}

export interface Itinerary {
  summary: string
  recommended_property_ids: string[]
  days: ItineraryDay[]
  tips: string[]
}

export interface Trip {
  id: string
  userId: string
  destination: string
  destinationLat: number
  destinationLng: number
  checkin: string
  checkout: string
  guests: number
  status: TripStatus
  itinerary: Itinerary | null
  createdAt: string
}

export interface Inquiry {
  id: string
  tripId: string
  userId: string
  propertyId: string
  platform: Platform
  propertySnapshot: Property
  aiMessage: string
  finalMessage: string
  waLink: string | null
  status: InquiryStatus
  sentAt: string | null
  createdAt: string
}

export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface SearchParams {
  destination: string
  lat: number
  lng: number
  checkin: string
  checkout: string
  guests: number
  currency?: string
}
```

---

## DEPENDENCIES [AI]

Run this in `frontend/`:

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

**File:** `next.config.ts`

```ts
const nextConfig = {
  images: {
    domains: [
      'cf.bstatic.com',           // Booking.com images
      'a0.muscache.com',           // Airbnb images
      'maps.googleapis.com',
      'lh3.googleusercontent.com'  // Google user avatars
    ]
  },
  experimental: {
    optimizeCss: true
  }
}
```

---

## RESPONSIVE BREAKPOINTS

All layouts must be responsive. Breakpoints:

- **Mobile** (`< 768px`): Single column. Property stack full width. Map hidden (tab to switch). Navbar collapses.
- **Tablet** (`768px – 1024px`): Two columns on trip page. Left + middle panels. Map as bottom sheet.
- **Desktop** (`> 1024px`): Full three-column layout on trip page.

---

## PERFORMANCE REQUIREMENTS

- `MapView` — dynamic import with `ssr: false` always
- Property images — use `next/image` with proper `sizes` prop
- Heavy components (ItineraryPanel, PropertyStack) — `React.memo()` to prevent re-renders
- TanStack Query — `staleTime` set on every query to match Redis TTL
- Framer Motion — use `will-change: transform` on animated cards via `style` prop
- Fonts — `next/font/google` with `display: 'swap'`

---

## FINAL CHECKLIST [YOU]

### Visual Quality
- [ ] Fonts load correctly — Playfair Display on headings, DM Sans on body
- [ ] Color system consistent — no ad-hoc hex codes
- [ ] All cards use `elevated-card` class
- [ ] Glassmorphism applied to navbar on scroll
- [ ] CartoDB Voyager tiles on map (not default OpenStreetMap)
- [ ] Gradient mesh background on all pages
- [ ] Property card hero image fills top 52% of card
- [ ] Framer Motion animations on every page transition

### Interactions
- [ ] All buttons have `whileTap` scale effect
- [ ] Property card drag gesture works — tints green/red as dragged
- [ ] Swipe animations fire correctly (spring physics)
- [ ] Itinerary day cards expand smoothly on click
- [ ] Inquiry modal slides up from bottom on mobile
- [ ] Destination autocomplete dropdown animates in/out
- [ ] Stats counters animate from 0 on dashboard mount

### Data
- [ ] Google OAuth login completes and redirects to dashboard
- [ ] Properties load from backend on trip page
- [ ] Activities load and show on map
- [ ] AI itinerary generates and displays day cards
- [ ] Interested tap opens inquiry modal with AI message
- [ ] "Open in WhatsApp" deep link opens correct WhatsApp conversation
- [ ] Inquiries page shows all inquiries with correct status

### Mobile
- [ ] Navbar collapses on mobile
- [ ] Property stack is full width on mobile
- [ ] Map is accessible via tab on mobile
- [ ] Inquiry modal is a full-screen drawer on mobile
- [ ] Touch swipe on property cards works

---

## ENV VARIABLES REQUIRED

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=https://retreat-backend-154252958232.us-central1.run.app
NEXT_PUBLIC_SENTRY_DSN=
```
