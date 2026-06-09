import type { FastifyInstance } from 'fastify';
import Sentry from '../instrument.js';

export function initSentry(app: FastifyInstance) {
  // Attaches Fastify lifecycle hooks to Sentry
  Sentry.setupFastifyErrorHandler(app);
}
