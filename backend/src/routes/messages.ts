/**
 * Inquiry thread for a trip — all messages/inquiries tied to tripId.
 */
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import { supabase } from '../plugins/supabase.js';

const messageRoutes: FastifyPluginAsync = async (app) => {
  app.get('/messages/:tripId', { preHandler: authenticate }, async (request, reply) => {
    const { tripId } = request.params as { tripId: string };
    const userId = request.user!.id;

    const { data: trip } = await supabase
      .from('trips')
      .select('id')
      .eq('id', tripId)
      .eq('user_id', userId)
      .single();

    if (!trip) {
      return reply.status(404).send({ error: 'Trip not found', requestId: request.requestId });
    }

    const { data: messages, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      return reply.status(500).send({ error: 'Failed to fetch messages', requestId: request.requestId });
    }

    return reply.send({ messages: messages ?? [] });
  });
};

export default messageRoutes;
