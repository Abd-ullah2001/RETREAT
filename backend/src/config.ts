/**
 * Single source of truth for environment variables.
 * dotenv is loaded only here — never import process.env elsewhere.
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : fallback;
}

/** Validated, typed config — fail fast at startup if secrets are missing */
export const config = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  PORT: Number(optionalEnv('PORT', '3001')),

  // Supabase
  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: optionalEnv('SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_KEY: requireEnv('SUPABASE_SERVICE_KEY'),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: requireEnv('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: requireEnv('UPSTASH_REDIS_REST_TOKEN'),

  // QStash (async inquiry worker)
  QSTASH_TOKEN: requireEnv('QSTASH_TOKEN'),
  QSTASH_CURRENT_SIGNING_KEY: requireEnv('QSTASH_CURRENT_SIGNING_KEY'),
  QSTASH_NEXT_SIGNING_KEY: requireEnv('QSTASH_NEXT_SIGNING_KEY'),

  // RapidAPI — shared key, per-provider hosts (scale: add hosts without code changes)
  RAPIDAPI_KEY: requireEnv('RAPIDAPI_KEY'),
  RAPIDAPI_BOOKING_HOST: requireEnv('RAPIDAPI_BOOKING_HOST'),
  RAPIDAPI_AIRBNB_HOST: requireEnv('RAPIDAPI_AIRBNB_HOST'),

  // Google Places
  GOOGLE_PLACES_API_KEY: requireEnv('GOOGLE_PLACES_API_KEY'),

  // OpenWeatherMap
  OPENWEATHERMAP_API_KEY: requireEnv('OPENWEATHERMAP_API_KEY'),

  // Internal AI service
  AI_SERVICE_URL: requireEnv('AI_SERVICE_URL'),

  // CORS — Next.js dev server default
  FRONTEND_URL: optionalEnv('FRONTEND_URL', 'http://localhost:3000'),

  // Observability (optional in dev)
  AXIOM_API_KEY: optionalEnv('AXIOM_API_KEY', ''),
  AXIOM_DATASET: optionalEnv('AXIOM_DATASET', 'retreat-backend'),
  SENTRY_DSN: optionalEnv('SENTRY_DSN', ''),

  // Worker endpoint auth (QStash → /worker/inquiry)
  WORKER_SECRET: requireEnv('WORKER_SECRET'),
} as const;

export type Config = typeof config;
