/**
 * Upstash Redis REST client — serverless-friendly, no TCP connection pool.
 * Used for property/activity cache (Phase 3+) and health checks.
 */
import { Redis } from '@upstash/redis';
import { config } from '../config.js';

export const redis = new Redis({
  url: config.UPSTASH_REDIS_REST_URL,
  token: config.UPSTASH_REDIS_REST_TOKEN,
});
