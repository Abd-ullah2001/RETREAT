/**
 * Auth operations — JWT verification and users table sync.
 * Centralizes Supabase auth calls so routes stay thin and testable.
 */
import type { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../plugins/supabase.js';
import type { User } from '../schemas/user.js';

const USER_COLUMNS = 'id, email, name, avatar_url, travel_style, interests, budget_tier, onboarding_completed' as const;

function rowFromAuthUser(authUser: AuthUser) {
  const meta = authUser.user_metadata ?? {};
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    avatar_url: (meta.avatar_url as string) ?? (meta.picture as string) ?? null,
    last_active: new Date().toISOString(),
  };
}

function toUser(row: {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  travel_style?: string | null;
  interests?: string[] | null;
  budget_tier?: 'budget' | 'comfort' | 'luxury' | null;
  onboarding_completed: boolean;
}): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url,
    travel_style: row.travel_style ?? null,
    interests: row.interests ?? null,
    budget_tier: row.budget_tier ?? null,
    onboarding_completed: row.onboarding_completed,
  };
}

/** Verify a Supabase access token (JWT) */
export async function verifyAccessToken(accessToken: string): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

/**
 * Upsert user row after OAuth login — keeps local profile in sync with Google metadata.
 * Service role bypasses RLS for trusted backend writes.
 */
export async function upsertUserFromAuth(authUser: AuthUser): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .upsert(rowFromAuthUser(authUser), { onConflict: 'id' })
    .select(USER_COLUMNS)
    .single();

  if (error || !data) {
    return null;
  }

  return toUser(data);
}

/** Fetch stored profile by id (GET /auth/me) */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return toUser(data);
}
