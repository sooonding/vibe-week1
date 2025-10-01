import { z } from 'zod';
import { PlatformSchema, UUIDSchema, VerificationStatusSchema } from '@/lib/schemas/common';

export const ChannelInputSchema = z.object({
  platform: PlatformSchema,
  channelName: z.string().min(1, 'Channel name is required'),
  channelUrl: z.string().url('Invalid URL format'),
  followerCount: z.number().int().min(0, 'Follower count must be non-negative'),
});

export type ChannelInput = z.infer<typeof ChannelInputSchema>;

export const CreateInfluencerProfileRequestSchema = z.object({
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  channels: z.array(ChannelInputSchema).min(1, 'At least one channel is required'),
});

export type CreateInfluencerProfileRequest = z.infer<typeof CreateInfluencerProfileRequestSchema>;

export const InfluencerChannelResponseSchema = z.object({
  id: z.number(),
  platform: PlatformSchema,
  channelName: z.string(),
  channelUrl: z.string().url(),
  followerCount: z.number(),
  verificationStatus: VerificationStatusSchema,
});

export type InfluencerChannelResponse = z.infer<typeof InfluencerChannelResponseSchema>;

export const CreateInfluencerProfileResponseSchema = z.object({
  influencerId: z.number(),
  channels: z.array(InfluencerChannelResponseSchema),
});

export type CreateInfluencerProfileResponse = z.infer<typeof CreateInfluencerProfileResponseSchema>;

export const InfluencerProfileRowSchema = z.object({
  id: z.number(),
  user_id: UUIDSchema,
  birth_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InfluencerProfileRow = z.infer<typeof InfluencerProfileRowSchema>;

export const InfluencerChannelRowSchema = z.object({
  id: z.number(),
  influencer_id: z.number(),
  platform: PlatformSchema,
  channel_name: z.string(),
  channel_url: z.string(),
  follower_count: z.number(),
  verification_status: VerificationStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type InfluencerChannelRow = z.infer<typeof InfluencerChannelRowSchema>;

export const GetInfluencerProfileResponseSchema = z.object({
  influencerId: z.number(),
  birthDate: z.string(),
  channels: z.array(InfluencerChannelResponseSchema),
});

export type GetInfluencerProfileResponse = z.infer<typeof GetInfluencerProfileResponseSchema>;
