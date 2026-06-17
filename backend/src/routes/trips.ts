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
import { searchRestaurants } from '../services/restaurantService.js';
import { getForecast } from '../services/weatherService.js';
import { clusterItems, type ClusterInput } from '../services/clusteringService.js';
import { getTravelTimes } from '../services/distanceService.js';

/** DB enum uses vrbo for Airbnb listings */
function toDbPlatform(platform: 'booking' | 'airbnb'): 'booking' | 'vrbo' {
  return platform === 'airbnb' ? 'vrbo' : 'booking';
}

function getNumDays(checkin: string, checkout: string): number {
  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
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

  // Re-usable logic for gathering enhanced payload
  async function prepareEnhancedPayload(trip: any, currency: string) {
    const numDays = getNumDays(trip.checkin, trip.checkout);

    // Fetch user preferences from DB fallback
    const { data: userPref } = await supabase
      .from('users')
      .select('travel_style, interests, budget_tier')
      .eq('id', trip.user_id)
      .single();

    const [booking, airbnb, activities, restaurants, weatherRes] = await Promise.allSettled([
      bookingService.searchProperties({
        destId: trip.destination, // Fallback if no specific destId, usually provided via route but we can search by location string in some providers
        checkin: trip.checkin,
        checkout: trip.checkout,
        adults: trip.guests,
        rooms: 1,
        currencyCode: currency,
      }),
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
      searchRestaurants({
        lat: trip.destination_lat,
        lng: trip.destination_lng,
        radius: 5000,
      }),
      getForecast({
        lat: trip.destination_lat,
        lng: trip.destination_lng,
        days: numDays,
      }),
    ]);

    const bookingProps = booking.status === 'fulfilled' ? booking.value : [];
    const airbnbProps = airbnb.status === 'fulfilled' ? airbnb.value : [];
    const properties = [...bookingProps, ...airbnbProps].slice(0, 10); // top 10

    const acts = activities.status === 'fulfilled' ? activities.value : [];
    const rests = restaurants.status === 'fulfilled' ? restaurants.value : [];

    const mergedItems: ClusterInput[] = [
      ...acts.map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        type: 'activity' as const,
        data: a,
      })),
      ...rests.map((r) => ({
        id: r.id,
        lat: r.lat,
        lng: r.lng,
        type: 'restaurant' as const,
        data: r,
      })),
    ];

    const clusters = clusterItems(mergedItems, numDays);

    const topItems = clusters.flatMap((c) => c.items.slice(0, 5));
    const coordinates = topItems.map((item) => ({ lat: item.lat, lng: item.lng }));

    const travelTimes = await getTravelTimes(coordinates, coordinates);

    const budgetTier = trip.budget_tier || userPref?.budget_tier || 'comfort';
    const userPreferences = {
      travelStyle: trip.travel_style || userPref?.travel_style || null,
      interests: trip.interests || userPref?.interests || [],
      budgetTier,
      budgetPerDayUsd: trip.budget_per_day_usd || 
        (budgetTier === 'budget' ? 100 : budgetTier === 'luxury' ? 800 : 300),
    };

    const weather = weatherRes.status === 'fulfilled' && weatherRes.value ? weatherRes.value.days : null;

    return {
      destination: trip.destination,
      checkin: trip.checkin,
      checkout: trip.checkout,
      guests: trip.guests,
      numDays,
      userPreferences,
      properties,
      activityClusters: clusters,
      weather,
      travelTimes,
    };
  }

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

    const currency = bodyParsed.data.currency || 'USD';

    try {
      const payload = await prepareEnhancedPayload(trip, currency);

      const { data: itinerary } = await axios.post(`${config.AI_SERVICE_URL}/plan`, payload);

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

  app.post('/trips/:tripId/replan', async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const userId = request.user!.id;
    const body = request.body as { feedback?: string } | undefined;

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (tripError || !trip || !trip.itinerary) {
      return reply.status(400).send({ error: 'Trip not found or no existing itinerary', requestId: request.requestId });
    }

    try {
      const payload = await prepareEnhancedPayload(trip, 'USD');
      const enhancedPayload = {
        ...payload,
        feedback: body?.feedback,
      };

      const { data: itinerary } = await axios.post(`${config.AI_SERVICE_URL}/replan`, enhancedPayload);

      const { data: updated, error: updateError } = await supabase
        .from('trips')
        .update({ itinerary })
        .eq('id', tripId)
        .select()
        .single();

      if (updateError || !updated) {
        return reply.status(500).send({ error: 'Failed to save itinerary', requestId: request.requestId });
      }

      logger.info({ tripId, userId }, 'itinerary_replanned');
      return reply.send({ trip: updated as Trip, regenerated: true });
    } catch (err) {
      logger.error({ requestId: request.requestId, userId, service: 'tripsRoute', err }, 'replan_failed');
      return reply.status(502).send({ error: 'AI service unavailable', requestId: request.requestId });
    }
  });

  app.get('/trips/:tripId/itinerary/stream', async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const userId = request.user!.id;
    const query = request.query as { currency?: string; feedback?: string };

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (tripError || !trip) {
      return reply.status(404).send({ error: 'Trip not found', requestId: request.requestId });
    }

    // Fetch user preferences from DB fallback
    const { data: userPref } = await supabase
      .from('users')
      .select('travel_style, interests, budget_tier')
      .eq('id', trip.user_id)
      .single();

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const send = (event: string, data: object) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      send('progress', { step: 1, message: 'Searching properties...', percent: 10 });
      
      const currency = query.currency || 'USD';
      const numDays = getNumDays(trip.checkin, trip.checkout);

      const [booking, airbnb] = await Promise.allSettled([
        bookingService.searchProperties({
          destId: trip.destination, 
          checkin: trip.checkin,
          checkout: trip.checkout,
          adults: trip.guests,
          rooms: 1,
          currencyCode: currency,
        }),
        airbnbService.searchProperties({
          location: trip.destination,
          checkin: trip.checkin,
          checkout: trip.checkout,
          adults: trip.guests,
          currency,
        }),
      ]);

      send('progress', { step: 2, message: 'Finding activities...', percent: 25 });
      const activities = await searchActivities({
        lat: trip.destination_lat,
        lng: trip.destination_lng,
        radius: 5000,
      }).catch(() => []);

      send('progress', { step: 3, message: 'Searching restaurants...', percent: 40 });
      const restaurants = await searchRestaurants({
        lat: trip.destination_lat,
        lng: trip.destination_lng,
        radius: 5000,
      }).catch(() => []);

      send('progress', { step: 4, message: 'Checking weather...', percent: 55 });
      const weatherRes = await getForecast({
        lat: trip.destination_lat,
        lng: trip.destination_lng,
        days: numDays,
      }).catch(() => null);

      send('progress', { step: 5, message: 'Clustering locations...', percent: 65 });
      
      const bookingProps = booking.status === 'fulfilled' ? booking.value : [];
      const airbnbProps = airbnb.status === 'fulfilled' ? airbnb.value : [];
      const properties = [...bookingProps, ...airbnbProps].slice(0, 10);

      const mergedItems: ClusterInput[] = [
        ...activities.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, type: 'activity' as const, data: a })),
        ...restaurants.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng, type: 'restaurant' as const, data: r })),
      ];

      const clusters = clusterItems(mergedItems, numDays);
      const topItems = clusters.flatMap((c) => c.items.slice(0, 5));
      const coordinates = topItems.map((item) => ({ lat: item.lat, lng: item.lng }));

      const travelTimes = await getTravelTimes(coordinates, coordinates);

      const budgetTier = trip.budget_tier || userPref?.budget_tier || 'comfort';
      const userPreferences = {
        travelStyle: trip.travel_style || userPref?.travel_style || null,
        interests: trip.interests || userPref?.interests || [],
        budgetTier,
        budgetPerDayUsd: trip.budget_per_day_usd || 
          (budgetTier === 'budget' ? 100 : budgetTier === 'luxury' ? 800 : 300),
      };

      const weather = weatherRes ? weatherRes.days : null;

      const payload = {
        destination: trip.destination,
        checkin: trip.checkin,
        checkout: trip.checkout,
        guests: trip.guests,
        numDays,
        userPreferences,
        properties,
        activityClusters: clusters,
        weather,
        travelTimes,
        feedback: query.feedback,
      };

      send('progress', { step: 6, message: 'AI is planning your trip...', percent: 75 });
      
      const endpoint = query.feedback ? '/replan' : '/plan';
      const { data: itinerary } = await axios.post(`${config.AI_SERVICE_URL}${endpoint}`, payload);

      send('progress', { step: 7, message: 'Saving your itinerary...', percent: 90 });

      const { data: updated, error: updateError } = await supabase
        .from('trips')
        .update({ itinerary, status: 'active' })
        .eq('id', tripId)
        .select()
        .single();

      if (updateError || !updated) {
        throw new Error('Failed to save itinerary');
      }

      send('complete', { trip: updated, percent: 100 });
      reply.raw.end();
    } catch (err) {
      logger.error({ requestId: request.requestId, userId, service: 'tripsRouteStream', err }, 'itinerary_stream_failed');
      send('error', { message: 'Planning failed. Please try again.' });
      reply.raw.end();
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
