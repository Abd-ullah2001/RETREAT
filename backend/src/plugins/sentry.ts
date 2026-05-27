/**
 * Sentry Fastify integration — production error tracking.
 */
import * as Sentry from '@sentry/node';
import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';

export function initSentry(app: FastifyInstance): void {
  if (config.NODE_ENV !== 'production' || !config.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: config.SENTRY_DSN,
    environment: config.NODE_ENV,
    tracesSampleRate: 0.1,
  });

  Sentry.setupFastifyErrorHandler(app);
}
