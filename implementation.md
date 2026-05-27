# Retreat — Implementation Plan
### AI-Powered Trip Planning & Booking Automation

---

## HOW TO READ THIS DOCUMENT

This document is written for an AI coding agent (antigravity) to carry out the full implementation.
Every section is labeled with one of two tags:

- `[YOU]` — A manual step the **human must do** (create accounts, copy keys, click buttons). The AI cannot do this.
- `[AI]` — The AI agent builds this. The human does not need to do anything except approve.

**Rules for the AI agent — read before starting:**
- Never invent environment variable names. Every variable is defined in Phase 0 and listed in the final ENV reference.
- Never skip a phase. Complete each phase in order. Mark it done before moving forward.
- Never use placeholder logic. If a function is listed, implement it fully.
- When in doubt about a type, use the Zod schema defined in the relevant service.
- Framer Motion is used on every interactive UI element. This is non-negotiable.
- Do not import `dotenv` anywhere except `config.ts` / `config.py`. All env vars come from there.
- All API responses must match the defined response schemas exactly. No extra fields, no missing fields.
- Never hardcode a URL, key, or secret in the code. Always read from config.

---

## PROJECT OVERVIEW

**Name:** Retreat
**What it does:** A full trip planning and booking automation platform. Users search for accommodation across Booking.com and VRBO, discover local activities via Google Places, receive an AI-generated day-by-day itinerary, and trigger an automated smart inquiry workflow (AI-drafted message sent via WhatsApp) to property owners with a single tap.

**Core user flow:**
1. User logs in with Google OAuth via Supabase Auth
2. User picks a destination, dates, and group size on the dashboard
3. App loads available properties (Booking.com + Airbnb) and activities (Google Places) in parallel
4. NVIDIA AI generates a full day-by-day itinerary with the best matches
5. User sees animated property cards — taps **Interested** or **Not Interested**
6. "Interested" triggers the smart inquiry workflow: AI drafts a WhatsApp message, user reviews it, taps "Open in WhatsApp" — message opens in their own WhatsApp pre-filled and ready to send to the host

---

## TECH STACK REFERENCE

Keep this visible at all times. Every technology decision is final unless explicitly changed.

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind CSS 4, Framer Motion 11, TanStack Query v5, Zustand v5, Leaflet + react-leaflet, shadcn/ui + Radix UI, React Hook Form + Zod |
| Backend API | Node.js 22, Fastify 5 |
| AI Service | Python 3.12, FastAPI, NVIDIA NIM API (meta/llama-3.1-70b-instruct or nvidia/nemotron) |
| Auth | Supabase Auth (Google OAuth + JWT) |
| Database | Supabase Postgres |
| Cache | Upstash Redis (REST SDK) |
| Queue | Upstash QStash |
| Property API | RapidAPI — Booking.com (`booking-com15.p.rapidapi.com`) + Airbnb (`airbnb13.p.rapidapi.com`) |
| Activities API | Google Places API (New) |
| Maps | Leaflet + react-leaflet (OpenStreetMap tiles — no account, no key) |
| Messaging | WhatsApp `wa.me` deep link — opens in user's own WhatsApp, no API required |
| Logging | Pino (Node.js) → Axiom log drain |
| Error Tracking | Sentry (frontend + backend) |
| Frontend Host | Vercel |
| Backend Host | Railway.app |
| CI/CD | GitHub Actions |

---

## COLOR SYSTEM & DESIGN TOKENS

The AI must use these exact values throughout the entire frontend. Never use ad-hoc hex codes.

```ts
// tailwind.config.ts — extend colors with:
colors: {
  brand: {
    primary: '#5B4EE8',      // deep indigo — primary actions, active states
    secondary: '#FF6B6B',    // coral red — accents, CTAs
    accent: '#FFD93D',       // golden yellow — highlights, badges
    teal: '#4ECDC4',         // teal — success states, confirmed
    dark: '#0F0E17',         // near-black — backgrounds
    card: '#1A1826',         // card backgrounds
    border: '#2D2B3D',       // borders
    muted: '#6B6880',        // muted text
  }
}
```

**Dark theme only.** Background: `#0F0E17`. All pages use dark theme.

---

## FRAMER MOTION RULES

The AI must apply these animations. These are not optional.

1. **Page transitions** — Every page uses `<AnimatePresence>` with a slide-up + fade: `initial={{ opacity: 0, y: 24 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, y: -24 }}`, `transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}`

2. **Property cards** — Enter with staggered fade-up. Each card: `initial={{ opacity: 0, y: 32 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ delay: index * 0.08 }}`. Hover: `whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(91,78,232,0.25)' }}`

3. **Interested/Not Interested swipe** — Cards animate out: Interested → `x: 300, rotate: 15, opacity: 0`. Not Interested → `x: -300, rotate: -15, opacity: 0`. Duration: `0.4s`, ease: spring `stiffness: 200, damping: 20`

4. **Dashboard stats** — Numbers count up from 0 using `useMotionValue` + `useTransform` + `animate()`

5. **Itinerary items** — Stagger in from left: `initial={{ x: -20, opacity: 0 }}`, delay `index * 0.1`

6. **Floating gradient orbs** — Background decoration on landing and dashboard. Animate with `animate={{ x: [0, 30, 0], y: [0, -20, 0] }}`, `transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}`

7. **Buttons** — All buttons: `whileTap={{ scale: 0.96 }}`, `whileHover={{ scale: 1.02 }}`

8. **Loading skeleton** — Shimmer animation using `animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}` with gradient background

---

## PROJECT FOLDER STRUCTURE

The AI must create this exact folder structure before writing any code.

```
retreat/
│
├── backend/                          # Node.js 22 + Fastify 5 API
│   ├── src/
│   │   ├── index.ts                  # Fastify app entry point
│   │   ├── config.ts                 # All env vars loaded here (dotenv)
│   │   ├── plugins/
│   │   │   ├── supabase.ts           # Supabase client plugin
│   │   │   ├── redis.ts              # Upstash Redis client plugin
│   │   │   ├── cors.ts               # CORS config
│   │   │   ├── rateLimit.ts          # Rate limiter (@fastify/rate-limit)
│   │   │   └── sentry.ts             # Sentry init
│   │   │
│   │   ├── routes/
│   │   │   ├── health.ts             # GET /health
│   │   │   ├── auth.ts               # POST /auth/verify, GET /auth/me
│   │   │   ├── properties.ts         # GET /properties/search
│   │   │   ├── activities.ts         # GET /activities/search
│   │   │   ├── trips.ts              # POST /trips, GET /trips/:id, GET /trips (user list)
│   │   │   ├── inquiries.ts          # POST /inquiries (trigger workflow)
│   │   │   └── messages.ts           # GET /messages/:tripId (inquiry thread)
│   │   │
│   │   ├── services/
│   │   │   ├── bookingService.ts     # Booking.com search via RapidAPI
│   │   │   ├── airbnbService.ts      # Airbnb search via RapidAPI
│   │   │   ├── placesService.ts      # Google Places API calls
│   │   │   ├── cacheService.ts       # Redis get/set/invalidate helpers
│   │   │   ├── qstashService.ts      # Enqueue jobs to Upstash QStash
│   │   │   ├── whatsappService.ts    # wa.me deep link generator (no API — opens user's WhatsApp)
│   │   │   └── authService.ts        # Supabase JWT verification
│   │   │
│   │   ├── workers/
│   │   │   └── inquiryWorker.ts      # POST /worker/inquiry — QStash calls this
│   │   │
│   │   ├── middleware/
│   │   │   ├── authenticate.ts       # JWT auth hook (Fastify preHandler)
│   │   │   └── requestLogger.ts      # Pino structured request logging
│   │   │
│   │   ├── schemas/
│   │   │   ├── property.ts           # Zod schema: PropertySchema
│   │   │   ├── activity.ts           # Zod schema: ActivitySchema
│   │   │   ├── trip.ts               # Zod schema: TripSchema
│   │   │   └── inquiry.ts            # Zod schema: InquirySchema
│   │   │
│   │   └── lib/
│   │       ├── rapidapi.ts           # Shared RapidAPI Axios client (x-rapidapi-key header)
│   │       └── logger.ts             # Pino logger instance
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
│
├── ai-service/                       # Python 3.12 + FastAPI AI service
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point
│   │   ├── config.py                 # Pydantic settings
│   │   ├── routers/
│   │   │   ├── plan.py               # POST /plan — generate itinerary
│   │   │   └── message.py            # POST /message — generate WhatsApp draft
│   │   ├── services/
│   │   │   ├── planner.py            # NVIDIA NIM API trip planning logic
│   │   │   └── composer.py           # NVIDIA NIM API message drafting logic
│   │   └── schemas/
│   │       ├── plan.py               # Pydantic models for plan request/response
│   │       └── message.py            # Pydantic models for message request/response
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/                         # Next.js 15 App Router
│   ├── app/
│   │   ├── layout.tsx                # Root layout: providers, fonts, global styles
│   │   ├── page.tsx                  # Landing page (animated hero, login CTA)
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Main dashboard: search form + results
│   │   ├── trip/
│   │   │   └── [tripId]/
│   │   │       └── page.tsx          # Trip detail: itinerary + property cards + map
│   │   ├── inquiries/
│   │   │   └── page.tsx              # My inquiries: status tracking
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx          # Supabase OAuth callback handler
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── landing/
│   │   │   ├── Hero.tsx              # Animated hero section
│   │   │   └── FloatingOrbs.tsx      # Background gradient orb animation
│   │   ├── dashboard/
│   │   │   ├── SearchForm.tsx        # Location + dates + group size form
│   │   │   ├── StatsBanner.tsx       # Animated counters (properties found, etc.)
│   │   │   └── TripCard.tsx          # Saved trip card
│   │   ├── trip/
│   │   │   ├── PropertyStack.tsx     # Swipeable property card stack
│   │   │   ├── PropertyCard.tsx      # Single animated property card
│   │   │   ├── ActivityGrid.tsx      # Animated activity grid
│   │   │   ├── ActivityCard.tsx      # Single activity card
│   │   │   ├── ItineraryPanel.tsx    # Day-by-day AI itinerary
│   │   │   ├── ItineraryDay.tsx      # Single day row with stagger animation
│   │   │   ├── MapView.tsx           # Leaflet map with OpenStreetMap tiles + property/activity pins
│   │   │   └── InquiryModal.tsx      # WhatsApp message preview + countdown
│   │   └── shared/
│   │       ├── Navbar.tsx            # Top nav with user avatar
│   │       ├── PageTransition.tsx    # AnimatePresence page wrapper
│   │       ├── SkeletonCard.tsx      # Shimmer loading skeleton
│   │       └── StatusBadge.tsx       # Animated status pill
│   │
│   ├── lib/
│   │   ├── api.ts                    # All fetch calls to backend
│   │   ├── supabase.ts               # Supabase browser client
│   │   ├── store.ts                  # Zustand global state
│   │   └── utils.ts                  # cn(), formatDate(), etc.
│   │
│   ├── hooks/
│   │   ├── useProperties.ts          # TanStack Query: fetch properties
│   │   ├── useActivities.ts          # TanStack Query: fetch activities
│   │   ├── useTrip.ts                # TanStack Query: fetch trip + itinerary
│   │   └── useAuth.ts                # Supabase session management
│   │
│   ├── types/
│   │   └── index.ts                  # All TypeScript types (Property, Activity, Trip, etc.)
│   │
│   ├── public/
│   │   └── fonts/                    # Self-hosted Inter + Syne fonts
│   │
│   ├── .env.local.example
│   ├── tailwind.config.ts
│   └── next.config.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD pipeline
│
├── docker-compose.yml                # Local dev: backend + ai-service
└── README.md
```

---

## PHASE 0 — MANUAL SETUP [YOU DO ALL OF THIS FIRST]

**The AI cannot proceed until every item in this phase is done.**
**Collect all credentials into one document before starting Phase 1.**

---

### 0.1 — Create a Supabase Project [YOU]

1. Go to https://supabase.com → create a free account
2. Click **New Project** → name it `retreat`
3. Set a strong database password. Save it.
4. Wait for provisioning (~2 minutes)
5. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY` (backend only — never expose to frontend)

---

### 0.2 — Run Database Schema in Supabase [YOU]

1. In your Supabase project → **SQL Editor → New Query**
2. Paste and run this SQL exactly:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- TRIPS
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  destination_lat FLOAT NOT NULL,
  destination_lng FLOAT NOT NULL,
  checkin DATE NOT NULL,
  checkout DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed')),
  itinerary JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPERTY INTERACTIONS (interested / not interested)
CREATE TABLE property_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('booking', 'vrbo')),
  property_snapshot JSONB NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('interested', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INQUIRIES (automated booking requests)
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  property_snapshot JSONB NOT NULL,
  ai_message TEXT NOT NULL,
  final_message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  wa_link TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY SAVES
CREATE TABLE saved_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  activity_snapshot JSONB NOT NULL,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_inquiries_trip_id ON inquiries(trip_id);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_interactions_trip_id ON property_interactions(trip_id);
CREATE INDEX idx_saved_activities_trip_id ON saved_activities(trip_id);
```

3. Click **Run**. Confirm no errors.

---

### 0.3 — Set Up Google Cloud Console [YOU]

1. Go to https://console.cloud.google.com → create project named `retreat`
2. Go to **APIs & Services → Library** and enable:
   - `Places API (New)` — this is the only Google API needed. Do **not** enable Maps JavaScript API; the map is handled by Leaflet + OpenStreetMap.
3. Go to **APIs & Services → Credentials → Create Credentials → API Key**
   - Restrict it to `Places API (New)` only
   - Save as: `GOOGLE_PLACES_API_KEY`
4. Go to **APIs & Services → OAuth Consent Screen**
   - User Type: External → App name: Retreat → add scope: `openid`, `email`, `profile`
5. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Web Application
   - Authorized redirect URIs: `https://[YOUR_SUPABASE_PROJECT_REF].supabase.co/auth/v1/callback`
   - Copy: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
6. Go back to Supabase → **Authentication → Providers → Google** → paste these two values → Save

---

### 0.4 — Set Up RapidAPI (Booking.com + Airbnb) [YOU]

Both Booking.com and Airbnb are accessed through RapidAPI using a single API key.

1. Go to https://rapidapi.com → sign in to your existing account
2. Subscribe to **Booking.com API** (by booking-com15):
   - URL: https://rapidapi.com/booking-com15/api/booking-com15
   - Select the **Free** plan
3. Subscribe to **Airbnb API** (by airbnb13):
   - URL: https://rapidapi.com/airbnb13/api/airbnb13 (or search "Airbnb" and find the one with highest usage)
   - Select the **Free** plan
4. Go to **My Apps → Default App → Authorization**
5. Copy your key: `RAPIDAPI_KEY`
6. Note the two host values — these go into your `.env`:
   - `RAPIDAPI_BOOKING_HOST=booking-com15.p.rapidapi.com`
   - `RAPIDAPI_AIRBNB_HOST=airbnb13.p.rapidapi.com`

**Important:** Both APIs share the same `RAPIDAPI_KEY`. You do not need separate keys.

**Rate limits on free tier:**
- Booking.com (RapidAPI): ~100 requests/month free — Redis caching is critical
- Airbnb (RapidAPI): varies by provider — check your subscribed plan
- Never call either API without checking Redis cache first

---

### 0.5 — Set Up Upstash Redis [YOU]

1. Go to https://upstash.com → create free account
2. Click **Create Database**
   - Name: `retreat-cache`
   - Type: Regional
   - Region: `us-east-1`
3. After creation, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

### 0.6 — Set Up Upstash QStash [YOU]

1. In your Upstash dashboard → go to **QStash** tab
2. Copy:
   - `QSTASH_TOKEN`
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`
3. Your worker endpoint (to be used later): `https://[your-railway-backend]/worker/inquiry`

---

### 0.7 — Get NVIDIA NIM API Key [YOU]

1. Go to https://build.nvidia.com → sign in or create a free account
2. Go to **API Keys → Generate API Key**
3. Name it `retreat`
4. Copy: `NVIDIA_API_KEY`
5. Base URL to use throughout: `https://integrate.api.nvidia.com/v1`
6. Model to use throughout: `meta/llama-3.1-70b-instruct` (free tier available — 1000 credits on signup)
7. The NVIDIA NIM API is OpenAI-compatible — use the `openai` Python SDK pointed at NVIDIA's base URL

---

### 0.8 — WhatsApp Setup [YOU]

No account, API, or credentials needed. WhatsApp deep links work without any setup.

The app uses `wa.me` links to open WhatsApp on the user's own device with the message pre-filled:

```
https://wa.me/{host_phone_number}?text={url_encoded_message}
```

The message is sent **from the user's own WhatsApp account** to the host. The backend only generates the link — it never sends a message itself.

**What you need to do:** Nothing. No step required here. Skip to 0.9.

---

### 0.9 — Maps Setup [YOU]

Nothing to do. Leaflet + OpenStreetMap require no account, no API key, and no credit card.

Install during Phase 8: `npm install leaflet react-leaflet @types/leaflet`

OpenStreetMap tile URL used in `MapView.tsx`:
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

Attribution (required by OpenStreetMap license — must appear on the map):
```
© OpenStreetMap contributors
```

Skip to 0.10.

---

### 0.10 — Set Up Sentry [YOU]

1. Go to https://sentry.io → create free account
2. Create project → Platform: **Next.js** → name: `retreat-frontend` → copy DSN → `NEXT_PUBLIC_SENTRY_DSN`
3. Create project → Platform: **Node.js** → name: `retreat-backend` → copy DSN → `SENTRY_DSN`
4. Create project → Platform: **Python (FastAPI)** → name: `retreat-ai` → copy DSN → `AI_SENTRY_DSN`

---

### 0.11 — Set Up Axiom (Logging) [YOU]

1. Go to https://axiom.co → create free account (no credit card)
2. Go to **Datasets → New Dataset** → name it `retreat-backend` → create
3. Go to **Settings → API Tokens → New API Token**
   - Name: `retreat`
   - Permissions: **Ingest** only
   - Copy the token → `AXIOM_API_KEY`
4. Save the dataset name: `AXIOM_DATASET=retreat-backend`
5. Railway log drain is configured in Phase 11 after deploy — skip for now

---

### 0.12 — Set Up Railway [YOU]

1. Go to https://railway.app → create account (connect your GitHub)
2. Create a new project called `retreat`
3. You will deploy two services here: `backend` (Node.js) and `ai-service` (Python)
4. Railway auto-deploys from GitHub on push — no manual deploy commands needed
5. Note your Railway project domain after deploying — it looks like `https://retreat-backend.up.railway.app`

---

### 0.13 — Create GitHub Repository [YOU]

1. Create a new private repository named `retreat`
2. Clone locally and initialize the folder structure (Phase 1 will populate it)
3. Never commit `.env`, `.env.local`, or any file containing a real key

---

### 0.14 — Create Your .env Files [YOU]

Create these two files locally. Never commit them.

**`backend/.env`**
```env
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Cache
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Queue
QSTASH_TOKEN=your_qstash_token
QSTASH_CURRENT_SIGNING_KEY=your_qstash_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_signing_key

# RapidAPI (Booking.com + Airbnb)
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_BOOKING_HOST=booking-com15.p.rapidapi.com
RAPIDAPI_AIRBNB_HOST=airbnb13.p.rapidapi.com

# Google Places
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# WhatsApp
# No credentials needed — wa.me deep links require no API key

# AI Service (internal URL)
AI_SERVICE_URL=http://localhost:8000

# Logging
AXIOM_API_KEY=your_axiom_api_key
AXIOM_DATASET=retreat-backend

# Sentry
SENTRY_DSN=your_backend_sentry_dsn

# Worker auth secret (shared with QStash)
WORKER_SECRET=generate-a-random-32-char-string
```

**`ai-service/.env`**
```env
ENVIRONMENT=development
PORT=8000

NVIDIA_API_KEY=your_nvidia_api_key

SENTRY_DSN=your_ai_sentry_dsn
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SENTRY_DSN=your_frontend_sentry_dsn
```

---

## PHASE 1 — BACKEND FOUNDATION [AI]

**Start here only after Phase 0 is 100% complete.**

---

### 1.1 — Initialize Node.js Backend

Create `backend/package.json` with these exact dependencies:

```json
{
  "name": "retreat-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/rate-limit": "^9.0.0",
    "@fastify/helmet": "^12.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@upstash/redis": "^1.34.0",
    "@upstash/qstash": "^2.7.0",
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "@sentry/node": "^8.0.0",
    "zod": "^3.23.0",
    "dotenv": "^16.4.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.11.0",
    "@types/node": "^20.0.0"
  }
}
```

Create `backend/tsconfig.json` with `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`, `outDir: dist`, `rootDir: src`.

---

### 1.2 — Config Module

Build `backend/src/config.ts`:
- Use `dotenv.config()` at the top
- Export a single `config` object with all typed env vars
- Throw an error at startup if any required variable is missing
- Required variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `RAPIDAPI_KEY`, `RAPIDAPI_BOOKING_HOST`, `RAPIDAPI_AIRBNB_HOST`, `GOOGLE_PLACES_API_KEY`, `AI_SERVICE_URL`, `WORKER_SECRET`
- Never import `process.env` anywhere else in the project — only from this file

---

### 1.3 — Logger

Build `backend/src/lib/logger.ts`:
- Create a Pino logger instance
- In development: use `pino-pretty` transport for readable logs
- In production: output plain JSON (Railway drain picks it up automatically)
- Export the logger as default
- Log format must include: `time`, `level`, `requestId`, `msg`

---

### 1.4 — Fastify App Entry Point

Build `backend/src/index.ts`:

- Create Fastify instance with `logger: false` (we use our own Pino logger)
- Register plugins in this order: `@fastify/helmet`, `@fastify/cors` (origin: `config.FRONTEND_URL`, credentials: true), `@fastify/rate-limit` (max: 100, timeWindow: '1 minute')
- Initialize Sentry with `config.SENTRY_DSN` (only when `NODE_ENV === 'production'`)
- Register all routes with prefix `/api/v1`
- Register the worker route at `/worker/inquiry` (no auth prefix, but secret-verified)
- Add a global error handler that logs to Pino and returns `{ error: message, requestId }`
- Listen on `config.PORT` (default 3001)

Route registration order:
```ts
app.register(healthRoutes, { prefix: '/api/v1' })
app.register(authRoutes, { prefix: '/api/v1' })
app.register(propertyRoutes, { prefix: '/api/v1' })
app.register(activityRoutes, { prefix: '/api/v1' })
app.register(tripRoutes, { prefix: '/api/v1' })
app.register(inquiryRoutes, { prefix: '/api/v1' })
app.register(messageRoutes, { prefix: '/api/v1' })
app.register(workerRoutes)
```

---

### 1.5 — Auth Middleware

Build `backend/src/middleware/authenticate.ts`:

- Fastify `preHandler` hook
- Reads `Authorization: Bearer <token>` header
- Verifies JWT using Supabase's `supabase.auth.getUser(token)`
- On success: attaches `request.user = { id, email }` to the request
- On failure: throws Fastify error with status 401, message "Unauthorized"
- Export as `authenticate` — inject this into protected routes only, not globally

---

### 1.6 — Health Route

Build `backend/src/routes/health.ts`:

`GET /api/v1/health`:
- Check Redis connectivity: `await redis.ping()` 
- Check Supabase: simple `select count` on `users` table
- Check AI service: `GET ${config.AI_SERVICE_URL}/health`
- Return: `{ status: 'ok', timestamp, services: { redis, supabase, ai_service } }`
- If any service fails: return status 503 with the failing service marked `'error'`

---

## PHASE 2 — SUPABASE AUTH [AI]

### 2.1 — Supabase Plugin

Build `backend/src/plugins/supabase.ts`:
- Create Supabase client with `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Export as `supabase` singleton
- Use service key for backend only — never expose to frontend via this client

### 2.2 — Auth Routes

Build `backend/src/routes/auth.ts`:

`POST /api/v1/auth/verify`:
- Body: `{ access_token: string }`
- Calls `supabase.auth.getUser(access_token)` to verify
- On success: upserts user in `users` table (`id`, `email`, `name`, `avatar_url`)
- Returns: `{ user: { id, email, name, avatar_url } }`

`GET /api/v1/auth/me` (protected — requires `authenticate` hook):
- Returns the current user object from the `users` table

---

## PHASE 3 — PROPERTY DISCOVERY [AI]

### 3.1 — Property Zod Schema

Build `backend/src/schemas/property.ts`:

```ts
export const PropertySchema = z.object({
  id: z.string(),
  platform: z.enum(['booking', 'airbnb']),
  name: z.string(),
  description: z.string().nullable(),
  imageUrls: z.array(z.string()),
  pricePerNight: z.number(),
  currency: z.string().default('USD'),
  totalPrice: z.number(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  maxGuests: z.number(),
  bedrooms: z.number().nullable(),
  amenities: z.array(z.string()),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  bookingUrl: z.string().url(),
})
export type Property = z.infer<typeof PropertySchema>
```

### 3.2 — RapidAPI Shared Client

Build `backend/src/lib/rapidapi.ts`:

- Export a single Axios instance with:
  - `baseURL` left empty (each service sets its own host)
  - Default headers: `'x-rapidapi-key': config.RAPIDAPI_KEY` and `'Content-Type': 'application/json'`
- This client is imported by both `bookingService.ts` and `airbnbService.ts`
- Never set the `x-rapidapi-host` header here — each service sets it per-request

### 3.3 — Booking.com Service (RapidAPI)

Build `backend/src/services/bookingService.ts`:

Function `searchProperties(params: { destId: string, checkin: string, checkout: string, adults: number, rooms: number, currencyCode: string })`:

1. Build cache key: `booking:${destId}:${checkin}:${checkout}:${adults}:${rooms}`
2. Check Redis — if hit, return cached array (TTL: 15 minutes)
3. If miss: call RapidAPI Booking.com endpoint:
   - `GET https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels`
   - Headers: `x-rapidapi-host: config.RAPIDAPI_BOOKING_HOST`
   - Query params: `dest_id`, `search_type: 'CITY'`, `adults`, `room_qty`, `checkin_date`, `checkout_date`, `currency_code`, `languagecode: 'en-us'`, `units: 'metric'`
4. Map each hotel in `response.data.data.hotels` to `PropertySchema`:
   - `id`: `hotel.hotel_id.toString()`
   - `platform`: `'booking'`
   - `name`: `hotel.property.name`
   - `imageUrls`: `[hotel.property.photoUrls[0]]` (first photo only to reduce payload)
   - `pricePerNight`: `hotel.property.priceBreakdown.grossPrice.value`
   - `currency`: `hotel.property.priceBreakdown.grossPrice.currency`
   - `totalPrice`: `hotel.property.priceBreakdown.grossPrice.value * nights`
   - `rating`: `hotel.property.reviewScore ?? null`
   - `reviewCount`: `hotel.property.reviewCount ?? null`
   - `lat`: `hotel.property.latitude`
   - `lng`: `hotel.property.longitude`
   - `address`: `hotel.property.wishlistName ?? ''`
   - `bookingUrl`: `'https://www.booking.com/hotel/' + hotel.hotel_id`
   - All other fields: `null`
5. Store in Redis with 15-minute TTL
6. Return normalized array
7. On API error: log with Pino, return empty array (do not throw — let Airbnb results still show)

### 3.4 — Airbnb Service (RapidAPI)

Build `backend/src/services/airbnbService.ts`:

Function `searchProperties(params: { location: string, checkin: string, checkout: string, adults: number, currency: string })`:

1. Build cache key: `airbnb:${location}:${checkin}:${checkout}:${adults}`
2. Check Redis — if hit, return cached array (TTL: 15 minutes)
3. If miss: call RapidAPI Airbnb endpoint:
   - Find the correct search endpoint from the subscribed Airbnb RapidAPI provider (check the API docs tab on RapidAPI for the exact path — common: `GET /api/v1/searchPropertyByLocation` or `/search-results`)
   - Headers: `x-rapidapi-host: config.RAPIDAPI_AIRBNB_HOST`
   - Query params: `location`, `checkin`, `checkout`, `adults`, `currency`
4. Map each listing to `PropertySchema`:
   - `id`: listing's unique id as string
   - `platform`: `'airbnb'`
   - `name`: listing name/title
   - `imageUrls`: first photo URL
   - `pricePerNight`: nightly price value
   - `currency`: currency code
   - `totalPrice`: total price if returned, else `pricePerNight * nights`
   - `rating`: rating value or `null`
   - `reviewCount`: review count or `null`
   - `lat`: latitude (if returned — Airbnb APIs often omit this, set `0` as fallback)
   - `lng`: longitude (if returned — set `0` as fallback)
   - `address`: city/location string
   - `bookingUrl`: direct listing URL
   - All other fields: `null`
5. Store in Redis with 15-minute TTL
6. Return normalized array
7. On API error: log with Pino, return empty array (do not throw)

**Note to AI:** The exact Airbnb RapidAPI response shape depends on which provider is subscribed. Inspect the actual API response structure from RapidAPI's "Test Endpoint" tab before mapping fields. Never guess field names — log the raw response on first run and map from actual data.

### 3.5 — Properties Route

Build `backend/src/routes/properties.ts`:

`GET /api/v1/properties/search` (protected):
- Query params: `destination` (string), `destId` (string — Booking.com city ID), `checkin` (YYYY-MM-DD), `checkout` (YYYY-MM-DD), `guests` (number), `currency` (string, default `'USD'`)
- Validate all params with Zod — return 400 if invalid
- Run both searches in parallel: `Promise.allSettled([bookingService.searchProperties(...), airbnbService.searchProperties(...)])`
- Collect results from both — fulfilled results are included, rejected results are ignored
- Merge arrays, deduplicate by `id`, sort by `rating DESC`
- Return: `{ properties: Property[], sources: { booking: number, airbnb: number }, cached: boolean, count: number }`

---

## PHASE 4 — ACTIVITY DISCOVERY [AI]

### 4.1 — Activity Zod Schema

Build `backend/src/schemas/activity.ts`:

```ts
export const ActivitySchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  category: z.string(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  priceLevel: z.number().nullable(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  openingHours: z.array(z.string()).nullable(),
  phoneNumber: z.string().nullable(),
  website: z.string().nullable(),
  bookingUrl: z.string().nullable(),
  photoUrls: z.array(z.string()),
})
export type Activity = z.infer<typeof ActivitySchema>
```

### 4.2 — Places Service

Build `backend/src/services/placesService.ts`:

Function `searchActivities(params: { lat: number, lng: number, radius: number })`:

1. Build cache key: `activities:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`
2. Check Redis — if hit, return cached (TTL: 24 hours)
3. If miss: call Google Places API (New) `POST /v1/places:searchNearby`
   - Include fields mask: `places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.formattedAddress,places.location,places.currentOpeningHours,places.internationalPhoneNumber,places.websiteUri,places.photos,places.primaryType`
   - Types: `tourist_attraction`, `museum`, `park`, `restaurant`, `bar`, `night_club`, `spa`, `amusement_park`
4. Map each place to `ActivitySchema`
5. Store in Redis with 24-hour TTL
6. Return normalized array

### 4.3 — Activities Route

Build `backend/src/routes/activities.ts`:

`GET /api/v1/activities/search` (protected):
- Query params: `lat` (number), `lng` (number), `radius` (number, default 5000)
- Validate with Zod
- Call `placesService.searchActivities(params)`
- Return: `{ activities: Activity[], cached: boolean, count: number }`

---

## PHASE 5 — AI SERVICE [AI]

### 5.1 — Python Setup

Create `ai-service/requirements.txt`:

```txt
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.1
pydantic-settings==2.2.1
python-dotenv==1.0.1
openai==1.35.0
sentry-sdk[fastapi]==2.4.0
httpx==0.27.0
```

**Note:** NVIDIA NIM is OpenAI API-compatible. Use the `openai` Python SDK with `base_url` set to `https://integrate.api.nvidia.com/v1` and `api_key` set to `NVIDIA_API_KEY`. No separate NVIDIA SDK needed.

### 5.2 — AI Service Config

Build `ai-service/app/config.py`:
- Pydantic Settings class loading all env vars
- Required: `NVIDIA_API_KEY`
- Export `get_settings()` with `lru_cache`

### 5.3 — AI Service Main

Build `ai-service/app/main.py`:
- FastAPI app with title `Retreat AI Service`
- Add CORS: allow all origins for internal use only
- Init Sentry with `AI_SENTRY_DSN` in production
- Register routers: `/plan` and `/message`
- Add `GET /health` returning `{ "status": "ok" }`

### 5.4 — Trip Planner Service

Build `ai-service/app/services/planner.py`:

Function `generate_itinerary(destination, checkin, checkout, guests, properties, activities)`:

Initialize the client at module level:
```python
from openai import OpenAI
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=get_settings().NVIDIA_API_KEY
)
MODEL = "meta/llama-3.1-70b-instruct"
```

The function calls the NVIDIA NIM API with this exact prompt structure:

```python
SYSTEM_PROMPT = """You are a professional trip planner. Your output must be valid JSON matching the schema exactly.
Do not add commentary, explanations, or markdown. Only output the JSON object.
Never invent property IDs or activity IDs that were not in the input data.
Only reference properties and activities that exist in the provided lists."""

USER_PROMPT = f"""Plan a trip to {destination} from {checkin} to {checkout} for {guests} guests.

Available properties (use their exact IDs):
{json.dumps(properties[:10], indent=2)}

Available activities (use their exact IDs):
{json.dumps(activities[:20], indent=2)}

Return a JSON object with this exact schema:
{{
  "summary": "2-3 sentence trip overview",
  "recommended_property_ids": ["id1", "id2", "id3"],
  "days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "short theme name",
      "morning": {{ "activity_id": "id", "note": "why this activity" }},
      "afternoon": {{ "activity_id": "id", "note": "why this activity" }},
      "evening": {{ "activity_id": "id", "note": "why this activity" }},
      "meal_suggestion": "brief meal recommendation"
    }}
  ],
  "tips": ["tip1", "tip2", "tip3"]
}}"""
```

- Call `client.chat.completions.create(model=MODEL, messages=[{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":USER_PROMPT}], max_tokens=4096, temperature=0.3)`
- Use `temperature=0.3` — low temperature reduces hallucination on structured JSON output
- Parse `response.choices[0].message.content` as JSON
- Validate against the expected schema using Pydantic
- If JSON parse fails: retry once with an added instruction "Output only the JSON object, no other text". If second attempt fails: raise HTTPException 500

### 5.5 — Message Composer Service

Build `ai-service/app/services/composer.py`:

Function `draft_inquiry_message(property_name, property_address, checkin, checkout, guests, user_name)`:

Use the same `client` and `MODEL` initialized in `planner.py` (import from shared module or re-initialize with the same pattern).

System prompt:
```python
SYSTEM_PROMPT = """You draft short, polite WhatsApp messages from travelers to property hosts.
Rules:
- Maximum 200 words
- No markdown formatting (no bold, no bullets)
- Friendly and professional tone
- Ask about: availability, any additional fees, check-in process
- Sign off with the traveler's name
- Output only the message text, nothing else"""
```

- Call `client.chat.completions.create(model=MODEL, messages=[...], max_tokens=500, temperature=0.5)`
- Return `response.choices[0].message.content.strip()` as plain string
- This is a simple string return, not JSON

### 5.6 — Plan Router

Build `ai-service/app/routers/plan.py`:

`POST /plan`:
- Body: `{ destination, checkin, checkout, guests, properties: Property[], activities: Activity[] }`
- Validate with Pydantic
- Call `planner.generate_itinerary(...)`
- Return the itinerary object

### 5.7 — Message Router

Build `ai-service/app/routers/message.py`:

`POST /message`:
- Body: `{ property_name, property_address, checkin, checkout, guests, user_name }`
- Call `composer.draft_inquiry_message(...)`
- Return: `{ message: string }`

---

## PHASE 6 — TRIP MANAGEMENT [AI]

### 6.1 — Trip Routes

Build `backend/src/routes/trips.ts` (all protected):

`POST /api/v1/trips`:
- Body: `{ destination, destination_lat, destination_lng, checkin, checkout, guests }`
- Validate with Zod
- Insert into `trips` table
- Return the created trip object

`GET /api/v1/trips`:
- Returns all trips for the authenticated user, ordered by `created_at DESC`

`GET /api/v1/trips/:tripId`:
- Returns the trip with `id = tripId` and `user_id = request.user.id`
- Returns 404 if not found

`POST /api/v1/trips/:tripId/itinerary`:
- Fetches properties and activities from their respective services (with caching)
- POSTs to `AI_SERVICE_URL/plan` with the data
- Saves the returned itinerary as `itinerary` JSONB on the trip row
- Returns the updated trip

---

## PHASE 7 — INQUIRY WORKFLOW [AI]

This is the hero feature. Implement it exactly as described.

### 7.1 — Inquiry Route

Build `backend/src/routes/inquiries.ts` (protected):

`POST /api/v1/inquiries`:
- Body: `{ tripId, propertyId, platform, propertySnapshot: Property, hostPhone?: string }`
- Validate that the trip belongs to `request.user.id` — return 403 if not
- Check rate limit: max 10 inquiries per user per day (Redis key: `inquiry_limit:${userId}:${today}`)
- Call AI service `POST /message` to get draft message
- Build the `wa.me` deep link:
  - If `hostPhone` is provided: `https://wa.me/${hostPhone}?text=${encodeURIComponent(aiMessage)}`
  - If no `hostPhone`: `waLink = null` (frontend will show "Copy Message" instead)
- Insert inquiry row into DB with `status: 'draft'`, `ai_message`, `final_message: ai_message`, `wa_link`
- **Do not enqueue any QStash job** — there is no background send. The user sends it themselves via the link.
- Return: `{ inquiry: { id, ai_message, wa_link, status: 'draft' } }`

`GET /api/v1/inquiries`:
- Returns all inquiries for the user, ordered by `created_at DESC`

`PATCH /api/v1/inquiries/:id/message`:
- Body: `{ final_message: string }`
- Updates `final_message` and regenerates `wa_link` with the new message text
- Returns updated inquiry with new `wa_link`

`PATCH /api/v1/inquiries/:id/sent`:
- Body: none — called by frontend when user confirms they tapped Send in WhatsApp
- Updates inquiry `status = 'sent'`, `sent_at = now()`
- Returns updated inquiry

### 7.2 — WhatsApp Link Service

Build `backend/src/services/whatsappService.ts`:

Function `buildWaLink(hostPhone: string | null, messageText: string): string | null`:
- If `hostPhone` is null or empty: return `null`
- Sanitize `hostPhone`: strip spaces, dashes, parentheses. Ensure it starts with country code (e.g. `+923001234567` → `923001234567`)
- Return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(messageText)}`

Function `buildWaCopyFallback(messageText: string): string`:
- Returns the plain message text for clipboard copy when no phone number is available

**No API calls. No credentials. No external dependencies.** This service is pure string manipulation.

### 7.3 — QStash Service (for future async jobs only)

Build `backend/src/services/qstashService.ts`:

The QStash integration remains in the codebase for any future background jobs (e.g. sending reminder emails, pre-caching popular destinations). For now it has one utility function:

Function `enqueueJob(destination: string, body: object, delaySeconds?: number)`:
- Use `@upstash/qstash` Client to publish a message
- Destination: the worker endpoint URL
- Return the QStash message ID
- This function is not called by the inquiry flow — reserved for future use

---

## PHASE 8 — FRONTEND [AI]

This is the most important phase. The frontend must be visually stunning, dark-themed, animated, and reactive. Apply every rule from the FRAMER MOTION RULES section.

### 8.1 — Initialize Next.js Project

Create `frontend/` with Next.js 15 App Router:

```json
dependencies: [
  "next@15",
  "@supabase/supabase-js@2",
  "@supabase/auth-helpers-nextjs",
  "framer-motion@11",
  "@tanstack/react-query@5",
  "zustand@5",
  "leaflet",
  "react-leaflet",
  "@types/leaflet",
  "zod@3",
  "react-hook-form",
  "@hookform/resolvers",
  "axios",
  "@radix-ui/react-dialog",
  "@radix-ui/react-popover",
  "@radix-ui/react-select",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "date-fns",
  "lucide-react",
  "@sentry/nextjs@8"
]
```

### 8.2 — Root Layout

Build `frontend/app/layout.tsx`:
- Font: Inter (body), Syne (headings) — both via `next/font/google`
- Background: `#0F0E17` (brand.dark)
- Wrap children with: `QueryClientProvider`, `AuthProvider` (custom, wraps Supabase session)
- Apply `<AnimatePresence mode="wait">` around `{children}`
- Include `<Navbar />` on all pages except the landing page

### 8.3 — Landing Page

Build `frontend/app/page.tsx`:

Layout: full-viewport dark hero. Must include:
- `<FloatingOrbs />` — 3 blurred gradient circles positioned absolutely, animated with infinite `x/y` motion (colors: brand.primary, brand.secondary, brand.teal at 15% opacity)
- Large headline: "Plan less. **Retreat** more." — "Retreat" in gradient text (`from-brand-primary to-brand-secondary`)
- Subheadline: "AI-powered trip planning. Smart booking automation."
- "Continue with Google" button — uses Supabase OAuth, `whileTap={{ scale: 0.95 }}`, gradient background
- The entire hero entrance animates in: headline first (`delay: 0.2`), subheadline (`delay: 0.4`), button (`delay: 0.6`)

### 8.4 — Dashboard Page

Build `frontend/app/dashboard/page.tsx`:

Sections:
1. **Top greeting bar** — "Good morning, [name]" with current date
2. **Stats banner** — 3 animated counters: `trips planned`, `inquiries sent`, `destinations explored`. Numbers animate from 0 on mount using Framer Motion `animate()`
3. **Search form** (`<SearchForm />`) — destination input + date range picker + guest count selector. On submit: navigates to `/trip/new?...` with params
4. **My Trips grid** — staggered `<TripCard />` components for past trips

`<SearchForm />`:
- Glassmorphism card: `background: rgba(255,255,255,0.04)`, `border: 1px solid rgba(255,255,255,0.08)`, `backdrop-filter: blur(12px)`, `border-radius: 20px`
- Destination input with Nominatim autocomplete — on user typing (300ms debounce), call `GET https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5` and show a dropdown of results. On select: store `display_name`, `lat`, `lon` in form state. No API key needed.
- Date range picker (checkin / checkout)
- Guest count stepper (+/-)
- Submit button: gradient `brand.primary → brand.secondary`, full width

`<TripCard />`:
- Card background: `brand.card` (`#1A1826`)
- Destination name in Syne font, bold
- Dates, status badge (`<StatusBadge />`)
- Hover animation per FRAMER MOTION RULES

### 8.5 — Trip Detail Page

Build `frontend/app/trip/[tripId]/page.tsx`:

Three-column layout on desktop, stacked on mobile:

**Left column (35%):**
- `<PropertyStack />` — the swipeable card stack
- Shows properties one at a time
- Bottom row: ❌ (Not Interested) and ❤️ (Interested) buttons
- Swipe left/right animations per FRAMER MOTION RULES

**Middle column (40%):**
- `<ItineraryPanel />` — AI-generated itinerary
- Each day as a card (`<ItineraryDay />`)
- Days stagger in from left on mount
- Activity chips with icons (morning ☀️, afternoon 🌤️, evening 🌙)
- "Generate Itinerary" button triggers AI planning — shows streaming skeleton while loading

**Right column (25%):**
- `<MapView />` — Leaflet map with OpenStreetMap tiles
- Shows pins for all properties and activities
- Property pins: custom icon in `brand.primary` color
- Activity pins: custom icon in `brand.secondary` color
- Clicking a pin shows a Leaflet popup with name + rating
- Map must be loaded with `dynamic(() => import('../trip/MapView'), { ssr: false })` — Leaflet does not support SSR. This is non-negotiable; skipping it causes a build crash.

### 8.6 — Property Card Component

Build `frontend/components/trip/PropertyCard.tsx`:

This is the most animated component in the app:
- Dark card, `border-radius: 20px`
- Full-bleed hero image (top 60% of card)
- Property name in Syne font
- Price per night — large, `brand.accent` color
- Rating stars + review count
- Amenity chips (first 4, rest hidden)
- "View on Booking.com" external link
- Drag gesture: `useDragControls` + `useMotionValue` for x position
- As user drags right: card tints green, ❤️ icon fades in at scale
- As user drags left: card tints red, ❌ icon fades in at scale
- On release past threshold (120px): trigger the swipe-out animation

### 8.7 — Inquiry Modal

Build `frontend/components/trip/InquiryModal.tsx`:

Triggered when user taps "Interested":
- Modal slides up from bottom with spring animation
- Shows the AI-drafted WhatsApp message in an editable `<textarea>`
- "Edit" icon toggles textarea between read-only and editable
- When user edits and stops typing (500ms debounce): call `PATCH /inquiries/:id/message` to save and get updated `wa_link`
- Two action buttons at the bottom:
  - **If `wa_link` exists:** "Open in WhatsApp" button (green, WhatsApp icon) — `window.open(wa_link, '_blank')`. After user taps: call `PATCH /inquiries/:id/sent` to mark as sent. Show "✓ Sent" with teal checkmark animation.
  - **If no `wa_link`:** "Copy Message" button — copies `final_message` to clipboard + "View Listing" button opens the property `bookingUrl`. Show "✓ Copied" with animation. Call `PATCH /inquiries/:id/sent` when user copies.
- "Cancel" — dismisses modal, inquiry stays in DB as `draft`
- Note in modal footer: "This message will be sent from your WhatsApp account"

### 8.8 — Global State

Build `frontend/lib/store.ts` with Zustand:

```ts
interface ReturnState {
  // Search params
  searchParams: { destination: string, lat: number, lng: number, checkin: string, checkout: string, guests: number } | null
  setSearchParams: (params: ...) => void

  // Current trip
  currentTrip: Trip | null
  setCurrentTrip: (trip: Trip | null) => void

  // Property swipe state
  swipedPropertyIds: Set<string>
  interestedPropertyIds: Set<string>
  markInterested: (id: string) => void
  markSkipped: (id: string) => void

  // UI state
  mapSelectedId: string | null
  setMapSelectedId: (id: string | null) => void
}
```

### 8.9 — API Client

Build `frontend/lib/api.ts`:
- Create an Axios instance with `baseURL: NEXT_PUBLIC_API_URL`
- Add request interceptor: attaches `Authorization: Bearer ${supabaseSession.access_token}` to every request
- Add response interceptor: on 401, calls `supabase.auth.signOut()` and redirects to `/`
- Export typed functions for every backend endpoint (no raw Axios calls outside this file)

---

## PHASE 9 — LOGGING & OBSERVABILITY [AI]

### 9.1 — Request Logger Middleware

Build `backend/src/middleware/requestLogger.ts`:

Fastify `onRequest` + `onResponse` hooks:
- Generate a UUID `requestId` on each request
- Attach to `request.requestId`
- Log on request: `{ requestId, method, url, userAgent }`
- Log on response: `{ requestId, method, url, statusCode, responseTimeMs }`
- Return `X-Request-ID` header on all responses

### 9.2 — Structured Log Fields

Every Pino log call in routes and services must include:
- `requestId` — from request context
- `userId` — from `request.user.id` when available
- `service` — name of the service (e.g., `bookingService`, `placesService`)

Logs to implement in every route:
```ts
logger.info({ requestId, userId, service: 'propertiesRoute' }, 'properties_search_started')
logger.info({ requestId, userId, service: 'propertiesRoute', count, cached }, 'properties_search_completed')
logger.error({ requestId, userId, service: 'propertiesRoute', err }, 'properties_search_failed')
```

### 9.3 — Sentry Setup

Backend `src/plugins/sentry.ts`:
- Init Sentry with `SENTRY_DSN`, `environment: NODE_ENV`, `tracesSampleRate: 0.1`
- Add Fastify integration: `Sentry.setupFastifyErrorHandler(app)`

Frontend: run `npx @sentry/wizard@latest -i nextjs` during setup, which creates `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` automatically. Do not write these manually.

### 9.4 — Health Endpoint

The health endpoint (Phase 1.6) is the single most important monitoring surface. Implement it exactly as specified. UptimeRobot pings it every 5 minutes.

---

## PHASE 10 — CI/CD PIPELINE [AI]

### 10.1 — GitHub Actions Workflow

Build `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - name: Install backend deps
        run: cd backend && npm ci
      - name: Type check backend
        run: cd backend && npx tsc --noEmit
      - name: Install frontend deps
        run: cd frontend && npm ci
      - name: Type check frontend
        run: cd frontend && npx tsc --noEmit
      - name: Lint frontend
        run: cd frontend && npx next lint

  build-check:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Build backend
        run: cd backend && npm ci && npm run build
      - name: Build frontend check
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: cd frontend && npm ci && npm run build
```

Railway and Vercel auto-deploy from `main` — no separate deploy step needed in CI.

---

## PHASE 11 — DEPLOYMENT [AI + YOU]

### 11.1 — Railway Deployment [YOU]

1. In Railway dashboard → your `retreat` project → **New Service → GitHub Repo**
2. Select the repo, root directory: `backend` → Railway detects Node.js automatically
3. Add all `backend/.env` variables as Railway env vars
4. Add one more: `RAILWAY_ENVIRONMENT=production`
5. Under **Settings → Networking**: generate a public domain (e.g. `retreat-backend.up.railway.app`)
6. Repeat for `ai-service` directory — Railway detects Python/Uvicorn automatically
7. Add `AI_SERVICE_URL` in backend env vars pointing to the ai-service Railway URL
8. Set up Axiom log drain in Railway → your backend service → **Settings → Log Drains → Add Drain**
   - Format: `JSON`
   - URL: `https://api.axiom.co/v1/datasets/retreat-backend/ingest`
   - Header key: `Authorization` → value: `Bearer YOUR_AXIOM_API_KEY`
   - Save — Railway now streams all Pino JSON logs directly into Axiom

### 11.2 — Vercel Deployment [YOU]

1. Go to https://vercel.com → Import Project → select your repo, root: `frontend`
2. Add all `frontend/.env.local` variables as Vercel env vars
3. Set `NEXT_PUBLIC_API_URL` to your Railway backend URL (e.g. `https://retreat-backend.up.railway.app`)
4. Deploy
5. Copy the Vercel production URL → update Google Cloud Console OAuth redirect URIs with this URL

### 11.3 — Post-Deployment Verification [YOU]

Run these checks manually after deploy:
```bash
# Health check
curl https://retreat-backend.up.railway.app/api/v1/health

# Expected response:
# { "status": "ok", "services": { "redis": "ok", "supabase": "ok", "ai_service": "ok" } }
```

---

## PHASE 12 — FINAL CHECKLIST [YOU]

### Security
- [ ] No `.env` files committed to Git
- [ ] All protected routes return 401 without a valid JWT
- [ ] QStash worker endpoint verifies signature before processing
- [ ] WhatsApp access token is in env vars — never in frontend code
- [ ] Supabase `service_role` key is backend only — never exposed to Next.js frontend

### Functionality
- [ ] Google OAuth login works end-to-end
- [ ] Property search returns results from Booking.com
- [ ] Activity search returns results from Google Places
- [ ] AI itinerary generates without errors
- [ ] Tapping "Interested" creates an inquiry in DB
- [ ] WhatsApp message sends after countdown (test with your own number)
- [ ] Swipe animations work on mobile touch
- [ ] Map shows property and activity pins correctly

### Observability
- [ ] `GET /api/v1/health` returns all services "ok" in production
- [ ] Sentry receives a test error from both frontend and backend
- [ ] Axiom shows structured logs from Railway (search by `requestId` or `userId`)
- [ ] UptimeRobot configured to ping health endpoint every 5 minutes

### Frontend Quality
- [ ] All page transitions use AnimatePresence slide-up animation
- [ ] Property cards animate out correctly on swipe
- [ ] Inquiry modal countdown works and sends message
- [ ] Dashboard stats animate from 0 on mount
- [ ] All buttons have `whileTap` scale effect
- [ ] Loading skeletons appear while data is fetching
- [ ] App works on mobile viewport (375px width)

---

## ENVIRONMENT VARIABLES — COMPLETE REFERENCE

| Variable | Service | Description |
|---|---|---|
| `NODE_ENV` | Backend | `development` or `production` |
| `PORT` | Backend | `3001` |
| `SUPABASE_URL` | Backend + Frontend | From Supabase settings |
| `SUPABASE_ANON_KEY` | Backend + Frontend | From Supabase settings |
| `SUPABASE_SERVICE_KEY` | Backend only | From Supabase settings — never frontend |
| `UPSTASH_REDIS_REST_URL` | Backend | From Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | Backend | From Upstash dashboard |
| `QSTASH_TOKEN` | Backend | From Upstash QStash |
| `QSTASH_CURRENT_SIGNING_KEY` | Backend | From Upstash QStash |
| `QSTASH_NEXT_SIGNING_KEY` | Backend | From Upstash QStash |
| `RAPIDAPI_KEY` | Backend | From RapidAPI dashboard → My Apps |
| `RAPIDAPI_BOOKING_HOST` | Backend | `booking-com15.p.rapidapi.com` |
| `RAPIDAPI_AIRBNB_HOST` | Backend | `airbnb13.p.rapidapi.com` (or subscribed provider host) |
| `GOOGLE_PLACES_API_KEY` | Backend | From Google Cloud Console |
| `AI_SERVICE_URL` | Backend | Railway URL of the Python AI service |
| `AXIOM_API_KEY` | Backend | From Axiom → Settings → API Tokens |
| `AXIOM_DATASET` | Backend | `retreat-backend` (the dataset name you created) |
| `SENTRY_DSN` | Backend | From Sentry backend project |
| `WORKER_SECRET` | Backend | Random 32-char string — shared secret for worker auth |
| `NVIDIA_API_KEY` | AI Service | From build.nvidia.com → API Keys |
| `AI_SENTRY_DSN` | AI Service | From Sentry ai project |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Same as SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Same as SUPABASE_ANON_KEY |
| `NEXT_PUBLIC_API_URL` | Frontend | Railway backend URL |
| `NEXT_PUBLIC_SENTRY_DSN` | Frontend | From Sentry frontend project |
