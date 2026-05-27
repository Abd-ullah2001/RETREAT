---
name: Retreat App Overview
overview: The implementation guide describes an AI-powered travel operations platform (codename "antigravity-travel") that aggregates real travel data, generates structured itineraries via LangGraph + OpenAI, and supports human-approved messaging automation. Your Retreat repo currently contains only the spec and a stub `main.py` — the monorepo still needs to be built per the 5-phase checklist.
todos:
  - id: accounts-foundation
    content: Create GitHub repo, Docker/Python/Node tooling, generate APP_SECRET_KEY + JWT_SECRET_KEY, OpenAI + Sentry accounts
    status: pending
  - id: travel-apis
    content: Register Amadeus, Google Cloud (Places/Maps), Yelp or Foursquare, OpenWeather; store keys for Phase 2
    status: pending
  - id: automation-apis
    content: Set up Twilio WhatsApp sandbox + Zapier webhook/secret for Phase 4 messaging
    status: pending
  - id: cloud-deploy
    content: AWS (Terraform, Secrets Manager, IAM), Vercel token, GitHub Actions secrets, Slack webhook, domains when deploying
    status: pending
isProject: false
---

# AI Travel Platform — Understanding & Human Setup Guide

## Current repo state

Your workspace (`[implementation.md](implementation.md)`) is the **production implementation spec**, not a finished app. The planned monorepo (`apps/web`, `apps/api`, `infrastructure/`, etc.) is **not present yet** — only a placeholder `[main.py](main.py)` exists. Everything below is what you are building toward.

---

## What the app is (product understanding)

**Name in spec:** AI Travel Operations Platform (repo: `antigravity-travel`)

**Purpose:** Help travelers plan trips end-to-end by:

1. Collecting trip preferences (destination, dates, budget, style, food/activity interests)
2. **Aggregating live data** from external APIs (hotels, activities, restaurants, weather)
3. Running a **multi-agent AI pipeline** (LangGraph) to rank options, cluster activities geographically, plan meals, optimize logistics, validate budget, and output a **structured day-by-day itinerary** (JSON validated by Pydantic — never raw LLM text)
4. Letting users **review and approve** outbound inquiries (e.g. WhatsApp via Twilio) — **no autonomous booking or negotiation** (explicit safety rule in Phase 4)

**MVP constraints:**

- Trips max **30 days**, 1–20 travelers, budget $50–$100,000
- JWT auth (register / login / refresh)
- Rate limits on auth and AI endpoints

---

## Architecture (how pieces connect)

```mermaid
flowchart TB
    subgraph client [Frontend]
        NextJS["Next.js 15 on Vercel"]
    end

    subgraph api [Backend]
        FastAPI["FastAPI API"]
        Celery["Celery Workers"]
        Beat["Celery Beat"]
    end

    subgraph data [Data layer]
        PG["PostgreSQL"]
        Redis["Redis cache + queues"]
    end

    subgraph ai [AI layer]
        LangGraph["LangGraph agents"]
        OpenAI["OpenAI gpt-4o"]
    end

    subgraph external [External APIs]
        Amadeus["Amadeus hotels"]
        Google["Google Places / Maps"]
        Yelp["Yelp / Foursquare"]
        Weather["OpenWeather"]
        Events["Ticketmaster / TripAdvisor"]
    end

    subgraph automation [Automation]
        Twilio["Twilio WhatsApp"]
        Zapier["Zapier webhooks"]
    end

    NextJS -->|REST JWT| FastAPI
    FastAPI --> PG
    FastAPI --> Redis
    FastAPI -->|enqueue| Celery
    Celery --> Redis
    Beat --> Celery
    Celery --> external
    FastAPI --> LangGraph
    LangGraph --> OpenAI
    FastAPI --> Twilio
    Zapier --> FastAPI
```



**Deploy target (from spec):**

- **Frontend:** Vercel (`travel.antigravity.io` prod, `staging.antigravity.io` staging)
- **Backend + workers:** AWS ECS Fargate + ECR, RDS PostgreSQL, ElastiCache Redis
- **Secrets (prod):** AWS Secrets Manager (not plain env on ECS)
- **CI/CD:** GitHub Actions → lint/test → ECR push → ECS deploy → Vercel deploy
- **Observability:** Sentry, CloudWatch structured JSON logs, Flower for Celery

**AI pipeline (7 agents, sequential):**
PreferenceExtraction → AccommodationRanking → ActivityIntelligence → DiningIntelligence → LogisticsOptimization → BudgetOptimization → AIRefinement → StructuredOutputValidator → DB

**Async work (Celery queues):** accommodation, activity, restaurant, weather, itinerary, inquiry (+ dead_letter_queue)

---

## Build phases (what gets built when)


| Phase               | Focus                                                             | You need APIs/accounts?                       |
| ------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| **1 — Foundation**  | Monorepo, Docker Compose, DB migrations, auth, health, Sentry, CI | Minimal: secrets you generate + Sentry        |
| **2 — Aggregation** | Celery tasks pulling real travel data                             | Amadeus, Google, Yelp/Foursquare, OpenWeather |
| **3 — AI planning** | LangGraph + structured OpenAI calls                               | OpenAI (paid)                                 |
| **4 — Automation**  | Inquiry approval UI, WhatsApp, Zapier                             | Twilio, Zapier                                |
| **5 — Production**  | Terraform/AWS, ECS, alarms, prod secrets                          | AWS, Vercel, GitHub, Slack, Codecov           |


---

## Human action checklist (do these in order)

### A. Accounts & tools (one-time) 


| #   | Action                    | Why                 | Steps                                                                                                                                                                                                                                    |
| --- | ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **GitHub repo**           | CI/CD + secrets     | Create repo (or use existing). Add branches `main` (prod) and `develop` (staging). Enable GitHub Actions.                                                                                                                                |
| A2  | **Docker Desktop**        | Local dev stack     | Install Docker Desktop. Verify: `docker compose version`.                                                                                                                                                                                |
| A3  | **Python 3.12 + Node 20** | Match CI versions   | Install locally for non-Docker dev.                                                                                                                                                                                                      |
| A4  | **OpenAI account**        | AI itinerary engine | 1. Go to [platform.openai.com](https://platform.openai.com). 2. Create API key. 3. Add billing / set usage limits. 4. Copy key → `OPENAI_API_KEY`. 5. For CI, create a **separate low-limit key** → GitHub secret `OPENAI_API_KEY_TEST`. |
| A5  | **Sentry project**        | Error tracking      | 1. [sentry.io](https://sentry.io) → New project (Python FastAPI + Next.js). 2. Copy DSN → `SENTRY_DSN`. Set `SENTRY_ENVIRONMENT=development`.                                                                                            |
| A6  | **Generate app secrets**  | Auth & signing      | Run locally (PowerShell): `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])` twice → `APP_SECRET_KEY` and `JWT_SECRET_KEY`. **Never commit these.**                                          |


---

### B. External travel data APIs (Phase 2 — required for real search)

#### B1. Amadeus (accommodations / hotels)

- **Env vars:** `AMADEUS_API_KEY`, `AMADEUS_API_SECRET`
- **Used for:** Hotel offers (`test.api.amadeus.com` in dev per spec)
- **Steps:**
  1. Register at [developers.amadeus.com](https://developers.amadeus.com)
  2. Create an app in the Self-Service portal
  3. Copy **API Key** and **API Secret**
  4. Start with **test environment** (free tier); request production access when ready for live bookings data

#### B2. Google Cloud (Places + Maps)

- **Env vars:** `GOOGLE_PLACES_API_KEY`, `GOOGLE_MAPS_API_KEY` (can be same key if APIs enabled on one project)
- **Used for:** Activity search, routing
- **Steps:**
  1. [console.cloud.google.com](https://console.cloud.google.com) → New project
  2. **APIs & Services → Enable:** Places API (New), Maps JavaScript API, Directions API (if routing needed)
  3. **Credentials → Create API key**
  4. Restrict key: HTTP referrers (frontend) + IP (backend) as appropriate
  5. Enable **billing** on the project (Google requires it; set budget alerts)

#### B3. Yelp OR Foursquare (restaurants — spec says at least one)

**Option A — Yelp**

- **Env var:** `YELP_API_KEY`
- **Steps:** [yelp.com/developers](https://www.yelp.com/developers) → Create app → Fusion API key

**Option B — Foursquare**

- **Env var:** `FOURSQUARE_API_KEY`
- **Steps:** [foursquare.com/developers](https://foursquare.com/developers) → Create project → Places API key

#### B4. OpenWeatherMap (forecasts)

- **Env var:** `OPENWEATHER_API_KEY`
- **Steps:** [openweathermap.org/api](https://openweathermap.org/api) → Sign up → API keys → copy key (activation can take ~10 min)

#### B5. Optional enrichment (listed in `.env.example`, not all required for MVP)


| Provider     | Env var                | Signup                                                           | MVP priority   |
| ------------ | ---------------------- | ---------------------------------------------------------------- | -------------- |
| TripAdvisor  | `TRIPADVISOR_API_KEY`  | Content API partner program                                      | Low — optional |
| Ticketmaster | `TICKETMASTER_API_KEY` | [developer.ticketmaster.com](https://developer.ticketmaster.com) | Low — events   |


---

### C. Messaging & automation (Phase 4)

#### C1. Twilio (WhatsApp)

- **Env vars:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
- **Steps:**
  1. [twilio.com/console](https://www.twilio.com/console) → Create account
  2. Copy **Account SID** and **Auth Token**
  3. **Messaging → Try WhatsApp** (sandbox) for dev: join sandbox from your phone; use sandbox number as `TWILIO_WHATSAPP_FROM` (format: `whatsapp:+14155238886`)
  4. For production: apply for **WhatsApp Business** sender (Meta approval required — can take days/weeks)
  5. Configure **webhook URL** on Twilio to point to your API `/messages/...` inbound route (after deployment)

#### C2. Zapier (workflow webhooks)

- **Env vars:** `ZAPIER_WEBHOOK_URL`, `ZAPIER_WEBHOOK_SECRET`
- **Steps:**
  1. [zapier.com](https://zapier.com) → Create Zap → **Webhooks by Zapier** trigger (Catch Hook)
  2. Copy webhook URL → `ZAPIER_WEBHOOK_URL`
  3. Generate a shared secret (random string) → `ZAPIER_WEBHOOK_SECRET`; configure Zapier to send `X-Zapier-Signature` HMAC (per spec section 8.5)

---

### D. Cloud & deployment (Phase 5 — when you deploy)

#### D1. AWS

- **Env vars (runtime via Secrets Manager in prod):** all API keys + DB URLs; `AWS_REGION=us-east-1`, `AWS_S3_BUCKET`, `CLOUDWATCH_LOG_GROUP`
- **Human steps:**
  1. AWS account + IAM user for CI with ECR/ECS permissions (staging + separate prod user per spec)
  2. Run Terraform in `infrastructure/terraform/` (RDS, ElastiCache, ECS, Secrets Manager) — **you apply Terraform**, not the doc
  3. Store all production secrets in **AWS Secrets Manager** (spec forbids plain-text secrets on ECS task defs)
  4. Create S3 bucket for assets (`antigravity-travel-assets` or your name)
  5. GitHub secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCESS_KEY_ID_PROD`, `AWS_SECRET_ACCESS_KEY_PROD`

#### D2. Vercel (frontend)

- **Env var (frontend):** `NEXT_PUBLIC_API_URL` → `http://localhost:8000` locally; staging/prod API URLs when deployed
- **Steps:**
  1. [vercel.com](https://vercel.com) → Import GitHub repo, root `apps/web`
  2. **Account Settings → Tokens** → create token → GitHub secret `VERCEL_TOKEN`
  3. Set production domain (or use Vercel default until you own `travel.antigravity.io`)

#### D3. GitHub Actions secrets (full list from spec §10.5)

Add under **Settings → Secrets and variables → Actions**:


| Secret                                                  | When                 |
| ------------------------------------------------------- | -------------------- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`           | Staging deploy       |
| `AWS_ACCESS_KEY_ID_PROD` / `AWS_SECRET_ACCESS_KEY_PROD` | Production deploy    |
| `VERCEL_TOKEN`                                          | Frontend deploy      |
| `OPENAI_API_KEY_TEST`                                   | CI tests             |
| `SLACK_WEBHOOK_URL`                                     | Deploy notifications |


Also configure **GitHub Environment `production`** with required reviewers (manual approval gate before prod deploy).

#### D4. Slack (optional but in CI)

- Create incoming webhook in Slack → `SLACK_WEBHOOK_URL` GitHub secret

#### D5. Codecov (optional)

- Connect repo at [codecov.io](https://codecov.io) for coverage uploads from CI (spec uses `--cov-fail-under=80`)

#### D6. Domains & DNS (when going live)

Point DNS to:

- `travel.antigravity.io` → Vercel
- `api.antigravity.io` / `api-staging.antigravity.io` → AWS load balancer
- Update CORS in FastAPI to match your real frontend domain

---

### E. Local environment file (you create this)

After Phase 1 scaffold exists, copy `.env.example` → `apps/api/.env` and `apps/web/.env.local`:

**Minimum to boot locally (Phase 1):**

```bash
APP_ENV=development
APP_SECRET_KEY=<generated>
JWT_SECRET_KEY=<generated>
DATABASE_URL=postgresql+asyncpg://dev:dev@localhost:5432/travel_dev
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3
OPENAI_API_KEY=<your-key>   # needed even in Phase 1 if any AI tests run
SENTRY_DSN=<optional-for-dev>
```

**Add as you reach each phase** — external API keys (B), Twilio/Zapier (C).

**Start stack (once docker-compose exists):**

```bash
cd infrastructure
docker compose up -d
# API: http://localhost:8000/docs
# Flower: http://localhost:5555
```

---

### F. Cost & compliance reminders (human decisions)

- **OpenAI + Google + Amadeus** can incur charges — set billing alerts on each platform
- **GDPR:** Sentry configured with `send_default_pii=False` in spec — keep it that way
- **Twilio WhatsApp production** requires business verification
- **Do not commit** `.env`, `.env.local`, or API keys (use `.env.example` only)

---

## What you build vs what you configure


| You (human)                             | Agent / developer implementation     |
| --------------------------------------- | ------------------------------------ |
| Create accounts, API keys, billing      | Scaffold monorepo per Section 1      |
| Fill `.env` / AWS Secrets Manager       | FastAPI, Celery, LangGraph code      |
| AWS/Vercel/GitHub/DNS setup             | Terraform, Docker, GitHub Actions    |
| Approve production deploys in GitHub    | Alembic migrations, tests, routers   |
| Twilio/Zapier webhook URLs after deploy | Inquiry approval UI, messaging flows |


---

## Suggested order of operations for you

1. **Today (free/low friction):** A1, A2, A3, A6, A4 (OpenAI), A5 (Sentry)
2. **Before Phase 2 coding:** B1–B4 API keys in a password manager
3. **Before Phase 4:** C1 Twilio sandbox, C2 Zapier test Zap
4. **Before first deploy:** D1–D3 AWS + Vercel + GitHub secrets
5. **Before public launch:** D6 domains, Twilio production WhatsApp, AWS prod secrets, production approval gate tested

---

## Key safety rules to remember (from spec)

- AI output **must** pass Pydantic validation before storage
- Outbound WhatsApp **only after user approval**
- **No autonomous booking** in MVP
- Webhook signatures **must** be verified (Zapier HMAC, Twilio validator)
- Swagger `/docs` **disabled** in production

