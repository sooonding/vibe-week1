import { z } from 'zod';
import { ApplicationStatusSchema } from '@/lib/schemas/common';

export const CreateApplicationRequestSchema = z.object({
  campaignId: z.number().int().positive(),
  motivation: z.string().min(1, 'Motivation is required'),
  visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid visit date format',
  }),
});

export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequestSchema>;

export const CreateApplicationResponseSchema = z.object({
  applicationId: z.number(),
  status: ApplicationStatusSchema,
});

export type CreateApplicationResponse = z.infer<typeof CreateApplicationResponseSchema>;

export const ApplicationRowSchema = z.object({
  id: z.number(),
  campaign_id: z.number(),
  influencer_id: z.number(),
  motivation: z.string(),
  visit_date: z.string(),
  status: ApplicationStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type ApplicationRow = z.infer<typeof ApplicationRowSchema>;

export const ApplicationResponseSchema = z.object({
  id: z.number(),
  campaignId: z.number(),
  campaignTitle: z.string().optional(),
  motivation: z.string(),
  visitDate: z.string(),
  status: ApplicationStatusSchema,
  createdAt: z.string(),
});

export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>;

export const ApplicationListResponseSchema = z.object({
  applications: z.array(ApplicationResponseSchema),
});

export type ApplicationListResponse = z.infer<typeof ApplicationListResponseSchema>;

export const ApplicationDetailResponseSchema = ApplicationResponseSchema.extend({
  influencerName: z.string(),
  influencerEmail: z.string().optional(),
  influencerPhone: z.string().optional(),
});

export const CampaignApplicationListResponseSchema = z.object({
  applications: z.array(ApplicationDetailResponseSchema),
});

export type ApplicationDetailResponse = z.infer<typeof ApplicationDetailResponseSchema>;

export const SelectApplicationsRequestSchema = z.object({
  selectedApplicationIds: z.array(z.number()).min(1, 'At least one application must be selected'),
});

export type SelectApplicationsRequest = z.infer<typeof SelectApplicationsRequestSchema>;
