import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { influencerErrorCodes, type InfluencerServiceError } from './error';
import type {
  CreateInfluencerProfileRequest,
  CreateInfluencerProfileResponse,
  GetInfluencerProfileResponse,
  InfluencerProfileRow,
  InfluencerChannelRow,
} from './schema';
import {
  InfluencerProfileRowSchema,
  InfluencerChannelRowSchema,
  GetInfluencerProfileResponseSchema,
} from './schema';

const MIN_AGE = 14;

const validateAge = (birthDate: string): boolean => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= MIN_AGE;
  }

  return age >= MIN_AGE;
};

export const createInfluencerProfile = async (
  client: SupabaseClient,
  userId: string,
  payload: CreateInfluencerProfileRequest,
): Promise<HandlerResult<CreateInfluencerProfileResponse, InfluencerServiceError, unknown>> => {
  if (!validateAge(payload.birthDate)) {
    return failure(400, influencerErrorCodes.ageTooYoung, `User must be at least ${MIN_AGE} years old`);
  }

  const { data: profileData, error: profileError } = await client
    .from('influencer_profiles')
    .insert({
      user_id: userId,
      birth_date: payload.birthDate,
    })
    .select('*')
    .single<InfluencerProfileRow>();

  if (profileError) {
    if (profileError.code === '23505') {
      return failure(409, influencerErrorCodes.alreadyExists, 'Influencer profile already exists');
    }
    return failure(500, influencerErrorCodes.createError, profileError.message);
  }

  const parsed = InfluencerProfileRowSchema.safeParse(profileData);

  if (!parsed.success) {
    return failure(500, influencerErrorCodes.validationError, 'Profile validation failed', parsed.error.format());
  }

  const channelInserts = payload.channels.map((ch) => ({
    influencer_id: parsed.data.id,
    platform: ch.platform,
    channel_name: ch.channelName,
    channel_url: ch.channelUrl,
    follower_count: ch.followerCount,
    verification_status: 'pending' as const,
  }));

  const { data: channelsData, error: channelsError } = await client
    .from('influencer_channels')
    .insert(channelInserts)
    .select('*');

  if (channelsError) {
    return failure(500, influencerErrorCodes.createError, channelsError.message);
  }

  const channelsResponse = channelsData.map((ch: InfluencerChannelRow) => ({
    id: ch.id,
    platform: ch.platform,
    channelName: ch.channel_name,
    channelUrl: ch.channel_url,
    followerCount: ch.follower_count,
    verificationStatus: ch.verification_status,
  }));

  return success(
    {
      influencerId: parsed.data.id,
      channels: channelsResponse,
    },
    201,
  );
};

export const getInfluencerProfileByUserId = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<GetInfluencerProfileResponse, InfluencerServiceError, unknown>> => {
  const { data: profileData, error: profileError } = await client
    .from('influencer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<InfluencerProfileRow>();

  if (profileError) {
    return failure(500, influencerErrorCodes.fetchError, profileError.message);
  }

  if (!profileData) {
    return failure(404, influencerErrorCodes.notFound, 'Influencer profile not found');
  }

  const parsedProfile = InfluencerProfileRowSchema.safeParse(profileData);

  if (!parsedProfile.success) {
    return failure(500, influencerErrorCodes.validationError, 'Profile validation failed', parsedProfile.error.format());
  }

  const { data: channelsData, error: channelsError } = await client
    .from('influencer_channels')
    .select('*')
    .eq('influencer_id', parsedProfile.data.id);

  if (channelsError) {
    return failure(500, influencerErrorCodes.fetchError, channelsError.message);
  }

  const channels = (channelsData as InfluencerChannelRow[]).map((ch) => ({
    id: ch.id,
    platform: ch.platform,
    channelName: ch.channel_name,
    channelUrl: ch.channel_url,
    followerCount: ch.follower_count,
    verificationStatus: ch.verification_status,
  }));

  const response: GetInfluencerProfileResponse = {
    influencerId: parsedProfile.data.id,
    birthDate: parsedProfile.data.birth_date,
    channels,
  };

  const validated = GetInfluencerProfileResponseSchema.safeParse(response);

  if (!validated.success) {
    return failure(500, influencerErrorCodes.validationError, 'Response validation failed', validated.error.format());
  }

  return success(validated.data);
};
