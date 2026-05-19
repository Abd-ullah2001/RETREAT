# AI Travel Operations Platform — Production Implementation Reference

> **Author:** Google Antigravity Engineering Team  
> **Document Type:** MVP Production Implementation Guide  
> **Stack:** Next.js 15 · FastAPI · PostgreSQL · Redis · Celery · LangGraph · AWS ECS · Vercel  
> **Status:** MVP — Active Development  
> **Last Updated:** 2026-05-19

---

## Table of Contents

1. [Repository Structure](#1-repository-structure)
2. [Environment & Configuration Management](#2-environment--configuration-management)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Layer](#4-database-layer)
5. [Queue & Async Architecture](#5-queue--async-architecture)
6. [Cache Management](#6-cache-management)
7. [AI Orchestration Layer](#7-ai-orchestration-layer)
8. [Safety, Security & Resilience](#8-safety-security--resilience)
9. [Logging, Monitoring & Observability](#9-logging-monitoring--observability)
10. [CI/CD Pipeline — GitHub Actions](#10-cicd-pipeline--github-actions)
11. [Docker & Deployment](#11-docker--deployment)
12. [External API Resilience](#12-external-api-resilience)
13. [Incident Response Runbook](#13-incident-response-runbook)
14. [Development Phase Checklist](#14-development-phase-checklist)

---

## 1. Repository Structure

### 1.1 Monorepo Layout

```
antigravity-travel/
├── .github/
│   └── workflows/
│       ├── pr-checks.yml
│       ├── deploy-staging.yml
│       ├── deploy-production.yml
│       └── rollback.yml
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/                  # App router pages
│   │   │   ├── components/
│   │   │   ├── store/                # Zustand stores
│   │   │   ├── hooks/                # React Query hooks
│   │   │   ├── lib/                  # API clients, utils
│   │   │   └── types/
│   │   ├── .env.local
│   │   └── next.config.ts
│   └── api/                          # FastAPI backend
│       ├── app/
│       │   ├── main.py               # App entrypoint
│       │   ├── config.py             # Settings (Pydantic BaseSettings)
│       │   ├── dependencies.py       # Shared FastAPI dependencies
│       │   ├── middleware/
│       │   │   ├── logging.py        # Request/response logging middleware
│       │   │   ├── rate_limit.py     # Rate limiting middleware
│       │   │   ├── correlation.py    # Correlation ID injection
│       │   │   └── error_handler.py  # Global exception handlers
│       │   ├── routers/
│       │   │   ├── auth.py
│       │   │   ├── trips.py
│       │   │   ├── accommodations.py
│       │   │   ├── activities.py
│       │   │   ├── restaurants.py
│       │   │   ├── itinerary.py
│       │   │   ├── messaging.py
│       │   │   └── health.py
│       │   ├── services/
│       │   │   ├── auth_service.py
│       │   │   ├── trip_service.py
│       │   │   ├── accommodation_service.py
│       │   │   ├── activity_service.py
│       │   │   ├── restaurant_service.py
│       │   │   ├── weather_service.py
│       │   │   ├── ai_planner_service.py
│       │   │   ├── messaging_service.py
│       │   │   └── automation_service.py
│       │   ├── workers/
│       │   │   ├── celery_app.py
│       │   │   ├── tasks/
│       │   │   │   ├── accommodation_tasks.py
│       │   │   │   ├── activity_tasks.py
│       │   │   │   ├── weather_tasks.py
│       │   │   │   ├── itinerary_tasks.py
│       │   │   │   └── messaging_tasks.py
│       │   │   └── beat_schedule.py  # Periodic task schedule
│       │   ├── models/               # SQLAlchemy ORM models
│       │   ├── schemas/              # Pydantic request/response schemas
│       │   ├── db/
│       │   │   ├── session.py        # DB session factory
│       │   │   └── migrations/       # Alembic migrations
│       │   ├── cache/
│       │   │   ├── redis_client.py
│       │   │   └── strategies.py     # Cache TTL definitions
│       │   ├── ai/
│       │   │   ├── agents/
│       │   │   ├── graphs/
│       │   │   ├── prompts/
│       │   │   └── validators.py     # Structured output validators
│       │   └── utils/
│       │       ├── circuit_breaker.py
│       │       ├── retry.py
│       │       ├── geo.py
│       │       └── sanitize.py
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── conftest.py
│       ├── Dockerfile
│       ├── Dockerfile.worker
│       ├── alembic.ini
│       └── pyproject.toml
├── infrastructure/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── ecs.tf
│   │   ├── rds.tf
│   │   ├── elasticache.tf
│   │   ├── secrets.tf
│   │   └── variables.tf
│   └── docker-compose.yml            # Local dev environment
├── docs/
│   ├── implementation.md             # This file
│   ├── api-reference.md
│   └── adr/                          # Architecture Decision Records
└── .env.example
```

### 1.2 Naming Conventions

| Context | Convention | Example |
|---|---|---|
| Python files | snake_case | `trip_service.py` |
| Python classes | PascalCase | `TripService` |
| Python functions | snake_case | `get_trip_by_id` |
| API routes | kebab-case | `/trips/{id}/itinerary-items` |
| DB tables | snake_case plural | `itinerary_items` |
| Celery tasks | dot-namespaced | `tasks.accommodation.fetch` |
| Redis keys | colon-namespaced | `trip:{id}:weather` |
| Env vars | SCREAMING_SNAKE | `OPENAI_API_KEY` |
| React components | PascalCase | `ItineraryDayCard` |
| Zustand stores | camelCase | `useTripStore` |

---

## 2. Environment & Configuration Management

### 2.1 Environment Files

Never commit secrets. Use `.env.example` as the contract.

```bash
# .env.example — commit this file with placeholder values

# ─── App ───────────────────────────────────────────────
APP_ENV=development                  # development | staging | production
APP_SECRET_KEY=CHANGEME
DEBUG=true

# ─── Database ──────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/travel_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
DATABASE_POOL_TIMEOUT=30

# ─── Redis ─────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_DB=1
REDIS_QUEUE_DB=2
REDIS_MAX_CONNECTIONS=50

# ─── Celery ────────────────────────────────────────────
CELERY_BROKER_URL=redis://localhost:6379/2
CELERY_RESULT_BACKEND=redis://localhost:6379/3
CELERY_MAX_RETRIES=5
CELERY_RETRY_BACKOFF=60

# ─── JWT ───────────────────────────────────────────────
JWT_SECRET_KEY=CHANGEME
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# ─── AI ────────────────────────────────────────────────
OPENAI_API_KEY=CHANGEME
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
OPENAI_TIMEOUT_SECONDS=45
OPENAI_MAX_RETRIES=3

# ─── External APIs ─────────────────────────────────────
AMADEUS_API_KEY=CHANGEME
AMADEUS_API_SECRET=CHANGEME
GOOGLE_PLACES_API_KEY=CHANGEME
GOOGLE_MAPS_API_KEY=CHANGEME
YELP_API_KEY=CHANGEME
FOURSQUARE_API_KEY=CHANGEME
OPENWEATHER_API_KEY=CHANGEME
TRIPADVISOR_API_KEY=CHANGEME
TICKETMASTER_API_KEY=CHANGEME

# ─── Messaging ─────────────────────────────────────────
TWILIO_ACCOUNT_SID=CHANGEME
TWILIO_AUTH_TOKEN=CHANGEME
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ZAPIER_WEBHOOK_URL=CHANGEME
ZAPIER_WEBHOOK_SECRET=CHANGEME

# ─── AWS ───────────────────────────────────────────────
AWS_REGION=us-east-1
AWS_S3_BUCKET=antigravity-travel-assets
CLOUDWATCH_LOG_GROUP=/antigravity/travel-api

# ─── Monitoring ────────────────────────────────────────
SENTRY_DSN=CHANGEME
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.2

# ─── Rate Limiting ─────────────────────────────────────
RATE_LIMIT_DEFAULT=100/minute
RATE_LIMIT_AI_ENDPOINTS=10/minute
RATE_LIMIT_AUTH_ENDPOINTS=5/minute
```

### 2.2 Pydantic Settings — Single Source of Truth

```python
# app/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal

class Settings(BaseSettings):
    # App
    app_env: Literal["development", "staging", "production"] = "development"
    app_secret_key: str
    debug: bool = False

    # Database
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 10
    database_pool_timeout: int = 30

    # Redis
    redis_url: str
    redis_cache_db: int = 1
    redis_queue_db: int = 2
    redis_max_connections: int = 50

    # Celery
    celery_broker_url: str
    celery_result_backend: str
    celery_max_retries: int = 5
    celery_retry_backoff: int = 60

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 30

    # AI
    openai_api_key: str
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 4096
    openai_timeout_seconds: int = 45
    openai_max_retries: int = 3

    # Rate limiting
    rate_limit_default: str = "100/minute"
    rate_limit_ai_endpoints: str = "10/minute"
    rate_limit_auth_endpoints: str = "5/minute"

    # Monitoring
    sentry_dsn: str | None = None
    sentry_traces_sample_rate: float = 0.2

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### 2.3 AWS Secrets Manager — Production Secrets

In production, all secrets are fetched from AWS Secrets Manager at container startup. Environment variables are never stored in ECS task definitions in plain text.

```python
# app/utils/secrets.py
import boto3
import json
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)

@lru_cache()
def get_secret(secret_name: str, region: str = "us-east-1") -> dict:
    """
    Fetch secret from AWS Secrets Manager.
    Cached in memory for the lifetime of the process.
    Raises RuntimeError if secret cannot be retrieved.
    """
    client = boto3.client("secretsmanager", region_name=region)
    try:
        response = client.get_secret_value(SecretId=secret_name)
        secret = json.loads(response["SecretString"])
        logger.info(f"Secret '{secret_name}' successfully loaded.")
        return secret
    except Exception as e:
        logger.critical(f"CRITICAL: Failed to load secret '{secret_name}': {e}")
        raise RuntimeError(f"Cannot start application: secret '{secret_name}' unavailable.") from e
```

---

## 3. Backend Architecture

### 3.1 FastAPI Application Bootstrap

```python
# app/main.py
import logging
import sentry_sdk
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.config import get_settings
from app.db.session import init_db
from app.cache.redis_client import init_redis, close_redis
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.correlation import CorrelationIDMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.error_handler import register_exception_handlers
from app.routers import auth, trips, accommodations, activities, restaurants, itinerary, messaging, health

settings = get_settings()
logger = logging.getLogger(__name__)

# ── Sentry — must be initialized before app starts ──────────────────────────
if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.app_env,
        traces_sample_rate=settings.sentry_traces_sample_rate,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
        send_default_pii=False,   # GDPR: never send PII to Sentry
    )
    logger.info("Sentry initialized.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle.
    All resource initialization happens here — never in module scope.
    """
    logger.info("Starting AI Travel Platform API...")
    await init_db()
    await init_redis()
    logger.info("Startup complete. Accepting requests.")
    yield
    logger.info("Shutting down...")
    await close_redis()
    logger.info("Shutdown complete.")

app = FastAPI(
    title="AI Travel Operations Platform",
    version="1.0.0-mvp",
    docs_url="/docs" if not settings.is_production else None,  # Disable Swagger in prod
    redoc_url=None,
    lifespan=lifespan,
)

# ── Middleware — order matters, outermost runs first ────────────────────────
app.add_middleware(CorrelationIDMiddleware)        # 1. Inject correlation ID
app.add_middleware(RequestLoggingMiddleware)        # 2. Log request/response
app.add_middleware(RateLimitMiddleware)             # 3. Rate limiting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://travel.antigravity.io"] if settings.is_production
                  else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID"],
)

# ── Exception Handlers ───────────────────────────────────────────────────────
register_exception_handlers(app)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(trips.router, prefix="/trips", tags=["trips"])
app.include_router(accommodations.router, prefix="/accommodations", tags=["accommodations"])
app.include_router(activities.router, prefix="/activities", tags=["activities"])
app.include_router(restaurants.router, prefix="/restaurants", tags=["restaurants"])
app.include_router(itinerary.router, prefix="/itinerary", tags=["itinerary"])
app.include_router(messaging.router, prefix="/messages", tags=["messaging"])
```

### 3.2 Middleware Implementation

#### Correlation ID Middleware

Every request gets a unique correlation ID. This ID propagates through logs, Celery tasks, AI calls, and external API requests — enabling full distributed tracing.

```python
# app/middleware/correlation.py
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from contextvars import ContextVar

correlation_id_var: ContextVar[str] = ContextVar("correlation_id", default="")

class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        correlation_id_var.set(correlation_id)
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response

def get_correlation_id() -> str:
    return correlation_id_var.get()
```

#### Request Logging Middleware

```python
# app/middleware/logging.py
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.middleware.correlation import get_correlation_id

logger = logging.getLogger("api.requests")

SENSITIVE_PATHS = ["/auth/login", "/auth/register"]

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        # Never log bodies for auth endpoints
        log_body = request.url.path not in SENSITIVE_PATHS

        logger.info(
            "request_processed",
            extra={
                "correlation_id": get_correlation_id(),
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client_ip": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", ""),
            }
        )

        # Alert on slow requests
        if duration_ms > 3000:
            logger.warning(
                "slow_request_detected",
                extra={"path": request.url.path, "duration_ms": duration_ms}
            )

        return response
```

#### Global Exception Handler

```python
# app/middleware/error_handler.py
import logging
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.middleware.correlation import get_correlation_id

logger = logging.getLogger("api.errors")

def register_exception_handlers(app: FastAPI):

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        correlation_id = get_correlation_id()
        logger.error(
            "unhandled_exception",
            extra={
                "correlation_id": correlation_id,
                "path": request.url.path,
                "method": request.method,
                "error": str(exc),
                "error_type": type(exc).__name__,
            },
            exc_info=True,
        )
        sentry_sdk.capture_exception(exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_server_error",
                "message": "An unexpected error occurred. Our team has been notified.",
                "correlation_id": correlation_id,
            }
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=422,
            content={"error": "validation_error", "message": str(exc)}
        )
```

### 3.3 Health Check Endpoints

Health endpoints are used by ECS, load balancers, and CI/CD pipelines for readiness and liveness verification.

```python
# app/routers/health.py
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from redis.asyncio import Redis
from app.db.session import get_db
from app.cache.redis_client import get_redis

router = APIRouter()
logger = logging.getLogger("health")

@router.get("/live")
async def liveness():
    """Kubernetes/ECS liveness probe. Always returns 200 if process is alive."""
    return {"status": "alive"}

@router.get("/ready")
async def readiness(db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis)):
    """
    Deep readiness check. ECS will NOT route traffic until this returns 200.
    Checks: PostgreSQL connectivity, Redis connectivity.
    """
    checks = {}

    # Check PostgreSQL
    try:
        await db.execute(text("SELECT 1"))
        checks["postgres"] = "ok"
    except Exception as e:
        logger.error(f"Readiness check: postgres failed — {e}")
        checks["postgres"] = "error"

    # Check Redis
    try:
        await redis.ping()
        checks["redis"] = "ok"
    except Exception as e:
        logger.error(f"Readiness check: redis failed — {e}")
        checks["redis"] = "error"

    all_healthy = all(v == "ok" for v in checks.values())
    status_code = 200 if all_healthy else 503

    return JSONResponse(
        status_code=status_code,
        content={"status": "ready" if all_healthy else "degraded", "checks": checks}
    )

@router.get("/metrics")
async def metrics():
    """Lightweight metrics endpoint for CloudWatch custom metrics."""
    from app.workers.celery_app import celery_app
    inspect = celery_app.control.inspect()
    active_tasks = inspect.active() or {}
    return {
        "active_celery_tasks": sum(len(v) for v in active_tasks.values()),
    }
```

---

## 4. Database Layer

### 4.1 Async SQLAlchemy Session Factory

```python
# app/db/session.py
import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("db")

engine = create_async_engine(
    settings.database_url,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_timeout=settings.database_pool_timeout,
    pool_pre_ping=True,          # Validate connections before use — prevents stale connections
    pool_recycle=3600,           # Recycle connections every hour
    echo=settings.debug,         # Log SQL only in debug mode, never in production
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

async def init_db():
    """Called at application startup. Validates DB connectivity."""
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection validated.")
    except Exception as e:
        logger.critical(f"CRITICAL: Cannot connect to database on startup: {e}")
        raise

async def get_db():
    """FastAPI dependency: yields an async DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### 4.2 Alembic Migration Strategy

```ini
# alembic.ini
[alembic]
script_location = app/db/migrations
sqlalchemy.url = %(DATABASE_URL)s

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic
```

**Migration Rules (enforced in code review):**

1. Every schema change requires an Alembic migration — no direct `ALTER TABLE` on production.
2. All migrations must be reversible (implement `downgrade()`).
3. Migrations must be tested in staging before production deployment.
4. Column drops require a 2-phase approach: first deprecate (keep column, stop writing), then drop in the next release.
5. Never modify an existing migration file. Always create a new one.

```python
# Example migration pattern for adding a nullable column safely
# app/db/migrations/versions/0002_add_ai_score_to_accommodations.py

def upgrade():
    op.add_column(
        "accommodations",
        sa.Column("ai_score", sa.Float(), nullable=True)  # Always nullable first
    )

def downgrade():
    op.drop_column("accommodations", "ai_score")
```

### 4.3 Connection Pool Monitoring

```python
# app/utils/db_health.py
import logging
from app.db.session import engine

logger = logging.getLogger("db.pool")

def log_pool_status():
    """Call periodically from Celery Beat to monitor pool health."""
    pool = engine.pool
    logger.info(
        "db_pool_status",
        extra={
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
        }
    )
    if pool.checkedout() / pool.size() > 0.85:
        logger.warning("DB_POOL_NEAR_CAPACITY: >85% connections in use. Consider scaling.")
```

---

## 5. Queue & Async Architecture

### 5.1 Celery Application Configuration

```python
# app/workers/celery_app.py
from celery import Celery
from celery.utils.log import get_task_logger
from kombu import Queue, Exchange
from app.config import get_settings

settings = get_settings()

celery_app = Celery("antigravity_travel")

celery_app.config_from_object({
    "broker_url": settings.celery_broker_url,
    "result_backend": settings.celery_result_backend,
    "broker_connection_retry_on_startup": True,
    "broker_transport_options": {
        "visibility_timeout": 3600,
        "max_retries": 5,
    },

    # ── Task serialization ──────────────────────────────────────────────────
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "task_compression": "gzip",

    # ── Reliability ─────────────────────────────────────────────────────────
    "task_acks_late": True,          # Only ack after task completes, not on receipt
    "task_reject_on_worker_lost": True,
    "task_track_started": True,
    "task_send_sent_event": True,

    # ── Timeouts ────────────────────────────────────────────────────────────
    "task_soft_time_limit": 300,     # 5 min: raises SoftTimeLimitExceeded
    "task_time_limit": 360,          # 6 min: hard kill

    # ── Queues ──────────────────────────────────────────────────────────────
    "task_default_queue": "default",
    "task_queues": [
        Queue("accommodation_queue", routing_key="accommodation.*"),
        Queue("activity_queue",      routing_key="activity.*"),
        Queue("restaurant_queue",    routing_key="restaurant.*"),
        Queue("weather_queue",       routing_key="weather.*"),
        Queue("itinerary_queue",     routing_key="itinerary.*"),
        Queue("inquiry_queue",       routing_key="inquiry.*"),
        Queue("dead_letter_queue",   routing_key="dead.*"),  # Failed tasks land here
    ],

    # ── Result expiry ───────────────────────────────────────────────────────
    "result_expires": 86400,         # Results expire after 24 hours

    # ── Worker settings ─────────────────────────────────────────────────────
    "worker_prefetch_multiplier": 1, # Fair task distribution; important for long tasks
    "worker_max_tasks_per_child": 200,  # Restart workers periodically to prevent memory leaks
    "worker_send_task_events": True,
})
```

### 5.2 Base Task with Full Safety Measures

All tasks inherit from `SafeBaseTask`. Never use raw `@celery_app.task`.

```python
# app/workers/base_task.py
import logging
import time
import sentry_sdk
from celery import Task
from celery.exceptions import SoftTimeLimitExceeded
from app.middleware.correlation import correlation_id_var

logger = logging.getLogger("celery.tasks")

class SafeBaseTask(Task):
    """
    Production-safe base task with:
    - Structured logging
    - Correlation ID propagation
    - Sentry error capture
    - Execution time tracking
    - Retry with exponential backoff
    - Soft time limit handling
    """
    abstract = True
    max_retries = 5
    default_retry_delay = 60  # seconds

    def apply_async(self, *args, **kwargs):
        # Propagate correlation ID into task headers
        kwargs.setdefault("headers", {})
        kwargs["headers"]["correlation_id"] = correlation_id_var.get()
        return super().apply_async(*args, **kwargs)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        correlation_id = self.request.headers.get("correlation_id", "unknown")
        logger.error(
            "task_failed",
            extra={
                "task_id": task_id,
                "task_name": self.name,
                "correlation_id": correlation_id,
                "error": str(exc),
                "error_type": type(exc).__name__,
                "retries": self.request.retries,
            },
            exc_info=True,
        )
        sentry_sdk.capture_exception(exc)

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.warning(
            "task_retrying",
            extra={
                "task_id": task_id,
                "task_name": self.name,
                "retry_count": self.request.retries,
                "error": str(exc),
                "next_retry_delay": self.default_retry_delay * (2 ** self.request.retries),
            }
        )

    def on_success(self, retval, task_id, args, kwargs):
        logger.info(
            "task_succeeded",
            extra={"task_id": task_id, "task_name": self.name}
        )
```

### 5.3 Task Implementation Example

```python
# app/workers/tasks/accommodation_tasks.py
import logging
from celery.exceptions import SoftTimeLimitExceeded
from app.workers.celery_app import celery_app
from app.workers.base_task import SafeBaseTask
from app.services.accommodation_service import AccommodationService

logger = logging.getLogger("tasks.accommodation")

@celery_app.task(
    bind=True,
    base=SafeBaseTask,
    queue="accommodation_queue",
    name="tasks.accommodation.fetch",
    max_retries=5,
)
def fetch_accommodations(self, trip_id: str, destination: str, check_in: str, check_out: str):
    """
    Fetches and normalizes accommodations for a trip.
    Retries with exponential backoff on API failures.
    """
    try:
        logger.info(f"Fetching accommodations for trip {trip_id}, destination: {destination}")
        service = AccommodationService()
        results = service.fetch_all_providers(
            destination=destination,
            check_in=check_in,
            check_out=check_out,
        )
        service.normalize_and_store(trip_id=trip_id, raw_results=results)
        logger.info(f"Accommodations fetched for trip {trip_id}: {len(results)} results")
        return {"status": "success", "count": len(results)}

    except SoftTimeLimitExceeded:
        logger.error(f"Task timed out for trip {trip_id}. Aborting gracefully.")
        raise  # Do not retry on timeout

    except Exception as exc:
        backoff = 60 * (2 ** self.request.retries)
        logger.warning(f"Accommodation fetch failed for trip {trip_id}. Retry {self.request.retries}. Backoff: {backoff}s")
        raise self.retry(exc=exc, countdown=backoff)
```

### 5.4 Queue Health Checks

```python
# app/utils/queue_health.py
import logging
from redis import Redis
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("queue.health")

QUEUE_DEPTH_ALERT_THRESHOLD = 500   # Alert if any queue exceeds this depth

MONITORED_QUEUES = [
    "accommodation_queue",
    "activity_queue",
    "restaurant_queue",
    "weather_queue",
    "itinerary_queue",
    "inquiry_queue",
    "dead_letter_queue",
]

def check_queue_depths():
    """
    Called every 5 minutes by Celery Beat.
    Logs queue depths and alerts on threshold breaches.
    """
    r = Redis.from_url(settings.celery_broker_url)
    depths = {}

    for queue in MONITORED_QUEUES:
        try:
            depth = r.llen(queue)
            depths[queue] = depth
            if depth > QUEUE_DEPTH_ALERT_THRESHOLD:
                logger.warning(
                    "QUEUE_DEPTH_ALERT",
                    extra={"queue": queue, "depth": depth, "threshold": QUEUE_DEPTH_ALERT_THRESHOLD}
                )
        except Exception as e:
            logger.error(f"Cannot read queue depth for {queue}: {e}")

    logger.info("queue_depths", extra=depths)

    # Dead letter queue — anything here requires immediate attention
    dlq_depth = depths.get("dead_letter_queue", 0)
    if dlq_depth > 0:
        logger.error(
            "DEAD_LETTER_QUEUE_NOT_EMPTY",
            extra={"dead_letter_queue_depth": dlq_depth}
        )
    return depths
```

### 5.5 Celery Beat — Scheduled Tasks

```python
# app/workers/beat_schedule.py
from celery.schedules import crontab
from app.workers.celery_app import celery_app

celery_app.conf.beat_schedule = {
    # System health
    "queue-depth-check": {
        "task": "tasks.monitoring.check_queue_depths",
        "schedule": 300.0,  # Every 5 minutes
    },
    "db-pool-status-log": {
        "task": "tasks.monitoring.log_db_pool_status",
        "schedule": 600.0,  # Every 10 minutes
    },
    # Cache maintenance
    "cache-warm-popular-destinations": {
        "task": "tasks.cache.warm_popular_destinations",
        "schedule": crontab(hour=4, minute=0),  # Daily at 4 AM UTC
    },
    # Weather refresh for active trips
    "refresh-active-trip-weather": {
        "task": "tasks.weather.refresh_active_trips",
        "schedule": crontab(minute=0),  # Every hour
    },
    # Clean up stale sessions
    "cleanup-abandoned-trips": {
        "task": "tasks.trips.cleanup_abandoned",
        "schedule": crontab(hour=2, minute=0),  # Daily at 2 AM UTC
    },
}
```

---

## 6. Cache Management

### 6.1 Redis Client Setup

Two logical Redis databases are used to cleanly separate concerns:

| Redis DB | Purpose |
|---|---|
| DB 0 | Default/general |
| DB 1 | Application cache (TTL-based data) |
| DB 2 | Celery broker (task queue) |
| DB 3 | Celery results backend |

```python
# app/cache/redis_client.py
import logging
from redis.asyncio import Redis, ConnectionPool
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("cache.redis")

_redis_pool: ConnectionPool | None = None
_redis: Redis | None = None

async def init_redis():
    global _redis_pool, _redis
    _redis_pool = ConnectionPool.from_url(
        settings.redis_url,
        db=settings.redis_cache_db,
        max_connections=settings.redis_max_connections,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True,
    )
    _redis = Redis(connection_pool=_redis_pool)

    try:
        await _redis.ping()
        logger.info("Redis cache connected.")
    except Exception as e:
        logger.critical(f"CRITICAL: Redis connection failed on startup: {e}")
        raise

async def close_redis():
    if _redis:
        await _redis.close()

async def get_redis() -> Redis:
    if _redis is None:
        raise RuntimeError("Redis not initialized. Call init_redis() at startup.")
    return _redis
```

### 6.2 Cache Strategy Definitions

All cache TTLs are defined in one place. Never hardcode TTL values in service code.

```python
# app/cache/strategies.py
from dataclasses import dataclass

@dataclass(frozen=True)
class CacheTTL:
    seconds: int

    @classmethod
    def minutes(cls, n: int) -> "CacheTTL":
        return cls(n * 60)

    @classmethod
    def hours(cls, n: int) -> "CacheTTL":
        return cls(n * 3600)

    @classmethod
    def days(cls, n: int) -> "CacheTTL":
        return cls(n * 86400)

# ─── TTL Definitions ─────────────────────────────────────────────────────────
class CacheStrategy:
    # Accommodation listings: refreshed frequently (prices change)
    ACCOMMODATION_SEARCH   = CacheTTL.minutes(30)

    # Activities: stable data, longer TTL
    ACTIVITY_SEARCH        = CacheTTL.hours(6)

    # Restaurants: moderately stable
    RESTAURANT_SEARCH      = CacheTTL.hours(3)

    # Weather: short TTL, data changes frequently
    WEATHER_FORECAST       = CacheTTL.hours(1)

    # Generated itinerary: cache per user session
    ITINERARY_GENERATED    = CacheTTL.hours(24)

    # AI scoring results: expensive to compute, stable enough to cache
    AI_ACCOMMODATION_SCORE = CacheTTL.hours(12)

    # Route calculations: very stable
    ROUTE_CALCULATION      = CacheTTL.days(1)

    # User session data
    USER_SESSION           = CacheTTL.minutes(60)
```

### 6.3 Cache Service with Safe Patterns

```python
# app/cache/cache_service.py
import json
import logging
import hashlib
from redis.asyncio import Redis
from app.cache.strategies import CacheTTL

logger = logging.getLogger("cache")

class CacheService:
    def __init__(self, redis: Redis):
        self.redis = redis

    def _build_key(self, namespace: str, **params) -> str:
        """Deterministic, collision-safe cache key from namespace + params."""
        param_hash = hashlib.md5(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
        return f"{namespace}:{param_hash}"

    async def get(self, key: str) -> dict | None:
        try:
            raw = await self.redis.get(key)
            if raw:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(raw)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache GET error for key '{key}': {e}")
            return None  # Gracefully degrade — never crash on cache failure

    async def set(self, key: str, value: dict, ttl: CacheTTL) -> bool:
        try:
            await self.redis.setex(key, ttl.seconds, json.dumps(value))
            logger.debug(f"Cache SET: {key} (TTL: {ttl.seconds}s)")
            return True
        except Exception as e:
            logger.error(f"Cache SET error for key '{key}': {e}")
            return False

    async def delete(self, key: str) -> bool:
        try:
            await self.redis.delete(key)
            logger.info(f"Cache INVALIDATED: {key}")
            return True
        except Exception as e:
            logger.error(f"Cache DELETE error for key '{key}': {e}")
            return False

    async def invalidate_namespace(self, namespace: str):
        """Invalidate all cache keys under a namespace (e.g., on data update)."""
        try:
            pattern = f"{namespace}:*"
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
                logger.info(f"Cache namespace INVALIDATED: {namespace} ({len(keys)} keys)")
        except Exception as e:
            logger.error(f"Cache namespace invalidation failed for '{namespace}': {e}")

    async def get_or_set(self, key: str, fetch_fn, ttl: CacheTTL) -> dict | None:
        """
        Cache-aside pattern with graceful degradation.
        If cache fails, fetch from source and return without caching.
        """
        cached = await self.get(key)
        if cached is not None:
            return cached
        try:
            fresh = await fetch_fn()
            await self.set(key, fresh, ttl)
            return fresh
        except Exception as e:
            logger.error(f"Cache fetch_fn failed for key '{key}': {e}")
            raise
```

### 6.4 Cache Invalidation Rules

| Event | Cache Keys Invalidated |
|---|---|
| Accommodation data updated | `accommodation:{id}:*` |
| Trip preferences changed | `itinerary:{trip_id}:*`, `ai_score:{trip_id}:*` |
| Weather data refreshed | `weather:{destination}:*` |
| User session expired | `user:{user_id}:session` |
| Itinerary regenerated | `itinerary:{trip_id}:generated` |

---

## 7. AI Orchestration Layer

### 7.1 LangGraph Agent Architecture

All AI planning runs through a deterministic LangGraph state machine — never free-form LLM calls in isolation.

```
[User Preferences]
       │
       ▼
PreferenceExtractionAgent
       │
       ▼
AccommodationRankingAgent ──► AccommodationScores
       │
       ▼
ActivityIntelligenceAgent ──► ClusteredActivities
       │
       ▼
DiningIntelligenceAgent ──► MealPlan
       │
       ▼
LogisticsOptimizationAgent ──► OptimizedSchedule
       │
       ▼
BudgetOptimizationAgent ──► BudgetValidatedPlan
       │
       ▼
AIRefinementAgent ──► FinalItinerary (Structured JSON)
       │
       ▼
StructuredOutputValidator ──► Validated + Stored
```

### 7.2 Structured Output Enforcement

**RULE:** Every AI response is validated against a Pydantic schema. Raw text responses from the AI layer are never stored or served to users.

```python
# app/schemas/itinerary_schemas.py
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from datetime import time

class ItineraryItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    item_type: Literal["activity", "restaurant", "transport", "accommodation", "free_time"]
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    location_name: str
    estimated_cost_usd: float = Field(..., ge=0)
    notes: str | None = None

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v, values):
        if "start_time" in values.data and v <= values.data["start_time"]:
            raise ValueError("end_time must be after start_time")
        return v

class ItineraryDay(BaseModel):
    day_number: int = Field(..., ge=1, le=30)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    items: list[ItineraryItem] = Field(..., min_length=1)
    total_estimated_cost_usd: float = Field(..., ge=0)
    weather_summary: str | None = None

class GeneratedItinerary(BaseModel):
    trip_id: str
    days: list[ItineraryDay] = Field(..., min_length=1)
    total_estimated_cost_usd: float
    budget_remaining_usd: float
    planning_notes: str | None = None
```

```python
# app/ai/validators.py
import logging
from pydantic import ValidationError
from app.schemas.itinerary_schemas import GeneratedItinerary
import sentry_sdk

logger = logging.getLogger("ai.validator")

def validate_itinerary_output(raw_output: dict) -> GeneratedItinerary:
    """
    Validates AI-generated itinerary against the schema.
    On failure: logs, captures to Sentry, raises ValueError.
    Never allow malformed AI output into the system.
    """
    try:
        validated = GeneratedItinerary(**raw_output)
        logger.info(f"AI output validated for trip {validated.trip_id}.")
        return validated
    except ValidationError as e:
        logger.error(
            "ai_output_validation_failed",
            extra={"errors": e.errors(), "raw_output": str(raw_output)[:500]}
        )
        sentry_sdk.capture_exception(e)
        raise ValueError(f"AI returned malformed itinerary: {e.error_count()} validation errors.")
```

### 7.3 AI Call Wrapper with Safety Controls

```python
# app/ai/client.py
import openai
import logging
import time
import sentry_sdk
from app.config import get_settings
from app.middleware.correlation import get_correlation_id

settings = get_settings()
logger = logging.getLogger("ai.client")

client = openai.AsyncOpenAI(
    api_key=settings.openai_api_key,
    timeout=settings.openai_timeout_seconds,
    max_retries=settings.openai_max_retries,
)

async def call_ai_structured(
    system_prompt: str,
    user_prompt: str,
    response_schema: type,
    max_tokens: int = 2048,
) -> dict:
    """
    Safe AI call wrapper:
    - Enforces structured JSON output
    - Tracks token usage
    - Logs latency
    - Captures failures to Sentry
    - Validates response is non-empty
    """
    correlation_id = get_correlation_id()
    start = time.perf_counter()

    try:
        response = await client.chat.completions.create(
            model=settings.openai_model,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        usage = response.usage

        logger.info(
            "ai_call_completed",
            extra={
                "correlation_id": correlation_id,
                "model": settings.openai_model,
                "duration_ms": duration_ms,
                "prompt_tokens": usage.prompt_tokens,
                "completion_tokens": usage.completion_tokens,
                "total_tokens": usage.total_tokens,
            }
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("AI returned empty response.")

        import json
        return json.loads(content)

    except openai.RateLimitError as e:
        logger.error(f"OpenAI rate limit hit. Correlation: {correlation_id}")
        sentry_sdk.capture_exception(e)
        raise

    except openai.APITimeoutError as e:
        logger.error(f"OpenAI API timeout after {settings.openai_timeout_seconds}s.")
        sentry_sdk.capture_exception(e)
        raise

    except Exception as e:
        logger.error(f"AI call failed: {e}", exc_info=True)
        sentry_sdk.capture_exception(e)
        raise
```

### 7.4 Prompt Safety Rules

1. All system prompts live in `app/ai/prompts/` as versioned Python constants — never inline strings scattered across services.
2. User-provided text is **sanitized** before injection into prompts.
3. Prompt injections are mitigated by wrapping user content in delimiters.
4. AI is instructed to return ONLY JSON and to refuse tasks outside its scope.

```python
# app/utils/sanitize.py
import re

PROMPT_INJECTION_PATTERNS = [
    r"ignore (previous|above|all) instructions?",
    r"forget (your|the) (system |)prompt",
    r"you are now",
    r"act as (a )?(different|new|another)",
    r"jailbreak",
    r"DAN mode",
]

def sanitize_user_input(text: str, max_length: int = 2000) -> str:
    """
    Sanitizes user input before injecting into AI prompts.
    - Truncates to max length
    - Detects and removes prompt injection attempts
    """
    text = text.strip()[:max_length]
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise ValueError("Invalid input detected.")
    return text
```

---

## 8. Safety, Security & Resilience

### 8.1 Rate Limiting

```python
# app/middleware/rate_limit.py
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.cache.redis_client import get_redis

logger = logging.getLogger("rate_limit")

RATE_LIMIT_RULES = {
    "/auth/login":             (5, 60),     # 5 requests per 60 seconds
    "/auth/register":          (3, 60),     # 3 per 60 seconds
    "/ai/generate-itinerary":  (10, 60),    # 10 per minute (expensive)
    "/ai/replan":              (10, 60),
    "default":                 (100, 60),   # 100 per minute for all other endpoints
}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        # Find matching rule
        limit, window = RATE_LIMIT_RULES.get(path) or RATE_LIMIT_RULES["default"]

        redis = await get_redis()
        key = f"rate_limit:{client_ip}:{path}"

        try:
            current = await redis.incr(key)
            if current == 1:
                await redis.expire(key, window)

            if current > limit:
                logger.warning(
                    "rate_limit_exceeded",
                    extra={"client_ip": client_ip, "path": path, "count": current, "limit": limit}
                )
                return JSONResponse(
                    status_code=429,
                    content={"error": "rate_limit_exceeded", "retry_after_seconds": window}
                )
        except Exception as e:
            # If Redis is down, fail open — do not block users on rate limit infra failure
            logger.error(f"Rate limit check failed (failing open): {e}")

        return await call_next(request)
```

### 8.2 JWT Authentication

```python
# app/services/auth_service.py
import jwt
import logging
import bcrypt
from datetime import datetime, timedelta, UTC
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger("auth")

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "access",
        "iat": datetime.now(UTC),
        "exp": datetime.now(UTC) + timedelta(minutes=settings.jwt_access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "iat": datetime.now(UTC),
        "exp": datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.ExpiredSignatureError:
        logger.warning("Expired token presented.")
        raise ValueError("Token expired.")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise ValueError("Invalid token.")
```

### 8.3 Circuit Breaker — External API Protection

Prevents cascading failures when third-party APIs (Amadeus, Google Places, OpenWeather) go down.

```python
# app/utils/circuit_breaker.py
import time
import logging
from enum import Enum
from threading import Lock

logger = logging.getLogger("circuit_breaker")

class CircuitState(Enum):
    CLOSED = "closed"       # Normal — requests flow through
    OPEN = "open"           # Failing — requests are blocked
    HALF_OPEN = "half_open" # Testing — one request allowed through

class CircuitBreaker:
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = Exception,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        self.last_failure_time: float | None = None
        self._lock = Lock()

    def call(self, func, *args, **kwargs):
        with self._lock:
            if self.state == CircuitState.OPEN:
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = CircuitState.HALF_OPEN
                    logger.info(f"Circuit breaker '{self.name}' transitioning to HALF_OPEN.")
                else:
                    raise RuntimeError(f"Circuit breaker '{self.name}' is OPEN. Request blocked.")

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        with self._lock:
            if self.state == CircuitState.HALF_OPEN:
                logger.info(f"Circuit breaker '{self.name}' recovered. State: CLOSED.")
            self.failure_count = 0
            self.state = CircuitState.CLOSED

    def _on_failure(self):
        with self._lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                logger.error(
                    f"Circuit breaker '{self.name}' OPENED after {self.failure_count} failures."
                )

# ── Pre-configured breakers for each external provider ──────────────────────
amadeus_breaker       = CircuitBreaker(name="amadeus",        failure_threshold=5)
google_places_breaker = CircuitBreaker(name="google_places",  failure_threshold=5)
openweather_breaker   = CircuitBreaker(name="openweather",    failure_threshold=3)
yelp_breaker          = CircuitBreaker(name="yelp",           failure_threshold=5)
twilio_breaker        = CircuitBreaker(name="twilio",         failure_threshold=3)
```

### 8.4 Input Validation Rules

All API inputs are validated via Pydantic schemas. No raw dictionaries pass into service layer.

```python
# app/schemas/trip_schemas.py
from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import date
from typing import Literal

class CreateTripRequest(BaseModel):
    destination: str = Field(..., min_length=2, max_length=100, strip_whitespace=True)
    start_date: date
    end_date: date
    number_of_travelers: int = Field(..., ge=1, le=20)
    budget_usd: float = Field(..., ge=50, le=100_000)
    accommodation_type: Literal["hotel", "hostel", "airbnb", "resort", "guesthouse"]

    # Optional preferences
    travel_style: Literal["adventure", "cultural", "relaxed", "luxury", "budget"] | None = None
    food_preferences: list[str] = Field(default_factory=list, max_length=10)
    activity_interests: list[str] = Field(default_factory=list, max_length=15)

    @field_validator("destination")
    @classmethod
    def destination_no_special_chars(cls, v):
        import re
        if re.search(r"[<>{}/\\]", v):
            raise ValueError("Destination contains invalid characters.")
        return v

    @model_validator(mode="after")
    def dates_are_valid(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date.")
        trip_length = (self.end_date - self.start_date).days
        if trip_length > 30:
            raise ValueError("Trip duration cannot exceed 30 days for MVP.")
        return self
```

### 8.5 Webhook Signature Verification — Zapier & Twilio

```python
# app/utils/webhook_security.py
import hmac
import hashlib
import logging
from fastapi import HTTPException, Header, Request

logger = logging.getLogger("webhook.security")

def verify_zapier_webhook(
    request_body: bytes,
    x_zapier_signature: str,
    secret: str,
) -> bool:
    expected = hmac.new(secret.encode(), request_body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_zapier_signature):
        logger.warning("INVALID Zapier webhook signature. Possible spoofing attempt.")
        raise HTTPException(status_code=403, detail="Invalid webhook signature.")
    return True

def verify_twilio_webhook(request: Request, x_twilio_signature: str, auth_token: str) -> bool:
    from twilio.request_validator import RequestValidator
    validator = RequestValidator(auth_token)
    url = str(request.url)
    form_data = {}  # Populated from form body
    if not validator.validate(url, form_data, x_twilio_signature):
        logger.warning("INVALID Twilio webhook signature.")
        raise HTTPException(status_code=403, detail="Invalid Twilio signature.")
    return True
```

---

## 9. Logging, Monitoring & Observability

### 9.1 Structured Logging Configuration

```python
# app/utils/logging_config.py
import logging
import json
import sys
from datetime import datetime, UTC
from app.config import get_settings

settings = get_settings()

class StructuredJSONFormatter(logging.Formatter):
    """
    Outputs every log line as a single JSON object.
    Compatible with CloudWatch Logs Insights and Datadog.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": "antigravity-travel-api",
            "environment": settings.app_env,
        }

        # Attach extra fields (correlation_id, duration_ms, etc.)
        for key, value in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and not key.startswith("_"):
                log_entry[key] = value

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)

def configure_logging():
    root = logging.getLogger()
    root.setLevel(logging.DEBUG if settings.debug else logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredJSONFormatter())
    root.handlers = [handler]

    # Suppress noisy third-party loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
```

### 9.2 Key Log Events (What We Always Log)

| Event | Level | When |
|---|---|---|
| `request_processed` | INFO | Every HTTP request |
| `task_started` | INFO | Every Celery task |
| `task_succeeded` | INFO | Every completed task |
| `task_failed` | ERROR | Any task failure |
| `task_retrying` | WARNING | Any task retry |
| `ai_call_completed` | INFO | Every OpenAI call (with token usage) |
| `ai_output_validation_failed` | ERROR | AI schema validation failure |
| `cache_hit` | DEBUG | Cache hit |
| `cache_miss` | DEBUG | Cache miss |
| `cache_invalidated` | INFO | Cache explicitly cleared |
| `circuit_breaker_opened` | ERROR | External API circuit opened |
| `queue_depth_alert` | WARNING | Queue exceeds threshold |
| `dead_letter_queue_not_empty` | ERROR | Tasks in DLQ |
| `db_pool_near_capacity` | WARNING | >85% pool connections in use |
| `slow_request_detected` | WARNING | Request >3000ms |
| `rate_limit_exceeded` | WARNING | Rate limit breach |
| `invalid_webhook_signature` | WARNING | Spoofing attempt |
| `unhandled_exception` | ERROR | Any unhandled 500 |

### 9.3 CloudWatch Alarms — Production Thresholds

Define the following alarms in Terraform (`infrastructure/terraform/cloudwatch.tf`):

| Alarm | Metric | Threshold | Action |
|---|---|---|---|
| High 5xx Error Rate | HTTP 5xx / Total Requests | >1% over 5 min | PagerDuty alert |
| High Latency | P99 response time | >3000ms over 5 min | PagerDuty alert |
| Queue Depth Critical | Any queue depth | >1000 tasks | PagerDuty alert |
| DLQ Not Empty | dead_letter_queue depth | >0 | PagerDuty alert |
| AI API Errors | OpenAI error count | >10 in 5 min | Slack alert |
| DB Connections | Pool checked_out | >85% | Slack alert |
| Worker Health | Celery active workers | <1 | PagerDuty alert |
| Memory | ECS container memory | >80% | Auto-scale trigger |
| CPU | ECS container CPU | >70% for 5 min | Auto-scale trigger |

### 9.4 Sentry Configuration

```python
# Already called in main.py at startup.
# Additional Sentry context enrichment:

import sentry_sdk

def add_sentry_user_context(user_id: str, email: str):
    """Call after authentication to enrich Sentry events with user identity."""
    with sentry_sdk.configure_scope() as scope:
        scope.set_user({"id": user_id, "email": email})

def add_sentry_trip_context(trip_id: str):
    """Add trip context to all Sentry events in the current request."""
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("trip_id", trip_id)
```

---

## 10. CI/CD Pipeline — GitHub Actions

### 10.1 Pull Request Checks

Runs on every PR to `main` and `develop`. All checks must pass before merge.

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ── Backend Checks ────────────────────────────────────────────────────────
  backend-lint:
    name: Backend — Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/api
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: "pip"

      - name: Install dependencies
        run: pip install -e ".[dev]"

      - name: Ruff — Linting
        run: ruff check . --output-format=github

      - name: Ruff — Format Check
        run: ruff format --check .

      - name: Mypy — Type Checking
        run: mypy app/ --ignore-missing-imports --strict

      - name: Bandit — Security Scan
        run: bandit -r app/ -ll -ii

  backend-test:
    name: Backend — Tests
    runs-on: ubuntu-latest
    needs: backend-lint
    defaults:
      run:
        working-directory: apps/api

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: travel_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          cache: "pip"

      - name: Install dependencies
        run: pip install -e ".[dev]"

      - name: Run Alembic Migrations (Test DB)
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/travel_test
        run: alembic upgrade head

      - name: Run Unit Tests
        env:
          APP_ENV: development
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/travel_test
          REDIS_URL: redis://localhost:6379/0
          APP_SECRET_KEY: test-secret-key
          JWT_SECRET_KEY: test-jwt-secret
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY_TEST }}
        run: |
          pytest tests/unit/ \
            -v \
            --tb=short \
            --cov=app \
            --cov-report=xml \
            --cov-report=term-missing \
            --cov-fail-under=80

      - name: Run Integration Tests
        env:
          APP_ENV: development
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/travel_test
          REDIS_URL: redis://localhost:6379/0
          APP_SECRET_KEY: test-secret-key
          JWT_SECRET_KEY: test-jwt-secret
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY_TEST }}
        run: pytest tests/integration/ -v --tb=short

      - name: Upload Coverage Report
        uses: codecov/codecov-action@v4
        with:
          file: apps/api/coverage.xml
          fail_ci_if_error: true

  # ── Frontend Checks ───────────────────────────────────────────────────────
  frontend-lint:
    name: Frontend — Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: ESLint
        run: npm run lint

      - name: TypeScript — Type Check
        run: npm run type-check

      - name: Prettier — Format Check
        run: npm run format:check

  frontend-build:
    name: Frontend — Build Check
    runs-on: ubuntu-latest
    needs: frontend-lint
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js App
        env:
          NEXT_PUBLIC_API_URL: https://api-staging.antigravity.io
        run: npm run build

  # ── Security Checks ───────────────────────────────────────────────────────
  security-scan:
    name: Security — Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Python — pip-audit
        working-directory: apps/api
        run: |
          pip install pip-audit
          pip-audit --requirement requirements.txt --strict

      - name: Node — npm audit
        working-directory: apps/web
        run: npm audit --audit-level=high

      - name: Trivy — Container Vulnerability Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          severity: "HIGH,CRITICAL"
          exit-code: "1"

  # ── Docker Build Validation ───────────────────────────────────────────────
  docker-build-check:
    name: Docker — Build Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build API Docker Image
        run: docker build -t antigravity-api:pr-check apps/api/

      - name: Build Worker Docker Image
        run: docker build -f apps/api/Dockerfile.worker -t antigravity-worker:pr-check apps/api/
```

### 10.2 Staging Deployment

Triggered on every push to `develop`. Deploys to the staging environment.

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    name: Deploy — Staging
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.antigravity.io

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & Push API Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: staging-${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/antigravity-api:$IMAGE_TAG apps/api/
          docker tag  $ECR_REGISTRY/antigravity-api:$IMAGE_TAG $ECR_REGISTRY/antigravity-api:staging-latest
          docker push $ECR_REGISTRY/antigravity-api:$IMAGE_TAG
          docker push $ECR_REGISTRY/antigravity-api:staging-latest

      - name: Build & Push Worker Image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: staging-${{ github.sha }}
        run: |
          docker build -f apps/api/Dockerfile.worker \
            -t $ECR_REGISTRY/antigravity-worker:$IMAGE_TAG apps/api/
          docker push $ECR_REGISTRY/antigravity-worker:$IMAGE_TAG

      - name: Run Database Migrations — Staging
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: staging-${{ github.sha }}
        run: |
          aws ecs run-task \
            --cluster antigravity-staging \
            --task-definition antigravity-migrate \
            --overrides '{
              "containerOverrides": [{
                "name": "migrate",
                "command": ["alembic", "upgrade", "head"],
                "environment": [{"name": "IMAGE_TAG", "value": "${{ github.sha }}"}]
              }]
            }' \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...]}"

      - name: Deploy API to ECS — Staging
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: staging-${{ github.sha }}
        run: |
          aws ecs update-service \
            --cluster antigravity-staging \
            --service antigravity-api \
            --force-new-deployment \
            --region us-east-1

      - name: Wait for ECS Service Stability
        run: |
          aws ecs wait services-stable \
            --cluster antigravity-staging \
            --services antigravity-api antigravity-worker

      - name: Run Health Check — Staging
        run: |
          for i in {1..10}; do
            RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://api-staging.antigravity.io/health/ready)
            if [ "$RESPONSE" = "200" ]; then
              echo "Health check passed."
              exit 0
            fi
            echo "Attempt $i: Health check returned $RESPONSE. Retrying in 15s..."
            sleep 15
          done
          echo "Health check failed after 10 attempts."
          exit 1

      - name: Deploy Frontend — Vercel Staging
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          cd apps/web
          npx vercel --prod --token=$VERCEL_TOKEN \
            --env NEXT_PUBLIC_API_URL=https://api-staging.antigravity.io
```

### 10.3 Production Deployment

Triggered on push to `main` (via PR merge). Requires manual approval gate.

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  # ── Approval Gate ─────────────────────────────────────────────────────────
  require-approval:
    name: Require Manual Approval
    runs-on: ubuntu-latest
    environment:
      name: production   # Configured with required reviewers in GitHub settings
    steps:
      - name: Approved
        run: echo "Production deployment approved."

  # ── Production Deployment ─────────────────────────────────────────────────
  deploy-production:
    name: Deploy — Production
    runs-on: ubuntu-latest
    needs: require-approval
    environment:
      name: production
      url: https://travel.antigravity.io

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & Push Production Images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: prod-${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/antigravity-api:$IMAGE_TAG apps/api/
          docker tag $ECR_REGISTRY/antigravity-api:$IMAGE_TAG $ECR_REGISTRY/antigravity-api:latest
          docker push $ECR_REGISTRY/antigravity-api:$IMAGE_TAG
          docker push $ECR_REGISTRY/antigravity-api:latest

          docker build -f apps/api/Dockerfile.worker \
            -t $ECR_REGISTRY/antigravity-worker:$IMAGE_TAG apps/api/
          docker tag $ECR_REGISTRY/antigravity-worker:$IMAGE_TAG $ECR_REGISTRY/antigravity-worker:latest
          docker push $ECR_REGISTRY/antigravity-worker:$IMAGE_TAG
          docker push $ECR_REGISTRY/antigravity-worker:latest

      - name: Tag Git Release
        run: |
          git tag "release-$(date +'%Y%m%d')-${{ github.sha:0:8 }}"
          git push origin --tags

      - name: Run Database Migrations — Production
        run: |
          aws ecs run-task \
            --cluster antigravity-production \
            --task-definition antigravity-migrate-prod \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...]}"
          # Wait for task completion before proceeding
          echo "Waiting for migration task..."
          sleep 30

      - name: Deploy API — Blue/Green via ECS
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: prod-${{ github.sha }}
        run: |
          aws ecs update-service \
            --cluster antigravity-production \
            --service antigravity-api \
            --force-new-deployment

      - name: Wait for ECS Service Stability
        run: |
          aws ecs wait services-stable \
            --cluster antigravity-production \
            --services antigravity-api antigravity-worker

      - name: Production Health Check — Deep
        run: |
          for i in {1..15}; do
            LIVE=$(curl -s -o /dev/null -w "%{http_code}" https://api.antigravity.io/health/live)
            READY=$(curl -s -o /dev/null -w "%{http_code}" https://api.antigravity.io/health/ready)
            if [ "$LIVE" = "200" ] && [ "$READY" = "200" ]; then
              echo "Production health checks passed."
              exit 0
            fi
            echo "Attempt $i: live=$LIVE ready=$READY — waiting 20s..."
            sleep 20
          done
          echo "PRODUCTION HEALTH CHECK FAILED. Triggering rollback."
          exit 1

      - name: Notify Slack — Deployment Success
        if: success()
        uses: slackapi/slack-github-action@v1.27
        with:
          payload: |
            {
              "text": ":rocket: *Production deployment succeeded!*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Notify Slack — Deployment Failed
        if: failure()
        uses: slackapi/slack-github-action@v1.27
        with:
          payload: |
            {
              "text": ":fire: *Production deployment FAILED!*\nCommit: `${{ github.sha }}`\nBy: ${{ github.actor }}\nCheck: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 10.4 Rollback Workflow

Manually triggered. Can roll back to any previous image tag in ECR.

```yaml
# .github/workflows/rollback.yml
name: Emergency Rollback

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: "ECR image tag to roll back to (e.g. prod-abc1234)"
        required: true
      reason:
        description: "Reason for rollback"
        required: true

jobs:
  rollback:
    name: Rollback — Production
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1

      - name: Log Rollback Intent
        run: |
          echo "ROLLBACK initiated by ${{ github.actor }}"
          echo "Target tag: ${{ github.event.inputs.image_tag }}"
          echo "Reason: ${{ github.event.inputs.reason }}"

      - name: Update ECS Task Definition to Previous Image
        run: |
          CURRENT_TASK_DEF=$(aws ecs describe-services \
            --cluster antigravity-production \
            --services antigravity-api \
            --query 'services[0].taskDefinition' --output text)

          NEW_TASK_DEF=$(aws ecs describe-task-definition \
            --task-definition $CURRENT_TASK_DEF \
            --query 'taskDefinition' | \
            jq '.containerDefinitions[0].image = "${{ env.ECR_REGISTRY }}/antigravity-api:${{ github.event.inputs.image_tag }}"')

          aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF"

          aws ecs update-service \
            --cluster antigravity-production \
            --service antigravity-api \
            --force-new-deployment

      - name: Wait for Rollback Stability
        run: |
          aws ecs wait services-stable \
            --cluster antigravity-production \
            --services antigravity-api

      - name: Post-Rollback Health Check
        run: |
          sleep 30
          READY=$(curl -s -o /dev/null -w "%{http_code}" https://api.antigravity.io/health/ready)
          if [ "$READY" != "200" ]; then
            echo "ROLLBACK HEALTH CHECK FAILED. Manual intervention required."
            exit 1
          fi
          echo "Rollback health check passed."

      - name: Notify Slack — Rollback
        uses: slackapi/slack-github-action@v1.27
        with:
          payload: |
            {
              "text": ":rewind: *Production ROLLBACK executed*\nTag: `${{ github.event.inputs.image_tag }}`\nBy: ${{ github.actor }}\nReason: ${{ github.event.inputs.reason }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 10.5 GitHub Secrets Required

Store all of the following in **GitHub → Settings → Secrets and Variables → Actions**:

| Secret Name | Scope | Purpose |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | Staging | ECS/ECR access — staging |
| `AWS_SECRET_ACCESS_KEY` | Staging | ECS/ECR access — staging |
| `AWS_ACCESS_KEY_ID_PROD` | Production | ECS/ECR access — production |
| `AWS_SECRET_ACCESS_KEY_PROD` | Production | ECS/ECR access — production |
| `VERCEL_TOKEN` | Staging + Prod | Vercel deployments |
| `OPENAI_API_KEY_TEST` | CI | Sandboxed test key (low limits) |
| `SLACK_WEBHOOK_URL` | All | Deployment notifications |

---

## 11. Docker & Deployment

### 11.1 API Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM python:3.12-slim AS base

# Security: run as non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies separately for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY alembic.ini .

# Set ownership
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 8000

# Health check — ECS uses this for container health
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health/live || exit 1

# Start with Gunicorn + Uvicorn workers for production
CMD ["gunicorn", "app.main:app", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "--workers", "4", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
```

### 11.2 Worker Dockerfile

```dockerfile
# apps/api/Dockerfile.worker
FROM python:3.12-slim

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

RUN chown -R appuser:appgroup /app
USER appuser

# Worker starts Celery, NOT the API server
CMD ["celery", "-A", "app.workers.celery_app", "worker", \
     "--queues=accommodation_queue,activity_queue,restaurant_queue,weather_queue,itinerary_queue,inquiry_queue", \
     "--concurrency=4", \
     "--loglevel=info", \
     "--logfile=-"]
```

### 11.3 Docker Compose — Local Development

```yaml
# infrastructure/docker-compose.yml
version: "3.9"

services:
  api:
    build:
      context: ../apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgresql+asyncpg://dev:dev@postgres:5432/travel_dev
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/2
      - CELERY_RESULT_BACKEND=redis://redis:6379/3
    env_file:
      - ../apps/api/.env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../apps/api/app:/app/app   # Hot reload in dev
    command: >
      uvicorn app.main:app
        --host 0.0.0.0
        --port 8000
        --reload

  worker:
    build:
      context: ../apps/api
      dockerfile: Dockerfile.worker
    environment:
      - APP_ENV=development
      - DATABASE_URL=postgresql+asyncpg://dev:dev@postgres:5432/travel_dev
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/2
      - CELERY_RESULT_BACKEND=redis://redis:6379/3
    env_file:
      - ../apps/api/.env
    depends_on:
      - api
      - redis
      - postgres

  beat:
    build:
      context: ../apps/api
      dockerfile: Dockerfile.worker
    command: >
      celery -A app.workers.celery_app beat
        --loglevel=info
        --scheduler redbeat.RedBeatScheduler
    depends_on:
      - redis
    env_file:
      - ../apps/api/.env

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: travel_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  flower:
    image: mher/flower:2.0
    command: celery flower --broker=redis://redis:6379/2
    ports:
      - "5555:5555"
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## 12. External API Resilience

### 12.1 Retry Utility with Exponential Backoff

```python
# app/utils/retry.py
import asyncio
import logging
import random
from functools import wraps

logger = logging.getLogger("retry")

def async_retry(
    max_attempts: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exceptions: tuple = (Exception,),
):
    """
    Decorator for async functions with exponential backoff + jitter.
    Jitter prevents thundering herd when multiple retries hit simultaneously.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts:
                        logger.error(
                            f"Max retries reached for {func.__name__}. "
                            f"Final error: {e}"
                        )
                        raise
                    delay = min(base_delay * (2 ** (attempt - 1)), max_delay)
                    jitter = random.uniform(0, delay * 0.1)
                    wait = delay + jitter
                    logger.warning(
                        f"Retry {attempt}/{max_attempts} for {func.__name__}. "
                        f"Error: {e}. Waiting {wait:.1f}s..."
                    )
                    await asyncio.sleep(wait)
        return wrapper
    return decorator
```

### 12.2 External API Client Pattern

```python
# app/services/accommodation_service.py (excerpt)
import httpx
import logging
from app.utils.retry import async_retry
from app.utils.circuit_breaker import amadeus_breaker

logger = logging.getLogger("service.accommodation")

class AccommodationService:
    AMADEUS_BASE_URL = "https://test.api.amadeus.com/v2"
    TIMEOUT_SECONDS = 15

    @async_retry(max_attempts=3, base_delay=2.0, exceptions=(httpx.RequestError, httpx.TimeoutException))
    async def _fetch_from_amadeus(self, destination: str, check_in: str, check_out: str) -> list[dict]:
        """
        Fetches accommodations from Amadeus API.
        - Wrapped with retry decorator
        - Uses circuit breaker
        - Times out after 15 seconds
        - Validates response structure before returning
        """
        def _call():
            # Circuit breaker wraps the sync HTTP call
            with httpx.Client(timeout=self.TIMEOUT_SECONDS) as client:
                response = client.get(
                    f"{self.AMADEUS_BASE_URL}/shopping/hotel-offers",
                    params={"cityCode": destination, "checkInDate": check_in, "checkOutDate": check_out},
                    headers={"Authorization": f"Bearer {self._get_token()}"},
                )
                response.raise_for_status()
                return response.json()

        try:
            data = amadeus_breaker.call(_call)
        except RuntimeError as e:
            logger.warning(f"Amadeus circuit breaker open. Returning empty results. {e}")
            return []  # Graceful degradation

        # Validate response structure
        if "data" not in data or not isinstance(data["data"], list):
            logger.error(f"Amadeus returned unexpected structure: {str(data)[:200]}")
            return []

        return data["data"]
```

---

## 13. Incident Response Runbook

### 13.1 Severity Levels

| Level | Definition | Response Time | Example |
|---|---|---|---|
| P0 — Critical | Full production outage | < 15 min | API returns 5xx for all requests |
| P1 — High | Major feature broken | < 1 hour | AI itinerary generation completely fails |
| P2 — Medium | Degraded experience | < 4 hours | Accommodation search slow |
| P3 — Low | Minor issue | < 24 hours | Non-critical UI bug |

### 13.2 Common Incident Playbooks

#### API Health Check Failing — `/health/ready` returns 503

```
1. Check CloudWatch Logs: filter for "readiness" in /antigravity/travel-api
2. Identify failing check: postgres or redis
3. If postgres: check RDS instance status in AWS console
4. If redis: check ElastiCache cluster status
5. If code issue: trigger rollback workflow with last stable tag
6. Notify team in #incidents Slack channel
```

#### Dead Letter Queue Not Empty

```
1. Check dead_letter_queue depth in Redis: redis-cli llen dead_letter_queue
2. Inspect failed task payloads: celery inspect reserved
3. Identify failure root cause from task logs (filter by task_id in CloudWatch)
4. Fix root cause (external API down, data issue, etc.)
5. Replay tasks from DLQ: celery -A app.workers.celery_app call tasks.dlq.replay
6. Monitor queue depth returns to 0
```

#### AI Itinerary Generation Failures Spike

```
1. Check OpenAI status page: https://status.openai.com
2. Check OPENAI_API_KEY validity and quota in OpenAI dashboard
3. Review Sentry for ai_output_validation_failed events
4. If OpenAI is down: enable fallback mode (basic template-based itinerary)
5. If prompt issue: review recent prompt changes in app/ai/prompts/
6. Alert: do not deploy prompt changes without staging validation
```

---

## 14. Development Phase Checklist

### Phase 1 — Foundation ✅ Criteria

- [ ] Monorepo initialized with folder structure as defined in Section 1
- [ ] `.env.example` committed with all required variables
- [ ] `docker-compose.yml` starts all services with one command
- [ ] PostgreSQL migrations run via Alembic on startup
- [ ] FastAPI starts with all middleware registered
- [ ] `/health/live` and `/health/ready` return correctly
- [ ] JWT auth endpoints working (register, login, refresh)
- [ ] Structured JSON logging outputting correctly
- [ ] Sentry connected and receiving test events
- [ ] GitHub Actions PR checks passing (lint, type check, tests)
- [ ] Staging deployment pipeline functional

### Phase 2 — Aggregation Systems ✅ Criteria

- [ ] All Celery queues initialized and visible in Flower dashboard
- [ ] Accommodation task fetches from at least one provider (Amadeus)
- [ ] Activity task fetches from Google Places
- [ ] Restaurant task fetches from Yelp or Foursquare
- [ ] Weather task fetches from OpenWeatherMap
- [ ] Circuit breakers active on all external API clients
- [ ] Retry logic verified (simulate API timeout, confirm retry behavior)
- [ ] Cache layer storing and expiring search results correctly
- [ ] Queue depth checks running every 5 minutes via Beat

### Phase 3 — AI Planning Engine ✅ Criteria

- [ ] LangGraph graph defined with all 7 agents
- [ ] All AI calls use `call_ai_structured()` wrapper
- [ ] All AI responses validated against Pydantic schemas before storage
- [ ] Prompt injection sanitization active on all user inputs
- [ ] Token usage logged for every AI call
- [ ] AI itinerary generation works end-to-end in staging
- [ ] Budget validation prevents over-budget itineraries
- [ ] Geographic clustering producing realistic daily schedules

### Phase 4 — Automation Workflows ✅ Criteria

- [ ] Inquiry approval UI functional (user can review, edit, approve)
- [ ] Zapier webhook signature verified before processing
- [ ] Twilio webhook signature verified before processing
- [ ] Outbound WhatsApp messages only sent after user approval
- [ ] Incoming replies captured, stored, and summarized by AI
- [ ] No autonomous booking or negotiation behavior possible

### Phase 5 — Production Readiness ✅ Criteria

- [ ] All CloudWatch alarms configured per Section 9.3
- [ ] ECS auto-scaling rules configured for CPU and memory
- [ ] RDS automated backups enabled (7-day retention minimum)
- [ ] ElastiCache backup enabled
- [ ] Production deployment requires manual approval gate
- [ ] Rollback workflow tested against staging
- [ ] All secrets stored in AWS Secrets Manager — zero plain-text secrets in ECS
- [ ] Security scan (Trivy, Bandit, npm audit) passing with no HIGH/CRITICAL findings
- [ ] Test coverage ≥ 80%
- [ ] `/docs` Swagger endpoint disabled in production
- [ ] CORS restricted to production frontend domain only

---

*Document maintained by the Google Antigravity Engineering Team.*  
*For questions, raise a GitHub issue in the `antigravity-travel` repository.*
