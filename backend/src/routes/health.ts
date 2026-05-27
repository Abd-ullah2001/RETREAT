/**
 * Deep health check — validates Redis, Supabase, and AI service before traffic routing.
 */
import axios from 'axios';
import type { FastifyPluginAsync } from 'fastify';
import { config } from '../config.js';
import { redis } from '../plugins/redis.js';
import { supabase } from '../plugins/supabase.js';

type ServiceStatus = 'ok' | 'error';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_request, reply) => {
    const services: Record<string, ServiceStatus> = {
      redis: 'ok',
      supabase: 'ok',
      ai_service: 'ok',
    };

    // Redis — cache layer must be reachable before serving search traffic
    try {
      const pong = await redis.ping();
      if (pong !== 'PONG') {
        services.redis = 'error';
      }
    } catch {
      services.redis = 'error';
    }

    // Supabase — DB connectivity via lightweight head count
    try {
      const { error } = await supabase.from('users').select('*', { count: 'exact', head: true });
      if (error) {
        services.supabase = 'error';
      }
    } catch {
      services.supabase = 'error';
    }

    // AI service — itinerary/message generation dependency
    try {
      const { status } = await axios.get(`${config.AI_SERVICE_URL}/health`, {
        timeout: 5_000,
        validateStatus: () => true,
      });
      if (status !== 200) {
        services.ai_service = 'error';
      }
    } catch {
      services.ai_service = 'error';
    }

    const allOk = Object.values(services).every((s) => s === 'ok');
    const statusCode = allOk ? 200 : 503;

    return reply.status(statusCode).send({
      status: allOk ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services,
    });
  });
};

export default healthRoutes;
