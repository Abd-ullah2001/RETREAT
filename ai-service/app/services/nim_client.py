"""Shared NVIDIA NIM (OpenAI-compatible) client."""
from openai import OpenAI

from app.config import get_settings

MODEL = "meta/llama-3.1-70b-instruct"

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        settings = get_settings()
        _client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_API_KEY,
        )
    return _client
