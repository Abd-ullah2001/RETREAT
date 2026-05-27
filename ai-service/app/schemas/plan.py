from typing import Any

from pydantic import BaseModel, Field


class PlanRequest(BaseModel):
    destination: str
    checkin: str
    checkout: str
    guests: int
    properties: list[dict[str, Any]] = Field(default_factory=list)
    activities: list[dict[str, Any]] = Field(default_factory=list)


class TimeSlot(BaseModel):
    activity_id: str
    note: str


class DayPlan(BaseModel):
    day: int
    date: str
    theme: str
    morning: TimeSlot
    afternoon: TimeSlot
    evening: TimeSlot
    meal_suggestion: str


class ItineraryResponse(BaseModel):
    summary: str
    recommended_property_ids: list[str]
    days: list[DayPlan]
    tips: list[str]
