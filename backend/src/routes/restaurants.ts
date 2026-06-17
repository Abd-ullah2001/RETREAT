import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { searchRestaurants } from '../services/restaurantService.js';

const SearchQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().default(3000),
  cuisine: z.string().optional(),
});

const restaurantRoutes: FastifyPluginAsync = async (app) => {
  app.get('/restaurants/search', { preHandler: authenticate }, async (request, reply) => {
    const parsed = SearchQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        requestId: request.requestId,
      });
    }

    const { lat, lng, radius, cuisine } = parsed.data;

    const restaurants = await searchRestaurants({
      lat,
      lng,
      radius,
      cuisine,
    });

    return reply.send({
      restaurants,
      cached: true,
      count: restaurants.length,
    });
  });
};

export default restaurantRoutes;
