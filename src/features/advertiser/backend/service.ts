import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { advertiserErrorCodes, type AdvertiserServiceError } from './error';
import type {
  CreateAdvertiserProfileRequest,
  CreateAdvertiserProfileResponse,
  GetAdvertiserProfileResponse,
  AdvertiserProfileRow,
} from './schema';
import { AdvertiserProfileRowSchema, GetAdvertiserProfileResponseSchema } from './schema';

export const createAdvertiserProfile = async (
  client: SupabaseClient,
  userId: string,
  payload: CreateAdvertiserProfileRequest,
): Promise<HandlerResult<CreateAdvertiserProfileResponse, AdvertiserServiceError, unknown>> => {
  const { data, error } = await client
    .from('advertiser_profiles')
    .insert({
      user_id: userId,
      business_name: payload.businessName,
      location: payload.location,
      category: payload.category,
      business_registration_number: payload.businessRegistrationNumber,
    })
    .select('*')
    .single<AdvertiserProfileRow>();

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('business_registration_number')) {
        return failure(409, advertiserErrorCodes.duplicateBusinessNumber, 'Business registration number already exists');
      }
      return failure(409, advertiserErrorCodes.alreadyExists, 'Advertiser profile already exists');
    }
    return failure(500, advertiserErrorCodes.createError, error.message);
  }

  const parsed = AdvertiserProfileRowSchema.safeParse(data);

  if (!parsed.success) {
    return failure(500, advertiserErrorCodes.validationError, 'Profile validation failed', parsed.error.format());
  }

  return success(
    {
      advertiserId: parsed.data.id,
    },
    201,
  );
};

export const getAdvertiserProfileByUserId = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<GetAdvertiserProfileResponse, AdvertiserServiceError, unknown>> => {
  const { data, error } = await client
    .from('advertiser_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<AdvertiserProfileRow>();

  if (error) {
    return failure(500, advertiserErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, advertiserErrorCodes.notFound, 'Advertiser profile not found');
  }

  const parsed = AdvertiserProfileRowSchema.safeParse(data);

  if (!parsed.success) {
    return failure(500, advertiserErrorCodes.validationError, 'Profile validation failed', parsed.error.format());
  }

  const response: GetAdvertiserProfileResponse = {
    advertiserId: parsed.data.id,
    businessName: parsed.data.business_name,
    location: parsed.data.location,
    category: parsed.data.category,
    businessRegistrationNumber: parsed.data.business_registration_number,
  };

  const validated = GetAdvertiserProfileResponseSchema.safeParse(response);

  if (!validated.success) {
    return failure(500, advertiserErrorCodes.validationError, 'Response validation failed', validated.error.format());
  }

  return success(validated.data);
};
