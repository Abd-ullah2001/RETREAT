import axios from 'axios';
import crypto from 'node:crypto';
import { config } from '../config.js';
import logger from '../lib/logger.js';
import { cacheGet, cacheSet } from './cacheService.js';

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days

export function estimateTravelTime(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  const speedKmh = 30; // assume 30 km/h average city speed
  return Math.round((distanceKm / speedKmh) * 3600); // seconds
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export async function getTravelTimes(
  origins: { lat: number; lng: number }[],
  destinations: { lat: number; lng: number }[],
): Promise<{ durationSeconds: number[][]; distanceMeters: number[][] } | null> {
  if (origins.length === 0 || destinations.length === 0) return null;

  // Build deterministic hash for caching
  const hashObj = { origins, destinations };
  const hash = crypto.createHash('md5').update(JSON.stringify(hashObj)).digest('hex');
  const cacheKey = `distances:${hash}`;

  const cached = await cacheGet<{ durationSeconds: number[][]; distanceMeters: number[][] }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const durationSeconds: number[][] = Array(origins.length).fill(null).map(() => Array(destinations.length).fill(0));
    const distanceMeters: number[][] = Array(origins.length).fill(null).map(() => Array(destinations.length).fill(0));

    // Distance Matrix API allows max 10 origins * 10 destinations = 100 elements per request
    const maxElements = 10;
    const originChunks = chunkArray(origins, maxElements);
    const destChunks = chunkArray(destinations, maxElements);

    for (let i = 0; i < originChunks.length; i++) {
      for (let j = 0; j < destChunks.length; j++) {
        const oChunk = originChunks[i];
        const dChunk = destChunks[j];

        const originsStr = oChunk.map((c) => `${c.lat},${c.lng}`).join('|');
        const destinationsStr = dChunk.map((c) => `${c.lat},${c.lng}`).join('|');

        const { data } = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
          params: {
            origins: originsStr,
            destinations: destinationsStr,
            mode: 'driving',
            units: 'metric',
            key: config.GOOGLE_PLACES_API_KEY,
          },
        });

        if (data.status !== 'OK') {
          throw new Error(`Distance Matrix API returned status: ${String(data.status)}`);
        }

        const rows = data.rows ?? [];
        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
          const elements = rows[rowIdx].elements ?? [];
          for (let colIdx = 0; colIdx < elements.length; colIdx++) {
            const element = elements[colIdx];
            const globalRowIdx = i * maxElements + rowIdx;
            const globalColIdx = j * maxElements + colIdx;

            if (element.status === 'OK') {
              durationSeconds[globalRowIdx][globalColIdx] = element.duration.value;
              distanceMeters[globalRowIdx][globalColIdx] = element.distance.value;
            } else {
              // Fallback to estimate if specific route fails
              const o = origins[globalRowIdx];
              const d = destinations[globalColIdx];
              durationSeconds[globalRowIdx][globalColIdx] = estimateTravelTime(o.lat, o.lng, d.lat, d.lng);
              distanceMeters[globalRowIdx][globalColIdx] = 0;
            }
          }
        }
      }
    }

    const result = { durationSeconds, distanceMeters };
    await cacheSet(cacheKey, result, CACHE_TTL);

    return result;
  } catch (err) {
    logger.error({ service: 'distanceService', err }, 'distance_matrix_failed');
    return null;
  }
}
