/**
 * JWT auth preHandler — verifies Supabase access token from Authorization header.
 * Inject on protected routes only (not global) to keep /health and /worker public.
 */
import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from '../services/authService.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  const queryToken = (request.query as Record<string, string>)?.token;

  let token = '';
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized', requestId: request.requestId });
  }

  const authUser = await verifyAccessToken(token);

  if (!authUser) {
    return reply.status(401).send({ error: 'Unauthorized', requestId: request.requestId });
  }

  request.user = {
    id: authUser.id,
    email: authUser.email ?? '',
  };
}
