import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

import './instrument.js'; // MUST be first

import Sentry from './instrument.js';
import { config } from './config.js';
import logger from './lib/logger.js';
import { initSentry } from './plugins/sentry.js';
import { setSentryContext } from './middleware/sentryContext.js';

// routes
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

/* ---------------------------
   SENTRY CONTEXT PER REQUEST
----------------------------*/
app.addHook('preHandler', async (req) => {
  setSentryContext(req);
});

/* ---------------------------
   DEBUG ROUTE (TEST SENTRY)
----------------------------*/
app.get('/debug-sentry', async () => {
  Sentry.captureMessage('Manual test message');
  throw new Error('Sentry test error 🚀');
});

/* ---------------------------
   SERVER BUILD
----------------------------*/
async function buildServer() {
  await app.register(helmet);

  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });

  // routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(propertyRoutes, { prefix: '/api/v1' });
  await app.register(activityRoutes, { prefix: '/api/v1' });
  await app.register(tripRoutes, { prefix: '/api/v1' });
  await app.register(inquiryRoutes, { prefix: '/api/v1' });
  await app.register(messageRoutes, { prefix: '/api/v1' });

  await app.register(workerRoutes);

  /* ---------------------------
     ERROR HANDLER (CENTRAL)
  ----------------------------*/
  app.setErrorHandler((error: any, request, reply) => {
    const statusCode = error.statusCode ?? 500;

    logger.error({
      msg: error.message,
      requestId: request.id,
      stack: error.stack,
      url: request.url,
    });

    // ALWAYS send to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('statusCode', String(statusCode));
      scope.setTag('route', request.url);
      scope.setTag('method', request.method);

      Sentry.captureException(error);
    });

    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
      requestId: request.id,
    });
  });

  /* ---------------------------
     INIT SENTRY FASTIFY HOOKS
  ----------------------------*/
  initSentry(app);

  return app;
}

/* ---------------------------
   START SERVER
----------------------------*/
async function start() {
  const server = await buildServer();

  await server.listen({
    port: config.PORT || 3001,
    host: '0.0.0.0',
  });

  logger.info(`🚀 Server running on ${config.PORT || 3001}`);

  Sentry.captureMessage('Backend started successfully');
}

start();

