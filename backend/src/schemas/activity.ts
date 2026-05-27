import { z } from 'zod';

export const ActivitySchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  category: z.string(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  priceLevel: z.number().nullable(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  openingHours: z.array(z.string()).nullable(),
  phoneNumber: z.string().nullable(),
  website: z.string().nullable(),
  bookingUrl: z.string().nullable(),
  photoUrls: z.array(z.string()),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const ActivitySearchQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().default(5000),
});
