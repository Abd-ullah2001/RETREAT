/**
 * Auth routes — token verification after OAuth and current user profile.
 */
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import { VerifyBodySchema } from '../schemas/user.js';
import { getUserById, upsertUserFromAuth, verifyAccessToken } from '../services/authService.js';

const authRoutes: FastifyPluginAsync = async (app) => {
  /**
   * POST /api/v1/auth/verify
   * Called by frontend after Supabase OAuth callback — syncs user to DB.
   */
  app.post('/auth/verify', async (request, reply) => {
    const parsed = VerifyBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid request body',
        requestId: request.requestId,
      });
    }

    const authUser = await verifyAccessToken(parsed.data.access_token);

    if (!authUser) {
      return reply.status(401).send({
        error: 'Unauthorized',
        requestId: request.requestId,
      });
    }

    const user = await upsertUserFromAuth(authUser);

    if (!user) {
      return reply.status(500).send({
        error: 'Failed to sync user profile',
        requestId: request.requestId,
      });
    }

    return reply.send({ user });
  });

  /**
   * GET /api/v1/auth/me
   * Returns the authenticated user's row from the users table.
   */
  app.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user!.id;
    const user = await getUserById(userId);

    if (!user) {
      return reply.status(404).send({
        error: 'User not found',
        requestId: request.requestId,
      });
    }

    return reply.send({ user });
  });
};

export default authRoutes;
