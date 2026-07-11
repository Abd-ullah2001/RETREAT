import { z } from 'zod';

/** Public user profile returned by auth endpoints */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  travel_style: z.string().nullable().optional(),
  interests: z.array(z.string()).nullable().optional(),
  budget_tier: z.enum(['budget', 'comfort', 'luxury']).nullable().optional(),
  onboarding_completed: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;

export const VerifyBodySchema = z.object({
  access_token: z.string().min(1),
});

export const SignUpBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
});

export const OnboardingBodySchema = z.object({
  name: z.string().min(1).optional(),
  travel_style: z.string().min(1).optional(),
  interests: z.array(z.string()).optional(),
  budget_tier: z.enum(['budget', 'comfort', 'luxury']).optional(),
  onboarding_completed: z.boolean().optional(),
});

