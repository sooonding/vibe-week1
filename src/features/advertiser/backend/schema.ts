import { z } from 'zod';
import { UUIDSchema } from '@/lib/schemas/common';

export const CreateAdvertiserProfileRequestSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  businessRegistrationNumber: z.string().regex(/^\d{10}$/, 'Business registration number must be 10 digits'),
});

export type CreateAdvertiserProfileRequest = z.infer<typeof CreateAdvertiserProfileRequestSchema>;

export const CreateAdvertiserProfileResponseSchema = z.object({
  advertiserId: z.number(),
});

export type CreateAdvertiserProfileResponse = z.infer<typeof CreateAdvertiserProfileResponseSchema>;

export const AdvertiserProfileRowSchema = z.object({
  id: z.number(),
  user_id: UUIDSchema,
  business_name: z.string(),
  location: z.string(),
  category: z.string(),
  business_registration_number: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AdvertiserProfileRow = z.infer<typeof AdvertiserProfileRowSchema>;

export const GetAdvertiserProfileResponseSchema = z.object({
  advertiserId: z.number(),
  businessName: z.string(),
  location: z.string(),
  category: z.string(),
  businessRegistrationNumber: z.string(),
});

export type GetAdvertiserProfileResponse = z.infer<typeof GetAdvertiserProfileResponseSchema>;
