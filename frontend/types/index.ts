export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export interface Property {
  id: string;
  platform: 'booking' | 'airbnb';
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

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  checkin: string;
  checkout: string;
  guests: number;
  status: 'planning' | 'active' | 'completed';
  itinerary: Itinerary | null;
  created_at: string;
}

export interface Itinerary {
  summary: string;
  recommended_property_ids: string[];
  days: ItineraryDay[];
  tips: string[];
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  morning: { activity_id: string; note: string };
  afternoon: { activity_id: string; note: string };
  evening: { activity_id: string; note: string };
  meal_suggestion: string;
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
  status: 'draft' | 'sent';
  wa_link: string | null;
  sent_at: string | null;
  created_at: string;
}
