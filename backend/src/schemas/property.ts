import { z } from 'zod';

export const PropertySchema = z.object({
  id: z.string(),
  platform: z.enum(['booking', 'airbnb']),
  name: z.string(),
  description: z.string().nullable(),
  imageUrls: z.array(z.string()),
  pricePerNight: z.number(),
  currency: z.string().default('USD'),
  totalPrice: z.number(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  maxGuests: z.number(),
  bedrooms: z.number().nullable(),
  amenities: z.array(z.string()),
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  bookingUrl: z.string().url(),
});

export type Property = z.infer<typeof PropertySchema>;

export const PropertySearchQuerySchema = z.object({
  destination: z.string().min(1),
  destId: z.string().optional(),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.coerce.number().int().min(1).max(20),
  currency: z.string().default('USD'),
});

export const PropertySearchResponseSchema = z.object({
  properties: z.array(PropertySchema),
  sources: z.object({
    booking: z.number(),
    airbnb: z.number(),
  }),
  cached: z.boolean(),
  count: z.number(),
});
