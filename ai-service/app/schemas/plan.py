from typing import Any, List, Optional
from pydantic import BaseModel, Field

class ClusterItem(BaseModel):
    id: str
    lat: float
    lng: float
    type: str  # 'activity' or 'restaurant'
    data: dict

class Cluster(BaseModel):
    centroid: dict
    items: List[ClusterItem]
    dayRecommendation: int

class UserPreferences(BaseModel):
    travelStyle: Optional[str] = None
    interests: Optional[List[str]] = []
    budgetTier: Optional[str] = "comfort"
    budgetPerDayUsd: Optional[int] = None

class PlanRequest(BaseModel):
    destination: str
    checkin: str
    checkout: str
    guests: int
    numDays: int
    userPreferences: UserPreferences
    properties: List[dict]
    activityClusters: List[Cluster]
    weather: Optional[List[dict]] = None
    travelTimes: Optional[dict] = None
    feedback: Optional[str] = None

class ItineraryTimeSlot(BaseModel):
    activity_id: str
    activity_name: str
    start_time: str
    end_time: str
    note: str
    travel_time_to_next_minutes: int

class MealSlot(BaseModel):
    restaurant_id: Optional[str] = None
    restaurant_name: str
    note: str

class MealSuggestions(BaseModel):
    breakfast: MealSlot
    lunch: MealSlot
    dinner: MealSlot

class DayPlan(BaseModel):
    day: int
    date: str
    theme: str
    weather_note: str
    estimated_day_cost_usd: int
    morning: ItineraryTimeSlot
    afternoon: ItineraryTimeSlot
    evening: ItineraryTimeSlot
    meals: MealSuggestions

class ItineraryResponse(BaseModel):
    summary: str
    recommended_property_ids: List[str]
    estimated_total_cost_usd: int
    days: List[DayPlan]
    tips: List[str]
    packing_suggestions: List[str]
