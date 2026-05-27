/**
 * Google Places API (New) — nearby search with 24h Redis cache.
 */
import axios from 'axios';
import { config } from '../config.js';
import logger from '../lib/logger.js';
import type { Activity } from '../schemas/activity.js';
import { cacheGet, cacheSet } from './cacheService.js';

const CACHE_TTL = 24 * 60 * 60; // 24 hours
const PLACES_URL = 'https://places.googleapis.com/v1/places:searchNearby';

const INCLUDED_TYPES = [
  'tourist_attraction',
  'museum',
  'park',
  'restaurant',
  'bar',
  'night_club',
  'spa',
  'amusement_park',
] as const;

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
].join(',');

function mapPlace(place: Record<string, unknown>): Activity | null {
  try {
    const placeId = String(place.id ?? '').replace('places/', '');
    const displayName = place.displayName as Record<string, unknown> | undefined;
    const location = place.location as Record<string, unknown> | undefined;
    const hours = place.currentOpeningHours as Record<string, unknown> | undefined;
    const weekdayDescriptions = hours?.weekdayDescriptions as string[] | undefined;

    const photos = place.photos as Record<string, unknown>[] | undefined;
    const photoUrls: string[] = [];
    if (photos?.[0]?.name) {
      photoUrls.push(
        `https://places.googleapis.com/v1/${String(photos[0].name)}/media?maxWidthPx=400&key=${config.GOOGLE_PLACES_API_KEY}`,
      );
    }

    return {
      id: placeId,
      placeId,
      name: String(displayName?.text ?? 'Unknown'),
      category: String(place.primaryType ?? 'point_of_interest'),
      rating: place.rating != null ? Number(place.rating) : null,
      reviewCount: place.userRatingCount != null ? Number(place.userRatingCount) : null,
      priceLevel: place.priceLevel != null ? Number(place.priceLevel) : null,
      address: String(place.formattedAddress ?? ''),
      lat: Number(location?.latitude ?? 0),
      lng: Number(location?.longitude ?? 0),
      openingHours: weekdayDescriptions ?? null,
      phoneNumber: place.internationalPhoneNumber ? String(place.internationalPhoneNumber) : null,
      website: place.websiteUri ? String(place.websiteUri) : null,
      bookingUrl: place.websiteUri ? String(place.websiteUri) : null,
      photoUrls,
    };
  } catch {
    return null;
  }
}

export async function searchActivities(params: {
  lat: number;
  lng: number;
  radius: number;
}): Promise<Activity[]> {
  const cacheKey = `activities:${params.lat.toFixed(2)}:${params.lng.toFixed(2)}:${params.radius}`;

  const cached = await cacheGet<Activity[]>(cacheKey);
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
    const activities = places.map(mapPlace).filter((a): a is Activity => a !== null);

    await cacheSet(cacheKey, activities, CACHE_TTL);
    return activities;
  } catch (err) {
    logger.error({ service: 'placesService', err }, 'places_search_failed');
    return [];
  }
}
