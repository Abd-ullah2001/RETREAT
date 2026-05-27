/**
 * Retreat API — Fastify 5 entry point.
 * Plugins → routes → global error handler → listen.
 */
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import * as Sentry from '@sentry/node';
import { config } from './config.js';
import logger from './lib/logger.js';
import { initSentry } from './plugins/sentry.js';
import { requestLogger } from './middleware/requestLogger.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import activityRoutes from './routes/activities.js';
import tripRoutes from './routes/trips.js';
import inquiryRoutes from './routes/inquiries.js';
import messageRoutes from './routes/messages.js';
import workerRoutes from './workers/inquiryWorker.js';

const app = Fastify({
  logger: false,
  requestIdHeader: 'x-request-id',
  genReqId: () => crypto.randomUUID(),
});

// Per-request structured logging with requestId
app.addHook('onRequest', requestLogger);

async function buildServer() {
  initSentry(app);
  await app.register(helmet);

  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // API v1 routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(propertyRoutes, { prefix: '/api/v1' });
  await app.register(activityRoutes, { prefix: '/api/v1' });
  await app.register(tripRoutes, { prefix: '/api/v1' });
  await app.register(inquiryRoutes, { prefix: '/api/v1' });
  await app.register(messageRoutes, { prefix: '/api/v1' });

  // QStash worker — no /api/v1 prefix; verified via WORKER_SECRET in Phase 7
  await app.register(workerRoutes);

  app.setErrorHandler((error: Error & { statusCode?: number }, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    const message = statusCode >= 500 ? 'Internal Server Error' : error.message;

    logger.error({
      msg: error.message,
      requestId: request.requestId,
      statusCode,
      stack: config.NODE_ENV === 'development' ? error.stack : undefined,
    });

    if (config.NODE_ENV === 'production' && statusCode >= 500) {
      Sentry.captureException(error);
    }

    reply.status(statusCode).send({
      error: message,
      requestId: request.requestId,
    });
  });

  return app;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info({ msg: 'server started', port: config.PORT, env: config.NODE_ENV });
  } catch (err) {
    logger.fatal({ msg: 'failed to start server', err });
    process.exit(1);
  }
}

start();
