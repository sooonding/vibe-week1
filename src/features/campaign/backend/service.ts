import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { campaignErrorCodes, type CampaignServiceError } from './error';
import type {
  CreateCampaignRequest,
  CreateCampaignResponse,
  CampaignResponse,
  CampaignListResponse,
  CampaignRow,
  CampaignDetailResponse,
} from './schema';
import { CampaignRowSchema, CampaignResponseSchema, CampaignDetailResponseSchema } from './schema';

const mapCampaignRowToResponse = (row: CampaignRow): CampaignResponse => ({
  id: row.id,
  advertiserId: row.advertiser_id,
  title: row.title,
  recruitmentStartDate: row.recruitment_start_date,
  recruitmentEndDate: row.recruitment_end_date,
  maxParticipants: row.max_participants,
  benefits: row.benefits,
  storeInfo: row.store_info,
  mission: row.mission,
  status: row.status,
  createdAt: row.created_at,
});

export const createCampaign = async (
  client: SupabaseClient,
  userId: string,
  payload: CreateCampaignRequest,
): Promise<HandlerResult<CreateCampaignResponse, CampaignServiceError, unknown>> => {
  const startDate = new Date(payload.recruitmentStartDate);
  const endDate = new Date(payload.recruitmentEndDate);

  if (startDate >= endDate) {
    return failure(400, campaignErrorCodes.invalidDates, 'Start date must be before end date');
  }

  const { data: advertiserData, error: advertiserError } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (advertiserError || !advertiserData) {
    return failure(403, campaignErrorCodes.notAdvertiser, 'Only advertisers can create campaigns');
  }

  const { data, error } = await client
    .from('campaigns')
    .insert({
      advertiser_id: advertiserData.id,
      title: payload.title,
      recruitment_start_date: payload.recruitmentStartDate,
      recruitment_end_date: payload.recruitmentEndDate,
      max_participants: payload.maxParticipants,
      benefits: payload.benefits,
      store_info: payload.storeInfo,
      mission: payload.mission,
      status: 'recruiting',
    })
    .select('id')
    .single();

  if (error) {
    return failure(500, campaignErrorCodes.createError, error.message);
  }

  return success({ campaignId: data.id }, 201);
};

export const getCampaignsByStatus = async (
  client: SupabaseClient,
  status?: string,
): Promise<HandlerResult<CampaignListResponse, CampaignServiceError, unknown>> => {
  let query = client.from('campaigns').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return failure(500, campaignErrorCodes.fetchError, error.message);
  }

  const campaigns = (data as CampaignRow[]).map(mapCampaignRowToResponse);

  return success({ campaigns });
};

export const getCampaignById = async (
  client: SupabaseClient,
  campaignId: number,
): Promise<HandlerResult<CampaignDetailResponse, CampaignServiceError, unknown>> => {
  const { data, error } = await client
    .from('campaigns')
    .select(
      `
      *,
      advertiser_profiles!inner(business_name)
    `,
    )
    .eq('id', campaignId)
    .maybeSingle();

  if (error) {
    return failure(500, campaignErrorCodes.fetchError, error.message);
  }

  if (!data) {
    return failure(404, campaignErrorCodes.notFound, 'Campaign not found');
  }

  const parsed = CampaignRowSchema.safeParse(data);

  if (!parsed.success) {
    return failure(500, campaignErrorCodes.validationError, 'Campaign validation failed', parsed.error.format());
  }

  const response: CampaignDetailResponse = {
    ...mapCampaignRowToResponse(parsed.data),
    businessName: (data.advertiser_profiles as { business_name?: string })?.business_name,
  };

  const validated = CampaignDetailResponseSchema.safeParse(response);

  if (!validated.success) {
    return failure(500, campaignErrorCodes.validationError, 'Response validation failed', validated.error.format());
  }

  return success(validated.data);
};

export const getCampaignsByAdvertiserId = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<CampaignListResponse, CampaignServiceError, unknown>> => {
  const { data: advertiserData, error: advertiserError } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (advertiserError || !advertiserData) {
    return failure(403, campaignErrorCodes.notAdvertiser, 'Not an advertiser');
  }

  const { data, error } = await client
    .from('campaigns')
    .select('*')
    .eq('advertiser_id', advertiserData.id)
    .order('created_at', { ascending: false });

  if (error) {
    return failure(500, campaignErrorCodes.fetchError, error.message);
  }

  const campaigns = (data as CampaignRow[]).map(mapCampaignRowToResponse);

  return success({ campaigns });
};

export const closeCampaign = async (
  client: SupabaseClient,
  userId: string,
  campaignId: number,
): Promise<HandlerResult<{ success: boolean }, CampaignServiceError, unknown>> => {
  const { data: advertiserData, error: advertiserError } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (advertiserError || !advertiserData) {
    return failure(403, campaignErrorCodes.notAdvertiser, 'Not an advertiser');
  }

  const { data: campaign, error: fetchError } = await client
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserData.id)
    .maybeSingle<CampaignRow>();

  if (fetchError) {
    return failure(500, campaignErrorCodes.fetchError, fetchError.message);
  }

  if (!campaign) {
    return failure(404, campaignErrorCodes.notFound, 'Campaign not found or unauthorized');
  }

  if (campaign.status !== 'recruiting') {
    return failure(400, campaignErrorCodes.alreadyClosed, 'Campaign is not recruiting');
  }

  const { error: updateError } = await client.from('campaigns').update({ status: 'closed' }).eq('id', campaignId);

  if (updateError) {
    return failure(500, campaignErrorCodes.updateError, updateError.message);
  }

  return success({ success: true });
};
