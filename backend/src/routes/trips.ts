/**
 * Trip CRUD + AI itinerary generation.
 */
import axios from 'axios';
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import logger from '../lib/logger.js';
import { config } from '../config.js';
import { supabase } from '../plugins/supabase.js';
import {
  CreateTripBodySchema,
  GenerateItineraryBodySchema,
  type Trip,
} from '../schemas/trip.js';
import { PropertyInteractionBodySchema } from '../schemas/inquiry.js';
import * as bookingService from '../services/bookingService.js';
import * as airbnbService from '../services/airbnbService.js';
import { searchActivities } from '../services/placesService.js';

/** DB enum uses vrbo for Airbnb listings */
function toDbPlatform(platform: 'booking' | 'airbnb'): 'booking' | 'vrbo' {
  return platform === 'airbnb' ? 'vrbo' : 'booking';
}

const tripRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.post('/trips', async (request, reply) => {
    const parsed = CreateTripBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', requestId: request.requestId });
    }

    const userId = request.user!.id;
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        destination: parsed.data.destination,
        destination_lat: parsed.data.destination_lat,
        destination_lng: parsed.data.destination_lng,
        checkin: parsed.data.checkin,
        checkout: parsed.data.checkout,
        guests: parsed.data.guests,
        status: 'planning',
      })
      .select()
      .single();

    if (error || !data) {
      logger.error({ requestId: request.requestId, userId, service: 'tripsRoute', err: error }, 'trip_create_failed');
      return reply.status(500).send({ error: 'Failed to create trip', requestId: request.requestId });
    }

    return reply.status(201).send({ trip: data as Trip });
  });

  app.get('/trips', async (request, reply) => {
    const userId = request.user!.id;
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return reply.status(500).send({ error: 'Failed to fetch trips', requestId: request.requestId });
    }

    return reply.send({ trips: data ?? [] });
  });

  app.get('/trips/:tripId', async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const userId = request.user!.id;

    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return reply.status(404).send({ error: 'Trip not found', requestId: request.requestId });
    }

    return reply.send({ trip: data as Trip });
  });

  app.post('/trips/:tripId/itinerary', async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const userId = request.user!.id;
    const bodyParsed = GenerateItineraryBodySchema.safeParse(request.body ?? {});

    if (!bodyParsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', requestId: request.requestId });
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (tripError || !trip) {
      return reply.status(404).send({ error: 'Trip not found', requestId: request.requestId });
    }

    const { destId, currency } = bodyParsed.data;

    const [booking, airbnb, activities] = await Promise.all([
      destId
        ? bookingService.searchProperties({
            destId,
            checkin: trip.checkin,
            checkout: trip.checkout,
            adults: trip.guests,
            rooms: 1,
            currencyCode: currency,
          })
        : Promise.resolve([]),
      airbnbService.searchProperties({
        location: trip.destination,
        checkin: trip.checkin,
        checkout: trip.checkout,
        adults: trip.guests,
        currency,
      }),
      searchActivities({
        lat: trip.destination_lat,
        lng: trip.destination_lng,
        radius: 5000,
      }),
    ]);

    const properties = [...booking, ...airbnb].slice(0, 20);

    try {
      const { data: itinerary } = await axios.post(`${config.AI_SERVICE_URL}/plan`, {
        destination: trip.destination,
        checkin: trip.checkin,
        checkout: trip.checkout,
        guests: trip.guests,
        properties,
        activities,
      });

      const { data: updated, error: updateError } = await supabase
        .from('trips')
        .update({ itinerary, status: 'active' })
        .eq('id', tripId)
        .select()
        .single();

      if (updateError || !updated) {
        return reply.status(500).send({ error: 'Failed to save itinerary', requestId: request.requestId });
      }

      return reply.send({ trip: updated as Trip });
    } catch (err) {
      logger.error({ requestId: request.requestId, userId, service: 'tripsRoute', err }, 'itinerary_generation_failed');
      return reply.status(502).send({ error: 'AI service unavailable', requestId: request.requestId });
    }
  });

  app.post('/trips/:tripId/interactions', async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const parsed = PropertyInteractionBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', requestId: request.requestId });
    }

    const userId = request.user!.id;

    const { data: trip } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (!trip) {
      return reply.status(403).send({ error: 'Forbidden', requestId: request.requestId });
    }

    const { error } = await supabase.from('property_interactions').insert({
      trip_id: tripId,
      user_id: userId,
      property_id: parsed.data.propertyId,
      platform: toDbPlatform(parsed.data.platform),
      property_snapshot: parsed.data.propertySnapshot,
      action: parsed.data.action,
    });

    if (error) {
      return reply.status(500).send({ error: 'Failed to record interaction', requestId: request.requestId });
    }

    return reply.status(201).send({ ok: true });
  });
};

export default tripRoutes;
