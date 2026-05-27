/**
 * Activity search via Google Places.
 */
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import logger from '../lib/logger.js';
import { ActivitySearchQuerySchema } from '../schemas/activity.js';
import { searchActivities } from '../services/placesService.js';
import { cacheGet } from '../services/cacheService.js';

const activityRoutes: FastifyPluginAsync = async (app) => {
  app.get('/activities/search', { preHandler: authenticate }, async (request, reply) => {
    const parsed = ActivitySearchQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        requestId: request.requestId,
      });
    }

    const { lat, lng, radius } = parsed.data;
    const userId = request.user!.id;
    const cacheKey = `activities:${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`;
    const wasCached = Boolean(await cacheGet(cacheKey));

    logger.info(
      { requestId: request.requestId, userId, service: 'activitiesRoute' },
      'activities_search_started',
    );

    const activities = await searchActivities({ lat, lng, radius });

    logger.info(
      {
        requestId: request.requestId,
        userId,
        service: 'activitiesRoute',
        count: activities.length,
        cached: wasCached,
      },
      'activities_search_completed',
    );

    return reply.send({
      activities,
      cached: wasCached,
      count: activities.length,
    });
  });
};

export default activityRoutes;
