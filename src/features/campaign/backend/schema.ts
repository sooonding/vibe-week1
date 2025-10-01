import { z } from 'zod';
import { CampaignStatusSchema } from '@/lib/schemas/common';

export const CreateCampaignRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  recruitmentStartDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  recruitmentEndDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }),
  maxParticipants: z.number().int().positive('Max participants must be greater than 0'),
  benefits: z.string().min(1, 'Benefits are required'),
  storeInfo: z.string().min(1, 'Store info is required'),
  mission: z.string().min(1, 'Mission is required'),
});

export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>;

export const CreateCampaignResponseSchema = z.object({
  campaignId: z.number(),
});

export type CreateCampaignResponse = z.infer<typeof CreateCampaignResponseSchema>;

export const CampaignRowSchema = z.object({
  id: z.number(),
  advertiser_id: z.number(),
  title: z.string(),
  recruitment_start_date: z.string(),
  recruitment_end_date: z.string(),
  max_participants: z.number(),
  benefits: z.string(),
  store_info: z.string(),
  mission: z.string(),
  status: CampaignStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type CampaignRow = z.infer<typeof CampaignRowSchema>;

export const CampaignResponseSchema = z.object({
  id: z.number(),
  advertiserId: z.number(),
  title: z.string(),
  recruitmentStartDate: z.string(),
  recruitmentEndDate: z.string(),
  maxParticipants: z.number(),
  benefits: z.string(),
  storeInfo: z.string(),
  mission: z.string(),
  status: CampaignStatusSchema,
  createdAt: z.string(),
});

export type CampaignResponse = z.infer<typeof CampaignResponseSchema>;

export const CampaignListResponseSchema = z.object({
  campaigns: z.array(CampaignResponseSchema),
});

export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;

export const CampaignDetailResponseSchema = CampaignResponseSchema.extend({
  businessName: z.string().optional(),
});

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
