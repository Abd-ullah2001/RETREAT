export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  travel_style?: TravelStyle | null;
  interests?: string[] | null;
  budget_tier?: BudgetTier | null;
  onboarding_completed: boolean;
}

export type Platform = 'booking' | 'airbnb';
export type TripStatus = 'planning' | 'active' | 'completed';
export type InquiryStatus = 'draft' | 'sent';
export type BudgetTier = 'budget' | 'comfort' | 'luxury';
export type TravelStyle = 'luxury' | 'adventure' | 'cultural' | 'relaxation';

export interface Property {
  id: string;
  platform: Platform;
  name: string;
  description: string | null;
  imageUrls: string[];
  pricePerNight: number;
  currency: string;
  totalPrice: number;
  rating: number | null;
  reviewCount: number | null;
  maxGuests: number;
  bedrooms: number | null;
  amenities: string[];
  lat: number;
  lng: number;
  address: string;
  bookingUrl: string;
}

export interface Activity {
  id: string;
  placeId: string;
  name: string;
  category: string;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: number | null;
  address: string;
  lat: number;
  lng: number;
  openingHours: string[] | null;
  phoneNumber: string | null;
  website: string | null;
  bookingUrl: string | null;
  photoUrls: string[];
}

export interface Restaurant {
  id: string;
  placeId: string;
  name: string;
  cuisine: string | null;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: number | null;
  priceLevelLabel: 'Budget' | 'Moderate' | 'Expensive' | 'Very Expensive' | null;
  address: string;
  lat: number;
  lng: number;
  openingHours: string[] | null;
  phoneNumber: string | null;
  website: string | null;
  photoUrls: string[];
  servesBreakfast: boolean | null;
  servesLunch: boolean | null;
  servesDinner: boolean | null;
  googleMapsUrl: string | null;
}

export interface DayWeather {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
  isGoodForOutdoor: boolean;
}

export interface WeatherForecast {
  location: string;
  days: DayWeather[];
}

export interface MealSlot {
  restaurant_id: string | null;
  restaurant_name: string;
  note: string;
}

export interface ItineraryTimeSlot {
  activity_id: string;
  activity_name: string;
  start_time: string;           // "09:00"
  end_time: string;             // "11:30"
  note: string;
  travel_time_to_next_minutes: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  weather_note: string;
  estimated_day_cost_usd: number;
  morning: ItineraryTimeSlot;
  afternoon: ItineraryTimeSlot;
  evening: ItineraryTimeSlot;
  meals: {
    breakfast: MealSlot;
    lunch: MealSlot;
    dinner: MealSlot;
  };
}

export interface Itinerary {
  summary: string;
  recommended_property_ids: string[];
  estimated_total_cost_usd: number;
  days: ItineraryDay[];
  tips: string[];
  packing_suggestions: string[];
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  checkin: string;
  checkout: string;
  guests: number;
  status: TripStatus;
  itinerary: Itinerary | null;
  created_at: string;
}

export interface Inquiry {
  id: string;
  trip_id: string;
  user_id: string;
  property_id: string;
  platform: string;
  property_snapshot: Property;
  ai_message: string;
  final_message: string;
  channel: string;
  status: InquiryStatus;
  wa_link: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface SearchParams {
  destination: string;
  lat: number;
  lng: number;
  checkin: string;
  checkout: string;
  guests: number;
  currency?: string;
}
