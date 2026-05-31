import { z } from 'zod';

/** Public user profile returned by auth endpoints */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const VerifyBodySchema = z.object({
  access_token: z.string().min(1),
});

export const SignUpBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(6),
});

export const VerifyResponseSchema = z.object({
  user: UserSchema,
});
