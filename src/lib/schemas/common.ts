import { z } from 'zod';

export const DateSchema = z.string().refine((date) => !isNaN(Date.parse(date)), {
  message: 'Invalid date format',
});

export const UUIDSchema = z.string().uuid();

export const PhoneSchema = z
  .string()
  .regex(/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/, 'Invalid phone number format');

export const RoleSchema = z.enum(['advertiser', 'influencer']);

export const PlatformSchema = z.enum(['naver', 'youtube', 'instagram', 'threads']);

export const CampaignStatusSchema = z.enum(['recruiting', 'closed', 'selected']);

export const ApplicationStatusSchema = z.enum(['pending', 'selected', 'rejected']);

export const VerificationStatusSchema = z.enum(['pending', 'verified', 'failed']);
