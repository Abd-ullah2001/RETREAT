import { z } from 'zod';

export const TripStatusSchema = z.enum(['planning', 'active', 'completed']);

export const TripSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  destination: z.string(),
  destination_lat: z.number(),
  destination_lng: z.number(),
  checkin: z.string(),
  checkout: z.string(),
  guests: z.number(),
  status: TripStatusSchema,
  itinerary: z.unknown().nullable(),
  created_at: z.string(),
});

export type Trip = z.infer<typeof TripSchema>;

export const CreateTripBodySchema = z.object({
  destination: z.string().min(1),
  destination_lat: z.number(),
  destination_lng: z.number(),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().int().min(1).max(20),
});

export const GenerateItineraryBodySchema = z.object({
  destId: z.string().optional(),
  currency: z.string().default('USD'),
});
