/**
 * Airbnb property search via RapidAPI (airbnb19 or subscribed host).
 * Response shape varies by provider — mapping handles common nested structures.
 */
import { config } from '../config.js';
import logger from '../lib/logger.js';
import { rapidApi } from '../lib/rapidapi.js';
import type { Property } from '../schemas/property.js';
import { cacheGet, cacheSet } from './cacheService.js';

const CACHE_TTL = 15 * 60;

export interface AirbnbSearchParams {
  location: string;
  checkin: string;
  checkout: string;
  adults: number;
  currency: string;
}

function nightsBetween(checkin: string, checkout: string): number {
  const start = new Date(checkin);
  const end = new Date(checkout);
  return Math.max(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
}

/** Extract listing array from varying RapidAPI response envelopes */
function extractListings(data: unknown): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return [];
  const root = data as Record<string, unknown>;

  const candidates = [
    root.results,
    root.listings,
    root.data,
    (root.data as Record<string, unknown>)?.results,
    (root.data as Record<string, unknown>)?.listings,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c as Record<string, unknown>[];
  }
  return [];
}

function mapListing(listing: Record<string, unknown>, nights: number, currency: string): Property | null {
  try {
    const id = String(listing.id ?? listing.listingId ?? listing.room_id ?? '');
    if (!id) return null;

    const name = String(
      listing.name ?? listing.title ?? (listing.listing as Record<string, unknown>)?.title ?? 'Unknown',
    );

    const images = listing.images ?? listing.photos ?? listing.pictureUrls;
    const imageUrls: string[] = [];
    if (Array.isArray(images) && images[0]) {
      imageUrls.push(typeof images[0] === 'string' ? images[0] : String((images[0] as Record<string, unknown>).url ?? ''));
    } else if (typeof listing.thumbnail === 'string') {
      imageUrls.push(listing.thumbnail);
    }

    const price = listing.price as Record<string, unknown> | number | undefined;
    let pricePerNight = 0;
    if (typeof price === 'number') {
      pricePerNight = price;
    } else if (price && typeof price === 'object') {
      pricePerNight = Number(price.rate ?? price.amount ?? price.value ?? 0);
    }

    const total = listing.totalPrice ?? listing.total_price;
    const totalPrice = total != null ? Number(total) : pricePerNight * nights;

    const lat = Number(listing.lat ?? listing.latitude ?? (listing.coordinates as Record<string, unknown>)?.latitude ?? 0);
    const lng = Number(listing.lng ?? listing.longitude ?? (listing.coordinates as Record<string, unknown>)?.longitude ?? 0);

    const url = String(
      listing.url ?? listing.link ?? listing.deepLink ?? `https://www.airbnb.com/rooms/${id}`,
    );

    return {
      id,
      platform: 'airbnb',
      name,
      description: listing.description ? String(listing.description) : null,
      imageUrls: imageUrls.filter(Boolean),
      pricePerNight,
      currency: String(listing.currency ?? currency),
      totalPrice,
      rating: listing.rating != null ? Number(listing.rating) : listing.avgRating != null ? Number(listing.avgRating) : null,
      reviewCount: listing.reviewsCount != null ? Number(listing.reviewsCount) : listing.review_count != null ? Number(listing.review_count) : null,
      maxGuests: Number(listing.guests ?? listing.personCapacity ?? 2),
      bedrooms: listing.bedrooms != null ? Number(listing.bedrooms) : null,
      amenities: Array.isArray(listing.amenities) ? listing.amenities.map(String) : [],
      lat,
      lng,
      address: String(listing.city ?? listing.location ?? listing.address ?? ''),
      bookingUrl: url.startsWith('http') ? url : `https://www.airbnb.com/rooms/${id}`,
    };
  } catch {
    return null;
  }
}

export async function searchProperties(params: AirbnbSearchParams): Promise<Property[]> {
  const cacheKey = `airbnb:${params.location}:${params.checkin}:${params.checkout}:${params.adults}`;

  const cached = await cacheGet<Property[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { data } = await rapidApi.get(`https://${config.RAPIDAPI_AIRBNB_HOST}/api/v2/searchPropertyByLocation`, {
      headers: { 'x-rapidapi-host': config.RAPIDAPI_AIRBNB_HOST },
      params: {
        location: params.location,
        checkin: params.checkin,
        checkout: params.checkout,
        adults: params.adults,
        currency: params.currency,
      },
      validateStatus: () => true,
    });

    if (data?.message && typeof data.message === 'string') {
      logger.warn({ service: 'airbnbService', message: data.message }, 'airbnb_api_message');
    }

    const nights = nightsBetween(params.checkin, params.checkout);
    const listings = extractListings(data);
    const properties = listings
      .map((l) => mapListing(l, nights, params.currency))
      .filter((p): p is Property => p !== null);

    await cacheSet(cacheKey, properties, CACHE_TTL);
    return properties;
  } catch (err) {
    logger.error({ service: 'airbnbService', err }, 'airbnb_search_failed');
    return [];
  }
}
