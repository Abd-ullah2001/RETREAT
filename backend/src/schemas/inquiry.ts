import { z } from 'zod';
import { PropertySchema } from './property.js';

export const InquiryStatusSchema = z.enum(['draft', 'sent']);

export const InquirySchema = z.object({
  id: z.string().uuid(),
  trip_id: z.string().uuid(),
  user_id: z.string().uuid(),
  property_id: z.string(),
  platform: z.string(),
  property_snapshot: z.unknown(),
  ai_message: z.string(),
  final_message: z.string(),
  channel: z.enum(['whatsapp', 'email']),
  status: InquiryStatusSchema,
  wa_link: z.string().nullable(),
  sent_at: z.string().nullable(),
  created_at: z.string(),
});

export type Inquiry = z.infer<typeof InquirySchema>;

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
