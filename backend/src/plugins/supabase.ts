/**
 * Supabase admin client (service role) — Phase 2.1.
 * Backend-only: never expose SUPABASE_SERVICE_KEY to the frontend.
 * Used for JWT verification, users upsert, and all server-side DB access.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
