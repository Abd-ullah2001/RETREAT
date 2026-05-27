/**
 * Inquiry workflow — AI draft + WhatsApp deep link (user sends manually).
 */
import axios from 'axios';
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import logger from '../lib/logger.js';
import { config } from '../config.js';
import { supabase } from '../plugins/supabase.js';
import { getUserById } from '../services/authService.js';
import { cacheIncr } from '../services/cacheService.js';
import { buildWaLink } from '../services/whatsappService.js';
import {
  CreateInquiryBodySchema,
  UpdateInquiryMessageBodySchema,
} from '../schemas/inquiry.js';

const DAILY_INQUIRY_LIMIT = 10;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

const inquiryRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.post('/inquiries', async (request, reply) => {
    const parsed = CreateInquiryBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', requestId: request.requestId });
    }

    const userId = request.user!.id;
    const { tripId, propertyId, platform, propertySnapshot, hostPhone } = parsed.data;

    const { data: trip } = await supabase
      .from('trips')
      .select('id, destination, checkin, checkout, guests')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (!trip) {
      return reply.status(403).send({ error: 'Forbidden', requestId: request.requestId });
    }

    const limitKey = `inquiry_limit:${userId}:${todayKey()}`;
    const count = await cacheIncr(limitKey, 86_400);
    if (count > DAILY_INQUIRY_LIMIT) {
      return reply.status(429).send({
        error: 'Daily inquiry limit reached',
        requestId: request.requestId,
      });
    }

    const profile = await getUserById(userId);
    const userName = profile?.name ?? profile?.email ?? 'Traveler';

    let aiMessage: string;
    try {
      const { data } = await axios.post(`${config.AI_SERVICE_URL}/message`, {
        property_name: propertySnapshot.name,
        property_address: propertySnapshot.address,
        checkin: trip.checkin,
        checkout: trip.checkout,
        guests: trip.guests,
        user_name: userName,
      });
      aiMessage = data.message;
    } catch (err) {
      logger.error({ requestId: request.requestId, userId, service: 'inquiriesRoute', err }, 'ai_message_failed');
      return reply.status(502).send({ error: 'AI service unavailable', requestId: request.requestId });
    }

    const waLink = buildWaLink(hostPhone ?? null, aiMessage);

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert({
        trip_id: tripId,
        user_id: userId,
        property_id: propertyId,
        platform,
        property_snapshot: propertySnapshot,
        ai_message: aiMessage,
        final_message: aiMessage,
        channel: 'whatsapp',
        status: 'draft',
        wa_link: waLink,
      })
      .select('id, ai_message, wa_link, status')
      .single();

    if (error || !inquiry) {
      return reply.status(500).send({ error: 'Failed to create inquiry', requestId: request.requestId });
    }

    return reply.status(201).send({ inquiry });
  });

  app.get('/inquiries', async (request, reply) => {
    const userId = request.user!.id;
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return reply.status(500).send({ error: 'Failed to fetch inquiries', requestId: request.requestId });
    }

    return reply.send({ inquiries: data ?? [] });
  });

  app.patch('/inquiries/:id/message', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = UpdateInquiryMessageBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid request body', requestId: request.requestId });
    }

    const userId = request.user!.id;

    const { data: existing } = await supabase
      .from('inquiries')
      .select('id, wa_link')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return reply.status(404).send({ error: 'Inquiry not found', requestId: request.requestId });
    }

    // Rebuild wa_link from stored phone if present in old link
    const phoneMatch = existing.wa_link?.match(/wa\.me\/(\d+)/);
    const hostPhone = phoneMatch?.[1] ?? null;
    const waLink = buildWaLink(hostPhone, parsed.data.final_message);

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({ final_message: parsed.data.final_message, wa_link: waLink })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !inquiry) {
      return reply.status(500).send({ error: 'Failed to update inquiry', requestId: request.requestId });
    }

    return reply.send({ inquiry });
  });

  app.patch('/inquiries/:id/sent', async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !inquiry) {
      return reply.status(404).send({ error: 'Inquiry not found', requestId: request.requestId });
    }

    return reply.send({ inquiry });
  });
};

export default inquiryRoutes;
