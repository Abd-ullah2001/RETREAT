from fastapi import APIRouter

from app.schemas.plan import ItineraryResponse, PlanRequest
from app.services.planner import generate_itinerary

router = APIRouter()

@router.post("/replan", response_model=ItineraryResponse)
def replan(body: PlanRequest) -> dict:
    return generate_itinerary(
        destination=body.destination,
        checkin=body.checkin,
        checkout=body.checkout,
        guests=body.guests,
        num_days=body.numDays,
        user_preferences=body.userPreferences.model_dump(),
        properties=body.properties,
        activity_clusters=[c.model_dump() for c in body.activityClusters],
        weather=body.weather,
        travel_times=body.travelTimes,
        feedback=body.feedback,
    )
