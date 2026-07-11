"""Retreat AI Service — FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import message, plan, replan
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

settings = get_settings()

sentry_sdk.init(
    dsn=settings.SENTRY_DSN or None,
    environment=settings.ENVIRONMENT,
    traces_sample_rate=0.1 if settings.is_production else 1.0,
    integrations=[
        StarletteIntegration(),
        FastApiIntegration(),
    ],
)

app = FastAPI(title="Retreat AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plan.router)
app.include_router(message.router)
app.include_router(replan.router)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
    )
