"""Trip itinerary generation via NVIDIA NIM."""
import json
import re

from fastapi import HTTPException

from app.schemas.plan import ItineraryResponse
from app.services.nim_client import MODEL, get_client

SYSTEM_PROMPT = """You are a professional trip planner. Your output must be valid JSON matching the schema exactly.
Do not add commentary, explanations, or markdown. Only output the JSON object.
Never invent property IDs or activity IDs that were not in the input data.
Only reference properties and activities that exist in the provided lists."""


def _extract_json(text: str) -> dict:
    text = text.strip()
    # Strip markdown fences if model adds them
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


def generate_itinerary(
    destination: str,
    checkin: str,
    checkout: str,
    guests: int,
    properties: list,
    activities: list,
) -> ItineraryResponse:
    client = get_client()

    user_prompt = f"""Plan a trip to {destination} from {checkin} to {checkout} for {guests} guests.

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

    for attempt in range(2):
        user_content = user_prompt if attempt == 0 else user_prompt + "\nOutput only the JSON object, no other text."
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            max_tokens=4096,
            temperature=0.3,
        )
        content = response.choices[0].message.content or ""
        try:
            parsed = _extract_json(content)
            return ItineraryResponse.model_validate(parsed)
        except (json.JSONDecodeError, ValueError):
            if attempt == 1:
                raise HTTPException(status_code=500, detail="Failed to parse itinerary JSON") from None

    raise HTTPException(status_code=500, detail="Failed to generate itinerary")
