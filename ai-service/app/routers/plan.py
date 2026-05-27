from fastapi import APIRouter

from app.schemas.plan import ItineraryResponse, PlanRequest
from app.services.planner import generate_itinerary

router = APIRouter()


@router.post("/plan", response_model=ItineraryResponse)
def create_plan(body: PlanRequest) -> ItineraryResponse:
    return generate_itinerary(
        body.destination,
        body.checkin,
        body.checkout,
        body.guests,
        body.properties,
        body.activities,
    )
