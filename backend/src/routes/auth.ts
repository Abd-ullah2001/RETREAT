/**
 * Auth routes — token verification after OAuth and current user profile.
 */
import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import { VerifyBodySchema, SignUpBodySchema } from '../schemas/user.js';
import { supabase } from '../plugins/supabase.js';
import { getUserById, upsertUserFromAuth, verifyAccessToken } from '../services/authService.js';

function normalizeAuthIdentifier(value: string) {
  const raw = value.trim();
  const [local, domain] = raw.split('@');
  const normalizedLocal = local.trim().replace(/\s+/g, '_') || 'user';
  if (!domain || domain.trim() === '') {
    return `${normalizedLocal}@retreat.local`;
  }

  const cleanedDomain = domain.trim().replace(/\s+/g, '');
  const normalizedDomain = cleanedDomain.includes('.') ? cleanedDomain : `${cleanedDomain || 'retreat'}.local`;
  return `${normalizedLocal}@${normalizedDomain}`;
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/signup', async (request, reply) => {
    const parsed = SignUpBodySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid signup payload',
        requestId: request.requestId,
      });
    }

    const { email, password } = parsed.data;
    const signupEmail = normalizeAuthIdentifier(email);
    const { data, error } = await supabase.auth.admin.createUser({
      email: signupEmail,
      password,
      email_confirm: true,
    } as any);

    if (error || !data?.user) {
      return reply.status(error?.status ?? 400).send({
        error: error?.message ?? 'Failed to create user',
        requestId: request.requestId,
      });
    }

    return reply.status(201).send({ user: data.user });
  });

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
