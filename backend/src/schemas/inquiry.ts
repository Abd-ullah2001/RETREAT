import { z } from 'zod';
import { PropertySchema } from './property.js';

export type InquiryStatus = 'draft' | 'sent';

export const CreateInquiryBodySchema = z.object({
  tripId: z.string().uuid(),
  propertyId: z.string(),
  platform: z.enum(['booking', 'airbnb']),
  propertySnapshot: PropertySchema,
  hostPhone: z.string().optional(),
});

export const UpdateInquiryMessageBodySchema = z.object({
  final_message: z.string().min(1),
});

export const PropertyInteractionBodySchema = z.object({
  propertyId: z.string(),
  platform: z.enum(['booking', 'airbnb']),
  propertySnapshot: PropertySchema,
  action: z.enum(['interested', 'skipped']),
});
