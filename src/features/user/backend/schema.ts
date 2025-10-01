import { z } from 'zod';
import { RoleSchema, PhoneSchema } from '@/lib/schemas/common';

export const SignupRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: PhoneSchema,
  role: RoleSchema,
  termsAgreed: z.array(z.string()).min(1, 'You must agree to the terms'),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  role: RoleSchema,
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

export const UserRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserRow = z.infer<typeof UserRowSchema>;
