import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { getForecast } from '../services/weatherService.js';

const WeatherQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  days: z.coerce.number().min(1).max(7).default(5),
});

const weatherRoutes: FastifyPluginAsync = async (app) => {
  app.get('/weather/forecast', { preHandler: authenticate }, async (request, reply) => {
    const parsed = WeatherQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        requestId: request.requestId,
      });
    }

    const { lat, lng, days } = parsed.data;

    const forecast = await getForecast({ lat, lng, days });

    return reply.send({
      forecast,
      cached: forecast !== null,
    });
  });
};

export default weatherRoutes;
