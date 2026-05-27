/**
 * Request logging — UUID requestId, structured Pino logs, X-Request-ID header.
 */
import { randomUUID } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { createRequestLogger } from '../lib/logger.js';

export async function requestLogger(request: FastifyRequest, reply: FastifyReply) {
  const requestId = (request.headers['x-request-id'] as string) || randomUUID();
  request.requestId = requestId;
  reply.header('x-request-id', requestId);

  const log = createRequestLogger(requestId);
  const start = Date.now();

  log.info({
    msg: 'request started',
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
  });

  reply.raw.on('finish', () => {
    log.info({
      msg: 'request completed',
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTimeMs: Date.now() - start,
      userId: request.user?.id,
    });
  });
}
