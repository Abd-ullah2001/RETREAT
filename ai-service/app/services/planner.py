import json
import re
from fastapi import HTTPException
from app.schemas.plan import ItineraryResponse
from app.services.nim_client import MODEL, get_client

SYSTEM_PROMPT = """You are an expert travel itinerary planner with deep knowledge of
logistics, dining, and local culture. Your output must be valid JSON matching the
schema exactly. No commentary, no markdown, no explanation — only the JSON object.

Critical rules:
- Never invent property IDs or activity IDs not present in the input data
- Never assign the same activity to two different time slots
- Respect geographic clustering — keep same-cluster items on the same day
- Respect weather — avoid outdoor activities on rainy days (isGoodForOutdoor: false)
- Assign restaurants to breakfast/lunch/dinner slots based on their serving hours
- Always include travel_time_minutes between consecutive activities
- Keep costs within the user's budget_per_day_usd if provided
- Plan realistic time slots — morning starts at 9am, afternoon 1pm, evening 6pm"""

def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return json.loads(text)

def generate_itinerary(
    destination: str,
    checkin: str,
    checkout: str,
    guests: int,
    num_days: int,
    user_preferences: dict,
    properties: list,
    activity_clusters: list,
    weather: list | None,
    travel_times: dict | None,
    feedback: str | None = None
) -> dict:
    client = get_client()

    budget_str = f"${user_preferences.get('budgetPerDayUsd')} USD" if user_preferences.get('budgetPerDayUsd') else "flexible"
    feedback_str = f"\n- Special feedback: {feedback}" if feedback else ""
    
    user_prompt = f"""
Plan a {num_days}-day trip to {destination} from {checkin} to {checkout} for {guests} guests.

USER PREFERENCES:
- Travel style: {user_preferences.get('travelStyle', 'not specified')}
- Interests: {', '.join(user_preferences.get('interests', [])) or 'not specified'}
- Budget tier: {user_preferences.get('budgetTier', 'comfort')}
- Daily budget: {budget_str}{feedback_str}

AVAILABLE PROPERTIES (top 10, use exact IDs):
{json.dumps(properties[:10], indent=2)}

ACTIVITY CLUSTERS (activities and restaurants grouped by location):
{json.dumps(activity_clusters, indent=2)}

WEATHER FORECAST (use to avoid outdoor activities on bad weather days):
{json.dumps(weather, indent=2) if weather else "Weather data unavailable — plan for typical conditions"}

TRAVEL TIME MATRIX (seconds between activities, use to estimate travel_time_minutes):
{json.dumps(travel_times, indent=2) if travel_times else "Use 20-30 minutes as default travel estimate between activities"}

Return a JSON object with EXACTLY this schema:
{{
  "summary": "2-3 sentence overview highlighting the trip character",
  "recommended_property_ids": ["id1", "id2", "id3"],
  "estimated_total_cost_usd": 0,
  "days": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "short evocative theme name",
      "weather_note": "brief note on day's weather and what to wear/bring",
      "estimated_day_cost_usd": 0,
      "morning": {{
        "activity_id": "exact_id_from_input",
        "activity_name": "name for display",
        "start_time": "09:00",
        "end_time": "11:30",
        "note": "why this activity fits the day",
        "travel_time_to_next_minutes": 15
      }},
      "afternoon": {{
        "activity_id": "exact_id_from_input",
        "activity_name": "name for display",
        "start_time": "13:00",
        "end_time": "15:30",
        "note": "why this activity fits the day",
        "travel_time_to_next_minutes": 20
      }},
      "evening": {{
        "activity_id": "exact_id_from_input",
        "activity_name": "name for display",
        "start_time": "18:00",
        "end_time": "20:30",
        "note": "why this activity fits the day",
        "travel_time_to_next_minutes": 0
      }},
      "meals": {{
        "breakfast": {{
          "restaurant_id": "exact_id_or_null",
          "restaurant_name": "name or suggestion",
          "note": "brief recommendation"
        }},
        "lunch": {{
          "restaurant_id": "exact_id_or_null",
          "restaurant_name": "name or suggestion",
          "note": "brief recommendation"
        }},
        "dinner": {{
          "restaurant_id": "exact_id_or_null",
          "restaurant_name": "name or suggestion",
          "note": "brief recommendation"
        }}
      }}
    }}
  ],
  "tips": ["practical tip 1", "practical tip 2", "practical tip 3"],
  "packing_suggestions": ["item 1", "item 2", "item 3"]
}}"""

    for attempt in range(2):
        user_content = user_prompt if attempt == 0 else user_prompt + "\nOutput only the JSON object, no other text."
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            max_tokens=8192,
            temperature=0.3,
        )
        content = response.choices[0].message.content or ""
        try:
            parsed = _extract_json(content)
            itinerary = ItineraryResponse.model_validate(parsed)
            return itinerary.model_dump()
        except (json.JSONDecodeError, ValueError) as e:
            if attempt == 1:
                raise HTTPException(status_code=500, detail="Failed to parse itinerary JSON") from e

    raise HTTPException(status_code=500, detail="Failed to generate itinerary")
