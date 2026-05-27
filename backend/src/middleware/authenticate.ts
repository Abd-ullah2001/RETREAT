/**
 * JWT auth preHandler — verifies Supabase access token from Authorization header.
 * Inject on protected routes only (not global) to keep /health and /worker public.
 */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/authService.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', requestId: request.requestId });
  }

  const token = header.slice(7);
  const authUser = await verifyAccessToken(token);

  if (!authUser) {
    return reply.status(401).send({ error: 'Unauthorized', requestId: request.requestId });
  }

  request.user = {
    id: authUser.id,
    email: authUser.email ?? '',
  };
}
