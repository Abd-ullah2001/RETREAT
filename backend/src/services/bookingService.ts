/**
 * Booking.com property search via RapidAPI — cache-first to respect free tier limits.
 */
import { config } from '../config.js';
import logger from '../lib/logger.js';
import { rapidApi } from '../lib/rapidapi.js';
import type { Property } from '../schemas/property.js';
import { cacheGet, cacheSet } from './cacheService.js';

const CACHE_TTL = 15 * 60; // 15 minutes

export interface BookingSearchParams {
  destId: string;
  checkin: string;
  checkout: string;
  adults: number;
  rooms: number;
  currencyCode: string;
}

function nightsBetween(checkin: string, checkout: string): number {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

function mapHotel(hotel: Record<string, unknown>, nights: number): Property | null {
  try {
    const property = hotel.property as Record<string, unknown> | undefined;
    if (!property) return null;

    const hotelId = String(hotel.hotel_id ?? '');
    const priceBreakdown = property.priceBreakdown as Record<string, unknown> | undefined;
    const grossPrice = priceBreakdown?.grossPrice as Record<string, unknown> | undefined;
    const pricePerNight = Number(grossPrice?.value ?? 0);
    const currency = String(grossPrice?.currency ?? 'USD');
    const photoUrls = property.photoUrls as string[] | undefined;

    return {
      id: hotelId,
      platform: 'booking',
      name: String(property.name ?? 'Unknown'),
      description: null,
      imageUrls: photoUrls?.[0] ? [photoUrls[0]] : [],
      pricePerNight,
      currency,
      totalPrice: pricePerNight * nights,
      rating: property.reviewScore != null ? Number(property.reviewScore) : null,
      reviewCount: property.reviewCount != null ? Number(property.reviewCount) : null,
      maxGuests: Number(property.maxGuests ?? 2),
      bedrooms: null,
      amenities: [],
      lat: Number(property.latitude ?? 0),
      lng: Number(property.longitude ?? 0),
      address: String(property.wishlistName ?? ''),
      bookingUrl: `https://www.booking.com/hotel/${hotelId}.html`,
    };
  } catch {
    return null;
  }
}

export async function searchProperties(params: BookingSearchParams): Promise<Property[]> {
  const cacheKey = `booking:${params.destId}:${params.checkin}:${params.checkout}:${params.adults}:${params.rooms}`;

  const cached = await cacheGet<Property[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const { data } = await rapidApi.get(`https://${config.RAPIDAPI_BOOKING_HOST}/api/v1/hotels/searchHotels`, {
      headers: { 'x-rapidapi-host': config.RAPIDAPI_BOOKING_HOST },
      params: {
        dest_id: params.destId,
        search_type: 'CITY',
        adults: params.adults,
        room_qty: params.rooms,
        checkin_date: params.checkin,
        checkout_date: params.checkout,
        currency_code: params.currencyCode,
        languagecode: 'en-us',
        units: 'metric',
      },
    });

    const nights = nightsBetween(params.checkin, params.checkout);
    const hotels = (data?.data?.hotels ?? data?.hotels ?? []) as Record<string, unknown>[];
    const properties = hotels
      .map((h) => mapHotel(h, nights))
      .filter((p): p is Property => p !== null);

    await cacheSet(cacheKey, properties, CACHE_TTL);
    return properties;
  } catch (err) {
    logger.error({ service: 'bookingService', err }, 'booking_search_failed');
    return [];
  }
}
