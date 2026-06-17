import type { FastifyRequest } from 'fastify';
import Sentry from '../instrument.js';

export function setSentryContext(req: FastifyRequest) {
  Sentry.setContext('request', {
    id: req.id,
    url: req.url,
    method: req.method,
  });

  const user = (req as any).user;
  if (user?.id) {
    Sentry.setUser({
      id: user.id,
    });
  }

};
