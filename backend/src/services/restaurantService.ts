import axios from 'axios';
import { config } from '../config.js';
import logger from '../lib/logger.js';
import type { Restaurant } from '../schemas/restaurant.js';
import { cacheGet, cacheSet } from './cacheService.js';

const CACHE_TTL = 24 * 60 * 60; // 24 hours
const PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';

const INCLUDED_TYPES = ['restaurant', 'cafe', 'bakery', 'bar', 'food'] as const;

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.formattedAddress',
  'places.location',
  'places.currentOpeningHours',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.photos',
  'places.primaryType',
  'places.servesBreakfast',
  'places.servesLunch',
  'places.servesDinner',
  'places.googleMapsUri',
].join(',');

function toTitleCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPriceLevelLabel(level: number | null | undefined): 'Budget' | 'Moderate' | 'Expensive' | 'Very Expensive' | null {
  switch (level) {
    case 1: return 'Budget';
    case 2: return 'Moderate';
    case 3: return 'Expensive';
    case 4: return 'Very Expensive';
    default: return null;
  }
}

function mapRestaurant(place: Record<string, unknown>): Restaurant | null {
  try {
    const placeId = String(place.id ?? '').replace('places/', '');
    const displayName = place.displayName as Record<string, unknown> | undefined;
    const location = place.location as Record<string, unknown> | undefined;
    const hours = place.currentOpeningHours as Record<string, unknown> | undefined;
    const weekdayDescriptions = hours?.weekdayDescriptions as string[] | undefined;

    const photos = place.photos as Record<string, unknown>[] | undefined;
    const photoUrls: string[] = [];
    if (photos) {
      for (let i = 0; i < Math.min(2, photos.length); i++) {
        const name = photos[i]?.name;
        if (name) {
          photoUrls.push(
            `https://places.googleapis.com/v1/${String(name)}/media?maxHeightPx=400&key=${config.GOOGLE_PLACES_API_KEY}`,
          );
        }
      }
    }

    const priceLevel = place.priceLevel != null ? Number(place.priceLevel) : null;

    return {
      id: placeId,
      placeId,
      name: String(displayName?.text ?? 'Unknown'),
      cuisine: place.primaryType ? toTitleCase(String(place.primaryType)) : null,
      rating: place.rating != null ? Number(place.rating) : null,
      reviewCount: place.userRatingCount != null ? Number(place.userRatingCount) : null,
      priceLevel,
      priceLevelLabel: getPriceLevelLabel(priceLevel),
      address: String(place.formattedAddress ?? ''),
      lat: Number(location?.latitude ?? 0),
      lng: Number(location?.longitude ?? 0),
      openingHours: weekdayDescriptions ?? null,
      phoneNumber: place.internationalPhoneNumber ? String(place.internationalPhoneNumber) : null,
      website: place.websiteUri ? String(place.websiteUri) : null,
      photoUrls,
      servesBreakfast: place.servesBreakfast != null ? Boolean(place.servesBreakfast) : null,
      servesLunch: place.servesLunch != null ? Boolean(place.servesLunch) : null,
      servesDinner: place.servesDinner != null ? Boolean(place.servesDinner) : null,
      googleMapsUrl: place.googleMapsUri ? String(place.googleMapsUri) : null,
    };
  } catch {
    return null;
  }
}

export async function searchRestaurants(params: {
  lat: number;
  lng: number;
  radius: number;
  cuisine?: string;
}): Promise<Restaurant[]> {
  const cacheKey = `restaurants:${params.lat.toFixed(2)}:${params.lng.toFixed(2)}:${params.radius}:${params.cuisine ?? 'all'}`;

  const cached = await cacheGet<Restaurant[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { data } = await axios.post(
      PLACES_URL,
      {
        includedTypes: INCLUDED_TYPES,
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: params.lat, longitude: params.lng },
            radius: params.radius,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': config.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': FIELD_MASK,
        },
        timeout: 15_000,
      },
    );

    const places = (data?.places ?? []) as Record<string, unknown>[];
    const restaurants = places
      .map(mapRestaurant)
      .filter((r): r is Restaurant => r !== null)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    // Optional client-side filter by cuisine
    const filteredRestaurants = params.cuisine
      ? restaurants.filter((r) => r.cuisine?.toLowerCase().includes(params.cuisine!.toLowerCase()))
      : restaurants;

    await cacheSet(cacheKey, filteredRestaurants, CACHE_TTL);
    return filteredRestaurants;
  } catch (err) {
    logger.error({ service: 'restaurantService', err }, 'restaurants_search_failed');
    return [];
  }
}
