# Retreat

AI-powered trip planning and booking automation — search properties, discover activities, generate itineraries, and draft WhatsApp inquiries to hosts.

## Stack

- **Frontend:** Next.js 15, Tailwind CSS 4, Framer Motion, TanStack Query, Zustand
- **Backend:** Node.js 22, Fastify 5, Supabase, Upstash Redis
- **AI:** Python 3.12, FastAPI, NVIDIA NIM (Llama 3.1 70B)

## Local development

### Prerequisites

- Node.js 22+
- Python 3.12+
- Phase 0 env files: `backend/.env`, `ai-service/.env`, `frontend/.env.local`

### Run services

```bash
# Terminal 1 — AI service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm install
npm run dev

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

Or with Docker:

```bash
docker compose up --build
```

### URLs

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |
| AI       | http://localhost:8000 |
| Health   | http://localhost:3001/api/v1/health |

## Deployment

See `implementation.md` Phase 11 — Railway (backend + ai-service), Vercel (frontend).
