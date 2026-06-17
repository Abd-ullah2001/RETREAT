import { z } from 'zod';

export const RestaurantSchema = z.object({
  id: z.string(),
  placeId: z.string(),
  name: z.string(),
  cuisine: z.string().nullable(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  priceLevel: z.number().nullable(), // 1-4, Google's price scale
  priceLevelLabel: z.enum(['Budget', 'Moderate', 'Expensive', 'Very Expensive']).nullable(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  openingHours: z.array(z.string()).nullable(),
  phoneNumber: z.string().nullable(),
  website: z.string().nullable(),
  photoUrls: z.array(z.string()),
  servesBreakfast: z.boolean().nullable(),
  servesLunch: z.boolean().nullable(),
  servesDinner: z.boolean().nullable(),
  googleMapsUrl: z.string().nullable(),
});

export type Restaurant = z.infer<typeof RestaurantSchema>;
