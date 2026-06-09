import type { FastifyRequest } from 'fastify';
import Sentry from '../instrument.js';

export function setSentryContext(req: FastifyRequest) {
  Sentry.setContext('request', {
    id: req.id,
    url: req.url,
    method: req.method,
  });

  if ((req as any).user) {
    Sentry.setUser({
      id: (req as any).user.id,
      email: (req as any).user.email,
    });
  }
}