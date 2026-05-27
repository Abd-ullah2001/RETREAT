/**
 * Property search — parallel Booking.com + Airbnb with merge and dedupe.
 */
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import logger from '../lib/logger.js';
import { PropertySearchQuerySchema } from '../schemas/property.js';
import * as bookingService from '../services/bookingService.js';
import * as airbnbService from '../services/airbnbService.js';
import { cacheGet } from '../services/cacheService.js';

const propertyRoutes: FastifyPluginAsync = async (app) => {
  app.get('/properties/search', { preHandler: authenticate }, async (request, reply) => {
    const parsed = PropertySearchQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        requestId: request.requestId,
      });
    }

    const { destination, destId, checkin, checkout, guests, currency } = parsed.data;
    const userId = request.user!.id;

    logger.info(
      { requestId: request.requestId, userId, service: 'propertiesRoute' },
      'properties_search_started',
    );

    const bookingCacheKey = destId
      ? `booking:${destId}:${checkin}:${checkout}:${guests}:1`
      : null;
    const airbnbCacheKey = `airbnb:${destination}:${checkin}:${checkout}:${guests}`;

    const [bookingCached, airbnbCached] = await Promise.all([
      bookingCacheKey ? cacheGet<unknown[]>(bookingCacheKey) : null,
      cacheGet<unknown[]>(airbnbCacheKey),
    ]);

    const bookingPromise = destId
      ? bookingService.searchProperties({
          destId,
          checkin,
          checkout,
          adults: guests,
          rooms: 1,
          currencyCode: currency,
        })
      : Promise.resolve([]);

    const airbnbPromise = airbnbService.searchProperties({
      location: destination,
      checkin,
      checkout,
      adults: guests,
      currency,
    });

    const [bookingResult, airbnbResult] = await Promise.allSettled([bookingPromise, airbnbPromise]);

    const booking =
      bookingResult.status === 'fulfilled' ? bookingResult.value : [];
    const airbnb =
      airbnbResult.status === 'fulfilled' ? airbnbResult.value : [];

    const seen = new Set<string>();
    const merged = [...booking, ...airbnb].filter((p) => {
      const key = `${p.platform}:${p.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    merged.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    const cached = Boolean(bookingCached || airbnbCached);

    logger.info(
      {
        requestId: request.requestId,
        userId,
        service: 'propertiesRoute',
        count: merged.length,
        cached,
        booking: booking.length,
        airbnb: airbnb.length,
      },
      'properties_search_completed',
    );

    return reply.send({
      properties: merged,
      sources: { booking: booking.length, airbnb: airbnb.length },
      cached,
      count: merged.length,
    });
  });
};

export default propertyRoutes;
